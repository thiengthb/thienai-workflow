# Mẫu so sánh giao diện

Một trang dùng chung cho mọi vòng duyệt giao diện (sakubun, thienui, bài học frontend). Mỗi vòng chỉ đổi file mô tả và ảnh, không viết lại trang. Kế hoạch và lý do: [Bộ khung artifact cho workflow với Claude](https://claude.ai/artifact/L8JZzcaU2ZXKiweA4KFJNd).

## Trang làm được gì

- Bố cục do thien chọn ở vòng `compare-redesign-r2` (2026-11-13, bản C "Nút vào cột trái", kèm góp ý): không có thanh đầu trang. Cột trái có tên vòng, số màn đã duyệt, nút "Về vòng này" (giới thiệu, kịch bản), thanh tiến độ chia ô (mỗi ô một màn, xanh OK, đỏ Cần sửa, ô đang xem viền đậm, bấm ô để đến màn đó), danh sách màn, ghi chú chung, rồi hai hàng nút. Bên phải chỉ có ảnh, trang cao vừa một màn hình, chỉ vùng ảnh và cột trái tự cuộn.
- Nút chỉ có icon, rê chuột trên laptop thì hiện tên và phím tắt. Hàng trên: Cạnh nhau, Từng bản, Trượt, Thêm (Chồng mờ, Nháy qua lại, Tô chỗ khác nhau, cỡ Vừa, 100%, 200%), Ghim. Hàng dưới: tên màn, OK, Cần sửa, Màn trước, Màn sau. Ở màn cuối, Màn sau đổi thành Chép kết quả và Gửi cho Claude.
- **Thích bản nào**: mỗi bản có nút tim ngay trên ảnh; thích bản này thì bản kia tự bỏ. Danh sách màn hiện tim và tên bản đã thích.
- **Cỡ Vừa khít cả bề ngang lẫn bề cao** vùng ảnh nên không phải cuộn, không phóng quá 100%. Ảnh rất dài (chụp cả trang) mà ép khít bề cao còn chưa tới nửa cỡ khít bề ngang thì chỉ khít bề ngang và cuộn dọc.
- Mỗi màn có 2 bản trở lên (ví dụ Cũ, Phác A, Phác B). Chọn bản trái và bản phải khi có hơn 2 bản.
- **Tự chọn kiểu xem theo ảnh**: hai ảnh đặt cạnh nhau mà mỗi ảnh còn ít nhất 60% cỡ thật (ảnh điện thoại trên laptop) thì để Cạnh nhau; không thì (ảnh laptop, hay mở trên điện thoại) để Từng bản cho ảnh to. Đổi kiểu xem thì trang nhớ cho mọi màn cùng loại.
- Điện thoại (≤ 760px): trên cùng là tên màn và thanh tiến độ chia ô (thay danh sách màn), giữa là ảnh, dưới cùng một hàng nút 36px. Trượt và Chép kết quả nằm trong menu Thêm, ghi chú chung nằm trong "Về vòng này", không có cỡ 100% và 200%.
- Thanh cuộn mảnh giống sakubun, đặt ở `../kit/kit.css` cho mọi mẫu.
- **Ghim comment đúng chỗ**: bấm Ghim (hoặc nút comment của claude.ai) rồi bấm vào ảnh; kéo để khoanh một vùng. Comment nằm trong hệ comment có sẵn của claude.ai, anchor dạng `<màn>/<bản>@x,y` hoặc `@x,y,w,h` theo px của ảnh ở cỡ 100%.
- Không có comment của claude.ai (mở bằng nick không phải chủ trang): ghim lưu trong trang và đi kèm kết quả.
- Kết quả lưu vào máy và vào db của trang ở `reviews/<id vòng>`. "Chép kết quả" ra markdown để dán vào PR. "Gửi cho Claude" gửi tóm tắt vào comment cho phiên Claude đang theo dõi; không gửi được thì tự chép. Kết quả dài quá giới hạn comment thì bản đầy đủ được ghi riêng ở `sent/<id vòng>-<thời điểm>` (trường `report`), comment ghi rõ đường dẫn đó.
- Phím: ← → đổi màn, 1–6 đổi kiểu xem, Space trong kiểu nháy, Esc tắt ghim.

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
