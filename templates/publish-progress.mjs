#!/usr/bin/env node
// Một lệnh dựng lại trang tiến độ và ghi publish.json để đăng đè đúng trang cũ (link lấy từ file trong repo).
//
//   node templates/publish-progress.mjs [overview|repo|roadmap] [--out <thư-mục>] [--new]
//
// overview (mặc định): tổng quan các repo trong life/tracked-repos.md và repo này; tự clone nông từng repo,
//   repo không đọc được thì vẫn có thẻ kèm lý do. Link trang: dòng "Trang tổng quan" trong life/tracked-repos.md.
//   Lấy luôn PR đang mở của từng repo (gh, không có thì API công khai) để mục "Đang chờ bạn" xếp thứ tự merge.
// repo: tiến độ riêng repo đang đứng (thư mục hiện tại), link ở dòng "Trang tiến độ:" của docs/STATUS.md.
//   thienai-workflow không có trang riêng (dòng đó trỏ về trang tổng quan), lệnh dừng và bảo chạy overview.
// roadmap: lộ trình học learning/roadmap.md, link ở dòng "Trang để xem trên điện thoại:" của file đó.
// --new: bỏ link, đăng thành trang mới (khi trang cũ thuộc tài khoản Claude khác, đăng đè sẽ bị từ chối).
// --out: chỉ nhận thư mục chưa có, rỗng, nằm trong build/ của repo, hay do chính lệnh này tạo lần trước (có file dấu).
//   Lệnh xoá rồi clone lại <out>/repos/<tên> và ghi đè index.html, nên thư mục khác có file thì dừng
//   (review Codex 17/11: chạy thử với --out vào thư mục có sẵn thì mất file của người dùng).
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, realpathSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, basename, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildPage } from './progress-page.mjs';
import { writePublish } from '../artifacts/kit/publish.mjs';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SELF = 'thiengthb/thienai-workflow';

export const MARK = '.made-by-publish-progress';

/** '' when out may be written (and marks it), else why not. Never deletes anything itself. */
export function claimOut(out, buildDir = join(root, 'build')) {
  const rel = relative(resolve(buildDir), resolve(out));
  const inBuild = rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
  if (existsSync(out) && !inBuild && !existsSync(join(out, MARK)) && readdirSync(out).length) {
    return `Thư mục ${out} đã có file mà không phải do lệnh này tạo. Lệnh sẽ xoá ${join(out, 'repos')} và ghi đè index.html ở đó, nên dừng. Bỏ --out (dùng build/), hoặc chọn thư mục chưa có hay rỗng.`;
  }
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, MARK), 'Thư mục do templates/publish-progress.mjs tạo; lệnh được xoá và ghi lại mọi thứ ở đây.\n');
  return '';
}

/** The first claude.ai artifact link on the line that contains marker, or ''. */
export function linkAfter(md, marker) {
  const line = md.split('\n').find((l) => l.includes(marker)) || '';
  return (line.slice(line.indexOf(marker)).match(/https:\/\/claude\.ai\/artifact\/[A-Za-z0-9]+/) || [''])[0];
}

/** owner/repo names from the table in life/tracked-repos.md. */
export function trackedRepos(md) {
  return [...md.matchAll(/^\|\s*`([\w.-]+\/[\w.-]+)`\s*\|/gm)].map((m) => m[1]);
}

/** owner/repo of a git checkout's origin, or ''. */
export function originRepo(dir) {
  const r = spawnSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' });
  const m = (r.stdout || '').trim().match(/github\.com[/:]([\w.-]+\/[\w.-]+?)(?:\.git)?$/);
  return m ? m[1] : '';
}

function clone(repo, into) {
  rmSync(into, { recursive: true, force: true });
  const r = spawnSync('git', ['clone', '--depth', '1', '-q', `https://github.com/${repo}.git`, into], { encoding: 'utf8', timeout: 90000, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
  return r.status === 0 ? '' : 'không đọc được repo ở đây (repo riêng tư hoặc không có mạng)';
}

/** Open pull requests of a repo, trimmed to what the overview shows; null when they cannot be fetched here. */
export async function openPrs(repo, run = spawnSync, get = globalThis.fetch) {
  const norm = (a) => a.map((p) => ({ number: p.number, title: p.title, url: p.html_url, draft: !!p.draft, base: p.base?.ref ?? '', head: p.head?.ref ?? '',
    baseRepo: p.base?.repo?.full_name ?? '', headRepo: p.head?.repo?.full_name ?? '', created: p.created_at ?? '', body: String(p.body || '') }));   // whole body: "merge sau #N" can sit anywhere in it
  const path = `repos/${repo}/pulls?state=open&per_page=100`;
  const r = run('gh', ['api', path], { encoding: 'utf8', timeout: 30000 });
  if (r.status === 0) { try { return norm(JSON.parse(r.stdout)); } catch { /* fall through to the public API */ } }
  try {
    const res = await get(`https://api.github.com/${path}`, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'progress-page' }, signal: AbortSignal.timeout(20000) });
    if (res.ok) return norm(await res.json());
  } catch { /* no network */ }
  return null;
}

