/* Hành vi của trang luồng chạy (artifacts/flow/README.md). Thân trang đã dựng sẵn từ file luồng; file này lo:
   sáng bước đang đọc khi cuộn; khối so-do: vẽ sơ đồ (Diagram.mount của kit), sáng khối theo bước, chạm khối thì nhảy tới bước,
   giữ khối đang đọc trong tầm nhìn của dải sơ đồ; khối ke-lai: ô tự kể lại, lưu vào máy và db ở flows/<id>, chép, gửi cho Claude.
   Mỗi khối nằm trong một vùng @block (KH9 ga 2): trang không có khối thì kit/pack.mjs bỏ cả code của nó.
   Code ngoài vùng chỉ gọi khối sơ đồ qua `chart`, có giá trị mặc định không làm gì. */
(() => {
  const F = JSON.parse(document.getElementById('flow').textContent);
  const $ = (id) => document.getElementById(id);
  const beats = [...document.querySelectorAll('.beat')];
  const n = beats.length;
  const wide = matchMedia('(min-width: 1024px)');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let cur = -2;
  // top(): mép dưới phần dính phía trên cột chữ (dải sơ đồ ở khổ hẹp); go(a): sơ đồ theo bước a.
  let chart = { top: () => 0, go() {} };

  /* @block so-do flow-chart */
  chart = (() => {
    const host = $('flow-dg'), band = $('band'), cap = $('cap');
    if (!host || !F.spec) return chart;   // trang không có khối sơ đồ
    const idx = new Map(F.spec.steps.map((id, i) => [id, i]));
    let D = null;
    // Điện thoại và máy tính bảng: luôn ngang, dải sơ đồ tự cuộn ngang theo khối đang đọc (không chiếm nửa màn).
    // Màn rộng: cột bên phải, sơ đồ tự chọn ngang hay dọc theo bề rộng cột.
    function mount() {
      D = Diagram.mount(host, { ...F.spec, dir: wide.matches ? 'auto' : 'LR' });
      cur = -2;
      measure();
      update();
    }
    host.addEventListener('click', (e) => {
      const b = e.target.closest('.dg-node');
      const s = b && $('b-' + b.dataset.id);
      if (s) { s.scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'start' }); }
    });
    function go(a) {
      if (!D) return;
      D.go(a);
      host.querySelectorAll('.dg-node').forEach((b) => { const i = idx.get(b.dataset.id); b.classList.toggle('seen', i != null && i < a); });
      cap.innerHTML = '';
      if (a < 0) cap.textContent = `Toàn cảnh · ${n} bước · cuộn xuống để đi từng bước`;
      else { cap.append(`Bước ${a + 1}/${n} · `); const b = document.createElement('b'); b.textContent = F.labels[a]; cap.append(b); }
      follow();
    }
    /** Giữ khối đang đọc trong tầm nhìn: dải ngang cuộn ngang, cột bên phải cuộn dọc. */
    function follow() {
      const box = host.querySelector('.dg-scroll'), node = host.querySelector('.dg-node.on');
      const how = still.matches ? 'auto' : 'smooth';
      if (!wide.matches && box) {
        const stage = box.firstElementChild;
        const left = node ? stage.offsetLeft + node.offsetLeft + node.offsetWidth / 2 - box.clientWidth / 2 : 0;
        box.scrollTo({ left: Math.max(0, left), behavior: how });
      } else if (wide.matches && band.scrollHeight > band.clientHeight) {
        const top = node ? node.getBoundingClientRect().top - band.getBoundingClientRect().top + band.scrollTop - band.clientHeight / 3 : 0;
        band.scrollTo({ top: Math.max(0, top), behavior: how });
      }
    }
    function measure() {
      document.documentElement.style.setProperty('--band-h', wide.matches ? '0px' : band.offsetHeight + 'px');
    }
    addEventListener('resize', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(band);
    (wide.addEventListener ? wide.addEventListener('change', mount) : wide.addListener(mount));
    // Vẽ sau khi phần còn lại của file đã chạy (update dùng chart).
    queueMicrotask(mount);
    return { top: () => (wide.matches ? 0 : band.getBoundingClientRect().bottom), go };
  })();
  /* @end so-do */

  /** Bước đang đọc: bước cuối cùng có đầu đã qua vạch đọc (khoảng một phần ba phần màn dưới dải sơ đồ). -1 là toàn cảnh. */
  function active() {
    const top = chart.top();
    const line = top + (innerHeight - top) * 0.35;
    let a = -1;
    beats.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) a = i; });
    return a;
  }
  function update() {
    const a = active();
    if (a === cur) return;
    cur = a;
    beats.forEach((s, i) => { s.classList.toggle('on', i === a); s.classList.toggle('seen', i < a); });
    chart.go(a);
  }

  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
  addEventListener('resize', () => { cur = -2; update(); });

  /* @block ke-lai */
  (() => {
    if (!$('tell')) return;   // trang không có ô kể lại
    const store = Kit.store('flow:' + F.id, 'flows/' + F.id);
    const S = { tell: '', trial: '' };
    const tell = $('tell');
    function compose(st) {
      const lines = [`Kể lại luồng "${F.title}" (${F.id}):`, st.tell.trim() || '(chưa viết gì)'];
      if (F.trial && st.trial) lines.push(`Chi tiết thử (${F.trial}): ${st.trial}`);
      return lines.join('\n');
    }
    function paint() {
      document.querySelectorAll('[data-trial]').forEach((b) => b.setAttribute('aria-pressed', String(S.trial === b.dataset.trial)));
    }
    // Chép, gửi và dòng báo: khối dùng chung của kit (Kit.sendBox, KH9). Chưa viết gì thì chưa gửi.
    const box = Kit.sendBox({ copy: $('copy'), send: $('send'), status: $('status'), anchor: $('ke-lai'), text: compose,
      snapshot: (sending) => (sending ? { ...S, sentAt: new Date().toISOString() } : { ...S }),
      save: (st) => store.save(st, true),
      check: () => { if (S.tell.trim()) return ''; tell.focus(); return 'Viết vài câu trước đã.'; } });
    // Mỗi lần đổi: xoá dòng "Đã chép"/"Đã gửi" cũ vì nó nói về bản trước, rồi lưu.
    function changed() { paint(); box.clear(); store.save({ ...S }); }
    tell.addEventListener('input', () => { S.tell = tell.value; changed(); });
    document.querySelectorAll('[data-trial]').forEach((b) => b.addEventListener('click', () => { S.trial = S.trial === b.dataset.trial ? '' : b.dataset.trial; changed(); }));
    // Ô và nút chỉ bật sau khi đã đọc bản lưu, để không ghi đè chữ cũ bằng ô trống.
    store.load().then((saved) => {
      if (saved && typeof saved.tell === 'string') S.tell = saved.tell;
      if (saved && typeof saved.trial === 'string') S.trial = saved.trial;
    }).catch(() => {}).finally(() => {
      tell.value = S.tell;
      document.querySelectorAll('#tell, #copy, #send, [data-trial]').forEach((e) => { e.disabled = false; });
      paint();
    });
  })();
  /* @end ke-lai */

  update();
})();
