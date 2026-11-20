# Tiến độ

Cập nhật lần cuối: 2026-11-20 · Claude nick tnt697 (project Claude, KH10 MCP cho nhóm: ga 1, repo lõi đã có bản chép đầu) · Trang tiến độ: https://claude.ai/artifact/SZGp85NU46SDp9k6i7Lb9n (trang tổng quan, tab thienai-workflow)

File này để bất kỳ ai (thành viên khác, AI khác, thien sau một tuần) mở ra là biết repo này đang ở đâu. Lịch sử nằm trong git và PR, không ghi ở đây. Cả file tối đa 40 dòng, tối đa 3 việc chờ thien.

## Đang ở đâu
Bộ quy trình chung, bộ khung artifact (4 mẫu, dựng bằng một lệnh) và hệ thống học 3 môn xoay vòng đều đang dùng hằng ngày. Kế hoạch sửa sau review 2026-11-17 đã merge đợt 0–3 (PR #98–#103); phần làm được của đợt 4, 5 đã làm sớm (PR #105). Review của Codex ngày 17/11 đã kiểm từng ý, phần sửa đã merge (PR #121).

## Kế hoạch đang chạy
Chi tiết trong `docs/plans/`. Luật ở `profile/PLANNING.md`.

| Kế hoạch | Đang ở checkpoint | Đã tick |
|---|---|---|
| KH9 · [Kit lắp ghép, bố cục theo nội dung](plans/2026-11-19-modular-kit.md) | Duyệt 19/11, làm trước kế hoạch MCP; 1: khối dùng chung đã vào kit (PR #156 đã merge), thien đã xem trang mẫu thành phần (20/11), ga đóng; 2: trang dựng từ danh sách khối, kit bỏ khối không dùng, check-pages báo vượt cỡ gốc 20% (PR #158 đã merge); 3: thien chọn B cả ba loại (phiếu hỏi trước, bảng tiến độ, thẻ kết quả) ở vòng gu 5 (PR #160 đã merge); kit đổi sang trắng đen (PR #161 đã merge); ba bản B thành mặc định của `artifacts/plan/` theo trạng thái, trang KH9 dựng lại bằng bảng tiến độ (PR #163 đã merge); 4: vòng gu hai tuần một lần (mốc); vòng 6: thien chọn ôn thẻ hai nửa thẻ, trang học tuyến bước, đã vào mẫu (PR #164 đã merge) | 9/10 |
| KH10 · [MCP cho nhóm SEP490](plans/2026-11-20-team-mcp.md) | Duyệt 20/11 (cả 5 đề xuất); thien trả lời 4 câu đầu 20/11 (Claude web/desktop, quy trình chung và lệnh dựng trang, ghi repo đồ án, tách repo mới); 10:46 duyệt hướng hai lớp: repo lõi private, chỉ MCP mở ra ngoài, trang bằng MCP Apps; host trên miniserver qua Cloudflare Tunnel, Workers dự phòng (chốt 11:15); NUC đã có tunnel, Traefik và tên miền (đọc nuc-infra) | 2/16 |

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
- KH10 ga 1: tạo deploy key `sync-core` cho thienai-core và secret `CORE_DEPLOY_KEY` (ba bước trong kế hoạch, ga 1), rồi merge PR ga 1.
- Ngày 01/12 chuyển repo này lại private. Từ 19/11 repo public tạm vì bản private hết phút CI miễn phí; đã đặt lịch nhắc. Tới lúc đó không ghi thông tin riêng mới vào repo.

## Đang vướng
- Không có. Trang tổng quan đọc sakubun bằng bản clone công khai.
