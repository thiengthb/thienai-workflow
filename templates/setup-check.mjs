#!/usr/bin/env node
// Checks that the Claude project this session runs in matches the shared setup standard in profile/SETUP.md:
// project instructions at the current version, the right repos attached and readable, the account's skills uploaded.
// The AI runs it at the start of a session and passes in what it can see (instructions text, attached repos, skills).
// Prints "ổn" when everything matches, otherwise the list of fixes for thien, in Vietnamese. Exit code 1 when something is missing.
//
//   node templates/setup-check.mjs --project sakubun --instructions <file|none> --repos a/b,c/d --skills check-setup@1,start-project@1,make-slides@1
// --skills: each skill the session lists, with the "(bản N)" number at the end of its description as @N (no number: plain name).
// The nick comes from the "nick: tntXXX" part of the instructions; profile/ACCOUNTS.md is the registry it is checked against.
// Options: --no-git skips the GitHub read check (offline tests); --setup <path> uses another SETUP.md;
//          --accounts <path> another ACCOUNTS.md; --skills-dir <path> another skills/ folder.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = dirname(dirname(fileURLToPath(import.meta.url)));
export const SKILLS = ['check-setup', 'start-project', 'make-slides'];

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
export const instructionsFor = (standard, project, nick = '<tên nick>') =>
  standard.block.replace('<tên project>', project).replace('<tên nick>', nick).trim();

export const NICK = /^tnt\d{2,}$/;

