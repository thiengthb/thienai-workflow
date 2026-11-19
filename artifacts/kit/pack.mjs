// Đóng gói trang trước khi đăng: trang nhẹ hơn mà không đổi cách chạy. Mọi lệnh dựng trang gọi packHtml ở bước cuối
// (make-lesson, make-review, make-decision, make-round, progress-page; make-gallery chỉ thu gọn, giữ đủ icon để xem).
//
//   packHtml(html, { icons = true, blocks = true, drop = [] })  bỏ khối không dùng (drop: khối lệnh dựng đã bỏ), thu gọn mọi khối <style> và <script> viết trong trang,
//                 bỏ icon không dùng
//   trimBlocks(html, { drop })  bỏ vùng CSS, JS của khối mà trang không dùng (KH9 ga 2), như bỏ icon thừa
//   minCss(css)   bỏ chú thích và khoảng trắng thừa; giữ nguyên chuỗi trong ngoặc kép (content, url("data:…"))
//   minJs(js)     chỉ bỏ dòng chú thích đứng riêng (// … hay khối /* … */ chiếm trọn dòng); không đổi một ký tự code nào
//   trimIcons(html)  bỏ biến --ic-<tên> và lớp .ic-<tên> mà trang không nhắc tới
//
// Icon được giữ khi trang có "ic-<tên>" (class, var(--ic-<tên>)) hay Kit.icon('<tên>') viết thẳng tên. Gọi Kit.icon với
// tên nằm trong biến thì lệnh không thấy: viết thẳng tên, hay dựng với { icons: false }.
// Vùng của một khối (trong <style> hay <script>, kể cả trong template của từng mẫu; ngoài hai thẻ đó thì không tính):
//   /* @block <tên> <dấu> <dấu>… */ … /* @end <tên> */
// Khối được giữ khi một dấu của nó (tên lớp, id, Kit.sendBox…) có trong trang ngoài mọi vùng khối và ngoài chú thích, hay
// trong vùng của một khối đang được giữ; trừ khối lệnh dựng đưa vào drop (chữ trong tiêu đề có "cau-hoi" không giữ lại nó). Không ghi dấu thì tên khối là dấu. Dấu so trọn chữ: "qs" không khớp "qs-x". Lệnh dựng không vẽ một
// khối thì thân trang không còn dấu của nó, nên CSS và JS của khối đi theo. Vùng không lồng nhau. JS của một vùng có thể
// bị bỏ: code ngoài vùng không được gọi thẳng tên định nghĩa trong vùng (dùng biến có giá trị mặc định, xem plan.js).
// Đo 2026-11-18: chú thích chiếm 15–20% mỗi file kit; bộ icon khoảng 9 KB, một trang thường dùng dưới 6 icon.

/** CSS: bỏ chú thích, gộp khoảng trắng, bỏ khoảng trắng quanh { } ; , — trừ trong chuỗi. */
export function minCss(css) {
  let out = '', i = 0, ws = false;
  const n = css.length, tight = '{};,';
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { const e = css.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; ws = true; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && css[j] !== c) j += css[j] === '\\' ? 2 : 1;
      if (ws && out && !tight.includes(out[out.length - 1])) out += ' ';
      ws = false; out += css.slice(i, j + 1); i = j + 1; continue;
    }
    if (/\s/.test(c)) { ws = true; i++; continue; }
    if (ws && out && !tight.includes(out[out.length - 1]) && !tight.includes(c)) out += ' ';
    ws = false; out += c; i++;
  }
  return out.trim();
}

