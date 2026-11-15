// Kiểm artifacts/lesson/prepare-lesson.mjs (gói buổi): đọc đúng buổi kế tiếp, chép luật nguyên văn, in đúng thẻ đến hạn,
// và kích thước gói không tăng theo số buổi đã học (docs/plans/2026-11-15-lean-learning.md, checkpoint 2).
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sections, nextLesson, frame, profile, reviewCards, packet, packetBytes, REVIEW_CARDS } from '../../artifacts/lesson/prepare-lesson.mjs';
import { subjects, addLogRow, addStuck, trimAll, logRows, MAX_STUCK } from '../../artifacts/lesson/after-lesson.mjs';
import { stuckPoints } from '../../artifacts/lesson/make-lesson.mjs';
import { parseCards, dueCards } from '../../artifacts/review/make-review.mjs';
import { measure } from './reading-cost.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const read = (p, root = ROOT) => readFileSync(join(root, p), 'utf8').replace(/\r\n?/g, '\n');

// Các mục của một file markdown
const md = '# Môn\nGiới thiệu\n\n## A\nmột\n\n## B\nhai\n';
assert.deepEqual(sections(md).map((s) => s.head), ['', '## A', '## B']);
assert.equal(sections(md)[1].body, 'một');

// Buổi kế tiếp: chữ in đậm đầu tiên ở cột cuối bảng "Trạng thái"
const subs = { frontend: { name: 'Frontend', file: 'frontend.md' }, ba: { name: 'BA', file: 'ba.md' }, war: { name: 'Chiến tranh', file: 'war.md' } };
const status = (cell) => `## Trạng thái\n\n| Buổi gần nhất | Ngày | Môn | Buổi kế tiếp |\n|---|---|---|---|\n| Frontend 6 | 2026-11-15 | Frontend | ${cell} |\n`;
assert.deepEqual(nextLesson(status('**BA 3 (các bên liên quan)**, rồi Frontend 7'), subs), { dir: 'ba', n: 3, label: 'BA 3 (các bên liên quan)' });
assert.equal(nextLesson(status('**Chiến tranh 5**'), subs).dir, 'war');
assert.equal(nextLesson(status('BA 3'), subs), null, 'không in đậm thì không đoán');

// Khung một buổi: nguyên văn, bỏ khối "Sau buổi" và phần ngay sau nó, giữ đoạn in đậm kế tiếp
const fr = frame('## Khung một buổi, chung\n\n1. Ôn\n2. Nhớ lại\n\n**Sau buổi**, theo thứ tự:\n1. Ghi\n\nBuổi học ngoài Claude thì ghi.\n\n**Chỗ còn vướng** là cầu nối.\n\n## Khác\nx\n');
assert.equal(fr.body, '1. Ôn\n2. Nhớ lại\n\n**Chỗ còn vướng** là cầu nối.');

// Hồ sơ môn: nhật ký chỉ dòng gần nhất, chỗ vướng tối đa 6 dòng mới nhất, mục khác nguyên văn
let hot = '# Học X\nĐọc hết.\n\n## Cách dạy môn này\nLuật 1.\n\n## Nhật ký\n| Buổi | Ngày | Ý chính | Kết quả |\n|---|---|---|---|\n| 1 | d | a | b |\n| 2 | d | c | e |\n\n## Chỗ còn vướng\nAI ghi.\n\n' +
  [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `- v${i}`).join('\n') + '\n\n## Buổi tiếp theo\n- Buổi 3\n';
