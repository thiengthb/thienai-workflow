# Quy trình nhìn được: checkpoint 0 xong, sắp vào 1 (lớp sơ đồ)

Repo: thiengthb/thienai-workflow · Nhánh: visual-workflow-round-1 · PR: #124 (sẵn sàng, review xong, CI xanh, chờ thien merge)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBX3kxdpafP9q92LUbo · Cập nhật: 2026-11-18T15:24Z

## thien muốn gì
"hoàn thiện các mẫu artifact hiện có trong workflow và mở rộng artifact và tool ... dễ nắm bắt cho tôi, một người cần nhiều tính năng tương tác, hình ảnh, bố cục, sơ đồ, luồng, hơn chỉ là chữ ... gu của tôi phát triển và hoàn thiện theo từng ngày, chứ không giữ vĩnh viễn". Duyệt kế hoạch 2026-11-18: "ok, duyệt theo cả 4 đề xuất" (kế hoạch `docs/plans/2026-11-18-visual-workflow.md`, PR #123 đã merge).

## Đã xong
- Kế hoạch, dòng STATUS, câu gu "Thích" cho tuyến checkpoint kiểu tuyến tàu: PR #123 (đã merge)
- Trang duyệt kế hoạch (là bản "một nấc" của vòng gu 1): https://claude.ai/artifact/7hVBYXwyHZbfVp7mL4GsV4 (nick tnt697). Nguồn đã vào repo ở `round-1/mot-nac.html` (PR #124)
- Ba bản của màn "trang kế hoạch" (Quen, Một nấc, Thật xa) và 3 ví dụ thật: nguồn ở `docs/plans/2026-11-18-visual-workflow/round-1/`, PR #124 (nháp); `decide` thêm trường `links`
- Trang chọn đã đăng: https://claude.ai/artifact/7sM41GEbSa4kw3hxGwbqMK (nick tnt697); đề xuất ẩn: B Một nấc, lấy bản đồ ga theo ngày và núm vặn của C làm chi tiết thử ở ga 2

- thien chọn B · Một nấc (15:02Z, giống đề xuất), ô ghi chú trống; đã ghi vào hàng chờ gu, kế hoạch, STATUS (commit a6409f9 trên nhánh)
- Câu vì sao của thien đã chép nguyên văn vào `learning/frontend/taste-queue.md`; checkpoint 0 tick đủ 3/3; PR #124 chuyển sẵn sàng
- CodeRabbit 15 ý: sửa 3 (link https bằng new URL, ví dụ JSON trong README, đường dẫn FONTSOURCE), 12 ý trên hai bản phác đã đóng băng thì trả lời và ghi vào việc mới của checkpoint 2; mọi thread đã resolve; CI xanh ở d8f1a6a

## Bước tiếp theo
1. Chờ thien merge PR #124
2. Checkpoint 1: `artifacts/kit/diagram.js` (khối trơn viền mảnh, mũi tên, không tô, không bóng), xếp chỗ bằng thư viện có sẵn hạn một phiên, mục Sơ đồ trong `artifacts/kit/gallery.html`; nhánh mới từ main sau khi #124 merge
3. Nhớ ở ga 2: thử bản đồ ga theo ngày và núm vặn của bản C làm chi tiết thử; không lấy nền tối, chữ khổng lồ (thien thấy C "quá mới")

## Đang chờ thien
- Merge PR #124 khi CodeRabbit xong

## Lưu ý
- Không thêm dòng luật nào trước mốc 01/12 (luật gom vào checkpoint 5).
- "Một nấc" chỉ đổi bố cục và cách kể, giữ màu, font Onest, bo 8px của kit.
