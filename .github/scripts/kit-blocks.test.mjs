// Khối gửi dùng chung (artifacts/kit/kit.js, Kit.sendBox, KH9): gửi được thì báo đã gửi; không gửi được thì tự chép
// và báo; check() chặn gửi khi ô còn trống; snapshot được lưu đúng bản được gửi. Mở trang mẫu thành phần như check-pages.
// Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { buildFixtures } from '../../artifacts/kit/check-pages.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const fx = Object.fromEntries((await buildFixtures(mkdtempSync(join(tmpdir(), 'kit-blocks-')), browser)).map((f) => [f.name, f.file]));
const gallery = fx['mau-gallery'] || fx.gallery;
assert.ok(gallery, 'có trang mẫu thành phần');

for (const canSend of [true, false]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
  await ctx.addInitScript((ok) => {
    window.__sent = [];
    const comments = { canSendToClaude: async () => (ok ? 'available' : 'unavailable'), anchorFor: async () => ({}), sendToClaude: async (x) => { window.__sent.push(x.text); } };
    window.claude = { use: async (n) => (n === 'comments' ? comments : null) };
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (t) => { window.__copied = t; } } });
  }, canSend);
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(pathToFileURL(gallery).href);
  await p.waitForTimeout(300);
  await p.locator('#g-send-send').click();
  await p.waitForFunction(() => document.getElementById('g-send-status').textContent);
  const r = await p.evaluate(() => ({ status: document.getElementById('g-send-status').textContent, sent: window.__sent, copied: window.__copied }));
  if (canSend) {
    assert.match(r.status, /Đã gửi cho Claude/);
    assert.deepEqual(r.sent, ['Ga 3 làm trước ga 4 được không?']);
  } else {
    assert.match(r.status, /Chưa gửi thẳng được, đã chép/, 'không gửi được thì tự chép');
    assert.equal(r.copied, 'Ga 3 làm trước ga 4 được không?');
  }
  assert.equal(await p.locator('#g-send-send').isDisabled(), false, 'nút gửi bật lại sau khi xong');
  assert.deepEqual(errors, []);
  await ctx.close();
}

// check(), snapshot, save, clear(): dựng một khối mới trên chính trang đó.
{
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => { window.claude = { use: async () => null }; Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => {} } }); });
  const p = await ctx.newPage();
  await p.goto(pathToFileURL(gallery).href);
  const r = await p.evaluate(async () => {
    const host = document.createElement('div'); host.innerHTML = '<textarea></textarea><button id="c">c</button><button id="s">s</button><p id="st"></p>';
    document.body.append(host);
    const ta = host.querySelector('textarea'), saved = [];
    const box = Kit.sendBox({ copy: host.querySelector('#c'), send: host.querySelector('#s'), status: host.querySelector('#st'),
      text: (st) => st.v, snapshot: (sending) => ({ v: ta.value, sending }), save: (st, sending) => { saved.push([st.v, sending]); },
      check: () => (ta.value.trim() ? '' : 'Viết vài câu trước đã.') });
    host.querySelector('#s').click(); await new Promise((r) => setTimeout(r, 50));
    const empty = host.querySelector('#st').textContent;
    ta.value = 'abc'; host.querySelector('#s').click(); await new Promise((r) => setTimeout(r, 3500));
    const after = host.querySelector('#st').textContent;
    box.clear();
    return { empty, after, saved, cleared: host.querySelector('#st').textContent };
  });
  assert.equal(r.empty, 'Viết vài câu trước đã.', 'check() chặn gửi');
  assert.deepEqual(r.saved, [['abc', true]], 'lưu đúng bản được gửi, chỉ khi gửi thật');
  assert.match(r.after, /đã chép/);
  assert.equal(r.cleared, '');
  await ctx.close();
}
await browser.close();
console.log('ok kit-blocks');