const pr = profile(hot, { dir: 'x', file: 'x.md' });
assert.match(pr, /^Đọc hết\.\n\n## Cách dạy môn này\nLuật 1\.\n\n## Nhật ký: buổi gần nhất \(1 dòng trước đó ở learning\/x\.md, cũ hơn ở learning\/x\/log\.md\)\n\| Buổi[^\n]*\n\|---[^\n]*\n\| 2 \| d \| c \| e \|\n\n## Chỗ còn vướng \(6 dòng mới nhất trong 8\)\n- v3\n[\s\S]*- v8\n\n## Buổi tiếp theo\n- Buổi 3$/);
assert.ok(!pr.includes('| 1 | d |'), 'dòng nhật ký cũ không vào gói');

// Thẻ ôn: đúng các thẻ đến hạn, thiếu thì thêm thẻ hạn sớm nhất của môn khác (learning/codex.md)
const cards = '| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |\n|---|---|---|---|---|---|\n| F1 | Frontend | q1 | [b](x.md) | 1 | 2026-11-10 |\n| B1 | BA | q2 | [b](x.md) | 1 | 2026-11-20 |\n| F2 | Frontend | q3 | [b](x.md) | 1 | 2026-11-19 |\n| W1 | Chiến tranh | q4 | [b](x.md) | 1 | 2026-11-30 |\n';
assert.deepEqual(reviewCards(cards, '/nowhere', '2026-11-15', 3, 'Frontend').map((c) => [c.id, !!c.filler]), [['F1', false], ['B1', true], ['W1', true]]);
assert.equal(reviewCards(cards, '/nowhere', '2026-11-15', 3, 'Frontend')[0].answer, null, 'không thấy bài thì không đoán đáp án');

// Repo thật: buổi kế tiếp, luật nguyên văn, đúng 3 thẻ đến hạn so với cards.md
const readme = read('learning/README.md'), cardsText = read('learning/cards.md');
const real = subjects(readme, cardsText);
assert.ok(nextLesson(readme, real), 'bảng "Trạng thái" có buổi kế tiếp in đậm');
const today = '2026-11-15';
for (const dir of Object.keys(real)) {
  const p = packet({ root: ROOT, dir, today, open: Object.assign([], { stale: true }) });
  const due = dueCards(parseCards(cardsText), today, REVIEW_CARDS).map((c) => c.id);
  const shown = [...p.matchAll(/^- ([A-Z]+\d+) \([^)]*hạn \d{4}-\d{2}-\d{2}\)/gm)].map((m) => m[1]);
  assert.deepEqual(shown.slice(0, due.length), due, `${dir}: thẻ đến hạn giống cards.md`);
  assert.equal(shown.length, REVIEW_CARDS);
  const subj = read('learning/' + real[dir].file);
  const teach = sections(subj).find((s) => s.head === '## Cách dạy môn này');
  assert.ok(p.includes(teach.body), `${dir}: "Cách dạy môn này" chép nguyên văn`);
  assert.ok(stuckPoints(subj).every((l) => p.includes(l)), `${dir}: đủ chỗ còn vướng`);
  assert.ok(p.includes(frame(readme).body), `${dir}: khung một buổi nguyên văn`);
  assert.ok(!p.includes('**Sau buổi**'), `${dir}: không chép khối "Sau buổi"`);
  assert.ok(p.includes('`profile/TUTOR.md`') && !p.includes(read('profile/TUTOR.md').split('\n').find((l) => l.length > 80)), `${dir}: TUTOR.md chỉ trỏ tới, không tóm hay chép`);
  assert.match(p, /## Nhánh chưa merge đụng môn này\nchưa kiểm:/, `${dir}: không so được nhánh thì ghi "chưa kiểm"`);
}

// CLI
const cli = (root, ...a) => spawnSync(process.execPath, [join(ROOT, 'artifacts/lesson/prepare-lesson.mjs'), ...a], { encoding: 'utf8', env: { ...process.env, REPO_ROOT: root } });
let r = cli(ROOT, '--no-fetch', '--today', today);
assert.equal(r.status, 0, r.stderr);
assert.match(r.stdout, /^# Gói buổi: /);
assert.equal(cli(ROOT, 'nope', '--no-fetch').status, 2);
assert.equal(+cli(ROOT, '--reading-cost').stdout.trim(), packetBytes(ROOT));

// 10 buổi giả: luồng "học" của reading-cost không tăng theo số buổi.
// Mỗi buổi thêm một dòng nhật ký, hai chỗ vướng (AI gọn lại còn 6, CI chặn khi hơn) và ba thẻ, rồi chạy --write như thật (trimAll).
const T = mkdtempSync(join(tmpdir(), 'prepare-'));
cpSync(ROOT, T, { recursive: true, filter: (src) => !/[\\/](\.git|node_modules|build|\.check-pages)$/.test(src) });
const learnRow = (root) => measure(root).tasks.find((t) => t.task.startsWith('"học"')).bytes;
const fake = (n) => `| ${n} | 2026-12-${String(n % 28 + 1).padStart(2, '0')} | Buổi giả ${String(n).padStart(3, '0')} ([bài](frontend/lessons/${n}-fake.md)) | ${'Kết quả dài như một buổi thật. '.repeat(40)} |`;
const lesson = (root, k) => {
  const f = join(root, 'learning/frontend.md');
  let m = read('learning/frontend.md', root);
  const n = Math.max(...logRows(m).map((x) => x.n)) + 1;
  m = addLogRow(addStuck(m, [`2026-12-01, buổi ${n}: câu giả số ${String(k).padStart(3, '0')} chọn sai, đúng là một ý khác dài vừa phải`, `2026-12-01, buổi ${n}: hỏi Claude ở bước giả số ${String(k).padStart(3, '0')}`]), fake(n));
  const all = stuckPoints(m, Infinity);
  if (all.length > MAX_STUCK) for (const l of all.slice(0, all.length - MAX_STUCK)) m = m.replace(`- ${l}\n`, '');
  writeFileSync(f, m);
  trimAll(T, ['frontend']);
  writeFileSync(join(root, 'learning/cards.md'), read('learning/cards.md', root).replace(/\n*$/, '\n') +
    [1, 2, 3].map((j) => `| F${900 + k * 3 + j} | Frontend | Câu hỏi giả có độ dài cố định số ${String(k * 3 + j).padStart(3, '0')}? | [bài ${n}](frontend/lessons/${n}-fake.md) | 1 | 2030-01-01 |`).join('\n') + '\n');
};
for (let k = 0; k < 3; k++) lesson(T, k);
const before = learnRow(T), beforeFile = read('learning/frontend.md', T).length;
for (let k = 3; k < 13; k++) lesson(T, k);
const after = learnRow(T);
assert.equal(logRows(read('learning/frontend.md', T)).length, 3, 'file môn giữ 3 dòng nhật ký');
assert.equal(logRows(read('learning/frontend/log.md', T)).length, logRows(read('learning/frontend/log.md')).length + 13, 'dòng cũ nằm trong log.md');
assert.ok(Math.abs(read('learning/frontend.md', T).length - beforeFile) < 50, 'file môn không dài thêm');
assert.ok(after <= before + 50, `luồng "học" không tăng sau 10 buổi (trước ${before} byte, sau ${after} byte)`);
rmSync(T, { recursive: true, force: true });

console.log(`ok prepare-lesson (10 buổi giả: luồng "học" ${before} → ${after} byte)`);
