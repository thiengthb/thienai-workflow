/* Lõi chung cho mọi trang artifact của thien (xem artifacts/README.md). Không phụ thuộc thư viện nào.
   Kit.cap(name)         khả năng của artifact (db, comments, downloads...) hoặc null; không bao giờ ném lỗi.
   Kit.toast(msg)        một dòng thông báo ở đáy màn.
   Kit.copy(text)        chép vào clipboard; không chép được thì hiện ô chữ để tự chọn.
   Kit.saveFile(n, text) đưa file cho người xem lưu (khả năng downloads); không có thì chép.
   Kit.store(key, path)  nháp trong máy (localStorage) + bản trong db của trang ở `path`, để Claude đọc lại.
   Kit.sendToClaude(text, el)  gửi một comment cho Claude (người sửa được trang); trả về true nếu đã gửi. */
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
    // The db copy could not be read at load: until a later read shows it is not newer than what this page
    // started from (`base`), never write over it. A newer copy blocks db writes for this page view.
    let unread = false, base = 0, blocked = false;
    const wait = (p, ms) => Promise.race([p, new Promise((_, j) => setTimeout(() => j(new Error('timeout')), ms))]);
    async function mayWrite(db) {
      if (blocked) return false;
      if (!unread) return true;
      try {
        const s = await wait(db.doc(path).get(), 8000), r = s.exists ? s.data() : null;
        if (!r || (r.ts || 0) <= base) { unread = false; return true; }
        blocked = true;
        toast('Trang có bản lưu mới hơn từ lần mở khác. Tải lại trang để xem; thay đổi ở đây tạm chỉ lưu trên máy này.', 9000);
      } catch (e) { /* still unreadable: try again on the next save */ }
      return false;
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
        let remote = null;
        const db = await cap('db');
        if (db && path) {
          try { const s = await wait(db.doc(path).get(), 8000); remote = s.exists ? s.data() : null; }
          catch (e) { remote = null; unread = true; base = (local && local.ts) || 0; }
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

  window.Kit = { cap, toast, copy, saveFile, store, sendToClaude };
})();
