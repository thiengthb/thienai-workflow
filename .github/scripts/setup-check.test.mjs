// Tests for templates/setup-check.mjs, run in CI by .github/workflows/test.yml.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseSetup, checkStandard, checkSetup, instructionsFor, parseAccounts, skillVersion, SKILLS } from '../../templates/setup-check.mjs';

const md = readFileSync(new URL('../../profile/SETUP.md', import.meta.url), 'utf8');
assert.deepEqual(checkStandard(md), [], 'profile/SETUP.md itself must pass (version numbers in step)');
const std = parseSetup(md);
assert.ok(std.version >= 1);
assert.deepEqual(std.projects.sakubun, ['thiengthb/sakubun', 'thiengthb/thienai-workflow']);
assert.deepEqual(std.projects.claude, ['thiengthb/thienai-workflow']);
assert.equal(checkStandard(md.replace(/^Phiên bản chuẩn: \*\*\d+\*\*/m, 'Phiên bản chuẩn: **99**')).length, 1, 'bumping one number only fails');

const good = instructionsFor(std, 'sakubun', 'tnt024');
assert.match(good, new RegExp(`^chuẩn setup v${std.version} · project: sakubun`));
const all = { repos: ['thiengthb/sakubun', 'thiengthb/thienai-workflow'], skills: ['anthropic-skills:check-setup', 'anthropic-skills:start-project', 'anthropic-skills:make-slides'] };

let r = checkSetup(std, { project: 'sakubun', instructions: good, ...all }, () => true);
assert.deepEqual(r.fixes, [], 'fully set up project passes');

r = checkSetup(std, { project: 'sakubun', instructions: '', ...all });
assert.equal(r.fixes.length, 1); assert.match(r.fixes[0], /chưa có project instructions/); assert.match(r.fixes[0], /project: sakubun/, 'fix carries the text to paste');

const old = good.replace(`chuẩn setup v${std.version}`, 'chuẩn setup v0');
r = checkSetup(std, { project: 'sakubun', instructions: old, ...all });
assert.match(r.fixes[0], /chuẩn mới là v/, 'older version asks thien to paste the new one');

r = checkSetup(std, { project: 'sakubun', instructions: 'Mình là thien.', ...all });
assert.match(r.fixes[0], /chưa theo chuẩn chung/);

r = checkSetup(std, { project: 'sakubun', instructions: instructionsFor(std, 'Claude'), ...all });
assert.ok(r.fixes.some(f => /project: claude/.test(f)), 'instructions pasted for the wrong project are caught');

r = checkSetup(std, { project: 'sakubun', instructions: good, repos: ['thiengthb/sakubun'], skills: all.skills });
assert.ok(r.fixes.some(f => /chưa gắn repo thiengthb\/thienai-workflow/.test(f)), 'missing repo');

r = checkSetup(std, { project: 'sakubun', instructions: good, ...all }, (repo) => repo !== 'thiengthb/sakubun');
assert.ok(r.fixes.some(f => /chưa cho Claude đọc thiengthb\/sakubun/.test(f)), 'unreadable repo');

r = checkSetup(std, { project: 'sakubun', instructions: good, repos: all.repos, skills: ['anthropic-skills:check-setup', 'anthropic-skills:start-project'] });
assert.ok(r.fixes.some(f => /make-slides/.test(f)), 'missing skill');

r = checkSetup(std, { project: 'tiktok', instructions: instructionsFor(std, 'tiktok', 'tnt024'), repos: [], skills: all.skills });
assert.deepEqual(r.fixes, []); assert.ok(r.notes.some(n => /chưa có trong chuẩn/.test(n)), 'unknown project is a question, not a failure');

// Nick: instructions from v2 on must name it, the registry is checked, retired nicks are flagged.
const accMd = readFileSync(new URL('../../profile/ACCOUNTS.md', import.meta.url), 'utf8');
const accounts = parseAccounts(accMd);
assert.ok(accounts.tnt024, 'tnt024 is in the registry'); assert.ok(accounts.tnt024.projects.includes('sakubun'));
assert.ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(accMd), 'no email addresses in the registry, not even inside code');
r = checkSetup(std, { project: 'sakubun', instructions: good, ...all, accounts });
assert.deepEqual(r.fixes, []); assert.equal(r.nick, 'tnt024');
r = checkSetup(std, { project: 'sakubun', instructions: instructionsFor(std, 'sakubun'), ...all, accounts });
assert.ok(r.fixes.some(f => /chưa ghi tên nick/.test(f)), 'placeholder nick is caught');
r = checkSetup(std, { project: 'sakubun', instructions: instructionsFor(std, 'sakubun', 'tnt999'), ...all, accounts });
assert.ok(r.notes.some(n => /AI tự làm: nick tnt999 chưa có/.test(n)), 'unknown nick: AI adds a registry row');
r = checkSetup(std, { project: 'sakubun', instructions: good, ...all, accounts: { tnt024: { status: 'đã nghỉ', projects: ['sakubun'] } } });
assert.ok(r.fixes.some(f => /đã nghỉ/.test(f)), 'retired nick in use');
r = checkSetup(std, { project: 'sakubun', instructions: good, ...all, accounts: { tnt024: { status: 'tạm nghỉ', projects: ['sakubun'] } } });
assert.deepEqual(r.fixes, [], 'a paused nick is not retired');
r = checkSetup(std, { project: 'sakubun', instructions: good, ...all, accounts: { tnt024: { status: 'đang dùng', projects: ['claude'] } } });
assert.ok(r.notes.some(n => /thêm project `sakubun`/.test(n)), 'project missing from the nick row');

// Skill versions: "(bản N)" at the end of the description; an older or unnumbered upload is stale.
const versions = Object.fromEntries(SKILLS.map(n => [n, skillVersion(readFileSync(new URL(`../../skills/${n}/SKILL.md`, import.meta.url), 'utf8'))]));
for (const n of SKILLS) assert.ok(versions[n] >= 1, `skills/${n}/SKILL.md description ends with "(bản N)"`);
const cur = SKILLS.map(n => `anthropic-skills:${n}@${versions[n]}`);
r = checkSetup(std, { project: 'sakubun', instructions: good, repos: all.repos, skills: cur, skillVersions: versions });
assert.deepEqual(r.fixes, [], 'current skills pass');
r = checkSetup(std, { project: 'sakubun', instructions: good, repos: all.repos, skills: all.skills, skillVersions: versions });
assert.ok(r.fixes.some(f => /đã cũ/.test(f) && /chưa có số/.test(f)), 'skills uploaded before numbering are stale');

console.log('setup-check ok');
