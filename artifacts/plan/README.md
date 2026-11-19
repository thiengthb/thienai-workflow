# Mẫu trang kế hoạch

Trang dựng thẳng từ một file `docs/plans/*.md`, để thien nắm kế hoạch bằng mắt và trả lời câu hỏi bằng nút, không đọc hết file markdown. Bố cục chọn theo trạng thái của kế hoạch (bảng ở mục "File kế hoạch viết thế nào"); bản gốc là "Một nấc" thien chọn ở vòng gu 1 (2026-11-18): một cột đọc, toàn cảnh trước, tuyến checkpoint kiểu tuyến tàu. Kế hoạch đầy đủ ở `docs/plans/2026-11-18-visual-workflow.md`, checkpoint 2.

## Trang làm được gì

- Đầu trang: tên, mục tiêu, trạng thái, ngày duyệt, thanh tiến độ theo số việc đã tick.
- Đang ở đâu: ba dòng có nhãn; "thien cần làm" tô cam. Dòng không nhãn gập vào "Ghi chú thêm". Thẻ "Ga đang chạy" là link `#ck-N`, Tab tới được.
- Tuyến checkpoint: ga xong tô xanh (mực `--ink-1`), ga đang chạy viền cam (`--ink-2`), ga mốc (tên có "mốc 01/12") viền nét đứt vàng, ga bỏ gạch ngang. Mỗi ga có "Xong khi", số việc, số phiên ước, việc con gập mở (ga đang chạy mở sẵn).
- Mục lục: thanh dính trên cùng ở điện thoại và máy tính bảng, tự ẩn khi cuộn xuống đọc, hiện lại khi cuộn lên hay khi Tab vào (thien chọn 19/11); từ 1160px là cột bên trái kèm tiến độ gọn (thien góp ý 19/11).
- Bản đồ ga theo ngày (chi tiết thử, lấy từ bản Thật xa của vòng gu 1, nền sáng; thien bấm Thích 19/11): ga xong ở ngày xong, mốc đứng yên đúng ngày, ga còn lại nối nhau từ hôm nay. Núm "mấy phiên mỗi tuần" chỉ hiện khi mọi ga còn lại có dòng `Ước:`. Cuộn qua bản đồ đầy đủ thì bản gọn hiện dính dưới mục lục (cách 8px): chỉ chấm và tên ga đang đọc, sáng theo ga cả khi cuộn ngược; bấm một ga thì nhảy tới ga đó.
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

**Khối của trang (KH9, từ 2026-11-19).** Trang lắp từ các khối `dang-o` (Đang ở đâu), `tuyen` (tuyến ga), `ban-do` (bản đồ ga theo ngày, nằm trong `tuyen`), `phuong-an`, `cau-hoi` (câu hỏi hay góp ý, kèm khối gửi), `them`, `nhat-ky`. Mặc định khối nào có nội dung thì có, theo thứ tự đó. Muốn khác (bỏ khối, đổi thứ tự) thì thêm một dòng dưới dòng "Trạng thái:", có lý do:

```markdown
Khối: cau-hoi, tuyen, nhat-ky · Vì: kế hoạch chờ duyệt, câu hỏi là việc chính
```

Khối không có trên trang thì CSS và JS của nó cũng không (`kit/pack.mjs`), nên bỏ khối là trang nhẹ đi. Lệnh in danh sách khối đã dùng; tên sai hay thiếu "Vì:" thì báo "lệch". 

**Bố cục theo trạng thái (KH9 ga 3, thien chọn B cả ba loại ở vòng gu 5, 2026-11-19).** Lệnh dựng chọn theo dòng "Trạng thái:":

