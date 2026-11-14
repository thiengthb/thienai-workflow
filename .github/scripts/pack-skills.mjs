// Packs every folder in skills/ into <name>.zip, the format Customize > Skills on claude.ai accepts
// (a zip holding one folder with SKILL.md inside). Run by .github/workflows/skill-zips.yml, which puts
// the zips on the "skills" release so thien downloads one file per skill instead of each file by hand.
//
//   node .github/scripts/pack-skills.mjs [--out dist/skills]
//
// STEPS.md is left out on purpose: each SKILL.md tells Claude to read the newest STEPS.md from the repo,
// and a copy inside the zip would go stale the moment STEPS.md changes.
// No dependencies, and the zips are byte-for-byte the same for the same files (fixed timestamps),
// so a re-run with no change in skills/ uploads identical files.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const SKIP = new Set(['STEPS.md']);

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Builds a zip from [{ name, data }] (name uses "/" separators). Deflate, UTF-8 names, 1980-01-01 timestamps.
export function makeZip(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const packed = deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const head = (sig, extra) => {
      const b = Buffer.alloc(extra);
      b.writeUInt32LE(sig, 0);
      return b;
    };
    const local = head(0x04034b50, 30);
    local.writeUInt16LE(20, 4);          // version needed
    local.writeUInt16LE(0x0800, 6);      // flag: UTF-8 names
    local.writeUInt16LE(8, 8);           // deflate
    local.writeUInt16LE(0, 10);          // time 00:00
    local.writeUInt16LE(0x21, 12);       // date 1980-01-01
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, packed);

    const central = head(0x02014b50, 46);
    central.writeUInt16LE(20, 4);        // made by
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + packed.length;
  }
  const dir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, dir, end]);
}

// Problems that would make claude.ai refuse the upload, or upload a skill under the wrong name.
export function checkSkillMd(folder, text) {
  const problems = [];
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return [`skills/${folder}/SKILL.md phải mở đầu bằng khối --- name, description ---`];
  const field = (k) => (new RegExp(`^${k}:[ \\t]*(\\S.*)$`, 'm').exec(m[1]) || [])[1]?.trim();
  if (!field('name')) problems.push(`skills/${folder}/SKILL.md thiếu dòng name:`);
  else if (field('name') !== folder) problems.push(`skills/${folder}/SKILL.md có name: ${field('name')}, phải trùng tên thư mục (${folder})`);
  if (!field('description')) problems.push(`skills/${folder}/SKILL.md thiếu dòng description:`);
  return problems;
}

function filesIn(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...filesIn(p));
    else if (e.isFile()) out.push(p);
  }
  return out;
}

// Returns [{ skill, file, entries }] for every folder in skillsDir; throws with every problem found.
export function packAll(skillsDir) {
  const problems = [], packs = [];
  for (const skill of readdirSync(skillsDir).sort()) {
    const dir = join(skillsDir, skill);
    if (!statSync(dir).isDirectory() || skill.startsWith('.')) continue;
    let text;
    try { text = readFileSync(join(dir, 'SKILL.md'), 'utf8'); } catch { problems.push(`skills/${skill}/ không có SKILL.md`); continue; }
    problems.push(...checkSkillMd(skill, text));
    const entries = filesIn(dir)
      .filter((p) => !SKIP.has(relative(dir, p)))
      .map((p) => ({ name: `${skill}/${relative(dir, p).split(sep).join('/')}`, data: readFileSync(p) }));
    packs.push({ skill, file: `${skill}.zip`, entries });
  }
  if (problems.length) throw new Error(problems.join('\n'));
  return packs;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const i = process.argv.indexOf('--out');
  const out = i > 0 ? process.argv[i + 1] : 'dist/skills';
  const root = fileURLToPath(new URL('../../', import.meta.url));
  try {
    const packs = packAll(join(root, 'skills'));
    mkdirSync(out, { recursive: true });
    for (const p of packs) {
      writeFileSync(join(out, p.file), makeZip(p.entries));
      console.log(`${p.file}: ${p.entries.map((e) => e.name).join(', ')}`);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
