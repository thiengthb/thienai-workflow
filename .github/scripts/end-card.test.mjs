// Màn kết của trang học (artifacts/lesson/lesson.js, endCard): bấm "Xong buổi học" thì hiện tuyến các bước đã đi qua,
// con số ôn và câu hỏi nhanh, và câu người học tự viết. Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { buildFixtures } from '../../artifacts/kit/check-pages.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const fx = Object.fromEntries((await buildFixtures(mkdtempSync(join(tmpdir(), 'end-card-')), browser)).map((f) => [f.name, f.file]));

for (const name of ['lesson', 'frontend']) {
  const p = await (await browser.newContext({ viewport: { width: 390, height: 800 } })).newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(pathToFileURL(fx[name]).href);
  await p.waitForTimeout(300);
  const total = await p.evaluate(() => {
    R.review = { a: { ok: true }, b: { ok: false } }; R.quiz = { c: { ok: true } }; R.teach = 'Câu mình tự viết';
    const fin = document.querySelector('#finish');
    document.querySelectorAll('.step').forEach((s) => s.classList.toggle('on', s.contains(fin)));
    fin.disabled = false;
    return document.querySelectorAll('.step').length;
  });
  await p.click('#finish');
  await p.waitForTimeout(300);
  const card = await p.evaluate(() => {
    const c = document.querySelector('#end-card');
    return c && { route: c.querySelectorAll('.end-route li').length, last: c.querySelector('.end-last')?.textContent,
      stats: [...c.querySelectorAll('.end-stats div')].map((d) => d.textContent), quote: c.querySelector('.end-quote')?.textContent };
  });
  assert.ok(card, `${name}: có màn kết sau khi bấm Xong`);
  assert.equal(card.route, total, `${name}: mỗi bước một ga (trừ bước góp ý), thêm ga "Xong"`);
  assert.equal(card.last, 'Xong');
  assert.ok(card.stats.includes('Ôn1/2') && card.stats.includes('Câu hỏi nhanh1/1'), `${name}: con số ôn và câu hỏi nhanh (${card.stats})`);
  assert.match(card.quote, /Câu mình tự viết/);
  assert.deepEqual(errors, []);
  await p.context().close();
}
await browser.close();
console.log('ok end-card');
