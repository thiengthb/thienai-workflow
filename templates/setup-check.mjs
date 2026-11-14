#!/usr/bin/env node
// Checks that the Claude project this session runs in matches the shared setup standard in profile/SETUP.md:
// project instructions at the current version, the right repos attached and readable, the account's skills uploaded.
// The AI runs it at the start of a session and passes in what it can see (instructions text, attached repos, skills).
// Prints "ổn" when everything matches, otherwise the list of fixes for thien, in Vietnamese. Exit code 1 when something is missing.
//
//   node templates/setup-check.mjs --project sakubun --instructions <file|none> --repos a/b,c/d --skills start-project,make-slides
// Options: --no-git skips the GitHub read check (offline tests); --setup <path> uses another SETUP.md.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(dirname(fileURLToPath(import.meta.url)));
export const SKILLS = ['start-project', 'make-slides'];

/** Reads the standard out of SETUP.md: version, the instructions block, and the project -> repos table. */
export function parseSetup(md) {
  const version = Number((md.match(/^Phiên bản chuẩn: \*\*(\d+)\*\*/m) || [])[1]);
  const block = (md.match(/```text\n(chuẩn setup v\d+[\s\S]*?)```/) || [])[1] || '';
  const blockVersion = Number((block.match(/^chuẩn setup v(\d+)/) || [])[1]);
  const projects = {};
  for (const m of md.matchAll(/^\|\s*`([^`]+)`\s*\|\s*((?:`[\w.-]+\/[\w.-]+`[,\s]*)+)\|/gm)) {
    projects[m[1].toLowerCase()] = [...m[2].matchAll(/`([\w.-]+\/[\w.-]+)`/g)].map(x => x[1]);
  }
  return { version, block, blockVersion, projects };
}

/** Problems with SETUP.md itself (CI keeps the two version numbers in step). */
export function checkStandard(md) {
  const s = parseSetup(md);
  const out = [];
  if (!s.version) out.push('thiếu dòng "Phiên bản chuẩn: **N**"');
  if (!s.block) out.push('thiếu đoạn project instructions (khối ```text bắt đầu bằng "chuẩn setup vN")');
  if (s.version && s.blockVersion && s.version !== s.blockVersion) out.push(`số phiên bản lệch nhau: chuẩn ${s.version}, đoạn instructions v${s.blockVersion}`);
  if (!Object.keys(s.projects).length) out.push('bảng project và repo trống');
  return out;
}

/** The instructions text thien should paste for one project. */
export const instructionsFor = (standard, project) => standard.block.replace('<tên project>', project).trim();

/**
 * Compares what the session sees with the standard. Returns { fixes: [...], notes: [...] }.
 * readable(repo) -> true/false/undefined (undefined = not checked).
 */
export function checkSetup(standard, { project, instructions, repos = [], skills = [] }, readable = () => undefined) {
  const fixes = [], notes = [];
  const key = String(project || '').toLowerCase();
  const want = standard.projects[key];
  const paste = `Project settings > Instructions, xoá bản cũ, dán:\n\n${instructionsFor(standard, project || '<tên project>')}`;
  if (!want) {
    notes.push(`Project "${project}" chưa có trong chuẩn (profile/SETUP.md). Hỏi thien có thêm vào bảng không.`);
  }
  const text = (instructions || '').trim();
  const vm = text.match(/chuẩn setup v(\d+)/);
  const v = vm ? Number(vm[1]) : null;
  const named = (text.match(/chuẩn setup v\d+ · project: ([^\n]+)/) || [])[1]?.trim().toLowerCase();
  if (!text) fixes.push(`Project này chưa có project instructions. ${paste}`);
  else if (v === null) fixes.push(`Project instructions chưa theo chuẩn chung (không có dòng "chuẩn setup vN"). ${paste}`);
  else if (v < standard.version) fixes.push(`Project instructions đang ở chuẩn v${v}, chuẩn mới là v${standard.version}. ${paste}`);
  else if (v > standard.version) notes.push(`Project instructions ghi v${v}, mới hơn repo (v${standard.version}): có thể PR đổi chuẩn chưa merge.`);
  if (v !== null && named && want && named !== key) fixes.push(`Project instructions ghi "project: ${named}" nhưng đây là project "${project}". ${paste}`);
  if (want) {
    const have = new Set(repos.map(r => r.toLowerCase()));
    const missing = want.filter(r => !have.has(r.toLowerCase()));
    if (missing.length) fixes.push(`Project chưa gắn repo ${missing.join(', ')}. Project settings > Repositories > thêm ${missing.map(r => '`' + r + '`').join(' và ')}.`);
    const unreadable = want.filter(r => readable(r) === false);
    if (unreadable.length) fixes.push(`Nick này chưa cho Claude đọc ${unreadable.join(', ')} trên GitHub. Settings > Connectors > GitHub > cho phép repo đó (xem profile/SETUP.md, mục "Một lần cho mỗi nick").`);
  }
  const seen = new Set(skills.map(s => s.toLowerCase().replace(/^.*:/, '')));
  const noSkill = SKILLS.filter(s => !seen.has(s));
  if (skills.length && noSkill.length) fixes.push(`Nick này chưa tải skill ${noSkill.join(', ')}. Customize > Skills > tải lên file zip của thư mục skills/<tên> trong repo thienai-workflow.`);
  if (!skills.length) notes.push('Không thấy danh sách skill nên chưa kiểm skill.');
  return { fixes, notes };
}

function main(argv) {
  const opt = (k) => { const i = argv.indexOf(k); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
  const flag = (k) => { const i = argv.indexOf(k); if (i < 0) return false; argv.splice(i, 1); return true; };
  const setupPath = opt('--setup') || join(here, 'profile/SETUP.md');
  const project = opt('--project');
  const instrArg = opt('--instructions');
  const list = (s) => (s || '').split(',').map(x => x.trim()).filter(Boolean);
  const repos = list(opt('--repos'));
  const skills = list(opt('--skills'));
  const noGit = flag('--no-git');
  if (!project || instrArg === undefined) throw new Error('dùng: --project <tên> --instructions <file|none> [--repos a/b,c/d] [--skills x,y] [--no-git]');
  const md = readFileSync(setupPath, 'utf8');
  const bad = checkStandard(md);
  if (bad.length) throw new Error('profile/SETUP.md hỏng: ' + bad.join('; '));
  const standard = parseSetup(md);
  const instructions = instrArg === 'none' ? '' : existsSync(instrArg) ? readFileSync(instrArg, 'utf8') : instrArg;
  const readable = noGit ? () => undefined
    : (r) => spawnSync('git', ['ls-remote', '--exit-code', '-q', `https://github.com/${r}`, 'HEAD'], { encoding: 'utf8', timeout: 30000 }).status === 0;
  const { fixes, notes } = checkSetup(standard, { project, instructions, repos, skills }, readable);
  for (const n of notes) console.log('nhắc: ' + n);
  if (!fixes.length) { console.log(`ổn: project "${project}" đúng chuẩn setup v${standard.version}`); return 0; }
  console.log(`Project "${project}" chưa đúng chuẩn setup v${standard.version}. Nhờ thien làm trước khi bắt đầu:`);
  fixes.forEach((f, i) => console.log(`${i + 1}. ${f}`));
  return 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 2; }
}
