# start-session in luật đổi chat

Repo: thiengthb/thienai-workflow · Nhánh: chưa có · PR: chưa có
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBXGpn77FKktDNQr8o5 · Cập nhật: 2026-11-20T16:40Z

## thien muốn gì
20/11 23:39, sau khi xem usage của chat 344 lượt (gấp 11 lần chat thường, `docs/usage-log.md`): "một phần là bạn quên không nói mình qua chat mới, nên chat mới build up lên như thế này".

## Đã xong
- Tìm nguyên nhân: luật đổi chat có sẵn ở `profile/CHATS.md` (mục "Việc kế tiếp: ở lại hay mở chat mới", dòng "Mục tiêu" đầu chat, dòng "Xong mục tiêu" cuối việc), nhưng `templates/start-session.mjs` không in nó, nên phiên dài không mở file đó và không nhắc. Chat 20/11 bỏ qua cả ba ý.

## Bước tiếp theo
1. Sửa `templates/start-session.mjs`: in một khối ngắn "Đổi chat" lấy từ `profile/CHATS.md` (bảng ở lại hay đổi, ngưỡng 30 lượt, câu mẫu "Việc này nên làm ở chat mới cho đỡ tốn (chat đã <số> lượt)…", dòng Mục tiêu đầu chat), đọc từ file chứ không chép tay để không lệch; test trong `.github/scripts/start-session.test.mjs`.
2. Không thêm luật mới (sửa công cụ, không tính vào 3 luật của mốc 01/12); trả lời bốn câu của README mục "Sửa quy trình" trong PR cho rõ.
3. Giữ `reading-cost.mjs` dưới ngân sách (khối in thêm làm tăng phần đọc đầu phiên).

## Đang chờ thien
Không.

## Lưu ý
- Làm ở chat mới (chat 20/11 đã 344 lượt): đây chính là việc luật bảo đổi chat.
