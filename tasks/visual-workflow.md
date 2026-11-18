# Quy trình nhìn được: checkpoint 0, vòng thử gu đầu tiên

Repo: thiengthb/thienai-workflow · Nhánh: visual-workflow-round-1 · PR: #124 (nháp)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBX3kxdpafP9q92LUbo · Cập nhật: 2026-11-18T14:55Z

## thien muốn gì
"hoàn thiện các mẫu artifact hiện có trong workflow và mở rộng artifact và tool ... dễ nắm bắt cho tôi, một người cần nhiều tính năng tương tác, hình ảnh, bố cục, sơ đồ, luồng, hơn chỉ là chữ ... gu của tôi phát triển và hoàn thiện theo từng ngày, chứ không giữ vĩnh viễn". Duyệt kế hoạch 2026-11-18: "ok, duyệt theo cả 4 đề xuất" (kế hoạch `docs/plans/2026-11-18-visual-workflow.md`, PR #123 đã merge).

## Đã xong
- Kế hoạch, dòng STATUS, câu gu "Thích" cho tuyến checkpoint kiểu tuyến tàu: PR #123 (đã merge)
- Trang duyệt kế hoạch (là bản "một nấc" của vòng gu 1): https://claude.ai/artifact/7hVBYXwyHZbfVp7mL4GsV4 (nick tnt697). Nguồn trang chưa vào repo; đọc lại bằng read_artifact ở nick tnt697, nick khác thì dựng lại theo mục checkpoint 0 của kế hoạch

- Ba bản của màn "trang kế hoạch" (Quen, Một nấc, Thật xa) và 3 ví dụ thật: nguồn ở `docs/plans/2026-11-18-visual-workflow/round-1/`, PR #124 (nháp); `decide` thêm trường `links`
- Trang chọn đã đăng: https://claude.ai/artifact/7sM41GEbSa4kw3hxGwbqMK (nick tnt697); đề xuất ẩn: B Một nấc, lấy bản đồ ga theo ngày và núm vặn của C làm chi tiết thử ở ga 2

## Bước tiếp theo
1. Khi thien gửi: đọc `decisions/visual-workflow-taste-r1` (db của trang chọn, nick tnt697) và comment; chép nguyên văn câu vì sao vào `learning/frontend/taste-queue.md`, tick việc cuối checkpoint 0 trong kế hoạch, cập nhật STATUS, đẩy lên nhánh `visual-workflow-round-1`, chuyển PR #124 sang sẵn sàng (CodeRabbit), nhắc thien merge (PR có file `artifacts/`)
2. Sau đó: checkpoint 1, lớp sơ đồ dùng chung (`artifacts/kit/diagram.js`)

## Đang chờ thien
- Chọn một bản và viết một câu vì sao: https://claude.ai/artifact/7sM41GEbSa4kw3hxGwbqMK (mở ở nick tnt697). Nick khác không đọc được db của trang: hỏi thien chép kết quả bằng nút "Chép kết quả"

## Lưu ý
- Không thêm dòng luật nào trước mốc 01/12 (luật gom vào checkpoint 5).
- "Một nấc" chỉ đổi bố cục và cách kể, giữ màu, font Onest, bo 8px của kit.
