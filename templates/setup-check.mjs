#!/usr/bin/env node
// Checks that the Claude project this session runs in matches the shared setup standard in profile/SETUP.md:
// project instructions at the current version, the right repos attached and readable, the account's skills uploaded.
// The AI runs it at the start of a session and passes in what it can see (instructions text, attached repos, skills).
// Prints "ổn" when everything matches, otherwise the list of fixes for thien, in Vietnamese. Exit code 1 when something is missing.
//
//   node templates/setup-check.mjs --project sakubun --instructions <file|none|unseen> --repos a/b,c/d --skills start-project@1,make-slides@1
//        [--beta] [--sync "/:include"]
// --beta: the project is the beta kind (one coordinator chat, a cloud thread per task): checked against the beta block of
// SETUP.md, fixes point at the beta settings pages, and there is no knowledge sync to check. Instructions whose first
// line says "vN beta" count as beta too.
// --instructions none: the project has no instructions. unseen: this session cannot see them (then they are not checked,
// and the output says so instead of guessing). --sync: the GitHub sync filters of the project's knowledge, as the
// Projects tool (project_info) shows them, path:include|exclude separated by commas; compared with profile/SETUP.md.
// --skills: each skill the session lists, with the "(bản N)" number at the end of its description as @N (no number: plain name).
// The nick comes from the "nick: tntXXX" part of the instructions; profile/ACCOUNTS.md is the registry it is checked against.
// Options: --no-git skips the GitHub read check (offline tests); --setup <path> uses another SETUP.md;
//          --accounts <path> another ACCOUNTS.md; --skills-dir <path> another skills/ folder.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Windows checkouts (git core.autocrlf) and files saved by Windows editors use CRLF; every parser below expects LF.
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const here = dirname(dirname(fileURLToPath(import.meta.url)));
export const SKILLS = ['start-project', 'make-slides'];

