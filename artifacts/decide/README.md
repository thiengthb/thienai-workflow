# Mẫu chọn phương án

Trang dùng mỗi khi AI cần thien chọn 1 trong 2–4 cách có hình: bố cục, kiến trúc, công cụ. Mỗi lần chỉ đổi file mô tả và ảnh, không viết lại trang. Bố cục do thien chọn ở vòng duyệt `decide-layout-r1` (bảng so sánh, điện thoại là thẻ xếp dọc) và `decide-image-r1` (ảnh là thứ chính nên phải to: xem từng bản một), cả hai ngày 2026-11-14.

## Trang làm được gì

- Khung rộng (từ 760px), phần trên: xem từng bản một. Tab tên các bản ở đầu, ảnh lớn đủ tỉ lệ bên trái (cao tới khoảng 2/3 khung), bên phải là tóm tắt, ưu nhược, nút chọn và Trước/Sau. Phím ← → trên tab để chuyển bản; tab của bản đã chọn có chữ "đã chọn".
- Khung rộng, phần dưới: bảng so sánh gọn, mỗi phương án một cột, các hàng là tiêu chí chấm sẵn (tốt, vừa, kém), hàng "Điểm chính" là ưu nhược, hàng cuối là nút chọn. Không bản nào có ảnh thì chỉ còn bảng.
- Điện thoại: mỗi phương án một thẻ có ảnh đủ tỉ lệ (cao tới 72% màn), tiêu chí, ưu nhược và nút "Chọn bản này".
- Bấm ảnh để phóng to. Bấm lại bản đang chọn là bỏ chọn.
- **Đề xuất của AI ẩn tới khi thien chọn**, để thien chọn theo mắt mình trước. Chọn xong, trang hiện đề xuất kèm lý do và nói lựa chọn giống hay khác đề xuất. Đề xuất vẫn nằm trong mã trang: "ẩn" là ẩn trên màn, không phải bí mật.
- Ô "Hỏi Claude" về các phương án (khả năng `sample`): trước khi chọn Claude chỉ giải thích, không gợi ý chọn cái nào; không hỏi được thì ô tự ẩn.
- Ô ghi chú, nút "Chép kết quả" và "Gửi cho Claude". Gửi không được thì tự chép.
- Lựa chọn và ghi chú lưu vào máy và vào db của trang ở `decisions/<id>`. Nút chọn và ô ghi chú chỉ bật sau khi đã đọc xong bản đã lưu.
- Comment: dùng comment có sẵn của claude.ai, ghim thẳng vào bản đang xem (`view-<khóa>`), cột trong bảng (`col-<khóa>`) hoặc thẻ (`opt-<khóa>`) của phương án.

## Cách AI dựng một trang

1. Mỗi phương án cần một hình. Có sẵn trang (link chạy được hoặc file html phác) thì ghi `"shot": "<link hoặc file>"`, script tự chụp @2x ở `"shotSize"` (mặc định `1180x760`); có ảnh rồi thì ghi `"image"`, ảnh chụp ở `deviceScaleFactor: 2` thì thêm `"scale": 2`.
2. Viết `decision.json` cạnh ảnh:
   ```json
   { "id": "sakubun-review-layout", "question": "Buổi ôn nên bố cục thế nào?", "context": "Một câu vì sao phải chọn.",
     "options": [{ "key": "a", "name": "A · Toàn màn", "summary": "...", "image": "a.png", "scale": 2,
                   "pros": ["..."], "cons": ["..."] },
                 { "key": "b", "name": "B · Hai cột", "summary": "...", "image": "b.png", "scale": 2 }],
     "criteria": [{ "name": "Dễ dùng trên điện thoại", "values": { "a": "tốt", "b": { "text": "thấp", "tone": "good" } } }],
     "recommend": { "key": "a", "why": "Một hai câu lý do." } }
   ```
   Phương án cần ví dụ thật (hướng "thật xa" của vòng thử gu) thì thêm `"links": [{ "text", "url", "note" }]`: link https, `note` là một câu "để ý chỗ này"; trang hiện dưới ưu nhược, mở ở tab mới.
   Chữ "tốt" tự có màu xanh, "kém" màu đỏ, chữ khác màu trung tính; muốn khác thì ghi `{ "text", "tone": "good" | "bad" }`.
3. `node artifacts/decide/make-decision.mjs decision.json out` chụp các `shot` (cần Playwright), dựng `out/index.html` (đã gộp kit), `out/img/*` và `out/preview.html` để mở thử.
4. Gọi Artifact với đúng tham số trong `out/publish.json` (script ghi sẵn file, ảnh và capabilities). Kiểm ở cỡ khung claude.ai (khoảng 1180×760) và điện thoại trước khi gửi link.
5. Khi thien gửi: đọc comment (ArtifactComments) và `decisions/<id>` (ArtifactData), chép quyết định vào PR hoặc file kế hoạch, trả lời comment, rồi làm theo bản thien chọn.

## File

| File | Là gì |
|---|---|
| `template.html` | Khung trang; make-decision thay `__TITLE__`, `__DECISION__` và chép kit vào |
| `decide.js` | Toàn bộ hành vi của trang |
| `make-decision.mjs` | Dựng một trang từ `decision.json`, kiểm 2–4 phương án, khóa không trùng, tiêu chí và đề xuất trỏ đúng phương án |
| `../kit/kit.css`, `../kit/kit.js` | Lõi chung cho mọi mẫu |
