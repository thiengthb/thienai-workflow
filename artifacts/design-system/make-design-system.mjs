#!/usr/bin/env node
// Dựng bộ màu, chữ, khoảng cách, bo góc của thienui thành file cho trang Design System của claude.ai
// (đề xuất N4). thienui là nguồn duy nhất; trang này chỉ là bản để xem và để Claude đọc khi dựng trang.
//
//   node artifacts/design-system/make-design-system.mjs <thư-mục thienui> --out <thư-mục>
//
// Ghi <out>/project/tokens.json (đọc từ packages/tokens/src của thienui), chép brand-book.md (thành README.md của trang) và bìa
// (components/Cover/preview.html) từ thư mục này. Cách đăng: README.md ở đây, mục "Cập nhật".
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));

/** `a.b.c` -> $value for every leaf of a DTCG tree, `$` keys skipped. */
export function flatten(node, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && '$value' in v) out[path] = v.$value;
    else if (v && typeof v === 'object') flatten(v, path, out);
  }
  return out;
}

// Colour tokens shown, with what each is for. Names are thienui's own (shadcn names), so code and page agree.
export const COLOURS = [
  ['background', 'Nền trang.'],
  ['card', 'Thẻ, mặt nâng lên trên nền trang.'],
  ['popover', 'Menu, hộp nổi.'],
  ['muted', 'Nền phần tử phụ: ô nhập, nhãn, hàng được chọn nhẹ.'],
  ['accent', 'Nền khi rê chuột qua một hàng hay nút phụ.'],
  ['foreground', 'Chữ chính trên background, card, muted.'],
  ['muted-foreground', 'Chữ phụ, chú thích trên background và card.'],
  ['border', 'Viền mảnh của thẻ và đường phân tách.'],
  ['input', 'Viền ô nhập, nút viền.'],
  ['primary', 'Màu chủ đạo: nút chính, một chỗ nhấn mỗi màn. Chữ trên nó dùng primary-foreground.'],
  ['primary-foreground', 'Chữ, icon trên nền primary.'],
  ['press', 'Gờ dưới 2px và lúc nhấn của nút chính.'],
  ['accent-brand', 'Chữ, icon mang màu chủ đạo trên nền trang (link, tab đang chọn).'],
  ['brand-wash', 'Nền nhạt mang màu chủ đạo: nhãn, hàng đang chọn.'],
  ['ring', 'Vòng focus.'],
  ['ok', 'Chữ trạng thái tốt.'], ['ok-wash', 'Nền nhạt trạng thái tốt.'],
  ['warn', 'Chữ cảnh báo.'], ['warn-wash', 'Nền nhạt cảnh báo.'],
  ['alert', 'Chữ lỗi, việc cần xử lý.'], ['alert-wash', 'Nền nhạt lỗi.'],
  ['info', 'Chữ thông tin.'], ['info-wash', 'Nền nhạt thông tin.'],
  ['destructive', 'Nút xóa, hành động không hoàn tác.'],
  ['chart-1', 'Biểu đồ, chuỗi 1.'], ['chart-2', 'Biểu đồ, chuỗi 2.'], ['chart-3', 'Biểu đồ, chuỗi 3.'], ['chart-4', 'Biểu đồ, chuỗi 4.'], ['chart-5', 'Biểu đồ, chuỗi 5.'],
];

// Text styles: size, leading and tracking from thienui's scale; weights as thienui's own components use them.
const STYLES = [
  ['large-title', 'large-title', 600, 'tight', 'Tiêu đề lớn nhất, một lần mỗi màn.', 'Hôm nay'],
  ['title1', 'title1', 600, 'tight', 'Tiêu đề màn.', 'Điểm danh'],
  ['title2', 'title2', 600, 'snug', 'Tiêu đề phần lớn.', 'Lớp hôm nay'],
  ['title3', 'title3', 600, 'snug', 'Tiêu đề thẻ.', 'Việc tiếp theo'],
  ['headline', 'body', 600, 'normal', 'Cùng cỡ body, đậm hơn: tạo bậc mà không tăng cỡ.', 'Ba việc chờ bạn'],
  ['body', 'body', 400, 'normal', 'Chữ đọc. 17px là sàn dễ đọc.', 'Khoảng cách giữa hai nhóm gấp 2 đến 3 lần khoảng cách trong nhóm.'],
  ['callout', 'callout', 400, 'normal', 'Đoạn phụ, lời dẫn.', 'Mở trang trên điện thoại để chấm.'],
  ['subhead', 'subhead', 600, 'normal', 'Nhãn nút, tên hàng trong danh sách.', 'Lưu thay đổi'],
  ['footnote', 'footnote', 400, 'normal', 'Chú thích dưới thẻ.', 'Cập nhật 14/11 lúc 17:20'],
  ['caption1', 'caption1', 400, 'normal', 'Chữ nhỏ nhất cho nội dung: số liệu phụ, thời gian.', '3 buổi · 42 phút'],
  ['caption2', 'caption2', 600, 'label', 'Nhãn in hoa trên đầu nhóm.', 'ĐANG CHỜ BẠN'],
];

const px = (rem) => (/rem$/.test(rem) ? `${parseFloat(rem) * 16}px` : rem);

