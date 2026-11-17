# Bộ kit bài IT: bàn thử và bảng dán

Phần thêm cho mẫu buổi học (`../lesson/`), dành cho bài frontend và BA. Trang vẫn là một buổi theo khung chung (ôn, thử trước, hiểu sau, câu hỏi, tự nói lại, góp ý), có thêm một **sân khấu** để tay làm thay cho đọc chữ, như sa bàn của bài chiến tranh. thien chọn kiểu này ở vòng `it-lesson-stage-r1` (2026-11-14), trong 3 kiểu: một màn app chung cho hai môn, mỗi môn một sân khấu (bàn thử và bảng dán), tự gõ code và tự viết.

## Trang làm được gì

- Khung rộng (từ 900px): sân khấu bên trái đứng yên, các bước bên phải. Điện thoại: sân khấu ở trên, bước ở dưới. Bước không cần sân khấu (ôn, câu hỏi, góp ý) thì sân khấu ẩn, trang về một cột như bài thường.
- **Bàn thử (frontend):** một màn app thật trong khung điện thoại, cạnh đó là núm vặn (ô màu, nhóm nút). Vặn núm là màn đổi ngay, và dòng CSS tương ứng sáng lên: đi từ màn thật, tới núm, tới code. Nút **Soi** viền đứt và đánh số mọi chỗ đang dùng thứ đang học (ví dụ màu nhấn), kèm số chỗ. Một trang có thể có nhiều bàn (nhiều app), mỗi bước chọn bàn nào hiện.
- **Bảng dán (BA):** một bảng có ô (lưới 2×2, làn, các bước của luồng) và thẻ người hay thẻ việc. Bấm thẻ để nghe người đó nói (một dải lời nói dưới bảng), bấm thẻ rồi bấm ô để đặt. Kiểm tra thì mỗi thẻ có ký hiệu ✓ (khớp bản mẫu) hay ! (khác), lời giải thích của các thẻ khác hiện bên cột bước. Nút "Xem bản mẫu" dời thẻ về chỗ của bản mẫu ngay trên bảng, bấm lại để về cách mình xếp.
- **Bảy cách tương tác thêm** (thien bảo "thử hết", 2026-11-14). Bài thật chọn 2–3 cái hợp chủ đề, đừng nhồi cả bảy:
  - *Kính* (bàn thử): núm "Xem bằng mắt" cho nhìn màn như khi nheo mắt, mắt 70 tuổi, mù màu đỏ-lục. Chỉ hiện ở bước `@lens`.
  - *Nhìn 5 giây* (bàn thử): màn bị che, bấm thì mở đúng 5 giây rồi che lại, hỏi ngay mắt đã dừng ở đâu. Sau đó bỏ che để vặn.
  - *Làm theo bản thiết kế* (bàn thử): bản thiết kế nhỏ cạnh màn, thanh đo "Giống bao nhiêu %", vặn tới khi giống hệt.
  - *Thẻ lên tiếng* (bảng dán): kiểm xong, người bị xếp sai tự nói hậu quả (ví dụ IT: "Tôi chặn"). Lời có thể khác theo ô bị đặt nhầm.
  - *Phỏng vấn mở thẻ* (bảng dán): chọn câu hỏi cho một người; hỏi gợi sẵn giải pháp thì họ chỉ gật, hỏi về một lần làm thật thì lộ ra một bên liên quan chưa ai nhắc, thẻ mới hiện lên bảng.
  - *Tua 3 tháng* (bảng dán): dự án chạy tiếp theo cách mình xếp, mỗi thẻ sai thành một mốc trên dòng thời gian. Ghi rõ là mô phỏng.
- Mọi thao tác là bấm, không kéo thả, để phần tự lưu bấm lại đúng thứ tự là về đúng chỗ (tải lại, tắt màn, mở máy khác). Thẻ trên bảng không đổi chỗ trong trang, chỉ đổi vị trí vẽ, cũng vì lý do đó.

Vì sao hợp cách học đã chọn (`learning/teaching/README.md`): bước mở đầu chỉ cho vặn thử hay nghe từng người, chưa hỏi gì (cảm nhận trước); thử trước có chốt lựa chọn, rồi ý chính nhắc lại đúng lựa chọn đó; câu "tự thấy" dùng chính sân khấu (ví dụ bấm thử màu đỏ rồi nhìn các dòng tiền ra). Màn thật → núm → code là "concreteness fading"; ô chỉnh được ngay trong bài là cách của Josh Comeau. Bảng dán thay cho đoạn văn tả các bên liên quan hay luồng việc, đúng góp ý của thien sau BA 2 (nhiều chữ, ít hình, không biết luồng đi).

