// Trang kế hoạch ở màn rộng: cột mục lục bên trái không được đè lên cột đọc, ở mọi bố cục và mọi bề ngang từ 1160px
// (lúc mục lục thành cột). Lỗi thien thấy 2026-11-20: bảng tiến độ rộng 960px mà cột mục lục vẫn đặt cho cột 760px,
// nên từ khoảng 1366px chữ "Tiến độ" và thanh tiến độ đè lên ô số. Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from '../../artifacts/plan/make-plan.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const dir = mkdtempSync(join(tmpdir(), 'plan-layout-'));
for (const name of ['fixture', 'fixture-running', 'fixture-closed']) {
  const { layout } = build(join(root, `artifacts/plan/${name}.md`), join(dir, name), { today: '2026-11-21' });
  for (const w of [1160, 1280, 1366, 1525, 1920]) {
    const p = await (await browser.newContext({ viewport: { width: w, height: 800 } })).newPage();
    await p.goto(pathToFileURL(join(dir, name, 'preview.html')).href);
    await p.waitForTimeout(150);
    const r = await p.evaluate(() => {
      const toc = document.getElementById('toc');
      const right = Math.max(...[toc, ...toc.querySelectorAll('*')].map((e) => e.getBoundingClientRect().right));
      const main = document.querySelector('main.wrap').getBoundingClientRect();
      return { fixed: getComputedStyle(toc).position === 'fixed', right, left: main.left, mainRight: main.right };
    });
    assert.ok(r.fixed, `${layout} ${w}px: mục lục là cột bên trái`);
    assert.ok(r.right <= r.left - 8, `${layout} ${w}px: mục lục (tới ${Math.round(r.right)}px) đè lên cột đọc (từ ${Math.round(r.left)}px)`);
    assert.ok(r.mainRight <= w, `${layout} ${w}px: cột đọc tràn ra ngoài màn`);
    await p.context().close();
  }
}
await browser.close();
console.log('ok plan-layout');
