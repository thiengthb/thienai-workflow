// Chụp ảnh trang cho các script dựng trang (compare/shoot, decide). Dùng chung một chỗ tìm Playwright và một cách chụp.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Playwright's chromium: from the project being reviewed (its node_modules) first, then global paths (NODE_PATH). */
export function chromium() {
  try { return createRequire(join(process.cwd(), 'noop.js'))('playwright').chromium; } catch (e) {
    throw new Error('Không tìm thấy Playwright. Chạy lệnh trong thư mục project có Playwright, hoặc cài: npm i -D playwright');
  }
}

/** A target as a URL: http(s) and file: stay, an existing local path becomes file://. */
export function toUrl(target) {
  if (/^[a-z]+:/i.test(target)) return target;
  if (existsSync(target)) return pathToFileURL(resolve(target)).href;
  throw new Error(`Không có trang hay file: ${target}`);
}

/** "1180x760,390x844" → [[1180, 760], [390, 844]]. */
export const parseSizes = (s) => String(s).split(',').map((x) => x.trim().split('x').map(Number)).filter(([w, h]) => w > 0 && h > 0);

/**
 * Screenshots each shot at @2x. shots: [{ url, path }]; one browser context per size.
 * shotsFor(w, h) returns the shots for that size, so callers can name files by size.
 */
export async function shoot(sizes, shotsFor, { wait = 600, full = false, dark = false, log = console.log } = {}) {
  const browser = await chromium().launch();
  try {
    for (const [w, h] of sizes) {
      const phone = w <= 500;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone, colorScheme: dark ? 'dark' : 'light' });
      const page = await ctx.newPage();
      for (const { url, path } of shotsFor(w, h)) {
        await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
        await page.waitForTimeout(wait);
        await page.screenshot({ path, fullPage: full });
        log(`Chụp ${path} ← ${url}`);
      }
      await ctx.close();
    }
  } finally { await browser.close(); }
}
