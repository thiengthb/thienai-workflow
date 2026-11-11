/* Starter deck runtime. No framework, no network.
   Keys: → Space PageDown next · ← PageUp back · Home End · N notes · P presenter window · T timer
   O overview · D light/dark · F fullscreen · ? help. Click right two thirds = next, left third = back.
   Markup: <section class="slide" data-title="..." data-min="1"> ... <aside class="notes">...</aside></section>
   Elements with data-step="1", "2"... appear one press at a time. data-dim on a step dims the others. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const deck = $('.deck');
  const slides = $$('.slide', deck);
  const total = slides.length;
  const presenter = new URLSearchParams(location.search).has('presenter');
  const chan = 'BroadcastChannel' in window ? new BroadcastChannel('deck-' + location.pathname) : null;
  let cur = 0, step = 0, t0 = null, tick = null;

  const stepsOf = (s) => Math.max(0, ...$$('[data-step]', s).map((e) => +e.dataset.step || 0));
  const notesOf = (s) => ($('.notes', s)?.textContent || '').replace(/^\s+|\s+$/g, '').replace(/\n[ \t]+/g, '\n');

  // Footer and progress bar on every slide unless data-bare.
  slides.forEach((s, i) => {
    if (s.dataset.bare !== undefined) return;
    const f = document.createElement('div');
    f.className = 'foot';
    f.innerHTML = `<span class="src"></span><span>${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`;
    f.querySelector('.src').textContent = s.dataset.src ? 'Nguồn: ' + s.dataset.src : '';
    s.append(f);
    const p = document.createElement('div');
    p.className = 'progress';
    p.style.width = `${((i + 1) / total) * 100}%`;
    s.append(p);
  });

  function fit() {
    const k = Math.min(innerWidth / 1600, innerHeight / 900);
    deck.style.transform = `translate(-50%, -50%) scale(${k})`;
    deck.style.transformOrigin = 'center center';
  }

  function render() {
    slides.forEach((s, i) => s.classList.toggle('on', i === cur));
    const s = slides[cur];
    $$('[data-step]', s).forEach((e) => {
      const hidden = +e.dataset.step > step;
      e.classList.toggle('hide', hidden);
      e.inert = hidden; // hidden steps are not focusable nor read by screen readers
    });
    const dimmer = $$('[data-step][data-dim]', s).filter((e) => +e.dataset.step <= step).pop();
    $$('[data-step]', s).forEach((e) => e.classList.toggle('dim', !!dimmer && e !== dimmer && +e.dataset.step <= step));
    $('.notes-bar').textContent = notesOf(s);
    history.replaceState(null, '', `#${cur + 1}${step ? '.' + step : ''}`);
    document.title = `${cur + 1}/${total} · ${s.dataset.title || ''}`;
    s.dispatchEvent(new CustomEvent('enter', { detail: { step } }));
    if (presenter) renderPresenter();
  }

  function go(i, st = 0, from) {
    cur = Math.max(0, Math.min(total - 1, i));
    step = st === 'end' ? stepsOf(slides[cur]) : st;
    render();
    if (chan && !from) chan.postMessage({ cur, step });
  }
  const next = () => (step < stepsOf(slides[cur]) ? go(cur, step + 1) : cur < total - 1 && go(cur + 1, 0));
  const prev = () => (step > 0 ? go(cur, step - 1) : cur > 0 && go(cur - 1, 'end'));

  // Timer (T): shown in the presenter window and in the title of the notes strip.
  function toggleTimer() {
    if (t0) { t0 = null; clearInterval(tick); } else { t0 = Date.now(); tick = setInterval(() => presenter && renderPresenter(), 1000); }
    if (chan) chan.postMessage({ timer: t0 });
  }
  const clock = () => {
    if (!t0) return '00:00';
    const s = Math.floor((Date.now() - t0) / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  // Presenter window (P): notes large, next slide title, clock, planned minutes.
  function renderPresenter() {
    const s = slides[cur], n = slides[cur + 1];
    const planned = slides.slice(0, cur + 1).reduce((a, x) => a + (+x.dataset.min || 0), 0);
    $('#pv').innerHTML = `<div class="pv-top"><b>${cur + 1}/${total}</b> ${esc(s.dataset.title || '')}
      <span>bước ${step}/${stepsOf(s)}</span><span class="pv-clock">${clock()}</span>
      <span>kế hoạch tới hết slide này: ${planned ? planned.toFixed(1) + ' phút' : 'chưa đặt data-min'}</span></div>
      <pre class="pv-notes">${esc(notesOf(s)) || '(chưa có ghi chú)'}</pre>
      <div class="pv-next">Tiếp: ${n ? esc(n.dataset.title || '') : 'hết bài'}</div>`;
  }
  const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  if (presenter) {
    document.body.insertAdjacentHTML('beforeend', `<div id="pv"></div><style>
      .deck{display:none} #pv{position:fixed;inset:0;background:#0D0F13;color:#E8EAEE;font-family:var(--font);padding:28px 36px;display:flex;flex-direction:column;gap:18px}
      .pv-top{display:flex;gap:28px;font-size:20px;color:#A9AFBA;align-items:baseline} .pv-top b{color:#fff;font-size:26px}
      .pv-clock{font:600 40px var(--mono);color:#fff;margin-left:auto} .pv-notes{flex:1;overflow:auto;white-space:pre-wrap;font:30px/1.6 var(--font)}
      .pv-next{font-size:22px;color:#A9AFBA;border-top:1px solid #2C313A;padding-top:14px}</style>`);
  }

  // Overview (O)
  function overview() {
    const o = $('.overview');
    if (o.classList.toggle('on')) {
      o.innerHTML = '';
      slides.forEach((s, i) => {
        const b = document.createElement('button');
        const th = document.createElement('div');
        th.className = 'thumb' + (i === cur ? ' cur' : '');
        const c = s.cloneNode(true);
        c.classList.add('on');
        $$('[data-step]', c).forEach((e) => e.classList.remove('hide', 'dim'));
        const wrap = document.createElement('div');
        wrap.append(c);
        th.append(wrap);
        b.append(th, document.createTextNode(`${i + 1}. ${s.dataset.title || ''}`));
        b.onclick = () => { o.classList.remove('on'); go(i); };
        o.append(b);
        requestAnimationFrame(() => (wrap.style.transform = `scale(${th.clientWidth / 1600})`));
      });
    }
  }

  document.body.insertAdjacentHTML('beforeend', `<div class="notes-bar"></div><div class="overview"></div>
    <div class="help"><kbd>→</kbd>tiếp <kbd>←</kbd>lùi <kbd>N</kbd>ghi chú <kbd>P</kbd>cửa sổ người nói<br>
    <kbd>T</kbd>đồng hồ <kbd>O</kbd>tổng quan <kbd>D</kbd>sáng/tối <kbd>F</kbd>toàn màn hình <kbd>Ctrl P</kbd>PDF</div>`);

  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    const onControl = e.target.closest?.('button, a, input, textarea, select');
    if ((k === ' ' || k === 'Enter') && onControl) return; // let a focused control (overview) activate
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(total - 1);
    else if (k === 'n' || k === 'N') $('.notes-bar').classList.toggle('on');
    else if (k === 'p' || k === 'P') open(location.pathname + '?presenter' + location.hash, 'presenter', 'width=1100,height=760');
    else if (k === 't' || k === 'T') toggleTimer();
    else if (k === 'o' || k === 'O') overview();
    else if (k === 'd' || k === 'D') document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    else if (k === 'f' || k === 'F') (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
    else if (k === '?') $('.help').classList.toggle('on');
    else if (k === 'Escape') ['.overview', '.help', '.notes-bar'].forEach((s) => $(s).classList.remove('on'));
  });
  deck.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input')) return;
    (e.clientX > innerWidth / 3 ? next : prev)();
  });
  if (chan) chan.onmessage = ({ data }) => {
    // A presenter window that just opened asks for the current slide and timer.
    if (data.hello) { if (!presenter) chan.postMessage({ cur, step, timer: t0 }); return; }
    if ('timer' in data) { t0 = data.timer; clearInterval(tick); if (t0) tick = setInterval(() => presenter && renderPresenter(), 1000); }
    if ('cur' in data) go(data.cur, data.step, 'remote');
  };
  addEventListener('resize', fit);

  const [h, hs] = location.hash.slice(1).split('.');
  fit();
  go((+h || 1) - 1, +hs || 0, 'init'); // loading a window never moves the other one
  if (presenter && chan) chan.postMessage({ hello: 1 });
  window.deckApi = { go, total, slides, stepsOf, notesOf }; // used by check.mjs
})();
