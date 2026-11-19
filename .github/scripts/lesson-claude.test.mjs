// Kiểm ba tính năng của đợt 5 trong trang học, bằng một Claude giả (khả năng sample có tools, sample.json, tts):
//   T1 "Xem Claude làm": chỉ mở khi tự làm xong bước; Claude vặn núm, xếp thẻ, dời sa bàn qua tools; "Trả lại cách của mình".
//   T3 "Thêm một tình huống": Claude soạn câu hỏi mới ở bước cuối (không có ở bài chiến tranh), kết quả vào R.extra.
//   N2 "Nghe": chỉ còn ở sa bàn bài chiến tranh, đọc đúng chữ đang thấy; bài thường không còn nút Nghe, mic (KH8) số lần.
// Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildFixtures } from '../../artifacts/kit/check-pages.mjs';
import { pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const fx = Object.fromEntries((await buildFixtures(mkdtempSync(join(tmpdir(), 'lesson-claude-')), browser)).map((f) => [f.name, f.file]));

async function openPage(file) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 } });
  await ctx.addInitScript(() => {
    window.__prompts = []; window.__spoken = [];
    // Claude giả: có tools thì gọi lần lượt các thao tác mà trang chuẩn bị sẵn trong window.__moves(tools), rồi trả lời.
    const sample = async (input, o = {}) => {
      window.__prompts.push(String(input));
      if (o.tools) for (const [name, args] of (window.__moves ? window.__moves(o.tools) : [])) await o.tools.find((t) => t.name === name).execute(args);
      return { text: 'Tóm lại: thử rồi mới xem.', truncated: false };
    };
    sample.json = async (input) => { window.__prompts.push(String(input)); return window.__json || null; };
    const tts = { speak: (t) => { window.__spoken.push(t); return new Promise((r) => setTimeout(r, 1500)); }, stop() {} };
    window.claude = { use: async (n) => (n === 'sample' ? sample : n === 'tts' ? tts : null) };
  });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(pathToFileURL(file).href);
  await p.waitForFunction(() => document.documentElement.classList.contains('kit-ask-on'));
  p.errors = errors;
  return { p, ctx };
}
const go = (p, n) => p.evaluate((s) => Lesson.go(s), n);
const finish = (p, keys) => p.evaluate((ks) => ks.forEach((k) => Lesson.done(k)), keys);

