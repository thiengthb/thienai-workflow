// Đóng gói trang trước khi đăng: trang nhẹ hơn mà không đổi cách chạy. Mọi lệnh dựng trang gọi packHtml ở bước cuối
// (make-lesson, make-review, make-decision, make-round, progress-page; make-gallery chỉ thu gọn, giữ đủ icon để xem).
//
//   packHtml(html, { icons = true })  thu gọn mọi khối <style> và <script> viết trong trang, bỏ icon không dùng
//   minCss(css)   bỏ chú thích và khoảng trắng thừa; giữ nguyên chuỗi trong ngoặc kép (content, url("data:…"))
//   minJs(js)     chỉ bỏ dòng chú thích đứng riêng (// … hay khối /* … */ chiếm trọn dòng); không đổi một ký tự code nào
//   trimIcons(html)  bỏ biến --ic-<tên> và lớp .ic-<tên> mà trang không nhắc tới
//
// Icon được giữ khi trang có "ic-<tên>" (class, var(--ic-<tên>)) hay Kit.icon('<tên>') viết thẳng tên. Gọi Kit.icon với
// tên nằm trong biến thì lệnh không thấy: viết thẳng tên, hay dựng với { icons: false }.
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

/** Thu gọn các khối <style> và <script> viết trong trang (bỏ qua script có src hay type khác JS), rồi bỏ icon không dùng. */
export function packHtml(html, { icons = true } = {}) {
  html = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, css, z) => a + minCss(css) + z)
    .replace(/(<script\b([^>]*)>)([\s\S]*?)(<\/script>)/g, (m, a, attrs, js, z) =>
      /\bsrc=|type=["'](?!module|text\/javascript)/.test(attrs) ? m : a + minJs(js) + z);
  return icons ? trimIcons(html) : html;
}
