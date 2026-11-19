/* Vòng 6, trang ôn thẻ: lắp lại trang theo bố cục ở <html data-lay="...">. Chạy sau review.js, chỉ dời khối có sẵn
   và thêm vài khối nhỏ đọc từ chính trang; bản thien chọn sẽ viết lại gọn trong artifacts/review/. */
(() => {
  const lay = document.documentElement.dataset.lay;
  if (!lay) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const D = JSON.parse($('#review').textContent), items = D.items || [];
  const main = $('main'), card = $('#card');
  // Thẻ đang hỏi đọc từ chip "Môn · F8"; Nhớ/Quên ghi lại khi bấm (bản thật đọc thẳng trạng thái S của review.js).
  const verdict = {};
  const curId = () => ($('#subj').textContent.split(' · ').pop() || '').trim();
  let onChange = () => {};
  // Tải lại giữa lượt: review.js khôi phục trạng thái từ Kit.store rồi vẽ lại; đọc cùng chỗ đó để cột bên và hàng chấm khớp.
  if (window.Kit && Kit.store) Kit.store(D.id, 'reviews/' + D.today).load().then((saved) => {
    if (!saved || saved.today !== D.today) return;
    for (const [id, x] of Object.entries(saved.items || {})) if (x && x.verdict) verdict[id] = verdict[id] || x.verdict;
    onChange();
  });
  for (const [b, v] of [['#yes', 'nho'], ['#no', 'quen']]) $(b).addEventListener('click', () => { verdict[curId()] = verdict[curId()] || v; }, true);
  // Nghe đúng các chỗ review.js đổi khi sang thẻ hay lật đáp án (không nghe cả main: khối mới ghi vào đó sẽ tự gọi lại mãi).
  const mo = new MutationObserver(() => onChange());
  mo.observe($('#cnt'), { childList: true, characterData: true, subtree: true });
  for (const id of ['#card', '#done', '#reveal']) mo.observe($(id), { attributes: true, attributeFilter: ['hidden'] });

  if (lay === 'review-b') {
    // Thẻ và hàng chờ: thẻ bên trái, cột bên phải là ba ô số và danh sách cả lượt (thẻ nào nhớ, quên, đang hỏi, chưa tới).
    main.classList.add('lay-b');
    const aside = el('aside', 'queue');
    aside.innerHTML = `<div class="q-stats"><div><span>Nhớ</span><b id="n-ok">0</b></div><div><span>Quên</span><b id="n-no">0</b></div><div><span>Còn</span><b id="n-left">${items.length}</b></div></div>
      <details class="q-list" open><summary><span class="label">Lượt này · ${items.length} thẻ</span></summary><ol>${items.map((x) =>
        `<li data-id="${esc(x.id)}"><span class="id">${esc(x.id)}</span><span class="qq">${esc(x.question)}</span><span class="chip st"></span></li>`).join('')}</ol></details>`;
    main.append(aside);
    const sum = $('summary', aside);
    onChange = () => {
      const cur = $('#card').hidden ? '' : curId();
      let ok = 0, no = 0;
      $$('li', aside).forEach((li) => {
        const v = verdict[li.dataset.id], chip = $('.st', li);
        li.classList.toggle('cur', li.dataset.id === cur);
        chip.className = 'chip st ' + (v === 'nho' ? 'good' : v === 'quen' ? 'bad' : '');
        chip.textContent = v === 'nho' ? 'Nhớ' : v === 'quen' ? 'Quên' : li.dataset.id === cur ? 'Đang hỏi' : '';
        if (v === 'nho') ok++; if (v === 'quen') no++;
      });
      $('#n-ok').textContent = ok; $('#n-no').textContent = no; $('#n-left').textContent = items.length - ok - no;
      sum.firstElementChild.textContent = `Lượt này · ${items.length} thẻ · nhớ ${ok}, quên ${no}`;
    };
    // Điện thoại: danh sách gập lại, chỉ còn một dòng tóm tắt dưới thẻ.
    const mq = matchMedia('(min-width: 760px)');
    const fold = () => { $('details', aside).open = mq.matches; };
    mq.addEventListener('change', fold); fold();
  }

  if (lay === 'review-c') {
    // Hai nửa thẻ: trái là câu hỏi và câu của mình, phải là đáp án (che tới khi bấm); Nhớ/Quên trải dưới cả hai nửa.
    // Đầu trang: mỗi thẻ một chấm thay cho thanh mảnh.
    main.classList.add('lay-c');
    const left = el('div', 'half mine-half'), right = el('div', 'half ans-half');
    left.append($('.tags', card), $('#q'), $('.mic-row', card), $('#partial'));
    const cover = el('div', 'cover', '<span class="label">Đáp án</span><p>Gõ điều bạn nhớ bên trái trước, chưa cần đúng. Rồi lật đáp án ra so từng ý.</p>');
    cover.append($('#show'));
    $('.acts', card)?.remove();   // mẫu trước vòng 6: hàng nút cũ của thẻ, rỗng sau khi dời #show
    right.append(cover, $('#reveal'));
    card.prepend(left, right);
    card.classList.add('split');
    const dots = el('ol', 'dots');
    dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = items.map((x) => `<li data-id="${esc(x.id)}" title="${esc(x.id)}"></li>`).join('');
    $('.bar').hidden = true;   // review.js vẫn ghi vào #bar trong đó
    $('.bar').after(dots);
    onChange = () => {
      cover.hidden = !$('#reveal').hidden;
      const cur = $('#card').hidden ? '' : curId();
      $$('li', dots).forEach((li) => { const v = verdict[li.dataset.id]; li.className = (v || '') + (li.dataset.id === cur ? ' cur' : ''); });
    };
  }
  onChange();
})();
