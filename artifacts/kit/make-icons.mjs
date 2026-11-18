#!/usr/bin/env node
// Sinh bộ icon dùng chung (Lucide, giấy phép ISC) vào khối ICONS trong artifacts/kit/kit.css.
// Mỗi icon là một biến --ic-<tên> chứa ảnh SVG dạng data: URI, dùng làm mask nên icon luôn theo màu chữ (currentColor)
// và luôn nằm giữa ô vuông 1em. Trang dùng <i class="ic ic-check"></i> hay Kit.icon('check').
//
//   npm pack lucide-static && tar xzf lucide-static-*.tgz
//   node artifacts/kit/make-icons.mjs <thư-mục package/icons của lucide-static>
//
// Thêm icon: thêm tên vào NAMES (tên file của Lucide, không có .svg) rồi chạy lại. Giữ bộ nhỏ: mỗi icon khoảng 300 byte
// được chép vào mọi trang.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const NAMES = ['check', 'x', 'plus', 'minus', 'chevron-left', 'chevron-right', 'chevron-down', 'arrow-left', 'arrow-right',
  'circle-check', 'circle-alert', 'circle-help', 'info', 'triangle-alert', 'circle-play', 'play', 'rotate-ccw', 'copy', 'external-link',
  'search', 'sparkles', 'lightbulb', 'inbox', 'file-text', 'list-checks', 'clock', 'calendar', 'volume-2', 'mic'];
/** Icon tách từ icon Lucide: chỉ giữ các nét khớp `keep` (bỏ vòng tròn ngoài để đặt vào huy hiệu tròn có sẵn). */
export const DERIVED = { exclaim: { from: 'circle-alert', keep: /<line[^>]*\/>/g } };
const START = '/* ICONS:START', END = '/* ICONS:END */';

/** Lucide SVG file -> compact SVG string usable as a mask (stroke black, no comment, no class). */
export function compact(svg) {
  const body = svg.replace(/<!--[\s\S]*?-->/g, '').match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1].replace(/\s*\n\s*/g, '').replace(/\s+\/>/g, '/>');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
const uri = (svg) => `url("data:image/svg+xml,${svg.replace(/"/g, "'").replace(/[<>#%{}]/g, encodeURIComponent)}")`;

export function block(dir) {
  const head = readFileSync(join(dir, NAMES[0] + '.svg'), 'utf8').match(/lucide-static v[\d.]+/)?.[0] || 'lucide-static';
  const lines = NAMES.map((n) => `  --ic-${n}: ${uri(compact(readFileSync(join(dir, n + '.svg'), 'utf8')))};`);
  for (const [n, { from, keep }] of Object.entries(DERIVED)) {
    const parts = readFileSync(join(dir, from + '.svg'), 'utf8').match(keep).join('');
    lines.push(`  --ic-${n}: ${uri(compact(`<svg>${parts}</svg>`))};`);
  }
  return `${START}: sinh bởi make-icons.mjs từ ${head} (ISC), đừng sửa tay. */
:root {
${lines.join('\n')}
}
.ic { display: inline-block; width: 1em; height: 1em; flex: none; vertical-align: -.14em; background: currentColor;
  -webkit-mask: var(--i) center / contain no-repeat; mask: var(--i) center / contain no-repeat; }
${[...NAMES, ...Object.keys(DERIVED)].map((n) => `.ic-${n} { --i: var(--ic-${n}); }`).join('\n')}
${END}`;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const dir = process.argv[2];
  if (!dir) { console.error('Cần thư mục icons của lucide-static (xem đầu file).'); process.exit(1); }
  const file = join(dirname(fileURLToPath(import.meta.url)), 'kit.css');
  let css = readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
  const a = css.indexOf(START), b = css.indexOf(END);
  const out = block(dir);
  css = a >= 0 && b > a ? css.slice(0, a) + out + css.slice(b + END.length) : css.replace(/\n*$/, '\n\n') + out + '\n';
  writeFileSync(file, css);
  console.log(`Đã ghi ${NAMES.length + Object.keys(DERIVED).length} icon vào ${file}`);
}
