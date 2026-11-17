// Kiểm after-lesson.mjs (việc sau buổi học), usage.mjs (tính năng được dùng) và phần "chỗ còn vướng" của make-lesson.mjs.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { reviewResults, lessonDay, subjects, lessonOf, pageQuestions, stuckPoints, addStuck, draft, checkAfter, checkAll, logRows, addLogRow, trimLog, subjectChecks, trimAll, newWords, glossaryTerms, draftText } from '../../artifacts/lesson/after-lesson.mjs';
import { fill as fill0, subjectFile, SAMPLE_CARDS } from '../../artifacts/lesson/make-lesson.mjs';
const fill = (h, id, file, o = {}) => fill0(h, id, file, { cards: SAMPLE_CARDS, ...o });
import { addUsage, usageRows, usageSummary } from '../../artifacts/kit/usage.mjs';
import { reviewUsage } from '../../artifacts/review/apply-review.mjs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// Môn, mã thẻ, số buổi
const subs = subjects(read('learning/README.md'), read('learning/cards.md'));
assert.deepEqual(subs.frontend, { name: 'Frontend', file: 'frontend.md', prefix: 'F' });
assert.equal(subs.war.prefix, 'W');
assert.deepEqual(lessonOf('war-03-sandtable'), { dir: 'war', n: 3 });
assert.equal(lessonOf('review'), null);

// Câu hỏi trên trang mẫu
const tpl = read('artifacts/lesson/template.html');
const Q = pageQuestions(fill(tpl, 'demo-01', ''));   // bước ôn tự sinh từ thẻ mẫu
assert.match(Q.q1.text, /^Màn đặt lịch có nút "Đặt lịch"/);
assert.equal(Q.q1.options.length, 3);
assert.equal(Q.q1.answer, 0);
assert.match(Q.F8.text, /^Thẻ trạng thái/, 'bỏ số thứ tự "1." ở đầu câu');

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

