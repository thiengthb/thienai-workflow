/* Khung buổi học trên lõi chung (xem artifacts/lesson/README.md). Cấu hình nằm trong <script type="application/json" id="lesson">.
   Lo phần chung của mọi buổi: chuyển bước, thanh tiến độ, câu hỏi một lựa chọn, ô tự nói lại, góp ý, nút xong.
   Kết quả nằm trong window.R; phần riêng của bài ghi thêm vào R rồi gọi Lesson.done('<khóa>') để mở nút đi tiếp.
   Xong buổi: lưu R vào db ở sessions/<id>-<thời điểm>, rồi gửi tóm tắt cho Claude; gửi không được thì hiện nút chép. */
(() => {
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const C = JSON.parse(($('#lesson') || {}).textContent || '{}');
  const ID = C.id || (document.querySelector('meta[name="lesson-id"]') || {}).content || document.title;
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
    if ((R.teach || '').trim()) L.push('', 'Tự nói lại: ' + R.teach.trim());
    const fb = Object.entries(R.feedback).filter(([k]) => k !== 'note').map(([k, v]) => k + ' ' + v).join(', ');
    if (fb) L.push('', 'Góp ý: ' + fb);
    if ((R.feedback.note || '').trim()) L.push('Ghi thêm: ' + R.feedback.note.trim());
    L.push('', doc ? `Kết quả đầy đủ trong db của trang: ${doc}` : 'Chưa lưu được vào db: kết quả đầy đủ ở dưới.', '');
    if (!doc) L.push('```json', JSON.stringify(R), '```');
    return L.join('\n');
  }

  const fin = $('#finish'), copyBtn = $('#copy'), msg = $('#done-msg');
  if (fin) fin.addEventListener('click', async () => {
    fin.disabled = true; R.end = new Date().toISOString();
    if (msg) msg.textContent = 'Đang lưu…';
    const doc = 'sessions/' + String(ID).replace(/[^a-z0-9-]/gi, '-') + '-' + Date.now();
    const saved = window.Kit ? await Kit.put(doc, R) : false;
    const text = summary(saved ? doc : '');
    const sent = window.Kit ? await Kit.sendToClaude(text, $('.top')) : false;
    if (msg) msg.textContent = sent ? 'Đã lưu và gửi cho Claude. Claude trả lời trong thread.'
      : saved ? 'Đã lưu kết quả. Bạn nhắn "xong" trong thread là Claude đọc được.'
        : 'Chưa lưu được tự động. Bấm "Chép kết quả" rồi dán vào thread.';
    if (copyBtn && !sent) { copyBtn.classList.remove('hide'); copyBtn.onclick = () => (window.Kit ? Kit.copy(text) : navigator.clipboard.writeText(text)); }
  });

  window.Lesson = { go, done: mark, R, summary };
  const start = steps.find((s) => s.classList.contains('on')) || steps[0];
  if (start) go(start.dataset.s);
  gate();
  // Phần tự lưu bật chế độ học lại sau khi trang đã chạy: mở lại các nút khóa bởi phần ôn và bỏ qua bước ôn.
  new MutationObserver(() => { gate(); const cur = steps.find((s) => s.classList.contains('on')); if (cur && skip(cur)) go(cur.dataset.s); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
