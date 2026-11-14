// Kiểm check-tokens.mjs: báo màu viết thẳng ngoài :root, báo var(--tên) chưa định nghĩa, và repo thật sạch.
import assert from 'node:assert/strict';
import { literalColours, styleBlocks, usedVars, checkTokens } from '../../artifacts/kit/check-tokens.mjs';

const css = `:root { --a: #fff; --s: 0 1px 2px rgba(0,0,0,.1); }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --a: #000; } }
/* #abc trong chú thích không tính */
.x { color: var(--a); }
.y { color: #1b1b1a; background: rgb(0 0 0 / .5); }
@media (max-width: 600px) { .z { border-color: hsl(10 20% 30%); } }`;
const L = literalColours(css);
assert.deepEqual(L.map((p) => p.line), [5, 5, 6], 'chỉ màu ngoài :root, đúng dòng');
assert.match(L[0].msg, /"#1b1b1a…"/);

assert.equal(literalColours(':root .lbl { color: #fff; }').length, 1, '":root .x" không phải chỗ định nghĩa màu');

assert.deepEqual(usedVars('.a { color: var(--x); background: var(--y, #fff); }').map((v) => v.name), ['--x'], 'var có dự phòng thì bỏ qua');

const html = '<head>\n<style>/*KIT_CSS*/</style>\n<style>\n.a { color: #f00; }\n</style>';
const blocks = styleBlocks(html);
assert.equal(blocks.length, 2);
assert.deepEqual(literalColours(blocks[1].css, blocks[1].offset, html).map((p) => p.line), [4], 'dòng tính theo cả file');

assert.deepEqual(checkTokens(), [], 'repo thật không có màu viết thẳng trong CSS dùng chung');
console.log('ok check-tokens');
