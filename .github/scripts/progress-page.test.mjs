// Tests for templates/progress-page.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parsePlan, blocks, inline, repoId, waitingLines, planSteps, statusSteps, listItems, waitKind, prOrder, gatherWaiting, overviewBody } from '../../templates/progress-page.mjs';

const plan = parsePlan([
  '# Kế hoạch thử', '', 'Trạng thái: đang chạy · Duyệt: 2026-01-01 · Cập nhật: 2026-01-02', '',
  '## Đang ở đâu', '- Đang ở: 2', '', '## Checkpoint', '', '### 1. A', '- [x] a', '- [x] b', '', '### 2. B', '- [ ] c', '',
  '## Đã đổi', '| Ngày | Đổi gì | Vì sao |', '|---|---|---|', '| 2026-01-02 | x | y |', '',
  '## Lỗi gặp', '| Ngày | Lỗi | Đã xử lý |', '|---|---|---|',
].join('\n'), 'o/r:docs/plans/x.md');
assert.equal(plan.meta['Trạng thái'], 'đang chạy');
assert.deepEqual(plan.all, { done: 2, total: 3 });
assert.equal(plan.current, 1, 'first checkpoint with an open tick is the current one');
assert.equal(plan.changes.length, 1);
assert.equal(plan.errors.length, 0, 'empty table has no rows');

assert.match(inline('[a](../STATUS.md)', 'o/r:docs/plans/x.md'), /github\.com\/o\/r\/blob\/main\/docs\/STATUS\.md/, 'relative links go to GitHub');
assert.match(inline('<script>', ''), /&lt;script&gt;/, 'html is escaped');
assert.match(blocks(['| A | B |', '|---|---|', '| <x> | <y> |'], ''), /Chưa có/, 'placeholder-only table shows "Chưa có"');

assert.notEqual(repoId('owner-a/app'), repoId('owner-b/app'), 'same repo name under two owners gets two anchors');
assert.notEqual(repoId('a-b/c'), repoId('a/b-c'), 'hyphen and slash in different places give different anchors');
assert.notEqual(repoId('a/b.c'), repoId('a/b-c'), 'dot and hyphen give different anchors');
assert.match(repoId('thiengthb/thienai-workflow'), /^[a-z0-9-]+$/, 'anchor uses only letters, digits and hyphens');

const run = (...args) => execFileSync('node', ['templates/progress-page.mjs', ...args], { encoding: 'utf8' });
const repoPage = run('--title', 'T', '.=thiengthb/thienai-workflow', 'missing=thiengthb/x:không đọc được', 'missing=thiengthb/y:' + 'lý do dài '.repeat(40));
assert.match(repoPage, /^<!DOCTYPE html>/);
assert.match(repoPage, /Kế hoạch đang chạy/);
// An unreadable repo is a plain card: its reason stays in view, with no empty detail to unfold.
assert.match(repoPage, /<div class="rc rc-static"><div class="rc-head"><b>x<\/b>.*?<p class="rc-where">không đọc được<\/p><\/div>/);
assert.ok(repoPage.includes('lý do dài '.repeat(40).trim()), 'a long reason is shown whole');
assert.doesNotMatch(repoPage, /\.rc-where \{[^}]*line-clamp/, 'the reason is never clamped: the plain card cannot unfold');
const road = run('--title', 'L', '--roadmap', 'learning/roadmap.md=thiengthb/thienai-workflow:learning/roadmap.md');
assert.match(road, /đang ở đây/, 'roadmap marks the current stage');
assert.ok(readFileSync('learning/roadmap.md', 'utf8').includes('## Lộ trình đã đổi'), 'roadmap keeps its change log');

// "Đang chờ thien": a bullet that is only a <placeholder> is skipped; links in angle brackets are real items.
assert.deepEqual(waitingLines(['- <tối đa 3 việc>', '- <https://example.com>', '- Kiểm tra <https://example.com>.', '1. <x>']),
  ['- <https://example.com>', '- Kiểm tra <https://example.com>.']);

// Repo card timeline: plan checkpoints become steps, the first unfinished one is current.
const ps = planSteps(plan);
assert.deepEqual(ps.steps.map((x) => [x.label, x.done]), [['A', true], ['B', false]]);
assert.equal(ps.cur, 1);
// Old free-form plans: the STATUS ticks column "U0, U1 / U0–U8" becomes nine steps, two done.
const ss = statusSteps({ title: 'UI v2', at: 'U2', ticks: 'U0, U1 / U0–U8' });
assert.equal(ss.steps.length, 9); assert.equal(ss.cur, 2); assert.equal(ss.steps[1].done, true);
assert.deepEqual(statusSteps({ title: 'x', at: '', ticks: '3/5' }).steps, [], 'no range, no steps');
assert.deepEqual(listItems(['1. a', '   b', '- c', '', 'đoạn']), ['a b', 'c']);
assert.match(repoPage, /<ol class="tl">.*<span class="k">Bây giờ<\/span>/s, 'repo card shows the timeline');
assert.match(repoPage, /<nav class="tabs" role="tablist"[^>]*><button[^>]*data-tab="all">Tổng quan</, 'the overview tab comes first');
assert.match(repoPage, /<section class="panel" role="tabpanel" id="p-all"[^>]*>/, 'overview panel shown by default');
assert.match(repoPage, /<a class="rc rrow" href="#[^"]+" data-tab="[^"]+">/, 'each repo row opens its tab');
// A waiting task shows in both tabs with one tick key and distinct element ids.
const keys = [...repoPage.matchAll(/<li class="task" data-key="([^"]+)"><label class="tick"><input type="checkbox" id="([^"]+)"/g)];
assert.ok(keys.length && new Set(keys.map((m) => m[2])).size === keys.length, 'checkbox ids are unique');

