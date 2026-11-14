/* Nối sa bàn với khung buổi học (artifacts/lesson/lesson.js). Chạy sau lesson.js, trước phần tự lưu, để mọi nút có sẵn lúc tải trang.
   Trong trang (xem artifacts/war/README.md):
   - <script type="application/json" id="battle">: dữ liệu trận (make-lesson chép từ learning/war/battles/<trận>.json theo data-src).
   - <div id="board"></div>: chỗ đặt sa bàn, một lần cho cả trang.
   - Mỗi bước: data-board="real" (xem track đó), "real@0" (khóa ở mốc 0, chưa cho kéo thời gian), không ghi thì ẩn sa bàn.
   - <button data-track="A">: chuyển sa bàn sang track A.
   - <div class="choose" data-c="d1" data-real="C"> với các <button class="opt" data-v="A">, nút xem trước <button data-plan="A">.
     Chọn xong: R.choices.d1, Lesson.done('d1'), chữ vào [data-echo="d1"] (data-same / data-diff trên .choose).
   - Xem tới mốc cuối của track X: R.seen.X = true, Lesson.done('seen-X'). */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const data = $('#battle'), board = $('#board');
  if (!data || !board || !window.Sandtable) return;
  let battle;
  try { battle = JSON.parse(data.textContent); } catch (e) { board.textContent = 'Chưa có dữ liệu trận: chạy make-lesson.mjs để chép vào.'; return; }
  if (!battle.terrain) { board.textContent = 'Dữ liệu trận chưa có địa hình: chạy artifacts/war/fetch-terrain.mjs.'; return; }
  const R = window.R || (window.R = {});
  R.choices = R.choices || {}; R.seen = R.seen || {}; R.viewed = R.viewed || [];
  const done = (k) => window.Lesson && Lesson.done(k);
  if (window.Lesson && Lesson.extras) Lesson.extras.push((r) => {
    const L = Object.entries(r.choices || {}).map(([k, c]) => `Chọn nước đi (${k}): ${c.pick}, chuyện thật là ${c.real}${c.same ? ' (giống)' : ''}`);
    if (r.previewed && r.previewed.length) L.push('Đã bấm xem trước: ' + r.previewed.join(', '));
    const seen = Object.keys(r.seen || {}); if (seen.length) L.push('Đã xem hết: ' + seen.join(', '));
    if ((r.notice || '').trim()) L.push('Tự để ý trên sa bàn: ' + r.notice.trim());
    return L.join('\n');
  });

  const st = window.Board = Sandtable.mount(board, battle, {
    onKey(track, i, last) {
      const tag = track + ':' + i; if (!R.viewed.includes(tag)) R.viewed.push(tag);
      if (last) { R.seen[track] = true; done('seen-' + track); }
      $$('[data-track]').forEach((bt) => bt.setAttribute('aria-pressed', String(bt.dataset.track === track)));
    },
  });

  // Bước đang mở quyết định sa bàn hiện gì. lesson.js chuyển bước bằng class "on".
  const steps = $$('.step');
  let last = null;
  function sync() {
    const cur = steps.find((s) => s.classList.contains('on'));
    if (!cur || cur === last) return;
    last = cur;
    const spec = cur.dataset.board || '';
    document.documentElement.dataset.board = spec ? 'on' : 'off';
    if (!spec) return;
    const [track, lock] = spec.split('@');
    st.show(track, lock == null ? { at: 0 } : { at: +lock, upto: +lock });
  }
  new MutationObserver(sync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  // Đồng bộ ngay sau mỗi lần bấm (kể cả lúc phần tự lưu bấm lại liên tục), không đợi MutationObserver: nút mốc phải mở khóa trước lần bấm kế.
  document.addEventListener('click', sync);
  sync();

  // Điện thoại: sa bàn nằm trên các bước, bấm xem thì cuộn lên cho thấy.
  const reveal = () => { if (window.innerWidth < 900) board.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  $$('[data-track]').forEach((bt) => bt.addEventListener('click', () => { st.show(bt.dataset.track, { at: 0 }); reveal(); }));

  // Nghe mốc đang xem (khả năng tts, đề xuất N2): nút loa ở mỗi bước có sa bàn, đọc chữ của mốc đang hiện (kể cả nguồn).
  if (window.Kit && Kit.listen) steps.filter((s) => s.dataset.board).forEach((step) => {
    const h = step.querySelector('h1, h2'), b = document.createElement('button');
    b.type = 'button'; b.textContent = 'Nghe mốc đang xem';
    (h || step.firstElementChild).after(b);
    Kit.listen(b, () => ($('.st-cap', board) || {}).textContent || '', () => { R.listened = (R.listened || 0) + 1; });
  });

  // Claude làm mẫu (lesson.js, Lesson.demo): dẫn người học qua các mốc trên sa bàn, mỗi mốc một câu vì sao xem mốc đó.
  // Chỉ được dùng chữ của các mốc (đã có nguồn), không thêm chi tiết lịch sử mới (luật 10 trong profile/TUTOR.md).
  // Bước khóa ở một mốc (data-board="real@0") thì không có làm mẫu, vì bước đó chưa cho xem tiếp.
  const keyAt = (t, i) => { const k = battle.tracks[t].keys[i]; if (k.same && !k.text) { const [t2, j] = k.same.split(':'); return { ...battle.tracks[t2].keys[+j], ...k, text: battle.tracks[t2].keys[+j].text, src: battle.tracks[t2].keys[+j].src }; } return k; };
  const trackName = (t) => battle.tracks[t].label || (t === 'real' ? 'Chuyện thật' : t);
  if (window.Lesson && Lesson.demo) Lesson.demo({ match(step) {
    const spec = step.dataset.board || '';
    if (!spec || spec.includes('@')) return null;
    const ts = Object.keys(battle.tracks);
    return {
      context() {
        // Luật và lựa chọn của người học đứng trước danh sách mốc (dài), để không bị cắt mất khi lời dặn quá dài.
        return ['Sân khấu: sa bàn 3D của trận đánh; mỗi "track" là một diễn biến (chuyện thật, hay mô phỏng nếu chọn khác), mỗi mốc là một thời điểm.',
          'Luật: chỉ dùng chữ của các mốc dưới đây (đã có nguồn), không thêm chi tiết lịch sử nào khác. Mốc mô phỏng thì nói rõ là mô phỏng.',
          'Người học đã chọn: ' + (Object.entries(R.choices || {}).map(([k, c]) => `${k}: ${c.pick} (chuyện thật là ${c.real})`).join('; ') || 'chưa chọn'),
          'Các mốc (track:số thứ tự từ 0, ngày, tên, chữ, nguồn): ' + ts.map((t) => `[${t} = ${trackName(t)}${battle.tracks[t].tag === 'sim' ? ', mô phỏng' : ''}] `
            + battle.tracks[t].keys.map((_, i) => { const k = keyAt(t, i); return `${t}:${i} ${k.date || ''} ${k.title || ''}: ${k.text || ''}${k.src ? ' (nguồn: ' + k.src + ')' : ''}`; }).join(' / ')).join(' || ')].join('\n');
      },
      tools: [{ name: 'show_moment', description: 'Đưa sa bàn tới một mốc của một track. Người học thấy quân, đường đánh và chữ của mốc đó.',
        inputSchema: { type: 'object', required: ['track', 'index', 'why'], properties: {
          track: { type: 'string', enum: ts }, index: { type: 'integer', minimum: 0 },
          why: { type: 'string', description: 'một câu ngắn: vì sao xem mốc này, nhìn vào đâu trên sa bàn' } } },
        execute({ track, index }) {
          const t = battle.tracks[track];
          if (!t || !Number.isInteger(index) || index < 0 || index >= t.keys.length) throw new Error(`Không có mốc ${track}:${index}. Các track: ` + ts.map((x) => `${x} (0 đến ${battle.tracks[x].keys.length - 1})`).join(', '));
          st.show(track, { at: index }); reveal();
          const k = keyAt(track, index);
          return { did: `${trackName(track)} · ${k.date || 'mốc ' + (index + 1)}${k.title ? ': ' + k.title : ''}.`, result: 'Đang hiện mốc ' + track + ':' + index };
        } }],
      save() { return { track: st.track, at: st.at }; },
      restore(s) { if (s) st.show(s.track, { at: s.at }); },
    };
  } });

  // Chọn nước đi: chưa có đúng sai, chỉ có "bạn chọn" và "chuyện thật".
  $$('.choose[data-c]').forEach((box) => {
    const id = box.dataset.c, real = box.dataset.real, opts = $$('.opt[data-v]', box);
    $$('[data-plan]', box).forEach((bt) => bt.addEventListener('click', () => {
      const t = bt.dataset.plan, n = (battle.tracks[t] || {}).preview ?? 1;
      st.show(t, { at: n, upto: n });
      $$('[data-plan]', box).forEach((x) => x.setAttribute('aria-pressed', String(x === bt)));
      R.previewed = [...new Set([...(R.previewed || []), t])];
      reveal();
    }));
    opts.forEach((o) => o.addEventListener('click', () => {
      if (R.choices[id]) return;
      const v = o.dataset.v, same = v === real;
      R.choices[id] = { pick: v, real, same };
      opts.forEach((x) => { x.disabled = true; x.classList.toggle('picked', x === o); x.classList.toggle('real', x.dataset.v === real); });
      $$('[data-plan]', box).forEach((x) => { x.disabled = true; });
      $$(`[data-echo="${id}"]`).forEach((e) => { e.textContent = `Bạn chọn ${v}. ` + (same ? box.dataset.same || '' : box.dataset.diff || ''); e.classList.add(same ? 'good' : 'note'); });
      done(id);
    }));
  });
})();
