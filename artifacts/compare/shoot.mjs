#!/usr/bin/env node
// Một lệnh cho cả vòng duyệt: chụp từng trang ở bản cũ và bản mới, rồi dựng trang so sánh và publish.json.
//
//   node artifacts/compare/shoot.mjs <out-dir> --old <url> --new <url> [--pages /,/history] [--sizes 1180x760,390x844]
//        [--title "..."] [--id x] [--intro "..."] [--full] [--wait 600] [--dark] [--side <key>=<url> ...]
//
// --old, --new: địa chỉ gốc (hoặc file html) của hai bản (ví dụ http://localhost:3789 và http://localhost:3790); --side thêm bản khác
// (--side a=... --side b=... cho nhiều phác). --pages: đường dẫn ghép vào địa chỉ gốc; bỏ trống thì chụp đúng địa chỉ.
// --full: chụp cả trang dài. Ảnh nằm ở <out-dir>/src/<trang>-<rộng>__<bản>@2x.png, chụp lại thì ghi đè.
// Cần Playwright (có sẵn trong máy cloud của Claude; ở máy khác dùng bản trong node_modules của project).
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { build, specFromDir, CAPABILITIES } from './make-round.mjs';
import { writePublish } from '../kit/publish.mjs';
import { shoot, toUrl, parseSizes } from '../kit/shoot.mjs';

const args = process.argv.slice(2);
const take = (n) => { const out = []; let i; while ((i = args.indexOf('--' + n)) >= 0) out.push(args.splice(i, 2)[1]); return out; };
const one = (n) => take(n)[0];
const bool = (n) => { const i = args.indexOf('--' + n); if (i < 0) return false; args.splice(i, 1); return true; };

const sides = [];
const oldUrl = one('old'), newUrl = one('new');
if (oldUrl) sides.push(['old', oldUrl]);
for (const s of take('side')) { const i = s.indexOf('='); if (i > 0) sides.push([s.slice(0, i).toLowerCase(), s.slice(i + 1)]); }
if (newUrl) sides.push(['new', newUrl]);
const pages = (one('pages') || '').split(',').map((p) => p.trim()).filter(Boolean);
const sizes = parseSizes(one('sizes') || '1180x760,390x844');
const opts = { title: one('title'), id: one('id'), intro: one('intro') };
const full = bool('full'), dark = bool('dark'), wait = +(one('wait') || 600);
const [out] = args;
if (!out || sides.length < 2) {
  console.error('Cách dùng: node artifacts/compare/shoot.mjs <out-dir> --old <url> --new <url> [--pages /,/history] [--sizes 1180x760,390x844] [--title "..."]');
  process.exit(1);
}

const slug = (p) => (p.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home');
const src = join(resolve(out), 'src');
mkdirSync(src, { recursive: true });
try {
  await shoot(sizes, (w) => (pages.length ? pages : ['']).flatMap((p) => sides.map(([key, base]) => ({
    url: p ? new URL(p, toUrl(base).replace(/\/?$/, '/')).href : toUrl(base),
    path: join(src, `${p ? slug(p) : 'page'}-${w}__${key}@2x.png`),
  }))), { wait, full, dark });
} catch (e) { console.error(e.message); process.exit(1); }

const { round, files } = build(specFromDir(src, opts), src, resolve(out));
console.log(`Đã dựng ${round.items.length} màn vào ${resolve(out)}/index.html (vòng ${round.id})`);
for (const l of writePublish(resolve(out), { files, capabilities: CAPABILITIES, icon: 'compare', description: round.title })) console.log(l);