/** Rows of the nick table in profile/ACCOUNTS.md: { nick: { status, projects: [lowercase names] } }. */
export function parseAccounts(md) {
  const out = {};
  for (const m of md.matchAll(/^\|\s*`(tnt\d+)`\s*\|\s*([^|]*)\|\s*[^|]*\|\s*([^|]*)\|/gm)) {
    out[m[1]] = { status: m[2].trim(), projects: [...m[3].matchAll(/`([^`]+)`/g)].map(x => x[1].toLowerCase()) };
  }
  return out;
}

/** "(bản N)" at the end of a skill description, from skills/<name>/SKILL.md. */
export function skillVersion(skillMd) {
  const d = (skillMd.match(/^description: (.*)$/m) || [])[1] || '';
  return Number((d.match(/\(bản (\d+)\)\s*$/) || [])[1]) || 0;
}

/**
 * Compares what the session sees with the standard. Returns { fixes: [...], notes: [...] }.
 * readable(repo) -> true/false/undefined (undefined = not checked).
 */
export function checkSetup(standard, { project, instructions, repos = [], skills = [], accounts, skillVersions = {} }, readable = () => undefined) {
  const fixes = [], notes = [];
  const key = String(project || '').toLowerCase();
  const want = standard.projects[key];
  const nick = ((instructions || '').match(/· nick: (\S+)/) || [])[1];
  const paste = `Project settings > Instructions, xoá bản cũ, dán:\n\n${instructionsFor(standard, project || '<tên project>', nick && NICK.test(nick) ? nick : '<tên nick>')}`;
  if (!want) {
    notes.push(`Project "${project}" chưa có trong chuẩn (profile/SETUP.md). Hỏi thien có thêm vào bảng không.`);
  }
  const text = (instructions || '').trim();
  const vm = text.match(/chuẩn setup v(\d+)/);
  const v = vm ? Number(vm[1]) : null;
  const named = (text.match(/chuẩn setup v\d+ · project: ([^\n·]+)/) || [])[1]?.trim().toLowerCase();
  if (!text) fixes.push(`Project này chưa có project instructions. ${paste}`);
  else if (v === null) fixes.push(`Project instructions chưa theo chuẩn chung (không có dòng "chuẩn setup vN"). ${paste}`);
  else if (v < standard.version) fixes.push(`Project instructions đang ở chuẩn v${v}, chuẩn mới là v${standard.version}. ${paste}`);
  else if (v > standard.version) notes.push(`Project instructions ghi v${v}, mới hơn repo (v${standard.version}): có thể PR đổi chuẩn chưa merge.`);
  if (v !== null && v >= 2 && !(nick && NICK.test(nick))) fixes.push(`Project instructions chưa ghi tên nick (dạng tnt + số, ví dụ tnt024; danh sách ở profile/ACCOUNTS.md). Sửa đoạn "<tên nick>" ở dòng đầu. ${paste}`);
  if (nick && NICK.test(nick) && accounts) {
    const row = accounts[nick];
    if (!row) notes.push(`AI tự làm: nick ${nick} chưa có trong profile/ACCOUNTS.md. Thêm dòng cho nó (gộp vào PR đang làm, không có thì mở PR nhỏ) và hỏi thien đây có phải nick mới không.`);
    else if (/^đã nghỉ/i.test(row.status)) fixes.push(`Nick ${nick} đã đánh dấu "đã nghỉ" trong profile/ACCOUNTS.md mà vẫn đang dùng. Hỏi thien: dùng lại nick này, hay project instructions ghi nhầm tên nick?`);
    else if (want && !row.projects.includes(key)) notes.push(`AI tự làm: thêm project \`${project}\` vào dòng nick ${nick} trong profile/ACCOUNTS.md (gộp vào PR đang làm, không có thì mở PR nhỏ).`);
  }
  if (v !== null && named && want && named !== key) fixes.push(`Project instructions ghi "project: ${named}" nhưng đây là project "${project}". ${paste}`);
  if (want) {
    const have = new Set(repos.map(r => r.toLowerCase()));
    const missing = want.filter(r => !have.has(r.toLowerCase()));
    if (missing.length) fixes.push(`Project chưa gắn repo ${missing.join(', ')}. Project settings > Repositories > thêm ${missing.map(r => '`' + r + '`').join(' và ')}.`);
    const unreadable = want.filter(r => readable(r) === false);
    if (unreadable.length) fixes.push(`Nick này chưa cho Claude đọc ${unreadable.join(', ')} trên GitHub. Settings > Connectors > GitHub > cho phép repo đó (xem profile/SETUP.md, mục "Một lần cho mỗi nick").`);
  }
  const seenV = {};
  for (const s of skills) { const [n, ver] = s.toLowerCase().replace(/^.*:/, '').split('@'); seenV[n] = Number(ver) || 0; }
  const seen = new Set(Object.keys(seenV));
  const noSkill = SKILLS.filter(s => !seen.has(s));
  const stale = SKILLS.filter(s => seen.has(s) && skillVersions[s] && seenV[s] < skillVersions[s]);
  if (skills.length && stale.length) fixes.push(`Skill ${stale.map(s => `${s} (nick này bản ${seenV[s] || 'chưa có số'}, mới nhất bản ${skillVersions[s]})`).join(', ')} đã cũ. Tải lại ${stale.map(s => 'https://github.com/thiengthb/thienai-workflow/releases/download/skills/' + s + '.zip').join(' và ')} (trình duyệt cần đăng nhập GitHub), rồi Customize > Skills, xoá skill cũ cùng tên, tải bản mới lên.`);
  if (skills.length && noSkill.length) fixes.push(`Nick này chưa tải skill ${noSkill.join(', ')}. Tải file zip ở ${noSkill.map(s => 'https://github.com/thiengthb/thienai-workflow/releases/download/skills/' + s + '.zip').join(' và ')} (trình duyệt cần đăng nhập GitHub), rồi Customize > Skills > tải lên.`);
  if (!skills.length) notes.push('Không thấy danh sách skill nên chưa kiểm skill.');
  if (nick && NICK.test(nick)) notes.push(`nick: ${nick} (ghi vào commit dòng "Claude-Nick: ${nick}", vào PR và sổ bàn giao)`);
  return { fixes, notes, nick };
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
  const accountsPath = opt('--accounts') || join(here, 'profile/ACCOUNTS.md');
  const skillsDir = opt('--skills-dir') || join(here, 'skills');
  const accounts = existsSync(accountsPath) ? parseAccounts(readFileSync(accountsPath, 'utf8')) : undefined;
  const skillVersions = {};
  for (const n of SKILLS) { const f = join(skillsDir, n, 'SKILL.md'); if (existsSync(f)) skillVersions[n] = skillVersion(readFileSync(f, 'utf8')); }
  if (!project || instrArg === undefined) throw new Error('dùng: --project <tên> --instructions <file|none> [--repos a/b,c/d] [--skills x,y] [--no-git]');
  const md = readFileSync(setupPath, 'utf8');
  const bad = checkStandard(md);
  if (bad.length) throw new Error('profile/SETUP.md hỏng: ' + bad.join('; '));
  const standard = parseSetup(md);
  const instructions = instrArg === 'none' ? '' : existsSync(instrArg) ? readFileSync(instrArg, 'utf8') : instrArg;
  const readable = noGit ? () => undefined
    : (r) => spawnSync('git', ['ls-remote', '--exit-code', '-q', `https://github.com/${r}`, 'HEAD'], { encoding: 'utf8', timeout: 30000 }).status === 0;
  const { fixes, notes } = checkSetup(standard, { project, instructions, repos, skills, accounts, skillVersions }, readable);
  for (const n of notes) console.log('nhắc: ' + n);
  if (!fixes.length) { console.log(`ổn: project "${project}" đúng chuẩn setup v${standard.version}`); return 0; }
  console.log(`Project "${project}" chưa đúng chuẩn setup v${standard.version}. Nhờ thien làm trước khi bắt đầu:`);
  fixes.forEach((f, i) => console.log(`${i + 1}. ${f}`));
  return 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 2; }
}