| Trạng thái | Bố cục | Trang ra sao | Khối mặc định |
|---|---|---|---|
| chờ duyệt, còn câu hỏi | `phieu-hoi` | Câu hỏi là phiếu ngay dưới tên, dải số nhảy tới từng câu; tuyến ga ở dưới, gọi là bối cảnh, gập hết | cau-hoi, tuyen, ban-do, phuong-an, them, nhat-ky |
| đang chạy, tạm dừng | `bang-tien-do` | Bốn ô số dưới tên (việc xong, ga, còn lại ước, bạn cần làm), ga xếp vào ba cột Xong · Đang chạy · Chưa tới | như mặc định ở trên |
| xong, bỏ | `the-ket-qua` | Bốn con số kết quả, mỗi ga một thẻ "Đạt / Chưa đạt", việc chưa tick gom vào thẻ "Chuyển đi" | dang-o, tuyen, phuong-an, them, nhat-ky |
| chờ duyệt mà không có câu hỏi | `mot-cot` | Bản "Một nấc" của vòng gu 1: một cột, tuyến ga dọc | như mặc định ở trên |

Ở ba bố cục mới, mục tiêu dài gập còn ba dòng, có nút "Đọc hết mục tiêu". Trắng đen: cột, ô, thẻ phân biệt bằng viền và độ đậm; màu chỉ để báo (cảnh báo cho ga đóng khi chưa xong, mốc). Muốn khác thì thêm một dòng dưới dòng "Trạng thái:", có lý do: `Bố cục: mot-cot · Vì: muốn đọc từng ga theo tuyến`. Lệnh in bố cục đã dùng; tên sai hay thiếu "Vì:" thì báo "lệch".

Trạng thái "chờ duyệt" dùng cho bản gửi thien duyệt (file nằm trên nhánh, chưa merge). Dòng "Ước:" và mục "Câu hỏi" chưa có trong mẫu PLAN; luật thêm vào mẫu gom ở mốc 01/12 (checkpoint 5 của kế hoạch).

## Cách AI dựng một trang

1. `node artifacts/plan/make-plan.mjs docs/plans/<file>.md /tmp/plan` (thêm `--url <link trang cũ>` để đăng đè, `--trial "..."` khi trang có thứ mới thật sự cần thien thử; không truyền thì trang không có chi tiết thử, từ 2026-11-19). Lệnh in chỗ lệch mẫu kèm số dòng; chỉ thiếu tiêu đề hay thiếu checkpoint mới chặn dựng.
2. Gọi Artifact với đúng tham số trong `/tmp/plan/publish.json`. Mở thử: `/tmp/plan/preview.html`.
   Trang mới thì thêm ` · Trang: <link> (nick tntXXX)` vào dòng "Trạng thái:" của file kế hoạch: trang tổng quan (`templates/progress-page.mjs`) dẫn sang link đó thay vì file markdown, và lần sau đăng đè bằng `--url <link>`.
3. Khi thien gửi: đọc comment và `plans/<tên file>` (ArtifactData), chép câu trả lời nguyên văn vào file kế hoạch hay PR.

Chỉ kiểm, không dựng: `node artifacts/plan/make-plan.mjs --check docs/plans` (thoát 1 khi có lỗi chặn dựng).

## File

| File | Là gì |
|---|---|
| `parse-plan.mjs` | Đọc file kế hoạch thành dữ liệu, kèm danh sách chỗ lệch mẫu (lỗi, lệch, ghi chú) có số dòng |
| `make-plan.mjs` | Dựng thân trang, gộp kit, ghi `publish.json`; `--check` để chỉ kiểm |
| `template.html` | Khung và CSS của trang (chỉ dùng tên màu trong kit) |
| `plan.js` | Mục lục, bản đồ ngày, núm vặn, câu hỏi, lưu và gửi |
| `fixture.md` | Kế hoạch mẫu cho test và `kit/check-pages.mjs` (chờ duyệt, bố cục phiếu hỏi) |
| `fixture-running.md`, `fixture-closed.md` | KH9 lúc đang chạy và KH6 lúc đã đóng, chép từ vòng gu 5, để kiểm bảng tiến độ và thẻ kết quả |
