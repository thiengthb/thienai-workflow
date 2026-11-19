/* Trang ôn thẻ (artifacts/review/README.md). Dữ liệu: <script id="review"> do make-review.mjs ghi.
   Lưu theo trạng thái (không bấm lại theo thứ tự nút): mỗi thẻ giữ câu trả lời, đã xem đáp án chưa, Nhớ hay Quên,
   lời Claude chấm. Bản lưu ở máy và ở db reviews/<ngày>; apply-review.mjs đọc bản đó để sửa learning/cards.md. */
(() => {
  const $ = (id) => document.getElementById(id);
  const D = JSON.parse($('review').textContent);
  const items = D.items || [];
  const store = Kit.store(D.id, 'reviews/' + D.today);
  let S = { today: D.today, i: 0, items: {}, again: null, finished: false };
  const st = (id) => (S.items[id] = S.items[id] || { answer: '', shown: false, verdict: '', ai: '' });
  const save = (now) => store.save(S, now);

  const VOICE = 'Viết tiếng Việt tự nhiên, ngắn gọn, như người kèm học thân thiện nói chuyện trực tiếp. Gọi người học là "bạn". '
    + 'Chỉ chữ thường: không Markdown, không dấu *, không gạch đầu dòng, không tiêu đề. Không khen sáo rỗng.';

  /** Danh sách thẻ của lượt đang ôn: lượt đầu là mọi thẻ, "Ôn lại thẻ quên" chỉ còn các thẻ đã quên. */
  const queue = () => (S.again ? items.filter((x) => S.again.includes(x.id)) : items);

  function show() {
    const q = queue();
    const all = items.length, marked = items.filter((x) => (S.items[x.id] || {}).verdict).length;
    dots(S.finished || S.i >= q.length ? '' : (q[S.i] || {}).id);
    if (!all) {
      $('card').hidden = false; $('done').hidden = true;
      $('card').replaceChildren(Object.assign(document.createElement('p'), { className: 'empty', textContent: 'Hôm nay không có thẻ nào đến hạn. Hẹn lần sau.' }));
      $('cnt').textContent = '';
      return;
    }
    if (S.finished || S.i >= q.length) { finish(); return; }
    const it = q[S.i], s = st(it.id);
    $('card').hidden = false; $('done').hidden = true;
    $('cnt').textContent = `${S.again ? 'Ôn lại · ' : ''}${S.i + 1}/${q.length}`;
    $('subj').textContent = `${it.subject} · ${it.id}`;
    $('box').textContent = `Hộp ${it.box}`;
    $('q').textContent = it.question;
    $('mine').value = S.again ? '' : s.answer;
    $('mine').disabled = false;
    $('show').hidden = s.shown && !S.again;
    const open = s.shown && !S.again;
    $('reveal').hidden = !open; $('judge').hidden = !open; $('cover').hidden = open;
    $('ans').textContent = it.answer || 'Thẻ này chưa có đáp án viết sẵn. Ý chính của bài: ' + it.ref.slice(0, 420) + (it.ref.length > 420 ? '…' : '');
    $('src').textContent = it.source ? 'Từ ' + it.source : '';
    $('ai').textContent = open ? s.ai : '';
    $('grade').hidden = !!(open && s.ai);
    $('grade').disabled = !$('mine').value.trim();
    $('grade').title = $('grade').disabled ? 'Gõ câu trả lời trước để Claude chấm' : '';
    for (const b of [$('yes'), $('no')]) b.setAttribute('aria-pressed', 'false');
    if (open && s.verdict && !S.again) $(s.verdict === 'nho' ? 'yes' : 'no').setAttribute('aria-pressed', 'true');
    $('partial').textContent = '';
  }

  function current() { return queue()[S.i]; }
  /** Hàng chấm đầu trang: mỗi thẻ một chấm, đen là nhớ, viền đỏ là quên, chấm to là thẻ đang hỏi. Không lộ câu sau. */
  function dots(cur) {
    $('dots').replaceChildren(...items.map((x) => { const li = document.createElement('li'), v = (S.items[x.id] || {}).verdict;
      li.className = (v || '') + (x.id === cur ? ' cur' : ''); return li; }));
  }

  $('mine').addEventListener('input', () => {
    const it = current(); if (!it) return;
    if (!S.again) { st(it.id).answer = $('mine').value; save(); }
    $('grade').disabled = !$('mine').value.trim();
  });
  $('show').addEventListener('click', () => {
    const it = current(); if (!it) return;
    if (!S.again) { st(it.id).shown = true; save(); }
    $('show').hidden = true; $('cover').hidden = true; $('reveal').hidden = false; $('judge').hidden = false;
    $('grade').hidden = false; $('ai').textContent = '';
    $('grade').disabled = !$('mine').value.trim();
  });
  $('grade').addEventListener('click', async () => {
    const it = current(); if (!it) return;
    $('grade').disabled = true;
    const prompt = [`Đây là trang ôn thẻ (ôn cách quãng). Thẻ môn ${it.subject}: "${it.question}"`,
      it.answer ? `Đáp án mẫu: ${it.answer}` : 'Thẻ này chưa có đáp án viết sẵn.',
      it.ref ? `Đoạn bài gốc: ${it.ref}` : '',
      `Người học tự trả lời trước khi xem đáp án: "${$('mine').value.trim().slice(0, 1500)}"`, '',
      'Trong tối đa 3 câu: nói câu trả lời đã nắm được ý nào của đáp án, còn thiếu hay sai ý nào. '
      + 'Câu cuối nói thẳng nên tự chấm "Nhớ" hay "Quên": nhớ là nắm được ý chính, không cần đúng từng chữ. '
      + 'Chỉ dựa vào đáp án và đoạn bài ở trên; không thêm chi tiết, số liệu, tên hay sự kiện mới. ' + VOICE].join('\n');
    const a = await Kit.ask(prompt, $('ai'), { tier: 'quick' });
    if (a) { if (!S.again) { st(it.id).ai = a; save(); } $('grade').hidden = true; } else $('grade').disabled = false;
  });
  function judge(v) {
    const it = current(); if (!it) return;
    if (!S.again) st(it.id).verdict = v;
    else st(it.id).again = v;
    S.i++; save(S.i >= queue().length); show();
  }
  $('yes').addEventListener('click', () => judge('nho'));
  $('no').addEventListener('click', () => judge('quen'));

  function summary() {
    const lines = items.map((x) => { const s = S.items[x.id] || {}; return `${x.id} (${x.subject}): ${s.verdict === 'nho' ? 'nhớ' : s.verdict === 'quen' ? 'quên' : 'chưa ôn'}${s.again ? `, ôn lại: ${s.again === 'nho' ? 'nhớ' : 'quên'}` : ''}`; });
    return `Kết quả ôn thẻ ngày ${D.today}:\n${lines.join('\n')}\n\nCập nhật learning/cards.md: đọc db reviews/${D.today} rồi chạy node artifacts/review/apply-review.mjs learning/cards.md <bản-lưu.json>.`;
  }
  function finish() {
    S.finished = true;
    $('card').hidden = true; $('done').hidden = false;
    $('cnt').textContent = 'Xong'; dots('');
    const forgot = items.filter((x) => (S.items[x.id] || {}).verdict === 'quen').map((x) => x.id);
    const ok = items.length - forgot.length;
    $('done-title').textContent = `Xong buổi ôn: nhớ ${ok}/${items.length} thẻ`;
    $('list').replaceChildren(...items.map((x) => {
      const s = S.items[x.id] || {}, li = document.createElement('li');
      const chip = Object.assign(document.createElement('span'), { className: 'chip ' + (s.verdict === 'nho' ? 'good' : s.verdict === 'quen' ? 'bad' : ''), textContent: s.verdict === 'nho' ? 'Nhớ' : s.verdict === 'quen' ? 'Quên' : 'Chưa ôn' });
      li.append(Object.assign(document.createElement('span'), { className: 'id', textContent: x.id }), Object.assign(document.createElement('span'), { textContent: x.question }), chip);
      return li;
    }));
    $('redo').hidden = !forgot.length;
  }
  $('redo').addEventListener('click', () => {
    S.again = items.filter((x) => (S.items[x.id] || {}).verdict === 'quen').map((x) => x.id);
    S.i = 0; S.finished = false; save(); show();
  });
  // Chép và gửi: khối dùng chung của kit (Kit.sendBox, KH9). Gửi thì lưu và ghi một bản chụp trước; gửi không được thì tự chép.
  Kit.sendBox({ copy: $('copy'), send: $('send'), status: $('status'), anchor: $('done'), text: () => summary(),
    sent: 'Đã gửi cho Claude. Claude sẽ dời lịch các thẻ trong learning/cards.md.',
    save: async (st, sending) => { if (!sending) return; await save(true); await Kit.put(`reviews/${D.today}-sent`, { ...S, sentAt: new Date().toISOString() }); } });

  // Nói thay gõ (khả năng dictation, Kit.dictate): chỉ có ở Chrome và app Claude trên máy tính; nơi khác nút mic tự ẩn.
  // Đếm số lần nói vào S.spoke để biết tính năng này có thật sự được dùng (learning/usage.md).
  Kit.dictate($('mic'), $('mine'), $('partial'), () => { S.spoke = (S.spoke || 0) + 1; save(); });

  show();
  store.load().then((saved) => { if (saved && saved.today === D.today) { S = { ...S, ...saved }; show(); } });
})();
