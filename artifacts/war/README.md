# Bộ kit học chiến tranh: sa bàn 3D

Phần thêm cho mẫu buổi học (`../lesson/`), chỉ dành cho bài chiến tranh. Trang vẫn là một buổi theo khung chung (ôn, thử trước, hiểu sau, câu hỏi, tự nói lại, góp ý), có thêm một sa bàn: địa hình 3D từ độ cao thật, quân và đường vẽ theo từng mốc thời gian. thien chọn kiểu 3D ở vòng `war-kit-sandtable-r1` (2026-11-13), trong 3 kiểu: bản đồ phẳng, sa bàn nghiêng, địa hình 3D.

## Trang làm được gì

- Khung rộng (từ 900px): sa bàn bên trái đứng yên, các bước bên phải. Điện thoại: sa bàn ở trên, bước ở dưới. Bước không cần sa bàn (ôn, câu hỏi, góp ý) thì sa bàn ẩn, trang về một cột như bài thường.
- Kéo để xoay, chụm hai ngón hoặc lăn chuột để phóng. Nút góc nhìn ở góc trên: Nghiêng, Từ trên (đọc như bản đồ), và góc riêng của trận (ví dụ "Từ đồi phía đông").
- Thanh thời gian dưới sa bàn: bấm từng mốc hoặc nút **Tiếp ›** để sang mốc sau. Sa bàn không tự chạy: người học đọc xong mốc nào mới bấm sang mốc kế. Mỗi mốc có nhãn **Chuyện thật** hay **Mô phỏng**, một đoạn kể ngắn và nguồn.
- Chọn nước đi: mỗi lựa chọn có nút "Xem" để thấy cách đó trên sa bàn trước khi chọn. Chọn xong không có đúng sai, chỉ có "Bạn chọn" và "Chuyện thật", rồi mới mở thanh thời gian.
- Nhãn luôn đứng thẳng, nhãn đè nhau thì ẩn bớt cái kém quan trọng. Chỉ vẽ lại khi có gì đổi, không chạy liên tục, để đỡ pin.
- Máy không vẽ được 3D thì tự chuyển sang bản đồ phẳng tô bóng đồi, cùng dữ liệu, cùng nút.

Vì sao hợp cách học đã chọn (`learning/war.md`, mục "Cách dạy môn này"): bước mở đầu chỉ cho nhìn sa bàn, chưa hỏi gì (cảm nhận trước); bước chọn chỉ cho biết đúng những gì người chỉ huy biết lúc đó (decision-forcing case); sau khi xem chuyện thật, người học tự viết một điều mình để ý thấy trước khi đọc giải thích (tự khám phá); sa bàn thay cho đi thực địa (staff ride). Luật quá rườm thì người học mắc vào công cụ (Sabin), nên sa bàn chỉ có xoay, phóng, chọn mốc.

## Cách AI soạn một bài

1. **Trận mới:** viết `learning/war/battles/<trận>.json` (xem mục dưới), rồi lấy độ cao thật một lần:
   `node artifacts/war/fetch-terrain.mjs learning/war/battles/<trận>.json`
   Script tải ô độ cao miễn phí (AWS Terrain Tiles, không cần khóa), ghi lưới độ cao vào file, và kéo các điểm có `"snap"` về đúng đỉnh đồi (`high`) hay chỗ trũng (`low`, cho sông). Trận đã có file thì bỏ qua bước này.
2. **Trang:** `node artifacts/lesson/make-lesson.mjs learning/war/pages/lesson-NN.html`. Trang trong `learning/war/pages/` chưa có thì script chép mẫu chiến tranh (`template.html`, có sẵn sa bàn và bài mẫu Điện Biên Phủ) ra rồi dừng.
3. Thay mọi chỗ `__…__` và nội dung mẫu, trỏ `data-src` của `<script id="battle">` tới file trận. Chạy lại đúng lệnh ở bước 2: script dựng bản đầy đủ (kit, khung, sa bàn, dữ liệu trận) ra `build/`, tự kiểm trên điện thoại và laptop, ghi `publish.json`. Nguồn trong repo không chép dữ liệu trận lần hai.
4. Gọi Artifact với đúng tham số trong `publish.json`. Bài cần khả năng sa bàn chưa có (sửa `sandtable.js`, `war-lesson.js`) thì mở PR kit riêng có test trước, CI chặn PR vừa sửa bài vừa sửa kit. Khi thien gửi: làm như bước 5 trong `../lesson/README.md`; kết quả có thêm `R.choices`, `R.seen`, `R.viewed`, `R.notice`.

## Quy ước trong trang

| Thứ | Viết thế nào |
|---|---|
| Dữ liệu trận | `<script type="application/json" id="battle" data-src="../battles/<trận>.json"></script>`, make-lesson điền nội dung |
| Chỗ sa bàn | `<div id="board"></div>` ngay sau `.top`, một lần cho cả trang |
| Sa bàn ở mỗi bước | `data-board="real"` trên `<section class="step">`: xem track đó; `"real@0"`: khóa ở mốc 0, chưa cho kéo thời gian; không ghi: ẩn sa bàn |
| Chuyển track | `<button data-track="A">` |
| Chọn nước đi | `<div class="choose" data-c="d1" data-real="C" data-same="…" data-diff="…">`, mỗi dòng `<div class="row"><button class="opt" data-v="A">…</button><button class="btn" data-plan="A">Xem</button></div>` |
| Nhắc lại lựa chọn | `<p class="fb" data-echo="d1">` |
| Mở nút đi tiếp | khóa `d1` (đã chọn), `seen-<track>` (đã xem tới mốc cuối của track đó) trong `data-need` |
| Điều kiện kỹ thuật | `<script src="…three.js/r128/three.min.js">` trong `<head>`; `<style id="war-css">` và `<script id="war-js">` (sau `lesson-js`, trước `lesson-kit`) |