{ // Bàn thử (frontend): khóa trước khi làm xong, Claude vặn núm, không tính là người học đã thử, trả lại được.
  const { p, ctx } = await openPage(fx.frontend);
  await go(p, 3);
  const step = p.locator('.step[data-s="3"]'), open = step.getByRole('button', { name: 'Xem Claude làm' });
  assert.ok(await open.isDisabled(), 'chưa tự làm xong thì chưa xem Claude làm');
  assert.ok(await step.locator('.demo-hint').isVisible());
  await finish(p, ['d1']);
  assert.ok(await open.isEnabled());
  const before = await p.evaluate(() => getComputedStyle(document.querySelector('[data-pane="bank"] .phone:not(.mini) .screen')).getPropertyValue('--a').trim());
  await p.evaluate(() => { window.__moves = () => [['turn_knob', { knob: 'accent', value: '#15803d', why: 'Xanh lá hợp app tiền.' }], ['turn_knob', { knob: 'amount', value: 'it', why: 'Ít màu thì nút chính nổi.' }]]; });
  await open.click();
  await step.getByRole('button', { name: 'Xem Claude làm lại' }).waitFor();
  assert.match(await step.locator('.demo-log').textContent(), /Màu nhấn → Xanh lá\.\s*Xanh lá hợp app tiền\./);
  const scr = '[data-pane="bank"] .phone:not(.mini) .screen';
  assert.equal(await p.evaluate((s) => document.querySelector(s).style.getPropertyValue('--a'), scr), '#15803d');
  const prompt = await p.evaluate(() => window.__prompts.at(-1));
  assert.match(prompt, /Người học đã tự làm xong bước này/);
  assert.match(prompt, /accent \(Màu nhấn\): #2563eb = Xanh dương/);
  const R = await p.evaluate(() => window.R);
  assert.ok(!(R.tried['bank.accent'] || []).includes('Xanh lá'), 'thao tác của Claude không tính là người học đã thử');
  assert.equal(R.ai.at(-1).kind, 'demo'); assert.equal(R.ai.at(-1).moves, 2);
  await step.getByRole('button', { name: 'Trả lại cách của mình' }).click();
  assert.equal(await p.evaluate((s) => document.querySelector(s).style.getPropertyValue('--a'), scr) || before, before || '#2563eb');
  assert.ok(await step.getByRole('button', { name: 'Trả lại cách của mình' }).isHidden());
  // Bản làm mẫu còn hiện mà người học bấm một núm: sân khấu về cách của người học trước, rồi mới nhận lần bấm đó.
  // Núm người học chưa chọn cũng về đúng "chưa chọn"; điểm giống tốt nhất không lấy từ giá trị của Claude.
  const snap = () => p.evaluate((s) => ({ a: document.querySelector(s).style.getPropertyValue('--a'), amount: document.querySelector(s).dataset.amount,
    knobs: { ...R.knobs }, best: (R.match.bank || {}).best, pressed: [...document.querySelectorAll('[data-pane="bank"] [data-knob] button[aria-pressed="true"]')].map((x) => x.dataset.val) }), scr);
  const mine = await snap();
  await p.evaluate(() => { window.__moves = () => [['turn_knob', { knob: 'accent', value: '#15803d', why: 'a' }], ['turn_knob', { knob: 'amount', value: 'it', why: 'b' }]]; });
  await step.getByRole('button', { name: 'Xem Claude làm lại' }).click();
  await step.getByRole('button', { name: 'Trả lại cách của mình' }).waitFor();
  assert.equal(await p.evaluate((s) => document.querySelector(s).style.getPropertyValue('--a'), scr), '#15803d');
  await step.getByRole('button', { name: 'Trả lại cách của mình' }).click();
  assert.deepEqual(await snap(), mine, 'trả lại đúng như trước lượt làm mẫu, kể cả núm chưa chọn');
  await step.getByRole('button', { name: 'Xem Claude làm lại' }).click();
  await step.getByRole('button', { name: 'Trả lại cách của mình' }).waitFor();
  const other = await p.evaluate(() => [...document.querySelectorAll('[data-pane="bank"] [data-knob="accent"] button[data-val]')].map((x) => x.dataset.val).find((v) => v !== '#15803d'));
  await p.locator(`[data-pane="bank"] [data-knob="accent"] button[data-val="${other}"]`).click();
  const after = await snap();
  assert.equal(after.a, other, 'lần bấm của người học vẫn có tác dụng');
  assert.equal(after.amount, mine.amount, 'núm Claude vặn mà người học không bấm về như cũ');
  assert.equal(after.knobs['bank.amount'], mine.knobs['bank.amount']);
  assert.ok(await step.getByRole('button', { name: 'Trả lại cách của mình' }).isHidden());
  // Người học bấm núm khi Claude đang làm dở: lượt làm mẫu dừng, sân khấu về cách của người học, thao tác còn lại không chạy.
  const base = await snap();
  await p.evaluate(() => { window.__moves = () => [['turn_knob', { knob: 'amount', value: 'it', why: 'a' }], ['turn_knob', { knob: 'accent', value: '#15803d', why: 'b' }]]; });
  await step.getByRole('button', { name: 'Xem Claude làm lại' }).click();
  await step.locator('.demo-log li').first().waitFor();
  const back = await p.evaluate(() => [...document.querySelectorAll('[data-pane="bank"] [data-knob="accent"] button[data-val]')].map((x) => x.dataset.val).find((v) => v !== '#15803d' && v !== document.querySelector('[data-pane="bank"] .phone:not(.mini) .screen').style.getPropertyValue('--a')));
  await p.locator(`[data-pane="bank"] [data-knob="accent"] button[data-val="${back}"]`).click();
  await p.waitForFunction(() => !document.querySelector('.step[data-s="3"] .demo-open').disabled);   // lượt dở đã kết thúc
  const stopped = await snap();
  assert.equal(stopped.a, back, 'thao tác thứ hai của Claude không chạy sau lần bấm của người học');
  assert.equal(stopped.amount, base.amount, 'thao tác đầu của Claude đã được trả lại');
  assert.equal(await step.locator('.demo-log li').count(), 1);
  assert.ok(await step.getByRole('button', { name: 'Trả lại cách của mình' }).isHidden());
  // Tool nhận giá trị sai thì báo lỗi rõ cho Claude, không vỡ trang.
  const err = await p.evaluate(async () => { try { window.__moves = null; let msg = ''; await new Promise((r) => { window.__moves = (tools) => { tools[0].execute({ knob: 'accent', value: 'tím-than' }).catch((e) => { msg = e.message; r(); }); return []; }; document.querySelector('.step[data-s="3"] .demo-open').click(); }); return msg; } catch (e) { return 'x' + e.message; } });
  assert.match(err, /không có giá trị tím-than\. Các giá trị: #2563eb/);
  assert.deepEqual(p.errors, []);
  await ctx.close();
}

{ // Bảng dán (BA): Claude xếp thẻ theo bản mẫu từ khay trống, dấu kiểm ẩn đi, trả lại thì về cách mình xếp.
  const { p, ctx } = await openPage(fx.ba);
  await go(p, 3);
  const step = p.locator('.step[data-s="3"]');
  await finish(p, ['checked-who']);
  await p.evaluate(() => { window.__moves = () => [['place_card', { card: 'gv', zone: 'z2', why: 'Giảng viên bỏ app được.' }], ['place_card', { card: 'bgh', zone: 'z1', why: 'Ký cuối cùng.' }]]; });
  await step.getByRole('button', { name: 'Xem Claude làm' }).click();
  await step.getByRole('button', { name: 'Xem Claude làm lại' }).waitFor();
  assert.ok(await p.locator('[data-pane="who"]').evaluate((e) => e.classList.contains('demo')));
  assert.match(await step.locator('.demo-log').textContent(), /Giảng viên → Bàn kỹ với họ\./);
  assert.match(await p.evaluate(() => window.__prompts.at(-1)), /Bản mẫu \(cách xếp đúng của bài[^\n]*gv → z2/);
  await step.getByRole('button', { name: 'Trả lại cách của mình' }).click();
  assert.ok(!(await p.locator('[data-pane="who"]').evaluate((e) => e.classList.contains('demo'))));
  assert.equal(await p.evaluate(() => Stage.boards.who.demo), null);
  // Claude không làm thao tác nào: bảng ra khỏi chế độ làm mẫu ngay, thẻ về chỗ người học đã xếp.
  await p.evaluate(() => { window.__moves = () => []; });
  await step.getByRole('button', { name: 'Xem Claude làm lại' }).click();
  await p.waitForFunction(() => !document.querySelector('.step[data-s="3"] .demo-open').disabled);
  assert.ok(!(await p.locator('[data-pane="who"]').evaluate((e) => e.classList.contains('demo'))), 'không thao tác nào thì không kẹt ở chế độ làm mẫu');
  assert.equal(await p.evaluate(() => Stage.boards.who.demo), null);
  assert.ok(await step.getByRole('button', { name: 'Trả lại cách của mình' }).isHidden());
  // Bước chỉ nghe (who@listen) không có làm mẫu.
  assert.equal(await p.locator('.step[data-s="0"] .demo').count(), 0);
  assert.deepEqual(p.errors, []);
  await ctx.close();
}

{ // Sa bàn (chiến tranh): Claude dẫn qua các mốc; bước khóa ở một mốc thì không có; không có tình huống thêm; có nút nghe mốc.
  const { p, ctx } = await openPage(fx.war);
  assert.equal(await p.locator('.step[data-s="0"] .demo').count(), 0, 'bước real@0 không có làm mẫu');
  await go(p, 3);
  const step = p.locator('.step[data-s="3"]');
  await finish(p, ['seen-real', 'notice']);
  await p.evaluate(() => { window.__moves = () => [['show_moment', { track: 'real', index: 1, why: 'Nhìn chỗ pháo đặt.' }]]; });
  await step.getByRole('button', { name: 'Xem Claude làm' }).click();
  await step.getByRole('button', { name: 'Xem Claude làm lại' }).waitFor();
  assert.equal(await p.evaluate(() => Board.at), 1);
  assert.match(await p.evaluate(() => window.__prompts.at(-1)), /không thêm chi tiết lịch sử nào khác/);
  await step.getByRole('button', { name: 'Trả lại cách của mình' }).click();
  assert.equal(await p.evaluate(() => Board.at), 0);
  assert.equal(await p.locator('.extra').count(), 0, 'bài chiến tranh không có tình huống thêm');
  const listen = step.getByRole('button', { name: 'Nghe mốc đang xem' });
  await listen.click();
  assert.match(await p.evaluate(() => window.__spoken.at(-1)), /Nguồn:/);
  assert.deepEqual(p.errors, []);
  await ctx.close();
}

{ // Bài thường: không còn nút Nghe hay mic (KH8 câu 7, 2026-11-19); tình huống thêm ở bước cuối.
  const { p, ctx } = await openPage(fx.lesson);
  assert.equal(await p.locator('.step .listen').count(), 0, 'bài học thường không có nút Nghe');
  assert.equal(await p.locator('.mic-row, button[aria-label="Nói thay gõ"]').count(), 0, 'ô tự nói lại không có mic');

  const fin = p.locator('.step', { has: p.locator('#finish') });
  await go(p, await fin.getAttribute('data-s'));
  await p.evaluate(() => { window.__json = { situation: 'App đặt xe có ba nút xanh cạnh nhau.', question: 'Nên sửa thế nào?', options: ['Giữ nguyên', 'Đổi cả ba sang đỏ', 'Để một nút đặc, hai nút viền'], answer: 2, why: 'Một chỗ đặc cho việc chính.' }; });
  await fin.getByRole('button', { name: 'Cho mình một tình huống' }).click();
  await fin.locator('.extra-q .opt').first().click();
  assert.match(await fin.locator('.extra-q .status').textContent(), /Chưa đúng/);
  assert.ok(await fin.locator('.extra-q .opt.right').textContent(), 'Để một nút đặc, hai nút viền');
  const R = await p.evaluate(() => window.R);
  assert.deepEqual(R.extra.map((x) => [x.pick, x.answer, x.ok]), [[0, 2, false]]);
  assert.match(await p.evaluate(() => window.__prompts.at(-1)), /Trả về JSON đúng dạng/);
  const sum = await p.evaluate(() => Lesson.summary(""));
  assert.match(sum, /Tình huống thêm: đúng 0\/1/);
  assert.doesNotMatch(sum, /Nghe đọc to/, "bài thường không còn đếm lần nghe");
  // JSON sai dạng thì nói rõ, không vỡ trang.
  await p.evaluate(() => { window.__json = { situation: 'x' }; });
  await fin.getByRole('button', { name: 'Tình huống khác' }).click();
  assert.match(await fin.locator('.extra > .ai-out').textContent(), /chưa đúng dạng/);
  assert.deepEqual(p.errors, []);
  await ctx.close();
}

await browser.close();
console.log('ok lesson-claude');
