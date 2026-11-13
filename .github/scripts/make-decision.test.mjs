// Builds a tiny decision page and checks the data, the validation and that the page carries the kit.
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { build, rating } from '../../artifacts/decide/make-decision.mjs';

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
console.log('make-decision: ok');
