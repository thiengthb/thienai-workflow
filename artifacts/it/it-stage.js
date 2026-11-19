/* Sân khấu cho bài IT: bàn thử (frontend) và bảng dán (BA). Chạy sau lesson.js, trước phần tự lưu. Xem artifacts/it/README.md.
   Mọi thao tác là bấm nút có sẵn lúc tải trang, không kéo thả, không tạo nút mới, để phần tự lưu (kit/autosave.js) bấm lại theo tên nút
   là về đúng chỗ. Thẻ trên bảng dán không đổi chỗ trong DOM, chỉ đổi vị trí vẽ. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('#stage');
  if (!stage) return;
  const R = window.R || (window.R = {});
  Object.assign(R, { knobs: R.knobs || {}, tried: R.tried || {}, picks: R.picks || {}, boards: R.boards || {}, heard: R.heard || [],
    match: R.match || {}, peeked: R.peeked || [], asked: R.asked || [], ffwd: R.ffwd || {}, compared: R.compared || [] });
  // Câu hỏi chờ một thao tác trên sân khấu: <div class="q" data-wait="peek-food">: các lựa chọn khóa cho tới khi khóa đó xong.
  const waitQs = $$('.q[data-wait]');
  const lockWait = (q, on) => $$('.opt', q).forEach((o) => { if (!o.classList.contains('right') && !o.classList.contains('wrong')) o.disabled = on; });
  waitQs.forEach((q) => lockWait(q, true));
  const done = (k) => {
    if (window.Lesson) Lesson.done(k);
    waitQs.forEach((q) => { if (q.dataset.wait.split(/\s+/).includes(k)) lockWait(q, false); });
  };
  const panes = $$('.pane[data-pane]', stage);
  const pane = (n) => panes.find((p) => p.dataset.pane === n);
  const mainScreen = (b) => $('.phone:not(.mini):not(.ghost) .screen', b);
  // Khối code cuộn ngang được: cho Tab tới để cuộn bằng phím (axe: scrollable-region-focusable).
  $$('pre.code', stage).forEach((c) => { if (!c.hasAttribute('tabindex')) c.tabIndex = 0; });

  if (window.Lesson && Lesson.extras) Lesson.extras.push((r) => {
    const L = [];
    Object.entries(r.tried || {}).forEach(([k, v]) => L.push(`Đã thử ${k}: ${v.join(', ')}`));
    Object.entries(r.picks || {}).forEach(([k, v]) => L.push(`Chốt (${k}): ${Object.values(v).join(', ')}`));
    Object.entries(r.match || {}).filter(([, v]) => v.moves).forEach(([k, v]) => L.push(`Vặn cho giống (${k}): ${v.best}% sau ${v.moves} lần vặn`));
    if ((r.peeked || []).length) L.push('Đã nhìn 5 giây: ' + r.peeked.join(', '));
    if ((r.compared || []).length) L.push('Đã so hai màn trước và sau: ' + r.compared.join(', '));
    Object.entries(r.boards || {}).forEach(([k, b]) => { if (b.checked) L.push(`Bảng ${k}: khớp bản mẫu ${b.right}/${b.total}` + (b.diff.length ? ` (khác: ${b.diff.join(', ')})` : '')); });
    // Bảng đang xếp dở (chưa kiểm): để ô "Hỏi Claude" biết người học đang đặt ai ở đâu.
    $$('.board', stage).forEach((bd) => {
      const b = (r.boards || {})[bd.dataset.pane]; if (!b || b.checked || !b.place) return;
      const parts = Object.entries(b.place).map(([c, z]) => { const card = $(`[data-c="${c}"]`, bd), zone = $(`[data-z="${z}"] span`, bd); return `${card ? cardName(card) : c} → ${zone ? zone.textContent.trim() : z}`; });
      if (parts.length) L.push(`Đang xếp bảng ${bd.dataset.pane} (chưa kiểm): ${parts.join(', ')}`);
    });
    if ((r.asked || []).length) L.push('Câu đã hỏi: ' + r.asked.map((a) => `${a.who}: "${a.q}"${a.found ? ' (mở thẻ mới)' : ''}`).join('; '));
    Object.entries(r.ffwd || {}).forEach(([k, v]) => L.push(`Tua 3 tháng (${k}): ${v.length ? v.join(' | ') : 'êm'}`));
    if ((r.heard || []).length) L.push('Đã nghe: ' + r.heard.join(', '));
    return L.join('\n');
  });

  // ---------- Kính: xem màn qua mắt người khác ----------
  // Núm <div class="knob" data-knob="lens" data-lens> với data-val none | blur | old | deut. Mù màu dùng ma trận Machado 2009 (mức nặng nhất).
  if ($('[data-lens]', stage) && !$('#it-lens-defs')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'it-lens-defs'; svg.setAttribute('aria-hidden', 'true'); svg.style.cssText = 'position:absolute;width:0;height:0';
    svg.innerHTML = '<filter id="it-deut"><feColorMatrix type="matrix" values="0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0"/></filter>'
      + '<filter id="it-prot"><feColorMatrix type="matrix" values="0.152 1.053 -0.205 0 0  0.115 0.786 0.099 0 0  -0.004 -0.048 1.052 0 0  0 0 0 1 0"/></filter>';
    document.body.append(svg);
  }

  // ---------- Bàn thử ----------
  // <div class="pane bench" data-pane="bank"> chứa .phone > .screen (màn app), [data-knob] (núm), .code (dòng CSS), [data-soi-toggle].
  function benchApply(b, knob, btn, quiet, demo) {
    const scr = mainScreen(b), k = knob.dataset.knob, val = btn.dataset.val, name = b.dataset.pane;
    if (knob.dataset.var) scr.style.setProperty(knob.dataset.var, val); else scr.dataset[k] = val;
    $$('button[data-val]', knob).forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
    const label = btn.dataset.name || btn.textContent.trim() || val;
    const now = $('.now', knob); if (now) now.textContent = label;
    $$(`[data-v="${k}"]`, b).forEach((e) => { e.textContent = btn.dataset.code || val; });
    $$(`[data-line~="${k}"]`, b).forEach((e) => { e.classList.remove('lit'); void e.offsetWidth; e.classList.add('lit'); });
    soiMark(b); b.querySelectorAll('.soi-count').forEach(soiCount);
    const key = name + '.' + k;
    R.knobs[key] = label;
    matchUpdate(b, !quiet, demo);
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
    const scr = mainScreen(b), vals = Object.values(scr.dataset);
    $$('[data-soi]', scr).forEach((el) => {
      const t = el.dataset.soi.split(/\s+/).filter(Boolean);
      el.classList.toggle('soi-on', !t.length || t.some((x) => vals.includes(x)));
    });
  }
  function soiCount(el) {
    const b = el.closest('.bench'); soiMark(b);
    const n = $$('.phone:not(.mini):not(.ghost) .screen .soi-on', b).length;
    el.textContent = (el.dataset.text || '{n} chỗ').replace('{n}', n);
  }

  // ---------- Vặn cho giống ----------
  // Bàn có data-target='{"accent":"#15803d","amount":"it"}': bản mục tiêu vẽ trong .phone.mini (chép màn chính), thanh .meter báo % giống.
  // Màu tính theo khoảng cách RGB, giá trị khác thì đúng hoặc sai. Đủ 100% thì mở khóa match-<pane>.
  const hex = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ''); return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null; };
  function matchSetup(b) {
    const target = JSON.parse(b.dataset.target), mini = $('.phone.mini .screen', b), scr = mainScreen(b);
    if (mini && scr) {
      mini.innerHTML = scr.innerHTML;
      $$('[data-soi]', mini).forEach((e) => e.removeAttribute('data-soi'));
      Object.entries(target).forEach(([k, v]) => {
        const knob = $(`[data-knob="${k}"]`, b);
        if (knob && knob.dataset.var) mini.style.setProperty(knob.dataset.var, v); else mini.dataset[k] = v;
      });
      mini.setAttribute('aria-hidden', 'true');
    }
  }
  function matchUpdate(b, moved, demo) {   // demo: Claude's move, never the learner's best
    if (!b.dataset.target) return;
    const target = JSON.parse(b.dataset.target), scr = mainScreen(b), name = b.dataset.pane;
    const scores = Object.entries(target).map(([k, v]) => {
      const knob = $(`[data-knob="${k}"]`, b);
      const cur = knob && knob.dataset.var ? scr.style.getPropertyValue(knob.dataset.var).trim() : scr.dataset[k];
      const a = hex(cur), t = hex(v);
      if (a && t) return Math.max(0, 1 - Math.hypot(a[0] - t[0], a[1] - t[1], a[2] - t[2]) / 260);
      return cur === v ? 1 : 0;
    });
    const pct = Math.round(scores.reduce((s, x) => s + x, 0) / scores.length * 100);
    const m = R.match[name] = R.match[name] || { best: 0, moves: 0 };
    if (moved) m.moves++;
    m.now = pct; if (!demo) m.best = Math.max(m.best, pct);
    $$('.meter', b).forEach((el) => {
      el.style.setProperty('--p', pct + '%'); el.classList.toggle('full', pct === 100);
      const t = $('span', el); if (t) t.textContent = pct === 100 ? 'Giống hệt' : `Giống ${pct}%`;
    });
    if (pct === 100 && moved) { done('match-' + name); $$(`[data-echo="match-${name}"]`).forEach((e) => { e.textContent = e.dataset.same || 'Giống hệt bản mục tiêu.'; e.classList.add('good'); }); }
  }

  // ---------- So trước và sau ----------
  // <button data-compare="food">: đặt màn "Trước" (bản chép, đứng yên) cạnh màn đang vặn ("Sau"), bấm lại để gập; mở khóa compare-<pane>.
  // Trước = data-before của bàn (JSON như data-target), không có thì là giá trị các núm lúc mở trang (aria-pressed). Bước
  // data-stage="food@compare" mở sẵn; sang bước khác thì gập. Chỉ bàn có dùng so mới được bọc thêm .pair và .shot, bàn khác giữ nguyên.
  const cmpUsed = (n) => !!$(`[data-compare="${n}"]`) || $$('.step[data-stage]').some((s) => s.dataset.stage === n + '@compare');
  function cmpSetup(b) {
    const scr = mainScreen(b), phone = scr && scr.closest('.phone'); if (!phone) return;
    const shot = (cls, text) => {
      const s = document.createElement('div'), l = document.createElement('span');
      s.className = 'shot ' + cls; l.className = 'label cap'; l.textContent = text; s.append(l); return s;
    };
    const pair = document.createElement('div'), before = shot('before', b.dataset.beforeLabel || 'Trước'), after = shot('after', b.dataset.afterLabel || 'Sau');
    pair.className = 'pair';
    phone.replaceWith(pair); after.append(phone);
    const ghost = document.createElement('div'), copy = scr.cloneNode(true);
    // Bản chép không bấm được, không đọc lên, không trùng id với màn thật.
    ghost.className = 'phone ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    [copy, ...$$('[id]', copy)].forEach((e) => e.removeAttribute('id')); copy.removeAttribute('tabindex');
    $$('[data-soi]', copy).forEach((e) => { e.removeAttribute('data-soi'); e.classList.remove('soi-on'); });
    const vals = b.dataset.before ? JSON.parse(b.dataset.before) : Object.fromEntries($$('[data-knob]:not([data-lens])', b)
      .map((kn) => [kn.dataset.knob, ($$('button[data-val]', kn).find((x) => x.getAttribute('aria-pressed') === 'true') || {}).dataset?.val]).filter(([, v]) => v));
    Object.entries(vals).forEach(([k, v]) => {
      const knob = $(`[data-knob="${k}"]`, b);
      if (knob && knob.dataset.var) copy.style.setProperty(knob.dataset.var, v); else copy.dataset[k] = v;
    });
    ghost.append(copy); before.append(ghost); pair.append(before, after);
  }
  function cmpShow(b, on) {
    const name = b.dataset.pane;
    b.classList.toggle('cmp', on);
    $$(`[data-compare="${name}"]`).forEach((bt) => {
      if (!bt.dataset.label) bt.dataset.label = bt.textContent.trim();
      bt.setAttribute('aria-pressed', String(on));
      bt.textContent = on ? (bt.dataset.back || 'Gập màn trước') : bt.dataset.label;
    });
    if (!on) return;
    if (!R.compared.includes(name)) R.compared.push(name);
    done('compare-' + name);
  }

  $$('.bench', stage).forEach((b) => {
    if (cmpUsed(b.dataset.pane)) cmpSetup(b);
    if (b.dataset.target) matchSetup(b);
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
  // Chốt lựa chọn: <button data-pick="d1" data-of="bank">: ghi giá trị các núm (trừ kính) của bàn đó, nhắc lại vào [data-echo="d1"].
  $$('[data-pick]').forEach((bt) => bt.addEventListener('click', () => {
    const id = bt.dataset.pick, of = bt.dataset.of, b = pane(of); if (!b) return;
    const v = {}; $$('[data-knob]:not([data-lens])', b).forEach((kn) => { v[kn.dataset.knob] = R.knobs[of + '.' + kn.dataset.knob]; });
    R.picks[id] = v;
    $$(`[data-echo="${id}"]`).forEach((e) => { e.textContent = (e.dataset.prefix || 'Bạn chốt: ') + Object.values(v).join(', ') + '.'; });
    bt.textContent = bt.dataset.again || 'Chốt lại';
    done(id);
  }));

  // ---------- Nhìn 5 giây ----------
  // Bước data-stage="food@cover": màn bị che. <button data-peek="food" data-sec="5">: mở màn N giây rồi che lại, mở khóa peek-food.
  // <button data-uncover="food">: bỏ che hẳn.
  // Đồng hồ giữ qua lần tải lại: lần bấm thật ghi giờ bắt đầu vào sessionStorage (riêng từng tab, còn qua lần tải lại, nên tab khác
  // mở cùng bài không ghi đè). Phần tự lưu bấm lại bằng code (isTrusted = false): còn giây thì đếm tiếp số giây còn lại,
  // hết rồi (hay tab, máy khác, không có giờ ghi) thì xong ngay.
  const uncovered = new Set();
  const PID = 'lesson-peek:' + ((document.querySelector('meta[name="lesson-id"]') || {}).content || document.title) + ':peek:';
  const peekStart = (name, t) => { try { if (t) sessionStorage.setItem(PID + name, String(t)); return +sessionStorage.getItem(PID + name) || 0; } catch { return 0; } };
  $$('[data-peek]').forEach((bt) => bt.addEventListener('click', (e) => {
    const name = bt.dataset.peek, b = pane(name); if (!b) return;
    const sec = +(bt.dataset.sec || 5), cnt = $('.peek-count', b);
    const end = () => {
      b.classList.remove('peeking'); if (!uncovered.has(name)) b.classList.add('covered');
      if (!R.peeked.includes(name)) R.peeked.push(name);
      done('peek-' + name);
    };
    // Đếm ngược hiện ngay trên nút (và trong .peek-count nếu màn có), xong thì nút ghi data-after.
    const show = (left) => { bt.textContent = `Còn ${left} giây`; if (cnt) cnt.textContent = left; };
    bt.disabled = true;
    let left = sec;
    if (e.isTrusted) peekStart(name, Date.now());
    else {
      const t0 = peekStart(name);
      left = t0 ? Math.min(sec, Math.ceil((t0 + sec * 1000 - Date.now()) / 1000)) : 0;
      if (left <= 0) { bt.textContent = bt.dataset.after || 'Đã xem'; return end(); }
    }
    b.classList.remove('covered'); b.classList.add('peeking');
    show(left);
    reveal();
    const tick = setInterval(() => {
      left--; show(left);
      if (left > 0) return;
      clearInterval(tick); bt.textContent = bt.dataset.after || 'Đã xem'; end();
    }, 1000);
  }));
  $$('[data-compare]').forEach((bt) => bt.addEventListener('click', () => {
    const b = pane(bt.dataset.compare); if (!b) return;
    cmpShow(b, !b.classList.contains('cmp')); reveal();
  }));
  $$('[data-uncover]').forEach((bt) => bt.addEventListener('click', () => {
    const b = pane(bt.dataset.uncover); if (!b) return;
    uncovered.add(bt.dataset.uncover);
    b.classList.remove('covered', 'peeking'); b.dataset.mode = '';
    bt.removeAttribute('data-need'); bt.disabled = true; done('uncover-' + bt.dataset.uncover); reveal();
  }));

  // ---------- Bảng dán ----------
  // <div class="pane board" data-pane="who" data-answer='{"pdt":"z2"}'> chứa .zones > button.zone[data-z], .tray, button.bd-card[data-c], .say-bar.
  const boards = {};
  $$('.board', stage).forEach((bd) => {
    const id = bd.dataset.pane, cards = $$('.bd-card[data-c]', bd), zones = $$('.zone[data-z]', bd), tray = $('.tray', bd), area = $('.bd-area', bd);
    const ans = JSON.parse(bd.dataset.answer || '{}'), bar = $('.say-bar', bd);
    const visible = () => cards.filter((c) => !c.hasAttribute('data-hidden') || c.classList.contains('shown'));
    const st = boards[id] = { place: {}, sel: null, locked: false, showAnswer: false, layout, say, sayText, visible, cards, byZone };
    // Lời theo ô thẻ đang nằm: data-react-z2 / data-later-z2 thắng data-react / data-later khi thẻ nằm ở ô z2.
    function byZone(c, key) { const z = st.place[c.dataset.c] || ''; return c.dataset[key + z.charAt(0).toUpperCase() + z.slice(1)] || c.dataset[key]; }
    // Lời nói dưới bảng: thẻ c nói text (mặc định data-say; sau khi kiểm mà thẻ khác bản mẫu thì là data-react).
    function sayText(c, text, tone) {
      if (!bar || !text) return;
      bar.innerHTML = '';
      const i = document.createElement('i'); i.textContent = c.querySelector('i')?.textContent || ''; i.style.setProperty('--c', c.style.getPropertyValue('--c'));
      const d = document.createElement('div'), s = document.createElement('small'), q = document.createElement('q');
      s.textContent = cardName(c); q.textContent = text;
      d.append(s, q); bar.append(i, d);
      bar.className = 'say-bar' + (tone ? ' ' + tone : '');
      bar.classList.remove('pop'); void bar.offsetWidth; bar.classList.add('pop');
    }
    function say(c) {
      const react = st.locked && c.classList.contains('no') && byZone(c, 'react');
      if (!react && !c.dataset.say) return;
      sayText(c, react || c.dataset.say, react ? 'react' : '');
      if (react) return;
      c.classList.add('heard');
      const who = cardName(c); if (!R.heard.includes(who)) R.heard.push(who);
      done('heard-' + c.dataset.c);
      const need = +(bd.dataset.hear || 0), heard = cards.filter((x) => x.classList.contains('heard')).length;
      if (need && heard >= need) done('heard-' + id);
    }
    // Trình đọc màn hình: mỗi thẻ nói nó đang ở ô nào; đặt thẻ thì đọc lên qua một vùng role="status" ẩn.
    const live = document.createElement('p'); live.className = 'sr-only'; live.setAttribute('role', 'status'); bd.append(live);
    st.live = live;
    const zoneName = (box) => (box === tray ? (tray.querySelector('.label')?.textContent || 'Chưa xếp') : (box.querySelector('span')?.textContent || box.dataset.z)).trim();
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
      st.checkPlaced();
    }));
    st.checkPlaced = () => { if (visible().every((c) => st.place[c.dataset.c])) done('placed-' + id); };
    // Vẽ: thẻ xếp thành hàng trong ô của nó (hoặc trong khay nếu chưa đặt), tính bằng px trong .bd-area.
    function layout(depth = 0) {
      // st.demo: chỗ Claude đang xếp khi làm mẫu (Lesson.demo), đè lên cách của người học tới khi bấm "Trả lại cách của mình".
      const where = st.demo || (st.showAnswer ? ans : st.place), A = area.getBoundingClientRect(), gap = 6;
      let grew = false;
      const groups = new Map();
      visible().forEach((c) => { const z = where[c.dataset.c]; const box = (z && zones.find((x) => x.dataset.z === z)) || tray; if (!groups.has(box)) groups.set(box, []); groups.get(box).push(c); });
      if (tray) tray.classList.toggle('empty', !groups.has(tray));
      zones.forEach((z) => z.classList.toggle('filled', groups.has(z)));   // ga có thẻ hiện tick (.zones.flow.line)
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
  function cardName(c) { return c.textContent.replace(c.querySelector('i')?.textContent || '', '').trim(); }

  // Kiểm: <button data-check="who" data-need="placed-who" disabled>. So với data-answer, đánh dấu ✓ / ! trên từng thẻ, khóa bảng.
  // Thẻ khác bản mẫu có data-react thì lên tiếng ngay (thấy hậu quả thay vì thấy chữ "sai"); bấm thẻ đó để nghe lại.
  $$('[data-check]').forEach((bt) => {
    const id = bt.dataset.check, bd = pane(id), st = boards[id]; if (!bd || !st) return;
    bt.dataset.need = bt.dataset.need || 'placed-' + id; bt.disabled = true;
    bt.addEventListener('click', () => {
      const ans = JSON.parse(bd.dataset.answer || '{}'), cards = st.visible(), diff = [], why = [];
      cards.forEach((c) => {
        const ok = st.place[c.dataset.c] === ans[c.dataset.c];
        c.classList.toggle('ok', ok); c.classList.toggle('no', !ok);
        if (!ok) { diff.push(cardName(c)); if (c.dataset.why) why.push(c.dataset.why); }
      });
      st.locked = true; st.sel = null; bd.classList.add('locked'); bd.classList.remove('picking');
      st.cards.forEach((c) => c.classList.remove('sel'));
      const right = cards.length - diff.length;
      R.boards[id] = Object.assign(R.boards[id] || {}, { checked: true, right, total: cards.length, diff });
      $$(`[data-echo="${id}"]`).forEach((e) => {
        e.textContent = right === cards.length ? (e.dataset.same || 'Khớp hết với bản mẫu.')
          : `Khớp ${right}/${cards.length}. ` + (why.length ? why.join(' ') : (e.dataset.diff || ''));
        e.classList.add(right === cards.length ? 'good' : 'note');
      });
      const first = cards.find((c) => c.classList.contains('no') && st.byZone(c, 'react'));
      if (first) st.say(first);
      st.live.textContent = `Khớp ${right}/${cards.length}.` + (diff.length ? ' Khác bản mẫu: ' + diff.join(', ') + '.' : '');
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

  // ---------- Phỏng vấn mở thẻ ----------
  // <div class="ask" data-ask="pdt" data-of="who"> chứa các <button class="opt" data-reply="lời đáp" [data-reveal="ctsv"]>câu hỏi</button> và <p class="reply">.
  // Hỏi trúng thì thẻ ẩn (data-hidden) hiện lên bảng; hỏi gợi sẵn thì người ta chỉ gật. Hỏi bao nhiêu câu cũng được.
  $$('.ask[data-ask]').forEach((box) => {
    const who = box.dataset.ask, id = box.dataset.of, reply = $('.reply', box);
    $$('button[data-reply]', box).forEach((bt) => bt.addEventListener('click', () => {
      const st = boards[id], card = st && st.cards.find((c) => c.dataset.c === who);
      bt.classList.add('asked'); bt.setAttribute('aria-pressed', 'true');
      $$('button[data-reply]', box).forEach((x) => { if (x !== bt) x.setAttribute('aria-pressed', 'false'); });
      if (reply) { reply.textContent = '“' + bt.dataset.reply + '”'; reply.className = 'reply fb ' + (bt.dataset.reveal ? 'good' : 'note'); }
      if (card) st.sayText(card, bt.dataset.reply, bt.dataset.reveal ? 'found' : '');
      const q = bt.textContent.trim();
      if (!R.asked.some((a) => a.q === q)) R.asked.push({ who: card ? cardName(card) : who, q, found: !!bt.dataset.reveal });
      done('asked-' + who);
      const rv = bt.dataset.reveal, nc = rv && st && st.cards.find((c) => c.dataset.c === rv);
      if (nc && !nc.classList.contains('shown')) {
        bt.classList.add('found'); nc.classList.add('shown', 'new');
        st.live.textContent = 'Thẻ mới trên bảng: ' + cardName(nc);
        st.layout(); done('reveal-' + rv); reveal();
      } else if (rv) bt.classList.add('found');
    }));
  });

  // ---------- Tua 3 tháng ----------
  // <button data-ffwd="who" data-need="checked-who" disabled>: dự án chạy tiếp theo cách mình xếp. Mỗi thẻ khác bản mẫu có
  // data-later="Tháng 2|IT trường chặn…" thành một mốc trong .ffwd của bảng; không thẻ nào khác thì hiện data-good của nút. Bấm lại để ẩn.
  $$('[data-ffwd]').forEach((bt) => bt.addEventListener('click', () => {
    const id = bt.dataset.ffwd, bd = pane(id), st = boards[id], box = bd && $('.ffwd', bd); if (!box) return;
    const on = !box.classList.contains('on');
    box.classList.toggle('on', on); bt.setAttribute('aria-pressed', String(on));
    if (!bt.dataset.label) bt.dataset.label = bt.textContent.trim();
    bt.textContent = on ? (bt.dataset.back || 'Quay về bảng') : bt.dataset.label;
    if (!on) return;
    const ev = st.visible().filter((c) => c.classList.contains('no') && st.byZone(c, 'later'))
      .map((c) => { const [when, text] = st.byZone(c, 'later').split('|'); return { c, when, text }; })
      .sort((a, b) => a.when.localeCompare(b.when, 'vi', { numeric: true }));
    const list = $('ol', box) || box.appendChild(document.createElement('ol'));
    list.innerHTML = '';
    if (!ev.length) { const li = document.createElement('li'); li.className = 'calm'; li.innerHTML = '<b>Tháng 3</b>'; li.append(bt.dataset.good || 'Mọi việc êm.'); list.append(li); }
    ev.forEach((e, n) => {
      const li = document.createElement('li'); li.style.animationDelay = (n * 0.45) + 's';
      const i = document.createElement('i'); i.textContent = e.c.querySelector('i')?.textContent || ''; i.style.setProperty('--c', e.c.style.getPropertyValue('--c'));
      const b = document.createElement('b'); b.textContent = e.when;
      const p = document.createElement('span'); p.textContent = e.text;
      li.append(b, i, p); list.append(li);
    });
    R.ffwd[id] = ev.map((e) => e.when + ': ' + e.text);
    st.live.textContent = ev.length ? ev.map((e) => e.when + ': ' + e.text).join('. ') : (bt.dataset.good || '');
    done('ffwd-' + id);
    reveal();
  }));

  // ---------- Bước nào hiện gì ----------
  // Mỗi bước: data-stage="<tên pane>[@chế độ]"; không ghi thì ẩn sân khấu. lesson.js chuyển bước bằng class "on".
  // Chế độ: @listen (bảng chỉ cho nghe), @cover (bàn thử bị che, chờ nút data-peek), @lens (hiện núm kính data-lens),
  // @compare (hai màn so trước và sau mở sẵn).
  const steps = $$('.step');
  let last = null;
  function sync() {
    const cur = steps.find((s) => s.classList.contains('on'));
    if (!cur || cur === last) return;
    last = cur;
    // Sang bước khác thì gập màn tua 3 tháng, để bảng hiện lại.
    $$('[data-ffwd][aria-pressed="true"]').forEach((bt) => { bt.setAttribute('aria-pressed', 'false'); bt.textContent = bt.dataset.label; });
    $$('.ffwd.on').forEach((box) => box.classList.remove('on'));
    // Hai màn so trước và sau: mở sẵn ở bước @compare, gập ở bước khác.
    const [cn, cm = ''] = (cur.dataset.stage || '').split('@');
    $$('.bench.cmp, .bench .pair').map((x) => x.closest('.bench')).filter((b, i, a) => a.indexOf(b) === i)
      .forEach((b) => { const want = b.dataset.pane === cn && cm === 'compare'; if (want !== b.classList.contains('cmp')) cmpShow(b, want); });
    const [name, mode = ''] = (cur.dataset.stage || '').split('@');
    document.documentElement.dataset.stage = name ? 'on' : 'off';
    panes.forEach((p) => {
      p.classList.toggle('on', p.dataset.pane === name);
      if (p.dataset.pane !== name) return;
      const open = mode === 'cover' && uncovered.has(name);
      p.dataset.mode = open ? '' : mode;
      p.classList.toggle('covered', mode === 'cover' && !open && !p.classList.contains('peeking'));
    });
    const p = pane(name);
    if (p && boards[name]) requestAnimationFrame(() => boards[name].layout());
    if (p) p.querySelectorAll('.soi-count').forEach(soiCount);
  }
  new MutationObserver(sync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', sync);
  sync();
  // Điện thoại: sân khấu nằm trên các bước, bấm thứ làm đổi sân khấu thì cuộn lên cho thấy.
  function reveal() { if (window.innerWidth < 900) stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  // ---------- Claude làm mẫu (lesson.js, Lesson.demo) ----------
  // Bàn thử: Claude vặn núm (turn_knob). Bảng dán: Claude xếp từng thẻ vào ô (place_card), có bản mẫu để dựa vào.
  // Thao tác làm mẫu không tính là người học đã thử, không vào bản tự lưu; "Trả lại cách của mình" (hay lần bấm kế của người học) đưa về như trước.
  const stageOf = (step) => { const [name, mode = ''] = (step.dataset.stage || '').split('@'); return { p: pane(name), name, mode }; };
  const knobLabel = (kn) => ($('.label', kn) || {}).textContent?.trim() || kn.dataset.knob;
  const valName = (btn) => btn.dataset.name || btn.textContent.trim() || btn.dataset.val;
  if (window.Lesson && Lesson.demo) {
    Lesson.demo({ match(step) {
      const { p: b, name, mode } = stageOf(step);
      if (!b || !b.classList.contains('bench') || mode === 'cover') return null;
      const knobs = $$('[data-knob]', b).filter((kn) => mode === 'lens' || !kn.hasAttribute('data-lens'));
      if (!knobs.length) return null;
      const cur = (kn) => $$('button[data-val]', kn).find((x) => x.getAttribute('aria-pressed') === 'true');
      const report = () => {
        const L = knobs.map((kn) => `${knobLabel(kn)}: ${cur(kn) ? valName(cur(kn)) : 'chưa chọn'}`);
        soiMark(b); const n = $$('.phone:not(.mini):not(.ghost) .screen .soi-on', b).length;
        if ($('[data-soi]', b)) L.push(`màu nhấn đang nằm ở ${n} chỗ trên màn`);
        if (b.dataset.target) L.push(`giống bản mục tiêu ${(R.match[name] || {}).now ?? 0}%`);
        return L.join('; ');
      };
      return {
        context() {
          const scr = mainScreen(b), target = b.dataset.target ? JSON.parse(b.dataset.target) : null;
          return ['Sân khấu: bàn thử, một màn app trong khung điện thoại; vặn núm thì màn đổi ngay.',
            `Trên màn app đang có: ${(scr ? scr.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 600)}`,
            'Các núm (tên núm: các giá trị có thể chọn, theo dạng mã = tên): ' + knobs.map((kn) => `${kn.dataset.knob} (${knobLabel(kn)}): `
              + $$('button[data-val]', kn).map((x) => `${x.dataset.val} = ${valName(x)}`).join(', ')).join(' | '),
            `Người học để núm ở: ${report()}.`,
            (R.tried && Object.keys(R.tried).length) ? 'Người học đã thử: ' + Object.entries(R.tried).filter(([k]) => k.startsWith(name + '.')).map(([k, v]) => `${k.split('.')[1]}: ${v.join(', ')}`).join('; ') : '',
            target ? 'Bước này có bản mục tiêu cần vặn cho giống: ' + Object.entries(target).map(([k, v]) => `${k} = ${v}`).join(', ') : ''].filter(Boolean).join('\n');
        },
        tools: [{ name: 'turn_knob', description: 'Vặn một núm trên bàn thử sang một giá trị. Màn app đổi ngay; kết quả cho biết màn giờ thế nào.',
          inputSchema: { type: 'object', required: ['knob', 'value', 'why'], properties: {
            knob: { type: 'string', enum: knobs.map((kn) => kn.dataset.knob), description: 'mã núm' },
            value: { type: 'string', description: 'mã giá trị (phần trước dấu =)' },
            why: { type: 'string', description: 'một câu ngắn: vì sao vặn như vậy' } } },
          execute({ knob, value }) {
            const kn = knobs.find((x) => x.dataset.knob === knob);
            if (!kn) throw new Error('Không có núm ' + knob + '. Các núm: ' + knobs.map((x) => x.dataset.knob).join(', '));
            const btn = $$('button[data-val]', kn).find((x) => x.dataset.val === value || valName(x) === value);
            if (!btn) throw new Error(`Núm ${knob} không có giá trị ${value}. Các giá trị: ` + $$('button[data-val]', kn).map((x) => x.dataset.val).join(', '));
            benchApply(b, kn, btn, true, true);
            return { did: `${knobLabel(kn)} → ${valName(btn)}.`, result: 'Màn giờ: ' + report() };
          } }],
        // Ảnh chụp đủ trước lượt làm mẫu: màn, từng núm (kể cả núm chưa chọn), dòng code, R.knobs, R.match. Trả lại đúng như vậy.
        save() {
          const scr = mainScreen(b);
          return { style: scr.getAttribute('style'), data: { ...scr.dataset }, match: R.match[name] ? { ...R.match[name] } : null,
            knobs: knobs.map((kn) => ({ kn, btn: cur(kn) || null, now: ($('.now', kn) || {}).textContent, val: R.knobs[name + '.' + kn.dataset.knob] })),
            v: $$('[data-v]', b).map((e) => [e, e.textContent]) };
        },
        restore(s) {
          if (!s) return;
          const scr = mainScreen(b);
          if (s.style == null) scr.removeAttribute('style'); else scr.setAttribute('style', s.style);
          Object.keys(scr.dataset).forEach((k) => { if (!(k in s.data)) delete scr.dataset[k]; });
          Object.assign(scr.dataset, s.data);
          s.knobs.forEach(({ kn, btn, now, val }) => {
            $$('button[data-val]', kn).forEach((x) => x.setAttribute('aria-pressed', String(x === btn)));
            const n = $('.now', kn); if (n && now != null) n.textContent = now;
            const key = name + '.' + kn.dataset.knob;
            if (val === undefined) delete R.knobs[key]; else R.knobs[key] = val;
            showTried(key);
          });
          s.v.forEach(([e, t]) => { e.textContent = t; });
          soiMark(b); b.querySelectorAll('.soi-count').forEach(soiCount);
          matchUpdate(b, false, true);
          if (s.match) R.match[name] = s.match; else delete R.match[name];
        },
      };
    } });

    Lesson.demo({ match(step) {
      const { p: bd, name, mode } = stageOf(step), st = boards[name];
      if (!bd || !st || mode === 'listen') return null;
      const zones = $$('.zone[data-z]', bd), zname = (z) => ($('span', z) || z).textContent.trim();
      const ans = JSON.parse(bd.dataset.answer || '{}');
      return {
        context() {
          const cards = st.visible();
          return ['Sân khấu: bảng dán; mỗi thẻ là một người (hay một bước), xếp thẻ vào ô.',
            'Các ô: ' + zones.map((z) => `${z.dataset.z} = ${zname(z)}`).join(', ') + '.',
            'Các thẻ (mã = tên, lời họ nói, ghi chú): ' + cards.map((c) => `${c.dataset.c} = ${cardName(c)}`
              + (c.dataset.say ? `, nói: "${c.dataset.say}"` : '') + (c.dataset.why ? `, ghi chú: ${c.dataset.why}` : '')).join(' | '),
            'Bản mẫu (cách xếp đúng của bài, hãy xếp theo đúng bản mẫu này và giải thích bằng lời của từng người): '
              + cards.map((c) => `${c.dataset.c} → ${ans[c.dataset.c] || '?'}`).join(', '),
            'Người học đã xếp: ' + (cards.map((c) => st.place[c.dataset.c] ? `${c.dataset.c} → ${st.place[c.dataset.c]}` : '').filter(Boolean).join(', ') || 'chưa xếp thẻ nào')].join('\n');
        },
        tools: [{ name: 'place_card', description: 'Đặt một thẻ vào một ô trên bảng dán. Người học thấy thẻ dời sang ô đó.',
          inputSchema: { type: 'object', required: ['card', 'zone', 'why'], properties: {
            card: { type: 'string', enum: st.visible().map((c) => c.dataset.c), description: 'mã thẻ' },
            zone: { type: 'string', enum: zones.map((z) => z.dataset.z), description: 'mã ô' },
            why: { type: 'string', description: 'một câu ngắn: vì sao thẻ này vào ô này' } } },
          execute({ card, zone }) {
            const c = st.visible().find((x) => x.dataset.c === card), z = zones.find((x) => x.dataset.z === zone);
            if (!c || !z) throw new Error('Không có thẻ hay ô đó. Thẻ: ' + st.visible().map((x) => x.dataset.c).join(', ') + '. Ô: ' + zones.map((x) => x.dataset.z).join(', '));
            st.demo = st.demo || {}; st.demo[card] = zone; st.layout();
            if (c.dataset.say) st.sayText(c, c.dataset.say);
            st.live.textContent = `Claude xếp ${cardName(c)} → ${zname(z)}`;
            return { did: `${cardName(c)} → ${zname(z)}.`, result: 'Đã đặt. Còn chưa đặt: ' + (st.visible().filter((x) => !st.demo[x.dataset.c]).map((x) => x.dataset.c).join(', ') || 'không còn thẻ nào') };
          } }],
        // Làm mẫu bắt đầu từ khay trống; dấu ✓ ! của lần kiểm ẩn đi để không lẫn với cách Claude xếp.
        save() { st.demo = {}; bd.classList.add('demo'); st.layout(); return null; },
        restore() { st.demo = null; bd.classList.remove('demo'); st.layout(); },
      };
    } });
  }
  window.Stage = { boards, reveal };
})();
