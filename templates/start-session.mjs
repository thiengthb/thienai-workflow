#!/usr/bin/env node
// Start of a session in one command, so a new chat costs 3 turns instead of ~12 (plan docs/plans/2026-11-15-claude-usage.md,
// checkpoint 2). Runs, in order: the setup check (setup-check.mjs), the handoff book of every repo (handoff.mjs list),
// with --claim the newest task (or --task) claimed and printed in full, its working branch compared with the book,
// then the parts of docs/STATUS.md a session needs, the branches not merged yet (check-open-work.mjs)
// and last the rules for switching chats, read from profile/CHATS.md (chatRules).
// Everything is printed even when the setup check finds something missing; the exit code is 1 then.
//
//   node templates/start-session.mjs --project <tên> --instructions "<đoạn instructions>"|none|unseen
//        --repos a/b,c/d --skills start-project@1,make-slides@1 --sync "<bộ lọc của project_info: JSON dán nguyên, hay /path:include,...>"
//        [--claim "Claude tnt697, <link chat>"] [--task <owner/repo>:<việc>] [--beta]
//
// --beta: project bản beta (chat điều phối, mỗi việc một thread cloud). AGENTS.md đã tự nạp qua CLAUDE.md nên không in lại;
//          setup-check kiểm theo đoạn instructions bản beta và bỏ phần knowledge (profile/SETUP.md, "Hai kiểu project").
// Tham số lạ làm lệnh dừng trước khi đụng tới sổ (lỗi 2026-11-17: --dry-run bị bỏ qua lặng lẽ và việc bị nhận thật).
// STATUS hay mục "Đang ở đâu" của kế hoạch đang chạy nói chờ một PR mà PR đó không còn mở (đọc refs/pull trên origin)
// thì in "nhắc:" để phiên này mở PR xem rồi sửa dòng đó trong PR của nó.
//
// --claim: thien said "tiếp tục". Sets "Ghi bởi" of the task to this value and saves it right away (profile/HANDOFF.md,
//          step 3); the working copy is written next to the repo folder (../<việc>.md), outside git.
// --task:  claim this task instead of the newest one.
// --repos: the repos attached to the session (also read by setup-check). With --claim, a task in a repo that is not
//          attached is not claimed (its book could not be pushed, 2026-11-19): the newest task among attached repos is
//          taken instead, and the newer one is named so thien can attach its repo. Without --repos, every repo counts.
// Options for tests: --remote-map "a/b=<git url>,..." (read only these repos, from these remotes), --task-dir <dir>,
//          --no-fetch (do not fetch origin for unmerged branches), --no-agents (skip AGENTS.md), --no-git (passed on to setup-check).
import { existsSync, readFileSync, readdirSync, writeFileSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readOnly, readText, summarize, allRepos, stripBase, hashOf, cleanup, normalize } from './handoff.mjs';
import { openWork, report, prRefs } from './check-open-work.mjs';

const here = dirname(dirname(fileURLToPath(import.meta.url)));
const SELF = 'thiengthb/thienai-workflow';
const DAY = 24 * 60 * 60 * 1000;

