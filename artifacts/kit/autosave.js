/* Tự lưu chỗ đang học và chế độ học lại, cho mọi trang học (xem artifacts/lesson/README.md). Chạy sau mọi script khác của trang.
   1. Tự lưu: ghi từng lần bấm và chữ đã gõ, mỗi lần theo TÊN của nút hay ô (không theo thứ tự nút trong trang),
      lưu vào máy (localStorage) và db của trang (drafts/<id>). Mở lại, tải lại, hay sau khi AI đăng bản sửa: bấm lại theo tên để về chỗ cũ.
      Tên của một nút: data-key nếu có; không thì các thuộc tính data-* của nút (data-v="A", data-go="4", data-val="40"),
      kèm tên khung chứa nó (id, data-q, data-c, data-pane, data-knob...); không có thuộc tính nào thì lấy chữ trên nút.
      Trang thêm hay bớt nút ở chỗ khác không làm lệch tên. Nút đã bị bỏ thì bỏ qua lần bấm đó, các lần khác vẫn mở lại.
      Tên được tính một lần lúc tải trang, trước khi trang tự đổi thuộc tính, nên lần ghi và lần mở lại khớp nhau.
      Ô chữ (textarea): tên là data-key, không thì placeholder.
      Bản lưu cũ (theo thứ tự nút, trước 2026-11-14) vẫn mở được theo cách cũ.
   2. Học lại: sau khi bấm "Xong buổi học" (#finish), lần mở sau ẩn [data-part~="review"] và mở khóa [data-review-gate].
   Nút không muốn ghi (nút hỏi Claude, nút quay lại, mic) mang data-noreplay. */
