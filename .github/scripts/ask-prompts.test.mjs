// Kiểm lời dặn mà trang gửi cho Claude (khả năng sample), bằng một Claude giả ghi lại từng lời dặn.
// Cần trình duyệt: CI chạy file này trong job "pages" (.github/workflows/test.yml).
//
//   node .github/scripts/ask-prompts.test.mjs            kiểm
//   node .github/scripts/ask-prompts.test.mjs --update   ghi lại các file mẫu trong .github/prompts/ sau khi cố ý sửa lời dặn
//
// Hai lớp kiểm:
//   1. Luật cứng: chưa làm xong bước thì lời dặn phải cấm nói đáp án; trang chọn phương án chưa chọn thì không được lộ đề xuất.
//   2. File mẫu: mỗi lời dặn lưu thành một file .txt. Sửa lời dặn (hay sửa chữ trong mẫu trang) thì PR hiện rõ chỗ đổi.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildFixtures } from '../../artifacts/kit/check-pages.mjs';

const UPDATE = process.argv.includes('--update');
const SNAP = new URL('../prompts/', import.meta.url).pathname;
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const pages = Object.fromEntries((await buildFixtures(mkdtempSync(join(tmpdir(), 'ask-')), browser)).map((f) => [f.name, f.file]));
const prompts = {};
let changed = 0;

