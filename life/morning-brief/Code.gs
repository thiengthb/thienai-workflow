/**
 * Morning brief for thien: today's calendar, open Google Tasks and the
 * docs/STATUS.md of every repo in life/tracked-repos.md, sent by email.
 * No LLM involved, so it keeps working when every Claude account is out of quota.
 *
 * Script properties (Project Settings > Script properties):
 *   GITHUB_TOKEN  fine-grained token, read-only "Contents" on the tracked repos
 *   BRIEF_TO      optional, defaults to the script owner's address
 */

const TZ = 'Asia/Ho_Chi_Minh';
const WORKFLOW_REPO = 'thiengthb/thienai-workflow';
const TRACKED_FILE = 'life/tracked-repos.md';
const STATUS_FILE = 'docs/STATUS.md';
// Sections of STATUS.template.md worth reading at 6:30.
// Matched by prefix, so "## Đang chờ thien (tối đa 3)" still counts.
const STATUS_SECTIONS = ['Đang chờ thien', 'Đang ở đâu', 'Đang làm', 'Việc tiếp theo', 'Đang vướng'];

/** Run once by hand: creates the daily trigger around 6:30. */
function setup() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendMorningBrief')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendMorningBrief')
    .timeBased().everyDays(1).atHour(6).nearMinute(30).inTimezone(TZ)
    .create();
}

function sendMorningBrief() {
  const now = new Date();
  const sections = [
    safely('Lịch hôm nay', () => calendarSection(now)),
    safely('Task cần làm', () => tasksSection(now)),
    safely('Repo', () => reposSection()),
  ];
  const props = PropertiesService.getScriptProperties();
  const to = props.getProperty('BRIEF_TO') || Session.getEffectiveUser().getEmail();
  const day = Utilities.formatDate(now, TZ, 'EEE dd/MM');
  const html = '<div style="font-family:system-ui,sans-serif;max-width:560px;line-height:1.5">' +
    sections.map(s => `<h3 style="margin:20px 0 6px">${esc(s.title)}</h3>${s.html}`).join('') +
    '</div>';
  const text = sections.map(s => `${s.title}\n${s.text}`).join('\n\n');
  GmailApp.sendEmail(to, `Bản tin sáng ${day}`, text, { htmlBody: html, name: 'Bản tin sáng' });
}

/** One failing source must not kill the whole email. */
function safely(title, build) {
  try {
    return Object.assign({ title }, build());
  } catch (e) {
    const msg = `Không đọc được phần này: ${e.message}`;
    return { title, text: msg, html: `<p style="color:#b42318">${esc(msg)}</p>` };
  }
}

function calendarSection(now) {
  const events = CalendarApp.getDefaultCalendar().getEventsForDay(now);
  const rows = events.map(ev => {
    const time = ev.isAllDayEvent() ? 'Cả ngày' :
      `${Utilities.formatDate(ev.getStartTime(), TZ, 'HH:mm')}–${Utilities.formatDate(ev.getEndTime(), TZ, 'HH:mm')}`;
    return `${time}  ${ev.getTitle()}`;
  });
  return listOrEmpty(rows, 'Hôm nay trống lịch.');
}

function tasksSection(now) {
  const today = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
  const lists = (Tasks.Tasklists.list({ maxResults: 100 }).items) || [];
  const dueNow = [];
  const later = [];
  lists.forEach(list => {
    const items = (Tasks.Tasks.list(list.id, { showCompleted: false, showHidden: false, maxResults: 100 }).items) || [];
    items.filter(t => t.title).forEach(t => {
      // Google Tasks stores the due day as midnight UTC, so the date part is the day itself.
      const due = t.due ? t.due.slice(0, 10) : '';
      const label = `${t.title}${lists.length > 1 ? ` (${list.title})` : ''}`;
      if (due && due < today) dueNow.push(`Quá hạn ${formatDay(due)}: ${label}`);
      else if (due === today) dueNow.push(`Hôm nay: ${label}`);
      else later.push(due ? `${formatDay(due)}: ${label}` : label);
    });
  });
  dueNow.sort();
  const rows = dueNow.concat(later.length ? [`Còn ${later.length} task chưa tới hạn hoặc không có hạn.`] : []);
  return listOrEmpty(rows, 'Không còn task nào.');
}

