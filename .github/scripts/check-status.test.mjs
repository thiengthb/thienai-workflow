// Tests for templates/check-status.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkStatus, checkPlan, checkFresh, missingPrs, overdueCards, planCode, duplicateCodes } from '../../templates/check-status.mjs';

const template = readFileSync(new URL('../../templates/STATUS.template.md', import.meta.url), 'utf8');
assert.deepEqual(checkStatus(template), [], 'template itself must pass');

const tooLong = Array.from({ length: 41 }, (_, i) => `line ${i}`).join('\n');
assert.equal(checkStatus(tooLong).length, 1, '41 lines must fail');

const waiting = (n) => `# Tiến độ\n\n## Đang chờ thien\n${Array.from({ length: n }, (_, i) => `- việc ${i}\n  chi tiết`).join('\n')}\n\n## Đang vướng\n- a\n- b\n`;
assert.deepEqual(checkStatus(waiting(3)), [], '3 waiting items pass; sub-lines and other sections not counted');
assert.equal(checkStatus(waiting(4)).length, 1, '4 waiting items must fail');

const plan = readFileSync(new URL('../../templates/PLAN.template.md', import.meta.url), 'utf8').replace('KH<số>', 'KH1');
assert.deepEqual(checkPlan(plan.replace('<ngày>', '2026-01-01')), [], 'plan template must pass');
assert.deepEqual(checkPlan('# Kế hoạch cũ\n\n## Tóm tắt\n'), [], 'plans written before the template are skipped');
assert.equal(checkPlan(plan.replace('## Lỗi gặp', '## Lỗi')).length, 1, 'missing section must fail');
for (const st of ['đang chạy', 'chờ duyệt', 'tạm dừng', 'xong', 'bỏ']) {
  assert.deepEqual(checkPlan(plan.replace(/^Trạng thái: đang chạy/m, `Trạng thái: ${st}`)), [], `status "${st}" must pass`);
  assert.deepEqual(checkPlan(plan.replace(/^Trạng thái: đang chạy.*$/m, `Trạng thái: ${st}`)), [], `status "${st}" at end of line must pass`);
}
assert.equal(checkPlan(plan.replace(/^Trạng thái: đang chạy/m, 'Trạng thái: xongxuôi')).length, 1, 'unknown status must fail');
// Plan codes (profile/PLANNING.md): a plan not done or dropped needs "# KH<n> · " in its title; codes never repeat.
assert.equal(planCode(plan), 1);
const noCode = plan.replace(/^# KH1 · /m, '# ');
assert.equal(checkPlan(noCode).length, 1, 'running plan without a code must fail');
for (const st of ['xong', 'bỏ']) assert.deepEqual(checkPlan(noCode.replace(/^Trạng thái: đang chạy/m, `Trạng thái: ${st}`)), [], `"${st}" plan without a code passes (older plans)`);
assert.equal(planCode('# KH12 thiếu chấm\n'), null, 'code needs " · " after the number');
assert.equal(planCode('# Chưa có mã\n\n```\n# KH7 · Ví dụ\n```\n'), null, 'a code further down (code block) is not the title');
assert.equal(checkPlan('# Kế hoạch cũ\n\nTrạng thái: đang chạy\n\n## Tóm tắt\n').length, 1, 'unfinished plan without template sections still needs a code');
assert.deepEqual(checkPlan('# KH9 · Cũ\n\nTrạng thái: đang chạy\n\n## Tóm tắt\n'), [], 'unfinished pre-template plan with a code passes');
assert.deepEqual(duplicateCodes([['a.md', '# KH1 · A'], ['b.md', '# KH2 · B'], ['c.md', '# Cũ']]), [], 'distinct codes pass');
assert.equal(duplicateCodes([['a.md', '# KH3 · A'], ['b.md', '# KH3 · B']]).length, 1, 'same code twice must fail');
const own = readFileSync(new URL('../../docs/plans/2026-11-12-progress-tracking.md', import.meta.url), 'utf8');
assert.deepEqual(checkPlan(own), [], "this repo's own plan must pass");

// --git: STATUS older than the newest commit by more than 3 days fails
const st = 'Cập nhật lần cuối: 2026-11-10 · Claude';
assert.deepEqual(checkFresh(st, '2026-11-13'), [], '3 days behind passes');
assert.equal(checkFresh(st, '2026-11-14').length, 1, '4 days behind fails');
assert.equal(checkFresh('no date', '2026-11-14').length, 1, 'missing date line fails');
// --prs: open PRs never mentioned are reminders; the PR being checked is left out; #4 must not match #44
const prs = [{ number: 44, title: 'War 4' }, { number: 4, title: 'Old' }, { number: 56, title: 'This one' }];
assert.deepEqual(missingPrs('Việc dở: PR #44', prs, 56), ['PR #4 (Old) đang mở mà STATUS không nhắc.']);
// --cards: rows of a cards table overdue by more than 3 days
const cards = '| Thẻ | Môn | Câu hỏi | Đáp án ở | Hộp | Hỏi lại |\n|---|---|---|---|---|---|\n| F1 | Frontend | a | b | 1 | 2026-11-10 |\n| F2 | Frontend | a | b | 1 | 2026-11-11 |\n';
assert.match(overdueCards(cards, '2026-11-14')[0], /^1 thẻ ôn quá hạn .*\(F1\)/);
assert.deepEqual(overdueCards(cards, '2026-11-13'), []);
const real = readFileSync(new URL('../../learning/cards.md', import.meta.url), 'utf8');
assert.ok(Array.isArray(overdueCards(real, '2026-11-14')), 'reads the real cards table');

console.log('ok check-status');
