#!/usr/bin/env node
// Dựng trang kế hoạch nhìn được từ một file docs/plans/*.md (xem README.md trong thư mục này).
//
//   node artifacts/plan/make-plan.mjs <plan.md> <out-dir> [--repo owner/repo] [--url <link trang cũ>] [--trial "<chi tiết thử>"]
//   node artifacts/plan/make-plan.mjs --check <plan.md|thư-mục> ...   chỉ in chỗ lệch mẫu, không dựng; thoát 1 khi có lỗi
//
// Ra: <out-dir>/index.html (đã gộp kit), <out-dir>/preview.html để mở thử, <out-dir>/publish.json để đăng.
// Khối của trang (KH9 ga 2): mặc định khối nào có nội dung thì có; dòng "Khối: a, b · Vì: <lý do>" dưới dòng Trạng thái
// chọn khối và thứ tự (tên ở PLAN_BLOCKS của parse-plan.mjs). Khối không có trên trang thì CSS, JS của nó cũng không
// (vùng @block trong template.html, plan.js, kit.css; kit/pack.mjs bỏ).
// Bố cục (KH9 ga 3): theo trạng thái, chờ duyệt → phiếu hỏi, đang chạy → bảng tiến độ, đã đóng → thẻ kết quả (pickLayout);
// dòng "Bố cục: mot-cot · Vì: <lý do>" đổi được.
// File lệch mẫu thì lệnh in từng chỗ kèm số dòng. Chỉ "lỗi" (thiếu tiêu đề, thiếu checkpoint) mới chặn dựng trang.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, realpathSync } from 'node:fs';
import { dirname, join, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { packHtml, trimBlocks } from '../kit/pack.mjs';
import { trialHtml, sendActsHtml } from '../kit/blocks.mjs';
import { writePublish } from '../kit/publish.mjs';
import { parsePlanFile, PLAN_BLOCKS } from './parse-plan.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (html) => String(html).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const ddmm = (iso) => { const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? `${m[2]}/${m[1]}` : ''; };
const icon = (n) => `<i class="ic ic-${n}" aria-hidden="true"></i>`;

/** Bố cục theo trạng thái (KH9 ga 3, thien chọn B cả ba loại ở vòng gu 5, 2026-11-19): chờ duyệt mà còn câu hỏi thì
 *  phiếu hỏi trước; đang chạy hay tạm dừng thì bảng tiến độ; xong hay bỏ thì thẻ kết quả; còn lại một cột ("Một nấc").
 *  Dòng "Bố cục: <tên> · Vì: <lý do>" của file thắng mặc định. */
export function pickLayout(plan) {
  if (plan.layout) return plan.layout.name;
  if (/^(xong|bỏ)/.test(plan.state)) return 'the-ket-qua';
  if (plan.state.startsWith('chờ')) return plan.questions.length && !plan.answered ? 'phieu-hoi' : 'mot-cot';
  return 'bang-tien-do';
}
/** Thứ tự khối mặc định của từng bố cục. Phiếu hỏi: câu hỏi lên đầu, bỏ "Đang ở đâu" (chưa duyệt thì chưa ở đâu);
 *  thẻ kết quả: không bản đồ ngày, không góp ý (kế hoạch đã đóng). */
const LAYOUT_BLOCKS = {
  'phieu-hoi': ['cau-hoi', 'tuyen', 'ban-do', 'phuong-an', 'them', 'nhat-ky'],
  'the-ket-qua': ['dang-o', 'tuyen', 'phuong-an', 'them', 'nhat-ky'],
};

/** Khối trang sẽ có, theo thứ tự: dòng "Khối:" của file nếu có, không thì mặc định của bố cục (khối nào có nội dung
 *  thì có). Khối được liệt kê mà không có nội dung thì bỏ, kèm một ghi chú. */
export function pickBlocks(plan, has, layout = 'mot-cot') {
  const auto = (LAYOUT_BLOCKS[layout] || PLAN_BLOCKS).filter((n) => has[n]);
  if (!plan.blocks) return { list: auto, notes: [] };
  const notes = [];
  const list = plan.blocks.names.filter((n) => {
    if (n === 'ban-do' && layout === 'the-ket-qua') { notes.push({ level: 'ghi chú', line: plan.blocks.line, msg: 'bố cục thẻ kết quả không có bản đồ ngày, trang bỏ khối "ban-do".' }); return false; }
    if (has[n]) return true;
    notes.push({ level: 'ghi chú', line: plan.blocks.line, msg: `khối "${n}" không có nội dung trong file này, trang bỏ qua.` });
    return false;
  });
  if (list.includes('ban-do') && !list.includes('tuyen')) notes.push({ level: 'lệch', line: plan.blocks.line, msg: 'khối "ban-do" nằm trong "tuyen": thiếu "tuyen" thì không có bản đồ.' });
  return { list: list.filter((n) => n !== 'ban-do' || list.includes('tuyen')), notes };
}

const STATE_CHIP = { 'đang chạy': 'accent', 'chờ duyệt': 'warn', 'tạm dừng': '', 'xong': 'good', 'bỏ': '' };
const STOP_LABEL = { done: 'xong', now: 'đang chạy', todo: 'chưa tới', dropped: 'bỏ' };
const nf = (x) => String(x).replace('.', ',');

/** Thân trang (HTML) và dữ liệu cho plan.js. */
export function render(plan, { id, repo = '', source = '', trial = '' } = {}) {
  const L = pickLayout(plan);
  const mapNeeded = plan.checkpoints.filter((c) => c.state !== 'dropped' && (c.doneDate || c.gate || c.estimate != null)).length >= 2;
  const has = { 'dang-o': plan.where.length > 0, tuyen: true, 'ban-do': mapNeeded, 'phuong-an': !!plan.options?.length,
    'cau-hoi': true, them: !!(plan.extras.length || plan.notDo.length), 'nhat-ky': true };
  const { list: blocks, notes } = pickBlocks(plan, has, L);
  const on = (n) => blocks.includes(n);
  const stateChip = `<span class="chip ${STATE_CHIP[plan.state.split(' ')[0] === 'chờ' ? 'chờ duyệt' : plan.state] ?? ''}">${esc(plan.stateFull || plan.state)}</span>`;
  const pct = plan.ticks.total ? Math.round(100 * plan.ticks.done / plan.ticks.total) : 0;
  const now = plan.checkpoints[plan.current];
  const cks = plan.checkpoints;
  const doneCks = cks.filter((c) => c.state === 'done').length;

  // Dòng có nhãn ("Đang ở:", "Còn thiếu:", "thien cần làm:") hiện thẳng; dòng không nhãn gập vào "Ghi chú thêm".
  const keyed = plan.where.filter((w) => w.key), loose = plan.where.filter((w) => !w.key);
  const where = plan.where.length ? `<div class="where card">${keyed.map((w) =>
    `<div class="w-row${w.ask ? ' ask' : ''}"><span class="label ${w.ask ? 'k2' : 'k1'}">${esc(w.key)}</span><p>${w.html}</p></div>`).join('')}${loose.length
    ? `<details class="acc w-more"><summary>Ghi chú thêm <span class="chip">${loose.length}</span></summary><ul class="list">${loose.map((w) => `<li>${w.html}</li>`).join('')}</ul></details>` : ''}</div>` : '';
  // Link tới ga đang chạy chỉ khi trang có tuyến ga (thẻ kết quả không có ga để nhảy tới).
  const jump = now && on('tuyen') && L !== 'the-ket-qua' ? `<a class="jump" href="#${now.id}"><span>Ga đang chạy · <b>${now.num}. ${esc(now.name)}</b></span>${icon('arrow-right')}</a>` : '';

  const taskList = (c) => c.tasks.length ? `<ul class="tasks">${c.tasks.map((t) => `<li class="${t.done ? 'done' : ''}"><span class="tick" role="img" aria-label="${t.done ? 'đã xong' : 'chưa xong'}">${t.done ? icon('check') : ''}</span><span>${t.html}</span></li>`).join('')}</ul>` : '';
  /** Một ga. focus: thẻ lớn của ga đang chạy trong bảng tiến độ, bỏ chip trạng thái (nhãn cột đã nói). */
  const stopHtml = (c, focus) => {
    const chips = [
      c.gate && c.state !== 'done' ? `<span class="chip warn">${icon('calendar')}mốc ${ddmm(c.gate)}</span>` : '',
      focus ? '' : `<span class="chip${c.state === 'now' ? ' accent' : c.state === 'done' ? ' good' : ''}">${STOP_LABEL[c.state]}</span>`,
      c.total ? `<span class="chip">${c.done}/${c.total} việc</span>` : '',
      c.estimate && c.state !== 'done' ? `<span class="chip">${icon('clock')}~${nf(c.estimate)} phiên</span>` : '',
    ].join('');
    // Ga đang chạy mở sẵn việc con; ở phiếu hỏi thì gập hết (tuyến ga chỉ là bối cảnh để trả lời).
    const openNow = c.state === 'now' && L !== 'phieu-hoi';
    const tasks = c.tasks.length || c.notes.length ? `<details class="acc"${openNow ? ' open' : ''}><summary>Việc con${c.total ? ` · ${c.done}/${c.total}` : ''}</summary><div>
      ${taskList(c)}
      ${c.notes.map((n) => `<p class="small muted">${n}</p>`).join('')}</div></details>` : '';
    return `<li class="stop ${c.state}${c.gate ? ' gate' : ''}" id="${c.id}" data-ck="${esc(c.num)}">
  <span class="dot" aria-hidden="true">${c.state === 'done' ? icon('check') : esc(c.num)}</span>
  <div class="box">
    <div class="head"><h3><span class="vh">Ga ${esc(c.num)}: </span>${c.nameHtml}</h3><span class="chips">${chips}</span></div>
    ${c.note ? `<p class="small muted">${c.note}</p>` : ''}
    ${c.doneWhen ? `<p class="done-when"><b>Xong khi:</b> ${c.doneWhen}</p>` : ''}
    ${tasks}
  </div>
</li>`;
  };
  const legend = `<p class="legend"><span><i class="lg done"></i>xong</span><span><i class="lg now"></i>đang chạy</span><span><i class="lg todo"></i>chưa tới</span>${cks.some((c) => c.gate) ? '<span><i class="lg gate"></i>mốc cố định</span>' : ''}</p>`;
  const daymap = mapNeeded && on('ban-do') ? `<div class="daymap card" id="daymap">
    <svg id="map" aria-hidden="true"></svg>
    <div class="knob" id="knob" hidden>
      <label for="pace"><b id="pace-v">3</b> phiên mỗi tuần</label>
      <input id="pace" type="range" min="1" max="6" step="1" value="3">
    </div>
    <p class="readout" id="readout" role="status"></p>
  </div>` : '';

  // Thân khối tuyến ga theo bố cục.
  let line;
  if (L === 'bang-tien-do') {
    // Bảng tiến độ, bản 2 (thien 20/11: ba cột bằng nhau quá hẹp khi trang mở nửa màn hình, cạnh chat): ga đang chạy là
    // thẻ lớn bên trái; bên phải "Chưa tới" rồi "Xong", mỗi ga một dòng gập mở. Cột trống thì không vẽ.
    const mini = (c) => `<li class="stop kmini ${c.state}${c.gate ? ' gate' : ''}" id="${c.id}" data-ck="${esc(c.num)}"><details class="acc"><summary>
    <span class="dot" aria-hidden="true">${c.state === 'done' ? icon('check') : esc(c.num)}</span><span class="nm"><span class="vh">Ga ${esc(c.num)}: </span>${c.nameHtml}</span>${c.total ? `<span class="chip">${c.done}/${c.total}</span>` : c.gate || c.estimate === 0 ? '<span class="chip">mốc</span>' : ''}</summary>
    <div class="box">${c.note ? `<p class="small muted">${c.note}</p>` : ''}${c.doneWhen ? `<p class="done-when"><b>Xong khi:</b> ${c.doneWhen}</p>` : ''}${taskList(c)}</div></details></li>`;
    const group = (k, t, list) => list.length ? `<div class="bcol ${k}"><h3 class="label">${t} <span class="chip">${list.length}</span></h3><ol>${list.map(mini).join('\n')}</ol></div>` : '';
    const nowList = cks.filter((c) => c.state === 'now');
    line = `<div class="line board">
  <div class="bcol now"><h3 class="label">Đang chạy</h3>${nowList.length ? `<ol>${nowList.map((c) => stopHtml(c, true)).join('\n')}</ol>` : '<p class="small muted">Không có ga đang chạy.</p>'}</div>
  <div class="bside">${group('todo', 'Chưa tới', cks.filter((c) => c.state === 'todo' || c.state === 'dropped'))}${group('done', 'Xong', cks.filter((c) => c.state === 'done'))}</div>
</div>`;
  } else if (L === 'the-ket-qua') {
    // Thẻ kết quả: mỗi ga một thẻ "ra gì" (Đạt hay Chưa đạt thay cho Xong khi), việc chưa tick gom vào thẻ "Chuyển đi".
    const moved = cks.flatMap((c) => c.tasks.filter((t) => !t.done).map((t) => ({ ga: c.num, html: t.html })));
    line = `<div class="res-grid">${cks.map((c) => {
      const ok = c.state === 'done';
      return `<article class="res card ${ok ? 'ok' : c.state === 'dropped' ? 'drop' : 'part'}">
  <div class="rh"><span class="n" aria-hidden="true">${ok ? icon('check') : esc(c.num)}</span><h3><span class="vh">Ga ${esc(c.num)}: </span>${c.nameHtml}</h3></div>
  ${c.doneWhen ? `<p class="small"><b>${ok ? 'Đạt' : 'Chưa đạt'}:</b> ${c.doneWhen}</p>` : ''}
  <div class="rf">${c.total ? `<span class="chip ${c.done === c.total ? 'good' : 'warn'}">${c.done}/${c.total} việc</span>` : ''}${ok ? '' : `<span class="chip">${c.state === 'dropped' ? 'bỏ' : 'đóng khi chưa xong'}</span>`}${c.doneDate ? `<span class="chip">${icon('calendar')}${ddmm(c.doneDate)}</span>` : ''}</div>
  ${c.tasks.length || c.notes.length ? `<details class="acc"><summary>${c.tasks.length ? `Việc con · ${c.done}/${c.total}` : 'Ghi chú'}</summary><div>${taskList(c)}${c.notes.map((n) => `<p class="small muted">${n}</p>`).join('')}</div></details>` : ''}
</article>`;
    }).join('\n')}${moved.length ? `<article class="res card moved"><div class="rh"><span class="n" aria-hidden="true">${icon('arrow-right')}</span><h3>Chuyển đi <span class="chip">${moved.length}</span></h3></div>
  <ul class="list">${moved.map((m) => `<li><span class="muted">Ga ${esc(m.ga)}:</span> ${m.html}</li>`).join('')}</ul></article>` : ''}</div>`;
  } else line = `<ol class="line">${cks.map((c) => stopHtml(c, false)).join('\n')}</ol>\n  ${legend}`;
  const lineHead = {
    'phieu-hoi': ['Bối cảnh để trả lời', 'Kế hoạch sẽ chạy thế nào nếu bạn đồng ý'],
    'bang-tien-do': ['Checkpoint', 'Đang làm ga nào, còn ga nào'],
    'the-ket-qua': ['Kết quả', 'Mỗi ga ra được gì'],
  }[L] || ['Checkpoint', `${cks.length} ga, mỗi ga xong khi bạn tự kiểm được`];

  let options = '';
  if (plan.options?.length) {
    const chosen = plan.options.find((o) => o.chosen);
    options = `<section id="phuong-an" aria-labelledby="h-pa">
  <span class="label">Các phương án đã xét</span>
  <h2 id="h-pa">${chosen ? `Chọn ${esc(chosen.key || plain(chosen.nameHtml))}, và đây là chỗ yếu của nó` : 'Các cách đã cân nhắc'}</h2>
  <div class="opts">${plan.options.map((o) => `<div class="opt card${o.chosen ? ' pick' : ''}"><span class="k">${esc(o.key || '·')}</span><div class="c">
    <span class="t">${o.nameHtml}${o.chosen ? '<span class="chip accent">đã chọn</span>' : ''}</span>
    <dl>${o.rows.map((r) => `<dt>${esc(r.label)}</dt><dd>${r.html}</dd>`).join('')}</dl></div></div>`).join('')}</div>
</section>`;
  }
  const notDo = plan.notDo.length ? `<div class="card pad"><h3>Không làm lần này</h3><ul class="list">${plan.notDo.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : '';

  const open = plan.questions.length && !plan.answered;
  const phieu = open && L === 'phieu-hoi';
  const answeredList = plan.questions.length && plan.answered ? `<div class="card pad"><h3>${plan.questionsTitle}</h3><ol class="list">${plan.questions.map((q) => `<li>${q.q}${q.options.find((o) => o.rec && !o.other) ? ` <span class="muted">${q.options.find((o) => o.rec).html}</span>` : ''}</li>`).join('')}</ol></div>` : '';
  // Phiếu hỏi: dải số nhảy tới từng câu (plan.js đặt id q-1, q-2… cho từng câu).
  const cut = (t, n) => t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
  const steps = phieu ? `<p class="phieu-note">Mỗi câu đã chọn sẵn đề xuất: đồng ý cả thì bấm <b>Gửi cho Claude</b> ở cuối phiếu. Phần dưới phiếu là bối cảnh, đọc khi cần.</p>
  <ol class="phieu-steps">${plan.questions.map((q, i) => `<li><a href="#q-${i + 1}"><b>${i + 1}</b><span>${esc(cut(q.qText, 40))}</span></a></li>`).join('')}</ol>` : '';
  const ask = `<section id="cau-hoi" aria-labelledby="h-q"${phieu ? ' class="phieu"' : ''}>
  <span class="label">${open ? 'Câu hỏi' : 'Góp ý'}</span>
  <h2 id="h-q">${phieu ? `${plan.questions.length} câu cần bạn trả lời` : open ? `${plan.questions.length} câu làm đổi việc. Để nguyên đề xuất là "ok"` : 'Bạn thấy trang này thế nào?'}</h2>
  ${steps}
  ${open && plan.questionsIntro ? `<p class="muted">${plan.questionsIntro}</p>` : ''}
  ${answeredList}
  <div class="qs" id="qs"></div>
  ${trialHtml(trial)}
  <div class="reply card pad kit-send">
    <label class="label" for="note">Ghi chú của bạn (không bắt buộc)</label>
    <textarea id="note" maxlength="3000" disabled placeholder="Ví dụ: ga 3 làm trước ga 4 được không?"></textarea>
    <p class="label">Câu trả lời sẽ gửi</p>
    <div class="preview" id="preview"></div>
    ${sendActsHtml()}
  </div>
</section>`;

  const acc = (title, html, count) => `<details class="acc"><summary>${title}${count != null ? ` <span class="chip">${count}</span>` : ''}</summary><div class="md">${html}</div></details>`;
  const table = (head, rows) => rows.length ? `<div class="table"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="muted small">Chưa có.</p>';
  let more = '';
  if (plan.extras.length || notDo) {
    more = `<section id="them" aria-labelledby="h-them"><span class="label">Thêm</span><h2 id="h-them">Phạm vi, thời gian, nghiên cứu</h2>${notDo}<div class="accs">${plan.extras.map((e) => acc(e.title, e.html)).join('')}</div></section>`;
  }
  const log = `<section id="nhat-ky" aria-labelledby="h-log"><span class="label">Nhật ký</span><h2 id="h-log">Đã đổi gì, gặp lỗi gì</h2><div class="accs">
  ${acc('Đã đổi so với bản duyệt', table(['Ngày', 'Đổi gì', 'Vì sao'], plan.changes), plan.changes.length)}
  ${acc('Lỗi gặp', table(['Ngày', 'Lỗi', 'Đã xử lý'], plan.errors), plan.errors.length)}</div></section>`;

  const metaChips = [stateChip,
    plan.approved && plan.approvedDate ? `<span class="chip">Duyệt ${ddmm(plan.approvedDate)}</span>` : '',
    plan.updated ? `<span class="chip">Cập nhật ${ddmm(plan.updated)}</span>` : '',
    plan.nick ? `<span class="chip">Nick ${esc(plan.nick)}</span>` : ''].join('');

  // Dưới tên: thanh tiến độ (một cột), không gì cả (phiếu hỏi: 0 việc chưa nói gì khi chưa duyệt), bốn ô số (bảng tiến độ)
  // hay bốn con số kết quả (thẻ kết quả).
  let summary = `<div class="prog"><div class="bar" role="img" aria-label="${plan.ticks.done} trên ${plan.ticks.total} việc đã xong"><span style="width:${pct}%"></span></div><span class="mono">${plan.ticks.done}/${plan.ticks.total} việc</span></div>`;
  if (L === 'phieu-hoi') summary = '';
  else if (L === 'bang-tien-do') {
    // Ga mốc (có ngày mốc, hay "Ước: mốc" thành 0) không tính vào số phiên còn lại.
    const open2 = cks.filter((c) => c.state === 'now' || c.state === 'todo');
    const moc = open2.some((c) => c.gate || c.estimate === 0);
    const rest = open2.filter((c) => !c.gate && c.estimate !== 0);
    const est = rest.reduce((s, c) => s + (c.estimate || 0), 0), unknown = rest.filter((c) => c.estimate == null).length;
    const askRow = plan.where.find((w) => w.ask);
    const askTag = on('dang-o') && askRow ? 'a' : 'div';
    summary = `<div class="tiles">
    <div class="tile"><span class="label">Việc xong</span><b class="big">${plan.ticks.done}<small>/${plan.ticks.total}</small></b><div class="bar" role="img" aria-label="${pct}%"><span style="width:${pct}%"></span></div></div>
    <div class="tile"><span class="label">Ga</span><b class="big">${doneCks}<small>/${cks.length} xong</small></b><span class="small muted">${now ? `đang ở ga ${esc(now.num)}` : 'không có ga đang chạy'}</span></div>
    <div class="tile"><span class="label">Còn lại ước</span><b class="big">${rest.length && est ? `~${nf(est)}<small> phiên</small>` : '–'}</b><span class="small muted">${unknown ? `${unknown} ga chưa ước` : moc ? 'chưa tính ga mốc' : rest.length ? 'theo dòng Ước của từng ga' : 'không còn ga nào'}</span></div>
    <${askTag} class="tile ask"${askTag === 'a' ? ' href="#dang-o"' : ''}><span class="label">Bạn cần làm</span><span class="small">${askRow ? askRow.html.replace(/<a\b[^>]*>|<\/a>/g, '') : 'Không có'}</span></${askTag}>
  </div>`;
  } else if (L === 'the-ket-qua') {
    const days = new Set(cks.filter((c) => c.state === 'done').map((c) => c.doneDate).filter(Boolean)).size;   // chỉ ga đã xong (PR #163 review)
    summary = `<div class="result-nums">
    <div><b>${doneCks}<small>/${cks.length}</small></b><span>ga xong</span></div>
    <div><b>${plan.ticks.done}<small>/${plan.ticks.total}</small></b><span>việc đã tick</span></div>
    <div><b>${days}</b><span>ngày có ga xong</span></div>
    <div><b>${plan.changes.length}</b><span>lần đổi kế hoạch</span></div>
  </div>`;
  }
  // Mục tiêu dài gập còn ba dòng ở bố cục mới (đầu trang KH9 chiếm nửa màn); nút chỉ hiện khi chữ bị cắt thật (plan.js).
  const clamp = L !== 'mot-cot';
  const lead = plan.goal ? `<p class="lead${clamp ? ' clamp' : ''}" id="lead">${plan.goal}</p>${clamp ? '<button type="button" class="btn ghost lead-more" aria-controls="lead" aria-expanded="false" hidden>Đọc hết mục tiêu</button>' : ''}` : '';

  // Mục lục: thanh trên ở điện thoại và máy tính bảng; cột bên trái ở màn rộng, kèm tiến độ gọn (side-prog chỉ hiện ở đó).
  const sideProg = `<div class="side-prog"><span class="label">Tiến độ</span><div class="bar"><span style="width:${pct}%"></span></div>
    <span class="small">${plan.ticks.done}/${plan.ticks.total} việc${now ? ` · đang ở ga ${esc(now.num)}` : ''}</span></div>`;
  // Bản đồ gọn: hiện dính dưới mục lục khi đã cuộn qua bản đồ đầy đủ mà còn ở trong tuyến; chỉ để xem đang tới đâu.
  // Chỉ ở bố cục một cột (đọc từng ga theo tuyến dọc); bố cục khác thì nó nổi đè lên nội dung mà không giúp gì (thien 20/11).
  const mini = daymap && L === 'mot-cot' ? `<div class="mapmini card" id="mapmini" aria-hidden="true"><svg id="map-mini"></svg><p class="mini-cap" id="mini-cap"></p></div>` : '';
  const sections = {
    'dang-o': `<section id="dang-o" aria-labelledby="h-where"><span class="label">Đang ở đâu</span><h2 id="h-where" class="vh">Đang ở đâu</h2>${where}${jump}</section>`,
    tuyen: `<section id="tuyen" aria-labelledby="h-line"${L === 'phieu-hoi' ? ' class="ctx"' : ''}>
  <span class="label">${lineHead[0]}</span>
  <h2 id="h-line">${lineHead[1]}</h2>
  ${daymap}
  ${line}
</section>`,
    'phuong-an': options, 'cau-hoi': ask, them: more, 'nhat-ky': log,
  };
  const TOC = { 'dang-o': 'Đang ở đâu', tuyen: { 'phieu-hoi': 'Bối cảnh', 'the-ket-qua': 'Kết quả' }[L] || 'Checkpoint', 'phuong-an': 'Phương án', 'cau-hoi': open ? 'Câu hỏi' : 'Góp ý', them: 'Thêm', 'nhat-ky': 'Nhật ký' };
  const toc = blocks.filter((n) => TOC[n]).map((n) => [n, TOC[n]]);
  const body = `<nav class="toc${L === 'bang-tien-do' ? ' wide' : ''}" id="toc" aria-label="Mục lục"><div class="in">${toc.map(([h, t]) => `<a href="#${h}">${t}</a>`).join('')}</div>${sideProg}</nav>
${mini}
<main class="wrap lay-${L}">
<header class="ph">
  <span class="label">Kế hoạch${repo ? ' · ' + esc(repo.split('/').pop()) : ''}</span>
  <h1>${plan.titleHtml}</h1>
  ${lead}
  <div class="meta">${metaChips}</div>
  ${summary}
</header>
${blocks.filter((n) => sections[n]).map((n) => sections[n]).join('\n')}
<footer>${source ? `Sinh từ <a href="${esc(source)}">${esc(source.replace(/^https:\/\/github\.com\//, ''))}</a>` : ''}${plan.links.length ? ' · ' + plan.links.map((l) => (l.key ? esc(l.key) + ': ' : '') + l.html).join(' · ') : ''}</footer>
</main>`;
  const data = {
    id, title: plain(plan.titleHtml), state: plan.state, layout: L, open: !!open, trial,
    questions: open && on('cau-hoi') ? plan.questions.map((q) => ({ id: q.id, q: q.q, qText: q.qText, options: q.options.map((o) => ({ html: o.html, text: o.text.replace(/\*\*|`/g, ''), rec: !!o.rec, other: !!o.other, why: o.why })) })) : [],
    checkpoints: cks.map((c) => ({ id: c.id, num: c.num, name: c.name.replace(/\*\*|`/g, ''), state: c.state, est: c.estimate, gate: c.gate, doneDate: c.doneDate })),
  };
  // Khối đã bỏ: báo cho pack.mjs, để chữ trong trang có tên khối (tiêu đề nhắc "cau-hoi") không giữ lại CSS, JS của nó.
  // Tên vùng ở template.html, plan.js; them và nhat-ky chung một vùng CSS. Thẻ kết quả không vẽ tuyến ga nên bỏ CSS của nó.
  const drop = ['dang-o', 'tuyen', 'ban-do', 'phuong-an', 'cau-hoi'].filter((n) => !on(n) || (n === 'tuyen' && L === 'the-ket-qua'));
  if (!on('them') && !on('nhat-ky')) drop.push('them-nhat-ky');
  return { body, data, blocks, notes, drop, layout: L };
}

export function build(mdPath, out, { repo = '', url = '', trial = '', today = '' } = {}) {
  const md = readFileSync(mdPath, 'utf8');
  const rel = repoPath(mdPath);
  const linkBase = repo && rel ? `${repo}:${rel}` : '';
  const { plan, issues } = parsePlanFile(md, { linkBase, today });
  const fatal = issues.filter((i) => i.level === 'lỗi');
  if (fatal.length) { const e = new Error(fatal.map((i) => `${mdPath}:${i.line}: ${i.msg}`).join('\n')); e.issues = issues; throw e; }
  const id = basename(mdPath).replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
  const { body, data, blocks, notes, drop, layout } = render(plan, { id, repo, source: repo && rel ? `https://github.com/${repo}/blob/main/${rel}` : '',
    // Chi tiết thử chỉ có khi truyền --trial: mặc định không có (thien 2026-11-19, KH8: trang nào cũng một chi tiết thử
    // thì thành khung lặp, mấy kế hoạch gần đây không bấm tới).
    trial });
  issues.push(...notes);
  const html = packHtml(readFileSync(join(here, 'template.html'), 'utf8')
    .replace('__TITLE__', () => esc(plain(plan.titleHtml)))
    .replace('/*KIT_CSS*/', () => readFileSync(join(here, '../kit/kit.css'), 'utf8'))
    .replace('/*KIT_JS*/', () => readFileSync(join(here, '../kit/kit.js'), 'utf8'))
    .replace('/*PLAN_JS*/', () => readFileSync(join(here, 'plan.js'), 'utf8'))
    .replace('<!--BODY-->', () => body)
    .replace('__PLAN__', () => JSON.stringify(data).replace(/</g, '\\u003c')), { drop });
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'index.html'), html);
  writeFileSync(join(out, 'preview.html'), `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>\n${html}\n</body></html>\n`);
  const lines = writePublish(out, { url, capabilities: { comments: {}, db: {} }, icon: 'plan', description: 'Kế hoạch: ' + plain(plan.titleHtml) });
  return { plan, issues, lines, id, blocks, layout, dropped: trimBlocks.last };
}

