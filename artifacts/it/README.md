# Bộ kit bài IT: bàn thử và bảng dán

Phần thêm cho mẫu buổi học (`../lesson/`), dành cho bài frontend và BA. Trang vẫn là một buổi theo khung chung (ôn, thử trước, hiểu sau, câu hỏi, tự nói lại, góp ý), có thêm một **sân khấu** để tay làm thay cho đọc chữ, như sa bàn của bài chiến tranh. thien chọn kiểu này ở vòng `it-lesson-stage-r1` (2026-11-14), trong 3 kiểu: một màn app chung cho hai môn, mỗi môn một sân khấu (bàn thử và bảng dán), tự gõ code và tự viết.

## Trang làm được gì

- Khung rộng (từ 900px): sân khấu bên trái đứng yên, các bước bên phải. Điện thoại: sân khấu ở trên, bước ở dưới. Bước không cần sân khấu (ôn, câu hỏi, góp ý) thì sân khấu ẩn, trang về một cột như bài thường.
- **Bàn thử (frontend):** một màn app thật trong khung điện thoại, cạnh đó là núm vặn (ô màu, nhóm nút). Vặn núm là màn đổi ngay, và dòng CSS tương ứng sáng lên: đi từ màn thật, tới núm, tới code. Nút **Soi** viền đứt và đánh số mọi chỗ đang dùng thứ đang học (ví dụ màu nhấn), kèm số chỗ. Một trang có thể có nhiều bàn (nhiều app), mỗi bước chọn bàn nào hiện.
- **Bảng dán (BA):** một bảng có ô (lưới 2×2, làn, các bước của luồng) và thẻ người hay thẻ việc. Bấm thẻ để nghe người đó nói (một dải lời nói dưới bảng), bấm thẻ rồi bấm ô để đặt. Kiểm tra thì mỗi thẻ có ký hiệu ✓ (khớp bản mẫu) hay ! (khác), lời giải thích của các thẻ khác hiện bên cột bước. Nút "Xem bản mẫu" dời thẻ về chỗ của bản mẫu ngay trên bảng, bấm lại để về cách mình xếp.
- Mọi thao tác là bấm, không kéo thả, để phần tự lưu bấm lại đúng thứ tự là về đúng chỗ (tải lại, tắt màn, mở máy khác). Thẻ trên bảng không đổi chỗ trong trang, chỉ đổi vị trí vẽ, cũng vì lý do đó.

Vì sao hợp cách học đã chọn (`learning/teaching/README.md`): bước mở đầu chỉ cho vặn thử hay nghe từng người, chưa hỏi gì (cảm nhận trước); thử trước có chốt lựa chọn, rồi ý chính nhắc lại đúng lựa chọn đó; câu "tự thấy" dùng chính sân khấu (ví dụ bấm thử màu đỏ rồi nhìn các dòng tiền ra). Màn thật → núm → code là "concreteness fading"; ô chỉnh được ngay trong bài là cách của Josh Comeau. Bảng dán thay cho đoạn văn tả các bên liên quan hay luồng việc, đúng góp ý của thien sau BA 2 (nhiều chữ, ít hình, không biết luồng đi).