/** JS: bỏ dòng chỉ có chú thích. Theo dõi chuỗi ` nhiều dòng để không đụng vào nội dung của nó. */
export function minJs(js) {
  const out = [];
  let inBlock = false, inTpl = false;
  for (const line of js.split('\n')) {
    if (inBlock) {
      const e = line.indexOf('*/');
      if (e < 0) continue;
      inBlock = false;
      const rest = line.slice(e + 2);
      if (rest.trim()) out.push(rest);
      continue;
    }
    const t = line.trim();
    if (!inTpl) {
      if (t.startsWith('//')) continue;
      if (t.startsWith('/*')) {
        const e = t.indexOf('*/', 2);
        if (e < 0) { inBlock = true; continue; }
        if (!t.slice(e + 2).trim()) continue;
      }
      if (!t) continue;
    }
    out.push(line);
    // Đếm dấu ` không đứng sau \ để biết dòng sau còn nằm trong chuỗi mẫu không (đủ cho code của kit, không phải bộ phân tích JS).
    const ticks = (line.replace(/\\./g, '').match(/`/g) || []).length;
    if (ticks % 2) inTpl = !inTpl;
  }
  return out.join('\n');
}

/** Bỏ icon không dùng: định nghĩa --ic-<tên>: url(…) và lớp .ic-<tên> { --i: var(--ic-<tên>) }. */
export function trimIcons(html) {
  const names = [...new Set([...html.matchAll(/--ic-([a-z0-9-]+)\s*:\s*url\(/g)].map((m) => m[1]))];
  const def = (n) => new RegExp(`\\s*--ic-${n}\\s*:\\s*url\\("[^"]*"\\);?`, 'g');
  const cls = (n) => new RegExp(`\\s*\\.ic-${n}\\s*\\{\\s*--i\\s*:\\s*var\\(--ic-${n}\\)\\s*;?\\s*\\}`, 'g');
  let rest = html;
  for (const n of names) rest = rest.replace(def(n), '').replace(cls(n), '');
  for (const n of names) {
    const used = new RegExp(`(?<![\\w])ic-${n}(?![\\w-])|icon\\(\\s*['"\`]${n}['"\`]`).test(rest);
    if (!used) html = html.replace(def(n), '').replace(cls(n), '');
  }
  return html;
}

const BLOCK = /\/\*\s*@block\s+([a-z0-9-]+)([^*]*)\*\/([\s\S]*?)\/\*\s*@end\s+\1\s*\*\//g;
const CODE = /(<(style|script)\b[^>]*>)([\s\S]*?)(<\/\2>)/g;
// Dấu so trọn chữ; đứng sau dấu hai chấm thì không tính (":empty" là bộ chọn CSS, không phải lớp .empty).
const has = (text, tok) => new RegExp(`(?<![\\w:-])${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(text);

/** Bỏ chú thích thật của CSS, JS (/* … *\/ và // … tới hết dòng); chữ trong '…', "…", `…` giữ nguyên, kể cả "/*". */
export function stripComments(code) {
  let out = '', i = 0;
  const n = code.length;
  while (i < n) {
    const c = code[i];
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < n && code[j] !== c) j += code[j] === '\\' ? 2 : 1;
      out += code.slice(i, j + 1); i = j + 1; continue;
    }
    if (c === '/' && code[i + 1] === '*') { const e = code.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; out += ' '; continue; }
    // "//" là chú thích khi đứng đầu dòng hay sau khoảng trắng, dấu ; { } ( ) , (không phải url(https://…) viết không ngoặc)
    if (c === '/' && code[i + 1] === '/' && (i === 0 || /[\s;{}(),]/.test(code[i - 1]))) { const e = code.indexOf('\n', i); i = e < 0 ? n : e; out += ' '; continue; }
    out += c; i++;
  }
  return out;
}

/** Bỏ vùng của khối không dùng (chỉ vùng nằm trong <style>, <script>). drop: khối lệnh dựng đã bỏ, không giữ lại dù chữ
 *  trong trang có dấu của nó. Trả về html; danh sách khối đã bỏ ở trimBlocks.last (để lệnh dựng in ra, test xem). */
export function trimBlocks(html, { drop = [] } = {}) {
  const regions = [];
  for (const m of html.matchAll(CODE)) for (const r of m[3].matchAll(BLOCK)) regions.push({ name: r[1], toks: r[2].trim().split(/\s+/).filter(Boolean), body: r[3] });
  if (!regions.length) { trimBlocks.last = []; return html; }
  for (const r of regions) if (!r.toks.length) r.toks = [r.name];
  const off = new Set(drop);
  // Chữ được tính: cả trang trừ mọi vùng khối, chú thích CSS, JS (đầu kit.js kể tên mọi hàm) và chú thích HTML.
  let seen = html.replace(CODE, (m, a, tag, code, z) => a + stripComments(code.replace(BLOCK, ' ')) + z).replace(/<!--[\s\S]*?-->/g, ' ');
  const keep = new Set();
  for (let grew = true; grew;) {
    grew = false;
    for (const r of regions) if (!keep.has(r.name) && !off.has(r.name) && r.toks.some((t) => has(seen, t))) {
      keep.add(r.name);
      seen += ' ' + stripComments(regions.filter((x) => x.name === r.name).map((x) => x.body).join('\n'));
      grew = true;
    }
  }
  trimBlocks.last = [...new Set(regions.map((r) => r.name).filter((n) => !keep.has(n)))];
  return html.replace(CODE, (m, a, tag, code, z) => a + code.replace(BLOCK, (mm, name, toks, body) => keep.has(name) ? body : '') + z);
}
trimBlocks.last = [];

/** Bỏ khối không dùng, thu gọn các khối <style> và <script> viết trong trang (bỏ qua script có src hay type khác JS), rồi bỏ icon không dùng. */
export function packHtml(html, { icons = true, blocks = true, drop = [] } = {}) {
  if (blocks) html = trimBlocks(html, { drop });
  html = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, css, z) => a + minCss(css) + z)
    .replace(/(<script\b([^>]*)>)([\s\S]*?)(<\/script>)/g, (m, a, attrs, js, z) =>
      /\bsrc=|type=["'](?!module|text\/javascript)/.test(attrs) ? m : a + minJs(js) + z);
  return icons ? trimIcons(html) : html;
}
