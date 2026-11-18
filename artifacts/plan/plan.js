/* Hành vi của trang kế hoạch (artifacts/plan/README.md). Thân trang đã dựng sẵn từ file kế hoạch; file này lo:
   mục lục sáng theo chỗ đang đọc, bản đồ ga theo ngày kèm núm vặn, câu hỏi trả lời bằng nút,
   lưu vào máy và db của trang ở plans/<id>, chép và gửi cho Claude. */
(() => {
  const P = JSON.parse(document.getElementById('plan').textContent);
  const $ = (id) => document.getElementById(id);
  const DAY = 864e5;
  const toc = $('toc');

  // ---------- Mục lục: đo chiều cao thật để nhảy tới mục không bị che; sáng mục đang đọc, tắt khi không còn mục nào ----------
  const links = [...toc.querySelectorAll('a')];
  const secs = links.map((a) => document.querySelector(a.getAttribute('href')));
  function measure() {
    document.documentElement.style.setProperty('--toc-h', toc.offsetHeight + 'px');
    const map = $('daymap');
    document.documentElement.style.setProperty('--map-h', map ? map.offsetHeight + 'px' : '0px');
  }
  function lightToc() {
    const top = toc.offsetHeight + 16;
    let on = -1;
    secs.forEach((s, k) => { if (s) { const r = s.getBoundingClientRect(); if (r.top <= top + 40 && r.bottom > top) on = k; } });
    links.forEach((a, k) => { a.classList.toggle('on', k === on); if (k === on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    if (on >= 0) { const a = links[on], box = toc.firstElementChild; if (a.offsetLeft < box.scrollLeft || a.offsetLeft + a.offsetWidth > box.scrollLeft + box.clientWidth) box.scrollLeft = a.offsetLeft - 12; }
  }

  // ---------- Bản đồ ga theo ngày ----------
  const svg = $('map');
  const NS = 'http://www.w3.org/2000/svg';
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const day = (s) => Date.parse(s + 'T00:00:00Z');
  const ddmm = (t) => { const d = new Date(t); return ('0' + d.getUTCDate()).slice(-2) + '/' + ('0' + (d.getUTCMonth() + 1)).slice(-2); };
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const cks = P.checkpoints.filter((c) => c.state !== 'dropped');
  const rest = cks.filter((c) => c.state !== 'done' && !c.gate);
  const canPace = rest.length > 0 && rest.every((c) => typeof c.est === 'number' && c.est > 0);
  let pace = 3, sel = (P.checkpoints.find((c) => c.state === 'now') || {}).id || '';

  /** Ngày của từng ga: ga xong ở ngày xong, mốc ở đúng ngày của mốc (không trượt theo núm), ga còn lại nối nhau từ hôm nay theo số phiên. */
  function place() {
    const out = [];
    let t = Math.max(today, ...cks.filter((c) => c.state === 'done' && c.doneDate).map((c) => day(c.doneDate)));
    for (const c of cks) {
      if (c.state === 'done') { if (c.doneDate) out.push({ c, t: day(c.doneDate) }); continue; }
      if (c.gate) { out.push({ c, t: day(c.gate), fixed: true }); continue; }
      if (!canPace) continue;
      t += Math.max(1, Math.round(c.est * 7 / pace)) * DAY;
      out.push({ c, t });
    }
    return out;
  }
  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }
  function draw() {
    if (!svg) return;
    const pts = place();
    const W = svg.clientWidth || 600, H = svg.clientHeight || 84, Y = 42, L = 16, R = W - 16;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.textContent = '';
    el('title', { id: 'map-t' }).textContent = 'Các ga trên trục ngày';
    if (!pts.length) return;
    const t0 = Math.min(today, ...pts.map((p) => p.t)) - DAY, t1 = Math.max(today, ...pts.map((p) => p.t)) + DAY;
    const x = (t) => L + (R - L) * (t - t0) / Math.max(DAY, t1 - t0);
    const span = (t1 - t0) / DAY, step = span > 70 ? 28 : span > 35 ? 14 : 7;
    for (let t = t0 + DAY; t < t1; t += step * DAY) {
      const g = el('g', { class: 'tick' }); el('line', { x1: x(t), x2: x(t), y1: Y - 4, y2: Y + 4 }, g);
    }
    el('line', { class: 'axis', x1: L, x2: R, y1: Y, y2: Y });
    const done = pts.filter((p) => p.c.state === 'done');
    if (done.length) el('line', { class: 'done-track', x1: x(Math.min(...done.map((p) => p.t))), x2: x(Math.min(today, Math.max(...done.map((p) => p.t)))), y1: Y, y2: Y });
    const g0 = el('g', { class: 'today' }); el('line', { x1: x(today), x2: x(today), y1: 14, y2: Y + 12 }, g0);
    const tt = el('text', { x: x(today), y: 10, 'text-anchor': x(today) > W - 60 ? 'end' : x(today) < 60 ? 'start' : 'middle' }, g0); tt.textContent = 'hôm nay';
    // Hai ga cùng ngày (hay quá sát) thì đẩy cách nhau ít nhất GAP điểm ảnh; ngày ghi dưới vẫn là ngày thật.
    const GAP = 26;
    pts.sort((a, b) => a.t - b.t || P.checkpoints.indexOf(a.c) - P.checkpoints.indexOf(b.c));
    const xs = pts.map((p) => x(p.t));
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + GAP);
    if (xs.length && xs[xs.length - 1] > R) { xs[xs.length - 1] = R; for (let i = xs.length - 2; i >= 0; i--) xs[i] = Math.min(xs[i], xs[i + 1] - GAP); }
    let up = true;
    pts.forEach((p, i) => {
      const cx = xs[i];
      up = i > 0 && cx - xs[i - 1] < 40 ? !up : false;
      const cls = ['st', p.c.state, p.fixed ? 'gate' : '', p.c.id === sel ? 'sel' : ''].filter(Boolean).join(' ');
      const g = el('g', { class: cls, tabindex: '0', role: 'button', 'aria-label': `Ga ${p.c.num}: ${p.c.name}, ${p.c.state === 'done' ? 'xong ' : p.fixed ? 'mốc ' : 'dự kiến '}${ddmm(p.t)}` });
      el('circle', { class: 'c', cx, cy: Y, r: p.c.id === sel ? 12 : 10 }, g);
      el('text', { class: 'n', x: cx, y: Y }, g).textContent = p.c.num;
      if (i === 0 || ddmm(p.t) !== ddmm(pts[i - 1].t)) el('text', { class: 'd', x: cx, y: up ? Y - 19 : Y + 28, 'text-anchor': cx < L + 14 ? 'start' : cx > R - 14 ? 'end' : 'middle' }, g).textContent = ddmm(p.t);
      const go = () => { const s = $(p.c.id); if (s) { select(p.c.id); s.scrollIntoView(); } };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    const out = $('readout');
    if (out) {
      const left = pts.filter((p) => p.c.state !== 'done' && !p.fixed);
      const missing = rest.length && !canPace ? ` ${rest.length} ga chưa có dòng "Ước:" nên chưa đặt lên trục.` : '';
      out.innerHTML = left.length
        ? `Với <b>${pace} phiên</b> mỗi tuần, ga cuối xong khoảng <b>${ddmm(Math.max(...left.map((p) => p.t)))}</b>.` +
          (pts.some((p) => p.fixed && p.c.state !== 'done') ? ' Mốc đứng yên, không trượt theo núm.' : '')
        : (cks.every((c) => c.state === 'done') ? 'Mọi ga đã xong.' : 'Ga còn lại chưa ước số phiên.') + missing;
    }
  }
  function select(id) {
    if (!id || id === sel) return;
    sel = id;
    document.querySelectorAll('.stop').forEach((s) => s.classList.toggle('sel', s.id === id));
    draw();
  }
  if ($('knob') && canPace) {
    $('knob').hidden = false;
    $('pace').addEventListener('input', (e) => { pace = +e.target.value; $('pace-v').textContent = pace; draw(); });
  }
  // Ga đang đọc là ga có đầu nằm gần dưới bản đồ nhất; chạy cả khi cuộn ngược lên.
  const stops = [...document.querySelectorAll('.stop')];
  function readStop() {
    if (!svg) return;
    const line = toc.offsetHeight + ($('daymap') ? $('daymap').offsetHeight : 0) + 24;
    let best = null;
    for (const s of stops) { const r = s.getBoundingClientRect(); if (r.top <= line + 60 && r.bottom > line) best = s; }
    if (best) select(best.id);
  }

  // ---------- Câu hỏi, chi tiết thử, ghi chú ----------
  const store = Kit.store('plan:' + P.id, 'plans/' + P.id);
  const S = { answers: {}, trial: '', note: '' };
  P.questions.forEach((q) => { const k = q.options.findIndex((o) => o.rec); S.answers[q.id] = k < 0 ? 0 : k; });
  const qs = $('qs');
  P.questions.forEach((q, i) => {
    const f = document.createElement('fieldset'); f.className = 'q';
    f.innerHTML = `<legend>${i + 1}. ${q.q}</legend><div class="opts2"></div>`;
    q.options.forEach((o, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'choice'; b.disabled = true; b.dataset.q = q.id; b.dataset.k = k;
      b.innerHTML = `<i></i><span>${o.html}${o.rec ? '<span class="rec">đề xuất</span>' : ''}${o.why ? `<span class="why">${o.why}</span>` : ''}</span>`;
      b.addEventListener('click', () => { S.answers[q.id] = k; changed(); });
      f.lastElementChild.appendChild(b);
    });
    qs.appendChild(f);
  });
  document.querySelectorAll('[data-trial]').forEach((b) => b.addEventListener('click', () => { S.trial = S.trial === b.dataset.trial ? '' : b.dataset.trial; changed(); }));
  $('note').addEventListener('input', () => { S.note = $('note').value; changed(true); });

  function compose(st) {
    const lines = [`Trả lời kế hoạch "${P.title}" (${P.id}):`];
    const allRec = P.questions.length && P.questions.every((q) => q.options[st.answers[q.id]]?.rec);
    if (allRec) lines.push(`ok, theo cả ${P.questions.length} đề xuất.`);
    P.questions.forEach((q, i) => { const o = q.options[st.answers[q.id]] || q.options[0]; lines.push(`${i + 1}. ${q.qText} → ${o.text}${o.rec ? ' (đề xuất)' : ''}`); });
    if (P.trial && st.trial) lines.push(`Chi tiết thử (${P.trial}): ${st.trial}`);
    if (st.note.trim()) lines.push('Ghi chú: ' + st.note.trim());
    if (lines.length === 1) lines.push('(chưa chọn gì)');
    return lines.join('\n');
  }
  function paint() {
    document.querySelectorAll('.choice[data-q]').forEach((b) => b.setAttribute('aria-pressed', String(S.answers[b.dataset.q] === +b.dataset.k)));
    document.querySelectorAll('[data-trial]').forEach((b) => b.setAttribute('aria-pressed', String(S.trial === b.dataset.trial)));
    $('preview').textContent = compose(S);
  }
  // Mỗi lần đổi: vẽ lại, xoá dòng "Đã chép"/"Đã gửi" cũ vì nó nói về câu trả lời trước, rồi lưu.
  function changed(typing) {
    if (!typing) $('note').value = S.note;
    paint();
    $('status').textContent = '';
    store.save({ ...S });
  }
  async function send() {
    const st = { ...S, sentAt: new Date().toISOString() };
    const text = compose(st);
    store.save(st, true);
    if (await Kit.sendToClaude(text, $('cau-hoi'))) $('status').textContent = 'Đã gửi cho Claude. Claude trả lời trong comment.';
    else $('status').textContent = (await Kit.copy(text)) ? 'Chưa gửi thẳng được, đã chép: dán vào chat cho Claude.' : 'Chưa gửi thẳng được. Chép đoạn trong ô hiện ra rồi dán vào chat.';
  }
  $('copy').addEventListener('click', async () => { store.save({ ...S }, true); $('status').textContent = (await Kit.copy(compose(S))) ? 'Đã chép. Dán vào chat gửi Claude.' : ''; });
  $('send').addEventListener('click', send);

  // Nút chỉ bật sau khi đã đọc bản lưu, để không ghi đè lựa chọn cũ bằng mặc định.
  paint();
  store.load().then((saved) => {
    if (saved) {
      for (const q of P.questions) if (Number.isInteger(saved.answers?.[q.id]) && q.options[saved.answers[q.id]]) S.answers[q.id] = saved.answers[q.id];
      if (typeof saved.trial === 'string') S.trial = saved.trial;
      if (typeof saved.note === 'string') S.note = saved.note;
    }
  }).catch(() => {}).finally(() => {
    $('note').value = S.note;
    document.querySelectorAll('.choice, #note, #copy, #send').forEach((e) => { e.disabled = false; });
    paint();
  });

  // ---------- Khởi động ----------
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; lightToc(); readStop(); }); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(); draw(); onScroll(); });
  if (sel) { const s = $(sel); if (s) s.classList.add('sel'); }
  measure(); draw(); lightToc();
})();