/** Reads the standard out of SETUP.md: version, the two instructions blocks (old kind, beta), and the project -> repos table. */
export function parseSetup(md) {
  md = lf(md);
  const version = Number((md.match(/^Phiên bản chuẩn: \*\*(\d+)\*\*/m) || [])[1]);
  const blocks = [...md.matchAll(/```text\n(chuẩn setup v\d+[\s\S]*?)```/g)].map(m => m[1]);
  const block = blocks.find(b => !isBeta(b)) || '';
  const blockBeta = blocks.find(isBeta) || '';
  const blockVersion = Number((block.match(/^chuẩn setup v(\d+)/) || [])[1]);
  const betaVersion = Number((blockBeta.match(/^chuẩn setup v(\d+)/) || [])[1]);
  const projects = {};
  for (const m of md.matchAll(/^\|\s*`([^`]+)`\s*\|\s*((?:`[\w.-]+\/[\w.-]+`[,\s]*)+)\|/gm)) {
    projects[m[1].toLowerCase()] = [...m[2].matchAll(/`([\w.-]+\/[\w.-]+)`/g)].map(x => x[1]);
  }
  // Folders the project knowledge should sync (section "Đồng bộ repo vào knowledge"): "- `path`", and "- bỏ `path`" to leave out.
  const syncPart = (md.match(/^## Đồng bộ repo vào knowledge\n([\s\S]*?)(?=^## )/m) || [])[1] || '';
  const sync = [...syncPart.matchAll(/^- `([^`]+)`/gm)].map(m => m[1]);
  const syncOut = [...syncPart.matchAll(/^- bỏ `([^`]+)`/gm)].map(m => m[1]);
  return { version, block, blockVersion, blockBeta, betaVersion, projects, sync, syncOut };
}

/** Instructions of the beta kind say so on their first line: "chuẩn setup v4 beta · project: …". */
export const isBeta = (text) => /^chuẩn setup v\d+ beta\b/m.test(lf(String(text || '')));

const squash = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Lines of the standard instructions that are missing from what the project has. The first line (version, project,
 * nick) is left out: the checks below look at it part by part and say exactly what is wrong.
 */
export function missingLines(standard, project, text, nick = '<tên nick>', beta = false) {
  const have = squash(lf(text));
  return instructionsFor(standard, project, nick, beta).split('\n').slice(1).map(l => l.trim()).filter(Boolean).filter(l => !have.includes(squash(l)));
}

/**
 * Notes about the project's GitHub sync filters ([{ path, mode: include|exclude }], as project_info shows them):
 * a folder AI needs that is not synced, or a heavy folder (HTML pages, battle data) that is.
 * A path is synced when the longest filter that covers it says include.
 */
export function checkSync(standard, filters) {
  if (!filters || !standard.sync.length) return [];
  const clean = (p) => p.replace(/^\/+|\/+$/g, '');
  const fs = filters.map(f => ({ path: clean(f.path), mode: f.mode }));
  const synced = (p) => {
    p = clean(p);
    const hit = fs.filter(f => f.path === '' || p === f.path || p.startsWith(f.path + '/')).sort((a, b) => b.path.length - a.path.length)[0];
    return hit ? hit.mode === 'include' : false;
  };
  // Filters inside a folder count too: profile/SETUP.md excluded under an included profile/ is a miss, and a file
  // included again under an excluded learning/war/battles/ is heavy. The leave-out list itself is allowed.
  const out = (standard.syncOut || []).map(clean);
  const under = (f, p) => f.path !== p && f.path.startsWith(p + '/');
  const miss = standard.sync.filter(p => !synced(p) || fs.some(f => f.mode === 'exclude' && under(f, clean(p)) && !out.some(o => f.path === o || f.path.startsWith(o + '/'))));
  const heavy = (standard.syncOut || []).filter(p => synced(p) || fs.some(f => f.mode === 'include' && under(f, clean(p))));
  const notes = [];
  const where = 'Ô Project knowledge ở cột phải trang project > bấm vào repo, chọn lại theo profile/SETUP.md, mục "Đồng bộ repo vào knowledge"';
  if (heavy.length) notes.push(`Knowledge của project đang đồng bộ cả phần nặng (${heavy.join(', ')}): knowledge nhanh đầy và Claude phải tìm từng đoạn thay vì đọc hết. ${where}.`);
  if (miss.length) notes.push(`Knowledge của project chưa đồng bộ: ${miss.join(', ')}. ${where}.`);
  return notes;
}

/** Problems with SETUP.md itself (CI keeps the two version numbers in step). */
/**
 * The --sync value as filters [{ path, mode }]. Takes "/docs/:include,/x/:exclude", or the JSON project_info prints
 * (the whole sync source, its "filters" object, or the inner {"/path": "include"} map), pasted as is.
 * Lỗi đã gặp 2026-11-15: JSON dán nguyên vào --sync bị đọc thành một đường dẫn, nên báo nhầm "knowledge chưa đồng bộ".
 */
export function parseSyncArg(arg) {
  const text = String(arg).trim();
  if (text.startsWith('{') || text.startsWith('[')) {
    let o = JSON.parse(text);
    if (Array.isArray(o)) o = o.find(x => x && x.config) || o[0] || {};
    if (o.config) o = o.config;
    while (o && typeof o.filters === 'object' && o.filters !== null) o = o.filters;
    return Object.entries(o || {}).map(([path, mode]) => ({ path, mode: String(mode) }));
  }
  return text.split(',').map(x => x.trim()).filter(Boolean).map(x => { const i = x.lastIndexOf(':'); return { path: i < 0 ? x : x.slice(0, i), mode: i < 0 ? 'include' : x.slice(i + 1) }; });
}

export function checkStandard(md) {
  const s = parseSetup(md);
  const out = [];
  if (!s.version) out.push('thiếu dòng "Phiên bản chuẩn: **N**"');
  if (!s.block) out.push('thiếu đoạn project instructions (khối ```text bắt đầu bằng "chuẩn setup vN")');
  if (!s.blockBeta) out.push('thiếu đoạn project instructions bản beta (khối ```text bắt đầu bằng "chuẩn setup vN beta")');
  if (s.version && s.blockVersion && s.version !== s.blockVersion) out.push(`số phiên bản lệch nhau: chuẩn ${s.version}, đoạn instructions v${s.blockVersion}`);
  if (s.version && s.betaVersion && s.version !== s.betaVersion) out.push(`số phiên bản lệch nhau: chuẩn ${s.version}, đoạn instructions bản beta v${s.betaVersion}`);
  if (!Object.keys(s.projects).length) out.push('bảng project và repo trống');
  return out;
}