/** Sections of STATUS a starting session needs; "Đang ở đâu" and "Vừa xong" are history, skipped to keep the output short. */
export const STATUS_PARTS = ['Kế hoạch đang chạy', 'Việc dở', 'Việc tiếp theo', 'Đang chờ thien', 'Đang vướng'];
export function statusParts(md) {
  md = normalize(md);
  const head = (md.match(/^Cập nhật lần cuối:.*$/m) || [''])[0];
  const parts = md.split(/^(?=## )/m).filter((p) => STATUS_PARTS.some((h) => p.startsWith('## ' + h + '\n')));
  return [head, ...parts.map((p) => p.trim())].filter(Boolean).join('\n\n');
}

/**
 * The rules for switching chats, read from profile/CHATS.md so the printed block never drifts from the file.
 * Printed because long chats never opened that file and never said "mở chat mới" (20/11: one chat ran 344 turns).
 * Old projects: the goal line at the start, the stay-or-switch table with its bullets, and the closing line.
 * --beta: the bold rules of "Project bản beta" (one thread per checkpoint). Returns '' when a section is missing,
 * so a renamed heading is caught by the test that reads the real file.
 */
export const CHAT_PARTS = { start: 'Đầu chat', done: 'Khi xong mục tiêu', next: 'Việc kế tiếp: ở lại hay mở chat mới', beta: 'Project bản beta' };
export function chatRules(md, { beta = false } = {}) {
  md = normalize(md);
  const part = (h) => (md.match(new RegExp(`^## ${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm')) || [])[1];
  const bullets = (s) => s.split('\n').filter((l) => /^- /.test(l));
  if (beta) {
    const b = part(CHAT_PARTS.beta);
    const rules = b ? bullets(b).filter((l) => /^- \*\*/.test(l)) : [];
    return rules.length ? rules.join('\n') : '';
  }
  const start = part(CHAT_PARTS.start), done = part(CHAT_PARTS.done), next = part(CHAT_PARTS.next);
  if (!start || !done || !next) return '';
  const goal = bullets(start)[0];
  const close = (done.match(/^4\. .*$/m) || [])[0];
  const table = next.split('\n').filter((l) => /^\|/.test(l));
  if (!goal || !close || !table.length) return '';
  return [goal, close.replace(/^4\. /, '- '), '', ...table, '', ...bullets(next)].join('\n');
}

/** The "## Đang ở đâu" section of a plan file, where its waiting lines live. */
export function planNow(md) {
  const m = normalize(md).match(/^## Đang ở đâu\n([\s\S]*?)(?=^## |(?![\s\S]))/m);
  return m ? m[1] : '';
}

/**
 * Lines of STATUS (or of a plan's "Đang ở đâu") that wait on a PR of this repo which is no longer open
 * ("chờ merge PR #97" after #97 merged). prs: prRefs() of the repo. A "#N" right after another repo's name
 * (sakubun PR #326) belongs to that repo: skipped. Only the clause (between ; or .) that says it waits counts,
 * so "PR sau buổi (#107) qua kiểm; tên trục ở PR #110, chờ thien merge" flags #110 only.
 * No merge ref does not tell merged from closed from open with a conflict, so the note says to open the PR.
 */
export function stalePrNotes(md, prs, otherRepos = ['sakubun', 'thienui', 'tiktok', 'nuc-infra'], { pick = statusParts, file = 'STATUS', wait = /chờ|merge|đang mở/i } = {}) {
  if (!prs) return [];
  const out = [];
  for (const line of pick(md).split('\n')) {
    const clauses = line.split(/;|\.(?=\s)/);
    clauses.forEach((clause, k) => {
      if (!wait.test(clause)) return;
      // "PR #97; chờ thien duyệt": a waiting clause with no number of its own means the one PR of the clause before it.
      let src = clause;
      if (!/#\d+/.test(clause) && k > 0 && (clauses[k - 1].match(/#\d+/g) || []).length === 1) src = clauses[k - 1];
      for (const m of src.matchAll(/#(\d+)/g)) {
        const before = src.slice(Math.max(0, m.index - 16), m.index);
        if (new RegExp(`(${otherRepos.join('|')})\\s*(PR\\s*)?$`, 'i').test(before)) continue;
        // History right next to this number ("đã merge (PR #81)", "PR #60 đã đóng") is not waiting. Stop at a comma, so
        // in "PR #98 đã merge, chờ PR #110" the history belongs to #98 only.
        const left = src.slice(Math.max(0, m.index - 30), m.index).split(',').pop();
        const right = src.slice(m.index + m[0].length, m.index + m[0].length + 14).split(',')[0];
        if (/đã (merge|đóng|vào|xong)/i.test(left + ' ' + right)) continue;
        const pr = prs.byNumber.get(Number(m[1]));
        if (pr && !pr.open) out.push(`${file} còn chờ PR #${m[1]} mà PR đó không còn mở bình thường (đã merge, đã đóng, hay đang mở nhưng conflict): mở PR xem trước, rồi sửa dòng «${line.trim().slice(0, 90)}» trong PR của phiên này.`);
      }
    });
  }
  return [...new Set(out)];
}

/**
 * The same reminder for plans still running (or paused) in <repo>/docs/plans: their "Đang ở đâu" repeats waiting lines
 * ("thien cần làm: merge PR #110") and went stale there (Codex review 17/11). A plan's top reads like history
 * ("PR #98 merge 2026-11-17"), so only "chờ", "đang mở" and "cần làm" mean waiting.
 */
export const PLAN_WAIT = /chờ|đang mở|cần làm/i;
export function planNotes(dir, prs) {
  const plans = join(dir, 'docs/plans');
  const out = [];
  for (const f of existsSync(plans) ? readdirSync(plans).filter((x) => x.endsWith('.md')).sort() : []) {
    const md = readFileSync(join(plans, f), 'utf8');
    if (!/^Trạng thái:\s*(đang chạy|tạm dừng)/m.test(normalize(md))) continue;
    out.push(...stalePrNotes(md, prs, undefined, { pick: planNow, file: `docs/plans/${f}`, wait: PLAN_WAIT }));
  }
  return out;
}

/**
 * --claim value as the book wants it: "Claude tnt697, <link>". Project instructions write the placeholders in
 * brackets ("Claude (nick ở dòng đầu), (link chat)"), so "Claude (tnt697), (https://…)" is taken too.
 * Returns '' when there is still no nick in it.
 */
export function claimBy(raw) {
  const by = String(raw || '').trim()
    .replace(/^Claude\s*\(\s*(tnt\d{2,}|nick chưa rõ)\s*\)/, 'Claude $1')
    .replace(/,\s*\(\s*([^()]*?)\s*\)\s*$/, ', $1');
  return /^Claude (tnt\d{2,}\b|nick chưa rõ)/.test(by) ? by : '';
}

/** "Ghi bởi" line set to the claiming session; keeps the "· Cập nhật" part for save to refresh. */
export function claimText(text, by) {
  text = normalize(text);
  if (!/^Ghi bởi: .*$/m.test(text)) return text.replace(/^(Repo: .*)$/m, `$1\nGhi bởi: ${by} · Cập nhật: 1970-01-01T00:00Z`);
  return text.replace(/^Ghi bởi: .*?(· Cập nhật: [0-9T:-]+Z?)?$/m, (_, upd) => `Ghi bởi: ${by} · ${upd ? upd.slice(2) : 'Cập nhật: 1970-01-01T00:00Z'}`);
}

/** Note when another nick wrote the task in the last 24 hours (profile/ACCOUNTS.md, HANDOFF.md "Nhiều nick"). */
export function otherNickNote(task, by, now = new Date()) {
  const mine = (by.match(/\b(tnt\d+)\b/) || [])[1];
  if (!task.nick || !mine || task.nick === mine) return '';
  const t = Date.parse(task.updated.endsWith('Z') ? task.updated : task.updated + 'Z');
  if (!t || now - t > DAY) return '';
  return `việc này do nick ${task.nick} ghi lúc ${task.updated}, chưa quá 24 giờ. thien đã nói "tiếp tục" nên vẫn nhận; nick ${task.nick} có thể đang làm dở, nên báo thien một dòng.`;
}

/** The "Nhánh:" value when it names a real branch ("chưa có (tạo từ main)" and placeholders do not). */
export const branchOf = (text) => {
  const b = (normalize(text).match(/^Repo: [^\n]*?Nhánh: ([^\s·]+)/m) || [])[1];
  return b && !/^(<|chưa|không)/i.test(b) ? b.replace(/^`|`$/g, '') : '';
};

function run(args, opts = {}) { return spawnSync(process.execPath, args, { encoding: 'utf8', ...opts }); }

function main(argv) {
  const opt = (k) => { const i = argv.indexOf(k); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
  const flag = (k) => { const i = argv.indexOf(k); if (i < 0) return false; argv.splice(i, 1); return true; };
  const claimGiven = argv.includes('--claim');
  const rawBy = opt('--claim');
  const by = claimGiven ? claimBy(rawBy) : undefined;
  const pick = opt('--task');
  const mapArg = opt('--remote-map');
  const taskDir = opt('--task-dir') || dirname(here);
  const noFetch = flag('--no-fetch');
  const noAgents = flag('--no-agents');
  const beta = argv.includes('--beta'); // stays in argv: setup-check reads it too
  // --repos stays in argv for setup-check when --project is there; alone it is only read here.
  const ri = argv.indexOf('--repos');
  const attached = ri < 0 ? null : (argv[ri + 1] || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (ri >= 0 && !argv.includes('--project')) argv.splice(ri, 2);
  const isAttached = (repo) => !attached || attached.includes(repo);
  const map = Object.fromEntries((mapArg || '').split(',').filter(Boolean).map((x) => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1)]; }));
  const urlOf = (repo) => map[repo] || `https://github.com/${repo}`;
  let code = 0;

  // Unknown options stop here, before the book is touched.
  if (!argv.includes('--project') && argv.some((a) => a !== '--beta')) throw new Error(`tham số lạ: ${argv.filter((a) => a !== '--beta').join(' ')} (xem đầu file templates/start-session.mjs). Chưa làm gì.`);

  // 1. Setup: everything left in argv goes to setup-check.mjs as is.
  console.log('## Setup');
  if (argv.includes('--project')) {
    const r = run([join(here, 'templates/setup-check.mjs'), ...argv]);
    process.stdout.write(r.stdout + r.stderr);
    // Exit 2 = setup-check did not run (unknown option, bad SETUP.md): stop before claiming anything.
    if (r.status === 2) { console.log('=> Lệnh dừng ở đây, chưa đụng tới sổ: sửa tham số rồi chạy lại.'); return 2; }
    if (r.status !== 0) { code = 1; console.log('=> Thiếu setup: nói với thien trước khi làm (đoạn cần dán đã in ở trên).'); }
  } else console.log('Chưa kiểm (không có --project).');

  // AGENTS.md is printed here so the session needs no extra turn to load it (project instructions: read it first).
  // Beta threads already have it: CLAUDE.md (@AGENTS.md) is loaded when the thread starts.
  const agents = join(here, 'AGENTS.md');
  if (existsSync(agents) && !noAgents && !beta) console.log('\n## AGENTS.md (thienai-workflow)\n' + normalize(readFileSync(agents, 'utf8')).replace(/^# AGENTS\.md\n+/, '').trim());

  // 2. Handoff book of every repo, newest first.
  console.log('\n## Sổ bàn giao');
  const rows = [], unread = [];
  for (const repo of mapArg ? Object.keys(map) : allRepos()) {
    const dir = readOnly(urlOf(repo));
    if (dir === 'none') continue;
    if (!dir) { unread.push(repo); continue; }
    for (const f of readdirSync(join(dir, 'tasks')).filter((f) => f.endsWith('.md'))) {
      const text = readText(join(dir, 'tasks', f));
      rows.push({ ...summarize(f, text), repo, slug: f.replace(/\.md$/, ''), text });
    }
  }
  rows.sort((x, y) => y.updated.localeCompare(x.updated));
  if (!rows.length) console.log('Không có việc dở nào trong sổ.');
  for (const r of rows) {
    console.log(`- ${r.title} (${r.repo}:${r.slug}, nick ${r.nick || '?'}, cập nhật ${r.updated || '?'})`);
    console.log(`  Tiếp theo: ${r.next || '?'}`);
    if (r.waiting) console.log(`  Đang chờ thien: ${r.waiting.split('\n')[0]}`);
  }
  if (unread.length) console.log(`Không đọc được: ${unread.join(', ')} (gắn repo đó vào phiên rồi chạy lại).`);

  // 3. With --claim: take the task and print it in full.
  let task;
  if (claimGiven && !by) {
    code = 1;
    console.log(`\n## Nhận việc\nChưa nhận: --claim "${rawBy ?? ''}" thiếu tên nick. Viết dạng --claim "Claude tnt697, <link chat>" (nick ở dòng "nick:" của project instructions) rồi chạy lại. Sổ không bị đụng tới.`);
  }
  if (by) {
    console.log('\n## Nhận việc');
    task = pick ? rows.find((r) => `${r.repo}:${r.slug}` === pick) : rows.find((r) => isAttached(r.repo));
    const newest = rows[0];
    if (!pick && newest && newest !== task) {
      console.log(`nhắc: việc mới nhất trong sổ là "${newest.title}" ở ${newest.repo}, repo này chưa gắn vào phiên nên không nhận. Muốn làm việc đó: gắn repo rồi chạy lại với --task ${newest.repo}:${newest.slug}.`);
    }
    if (task && pick && !isAttached(task.repo)) {
      code = 1;
      console.log(`Chưa nhận: việc ${pick} ở repo ${task.repo}, repo này chưa gắn vào phiên nên không đẩy sổ được. Gắn repo đó rồi chạy lại. Sổ không bị đụng tới.`);
      task = undefined;
    } else if (!task) console.log(pick ? `Không thấy việc ${pick} trong sổ.` : (newest ? 'Không có việc nào ở các repo đang gắn.' : 'Không có việc nào để nhận.'));
    else {
      const note = otherNickNote(task, by, process.env.HANDOFF_NOW ? new Date(process.env.HANDOFF_NOW) : new Date()); // HANDOFF_NOW: fixed clock for tests
      if (note) console.log('nhắc: ' + note);
      if (rows.length > 1 && !pick) console.log(`nhắc: sổ có ${rows.length} việc; nhận việc mới nhất${attached ? ' ở các repo đang gắn' : ''}. Kể các việc kia cho thien (mục trên).`);
      const file = join(taskDir, task.slug + '.md');
      // Based on the version just read, so save refuses if another nick changed the task in between.
      writeFileSync(file, stripBase(claimText(task.text, by)) + `<!-- handoff-base: ${hashOf(task.text)} -->\n`);
      const s = run([join(here, 'templates/handoff.mjs'), 'save', file, ...(map[task.repo] ? ['--remote', map[task.repo]] : [])]);
      if (s.status !== 0) {
        code = 1;
        const why = (s.stderr || s.stdout).trim();
        // A format problem is not another nick: only a changed book (save refused) means that.
        console.log(`Chưa nhận được: ${why}\n=> ` + (/chưa đúng mẫu/.test(why)
          ? 'Việc này trong sổ chưa đúng mẫu (xem trên), chưa ghi gì: sửa file đó theo mẫu rồi save, hay hỏi thien nếu không rõ.'
          : /nick khác vừa sửa/.test(why)
            ? 'Một nick khác vừa sửa việc này trong sổ: dừng lại hỏi thien.'
            : `Đẩy sổ của ${task.repo} không được, không phải vì nick khác: xem repo đó đã gắn vào phiên với quyền ghi chưa, rồi chạy lại.`));
      } else {
        console.log(`${s.stdout.trim()} (bản làm việc: ${file})\n`);
        console.log(normalize(readFileSync(file, 'utf8')).replace(/\n?<!-- handoff-base: [0-9a-f]+ -->\n?$/, '').trim());
      }
      // Book vs branch (HANDOFF.md step 2): the branch can be ahead of the book, never the other way round.
      const branch = branchOf(task.text);
      if (branch) {
        const ls = spawnSync('git', ['ls-remote', urlOf(task.repo), 'refs/heads/' + branch], { encoding: 'utf8', timeout: 30000 });
        const sha = (ls.stdout.split(/\s/)[0] || '').slice(0, 7);
        console.log('\n' + (ls.status !== 0 ? `Không đọc được nhánh ${branch}: so sổ với git bằng tay.`
          : !sha ? `Nhánh ${branch} không còn trên origin (đã merge và xoá?): xem PR ghi trong sổ.`
            : task.text.includes(sha) ? `Nhánh ${branch}: commit cuối ${sha}, sổ có ghi. Khớp.`
              : `Nhánh ${branch}: commit cuối ${sha}, sổ chưa ghi commit này. Nhánh có thể đi trước sổ: đọc \`git log\` nhánh đó, tin nhánh rồi sửa sổ.`));
      }
    }
  }

  // 4. STATUS and unmerged branches of this repo. Another repo is read after cloning it.
  console.log('\n## STATUS (thienai-workflow, phần cần cho phiên mới)');
  const status = join(here, 'docs/STATUS.md');
  console.log(existsSync(status) ? statusParts(readFileSync(status, 'utf8')) : 'Không có docs/STATUS.md.');
  if (existsSync(status) && !noFetch) {
    const prs = prRefs({ cwd: here });
    for (const n of stalePrNotes(readFileSync(status, 'utf8'), prs)) console.log('nhắc: ' + n);
    for (const n of planNotes(here, prs)) console.log('nhắc: ' + n);
  }
  if (task && task.repo !== SELF) console.log(`\nViệc nằm ở ${task.repo}: clone repo đó, đọc docs/STATUS.md của nó trước khi làm.`);
  console.log('\n## Nhánh chưa merge (thienai-workflow)');
  let open = openWork({ fetch: !noFetch, cwd: here });
  // A fresh --depth 1 clone sometimes fails the first fetch through the session proxy (seen 2026-11-15); one retry.
  if (open.stale && !noFetch) { spawnSync('sleep', ['5']); open = openWork({ fetch: true, cwd: here }); }
  console.log(report(open));

  // 5. Chat switching, last so it is the freshest thing read before work starts (profile/CHATS.md).
  const chats = join(here, 'profile/CHATS.md');
  const rules = existsSync(chats) ? chatRules(readFileSync(chats, 'utf8'), { beta }) : '';
  console.log('\n## Đổi chat (profile/CHATS.md)');
  console.log(rules
    ? (beta ? '' : 'Đếm lượt của chat này. Trước mỗi việc mới, tra bảng dưới; phải đổi thì nói câu mẫu, không đợi thien hỏi.\n') + rules
    : 'nhắc: không đọc được luật đổi chat trong profile/CHATS.md (mục đổi tên?). Mở file đó đọc mục "Việc kế tiếp", rồi sửa chatRules trong start-session.mjs.');
  return code;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 2; } finally { cleanup(); }
}