// "Đang chờ bạn" gathers items by kind.
assert.equal(waitKind('Merge sakubun PR #301 (luật AGENTS mới).'), 'pr');
assert.equal(waitKind('Mở 3 trang trên điện thoại và laptop.'), 'page');
assert.equal(waitKind('Xem https://claude.ai/artifact/Ab1'), 'page');
assert.equal(waitKind('Mở trang so sánh rồi chọn một phương án.'), 'decide', 'a choice wins over the page it sits on');
assert.equal(waitKind('Chép dòng Settings mới vào từng tài khoản.'), 'other');
assert.equal(waitKind('Đọc bản tóm tắt.'), 'other', '"tắt" is not "trang"');

// Merge order: stacked branches and "merge sau #N" go after #N, a PR another one includes is closed after it,
// drafts last, otherwise oldest first.
const pr = (number, created, more = {}) => ({ number, title: 'PR ' + number, url: 'https://github.com/o/r/pull/' + number, draft: false, base: 'main', head: 'b' + number, created, body: '', ...more });
const order = prOrder([
  pr(5, '2026-01-05'), pr(4, '2026-01-04', { draft: true }), pr(3, '2026-01-03', { base: 'b6' }),
  pr(6, '2026-01-06'), pr(2, '2026-01-02', { body: 'Merge sau #7.' }), pr(7, '2026-01-07', { body: 'PR này gộp luôn PR #1.' }), pr(1, '2026-01-01'),
]);
assert.deepEqual(order.map((p) => p.number), [5, 6, 3, 7, 1, 2, 4]);
assert.deepEqual(order.find((p) => p.number === 3).after, [6], 'stacked on #6');
assert.deepEqual(order.find((p) => p.number === 2).after, [7], '"Merge sau #7"');
assert.equal(order.find((p) => p.number === 1).closeAfter, 7, '#7 includes #1: close #1 after merging #7');
assert.deepEqual(prOrder([pr(1, 'a', { body: 'merge after #2' }), pr(2, 'b', { body: 'depends on #1' })]).map((p) => p.number), [1, 2], 'a cycle still lists every PR');
assert.deepEqual(prOrder([pr(1, 'a', { body: 'merge sau #9' })])[0].after, [], 'a closed PR is no dependency');
// A fork's branch named like a branch of the repo is a different branch: #12 is stacked on #10, not on the fork's #11.
const fork = prOrder([pr(12, 'c', { base: 'feature', baseRepo: 'o/r' }), pr(11, 'b', { head: 'feature', headRepo: 'f/r' }), pr(10, 'a', { head: 'feature', headRepo: 'o/r' })]);
assert.deepEqual(fork.find((p) => p.number === 12).after, [10]);

// A STATUS item about a PR still open becomes a note on it, in the repo it names; one whose PR is gone is marked.
const R = (name, tasks, prs) => ({ name, repo: 'o/' + name, tasks, prs, status: tasks.length ? 'waiting' : 'running' });
const [ra, rb] = gatherWaiting([{ ...R('a', ['Merge b PR #2 trước; xem [kế hoạch](plans/x.md).', 'Merge PR #9.', 'Mở trang thử.'], [pr(1, 'x')]), base: 'https://github.com/o/a/blob/main/' }, R('b', [], [pr(2, 'y'), pr(3, 'z', { draft: true })])]);
assert.deepEqual(rb.wait.prs[0].notes.map((n) => n.t), ['Merge b PR #2 trước; xem [kế hoạch](plans/x.md).']);
assert.equal(rb.wait.prs[0].notes[0].base, 'https://github.com/o/a/blob/main/', 'a moved note keeps links to the repo that wrote it');
assert.equal(ra.wait.tasks.find((x) => x.kind === 'pr').hint, 'PR này không còn mở: đã merge hoặc đã đóng.');
assert.equal(ra.waitCount, 3, 'PR #1, the closed-PR item and the page');
assert.equal(rb.waitCount, 1, 'a draft does not wait for thien');
assert.equal(rb.status, 'waiting', 'open PRs make a repo wait for thien');
assert.equal(gatherWaiting([R('c', ['Merge PR #4.'], undefined)])[0].wait.tasks[0].hint, '', 'no PR list, no guess');

const dir = mkdtempSync(join(tmpdir(), 'prs-'));
writeFileSync(join(dir, 'prs.json'), JSON.stringify({ 'thiengthb/thienai-workflow': [pr(8, '2026-01-01', { title: 'Tám <b>' }), pr(9, '2026-01-02', { base: 'b8' })], 'thiengthb/x': null }));
const withPrs = run('--title', 'T', '--prs', join(dir, 'prs.json'), '.=thiengthb/thienai-workflow', 'missing=thiengthb/x:không đọc được');
assert.match(withPrs, /<b>PR cần merge<\/b><span>theo thứ tự merge<\/span>/);
assert.match(withPrs, /#8<\/a> Tám &lt;b&gt;.*#9<\/a>.*<b>sau #8<\/b>/s, 'PRs listed in merge order, titles escaped');
assert.match(withPrs, /Không lấy được danh sách PR của x lúc dựng trang/);
const quiet = { id: 'q', name: 'q', repo: 'o/q', tasks: [], prs: null, steps: [], status: 'running', head: 'h', plans: [], done: [], blocked: [], next: [] };
assert.equal(overviewBody([quiet], { q: '' }).split('Không lấy được danh sách PR của q').length - 1, 2, 'a repo with nothing to do still warns in its own tab');
assert.doesNotMatch(repoPage, /PR cần merge<\/b><span>theo thứ tự/, 'without --prs no PR list is shown');

console.log('ok progress-page');
