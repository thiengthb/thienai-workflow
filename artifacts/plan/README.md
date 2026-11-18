# Mẫu trang kế hoạch

Trang dựng thẳng từ một file `docs/plans/*.md`, để thien nắm kế hoạch bằng mắt và trả lời câu hỏi bằng nút, không đọc hết file markdown. Bố cục là bản "Một nấc" thien chọn ở vòng gu 1 (2026-11-18): một cột đọc, toàn cảnh trước, tuyến checkpoint kiểu tuyến tàu. Kế hoạch đầy đủ ở `docs/plans/2026-11-18-visual-workflow.md`, checkpoint 2.

## Trang làm được gì

- Đầu trang: tên, mục tiêu, trạng thái, ngày duyệt, thanh tiến độ theo số việc đã tick.
- Đang ở đâu: ba dòng có nhãn; "thien cần làm" tô cam. Dòng không nhãn gập vào "Ghi chú thêm". Thẻ "Ga đang chạy" là link `#ck-N`, Tab tới được.
- Tuyến checkpoint: ga xong tô xanh (mực `--ink-1`), ga đang chạy viền cam (`--ink-2`), ga mốc (tên có "mốc 01/12") viền nét đứt vàng, ga bỏ gạch ngang. Mỗi ga có "Xong khi", số việc, số phiên ước, việc con gập mở (ga đang chạy mở sẵn).
- Bản đồ ga theo ngày (chi tiết thử, lấy từ bản Thật xa của vòng gu 1, nền sáng): ga xong ở ngày xong, mốc đứng yên đúng ngày, ga còn lại nối nhau từ hôm nay. Núm "mấy phiên mỗi tuần" chỉ hiện khi mọi ga còn lại có dòng `Ước:`. Bản đồ dính dưới mục lục khi đọc tuyến; ga đang đọc sáng lên, cả khi cuộn ngược; bấm một ga trên bản đồ thì nhảy tới ga đó.
- Phương án: bảng "Các phương án đã xét" thành thẻ; hàng in đậm là phương án đã chọn, cột cuối của nó đổi tên thành "Chỗ yếu".
- Câu hỏi: mỗi câu là một nhóm nút, đề xuất chọn sẵn ("để nguyên là ok"). Ô ghi chú của thien không bao giờ bị ghi đè; câu trả lời sẽ gửi hiện ở ô xem trước riêng. "Gửi cho Claude" gửi comment; không gửi được thì tự chép. Đổi bất cứ gì thì dòng "Đã chép" hay "Đã gửi" cũ tự xoá.
- Kế hoạch đã trả lời (`## Câu hỏi đã chốt`, hay tiêu đề có "đã trả lời") thì câu hỏi chỉ để đọc, phần cuối thành "Góp ý": chi tiết thử (Thích, Không) và ô ghi chú.
- Mục khác của file (Nghiên cứu, Thời gian, Quyết định lúc duyệt...) nằm ở "Thêm", gập mở; "Đã đổi" và "Lỗi gặp" ở "Nhật ký".
- Lưu vào máy và db của trang ở `plans/<tên file>`; nút chỉ bật sau khi đã đọc bản lưu. Không có ô hỏi Claude (kế hoạch ghi "không thêm nút hỏi Claude vào mẫu mới").

## File kế hoạch viết thế nào

Theo `templates/PLAN.template.md`. Trang đọc thêm ba thứ, đều không bắt buộc:

```markdown
### 2. Mẫu kế hoạch nhìn được
Xong khi: ...
Ước: 2 phiên            ← số phiên ước cho ga (1–2, 1,5 cũng được; "Ước: mốc" cho ga mốc)
- [ ] ...

## Câu hỏi
1. Làm đợt 1 ngay không? Đề xuất: có. Lý do: ...      ← trang tự làm nút "Đồng ý: có" và "Không"
2. Trang đặt ở đâu?
   - Trong `artifacts/plan/` (đề xuất)                 ← hay liệt kê lựa chọn, đánh dấu một "(đề xuất)"
   - Trong `templates/`
```

Trạng thái "chờ duyệt" dùng cho bản gửi thien duyệt (file nằm trên nhánh, chưa merge). Dòng "Ước:" và mục "Câu hỏi" chưa có trong mẫu PLAN; luật thêm vào mẫu gom ở mốc 01/12 (checkpoint 5 của kế hoạch).

## Cách AI dựng một trang

1. `node artifacts/plan/make-plan.mjs docs/plans/<file>.md /tmp/plan` (thêm `--url <link trang cũ>` để đăng đè, `--trial "..."` để đổi chi tiết thử). Lệnh in chỗ lệch mẫu kèm số dòng; chỉ thiếu tiêu đề hay thiếu checkpoint mới chặn dựng.
2. Gọi Artifact với đúng tham số trong `/tmp/plan/publish.json`. Mở thử: `/tmp/plan/preview.html`.
3. Khi thien gửi: đọc comment và `plans/<tên file>` (ArtifactData), chép câu trả lời nguyên văn vào file kế hoạch hay PR.

Chỉ kiểm, không dựng: `node artifacts/plan/make-plan.mjs --check docs/plans` (thoát 1 khi có lỗi chặn dựng).

## File

| File | Là gì |
|---|---|
| `parse-plan.mjs` | Đọc file kế hoạch thành dữ liệu, kèm danh sách chỗ lệch mẫu (lỗi, lệch, ghi chú) có số dòng |
| `make-plan.mjs` | Dựng thân trang, gộp kit, ghi `publish.json`; `--check` để chỉ kiểm |
| `template.html` | Khung và CSS của trang (chỉ dùng tên màu trong kit) |
| `plan.js` | Mục lục, bản đồ ngày, núm vặn, câu hỏi, lưu và gửi |
| `fixture.md` | Kế hoạch mẫu cho test và `kit/check-pages.mjs` |
