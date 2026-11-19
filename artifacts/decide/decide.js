/* Trang chọn phương án (xem artifacts/decide/README.md). Dữ liệu nằm trong <script id="decision">.
   thien chọn một phương án; đề xuất của Claude chỉ hiện sau khi chọn, để thien chọn theo mắt mình trước.
   Khung rộng: một ảnh lớn mỗi lần (tab, Trước/Sau) và bảng so sánh gọn; điện thoại: thẻ xếp dọc.
   Lựa chọn và ghi chú lưu vào máy và db của trang ở decisions/<id>. Comment: dùng comment có sẵn của claude.ai,
   ghim vào bản đang xem, cột hoặc thẻ của phương án (mỗi cái có id riêng: view-<key>, col-<key>, opt-<key>). */
(() => {
  const D = JSON.parse(document.getElementById('decision').textContent);
  const $ = (id) => document.getElementById(id);
  const opts = D.options || [];
  const byKey = (k) => opts.find((o) => o.key === k);
  const DB_PATH = 'decisions/' + String(D.id).replace(/[^a-z0-9-]/gi, '-');
  const store = Kit.store('decide:' + D.id, DB_PATH);
  const S = { pick: '', note: '', at: '' };
  let loaded = false;
  let view = (opts[0] || {}).key;   // bản đang xem ở khung rộng; không lưu
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids.filter((k) => k != null)); return e; };
  const lock = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const bulb = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>';

  const pros = (o) => el('ul', { className: 'pc' }, ...(o.pros || []).map((t) => el('li', { className: 'p', textContent: t })), ...(o.cons || []).map((t) => el('li', { className: 'c', textContent: t })));
  // Ví dụ thật kèm một câu "để ý chỗ này" (vòng thử gu), mở ở tab mới.
  const links = (o) => (o.links || []).length ? el('ul', { className: 'lk' }, ...o.links.map((l) => el('li', {},
    el('a', { href: l.url, target: '_blank', rel: 'noopener', textContent: l.text }), l.note ? el('span', { className: 'muted', textContent: l.note }) : null))) : null;
  const shot = (o) => {
    if (!o.image) return null;
    const img = el('img', { src: o.image.src, alt: 'Ảnh ' + o.name, loading: 'lazy' });
    if (o.image.w && o.image.h) img.style.aspectRatio = o.image.w + ' / ' + o.image.h;   // giữ chỗ đúng tỉ lệ khi ảnh chưa tải
    const b = el('button', { type: 'button', className: 'shot', title: 'Phóng to' }, img, el('span', { className: 'zoom-hint', textContent: 'Phóng to' }));
    b.addEventListener('click', () => zoom(o));
    return b;
  };
  const pickBtn = (o, label) => {
    const b = el('button', { type: 'button', className: 'btn primary pick', textContent: label, disabled: !loaded });
    b.dataset.key = o.key;
    b.setAttribute('aria-pressed', String(S.pick === o.key));
    b.addEventListener('click', () => choose(o.key, b.closest('[data-area]')));
    return b;
  };
  const chip = (v) => el('span', { className: 'chip ' + (v.tone || ''), textContent: v.text });

  function renderStage() {
    const st = $('stage');
    st.hidden = !opts.some((o) => o.image);
    if (st.hidden) return;
    const i = Math.max(0, opts.findIndex((o) => o.key === view));
    const tabs = el('div', { className: 'tabs', role: 'tablist', ariaLabel: 'Chọn bản để xem' }, ...opts.map((o, j) => {
      const t = el('button', { type: 'button', role: 'tab', id: 'tab-' + o.key, tabIndex: j === i ? 0 : -1 }, o.name, S.pick === o.key ? el('span', { className: 'mk', textContent: 'đã chọn' }) : null);
      t.setAttribute('aria-selected', String(j === i)); t.setAttribute('aria-controls', 'view-' + o.key);
      t.addEventListener('click', () => show(o.key));
      return t;
    }));
    tabs.addEventListener('keydown', (e) => {
      const n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: opts.length - 1 }[e.key];
      if (n == null) return;
      e.preventDefault(); show(opts[(n + opts.length) % opts.length].key, true);
    });
    const panes = opts.map((o, j) => {
      const nav = el('div', { className: 'nav' },
        el('button', { type: 'button', className: 'btn', textContent: 'Trước', disabled: j === 0, onclick: () => show(opts[j - 1].key) }),
        el('button', { type: 'button', className: 'btn', textContent: 'Sau', disabled: j === opts.length - 1, onclick: () => show(opts[j + 1].key) }));
      const p = el('div', { className: 'pane', role: 'tabpanel', id: 'view-' + o.key, hidden: j !== i },
        el('div', { className: 'im' }, shot(o) || el('span', { className: 'none', textContent: 'Bản này không có ảnh.' })),
        el('div', { className: 'side' }, el('span', { className: 'label', textContent: `Bản ${j + 1} / ${opts.length}` }), el('h2', { textContent: o.name }),
          o.summary ? el('p', { className: 'muted', textContent: o.summary }) : null, pros(o), links(o),
          pickBtn(o, S.pick === o.key ? 'Đã chọn ' + o.short : 'Chọn ' + o.short), opts.length > 1 ? nav : null));
      p.setAttribute('aria-labelledby', 'tab-' + o.key);
      return p;
    });
    st.replaceChildren(tabs, ...panes);
  }

  function show(key, focusTab) {
    view = key; renderStage();
    if (focusTab) $('tab-' + key).focus();
  }

  function renderTable() {
    const t = el('table');
    const cg = el('colgroup', {}, el('col'));
    opts.forEach((o) => cg.append(el('col', { className: S.pick === o.key ? 'chosen-col' : '' })));
    const hr = el('tr', {}, el('th', { scope: 'col', textContent: '' }));
    for (const o of opts) {
      const th = el('th', { scope: 'col', id: 'col-' + o.key }, el('b', { textContent: o.name }));
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
        shot(o),
        el('div', { className: 'ob' }, el('h2', { textContent: o.name }), o.summary ? el('p', { className: 'muted', textContent: o.summary }) : null,
          crit.length ? el('div', { className: 'crit' }, ...crit) : null, pros(o), links(o)),
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
    renderStage(); renderTable(); renderCards(); renderRec();
    const has = !!S.pick || !!S.note.trim();
    $('send').disabled = !loaded || !has; $('copy').disabled = !loaded || !has;
    $('status').textContent = !loaded ? 'Đang tải lựa chọn đã lưu…' : S.pick ? 'Bạn chọn: ' + byKey(S.pick).name + '. Bấm "Gửi cho Claude" khi xong.' : 'Chưa chọn phương án nào.';
  }

  function choose(key, area) {
    if (!loaded) return;
    S.pick = S.pick === key ? '' : key;   // bấm lại bản đang chọn là bỏ chọn
    S.at = new Date().toISOString();
    render(); store.save({ ...S });
    // the stage, the table and the cards each hold a button per option: focus the one in the place just clicked, else any on screen
    const all = [...document.querySelectorAll(`.pick[data-key="${CSS.escape(key)}"]`)].filter((x) => x.offsetParent);
    const b = all.find((x) => area && x.closest('[data-area]')?.dataset.area === area.dataset.area) || all[0];
    if (b) b.focus();
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
  // Chép và gửi: khối dùng chung của kit (Kit.sendBox, KH9); báo bằng toast vì dòng #status ở đây nói lựa chọn đang có.
  // Một bản chụp S: thứ được lưu đúng là thứ được gửi.
  Kit.sendBox({ copy: $('copy'), send: $('send'), anchor: document.querySelector('.head'), text: results,
    snapshot: () => ({ ...S }), save: (st) => store.save(st, true) });

  // Hỏi Claude về các phương án. Trước khi thien chọn, Claude chỉ giải thích và so sánh, không nói nên chọn cái nào
  // (giống đề xuất đang ẩn); sau khi chọn thì Claude biết lựa chọn và đề xuất lúc soạn trang.
  const turns = [];
  $('ai-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('ai-q').value.trim(); if (!q || !Kit.ask) return;
    $('ai-send').disabled = true;
    const rec = D.recommend && byKey(D.recommend.key);
    const prompt = [`Người dùng đang xem một trang chọn phương án. Câu cần quyết: ${D.question}`, D.context ? 'Bối cảnh: ' + D.context : '', 'Các phương án:',
      ...opts.map((o) => `${o.key}. ${o.name}${o.short ? ' (' + o.short + ')' : ''}: ${o.summary || ''} Ưu: ${(o.pros || []).join('; ') || 'không ghi'}. Nhược: ${(o.cons || []).join('; ') || 'không ghi'}.`),
      ...(D.criteria || []).map((c) => `Tiêu chí "${c.name}": ` + opts.map((o) => `${o.key} ${(c.values[o.key] || {}).text || '?'}`).join(', ')),
      S.pick ? `Người dùng đã chọn ${S.pick}.` + (rec ? ` Lúc soạn trang, Claude đề xuất ${rec.key}: ${D.recommend.why || ''}` : '')
        : 'Người dùng CHƯA chọn. Đừng nói nên chọn phương án nào, đừng xếp hạng: chỉ giải thích, so sánh khách quan, làm rõ từ khó, để họ tự chọn.',
      turns.length ? 'Đã hỏi trước đó: ' + turns.map((t) => `Hỏi: ${t.q} / Đáp: ${t.a.slice(0, 300)}`).join(' || ') : '',
      `Câu hỏi: "${q}"`, '',
      'Trả lời trong tối đa 4 câu, bám vào các phương án trên trang. Tiếng Việt tự nhiên, gọi người dùng là "bạn", chỉ chữ thường: không Markdown, không gạch đầu dòng.'].join('\n');
    const a = await Kit.ask(prompt, $('ai-out'), { cache: false });
    if (a) { turns.push({ q, a }); $('ai-q').value = ''; }
    $('ai-send').disabled = false;
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
