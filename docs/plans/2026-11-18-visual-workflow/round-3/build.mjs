// Dựng 3 bản của trang mẫu vòng gu 3 (a, b, c) vào out/ (không vào git), rồi shoot.mjs chụp.
//   node docs/plans/2026-11-18-visual-workflow/round-3/build.mjs [out]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packHtml } from '../../../../artifacts/kit/pack.mjs';
const dir = dirname(fileURLToPath(import.meta.url)), kit = join(dir, '../../../../artifacts/kit');
const out = resolve(process.argv[2] || join(dir, 'shots/pages'));
mkdirSync(out, { recursive: true });
const rd = (p) => readFileSync(p, 'utf8');
const base = rd(join(dir, 'sample.html'))
  .replace('/*KIT_CSS*/', () => rd(join(kit, 'kit.css'))).replace('/*VARIANT_CSS*/', () => rd(join(dir, 'variants.css')))
  .replace('/*KIT_JS*/', () => rd(join(kit, 'kit.js'))).replace('/*DAGRE_JS*/', () => rd(join(kit, 'vendor/dagre.min.js')))
  .replace('/*DIAGRAM_JS*/', () => rd(join(kit, 'diagram.js')));
for (const v of ['a', 'b', 'c']) writeFileSync(join(out, `${v}.html`), packHtml(base.replaceAll('__VARIANT__', v)));
// Bản bấm được trên điện thoại: một trang, nút đổi A, B, C và Sáng, Tối ở đầu trang (mọi luật của variants.css đều theo data-variant).
const live = `<div class="live-bar"><div class="seg" role="group" aria-label="Bản" id="lv">${['a', 'b', 'c'].map((v) => `<button type="button" data-v="${v}" aria-pressed="${v === 'a'}">${{ a: 'A · Thêm mực cam', b: 'B · Giấy kỹ thuật', c: 'C · Bản vẽ MLN' }[v]}</button>`).join('')}</div>
<div class="seg" role="group" aria-label="Chế độ màu" id="lt"><button type="button" data-t="" aria-pressed="true">Theo máy</button><button type="button" data-t="light" aria-pressed="false">Sáng</button><button type="button" data-t="dark" aria-pressed="false">Tối</button></div></div>
<style>.live-bar{max-width:880px;margin:0 auto;padding:14px 18px 0;display:flex;flex-wrap:wrap;gap:8px}.live-bar .seg{flex-wrap:wrap;max-width:100%}</style>
<script>(function(){const h=document.documentElement;const pick=(id,attr,set)=>{const g=document.getElementById(id);g.addEventListener('click',(e)=>{const b=e.target.closest('button');if(!b)return;set(b.dataset[attr]);g.querySelectorAll('button').forEach((x)=>x.setAttribute('aria-pressed',String(x===b)));});};
pick('lv','v',(v)=>{h.dataset.variant=v;});pick('lt','t',(t)=>{if(t)h.dataset.theme=t;else delete h.dataset.theme;});})();</script>`;
writeFileSync(join(out, 'live.html'), packHtml(base.replaceAll('__VARIANT__', 'a').replace('<main>', () => live + '\n<main>')));
console.log(`Đã dựng a.html, b.html, c.html, live.html vào ${out}`);
