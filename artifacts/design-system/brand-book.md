# thienui

Gu giao diện của thien, viết thành token. Nguồn là repo thienui (`packages/tokens/src` và `docs/taste.md`); trang này là bản để xem và để Claude đọc khi dựng trang, slide hay bản thiết kế cho thien. Hai bên lệch nhau thì thienui đúng.

## Gốc

Đồng bộ trước, đẹp sau. Mọi chi tiết khớp nhau (bo góc, cỡ, khoảng cách, font) quan trọng hơn ấn tượng đầu. Tối giản là bớt nhiễu cho mắt, không bớt chức năng. "Sang" là màu tiết chế, chi tiết nhỏ chính xác, căn lề thẳng hàng. Sáng tạo là lệch nhỏ trong khuôn khổ để tạo điểm nhấn.

Đồng bộ chưa đủ: luật làm chi tiết khớp nhau, không làm cả màn đẹp. Mỗi app vẫn cần một ý riêng cho đúng người dùng và chức năng của nó.

## Màu

- Nền trung tính và **một** màu chủ đạo (`primary`), độ đậm vừa. Màu ấm đi với nền ngà ấm (Claude Clay), màu lạnh đi với nền trắng lạnh (Slate Teal). Hai theme có cùng tên token, đổi theme không phải sửa chỗ dùng.
- Một chỗ nhấn mỗi màn. Phủ kín bằng màu đặc chưa thắng lần nào khi thien chấm; màu nhấn mức vừa là mặc định, mức ít khi màn có khối hình lớn (camera, ảnh, QR).
- Chữ trên `primary` dùng `primary-foreground` (chữ tối): chữ trắng trên màu clay chỉ đạt 3,1:1.
- Trạng thái (`ok`, `warn`, `alert`, `info`) tách khỏi màu chủ đạo, và có bản `-wash` để làm nền nhạt kiểu nhãn Notion.
- Không gradient nhiều màu.

## Chữ

- **Onest** cho cả app (Google Fonts). Tiêu đề chỉ to hơn và khít hơn, không đổi font. Chữ có chân chỉ cho màn đặc biệt như trang giới thiệu.
- Thang cỡ theo Dynamic Type của Apple, gốc 16px; chữ đọc `body` 17px là sàn.
- Tạo bậc bằng độ đậm trước khi tăng cỡ: `headline` cùng cỡ `body`, đậm 600.
- Chữ lớn giảm tracking (`-0.022em`), nhãn in hoa tăng (`0.09em`). Dòng chữ đọc dài tối đa `measure-prose` (68 ký tự).

## Khoảng cách

Lưới 8px, chia nhỏ 4px (`space-1` … `space-16`). Khoảng giữa hai nhóm gấp 2 đến 3 lần khoảng trong nhóm: trong nhóm `space-2`, giữa nhóm `space-6`.

## Bo góc

**Một mức, 8px** (`radius-control` = `radius-card`) cho nút, ô nhập, chip, tab, thẻ, hộp thoại. Tròn hẳn (`radius-full`) chỉ cho ảnh đại diện, chấm trạng thái, công tắc. Bo góc nút và ô lệch nhau là lỗi thien ghét nhất.

## Nút, thẻ, chuyển động

- Nút và ô cao 30px trên laptop, 36px trên điện thoại; vùng bấm luôn đủ 44px. Bộ cỡ to riêng cho điện thoại (nút 52px, bo 16px) đã thử và không được thích hơn.
- Nút nổi có gờ dưới 2px (`edge-lift`) cùng màu viền; nút chính dùng `press`.
- Thẻ phẳng có viền, nhiều nhất là `shadow-1`. Kính mờ chỉ cho đầu trang khi cuộn.
- Icon: Lucide.
- Chuyển động: lò xo nhẹ, không nảy rõ, ở menu và nút. Danh sách hiện lần lượt khi mở trang. Không chuyển động trên chữ, không chuyển động trên thao tác làm nhiều lần (đổi tab, menu lệnh).

## Bố cục

Bố cục là đòn bẩy lớn nhất: giữ màu và font, chỉ đổi cách xếp đã tăng 1 đến 2 điểm khi thien chấm. Thứ tự thắng: một vùng chính trên cùng, rồi việc tiếp theo, rồi việc cần xử lý. Chấm cả màn trên đúng thiết bị, không chấm từng mảnh.

## Không làm

- Mở màn bằng một hàng ô số liệu ngang nhau.
- Nút và tiêu đề quá to; màn không cân.
- Gradient tím xanh, thẻ có vạch màu bên trái, emoji làm đầu mục.
- Tự viết code "giả shadcn" thay vì dùng component thật.

## Trang artifact của thien

Các trang học, so sánh, chọn phương án trong repo thienai-workflow dùng bộ khung `artifacts/kit/kit.css`: nền ngà ấm của Claude Clay với màu nhấn teal của Slate Teal (xanh ngọc thắng hai lần ở vòng chọn màu), cùng font Onest và một bo góc 8px.

## Làm với người khác

Trong project chung, luật của nhóm đứng trước; gu này chỉ là đề xuất.
