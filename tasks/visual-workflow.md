# Quy trình nhìn được: checkpoint 2, mẫu kế hoạch nhìn được

Repo: thiengthb/thienai-workflow · Nhánh: plan-page · PR: chưa mở
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBXA5E7aCCYQ6jZtptJ · Cập nhật: 2026-11-18T18:57Z

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
- PR #126 (lớp sơ đồ) và #127 (làm mới kit: nút, icon Lucide, thành phần mới, bảng màu giấy trắng xanh petrol, `kit/pack.mjs`) đã merge 19/11 (thien nhắn "merge"); PR #128 ghi STATUS
- thien bấm sơ đồ trên điện thoại, không lỗi: checkpoint 1 xong; câu vì sao bảng màu đã vào hàng chờ gu (PR #129, tự merge)
- thien chê nút Nhấn sáng hẳn ra (00:31): PR #130 bỏ quầng sáng, chế độ tối dùng petrol đậm chữ trắng và --primary-fill; trang mẫu đã đăng đè; chờ thien merge #130
- Vòng gu 3 (00:42): thien muốn rút style slide MLN122 (repo thiengthb/mln122-nhom9) áp vào sơ đồ, hình, biểu đồ, nền. Đã nghiên cứu, chạy bộ kiểm màu, dựng 3 mức; trang chọn https://claude.ai/artifact/RMSfapmLBg7FvoQ5PFDgad, trang bấm thử https://claude.ai/artifact/9tkpy5E3vqvs5AXqnWJor2; nguồn PR #131 (nháp, chồng #130), kế hoạch PR #132
- thien chọn A · Thêm mực cam (01:11): mực hình --ink-1/2/3, em.k1/k2, kind sơ đồ, .fill-k*, .callout đã vào kit trong PR #131; trang mẫu đăng đè; kết quả ghi ở PR #133 (tự merge)
- 19/11 01:21 thien nhắn merge: #130 (sửa thêm hover nút Nhấn theo CodeRabbit) và #131 (sửa hai ý CodeRabbit ở nguồn vòng 3) đã merge; #134 ghi STATUS và một dòng usage-log (277 lượt, đọc lại 110,9 triệu token)

- 19/11 (phiên mới, cùng link chat): checkpoint 2 dựng phần máy trên nhánh `plan-page`, commit 55f7725: `artifacts/plan/` (parse-plan.mjs, make-plan.mjs, template.html, plan.js, fixture.md), test `.github/scripts/make-plan.test.mjs`, trang mẫu trong check-pages, check-tokens; kế hoạch thêm dòng "Ước:" cho ga 2–5. Bản đồ ga theo ngày và núm vặn đã vào làm chi tiết thử; 7 ý review đã áp. check-pages 0 lỗi.

## Bước tiếp theo
1. Viết `artifacts/plan/README.md`, đăng trang thử của chính kế hoạch này (`node artifacts/plan/make-plan.mjs docs/plans/2026-11-18-visual-workflow.md /tmp/plan-vw`), mở PR nháp, sửa STATUS (dòng kế hoạch còn ghi chờ PR #127, #130 đã merge)
2. Còn của checkpoint 2: trang tổng quan dẫn sang trang kế hoạch; điều kiện xong là kế hoạch kế tiếp gửi thien duyệt bằng trang này

## Đang chờ thien
Không.

## Lưu ý
- Không thêm dòng luật nào trước mốc 01/12 (luật gom vào checkpoint 5).
- "Một nấc" chỉ đổi bố cục và cách kể, giữ màu, font Onest, bo 8px của kit.
