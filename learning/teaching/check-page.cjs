// Kiểm một trang bài học trước khi gửi thien, trên khổ điện thoại và laptop.
// Cách chạy: node learning/teaching/check-page.cjs <đường-dẫn-trang.html> [thư-mục-ảnh] [--show=.step]
// Cần Playwright (môi trường cloud của Claude Code có sẵn).
//
// Kiểm 4 thứ:
//  1. Không có lỗi JavaScript.
//  2. Không tràn ngang (không phải cuộn sang phải).
//  3. Vùng bấm không nhỏ hơn 24px (luật tối thiểu WCAG 2.2), cảnh báo nếu dưới 44px.
//  4. Bấm nút nào cũng thấy có gì đó đổi trên màn (so ảnh chụp trước và sau khi bấm).
//     Chỉ đổi class hay aria-pressed mà màn không đổi thì vẫn tính là lỗi.
//     Đây là lỗi của buổi BA 1: bấm được nhưng nút không đổi màu, trông như bấm không ăn.
const { chromium, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const showArg = args.find(a => a.startsWith('--show='));
// Trang nhiều bước thường giấu các bước sau. Hiện hết ra để kiểm cả nút ở bước sau (mặc định: .step).
const SHOW = showArg ? showArg.slice(7) : '.step';
const pos = args.filter(a => !a.startsWith('--'));
const file = pos[0];
if (!file) { console.error('Thiếu đường dẫn trang'); process.exit(2); }
const url = 'file://' + path.resolve(file);
const outDir = pos[1] || path.join(path.dirname(path.resolve(file)), '.check');
fs.mkdirSync(outDir, { recursive: true });

const SIZES = [
  { name: 'dien-thoai', opts: { ...devices['iPhone 13'] } },
  { name: 'laptop', opts: { viewport: { width: 1366, height: 820 } } },
];

(async () => {
  const browser = await chromium.launch();
  let fails = 0, warns = 0;
  for (const size of SIZES) {
    const ctx = await browser.newContext(size.opts);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, size.name + '.png'), fullPage: true });

    const reveal = () => SHOW ? page.addStyleTag({ content: SHOW + '{display:block!important}' }) : null;
    await reveal();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) { fails++; console.log(`[${size.name}] LỖI tràn ngang ${overflow}px`); }

    const targets = await page.evaluate(() => { const shown = e => { if (e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return false; let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none') return false; o *= +cs.opacity; } return o > 0.05; }; return [...document.querySelectorAll('button, a[href], input, select, textarea, [role=button]')]
      .filter(shown)
      .map((e, i) => { e.dataset.chk = i; const r = e.getBoundingClientRect(); return { i, w: r.width, h: r.height, t: (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 40), btn: e.tagName === 'BUTTON' && !e.disabled && e.getAttribute('aria-pressed') !== 'true' }; }); });
    for (const t of targets) {
      const m = Math.min(t.w, t.h);
      if (m < 24) { fails++; console.log(`[${size.name}] LỖI vùng bấm ${Math.round(t.w)}x${Math.round(t.h)}: "${t.t}"`); }
      else if (m < 44 && size.name === 'dien-thoai') { warns++; console.log(`[${size.name}] cảnh báo vùng bấm nhỏ ${Math.round(t.w)}x${Math.round(t.h)}: "${t.t}"`); }
    }

    // Bấm từng nút trên một trang mới tải lại, so trước và sau.
    for (const t of targets.filter(x => x.btn)) {
      await page.goto(url, { waitUntil: 'load' });
      await reveal();
      await page.evaluate(() => { const shown = e => { if (e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return false; let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none') return false; o *= +cs.opacity; } return o > 0.05; }; [...document.querySelectorAll('button, a[href], input, select, textarea, [role=button]')].filter(shown).forEach((e, i) => e.dataset.chk = i); });
      const loc = page.locator(`[data-chk="${t.i}"]`);
      if (!(await loc.count()) || !(await loc.isVisible()) || !(await loc.isEnabled())) continue;
      await loc.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      const before = await page.screenshot();
      try { if (size.opts.hasTouch) await loc.tap({ timeout: 3000 }); else await loc.click({ timeout: 3000 }); }
      catch (e) { fails++; console.log(`[${size.name}] LỖI không bấm được, có thứ đè lên: "${t.t}"`); continue; }
      await page.waitForTimeout(450);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(250);
      const after = await page.screenshot();
      if (before.equals(after)) { fails++; console.log(`[${size.name}] LỖI bấm không thấy gì đổi: "${t.t}"`); }
    }

    for (const e of errors) { fails++; console.log(`[${size.name}] LỖI JavaScript: ${e}`); }
    await ctx.close();
  }
  await browser.close();
  console.log(`\nXong: ${fails} lỗi, ${warns} cảnh báo. Ảnh chụp ở ${outDir}`);
  process.exit(fails ? 1 : 0);
})();
