/* Khung buổi học trên lõi chung (xem artifacts/lesson/README.md). Cấu hình nằm trong <script type="application/json" id="lesson">.
   Lo phần chung của mọi buổi: chuyển bước, thanh tiến độ, câu hỏi một lựa chọn, ô tự nói lại, góp ý, nút xong.
   Kết quả nằm trong window.R; phần riêng của bài ghi thêm vào R rồi gọi Lesson.done('<khóa>') để mở nút đi tiếp.
   Xong buổi: lưu R vào db ở sessions/<id>-<thời điểm>, rồi gửi tóm tắt cho Claude; gửi không được thì hiện nút chép. */
(() => {
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const C = JSON.parse(($('#lesson') || {}).textContent || '{}');
  // Cùng một id với phần tự lưu (drafts/<id>): meta lesson-id trước, rồi mới tới cấu hình của bài.
  const ID = (document.querySelector('meta[name="lesson-id"]') || {}).content || C.id || document.title;
  const R = window.R = Object.assign({ lesson: ID, start: new Date().toISOString(), review: {}, quiz: {}, teach: '', feedback: {} }, window.R || {});
  const steps = $$('.step');
  const done = new Set();
  const reviewOff = () => document.documentElement.classList.contains('kit-review-off');
  const skip = (s) => reviewOff() && /(^|\s)review(\s|$)/.test(s.dataset.part || '');

  /** Opens the step whose data-s is n (or the next one that is not hidden as review). */
  function go(n) {
    let i = steps.findIndex((s) => +s.dataset.s === +n);
    while (i >= 0 && i < steps.length - 1 && skip(steps[i])) i++;
    if (i < 0) return;
    steps.forEach((s, j) => s.classList.toggle('on', j === i));
    const shown = steps.filter((s) => !skip(s)), at = Math.max(0, shown.indexOf(steps[i]));
    $('#cnt').textContent = (at + 1) + '/' + shown.length;
    const bk = $('.top .back'); if (bk) bk.hidden = at === 0;
    $('#bar').style.width = (shown.length > 1 ? at / (shown.length - 1) * 100 : 100) + '%';
    window.scrollTo(0, 0);
    const h = steps[i].querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  /** Enables every [data-need] button whose keys are all done. Review gates stay open once the lesson was finished before. */
  function gate() {
    $$('[data-need]').forEach((b) => {
      if (b.dataset.running || (demoBusy && b.classList.contains('demo-open'))) { b.disabled = true; return; }   // a Claude demo is running (one per lesson)
      if (reviewOff() && b.hasAttribute('data-review-gate')) { b.disabled = false; return; }
      b.disabled = !b.dataset.need.split(/\s+/).filter(Boolean).every((k) => done.has(k));
    });
    $$('.demo-open:not([data-need])').forEach((b) => { b.disabled = demoBusy; });   // demo buttons with no step gate: only the lesson-wide lock
  }
  function mark(key) { done.add(key); gate(); }

  $$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));

  // Nút quay lại ở thanh trên: mở bước liền trước (bỏ qua bước ôn đã ẩn). Không xóa gì đã làm, chỉ để xem lại.
  // data-noreplay: phần tự lưu không ghi và không đếm nút này, nên bài đang học dở vẫn mở lại đúng chỗ.
  const meta = $('.top .meta'), back = meta && document.createElement('button');
  if (back) {
    back.type = 'button'; back.className = 'back'; back.dataset.noreplay = ''; back.textContent = '← Quay lại'; back.hidden = true;
    back.addEventListener('click', () => {
      const i = steps.findIndex((s) => s.classList.contains('on'));
      for (let j = i - 1; j >= 0; j--) if (!skip(steps[j])) { go(steps[j].dataset.s); return; }
    });
    meta.insertBefore(back, $('#cnt'));
  }

  // Câu hỏi một lựa chọn: <div class="q" data-q="F2" data-a="1" [data-kind="review"]> với các .opt, một .status, một .why.
  $$('.q[data-q]').forEach((q) => {
    const id = q.dataset.q, a = +q.dataset.a, os = [...q.querySelectorAll('.opt')], st = q.querySelector('.status'), why = q.querySelector('.why');
    os.forEach((o, i) => o.addEventListener('click', () => {
      if (done.has(id)) return;
      const ok = i === a;
      os.forEach((x, j) => { x.disabled = true; if (j === a) x.classList.add('right'); });
      if (!ok) o.classList.add('wrong');
      if (st) { st.textContent = ok ? 'Đúng.' : 'Chưa đúng. Đáp án đúng có chữ "Đúng".'; st.className = 'status ' + (ok ? 'good' : 'bad'); }
      if (why) why.classList.add('on');
      if (!ok) smartWhy(q, os, i, a, why);
      (q.dataset.kind === 'review' ? R.review : R.quiz)[id] = { pick: i, ok };
      mark(id);
    }));
  });

  // Ô viết: <textarea data-key="teach" data-min="5">. Đủ chữ thì khóa đó tính là xong.
  $$('textarea[data-key]').forEach((t) => t.addEventListener('input', () => {
    const k = t.dataset.key, min = +(t.dataset.min || 5);
    R[k] = t.value;
    if (t.value.trim().length >= min) mark(k); else { done.delete(k); gate(); }
  }));
  // Nút xem bản của Claude: <button data-show="mine">; ghi lại là xem trước hay sau khi tự viết.
  $$('[data-show]').forEach((b) => b.addEventListener('click', () => {
    const box = document.getElementById(b.dataset.show);
    if (box) box.classList.add('on');
    b.classList.add('hide');
    R.sawMineBeforeWriting = (R.teach || '').trim().length < 5;
  }));

  // Góp ý: <div class="seg" data-f="len"><button data-v="vừa">…; ô #note.
  // Tên tiêu chí lấy từ <b> trong cùng .crit, để tóm tắt ghi "Độ dài: vừa" thay vì "len vừa".
  const fLabel = {};
  $$('[data-f]').forEach((sg) => { const c = sg.closest('.crit'), b = c && c.querySelector('b'); fLabel[sg.dataset.f] = b ? b.textContent.trim() : sg.dataset.f; });
  $$('[data-f]').forEach((sg) => sg.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    R.feedback[sg.dataset.f] = b.dataset.v;
    sg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    mark('fb-' + sg.dataset.f);
  })));
  const note = $('#note');
  if (note) note.addEventListener('input', () => { R.feedback.note = note.value; });

  function summary(doc) {
    const n = (o) => Object.values(o || {}), right = (o) => n(o).filter((x) => x.ok).length;
    const L = [`# Xong buổi: ${C.subject ? C.subject + ' · ' : ''}${C.title || ID}`, ''];
    if (n(R.review).length) L.push(`Ôn: đúng ${right(R.review)}/${n(R.review).length}`);
    if (n(R.quiz).length) L.push(`Câu hỏi nhanh: đúng ${right(R.quiz)}/${n(R.quiz).length}`);
    // Phần thêm của từng loại bài (ví dụ sa bàn chiến tranh) thêm dòng vào tóm tắt qua Lesson.extras.
    extras.forEach((f) => { try { const x = f(R); if (x) L.push('', x); } catch (e) {} });
    if ((R.teach || '').trim()) L.push('', 'Tự nói lại: ' + R.teach.trim());
    const asked = (R.ai || []).filter((x) => x.kind === 'ask');
    if (asked.length) L.push('', 'Đã hỏi Claude trong bài: ' + asked.map((x) => `"${x.q}" (${x.step})`).join('; '));
    const used = (R.ai || []).filter((x) => x.kind !== 'ask' && x.kind !== 'demo').map((x) => x.kind === 'teach' ? 'nhận xét bài tự nói lại' : 'giải thích câu ' + x.q);
    if (used.length) L.push('Nhờ Claude: ' + [...new Set(used)].join(', '));
    const demos = (R.ai || []).filter((x) => x.kind === 'demo');
    if (demos.length) L.push('Xem Claude làm mẫu: ' + [...new Set(demos.map((x) => x.step))].join(', '));
    if ((R.extra || []).length) L.push(`Tình huống thêm: đúng ${R.extra.filter((x) => x.ok).length}/${R.extra.length}`);
    if (R.listened) L.push(`Nghe đọc to: ${R.listened} lần`);
    const fb = Object.entries(R.feedback).filter(([k]) => k !== 'note').map(([k, v]) => (fLabel[k] || k) + ': ' + v).join('; ');
    if (fb) L.push('', 'Góp ý: ' + fb);
    if ((R.feedback.note || '').trim()) L.push('Ghi thêm: ' + R.feedback.note.trim());
    L.push('', doc ? `Kết quả đầy đủ trong db của trang: ${doc}` : 'Chưa lưu được vào db: kết quả đầy đủ ở dưới.', '');
    if (!doc) L.push('```json', JSON.stringify(R), '```');
    return L.join('\n');
  }

  const extras = [];
  const fin = $('#finish'), copyBtn = $('#copy'), msg = $('#done-msg');
  /** Màn kết (quy luật đỉnh và kết): tuyến các bước vừa đi qua, đánh dấu từng ga, vài con số, và câu người học tự viết.
      Tự dựng từ R và tên các bước, không cần bài soạn gì thêm. Ga của phần ôn bị ẩn khi học lại thì không vẽ. */
  function endCard() {
    const old = $('#end-card'); if (old) old.remove();
    const n = (o) => Object.values(o || {}), right = (o) => n(o).filter((x) => x.ok).length;
    const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    const card = el('section', 'end-card'); card.id = 'end-card'; card.setAttribute('aria-label', 'Tóm tắt buổi học');
    card.append(el('p', 'end-kicker', 'Xong buổi'), el('h3', 'end-title', C.title || ID));
    const route = el('ol', 'end-route');
    steps.filter((s) => !skip(s) && !s.querySelector('#finish')).forEach((s, i) => {
      const li = el('li'); li.style.setProperty('--i', i);
      li.append(el('span', 'end-dot'), el('span', 'end-name', clip((s.querySelector('h2, h1') || {}).textContent || 'Bước ' + (i + 1), 40)));
      route.append(li);
    });
    const last = el('li', 'end-last'); last.style.setProperty('--i', route.children.length);
    last.append(el('span', 'end-dot'), el('span', 'end-name', 'Xong'));
    route.append(last);
    const stats = el('dl', 'end-stats');
    const stat = (k, v) => { const d = el('div'); d.append(el('dt', '', k), el('dd', '', v)); stats.append(d); };
    if (n(R.review).length && !reviewOff()) stat('Ôn', right(R.review) + '/' + n(R.review).length);
    if (n(R.quiz).length) stat('Câu hỏi nhanh', right(R.quiz) + '/' + n(R.quiz).length);
    const mins = Math.round((Date.parse(R.end) - Date.parse(R.start)) / 60000);
    if (mins > 0) stat('Phút trên trang', String(mins));
    card.append(route);
    if (stats.children.length) card.append(stats);
    const said = clip(R.teach, 180);
    if (said) {
      const q = el('blockquote', 'end-quote');
      q.append(el('b', '', 'Bạn đã tự nói'), el('span', '', '“' + said + (String(R.teach).trim().length > 180 ? '…' : '') + '”'));
      card.append(q);
    }
    (msg || fin).after(card);
  }
  if (fin) fin.addEventListener('click', async () => {
    fin.disabled = true; R.end = new Date().toISOString();
    try { endCard(); } catch (e) {}
    if (msg) msg.textContent = 'Đang lưu…';
    const doc = 'sessions/' + String(ID).replace(/[^a-z0-9-]/gi, '-') + '-' + Date.now();
    const saved = window.Kit ? await Kit.put(doc, R) : false;
    const text = summary(saved ? doc : '');
    const sent = window.Kit ? await Kit.sendToClaude(text, $('.top')) : false;
    // Chỉ báo xong hẳn khi vừa lưu được vào db vừa gửi được cho Claude; thiếu một trong hai thì hiện nút chép.
    if (msg) msg.textContent = saved && sent ? 'Đã lưu và gửi cho Claude. Claude trả lời trong thread.'
      : sent ? 'Đã gửi tóm tắt cho Claude nhưng chưa lưu được vào db. Bấm "Chép kết quả" rồi dán vào thread cho chắc.'
        : saved ? 'Đã lưu kết quả. Bạn nhắn "xong" trong thread là Claude đọc được.'
          : 'Chưa lưu được tự động. Bấm "Chép kết quả" rồi dán vào thread.';
    if (copyBtn && !(saved && sent)) { copyBtn.classList.remove('hide'); copyBtn.onclick = () => (window.Kit ? Kit.copy(text) : navigator.clipboard.writeText(text)); }
  });

  // ---------- Hỏi Claude ngay trong bài (khả năng sample, qua Kit.ask) ----------
  // Ba chỗ, tự gắn vào mọi bài (thường, chiến tranh, IT), chỉ hiện khi trang hỏi Claude được (CSS .kit-ask):
  //   1. Ô tự nói lại: Claude nhận xét bài viết so với ý chính (đúng gì, thiếu gì, một câu hỏi để tự nghĩ tiếp).
  //   2. Chọn sai một câu: Claude giải thích vì sao lựa chọn đó nghe hợp lý mà chưa đúng.
  //   3. Mỗi bước có nội dung: ô "Hỏi Claude về bước này", Claude biết chữ trên bước và tình trạng sân khấu,
  //      và chỉ gợi ý (không nói đáp án) cho câu hỏi chưa trả lời.
  // Nút hỏi có data-noreplay và ô hỏi là <input> (không phải textarea): phần tự lưu không bấm lại, tải lại không tốn lượt hỏi.
  R.ai = R.ai || [];
  const VOICE = 'Viết tiếng Việt tự nhiên, ngắn gọn, như người kèm học thân thiện nói chuyện trực tiếp. Gọi người học là "bạn". '
    + 'Chỉ chữ thường: không Markdown, không dấu *, không gạch đầu dòng, không tiêu đề. Không khen sáo rỗng, không mở đầu bằng "Câu hỏi hay".';
  const head = () => `Đây là một trang học tương tác. Bài: ${C.subject ? C.subject + ' · ' : ''}${C.title || ID}.`;
  // Chỗ còn vướng ở các buổi trước của môn (make-lesson.mjs lấy từ learning/<môn>.md, đề xuất T4).
  const stuck = () => (Array.isArray(C.stuck) && C.stuck.length ? ['Những chỗ người học còn vướng ở các buổi trước của môn này: '
    + C.stuck.map((x) => clip(x, 300)).join(' | ') + '. Chỉ nối vào khi liên quan tới điều đang hỏi, một câu là đủ, đừng giảng lại bài cũ.'] : []);
  const clip = (s, n = 1800) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; };
  const aiBtn = (text, cls = 'btn ghost') => { const b = el('button', { type: 'button', className: cls + ' kit-ask', textContent: text }); b.dataset.noreplay = ''; return b; };
  const canAsk = () => window.Kit && Kit.ask;
  /** Chữ người học đang thấy ở một phần trang: bỏ lời giải chưa mở, bỏ phần hỏi Claude. */
  function visibleText(node, n) {
    const c = node.cloneNode(true);
    c.querySelectorAll('.why:not(.on), .mine:not(.on), .kit-ask, .ai-out, .status, .listen, script, style').forEach((x) => x.remove());
    c.querySelectorAll('*').forEach((x) => x.append(' '));   // chữ của hai thẻ liền nhau không dính vào nhau
    return clip(c.textContent, n);
  }
  function questionText(q) {
    let p = q.previousElementSibling;
    while (p && p.tagName !== 'P') p = p.previousElementSibling;
    return clip((p || q.closest('.card')?.querySelector('p') || {}).textContent || '', 400);
  }
  /** Câu trả lời sai: thêm nút "Vì sao mình chọn sai?" dưới lời giải. */
  function smartWhy(q, os, pick, ans, why) {
    if (!canAsk() || q.querySelector('.kit-ask')) return;
    const b = aiBtn('Vì sao mình chọn sai?', 'ai-open'), out = el('p', { className: 'ai-out kit-ask' });
    out.setAttribute('role', 'status');
    (why || os[os.length - 1]).after(b, out);
    b.addEventListener('click', async () => {
      b.disabled = true;
      const qt = questionText(q), opt = (o) => clip(o.textContent.replace(/(Đúng|Bạn chọn|Đã chọn)$/, ''), 200);
      const prompt = [head(), '',
        `Câu hỏi: ${qt}`,
        'Các lựa chọn: ' + os.map((o, j) => `(${j + 1}) ${opt(o)}`).join('; '),
        `Người học chọn: (${pick + 1}) ${opt(os[pick])}`,
        `Đáp án đúng: (${ans + 1}) ${opt(os[ans])}`,
        why ? `Lời giải có sẵn trên trang (người học đã đọc): ${clip(why.textContent, 600)}` : '', '',
        'Trong 2 đến 3 câu: nói vì sao lựa chọn của người học nghe hợp lý, rồi chỉ đúng điểm khiến nó chưa đúng, '
        + 'và một mẹo để lần sau phân biệt. Đừng lặp lại lời giải có sẵn. ' + VOICE].join('\n');
      const a = await Kit.ask(prompt, out, { tier: 'quick' });
      if (a) { R.ai.push({ kind: 'why', q: q.dataset.q, a }); b.remove(); } else b.disabled = false;
    });
  }
  // 1. Ô tự nói lại. Nút mic "Nói thay gõ" đã bỏ khỏi bài học (KH8 câu 7, 2026-11-19: 12 buổi dùng 0 lần); Kit.micRow vẫn có trong kit.
  const teach = $('textarea[data-key="teach"]');
  const teachEnd = teach;
  if (teach && canAsk()) {
    const b = aiBtn('Claude nhận xét bài của mình', 'ai-open'), out = el('p', { className: 'ai-out kit-ask' });
    out.setAttribute('role', 'status');
    b.disabled = true;
    teachEnd.after(b, out);
    teach.addEventListener('input', () => { b.disabled = teach.value.trim().length < +(teach.dataset.min || 5); });
    b.addEventListener('click', async () => {
      b.disabled = true;
      const step = teach.closest('.step'), mine = $('#mine');
      // Đề theo tình huống (phương án C, 2026-11-17): hộp .ask-from là tin của một người cụ thể, người học trả lời người đó.
      const from = step.querySelector('.ask-from');
      const prompt = [head(), '',
        `Đề bài người học đang làm: ${visibleText(step, 600)}`,
        from ? `Đề là một tình huống: người học trả lời ${clip(from.dataset.who || 'một người', 80)}, người vừa nhắn: "${clip([...from.childNodes].filter((n) => n.nodeName !== 'B').map((n) => n.textContent).join(' '), 400)}". `
          + 'Xem thêm câu trả lời có nói với đúng người đó và dùng chi tiết của chính tình huống không, hay chỉ nhắc luật chung.' : '',
        mine ? `Ý chính của bài (bản mẫu, người học ${mine.classList.contains('on') ? 'đã' : 'chưa'} xem): ${clip(mine.textContent, 800)}` : '',
        `Người học tự viết: "${clip(teach.value, 1500)}"`, ...stuck(), '',
        'Nhận xét bài viết của người học trong tối đa 3 câu. Câu 1: một điều họ đã nắm đúng, dẫn lại ý của chính họ. '
        + 'Câu 2: một điều còn thiếu hay chưa chính xác so với ý chính (nếu đủ ý rồi thì nói vậy)'
        + (from ? ', hoặc chỗ còn nói chung chung chưa gắn vào tình huống. ' : '. ')
        + 'Câu 3: một câu hỏi ngắn giúp họ tự nghĩ tiếp, không kèm đáp án. ' + VOICE].join('\n');
      const a = await Kit.ask(prompt, out);
      if (a) R.ai.push({ kind: 'teach', a });
      b.disabled = false; b.textContent = 'Nhận xét lại';
    });
  }
  // 3. Hỏi Claude về bước này (bỏ bước ôn và bước góp ý cuối)
  steps.forEach((step) => {
    if (!canAsk() || /(^|\s)review(\s|$)/.test(step.dataset.part || '') || step.querySelector('#finish')) return;
    const box = el('div', { className: 'ai-ask kit-ask' });
    const open = aiBtn('Hỏi Claude về bước này', 'ai-open');
    const form = el('form', { className: 'ai-form', hidden: true });
    const inp = el('input', { type: 'text', placeholder: 'Bạn chưa rõ chỗ nào?', maxLength: 300 });
    inp.setAttribute('aria-label', 'Câu hỏi cho Claude');
    const send = aiBtn('Hỏi', 'btn'); send.type = 'submit'; send.classList.remove('kit-ask');
    const out = el('p', { className: 'ai-out' }); out.setAttribute('role', 'status');
    form.append(inp, send);
    box.append(open, form, out);
    const next = step.querySelector('.next');
    if (next) next.before(box); else step.append(box);
    const turns = [];
    open.addEventListener('click', () => { form.hidden = !form.hidden; open.setAttribute('aria-expanded', String(!form.hidden)); if (!form.hidden) inp.focus(); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const qtext = inp.value.trim(); if (!qtext) return;
      send.disabled = true; inp.disabled = true;
      const h = clip((step.querySelector('h1, h2') || {}).textContent || '', 120);
      const pending = [...step.querySelectorAll('.q[data-q]')].filter((q) => !done.has(q.dataset.q)).map(questionText).filter(Boolean);
      const stage = extras.map((f) => { try { return f(R); } catch (err) { return ''; } }).filter(Boolean).join('\n');
      const prompt = [head(), '',
        `Người học đang ở bước "${h}". Chữ trên bước (những gì họ đang thấy): ${visibleText(step, 1800)}`,
        stage ? `Những gì người học đã làm trên sân khấu tương tác (núm vặn, thẻ đã xếp…): ${clip(stage, 1200)}` : '',
        pending.length ? `Câu hỏi trên bước mà người học CHƯA trả lời: ${pending.join(' | ')}. Nếu người học hỏi thẳng đáp án của câu này, đừng nói đáp án: chỉ gợi một hướng nghĩ hay một chỗ trên màn để nhìn lại.` : '',
        turns.length ? 'Những câu đã hỏi trước đó ở bước này: ' + turns.map((t) => `Hỏi: ${t.q} / Đáp: ${clip(t.a, 300)}`).join(' || ') : '',
        step.querySelector('.next[disabled]') ? 'Người học CHƯA làm xong bước này (còn việc phải tự làm: chọn, xếp, vặn, trả lời). Đừng làm hộ và đừng nói đáp án hay cách xếp đúng; chỉ gợi một hướng nghĩ, hay một chỗ trên màn để nhìn lại.' : '',
        ...stuck(),
        `Người học hỏi: "${qtext}"`, '',
        'Trả lời trong tối đa 4 câu, bám vào nội dung bước và ví dụ đang có trên màn. Nếu câu hỏi ra ngoài bài, trả lời ngắn rồi kéo về bài. ' + VOICE].join('\n');
      const a = await Kit.ask(prompt, out, { cache: false });
      if (a) { turns.push({ q: qtext, a }); R.ai.push({ kind: 'ask', step: h, q: qtext, a }); inp.value = ''; }
      send.disabled = false; inp.disabled = false; inp.focus();
    });
  });

  // ---------- Nghe phần giải thích: đã bỏ (KH8 câu 7, 2026-11-19: 12 buổi 14–17/11 dùng 0 lần) ----------
  // Kit.listen vẫn có trong kit; bài chiến tranh còn "Nghe mốc đang xem" trên sa bàn (war-lesson.js).

  // ---------- Claude làm mẫu trên sân khấu (khả năng sample có tools, đề xuất T1) ----------
  // Sân khấu (bàn thử, bảng dán, sa bàn) đăng ký bằng Lesson.demo({ match(step) }): match trả về null nếu bước không có gì để làm mẫu,
  // hoặc { context(), tools: [{ name, description, inputSchema, execute(input) → { did, result } }], save(), restore(saved) }.
  // Nút "Xem Claude làm" chỉ mở khi người học đã tự làm xong bước (cùng điều kiện với nút Tiếp): thử trước, xem cách khác sau.
  // Claude gọi tools của trang từng thao tác một, kèm một câu vì sao; trang hiện thao tác đó lên sân khấu và vào danh sách.
  // Thao tác của Claude không phải lần bấm của người học nên không vào bản tự lưu; "Trả lại cách của mình" đưa sân khấu về như trước.
  // Mỗi lúc chỉ một lượt làm mẫu cho cả bài (demoBusy). Lần bấm kế của người học ngoài khung làm mẫu (núm, thẻ, nút Tiếp, Xong buổi)
  // tự trả sân khấu về cách của người học trước, nên giá trị của Claude không bao giờ vào điểm, lựa chọn hay bản lưu cuối buổi.
  const demoProviders = [];
  let demoBusy = false, demoShown = null;   // demoShown: hàm trả lại sân khấu khi bản làm mẫu còn hiện
  const takeBackOn = (e) => {
    if (!demoShown || !e.isTrusted || !(e.target instanceof Element) || e.target.closest('.demo.kit-ask')) return;
    if (e.target.closest('button, a, input, select, textarea, label, [role="button"], [data-c], [data-z], canvas')) demoShown();
  };
  document.addEventListener('pointerdown', takeBackOn, true);
  document.addEventListener('click', takeBackOn, true);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function demo(p) { demoProviders.push(p); steps.forEach(mountDemo); gate(); }
  function mountDemo(step) {
    if (!canAsk() || step.querySelector('.demo') || /(^|\s)review(\s|$)/.test(step.dataset.part || '')) return;
    const p = demoProviders.find((d) => d.match(step)); if (!p) return;
    const box = el('div', { className: 'demo kit-ask' });
    const open = aiBtn('Xem Claude làm', 'ai-open demo-open');
    const next = step.querySelector('.next');
    if (next && next.dataset.need) open.dataset.need = next.dataset.need;
    const hint = el('p', { className: 'demo-hint', textContent: 'Tự làm xong bước này thì xem được Claude làm một lượt, kèm lý do từng thao tác.' });
    const log = el('ol', { className: 'demo-log' }); log.setAttribute('aria-live', 'polite');
    const out = el('p', { className: 'ai-out' }); out.setAttribute('role', 'status');
    const undo = el('button', { type: 'button', className: 'btn', textContent: 'Trả lại cách của mình', hidden: true }); undo.dataset.noreplay = '';
    box.append(open, hint, log, out, undo);
    const askBox = step.querySelector('.ai-ask');
    if (askBox) askBox.before(box); else if (next) next.before(box); else step.append(box);
    // changed: Claude has moved the stage since the learner's own state. run: the current demo run; taking the stage back ends it,
    // so tool calls still on their way from that run stop before they touch the stage.
    // took: a snapshot of the learner's stage was taken (save() may return null and still change the stage, e.g. the board's demo mode).
    let saved = null, took = false, cur = null, changed = false, run = 0;
    const takeBack = () => { run++; if (cur && cur.restore && took) cur.restore(saved); saved = null; took = false; changed = false; undo.hidden = true; if (demoShown === takeBack) demoShown = null; };
    open.addEventListener('click', async () => {
      if (demoBusy) return;
      if (demoShown && demoShown !== takeBack) demoShown();   // một bản làm mẫu khác còn hiện: trả lại trước khi chụp cách của người học
      cur = p.match(step); if (!cur) return;
      demoBusy = true; open.disabled = true; open.dataset.running = '1'; undo.hidden = true; log.innerHTML = ''; gate();
      if (!took && cur.save) { saved = cur.save(); took = true; }
      let moves = 0; const mine = ++run;
      demoShown = takeBack;   // từ giờ, lần bấm của người học ngoài khung dừng lượt này và trả sân khấu về
      const tools = cur.tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema,
        async execute(input) {
          if (mine !== run) throw new Error('Người học đã tự làm tiếp. Dừng làm mẫu, không gọi thêm công cụ.');
          if (moves >= 8) throw new Error('Đã đủ 8 thao tác. Dừng lại và viết câu tóm lại.');
          const r = await t.execute(input || {});
          moves++; if (mine === run) changed = true;
          const li = el('li', {}, el('b', { textContent: r.did }));
          if (input && input.why) li.append(el('span', { textContent: clip(input.why, 240) }));
          log.append(li);
          if (window.Stage && Stage.reveal) Stage.reveal();
          await wait(900);   // để người học kịp thấy thao tác trên sân khấu trước thao tác kế
          return r.result || 'Đã làm: ' + r.did;
        } }));
      const h = clip((step.querySelector('h1, h2') || {}).textContent || '', 120);
      const prompt = [head(), '',
        `Người học đang ở bước "${h}". Chữ trên bước: ${visibleText(step, 1500)}`,
        clip(cur.context(), 5000), ...stuck(), '',
        'Người học đã tự làm xong bước này. Giờ bạn làm mẫu trên sân khấu bằng các công cụ được cho, để người học xem một cách làm và hiểu vì sao. '
        + 'Mỗi lần gọi công cụ là một thao tác; ghi lý do vào "why": một câu ngắn nói vì sao làm vậy, người học thấy câu này ngay cạnh thao tác. '
        + 'Làm từ 2 đến 6 thao tác theo thứ tự hợp lý, đừng thử lung tung. Chỉ dùng điều có trên trang, không thêm chi tiết mới. '
        + 'Xong thì viết 1 đến 2 câu tóm lại điều rút ra; nếu cách của bạn khác cách người học đã làm thì nói khác ở đâu, không chê. ' + VOICE].join('\n');
      let a = '';
      try { a = await Kit.ask(prompt, out, { tools }); } finally {
        undo.hidden = !(changed && cur.restore);
        if (!changed && mine === run) takeBack();   // Claude moved nothing: leave the demo mode, the learner's stage as it was
        demoBusy = false; delete open.dataset.running; open.disabled = false; open.textContent = 'Xem Claude làm lại'; gate();
      }
      R.ai.push({ kind: 'demo', step: h, moves, a: a || '' });
    });
    undo.addEventListener('click', takeBack);
  }

  // ---------- Thêm một tình huống như vậy (đề xuất T3) ----------
  // Ở bước cuối của bài frontend và BA (không có ở bài chiến tranh: chi tiết lịch sử phải có nguồn, Claude trong trang không tra được),
  // Claude soạn một tình huống mới cùng ý với một câu hỏi ba lựa chọn. Không bắt buộc, làm bao nhiêu cũng được. Kết quả vào R.extra.
  // Tắt cho một bài: "extra": false trong cấu hình bài.
  R.extra = R.extra || [];
  const finStep = fin && fin.closest('.step');
  if (finStep && canAsk() && C.extra !== false && !$('#board')) {
    const box = el('div', { className: 'card extra kit-ask' });
    const intro = el('p', {}, el('b', { textContent: 'Còn sức? ' }), 'Làm thêm một tình huống cùng ý, Claude soạn mới mỗi lần. Không bắt buộc.');
    const gen = aiBtn('Cho mình một tình huống', 'btn');
    gen.classList.remove('kit-ask');
    const out = el('p', { className: 'ai-out' }); out.setAttribute('role', 'status');
    const area = el('div', { className: 'extra-q' });
    box.append(intro, gen, out, area);
    (finStep.querySelector('h1, h2') || finStep.firstElementChild).after(box);
    const quizText = $$('.q[data-q]').map(questionText).filter(Boolean).join(' | ');
    const mainIdea = () => clip([...$$('#mine'), ...steps.filter((s) => !s.querySelector('.q, textarea, #finish') && !/review/.test(s.dataset.part || '')).slice(-2)]
      .map((x) => visibleText(x, 800)).join(' '), 1600);
    gen.addEventListener('click', async () => {
      gen.disabled = true; area.innerHTML = '';
      const prompt = [head(), '',
        `Ý chính của bài: ${mainIdea()}`,
        quizText ? `Các câu hỏi đã có trong bài (đừng lặp lại): ${clip(quizText, 900)}` : '',
        R.extra.length ? 'Các tình huống đã ra trước đó (ra cái khác hẳn): ' + R.extra.map((x) => clip(x.situation, 160)).join(' | ') : '',
        ...stuck(), '',
        'Soạn MỘT tình huống mới, đời thường, cùng ý chính với bài, để người học áp dụng chứ không nhắc lại định nghĩa. '
        + 'Với bài giao diện thì tả một màn hình cụ thể của một app (có gì, màu gì, nằm đâu); với bài phân tích nghiệp vụ thì tả một yêu cầu hay một cuộc nói chuyện cụ thể. '
        + 'Rồi một câu hỏi với đúng 3 lựa chọn, chỉ một lựa chọn đúng; hai lựa chọn sai phải nghe hợp lý. '
        + 'Trả về JSON đúng dạng: {"situation": "2 đến 4 câu", "question": "một câu", "options": ["", "", ""], "answer": số thứ tự đáp án đúng tính từ 0, '
        + '"why": "1 đến 2 câu giải thích vì sao đúng"}. ' + VOICE].join('\n');
      const v = await Kit.askJson(prompt, out);
      gen.disabled = false;
      if (!v) return;
      const text = (s) => typeof s === 'string' && s.trim() !== '';
      const ok = v && text(v.situation) && text(v.question) && text(v.why) && Array.isArray(v.options) && v.options.length === 3
        && v.options.every(text) && Number.isInteger(v.answer) && v.answer >= 0 && v.answer < v.options.length;
      if (!ok) { out.textContent = 'Claude soạn chưa đúng dạng. Bấm lại để soạn tình huống khác.'; return; }
      gen.textContent = 'Tình huống khác';
      const st = el('p', { className: 'status', role: 'status' }), why = el('p', { className: 'why', textContent: v.why });
      const opts = v.options.map((t) => { const o = el('button', { type: 'button', className: 'opt', textContent: t }); o.dataset.noreplay = ''; return o; });
      area.append(el('p', { textContent: v.situation }), el('p', {}, el('b', { textContent: v.question })), el('div', { className: 'q' }, st, ...opts, why));
      opts.forEach((o, i) => o.addEventListener('click', () => {
        const right = i === v.answer;
        opts.forEach((x, j) => { x.disabled = true; if (j === v.answer) x.classList.add('right'); });
        if (!right) o.classList.add('wrong');
        st.textContent = right ? 'Đúng.' : 'Chưa đúng. Đáp án đúng có chữ "Đúng".'; st.className = 'status ' + (right ? 'good' : 'bad');
        why.classList.add('on');
        R.extra.push({ situation: v.situation, question: v.question, options: v.options, answer: v.answer, pick: i, ok: right });
      }));
    });
  }

  window.Lesson = { go, done: mark, R, summary, extras, demo };
  const start = steps.find((s) => s.classList.contains('on')) || steps[0];
  if (start) go(start.dataset.s);
  gate();
  // Phần tự lưu bật chế độ học lại sau khi trang đã chạy: mở lại các nút khóa bởi phần ôn và bỏ qua bước ôn.
  new MutationObserver(() => { gate(); const cur = steps.find((s) => s.classList.contains('on')); if (cur && skip(cur)) go(cur.dataset.s); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