## File dữ liệu trận

```json
{ "id": "dien-bien-phu-1954", "title": "…", "bbox": [nam, tây, bắc, đông], "exaggerate": 2,
  "note": "Địa hình thật, vị trí ước lượng…", "sides": { "fr": { "name": "Quân Pháp", "color": "#2f5f96" }, "vn": { … } },
  "features": [{ "kind": "river" | "road" | "airfield", "name", "pts": [[lat, lon], …], "snap": "low" }],
  "units": [{ "id", "side", "kind": "fort" | "gun" | "depot", "name", "short", "at": [lat, lon], "snap": "high", "rank": 1–3 }],
  "views": { "tilt": { "label", "yaw", "pitch", "dist", "target" }, "top": { … }, "hill": { "label", "from": [lat, lon, km trên mặt đất], "target" } },
  "tracks": { "real": { "label": "Chuyện thật", "tag": "real", "keys": [ { "date", "title", "text", "src",
      "show" | "add" | "remove": [id], "lose": [id] (giữ tới cuối), "hit" | "dim": [id] (chỉ mốc đó), "rename": { id: "tên mới" },
      "lines": [{ "kind": "attack" | "retreat" | "trench" | "supply", "pts", "color"? }], "keepLines": true, "focus": [lat, lon],
      "fog": { "who": "Mắt quân Pháp", "hide": [id], "text", "src" } } ] },
    "A": { "label": "Nếu đánh ngay", "tag": "sim", "preview": 1, "keys": [{ "same": "real:0" }, …] } },
  "terrain": "fetch-terrain.mjs tự ghi" }
```

- Track `tag: "sim"` hiện nhãn "Mô phỏng". Mọi đoạn kể của mô phỏng ghi rõ "Phỏng đoán", và `src` ghi dựa trên nguồn nào (luật 10 trong `profile/TUTOR.md`).
- `preview`: mốc hiện khi bấm "Xem" ở bước chọn (mặc định 1, là kế hoạch, chưa phải kết cục).
- `symbolScale`: phóng ký hiệu và đường (mặc định 1, hợp với vùng khoảng 15 km); vùng rộng vài chục km thì đặt 3 đến 4.
- `exaggerate`: phóng độ cao cho dễ thấy đồi; trang tự ghi "độ cao ×2" ở góc sa bàn.
- `depot` (kho, điểm trung chuyển) vẽ thành khối tròn; đường `supply` (hướng chở hàng) có mũi tên, `color` đổi màu cho hàng của bên kia. Dùng cho bài hậu cần.
- `fog`: mốc nào có thì sa bàn hiện nút mang tên `who`. `zoneLabel` thay chữ trong vùng nghi ngờ (mặc định "Pháo Việt Minh ở đâu?"). Bấm vào, các ký hiệu trong `hide` biến thành vùng nghi ngờ rộng, kèm đoạn `text` và nguồn. Dùng để người học thấy bên kia biết gì lúc đó; chỉ ghi điều có nguồn.
- `short` của sông, đường, sân bay hiện thành tên nằm trên địa hình.
- Trạng thái vẽ bằng ký hiệu, không bằng chữ: `hit` là vòng đỏ dưới chân, `lose` là khối xám có cờ của bên kia cắm lên; chú thích tự thêm hai mục này khi trận có. Nhãn chỉ ghi tên, tên trùng (như mấy trận địa pháo) chỉ ghi một lần, đơn vị trong `dim` không ghi tên.
- Màu đất theo độ cao so với đáy lòng chảo (ruộng nhạt, sườn cỏ, đồi rừng, đỉnh nâu), cộng đường đồng mức 50 m và 250 m theo độ cao thật. Đáy phẳng không vẽ đồng mức.
- Người học chạm vào đất trống thì sa bàn tính vùng nhìn thấy từ điểm đó (mắt cao 15 m, theo độ cao thật); chạm vào ký hiệu thì hiện tên đầy đủ và tình trạng ở mốc đó. Không cần ghi gì trong dữ liệu.
- Vị trí quân, hào, mũi tên là ước lượng để minh họa; chỉ địa hình là số liệu thật. Trang luôn ghi "vị trí ước lượng".

## File

| File | Là gì |
|---|---|
| `template.html` | Bài mẫu chiến tranh 8 màn có sa bàn, make-lesson chép ra cho trang mới trong `learning/war/pages/` |
| `sandtable.js` | Vẽ sa bàn: địa hình, quân, đường, thanh thời gian, góc nhìn, nhãn, bản đồ phẳng dự phòng |
| `war-lesson.js` | Nối sa bàn với khung buổi học: bước nào hiện gì, chọn nước đi, mở nút đi tiếp |
| `war.css` | Bố cục hai cột và kiểu của sa bàn |
| `fetch-terrain.mjs` | Lấy độ cao thật cho một trận, kéo điểm về đúng địa hình |

Bài dựng bằng kit: [`learning/war/pages/lesson-03-sandtable.html`](../../learning/war/pages/lesson-03-sandtable.html) (bài 3 dựng lại, dùng làm bài ôn). Trận có sẵn: [`learning/war/battles/`](../../learning/war/battles/).
