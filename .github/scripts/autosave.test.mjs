// Kiểm phần tự lưu (artifacts/kit/autosave.js) trong trình duyệt: học dở, tải lại, rồi mở bản trang đã sửa (thêm nút),
// và mở bản lưu kiểu cũ (theo thứ tự nút). Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildFixtures } from '../../artifacts/kit/check-pages.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const dir = mkdtempSync(join(tmpdir(), 'autosave-'));
const fx = Object.fromEntries((await buildFixtures(dir, browser)).map((f) => [f.name, f.file]));

/** Mở trang trong một ngữ cảnh mới, nạp sẵn bản lưu (nếu có) vào máy. */
async function open(file, saved) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 } });
  if (saved) await ctx.addInitScript(([k, v]) => { localStorage.setItem(k, v); }, saved);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('file://' + file);
  await p.waitForTimeout(300);
  p.errors = errors;
  return { p, ctx };
}
/** Học thử vài bước: trả lời mọi câu (lựa chọn đầu), vặn mọi núm (giá trị thứ hai rồi thứ ba), gõ vào ô, rồi bấm Tiếp. */
async function study(p, steps) {
  // Bấm thật bằng chuột (sự kiện isTrusted), vì phần tự lưu chỉ ghi lần bấm của người.
  for (let i = 0; i < steps; i++) {
    for (const q of await p.locator('.step.on .q').all()) {
      if (await q.locator('.opt.picked, .opt.right, .opt.wrong').count()) continue;
      const o = q.locator('.opt:not([disabled])').first();
      if (await o.count() && await o.isVisible()) await o.click();
    }
    for (const k of await p.locator('.pane:not([hidden]) .knob:visible, .step.on .knob:visible').all()) {
      const v = k.locator('button[data-val]');
      for (const j of [1, 2]) if (await v.count() > j && await v.nth(j).isVisible() && await v.nth(j).isEnabled()) await v.nth(j).click();
    }
    for (const t of await p.locator('.step.on textarea').all()) if (await t.isVisible()) await t.fill('Bài tự viết ở bước ' + i);
    const next = p.locator('.step.on .next:not([disabled])');
    if (!(await next.count())) break;
    await next.first().click();
  }
}
/** Chỗ đang học: bước đang mở, kết quả R (bỏ giờ), chữ trong các ô. */
const where = (p) => p.evaluate(() => {
  const R = JSON.parse(JSON.stringify(window.R || {})); delete R.start; delete R.end; delete R.ai;
  return { step: document.querySelector('.step.on')?.dataset.s, R, texts: [...document.querySelectorAll('textarea')].map((t) => t.value) };
});
const savedOf = (p) => p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.startsWith('lesson-kit:')); return [k, localStorage.getItem(k)]; });

for (const name of ['lesson', 'frontend']) {
  // 1. Học dở rồi tải lại: về đúng chỗ.
  const a = await open(fx[name]);
  await study(a.p, 4);
  await a.p.waitForTimeout(900);   // chờ lần lưu (700ms)
  const before = await where(a.p), saved = await savedOf(a.p);
  assert.ok(Number(before.step) >= 2, `${name}: đi được vài bước (đang ở ${before.step})`);
  const S = JSON.parse(saved[1]);
  assert.equal(S.v, 2);
  assert.ok(S.log.length > 3 && S.log.every((x) => typeof x.k === 'string' || typeof x.t === 'string'), `${name}: bản lưu ghi theo tên, không theo thứ tự`);
  assert.deepEqual(a.p.errors, []);
  await a.ctx.close();

  const b = await open(fx[name], saved);
  assert.deepEqual(await where(b.p), before, `${name}: tải lại về đúng chỗ`);
  assert.match(await b.p.locator('#kit-bar').textContent(), /Đã mở lại đúng chỗ/);
  await b.ctx.close();

  // 2. AI đăng bản sửa có thêm nút ở đầu trang và giữa trang: vẫn về đúng chỗ (bản cũ chỉ giữ được chữ).
  const html = readFileSync(fx[name], 'utf8');
  const edited = join(dir, name + '-edited.html');
  writeFileSync(edited, html
    .replace(/(<section class="step[^"]*" data-s="\d+"[^>]*>)/, '$1<button class="btn" type="button">Nút mới ở đầu</button>')
    .replace(/(<section class="step" data-s="3"[^>]*>)/, '$1<button class="btn" type="button" data-extra="1">Nút mới giữa trang</button>'));
  const c = await open(edited, saved);
  assert.deepEqual(await where(c.p), before, `${name}: trang thêm nút vẫn về đúng chỗ`);
  await c.ctx.close();

  // 3. Bản sửa bỏ mất một nút đã bấm: các lần bấm khác vẫn mở lại, và nói rõ.
  const keys = S.log.filter((x) => x.k).map((x) => x.k);
  const firstNext = keys.find((k) => k.includes('[data-go='));
  assert.ok(firstNext, `${name}: có lần bấm Tiếp trong bản lưu`);
  const d = await open(fx[name], [saved[0], JSON.stringify({ ...S, log: [...S.log, { k: 'không-còn-nút-này' }] })]);
  assert.deepEqual(await where(d.p), before, `${name}: lần bấm vào nút đã mất bị bỏ qua`);
  assert.match(await d.p.locator('#kit-bar').textContent(), /mở lại được \d+\/\d+ thao tác/);
  await d.ctx.close();
}

// 4. Bản lưu kiểu cũ (theo thứ tự nút, có dấu vân tay số nút): vẫn mở được, rồi chuyển sang cách lưu mới.
{
  const a = await open(fx.lesson);
  const old = await a.p.evaluate(() => {
    const btns = [...document.querySelectorAll('button:not(#kit-bar button):not([data-noreplay])')];
    const ta = document.querySelectorAll('textarea').length;
    const i = btns.findIndex((b) => b.matches('.step.on .next'));
    return { fp: btns.length + 'b' + ta + 't', log: [{ c: i }], ts: 1, start: '2026-11-13T12:00:00Z' };
  });
  const before = await where(a.p);
  await a.ctx.close();
  const b = await open(fx.lesson, ['lesson-kit:demo-lesson', JSON.stringify(old)]);
  const after = await where(b.p);
  assert.notEqual(after.step, before.step, 'bản cũ: bấm lại được nút Tiếp');
  await b.p.waitForTimeout(900);
  const S = JSON.parse((await savedOf(b.p))[1]);
  assert.equal(S.v, 2, 'bản cũ được chuyển sang cách lưu mới');
  assert.ok(S.log[0].k.includes('[data-go='));
  await b.ctx.close();
}

await browser.close();
console.log('ok autosave');
