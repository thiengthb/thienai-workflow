# KH10 MCP cho nhóm SEP490: chờ thien duyệt

Repo: thiengthb/thienai-workflow · Nhánh: team-mcp-plan · PR: #165 (nháp)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBYqmwzr7tB4gqM4F6T · Cập nhật: 2026-11-20T03:47Z

## thien muốn gì
Nhóm SEP490 (5 người, dùng Claude web/desktop) dùng được quy trình chung và lệnh dựng trang qua một connector, không lộ đồ riêng; 20/11 10:41 thêm: "control cái thienai workflow mà vẫn cho người khác sử dụng được ... chỉ ẩn nhất để không bị mất công nghệ lỗi [lõi] thôi". Duyệt hướng hai lớp 10:46: "ok bạn hãy làm theo đề xuất".

## Đã xong
- 20/11 10:34: hỏi 4 câu bằng nút; thien chọn Claude web/desktop, quy trình chung + lệnh dựng trang + đề xuất của Claude (bỏ trang học), ghi repo đồ án, tách repo mới.
- Kế hoạch `docs/plans/2026-11-20-team-mcp.md`, trang https://claude.ai/artifact/CyH4YUyBUthBfLrWdErocD (nick tnt697), PR #165 nháp, STATUS có dòng KH10 và việc chờ thien.
- 10:46 sửa theo hướng hai lớp (6e6d2ed): repo lõi private, chỉ MCP mở ra ngoài; ga 2 đo CPU trên Workers (miễn phí 10 ms) và MCP Apps; câu hỏi 2, 3, 5 viết lại; nghiên cứu các hướng khác ở mục "Nghiên cứu".

## Bước tiếp theo
1. thien trả lời 5 câu trên trang kế hoạch (gửi comment) → chép nguyên văn vào "Câu hỏi đã chốt", đổi Trạng thái thành "đang chạy · Duyệt: <ngày>", đăng đè trang (`node artifacts/plan/make-plan.mjs docs/plans/2026-11-20-team-mcp.md <out> --url https://claude.ai/artifact/CyH4YUyBUthBfLrWdErocD`), merge #165 theo thien.
2. Ga 1: tạo repo private (tên theo câu 4) và lệnh đồng bộ một chiều kèm bước quét chặn `profile/`, `learning/`, `life/`.

## Đang chờ thien
- Trang: https://claude.ai/artifact/CyH4YUyBUthBfLrWdErocD (mở ở nick tnt697) · Hỏi gì: 5 câu (phần lõi gồm gì, gói máy chủ, đăng nhập, tên repo và connector, trang bằng MCP Apps hay artifact)
- Đăng lại: lệnh ở bước 1 rồi gọi Artifact với publish.json; nguồn trang là `docs/plans/2026-11-20-team-mcp.md` trên nhánh team-mcp-plan

## Lưu ý
- Câu 4 đã chốt ("Tách repo mới") giờ hiểu là repo **private**; đừng tạo repo public.
- Thread comment trên trang chọn có thể báo "not found" khi đọc; khi đó trả lời trong chat.