async function open(file) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 } });
  await ctx.addInitScript(() => {
    window.__prompts = [];
    const sample = async (input) => { window.__prompts.push(String(input)); return { text: 'Trả lời thử.', truncated: false }; };
    window.claude = { use: async (n) => (n === 'sample' ? sample : null) };
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('file://' + file);
  await p.waitForFunction(() => document.documentElement.classList.contains('kit-ask-on'));
  await p.addStyleTag({ content: '.step{display:block!important;opacity:1!important;transform:none!important}' });
  /** Làm một việc rồi chờ đúng một lời dặn mới gửi đi. */
  p.ask = async (name, act) => {
    const n = await p.evaluate(() => window.__prompts.length);
    await act();
    await p.waitForFunction((k) => window.__prompts.length > k, n);
    prompts[name] = await p.evaluate((k) => window.__prompts[k], n);
  };
  p.errors = errors;
  return { p, ctx };
}

{ // Bài học thường: hỏi về bước còn câu chưa trả lời, chọn sai rồi hỏi vì sao, nhận xét bài tự nói lại.
  const { p, ctx } = await open(pages.lesson);
  const step = p.locator('.step', { has: p.locator('.q[data-q="q1"]') });
  await p.ask('lesson-step-ask', async () => {
    await step.getByRole('button', { name: 'Hỏi Claude về bước này' }).click();
    await step.locator('.ai-form input').fill('Đáp án câu này là gì?');
    await step.locator('.ai-form button[type=submit]').click();
  });
  const q = p.locator('.q[data-q="q1"]');
  await q.locator('.opt').nth(1).click();
  await p.ask('lesson-why-wrong', () => q.getByRole('button', { name: 'Vì sao mình chọn sai?' }).click());
  await p.locator('textarea[data-key="teach"]').fill('Mỗi màn chỉ nên có một chỗ dùng màu nhấn, phần phụ để nhạt.');
  await p.ask('lesson-teach-back', () => p.getByRole('button', { name: 'Claude nhận xét bài của mình' }).click());
  assert.deepEqual(p.errors, []);
  await ctx.close();
}
{ // Bài frontend (sân khấu): hỏi ở bước chưa làm xong.
  const { p, ctx } = await open(pages.frontend);
  const step = p.locator('.step[data-s="5"]');
  await p.ask('frontend-stage-ask', async () => {
    await step.getByRole('button', { name: 'Hỏi Claude về bước này' }).click();
    await step.locator('.ai-form input').fill('Nút đặt hàng ở đâu?');
    await step.locator('.ai-form button[type=submit]').click();
  });
  assert.deepEqual(p.errors, []);
  await ctx.close();
}
{ // Trang chọn phương án: hỏi trước khi chọn, rồi chọn A và hỏi lại.
  const { p, ctx } = await open(pages.decide);
  const ask = async (name, text) => p.ask(name, async () => { await p.fill('#ai-q', text); await p.click('#ai-send'); });
  await ask('decide-before-pick', 'Nên chọn cái nào?');
  await p.getByRole('button', { name: 'Chọn A' }).first().click();
  await ask('decide-after-pick', 'Vì sao A hợp với điện thoại?');
  assert.deepEqual(p.errors, []);
  await ctx.close();
}
{ // Trang ôn thẻ: Claude chấm câu trả lời, chỉ dựa trên đáp án và bài.
  const { p, ctx } = await open(pages.review);
  await p.fill('#mine', 'Mắt không biết chọn nút nào');
  await p.click('#show');
  await p.ask('review-grade', () => p.click('#grade'));
  assert.deepEqual(p.errors, []);
  await ctx.close();
}
await browser.close();

// 1. Luật cứng
const P = prompts;
assert.match(P['lesson-step-ask'], /CHƯA trả lời[\s\S]*đừng nói đáp án/, 'câu chưa trả lời: cấm nói đáp án');
assert.match(P['lesson-step-ask'], /CHƯA làm xong bước này[\s\S]*Đừng làm hộ/, 'bước chưa xong: cấm làm hộ');
assert.match(P['lesson-why-wrong'], /Người học chọn: \(2\)/);
assert.match(P['lesson-step-ask'], /còn vướng ở các buổi trước[\s\S]*chữ màu và biểu tượng nhỏ[\s\S]*đừng giảng lại/, 'hỏi về bước: kèm chỗ còn vướng');
assert.match(P['lesson-teach-back'], /còn vướng ở các buổi trước/, 'nhận xét bài tự nói lại: kèm chỗ còn vướng');
assert.doesNotMatch(P['frontend-stage-ask'], /còn vướng/, 'bài không có chỗ còn vướng thì không thêm dòng trống');
assert.match(P['lesson-why-wrong'], /Đáp án đúng: \(1\)/);
assert.match(P['lesson-teach-back'], /Mỗi màn chỉ nên có một chỗ dùng màu nhấn/, 'gửi đúng bài người học viết');
assert.match(P['lesson-teach-back'], /không kèm đáp án/);
assert.match(P['frontend-stage-ask'], /CHƯA làm xong bước này/);
assert.match(P['decide-before-pick'], /CHƯA chọn\. Đừng nói nên chọn/);
assert.doesNotMatch(P['decide-before-pick'], /Gọn nhất|đề xuất a/i, 'chưa chọn thì không lộ đề xuất');
assert.match(P['decide-after-pick'], /đã chọn a\. Lúc soạn trang, Claude đề xuất a: Gọn nhất/);
assert.match(P['review-grade'], /Người học tự trả lời trước khi xem đáp án: "Mắt không biết chọn nút nào"/);
assert.match(P['review-grade'], /Đáp án mẫu: Mắt không biết bấm nút nào/);
assert.match(P['review-grade'], /không thêm chi tiết, số liệu, tên hay sự kiện mới/, 'chấm chỉ dựa trên bài (luật nguồn của TUTOR)');
for (const [k, v] of Object.entries(P)) {
  if (!k.startsWith('decide')) assert.match(v, /không Markdown/, `${k}: dặn viết chữ thường`);
  assert.ok(v.length < 6000, `${k}: lời dặn dài ${v.length} ký tự`);
}

// 2. File mẫu
mkdirSync(SNAP, { recursive: true });
for (const [k, v] of Object.entries(P)) {
  const f = join(SNAP, `${k}.txt`);
  if (UPDATE) { writeFileSync(f, v + '\n'); continue; }
  if (!existsSync(f)) {
    changed++;
    console.error(`Thiếu file mẫu ${f} cho lời dặn "${k}". Chạy lại với --update rồi commit file mẫu.`);
    continue;
  }
  if (readFileSync(f, 'utf8') !== v + '\n') {
    changed++;
    console.error(`Lời dặn "${k}" khác file mẫu ${f}. Nếu cố ý sửa: chạy lại với --update rồi commit file mẫu.`);
  }
}
if (changed) process.exit(1);
console.log(`ask-prompts: ${Object.keys(P).length} lời dặn ổn${UPDATE ? ' (đã ghi lại file mẫu)' : ''}`);
