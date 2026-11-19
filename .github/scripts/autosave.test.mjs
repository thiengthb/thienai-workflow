// Kiểm phần tự lưu (artifacts/kit/autosave.js) trong trình duyệt: học dở, tải lại, rồi mở bản trang đã sửa (thêm nút),
// và mở bản lưu kiểu cũ (theo thứ tự nút). Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildFixtures } from '../../artifacts/kit/check-pages.mjs';
import { pathToFileURL } from 'node:url';

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
  await p.goto(pathToFileURL(file).href);
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

// 5. Thanh kéo, chữ nói thay gõ (Kit.dictate) và lưu vào máy ngay (PR #59).
{
  const js = readFileSync(new URL('../../artifacts/kit/autosave.js', import.meta.url), 'utf8');
  const page = join(dir, 'controls.html');
  writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><meta name="lesson-id" content="demo-controls"></head><body>
<input type="range" id="speed" min="0" max="10" value="2"><output id="out">2</output>
<input type="range" min="0" max="10" value="5" aria-label="không tên">
<textarea placeholder="Ghi chú"></textarea>
<script>for (const g of document.querySelectorAll('input[type=range]')) g.addEventListener('input', () => { if (g.id) out.textContent = g.value; });</script>
<script id="lesson-kit">\n${js}</script></body></html>`);
  const key = 'lesson-kit:demo-controls';
  const state = (p) => p.evaluate(() => ({ speed: speed.value, other: document.querySelectorAll('input[type=range]')[1].value, out: out.textContent, note: document.querySelector('textarea').value }));

  const a = await open(page);
  await a.p.locator('#speed').focus();
  for (let i = 0; i < 3; i++) await a.p.keyboard.press('ArrowRight');          // kéo thật: 2 -> 5
  await a.p.locator('input[aria-label="không tên"]').focus();
  await a.p.keyboard.press('ArrowLeft');                                          // 5 -> 4
  await a.p.evaluate(() => {                                                      // chữ nói thay gõ: sự kiện không phải người bấm, có detail.kitDictation
    const t = document.querySelector('textarea'); t.value = 'nói vào mic';
    t.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { kitDictation: true } }));
  });
  const now = await a.p.evaluate((k) => localStorage.getItem(k), key);           // không chờ 700 ms
  assert.ok(now, 'lưu vào máy ngay, không đợi hết thời gian chờ');
  const S = JSON.parse(now);
  assert.deepEqual(S.log, [{ r: '#speed', v: '5' }, { r: 'i:1', v: '4' }, { t: 'p:Ghi chú', v: 'nói vào mic' }], 'kéo liền một mạch chỉ giữ giá trị cuối; thanh có id gọi theo id');
  await a.p.evaluate(() => {                                                      // sự kiện giả không có dấu đọc chữ: không ghi
    const t = document.querySelector('textarea'); t.value = 'script tự đổi'; t.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(JSON.parse(await a.p.evaluate((k) => localStorage.getItem(k), key)).log[2].v, 'nói vào mic', 'sự kiện giả bị bỏ qua');
  assert.deepEqual(a.p.errors, []);
  await a.ctx.close();

  const b = await open(page, [key, now]);
  assert.deepEqual(await state(b.p), { speed: '5', other: '4', out: '5', note: 'nói vào mic' }, 'tải lại: thanh kéo và chữ về đúng giá trị, trang nhận sự kiện input');
  await b.ctx.close();

  // Bản lưu kiểu cũ của trang chiến tranh (kit trước 2026-11-14 ghi thanh kéo theo thứ tự kèm id).
  const old = { fp: '0b1t', log: [{ r: 0, v: '8', id: 'speed' }, { t: 0, v: 'cũ', p: 'Ghi chú' }], ts: 1 };
  const c = await open(page, [key, JSON.stringify(old)]);
  assert.deepEqual(await state(c.p), { speed: '8', other: '5', out: '8', note: 'cũ' }, 'bản cũ: thanh kéo mở lại theo thứ tự');
  await c.p.waitForTimeout(900);
  assert.deepEqual(JSON.parse(await c.p.evaluate((k) => localStorage.getItem(k), key)).log, [{ r: '#speed', v: '8' }, { t: 'p:Ghi chú', v: 'cũ' }], 'bản cũ được chuyển sang cách lưu theo tên');
  const d = await open(page, [key, JSON.stringify({ ...old, log: [{ r: 0, v: '8', id: 'khac' }, { t: 0, v: 'cũ', p: 'Ghi chú' }] })]);
  assert.deepEqual(await state(d.p), { speed: '2', other: '5', out: '2', note: 'cũ' }, 'bản cũ: thanh ở chỗ đó đã khác thì dừng, chỉ giữ chữ');
  await c.ctx.close(); await d.ctx.close();
}

// 6. Nhìn N giây (it-stage.js): tải lại giữa lúc đếm thì đếm tiếp số giây còn lại, không coi như đã xem.
{
  const a = await open(fx.frontend);
  const has = await a.p.evaluate(() => {
    const bt = document.querySelector('[data-peek]'); if (!bt) return false;
    const st = bt.closest('.step');
    document.querySelectorAll('.step.on').forEach((x) => x.classList.remove('on'));
    st.classList.add('on'); st.dispatchEvent(new Event('step', { bubbles: true }));
    return true;
  });
  assert.ok(has, 'trang mẫu frontend có nút nhìn N giây');
  await a.p.locator('[data-peek]').first().click({ force: true });
  await a.p.waitForTimeout(1300);
  const saved = await savedOf(a.p);
  const peek = await a.p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.startsWith('lesson-peek:')); return [k, localStorage.getItem(k)]; });
  assert.ok(peek[0], 'lần bấm thật ghi giờ bắt đầu vào máy');
  assert.ok(JSON.parse(saved[1]).log.some((x) => x.k && x.k.includes('[data-peek=')), 'lần bấm nhìn có trong bản lưu');
  await a.ctx.close();

  const ctx = await browser.newContext({ viewport: { width: 1180, height: 760 } });
  await ctx.addInitScript((pairs) => { for (const [k, v] of pairs) localStorage.setItem(k, v); }, [saved, peek]);
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(fx.frontend).href);
  await p.waitForTimeout(300);
  const mid = await p.evaluate(() => {
    const bt = document.querySelector('[data-peek]'), name = bt.dataset.peek;
    const pane = document.querySelector(`.pane[data-pane="${name}"]`);
    return { text: bt.textContent, peeking: pane.classList.contains('peeking'), seen: (window.R.peeked || []).includes(name) };
  });
  assert.match(mid.text, /^Còn [1-4] giây$/, 'tải lại giữa lúc đếm: đếm tiếp (' + mid.text + ')');
  assert.ok(mid.peeking && !mid.seen, 'màn còn mở, chưa tính là đã xem');
  await p.waitForTimeout(4500);
  const end = await p.evaluate(() => { const bt = document.querySelector('[data-peek]'); return { text: bt.textContent, seen: (window.R.peeked || []).includes(bt.dataset.peek) }; });
  assert.ok(end.seen && !/^Còn/.test(end.text), 'hết giờ thì tính là đã xem');
  await ctx.close();

  // Không có giờ ghi trong máy (mở ở máy khác): coi như đã xem, như trước.
  const c = await open(fx.frontend, saved);
  assert.ok(await c.p.evaluate(() => (window.R.peeked || []).length > 0), 'máy khác: coi như đã xem');
  await c.ctx.close();
}

await browser.close();
console.log('ok autosave');
