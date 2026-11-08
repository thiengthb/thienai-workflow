// Run: node life/morning-brief/test.js
// Node can't load .gs files by default; Code.gs is plain JS.
require.extensions['.gs'] = require.extensions['.js'];
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseTrackedRepos, parseStatus, formatDay } = require('./Code.gs');

const root = path.join(__dirname, '..', '..');
const repos = parseTrackedRepos(fs.readFileSync(path.join(root, 'life/tracked-repos.md'), 'utf8'));
assert.ok(repos.length >= 1, 'tracked repos parsed');
assert.ok(repos.every(r => /^[\w.-]+\/[\w.-]+$/.test(r.repo) && r.path.endsWith('.md')));
const custom = parseTrackedRepos('| `a/b` | x | 2026-11-08 | `team/TIEN-DO.md` |\n| `c/d` | y | 2026-11-08 | |');
assert.deepStrictEqual(custom, [{ repo: 'a/b', path: 'team/TIEN-DO.md' }, { repo: 'c/d', path: 'docs/STATUS.md' }]);

// The untouched template must read as empty, not as fake progress.
const tpl = parseStatus(fs.readFileSync(path.join(root, 'templates/STATUS.template.md'), 'utf8'), ['Đang chờ thien', 'Đang ở đâu']);
assert.deepStrictEqual(tpl, { lines: ['File tiến độ còn trống.'], waiting: false, standard: true });

const filled = parseStatus('# Tiến độ\n## Đang ở đâu\nĐang làm trang đăng nhập.\n## Đang chờ thien\n- Duyệt PR #3\n- Chọn màu\n', ['Đang chờ thien', 'Đang ở đâu']);
assert.deepStrictEqual(filled, { lines: ['Đang chờ thien: Duyệt PR #3; Chọn màu', 'Đang ở đâu: Đang làm trang đăng nhập.'], waiting: true, standard: true });

// Headings with a suffix, as in sakubun's STATUS.md, still count.
const suffixed = parseStatus('## Đang chờ thien (tối đa 3)\n1. Bấm Hiện\n', ['Đang chờ thien']);
assert.deepStrictEqual(suffixed, { lines: ['Đang chờ thien: Bấm Hiện'], waiting: true, standard: true });

// A progress file in another format is flagged, not shown as empty.
assert.strictEqual(parseStatus('# Tiến độ nhóm\n| a | b |\n', ['Đang chờ thien']).standard, false);

assert.strictEqual(formatDay('2026-11-09'), '09/11');
console.log('ok', repos);
