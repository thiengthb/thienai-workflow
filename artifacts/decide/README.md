# Mẫu chọn phương án

Trang dùng mỗi khi AI cần thien chọn 1 trong 2–4 cách có hình: bố cục, kiến trúc, công cụ. Mỗi lần chỉ đổi file mô tả và ảnh, không viết lại trang. Bố cục do thien chọn ở vòng duyệt `decide-layout-r1` (2026-11-14): khung rộng là bảng so sánh, điện thoại là thẻ xếp dọc.

## Trang làm được gì

- Khung rộng (từ 760px): mỗi phương án một cột, ảnh nhỏ ở đầu cột, các hàng là tiêu chí chấm sẵn (tốt, vừa, kém), hàng "Điểm chính" là ưu nhược, hàng cuối là nút chọn.
- Điện thoại: mỗi phương án một thẻ có ảnh, tiêu chí, ưu nhược và nút "Chọn bản này".
- Bấm ảnh để phóng to. Bấm lại bản đang chọn là bỏ chọn.
- **Đề xuất của AI ẩn tới khi thien chọn**, để thien chọn theo mắt mình trước. Chọn xong, trang hiện đề xuất kèm lý do và nói lựa chọn giống hay khác đề xuất. Đề xuất vẫn nằm trong mã trang: "ẩn" là ẩn trên màn, không phải bí mật.
- Ô ghi chú, nút "Chép kết quả" và "Gửi cho Claude". Gửi không được thì tự chép.
- Lựa chọn và ghi chú lưu vào máy và vào db của trang ở `decisions/<id>`. Nút chọn và ô ghi chú chỉ bật sau khi đã đọc xong bản đã lưu.
- Comment: dùng comment có sẵn của claude.ai, ghim thẳng vào cột (`col-<khóa>`) hoặc thẻ (`opt-<khóa>`) của phương án.

## Cách AI dựng một trang

1. Chụp ảnh từng phương án (Playwright). Ảnh chụp ở `deviceScaleFactor: 2` thì ghi `"scale": 2`.
2. Viết `decision.json` cạnh ảnh:
   ```json
   { "id": "sakubun-review-layout", "question": "Buổi ôn nên bố cục thế nào?", "context": "Một câu vì sao phải chọn.",
     "options": [{ "key": "a", "name": "A · Toàn màn", "summary": "...", "image": "a.png", "scale": 2,
                   "pros": ["..."], "cons": ["..."] },
                 { "key": "b", "name": "B · Hai cột", "summary": "...", "image": "b.png", "scale": 2 }],
     "criteria": [{ "name": "Dễ dùng trên điện thoại", "values": { "a": "tốt", "b": { "text": "thấp", "tone": "good" } } }],
     "recommend": { "key": "a", "why": "Một hai câu lý do." } }
   ```
   Chữ "tốt" tự có màu xanh, "kém" màu đỏ, chữ khác màu trung tính; muốn khác thì ghi `{ "text", "tone": "good" | "bad" }`.
3. `node artifacts/decide/make-decision.mjs decision.json out` dựng `out/index.html` (đã gộp kit), `out/img/*` và `out/preview.html` để mở thử.
4. Đăng `out/index.html` thành artifact mới, `files` là danh sách script in ra, `capabilities`: `{"comments": {}, "db": {}}`. Kiểm ở cỡ khung claude.ai (khoảng 1180×760) và điện thoại trước khi gửi link.
5. Khi thien gửi: đọc comment (ArtifactComments) và `decisions/<id>` (ArtifactData), chép quyết định vào PR hoặc file kế hoạch, trả lời comment, rồi làm theo bản thien chọn.

## File

| File | Là gì |
|---|---|
| `template.html` | Khung trang; make-decision thay `__TITLE__`, `__DECISION__` và chép kit vào |
| `decide.js` | Toàn bộ hành vi của trang |
| `make-decision.mjs` | Dựng một trang từ `decision.json`, kiểm 2–4 phương án, khóa không trùng, tiêu chí và đề xuất trỏ đúng phương án |
| `../kit/kit.css`, `../kit/kit.js` | Lõi chung cho mọi mẫu |
