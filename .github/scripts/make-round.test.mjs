// Builds a tiny round from two generated PNGs and checks the page carries the kit and the round data.
import { mkdtempSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { build, imageSize } from '../../artifacts/compare/make-round.mjs';

function png(w, h) {
  const crc = (b) => { let c = ~0; for (const x of b) { c ^= x; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const dir = mkdtempSync(join(tmpdir(), 'round-'));
writeFileSync(join(dir, 'a.png'), png(40, 30));
writeFileSync(join(dir, 'b.png'), png(80, 60));
assert.deepEqual(imageSize(readFileSync(join(dir, 'b.png'))), { w: 80, h: 60 });
const out = join(dir, 'out');
const { round, files } = build({ id: 'r1', title: 'Thử </script>', items: [{ id: 'Home 1440', label: 'Trang chủ', sides: [
  { key: 'old', name: 'Cũ', file: 'a.png' }, { key: 'new', name: 'Mới', file: 'b.png', scale: 2 }] }] }, dir, out);
assert.equal(round.items[0].id, 'home-1440');
assert.deepEqual(round.items[0].sides.map((s) => [s.w, s.h]), [[40, 30], [40, 30]]);
assert.equal(Object.keys(files).length, 2);
const html = readFileSync(join(out, 'index.html'), 'utf8');
for (const mark of ['/*KIT_CSS*/', '/*KIT_JS*/', '/*COMPARE_JS*/', '__ROUND__', '__TITLE__']) assert.ok(!html.includes(mark), `${mark} replaced`);
assert.ok(html.includes('window.Kit') && html.includes('customAnchors'));
assert.ok(!/<doctype|<html/i.test(html.slice(0, 200)), 'artifact page has no skeleton');
assert.ok(!html.includes('Thử </script>'), 'title and data are escaped');
assert.ok(existsSync(join(out, 'preview.html')));
console.log('make-round: ok');

// Two ids that become the same after normalising must not overwrite each other's image.
assert.throws(() => build({ id: 'r2', title: 't', items: [
  { id: 'Home 1440', label: 'a', sides: [{ key: 'old', name: 'Cũ', file: 'a.png' }] },
  { id: 'home-1440', label: 'b', sides: [{ key: 'old', name: 'Cũ', file: 'b.png' }] }] }, dir, join(dir, 'out2')), /trùng/);
console.log('make-round: duplicate ids rejected');

// Folder mode: images named <screen>-<width>__<side>@2x.png need no round.json; publish.json carries the Artifact params.
import { specFromDir, CAPABILITIES } from '../../artifacts/compare/make-round.mjs';
import { writePublish } from '../../artifacts/kit/publish.mjs';
const shots = join(dir, 'shots-in');
mkdirSync(shots, { recursive: true });
writeFileSync(join(shots, 'history-1180__new@2x.png'), png(80, 60));
writeFileSync(join(shots, 'history-1180__old@2x.png'), png(80, 60));
writeFileSync(join(shots, 'history-390__a.png'), png(20, 40));
writeFileSync(join(shots, 'history-390__old.png'), png(20, 40));
writeFileSync(join(shots, 'notes.txt'), 'not an image');
const spec = specFromDir(shots, { title: 'Thư mục' });
assert.equal(spec.title, 'Thư mục');
assert.equal(spec.items.length, 2);
const wide = spec.items.find((i) => i.id === 'history-1180'), phone = spec.items.find((i) => i.id === 'history-390');
assert.deepEqual(wide.sides.map((s) => [s.key, s.name, s.scale]), [['old', 'Cũ', 2], ['new', 'Mới', 2]], 'old first, new last, @2x read');
assert.deepEqual(phone.sides.map((s) => s.name), ['Cũ', 'Phác A']);
assert.match(phone.group, /Điện thoại/);
const out3 = join(dir, 'out3');
const built = build(spec, shots, out3);
assert.deepEqual(built.round.items.find((i) => i.id === 'history-1180').sides[0].w, 40, '@2x halves the CSS width');
writePublish(out3, { files: built.files, capabilities: CAPABILITIES, icon: 'compare', description: spec.title });
const pub = JSON.parse(readFileSync(join(out3, 'publish.json'), 'utf8'));
assert.equal(pub.file_path, join(out3, 'index.html'));
assert.equal(Object.keys(pub.files).length, 4);
assert.ok(pub.capabilities.comments.customAnchors && pub.capabilities.db);
mkdirSync(join(dir, 'empty'));
assert.throws(() => specFromDir(join(dir, 'empty')), /Không thấy/);
console.log('make-round: folder mode and publish.json');
