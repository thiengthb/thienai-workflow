// The weekly learning dashboard's data (artifacts/lesson/learning-week.mjs) reads the real learning files.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weekOf, table, sessions, cards, stuck, asks, build } from '../../artifacts/lesson/learning-week.mjs';

assert.equal(weekOf('2026-11-14'), '2026-11-09', 'Saturday belongs to the week starting Monday');
assert.equal(weekOf('2026-11-09'), '2026-11-09');
assert.equal(weekOf('2026-11-15'), '2026-11-09', 'Sunday ends the week');

const md = ['# x', '', '## Nhật ký', '| Buổi | Ngày | Ý chính | Kết quả |', '|---|---|---|---|',
  '| 1 | 2026-11-07 | [Một](a.md) điểm nhấn | 12 phút, đúng 4/4 |', '| 2 | <ngày> | x | y |', '',
  '## Chỗ còn vướng', 'Ghi chú.', '', '- 2026-11-11, buổi 3: hỏi Claude ở bước “Tự chỉnh”: “vì sao 24?”', '- 2026-11-12, buổi 5: câu “Q” chọn “A”, đúng là “B”', '- dòng cũ không có ngày', '', '## Buổi tiếp theo'].join('\n');
assert.equal(table(md, 'Nhật ký').length, 2);
const s = sessions({ frontend: md });
assert.deepEqual(s, [{ subject: 'Frontend', session: 1, date: '2026-11-07', week: '2026-11-02', minutes: 12, idea: 'Một điểm nhấn' }], 'rows without a real date are skipped, links become text');
const st = stuck({ frontend: md });
assert.deepEqual(st.map((r) => [r.id, r.kind, r.session]), [['frontend-1', 'Hỏi Claude', 3], ['frontend-2', 'Chọn sai', 5], ['frontend-3', 'Làm còn sai', null]]);

const c = cards(readFileSync('learning/cards.md', 'utf8'));
assert.ok(c.length > 0 && c.every((r) => r.card && r.subject && /^\d{4}-\d{2}-\d{2}$/.test(r.due) && r.box > 0), 'every card has a subject, a box and a due date');
assert.deepEqual(asks('| Ngày | Trang | Phút | Hỏi Claude |\n|---|---|---|---|\n| 2026-11-15 | ba-03 lúc 19:00 | 12 | 2 |\n| 2026-11-15 | ôn thẻ | 3 | - |'),
  [{ date: '2026-11-15', week: '2026-11-09', page: 'ba-03 lúc 19:00', subject: 'BA', asks: 2 }, { date: '2026-11-15', week: '2026-11-09', page: 'ôn thẻ', subject: 'Ôn thẻ', asks: null }]);

const all = build(process.cwd(), new Date('2026-11-14T00:00:00Z'));
assert.deepEqual(Object.keys(all), ['sessions.json', 'cards.json', 'stuck.json', 'asks.json']);
for (const [name, f] of Object.entries(all)) {
  assert.ok(Array.isArray(f.rows), name);
  assert.equal(f.meta[0].type, 'code', `${name} carries the code that made it`);
  assert.ok(JSON.stringify(f).length < 200000, `${name} stays small`);
}
assert.ok(all['sessions.json'].rows.some((r) => r.subject === 'BA') && all['sessions.json'].rows.some((r) => r.subject === 'Chiến tranh'), 'all three subjects are read');
// The page's calculations name the datasets the script writes.
const page = readFileSync('artifacts/lesson/learning-week.html', 'utf8');
for (const id of ['sessions', 'cards', 'stuck', 'asks']) assert.match(page, new RegExp(`inputs: \\['${id}'\\]`), `page reads ${id}`);
console.log('ok learning-week');
