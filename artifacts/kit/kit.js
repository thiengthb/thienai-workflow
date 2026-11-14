/* Lõi chung cho mọi trang artifact của thien (xem artifacts/README.md). Không phụ thuộc thư viện nào.
   Kit.cap(name)         khả năng của artifact (db, comments, downloads...) hoặc null; không bao giờ ném lỗi.
   Kit.toast(msg)        một dòng thông báo ở đáy màn.
   Kit.copy(text)        chép vào clipboard; không chép được thì hiện ô chữ để tự chọn.
   Kit.saveFile(n, text) đưa file cho người xem lưu (khả năng downloads); không có thì chép.
   Kit.store(key, path)  nháp trong máy (localStorage) + bản trong db của trang ở `path`, để Claude đọc lại.
   Kit.put(path, obj)    ghi một document một lần (không qua hàng đợi), ví dụ bản chụp của lần gửi.
   Kit.sendToClaude(text, el)  gửi một comment cho Claude (người sửa được trang); trả về true nếu đã gửi.
   Kit.ask(prompt, out, opts)  hỏi Claude ngay trên trang (khả năng sample), chữ hiện dần vào out; trả về câu trả lời hoặc null.
   Kit.askJson(prompt, out, opts)  như ask nhưng Claude trả về một giá trị JSON; out chỉ hiện chữ chờ và lỗi.
   Kit.dictate(btn, field, partial, onUse)  nút mic nói thay gõ (khả năng dictation) cho một ô chữ; nút ẩn nơi không có mic.
   Kit.listen(btn, getText, onUse)  nút loa đọc to một đoạn chữ (khả năng tts); nút ẩn nơi không đọc được (Safari, app điện thoại). */
