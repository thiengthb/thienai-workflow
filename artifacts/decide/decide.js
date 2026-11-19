/* Trang chọn phương án (xem artifacts/decide/README.md). Dữ liệu nằm trong <script id="decision">.
   Có "parts" thì một trang hỏi nhiều câu (KH9 ga 3): thanh câu ở đầu, mỗi câu một bộ phương án và đề xuất riêng,
   lưu và gửi chung. thien chọn một phương án mỗi câu; đề xuất của Claude chỉ hiện sau khi chọn, để thien chọn theo mắt mình trước.
   Khung rộng: một ảnh lớn mỗi lần (tab, Trước/Sau) và bảng so sánh gọn; điện thoại: thẻ xếp dọc.
   Lựa chọn và ghi chú lưu vào máy và db của trang ở decisions/<id>. Comment: dùng comment có sẵn của claude.ai,
   ghim vào bản đang xem, cột hoặc thẻ của phương án (mỗi cái có id riêng: view-<key>, col-<key>, opt-<key>). */
(() => {
  const D = JSON.parse(document.getElementById('decision').textContent);
  const $ = (id) => document.getElementById(id);
  // Một câu: cả trang là một phần, lưu ở "pick" như trước. Nhiều câu: lưu ở "picks" theo khóa của từng câu.
  const multi = Array.isArray(D.parts);
  const parts = multi ? D.parts : [{ key: '', question: D.question, context: '', options: D.options || [], criteria: D.criteria, recommend: D.recommend }];
  let P = parts[0], opts = P.options || [];
  const byKey = (k, part = P) => (part.options || []).find((o) => o.key === k);
  const DB_PATH = 'decisions/' + String(D.id).replace(/[^a-z0-9-]/gi, '-');
  const store = Kit.store('decide:' + D.id, DB_PATH);
  const S = { pick: '', picks: {}, note: '', at: '' };
  const pickOf = (part) => (multi ? S.picks[part.key] : S.pick) || '';
  const cur = () => pickOf(P);
  const uid = (o) => (multi ? P.key + '-' : '') + o.key;   // id cho comment ghim: không trùng giữa các câu
  let loaded = false;
  let view = (opts[0] || {}).key;   // bản đang xem ở khung rộng; không lưu
  const views = {};
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids.filter((k) => k != null)); return e; };
  const lock = '<svg class="ri" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const bulb = '<svg class="ri" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>';

  const pros = (o) => el('ul', { className: 'pc' }, ...(o.pros || []).map((t) => el('li', { className: 'p', textContent: t })), ...(o.cons || []).map((t) => el('li', { className: 'c', textContent: t })));
  // Ví dụ thật kèm một câu "để ý chỗ này" (vòng thử gu), mở ở tab mới.
  const links = (o) => (o.links || []).length ? el('ul', { className: 'lk' }, ...o.links.map((l) => el('li', {},
    el('a', { href: l.url, target: '_blank', rel: 'noopener', textContent: l.text }), l.note ? el('span', { className: 'muted', textContent: l.note }) : null))) : null;
  const shot = (o) => {
    if (!o.image) return null;
    const img = el('img', { src: o.image.src, alt: 'Ảnh ' + o.name, loading: 'lazy' });
    if (o.image.w && o.image.h) img.style.aspectRatio = o.image.w + ' / ' + o.image.h;   // giữ chỗ đúng tỉ lệ khi ảnh chưa tải
    const b = el('button', { type: 'button', className: 'shot', title: 'Phóng to', ariaLabel: 'Phóng to ảnh ' + o.name }, img, el('span', { className: 'zoom-hint', textContent: 'Phóng to' }));
    b.addEventListener('click', () => zoom(o));
    return b;
  };
  const pickBtn = (o, label) => {
    const b = el('button', { type: 'button', className: 'btn primary pick', textContent: label, disabled: !loaded });
    b.dataset.key = o.key;
    b.setAttribute('aria-pressed', String(cur() === o.key));
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
      const t = el('button', { type: 'button', role: 'tab', id: 'tab-' + uid(o), tabIndex: j === i ? 0 : -1 }, o.name, cur() === o.key ? el('span', { className: 'mk', textContent: 'đã chọn' }) : null);
      t.setAttribute('aria-selected', String(j === i)); t.setAttribute('aria-controls', 'view-' + uid(o));
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
        el('button', { type: 'button', className: 'btn', textContent: 'Sau', disabled: j === opts.length - 1, onclick: () => show(opts[j + 1].key) }),
        el('span', { className: 'keys', innerHTML: '<kbd>←</kbd> <kbd>→</kbd> đổi bản' }));
      const p = el('div', { className: 'pane', role: 'tabpanel', id: 'view-' + uid(o), hidden: j !== i },
        el('div', { className: 'im' }, shot(o) || el('span', { className: 'none', textContent: 'Bản này không có ảnh.' })),
        el('div', { className: 'side' }, el('span', { className: 'label', textContent: `Bản ${j + 1} / ${opts.length}` }), el('h2', { textContent: o.name }),
          o.summary ? el('p', { className: 'muted', textContent: o.summary }) : null, pros(o), links(o),
          pickBtn(o, cur() === o.key ? 'Đã chọn ' + o.short : 'Chọn ' + o.short), opts.length > 1 ? nav : null));
      p.setAttribute('aria-labelledby', 'tab-' + uid(o));
      return p;
    });
    st.replaceChildren(tabs, ...panes);
  }

  function show(key, focusTab) {
    view = key; views[P.key] = key; renderStage();
    if (focusTab) $('tab-' + uid(byKey(key))).focus();
  }

  function renderTable() {
    const t = el('table');
    const cg = el('colgroup', {}, el('col'));
    opts.forEach((o) => cg.append(el('col', { className: cur() === o.key ? 'chosen-col' : '' })));
    const hr = el('tr', {}, el('th', { scope: 'col', textContent: '' }));
    for (const o of opts) {
      const th = el('th', { scope: 'col', id: 'col-' + uid(o) }, el('b', { textContent: o.name }));
      hr.append(th);
    }
    const body = el('tbody');
    for (const c of P.criteria || []) body.append(el('tr', {}, el('th', { scope: 'row', textContent: c.name }), ...opts.map((o) => el('td', {}, c.values[o.key] ? chip(c.values[o.key]) : ''))));
    if (opts.some((o) => (o.pros || []).length || (o.cons || []).length)) body.append(el('tr', {}, el('th', { scope: 'row', textContent: 'Điểm chính' }), ...opts.map((o) => el('td', {}, pros(o)))));
    body.append(el('tr', { className: 'picks' }, el('th'), ...opts.map((o) => el('td', {}, pickBtn(o, cur() === o.key ? 'Đã chọn ' + o.short : 'Chọn ' + o.short)))));
    t.append(cg, el('thead', {}, hr), body);
    $('table').replaceChildren(t);
  }

  function renderCards() {
    $('cards').replaceChildren(...opts.map((o) => {
      const crit = (P.criteria || []).filter((c) => c.values[o.key]).map((c) => el('span', {}, c.name + ': ', chip(c.values[o.key])));
      const card = el('article', { className: 'card opt' + (cur() === o.key ? ' chosen' : ''), id: 'opt-' + uid(o) },
        shot(o),
        el('div', { className: 'ob' }, el('h2', { textContent: o.name }), o.summary ? el('p', { className: 'muted', textContent: o.summary }) : null,
          crit.length ? el('div', { className: 'crit' }, ...crit) : null, pros(o), links(o)),
        el('div', { className: 'of' }, pickBtn(o, cur() === o.key ? 'Đã chọn bản này' : 'Chọn bản này')));
      return card;
    }));
  }

  function renderRec() {
    const r = $('rec');
    const rec = P.recommend && byKey(P.recommend.key);
    r.hidden = !rec;
    if (!rec) return;
    if (!cur()) { r.className = 'rec'; r.innerHTML = lock; r.append(el('span', { textContent: 'Đề xuất của Claude đang ẩn, hiện ra sau khi bạn chọn, để bạn chọn theo mắt mình trước.' })); return; }
    r.className = 'rec open'; r.innerHTML = bulb;
    const same = cur() === rec.key;
    const next = multi && parts.find((p) => p !== P && !pickOf(p));
    r.append(el('span', {}, el('b', { textContent: 'Claude đề xuất ' + rec.name + '. ' }), P.recommend.why || '', ' ',
      el('span', { className: same ? 'same' : '', textContent: same ? 'Bạn chọn giống đề xuất.' : 'Bạn chọn khác: Claude làm theo lựa chọn của bạn.' }),
      next ? el('button', { type: 'button', className: 'btn next', textContent: 'Sang câu chưa chọn: ' + (next.name || next.question), onclick: () => setPart(next, true) }) : null));
  }

  // Thanh câu (chỉ khi nhiều câu): mỗi nút một câu, có chữ bản đã chọn; câu đang xem có aria-current.
  function renderParts() {
    const n = $('parts'), h = $('pq');
    if (!n || !multi) return;
    n.hidden = false; h.hidden = false;
    n.replaceChildren(...parts.map((p, j) => {
      const k = pickOf(p), o = k && byKey(k, p);
      const b = el('button', { type: 'button', className: 'part' + (k ? ' done' : '') }, el('span', { className: 'pn', textContent: String(j + 1) }),
        el('span', { className: 'pt' }, el('b', { textContent: p.name || p.question }), el('span', { className: 'muted', textContent: o ? 'Đã chọn ' + o.short : 'Chưa chọn' })));
      if (p === P) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', () => setPart(p));
      return b;
    }));
    $('pq-t').textContent = `Câu ${parts.indexOf(P) + 1}/${parts.length} · ${P.question}`;
    $('pq-why').textContent = P.context || ''; $('pq-why').hidden = !P.context;
  }

  function setPart(p, scroll) {
    P = p; opts = P.options || [];
    view = views[P.key] || (opts[0] || {}).key;
    render();
    if (scroll) $('parts').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function render() {
    renderParts(); renderStage(); renderTable(); renderCards(); renderRec();
    const n = parts.filter((p) => pickOf(p)).length;
    const has = n > 0 || !!S.note.trim();
    $('send').disabled = !loaded || !has; $('copy').disabled = !loaded || !has;
    $('status').textContent = !loaded ? 'Đang tải lựa chọn đã lưu…'
      : multi ? (n ? `Đã chọn ${n}/${parts.length} câu. ${n < parts.length ? 'Gửi được cả khi chưa chọn hết.' : 'Bấm "Gửi cho Claude" khi xong.'}` : 'Chưa chọn câu nào.')
      : S.pick ? 'Bạn chọn: ' + byKey(S.pick).name + '. Bấm "Gửi cho Claude" khi xong.' : 'Chưa chọn phương án nào.';
  }

  function choose(key, area) {
    if (!loaded) return;
    const v = cur() === key ? '' : key;   // bấm lại bản đang chọn là bỏ chọn
    if (multi) S.picks = { ...S.picks, [P.key]: v }; else S.pick = v;
    S.at = new Date().toISOString();
    render(); store.save({ ...S });
    // the stage, the table and the cards each hold a button per option: focus the one in the place just clicked, else any on screen
    const all = [...document.querySelectorAll(`.pick[data-key="${CSS.escape(key)}"]`)].filter((x) => x.offsetParent);
    const b = all.find((x) => area && x.closest('[data-area]')?.dataset.area === area.dataset.area) || all[0];
    if (b) b.focus();
  }

  // Phóng to: ảnh lớn trong một hộp thoại gần kín màn. ← → đổi sang bản trước, bản sau của câu đang xem;
  // + − 0 (hay nút, Ctrl + lăn chuột, bấm đúp) phóng theo nấc; kéo chuột hay vuốt để xem chỗ khác khi đã phóng.
  // Ảnh chụp @2x nên phóng tới 200% vẫn nét. Đóng thì trả focus về chỗ đã mở.
  const LEVELS = [0, 1, 1.5, 2, 3];   // 0 là vừa khung
  const Z = { o: null, lv: 0, back: null };
  const withImg = () => opts.filter((x) => x.image);
  function zoom(o) {
    const d = $('zoom');
    Z.back = document.activeElement; Z.lv = 0;
    zoomTo(o);
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    $('zoom-body').focus({ preventScroll: true });
  }
  function zoomTo(o, keep) {
    Z.o = o;
    const list = withImg(), i = list.indexOf(o);
    $('zoom-t').textContent = o.name;
    $('zoom-n').textContent = multi ? `Câu ${parts.indexOf(P) + 1} · bản ${i + 1}/${list.length}` : `Bản ${i + 1}/${list.length}`;
    const img = $('zoom-img');
    img.src = o.image.src; img.alt = 'Ảnh ' + o.name;
    img.dataset.w = o.image.w || ''; img.dataset.h = o.image.h || '';
    $('zoom-prev').disabled = list.length < 2; $('zoom-next').disabled = list.length < 2;
    $('zoom-live').textContent = `${o.name}, bản ${i + 1} trên ${list.length}.`;
    setLevel(keep ? Z.lv : 0);
    if (view !== o.key && $('stage') && !$('stage').hidden) show(o.key);   // trang phía sau đi theo bản đang phóng
  }
  function step(dir) {
    const list = withImg(); if (list.length < 2) return;
    const i = list.indexOf(Z.o);
    zoomTo(list[(i + dir + list.length) % list.length], true);
  }
  function setLevel(lv, at) {
    const body = $('zoom-body'), img = $('zoom-img');
    const prev = body.getBoundingClientRect();
    // giữ điểm đang nhìn (giữa khung, hay chỗ bấm) đứng yên khi đổi nấc
    const fx = at ? at.x - prev.left : prev.width / 2, fy = at ? at.y - prev.top : prev.height / 2;
    const rx = (body.scrollLeft + fx) / Math.max(1, body.scrollWidth), ry = (body.scrollTop + fy) / Math.max(1, body.scrollHeight);
    Z.lv = Math.max(0, Math.min(LEVELS.length - 1, lv));
    const k = LEVELS[Z.lv], w = +img.dataset.w || img.naturalWidth / 2 || 1180;
    body.classList.toggle('fit', k === 0);
    img.style.width = k ? Math.round(w * k) + 'px' : '';
    $('zoom-lv').textContent = k ? Math.round(k * 100) + '%' : 'Vừa khung';
    $('zoom-in').disabled = Z.lv === LEVELS.length - 1; $('zoom-out').disabled = Z.lv === 0;
    if (k) { body.scrollLeft = rx * body.scrollWidth - fx; body.scrollTop = ry * body.scrollHeight - fy; }
  }
  const closeZoom = () => { const d = $('zoom'); if (d.close) d.close(); else d.removeAttribute('open'); };
  // Trang phía sau vẽ lại khi đổi bản trong lúc phóng, nên nút đã mở có thể không còn: lúc đó về nút ảnh của bản đang xem.
  $('zoom').addEventListener('close', () => {
    const t = Z.back && Z.back.isConnected && Z.back.offsetParent ? Z.back
      : [...document.querySelectorAll(`#view-${CSS.escape(uid(Z.o))} .shot, #opt-${CSS.escape(uid(Z.o))} .shot`)].find((x) => x.offsetParent);
    if (t) t.focus({ preventScroll: true });
  });
  $('zoom-x').addEventListener('click', closeZoom);
  $('zoom-prev').addEventListener('click', () => step(-1));
  $('zoom-next').addEventListener('click', () => step(1));
  $('zoom-in').addEventListener('click', () => setLevel(Z.lv + 1));
  $('zoom-out').addEventListener('click', () => setLevel(Z.lv - 1));
  $('zoom-lv').addEventListener('click', () => setLevel(Z.lv ? 0 : 3));
  $('zoom').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeZoom(); });
  $('zoom').addEventListener('keydown', (e) => {
    if (e.altKey || e.metaKey || (e.ctrlKey && !['+', '=', '-', '0'].includes(e.key))) return;
    const act = { ArrowLeft: () => step(-1), ArrowRight: () => step(1), '+': () => setLevel(Z.lv + 1), '=': () => setLevel(Z.lv + 1),
      '-': () => setLevel(Z.lv - 1), '0': () => setLevel(0) }[e.key];
    if (act) { e.preventDefault(); act(); }
  });
  const zb = $('zoom-body');
  zb.addEventListener('dblclick', (e) => setLevel(Z.lv ? 0 : 3, e));
  zb.addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); setLevel(Z.lv + (e.deltaY < 0 ? 1 : -1), e); }, { passive: false });
  // Kéo bằng chuột khi đã phóng; vuốt ngang (cảm ứng, lúc vừa khung) để sang bản khác. Cảm ứng lúc đã phóng thì cuộn như thường.
  let drag = null;
  zb.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, sl: zb.scrollLeft, st: zb.scrollTop, mouse: e.pointerType === 'mouse', moved: false };
    if (drag.mouse && Z.lv) { zb.setPointerCapture(e.pointerId); zb.classList.add('drag'); }
  });
  zb.addEventListener('pointermove', (e) => {
    if (!drag || !drag.mouse || !Z.lv) return;
    zb.scrollLeft = drag.sl - (e.clientX - drag.x); zb.scrollTop = drag.st - (e.clientY - drag.y);
  });
  const end = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.mouse && !Z.lv && Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) step(dx < 0 ? 1 : -1);
    zb.classList.remove('drag'); drag = null;
  };
  zb.addEventListener('pointerup', end); zb.addEventListener('pointercancel', () => { zb.classList.remove('drag'); drag = null; });

  // Màn chọn thường: ← → đổi bản ở bất cứ đâu trên trang (trừ lúc đang gõ chữ). Khung rộng đổi tab; điện thoại cuộn tới thẻ.
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    if ($('zoom').open || e.target.closest('input, textarea, select, [contenteditable], [role="tablist"], dialog')) return;
    if (opts.length < 2) return;
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const i = Math.max(0, opts.findIndex((o) => o.key === view)), n = opts[(i + dir + opts.length) % opts.length];
    e.preventDefault();
    if (!$('stage').hidden && $('stage').offsetParent) { show(n.key); return; }
    view = n.key; views[P.key] = n.key;
    const card = $('opt-' + uid(n));
    if (card) { card.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); card.querySelector('.pick')?.focus({ preventScroll: true }); }
  });

  function results(st) {
    const L = [`# Quyết định: ${D.question}`, '', `Vòng: ${D.id}`];
    for (const part of parts) {
      const k = multi ? (st.picks || {})[part.key] : st.pick;
      const p = k && byKey(k, part), rec = part.recommend && byKey(part.recommend.key, part);
      if (multi) L.push('', `## ${part.name || part.question}`);
      L.push('', p ? `Bạn chọn: **${p.name}**` : 'Bạn chưa chọn phương án nào.');
      if (rec && p) L.push(p.key === rec.key ? `Giống đề xuất của Claude (${rec.name}).` : `Claude đã đề xuất ${rec.name}.`);
    }
    if (st.note.trim()) L.push('', '## Ghi chú', st.note.trim());
    L.push('', 'Comment ghim trên claude.ai: Claude đọc thẳng trên trang.');
    return L.join('\n');
  }

  $('note').addEventListener('input', () => { S.note = $('note').value; render(); store.save({ ...S }); });
  // Chép và gửi: khối dùng chung của kit (Kit.sendBox, KH9); báo bằng toast vì dòng #status ở đây nói lựa chọn đang có.
  // Một bản chụp S: thứ được lưu đúng là thứ được gửi.
  Kit.sendBox({ copy: $('copy'), send: $('send'), anchor: document.querySelector('.head'), text: results,
    snapshot: () => ({ ...S, picks: { ...S.picks } }), save: (st) => store.save(st, true) });

  // Hỏi Claude về các phương án. Trước khi thien chọn, Claude chỉ giải thích và so sánh, không nói nên chọn cái nào
  // (giống đề xuất đang ẩn); sau khi chọn thì Claude biết lựa chọn và đề xuất lúc soạn trang.
  const turns = [];
  $('ai-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('ai-q').value.trim(); if (!q || !Kit.ask) return;
    $('ai-send').disabled = true;
    const rec = P.recommend && byKey(P.recommend.key);
    const prompt = [`Người dùng đang xem một trang chọn phương án. Câu cần quyết: ${multi ? D.question + ' / Câu đang xem: ' + P.question : D.question}`,
      D.context ? 'Bối cảnh: ' + D.context : '', ...(multi && P.context ? ['Bối cảnh câu này: ' + P.context] : []), 'Các phương án:',
      ...opts.map((o) => `${o.key}. ${o.name}${o.short ? ' (' + o.short + ')' : ''}: ${o.summary || ''} Ưu: ${(o.pros || []).join('; ') || 'không ghi'}. Nhược: ${(o.cons || []).join('; ') || 'không ghi'}.`),
      ...(P.criteria || []).map((c) => `Tiêu chí "${c.name}": ` + opts.map((o) => `${o.key} ${(c.values[o.key] || {}).text || '?'}`).join(', ')),
      cur() ? `Người dùng đã chọn ${cur()}.` + (rec ? ` Lúc soạn trang, Claude đề xuất ${rec.key}: ${P.recommend.why || ''}` : '')
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
    $('count').textContent = multi ? `Cần bạn chọn · ${parts.length} câu` : `Cần bạn chọn · ${opts.length} phương án`;
    $('q').textContent = D.question; $('why').textContent = D.context || ''; $('why').hidden = !D.context;
    render();
    // Controls stay off until the saved choice is in, so nothing typed or picked meanwhile can be overwritten.
    const saved = await store.load();
    if (saved) {
      if (typeof saved.pick === 'string' && (saved.pick === '' || byKey(saved.pick))) S.pick = saved.pick;
      if (multi && saved.picks && typeof saved.picks === 'object') for (const p of parts) {
        const k = saved.picks[p.key];
        if (typeof k === 'string' && (k === '' || byKey(k, p))) S.picks[p.key] = k;
      }
      if (typeof saved.note === 'string') S.note = saved.note;
      if (typeof saved.at === 'string') S.at = saved.at;
    }
    loaded = true;
    $('note').value = S.note; $('note').disabled = false;
    render();
  }
  start();
})();
