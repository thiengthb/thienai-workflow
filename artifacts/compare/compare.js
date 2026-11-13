/* Trang so sánh giao diện (xem artifacts/compare/README.md). Dữ liệu vòng duyệt nằm trong <script id="round">.
   Ghim comment: dùng comment có sẵn của claude.ai (khả năng comments, customAnchors). Anchor là chuỗi
   "<màn>/<bản>@x,y" hoặc "<màn>/<bản>@x,y,w,h" theo px của ảnh ở cỡ 100%, để Claude đọc ra đúng chỗ.
   Không có comment của claude.ai (nick khác, trình xem cũ): ghim lưu trong trang, đi kèm kết quả. */
(() => {
  const R = JSON.parse(document.getElementById('round').textContent);
  const $ = (id) => document.getElementById(id);
  const items = R.items || [];
  const sideOf = (it, key) => it.sides.find((s) => s.key === key);
  const MODES = ['side', 'slide', 'onion', 'blink', 'diff'];
  const ZOOMS = [0, 1, 2];

  const S = { ratings: {}, prefer: {}, general: '', pins: [], cur: 0, mode: null, zoom: 0, pairs: {}, split: 50, fade: 50 };
  const DB_PATH = 'reviews/' + String(R.id).replace(/[^a-z0-9-]/gi, '-');
  const store = Kit.store('compare:' + R.id, DB_PATH);

  let ca = null;            // customAnchors handle when claude.ai comments work here
  let threads = [];         // threads the shell lists for this page
  let commentMode = false;  // the shell's comment mode is on
  let armed = false;        // the page's own "Ghim" button is on
  let blinkLeft = false;    // blink mode currently shows the left image
  let scale = 1;
  const diffCache = new Map();

  const it = () => items[S.cur];
  function pair(i = it()) {
    const p = S.pairs[i.id] || {};
    const keys = i.sides.map((s) => s.key);
    const l = keys.includes(p.l) ? p.l : keys[0];
    let r = keys.includes(p.r) ? p.r : keys[keys.length - 1];
    if (r === l) r = keys.find((k) => k !== l) || l;
    return [sideOf(i, l), sideOf(i, r)];
  }
  const narrow = () => window.matchMedia('(max-width: 860px)').matches;
  // Until the saved state is merged in, nothing is written. Each change made meanwhile is recorded (which field, and for
  // ratings/prefer/pairs which screen, deletions included) so the merge keeps exactly what the viewer did.
  let loaded = false, snap = null, markReady;
  const ready = new Promise((r) => { markReady = r; });   // send and copy wait for this, so a result never comes from unrestored state
  const MAPS = ['ratings', 'prefer', 'pairs'], FIELDS = ['general', 'split', 'fade', 'zoom', 'mode', 'cur'];
  const edited = { fields: new Set(), ratings: new Set(), prefer: new Set(), pairs: new Set() };
  const note = () => {
    if (!snap) return;
    for (const k of FIELDS) if (JSON.stringify(S[k]) !== JSON.stringify(snap[k])) edited.fields.add(k);
    for (const k of MAPS) for (const id of new Set([...Object.keys(S[k]), ...Object.keys(snap[k])])) if (JSON.stringify(S[k][id]) !== JSON.stringify(snap[k][id])) edited[k].add(id);
    snap = JSON.parse(JSON.stringify(S));
  };
  const save = (now, st) => { if (!loaded) { note(); return Promise.resolve(false); } return store.save(st || JSON.parse(JSON.stringify(S)), now); };

  // ---------- list, header, tools ----------
  function renderList() {
    const box = $('items'); box.textContent = '';
    let group = null;
    items.forEach((x, i) => {
      if (x.group && x.group !== group) { group = x.group; box.append(Object.assign(document.createElement('div'), { className: 'grp', textContent: group })); }
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'item'; b.dataset.i = i;
      b.setAttribute('aria-current', String(i === S.cur));
      const th = document.createElement('span'); th.className = 'th';
      const last = x.sides[x.sides.length - 1];
      th.append(Object.assign(document.createElement('img'), { src: last.src, alt: '', loading: 'lazy' }));
      const tx = document.createElement('span');
      const nm = Object.assign(document.createElement('div'), { className: 'nm', textContent: x.label });
      const st = document.createElement('div'); st.className = 'st';
      const r = S.ratings[x.id];
      st.append(Object.assign(document.createElement('span'), { className: 'chip' + (r === 'ok' ? ' good' : r === 'fix' ? ' bad' : ''), textContent: r === 'ok' ? 'OK' : r === 'fix' ? 'Cần sửa' : 'Chưa xem' }));
      if (S.prefer[x.id]) st.append(Object.assign(document.createElement('span'), { className: 'chip accent', textContent: 'Thích ' + (sideOf(x, S.prefer[x.id]) || {}).name }));
      tx.append(nm, st); b.append(th, tx); box.append(b);
    });
    const done = items.filter((x) => S.ratings[x.id]).length;
    $('prog-text').textContent = `Đã duyệt ${done}/${items.length}`;
    $('prog-bar').style.width = (items.length ? (done / items.length) * 100 : 0) + '%';
  }

  function renderTools() {
    const x = it();
    $('cur-name').textContent = x.label;
    $('cur-note').textContent = x.note || '';
    $('pos').textContent = `${S.cur + 1}/${items.length}`;
    $('prev').disabled = S.cur === 0; $('next').disabled = S.cur === items.length - 1;
    $('ok').setAttribute('aria-pressed', String(S.ratings[x.id] === 'ok'));
    $('fix').setAttribute('aria-pressed', String(S.ratings[x.id] === 'fix'));
    document.querySelectorAll('#modes button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
    document.querySelectorAll('#zooms button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.zoom === S.zoom)));
    const many = x.sides.length > 2;
    $('pickers').hidden = !many; $('prefer-box').hidden = !many;
    if (many) {
      const [l, r] = pair();
      for (const [sel, cur] of [[$('left-side'), l], [$('right-side'), r]]) {
        sel.textContent = '';
        x.sides.forEach((s) => sel.append(new Option(s.name, s.key, false, s.key === cur.key)));
      }
      const pf = $('prefer'); pf.textContent = '';
      x.sides.forEach((s) => {
        const b = Object.assign(document.createElement('button'), { type: 'button', textContent: s.name });
        b.dataset.key = s.key; b.setAttribute('aria-pressed', String(S.prefer[x.id] === s.key)); pf.append(b);
      });
    }
    $('pin').setAttribute('aria-pressed', String(armed || commentMode));
    const h = $('hint');
    if (S.mode === 'blink') h.innerHTML = '<b>Nháy:</b> giữ phím Space, hoặc bấm vào ảnh, để đổi qua lại hai bản.';
    else if (S.mode === 'slide') h.innerHTML = '<b>Trượt:</b> kéo nút tròn, hoặc dùng phím mũi tên khi nút đang chọn.';
    else if (S.mode === 'diff') h.innerHTML = '<b>Khác biệt:</b> chỗ tô đỏ là điểm ảnh khác nhau giữa hai bản.';
    else h.textContent = '';
    const how = ca ? 'Bấm <b>Ghim</b> (hoặc nút comment của claude.ai) rồi bấm vào ảnh để comment đúng chỗ; kéo để khoanh một vùng.'
      : 'Bấm <b>Ghim</b> rồi bấm vào ảnh để ghi chú đúng chỗ; ghi chú đi kèm kết quả.';
    h.innerHTML = (h.innerHTML ? h.innerHTML + ' ' : '') + how;
  }

  // ---------- stage ----------
  function img(s, w) { const e = new Image(); e.src = s.src; e.alt = s.name; e.width = Math.round(w); e.draggable = false; return e; }
  function caption(s) {
    const c = document.createElement('div'); c.className = 'cap';
    c.append(Object.assign(document.createElement('span'), { textContent: s.name }), Object.assign(document.createElement('span'), { className: 'dim', textContent: `${s.w}×${s.h}` }));
    return c;
  }

  function renderStage() {
    const st = $('stage'); st.textContent = '';
    const [l, r] = pair();
    const avail = st.clientWidth || 800;
    const scroll = document.createElement('div'); scroll.className = 'scroll';
    scroll.addEventListener('scroll', report, { passive: true });
    if (S.mode === 'side') {
      const g = document.createElement('div'); g.className = 'sbs' + (S.zoom ? ' zoomed' : '');
      const colW = (avail - (narrow() ? 8 : 14)) / 2;
      scale = S.zoom || Math.min(1, colW / Math.max(l.w, r.w));
      for (const s of [l, r]) {
        const col = document.createElement('div'); col.className = 'col';
        const sh = document.createElement('div'); sh.className = 'shot'; sh.dataset.side = s.key;
        sh.append(img(s, s.w * scale)); col.append(caption(s), sh); g.append(col);
      }
      scroll.append(g); st.append(scroll);
    } else {
      scale = S.zoom || Math.min(1, avail / Math.max(l.w, r.w));
      const ov = document.createElement('div'); ov.className = 'ov'; ov.id = 'ov';
      ov.style.width = Math.round(Math.max(l.w, r.w) * scale) + 'px';
      ov.style.height = Math.round(Math.max(l.h, r.h) * scale) + 'px';
      const top = document.createElement('div'); top.className = 'ctl';
      if (S.mode === 'slide') {
        const a = img(l, l.w * scale), b = img(r, r.w * scale);
        b.id = 'top-img'; b.style.clipPath = clipFor(r.w * scale, Math.max(l.w, r.w) * scale);
        const k = document.createElement('div'); k.className = 'knob'; k.id = 'knob'; k.style.left = S.split + '%';
        const kb = Object.assign(document.createElement('button'), { type: 'button', textContent: '↔' });
        kb.setAttribute('role', 'slider'); kb.setAttribute('aria-label', 'Vị trí thanh trượt'); kb.setAttribute('aria-valuemin', '0'); kb.setAttribute('aria-valuemax', '100');
        kb.setAttribute('aria-valuenow', String(Math.round(S.split)));
        k.append(kb);
        ov.append(a, b, k, tag(l.name, 'l'), tag(r.name, 'r'));
        bindKnob(kb, ov);
      } else if (S.mode === 'onion') {
        const a = img(l, l.w * scale), b = img(r, r.w * scale);
        b.style.opacity = S.fade / 100;
        const range = Object.assign(document.createElement('input'), { type: 'range', min: 0, max: 100, value: S.fade, id: 'fade' });
        range.addEventListener('input', () => { S.fade = +range.value; b.style.opacity = S.fade / 100; lab.textContent = `${l.name} ← → ${r.name} (${S.fade}%)`; save(); });
        const lab = Object.assign(document.createElement('span'), { textContent: `${l.name} ← → ${r.name} (${S.fade}%)` });
        top.append(Object.assign(document.createElement('label'), { htmlFor: 'fade', textContent: 'Độ hiện của bản phải' }), range, lab);
        ov.append(a, b);
      } else if (S.mode === 'blink') {
        const s = blinkLeft ? l : r;
        ov.append(img(s, s.w * scale), tag(s.name, blinkLeft ? 'l' : 'r'));
        const b = Object.assign(document.createElement('button'), { type: 'button', className: 'btn', id: 'flip', textContent: `Đang xem: ${s.name}. Đổi sang ${(blinkLeft ? r : l).name}` });
        b.addEventListener('click', () => { blinkLeft = !blinkLeft; renderStage(); });
        top.append(b);
      } else if (S.mode === 'diff') {
        const note = Object.assign(document.createElement('span'), { className: 'note-diff', textContent: 'Đang so từng điểm ảnh…' });
        top.append(note);
        diff(l, r).then((d) => {
          const c = d.canvas; c.style.width = Math.round(d.w * scale) + 'px'; c.style.height = Math.round(d.h * scale) + 'px';
          ov.append(c, tag(`${r.name}, đỏ là chỗ khác ${l.name}`, 'r'));
          note.textContent = (d.pct < 0.05 ? 'Phần chung của hai bản gần như giống hệt.' : `Khác nhau ở khoảng ${d.pct.toFixed(1)}% diện tích chung.`) + (l.h !== r.h || l.w !== r.w ? ` Hai ảnh khác cỡ (${l.w}×${l.h} và ${r.w}×${r.h}); phần thừa không so.` : '');
          report();
        }).catch(() => { note.textContent = 'Không so được hai ảnh này.'; });
      }
      if (top.childNodes.length) st.append(top);
      scroll.append(ov); st.append(scroll);
    }
    const area = document.createElement('div'); area.id = 'area'; area.hidden = true; st.append(area);
    renderOwnPins();
    requestAnimationFrame(report);
  }
  /** Clip of the right image so its visible part starts at the knob, whatever its own width. */
  function clipFor(imgW, boxW) { return `inset(0 0 0 ${Math.max(0, Math.min(imgW, (S.split / 100) * boxW))}px)`; }
  function tag(t, cls) { return Object.assign(document.createElement('span'), { className: 'tag ' + cls, textContent: t }); }

  function bindKnob(kb, ov) {
    const set = (pct) => {
      S.split = Math.max(0, Math.min(100, pct));
      const top = $('top-img');
      $('knob').style.left = S.split + '%'; top.style.clipPath = clipFor(top.getBoundingClientRect().width, ov.getBoundingClientRect().width);
      kb.setAttribute('aria-valuenow', String(Math.round(S.split)));
    };
    kb.addEventListener('pointerdown', (e) => {
      kb.setPointerCapture(e.pointerId); e.preventDefault();
      const mv = (ev) => { const r = ov.getBoundingClientRect(); set(((ev.clientX - r.left) / r.width) * 100); };
      const up = () => { kb.removeEventListener('pointermove', mv); kb.removeEventListener('pointerup', up); save(); };
      kb.addEventListener('pointermove', mv); kb.addEventListener('pointerup', up);
    });
    kb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); set(S.split + (e.key === 'ArrowLeft' ? -2 : 2)); save(); }
    });
  }

  function loadImg(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; }); }
  async function diff(l, r) {
    const key = l.src + '|' + r.src;
    if (diffCache.has(key)) return diffCache.get(key);
    const [a, b] = await Promise.all([loadImg(l.src), loadImg(r.src)]);
    const w = Math.max(l.w, r.w), h = Math.max(l.h, r.h), cw = Math.min(l.w, r.w), ch = Math.min(l.h, r.h);
    const ctx = (W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d', { willReadFrequently: true })]; };
    const [, xa] = ctx(cw, ch), [, xb] = ctx(cw, ch);
    xa.drawImage(a, 0, 0, l.w, l.h); xb.drawImage(b, 0, 0, r.w, r.h);
    const da = xa.getImageData(0, 0, cw, ch).data, db = xb.getImageData(0, 0, cw, ch).data;
    const [out, xo] = ctx(w, h);
    xo.fillStyle = '#fff'; xo.fillRect(0, 0, w, h);
    xo.globalAlpha = 0.28; xo.drawImage(b, 0, 0, r.w, r.h); xo.globalAlpha = 1;
    const od = xo.getImageData(0, 0, cw, ch), o = od.data;
    let n = 0;
    for (let p = 0; p < da.length; p += 4) {
      const d = Math.abs(da[p] - db[p]) + Math.abs(da[p + 1] - db[p + 1]) + Math.abs(da[p + 2] - db[p + 2]) + Math.abs(da[p + 3] - db[p + 3]);
      if (d > 40) { n++; o[p] = 225; o[p + 1] = 29; o[p + 2] = 72; o[p + 3] = 255; }
    }
    xo.putImageData(od, 0, 0);
    const res = { canvas: out, w, h, pct: (n / (cw * ch)) * 100 };
    diffCache.set(key, res);
    return res;
  }

  // ---------- points and anchors ----------
  /** Which side and image point a viewport point lands on, or null. */
  function hit(clientX, clientY) {
    const [l, r] = pair();
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const box = el.closest('.shot, .ov');
    if (!box || !$('stage').contains(box)) return null;
    const rc = (box.classList.contains('ov') ? box : box.querySelector('img') || box).getBoundingClientRect();
    const x = (clientX - rc.left) / scale, y = (clientY - rc.top) / scale;
    let side;
    if (box.classList.contains('shot')) side = box.dataset.side === l.key ? l : r;
    else if (S.mode === 'slide') side = (clientX - rc.left) / rc.width * 100 < S.split ? l : r;
    else if (S.mode === 'onion') side = S.fade >= 50 ? r : l;
    else if (S.mode === 'blink') side = blinkLeft ? l : r;
    else side = r;
    if (x < 0 || y < 0 || x > side.w || y > side.h) return null;
    return { side, x: Math.round(x), y: Math.round(y) };
  }
  const anchorOf = (side, x, y, w, h) => `${it().id}/${side.key}@${x},${y}` + (w ? `,${w},${h}` : '');
  function parseAnchor(a) {
    const m = /^([^/@]+)\/([^/@]+)@(\d+),(\d+)(?:,(\d+),(\d+))?$/.exec(a || '');
    return m ? { item: m[1], side: m[2], x: +m[3], y: +m[4], w: m[5] ? +m[5] : 0, h: m[6] ? +m[6] : 0 } : null;
  }
  /** Page (document) point for an image point on the current screen, or null when that side is not shown. */
  function pagePoint(sideKey, x, y) {
    const [l, r] = pair();
    let box = null;
    if (S.mode === 'side') box = document.querySelector(`#stage .shot[data-side="${CSS.escape(sideKey)}"] img`);
    else if (S.mode === 'blink') box = (blinkLeft ? l : r).key === sideKey ? $('ov') : null;
    else box = sideKey === l.key || sideKey === r.key ? $('ov') : null;
    if (!box) return null;
    const rc = box.getBoundingClientRect();
    return { x: rc.left + window.scrollX + x * scale, y: rc.top + window.scrollY + y * scale };
  }
  function labelOf(side, x, y, w) { return `${it().label} · ${side.name} · ${w ? 'vùng ' : ''}${x}, ${y} px`; }

  // ---------- claude.ai comments ----------
  function report() {
    renderOwnPins();
    if (!ca) return;
    const map = {};
    for (const t of threads) {
      const a = parseAnchor(t.anchor);
      if (!a || a.item !== it().id) continue;
      map[t.id] = pagePoint(a.side, a.w ? a.x + a.w / 2 : a.x, a.w ? a.y + a.h / 2 : a.y);
    }
    try { ca.placed(map); } catch (e) { /* shell went away */ }
  }
  async function initComments() {
    const c = await Kit.cap('comments');
    if (!c || !c.customAnchors) return;
    try {
      ca = await c.customAnchors({
        mode(on) { commentMode = on; if (!on) armed = false; document.body.classList.toggle('commenting', on || armed); renderTools(); },
        threads(list) { threads = list || []; report(); },
        reveal(id) {
          const t = threads.find((x) => x.id === id), a = t && parseAnchor(t.anchor);
          if (!a) return;
          const i = items.findIndex((x) => x.id === a.item);
          if (i < 0) return;
          if (i !== S.cur) go(i, true);
          const [l, r] = pair();
          if (a.side !== l.key && a.side !== r.key) { S.pairs[it().id] = { l: l.key, r: a.side }; blinkLeft = false; renderTools(); renderStage(); }
          else if (S.mode === 'blink' && (blinkLeft ? l : r).key !== a.side) { blinkLeft = !blinkLeft; renderStage(); }
          requestAnimationFrame(() => {
            const p = pagePoint(a.side, a.x, a.y);
            if (p) window.scrollTo({ top: Math.max(0, p.y - window.innerHeight / 2), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            report();
          });
        },
        composing(open) { if (!open) $('area').hidden = true; },
        move(id, at) {
          const h = hit(at.x - window.scrollX, at.y - window.scrollY);
          if (!h) return null;
          return { anchor: anchorOf(h.side, h.x, h.y), at, label: labelOf(h.side, h.x, h.y) };
        },
      });
      renderTools();
    } catch (e) { ca = null; }
  }

  // ---------- clicks on the images ----------
  let down = null;
  function onDown(e) {
    if (e.button !== 0 || !(armed || commentMode)) return;
    const h = hit(e.clientX, e.clientY);
    if (!h) return;
    e.preventDefault();
    down = { h, cx: e.clientX, cy: e.clientY, px: e.pageX, py: e.pageY, moved: false };
  }
  function onMove(e) {
    if (!down) return;
    if (Math.abs(e.clientX - down.cx) + Math.abs(e.clientY - down.cy) > 8) down.moved = true;
    if (!down.moved || (ca && !ca.areas)) return;
    const st = $('stage').getBoundingClientRect(), a = $('area');
    a.hidden = false;
    a.style.left = Math.min(down.cx, e.clientX) - st.left + 'px'; a.style.top = Math.min(down.cy, e.clientY) - st.top + 'px';
    a.style.width = Math.abs(e.clientX - down.cx) + 'px'; a.style.height = Math.abs(e.clientY - down.cy) + 'px';
  }
  function onUp(e) {
    if (!down) return;
    const d = down; down = null;
    let { side, x, y } = d.h, w = 0, h = 0;
    if (d.moved && !(ca && !ca.areas)) {
      const end = hit(e.clientX, e.clientY);
      const ex = end && end.side === side ? end.x : Math.round(x + (e.clientX - d.cx) / scale), ey = end && end.side === side ? end.y : Math.round(y + (e.clientY - d.cy) / scale);
      const cx = Math.max(0, Math.min(side.w, ex)), cy = Math.max(0, Math.min(side.h, ey));
      w = Math.abs(cx - x); h = Math.abs(cy - y); x = Math.min(x, cx); y = Math.min(y, cy);
      if (w < 6 || h < 6) { w = 0; h = 0; }
    }
    if (!w) $('area').hidden = true;
    const anchor = anchorOf(side, x, y, w, h), label = labelOf(side, x, y, w);
    if (ca) {
      ca.compose(anchor, { x: d.px, y: d.py }, { label, area: !!w }).catch(() => Kit.toast('Chưa mở được ô comment. Thử bấm lại.'));
    } else {
      ownPin({ item: it().id, side: side.key, x, y, w, h });
    }
  }
  function onClick(e) {
    if (armed || commentMode || S.mode !== 'blink') return;
    if (e.target.closest('#flip')) return;
    if (hit(e.clientX, e.clientY)) { blinkLeft = !blinkLeft; renderStage(); }
  }

  // ---------- page-own pins (fallback) ----------
  function renderOwnPins() {
    const st = $('stage');
    st.querySelectorAll('.dot').forEach((d) => d.remove());
    if (ca) return;
    const so = st.getBoundingClientRect();
    S.pins.forEach((p, n) => {
      if (p.item !== it().id) return;
      const pt = pagePoint(p.side, p.w ? p.x + p.w / 2 : p.x, p.w ? p.y + p.h / 2 : p.y);
      if (!pt) return;
      const d = Object.assign(document.createElement('button'), { type: 'button', className: 'dot', textContent: String(n + 1), title: p.text });
      d.style.left = pt.x - window.scrollX - so.left + 'px'; d.style.top = pt.y - window.scrollY - so.top + 'px';
      d.addEventListener('click', (e) => { e.stopPropagation(); ownPin(p, n); });
      st.append(d);
    });
  }
  function ownPin(p, index) {
    closePop();
    const st = $('stage'), so = st.getBoundingClientRect();
    const pt = pagePoint(p.side, p.x, p.y) || { x: so.left + window.scrollX, y: so.top + window.scrollY };
    const pop = document.createElement('div'); pop.id = 'pop'; pop.className = 'card';
    const x = Math.min(pt.x - window.scrollX - so.left + 14, Math.max(0, so.width - 300)); pop.style.left = Math.max(0, x) + 'px';
    pop.style.top = pt.y - window.scrollY - so.top + 14 + 'px';
    const side = sideOf(it(), p.side) || { name: p.side };
    const ta = Object.assign(document.createElement('textarea'), { id: 'pop-text', rows: 3, maxLength: 1000, value: p.text || '', placeholder: 'Chỗ này sao?' });
    const row = document.createElement('div'); row.className = 'row';
    const mk = (t, cls, fn) => { const b = Object.assign(document.createElement('button'), { type: 'button', className: 'btn ' + cls, textContent: t }); b.onclick = fn; return b; };
    if (index != null) row.append(mk('Xóa', 'ghost', () => { S.pins.splice(index, 1); save(); closePop(); renderOwnPins(); }));
    row.append(mk('Hủy', 'ghost', closePop), mk('Lưu', 'primary', () => {
      const t = ta.value.trim(); if (!t) { closePop(); return; }
      if (index != null) S.pins[index].text = t; else S.pins.push({ ...p, text: t });
      save(); closePop(); renderOwnPins();
    }));
    pop.append(Object.assign(document.createElement('div'), { className: 'muted', textContent: `${side.name} · ${p.x}, ${p.y} px` }), ta, row);
    st.append(pop); ta.focus();
  }
  function closePop() { const p = $('pop'); if (p) p.remove(); $('area').hidden = true; }

  // ---------- results ----------
  function results(S) { // S: one snapshot, so the report matches what was saved with it
    const L = [`# Kết quả duyệt: ${R.title}`, '', `Vòng: ${R.id} · Đã duyệt ${items.filter((x) => S.ratings[x.id]).length}/${items.length}`, ''];
    L.push('| Màn | Kết quả | Thích bản |', '|---|---|---|');
    for (const x of items) {
      const r = S.ratings[x.id];
      L.push(`| ${x.label} | ${r === 'ok' ? 'OK' : r === 'fix' ? 'Cần sửa' : 'Chưa xem'} | ${S.prefer[x.id] ? (sideOf(x, S.prefer[x.id]) || {}).name : ''} |`);
    }
    if (S.pins.length) {
      L.push('', '## Ghim trong trang');
      S.pins.forEach((p, n) => { const x = items.find((i) => i.id === p.item); L.push(`${n + 1}. ${x ? x.label : p.item} · ${(x && sideOf(x, p.side) || {}).name || p.side} · ${p.w ? `vùng ${p.x},${p.y} ${p.w}×${p.h}` : `${p.x},${p.y}`} px: ${p.text}`); });
    }
    if (S.general.trim()) L.push('', '## Ghi chú chung', S.general.trim());
    if (ca) L.push('', 'Comment ghim trên claude.ai: Claude đọc thẳng trên trang.');
    return L.join('\n');
  }

  // ---------- navigation and events ----------
  function go(i, quiet) {
    S.cur = Math.max(0, Math.min(items.length - 1, i)); blinkLeft = false; closePop();
    renderList(); renderTools(); renderStage(); save();
    if (!quiet) { const b = document.querySelector(`.item[data-i="${S.cur}"]`); if (b) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  const unset = (k, id) => { delete S[k][id]; };
  function rate(v) { const id = it().id; if (S.ratings[id] === v) unset('ratings', id); else S.ratings[id] = v; renderList(); renderTools(); save(); }

  function bind() {
    $('items').addEventListener('click', (e) => { const b = e.target.closest('.item'); if (b) go(+b.dataset.i, true); });
    $('prev').onclick = () => go(S.cur - 1); $('next').onclick = () => go(S.cur + 1);
    $('ok').onclick = () => rate('ok'); $('fix').onclick = () => rate('fix');
    $('modes').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.mode = b.dataset.mode; closePop(); renderTools(); renderStage(); save(); } });
    $('zooms').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.zoom = +b.dataset.zoom; closePop(); renderTools(); renderStage(); save(); } });
    const pick = () => { S.pairs[it().id] = { l: $('left-side').value, r: $('right-side').value }; renderTools(); renderStage(); save(); };
    $('left-side').onchange = pick; $('right-side').onchange = pick;
    $('prefer').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; const id = it().id; if (S.prefer[id] === b.dataset.key) unset('prefer', id); else S.prefer[id] = b.dataset.key; renderList(); renderTools(); save(); });
    $('pin').onclick = () => {
      if (ca && commentMode) { ca.exitMode(); armed = false; }
      else armed = !armed;
      document.body.classList.toggle('commenting', armed || commentMode); renderTools();
      if (armed) Kit.toast(ca ? 'Bấm vào chỗ muốn comment trên ảnh. Kéo để khoanh một vùng.' : 'Bấm vào chỗ muốn ghi chú trên ảnh.');
    };
    $('general').addEventListener('input', () => { S.general = $('general').value; save(); });
    $('copy').onclick = async () => { if (!loaded) Kit.toast('Đang tải bản đã lưu…'); await ready; const snap = JSON.parse(JSON.stringify(S)); save(true, snap); Kit.copy(results(snap)); };
    $('send').onclick = async () => {
      if (!loaded) Kit.toast('Đang tải bản đã lưu…');
      await ready;
      const snap = JSON.parse(JSON.stringify(S)); // taken before the await: edits made while db writes don't leak into this report
      save(true, snap);
      const full = results(snap), long = full.length > 3800;
      // A long report is cut, so its full text gets its own frozen document: later edits queued on DB_PATH can't change it.
      const sentPath = 'sent/' + DB_PATH.slice(8) + '-' + Date.now();
      const stored = long && await Kit.put(sentPath, { report: full, state: snap, ts: Date.now() });
      if (long && !stored) { if (await Kit.copy(full)) Kit.toast('Kết quả dài mà chưa lưu được vào trang, nên chưa gửi. Đã chép bản đầy đủ: dán vào chat cho Claude.', 8000); return; }
      const text = long ? full.slice(0, 3600) + '\n\n(Kết quả dài, bản đầy đủ nằm trong db của trang: ' + sentPath + ', trường report)' : full;
      const ok = await Kit.sendToClaude(text, $('top'));
      if (ok && long) { const copied = await Kit.copy(full); Kit.toast(copied ? 'Đã gửi bản rút gọn cho Claude; bản đầy đủ đã lưu và đã chép.' : 'Đã gửi bản rút gọn cho Claude; bản đầy đủ đã lưu trong trang.', 6000); }
      else if (ok) Kit.toast('Đã gửi cho Claude. Claude trả lời trong comment.', 5000);
      else if (await Kit.copy(full)) Kit.toast('Chưa gửi thẳng được. Kết quả đã chép: dán vào chat cho Claude.', 7000);
    };
    const st = $('stage');
    st.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
    st.addEventListener('click', onClick);
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('textarea, input, select')) return;
      if (e.key === 'ArrowLeft') go(S.cur - 1); else if (e.key === 'ArrowRight') go(S.cur + 1);
      else if (/^[1-5]$/.test(e.key)) { S.mode = MODES[+e.key - 1]; renderTools(); renderStage(); save(); }
      else if (e.key === ' ' && S.mode === 'blink') { e.preventDefault(); if (!e.repeat && !blinkLeft) { blinkLeft = true; renderStage(); } }
      else if (e.key === 'Escape') { closePop(); if (armed) { armed = false; document.body.classList.remove('commenting'); renderTools(); } }
    });
    document.addEventListener('keyup', (e) => { if (e.key === ' ' && S.mode === 'blink' && blinkLeft) { blinkLeft = false; renderStage(); } });
    let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { closePop(); renderStage(); }, 120); });
  }

  async function start() {
    $('title').textContent = R.title; $('intro').textContent = R.intro || '';
    const sc = $('scen');
    (R.scenarios || []).forEach((t) => sc.append(Object.assign(document.createElement('li'), { textContent: t })));
    $('scen-box').hidden = !(R.scenarios || []).length;
    if (narrow()) { $('scen-box').open = false; document.querySelector('main').append(document.querySelector('.gen')); }
    if (!items.length) { $('stage').append(Object.assign(document.createElement('p'), { className: 'empty muted', textContent: 'Vòng này chưa có cặp ảnh nào.' })); return; }
    S.mode = narrow() && Math.max(...items[0].sides.map((s) => s.w)) > 700 ? 'blink' : 'side';
    bind(); renderList(); renderTools(); renderStage();
    snap = JSON.parse(JSON.stringify(S));
    const saved = await store.load();
    note();   // catches a change whose save() has not run yet (the note box saves on every keystroke, so this is rare)
    const early = edited.fields.size + MAPS.reduce((a, k) => a + edited[k].size, 0) + S.pins.length > 0;
    if (saved) {
      // Maps: the saved entries, then every screen the viewer touched takes the viewer's value (or stays removed).
      for (const k of MAPS) {
        const mine = S[k];
        S[k] = Object.assign({}, saved[k] || {});
        for (const id of edited[k]) { if (id in mine) S[k][id] = mine[id]; else delete S[k][id]; }
      }
      if (Array.isArray(saved.pins)) S.pins = saved.pins.concat(S.pins);
      const ok = { general: (v) => typeof v === 'string', split: (v) => typeof v === 'number', fade: (v) => typeof v === 'number',
        zoom: (v) => ZOOMS.includes(v), mode: (v) => MODES.includes(v), cur: (v) => v >= 0 && v < items.length };
      for (const k of FIELDS) if (!edited.fields.has(k) && ok[k](saved[k])) S[k] = saved[k];
      $('general').value = S.general || '';
    }
    loaded = true; markReady();
    if (early) save();
    const h = location.hash.slice(1), hi = items.findIndex((x) => x.id === h);
    if (hi >= 0) S.cur = hi;
    renderList(); renderTools(); renderStage();
    initComments();
  }
  start();
})();