(() => {
  const caps = {};
  function cap(name, ms = 10000) {
    if (caps[name]) return caps[name];
    const c = window.claude;
    caps[name] = !c || typeof c.use !== 'function' ? Promise.resolve(null)
      : Promise.race([Promise.resolve().then(() => c.use(name)).catch(() => null), new Promise((r) => setTimeout(() => r(null), ms))]);
    return caps[name];
  }

  let toastEl, toastTimer;
  function toast(msg, ms = 4000) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'kit-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms);
  }

  function showText(text) {
    const box = document.createElement('div');
    box.className = 'card'; box.style.cssText = 'position:fixed;inset:auto 16px 16px;z-index:70;padding:12px;display:grid;gap:8px;box-shadow:var(--shadow)';
    const ta = document.createElement('textarea'); ta.id = 'kit-copy-box'; ta.rows = 8; ta.value = text; ta.readOnly = true;
    const close = document.createElement('button'); close.className = 'btn'; close.type = 'button'; close.textContent = 'Đóng';
    close.onclick = () => box.remove();
    box.append(Object.assign(document.createElement('p'), { textContent: 'Không chép tự động được. Chọn hết chữ dưới đây rồi chép.', className: 'muted' }), ta, close);
    document.body.appendChild(box); ta.focus(); ta.select();
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Đã chép.'); return true; }
    catch (e) { showText(text); return false; }
  }

  async function saveFile(filename, text) {
    const d = await cap('downloads', 3000);
    if (d && d.save) {
      try { await d.save({ filename, data: text }); return true; } catch (e) { if (e && e.code === 'declined') return false; }
    }
    return copy(text);
  }

  function store(key, path) {
    const lk = 'kit:' + key;
    let timer = null, pending = null, running = null;
    // The db copy could not be read at load: until a later read shows it is not newer than what this draft
    // started from (`base`), never write over it. A newer copy blocks db writes. `base` is kept on the device
    // (key lk + ':base') so a reload does not forget that the local draft was never merged with db.
    const gk = lk + ':base';
    let unread = false, base = 0, blocked = false;
    const wait = (p, ms) => Promise.race([p, new Promise((_, j) => setTimeout(() => j(new Error('timeout')), ms))]);
    const keepBase = (v) => { try { if (v === null) localStorage.removeItem(gk); else localStorage.setItem(gk, String(v)); } catch (e) { /* in memory only */ } };
    const readBase = () => { try { const v = localStorage.getItem(gk); return v === null ? null : +v || 0; } catch (e) { return null; } };
    const conflict = () => { blocked = true; toast('Trang có bản lưu mới hơn từ lần mở khác. Thay đổi ở đây tạm chỉ lưu trên máy này, chưa ghi đè bản trên trang.', 9000); };
    /** A db copy `r` is safe to write over when it is missing or not newer than `base`. */
    const settle = (r) => { if (!r || (r.ts || 0) <= base) { unread = false; keepBase(null); return true; } conflict(); return false; };
    async function mayWrite(db) {
      if (blocked) return false;
      if (!unread) return true;
      try { const s = await wait(db.doc(path).get(), 8000); return settle(s.exists ? s.data() : null); }
      catch (e) { return false; /* still unreadable: try again on the next save */ }
    }
    const readLocal = () => { try { return JSON.parse(localStorage.getItem(lk) || 'null'); } catch (e) { return null; } };
    /** Writes the newest object; writes queued while one runs collapse into one. Resolves true once db holds it. */
    async function push(obj) {
      const db = await cap('db');
      if (!db || !path || !(await mayWrite(db))) return false;
      pending = obj;
      if (!running) running = (async () => {
        let ok = true;
        while (pending) { const o = pending; pending = null; try { await db.doc(path).set(o); ok = true; } catch (e) { ok = false; } }
        running = null;
        return ok;
      })();
      return Promise.race([running, new Promise((r) => setTimeout(() => r(false), 8000))]);
    }
    return {
      /** The newer of the local draft and the db copy (by `ts`). */
      async load() {
        const local = readLocal();
        const kept = local ? readBase() : null;   // set by an earlier view whose db read failed
        let remote = null;
        const db = await cap('db');
        if (db && path) {
          try {
            const s = await wait(db.doc(path).get(), 8000); remote = s.exists ? s.data() : null;
            if (kept !== null) { unread = true; base = kept; if (!settle(remote)) return local; }
          } catch (e) {
            remote = null; unread = true; base = kept !== null ? kept : (local && local.ts) || 0; keepBase(base);
          }
        }
        if (local && remote) return (local.ts || 0) >= (remote.ts || 0) ? local : remote;
        return local || remote;
      },
      /** Saves now to the device, and to db after a short pause. */
      save(obj, now) {
        obj.ts = Date.now();
        try { localStorage.setItem(lk, JSON.stringify(obj)); } catch (e) { /* private window: db copy still works */ }
        clearTimeout(timer);
        if (now) return push(obj);
        timer = setTimeout(() => push(obj), 800);
        return Promise.resolve(true);
      },
    };
  }

  async function sendToClaude(text, el) {
    const c = await cap('comments', 3000);
    if (!c || !c.sendToClaude || !c.canSendToClaude) return false;
    try {
      if ((await c.canSendToClaude()) !== 'available') return false;
      const anchor = await c.anchorFor(el || document.body);
      await c.sendToClaude({ anchor, text: text.slice(0, 3900) });
      return true;
    } catch (e) { return false; }
  }

  /** Writes one document once (no queue), e.g. a frozen copy of what was sent. True once db holds it. */
  async function put(path, obj, ms = 8000) {
    const db = await cap('db');
    if (!db || !path) return false;
    try { await Promise.race([db.doc(path).set(obj), new Promise((_, j) => setTimeout(() => j(new Error('timeout')), ms))]); return true; }
    catch (e) { return false; }
  }

  // ---------- Hỏi Claude ngay trên trang (khả năng sample) ----------
  // Tốn lượt dùng Claude của chính người xem; lần hỏi đầu, claude.ai hỏi người xem có cho phép không.
  // Trang hỏi được thì <html> có class kit-ask-on (CSS chỉ hiện các chỗ hỏi khi có class này); người xem từ chối thì kit-ask-off.
  const askMsg = {
    rate_limited: 'Hỏi nhiều quá trong một lúc, hoặc đã hết lượt dùng Claude. Thử lại sau ít phút.',
    session_expired: 'Phiên đăng nhập claude.ai đã hết. Tải lại trang rồi hỏi lại.',
    refused: 'Claude không trả lời câu này. Thử hỏi cách khác.',
    empty_completion: 'Claude chưa viết được gì. Thử hỏi ngắn hơn.',
    prompt_too_large: 'Câu hỏi dài quá. Thử hỏi ngắn hơn.',
  };
  const askOffCodes = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];
  cap('sample').then((s) => document.documentElement.classList.toggle('kit-ask-on', !!s));
  /** Hỏi Claude, hiện câu trả lời dần vào `out`. Trả về chữ của câu trả lời, hoặc null khi không hỏi được (đã ghi lý do vào `out`).
   *  opts: { tier: 'quick'|'default', cache: true|false, tools: [{ name, description, inputSchema, execute }] }
   *  Có tools thì Claude gọi được hàm của trang (ví dụ vặn núm khi làm mẫu); khi đó không dùng bản nhớ đệm. */
  async function ask(prompt, out, opts = {}) {
    const s = await askStart(out);
    if (!s) return null;
    try {
      const o = { onText: ({ text }) => { out.classList.remove('thinking'); out.textContent = text; } };
      if (opts.tier) o.modelTier = opts.tier;
      if (opts.cache === false || opts.tools) o.cache = false;
      if (opts.tools) o.tools = opts.tools;
      const { text, truncated } = await s(prompt, o);
      out.classList.remove('thinking');
      out.textContent = text + (truncated ? ' …' : '');
      return text;
    } catch (e) { return askFail(e, out); }
  }
  /** Hỏi Claude một giá trị JSON (ví dụ một tình huống mới có câu hỏi và đáp án). Trả về giá trị, hoặc null như ask. */
  async function askJson(prompt, out, opts = {}) {
    const s = await askStart(out);
    if (!s || typeof s.json !== 'function') { if (s) out.textContent = 'Trang này chưa hỏi Claude được ở đây.'; out.classList.remove('thinking'); return null; }
    try {
      const o = { cache: false };
      if (opts.tier) o.modelTier = opts.tier;
      const v = await s.json(prompt, o);
      out.classList.remove('thinking'); out.textContent = '';
      return v;
    } catch (e) { return askFail(e, out); }
  }
  async function askStart(out) {
    const s = await cap('sample');
    out.classList.add('ai-out');
    if (!s || document.documentElement.classList.contains('kit-ask-off')) { out.textContent = 'Trang này chưa hỏi Claude được ở đây.'; return null; }
    out.textContent = 'Claude đang nghĩ…'; out.classList.add('thinking');
    return s;
  }
  function askFail(e, out) {
    out.classList.remove('thinking');
    const code = e && e.code;
    if (code === 'cancelled') { out.textContent = (e && e.text) || ''; return null; }
    if (askOffCodes.includes(code)) {
      document.documentElement.classList.add('kit-ask-off'); document.documentElement.classList.remove('kit-ask-on');
      out.textContent = 'Trang chưa được phép hỏi Claude, nên các chỗ hỏi sẽ ẩn đi. Bật lại trong menu Quyền của trang nếu muốn.';
      return null;
    }
    out.textContent = (e && e.text ? e.text + '\n\n' : '') + (askMsg[code] || 'Chưa hỏi được Claude. Thử lại sau.');
    return null;
  }

  /** Nghe thay đọc (khả năng tts): nút loa đọc to chữ getText() trả về, bấm lần nữa để dừng. Chỉ có trên Chrome và app Claude
      máy tính; nơi khác nút giữ ẩn, chữ vẫn trên màn. Một lúc chỉ một đoạn được đọc (đoạn mới thay đoạn cũ). onUse đếm số lần nghe. */
  const SPEAKER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  let speaking = null;
  function listen(btn, getText, onUse) {
    if (!btn) return;
    const label = btn.textContent.trim() || 'Nghe';
    btn.hidden = true; btn.dataset.noreplay = ''; btn.classList.add('listen'); btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = SPEAKER + '<span></span>'; btn.lastChild.textContent = label;
    const set = (on) => { btn.setAttribute('aria-pressed', String(on)); btn.lastChild.textContent = on ? 'Dừng' : label; };
    cap('tts').then((t) => {
      if (!t) return;
      btn.hidden = false;
      btn.addEventListener('click', () => {
        if (speaking === btn) { t.stop(); speaking = null; set(false); return; }
        const text = String(getText() || '').replace(/\s+/g, ' ').trim().slice(0, 2000);
        if (!text) return;
        if (speaking) speaking.dispatchEvent(new Event('kit-listen-off'));
        speaking = btn; set(true);
        if (onUse) onUse();
        // Đọc xong thì speak() trả về; bị dừng hay bị đoạn khác thay thì nó báo lỗi. Cả hai đều đưa nút về "Nghe".
        const end = () => { if (speaking === btn) { speaking = null; set(false); } };
        // Ghi rõ tiếng Việt để giọng đọc không đoán nhầm; máy nào không nhận mã ngôn ngữ này thì đọc lại để tự đoán.
        const known = ['not_granted', 'rate_limited', 'busy', 'cancelled', 'viewer_stopped', 'stopped', 'replaced'];
        t.speak(text, { language: 'vi' }).catch((e) => (speaking === btn && !known.includes(e && e.code) ? t.speak(text) : Promise.reject(e))).then(end, (e) => {
          end();
          if (e && e.code === 'not_granted') { document.querySelectorAll('.listen').forEach((b) => { b.hidden = true; }); }
          else if (e && e.code === 'rate_limited') toast('Đọc nhiều quá trong một lúc. Thử lại sau ít phút.');
        });
      });
      btn.addEventListener('kit-listen-off', () => set(false));
    });
  }

  /** Nói thay gõ: chỉ có ở Chrome và app Claude trên máy tính, nơi khác nút giữ ẩn và vẫn gõ như thường.
      Chữ đã chốt nối vào cuối ô và phát sự kiện input (phần tự lưu ghi lại như chữ gõ); chữ đang nghe hiện ở partial.
      start() gọi thẳng trong lúc bấm (không await gì trước), theo luật của khả năng dictation. */
  function dictate(btn, field, partial, onUse) {
    if (!btn || !field) return;
    let d = null, listening = false;
    btn.hidden = true; btn.dataset.noreplay = ''; btn.setAttribute('aria-pressed', 'false');
    const say = (t) => { if (partial) partial.textContent = t; };
    cap('dictation').then((x) => {
      if (!x) return;
      d = x; btn.hidden = false;
      d.onPartial(({ text }) => say(text));
      d.onFinal(({ text }) => {
        if (!text || !text.trim()) return;
        field.value = (field.value.trim() ? field.value.trim() + ' ' : '') + text.trim();
        field.dispatchEvent(new Event('input', { bubbles: true })); say('');
        if (onUse) onUse();
      });
      d.onState(({ state }) => { listening = state === 'listening'; btn.setAttribute('aria-pressed', String(listening)); if (!listening) say(''); });
    });
    btn.addEventListener('click', () => {
      if (!d) return;
      if (listening) { d.stop().catch(() => {}); return; }
      d.start().catch((e) => {
        if (e && e.code === 'not_granted') { btn.hidden = true; toast('Chưa được phép dùng mic. Bạn vẫn gõ được như thường.'); }
      });
    });
  }
  const MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>';
  /** Bọc một ô chữ có sẵn thành hàng [ô | mic] kèm dòng chữ đang nghe, rồi gắn dictate. Trả về phần tử ngoài cùng. */
  function micRow(field, onUse) {
    const row = document.createElement('div'); row.className = 'mic-row';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn mic';
    btn.setAttribute('aria-label', 'Nói thay gõ'); btn.title = 'Nói thay gõ'; btn.innerHTML = MIC;
    const partial = document.createElement('p'); partial.className = 'mic-partial'; partial.setAttribute('aria-live', 'polite');
    field.before(row); row.append(field, btn); row.after(partial);
    dictate(btn, field, partial, onUse);
    return partial;
  }

  window.Kit = { cap, toast, copy, saveFile, store, put, sendToClaude, ask, askJson, dictate, micRow, listen };
})();
