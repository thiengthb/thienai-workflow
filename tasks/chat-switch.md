# start-session in luật đổi chat

Repo: thiengthb/thienai-workflow · Nhánh: feat/start-session-chat-switch · PR: #191
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBXGpn77FKktDNQr8o5 · Cập nhật: 2026-11-20T16:51Z

## thien muốn gì
20/11 23:39, sau khi xem usage của chat 344 lượt (gấp 11 lần chat thường, `docs/usage-log.md`): "một phần là bạn quên không nói mình qua chat mới, nên chat mới build up lên như thế này".

## Đã xong
- Commit 8f1498c đã đẩy lên `feat/start-session-chat-switch`, PR #191: `start-session.mjs` in khối "Đổi chat" cuối lệnh, trích từ `profile/CHATS.md` (`chatRules`), test đọc file thật; MAP.md, README ghi thêm; mọi test CI qua; tầng 1 của `reading-cost.mjs` không đổi (25,9 KB).
- Tìm nguyên nhân: luật đổi chat có sẵn ở `profile/CHATS.md` (mục "Việc kế tiếp: ở lại hay mở chat mới", dòng "Mục tiêu" đầu chat, dòng "Xong mục tiêu" cuối việc), nhưng `templates/start-session.mjs` không in nó, nên phiên dài không mở file đó và không nhắc. Chat 20/11 bỏ qua cả ba ý.

## Bước tiếp theo
1. thien merge PR #191 (https://github.com/thiengthb/thienai-workflow/pull/191) rồi `node templates/handoff.mjs done thiengthb/thienai-workflow chat-switch`. CodeRabbit có góp ý thì sửa trên nhánh đó.

## Đang chờ thien
- Merge PR #191.

## Lưu ý
- Làm ở chat mới (chat 20/11 đã 344 lượt): đây chính là việc luật bảo đổi chat.
