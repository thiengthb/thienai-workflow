// Tests for templates/progress-page.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parsePlan, blocks, inline, repoId, waitingLines, planSteps, statusSteps, listItems } from '../../templates/progress-page.mjs';

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
const repoPage = run('--title', 'T', '.=thiengthb/thienai-workflow', 'missing=thiengthb/x:không đọc được');
assert.match(repoPage, /^<!DOCTYPE html>/);
assert.match(repoPage, /Kế hoạch đang chạy/);
// An unreadable repo is a plain card: its reason stays in view, with no empty detail to unfold.
assert.match(repoPage, /<div class="rc rc-static" id="[^"]+"><div class="rc-head"><b>x<\/b>.*<p class="rc-where">không đọc được<\/p><\/div>/);
assert.doesNotMatch(repoPage, /<details class="rc" id="[^"]*x"/);
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
assert.match(repoPage, /<span class="more">Xem chi tiết<svg/, 'repo card ends with the detail button');

console.log('ok progress-page');
