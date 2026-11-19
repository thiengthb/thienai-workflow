// Builds a tiny decision page and checks the data, the validation and that the page carries the kit.
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename, relative } from 'node:path';
import { deflateSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { build, rating, shootOptions } from '../../artifacts/decide/make-decision.mjs';

function png(w, h) {
  const crc = (b) => { let c = ~0; for (const x of b) { c ^= x; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.alloc((w * 3 + 1) * h))), chunk('IEND', Buffer.alloc(0))]);
}

assert.deepEqual(rating('tốt'), { text: 'tốt', tone: 'good' });
assert.deepEqual(rating('Kém'), { text: 'Kém', tone: 'bad' });
assert.deepEqual(rating('vừa'), { text: 'vừa', tone: '' });
assert.deepEqual(rating({ text: 'thấp', tone: 'good' }), { text: 'thấp', tone: 'good' });
assert.deepEqual(rating({ text: 'x', tone: 'red' }), { text: 'x', tone: '' }, 'unknown tone is neutral');

const dir = mkdtempSync(join(tmpdir(), 'decide-'));
writeFileSync(join(dir, 'a.png'), png(80, 60));
const spec = { id: 'd1', question: 'Chọn gì </script>?', options: [
  { key: 'A', name: 'A · Một', image: 'a.png', scale: 2, pros: ['nhanh'], cons: ['xấu'] },
  { key: 'b', name: 'B · Hai' }],
  criteria: [{ name: 'Tốc độ', values: { a: 'tốt', b: 'kém' } }], recommend: { key: 'b', why: 'vì vậy' } };
const out = join(dir, 'out');
const { decision, files } = build(spec, dir, out);
assert.deepEqual(decision.options.map((o) => [o.key, o.short]), [['a', 'A'], ['b', 'B']]);
assert.deepEqual(decision.options[0].image, { src: 'img/a.png', w: 40, h: 30 });
assert.equal(decision.options[1].image, null);
assert.deepEqual(decision.criteria[0].values.b, { text: 'kém', tone: 'bad' });
assert.deepEqual(Object.keys(files), ['img/a.png']);
const html = readFileSync(join(out, 'index.html'), 'utf8');
for (const mark of ['/*KIT_CSS*/', '/*KIT_JS*/', '/*DECIDE_JS*/', '__DECISION__', '__TITLE__']) assert.ok(!html.includes(mark), `${mark} replaced`);
assert.ok(html.includes('window.Kit') && html.includes('decisions/'));
assert.ok(!/<doctype|<html/i.test(html.slice(0, 200)), 'artifact page has no skeleton');
assert.ok(!html.includes('</script>?'), 'question is escaped');
assert.ok(existsSync(join(out, 'preview.html')));

