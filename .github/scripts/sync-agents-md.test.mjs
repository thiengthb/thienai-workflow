// Run: node .github/scripts/sync-agents-md.test.mjs
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { mergeAgents, parseTrackedRepos } from './sync-agents-md.mjs';

const root = new URL('../../', import.meta.url);
const template = readFileSync(new URL('templates/AGENTS.template.md', root), 'utf8');

// An old copy with a filled-in project part: shared part updates, project part stays.
const oldCopy = '# AGENTS.md\n\nLuật cũ.\n\n---\n\n## Phần riêng của project\n- Chạy `npm test` trước khi push.\n';
const merged = mergeAgents(template, oldCopy);
assert.ok(merged.startsWith(template.slice(0, template.indexOf('## Phần riêng của project'))));
assert.ok(merged.endsWith('## Phần riêng của project\n- Chạy `npm test` trước khi push.\n'));
assert.ok(!merged.includes('Luật cũ.'));

// Already in sync: no change.
assert.strictEqual(mergeAgents(template, merged), merged);

// No marker: refuse instead of guessing.
assert.strictEqual(mergeAgents(template, '# AGENTS.md\nToàn luật riêng.\n'), null);

const repos = parseTrackedRepos(readFileSync(new URL('life/tracked-repos.md', root), 'utf8'));
assert.ok(repos.length > 0);
console.log('ok', repos.length, 'repos');
