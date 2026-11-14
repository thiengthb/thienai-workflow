/* Sân khấu cho bài IT: bàn thử (frontend) và bảng dán (BA). Chạy sau lesson.js, trước phần tự lưu. Xem artifacts/it/README.md.
   Mọi thao tác là bấm nút có sẵn lúc tải trang, không kéo thả, để phần tự lưu bấm lại đúng thứ tự là về đúng chỗ.
   Thẻ trên bảng dán không bao giờ đổi chỗ trong DOM (phần tự lưu nhận nút theo thứ tự), chỉ đổi vị trí vẽ. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('#stage');
  if (!stage) return;
  const R = window.R || (window.R = {});
  Object.assign(R, { knobs: R.knobs || {}, tried: R.tried || {}, picks: R.picks || {}, boards: R.boards || {}, heard: R.heard || [] });
  const done = (k) => window.Lesson && Lesson.done(k);
  const panes = $$('.pane[data-pane]', stage);
  const pane = (n) => panes.find((p) => p.dataset.pane === n);

  if (window.Lesson && Lesson.extras) Lesson.extras.push((r) => {
    const L = [];
    Object.entries(r.tried || {}).forEach(([k, v]) => L.push(`Đã thử ${k}: ${v.join(', ')}`));
    Object.entries(r.picks || {}).forEach(([k, v]) => L.push(`Chốt (${k}): ${Object.values(v).join(', ')}`));
    Object.entries(r.boards || {}).forEach(([k, b]) => { if (b.checked) L.push(`Bảng ${k}: khớp bản mẫu ${b.right}/${b.total}` + (b.diff.length ? ` (khác: ${b.diff.join(', ')})` : '')); });
    if ((r.heard || []).length) L.push('Đã nghe: ' + r.heard.join(', '));
    return L.join('\n');
  });

  // ---------- Bàn thử ----------
  // <div class="pane bench" data-pane="bank"> chứa .screen (màn app), [data-knob] (núm), .code (dòng CSS), [data-soi-toggle].
  function benchApply(b, knob, btn, quiet) {
    const scr = $('.screen', b), k = knob.dataset.knob, val = btn.dataset.val, name = b.dataset.pane;
    if (knob.dataset.var) scr.style.setProperty(knob.dataset.var, val); else scr.dataset[k] = val;
    $$('button[data-val]', knob).forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
    const label = btn.dataset.name || btn.textContent.trim() || val;
    const now = $('.now', knob); if (now) now.textContent = label;
    $$(`[data-v="${k}"]`, b).forEach((e) => { e.textContent = btn.dataset.code || val; });
    $$(`[data-line~="${k}"]`, b).forEach((e) => { e.classList.remove('lit'); void e.offsetWidth; e.classList.add('lit'); });
    soiMark(b); b.querySelectorAll('.soi-count').forEach(soiCount);
    const key = name + '.' + k;
    R.knobs[key] = label;
    if (quiet) return showTried(key);
    const t = R.tried[key] = R.tried[key] || [];
    if (!t.includes(label)) t.push(label);
    showTried(key);
    done('knob-' + k); done('knob-' + key);
    if (t.length >= +(knob.dataset.min || 2)) { done('tried-' + k); done('tried-' + key); }
  }
  function showTried(key) {
    $$(`[data-tried="${key}"]`).forEach((box) => {
      box.innerHTML = '';
      (R.tried[key] || []).forEach((t) => { const s = document.createElement('span'); s.textContent = t; if (t === R.knobs[key]) s.className = 'cur'; box.append(s); });
    });
  }
  // data-soi="vua nhieu": chỗ này chỉ được soi khi màn đang ở một trong các giá trị đó (theo các núm đổi data-* của .screen). Để trống: luôn soi.
  function soiMark(b) {
    const scr = $('.screen', b), vals = Object.values(scr.dataset);
    $$('[data-soi]', scr).forEach((el) => {
      const t = el.dataset.soi.split(/\s+/).filter(Boolean);
      el.classList.toggle('soi-on', !t.length || t.some((x) => vals.includes(x)));
    });
  }
  function soiCount(el) {
    const b = el.closest('.bench'); soiMark(b);
    const n = $$('.screen .soi-on', b).length;
    el.textContent = (el.dataset.text || '{n} chỗ').replace('{n}', n);
  }
  $$('.bench', stage).forEach((b) => {
    $$('[data-knob]', b).forEach((knob) => {
      const btns = $$('button[data-val]', knob);
      btns.forEach((btn) => btn.addEventListener('click', () => benchApply(b, knob, btn)));
      const first = btns.find((x) => x.getAttribute('aria-pressed') === 'true');
      if (first) benchApply(b, knob, first, true);
    });
    $$('[data-soi-toggle]', b).forEach((t) => t.addEventListener('click', () => {
      const on = !b.classList.contains('soi');
      b.classList.toggle('soi', on); t.setAttribute('aria-pressed', String(on)); soiMark(b);
      b.querySelectorAll('.soi-count').forEach(soiCount);
      done('soi-' + b.dataset.pane);
    }));
  });
  // Đặt sẵn các núm (ví dụ "Xem app thật dùng gì"): <button data-set="bank" data-vals="accent=#0b7a3e; amount=vua">. Không tính là đã thử.
  $$('[data-set]').forEach((bt) => bt.addEventListener('click', () => {
    const b = pane(bt.dataset.set); if (!b) return;
    bt.dataset.vals.split(';').map((x) => x.trim()).filter(Boolean).forEach((pair) => {
      const [k, v] = pair.split('=').map((x) => x.trim());
      const knob = $(`[data-knob="${k}"]`, b), btn = knob && $$('button[data-val]', knob).find((x) => x.dataset.val === v);
      if (btn) benchApply(b, knob, btn, true);
    });
    $$(`[data-set="${bt.dataset.set}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === bt)));
    if (bt.dataset.done) done(bt.dataset.done);
    reveal();
  }));
  // Chốt lựa chọn: <button data-pick="d1" data-of="bank">: ghi giá trị các núm của bàn đó, nhắc lại vào [data-echo="d1"].
  $$('[data-pick]').forEach((bt) => bt.addEventListener('click', () => {
    const id = bt.dataset.pick, of = bt.dataset.of, b = pane(of); if (!b) return;
    const v = {}; $$('[data-knob]', b).forEach((kn) => { v[kn.dataset.knob] = R.knobs[of + '.' + kn.dataset.knob]; });
    R.picks[id] = v;
    $$(`[data-echo="${id}"]`).forEach((e) => { e.textContent = (e.dataset.prefix || 'Bạn chốt: ') + Object.values(v).join(', ') + '.'; });
    bt.textContent = bt.dataset.again || 'Chốt lại';
    done(id);
  }));

  // ---------- Bảng dán ----------
  // <div class="pane board" data-pane="who" data-answer='{"pdt":"z2"}'> chứa .zones > button.zone[data-z], .tray, button.bd-card[data-c], .say-bar.
  const boards = {};
  $$('.board', stage).forEach((bd) => {
    const id = bd.dataset.pane, cards = $$('.bd-card[data-c]', bd), zones = $$('.zone[data-z]', bd), tray = $('.tray', bd), area = $('.bd-area', bd);
    const ans = JSON.parse(bd.dataset.answer || '{}'), bar = $('.say-bar', bd);
    const st = boards[id] = { place: {}, sel: null, locked: false, showAnswer: false, layout };
    function say(c) {
      if (!bar || !c.dataset.say) return;
      bar.innerHTML = '';
      const i = document.createElement('i'); i.textContent = c.querySelector('i')?.textContent || ''; i.style.setProperty('--c', c.style.getPropertyValue('--c'));
      const d = document.createElement('div'), s = document.createElement('small'), q = document.createElement('q');
      s.textContent = c.textContent.replace(i.textContent, '').trim(); q.textContent = c.dataset.say;
      d.append(s, q); bar.append(i, d);
      c.classList.add('heard');
      const who = s.textContent; if (!R.heard.includes(who)) R.heard.push(who);
      done('heard-' + c.dataset.c);
      const need = +(bd.dataset.hear || 0), heard = cards.filter((x) => x.classList.contains('heard')).length;
      if (need && heard >= need) done('heard-' + id);
    }
    // Trình đọc màn hình: mỗi thẻ nói nó đang ở ô nào; đặt thẻ thì đọc lên qua một vùng role="status" ẩn.
    const live = document.createElement('p'); live.className = 'sr-only'; live.setAttribute('role', 'status'); bd.append(live);
    const zoneName = (box) => (box === tray ? (tray.querySelector('.label')?.textContent || 'Chưa xếp') : (box.querySelector('span')?.textContent || box.dataset.z)).trim();
    const cardName = (c) => c.textContent.replace(c.querySelector('i')?.textContent || '', '').trim();
    function save() { R.boards[id] = Object.assign(R.boards[id] || {}, { place: { ...st.place } }); }
    cards.forEach((c) => c.addEventListener('click', () => {
      say(c);
      if (st.locked || bd.dataset.mode === 'listen') return;
      st.sel = st.sel === c ? null : c;
      cards.forEach((x) => x.classList.toggle('sel', x === st.sel));
      bd.classList.toggle('picking', !!st.sel);
    }));
    zones.forEach((z) => z.addEventListener('click', () => {
      if (!st.sel || st.locked) return;
      const card = st.sel;
      st.place[card.dataset.c] = z.dataset.z;
      st.sel.classList.remove('sel'); st.sel = null; bd.classList.remove('picking');
      live.textContent = `${cardName(card)} → ${zoneName(z)}`;
      save(); layout();
      if (cards.every((c) => st.place[c.dataset.c])) done('placed-' + id);
    }));
    // Vẽ: thẻ xếp thành hàng trong ô của nó (hoặc trong khay nếu chưa đặt), tính bằng px trong .bd-area.
    function layout(depth = 0) {
      const where = st.showAnswer ? ans : st.place, A = area.getBoundingClientRect(), gap = 6;
      let grew = false;
      const groups = new Map();
      cards.forEach((c) => { const z = where[c.dataset.c]; const box = (z && zones.find((x) => x.dataset.z === z)) || tray; if (!groups.has(box)) groups.set(box, []); groups.get(box).push(c); });
      if (tray) tray.classList.toggle('empty', !groups.has(tray));
      let trayH = 0;
      groups.forEach((list, box) => {
        const B = box.getBoundingClientRect(), isTray = box === tray, top0 = isTray ? 22 : 26;
        let x = 8, y = top0, rowH = 0;
        list.forEach((c) => {
          c.style.maxWidth = isTray ? '' : Math.max(110, B.width - 16) + 'px';
          const w = c.offsetWidth, h = c.offsetHeight;
          if (x > 8 && x + w > B.width - 8) { x = 8; y += rowH + gap; rowH = 0; }
          c.setAttribute('aria-description', zoneName(box));
          c.style.transform = `translate(${Math.round(B.left - A.left + x)}px, ${Math.round(B.top - A.top + y)}px)`;
          x += w + gap; rowH = Math.max(rowH, h);
        });
        const need = Math.ceil(y + rowH + 10);
        if (isTray) trayH = need;
        // Ô chật thì tự cao thêm cho vừa thẻ (điện thoại), rồi vẽ lại một lần.
        else if (need > B.height + 1) { box.style.minHeight = need + 'px'; grew = true; }
      });
      if (!groups.has(tray)) trayH = 0;
      if (tray && Math.abs(tray.offsetHeight - trayH) > 2) { tray.style.minHeight = trayH + 'px'; grew = true; }
      if (grew && depth < 3) requestAnimationFrame(() => layout(depth + 1));
    }
    new ResizeObserver(() => layout()).observe(area);
    window.addEventListener('resize', () => zones.forEach((z) => { z.style.minHeight = ''; }));
  });
  // Kiểm: <button data-check="who" disabled-until-placed>. So với data-answer, đánh dấu ✓ / ! trên từng thẻ, khóa bảng.
  $$('[data-check]').forEach((bt) => {
    const id = bt.dataset.check, bd = pane(id), st = boards[id]; if (!bd || !st) return;
    bt.dataset.need = bt.dataset.need || 'placed-' + id; bt.disabled = true;
    bt.addEventListener('click', () => {
      const ans = JSON.parse(bd.dataset.answer || '{}'), cards = $$('.bd-card[data-c]', bd), diff = [], why = [];
      cards.forEach((c) => {
        const ok = st.place[c.dataset.c] === ans[c.dataset.c];
        c.classList.toggle('ok', ok); c.classList.toggle('no', !ok);
        const name = c.textContent.replace(c.querySelector('i')?.textContent || '', '').trim();
        if (!ok) { diff.push(name); if (c.dataset.why) why.push(c.dataset.why); }
      });
      st.locked = true; st.sel = null; bd.classList.add('locked'); bd.classList.remove('picking');
      cards.forEach((c) => c.classList.remove('sel'));
      const right = cards.length - diff.length;
      R.boards[id] = Object.assign(R.boards[id] || {}, { checked: true, right, total: cards.length, diff });
      $$(`[data-echo="${id}"]`).forEach((e) => {
        e.textContent = right === cards.length ? (e.dataset.same || 'Khớp hết với bản mẫu.')
          : `Khớp ${right}/${cards.length}. ` + (why.length ? why.join(' ') : (e.dataset.diff || ''));
        e.classList.add(right === cards.length ? 'good' : 'note');
      });
      bt.disabled = true;
      done('checked-' + id);
      reveal();
    });
  });
  // Xem bản mẫu: <button data-answer-of="who">: bấm lần nữa để về cách mình xếp.
  $$('[data-answer-of]').forEach((bt) => bt.addEventListener('click', () => {
    const st = boards[bt.dataset.answerOf]; if (!st) return;
    st.showAnswer = !st.showAnswer; st.layout();
    bt.setAttribute('aria-pressed', String(st.showAnswer));
    bt.textContent = st.showAnswer ? (bt.dataset.back || 'Xem lại cách mình xếp') : (bt.dataset.label || 'Xem bản mẫu');
    reveal();
  }));

  // ---------- Bước nào hiện gì ----------
  // Mỗi bước: data-stage="<tên pane>"; không ghi thì ẩn sân khấu. lesson.js chuyển bước bằng class "on".
  const steps = $$('.step');
  let last = null;
  function sync() {
    const cur = steps.find((s) => s.classList.contains('on'));
    if (!cur || cur === last) return;
    last = cur;
    // data-stage="who@listen": bảng chỉ cho bấm nghe, chưa cho xếp (bước mở bài).
    const [name, mode = ''] = (cur.dataset.stage || '').split('@');
    document.documentElement.dataset.stage = name ? 'on' : 'off';
    panes.forEach((p) => { p.classList.toggle('on', p.dataset.pane === name); if (p.dataset.pane === name) p.dataset.mode = mode; });
    const p = pane(name);
    if (p && boards[name]) requestAnimationFrame(() => boards[name].layout());
    if (p) p.querySelectorAll('.soi-count').forEach(soiCount);
  }
  new MutationObserver(sync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', sync);
  sync();
  // Điện thoại: sân khấu nằm trên các bước, bấm thứ làm đổi sân khấu thì cuộn lên cho thấy.
  function reveal() { if (window.innerWidth < 900) stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  window.Stage = { boards, reveal };
})();