Bài mẫu đã đăng (2026-11-14): [Frontend 6, màu cho app](https://claude.ai/artifact/WUYEVkEDsSLoafwvnhH9PY) và [BA 3, các bên liên quan](https://claude.ai/artifact/UNZZ9CFfeCWF2g3Raz9wpC). Hai trang này cũng là nháp của hai buổi đó.

## Cách AI soạn một bài

1. `node artifacts/lesson/make-lesson.mjs learning/frontend/pages/lesson-NN.html` (hoặc `learning/ba/pages/…`). Trang chưa có thì script chép mẫu có sân khấu ra rồi dừng: `template-frontend.html` (nội dung mẫu là Frontend 6, màu cho app) hay `template-ba.html` (BA 3, các bên liên quan).
2. Thay mọi chỗ `__…__` và nội dung. Màn app của bàn thử viết thẳng trong `.screen`, CSS của màn đặt trong `<style>` của trang, dùng biến và `data-*` do núm đổi. Chạy lại đúng lệnh ở bước 1: script chép kit, khung và sân khấu vào trang, tự kiểm trên điện thoại và laptop, ghi `publish.json`.
3. Gọi Artifact với đúng tham số trong `publish.json`. Khi thien gửi: làm như bước 5 trong `../lesson/README.md`; kết quả có thêm `R.tried`, `R.picks`, `R.knobs`, `R.boards`, `R.heard`, và tóm tắt gửi Claude có sẵn các dòng đó.

## Quy ước trong trang

| Thứ | Viết thế nào |
|---|---|
| Chỗ sân khấu | `<div id="stage">` ngay sau `.top`, một lần cho cả trang, chứa các `.pane` |
| Sân khấu ở mỗi bước | `data-stage="<tên pane>"` trên `<section class="step">`; không ghi thì ẩn. Bảng dán thêm `@listen` (`"who@listen"`) để chỉ cho nghe, chưa cho xếp |
| Bàn thử | `<div class="pane bench" data-pane="bank">` chứa `.phone > .screen` (màn app), `.side` (núm và code bên cạnh trên khung rộng), `.code` thứ hai ngay trong bàn (code dưới cùng trên điện thoại) |
| Núm | `<div class="knob" data-knob="accent" data-var="--a" data-min="3">` với các `<button data-val="#0f766e" data-name="Xanh ngọc">`. Có `data-var` thì đặt biến CSS trên `.screen`; không có thì đặt `data-<knob>` trên `.screen`. `aria-pressed="true"` là giá trị lúc mở. Ô màu: class `sw` và `style="--sw:…"`; nhóm nút: bọc trong `.seg` |
| Code sáng lên | Dòng `<span data-line="accent">`, chỗ giá trị `<span data-v="accent">` (lấy `data-code` của nút nếu có, không thì `data-val`) |
| Soi | `<button class="soi-btn" data-soi-toggle>`; chỗ được soi trong màn: `data-soi` (luôn), `data-soi="vua nhieu"` (chỉ khi một núm đang ở giá trị đó); `<span class="soi-count" data-text="… {n} chỗ">` |
| Đặt sẵn núm | `<button data-set="bank" data-vals="accent=#dc2626; amount=nhieu" data-done="saw-red">`, không tính là đã thử |
| Chốt lựa chọn | `<button data-pick="d1" data-of="bank">`; nhắc lại vào `<p class="fb" data-echo="d1" [data-prefix]>` |
| Danh sách đã thử | `<div class="tried" data-tried="bank.accent">` |
| Bảng dán | `<div class="pane board" data-pane="who" data-answer='{"thẻ":"ô"}' [data-hear="4"]>` chứa `.bd-area` (gồm `.zones`, `.tray`, các thẻ) và `.say-bar` |
| Ô | `.zones.grid2` (lưới 2×2, thêm `.axis.y`, `.axis.x`) hay `.zones.flow` (các bước nối mũi tên); mỗi ô `<button class="zone" data-z="z1" data-reset>`, ô chính thêm `key` |
| Thẻ | `<button class="bd-card" data-c="ph" style="--c:#be185d" data-say="lời họ nói" data-why="giải thích khi xếp khác bản mẫu"><i>PH</i>Phụ huynh</button>` |
| Kiểm tra, bản mẫu | `<button data-check="who" data-need="placed-who" disabled>`, nhắc kết quả vào `[data-echo="who"]` (`data-same` khi khớp hết); `<button data-answer-of="who">` |
| Khóa mở nút | `tried-<pane>.<núm>` (đã thử đủ `data-min`), `knob-<núm>`, `soi-<pane>`, `d1` (đã chốt), `heard-<pane>` (đã nghe đủ `data-hear`), `heard-<thẻ>`, `placed-<pane>`, `checked-<pane>`, và `data-done` của nút đặt sẵn |
| Điều kiện kỹ thuật | `<style id="it-css">` sau `lesson-css`; `<script id="it-js">` sau `lesson-js`, trước `lesson-kit` |

## File

| File | Là gì |
|---|---|
| `it.css` | Bố cục sân khấu, bàn thử, bảng dán |
| `it-stage.js` | Núm, soi, code sáng lên, chốt; xếp thẻ, nghe, kiểm, bản mẫu; bước nào hiện pane nào |
| `template-frontend.html` | Buổi mẫu có hai bàn thử (app ngân hàng cho người lớn tuổi, app học từ cho học sinh) |
| `template-ba.html` | Buổi mẫu có hai bảng (lưới quyền và quan tâm, luồng 4 bước) |

## Chưa làm, để sau khi thien học thử

- Nối hai thẻ bằng đường (sơ đồ ai nói với ai), làn bơi nhiều người cho luồng việc.
- Ô gõ CSS thật (hướng C ở vòng chọn) cho phần cuối buổi khi thien đã quen.
- Hai màn cạnh nhau để so trước và sau trên cùng bàn thử.
