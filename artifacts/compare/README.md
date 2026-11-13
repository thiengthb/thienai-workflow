# Mẫu so sánh giao diện

Một trang dùng chung cho mọi vòng duyệt giao diện (sakubun, thienui, bài học frontend). Mỗi vòng chỉ đổi file mô tả và ảnh, không viết lại trang. Kế hoạch và lý do: [Bộ khung artifact cho workflow với Claude](https://claude.ai/artifact/L8JZzcaU2ZXKiweA4KFJNd).

## Trang làm được gì

- Danh sách màn bên trái, mỗi màn có 2 bản trở lên (ví dụ Cũ, Phác A, Phác B). Chọn bản trái và bản phải khi có hơn 2 bản.
- 5 kiểu xem: cạnh nhau, trượt (kéo nút tròn), chồng mờ, nháy (giữ Space), khác biệt (tô đỏ điểm ảnh khác nhau). Cỡ Vừa, 100%, 200%.
- Mỗi màn: OK / Cần sửa, và "Thích bản" khi có hơn 2 bản. Ghi chú chung cho cả vòng.
- **Ghim comment đúng chỗ**: bấm Ghim (hoặc nút comment của claude.ai) rồi bấm vào ảnh; kéo để khoanh một vùng. Comment nằm trong hệ comment có sẵn của claude.ai, anchor dạng `<màn>/<bản>@x,y` hoặc `@x,y,w,h` theo px của ảnh ở cỡ 100%.
- Không có comment của claude.ai (mở bằng nick không phải chủ trang): ghim lưu trong trang và đi kèm kết quả.
- Kết quả lưu vào máy và vào db của trang ở `reviews/<id vòng>`. "Chép kết quả" ra markdown để dán vào PR. "Gửi cho Claude" gửi tóm tắt vào comment cho phiên Claude đang theo dõi; không gửi được thì tự chép.
- Phím: ← → đổi màn, 1–5 đổi kiểu xem, Space trong kiểu nháy, Esc tắt ghim.

## Cách AI dựng một vòng

1. Chụp ảnh từng màn ở 1440 và 390 (Playwright, `fullPage: true`). Ảnh chụp ở `deviceScaleFactor: 2` thì ghi `"scale": 2`.
2. Viết `round.json` cạnh thư mục ảnh:
   ```json
   { "id": "sakubun-history-r2", "title": "Duyệt Lịch sử, vòng 2", "intro": "...",
     "scenarios": ["Rỗng", "Rất nhiều dòng", "Chữ rất dài"],
     "items": [{ "id": "history-1440", "group": "Laptop", "label": "Lịch sử · 1440", "note": "...",
                 "sides": [{ "key": "old", "name": "Trước", "file": "shots/old-1440.png" },
                           { "key": "new", "name": "Sau", "file": "shots/new-1440.png" }] }] }
   ```
3. `node artifacts/compare/make-round.mjs round.json out` dựng `out/index.html` (đã gộp kit), `out/shots/*` và `out/preview.html` để mở thử trên máy (kiểu khác biệt cần mở qua `python3 -m http.server`, mở thẳng file thì trình duyệt chặn đọc ảnh).
4. Đăng `out/index.html` thành artifact mới, `files` là danh sách script in ra, `capabilities`: `{"comments": {"customAnchors": true}, "db": {}, "downloads": true}`. **Mỗi vòng một artifact mới.**
5. Khi thien xong: đọc comment (công cụ ArtifactComments), đọc `reviews/<id vòng>` (ArtifactData), chép kết quả vào PR, trả lời từng comment bằng việc đã sửa, rồi đóng comment.

## File

| File | Là gì |
|---|---|
| `template.html` | Khung trang; make-round thay `__TITLE__`, `__ROUND__` và chép kit vào |
| `compare.js` | Toàn bộ hành vi của trang |
| `make-round.mjs` | Dựng một vòng từ `round.json` |
| `../kit/kit.css`, `../kit/kit.js` | Lõi chung cho mọi mẫu: màu, chữ, nút, lưu, chép, gửi cho Claude |
