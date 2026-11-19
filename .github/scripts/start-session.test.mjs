// Tests for templates/start-session.mjs, run in CI by .github/workflows/test.yml.
// Uses local bare repos as remotes for the handoff book, so nothing touches GitHub.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { statusParts, claimText, claimBy, otherNickNote, branchOf, stalePrNotes, planNow, planNotes, PLAN_WAIT } from '../../templates/start-session.mjs';
import { skeleton } from '../../templates/handoff.mjs';

// STATUS: only the parts a new session needs, history left out.
const status = '# Tiến độ\n\nCập nhật lần cuối: 2026-11-15 · x\n\n## Đang ở đâu\nlịch sử dài\n\n## Kế hoạch đang chạy\n| a |\n\n## Việc dở\n- v\n\n## Vừa xong\n- cũ\n\n## Đang chờ thien\n- c\n';
const parts = statusParts(status);
assert.match(parts, /^Cập nhật lần cuối/);
assert.match(parts, /## Kế hoạch đang chạy/); assert.match(parts, /## Việc dở/); assert.match(parts, /## Đang chờ thien/);
assert.doesNotMatch(parts, /lịch sử dài|## Vừa xong/, 'history parts are skipped');
assert.match(statusParts(status.replace(/\n/g, '\r\n')), /## Việc dở/, 'CRLF STATUS works');

// Claim: "Ghi bởi" changes, the rest of the file does not.
const task = skeleton('a/b', 'x', 'Việc X', new Date('2026-11-15T07:00:00Z')).replace('Claude <nick>, <link thread>', 'Claude tnt024, https://old')
  .replace('1. <cụ thể tới mức nick khác làm được ngay: lệnh nào, file nào>', '1. Làm bước 2');
const claimed = claimText(task, 'Claude tnt697, https://new');
assert.match(claimed, /^Ghi bởi: Claude tnt697, https:\/\/new · Cập nhật: 2026-11-15T07:00Z$/m);
assert.equal(claimed.replace(/^Ghi bởi:.*$/m, ''), task.replace(/^Ghi bởi:.*$/m, ''), 'only the author line changes');

// --claim: placeholders in brackets as project instructions write them are taken; no nick is refused.
assert.equal(claimBy('Claude tnt697, https://x'), 'Claude tnt697, https://x');
assert.equal(claimBy('Claude (tnt697), https://x'), 'Claude tnt697, https://x');
assert.equal(claimBy('Claude (tnt697), (https://x)'), 'Claude tnt697, https://x');
assert.equal(claimBy('Claude (nick chưa rõ), https://x'), 'Claude nick chưa rõ, https://x');
assert.equal(claimBy('Claude, https://x'), '');
assert.equal(claimBy('Claude (nick ở dòng đầu), (link chat)'), '');

// Another nick within 24 hours: said out loud; same nick or older: nothing.
const row = { nick: 'tnt024', updated: '2026-11-15T07:00Z' };
assert.match(otherNickNote(row, 'Claude tnt697, l', new Date('2026-11-15T10:00Z')), /tnt024/);
assert.equal(otherNickNote(row, 'Claude tnt024, l', new Date('2026-11-15T10:00Z')), '');
assert.equal(otherNickNote(row, 'Claude tnt697, l', new Date('2026-11-17T10:00Z')), '');

assert.equal(branchOf('Repo: a/b · Nhánh: feat/x · PR: #3'), 'feat/x');
assert.equal(branchOf('Repo: a/b · Nhánh: chưa có (tạo từ main) · PR: #82'), '');
assert.equal(branchOf('Repo: a/b · Nhánh: <nhánh làm việc> · PR: chưa có'), '');

// End to end: a book with two tasks in a local bare repo; --claim takes the newest and pushes the claim.
const root = mkdtempSync(join(tmpdir(), 'start-session-'));
const bare = join(root, 'b.git');
spawnSync('git', ['init', '-q', '--bare', bare]);
const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const handoff = fileURLToPath(new URL('../../templates/handoff.mjs', import.meta.url));
const cli = fileURLToPath(new URL('../../templates/start-session.mjs', import.meta.url));
const save = (name, text, at) => {
  writeFileSync(join(root, name), text);
  const r = spawnSync('node', [handoff, 'save', join(root, name), '--remote', bare], { encoding: 'utf8', env: { ...env, HANDOFF_NOW: at } });
  assert.equal(r.status, 0, r.stderr);
};
save('old.md', task.replace('# Việc X', '# Việc cũ'), '2026-11-14T01:00:00Z');
save('new.md', task.replace('Nhánh: <nhánh làm việc>', 'Nhánh: feat/gone'), '2026-11-15T08:00:00Z');
const work = mkdtempSync(join(root, 'work-'));
// Fixed clock, one hour after the newest save: the 24-hour note must not depend on the day CI runs.
const start = (...a) => spawnSync('node', [cli, '--remote-map', 'a/b=' + bare, '--task-dir', work, '--no-fetch', ...a], { encoding: 'utf8', env: { ...env, HANDOFF_NOW: '2026-11-15T09:00:00Z' } });

let r = start();
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /Chưa kiểm \(không có --project\)/);
assert.ok(r.stdout.indexOf('Việc X') < r.stdout.indexOf('Việc cũ'), 'newest task first');
assert.doesNotMatch(r.stdout, /## Nhận việc/, 'no claim without --claim');
assert.match(r.stdout, /## STATUS/);
assert.match(r.stdout, /## AGENTS\.md/, 'AGENTS.md is printed, no extra turn to load it');
assert.doesNotMatch(start('--no-agents').stdout, /## AGENTS\.md/);
assert.doesNotMatch(start('--beta').stdout, /## AGENTS\.md/, 'beta threads already loaded AGENTS.md through CLAUDE.md');

r = start('--claim', 'Claude tnt697, https://new');
assert.equal(r.status, 0, r.stdout + r.stderr);
assert.match(r.stdout, /đã đẩy: a\/b, nhánh handoff, tasks\/new\.md/);
assert.match(r.stdout, /nick tnt024 ghi lúc/, 'claim from another nick within 24 hours is said out loud');
assert.match(r.stdout, /sổ có 2 việc/);
assert.match(r.stdout, /Nhánh feat\/gone không còn trên origin/);
assert.match(readFileSync(join(work, 'new.md'), 'utf8'), /^Ghi bởi: Claude tnt697, https:\/\/new/m, 'working copy carries the claim');
const show = spawnSync('node', [handoff, 'show', 'a/b', 'new', '--remote', bare], { encoding: 'utf8', env });
assert.match(show.stdout, /^Ghi bởi: Claude tnt697, https:\/\/new/m, 'the book has the claim');

// A --claim with no nick leaves the book alone and says how to write it.
r = start('--claim', 'Claude, https://new');
assert.equal(r.status, 1);
assert.match(r.stdout, /thiếu tên nick/);
assert.doesNotMatch(r.stdout, /Một nick khác/, 'a wrong --claim is not reported as another nick');
r = start('--claim');
assert.equal(r.status, 1, '--claim with no value is refused, not skipped');
assert.match(r.stdout, /thiếu tên nick/);

// --task picks another task; claiming it with a stale copy elsewhere is still guarded by save.
r = start('--claim', 'Claude tnt697, https://new', '--task', 'a/b:old');
assert.equal(r.status, 0, r.stdout + r.stderr);
assert.match(r.stdout, /tasks\/old\.md/);
r = start('--claim', 'Claude tnt697, https://new', '--task', 'a/b:missing');
assert.match(r.stdout, /Không thấy việc a\/b:missing/);

// --repos names the repos attached to the session: a task in another repo is not claimed (2026-11-19: the newest task
// was in a repo the session could not push to, and the failed push was reported as "another nick").
r = start('--claim', 'Claude tnt697, https://new', '--repos', 'c/d');
assert.equal(r.status, 0, r.stdout + r.stderr);
assert.match(r.stdout, /ở a\/b, repo này chưa gắn vào phiên nên không nhận/);
assert.match(r.stdout, /--task a\/b:new/, 'says how to take it once the repo is attached');
assert.match(r.stdout, /Không có việc nào ở các repo đang gắn/);
assert.doesNotMatch(r.stdout, /đã đẩy|Một nick khác/);
r = start('--claim', 'Claude tnt697, https://new', '--repos', 'c/d', '--task', 'a/b:old');
assert.equal(r.status, 1);
assert.match(r.stdout, /Chưa nhận: việc a\/b:old ở repo a\/b, repo này chưa gắn/);
r = start('--claim', 'Claude tnt697, https://new', '--repos', 'a/b,c/d');
assert.equal(r.status, 0, r.stdout + r.stderr);
assert.match(r.stdout, /a\/b, nhánh handoff, tasks\/new\.md \(bản làm việc/, 'attached repo: claimed as before');

// Setup check runs first and its fixes make the exit code 1, but the rest is still printed.
r = start('--project', 'Claude', '--instructions', 'none', '--repos', 'thiengthb/thienai-workflow', '--no-git');
assert.equal(r.status, 1);
assert.match(r.stdout, /Thiếu setup/);
assert.match(r.stdout, /## Sổ bàn giao/);

// STATUS waiting on a PR that is closed: a reminder; open PRs and another repo's PR numbers: none.
{
  const md = '# Tiến độ\n\n## Kế hoạch đang chạy\n| a | 4/4, chờ thien merge PR #97 | 7/7 |\n\n## Đang chờ thien\n- Merge sakubun PR #97.\n- Merge PR #98.\n- Xoá nhánh x | PR #97 đã đóng, phần cần đã merge (PR #97) |\n';
  const prs = { byNumber: new Map([[97, { head: 'a', open: false }], [98, { head: 'b', open: true }]]), byHead: new Map() };
  const notes = stalePrNotes(md, prs);
  assert.equal(notes.length, 1, 'only the closed PR of this repo'); assert.match(notes[0], /^STATUS còn chờ PR #97 mà PR đó không còn mở/);
  assert.match(notes[0], /đang mở nhưng conflict\): mở PR xem trước/, 'no merge ref may also be an open PR with a conflict: never called an old branch');
  assert.deepEqual(stalePrNotes(md, null), [], 'PRs not readable: no reminder');
  // A plan's "Đang ở đâu" repeats waiting lines (action-gaps still said "chờ merge PR #110" after it merged, Codex review 17/11).
  // Only the clause that waits counts: "(#107) qua kiểm" and "thienui `taste.md` (PR #8)" are history in the same line.
  const plan = '# K\n\nTrạng thái: đang chạy\n\n## Đang ở đâu\n- Đang ở: PR sau buổi (#107) qua kiểm; gu đã vào thienui `taste.md` (PR #8); sửa tên trục ở PR #110, chờ thien merge.\n- thien cần làm: merge PR #110 trước BA 5.\n\n## Mục tiêu\nchờ merge PR #97\n';
  const closed = { byNumber: new Map([[107, { open: false }], [8, { open: false }], [110, { open: false }], [97, { open: false }]]), byHead: new Map() };
  // Through planNotes, the function start-session itself calls: a running plan is read, a finished one is not.
  const pdir = mkdtempSync(join(tmpdir(), 'plans-'));
  mkdirSync(join(pdir, 'docs/plans'), { recursive: true });
  writeFileSync(join(pdir, 'docs/plans/k.md'), plan);
  writeFileSync(join(pdir, 'docs/plans/old.md'), plan.replace('Trạng thái: đang chạy', 'Trạng thái: xong'));
  const pn = planNotes(pdir, closed);
  rmSync(pdir, { recursive: true, force: true });
  assert.equal(pn.length, 2, 'both lines that wait on #110, nothing else: ' + pn.join(' / '));
  assert.ok(pn.every((n) => /^docs\/plans\/k\.md còn chờ PR #110/.test(n)));
  assert.equal(planNow(plan).includes('#97'), false, 'only the "Đang ở đâu" section is read');
  const history = '## Đang ở đâu\n- Đang ở: đợt 0, 1, 2 xong, PR #98 merge 2026-11-17. Đợt 2 xong: bảng (PR #106), sửa tên trục (PR #110, đã merge).\n';
  assert.deepEqual(stalePrNotes(history, { byNumber: new Map([[98, { open: false }], [106, { open: false }], [110, { open: false }]]), byHead: new Map() }, undefined, { pick: planNow, wait: PLAN_WAIT }), [], 'history at the top of a plan is not waiting');
  // History belongs to the number it sits next to; a waiting clause with no number means the PR just before it.
  const two = { byNumber: new Map([[98, { open: false }], [110, { open: false }], [97, { open: false }]]), byHead: new Map() };
  const mixed = stalePrNotes('## Đang ở đâu\n- PR #98 đã merge, chờ PR #110.\n', two, undefined, { pick: planNow, wait: PLAN_WAIT });
  assert.equal(mixed.length, 1); assert.match(mixed[0], /PR #110/);
  const semi = stalePrNotes('## Đang chờ thien\n- PR #97; chờ thien duyệt.\n', two);
  assert.equal(semi.length, 1, 'a waiting clause right after its PR number'); assert.match(semi[0], /PR #97/);
}
// Unknown options stop before anything is read or claimed (2026-11-17: --dry-run was ignored and a task got claimed).
{
  const r = spawnSync(process.execPath, [fileURLToPath(new URL('../../templates/start-session.mjs', import.meta.url)), '--claim', 'Claude tnt628, x', '--dry-run'], { encoding: 'utf8' });
  assert.equal(r.status, 2); assert.match(r.stderr, /tham số lạ: --dry-run/); assert.doesNotMatch(r.stdout, /Sổ bàn giao/);
}

rmSync(root, { recursive: true, force: true });
console.log('ok start-session');
