// Kiểm lưới 2×2 của bảng dán (artifacts/it/it.css): tên trục nằm trong lề riêng ngoài các ô, nên không đè ô nào
// và không đè thẻ, kể cả khi dồn mọi thẻ vào ô sát cả hai trục (lỗi thien chê sau BA 3, 2026-11-16). Lưới không có
// trục thì không chừa lề. Dựng từ template-ba.html như check-pages. Cần trình duyệt: CI chạy file này trong job "pages".
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { fill, SAMPLE_CARDS } from '../../artifacts/lesson/make-lesson.mjs';

const tpl = fileURLToPath(new URL('../../artifacts/it/template-ba.html', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'grid2-'));
const build = (name, edit = (h) => h) => {
  const html = edit(readFileSync(tpl, 'utf8')).replace(/__ID__/g, 'demo-ba').replace(/__[A-Z][A-Z0-9_]*__/g, 'Trang mẫu');
  const f = join(dir, name); writeFileSync(f, fill(html, 'demo-ba', join(dirname(tpl), 'fixture.html'), { cards: SAMPLE_CARDS })); return f;
};
const withAxes = build('axes.html');
const noAxes = build('plain.html', (h) => h.replace(/<span class="axis [xy]">[^<]*<\/span>/g, ''));

// Đo trong trang: hộp của từng trục so với mọi ô, mọi thẻ đang hiện và khung bảng.
const measure = () => {
  const r = (e) => e.getBoundingClientRect();
  const hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const bd = document.querySelector('[data-pane="who"]'), grid = bd.querySelector('.zones.grid2'), B = r(bd);
  return {
    axes: [...bd.querySelectorAll('.axis')].map((ax) => { const A = r(ax); return {
      name: ax.className, w: A.width, h: A.height,
      zones: [...bd.querySelectorAll('.zone')].filter((z) => hit(A, r(z))).map((z) => z.dataset.z),
      cards: [...bd.querySelectorAll('.bd-card')].filter((c) => c.offsetParent && hit(A, r(c))).map((c) => c.dataset.c),
      inside: A.left >= B.left - 0.5 && A.right <= B.right + 0.5 && A.top >= B.top - 0.5 && A.bottom <= B.bottom + 0.5,
    }; }),
    gutter: { left: r(grid).left - r(bd.querySelector('.bd-area')).left, ml: getComputedStyle(grid).marginLeft, mb: getComputedStyle(grid).marginBottom },
  };
};

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const errors = [];
const open = async (file, vp) => {
  const p = await browser.newPage({ viewport: vp });
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(pathToFileURL(file).href); await p.waitForTimeout(200);
  await p.evaluate(() => Lesson.go(3)); await p.waitForTimeout(200);   // bước 3: bảng "who" cho xếp thẻ
  return p;
};
const put = async (p, place) => {
  for (const [c, z] of Object.entries(place)) {
    // Bấm bằng click() của phần tử: ô đầy thẻ thì giữa ô bị thẻ che, mà ở đây chỉ cần thẻ vào đúng ô để đo.
    await p.$eval(`[data-pane="who"] .bd-card[data-c="${c}"]`, (e) => e.click());
    await p.$eval(`[data-pane="who"] .zone[data-z="${z}"]`, (e) => e.click());
  }
  await p.waitForTimeout(600);   // thẻ trượt tới chỗ (transition .35s), ô điện thoại tự cao thêm
};
const visible = ['pdt', 'gv', 'sv', 'ph', 'it', 'bgh'];
const plans = {
  'mỗi ô vài thẻ': { it: 'z1', bgh: 'z1', gv: 'z3', sv: 'z4', ph: 'z4', pdt: 'z2' },
  'dồn hết vào ô góc dưới trái (sát cả hai trục)': Object.fromEntries(visible.map((c) => [c, 'z3'])),
};
for (const vp of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 800 }]) {
  for (const [label, place] of Object.entries(plans)) {
    const p = await open(withAxes, vp);
    await put(p, place);
    // Thẻ phải nằm đúng ô đã xếp, nếu không ca "dồn hết vào ô góc" không còn là ca khó.
    const where = await p.evaluate(() => {
      const r = (e) => e.getBoundingClientRect(), bd = document.querySelector('[data-pane="who"]');
      return Object.fromEntries([...bd.querySelectorAll('.bd-card')].filter((c) => c.offsetParent).map((c) => {
        const C = r(c), z = [...bd.querySelectorAll('.zone')].find((z) => { const Z = r(z); return C.left >= Z.left - 0.5 && C.right <= Z.right + 0.5 && C.top >= Z.top - 0.5 && C.bottom <= Z.bottom + 0.5; });
        return [c.dataset.c, z?.dataset.z];
      }));
    });
    assert.deepEqual(where, place, `${vp.width}px, ${label}: thẻ nằm đúng ô đã xếp`);
    const m = await p.evaluate(measure);
    assert.equal(m.axes.length, 2, 'trang mẫu có hai trục');
    for (const ax of m.axes) {
      const at = `${vp.width}px, ${label}, ${ax.name}`;
      assert.deepEqual(ax.zones, [], `${at}: tên trục không nằm trong ô nào`);
      assert.deepEqual(ax.cards, [], `${at}: tên trục không đè thẻ`);
      assert.ok(ax.inside, `${at}: tên trục nằm trong khung bảng, không bị cắt`);
      assert.ok(ax.w > 4 && ax.h > 4, `${at}: tên trục có hiện`);
    }
    await p.close();
  }
}
// Lưới không trục: dùng hết bề ngang, không chừa lề.
const p = await open(noAxes, { width: 1280, height: 800 });
const m = await p.evaluate(measure);
assert.equal(m.axes.length, 0);
assert.equal(m.gutter.ml, '0px', 'không trục thì không chừa lề trái');
assert.equal(m.gutter.mb, '0px', 'không trục thì không chừa lề dưới');
await p.close();
await browser.close();
assert.deepEqual(errors, [], 'không lỗi khi dựng và xếp thẻ');
console.log('grid2-axis: ok');
