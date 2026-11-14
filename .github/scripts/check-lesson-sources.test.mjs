// Kiểm check-lesson-sources.mjs: nguồn trang bài không mang kit, PR không trộn bài với kit, trang khung cũ được bỏ qua.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkSources, checkSplit, lessonPages } from './check-lesson-sources.mjs';
import { fill, strip } from '../../artifacts/lesson/make-lesson.mjs';

const tpl = readFileSync(new URL('../../artifacts/lesson/template.html', import.meta.url), 'utf8').replace('"__ID__"', '"demo-01"');
const built = fill(tpl, 'demo-01', '');
const T = mkdtempSync(join(tmpdir(), 'sources-'));
mkdirSync(join(T, 'learning/demo/pages'), { recursive: true });
writeFileSync(join(T, 'learning/demo/pages/lesson-01.html'), strip(built));
writeFileSync(join(T, 'learning/demo/pages/lesson-02.html'), built);
writeFileSync(join(T, 'learning/demo/pages/lesson-00.html'), '<style id="lesson-kit-css">a{}</style><script id="lesson-kit">' + 'x'.repeat(70 * 1024) + '</script>');
writeFileSync(join(T, 'learning/demo/pages/lesson-03.html'), strip(built).replace('</body>', `<p>${'chữ '.repeat(20000)}</p></body>`));
const pages = lessonPages(T);
assert.equal(pages.length, 4);
const { fails, warns } = checkSources(pages, T);
assert.equal(fails.length, 1, fails.join('\n'));
assert.match(fails[0], /lesson-02\.html: còn mang .*kit-js/);
assert.match(fails[0], /make-lesson\.mjs learning\/demo\/pages\/lesson-02\.html/, 'lỗi chỉ luôn lệnh sửa');
assert.equal(warns.length, 1, 'trang khung cũ lớn không bị cảnh báo, nguồn mới quá 60 KB thì có');
assert.match(warns[0], /lesson-03\.html: phần riêng/);

assert.equal(checkSplit(['learning/war/pages/lesson-05.html', 'learning/war/battles/x.json'], 'Bài chiến tranh 5'), '', 'chỉ bài: đạt');
assert.equal(checkSplit(['artifacts/war/sandtable.js'], 'Sửa sa bàn'), '', 'chỉ kit: đạt');
assert.match(checkSplit(['learning/war/pages/lesson-05.html', 'artifacts/war/sandtable.js'], 'Bài chiến tranh 5'), /Tách phần kit/);
assert.equal(checkSplit(['learning/war/pages/lesson-05.html', 'artifacts/war/sandtable.js'], 'kit: sa bàn có mốc mùa mưa'), '', 'tiêu đề có "kit": đạt');
assert.equal(checkSplit(['learning/cards.md', 'learning/war.md', 'artifacts/lesson/after-lesson.mjs'], 'Sau buổi'), '', 'file chung của môn không tính là bài');
assert.equal(checkSplit(['learning/war/pages/lesson-05.html', 'artifacts/war/README.md'], 'Bài chiến tranh 5'), '', 'sửa README của kit kèm bài: đạt');
console.log('check-lesson-sources: ok');
