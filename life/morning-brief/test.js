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
assert.ok(repos.every(r => /^[\w.-]+\/[\w.-]+$/.test(r)));

// The untouched template must read as empty, not as fake progress.
const tpl = parseStatus(fs.readFileSync(path.join(root, 'templates/STATUS.template.md'), 'utf8'), ['Đang chờ thien', 'Đang ở đâu']);
assert.deepStrictEqual(tpl, { lines: ['File tiến độ còn trống.'], waiting: false });

const filled = parseStatus('# Tiến độ\n## Đang ở đâu\nĐang làm trang đăng nhập.\n## Đang chờ thien\n- Duyệt PR #3\n- Chọn màu\n', ['Đang chờ thien', 'Đang ở đâu']);
assert.deepStrictEqual(filled, { lines: ['Đang chờ thien: Duyệt PR #3; Chọn màu', 'Đang ở đâu: Đang làm trang đăng nhập.'], waiting: true });

assert.strictEqual(formatDay('2026-11-09'), '09/11');
console.log('ok', repos);