/** tokens.json for the Design System page, from a thienui checkout. */
export function buildTokens(thienui) {
  const src = join(thienui, 'packages/tokens/src');
  const read = (f) => JSON.parse(readFileSync(join(src, f), 'utf8'));
  const P = { ...flatten(read('primitive.json')), ...flatten(read('scale.json')) };
  const themes = readdirSync(src).filter((f) => /^semantic\..+\.json$/.test(f)).map(read)
    .sort((a, b) => (b.$default === true) - (a.$default === true));
  const resolve = (ref) => { const m = /^\{([^}]+)\}$/.exec(ref); const v = m ? P[m[1]] : ref; if (v === undefined) throw new Error(`thienui: không có ${ref}`); return v; };
  const ids = themes.flatMap((t) => ['light', 'dark'].map((mode) => ({ t, mode, id: `${t.$theme}-${mode}`, name: `${t.$label} ${mode === 'light' ? 'sáng' : 'tối'}` })));
  const colour = COLOURS.map(([name, usage]) => ({ name, usage, value: Object.fromEntries(ids.map(({ t, mode, id }) => [id, resolve(t[mode][name])])) }));
  const space = Object.entries(P).filter(([k]) => /^space\.\d+$/.test(k)).map(([k, v]) => ({ name: `space-${k.split('.')[1]}`, value: px(v) }))
    .map((t) => ({ ...t, usage: { 'space-1': 'Khoảng trong một cụm nhỏ (icon với chữ).', 'space-2': 'Khoảng giữa các dòng trong một nhóm.', 'space-3': 'Đệm trong nút, ô.', 'space-4': 'Đệm thẻ, lề trang trên điện thoại.', 'space-6': 'Khoảng giữa hai nhóm (gấp 2 đến 3 lần khoảng trong nhóm).', 'space-8': 'Khoảng giữa hai phần lớn, lề trang trên laptop.' }[t.name] || 'Bước trên lưới 4px.' }));
  return {
    name: 'thienui', version: 1,
    meta: { source: `thienui packages/tokens/src (${themes.map((t) => `semantic.${t.$theme}.json`).join(', ')}, primitive.json, scale.json)` },
    color: { themes: ids.map(({ id, name }) => ({ id, name })), tokens: colour },
    type: {
      fonts: [],
      families: { sans: P['font.sans'].split(',').map((s) => s.trim()).map((s) => (/\s/.test(s) && !/^ui-|^system-ui|^sans-serif$/.test(s) ? `"${s}"` : s)).join(', ') },
      groups: [{ name: 'Chữ', family: 'sans', styles: STYLES.map(([name, size, fontWeight, track, usage, sample]) => ({ name, fontSize: px(P[`type.${size}`]), lineHeight: P[`leading.${size}`], fontWeight, letterSpacing: P[`tracking.${track}`], usage, sample })) }],
    },
    spacing: { tokens: space },
    radius: { tokens: [
      { name: 'radius-control', value: px(P['radius.control']), usage: 'Nút, ô nhập, chip, tab. Cùng mức với thẻ: cả app chỉ một bo góc.' },
      { name: 'radius-card', value: px(P['radius.card']), usage: 'Thẻ, hộp thoại, popover.' },
      { name: 'radius-full', value: P['radius.full'], usage: 'Chỉ ảnh đại diện, chấm trạng thái, công tắc.' },
    ] },
    size: { tokens: [
      { name: 'control-height-desktop', value: px(P['control.height.desktop']), usage: 'Chiều cao nút và ô trên laptop.' },
      { name: 'control-height-phone', value: px(P['control.height.phone']), usage: 'Chiều cao nút và ô trên điện thoại (dưới 768px).' },
      { name: 'target-min', value: P['target.min'], usage: 'Vùng bấm tối thiểu; nút nhìn nhỏ hơn vẫn có vùng bấm này.' },
      { name: 'edge-lift', value: P['edge.lift'], usage: 'Gờ dưới của nút nổi, cùng màu viền (nút chính: press).' },
      { name: 'measure-prose', value: P['measure.prose'], usage: 'Độ dài dòng chữ đọc.' },
    ] },
    shadow: { tokens: [1, 2, 3].map((k) => ({ name: `shadow-${k}`, value: Object.fromEntries(ids.map(({ mode, id }) => [id, P[`elevation.${mode}.${k}`]])), usage: ['Thẻ: nhiều nhất là bóng rất nhẹ này.', 'Menu, popover.', 'Hộp thoại.'][k - 1] })) },
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), k = args.indexOf('--out');
  const out = resolve(k >= 0 ? args.splice(k, 2)[1] : 'design-system-out');
  const thienui = resolve(args[0] || '../thienui');
  const commit = spawnSync('git', ['-C', thienui, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
  const tokens = buildTokens(thienui);
  if (commit) tokens.meta.source += ` @ ${commit}`;
  mkdirSync(join(out, 'project/components/Cover'), { recursive: true });
  writeFileSync(join(out, 'project/tokens.json'), JSON.stringify(tokens, null, 1));
  copyFileSync(join(here, 'brand-book.md'), join(out, 'project/README.md'));
  copyFileSync(join(here, 'cover.html'), join(out, 'project/components/Cover/preview.html'));
  console.log(`Đã ghi ${out}/project: tokens.json (${tokens.color.tokens.length} màu × ${tokens.color.themes.length} theme, ${tokens.type.groups[0].styles.length} kiểu chữ), README.md, bìa. Nguồn: ${tokens.meta.source}`);
}
