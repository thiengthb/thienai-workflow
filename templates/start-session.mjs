#!/usr/bin/env node
// Start of a session in one command, so a new chat costs 3 turns instead of ~12 (plan docs/plans/2026-11-15-claude-usage.md,
// checkpoint 2). Runs, in order: the setup check (setup-check.mjs), the handoff book of every repo (handoff.mjs list),
// with --claim the newest task (or --task) claimed and printed in full, its working branch compared with the book,
// then the parts of docs/STATUS.md a session needs and the branches not merged yet (check-open-work.mjs).
// Everything is printed even when the setup check finds something missing; the exit code is 1 then.
//
//   node templates/start-session.mjs --project <tên> --instructions "<đoạn instructions>"|none|unseen
//        --repos a/b,c/d --skills start-project@1,make-slides@1 --sync "<bộ lọc của project_info: JSON dán nguyên, hay /path:include,...>"
//        [--claim "Claude tnt697, <link chat>"] [--task <owner/repo>:<việc>]
//
// --claim: thien said "tiếp tục". Sets "Ghi bởi" of the task to this value and saves it right away (profile/HANDOFF.md,
//          step 3); the working copy is written next to the repo folder (../<việc>.md), outside git.
// --task:  claim this task instead of the newest one.
// Options for tests: --remote-map "a/b=<git url>,..." (read only these repos, from these remotes), --task-dir <dir>,
//          --no-fetch (do not fetch origin for unmerged branches), --no-agents (skip AGENTS.md), --no-git (passed on to setup-check).
import { existsSync, readFileSync, readdirSync, writeFileSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readOnly, readText, summarize, allRepos, stripBase, hashOf, cleanup, normalize } from './handoff.mjs';
import { openWork, report } from './check-open-work.mjs';

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
  const rawBy = opt('--claim');
  const by = rawBy === undefined ? undefined : claimBy(rawBy);
  const pick = opt('--task');
  const mapArg = opt('--remote-map');
  const taskDir = opt('--task-dir') || dirname(here);
  const noFetch = flag('--no-fetch');
  const noAgents = flag('--no-agents');
  const map = Object.fromEntries((mapArg || '').split(',').filter(Boolean).map((x) => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1)]; }));
  const urlOf = (repo) => map[repo] || `https://github.com/${repo}`;
  let code = 0;

  // 1. Setup: everything left in argv goes to setup-check.mjs as is.
  console.log('## Setup');
  if (argv.includes('--project')) {
    const r = run([join(here, 'templates/setup-check.mjs'), ...argv]);
    process.stdout.write(r.stdout + r.stderr);
    if (r.status !== 0) { code = 1; console.log('=> Thiếu setup: nói với thien trước khi làm (đoạn cần dán đã in ở trên).'); }
  } else console.log('Chưa kiểm (không có --project).');

  // AGENTS.md is printed here so the session needs no extra turn to load it (project instructions: read it first).
  const agents = join(here, 'AGENTS.md');
  if (existsSync(agents) && !noAgents) console.log('\n## AGENTS.md (thienai-workflow)\n' + normalize(readFileSync(agents, 'utf8')).replace(/^# AGENTS\.md\n+/, '').trim());

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
  if (rawBy !== undefined && !by) {
    code = 1;
    console.log(`\n## Nhận việc\nChưa nhận: --claim "${rawBy}" thiếu tên nick. Viết dạng --claim "Claude tnt697, <link chat>" (nick ở dòng "nick:" của project instructions) rồi chạy lại. Sổ không bị đụng tới.`);
  }
  if (by) {
    console.log('\n## Nhận việc');
    task = pick ? rows.find((r) => `${r.repo}:${r.slug}` === pick) : rows[0];
    if (!task) console.log(pick ? `Không thấy việc ${pick} trong sổ.` : 'Không có việc nào để nhận.');
    else {
      const note = otherNickNote(task, by);
      if (note) console.log('nhắc: ' + note);
      if (rows.length > 1 && !pick) console.log(`nhắc: sổ có ${rows.length} việc; nhận việc mới nhất. Kể các việc kia cho thien (mục trên).`);
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
          : 'Một nick khác có thể vừa nhận việc này: dừng lại hỏi thien.'));
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
  if (task && task.repo !== SELF) console.log(`\nViệc nằm ở ${task.repo}: clone repo đó, đọc docs/STATUS.md của nó trước khi làm.`);
  console.log('\n## Nhánh chưa merge (thienai-workflow)');
  let open = openWork({ fetch: !noFetch, cwd: here });
  // A fresh --depth 1 clone sometimes fails the first fetch through the session proxy (seen 2026-11-15); one retry.
  if (open.stale && !noFetch) { spawnSync('sleep', ['5']); open = openWork({ fetch: true, cwd: here }); }
  console.log(report(open));
  return code;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exitCode = 2; } finally { cleanup(); }
}
