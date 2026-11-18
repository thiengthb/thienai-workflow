# Tiến độ

Cập nhật lần cuối: 2026-11-19 · Claude nick tnt697 (project Claude, chat Quy trình nhìn được, checkpoint 3 chờ thien kể lại luồng) · Trang tiến độ: https://claude.ai/artifact/SZGp85NU46SDp9k6i7Lb9n (trang tổng quan, tab thienai-workflow)

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu. Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ quy trình chung, bộ khung artifact (4 mẫu, dựng bằng một lệnh) và hệ thống học 3 môn xoay vòng đều đang dùng hằng ngày. Kế hoạch sửa sau review 2026-11-17 đã merge đợt 0–3 (PR #98–#103); phần làm được của đợt 4, 5 đã làm sớm (PR #105). Review của Codex ngày 17/11 đã kiểm từng ý, phần sửa đã merge (PR #121).

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| [Sửa quy trình sau review 2026-11-17](plans/2026-11-17-workflow-review.md) | 0–3 đã merge (PR #98–#103); 5: phần làm được đã làm sớm, còn đối chiếu với tính năng mới của Claude ở 2026-12-01; 4: phần máy xong (bước ôn tự sinh), chờ đo ở hai buổi học kế tiếp | 21/22 |
| [Học càng nhiều, repo không nặng thêm](plans/2026-11-15-lean-learning.md) | 0–2 xong; 3: đã đo BA 5 và Frontend 10, ôn tự sinh chạy đúng, nhưng lượt dựng bài chưa giảm (Frontend 10 khoảng 65), xét ở 01/12; 4 bỏ (thien chọn 2026-11-17) | 8/11 |
| [Các hành động giữa thien và AI còn thiếu luật](plans/2026-11-17-action-gaps.md) | 1 đã merge (PR #104), kiểm ở 4 chat: 4 trên 6 PR đủ điều kiện được AI tự merge, quyết sửa gì ở 01/12; 2 xong; 3 ở mốc 01/12 | 11/16 |
| [Sửa theo review Codex 17/11](plans/2026-11-18-codex-review.md) | 1 (hai lệnh không còn xoá hay ghi đè dữ liệu) và 2 (sửa chỗ ghi sai) đã merge (PR #121); 3 đã gộp vào mốc 01/12 | 11/12 |
| [Quy trình nhìn được, gu lớn dần](plans/2026-11-18-visual-workflow.md) | 0, 1 xong; vòng gu 2 giấy trắng xanh petrol, vòng gu 3 mực hình xanh cam đã vào kit; 2: mẫu trang kế hoạch đã merge, thien đã trả lời câu hỏi bằng nút trên trang; còn đăng lại trang tổng quan từ nick đang giữ nó; 3: mẫu luồng chạy đã dựng, trang "một buổi học đi qua những đâu" đã đăng, chờ thien tự kể lại ở ô cuối trang. Luật gom vào mốc 01/12 | 12/24 |
| [Dùng project bản beta tốn ít usage hơn](plans/2026-11-19-thread-usage.md) | 1 xong (PR #139, chuẩn v6 đã dán ở mọi project); 2: lịch nhắc đã chuyển sang thread mới mỗi lần, chờ số lần chạy 19/11; 3 đo ở sakubun; 4 ở mốc 01/12 | 4/10 |
| [Trang mở nhanh](plans/2026-11-17-quick-access.md) | 1, 2, 4 xong, thien đã dùng tab "Mở nhanh" trên điện thoại; 3: sơ đồ đã vào README (PR #118), còn xem trên điện thoại và xem lại ở mốc 01/12; lối tắt tuỳ thien | 9/11 |

## Việc dở
| Việc | Nhánh hoặc PR | Dở từ | Còn thiếu gì |
|---|---|---|---|
| Thử CodeRabbit CLI gói Free (3 lần mỗi giờ) | quyết định 002 | 2026-11-14 | Sau 24/11; [chưa kiểm] chạy không cần trình duyệt có cần Agentic API key và Usage-based add-on không |

## Vừa xong
- Frontend 10 mở chặng 2 (PR #117): ôn 5/5, chọn đúng bản sửa, tự nói lại có "vì sao"; "nổi = thêm màu" còn vướng. Chiến tranh 7 (giấu pháo ở Điện Biên Phủ): ôn 4/4, thien chấm "khó".

## Việc tiếp theo
1. Buổi học kế tiếp: Chiến tranh 8, rồi Frontend 11. Trước buổi chiến tranh: sửa "Xem Claude làm" lấy nhầm track của bài khác (`learning/war.md`). BA 6 cần ngắn lại (BA 5 tốn 60 phút, "dài", "khó"). Ngày 17/11 thien học 7 buổi, quá nhịp 4 buổi một tuần: tuần này không cần thêm buổi.
2. Dùng mẫu so sánh cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.
3. sakubun: thêm `.gitattributes` và chép lại `scripts/check-status.mjs` bản đọc được CRLF (bản cũ ở đó vẫn hỏng trên Windows).

## Đang chờ thien
- Không có.
- Merge PR #139, rồi dán project instructions bản v6 (khối bản beta trong `profile/SETUP.md`) ở từng project beta.
- Mở [trang luồng một buổi học](https://claude.ai/artifact/S9B86U6MGpnkYTa8enDtVM) (nick tnt697), cuộn hết các bước, kể lại luồng ở ô cuối trang rồi bấm "Gửi cho Claude": phép kiểm của checkpoint 3.

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