const bad = (s, re) => assert.throws(() => build({ ...spec, ...s }, dir, join(dir, 'o2')), re);
bad({ options: [spec.options[0]] }, /2 đến 4/);
bad({ options: [spec.options[0], { key: 'a ', name: 'x' }] }, /trùng/);
bad({ recommend: { key: 'z' } }, /Đề xuất/);
bad({ criteria: [{ name: 't', values: { z: 'tốt' } }] }, /không có/);
// Real examples for the "far" option of a taste round: https only, note kept.
const withLinks = build({ ...spec, options: [spec.options[0], { key: 'b', name: 'B', links: [{ text: 'R2D3', url: 'https://r2d3.us/', note: 'để ý' }] }] }, dir, join(dir, 'o3'));
assert.deepEqual(withLinks.decision.options[1].links, [{ text: 'R2D3', url: 'https://r2d3.us/', note: 'để ý' }]);
assert.deepEqual(withLinks.decision.options[0].links, []);
bad({ options: [spec.options[0], { key: 'b', name: 'B', links: [{ text: 'x', url: 'javascript:alert(1)' }] }] }, /https/);
bad({ options: [spec.options[0], { key: 'b', name: 'B', links: [{ text: 'x', url: 'https://[' }] }] }, /https/);
// Options given as a link or html file get screenshotted @2x into <out>/src and then built like any image.
writeFileSync(join(dir, 'b.html'), '<p>b</p>');
const shotSpec = { id: 's', question: 'q', shotSize: '600x400', options: [{ key: 'a', name: 'A', shot: 'https://example.com/a' }, { key: 'b', name: 'B', shot: 'b.html' }, { key: 'c', name: 'C', image: 'a.png' }] };
let asked;
await shootOptions(shotSpec, dir, join(dir, 'outs'), async (sizes, shotsFor) => { asked = { sizes, shots: shotsFor() }; for (const s of asked.shots) writeFileSync(s.path, png(1200, 800)); });
assert.deepEqual(asked.sizes, [[600, 400]]);
assert.deepEqual(asked.shots.map((s) => s.url.replace(/^file:\/\/.*\//, 'file:')), ['https://example.com/a', 'file:b.html'], 'only options without an image are shot');
const shotBuilt = build(shotSpec, dir, join(dir, 'outs'));
assert.deepEqual(shotBuilt.decision.options[0].image, { src: 'img/a.png', w: 600, h: 400 }, '@2x shot halves to CSS size');
await assert.rejects(shootOptions({ options: [{ key: 'x', shot: 'nope.html' }] }, dir, join(dir, 'o2'), async () => {}), /Không có trang/);
// Several questions on one page (KH9 ga 3): each part has its own options, criteria, recommendation; images get the part as prefix.
const multi = build({ id: 'm', question: 'Bố cục nào?', parts: [
  { key: 'P1', name: 'Chờ duyệt', question: 'Kế hoạch chờ duyệt?', options: [{ key: 'a', name: 'A', image: 'a.png' }, { key: 'b', name: 'B' }], recommend: { key: 'a', why: 'x' } },
  { key: 'p2', question: 'Đang chạy?', options: [{ key: 'a', name: 'A', image: 'a.png' }, { key: 'c', name: 'C' }], criteria: [{ name: 't', values: { c: 'tốt' } }] }] }, dir, join(dir, 'om'));
assert.deepEqual(multi.decision.parts.map((p) => [p.key, p.name, p.options.map((o) => o.key)]), [['p1', 'Chờ duyệt', ['a', 'b']], ['p2', 'Đang chạy?', ['a', 'c']]]);
assert.deepEqual(Object.keys(multi.files), ['img/p1/a.png', 'img/p2/a.png'], 'same option key in two parts does not collide');
// part "a-b" with option "c" and part "a" with option "b-c" must not share a file (one folder per part)
const clash = build({ id: 'c', question: 'q', parts: [
  { key: 'a-b', question: 'q', options: [{ key: 'c', image: 'a.png' }, { key: 'd' }] },
  { key: 'a', question: 'q', options: [{ key: 'b-c', image: 'a.png' }, { key: 'd' }] }] }, dir, join(dir, 'oc'));
assert.deepEqual(Object.keys(clash.files), ['img/a-b/c.png', 'img/a/b-c.png']);
assert.equal(multi.decision.options, undefined, 'a multi page keeps options inside parts');
assert.deepEqual(multi.decision.parts[1].recommend, null);
const mbad = (parts, re) => assert.throws(() => build({ id: 'm', question: 'q', parts }, dir, join(dir, 'om2')), re);
const two = [{ key: 'x', question: 'q', options: [{ key: 'a' }, { key: 'b' }] }];
mbad(two, /2 đến 6 câu/);
mbad([two[0], { ...two[0] }], /Khóa câu/);
mbad([two[0], { key: 'y', question: 'q', options: [{ key: 'a' }] }], /Câu 2 \(y\): Cần 2 đến 4/);
mbad([two[0], { key: 'y', question: 'q', options: two[0].options, recommend: { key: 'z' } }], /Câu 2.*Đề xuất/);
const mshot = { id: 'ms', question: 'q', parts: [{ key: 'p', question: 'q', options: [{ key: 'a', shot: 'b.html' }, { key: 'b', image: 'a.png' }] }, { key: 'r', question: 'q', options: [{ key: 'a', shot: 'b.html' }, { key: 'b', image: 'a.png' }] }] };
let mpaths;
await shootOptions(mshot, dir, join(dir, 'oms'), async (sizes, shotsFor) => { mpaths = shotsFor().map((s) => relative(join(dir, 'oms', 'src'), s.path).split('\\').join('/')); for (const s of shotsFor()) writeFileSync(s.path, png(100, 100)); });
assert.deepEqual(mpaths, ['p/a@2x.png', 'r/a@2x.png']);
console.log('make-decision: ok');