/** The instructions text thien should paste for one project (beta: the block for beta projects). */
export const instructionsFor = (standard, project, nick = '<tên nick>', beta = false) =>
  ((beta && standard.blockBeta) || standard.block).replace('<tên project>', project).replace('<tên nick>', nick).trim();

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
export function checkSetup(standard, { project, instructions, repos = [], skills = [], accounts, skillVersions = {}, beta = false }, readable = () => undefined) {
  const fixes = [], notes = [];
  const key = String(project || '').toLowerCase();
  const want = standard.projects[key];
  instructions = lf(instructions || '');
  const pastedBeta = isBeta(instructions);
  beta = beta || pastedBeta;
  const nick = (instructions.match(/· nick: (\S+)/) || [])[1];
  const where = beta ? 'Project settings > Memory > Project instructions' : 'Project settings > Instructions';
  const paste = `${where}, xoá bản cũ, dán (đoạn của project bản ${beta ? 'beta' : 'cũ'}):\n\n${instructionsFor(standard, project || '<tên project>', nick && NICK.test(nick) ? nick : '<tên nick>', beta)}`;
  if (!want) {
    notes.push(`Project "${project}" chưa có trong chuẩn (profile/SETUP.md). Hỏi thien có thêm vào bảng không.`);
  }
  const text = (instructions || '').trim();
  const vm = text.match(/chuẩn setup v(\d+)/);
  const v = vm ? Number(vm[1]) : null;
  const named = (text.match(/chuẩn setup v\d+(?: beta)? · project: ([^\n·]+)/) || [])[1]?.trim().toLowerCase();
  if (!text) fixes.push(`Project này chưa có project instructions. ${paste}`);
  else if (v === null) fixes.push(`Project instructions chưa theo chuẩn chung (không có dòng "chuẩn setup vN"). ${paste}`);
  else if (v < standard.version) fixes.push(`Project instructions đang ở chuẩn v${v}, chuẩn mới là v${standard.version}. ${paste}`);
  else if (v > standard.version) notes.push(`Project instructions ghi v${v}, mới hơn repo (v${standard.version}): có thể PR đổi chuẩn chưa merge.`);
  if (v !== null && beta && !pastedBeta) fixes.push(`Đây là project bản beta mà instructions là đoạn của bản cũ (bảo gọi project_info và clone repo, hai thứ bản beta không có). ${paste}`);
  else if (v === standard.version) {
    const miss = missingLines(standard, project || '<tên project>', text, nick, beta);
    if (miss.length) fixes.push(`Project instructions có số v${v} nhưng thiếu ${miss.length} dòng của bản chuẩn (bản dán bị cắt hay đã sửa tay): «${miss[0].slice(0, 80)}${miss[0].length > 80 ? '…' : ''}»${miss.length > 1 ? ' và các dòng khác' : ''}. ${paste}`);
  }
  if (v !== null && v >= 2 && !(nick && NICK.test(nick))) fixes.push(`Project instructions chưa ghi tên nick (dạng tnt + số, ví dụ tnt024; danh sách ở profile/ACCOUNTS.md). Sửa đoạn "<tên nick>" ở dòng đầu. ${paste}`);
  if (nick && NICK.test(nick) && accounts) {
    const row = accounts[nick];
    if (!row) notes.push(`AI tự làm: nick ${nick} chưa có trong profile/ACCOUNTS.md. Thêm dòng cho nó (gộp vào PR đang làm, không có thì mở PR nhỏ) và hỏi thien đây có phải nick mới không.`);
    else if (/^đã nghỉ/i.test(row.status)) fixes.push(`Nick ${nick} đã đánh dấu "đã nghỉ" trong profile/ACCOUNTS.md mà vẫn đang dùng. Hỏi thien: dùng lại nick này, hay project instructions ghi nhầm tên nick?`);
    else if (want && !row.projects.includes(key)) notes.push(`AI tự làm: thêm project \`${project}\` vào dòng nick ${nick} trong profile/ACCOUNTS.md (gộp vào PR đang làm, không có thì mở PR nhỏ).`);
  }
  if (v !== null && !named) fixes.push(`Dòng đầu project instructions thiếu "project: ${project}". ${paste}`);
  if (v !== null && named && want && named !== key) fixes.push(`Project instructions ghi "project: ${named}" nhưng đây là project "${project}". ${paste}`);
  if (want) {
    const have = new Set(repos.map(r => r.toLowerCase()));
    const missing = want.filter(r => !have.has(r.toLowerCase()));
    if (missing.length) fixes.push(beta
      ? `Project chưa gắn repo ${missing.join(', ')}. Project settings > Environment > thêm ${missing.map(r => '`' + r + '`').join(' và ')} (hay nhờ chat điều phối thêm repo vào project).`
      : `Project chưa gắn repo ${missing.join(', ')}. Ô Project knowledge ở cột phải trang project > + > GitHub > thêm ${missing.map(r => '`' + r + '`').join(' và ')}, tích file theo profile/SETUP.md, mục "Đồng bộ repo vào knowledge".`);
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
  const beta = flag('--beta');
  const accountsPath = opt('--accounts') || join(here, 'profile/ACCOUNTS.md');
  const skillsDir = opt('--skills-dir') || join(here, 'skills');
  const accounts = existsSync(accountsPath) ? parseAccounts(lf(readFileSync(accountsPath, 'utf8'))) : undefined;
  const skillVersions = {};
  for (const n of SKILLS) { const f = join(skillsDir, n, 'SKILL.md'); if (existsSync(f)) skillVersions[n] = skillVersion(lf(readFileSync(f, 'utf8'))); }
  const syncArg = opt('--sync');
  if (!project || instrArg === undefined) throw new Error('thiếu tham số. --instructions nhận cả đoạn project instructions trong dấu nháy (hay đường dẫn file chứa nó), none khi project chưa có, unseen khi phiên không thấy. dùng: --project <tên> --instructions <đoạn|file|none|unseen> [--repos a/b,c/d] [--skills x@N,y@N] [--beta] [--sync "/:include"] [--no-git]');
  if (argv.length) throw new Error(`tham số lạ: ${argv.join(' ')} (xem đầu file templates/setup-check.mjs)`);
  const md = lf(readFileSync(setupPath, 'utf8'));
  const bad = checkStandard(md);
  if (bad.length) throw new Error('profile/SETUP.md hỏng: ' + bad.join('; '));
  const standard = parseSetup(md);
  const unseen = instrArg === 'unseen';
  const instructions = instrArg === 'none' || unseen ? '' : existsSync(instrArg) ? lf(readFileSync(instrArg, 'utf8')) : instrArg;
  const readable = noGit ? () => undefined
    : (r) => spawnSync('git', ['ls-remote', '--exit-code', '-q', `https://github.com/${r}`, 'HEAD'], { encoding: 'utf8', timeout: 30000 }).status === 0;
  const r = checkSetup(standard, { project, instructions, repos, skills, accounts, skillVersions, beta }, readable);
  // Only report what was actually seen: unseen instructions are "not checked", never "missing".
  const fixes = unseen ? r.fixes.filter(f => !/^Project (này chưa có|instructions)/.test(f)) : r.fixes;
  const notes = [...(unseen ? ['Phiên này không thấy project instructions nên chưa kiểm phần đó (cả tên nick).'] : []), ...r.notes];
  // The beta kind clones the repos and has no knowledge sync: nothing to check there.
  if (syncArg !== undefined) notes.push(...checkSync(standard, parseSyncArg(syncArg)));
  else if (!beta && !isBeta(instructions)) notes.push('Không có --sync nên chưa kiểm bộ lọc đồng bộ knowledge (xem bằng project_info).');
  for (const n of notes) console.log('nhắc: ' + n);
  if (!fixes.length) { console.log(`ổn: project "${project}" đúng chuẩn setup v${standard.version}${unseen ? ' ở những phần đã kiểm (chưa kiểm instructions)' : ''}`); return 0; }
  console.log(`Project "${project}" chưa đúng chuẩn setup v${standard.version}. Nhờ thien làm trước khi bắt đầu:`);
  fixes.forEach((f, i) => console.log(`${i + 1}. ${f}`));
  return 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 2; }
}