async function prsFile(repos, out) {
  const map = {};
  for (const repo of repos) {
    map[repo] = await openPrs(repo);
    console.log(map[repo] ? `${repo}: ${map[repo].length} PR đang mở` : `${repo}: không lấy được PR`);
  }
  const file = join(out, 'prs.json');
  writeFileSync(file, JSON.stringify(map, null, 1));
  return file;
}

const read = (p) => (existsSync(p) ? lf(readFileSync(p, 'utf8')) : '');

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
  const bool = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? (args.splice(i, 1), true) : false; };
  const outArg = flag('out'), fresh = bool('new');
  const kind = args[0] || 'overview';
  const out = resolve(outArg || join(root, 'build', `progress-${kind}`));
  const refuse = claimOut(out);
  if (refuse) { console.error(refuse); process.exit(1); }
  let pageArgs, url, capabilities = { db: {} }, description;
  if (kind === 'overview') {
    const md = read(join(root, 'life/tracked-repos.md'));
    const others = trackedRepos(md).filter((r) => r !== SELF);
    pageArgs = ['--title', 'Tổng quan tiến độ', '--prs', await prsFile([SELF, ...others], out), '--links', `${join(root, 'README.md')}=${SELF}:README.md`, `${root}=${SELF}`];
    for (const repo of others) {
      const dir = join(out, 'repos', basename(repo));
      const why = clone(repo, dir);
      pageArgs.push(why ? `missing=${repo}:${why}` : `${dir}=${repo}`);
      console.log(why ? `Bỏ qua ${repo}: ${why}` : `Đã lấy ${repo}`);
    }
    url = linkAfter(md, 'Trang tổng quan');
    description = 'Tiến độ các repo đang theo quy trình chung';
  } else if (kind === 'repo') {
    const dir = process.cwd(), repo = originRepo(dir) || SELF;
    pageArgs = ['--title', `Tiến độ ${repo.split('/')[1]}`, '--prs', await prsFile([repo], out), `${dir}=${repo}`];
    url = linkAfter(read(join(dir, 'docs/STATUS.md')), 'Trang tiến độ:');
    // Repo này không có trang riêng: dòng "Trang tiến độ:" trỏ về trang tổng quan (tab thienai-workflow ở đó),
    // nên đăng trang một repo lên link đó sẽ đè mất trang tổng quan.
    if (url && url === linkAfter(read(join(root, 'life/tracked-repos.md')), 'Trang tổng quan')) {
      console.error('Trang tiến độ của repo này là trang tổng quan. Chạy: node templates/publish-progress.mjs overview');
      process.exit(1);
    }
    description = `Tiến độ repo ${repo}`;
  } else if (kind === 'roadmap') {
    const file = join(root, 'learning/roadmap.md');
    pageArgs = ['--title', 'Lộ trình học', '--roadmap', `${file}=${SELF}:learning/roadmap.md`];
    url = linkAfter(read(file), 'Trang để xem trên điện thoại:');
    capabilities = {};
    description = 'Lộ trình học các môn';
  } else {
    console.error('Cách dùng: node templates/publish-progress.mjs [overview|repo|roadmap] [--out <thư-mục>] [--new]');
    process.exit(1);
  }
  writeFileSync(join(out, 'index.html'), buildPage(pageArgs));
  console.log(`Đã dựng ${join(out, 'index.html')}`);
  for (const l of writePublish(out, { file_path: join(out, 'index.html'), url: fresh ? '' : url, capabilities, icon: 'chart', description })) console.log(l);
  if (!url && !fresh) console.log('Chưa có link trang cũ trong repo: đăng thành trang mới rồi ghi link vào file nói ở đầu script.');
}
