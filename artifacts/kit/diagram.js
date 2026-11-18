/* Sơ đồ dùng chung (kế hoạch docs/plans/2026-11-18-visual-workflow.md, checkpoint 1). CSS ở mục "Sơ đồ" của kit.css.
   Gu (learning/frontend/taste-queue.md, 2026-11-17): khối trơn kiểu draw.io, viền mảnh, mũi tên, không tô màu, không bóng.
   Xếp chỗ bằng dagre (artifacts/kit/vendor/dagre.min.js, MIT) nếu trang có gắn; không có thì xếp theo lưới (từng tầng một).

   Diagram.mount(host, spec)  vẽ sơ đồ vào host, trả về { go(i), next(), prev(), layout() }.
   spec = {
     nodes: [{ id, label, note? }],              note: chú thích hiện trong khối khi tới bước đó
     edges: [[from, to, label?]] hay [{ from, to, label }],
     steps: [id, ...]  hay  [{ id, note }],       không có thì sơ đồ đứng yên, không có thanh bấm
     dir:   'auto' (mặc định) | 'LR' | 'TB'       auto: ngang nếu vừa khung, không vừa thì dọc (điện thoại)
     title: chữ cho trình đọc màn hình
   }
   Trong trang: thẻ div có data-diagram, bên trong là một thẻ script type="application/json" chứa spec; tự vẽ khi trang tải.
   Bước -1 là toàn cảnh (chưa khối nào sáng): toàn cảnh trước, chi tiết khi bấm (Shneiderman, 1996). */