Bài mẫu đã đăng (2026-11-14): [Frontend 6, màu cho app](https://claude.ai/artifact/WUYEVkEDsSLoafwvnhH9PY) và [BA 3, các bên liên quan](https://claude.ai/artifact/UNZZ9CFfeCWF2g3Raz9wpC). Hai trang này cũng là nháp của hai buổi đó.

## Cách AI soạn một bài

1. `node artifacts/lesson/make-lesson.mjs learning/frontend/pages/lesson-NN.html` (hoặc `learning/ba/pages/…`). Trang chưa có thì script chép mẫu có sân khấu ra rồi dừng: `template-frontend.html` (nội dung mẫu là Frontend 6, màu cho app) hay `template-ba.html` (BA 3, các bên liên quan).
2. Thay mọi chỗ `__…__` và nội dung. Màn app của bàn thử viết thẳng trong `.screen`, CSS của màn đặt trong `<style>` của trang, dùng biến và `data-*` do núm đổi. Chạy lại đúng lệnh ở bước 1: script dựng bản đầy đủ (kit, khung, sân khấu) ra `build/`, tự kiểm trên điện thoại và laptop, ghi `publish.json`. Cần núm hay kiểu bảng mới trong `it-stage.js` thì mở PR kit riêng trước.
3. Gọi Artifact với đúng tham số trong `publish.json`. Khi thien gửi: làm như bước 5 trong `../lesson/README.md`; kết quả có thêm `R.tried`, `R.picks`, `R.knobs`, `R.boards`, `R.heard`, `R.match`, `R.peeked`, `R.asked`, `R.ffwd`, và tóm tắt gửi Claude có sẵn các dòng đó.

## Quy ước trong trang

| Thứ | Viết thế nào |
|---|---|
| Chỗ sân khấu | `<div id="stage">` ngay sau `.top`, một lần cho cả trang, chứa các `.pane` |
| Sân khấu ở mỗi bước | `data-stage="<tên pane>"` trên `<section class="step">`; không ghi thì ẩn. Chế độ sau `@`: `@listen` (bảng chỉ cho nghe), `@cover` (bàn bị che, chờ nút nhìn), `@lens` (hiện núm kính) |
| Bàn thử | `<div class="pane bench" data-pane="bank">` chứa `.phone > .screen` (màn app), `.side` (núm và code bên cạnh trên khung rộng), `.code` thứ hai ngay trong bàn (code dưới cùng trên điện thoại) |
| Núm | `<div class="knob" data-knob="accent" data-var="--a" data-min="3">` với các `<button data-val="#0f766e" data-name="Xanh ngọc">`. Có `data-var` thì đặt biến CSS trên `.screen`; không có thì đặt `data-<knob>` trên `.screen`. `aria-pressed="true"` là giá trị lúc mở. Ô màu: class `sw` và `style="--sw:…"`; nhóm nút: bọc trong `.seg` |
| Code sáng lên | Dòng `<span data-line="accent">`, chỗ giá trị `<span data-v="accent">` (lấy `data-code` của nút nếu có, không thì `data-val`) |
| Soi | `<button class="soi-btn" data-soi-toggle>`; chỗ được soi trong màn: `data-soi` (luôn), `data-soi="vua nhieu"` (chỉ khi một núm đang ở giá trị đó); `<span class="soi-count" data-text="… {n} chỗ">` |
| Đặt sẵn núm | `<button data-set="bank" data-vals="accent=#dc2626; amount=nhieu" data-done="saw-red">`, không tính là đã thử |
| Chốt lựa chọn | `<button data-pick="d1" data-of="bank">`; nhắc lại vào `<p class="fb" data-echo="d1" [data-prefix]>` |
| Danh sách đã thử | `<div class="tried" data-tried="bank.accent">` |
| Kính | Núm `<div class="knob" data-knob="lens" data-lens>` với `data-val` là `none`, `blur`, `old`, `deut` (mù màu đỏ-lục), `prot`. Bước ngoài `@lens` thì núm ẩn và màn về bình thường |
| Nhìn N giây | Trong `.phone` thêm `<div class="cover">chữ trên màn che</div>`; bước `data-stage="food@cover"`; `<button data-peek="food" data-sec="5" data-after="Đã xem">` (nút tự đếm ngược); `<button data-uncover="food">` bỏ che hẳn. Khi che, cột núm ẩn |
| Câu hỏi chờ sân khấu | `<div class="q" data-wait="peek-food">`: các lựa chọn khóa tới khi khóa đó xong |
| Làm theo bản thiết kế | Bàn có `data-target='{"accent":"#0f766e","amount":"it"}'`; thêm `<div class="target"><span class="label">Bản thiết kế</span><div class="phone mini"><div class="screen"></div></div></div>` (tự chép màn chính) và `<div class="meter" role="status"><span></span></div>`; nhắc vào `[data-echo="match-<pane>"]` với `data-same` |
| Bảng dán | `<div class="pane board" data-pane="who" data-answer='{"thẻ":"ô"}' [data-hear="4"]>` chứa `.bd-area` (gồm `.zones`, `.tray`, các thẻ) và `.say-bar` |
| Ô | `.zones.grid2` (lưới 2×2, thêm `.axis.y`, `.axis.x` nếu cần tên trục: tên trục nằm trong lề riêng ngoài ô, chỉ chừa lề khi có trục) hay `.zones.flow` (các bước nối mũi tên); mỗi ô `<button class="zone" data-z="z1" data-reset>`, ô chính thêm `key` |
| Thẻ | `<button class="bd-card" data-c="ph" style="--c:#be185d" data-say="lời họ nói" data-why="giải thích khi xếp khác bản mẫu"><i>PH</i>Phụ huynh</button>` |
| Thẻ lên tiếng, tua 3 tháng | Trên thẻ: `data-react="lời khi bị xếp sai"`, `data-later="Tháng 2\|chuyện xảy ra"`; theo ô bị đặt: `data-react-z2`, `data-later-z2`. Trong bảng: `<div class="ffwd"><span class="label">Mô phỏng · …</span><ol></ol></div>`; nút `<button data-ffwd="who" data-need="checked-who" data-label data-back data-good="khi không sai gì">` |
| Thẻ ẩn, phỏng vấn | Thẻ thêm `data-hidden`. `<div class="ask" data-ask="pdt" data-of="who">` chứa `<button class="opt" data-reply="lời đáp" [data-reveal="ctsv"]>câu hỏi</button>` và `<p class="reply" role="status">` |
| Kiểm tra, bản mẫu | `<button data-check="who" data-need="placed-who" disabled>`, nhắc kết quả vào `[data-echo="who"]` (`data-same` khi khớp hết); `<button data-answer-of="who">` |
| Khóa mở nút | `tried-<pane>.<núm>` (đã thử đủ `data-min`), `knob-<núm>`, `soi-<pane>`, `d1` (đã chốt), `heard-<pane>` (đã nghe đủ `data-hear`), `heard-<thẻ>`, `placed-<pane>`, `checked-<pane>`, `peek-<pane>`, `uncover-<pane>`, `match-<pane>`, `asked-<người>`, `reveal-<thẻ>`, `ffwd-<pane>`, và `data-done` của nút đặt sẵn |
| Điều kiện kỹ thuật | `<style id="it-css">` sau `lesson-css`; `<script id="it-js">` sau `lesson-js`, trước `lesson-kit` |

## File

| File | Là gì |
|---|---|
| `it.css` | Bố cục sân khấu, bàn thử, bảng dán, kính, màn che, thanh đo, tua 3 tháng |
| `it-stage.js` | Núm, soi, code sáng lên, chốt, kính, nhìn N giây, làm theo bản thiết kế; xếp thẻ, nghe, kiểm, bản mẫu, thẻ lên tiếng, phỏng vấn, tua 3 tháng; bước nào hiện pane nào |
| `template-frontend.html` | Buổi mẫu có bốn bàn thử (app ngân hàng cho người lớn tuổi, app học từ cho học sinh, app đặt món để nhìn 5 giây, bản thiết kế để làm theo) và bước kính |
| `template-ba.html` | Buổi mẫu có hai bảng (lưới quyền và quan tâm có thẻ ẩn và tua 3 tháng, luồng 4 bước) và bước phỏng vấn |

## Chưa làm, để sau khi thien học thử

- Bố cục trang bảng dán cần trau chuốt hơn: thien thấy "ok nhưng chưa thỏa mãn" (sau BA 3, 2026-11-16). Lỗi tên trục đè thẻ ở cùng lần chê đã sửa 2026-11-17 (test `.github/scripts/grid2-axis.test.mjs`).

- Khi nhìn N giây, phần tự lưu không giữ đồng hồ: tải lại trang giữa 5 giây thì coi như đã xem.
- Nối hai thẻ bằng đường (sơ đồ ai nói với ai), làn bơi nhiều người cho luồng việc.
- Ô gõ CSS thật (hướng C ở vòng chọn) cho phần cuối buổi khi thien đã quen.
- Hai màn cạnh nhau để so trước và sau trên cùng bàn thử.
