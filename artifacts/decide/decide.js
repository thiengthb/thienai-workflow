/* Trang chọn phương án (xem artifacts/decide/README.md). Dữ liệu nằm trong <script id="decision">.
   thien chọn một phương án; đề xuất của Claude chỉ hiện sau khi chọn, để thien chọn theo mắt mình trước.
   Lựa chọn và ghi chú lưu vào máy và db của trang ở decisions/<id>. Comment: dùng comment có sẵn của claude.ai,
   ghim vào cột hoặc thẻ của phương án (mỗi cái có id riêng: col-<key>, opt-<key>). */
(() => {
  const D = JSON.parse(document.getElementById('decision').textContent);
  const $ = (id) => document.getElementById(id);
  const opts = D.options || [];
  const byKey = (k) => opts.find((o) => o.key === k);
  const DB_PATH = 'decisions/' + String(D.id).replace(/[^a-z0-9-]/gi, '-');
  const store = Kit.store('decide:' + D.id, DB_PATH);
  const S = { pick: '', note: '', at: '' };
  let loaded = false;
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids.filter((k) => k != null)); return e; };
  const lock = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const bulb = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>';

  const pros = (o) => el('ul', { className: 'pc' }, ...(o.pros || []).map((t) => el('li', { className: 'p', textContent: t })), ...(o.cons || []).map((t) => el('li', { className: 'c', textContent: t })));
  const shot = (o, h) => {
    if (!o.image) return null;
    const b = el('button', { type: 'button', className: 'shot', title: 'Phóng to' }, el('img', { src: o.image.src, alt: 'Ảnh ' + o.name, loading: 'lazy' }), el('span', { className: 'zoom-hint', textContent: 'Phóng to' }));
    b.querySelector('img').style.height = h;
    b.addEventListener('click', () => zoom(o));
    return b;
  };
  const pickBtn = (o, label) => {
    const b = el('button', { type: 'button', className: 'btn primary pick', textContent: label, disabled: !loaded });
    b.dataset.key = o.key;
    b.setAttribute('aria-pressed', String(S.pick === o.key));
    b.addEventListener('click', () => choose(o.key));
    return b;
  };
  const chip = (v) => el('span', { className: 'chip ' + (v.tone || ''), textContent: v.text });

  function renderTable() {
    const t = el('table');
    const cg = el('colgroup', {}, el('col'));
    opts.forEach((o) => cg.append(el('col', { className: S.pick === o.key ? 'chosen-col' : '' })));
    const hr = el('tr', {}, el('th', { scope: 'col', textContent: '' }));
    for (const o of opts) {
      const th = el('th', { scope: 'col', id: 'col-' + o.key }, shot(o, ''), el('b', { textContent: o.name }), el('span', { className: 'sum', textContent: o.summary || '' }));
      hr.append(th);
    }
    const body = el('tbody');
    for (const c of D.criteria || []) body.append(el('tr', {}, el('th', { scope: 'row', textContent: c.name }), ...opts.map((o) => el('td', {}, c.values[o.key] ? chip(c.values[o.key]) : ''))));
    if (opts.some((o) => (o.pros || []).length || (o.cons || []).length)) body.append(el('tr', {}, el('th', { scope: 'row', textContent: 'Điểm chính' }), ...opts.map((o) => el('td', {}, pros(o)))));
    body.append(el('tr', { className: 'picks' }, el('th'), ...opts.map((o) => el('td', {}, pickBtn(o, S.pick === o.key ? 'Đã chọn ' + o.short : 'Chọn ' + o.short)))));
    t.append(cg, el('thead', {}, hr), body);
    $('table').replaceChildren(t);
  }

  function renderCards() {
    $('cards').replaceChildren(...opts.map((o) => {
      const crit = (D.criteria || []).filter((c) => c.values[o.key]).map((c) => el('span', {}, c.name + ': ', chip(c.values[o.key])));
      const card = el('article', { className: 'card opt' + (S.pick === o.key ? ' chosen' : ''), id: 'opt-' + o.key },
        shot(o, ''),
        el('div', { className: 'ob' }, el('h2', { textContent: o.name }), o.summary ? el('p', { className: 'muted', textContent: o.summary }) : null,
          crit.length ? el('div', { className: 'crit' }, ...crit) : null, pros(o)),
        el('div', { className: 'of' }, pickBtn(o, S.pick === o.key ? 'Đã chọn bản này' : 'Chọn bản này')));
      return card;
    }));
  }

  function renderRec() {
    const r = $('rec');
    const rec = D.recommend && byKey(D.recommend.key);
    if (!rec) { r.hidden = true; return; }
    if (!S.pick) { r.className = 'rec'; r.innerHTML = lock; r.append(el('span', { textContent: 'Đề xuất của Claude đang ẩn, hiện ra sau khi bạn chọn, để bạn chọn theo mắt mình trước.' })); return; }
    r.className = 'rec open'; r.innerHTML = bulb;
    const same = S.pick === rec.key;
    r.append(el('span', {}, el('b', { textContent: 'Claude đề xuất ' + rec.name + '. ' }), D.recommend.why || '', ' ',
      el('span', { className: same ? 'same' : '', textContent: same ? 'Bạn chọn giống đề xuất.' : 'Bạn chọn khác: Claude làm theo lựa chọn của bạn.' })));
  }

  function render() {
    renderTable(); renderCards(); renderRec();
    const has = !!S.pick || !!S.note.trim();
    $('send').disabled = !loaded || !has; $('copy').disabled = !loaded || !has;
    $('status').textContent = !loaded ? 'Đang tải lựa chọn đã lưu…' : S.pick ? 'Bạn chọn: ' + byKey(S.pick).name + '. Bấm "Gửi cho Claude" khi xong.' : 'Chưa chọn phương án nào.';
  }

  function choose(key) {
    if (!loaded) return;
    S.pick = S.pick === key ? '' : key;   // bấm lại bản đang chọn là bỏ chọn
    S.at = new Date().toISOString();
    render(); store.save({ ...S });
    const b = document.querySelector(`.pick[data-key="${CSS.escape(key)}"]:not([hidden])`);
    if (b && b.offsetParent) b.focus();
  }

  function zoom(o) {
    const d = $('zoom');
    $('zoom-t').textContent = o.name; $('zoom-img').src = o.image.src; $('zoom-img').alt = 'Ảnh ' + o.name;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  $('zoom-x').addEventListener('click', () => { const d = $('zoom'); if (d.close) d.close(); else d.removeAttribute('open'); });
  $('zoom').addEventListener('click', (e) => { if (e.target === e.currentTarget && e.currentTarget.close) e.currentTarget.close(); });

  function results(st) {
    const p = byKey(st.pick), rec = D.recommend && byKey(D.recommend.key);
    const L = [`# Quyết định: ${D.question}`, '', `Vòng: ${D.id}`, '', p ? `Bạn chọn: **${p.name}**` : 'Bạn chưa chọn phương án nào.'];
    if (rec && p) L.push(p.key === rec.key ? `Giống đề xuất của Claude (${rec.name}).` : `Claude đã đề xuất ${rec.name}.`);
    if (st.note.trim()) L.push('', '## Ghi chú', st.note.trim());
    L.push('', 'Comment ghim trên claude.ai: Claude đọc thẳng trên trang.');
    return L.join('\n');
  }

  $('note').addEventListener('input', () => { S.note = $('note').value; render(); store.save({ ...S }); });
  $('copy').addEventListener('click', () => { const st = { ...S }; store.save(st, true); Kit.copy(results(st)); });
  $('send').addEventListener('click', async () => {
    const st = { ...S };   // one snapshot: what is saved is what is sent
    store.save(st, true);
    const text = results(st);
    if (await Kit.sendToClaude(text, document.querySelector('.head'))) Kit.toast('Đã gửi cho Claude. Claude trả lời trong comment.', 5000);
    else Kit.toast(await Kit.copy(text) ? 'Chưa gửi thẳng được. Kết quả đã chép: dán vào chat cho Claude.' : 'Chưa gửi thẳng được. Chép kết quả trong ô bên dưới rồi dán vào chat cho Claude.', 8000);
  });

  async function start() {
    document.title = D.title || D.question;
    $('count').textContent = `Cần bạn chọn · ${opts.length} phương án`;
    $('q').textContent = D.question; $('why').textContent = D.context || ''; $('why').hidden = !D.context;
    render();
    // Controls stay off until the saved choice is in, so nothing typed or picked meanwhile can be overwritten.
    const saved = await store.load();
    if (saved) {
      if (typeof saved.pick === 'string' && (saved.pick === '' || byKey(saved.pick))) S.pick = saved.pick;
      if (typeof saved.note === 'string') S.note = saved.note;
      if (typeof saved.at === 'string') S.at = saved.at;
    }
    loaded = true;
    $('note').value = S.note; $('note').disabled = false;
    render();
  }
  start();
})();
