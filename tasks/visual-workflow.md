# Quy trình nhìn được: checkpoint 1, lớp sơ đồ dùng chung (chờ thien bấm thử)

Repo: thiengthb/thienai-workflow · Nhánh: visual-diagram-layer · PR: #126 (nháp)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBYey4CuVVfhKvuPEUY · Cập nhật: 2026-11-18T15:55Z

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
- PR #124 đã merge (thien nhắn "ok bạn merge giúp mình", 22:31); PR #125 sửa STATUS sau merge, đã merge (thien nhắn "merge #125")

- Checkpoint 1 dựng xong (18/11, 22:59): `artifacts/kit/diagram.js` (dagre 3.1.3 gắn ở `artifacts/kit/vendor/`, lưới dự phòng), mục Sơ đồ trong `gallery.html`; check-pages 0 lỗi; kế hoạch tick 4 việc, STATUS 7/24; PR #126 (nháp)
- Trang mẫu thành phần có mục Sơ đồ đã đăng: https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst (nick tnt697; link HuyQj… trong artifacts/README.md là của nick khác)

## Bước tiếp theo
1. thien bấm thử mục Sơ đồ trên điện thoại; sửa theo góp ý (đăng đè bằng publish_files, slug dfe76dad-d260-4a9b-bb21-129c93256d0b), rồi chuyển PR #126 sẵn sàng, xử lý CodeRabbit, chờ thien merge
2. Sau merge: checkpoint 2, mẫu kế hoạch nhìn được (`artifacts/plan/make-plan.mjs`), dùng `Diagram.mount` cho tuyến checkpoint; nhớ 7 ý review PR #124 ghi trong kế hoạch
3. Nhớ ở ga 2: thử bản đồ ga theo ngày và núm vặn của bản C làm chi tiết thử; không lấy nền tối, chữ khổng lồ (thien thấy C "quá mới")

## Đang chờ thien
- Bấm thử mục Sơ đồ (5 bước) trên điện thoại: https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst (mở ở nick tnt697)

## Lưu ý
- Không thêm dòng luật nào trước mốc 01/12 (luật gom vào checkpoint 5).
- "Một nấc" chỉ đổi bố cục và cách kể, giữ màu, font Onest, bo 8px của kit.
