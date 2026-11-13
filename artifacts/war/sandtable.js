/* Sa bàn 3D cho bài học chiến tranh (xem artifacts/war/README.md). Dựng từ một file dữ liệu trận (learning/war/battles/<trận>.json):
   địa hình là độ cao thật (fetch-terrain.mjs), quân và đường vẽ theo từng mốc của một "track" (chuyện thật, hay một lựa chọn mô phỏng).
   Cần three.js r128 (cdnjs) nạp trước. Máy không vẽ được 3D thì tự chuyển sang bản đồ phẳng tô bóng đồi, cùng dữ liệu.
   Chỉ vẽ lại khi có gì đổi (xoay, chuyển mốc), không chạy liên tục, để đỡ tốn pin điện thoại.

   API: const st = Sandtable.mount(el, battle, { onKey(track, i, isLast) {} });
        st.show(track, { at, upto })   // upto: khóa thanh thời gian ở mốc đó (ví dụ trước khi người học chọn)
        st.view(name)                  // một góc nhìn trong battle.views */
(() => {
  const $el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const COLORS = { river: '#4f86b3', road: '#9a6b3a', airfield: '#8d8a80', hit: '#e0533d', lost: '#8b8985', retreat: '#d9917f' };
  const KIND_LABEL = { fort: 'Cứ điểm', gun: 'Pháo', hq: 'Sở chỉ huy', troop: 'Quân' };

  function decodeHeights(t) {
    const bin = atob(t.h), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const u16 = new Uint16Array(u8.buffer), out = new Float32Array(u16.length), span = t.max - t.min;
    for (let i = 0; i < u16.length; i++) out[i] = t.min + u16[i] / 65535 * span;
    return out;
  }

  /** Map geometry: lat/lon → km in a local frame centred on the bbox (x east, z south), heights in km above the lowest point. */
  function geo(b) {
    const [S, W, N, E] = b.bbox, t = b.terrain, H = decodeHeights(t), ex = b.exaggerate || 1.5;
    const wk = t.widthKm, hk = t.heightKm;
    const xz = ([lat, lon]) => [(lon - W) / (E - W) * wk - wk / 2, (N - lat) / (N - S) * hk - hk / 2];
    const hAt = (x, z) => { // bilinear, x,z in km
      const c = (x + wk / 2) / wk * t.cols - .5, r = (z + hk / 2) / hk * t.rows - .5;
      const c0 = Math.max(0, Math.min(t.cols - 1, Math.floor(c))), r0 = Math.max(0, Math.min(t.rows - 1, Math.floor(r)));
      const c1 = Math.min(t.cols - 1, c0 + 1), r1 = Math.min(t.rows - 1, r0 + 1), fc = Math.max(0, Math.min(1, c - c0)), fr = Math.max(0, Math.min(1, r - r0));
      const g = (rr, cc) => H[rr * t.cols + cc];
      const v = g(r0, c0) * (1 - fc) * (1 - fr) + g(r0, c1) * fc * (1 - fr) + g(r1, c0) * (1 - fc) * fr + g(r1, c1) * fc * fr;
      return (v - t.min) / 1000 * ex;
    };
    return { wk, hk, xz, hAt, H, t, ex, span: Math.max(wk, hk) };
  }

  /** The state at key i of a track: what is shown, dimmed, hit, lost, renamed, and which lines are drawn. */
  function stateAt(b, track, i) {
    const keys = b.tracks[track].keys;
    let st = { show: new Set(b.units.map((u) => u.id)), lose: new Set(), rename: {}, lines: [], dim: new Set(), hit: new Set(), focus: null };
    for (let k = 0; k <= i; k++) {
      const key = keys[k];
      if (key.same) { const [t2, j] = key.same.split(':'); const s2 = stateAt(b, t2, +j); st = { ...s2, show: new Set(s2.show), lose: new Set(s2.lose), rename: { ...s2.rename }, lines: s2.lines.slice() }; }
      if (key.show) st.show = new Set(key.show);
      (key.add || []).forEach((id) => st.show.add(id));
      (key.remove || []).forEach((id) => st.show.delete(id));
      (key.lose || []).forEach((id) => st.lose.add(id));
      Object.assign(st.rename, key.rename || {});
      if (key.lines) st.lines = key.keepLines ? st.lines.concat(key.lines) : key.lines.slice();
      st.dim = new Set(key.dim || (key.same ? [...st.dim] : []));
      st.hit = new Set(key.hit || (key.same ? [...st.hit] : []));
      st.focus = key.focus || (key.same ? st.focus : null);
    }
    return st;
  }
  const keyOf = (b, track, i) => { const k = b.tracks[track].keys[i]; if (k.same && !k.text) { const [t2, j] = k.same.split(':'); return { ...b.tracks[t2].keys[+j], ...k, text: b.tracks[t2].keys[+j].text, src: b.tracks[t2].keys[+j].src }; } return k; };

  function mount(el, b, opts = {}) {
    const G = geo(b);
    const units = Object.fromEntries(b.units.map((u) => [u.id, u]));
    el.classList.add('st');
    el.innerHTML = '';
    const stage = $el('div', 'st-stage'), cv = $el('div', 'st-canvas'), labels = $el('div', 'st-labels');
    const legend = $el('div', 'st-legend'), tools = $el('div', 'st-views'), note = $el('span', 'chip st-note');
    note.textContent = 'Địa hình thật' + (G.ex !== 1 ? ' (độ cao ×' + String(G.ex).replace('.', ',') + ')' : '') + ' · vị trí ước lượng';
    note.title = b.note || '';
    stage.append(cv, labels, legend, tools, note);
    const tl = $el('div', 'st-tl'), row = $el('div', 'st-row'), play = $el('button', 'btn st-play', '▶');
    play.type = 'button'; play.setAttribute('aria-label', 'Chạy từng mốc');
    const keysBox = $el('div', 'st-keys'), cap = $el('div', 'st-cap');
    cap.setAttribute('role', 'status');
    row.append(play, keysBox); tl.append(row, cap);
    el.append(stage, tl);

    // Chú thích: chỉ những thứ trận này có.
    const has = (k) => b.features.some((f) => f.kind === k);
    const L = [['fr', 'sq', b.sides.fr ? b.sides.fr.name : 'Bên kia'], ['vn', 'tri', b.sides.vn ? b.sides.vn.name : 'Quân ta']];
    legend.innerHTML = L.map(([s, sh, n]) => `<span class="chip"><i class="st-ico ${sh}" style="background:${b.sides[s] ? b.sides[s].color : '#888'}"></i>${esc(n)}</span>`).join('')
      + (has('road') ? `<span class="chip"><i class="st-ico ln" style="background:${COLORS.road}"></i>Đường tiếp tế</span>` : '')
      + `<span class="chip"><i class="st-ico ln" style="background:${b.sides.vn ? b.sides.vn.color : '#b23a2a'}"></i>Hào, hướng đánh</span>`;
    legend.title = b.colorNote || '';

    let track = Object.keys(b.tracks)[0], at = 0, upto = null, timer = null, renderer = null, flat = null;
    const cam = { target: [0, 0, 0], yaw: -.5, pitch: .8, dist: 1 }, goal = { ...cam, target: [0, 0, 0] };
    let curView = 'tilt';

    // ---------- 3D ----------
    let THREE = window.THREE, scene, camera, unitGroup, lineGroup, meshes = {};
    function init3d() {
      if (!THREE) return false;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); } catch (e) { return false; }
      if (!renderer.getContext()) return false;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      cv.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      const bg = new THREE.Color((getComputedStyle(el).getPropertyValue('--soft') || '#f3f1ec').trim() || '#f3f1ec');
      scene.background = bg; scene.fog = new THREE.Fog(bg, G.span * 1.1, G.span * 2.6);
      camera = new THREE.PerspectiveCamera(38, 1, .05, 200);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x6d7a55, .8));
      const sun = new THREE.DirectionalLight(0xfff4dd, .75); sun.position.set(-8, 10, -6); scene.add(sun);
      // Mặt đất: lưới theo đúng dữ liệu độ cao, màu theo độ cao và độ dốc (đồng lúa thấp phẳng, đồi cỏ, rừng trên cao).
      const { t } = G, g = new THREE.PlaneGeometry(G.wk, G.hk, t.cols - 1, t.rows - 1); g.rotateX(-Math.PI / 2);
      const pos = g.attributes.position, col = new Float32Array(pos.count * 3);
      const cLow = new THREE.Color('#e6dcb1'), cMid = new THREE.Color('#b3c08f'), cHigh = new THREE.Color('#6c8152'), cTop = new THREE.Color('#5a6b47'), tmp = new THREE.Color();
      const ramp = (h) => { // độ cao thật so với đáy lòng chảo, tính bằng mét
        if (h < 12) return tmp.copy(cLow);
        if (h < 120) return tmp.copy(cLow).lerp(cMid, (h - 12) / 108);
        if (h < 450) return tmp.copy(cMid).lerp(cHigh, (h - 120) / 330);
        return tmp.copy(cHigh).lerp(cTop, Math.min(1, (h - 450) / 500));
      };
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), h = G.hAt(x, z); pos.setY(i, h);
        ramp(h / G.ex * 1000);
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
      scene.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })));
      // Sông, đường, sân bay: cố định cho cả trận.
      b.features.forEach((f) => {
        if (f.kind === 'airfield') {
          const [a, c] = f.pts.map(G.xz), len = Math.hypot(c[0] - a[0], c[1] - a[1]);
          const m = new THREE.Mesh(new THREE.BoxGeometry(.12, .02, len), new THREE.MeshLambertMaterial({ color: COLORS.airfield }));
          m.position.set((a[0] + c[0]) / 2, G.hAt((a[0] + c[0]) / 2, (a[1] + c[1]) / 2) + .012, (a[1] + c[1]) / 2); m.rotation.y = Math.atan2(c[0] - a[0], c[1] - a[1]); scene.add(m);
        } else scene.add(tube(f.pts, f.kind === 'river' ? COLORS.river : COLORS.road, f.kind === 'river' ? .045 : .028, .012));
      });
      unitGroup = new THREE.Group(); lineGroup = new THREE.Group(); scene.add(unitGroup, lineGroup);
      b.units.forEach((u) => {
        const [x, z] = G.xz(u.at), h = G.hAt(x, z);
        const geom = u.kind === 'gun' ? new THREE.ConeGeometry(.1, .26, 4) : new THREE.BoxGeometry(.22, .12, .22);
        const m = new THREE.Mesh(geom, new THREE.MeshLambertMaterial({ color: b.sides[u.side] ? b.sides[u.side].color : '#888', transparent: true }));
        m.position.set(x, h + (u.kind === 'gun' ? .15 : .07), z); unitGroup.add(m); meshes[u.id] = m;
      });
      return true;
    }
    function drape(pts, lift, step = .08) {
      const P = pts.map(G.xz), out = [];
      for (let i = 0; i < P.length - 1; i++) {
        const [x0, z0] = P[i], [x1, z1] = P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step));
        for (let k = 0; k < n; k++) { const f = k / n, x = x0 + (x1 - x0) * f, z = z0 + (z1 - z0) * f; out.push(new THREE.Vector3(x, G.hAt(x, z) + lift, z)); }
      }
      const [xl, zl] = P[P.length - 1]; out.push(new THREE.Vector3(xl, G.hAt(xl, zl) + lift, zl));
      return out;
    }
    function tube(pts, color, r, lift) {
      const path = new THREE.CatmullRomCurve3(drape(pts, lift));
      return new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(8, path.points.length * 2), r, 6), new THREE.MeshLambertMaterial({ color }));
    }
    function drawLines3d(lines) {
      while (lineGroup.children.length) { const c = lineGroup.children.pop(); c.geometry.dispose(); c.material.dispose(); }
      const vn = b.sides.vn ? b.sides.vn.color : '#b23a2a';
      lines.forEach((l) => {
        const color = l.kind === 'retreat' ? COLORS.retreat : l.color || vn;
        const r = l.kind === 'trench' ? .022 : .04, lift = l.kind === 'trench' ? .015 : .09;
        lineGroup.add(tube(l.pts, color, r, lift));
        if (l.kind === 'attack' || l.kind === 'retreat') { // đầu mũi tên
          const d = drape(l.pts.slice(-2), lift, .02), a = d[d.length - 2], e = d[d.length - 1];
          const head = new THREE.Mesh(new THREE.ConeGeometry(.1, .24, 8), new THREE.MeshLambertMaterial({ color }));
          head.position.copy(e); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.clone().sub(a).normalize()); lineGroup.add(head);
        }
      });
    }

    // ---------- Bản đồ phẳng (khi máy không vẽ được 3D) ----------
    function initFlat() {
      const c = $el('canvas'); cv.appendChild(c); flat = { c, ctx: c.getContext('2d') };
      stage.classList.add('st-flat'); note.textContent = 'Máy này không vẽ được 3D: đang xem bản đồ phẳng';
    }
    function flatProj(x, z) { const W = flat.w, H = flat.h, s = Math.min(W / G.wk, H / G.hk) * 1.0 / Math.max(.4, cam.dist); const [tx, , tz] = cam.target; return [W / 2 + (x - tx) * s, H / 2 + (z - tz) * s]; }
    function drawFlat(S) {
      const { c, ctx } = flat, W = c.clientWidth, H = c.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      if (c.width !== W * dpr || c.height !== H * dpr) { c.width = W * dpr; c.height = H * dpr; }
      flat.w = W; flat.h = H; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#a9b68f'; ctx.fillRect(0, 0, W, H);
      const { t } = G, cw = G.wk / t.cols, ch = G.hk / t.rows, relMax = (t.max - t.min) / 1000 * G.ex;
      for (let r = 0; r < t.rows; r += 1) for (let cc = 0; cc < t.cols; cc += 1) {
        const x = -G.wk / 2 + (cc + .5) * cw, z = -G.hk / 2 + (r + .5) * ch, h = G.hAt(x, z), sh = (G.hAt(x - cw, z - ch) - G.hAt(x + cw, z + ch)) * 6;
        const k = h / relMax, light = Math.max(-.3, Math.min(.3, sh));
        const base = k < .04 ? [230, 220, 177] : k < .4 ? [180, 192, 143] : [108, 129, 82];
        ctx.fillStyle = `rgb(${base.map((v) => Math.round(v * (1 + light))).join(',')})`;
        const [px, pz] = flatProj(x - cw / 2, z - ch / 2), [qx, qz] = flatProj(x + cw / 2, z + ch / 2); ctx.fillRect(px, pz, qx - px + .6, qz - pz + .6);
      }
      const path = (pts, color, w, dash) => { ctx.beginPath(); pts.map(G.xz).forEach(([x, z], i) => { const [px, pz] = flatProj(x, z); i ? ctx.lineTo(px, pz) : ctx.moveTo(px, pz); }); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); };
      b.features.forEach((f) => path(f.pts, COLORS[f.kind] || '#888', f.kind === 'airfield' ? 5 : f.kind === 'river' ? 3 : 2, f.kind === 'road' ? [6, 4] : null));
      S.lines.forEach((l) => {
        const color = l.kind === 'retreat' ? COLORS.retreat : (b.sides.vn || {}).color || '#b23a2a';
        path(l.pts, color, l.kind === 'trench' ? 2 : 3, l.kind === 'trench' ? [4, 3] : null);
        if (l.kind !== 'attack' && l.kind !== 'retreat') return;
        const [a, e] = l.pts.slice(-2).map(G.xz).map(([x, z]) => flatProj(x, z)), ang = Math.atan2(e[1] - a[1], e[0] - a[0]);
        ctx.beginPath(); ctx.moveTo(e[0], e[1]);
        ctx.lineTo(e[0] - 10 * Math.cos(ang - .45), e[1] - 10 * Math.sin(ang - .45)); ctx.lineTo(e[0] - 10 * Math.cos(ang + .45), e[1] - 10 * Math.sin(ang + .45));
        ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      });
      b.units.forEach((u) => { if (!S.show.has(u.id)) return; const [x, z] = G.xz(u.at), [px, pz] = flatProj(x, z);
        ctx.globalAlpha = S.dim.has(u.id) ? .35 : 1; ctx.fillStyle = S.hit.has(u.id) ? COLORS.hit : S.lose.has(u.id) ? COLORS.lost : (b.sides[u.side] || {}).color || '#888';
        ctx.beginPath(); if (u.kind === 'gun') { ctx.moveTo(px, pz - 7); ctx.lineTo(px + 7, pz + 5); ctx.lineTo(px - 7, pz + 5); } else ctx.rect(px - 6, pz - 6, 12, 12); ctx.fill(); ctx.globalAlpha = 1; });
    }

    // ---------- Nhãn ----------
    const labelEls = {};
    b.units.forEach((u) => { const s = $el('span', 'st-lbl ' + u.side); labels.appendChild(s); labelEls[u.id] = s; });
    function project(u) {
      const [x, z] = G.xz(u.at);
      if (flat) { const [px, pz] = flatProj(x, z); return [px, pz - 10, true]; }
      const v = new THREE.Vector3(x, G.hAt(x, z) + .3, z).project(camera);
      return [(v.x + 1) / 2 * stage.clientWidth, (1 - v.y) / 2 * stage.clientHeight, v.z < 1];
    }
    function placeLabels(S) {
      const W = stage.clientWidth, H = stage.clientHeight, taken = [];
      const list = b.units.filter((u) => S.show.has(u.id)).map((u) => ({ u, pri: (S.hit.has(u.id) ? 10 : 0) + (u.rank || 1) }));
      list.sort((a, c) => c.pri - a.pri);
      b.units.forEach((u) => { labelEls[u.id].hidden = true; });
      for (const { u } of list) {
        const e = labelEls[u.id], [x, y, front] = project(u);
        if (!front || x < 0 || y < 0 || x > W || y > H) continue;
        const name = S.rename[u.id] || u.short || u.name, lost = S.lose.has(u.id);
        e.textContent = name + (lost ? ' · đã mất' : '');
        e.className = 'st-lbl ' + u.side + (S.hit.has(u.id) ? ' hit' : '') + (lost ? ' lost' : '') + (S.dim.has(u.id) ? ' dim' : '');
        e.hidden = false;
        const w = e.offsetWidth, h = e.offsetHeight, box = [x - w / 2, y - h - 4, x + w / 2, y - 4];
        if (taken.some((t) => !(box[2] < t[0] || box[0] > t[2] || box[3] < t[1] || box[1] > t[3]))) { e.hidden = true; continue; }
        taken.push(box);
        e.style.transform = `translate(${Math.round(box[0])}px, ${Math.round(box[1])}px)`;
      }
    }

    // ---------- Máy quay ----------
    const T0 = b.views && b.views.tilt && b.views.tilt.target ? G.xz(b.views.tilt.target) : [0, 0];
    function viewGoal(name) {
      const v = (b.views || {})[name] || {};
      const tg = v.target ? G.xz(v.target) : T0, ty = G.hAt(tg[0], tg[1]);
      if (v.from) { // đứng ở một điểm: đổi sang toạ độ cầu quanh đích nhìn
        const [fx, fz] = G.xz(v.from), fy = G.hAt(fx, fz) + (v.from[2] || .05) * G.ex;
        const dx = fx - tg[0], dy = fy - ty, dz = fz - tg[1], d = Math.hypot(dx, dy, dz);
        return { target: [tg[0], ty, tg[1]], yaw: Math.atan2(dx, dz), pitch: Math.asin(dy / d), dist: d / G.span };
      }
      return { target: [tg[0], ty, tg[1]], yaw: v.yaw ?? -.5, pitch: v.pitch ?? .8, dist: v.dist ?? 1 };
    }
    const viewBtns = {};
    Object.entries(b.views || { tilt: { label: 'Nghiêng' } }).forEach(([k, v]) => {
      const bt = $el('button', '', esc(v.label || k)); bt.type = 'button'; bt.setAttribute('aria-pressed', String(k === curView));
      bt.addEventListener('click', () => view(k)); tools.appendChild(bt); viewBtns[k] = bt;
    });
    tools.className = 'seg st-views';
    function view(name) { curView = name; Object.entries(viewBtns).forEach(([k, bt]) => bt.setAttribute('aria-pressed', String(k === name))); Object.assign(goal, viewGoal(name)); need(); }
    function applyCam() {
      const [tx, ty, tz] = cam.target, d = cam.dist * G.span, cp = Math.cos(cam.pitch);
      camera.position.set(tx + d * Math.sin(cam.yaw) * cp, ty + d * Math.sin(cam.pitch), tz + d * Math.cos(cam.yaw) * cp);
      camera.lookAt(tx, ty, tz);
    }

    let raf = 0, S = null;
    const lerp = (a, c, f) => a + (c - a) * f;
    function frame() {
      raf = 0;
      let moving = false;
      const f = .18;
      ['yaw', 'pitch', 'dist'].forEach((k) => { if (Math.abs(goal[k] - cam[k]) > 1e-4) { cam[k] = lerp(cam[k], goal[k], f); moving = true; } else cam[k] = goal[k]; });
      for (let i = 0; i < 3; i++) { if (Math.abs(goal.target[i] - cam.target[i]) > 1e-4) { cam.target[i] = lerp(cam.target[i], goal.target[i], f); moving = true; } else cam.target[i] = goal.target[i]; }
      const W = stage.clientWidth, H = stage.clientHeight;
      if (renderer) {
        const sz = renderer.getSize(new THREE.Vector2());
        if (sz.x !== W || sz.y !== H) { renderer.setSize(W, H); camera.aspect = W / Math.max(1, H); camera.updateProjectionMatrix(); }
        applyCam(); renderer.render(scene, camera);
      } else if (flat) drawFlat(S);
      if (S) placeLabels(S);
      if (moving) need();
    }
    function need() { if (!raf) raf = requestAnimationFrame(frame); }

    // Kéo để xoay, lăn hay chụm hai ngón để phóng. Bản đồ phẳng: kéo để dời.
    const ptrs = new Map(); let pinch = 0;
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); });
    cv.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const [px, py] = ptrs.get(e.pointerId), dx = e.clientX - px, dy = e.clientY - py; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) { const [a, c] = [...ptrs.values()], d = Math.hypot(a[0] - c[0], a[1] - c[1]); if (pinch) goal.dist = Math.max(.12, Math.min(1.8, goal.dist * pinch / d)); pinch = d; }
      else if (flat) { const s = Math.min(flat.w / G.wk, flat.h / G.hk) / Math.max(.4, cam.dist); goal.target[0] -= dx / s; goal.target[2] -= dy / s; }
      else { goal.yaw -= dx * .006; goal.pitch = Math.max(.08, Math.min(1.52, goal.pitch + dy * .005)); }
      Object.values(viewBtns).forEach((bt) => bt.setAttribute('aria-pressed', 'false'));
      need();
    });
    const up = (e) => { ptrs.delete(e.pointerId); pinch = 0; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', (e) => { e.preventDefault(); goal.dist = Math.max(.12, Math.min(1.8, goal.dist * Math.exp(e.deltaY * .0012))); need(); }, { passive: false });
    new ResizeObserver(need).observe(stage);

    // ---------- Thanh thời gian ----------
    // Số nút mốc cố định cho cả trang (bằng track dài nhất), track ngắn thì ẩn bớt: phần tự lưu bấm lại theo thứ tự nút nên số nút không được đổi.
    const MAXK = Math.max(...Object.values(b.tracks).map((t) => t.keys.length));
    const keyBtns = Array.from({ length: MAXK }, (_, i) => { const bt = $el('button', 'st-key', '<i></i><span></span>'); bt.type = 'button'; bt.addEventListener('click', () => go(i)); keysBox.appendChild(bt); return bt; });
    function buildKeys() {
      const keys = b.tracks[track].keys;
      keyBtns.forEach((bt, i) => { const k = keys[i]; bt.hidden = !k; if (!k) return; bt.lastChild.textContent = k.date; bt.setAttribute('aria-label', `${k.date}: ${k.title || ''}`); });
    }
    function paint() {
      const keys = b.tracks[track].keys, lim = upto == null ? keys.length - 1 : upto;
      keyBtns.forEach((bt, i) => { bt.classList.toggle('done', i < at); bt.classList.toggle('now', i === at); bt.disabled = i > lim; bt.setAttribute('aria-current', i === at ? 'step' : 'false'); });
      keysBox.style.setProperty('--fill', keys.length > 1 ? at / (keys.length - 1) : 1);
      el.classList.toggle('locked', upto != null && upto === at && lim === 0);
      play.disabled = at >= lim;
      const k = keyOf(b, track, at), sim = b.tracks[track].tag === 'sim';
      cap.innerHTML = `<span class="chip ${sim ? 'sim' : 'good'}">${sim ? 'Mô phỏng · ' + esc(b.tracks[track].label) : esc(b.tracks[track].label || 'Chuyện thật')}</span>`
        + `<span class="st-text"><b>${esc(k.date)}. ${esc(k.title || '')}.</b> ${esc(k.text || '')}${k.src ? ` <span class="muted">Nguồn: ${esc(k.src)}.</span>` : ''}</span>`;
      S = stateAt(b, track, at);
      if (renderer) {
        b.units.forEach((u) => { const m = meshes[u.id]; m.visible = S.show.has(u.id);
          m.material.color.set(S.hit.has(u.id) ? COLORS.hit : S.lose.has(u.id) ? COLORS.lost : (b.sides[u.side] || {}).color || '#888');
          m.material.opacity = S.dim.has(u.id) ? .35 : 1; });
        drawLines3d(S.lines);
      }
      if (S.focus && curView !== 'hill') { const [x, z] = G.xz(S.focus); goal.target = [x, G.hAt(x, z), z]; }
      need();
    }
    function go(i) {
      const keys = b.tracks[track].keys, lim = upto == null ? keys.length - 1 : upto;
      at = Math.max(0, Math.min(lim, i)); paint();
      if (opts.onKey) opts.onKey(track, at, at === keys.length - 1);
    }
    play.addEventListener('click', () => {
      clearInterval(timer);
      const lim = upto == null ? b.tracks[track].keys.length - 1 : upto;
      if (at >= lim) return;
      go(at + 1);
      timer = setInterval(() => { if (at >= lim) return clearInterval(timer); go(at + 1); }, 2600);
    });
    function show(t, o = {}) {
      if (!b.tracks[t]) return;
      clearInterval(timer);
      const changed = t !== track; track = t; upto = o.upto == null ? null : o.upto;
      if (changed || !keyBtns[0].lastChild.textContent) buildKeys();
      go(o.at == null ? (changed ? 0 : at) : o.at);
    }

    if (!init3d()) initFlat();
    Object.assign(cam, viewGoal('tilt')); Object.assign(goal, viewGoal('tilt'), { target: cam.target.slice() });
    show(track, { at: 0 });
    return { show, view, go, get track() { return track; }, get at() { return at; } };
  }

  window.Sandtable = { mount, stateAt };
})();
