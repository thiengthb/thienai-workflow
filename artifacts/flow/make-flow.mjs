#!/usr/bin/env node
// Dựng trang luồng chạy từ một file JSON (xem README.md trong thư mục này).
//
//   node artifacts/flow/make-flow.mjs <luồng.json> <out-dir> [--repo owner/repo] [--url <link trang cũ>] [--trial "<chi tiết thử>"]
//   node artifacts/flow/make-flow.mjs --check <luồng.json|thư-mục> ...   chỉ in chỗ sai, không dựng; thoát 1 khi có lỗi
//
// Ra: <out-dir>/index.html (đã gộp kit, dagre, diagram.js), <out-dir>/preview.html để mở thử, <out-dir>/publish.json để đăng.
// File luồng là một spec của Diagram.mount (kit/diagram.js) cộng vài trường của trang; "lỗi" chặn dựng, "lệch" chỉ báo.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, realpathSync } from 'node:fs';
import { dirname, join, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { packHtml } from '../kit/pack.mjs';
import { trialHtml, sendActsHtml } from '../kit/blocks.mjs';
import { writePublish } from '../kit/publish.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const lf = (s) => s.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ddmm = (iso) => { const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? `${m[2]}/${m[1]}` : ''; };
const icon = (n) => `<i class="ic ic-${n}" aria-hidden="true"></i>`;
const isStr = (v) => typeof v === 'string' && v.trim() !== '';

/** Chữ một dòng: escape hết, rồi chỉ cho `code`, **đậm** và [chữ](https://...). */
export function inline(s) {
  const codes = [];
  let h = esc(s).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  h = h.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
  return h.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
}

/** Kiểm file luồng. Trả về { flow (đã chuẩn hoá), issues: [{ level: 'lỗi'|'lệch', at, msg }] }. */
export function readFlow(raw) {
  const issues = [];
  const bad = (at, msg) => issues.push({ level: 'lỗi', at, msg });
  const off = (at, msg) => issues.push({ level: 'lệch', at, msg });
  let j;
  try { j = typeof raw === 'string' ? JSON.parse(lf(raw)) : raw; } catch (e) { bad('', 'không đọc được JSON: ' + e.message); return { flow: null, issues }; }
  if (!j || typeof j !== 'object' || Array.isArray(j)) { bad('', 'file phải là một object JSON'); return { flow: null, issues }; }
  if (!isStr(j.title)) bad('title', 'thiếu tên luồng');
  if (j.updated != null && !/^\d{4}-\d{2}-\d{2}$/.test(j.updated)) off('updated', 'ngày viết dạng YYYY-MM-DD');

  const nodes = [], ids = new Set();
  (Array.isArray(j.nodes) ? j.nodes : []).forEach((n, i) => {
    const at = `nodes[${i}]`;
    if (!n || !isStr(String(n.id ?? ''))) { bad(at, 'khối thiếu id'); return; }
    const id = String(n.id);
    if (ids.has(id)) { bad(at, `id "${id}" trùng`); return; }
    if (!/^[\w-]+$/.test(id)) bad(at, `id "${id}" chỉ được có chữ không dấu, số, gạch dưới, gạch ngang`);
    if (n.kind != null && !/^[\w-]+$/.test(n.kind)) off(at, `kind "${n.kind}" không dùng được làm tên lớp, trang bỏ qua`);
    ids.add(id);
    nodes.push({ id, label: isStr(n.label) ? n.label : id, note: isStr(n.note) ? n.note : '', kind: /^[\w-]+$/.test(n.kind || '') ? n.kind : '' });
  });
  if (!nodes.length) bad('nodes', 'luồng chưa có khối nào');

  const edges = [];
  (Array.isArray(j.edges) ? j.edges : []).forEach((e, i) => {
    const at = `edges[${i}]`;
    const ed = Array.isArray(e) ? { from: e[0], to: e[1], label: e[2] } : e || {};
    const from = String(ed.from ?? ''), to = String(ed.to ?? '');
    if (!ids.has(from) || !ids.has(to)) { bad(at, `mũi tên ${from || '?'} → ${to || '?'} trỏ tới khối không có`); return; }
    edges.push({ from, to, label: isStr(ed.label) ? ed.label : '' });
  });

  const steps = [], seen = new Set();
  (Array.isArray(j.steps) ? j.steps : []).forEach((s, i) => {
    const at = `steps[${i}]`;
    const st = typeof s === 'string' ? { id: s } : s || {};
    const id = String(st.id ?? '');
    if (!ids.has(id)) { bad(at, `bước trỏ tới khối "${id}" không có`); return; }
    if (seen.has(id)) { bad(at, `khối "${id}" là bước hai lần`); return; }
    seen.add(id);
    const node = nodes.find((n) => n.id === id);
    const note = isStr(st.note) ? st.note : node.note;
    if (!note) off(at, `bước "${node.label}" chưa có chữ (note): trang chỉ hiện tên khối`);
    const chips = Array.isArray(st.chips) ? st.chips.filter(isStr) : [];
    if (st.chips != null && (!Array.isArray(st.chips) || chips.length !== st.chips.length)) off(at, 'chips phải là danh sách chữ');
    steps.push({ id, note, more: isStr(st.more) ? st.more : '', chips });
  });
  if (!steps.length) bad('steps', 'luồng chưa có bước nào: trang luồng đi theo từng bước');

  const linked = new Set(edges.flatMap((e) => [e.from, e.to]));
  nodes.forEach((n, i) => { if (nodes.length > 1 && !linked.has(n.id)) off(`nodes[${i}]`, `khối "${n.label}" không nối với khối nào`); });
  nodes.forEach((n, i) => { if (!seen.has(n.id) && !n.note) off(`nodes[${i}]`, `khối phụ "${n.label}" chưa có note: trang không giải thích được nó`); });

  const sources = Array.isArray(j.sources) ? j.sources.filter(isStr) : [];
  const flow = { title: isStr(j.title) ? j.title : '', intro: isStr(j.intro) ? j.intro : '', updated: j.updated || '', page: isStr(j.page) ? j.page : '',
    sources, nodes, edges, steps, dir: j.dir || 'auto' };
  return { flow, issues };
}

/** Thân trang (HTML) và dữ liệu cho flow.js. */
export function render(flow, { id, repo = '', source = '', trial = '' } = {}) {
  const node = new Map(flow.nodes.map((n) => [n.id, n]));
  const stepIdx = new Map(flow.steps.map((s, i) => [s.id, i]));
  const ref = (nid) => stepIdx.has(nid) ? `<a href="#b-${esc(nid)}">${esc(node.get(nid).label)}</a>` : `<a href="#n-${esc(nid)}">${esc(node.get(nid).label)}</a>`;
  const aside = flow.nodes.filter((n) => !stepIdx.has(n.id));

  const steps = flow.steps.map((s, i) => {
    const n = node.get(s.id);
    // Chữ đi kèm hình: mũi tên của sơ đồ cũng viết thành chữ ngay dưới bước (rẽ nhánh, quay lại, nhận từ khối phụ).
    const out = flow.edges.filter((e) => e.from === s.id);
    const inn = flow.edges.filter((e) => e.to === s.id && !stepIdx.has(e.from));
    const back = (e) => stepIdx.has(e.to) && stepIdx.get(e.to) <= i;
    const ways = [
      ...inn.map((e) => `<li class="in">${icon('arrow-right')}<span>Nhận từ ${ref(e.from)}${e.label ? ` <span class="muted">(${esc(e.label)})</span>` : ''}</span></li>`),
      ...out.map((e) => `<li class="${back(e) ? 'back' : 'out'}">${icon(back(e) ? 'rotate-ccw' : 'arrow-right')}<span>${e.label ? `<b>${esc(e.label)}</b>: ${back(e) ? 'quay lại ' : ''}` : back(e) ? 'Quay lại ' : 'Tiếp: '}${ref(e.to)}</span></li>`),
    ].join('');
    return `<li class="beat" id="b-${esc(s.id)}" data-i="${i}">
  <div class="s-head"><span class="s-num" aria-hidden="true">${i + 1}</span><h2><span class="vh">Bước ${i + 1}: </span>${esc(n.label)}</h2></div>
  ${s.note ? `<p class="s-note">${inline(s.note)}</p>` : ''}
  ${s.more ? `<p class="s-more">${inline(s.more)}</p>` : ''}
  ${s.chips.length ? `<p class="s-chips">${s.chips.map((c) => `<code class="chip">${esc(c)}</code>`).join('')}</p>` : ''}
  ${ways ? `<ul class="ways">${ways}</ul>` : ''}
</li>`;
  }).join('\n');

  const asideHtml = aside.length ? `<section class="aside" aria-labelledby="h-aside"><span class="label">Ngoài luồng chính</span><h2 id="h-aside" class="vh">Ngoài luồng chính</h2>
  <ul class="nodes">${aside.map((n) => `<li class="card pad" id="n-${esc(n.id)}"><b>${esc(n.label)}</b>${n.note ? `<p class="small">${inline(n.note)}</p>` : ''}</li>`).join('')}</ul></section>` : '';

  const spec = { title: flow.title, nodes: flow.nodes.map((n) => ({ id: n.id, label: n.label, kind: n.kind })), edges: flow.edges.map((e) => [e.from, e.to, e.label]), steps: flow.steps.map((s) => s.id) };
  const n = flow.steps.length;
  const chips = [`<span class="chip">${n} bước</span>`,
    flow.edges.some((e) => stepIdx.has(e.to) && stepIdx.has(e.from) && stepIdx.get(e.to) <= stepIdx.get(e.from)) ? `<span class="chip">${icon('rotate-ccw')}có vòng lặp</span>` : '',
    flow.edges.some((e, k, all) => all.filter((x) => x.from === e.from).length > 1) ? '<span class="chip">có rẽ nhánh</span>' : '',
    flow.updated ? `<span class="chip">Cập nhật ${ddmm(flow.updated)}</span>` : ''].join('');
  const srcLinks = flow.sources.map((p) => repo ? `<a href="https://github.com/${esc(repo)}/blob/main/${esc(p)}">${esc(p)}</a>` : `<code>${esc(p)}</code>`).join(', ');

  const body = `<main class="wrap">
<header class="ph">
  <span class="label">Luồng${repo ? ' · ' + esc(repo.split('/').pop()) : ''}</span>
  <h1>${esc(flow.title)}</h1>
  ${flow.intro ? `<p class="lead">${inline(flow.intro)}</p>` : ''}
  <div class="meta">${chips}</div>
  <p class="hint small">${icon('info')}<span>Cuộn xuống để đi từng bước: sơ đồ đứng yên ${'<span class="only-narrow">ở trên</span><span class="only-wide">bên phải</span>'}, khối đang đọc sáng lên. Chạm một khối để nhảy tới bước đó.</span></p>
</header>
<div class="story">
  <div class="band" id="band">
    <div class="dg-host" id="flow-dg"></div>
    <p class="cap" id="cap" role="status"></p>
  </div>
  <ol class="beats" id="beats">
${steps}
  </ol>
</div>
${asideHtml}
<section id="ke-lai" class="retell" aria-labelledby="h-retell">
  <span class="label">Tự kể lại</span>
  <h2 id="h-retell">Luồng rẽ ở đâu? Quay lại ở đâu?</h2>
  <p class="muted">Kể bằng lời của bạn, đừng chép tên khối. Đừng cuộn lên, đừng mở file nào. Vài câu là đủ: bắt đầu từ đâu, chỗ nào chia hai đường, chỗ nào vòng lại và vì sao. Claude đọc và chỉ chỗ thiếu.</p>
  <div class="reply card pad kit-send">
    <label class="label" for="tell">Luồng "${esc(flow.title)}" theo bạn</label>
    <textarea id="tell" maxlength="3000" disabled placeholder="Ví dụ: mình nhắn học thì Claude soạn trang; nếu kiểm còn thiếu thì quay lại ghi tiếp, đủ rồi mới mở PR..."></textarea>
    ${trialHtml(trial)}
    ${sendActsHtml()}
  </div>
</section>
<footer>${source ? `Sinh từ <a href="${esc(source)}">${esc(source.replace(/^https:\/\/github\.com\//, ''))}</a>` : ''}${srcLinks ? `${source ? ' · ' : ''}Theo ${srcLinks}` : ''}</footer>
</main>`;
  const data = { id, title: flow.title, trial, spec, labels: flow.steps.map((s) => node.get(s.id).label) };
  return { body, data };
}

export function build(jsonPath, out, { repo = '', url = '', trial = '' } = {}) {
  const { flow, issues } = readFlow(readFileSync(jsonPath, 'utf8'));
  const fatal = issues.filter((i) => i.level === 'lỗi');
  if (fatal.length) { const e = new Error(fatal.map((i) => `${jsonPath}: ${i.at ? i.at + ': ' : ''}${i.msg}`).join('\n')); e.issues = issues; throw e; }
  const rel = repoPath(jsonPath);
  const id = basename(jsonPath).replace(/\.json$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const { body, data } = render(flow, { id, repo, source: repo && rel ? `https://github.com/${repo}/blob/main/${rel}` : '',
    trial });   // chi tiết thử chỉ khi truyền --trial (KH8, 2026-11-19)
  const html = packHtml(lf(readFileSync(join(here, 'template.html'), 'utf8'))
    .replace('__TITLE__', () => esc(flow.title))
    .replace('/*KIT_CSS*/', () => lf(readFileSync(join(here, '../kit/kit.css'), 'utf8')))
    .replace('/*KIT_JS*/', () => lf(readFileSync(join(here, '../kit/kit.js'), 'utf8')))
    .replace('/*DAGRE_JS*/', () => lf(readFileSync(join(here, '../kit/vendor/dagre.min.js'), 'utf8')))
    .replace('/*DIAGRAM_JS*/', () => lf(readFileSync(join(here, '../kit/diagram.js'), 'utf8')))
    .replace('/*FLOW_JS*/', () => lf(readFileSync(join(here, 'flow.js'), 'utf8')))
    .replace('<!--BODY-->', () => body)
    .replace('__FLOW__', () => JSON.stringify(data).replace(/</g, '\\u003c')));
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  const lines = writePublish(out, { url: url || flow.page, capabilities: { comments: {}, db: {} }, icon: 'flow', description: 'Luồng: ' + flow.title });
  return { flow, issues, lines, id };
}

/** Đường dẫn của file trong repo git chứa nó (để link về GitHub), hay '' khi không trong repo. */
function repoPath(file) {
  try {
    const top = execFileSync('git', ['-C', dirname(resolve(file)), 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return relative(realpathSync(top), realpathSync(resolve(file))).split('\\').join('/');
  } catch { return ''; }
}

/** In chỗ sai của một file; trả về số lỗi chặn dựng. */
export function report(file, issues, log = console.log) {
  if (!issues.length) log(`${file}: đúng mẫu.`);
  for (const i of issues) log(`${file}: ${i.at ? i.at + ': ' : ''}${i.level}: ${i.msg}`);
  return issues.filter((i) => i.level === 'lỗi').length;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf('--' + n); if (i < 0) return ''; const v = args[i + 1]; if (!v || v.startsWith('--')) { console.error(`--${n} cần một giá trị`); process.exit(2); } return args.splice(i, 2)[1]; };
  if (args[0] === '--check') {
    const files = args.slice(1).flatMap((p) => statSync(p).isDirectory() ? readdirSync(p).filter((f) => f.endsWith('.json')).sort().map((f) => join(p, f)) : [p]);
    if (!files.length) { console.error('Cách dùng: node make-flow.mjs --check <luồng.json|thư-mục> ...'); process.exit(2); }
    let bad = 0;
    for (const f of files) bad += report(f, readFlow(readFileSync(f, 'utf8')).issues);
    process.exit(bad ? 1 : 0);
  }
  const repo = opt('repo') || 'thiengthb/thienai-workflow', url = opt('url'), trial = opt('trial');
  const [jsonPath, out] = args;
  if (!jsonPath || !out) { console.error('Cách dùng: node make-flow.mjs <luồng.json> <out-dir> [--repo owner/repo] [--url <link trang cũ>] [--trial "<chi tiết thử>"]'); process.exit(2); }
  try {
    const { flow, issues, lines } = build(jsonPath, resolve(out), { repo, url, trial });
    if (issues.length) report(jsonPath, issues);
    console.log(`Đã dựng "${flow.title}" (${flow.steps.length} bước, ${flow.nodes.length} khối) vào ${resolve(out)}/index.html`);
    for (const l of lines) console.log(l);
    if (!flow.page) console.log(`Đăng xong: thêm "page": "<link>" vào ${jsonPath} để lần sau tự đăng đè.`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
