// Kiểm make-review.mjs và apply-review.mjs: đọc bảng thẻ, chọn thẻ đến hạn, tìm đáp án trong bài, ghi kết quả ôn.
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parseCards, dueCards, selfCheck, matchAnswer, lessonExcerpt, buildReview, applyReview, render, INTERVALS } from '../../artifacts/review/make-review.mjs';
import { verdicts } from '../../artifacts/review/apply-review.mjs';
import { fileURLToPath } from 'node:url';

const real = readFileSync(new URL('../../learning/cards.md', import.meta.url), 'utf8');
const cards = parseCards(real);
assert.ok(cards.length >= 20, 'đọc được bảng thẻ thật');
assert.ok(cards.every((c) => c.id && c.question && /^\d{4}-\d{2}-\d{2}$/.test(c.due)), 'mỗi thẻ có mã, câu hỏi, ngày hỏi lại');

const t = `| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |
|---|---|---|---|---|---|
| A1 | Frontend | Câu một? | [bài 1](l1.md) | 1 | 2026-11-14 |
| A2 | BA | Câu hai? | [bài 2](l2.md) | 3 | 2026-11-10 |
| A3 | BA | Câu ba? | [bài 2](l2.md) | 5 | 2026-11-20 |
| A4 | BA | Câu bốn? | [bài 2](l2.md) | 2 | 2026-11-10 |
`;
assert.deepEqual(dueCards(parseCards(t), '2026-11-14').map((c) => c.id), ['A2', 'A4', 'A1'], 'quá hạn lâu nhất trước, chưa tới hạn thì bỏ');
assert.deepEqual(dueCards(parseCards(t), '2026-11-14', 1).map((c) => c.id), ['A2']);

const md = readFileSync(new URL('../../learning/frontend/lessons/05-one-accent-colour.md', import.meta.url), 'utf8');
const checks = selfCheck(md);
assert.equal(checks.length, 3);
assert.match(matchAnswer('Thanh đầu trang cùng màu đặc với nút chính thì sao?', checks).a, /^Hai khối cùng màu đặc/);
assert.match(matchAnswer('Thẻ trạng thái "Đã thanh toán" nên đặc hay nhạt, vì sao?', checks).a, /^Nền xanh lá nhạt/);
assert.equal(matchAnswer('Chiến dịch Điện Biên Phủ kéo dài bao lâu?', checks), null, 'câu không liên quan thì không ghép bừa');
assert.ok(!/Học ngày|Tự kiểm|Đáp án/.test(lessonExcerpt(md)), 'đoạn bài bỏ dòng ngày học và phần tự kiểm');

// Ngày xa để thẻ nào cũng đến hạn: thẻ thật đổi hạn sau mỗi buổi ôn, test không được phụ thuộc vào đó.
const review = buildReview(real, fileURLToPath(new URL('../../learning/', import.meta.url)), '2099-01-01', 10);
assert.equal(review.items.length, 10);
assert.ok(review.items.filter((x) => x.answer).length >= 7, 'phần lớn thẻ tìm được đáp án trong bài');
assert.ok(review.items.every((x) => x.ref), 'thẻ nào cũng có đoạn bài để Claude chấm');
const html = render(review);
assert.ok(!/__[A-Z]+__|\/\*[A-Z_]+\*\//.test(html), 'không còn chỗ giữ chỗ');
assert.ok(html.includes('window.Kit') && html.includes('reviews/'), 'gắn lõi chung và chỗ lưu');

// Ghi kết quả: nhớ thì lên một hộp, quên thì về hộp 1; ngày hỏi lại tính từ ngày ôn.
const { text, changed } = applyReview(t, { A2: 'nho', A4: 'quen', A9: 'nho', A1: 'x' }, '2026-11-14');
const after = parseCards(text);
assert.deepEqual([after[1].box, after[1].due], [4, '2026-11-28'], `hộp 3 nhớ → hộp 4, ${INTERVALS[3]} ngày`);
assert.deepEqual([after[3].box, after[3].due], [1, '2026-11-15'], 'quên → hộp 1, 1 ngày');
assert.deepEqual([after[0].box, after[0].due], [1, '2026-11-14'], 'thẻ không chấm giữ nguyên');
assert.equal(changed.length, 2, 'bỏ qua mã không có và kết quả lạ');
assert.equal(parseCards(applyReview(t, { A3: 'nho' }, '2026-11-14').text)[2].box, 5, 'hộp 5 là cao nhất');
assert.deepEqual(verdicts({ today: '2026-11-14', items: { A1: { verdict: 'nho' }, A2: { verdict: '' } } }), { A1: 'nho' });
assert.deepEqual(verdicts({ A1: 'quen' }), { A1: 'quen' });

// CLI: ghi thẳng vào file thẻ, lấy ngày từ bản lưu.
const d = mkdtempSync(join(tmpdir(), 'review-'));
writeFileSync(join(d, 'cards.md'), t);
writeFileSync(join(d, 'r.json'), JSON.stringify({ today: '2026-11-14', items: { A2: { verdict: 'quen' } } }));
const r = spawnSync(process.execPath, [fileURLToPath(new URL('../../artifacts/review/apply-review.mjs', import.meta.url)), join(d, 'cards.md'), join(d, 'r.json')], { encoding: 'utf8' });
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /A2: quên, hộp 3 → 1, hỏi lại 2026-11-15/);
assert.equal(parseCards(readFileSync(join(d, 'cards.md'), 'utf8'))[1].box, 1);

console.log('ok make-review');
