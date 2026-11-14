// Kiểm after-lesson.mjs (việc sau buổi học), usage.mjs (tính năng được dùng) và phần "chỗ còn vướng" của make-lesson.mjs.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { subjects, lessonOf, pageQuestions, stuckPoints, addStuck, draft, checkAfter, checkAll } from '../../artifacts/lesson/after-lesson.mjs';
import { fill, subjectFile } from '../../artifacts/lesson/make-lesson.mjs';
import { addUsage, usageRows, usageSummary } from '../../artifacts/kit/usage.mjs';
import { reviewUsage } from '../../artifacts/review/apply-review.mjs';

const ROOT = new URL('../../', import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// Môn, mã thẻ, số buổi
const subs = subjects(read('learning/README.md'), read('learning/cards.md'));
assert.deepEqual(subs.frontend, { name: 'Frontend', file: 'frontend.md', prefix: 'F' });
assert.equal(subs.war.prefix, 'W');
assert.deepEqual(lessonOf('war-03-sandtable'), { dir: 'war', n: 3 });
assert.equal(lessonOf('review'), null);

// Câu hỏi trên trang mẫu
const tpl = read('artifacts/lesson/template.html');
const Q = pageQuestions(tpl);
assert.match(Q.q1.text, /^Màn đặt lịch có nút "Đặt lịch"/);
assert.equal(Q.q1.options.length, 3);
assert.equal(Q.q1.answer, 0);
assert.match(Q.C1.text, /^Muốn nút chính nổi hơn/, 'bỏ số thứ tự "1." ở đầu câu');

// Chỗ còn vướng: tạo mục trước "Buổi tiếp theo", thêm tiếp, bỏ dòng trùng, giữ dòng mới nhất
const md = '# Môn\n\n## Nhật ký\n| Buổi |\n\n## Buổi tiếp theo\n- Buổi 2\n';
const m1 = addStuck(md, ['a', 'b']);
assert.match(m1, /## Chỗ còn vướng\n[\s\S]*- a\n- b\n\n## Buổi tiếp theo/);
const m2 = addStuck(m1, ['b', 'c']);
assert.deepEqual(stuckPoints(m2), ['a', 'b', 'c']);
assert.equal(m2.match(/## Chỗ còn vướng/g).length, 1);
assert.deepEqual(stuckPoints(addStuck(m2, ['d', 'e', 'f', 'g', 'h'])), ['c', 'd', 'e', 'f', 'g', 'h'], 'tối đa 6 dòng mới nhất');
assert.deepEqual(stuckPoints('# Không có mục\n'), []);
assert.match(addStuck('# Môn\n', ['x']), /# Môn\n\n## Chỗ còn vướng[\s\S]*- x\n/, 'không có "Buổi tiếp theo" thì thêm cuối file');

// Nháp sau buổi
const R = {
  lesson: 'frontend-06', start: '2026-11-15T12:00:00Z', end: '2026-11-15T12:14:00Z',
  review: { C1: { pick: 1, ok: true } }, quiz: { q1: { pick: 1, ok: false }, q2: { pick: 0, ok: true } },
  teach: 'Một màu nhấn', sawMineBeforeWriting: false, feedback: { len: 'vừa', diff: 'khó', note: 'hơi dài' },
  ai: [{ kind: 'ask', step: 'Thử trước', q: 'màu trạng thái có tính không?', a: '…' }, { kind: 'why', q: 'q1', a: '…' }], spoke: 2,
};
const cards = '| F8 | Frontend | x | y | 1 | 2026-11-13 |\n| F9 | Frontend | x | y | 1 | 2026-11-13 |\n';
const d = draft({ R, html: tpl, subject: subs.frontend, lessonFile: 'frontend/lessons/06-app-colours.md', cards });
assert.equal(d.date, '2026-11-15');
assert.ok(d.facts.includes('Thời gian trên trang: 14 phút'));
assert.ok(d.facts.includes('Câu hỏi trong bài: đúng 1/2'));
assert.equal(d.stuck.length, 2);
assert.match(d.stuck[0], /^2026-11-15, buổi 6: câu “Màn đặt lịch[^”]*” chọn “Đổi tim sang màu xanh cho đồng bộ”, đúng là “Để tim thành viền/);
assert.match(d.stuck[1], /hỏi Claude ở bước “Thử trước”: “màu trạng thái có tính không\?”/);
assert.match(d.cardRows[0], /^\| F10 \| Frontend \| Màn đặt lịch[^|]*\| \[bài 6\]\(frontend\/lessons\/06-app-colours\.md\) \| 1 \| 2026-11-16 \|$/);
assert.match(d.cardRows[1], /^\| F11 \|/, 'ít nhất 2 thẻ nháp');
assert.deepEqual([d.usage['Hỏi Claude'], d.usage['Claude giải thích câu sai'], d.usage['Nói thay gõ'], d.usage['Phút']], [1, 1, 2, 14]);

// Bảng tính năng được dùng
const head = '# x\n\n| Ngày | Trang | Phút | Hỏi Claude | Claude giải thích câu sai | Claude nhận xét, chấm | Nói thay gõ | Ghi chú |\n|---|---|---|---|---|---|---|---|\n';
let u = addUsage(head, d.usage);
u = addUsage(u, { ...d.usage, 'Hỏi Claude': 3 });
assert.equal(usageRows(u).length, 1, 'cùng ngày cùng trang thì thay dòng cũ');
assert.equal(usageRows(u)[0]['Hỏi Claude'], '3');
assert.equal(usageRows(addUsage(u, { ...d.usage, 'Trang': 'frontend-06 lúc 21:30' })).length, 2, 'học lại cùng bài trong ngày là dòng riêng');
const rv = reviewUsage({ today: '2026-11-15', spoke: 1, again: ['F1'], items: { F1: { verdict: 'quen', ai: 'Thiếu ý' }, F2: { verdict: 'nho', ai: '' } } }, '2026-11-15');
assert.equal(rv['Ghi chú'], '2 thẻ, nhớ 1, quên 1, có ôn lại thẻ quên');
u = addUsage(u, rv);
assert.deepEqual(usageSummary(u).find((s) => s.feature === 'Hỏi Claude'), { feature: 'Hỏi Claude', sessions: 1, used: 1, times: 3 }, '"-" là trang không có tính năng đó');
assert.deepEqual(usageSummary(u).find((s) => s.feature === 'Nói thay gõ'), { feature: 'Nói thay gõ', sessions: 2, used: 2, times: 3 });
assert.equal(reviewUsage({ F1: 'nho' }, '2026-11-15'), null, 'dạng gọn không có số liệu dùng');
assert.throws(() => addUsage('# không có bảng\n', d.usage));

// make-lesson ghi chỗ còn vướng vào cấu hình bài
const conf = (h) => JSON.parse(h.match(/<script type="application\/json" id="lesson">([\s\S]*?)<\/script>/)[1]);
const tplFilled = tpl.replace(/__[A-Z][A-Z0-9_]*__/g, 'Mẫu');
assert.deepEqual(conf(fill(tplFilled, 'frontend-06', '', { stuck: ['a', 'b'] })).stuck, ['a', 'b']);
assert.equal(conf(fill(tplFilled, 'frontend-06', '')).stuck, undefined);
assert.equal(subjectFile('/x/learning/frontend/pages/lesson-06.html'), '/x/learning/frontend.md');
assert.equal(subjectFile('/x/other/lesson.html'), null);

// Repo thật: bài nào cũng có nhật ký, thẻ, roadmap
assert.deepEqual(checkAll(ROOT), []);

// CLI trên một repo nhỏ: --write ghi chỗ còn vướng và dòng usage, --check báo thiếu rồi báo đủ
const T = mkdtempSync(join(tmpdir(), 'after-'));
for (const p of ['learning/frontend/lessons', 'learning/frontend/pages']) mkdirSync(join(T, p), { recursive: true });
writeFileSync(join(T, 'learning/README.md'), '| Môn | Vai | File môn | Trạng thái |\n|---|---|---|---|\n| Frontend | Môn chính | [frontend.md](frontend.md) | 5 buổi |\n\n## Trạng thái\n| Frontend 6 (màu) | 2026-11-15 | Frontend | BA 3 |\n');
writeFileSync(join(T, 'learning/frontend.md'), '# Frontend\n\n## Nhật ký\n| Buổi | Ngày |\n|---|---|\n\n## Buổi tiếp theo\n- Buổi 7\n');
writeFileSync(join(T, 'learning/cards.md'), cards);
writeFileSync(join(T, 'learning/roadmap.md'), '# Lộ trình\n\n## Frontend\n- [ ] Màu\n');
writeFileSync(join(T, 'learning/usage.md'), head);
writeFileSync(join(T, 'learning/frontend/pages/lesson-06.html'), fill(tplFilled, 'frontend-06', ''));
writeFileSync(join(T, 's.json'), JSON.stringify({ data: R }));
const cli = (...a) => spawnSync(process.execPath, [join(ROOT, 'artifacts/lesson/after-lesson.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, REPO_ROOT: T } });
let r = cli(join(T, 's.json'), '--write');
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /## Thẻ mới[\s\S]*\| F10 \| Frontend \| Màn đặt lịch/);
assert.match(r.stdout, /Đã ghi: 2 dòng vào "Chỗ còn vướng"/);
assert.equal(stuckPoints(readFileSync(join(T, 'learning/frontend.md'), 'utf8')).length, 2);
assert.equal(usageRows(readFileSync(join(T, 'learning/usage.md'), 'utf8'))[0]['Trang'], 'frontend-06 lúc 19:00', 'giờ bắt đầu theo giờ Việt Nam');
r = cli('--check', 'frontend-06');
assert.equal(r.status, 1);
assert.match(r.stdout, /✗ dòng nhật ký buổi 6[\s\S]*✓ bảng "Trạng thái"[\s\S]*✓ dòng của buổi này trong learning\/usage\.md/);
writeFileSync(join(T, 'learning/frontend/lessons/06-app-colours.md'), '# Bài 6\n');
writeFileSync(join(T, 'learning/frontend.md'), readFileSync(join(T, 'learning/frontend.md'), 'utf8').replace('|---|---|\n', '|---|---|\n| 6 | 2026-11-15 |\n'));
writeFileSync(join(T, 'learning/cards.md'), cards + d.cardRows.join('\n') + '\n');
writeFileSync(join(T, 'learning/roadmap.md'), '# Lộ trình\n\n## Frontend\n- [x] Màu (buổi 6, 2026-11-15)\n');
r = cli('--check', 'frontend-06');
assert.equal(r.status, 0, r.stdout);
assert.equal(cli('--check').status, 2, '--check thiếu mã bài thì thoát mã 2');

console.log('ok after-lesson');
