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
      if (reviewOff() && b.hasAttribute('data-review-gate')) { b.disabled = false; return; }
      b.disabled = !b.dataset.need.split(/\s+/).filter(Boolean).every((k) => done.has(k));
    });
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
    const used = (R.ai || []).filter((x) => x.kind !== 'ask').map((x) => x.kind === 'teach' ? 'nhận xét bài tự nói lại' : 'giải thích câu ' + x.q);
    if (used.length) L.push('Nhờ Claude: ' + [...new Set(used)].join(', '));
    const fb = Object.entries(R.feedback).filter(([k]) => k !== 'note').map(([k, v]) => (fLabel[k] || k) + ': ' + v).join('; ');
    if (fb) L.push('', 'Góp ý: ' + fb);
    if ((R.feedback.note || '').trim()) L.push('Ghi thêm: ' + R.feedback.note.trim());
    L.push('', doc ? `Kết quả đầy đủ trong db của trang: ${doc}` : 'Chưa lưu được vào db: kết quả đầy đủ ở dưới.', '');
    if (!doc) L.push('```json', JSON.stringify(R), '```');
    return L.join('\n');
  }

  const extras = [];
  const fin = $('#finish'), copyBtn = $('#copy'), msg = $('#done-msg');
  if (fin) fin.addEventListener('click', async () => {
    fin.disabled = true; R.end = new Date().toISOString();
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
    c.querySelectorAll('.why:not(.on), .mine:not(.on), .kit-ask, .ai-out, .status, script, style').forEach((x) => x.remove());
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
  // 1. Ô tự nói lại. Nói thay gõ (Kit.micRow, khả năng dictation): nút mic cạnh ô, ẩn nơi không có mic.
  // R.spoke đếm số lần nói, để biết tính năng có thật sự được dùng (learning/usage.md).
  const teach = $('textarea[data-key="teach"]');
  const teachEnd = teach && window.Kit && Kit.micRow ? Kit.micRow(teach, () => { R.spoke = (R.spoke || 0) + 1; }) : teach;
  if (teach && canAsk()) {
    const b = aiBtn('Claude nhận xét bài của mình', 'ai-open'), out = el('p', { className: 'ai-out kit-ask' });
    out.setAttribute('role', 'status');
    b.disabled = true;
    teachEnd.after(b, out);
    teach.addEventListener('input', () => { b.disabled = teach.value.trim().length < +(teach.dataset.min || 5); });
    b.addEventListener('click', async () => {
      b.disabled = true;
      const step = teach.closest('.step'), mine = $('#mine');
      const prompt = [head(), '',
        `Đề bài người học đang làm: ${visibleText(step, 300)}`,
        mine ? `Ý chính của bài (bản mẫu, người học ${mine.classList.contains('on') ? 'đã' : 'chưa'} xem): ${clip(mine.textContent, 800)}` : '',
        `Người học tự viết: "${clip(teach.value, 1500)}"`, ...stuck(), '',
        'Nhận xét bài viết của người học trong tối đa 3 câu. Câu 1: một điều họ đã nắm đúng, dẫn lại ý của chính họ. '
        + 'Câu 2: một điều còn thiếu hay chưa chính xác so với ý chính (nếu đủ ý rồi thì nói vậy). '
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

  window.Lesson = { go, done: mark, R, summary, extras };
  const start = steps.find((s) => s.classList.contains('on')) || steps[0];
  if (start) go(start.dataset.s);
  gate();
  // Phần tự lưu bật chế độ học lại sau khi trang đã chạy: mở lại các nút khóa bởi phần ôn và bỏ qua bước ôn.
  new MutationObserver(() => { gate(); const cur = steps.find((s) => s.classList.contains('on')); if (cur && skip(cur)) go(cur.dataset.s); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
