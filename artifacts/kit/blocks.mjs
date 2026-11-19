// Khối HTML dùng chung cho các lệnh dựng trang (KH9, 2026-11-19): một chỗ viết, mọi mẫu lấy về, thay vì mỗi mẫu
// tự viết một bản. CSS của các khối nằm ở kit.css (mục "Khối dùng chung"), hành vi ở kit.js (Kit.sendBox).
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const icon = (n) => `<i class="ic ic-${n}" aria-hidden="true"></i>`;

/** Chi tiết thử: chỉ khi có `trial` (một câu nói trang đang thử gì); nút Thích, Không có data-trial, tắt tới khi trang đọc xong bản lưu. */
export function trialHtml(trial) {
  if (!trial) return '';
  const b = (v) => `<button class="choice" type="button" aria-pressed="false" data-trial="${v}" disabled><i></i>${v}</button>`;
  return `<div class="trial" id="trial"><h3>${icon('sparkles')}Chi tiết thử của trang này</h3><p class="small">${esc(trial)}</p>
    <div class="row" role="group" aria-label="Chi tiết thử">${b('Thích')}${b('Không')}</div></div>`;
}

/** Hai nút Chép, Gửi cho Claude và dòng báo; id copy, send, status như Kit.sendBox chờ. */
export function sendActsHtml({ copyLabel = 'Chép' } = {}) {
  return `<div class="acts"><button class="btn" id="copy" type="button" disabled>${icon('copy')}${esc(copyLabel)}</button><button class="btn accent" id="send" type="button" disabled>Gửi cho Claude</button></div>
    <p class="status" id="status" aria-live="polite"></p>`;
}