(() => {
  const SVG = 'http://www.w3.org/2000/svg';
  let seq = 0;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const sv = (tag, attrs) => { const e = document.createElementNS(SVG, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  function normalise(spec) {
    const nodes = (spec.nodes || []).map((n) => ({ id: String(n.id), label: n.label || String(n.id), note: n.note || '' }));
    const ids = new Set(nodes.map((n) => n.id));
    const edges = (spec.edges || []).map((e) => Array.isArray(e) ? { from: String(e[0]), to: String(e[1]), label: e[2] || '' } : { from: String(e.from), to: String(e.to), label: e.label || '' })
      .filter((e) => ids.has(e.from) && ids.has(e.to));
    const steps = (spec.steps || []).map((s) => typeof s === 'string' ? { id: s, note: '' } : { id: String(s.id), note: s.note || '' }).filter((s) => ids.has(s.id));
    return { nodes, edges, steps, dir: spec.dir || 'auto', title: spec.title || '' };
  }

  // Lưới dự phòng khi trang không gắn dagre: tầng = đường dài nhất từ khối đầu (bỏ cạnh quay ngược), trong tầng giữ thứ tự khai báo.
  function gridLayout(nodes, edges, size, dir, gap) {
    const order = new Map(nodes.map((n, i) => [n.id, i])), out = new Map(nodes.map((n) => [n.id, []]));
    edges.forEach((e, i) => out.get(e.from).push(i));
    const state = new Map(), back = new Set();
    const visit = (id) => { state.set(id, 1); for (const i of out.get(id)) { const t = edges[i].to; if (state.get(t) === 1) back.add(i); else if (!state.has(t)) visit(t); } state.set(id, 2); };
    nodes.forEach((n) => { if (!state.has(n.id)) visit(n.id); });
    const rank = new Map(nodes.map((n) => [n.id, 0]));
    for (let pass = 0; pass < nodes.length; pass++) edges.forEach((e, i) => { if (!back.has(i) && e.from !== e.to) rank.set(e.to, Math.max(rank.get(e.to), rank.get(e.from) + 1)); });
    const ranks = [];
    nodes.forEach((n) => { (ranks[rank.get(n.id)] ||= []).push(n.id); });
    ranks.forEach((r) => r.sort((a, b) => order.get(a) - order.get(b)));
    const along = dir === 'LR' ? 'w' : 'h', across = dir === 'LR' ? 'h' : 'w';
    const depth = ranks.map((r) => Math.max(...r.map((id) => size.get(id)[along])));
    const breadth = ranks.map((r) => r.reduce((s, id) => s + size.get(id)[across], 0) + gap.node * (r.length - 1));
    const full = Math.max(...breadth), pos = new Map();
    let a = 0;
    ranks.forEach((r, k) => {
      let b = (full - breadth[k]) / 2;
      r.forEach((id) => {
        const s = size.get(id), ca = a + depth[k] / 2, cb = b + s[across] / 2;
        pos.set(id, dir === 'LR' ? { x: ca, y: cb } : { x: cb, y: ca });
        b += s[across] + gap.node;
      });
      a += depth[k] + gap.rank;
    });
    const total = a - gap.rank;
    // Cạnh quay ngược (vòng lặp) đi vòng bên dưới (ngang), hay xuống đáy rồi vòng bên trái (dọc), không cắt qua khối nào.
    let lane = 0;
    const edgePts = edges.map((e, i) => {
      const p = pos.get(e.from), q = pos.get(e.to), sp = size.get(e.from), sq = size.get(e.to);
      if (!back.has(i)) return [clip(p, sp, q), clip(q, sq, p)];
      const o = 18 + 12 * lane++;
      if (dir === 'LR') return [{ x: p.x, y: p.y + sp.h / 2 }, { x: p.x, y: full + o }, { x: q.x, y: full + o }, { x: q.x, y: q.y + sq.h / 2 }];
      return [{ x: p.x, y: p.y + sp.h / 2 }, { x: p.x, y: total + o }, { x: -o, y: total + o }, { x: -o, y: q.y }, { x: q.x - sq.w / 2, y: q.y }];
    });
    const extra = lane ? 18 + 12 * (lane - 1) + 8 : 0;
    if (dir === 'TB' && extra) { // dời mọi thứ sang phải để chừa làn bên trái
      for (const v of pos.values()) v.x += extra;
      edgePts.forEach((pts) => pts.forEach((pt) => { pt.x += extra; }));
    }
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const labelPos = edgePts.map((pts) => pts.length > 2 ? mid(pts[1], pts[2]) : mid(pts[0], pts[1]));
    return { pos, edgePts, labelPos, width: (dir === 'LR' ? total : full) + (dir === 'TB' ? extra : 0), height: (dir === 'LR' ? full : total) + extra };
  }
  // Điểm trên viền khối (tâm c, cỡ s) theo hướng tới điểm t.
  function clip(c, s, t) {
    const dx = t.x - c.x, dy = t.y - c.y;
    if (!dx && !dy) return { x: c.x, y: c.y };
    const k = Math.min(dx ? (s.w / 2) / Math.abs(dx) : Infinity, dy ? (s.h / 2) / Math.abs(dy) : Infinity);
    return { x: c.x + dx * k, y: c.y + dy * k };
  }

  // Đường cong mềm qua các điểm gãy (B-spline bậc ba như d3.curveBasis), đi qua đúng điểm đầu và cuối để mũi tên chạm viền khối.
  function curve(P) {
    const f = (n) => n.toFixed(1), pt = (p) => f(p.x) + ' ' + f(p.y);
    if (P.length < 3) return 'M' + P.map(pt).join('L');
    let d = 'M' + pt(P[0]) + 'L' + pt({ x: (5 * P[0].x + P[1].x) / 6, y: (5 * P[0].y + P[1].y) / 6 });
    for (let i = 1; i < P.length - 1; i++) {
      const a = P[i - 1], b = P[i], c = P[i + 1];
      d += 'C' + pt({ x: (2 * a.x + b.x) / 3, y: (2 * a.y + b.y) / 3 }) + ' ' + pt({ x: (a.x + 2 * b.x) / 3, y: (a.y + 2 * b.y) / 3 })
        + ' ' + pt({ x: (a.x + 4 * b.x + c.x) / 6, y: (a.y + 4 * b.y + c.y) / 6 });
    }
    const a = P[P.length - 2], b = P[P.length - 1];
    d += 'C' + pt({ x: (2 * a.x + b.x) / 3, y: (2 * a.y + b.y) / 3 }) + ' ' + pt({ x: (a.x + 2 * b.x) / 3, y: (a.y + 2 * b.y) / 3 }) + ' ' + pt(b);
    return d;
  }

  function dagreLayout(nodes, edges, size, labels, dir, gap) {
    const g = new window.dagre.graphlib.Graph({ multigraph: true });
    g.setGraph({ rankdir: dir, nodesep: gap.node, ranksep: gap.rank, edgesep: 12, marginx: 0, marginy: 0 });
    g.setDefaultEdgeLabel(() => ({}));
    nodes.forEach((n) => { const s = size.get(n.id); g.setNode(n.id, { width: s.w, height: s.h }); });
    edges.forEach((e, i) => g.setEdge(e.from, e.to, { width: labels[i].w, height: labels[i].h, labelpos: 'c' }, 'e' + i));
    window.dagre.layout(g);
    const pos = new Map(nodes.map((n) => { const v = g.node(n.id); return [n.id, { x: v.x, y: v.y }]; }));
    const edgePts = edges.map((e, i) => g.edge({ v: e.from, w: e.to, name: 'e' + i }).points);
    const labelPos = edges.map((e, i) => { const v = g.edge({ v: e.from, w: e.to, name: 'e' + i }); return { x: v.x, y: v.y }; });
    const gr = g.graph();
    return { pos, edgePts, labelPos, width: gr.width, height: gr.height };
  }

  function mount(host, raw) {
    const spec = normalise(raw), id = 'dg' + (++seq);
    const stepping = spec.steps.length > 0;
    host.classList.add('dg');
    host.textContent = '';
    const stage = el('div', 'dg-stage'), wires = sv('svg', { class: 'dg-wires', 'aria-hidden': 'true' });
    if (spec.title) { stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', spec.title); }
    const defs = sv('defs', {});
    for (const kind of ['', '-on']) {
      const m = sv('marker', { id: id + 'm' + kind, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse' });
      m.appendChild(sv('path', { d: 'M1 1L9 5L1 9z', class: 'dg-head' + kind }));
      defs.appendChild(m);
    }
    wires.appendChild(defs);
    stage.appendChild(wires);

    const stepOf = new Map(spec.steps.map((s, i) => [s.id, i]));
    const boxes = new Map();
    spec.nodes.forEach((n) => {
      const b = el(stepping && stepOf.has(n.id) ? 'button' : 'div', 'dg-node');
      if (b.tagName === 'BUTTON') { b.type = 'button'; b.addEventListener('click', () => go(stepOf.get(n.id))); }
      if (stepOf.has(n.id)) b.appendChild(el('span', 'dg-num', String(stepOf.get(n.id) + 1)));
      b.appendChild(el('span', 'dg-label', n.label));
      const note = el('span', 'dg-note');
      b.appendChild(note);
      b.dataset.id = n.id;
      stage.appendChild(b);
      boxes.set(n.id, { box: b, note, node: n });
    });
    const tags = spec.edges.map((e) => { const t = el('span', 'dg-tag', e.label); if (!e.label) t.hidden = true; stage.appendChild(t); return t; });
    const scroll = el('div', 'dg-scroll'); scroll.appendChild(stage); host.appendChild(scroll);

    let bar, count, prevBtn, nextBtn;
    if (stepping) {
      bar = el('div', 'dg-bar');
      prevBtn = el('button', 'btn', '← Trước'); prevBtn.type = 'button';
      nextBtn = el('button', 'btn accent', 'Bắt đầu →'); nextBtn.type = 'button';
      count = el('p', 'dg-count'); count.setAttribute('role', 'status');
      prevBtn.addEventListener('click', () => prev()); nextBtn.addEventListener('click', () => next());
      bar.append(prevBtn, count, nextBtn);
      host.appendChild(bar);
    }

    let cur = -1, lastW = -1;
    function noteFor(i) { const s = spec.steps[i]; return s ? (s.note || boxes.get(s.id).node.note) : ''; }

    function layout() {
      const W = host.clientWidth - 4;   // trừ lề 2px hai bên của khung vẽ
      if (W <= 0) return;
      lastW = W;
      const active = cur >= 0 ? spec.steps[cur].id : null;
      boxes.forEach(({ box, note }, nid) => {
        const on = nid === active;
        box.classList.toggle('on', on);
        if (on) box.setAttribute('aria-current', 'step'); else box.removeAttribute('aria-current');
        note.textContent = on ? noteFor(cur) : '';
        note.hidden = !on || !note.textContent;
      });
      // Ngang trước, khối hẹp dần tới 132px; vẫn rộng quá khung thì dọc (điện thoại), khối co theo tầng đông nhất tới 112px.
      // Vẫn không vừa thì khung sơ đồ tự cuộn ngang bên trong, trang không tràn.
      const tryDir = (dir, nodeW) => {
        const size = new Map();
        boxes.forEach(({ box }, nid) => {
          box.style.width = nodeW + 'px';
          size.set(nid, { w: nodeW, h: Math.ceil(box.offsetHeight) });
        });
        const labels = tags.map((t) => t.hidden ? { w: 0, h: 0 } : { w: Math.ceil(t.offsetWidth) + 8, h: Math.ceil(t.offsetHeight) + 4 });
        const gap = { node: 20, rank: tags.some((t) => !t.hidden) ? 44 : 36 };
        const L = window.dagre && window.dagre.layout ? dagreLayout(spec.nodes, spec.edges, size, labels, dir, gap) : gridLayout(spec.nodes, spec.edges, size, dir, gap);
        return Object.assign(L, { dir, size, nodeW });
      };
      const shrink = (L, min) => Math.max(min, Math.floor(L.nodeW - (L.width - W) / Math.max(1, Math.round((L.width + 20) / (L.nodeW + 20)))) - 1);
      let L;
      if (spec.dir !== 'TB') {
        L = tryDir('LR', Math.min(176, W));
        for (let k = 0; k < 3 && L.width > W && L.nodeW > 132; k++) L = tryDir('LR', shrink(L, 132));
      }
      if (spec.dir === 'TB' || (spec.dir === 'auto' && L.width > W)) {
        L = tryDir('TB', Math.min(280, W));
        for (let k = 0; k < 3 && L.width > W && L.nodeW > 112; k++) L = tryDir('TB', shrink(L, 112));
      }
      host.dataset.dir = L.dir;
      draw(L);
    }

    function draw(L) {
      const pad = 2, w = Math.ceil(L.width) + pad * 2, h = Math.ceil(L.height) + pad * 2;
      stage.style.width = w + 'px'; stage.style.height = h + 'px';
      wires.setAttribute('width', w); wires.setAttribute('height', h); wires.setAttribute('viewBox', `0 0 ${w} ${h}`);
      boxes.forEach(({ box }, nid) => {
        const p = L.pos.get(nid), s = L.size.get(nid);
        box.style.left = (p.x - s.w / 2 + pad) + 'px'; box.style.top = (p.y - s.h / 2 + pad) + 'px';
      });
      wires.querySelectorAll('path.dg-wire').forEach((p) => p.remove());
      const active = cur >= 0 ? spec.steps[cur].id : null, before = cur > 0 ? spec.steps[cur - 1].id : null;
      spec.edges.forEach((e, i) => {
        const pts = L.edgePts[i];
        const on = active && e.to === active && (e.from === before || !before);
        const d = curve(pts.map((p) => ({ x: p.x + pad, y: p.y + pad })));
        wires.appendChild(sv('path', { d, class: 'dg-wire' + (on ? ' on' : ''), 'marker-end': `url(#${id}m${on ? '-on' : ''})` }));
        const t = tags[i];
        if (!t.hidden) { const lp = L.labelPos[i]; t.style.left = (lp.x + pad - t.offsetWidth / 2) + 'px'; t.style.top = (lp.y + pad - t.offsetHeight / 2) + 'px'; }
      });
    }

    function go(i) {
      if (!stepping) return;
      cur = Math.max(-1, Math.min(spec.steps.length - 1, i));
      const n = spec.steps.length;
      prevBtn.disabled = cur < 0;
      nextBtn.disabled = cur >= n - 1;
      nextBtn.textContent = cur < 0 ? 'Bắt đầu →' : 'Tiếp →';
      count.textContent = cur < 0 ? `Toàn cảnh · ${n} bước`
        : `Bước ${cur + 1}/${n} · ${boxes.get(spec.steps[cur].id).node.label}`;
      layout();
    }
    const next = () => go(cur + 1), prev = () => go(cur - 1);

    if ('ResizeObserver' in window) new ResizeObserver(() => { if (host.clientWidth - 4 !== lastW) layout(); }).observe(host);
    else window.addEventListener('resize', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if (stepping) go(-1); else layout();
    return { go, next, prev, layout };
  }

  function auto() {
    document.querySelectorAll('[data-diagram]').forEach((h) => {
      if (h.dataset.diagramOn) return;
      const src = h.querySelector('script[type="application/json"]');
      if (!src) return;
      h.dataset.diagramOn = '1';
      try { mount(h, JSON.parse(src.textContent)); }
      catch (e) { h.textContent = 'Không vẽ được sơ đồ: ' + e.message; }
    });
  }
  window.Diagram = { mount, auto };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto); else auto();
})();
