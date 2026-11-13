// Tests for templates/progress-page.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parsePlan, blocks, inline, repoId, waitingLines } from '../../templates/progress-page.mjs';

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
const road = run('--title', 'L', '--roadmap', 'learning/roadmap.md=thiengthb/thienai-workflow:learning/roadmap.md');
assert.match(road, /đang ở đây/, 'roadmap marks the current stage');
assert.ok(readFileSync('learning/roadmap.md', 'utf8').includes('## Lộ trình đã đổi'), 'roadmap keeps its change log');

// "Đang chờ thien": a bullet that is only a <placeholder> is skipped; links in angle brackets are real items.
assert.deepEqual(waitingLines(['- <tối đa 3 việc>', '- <https://example.com>', '- Kiểm tra <https://example.com>.', '1. <x>']),
  ['- <https://example.com>', '- Kiểm tra <https://example.com>.']);

console.log('ok progress-page');
