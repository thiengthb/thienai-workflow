# Quy trình nhìn được: checkpoint 0, vòng thử gu đầu tiên

Repo: thiengthb/thienai-workflow · Nhánh: chưa có (tạo nhánh mới từ main) · PR: chưa có
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBWDbXVGqmzESXaXn7P · Cập nhật: 2026-11-18T14:33Z

## thien muốn gì
"hoàn thiện các mẫu artifact hiện có trong workflow và mở rộng artifact và tool ... dễ nắm bắt cho tôi, một người cần nhiều tính năng tương tác, hình ảnh, bố cục, sơ đồ, luồng, hơn chỉ là chữ ... gu của tôi phát triển và hoàn thiện theo từng ngày, chứ không giữ vĩnh viễn". Duyệt kế hoạch 2026-11-18: "ok, duyệt theo cả 4 đề xuất" (kế hoạch `docs/plans/2026-11-18-visual-workflow.md`, PR #123 đã merge).

## Đã xong
- Kế hoạch, dòng STATUS, câu gu "Thích" cho tuyến checkpoint kiểu tuyến tàu: PR #123 (đã merge)
- Trang duyệt kế hoạch (là bản "một nấc" của vòng gu 1): https://claude.ai/artifact/7hVBYXwyHZbfVp7mL4GsV4 (nick tnt697). Nguồn trang chưa vào repo; đọc lại bằng read_artifact ở nick tnt697, nick khác thì dựng lại theo mục checkpoint 0 của kế hoạch

## Bước tiếp theo
1. Đọc `artifacts/decide/README.md`, viết `decision.json` cho màn "trang kế hoạch": ba phương án Quen (kit hiện tại, kế hoạch là bảng và danh sách), Một nấc (trang duyệt ở trên), Thật xa (Claude chọn một hướng ngoài vùng quen, kèm 3 ví dụ thật, mỗi cái một câu "để ý chỗ này")
2. Để nguồn trang ở `docs/plans/2026-11-18-visual-workflow/round-1/` trong nhánh làm việc, dựng bằng `node artifacts/decide/make-decision.mjs`, đăng, ghi link vào "Đang chờ thien" của sổ này
3. Vòng duyệt hỏi tách: "làm được việc chưa" trước, "có đẹp không" sau; thien chọn kèm một câu vì sao, chép nguyên văn vào `learning/frontend/taste-queue.md` và tick checkpoint 0

## Đang chờ thien
Không.

## Lưu ý
- Không thêm dòng luật nào trước mốc 01/12 (luật gom vào checkpoint 5).
- "Một nấc" chỉ đổi bố cục và cách kể, giữ màu, font Onest, bo 8px của kit.
