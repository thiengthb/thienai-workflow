// Opens a PR in every repo listed in life/tracked-repos.md whose AGENTS.md
// shared part differs from templates/AGENTS.template.md. The project's own
// part (from the "## Phần riêng của project" heading down) is kept as is.
//
// Env: SYNC_TOKEN (fine-grained, Contents + Pull requests read/write on the
// tracked repos). DRY_RUN=1 only prints what would change.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const MARKER = /^## Phần riêng của project\s*$/m;
const BRANCH = 'chore/sync-agents-md';
const API = 'https://api.github.com';

/** Template's shared part + the project's own part. null when the project file has no marker. */
export function mergeAgents(template, current) {
  const t = template.search(MARKER);
  const c = current.search(MARKER);
  if (t < 0) throw new Error('Template is missing the "## Phần riêng của project" heading');
  if (c < 0) return null;
  return template.slice(0, t) + current.slice(c);
}

export function parseTrackedRepos(md) {
  return md.split('\n')
    .map(line => line.match(/^\|\s*`([\w.-]+\/[\w.-]+)`\s*\|/))
    .filter(Boolean)
    .map(m => m[1]);
}

async function gh(token, method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { status: res.status, data };
}

async function syncRepo(token, repo, template, sourceSha, dryRun) {
  const meta = await gh(token, 'GET', `/repos/${repo}`);
  if (meta.status !== 200) return `bỏ qua: không đọc được repo (HTTP ${meta.status})`;
  const base = meta.data.default_branch;

  const file = await gh(token, 'GET', `/repos/${repo}/contents/AGENTS.md?ref=${base}`);
  if (file.status === 404) return 'bỏ qua: repo chưa có AGENTS.md';
  if (file.status !== 200) return `lỗi: không đọc được AGENTS.md (HTTP ${file.status})`;
  const current = Buffer.from(file.data.content, 'base64').toString('utf8');

  const next = mergeAgents(template, current);
  if (next === null) return 'cần sửa tay: AGENTS.md không có dòng "## Phần riêng của project"';
  if (next === current) return 'đã khớp, không cần PR';
  if (dryRun) return 'sẽ mở PR (DRY_RUN)';

  // Reset the sync branch to the latest default branch, then commit the new file on it.
  const head = await gh(token, 'GET', `/repos/${repo}/git/ref/heads/${base}`);
  const sha = head.data.object.sha;
  const created = await gh(token, 'POST', `/repos/${repo}/git/refs`, { ref: `refs/heads/${BRANCH}`, sha });
  if (created.status === 422) {
    await gh(token, 'PATCH', `/repos/${repo}/git/refs/heads/${BRANCH}`, { sha, force: true });
  } else if (created.status !== 201) {
    return `lỗi: không tạo được nhánh (HTTP ${created.status})`;
  }
  const put = await gh(token, 'PUT', `/repos/${repo}/contents/AGENTS.md`, {
    message: `chore: sync shared AGENTS.md rules from thienai-workflow@${sourceSha.slice(0, 7)}`,
    content: Buffer.from(next, 'utf8').toString('base64'),
    sha: file.data.sha,
    branch: BRANCH,
  });
  if (put.status !== 200 && put.status !== 201) return `lỗi: không commit được (HTTP ${put.status})`;

  const owner = repo.split('/')[0];
  const open = await gh(token, 'GET', `/repos/${repo}/pulls?state=open&head=${owner}:${BRANCH}`);
  if (open.data && open.data.length) return `đã cập nhật PR có sẵn: ${open.data[0].html_url}`;
  const pr = await gh(token, 'POST', `/repos/${repo}/pulls`, {
    title: 'chore: sync shared AGENTS.md rules from thienai-workflow',
    head: BRANCH,
    base,
    body: [
      'PR tự động từ repo [thienai-workflow](https://github.com/thiengthb/thienai-workflow): cập nhật phần chung của `AGENTS.md` theo mẫu mới nhất.',
      '',
      'Phần riêng của project (từ dòng "## Phần riêng của project" trở xuống) được giữ nguyên. Bạn chỉ cần xem diff rồi merge.',
      '',
      `Nguồn: thienai-workflow@${sourceSha.slice(0, 7)}`,
    ].join('\n'),
  });
  return pr.status === 201 ? `đã mở PR: ${pr.data.html_url}` : `lỗi: không mở được PR (HTTP ${pr.status})`;
}

async function main() {
  const token = process.env.SYNC_TOKEN;
  const dryRun = process.env.DRY_RUN === '1';
  if (!token) {
    console.error('Thiếu secret SYNC_TOKEN. Xem hướng dẫn trong .github/workflows/sync-agents-md.yml.');
    process.exit(1);
  }
  const root = new URL('../../', import.meta.url);
  const template = readFileSync(new URL('templates/AGENTS.template.md', root), 'utf8');
  const repos = parseTrackedRepos(readFileSync(new URL('life/tracked-repos.md', root), 'utf8'));
  const sourceSha = process.env.GITHUB_SHA || 'local';
  let failed = false;
  for (const repo of repos) {
    let result;
    try {
      result = await syncRepo(token, repo, template, sourceSha, dryRun);
    } catch (e) {
      result = `lỗi: ${e.message}`;
    }
    if (result.startsWith('lỗi')) failed = true;
    console.log(`${repo}: ${result}`);
  }
  if (failed) process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
