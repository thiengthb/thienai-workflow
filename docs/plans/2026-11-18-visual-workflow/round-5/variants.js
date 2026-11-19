/* Vòng 5: lắp lại trang kế hoạch theo bố cục ở <html data-lay="...">. Chạy sau plan.js, chỉ dời khối có sẵn và thêm
   vài khối nhỏ (ô số, cột, thẻ) đọc từ chính trang; bản thien chọn sẽ viết lại gọn trong make-plan.mjs. */
(() => {
  const lay = document.documentElement.dataset.lay;
  if (!lay) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const P = JSON.parse($('#plan').textContent);
  const main = $('main.wrap'), head = $('header.ph');
  const stops = $$('li.stop');
  const name = (li) => $('h3', li).textContent.replace(/^Ga [^:]+:\s*/, '');
  const ticks = (li) => { const t = $$('.tasks li', li); return [t.filter((x) => x.classList.contains('done')).length, t.length]; };
  const hide = (s) => { const e = $(s); if (e) e.style.display = 'none'; };
  // Bản mới: mục tiêu dài gập còn ba dòng, bấm để mở hết (đầu trang KH9 chiếm nửa màn).
  const lead = $('.lead', head);
  if (lead) { lead.classList.add('clamp'); lead.tabIndex = 0; lead.title = 'Bấm để đọc hết';
    const t = () => lead.classList.toggle('clamp'); lead.addEventListener('click', t); lead.addEventListener('keydown', (e) => { if (e.key === 'Enter') t(); }); }
  const nf = (x) => String(x).replace('.', ',');

  if (lay === 'pending-b') {
    // Phiếu hỏi: câu hỏi ngay dưới đầu trang, mỗi câu một thẻ có số; phần kế hoạch thành "Bối cảnh để trả lời".
    const q = $('#cau-hoi');
    const n = $$('.q', q).length;
    $('h2', q).textContent = `${n} câu cần bạn trả lời`;
    q.insertBefore(el('p', 'phieu-note', `Mỗi câu đã chọn sẵn đề xuất: đồng ý cả thì bấm <b>Gửi cho Claude</b> ở cuối phiếu. Phần dưới phiếu là bối cảnh, đọc khi cần.`), $('#qs'));
    const strip = el('ol', 'phieu-steps');
    $$('.q', q).forEach((f, i) => { f.id = 'q-' + (i + 1); strip.append(el('li', '', `<a href="#q-${i + 1}"><b>${i + 1}</b>${$('legend', f).textContent.replace(/^\d+\.\s*/, '').slice(0, 34)}…</a>`)); });
    q.insertBefore(strip, $('#qs'));
    const ctx = el('div', 'ctx-head', '<span class="label">Bối cảnh để trả lời</span><h2>Kế hoạch sẽ chạy thế nào nếu bạn đồng ý</h2>');
    $('#tuyen').prepend(ctx);
    $$('#tuyen .acc[open]').forEach((d) => d.removeAttribute('open'));
    $('.prog', head)?.remove();   // 0/10 việc chưa nói gì khi chưa duyệt
  }

  if (lay === 'pending-c') {
    // Hỏi bên cạnh: màn rộng hai cột, phiếu hỏi dính bên phải; điện thoại phiếu nằm ngay sau "Đang ở đâu".
    const aside = el('aside', 'side-ask');
    aside.append($('#cau-hoi'));
    const left = el('div', 'col-read');
    [...main.children].forEach((c) => left.append(c));
    main.append(left, aside);
    $('#cau-hoi h2').textContent = `${$$('.q').length} câu, đề xuất chọn sẵn`;
  }

  if (lay === 'running-b') {
    // Bảng tiến độ: bốn ô số ngay dưới tên, rồi ba cột Xong · Đang chạy · Chưa tới thay cho tuyến dọc.
    const done = P.checkpoints.filter((c) => c.state === 'done').length;
    const now = P.checkpoints.find((c) => c.state === 'now');
    const left = P.checkpoints.filter((c) => c.state !== 'done' && c.state !== 'dropped' && c.est != null).reduce((s, c) => s + c.est, 0);
    const ask = $('.w-row.ask p');
    const [d, t] = ($('.prog .mono')?.textContent.match(/\d+/g) || [0, 0]).map(Number);
    const tiles = el('div', 'tiles');
    tiles.append(
      el('div', 'tile', `<span class="label">Việc xong</span><b class="big">${d}<small>/${t}</small></b><div class="bar"><span style="width:${t ? Math.round(100 * d / t) : 0}%"></span></div>`),
      el('div', 'tile', `<span class="label">Ga</span><b class="big">${done}<small>/${P.checkpoints.length} xong</small></b><span class="small muted">${now ? `đang ở ga ${now.num}` : 'không có ga đang chạy'}</span>`),
      el('div', 'tile', `<span class="label">Còn lại ước</span><b class="big">~${nf(left)}<small> phiên</small></b><span class="small muted">chưa tính ga mốc</span>`),
      el('a', 'tile ask', `<span class="label">Bạn cần làm</span><span class="small">${ask ? ask.textContent.slice(0, 120) : 'Không có'}</span>`));
    tiles.lastChild.href = '#dang-o';
    head.after(tiles);
    $('.prog', head).remove();
    const cols = el('div', 'kanban');
    const col = (k, t) => { const c = el('div', 'kcol ' + k, `<h3 class="label">${t}</h3>`); cols.append(c); return c; };
    const C = { done: col('done', 'Xong'), now: col('now', 'Đang chạy'), todo: col('todo', 'Chưa tới') };
    stops.forEach((li) => { (C[li.classList.contains('done') ? 'done' : li.classList.contains('now') ? 'now' : 'todo']).append(li); });
    Object.values(C).forEach((c) => $('h3', c).insertAdjacentHTML('beforeend', ` <span class="chip">${$$('li.stop', c).length}</span>`));
    $$('.stop:not(.now) .acc[open]').forEach((x) => x.removeAttribute('open'));
    $('ol.line').before(cols);   // ol.line để trống mà vẫn còn: plan.js đo nó khi cuộn
    $('.legend')?.remove();
    $('#h-line').textContent = 'Mỗi ga đang nằm ở cột nào';
  }

  if (lay === 'running-c') {
    // Tuyến ngang: các ga chạy ngang như sơ đồ tàu điện; bấm ga nào thì khung dưới mở ga đó (mặc định ga đang chạy).
    const line = $('ol.line');
    line.classList.add('h');
    const panel = el('div', 'ga-panel card');
    line.after(panel);
    const show = (li) => {
      stops.forEach((s) => { s.classList.toggle('sel', s === li); $('.dot', s).setAttribute('aria-pressed', String(s === li)); });
      const box = $('.box', li).cloneNode(true);
      box.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''));
      panel.replaceChildren(el('span', 'label', `Ga ${li.dataset.ck}`), box);
    };
    stops.forEach((li) => {
      const d = $('.dot', li);
      const b = el('button', 'dot', d.innerHTML); b.type = 'button';
      d.replaceWith(b);
      li.append(el('span', 'nm', name(li)));
      b.addEventListener('click', () => show(li));
    });
    show(stops.find((s) => s.classList.contains('now')) || stops[0]);
    $('#h-line').textContent = 'Bấm một ga để xem chi tiết';
  }

  if (lay === 'closed-b') {
    // Thẻ kết quả: đầu trang là ba con số; mỗi ga một thẻ "ra gì"; việc chưa làm gom thành thẻ "Chuyển đi".
    const done = P.checkpoints.filter((c) => c.state === 'done').length;
    const [d, t] = ($('.prog .mono')?.textContent.match(/\d+/g) || [0, 0]).map(Number);
    const days = [...new Set(P.checkpoints.map((c) => c.doneDate).filter(Boolean))].length;
    const nums = el('div', 'result-nums');
    nums.append(el('div', '', `<b>${done}<small>/${P.checkpoints.length}</small></b><span>ga xong</span>`),
      el('div', '', `<b>${d}<small>/${t}</small></b><span>việc đã tick</span>`),
      el('div', '', `<b>${days}</b><span>ngày làm</span>`),
      el('div', '', `<b>${$$('#nhat-ky details')[0]?.querySelector('.chip')?.textContent || 0}</b><span>lần đổi kế hoạch</span>`));
    $('.prog', head).replaceWith(nums);
    const grid = el('div', 'results');
    const moved = [];
    stops.forEach((li) => {
      const [x, y] = ticks(li);
      const open = $$('.tasks li:not(.done) > span:last-child', li).map((s) => s.innerHTML);
      moved.push(...open.map((h) => ({ ga: li.dataset.ck, h })));
      const dw = $('.done-when', li);
      grid.append(el('article', 'res card' + (li.classList.contains('done') ? ' ok' : ' part'), `
        <div class="rh"><span class="n">${li.classList.contains('done') ? '<i class="ic ic-check"></i>' : li.dataset.ck}</span><h3>${name(li)}</h3></div>
        ${dw ? `<p class="small">${dw.innerHTML.replace('<b>Xong khi:</b>', li.classList.contains('done') ? '<b>Đạt:</b>' : '<b>Chưa đạt:</b>')}</p>` : ''}
        <div class="rf"><span class="chip ${x === y ? 'good' : 'warn'}">${x}/${y} việc</span>${li.classList.contains('done') ? '' : '<span class="chip">đóng khi chưa xong</span>'}</div>`));
    });
    if (moved.length) grid.append(el('article', 'res card moved', `<div class="rh"><span class="n"><i class="ic ic-arrow-right"></i></span><h3>Chuyển đi</h3></div>
      <ul class="list">${moved.map((m) => `<li><span class="muted">Ga ${m.ga}:</span> ${m.h}</li>`).join('')}</ul>`));
    $('ol.line').before(grid);
    $('ol.line').replaceChildren();
    $('.legend')?.remove(); hide('#daymap'); hide('#mapmini');
    $('#h-line').textContent = 'Mỗi ga ra được gì';
    $('#tuyen .label').textContent = 'Kết quả';
  }

  if (lay === 'closed-c') {
    // Ba cột tổng kết: Được gì (ga xong), Đổi gì (bảng Đã đổi), Còn lại (việc chưa tick); chi tiết gập ở dưới.
    const got = stops.filter((li) => li.classList.contains('done')).map((li) => `<li><b>${name(li)}</b><span class="small muted">${($('.done-when', li)?.textContent || '').replace(/^Xong khi:\s*/, '').slice(0, 110)}…</span></li>`);
    const chg = $$('#nhat-ky details')[0];
    const rows = chg ? $$('tbody tr', chg).map((tr) => { const td = $$('td', tr); return `<li><span class="mono">${td[0].textContent.slice(5).split('-').reverse().join('/')}</span>${td[1].innerHTML.split(/[;(]/)[0]}</li>`; }) : [];
    const left = stops.flatMap((li) => $$('.tasks li:not(.done) > span:last-child', li).map((s) => `<li><span class="muted">Ga ${li.dataset.ck}:</span> ${s.innerHTML}</li>`));
    const retro = el('section', 'retro');
    retro.id = 'tong-ket';
    retro.innerHTML = `<div class="rc got"><h2><i class="ic ic-check"></i>Được gì <span class="chip">${got.length}</span></h2><ul>${got.join('')}</ul></div>
      <div class="rc chg"><h2><i class="ic ic-rotate-ccw"></i>Đổi gì <span class="chip">${rows.length}</span></h2><ul>${rows.join('')}</ul></div>
      <div class="rc left"><h2><i class="ic ic-arrow-right"></i>Còn lại <span class="chip">${left.length}</span></h2><ul>${left.join('') || '<li class="muted">Không còn gì.</li>'}</ul></div>`;
    head.after(retro);
    $('#tuyen').classList.add('folded');
    $('#tuyen .label').textContent = 'Chi tiết từng ga';
    $$('#tuyen .acc[open]').forEach((x) => x.removeAttribute('open'));
    hide('#daymap'); hide('#mapmini');
    const toc = $('#toc .in');
    toc.prepend(Object.assign(el('a'), { href: '#tong-ket', textContent: 'Tổng kết' }));
  }
})();
