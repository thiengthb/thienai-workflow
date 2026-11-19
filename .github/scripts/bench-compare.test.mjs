// Hai màn so trước và sau trên bàn thử (artifacts/it/it-stage.js, data-compare): màn "Trước" là bản chép đứng yên theo giá trị
// lúc mở trang (hay data-before), màn "Sau" vẫn vặn được; sang bước khác thì gập; bước @compare mở sẵn; bàn không dùng so giữ
// nguyên. Dựng từ template-frontend.html như check-pages. Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { buildFixtures } from '../../artifacts/kit/check-pages.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const dir = mkdtempSync(join(tmpdir(), 'bench-compare-'));
const fx = Object.fromEntries((await buildFixtures(dir, browser)).map((f) => [f.name, f.file]));
// Bản thứ hai: bàn "bank" có data-before và bước 6 mở sẵn hai màn (@compare).
const modeFile = join(dir, 'mode.html');
writeFileSync(modeFile, readFileSync(fx.frontend, 'utf8')
  .replace('data-pane="bank">', `data-pane="bank" data-before='{"accent":"#dc2626","amount":"nhieu"}' data-before-label="Bản cũ">`)
  .replace('data-s="6" data-stage="bank"', 'data-s="6" data-stage="bank@compare"'));

const go = (p, s) => p.evaluate((s) => document.querySelectorAll('.step').forEach((x) => x.classList.toggle('on', x.dataset.s === String(s))), s);

for (const w of [360, 1180]) {
  const p = await (await browser.newContext({ viewport: { width: w, height: 760 }, isMobile: w < 900, hasTouch: w < 900 })).newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(pathToFileURL(fx.frontend).href);
  await p.waitForTimeout(300);
  assert.equal(await p.locator('[data-pane="bank"] .pair').count(), 0, 'bàn không dùng so thì không bọc thêm gì');
  await go(p, 5);
  await p.evaluate(() => { const u = document.querySelector('[data-uncover="food"]'); u.disabled = false; u.click(); });
  const bt = p.locator('[data-compare="food"]');
  assert.ok(await bt.isDisabled(), 'nút so khóa tới khi đã vặn');
  await p.locator('[data-pane="food"] [data-val="it"]').click();
  await bt.click();
  await p.waitForTimeout(200);
  const on = await p.evaluate(() => {
    const b = document.querySelector('[data-pane="food"]'), r = (e) => e.getBoundingClientRect();
    const ghost = b.querySelector('.phone.ghost'), main = b.querySelector('.shot.after .screen');
    return { cmp: b.classList.contains('cmp'), before: ghost.querySelector('.screen').dataset.amount, after: main.dataset.amount,
      hidden: ghost.getAttribute('aria-hidden'), inert: ghost.inert, ids: ghost.querySelectorAll('[id]').length,
      caps: [...b.querySelectorAll('.cap')].map((c) => c.textContent), docW: document.documentElement.scrollWidth,
      side: ghost.getBoundingClientRect().top < r(main).bottom && r(ghost).right <= r(main).left + 1,
      pressed: document.querySelector('[data-compare="food"]').getAttribute('aria-pressed'),
      next: !document.querySelector('[data-go="6"]').disabled, R: window.R.compared };
  });
  assert.ok(on.cmp, `${w}: bấm thì hai màn hiện`);
  assert.equal(on.before, 'nhieu', 'màn Trước giữ giá trị lúc mở trang');
  assert.equal(on.after, 'it', 'màn Sau theo núm');
  assert.ok(on.hidden === 'true' && on.inert && on.ids === 0, 'bản chép không đọc lên, không bấm được, không trùng id');
  assert.deepEqual(on.caps, ['Trước', 'Sau']);
  assert.ok(on.side, `${w}: hai màn nằm cạnh nhau, Trước bên trái`);
  assert.ok(on.docW <= w, `${w}: trang không rộng quá màn (${on.docW}px)`);
  assert.ok(on.pressed === 'true' && on.next && on.R.includes('food'), 'mở khóa compare-food và ghi vào R.compared');
  await go(p, 6);
  await p.waitForTimeout(100);
  assert.equal(await p.evaluate(() => document.querySelector('[data-pane="food"]').classList.contains('cmp')), false, 'sang bước khác thì gập');
  assert.deepEqual(errors, []);
  await p.context().close();
}

// Bước @compare mở sẵn, Trước theo data-before, nhãn riêng; Soi chỉ đánh số trên màn thật.
const p = await (await browser.newContext({ viewport: { width: 1180, height: 760 } })).newPage();
const errors = []; p.on('pageerror', (e) => errors.push(e.message));
await p.goto(pathToFileURL(modeFile).href);
await p.waitForTimeout(300);
await go(p, 6);
await p.waitForTimeout(200);
const m = await p.evaluate(() => {
  const b = document.querySelector('[data-pane="bank"]'), g = b.querySelector('.phone.ghost .screen');
  b.querySelector('[data-soi-toggle]').click();
  return { cmp: b.classList.contains('cmp'), accent: g.style.getPropertyValue('--a'), amount: g.dataset.amount, cap: b.querySelector('.cap').textContent,
    soiGhost: g.querySelectorAll('.soi-on, [data-soi]').length, soiMain: b.querySelectorAll('.shot.after .soi-on').length };
});
assert.ok(m.cmp, 'bước @compare mở sẵn hai màn');
assert.equal(m.accent, '#dc2626'); assert.equal(m.amount, 'nhieu');
assert.equal(m.cap, 'Bản cũ');
assert.ok(m.soiGhost === 0 && m.soiMain > 0, 'Soi chỉ trên màn thật');
await go(p, 7);
await p.waitForTimeout(100);
assert.equal(await p.evaluate(() => document.querySelector('[data-pane="bank"]').classList.contains('cmp')), false);
assert.deepEqual(errors, []);
await browser.close();
console.log('ok bench-compare');