/** Đường dẫn của file trong repo git chứa nó (để link về GitHub), hay '' khi không trong repo. */
function repoPath(file) {
  try {
    const top = execFileSync('git', ['-C', dirname(resolve(file)), 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return relative(realpathSync(top), realpathSync(resolve(file))).split('\\').join('/');
  } catch { return ''; }
}

/** In chỗ lệch mẫu của một file; trả về số lỗi chặn dựng. */
export function report(file, issues, log = console.log) {
  const shown = issues.filter((i) => i.level !== 'ghi chú');
  const notes = issues.length - shown.length;
  if (!shown.length) log(`${file}: đúng mẫu${notes ? ` (${notes} ghi chú)` : ''}.`);
  for (const i of shown) log(`${file}:${i.line}: ${i.level}: ${i.msg}`);
  return issues.filter((i) => i.level === 'lỗi').length;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf('--' + n); if (i < 0) return ''; const v = args[i + 1]; if (!v || v.startsWith('--')) { console.error(`--${n} cần một giá trị`); process.exit(2); } return args.splice(i, 2)[1]; };
  if (args[0] === '--check') {
    const files = args.slice(1).flatMap((p) => statSync(p).isDirectory() ? readdirSync(p).filter((f) => f.endsWith('.md')).sort().map((f) => join(p, f)) : [p]);
    if (!files.length) { console.error('Cách dùng: node make-plan.mjs --check <plan.md|thư-mục> ...'); process.exit(2); }
    let bad = 0;
    for (const f of files) {
      const md = readFileSync(f, 'utf8');
      if (!/^## Checkpoint/m.test(md)) { console.log(`${f}: bỏ qua, viết trước mẫu (không có "## Checkpoint").`); continue; }
      bad += report(f, parsePlanFile(md).issues);
    }
    process.exit(bad ? 1 : 0);
  }
  const repo = opt('repo') || 'thiengthb/thienai-workflow', url = opt('url'), trial = opt('trial');
  const [mdPath, out] = args;
  if (!mdPath || !out) { console.error('Cách dùng: node make-plan.mjs <plan.md> <out-dir> [--repo owner/repo] [--url <link trang cũ>] [--trial "<chi tiết thử>"]'); process.exit(2); }
  try {
    const built = build(mdPath, resolve(out), { repo, url, trial });
    const { plan, issues, lines } = built;
    report(mdPath, issues);
    const { blocks, layout } = built;
    console.log(`Đã dựng "${plain(plan.titleHtml)}" (${plan.checkpoints.length} ga, ${plan.questions.length} câu hỏi${plan.answered ? ' đã trả lời' : ''}) vào ${resolve(out)}/index.html`);
    console.log(`Bố cục: ${layout}${plan.layout ? ` (theo dòng "Bố cục:", vì: ${plan.layout.why || 'chưa ghi'})` : ' (mặc định theo trạng thái)'}`);
    console.log(`Khối: ${blocks.join(', ')}${plan.blocks ? ` (theo dòng "Khối:", vì: ${plan.blocks.why || 'chưa ghi'})` : ' (mặc định theo nội dung)'}`);
    for (const l of lines) console.log(l);
    if (!plan.page) console.log(`Đăng xong: thêm " · Trang: <link> (nick <nick>)" vào dòng "Trạng thái:" của ${mdPath}, để trang tổng quan dẫn sang trang này và lần sau đăng đè bằng --url.`);
    else if (!url) console.log(`File đã có trang ${plan.page}: muốn đăng đè thì chạy lại với --url ${plan.page}.`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