// Nhật ký: thêm dòng, giữ 3 dòng mới nhất, dòng cũ sang log.md (link đổi cho đúng chỗ mới), chạy lại không đổi gì
const row = (n, x = '') => `| ${n} | 2026-11-1${n % 10} | Ý ${n}${x} ([bài](frontend/lessons/0${n}-x.md)) | Kết quả ${n} |`;
let hot = '# Frontend\n\n## Nhật ký\n| Buổi | Ngày | Ý chính | Kết quả |\n|---|---|---|---|\n' + [1, 2, 3, 4].map((n) => row(n)).join('\n') + '\n\n## Chỗ còn vướng\n- a\n\n## Buổi tiếp theo\n- 5\n';
assert.deepEqual(logRows(hot).map((r) => r.n), [1, 2, 3, 4]);
assert.equal(addLogRow(hot, row(4)), hot, 'đã có buổi 4 thì không thêm');
hot = addLogRow(hot, row(5));
assert.deepEqual(logRows(hot).map((r) => r.n), [1, 2, 3, 4, 5]);
hot = addLogRow(hot, '| 5, phần 2 | 2026-11-16 | Tiếp | x |');
assert.deepEqual(logRows(hot).map((r) => r.key), ['1', '2', '3', '4', '5', '5, phần 2'], 'buổi học tiếp ở ngày khác là dòng riêng');
let t = trimLog(hot, '', { dir: 'frontend', name: 'Frontend' });
assert.equal(t.moved, 3);
assert.deepEqual(logRows(t.md).map((r) => r.key), ['4', '5', '5, phần 2']);
assert.deepEqual(logRows(t.log).map((r) => r.n), [1, 2, 3]);
assert.match(t.md, /## Nhật ký\nNhật ký cũ hơn ở \[frontend\/log\.md\]\(frontend\/log\.md\)\.\n\n\| Buổi/);
assert.match(t.log, /^# Nhật ký cũ: Frontend\n[\s\S]*\[frontend\.md\]\(\.\.\/frontend\.md\)/);
assert.match(t.log, /\| 1 \| [^\n]*\(\.\.\/frontend\/lessons\/01-x\.md\)/, 'link tương đối đổi theo chỗ mới');
assert.match(t.md, /## Chỗ còn vướng\n- a\n\n## Buổi tiếp theo/, 'phần khác của file giữ nguyên');
const t2 = trimLog(addLogRow(t.md, row(6)), t.log, { dir: 'frontend', name: 'Frontend' });
assert.equal(t2.md.match(/frontend\/log\.md\)/g).length, 1, 'chỉ một dòng trỏ tới log');
assert.deepEqual(logRows(t2.log).map((r) => r.n), [1, 2, 3, 4]);
assert.deepEqual(trimLog(t2.md, t2.log, { dir: 'frontend' }).moved, 0);
assert.match(trimLog(hot.replace('| Ý 1 (', '| Ý 1 [gu](../docs/taste.md) ('), '', { dir: 'frontend' }).log, /\(\.\.\/\.\.\/docs\/taste\.md\)/, 'link ../ cũng đổi theo chỗ mới');
const parts = '# M\n\n## Nhật ký\n| Buổi | Ngày |\n|---|---|\n| 5 | a |\n| 5, phần 2 | b |\n| 5, phần 3 | c |\n| 5, phần 4 | d |\n';
assert.deepEqual(logRows(trimLog(parts, '', { dir: 'x' }).md).map((r) => r.key), ['5, phần 2', '5, phần 3', '5, phần 4'], 'cùng số buổi thì giữ các phần sau cùng');
assert.match(addLogRow('# Môn\n\n## Buổi tiếp theo\n- x\n', row(1)), /## Nhật ký\n\| Buổi[^\n]*\n\|---[^\n]*\n\| 1 \|[^\n]*\n\n## Buổi tiếp theo/, 'chưa có mục thì tạo trước "Buổi tiếp theo"');
const sc = (md) => subjectChecks(md, 'frontend.md').filter((c) => !c.ok).map((c) => c.what.split(' ')[0] + ' ' + c.what.split(' ')[1]);
assert.deepEqual(sc(t2.md), []);
assert.equal(sc(hot).length, 1, 'quá 3 dòng nhật ký');
assert.equal(sc(addStuck(t2.md, ['b', 'c', 'd', 'e', 'f', 'g'])).length, 1, 'quá 6 dòng chỗ còn vướng');
assert.deepEqual(sc(trimLog(addLogRow(t2.md, '| 7 | 2026-11-17 | <ý chính> (bài) | 9 phút. <tự nói lại có gì, thiếu gì; chỗ vướng; góp ý> |'), '', { dir: 'frontend' }).md), ['dòng nhật'], 'còn chỗ <…> chưa viết');

// Nháp sau buổi
const R = {
  lesson: 'frontend-06', start: '2026-11-15T12:00:00Z', end: '2026-11-15T12:14:00Z',
  review: { C1: { pick: 1, ok: true } }, quiz: { q1: { pick: 1, ok: false }, q2: { pick: 0, ok: true } },
  teach: 'Một màu nhấn', sawMineBeforeWriting: false, feedback: { len: 'vừa', diff: 'khó', note: 'hơi dài' },
  ai: [{ kind: 'ask', step: 'Thử trước', q: 'màu trạng thái có tính không?', a: '…' }, { kind: 'why', q: 'q1', a: '…' }], spoke: 2,
};
const cards = '| F8 | Frontend | x | y | 1 | 2026-11-13 |\n| F9 | Frontend | x | y | 1 | 2026-11-13 |\n';
const HEAD = '| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |\n|---|---|---|---|---|---|\n';
// Kết quả ôn đầu buổi → cards.md: chỉ mã thẻ có thật, đã đến hạn vào ngày học (giờ Việt Nam)
assert.equal(lessonDay('2026-11-16T23:30:00Z'), '2026-11-17', '6 giờ 30 sáng ở Việt Nam là ngày 17');
assert.equal(lessonDay(undefined), null);
assert.deepEqual(reviewResults({ review: { F8: { ok: true }, F9: { ok: false }, C1: { ok: true }, recall: { ok: true } } }, HEAD + cards, '2026-11-15'), { F8: 'nho', F9: 'quen' });
assert.deepEqual(reviewResults({ review: { F8: { ok: true } } }, HEAD + cards, '2026-11-12'), {}, 'thẻ chưa đến hạn vào ngày học thì không đổi');
assert.deepEqual(reviewResults({}, HEAD + cards, '2026-11-15'), {});
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
assert.deepEqual([d.usage['Xem Claude làm'], d.usage['Nghe'], d.usage['Tình huống thêm']], ['-', 0, 0], 'bài không sân khấu: không có làm mẫu');
const d2 = draft({ R: { ...R, knobs: {}, listened: 3, ai: [...R.ai, { kind: 'demo', step: 'Thử', moves: 3 }],
  extra: [{ situation: 's', question: 'Nút nào nổi?', options: ['A', 'B', 'C'], answer: 2, pick: 0, ok: false }] }, html: tpl, subject: subs.frontend, cards });
assert.deepEqual([d2.usage['Xem Claude làm'], d2.usage['Nghe'], d2.usage['Tình huống thêm']], [1, 3, 1]);
assert.match(d2.stuck.join('\n'), /tình huống thêm “Nút nào nổi\?” chọn “A”, đúng là “C”/);
assert.equal(draft({ R: { ...R, lesson: 'war-04', choices: {} }, html: tpl, subject: subs.war, cards }).usage['Tình huống thêm'], '-');
// Câu ôn sai của thẻ môn khác (B2 khi học Frontend) vào chỗ vướng của môn đó, không vào môn đang học (lỗi buổi Frontend 6)
const d3 = draft({ R: { ...R, review: { B2: { pick: 0, ok: false }, F3: { pick: 1, ok: false } }, quiz: {}, ai: [] }, html: tpl, subject: subs.frontend, cards, all: subs });
assert.deepEqual(Object.keys(d3.others), ['ba']);
assert.match(d3.others.ba[0], /^2026-11-15, ôn ở buổi Frontend 6: câu ôn B2 /);
assert.equal(d3.stuck.length, 1, 'thẻ F3 của chính môn vẫn ghi vào môn đang học');
assert.match(d3.stuck[0], /^2026-11-15, buổi 6: câu ôn “/);
assert.deepEqual(draft({ R: { ...R, review: { B2: { pick: 0, ok: false } }, quiz: {}, ai: [] }, html: tpl, subject: subs.frontend, cards }).others, {}, 'không biết các môn thì giữ như cũ');
// Nguồn trang để trống bước ôn (data-auto="cards"): chữ câu ôn sai lấy từ cards.md và cards-quiz.json, không còn là mã thẻ trơn.
{
  const qCards = '| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |\n|---|---|---|---|---|---|\n| F8 | Frontend | Màu nhấn nên dùng mấy chỗ? | y | 1 | 2026-11-13 |\n';
  const dq = draft({ R: { ...R, review: { F8: { pick: 1, ok: false } }, quiz: {}, ai: [], extra: [] }, html: '', subject: subs.frontend, cards: qCards,
    quiz: { F8: { opts: ['Một vài chỗ', 'Khắp nơi'], a: 0, why: 'w' } } });
  assert.match(dq.stuck[0], /câu ôn “Màu nhấn nên dùng mấy chỗ\?” chọn “Khắp nơi”, đúng là “Một vài chỗ”/);
}

// Góp ý của thien: câu gu của buổi frontend vào hàng chờ thienui, ghi thêm theo bảng trong MAP.md (kế hoạch action-gaps, đợt 2)
const d4 = draft({ R: { ...R, notice: 'Mình thích bản thoáng hơn' }, html: tpl, subject: subs.frontend, cards });
assert.deepEqual([d4.taste, d4.notes], [['Mình thích bản thoáng hơn'], ['hơi dài']]);
assert.match(draftText(d4), /Câu gu \(chép câu nào là gu vào learning\/frontend\/taste-queue\.md[^\n]*\n- Mình thích bản thoáng hơn/);
assert.match(draftText(d4), /Ghi thêm của thien[^\n]*\n- hơi dài/);
assert.deepEqual(draft({ R: { ...R, lesson: 'war-07', notice: 'pháo ở sườn trong' }, html: tpl, subject: subs.war, cards }).taste, [], 'câu để ý của bài chiến tranh không phải gu');
assert.match(draftText(draft({ R: { ...R, feedback: {} }, html: tpl, subject: subs.war, cards })), /- Không có câu gu trong bản lưu\.\n- Từ mới: file bài cần dòng "Từ mới: a, b"/);

// Từ mới trong file bài và bảng thuật ngữ
assert.equal(newWords('# Bài 7\n'), null, 'chưa có dòng');
assert.deepEqual(newWords('Từ mới: không có\n'), []);
assert.deepEqual(newWords('- **Từ mới:** focal point, user story (câu ba phần).\n'), ['focal point', 'user story']);
assert.deepEqual(newWords('Từ mới: `_blank`, PR (pull request, yêu cầu gộp); state\n'), ['_blank', 'PR', 'state'], 'giữ dấu _ trong từ, không tách trong ngoặc');
const gl = glossaryTerms('| Từ | Nghĩa |\n|---|---|\n| PR (pull request) | x |\n| User story | y |\n');
assert.ok(gl.has('pr') && gl.has('pull request') && gl.has('user story') && !gl.has('từ'));

// Bảng tính năng được dùng
const head = '# x\n\n| Ngày | Trang | Phút | Hỏi Claude | Claude giải thích câu sai | Claude nhận xét, chấm | Nói thay gõ | Xem Claude làm | Nghe | Tình huống thêm | Ghi chú |\n|---|---|---|---|---|---|---|---|---|---|---|\n';
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
assert.equal(subjectFile('/x/learning/frontend/pages/lesson-06.html'), resolve('/x/learning/frontend.md').replace(/\\/g, '/')); // D:/x/... on Windows
assert.equal(subjectFile('/x/other/lesson.html'), null);

// Repo thật: bài nào cũng có nhật ký, thẻ, roadmap
assert.deepEqual(checkAll(ROOT), []);

// CLI trên một repo nhỏ: --write ghi chỗ còn vướng và dòng usage, --check báo thiếu rồi báo đủ
const T = mkdtempSync(join(tmpdir(), 'after-'));
for (const p of ['learning/frontend/lessons', 'learning/frontend/pages']) mkdirSync(join(T, p), { recursive: true });
writeFileSync(join(T, 'learning/README.md'), '| Môn | Vai | File môn | Trạng thái |\n|---|---|---|---|\n| Frontend | Môn chính | [frontend.md](frontend.md) | 5 buổi |\n| BA | Môn mở rộng | [ba.md](ba.md) | 2 buổi |\n\n## Trạng thái\n| Frontend 6 (màu) | 2026-11-15 | Frontend | BA 3 |\n');
writeFileSync(join(T, 'learning/frontend.md'), '# Frontend\n\n## Nhật ký\n| Buổi | Ngày | Ý chính | Kết quả |\n|---|---|---|---|\n' + [3, 4, 5].map((n) => row(n)).join('\n') + '\n\n## Buổi tiếp theo\n- Buổi 7\n');
writeFileSync(join(T, 'learning/ba.md'), '# BA\n\n## Buổi tiếp theo\n- Buổi 3\n');
writeFileSync(join(T, 'learning/cards.md'), HEAD + cards + '| B2 | BA | y | z | 1 | 2026-11-13 |\n');
writeFileSync(join(T, 'learning/roadmap.md'), '# Lộ trình\n\n## Frontend\n- [ ] Màu\n');
writeFileSync(join(T, 'learning/usage.md'), head);
writeFileSync(join(T, 'learning/frontend/pages/lesson-06.html'), fill(tplFilled, 'frontend-06', ''));
writeFileSync(join(T, 's.json'), JSON.stringify({ data: { ...R, review: { ...R.review, B2: { pick: 0, ok: false }, F8: { pick: 1, ok: true } } } }));
const cli = (...a) => spawnSync(process.execPath, [join(ROOT, 'artifacts/lesson/after-lesson.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, REPO_ROOT: T } });
let r = cli(join(T, 's.json'), '--write');
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /## Thẻ mới[\s\S]*\| F10 \| Frontend \| Màn đặt lịch/);
assert.match(r.stdout, /Đã ghi: 2 dòng vào "Chỗ còn vướng" của learning\/frontend\.md, 1 dòng vào "Chỗ còn vướng" của learning\/ba\.md, dòng nhật ký nháp buổi 6 \(chuyển 1 dòng cũ sang learning\/frontend\/log\.md\)/);
assert.equal(stuckPoints(readFileSync(join(T, 'learning/frontend.md'), 'utf8')).length, 2);
assert.match(stuckPoints(readFileSync(join(T, 'learning/ba.md'), 'utf8'))[0], /ôn ở buổi Frontend 6: câu ôn B2/);
assert.deepEqual(logRows(readFileSync(join(T, 'learning/frontend.md'), 'utf8')).map((x) => x.n), [4, 5, 6]);
assert.deepEqual(logRows(readFileSync(join(T, 'learning/frontend/log.md'), 'utf8')).map((x) => x.n), [3]);
const cardsAfter = readFileSync(join(T, 'learning/cards.md'), 'utf8');
assert.match(cardsAfter, /^\| F8 \| Frontend \| x \| y \| 2 \| 2026-11-18 \|$/m, 'ôn đúng: lên hộp 2, hỏi lại sau 3 ngày tính từ ngày học');
assert.match(cardsAfter, /^\| B2 \| BA \| y \| z \| 1 \| 2026-11-16 \|$/m, 'ôn sai: về hộp 1');
assert.match(cardsAfter, /^\| F9 \| Frontend \| x \| y \| 1 \| 2026-11-13 \|$/m, 'thẻ không ôn giữ nguyên');
assert.equal(cli(join(T, 's.json'), '--write').status, 0);
assert.equal(readFileSync(join(T, 'learning/cards.md'), 'utf8'), cardsAfter, 'chạy lại --write không lên hộp lần nữa');
assert.equal(logRows(readFileSync(join(T, 'learning/frontend.md'), 'utf8')).length, 3, 'chạy lại --write không thêm dòng trùng');
assert.equal(stuckPoints(readFileSync(join(T, 'learning/ba.md'), 'utf8')).length, 1);
assert.equal(usageRows(readFileSync(join(T, 'learning/usage.md'), 'utf8'))[0]['Trang'], 'frontend-06 lúc 19:00', 'giờ bắt đầu theo giờ Việt Nam');
r = cli('--check', 'frontend-06');
assert.equal(r.status, 1);
assert.match(r.stdout, /✗ dòng nhật ký buổi 6[^\n]*đã viết xong phần <…>[\s\S]*✓ bảng "Trạng thái"[\s\S]*✓ dòng của buổi này trong learning\/usage\.md[\s\S]*✓ tối đa 3 dòng nhật ký[\s\S]*✗ dòng nhật ký trong learning\/frontend\.md đã viết xong, không còn chỗ <…> \(buổi 6\)/);
assert.match(cli('--check', 'frontend-03').stdout, /✓ dòng nhật ký buổi 3/, 'dòng đã chuyển sang log.md vẫn tính');
writeFileSync(join(T, 'learning/frontend/lessons/06-app-colours.md'), '# Bài 6\n\nTừ mới: palette\n');
writeFileSync(join(T, 'learning/frontend.md'), readFileSync(join(T, 'learning/frontend.md'), 'utf8').replace(/^\| 6 \|.*$/m, row(6)));
writeFileSync(join(T, 'learning/cards.md'), HEAD + cards + d.cardRows.join('\n') + '\n');
r = cli('--check', 'frontend-06');
assert.equal(r.status, 1);
assert.match(r.stdout, /✗ câu trắc nghiệm trong learning\/cards-quiz\.json cho mọi thẻ của bài này \(thiếu F10, F11\)/);
writeFileSync(join(T, 'learning/cards-quiz.json'), JSON.stringify({ F10: { opts: ['a', 'b'], a: 0, why: 'w' }, F11: { opts: ['a', 'b', 'c'], a: 2, why: 'w' } }));
writeFileSync(join(T, 'learning/roadmap.md'), '# Lộ trình\n\n## Frontend\n- [x] Màu (buổi 6, 2026-11-15)\n');
r = cli('--check', 'frontend-06');
assert.equal(r.status, 1, 'từ mới chưa có trong bảng thuật ngữ');
assert.match(r.stdout, /✓ file bài có dòng "Từ mới:"[^\n]*\n✗ từ mới của bài đã có trong learning\/glossary\.md \(thiếu: palette\)/);
writeFileSync(join(T, 'learning/glossary.md'), '| Từ | Nghĩa ngắn | Gặp lần đầu | Đã quen |\n|---|---|---|---|\n| palette | bảng màu | 15/11/2026, Frontend 6 | |\n');
r = cli('--check', 'frontend-06');
assert.equal(r.status, 0, r.stdout);
assert.equal(cli('--check').status, 2, '--check thiếu mã bài thì thoát mã 2');
assert.match(cli('--trim-log').stdout, /frontend: đã gọn\nba: đã gọn/);
assert.deepEqual(trimAll(T), [{ dir: 'frontend', moved: 0 }, { dir: 'ba', moved: 0 }]);

console.log('ok after-lesson');
