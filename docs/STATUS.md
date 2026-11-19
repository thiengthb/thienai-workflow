# Tiến độ

Cập nhật lần cuối: 2026-11-19 · Claude nick tnt697 (project Claude, KH9 duyệt, ga 1 ở PR #156) · Trang tiến độ: https://claude.ai/artifact/SZGp85NU46SDp9k6i7Lb9n (trang tổng quan, tab thienai-workflow)

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu. Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ quy trình chung, bộ khung artifact (4 mẫu, dựng bằng một lệnh) và hệ thống học 3 môn xoay vòng đều đang dùng hằng ngày. Kế hoạch sửa sau review 2026-11-17 đã merge đợt 0–3 (PR #98–#103); phần làm được của đợt 4, 5 đã làm sớm (PR #105). Review của Codex ngày 17/11 đã kiểm từng ý, phần sửa đã merge (PR #121).

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| KH8 · [Đóng KH1–KH7, làm sớm buổi xem lại 01/12](plans/2026-11-19-close-plans.md) | 1 xong (ok cả 10 đề xuất); 2: PR luật #153 và PR mã #154 chờ thien merge; 3: bảy kế hoạch đã đóng (PR #152). Sau đó: KH9 kit lắp ghép, kế hoạch MCP cho nhóm SEP490 | 4/5 |
| KH9 · [Kit lắp ghép, bố cục theo nội dung](plans/2026-11-19-modular-kit.md) | Duyệt 19/11 (ok cả 4 đề xuất), làm trước kế hoạch MCP; 1: khối gửi, nút chọn một, chi tiết thử vào kit, PR #156 chờ merge (sau #154); rồi 2 trang dựng từ danh sách khối, 3 vòng gu bố cục trang kế hoạch | 0/10 |

## Việc dở
| Việc | Nhánh hoặc PR | Dở từ | Còn thiếu gì |
|---|---|---|---|
| Thử CodeRabbit CLI gói Free (3 lần mỗi giờ) | quyết định 002 | 2026-11-14 | Sau 24/11; [chưa kiểm] chạy không cần trình duyệt có cần Agentic API key và Usage-based add-on không |

## Vừa xong
- Frontend 10 mở chặng 2 (PR #117): ôn 5/5, chọn đúng bản sửa, tự nói lại có "vì sao"; "nổi = thêm màu" còn vướng. Chiến tranh 7 (giấu pháo ở Điện Biên Phủ): ôn 4/4, thien chấm "khó".

## Việc tiếp theo
1. Buổi học kế tiếp: Chiến tranh 8, rồi Frontend 11. Lỗi "Xem Claude làm" lấy nhầm track đã sửa (PR #146 đã merge). BA 6 cần ngắn lại (BA 5 tốn 60 phút, "dài", "khó"). Ngày 17/11 thien học 7 buổi, quá nhịp 4 buổi một tuần: tuần này không cần thêm buổi.
2. Dùng mẫu so sánh cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.
3. Mốc 13/12: AI soạn bản chấm lại `profile/SKILL-LEVEL.md` từ nhật ký, thien duyệt; trong vòng học sau 22/11 có một buổi kiểu "Viết luật cho thienui" (chuyển từ KH2, KH8 câu 10).
4. sakubun: thêm `.gitattributes` và chép lại `scripts/check-status.mjs` bản đọc được CRLF (bản cũ ở đó vẫn hỏng trên Windows).

## Đang chờ thien
- Ngày 01/12 chuyển repo này lại private. Từ 19/11 repo public tạm vì bản private hết phút CI miễn phí; đã đặt lịch nhắc. Tới lúc đó không ghi thông tin riêng mới vào repo.

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
