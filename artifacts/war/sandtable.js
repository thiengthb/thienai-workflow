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
  const COLORS = { river: '#3f7fb5', road: '#8a5a2b', airfield: '#7d786c', hit: '#d8402b', lost: '#7c7a74', retreat: '#d9917f' };
  // Màu đất theo độ cao so với đáy lòng chảo (mét): ruộng cát nhạt, sườn cỏ, đồi rừng, đỉnh núi nâu. Dùng chung cho 3D và bản phẳng.
  const LAND = [[0, '#ece3c2'], [15, '#e3dcb4'], [120, '#b9c48f'], [400, '#7f945c'], [800, '#66744a'], [1100, '#7a6a4c']];
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const LANDRGB = LAND.map(([h, c]) => [h, hex(c)]);
  function landAt(m) { // trả [r,g,b] 0..1
    if (m <= LANDRGB[0][0]) return LANDRGB[0][1].slice();
    for (let i = 1; i < LANDRGB.length; i++) { const [h1, c1] = LANDRGB[i], [h0, c0] = LANDRGB[i - 1];
      if (m <= h1) { const f = (m - h0) / (h1 - h0); return c0.map((v, k) => v + (c1[k] - v) * f); } }
    return LANDRGB[LANDRGB.length - 1][1].slice();
  }

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
    // La bàn và thước tỉ lệ ở góc dưới phải; khung thông tin hiện khi chạm vào một ký hiệu.
    const compass = $el('div', 'st-compass', '<i class="st-north" aria-hidden="true"><b></b></i><span class="st-scale"><i></i><em></em></span>');
    const info = $el('div', 'st-info'); info.hidden = true; info.setAttribute('role', 'status');
    // Nút "Bỏ" không ghi vào phần tự lưu (data-noreplay): chỗ đứng nhìn không được lưu lại.
    const vsBox = $el('div', 'chip st-vs', '<span></span><button type="button" data-noreplay>Bỏ</button>'); vsBox.hidden = true; vsBox.setAttribute('role', 'status');
    stage.append(cv, labels, legend, tools, note, compass, info, vsBox);
    const tl = $el('div', 'st-tl'), row = $el('div', 'st-row'), play = $el('button', 'btn st-play', '▶');
    play.type = 'button'; play.setAttribute('aria-label', 'Chạy từng mốc');
    // Hàng mốc cuộn ngang khi màn hình hẹp, để mỗi mốc vẫn đủ 44px cho ngón tay.
    const scroller = $el('div', 'st-scroll'), keysBox = $el('div', 'st-keys'), cap = $el('div', 'st-cap');
    cap.setAttribute('role', 'status');
    scroller.appendChild(keysBox); row.append(play, scroller); tl.append(row, cap);
    el.append(stage, tl);

    // Chú thích: chỉ những thứ trận này có.
    const has = (k) => b.features.some((f) => f.kind === k);
    const L = [['fr', 'sq', b.sides.fr ? b.sides.fr.name : 'Bên kia'], ['vn', 'tri', b.sides.vn ? b.sides.vn.name : 'Quân ta']];
    legend.innerHTML = L.map(([s, sh, n]) => `<span class="chip"><i class="st-ico ${sh}" style="background:${b.sides[s] ? b.sides[s].color : '#888'}"></i>${esc(n)}</span>`).join('')
      + (has('road') ? `<span class="chip"><i class="st-ico ln" style="background:${COLORS.road}"></i>Đường tiếp tế</span>` : '')
      + `<span class="chip"><i class="st-ico ln" style="background:${b.sides.vn ? b.sides.vn.color : '#b23a2a'}"></i>Hào, hướng đánh</span>`
      // Trạng thái vẽ bằng ký hiệu, nên chú thích nói một lần ở đây thay vì ghi chữ cạnh từng đơn vị.
      + (Object.values(b.tracks).some((tr) => tr.keys.some((k) => (k.hit || []).length)) ? `<span class="chip"><i class="st-ico ring"></i>Đang bị đánh</span>` : '')
      + (Object.values(b.tracks).some((tr) => tr.keys.some((k) => (k.lose || []).length)) ? `<span class="chip"><i class="st-ico flag" style="--fc:${b.sides.vn ? b.sides.vn.color : '#b23a2a'}"></i>Cắm cờ: đã mất</span>` : '');
    legend.title = b.colorNote || '';

    let track = Object.keys(b.tracks)[0], at = 0, upto = null, timer = null, renderer = null, flat = null;
    const cam = { target: [0, 0, 0], yaw: -.5, pitch: .8, dist: 1 }, goal = { ...cam, target: [0, 0, 0] };
    let curView = 'tilt';

    // ---------- 3D ----------
    let THREE = window.THREE, scene, camera, unitGroup, lineGroup, zoneGroup, meshes = {}, ground = null, eyeMark = null;
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
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i), h = G.hAt(x, z); pos.setY(i, h);
        const c = landAt(h / G.ex * 1000);
        col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
      const gmat = new THREE.MeshLambertMaterial({ vertexColors: true });
      // Đường đồng mức như bản đồ địa hình: nét mảnh mỗi 50 m, nét đậm mỗi 250 m (độ cao thật). Cần WebGL2 để nét đều độ dày.
      // Đáy lòng chảo gần như phẳng, đồng mức ở đó chỉ là vết lăn tăn, nên chỉ vẽ từ khoảng 30 m trên đáy trở lên.
      if (renderer.capabilities.isWebGL2) gmat.onBeforeCompile = (sh) => {
        sh.uniforms.uM = { value: 1000 / G.ex }; sh.uniforms.uOff = { value: G.t.min };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vH;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvH = position.y;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vH;\nuniform float uM;\nuniform float uOff;')
          .replace('#include <dithering_fragment>', `#include <dithering_fragment>
          { float m = vH * uM + uOff, d = max(fwidth(m), 1e-3);
            float a = 1.0 - smoothstep(.4, 1.4, abs(fract(m / 50.0 + .5) - .5) * 50.0 / d);
            float c = 1.0 - smoothstep(.6, 1.9, abs(fract(m / 250.0 + .5) - .5) * 250.0 / d);
            gl_FragColor.rgb *= 1.0 - (.13 * a + .2 * c) * smoothstep(20.0, 40.0, vH * uM); }`);
      };
      ground = { mesh: new THREE.Mesh(g, gmat), base: col.slice() };
      scene.add(ground.mesh);
      // Chỗ đứng nhìn: một cột mảnh có vòng ở chân, ẩn cho tới khi chạm vào đồi.
      eyeMark = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .5, 8), new THREE.MeshLambertMaterial({ color: '#1d1d1b' })); pole.position.y = .25;
      const ring = new THREE.Mesh(new THREE.RingGeometry(.07, .1, 24), new THREE.MeshBasicMaterial({ color: '#1d1d1b', side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = .01;
      eyeMark.add(pole, ring); eyeMark.visible = false; scene.add(eyeMark);
      zoneGroup = new THREE.Group(); scene.add(zoneGroup);
      // Sông, đường, sân bay: cố định cho cả trận.
      b.features.forEach((f) => {
        if (f.kind === 'airfield') {
          const [a, c] = f.pts.map(G.xz), len = Math.hypot(c[0] - a[0], c[1] - a[1]);
          const m = new THREE.Mesh(new THREE.BoxGeometry(.12, .02, len), new THREE.MeshLambertMaterial({ color: COLORS.airfield }));
          m.position.set((a[0] + c[0]) / 2, G.hAt((a[0] + c[0]) / 2, (a[1] + c[1]) / 2) + .012, (a[1] + c[1]) / 2); m.rotation.y = Math.atan2(c[0] - a[0], c[1] - a[1]); scene.add(m);
        } else scene.add(tube(f.pts, f.kind === 'river' ? COLORS.river : COLORS.road, f.kind === 'river' ? .045 : .028, .012));
      });
      unitGroup = new THREE.Group(); lineGroup = new THREE.Group(); scene.add(unitGroup, lineGroup);
      // Mỗi đơn vị: khối màu của bên mình; cờ của bên kia cắm lên khi đã mất; vòng đỏ dưới chân khi đang bị đánh.
      const poleGeo = new THREE.CylinderGeometry(.009, .009, .44, 6), clothGeo = new THREE.PlaneGeometry(.22, .14), ringGeo = new THREE.RingGeometry(.25, .33, 36);
      b.units.forEach((u) => {
        const [x, z] = G.xz(u.at), h = G.hAt(x, z), gun = u.kind === 'gun', top = gun ? .34 : .16;
        const other = Object.keys(b.sides).find((k) => k !== u.side);
        const grp = new THREE.Group(); grp.position.set(x, h, z);
        const body = new THREE.Mesh(gun ? new THREE.ConeGeometry(.14, .34, 4) : new THREE.BoxGeometry(.3, .16, .3), new THREE.MeshLambertMaterial({ color: b.sides[u.side] ? b.sides[u.side].color : '#888', transparent: true }));
        body.position.y = top / 2 + .01;
        const flag = new THREE.Group(), pole = new THREE.Mesh(poleGeo, new THREE.MeshLambertMaterial({ color: '#3b3127' }));
        pole.position.y = top + .22;
        const cloth = new THREE.Mesh(clothGeo, new THREE.MeshLambertMaterial({ color: other ? b.sides[other].color : COLORS.hit, side: THREE.DoubleSide }));
        cloth.position.set(.11, top + .37, 0); flag.add(pole, cloth); flag.visible = false;
        const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: COLORS.hit, side: THREE.DoubleSide, transparent: true, opacity: .95, depthTest: false }));
        ring.rotation.x = -Math.PI / 2; ring.position.y = .04; ring.renderOrder = 2; ring.visible = false;
        grp.add(body, flag, ring); grp.userData = { body, flag, ring };
        unitGroup.add(grp); meshes[u.id] = grp;
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
      flat.w = W; flat.h = H; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#b9c48f'; ctx.fillRect(0, 0, W, H);
      // Đất chỉ tô một lần vào ảnh nhỏ (mỗi ô lưới một điểm ảnh), tô lại khi đổi chỗ đứng nhìn; mỗi lần vẽ chỉ phóng ảnh đó ra, mịn và nhanh.
      const { t } = G;
      if (!flat.img || flat.imgVs !== vs) {
        const cw = G.wk / t.cols, ch = G.hk / t.rows, img = flat.img || Object.assign(document.createElement('canvas'), { width: t.cols, height: t.rows });
        const ic = img.getContext('2d'), data = ic.createImageData(t.cols, t.rows), d = data.data;
        for (let r = 0; r < t.rows; r++) for (let cc = 0; cc < t.cols; cc++) {
          const x = -G.wk / 2 + (cc + .5) * cw, z = -G.hk / 2 + (r + .5) * ch, h = G.hAt(x, z), sh = (G.hAt(x - cw, z - ch) - G.hAt(x + cw, z + ch)) * 6;
          const light = 1 + Math.max(-.3, Math.min(.3, sh)), dark = vs && !vs.vis[r * t.cols + cc] ? .48 : 1, base = landAt(h / G.ex * 1000), o = (r * t.cols + cc) * 4;
          for (let k = 0; k < 3; k++) d[o + k] = Math.round(Math.min(255, base[k] * 255 * light * dark));
          d[o + 3] = 255;
        }
        ic.putImageData(data, 0, 0); flat.img = img; flat.imgVs = vs;
      }
      const [px0, pz0] = flatProj(-G.wk / 2, -G.hk / 2), [px1, pz1] = flatProj(G.wk / 2, G.hk / 2);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(flat.img, px0, pz0, px1 - px0, pz1 - pz0);
      const path = (pts, color, w, dash) => { ctx.beginPath(); pts.map(G.xz).forEach(([x, z], i) => { const [px, pz] = flatProj(x, z); i ? ctx.lineTo(px, pz) : ctx.moveTo(px, pz); }); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); };
      b.features.forEach((f) => path(f.pts, COLORS[f.kind] || '#888', f.kind === 'airfield' ? 5 : f.kind === 'river' ? 3 : 2, f.kind === 'road' ? [6, 4] : null));
      (S.zones || []).forEach((zn) => { const [px, pz] = flatProj(zn.x, zn.z), [qx] = flatProj(zn.x + zn.r, zn.z); ctx.beginPath(); ctx.arc(px, pz, qx - px, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(178,58,42,.16)'; ctx.fill(); ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(178,58,42,.7)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]); });
      if (vs) { const [px, pz] = flatProj(vs.x, vs.z); ctx.beginPath(); ctx.arc(px, pz, 6, 0, Math.PI * 2); ctx.fillStyle = '#1d1d1b'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      S.lines.forEach((l) => {
        const color = l.kind === 'retreat' ? COLORS.retreat : (b.sides.vn || {}).color || '#b23a2a';
        path(l.pts, color, l.kind === 'trench' ? 2 : 3, l.kind === 'trench' ? [4, 3] : null);
        if (l.kind !== 'attack' && l.kind !== 'retreat') return;
        const [a, e] = l.pts.slice(-2).map(G.xz).map(([x, z]) => flatProj(x, z)), ang = Math.atan2(e[1] - a[1], e[0] - a[0]);
        ctx.beginPath(); ctx.moveTo(e[0], e[1]);
        ctx.lineTo(e[0] - 10 * Math.cos(ang - .45), e[1] - 10 * Math.sin(ang - .45)); ctx.lineTo(e[0] - 10 * Math.cos(ang + .45), e[1] - 10 * Math.sin(ang + .45));
        ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      });
      b.units.forEach((u) => { if (!S.show.has(u.id)) return; const [x, z] = G.xz(u.at), [px, pz] = flatProj(x, z), lost = S.lose.has(u.id);
        const other = Object.keys(b.sides).find((k) => k !== u.side);
        if (S.hit.has(u.id) && !lost) { ctx.beginPath(); ctx.arc(px, pz, 13, 0, Math.PI * 2); ctx.strokeStyle = COLORS.hit; ctx.lineWidth = 3; ctx.stroke(); }
        ctx.globalAlpha = S.dim.has(u.id) ? .35 : 1; ctx.fillStyle = lost ? COLORS.lost : (b.sides[u.side] || {}).color || '#888';
        ctx.beginPath(); if (u.kind === 'gun') { ctx.moveTo(px, pz - 9); ctx.lineTo(px + 9, pz + 6); ctx.lineTo(px - 9, pz + 6); } else ctx.rect(px - 8, pz - 8, 16, 16); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.5; ctx.stroke();
        if (lost) { ctx.strokeStyle = '#3b3127'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, pz); ctx.lineTo(px, pz - 22); ctx.stroke();
          ctx.fillStyle = other ? b.sides[other].color : COLORS.hit; ctx.fillRect(px, pz - 22, 12, 8); }
        ctx.globalAlpha = 1; });
    }

    // ---------- Nhãn ----------
    const labelEls = {};
    b.units.forEach((u) => { const s = $el('span', 'st-lbl ' + u.side); labels.appendChild(s); labelEls[u.id] = s; });
    const featLbls = b.features.filter((f) => f.short || f.name).map((f) => { const s = $el('span', 'st-lbl feat ' + f.kind); s.textContent = f.short || f.name; labels.appendChild(s); return { f, e: s }; });
    let lastHits = [];
    // Bàn phím: mỗi đơn vị một nút (ẩn, hiện ra khi được Tab tới), bấm thì mở cùng khung thông tin như khi chạm.
    // data-noreplay: phần tự lưu không đếm các nút này. Số nút cố định theo dữ liệu trận.
    const unitList = $el('div', 'st-units'); unitList.setAttribute('aria-label', 'Các đơn vị trên sa bàn');
    b.units.forEach((u) => { const bt = $el('button', '', esc(u.name)); bt.type = 'button'; bt.dataset.noreplay = '';
      bt.addEventListener('click', () => { if (!S || !S.show.has(u.id)) { kbInfo(`<b>${esc(u.name)}</b><span>Chưa có trên sa bàn ở mốc này</span>`); return; }
        if (!lastHits.some((o) => o.u === u)) { kbInfo(`<b>${esc(S.rename[u.id] || u.name)}</b><span>${esc(unitFacts(u, S))}</span><span>Ngoài khung nhìn: thử nút "Từ trên"</span>`); return; }
        showInfo(u, S); });
      unitList.appendChild(bt); });
    const listBottom = () => unitList.offsetTop + unitList.offsetHeight + 6;
    function kbInfo(html) { info.hidden = false; info.innerHTML = html; delete info.dataset.u; info.style.transform = `translate(8px, ${listBottom()}px)`; }
    stage.appendChild(unitList);
    const zoneLbls = b.units.map(() => { const s = $el('span', 'st-lbl zone'); s.hidden = true; labels.appendChild(s); return s; }); // vùng chạm của từng ký hiệu và nhãn ở lần vẽ gần nhất
    function screenAt(x, z) {
      if (flat) { const [px, pz] = flatProj(x, z); return [px, pz, true]; }
      const v = new THREE.Vector3(x, G.hAt(x, z), z).project(camera);
      return [(v.x + 1) / 2 * stage.clientWidth, (1 - v.y) / 2 * stage.clientHeight, v.z < 1]; // v.z >= 1: sau máy quay
    }
    // Hướng bắc và thước tỉ lệ đo tại điểm đang nhìn, nên khi xoay hay phóng to vẫn đúng.
    function updateCompass() {
      // Thước đo theo hướng ngang của màn hình: 3D lấy đoạn vuông góc với hướng nhìn, bản phẳng lấy hướng đông.
      const [tx, , tz] = cam.target, rx = flat ? 1 : Math.cos(cam.yaw), rz = flat ? 0 : -Math.sin(cam.yaw);
      const p0 = screenAt(tx, tz), pn = screenAt(tx, tz - .5), pe = screenAt(tx + .5 * rx, tz + .5 * rz);
      const ang = Math.atan2(pn[0] - p0[0], -(pn[1] - p0[1])) * 180 / Math.PI;
      compass.querySelector('.st-north').style.transform = `rotate(${ang.toFixed(1)}deg)`;
      const perKm = Math.hypot(pe[0] - p0[0], pe[1] - p0[1]) * 2;
      const km = [.1, .2, .25, .5, 1, 2, 5, 10].find((k) => k * perKm >= 48) || 10;
      compass.querySelector('.st-scale i').style.width = Math.round(Math.min(140, km * perKm)) + 'px';
      compass.querySelector('.st-scale em').textContent = (km < 1 ? Math.round(km * 1000) + ' m' : String(km).replace('.', ',') + ' km');
    }
    // Bảng chú thích không được chạy xuống dưới nút góc phải: chừa đúng chỗ còn lại, hẹp quá thì ẩn.
    function fitLegend() {
      const room = stage.clientWidth - tools.offsetWidth - 28;
      legend.style.maxWidth = Math.max(0, room) + 'px';
      legend.style.visibility = room < 150 ? 'hidden' : '';
      note.style.maxWidth = Math.max(80, stage.clientWidth - compass.offsetWidth - 28) + 'px';
      vsBox.style.maxWidth = Math.max(140, stage.clientWidth - compass.offsetWidth - 28) + 'px';
    }
    function project(u) { return projectAt(u.at); }
    function projectAt(at) {
      const [x, z] = G.xz(at);
      if (flat) { const [px, pz] = flatProj(x, z); return [px, pz - 10, true]; }
      const v = new THREE.Vector3(x, G.hAt(x, z) + .3, z).project(camera);
      return [(v.x + 1) / 2 * stage.clientWidth, (1 - v.y) / 2 * stage.clientHeight, v.z < 1];
    }
    // Nhãn không được đè lên ký hiệu đơn vị, lên khung chú thích hay nút góc, và không tràn mép.
    // Mỗi nhãn thử lần lượt: trên, dưới, phải, trái ký hiệu; chỗ nào cũng vướng thì ẩn nhãn ưu tiên thấp.
    function placeLabels(S) {
      fitLegend(); updateCompass();
      const W = stage.clientWidth, H = stage.clientHeight, sr = stage.getBoundingClientRect();
      const ui = [legend, tools, note, compass, vsBox].filter((x) => x.style.visibility !== 'hidden').filter((x) => x.offsetParent && x.offsetWidth).map((x) => { const r = x.getBoundingClientRect(); return [r.left - sr.left - 4, r.top - sr.top - 4, r.right - sr.left + 4, r.bottom - sr.top + 4]; });
      const list = b.units.filter((u) => S.show.has(u.id)).map((u) => ({ u, pri: (S.hit.has(u.id) ? 10 : 0) + (u.rank || 1), p: project(u) }));
      list.sort((a, c) => c.pri - a.pri);
      // Vùng của ký hiệu trên màn hình: 3D thì chiếu tám góc khối thật (to ra khi phóng gần), bản phẳng thì ô cố định.
      const box3 = flat ? null : new THREE.Box3(), v3 = flat ? null : new THREE.Vector3();
      function markBox(u, [x, y]) {
        const fb = [x - 10, y - 4, x + 10, y + 20], m = meshes[u.id];
        if (flat || !m) return fb;
        m.updateMatrixWorld(); box3.setFromObject(m.userData.body); if (m.userData.flag.visible) box3.expandByObject(m.userData.flag); let l = Infinity, t = Infinity, r = -Infinity, btm = -Infinity;
        for (let k = 0; k < 8; k++) {
          v3.set(k & 1 ? box3.max.x : box3.min.x, k & 2 ? box3.max.y : box3.min.y, k & 4 ? box3.max.z : box3.min.z).project(camera);
          const sx = (v3.x + 1) / 2 * W, sy = (1 - v3.y) / 2 * H;
          l = Math.min(l, sx); r = Math.max(r, sx); t = Math.min(t, sy); btm = Math.max(btm, sy);
        }
        return [Math.min(fb[0], l - 3), Math.min(fb[1], t - 3), Math.max(fb[2], r + 3), Math.max(fb[3], btm + 3)];
      }
      list.forEach((o) => { o.m = o.p[2] ? markBox(o.u, o.p) : null; });
      const marks = list.filter((o) => o.m).map((o) => o.m);
      // Đường tấn công, hào: lấy mẫu dọc đường thành ô nhỏ. Nhãn cố tránh, không tránh được thì vẫn hiện.
      const path = [];
      S.lines.forEach((l) => l.pts.forEach((pt, i) => { if (!i) return; const a = l.pts[i - 1];
        for (let k = 0; k <= 6; k++) { const q = projectAt([a[0] + (pt[0] - a[0]) * k / 6, a[1] + (pt[1] - a[1]) * k / 6]); if (q[2]) path.push([q[0] - 3, q[1] - 3, q[0] + 3, q[1] + 3]); } }));
      lastHits = [];
      const taken = [...ui], hitAny = (bx, arr) => arr.some((t) => !(bx[2] <= t[0] || bx[0] >= t[2] || bx[3] <= t[1] || bx[1] >= t[3]));
      b.units.forEach((u) => { labelEls[u.id].hidden = true; });
      const named = new Set();
      for (const { u, p: [x, y, front], m: mb } of list) {
        const e = labelEls[u.id];
        if (!front || x < 0 || y < 0 || x > W || y > H) continue;
        lastHits.push({ u, box: mb });
        // Bớt chữ: trạng thái đã thể hiện bằng cờ và vòng đỏ; tên trùng (mấy trận địa pháo) chỉ ghi một lần; đơn vị mờ không ghi tên.
        const name = S.rename[u.id] || u.short || u.name, lost = S.lose.has(u.id);
        if (S.dim.has(u.id) || named.has(name)) continue;
        named.add(name);
        e.textContent = name;
        e.className = 'st-lbl ' + u.side + (S.hit.has(u.id) ? ' hit' : '') + (lost ? ' lost' : '') + (S.dim.has(u.id) ? ' dim' : '');
        e.hidden = false;
        const w = e.offsetWidth, h = e.offsetHeight;
        const cy = (mb[1] + mb[3]) / 2, tries = [[x - w / 2, mb[1] - h - 2], [x - w / 2, mb[3] + 2], [mb[2] + 2, cy - h / 2], [mb[0] - w - 2, cy - h / 2]];
        let box = null;
        for (const strict of [true, false]) {
          for (const [l, t] of tries) {
            const bx = [l, t, l + w, t + h];
            if (l < 2 || t < 2 || l + w > W - 2 || t + h > H - 2) continue;
            if (hitAny(bx, taken) || hitAny(bx, marks) || (strict && hitAny(bx, path))) continue;
            box = bx; break;
          }
          if (box) break;
        }
        if (!box) { e.hidden = true; continue; }
        taken.push(box); lastHits.push({ u, box });
        e.style.transform = `translate(${Math.round(box[0])}px, ${Math.round(box[1])}px)`;
      }
      // Tên sông, đường, sân bay: ưu tiên thấp nhất, đặt ở điểm của đường gần giữa khung nhìn, không chen vào đâu thì ẩn.
      featLbls.forEach(({ f, e }) => {
        e.hidden = true;
        const pts = f.pts.map((pt) => { const [x, z] = G.xz(pt); return screenAt(x, z); }).filter(([x, y, front]) => front && x > 0 && y > 0 && x < W && y < H);
        if (!pts.length) return;
        pts.sort((a, c) => Math.hypot(a[0] - W / 2, a[1] - H * .45) - Math.hypot(c[0] - W / 2, c[1] - H * .45));
        e.hidden = false; const w = e.offsetWidth, h = e.offsetHeight;
        for (const [x, y] of pts.slice(0, 6)) {
          for (const [l, t] of [[x + 6, y - h / 2], [x - w - 6, y - h / 2], [x - w / 2, y + 6]]) {
            const bx = [l, t, l + w, t + h];
            if (l < 2 || t < 2 || l + w > W - 2 || t + h > H - 2 || hitAny(bx, taken) || hitAny(bx, marks)) continue;
            taken.push(bx); e.style.transform = `translate(${Math.round(l)}px, ${Math.round(t)}px)`; return;
          }
        }
        e.hidden = true;
      });
      (S.zones || []).forEach((zn, i) => {
        const e = zoneLbls[i]; if (!e) return; const [x, y, front] = screenAt(zn.x, zn.z); if (!front) { e.hidden = true; return; }
        e.textContent = (units[zn.id].side === 'vn' ? 'Pháo Việt Minh ở đâu?' : 'Không rõ'); e.hidden = false;
        const w = e.offsetWidth, h = e.offsetHeight, bx = [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
        if (bx[0] < 2 || bx[1] < 2 || bx[2] > W - 2 || bx[3] > H - 2 || hitAny(bx, taken)) { e.hidden = true; return; }
        taken.push(bx); e.style.transform = `translate(${Math.round(bx[0])}px, ${Math.round(bx[1])}px)`;
      });
      if (!info.hidden && info.dataset.u) showInfo(units[info.dataset.u], S);
    }
    // Chạm vào ký hiệu (hay nhãn của nó): hiện tên đầy đủ, bên nào và đang ra sao ở mốc này. Chạm chỗ trống thì đóng.
    function unitFacts(u, S) {
      const side = b.sides[u.side] ? b.sides[u.side].name : '', kind = u.kind === 'gun' ? 'trận địa pháo' : 'cứ điểm';
      const state = S.lose.has(u.id) ? 'đã mất' : S.hit.has(u.id) ? 'đang bị đánh' : '';
      return [side, kind, state].filter(Boolean).join(' · ');
    }
    function showInfo(u, S) {
      const hit = lastHits.find((o) => o.u === u);
      if (!u || !S || !S.show.has(u.id) || !hit) { info.hidden = true; delete info.dataset.u; return; }
      info.innerHTML = `<b>${esc(S.rename[u.id] || u.name)}</b><span>${esc(unitFacts(u, S))}</span>`;
      info.dataset.u = u.id; info.hidden = false;
      const W = stage.clientWidth, w = info.offsetWidth, h = info.offsetHeight, [l, t, r, btm] = hit.box;
      // Hàng nút bàn phím đang hiện (có thể xuống nhiều dòng trên điện thoại): khung thông tin nằm dưới hàng nút, không bị che.
      const top = unitList.matches(':focus-within') ? listBottom() : 4;
      const x = Math.max(4, Math.min(W - w - 4, (l + r) / 2 - w / 2)), y = Math.max(top, t - h - 6 > top ? t - h - 6 : btm + 6);
      info.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }

    // ---------- Nhìn từ một điểm ----------
    // Chạm vào đất: đứng ở đó (mắt cao 15 m), mỗi ô lưới được dò theo đường thẳng tới mắt; có núi chắn thì ô đó tối.
    let vs = null;
    const EYE = .015;
    function viewshed(x0, z0) {
      const { t } = G, cw = G.wk / t.cols, ch = G.hk / t.rows, y0 = G.hAt(x0, z0) + EYE * G.ex, vis = new Uint8Array(t.cols * t.rows), step = Math.min(cw, ch) * 1.2;
      for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
        const x1 = -G.wk / 2 + (c + .5) * cw, z1 = -G.hk / 2 + (r + .5) * ch, y1 = G.hAt(x1, z1) + .004 * G.ex;
        const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step)); let ok = 1;
        for (let k = 1; k < n; k++) { const f = k / n; if (G.hAt(x0 + (x1 - x0) * f, z0 + (z1 - z0) * f) > y0 + (y1 - y0) * f) { ok = 0; break; } }
        vis[r * t.cols + c] = ok;
      }
      return vis;
    }
    function setViewpoint(x, z) {
      if (x == null) { vs = null; vsBox.hidden = true; note.style.visibility = ''; }
      else {
        vs = { x, z, vis: viewshed(x, z) };
        const m = Math.round(G.hAt(x, z) / G.ex * 1000 + G.t.min), seen = vs.vis.reduce((a, v) => a + v, 0) / vs.vis.length;
        vsBox.firstChild.textContent = `Đứng ở độ cao ${m.toLocaleString('vi-VN')} m: thấy ${Math.round(seen * 100)}% sa bàn, vùng tối bị núi che`;
        vsBox.hidden = false; note.style.visibility = 'hidden';
      }
      if (ground) {
        const c = ground.mesh.geometry.attributes.color, a = c.array, base = ground.base;
        for (let i = 0; i < a.length / 3; i++) {
          const hid = vs && !vs.vis[i];
          a[i * 3] = hid ? base[i * 3] * .42 + .05 : base[i * 3]; a[i * 3 + 1] = hid ? base[i * 3 + 1] * .42 + .06 : base[i * 3 + 1]; a[i * 3 + 2] = hid ? base[i * 3 + 2] * .42 + .1 : base[i * 3 + 2];
        }
        c.needsUpdate = true;
        eyeMark.visible = !!vs; if (vs) eyeMark.position.set(x, G.hAt(x, z), z);
      }
      need();
    }
    vsBox.lastChild.addEventListener('click', () => setViewpoint(null));
    // Từ chỗ chạm trên màn hình ra toạ độ trên đất.
    function groundAt(sx, sy) {
      if (flat) { const s = Math.min(flat.w / G.wk, flat.h / G.hk) / Math.max(.4, cam.dist), [tx, , tz] = cam.target; return [tx + (sx - flat.w / 2) / s, tz + (sy - flat.h / 2) / s]; }
      const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(sx / stage.clientWidth * 2 - 1, -(sy / stage.clientHeight) * 2 + 1), camera);
      const hit = rc.intersectObject(ground.mesh)[0]; return hit ? [hit.point.x, hit.point.z] : null;
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
    // Mắt bên kia: ở mốc có "fog", bấm để chỉ thấy những gì bên đó biết lúc ấy. Nút luôn có trong trang (số nút không đổi), mốc không có thì ẩn.
    const fogWho = Object.values(b.tracks).flatMap((t) => t.keys).map((k) => k.fog && k.fog.who).find(Boolean);
    let fogOn = false, fogBtn = null;
    if (fogWho) {
      fogBtn = $el('button', 'st-fog', esc(fogWho)); fogBtn.type = 'button'; fogBtn.setAttribute('aria-pressed', 'false'); fogBtn.hidden = true;
      fogBtn.addEventListener('click', () => { fogOn = !fogOn; fogBtn.setAttribute('aria-pressed', String(fogOn)); paint(); });
      tools.appendChild(fogBtn);
    }
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
        applyCam();
        Object.values(meshes).forEach((g) => { const f = g.userData.flag; if (f.visible) f.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z); });
        renderer.render(scene, camera);
      } else if (flat) drawFlat(S);
      if (S) placeLabels(S);
      if (moving) need();
    }
    function need() { if (!raf) raf = requestAnimationFrame(frame); }

    // Kéo để xoay, lăn hay chụm hai ngón để phóng. Bản đồ phẳng: kéo để dời.
    const ptrs = new Map(); let pinch = 0;
    let tap = null;
    cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); tap = ptrs.size === 1 ? [e.clientX, e.clientY] : null; });
    cv.addEventListener('pointermove', (e) => {
      if (!ptrs.has(e.pointerId)) return;
      const [px, py] = ptrs.get(e.pointerId), dx = e.clientX - px, dy = e.clientY - py; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) { const [a, c] = [...ptrs.values()], d = Math.hypot(a[0] - c[0], a[1] - c[1]); if (pinch) goal.dist = Math.max(.12, Math.min(1.8, goal.dist * pinch / d)); pinch = d; }
      else if (flat) { const s = Math.min(flat.w / G.wk, flat.h / G.hk) / Math.max(.4, cam.dist); goal.target[0] -= dx / s; goal.target[2] -= dy / s; }
      else { goal.yaw -= dx * .006; goal.pitch = Math.max(.08, Math.min(1.52, goal.pitch + dy * .005)); }
      Object.values(viewBtns).forEach((bt) => bt.setAttribute('aria-pressed', 'false'));
      need();
    });
    const up = (e) => {
      if (e.type === 'pointerup' && tap && Math.hypot(e.clientX - tap[0], e.clientY - tap[1]) < 6) {
        const r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        const near = lastHits.filter((o) => x >= o.box[0] - 4 && x <= o.box[2] + 4 && y >= o.box[1] - 4 && y <= o.box[3] + 4);
        const u = near.length ? near[0].u : null;
        if (u) showInfo(info.dataset.u !== u.id ? u : null, S);
        else if (!info.hidden) showInfo(null, S);
        else { const g = groundAt(x, y); if (g && Math.abs(g[0]) <= G.wk / 2 && Math.abs(g[1]) <= G.hk / 2) setViewpoint(g[0], g[1]); }
      }
      tap = null; ptrs.delete(e.pointerId); pinch = 0;
    };
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
      const cur = keyBtns[at]; if (cur && scroller.scrollWidth > scroller.clientWidth) scroller.scrollLeft = Math.max(0, cur.offsetLeft - (scroller.clientWidth - cur.offsetWidth) / 2);
      keysBox.style.setProperty('--fill', keys.length > 1 ? at / (keys.length - 1) : 1);
      el.classList.toggle('locked', upto != null && upto === at && lim === 0);
      play.disabled = at >= lim;
      const k = keyOf(b, track, at), sim = b.tracks[track].tag === 'sim';
      cap.innerHTML = `<span class="chip ${sim ? 'sim' : 'good'}">${sim ? 'Mô phỏng · ' + esc(b.tracks[track].label) : esc(b.tracks[track].label || 'Chuyện thật')}</span>`
        + `<span class="st-text"><b>${esc(k.date)}. ${esc(k.title || '')}.</b> ${esc(k.text || '')}${k.src ? ` <span class="muted">Nguồn: ${esc(k.src)}.</span>` : ''}</span>`;
      S = stateAt(b, track, at);
      const fk = k.fog;
      if (fogBtn) fogBtn.hidden = !fk;
      if (fogOn && fk) {
        // Chỉ bỏ ký hiệu khỏi mắt bên kia; thay bằng một vùng nghi ngờ rộng, lệch khỏi chỗ thật cho đúng là "không biết chính xác".
        const hide = new Set(fk.hide || []);
        S = { ...S, show: new Set([...S.show].filter((id) => !hide.has(id))), zones: [...hide].filter((id) => units[id] && S.show.has(id)).map((id, i) => {
          const [x, z] = G.xz(units[id].at), a = (i * 2.4 + id.length) % (Math.PI * 2); return { id, x: x + Math.cos(a) * .45, z: z + Math.sin(a) * .45, r: 1 + (i % 2) * .25 }; }) };
        cap.innerHTML += `<span class="st-text st-fogtext"><b>${esc(fk.who)}:</b> ${esc(fk.text || '')}${fk.src ? ` <span class="muted">Nguồn: ${esc(fk.src)}.</span>` : ''}</span>`;
      }
      if (renderer) {
        while (zoneGroup.children.length) { const c = zoneGroup.children.pop(); c.geometry.dispose(); c.material.dispose(); }
        (S.zones || []).forEach((zn) => {
          const m = new THREE.Mesh(new THREE.CircleGeometry(zn.r, 40), new THREE.MeshBasicMaterial({ color: '#b23a2a', transparent: true, opacity: .16, depthWrite: false }));
          m.rotation.x = -Math.PI / 2; m.position.set(zn.x, G.hAt(zn.x, zn.z) + .12, zn.z); zoneGroup.add(m);
        });
        b.units.forEach((u) => { const g = meshes[u.id], { body, flag, ring } = g.userData, lost = S.lose.has(u.id); g.visible = S.show.has(u.id);
          body.material.color.set(lost ? COLORS.lost : (b.sides[u.side] || {}).color || '#888');
          body.material.opacity = S.dim.has(u.id) ? .35 : 1; flag.visible = lost; ring.visible = S.hit.has(u.id) && !lost; });
        drawLines3d(S.lines);
      }
      zoneLbls.forEach((e) => { e.hidden = true; });
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
