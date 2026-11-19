/* Vòng 6, trang học: lắp lại trang theo bố cục ở <html data-lay="...">. Chạy sau lesson.js và it-stage.js, chỉ dời
   khối có sẵn và thêm tuyến bước đọc từ chính trang; bản thien chọn sẽ viết lại gọn trong artifacts/lesson/. */
(() => {
  const lay = document.documentElement.dataset.lay;
  if (!lay) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const wrap = $('.wrap'), steps = $$('.step');
  wrap.classList.add(lay);

  if (lay === 'lesson-b') {
    // Tuyến bước: cột trái là các bước của buổi như tuyến ga (đã qua có dấu tick, đang làm chấm đen, chưa tới chấm rỗng).
    // Bước có sân khấu thì tuyến thu lại còn chấm, nhường chỗ cho sân khấu và chữ.
    const name = (s, i) => (i === 0 ? 'Bắt đầu' : ($('h1, h2', s)?.textContent || 'Bước ' + i).replace(/:.*$/, '').trim());
    // Khung đã có tuyến bước (lesson.js sau vòng 6) thì để nó lo; build.mjs dựng từ khung trước vòng 6 nên chưa có.
    if ($('.wrap > .rail')) return;
    const rail = el('nav', 'rail');
    rail.setAttribute('aria-label', 'Các bước của buổi');
    rail.innerHTML = '<ol>' + steps.map((s, i) => `<li data-s="${s.dataset.s}"><span class="dot"></span><span class="nm">${name(s, i)}</span></li>`).join('') + '</ol>';
    wrap.insertBefore(rail, steps[0]);
    const sync = () => {
      const at = steps.findIndex((s) => s.classList.contains('on'));
      $$('li', rail).forEach((li, i) => { li.className = i < at ? 'done' : i === at ? 'cur' : ''; li.querySelector('.nm').title = li.textContent; });
      const cur = $('li.cur', rail);
      if (cur) cur.setAttribute('aria-current', 'step');
      $$('li:not(.cur)', rail).forEach((li) => li.removeAttribute('aria-current'));
    };
    // Nghe từng bước (lesson.js bật lớp "on"), không nghe cả trang: tuyến tự đổi lớp sẽ gọi lại mãi.
    const mo = new MutationObserver(sync);
    steps.forEach((s) => mo.observe(s, { attributes: true, attributeFilter: ['class'] }));
    sync();
  }

  if (lay === 'lesson-c') {
    // Theo nội dung: mỗi bước chữ chọn khuôn theo thứ nó chứa, thay vì một cột hẹp cho mọi bước.
    //   nhiều câu hỏi → lưới hai cột; tin nhắn kèm ô viết → tin bên trái, ô viết bên phải;
    //   bước mở đầu → lời dẫn trái, danh sách việc phải; góp ý cuối buổi → các câu chia hai cột; còn lại một cột đọc rộng hơn.
    const full = (e) => e.matches('h1, h2, .next, .ai-ask, .done-msg, #copy, p.small.muted, .listen');
    const split = (s, leftTest) => {
      const l = el('div', 'col-l'), r = el('div', 'col-r');
      let toRight = false;
      for (const c of [...s.children]) {
        if (c.matches('.next, .done-msg, #copy')) { r.append(c); continue; }
        if (!toRight && !leftTest(c)) toRight = true;
        (toRight ? r : l).append(c);
      }
      s.append(l, r);
    };
    steps.forEach((s, i) => {
      if (s.dataset.stage) return;   // bước có sân khấu giữ hai cột sân khấu và chữ
      const qs = $$(':scope > .card', s).filter((c) => $('.q', c));
      if (qs.length >= 2) { s.classList.add('k-grid'); qs.forEach((c) => c.classList.add('cell')); [...s.children].forEach((c) => full(c) && c.classList.add('span')); return; }
      if ($(':scope > .say.ask-from', s) && $(':scope > textarea', s)) { s.classList.add('k-split'); split(s, (c) => c.matches('h2, .say, p')); return; }
      if (i === 0 && $(':scope > .card', s)) { s.classList.add('k-split', 'k-start'); split(s, (c) => !c.matches('.card')); return; }
      if ($$('.crit', s).length >= 3) { s.classList.add('k-crit'); return; }
      s.classList.add('k-read');
    });
  }
})();