function reposSection() {
  const repos = parseTrackedRepos(githubFile(WORKFLOW_REPO, TRACKED_FILE));
  const blocks = repos.map(({ repo, path }) => {
    const status = githubFile(repo, path);
    if (status === null) return { repo, lines: [`Chưa có file tiến độ (${path}).`], waiting: false };
    const parsed = parseStatus(status, STATUS_SECTIONS);
    if (!parsed.standard) {
      return { repo, lines: [`File tiến độ không theo mẫu STATUS, mở xem: https://github.com/${repo}/blob/HEAD/${path}`], waiting: false };
    }
    return { repo, lines: parsed.lines, waiting: parsed.waiting };
  });
  // Repos waiting on thien first.
  blocks.sort((a, b) => Number(b.waiting) - Number(a.waiting));
  const text = blocks.map(b => `${b.repo}\n${b.lines.map(l => '  ' + l).join('\n')}`).join('\n');
  const html = blocks.map(b =>
    `<p style="margin:10px 0 2px"><b>${esc(b.repo)}</b>${b.waiting ? ' · <span style="color:#0e7c66">đang chờ bạn</span>' : ''}</p>` +
    `<ul style="margin:0;padding-left:18px">${b.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`
  ).join('');
  return { text: text || 'Chưa theo dõi repo nào.', html: html || '<p>Chưa theo dõi repo nào.</p>' };
}

/** Returns the file text, or null when the file does not exist. */
function githubFile(repo, path) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  const headers = { Accept: 'application/vnd.github.raw+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = UrlFetchApp.fetch(`https://api.github.com/repos/${repo}/contents/${path}`,
    { headers, muteHttpExceptions: true });
  const code = res.getResponseCode();
  if (code === 404) return null;
  if (code !== 200) throw new Error(`GitHub trả ${code} khi đọc ${repo}/${path}`);
  return res.getContentText('UTF-8');
}

/* ---------- Pure helpers (tested in test.js with Node) ---------- */

/**
 * Reads the table in tracked-repos.md: `owner/repo` in the first column and,
 * optionally, the progress file path in backticks in the last column.
 */
function parseTrackedRepos(md) {
  const repos = [];
  md.split('\n').forEach(line => {
    const m = line.match(/^\|\s*`([\w.-]+\/[\w.-]+)`\s*\|/);
    if (!m) return;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    const last = cells[cells.length - 1].match(/^`([^`]+\.md)`$/);
    repos.push({ repo: m[1], path: last ? last[1] : STATUS_FILE });
  });
  return repos;
}

/** Keeps the wanted `## ` sections, drops template placeholders like `<...>`. */
function parseStatus(md, wanted) {
  const sections = {};
  let current = null;
  md.split('\n').forEach(line => {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) { current = h[1]; sections[current] = []; return; }
    if (!current) return;
    // Drop list markers and Markdown bold/code marks: the email shows plain text.
    const item = line.replace(/^\s*(?:[-*]|\d+\.)\s+/, '').replace(/\*\*|`/g, '').trim();
    if (!item || /^<.*>$/.test(item)) return;
    sections[current].push(item);
  });
  const find = name => {
    const key = Object.keys(sections).find(k => k.startsWith(name));
    return key === undefined ? null : sections[key];
  };
  const lines = [];
  let standard = false;
  wanted.forEach(name => {
    const items = find(name);
    if (items === null) return;
    standard = true;
    if (items.length) lines.push(`${name}: ${items.join('; ')}`);
  });
  const waiting = (find('Đang chờ thien') || []).length > 0;
  return { lines: lines.length ? lines : ['File tiến độ còn trống.'], waiting, standard };
}

function formatDay(isoDay) {
  const [, m, d] = isoDay.split('-');
  return `${d}/${m}`;
}

function listOrEmpty(rows, emptyText) {
  if (!rows.length) return { text: emptyText, html: `<p>${esc(emptyText)}</p>` };
  return {
    text: rows.map(r => '- ' + r).join('\n'),
    html: `<ul style="margin:0;padding-left:18px">${rows.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`,
  };
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

if (typeof module !== 'undefined') module.exports = { parseTrackedRepos, parseStatus, formatDay };