(() => {
  const ID = (document.querySelector('meta[name="lesson-id"]') || {}).content || document.title;
  const LK = 'lesson-kit:' + ID, DOC = 'drafts/' + ID.replace(/[^a-z0-9-]/gi, '-');
  const btns = () => [...document.querySelectorAll('button:not(#kit-bar button):not([data-noreplay])')];
  const tas = () => [...document.querySelectorAll('textarea')];
  const sq = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const lab = (b) => sq(b.textContent).slice(0, 60);

  // ---------- Tên của nút và ô ----------
  const SCOPE = ['id', 'data-key', 'data-q', 'data-c', 'data-pane', 'data-knob', 'data-f', 'data-z', 'data-u'];
  const SKIP = new Set(['data-noreplay', 'data-need', 'data-review-gate', 'data-label', 'data-mode', 'data-stage']);
  const attrs = (e, keep) => [...e.attributes].filter(keep).map((a) => `[${a.name}=${a.value}]`).join('');
  function rawKey(b) {
    if (b.dataset.key) return 'k:' + b.dataset.key;
    let scope = '';
    for (let p = b.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = attrs(p, (a) => SCOPE.includes(a.name));
      if (s) scope = s + '>' + scope;
    }
    const own = attrs(b, (a) => a.name.startsWith('data-') && !SKIP.has(a.name)) || (b.id ? '#' + b.id : '') || '"' + lab(b) + '"';
    return scope + own;
  }
  const cache = new WeakMap();
  /** Tên của mọi nút đang có; tên trùng thì thêm ~2, ~3 theo thứ tự trong trang. */
  function keyed() {
    const seen = new Map(), out = new Map();
    for (const b of btns()) {
      if (!cache.has(b)) cache.set(b, rawKey(b));
      const k = cache.get(b), n = (seen.get(k) || 0) + 1;
      seen.set(k, n);
      out.set(b, n > 1 ? k + '~' + n : k);
    }
    return out;
  }
  const keyOf = (b) => keyed().get(b);
  const findKey = (k) => { for (const [b, x] of keyed()) if (x === k) return b; return null; };
  const taKey = (t) => (t.dataset.key ? 'k:' + t.dataset.key : 'p:' + (t.placeholder || tas().indexOf(t)));
  const findTa = (k) => tas().find((t) => taKey(t) === k) || null;
  keyed();   // tính tên ngay lúc tải, trước khi trang đổi thuộc tính

  // ---------- Lưu ----------
  let S = { v: 2, log: [], finished: false, everDone: false, doneAt: null, start: new Date().toISOString(), ts: 0 };
  let replaying = false, acted = false, timer = null, writing = false, again = false, db = null;
  const bar = document.createElement('div'); bar.id = 'kit-bar'; bar.setAttribute('role', 'status'); document.body.appendChild(bar);
  function say(msg, withReset) {
    bar.innerHTML = '<span></span>' + (withReset ? '<button type="button" data-k="reset">Học lại từ đầu</button>' : '')
      + '<button type="button" class="x" data-k="x" aria-label="Đóng">✕</button>';
    bar.firstChild.textContent = msg; bar.classList.add('on');
    clearTimeout(say.t); say.t = setTimeout(() => bar.classList.remove('on'), 9000);
  }
  bar.addEventListener('click', (e) => {
    const k = e.target.dataset.k;
    if (k === 'x') bar.classList.remove('on');
    if (k === 'reset') { S.log = []; S.finished = false; S.ts = Date.now(); flush().then(() => location.reload()); }
  });
  function local() { try { return JSON.parse(localStorage.getItem(LK) || 'null'); } catch (e) { return null; } }
  function flush() {
    clearTimeout(timer); timer = null;
    try { localStorage.setItem(LK, JSON.stringify(S)); } catch (e) {}
    if (!db) return Promise.resolve();
    if (writing) { again = true; return Promise.resolve(); }
    writing = true;
    return Promise.race([db.doc(DOC).set(S), new Promise((r) => setTimeout(r, 8000))]).catch(() => {})
      .then(() => { writing = false; if (again) { again = false; flush(); } });
  }
  function save() { clearTimeout(timer); timer = setTimeout(flush, 700); }
  // Tắt màn, chuyển app hay tải lại trong lúc đang chờ lưu: ghi ngay, đừng để mất lần bấm cuối.
  addEventListener('pagehide', () => { if (timer) flush(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) flush(); });
  function rec(a) { if (replaying) return; acted = true; S.log.push(a); S.ts = Date.now(); save(); }
  document.addEventListener('click', (e) => {
    if (!e.isTrusted) return;
    const b = e.target.closest('button');
    if (!b || b.closest('#kit-bar') || b.id === 'copy' || b.hasAttribute('data-noreplay')) return;
    if (b.id === 'finish') { acted = true; S.finished = true; S.everDone = true; S.doneAt = new Date().toISOString(); S.ts = Date.now(); flush(); return; }
    const k = keyOf(b);
    if (k) rec({ k });
  }, true);
  document.addEventListener('input', (e) => {
    if (replaying || !e.isTrusted || e.target.tagName !== 'TEXTAREA') return;
    const k = taKey(e.target), last = S.log[S.log.length - 1];
    if (last && last.t === k) { last.v = e.target.value; acted = true; S.ts = Date.now(); save(); } else rec({ t: k, v: e.target.value });
  }, true);

  function reviewOff() {
    document.documentElement.classList.add('kit-review-off');
    document.querySelectorAll('[data-review-gate]').forEach((b) => { b.disabled = false; });
    if (typeof R !== 'undefined' && R) R.mode = 'hoc-lai';
  }
  const setText = (t, v) => { t.value = v; t.dispatchEvent(new Event('input', { bubbles: true })); };

  // ---------- Mở lại ----------
  /** Bản lưu mới (v 2): bấm lại theo tên; nút không còn, hay đang khóa, thì bỏ qua lần đó. */
  function replayKeyed(log) {
    let miss = 0;
    for (const a of log) {
      if ('k' in a) { const b = findKey(a.k); if (b && !b.disabled) b.click(); else miss++; }
      else if ('t' in a) { const t = findTa(a.t); if (t) setText(t, a.v); else miss++; }
    }
    return miss;
  }
  /** Bản lưu cũ (theo thứ tự nút): bấm lại tới chỗ còn khớp chữ và chỗ của nút, rồi trả lại chữ đã gõ theo placeholder. */
  function replayOld(d) {
    const ctx = (b) => {
      let tag = '';
      for (let p = b.parentElement; p && p !== document.body; p = p.parentElement) {
        tag += (p.id ? '#' + p.id : '') + [...p.attributes].filter((x) => x.name.startsWith('data-') && x.name !== 'data-part').map((x) => '[' + x.name + '=' + x.value + ']').join('');
        let rest = p.textContent || ''; for (const x of p.querySelectorAll('button')) rest = rest.split(x.textContent || '').join('');
        if (sq(rest)) return (tag + '|' + sq(p.textContent)).slice(0, 160);
      }
      return tag;
    };
    const fp = btns().length + 'b' + tas().length + 't';
    let n = 0, cut = d.fp !== fp;
    if (!cut) {
      for (const a of d.log) {
        if ('c' in a) {
          const b = btns()[a.c];
          if ((a.x !== undefined && (!b || lab(b) !== a.x)) || (a.y !== undefined && (!b || ctx(b) !== a.y))) { cut = true; break; }
          if (b && !b.disabled) b.click();
        } else { const t = tas()[a.t]; if (t) setText(t, a.v); }
        n++;
      }
    }
    // Chuyển phần đã mở lại sang cách lưu mới, phần còn lại chỉ giữ chữ đã gõ.
    const done = cut ? [] : d.log, rest = cut ? d.log : [];
    const last = new Map();
    for (const a of rest) if ('t' in a && typeof a.v === 'string') { const t = tas().find((x) => x.placeholder === a.p); if (t) last.set(t, a.v); }
    for (const [t, v] of last) setText(t, v);
    S.log = [];
    if (!cut) for (const a of done) { if ('c' in a) { const b = btns()[a.c]; const k = b && keyOf(b); if (k) S.log.push({ k }); } else { const t = tas()[a.t]; if (t) S.log.push({ t: taKey(t), v: a.v }); } }
    for (const [t, v] of last) S.log.push({ t: taKey(t), v });
    return cut;
  }
  function apply(d) {
    if (!d) return false;
    S.everDone = !!d.everDone; S.doneAt = d.doneAt || null;
    if (S.everDone) reviewOff();
    if (d.finished || !d.log || !d.log.length) return false;
    replaying = true;
    let msg;
    try {
      if (d.v === 2) {
        const miss = replayKeyed(d.log);
        S.log = d.log;
        msg = miss ? `Trang vừa được sửa: mình mở lại được ${d.log.length - miss}/${d.log.length} thao tác, phần còn lại không còn trên trang.` : 'Đã mở lại đúng chỗ bạn đang học.';
      } else {
        const cut = replayOld(d);
        msg = cut ? 'Trang đã đổi nên mình chỉ giữ lại được chữ bạn đã gõ.' : 'Đã mở lại đúng chỗ bạn đang học.';
      }
    } catch (e) { msg = 'Mở lại chưa trọn vẹn. Chữ bạn đã gõ vẫn còn.'; }
    replaying = false;
    S.start = d.start || S.start; S.ts = d.v === 2 ? d.ts || Date.now() : Date.now();
    if (d.v !== 2) save();
    if (typeof R !== 'undefined' && R && d.start) R.start = d.start;
    say(msg, true);
    return true;
  }

  const L = local(), usedL = apply(L);
  (async () => {
    try {
      const dbp = window.claude && window.claude.use ? window.claude.use('db') : null;
      db = dbp ? await Promise.race([dbp, new Promise((r) => setTimeout(() => r(null), 10000))]) : null;
    } catch (e) { db = null; }
    if (!db) return;
    let d = null;
    try {
      const snap = await Promise.race([db.doc(DOC).get(), new Promise((r) => setTimeout(() => r(null), 8000))]);
      d = snap && (typeof snap.data === 'function' ? snap.data() : snap.data !== undefined ? snap.data : snap);
    } catch (e) { d = null; }
    if (d && !acted && (!L || (d.ts || 0) > (L.ts || 0))) {
      // Bản trên db mới hơn: nếu đã bấm lại bản trong máy thì nạp lại trang từ bản db, để không bấm chồng hai lần.
      if (usedL) {
        try { localStorage.setItem(LK, JSON.stringify(d)); location.reload(); }
        catch (e) { say('Có bản lưu mới hơn ở máy khác nhưng chưa mở được. Trang giữ chỗ bạn đang học trên máy này.', false); }
        return;
      }
      apply(d);
    } else if (d && d.everDone && !S.everDone) { S.everDone = true; S.doneAt = d.doneAt; reviewOff(); }
    if (acted) save();
  })();
  window.KitAutosave = { keyOf, keyed: () => [...keyed().values()] };
})();
