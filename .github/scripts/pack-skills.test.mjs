// Tests for .github/scripts/pack-skills.mjs, run in CI by .github/workflows/test.yml.
// Checks the zips open with the system unzip, hold <skill>/SKILL.md, leave STEPS.md out,
// and that a broken SKILL.md stops the run before anything is uploaded.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeZip, packAll, checkSkillMd } from './pack-skills.mjs';

const tmp = mkdtempSync(join(tmpdir(), 'pack-skills-'));
const unzipList = (file) => execFileSync('unzip', ['-Z1', file], { encoding: 'utf8' }).trim().split('\n');

// The real skills in this repo pack cleanly.
const root = fileURLToPath(new URL('../../', import.meta.url));
const packs = packAll(join(root, 'skills'));
const dirs = readdirSync(join(root, 'skills'), { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.'));
assert.equal(packs.length, dirs.length, 'every skill folder gets a zip');
for (const p of packs) {
  const file = join(tmp, p.file);
  writeFileSync(file, makeZip(p.entries));
  execFileSync('unzip', ['-tq', file]);                       // CRC and structure are valid
  const names = unzipList(file);
  assert.ok(names.includes(`${p.skill}/SKILL.md`), `${p.file} has ${p.skill}/SKILL.md`);
  assert.ok(!names.some((n) => n.endsWith('/STEPS.md')), `${p.file} leaves STEPS.md out`);
  const out = join(tmp, 'x-' + p.skill);
  execFileSync('unzip', ['-q', file, '-d', out]);
  assert.equal(readFileSync(join(out, p.skill, 'SKILL.md'), 'utf8'), readFileSync(join(root, 'skills', p.skill, 'SKILL.md'), 'utf8'), 'content survives the round trip');
}

// Same files, same bytes, so a re-run uploads nothing new.
assert.deepEqual(makeZip(packs[0].entries), makeZip(packs[0].entries));

// Nested files and Vietnamese names keep their path.
const fake = join(tmp, 'skills');
mkdirSync(join(fake, 'demo', 'refs'), { recursive: true });
writeFileSync(join(fake, 'demo', 'SKILL.md'), '---\nname: demo\ndescription: thử\n---\n');
writeFileSync(join(fake, 'demo', 'refs', 'ghi-chú.md'), 'x');
writeFileSync(join(fake, 'demo', 'STEPS.md'), 'bỏ');
const [demo] = packAll(fake);
writeFileSync(join(tmp, 'demo.zip'), makeZip(demo.entries));
// Names read straight from the zip's central directory: Info-ZIP's `unzip -Z1` on Windows prints them in the
// console code page, so a correct UTF-8 name like "ghi-chú.md" came out garbled there.
const zipNames = (file) => {
  const b = readFileSync(file);
  const end = b.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let p = b.readUInt32LE(end + 16);
  const names = [];
  for (let n = b.readUInt16LE(end + 10); n > 0; n--) {
    const len = b.readUInt16LE(p + 28), extra = b.readUInt16LE(p + 30), note = b.readUInt16LE(p + 32);
    assert.ok(b.readUInt16LE(p + 8) & 0x800, 'UTF-8 flag set on every name');
    names.push(b.toString('utf8', p + 46, p + 46 + len));
    p += 46 + len + extra + note;
  }
  return names;
};
assert.deepEqual(zipNames(join(tmp, 'demo.zip')).sort(), ['demo/SKILL.md', 'demo/refs/ghi-chú.md']);

// Broken SKILL.md files are refused with a reason.
assert.deepEqual(checkSkillMd('demo', '---\nname: demo\ndescription: d\n---\n'), []);
assert.match(checkSkillMd('demo', '# no frontmatter')[0], /mở đầu bằng/);
assert.match(checkSkillMd('demo', '---\nname: other\ndescription: d\n---\n')[0], /trùng tên thư mục/);
assert.match(checkSkillMd('demo', '---\nname: demo\n---\n')[0], /thiếu dòng description/);
assert.match(checkSkillMd('demo', '---\ndescription:\nname: demo\n---\n')[0], /thiếu dòng description/, 'empty value does not borrow the next line');
for (const q of ['""', "''", '" "']) assert.match(checkSkillMd('demo', `---\nname: demo\ndescription: ${q}\n---\n`)[0], /thiếu dòng description/, `quoted empty ${q} is refused`);
assert.deepEqual(checkSkillMd('demo', '---\nname: "demo"\ndescription: "có nháy"\n---\n'), [], 'quoted values are fine');
mkdirSync(join(fake, 'nofile'));
assert.throws(() => packAll(fake), /nofile\/ không có SKILL.md/);

console.log('pack-skills: ổn');
