# Tiến độ

Cập nhật lần cuối: 2026-11-15 · Claude nick tnt697 (project Claude, thread học nhẹ dần sau review Codex lần 3) · Trang tiến độ: https://claude.ai/artifact/WucUDZEgEpMaYMvx8UuNb4

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu. Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ khung artifact đủ 4 mẫu: so sánh, tổng quan, chọn phương án, buổi học (PR #47, #48, #50); mẫu nào cũng dựng bằng một lệnh (PR #52). Bài học có thêm sa bàn chiến tranh (PR #53), sân khấu IT cho frontend và BA (PR #54), và tự hỏi Claude ngay trên trang (PR #55). Đang làm các đề xuất nâng cấp: đợt 1 CI mở từng trang trong trình duyệt (PR #56), đợt 2 trang ôn thẻ (https://claude.ai/artifact/L612hHx2vHUokcPBgH7RPu, PR #57), đợt 3 việc sau buổi học bằng một lệnh, chỗ còn vướng mang sang buổi sau, ghi tính năng được dùng (PR #58), đợt 4 tự lưu theo tên nút, một bộ màu, trang mẫu thành phần (https://claude.ai/artifact/HuyQj149mQAYpicvQrY7Ne), kiểm truy cập (PR #61), đợt 5a Claude làm mẫu trên sân khấu, tình huống thêm, nút Nghe (PR #63), đợt 5b trang tổng quan gom việc chờ bạn, bảng học tuần (https://claude.ai/artifact/LijnAF7tSR4gBMrspPuQtV), bộ màu thienui trên claude.ai (https://claude.ai/artifact/2kM7som4ok6kmh7QaCSXZJ). Luật dùng mẫu đã vào AGENTS chung để mọi project tự dùng. Bộ quy trình chung đã dùng được: luật, mẫu, skill start-project, học nhiều môn xoay vòng (frontend 5 buổi, BA 2, chiến tranh 4), theo dõi kế hoạch và lộ trình học (PR #31 đã merge). Bản tin sáng qua mail đã bỏ (PR #24).

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| [Sửa công cụ kiểm tra báo thành công khi chưa kiểm gì](plans/2026-11-12-silent-tools-fix.md) | 1/2: chờ thien chạy thử trên laptop | 5/5 |
| [Chuyển repo thienui sang riêng tư](plans/2026-11-14-thienui-private.md) | 3/3: xong, chờ merge PR | 4/5 |
| [Học càng nhiều, repo không nặng thêm](plans/2026-11-15-lean-learning.md) | 1/6: đã merge, chờ thien mở lại 2 bài sa bàn | 3/12 |

## Việc dở
| Việc | Nhánh hoặc PR | Dở từ | Còn thiếu gì |
|---|---|---|---|
| Cài dòng Settings mới cho từng tài khoản Claude | README, bước 1 | 2026-11-12 | thien tự làm, AI không kiểm được |
| Xoá nhánh `docs/cross-account-handoff` | PR #60 đã đóng, phần cần đã vào #62 | 2026-11-14 | thien bấm Delete branch; còn thì `check-open-work` cứ báo là việc chưa merge |
| Thử CodeRabbit CLI gói Free (3 lần mỗi giờ) | quyết định 002 | 2026-11-14 | Sau 24/11; [chưa kiểm] chạy không cần trình duyệt có cần Agentic API key và Usage-based add-on không |

## Vừa xong
- Trang bài trong repo chỉ còn là nguồn (kit dựng ra thư mục tạm), CI chỉ kiểm trang bài đổi, chặn PR vừa sửa bài vừa sửa kit (PR #77)

## Việc tiếp theo
1. Buổi học kế tiếp: Frontend 6 (chọn màu cho app), dựng từ mẫu bàn thử `artifacts/it/` (bài mẫu trong đó chính là nháp buổi 6). Cuối phiên chạy skill `explain-usage` và ghi số vào đợt 0 của kế hoạch học nhẹ dần.
2. Dùng mẫu so sánh mới cho vòng duyệt giao diện kế tiếp ở sakubun, ghi lại chỗ còn vướng.
3. sakubun: thêm `.gitattributes` và chép lại `scripts/check-status.mjs` bản đọc được CRLF (bản cũ ở đó vẫn hỏng trên Windows).

## Đang chờ thien
- Trên laptop Windows: làm mục "Máy Windows (làm một lần)" trong `README.md`, lệnh cuối in "ổn" là xong.
- Ở từng nick (tnt024, tnt628, tnt697): dán project instructions bản v2 có tên nick, gắn repo, tải lại 2 skill, và chọn lại phần đồng bộ knowledge, theo `profile/SETUP.md`.
- Merge sakubun PR #301 (luật AGENTS mới).

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
