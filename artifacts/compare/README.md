# Mẫu so sánh giao diện

Một trang dùng chung cho mọi vòng duyệt giao diện (sakubun, thienui, bài học frontend). Mỗi vòng chỉ đổi file mô tả và ảnh, không viết lại trang. Kế hoạch và lý do: [Bộ khung artifact cho workflow với Claude](https://claude.ai/artifact/L8JZzcaU2ZXKiweA4KFJNd).

## Trang làm được gì

- Bố cục do thien chọn ở vòng `compare-redesign-r2` (2026-11-13, bản C "Nút vào cột trái", kèm góp ý): không có thanh đầu trang. Cột trái có tên vòng, số màn đã duyệt, nút "Về vòng này" (giới thiệu, kịch bản), thanh tiến độ chia ô (mỗi ô một màn, xanh OK, đỏ Cần sửa, ô đang xem viền đậm, bấm ô để đến màn đó), danh sách màn, ghi chú chung, rồi hai hàng nút. Bên phải chỉ có ảnh, trang cao vừa một màn hình, chỉ vùng ảnh và cột trái tự cuộn.
- Nút chỉ có icon, rê chuột trên laptop thì hiện tên và phím tắt. Hàng trên: Cạnh nhau, Từng bản, Trượt, Thêm (Chồng mờ, Nháy qua lại, Tô chỗ khác nhau, cỡ Vừa, 100%, 200%), Ghim. Hàng dưới: tên màn, OK, Cần sửa, Màn trước, Màn sau. Ở màn cuối, Màn sau đổi thành Chép kết quả và Gửi cho Claude.
- **Thích bản nào**: mỗi bản có nút ngón cái ngay trên ảnh; thích bản này thì bản kia tự bỏ. Danh sách màn hiện ngón cái và tên bản đã thích.
- Kiểu Trượt, Chồng mờ, Nháy qua lại, Tô chỗ khác nhau: tên kiểu, nút điều khiển, cách dùng và hai nút thích nằm trên một dòng ngay trên ảnh.
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

**Cách nhanh (đa số vòng): một lệnh.** Chạy hai bản cũ và mới (ví dụ `main` ở cổng 3789, nhánh đang làm ở cổng 3790), rồi:

```sh
node artifacts/compare/shoot.mjs /tmp/round --old http://localhost:3789 --new http://localhost:3790 \
  --pages /,/history --title "Duyệt Lịch sử, vòng 2"
```

Lệnh chụp mỗi trang ở 1180×760 và 390×844 (`--sizes` để đổi, `--full` để chụp cả trang dài, `--side a=<url>` để thêm phác), dựng trang và ghi `publish.json`. Sau đó:

1. Gọi Artifact với đúng tham số trong `publish.json`. **Mỗi vòng một artifact mới.**
2. Gửi link cho thien. Khi thien bấm "Gửi cho Claude", comment đến phiên đang theo dõi đã chứa sẵn bảng kết quả markdown: chép thẳng vào PR. Comment ghim đọc bằng ArtifactComments, trả lời bằng việc đã sửa rồi đóng.

**Đã có ảnh sẵn**: đặt tên `<màn>-<rộng>__<bản>@2x.png` (ví dụ `history-1180__old@2x.png`, `history-390__new@2x.png`) vào một thư mục rồi `node artifacts/compare/make-round.mjs <thư-mục> /tmp/round --title "..."`. `@2x` là ảnh chụp ở deviceScaleFactor 2; bản `old`, `new` hiện là Cũ, Mới, bản `a`, `b` hiện là Phác A, Phác B; đuôi `-<rộng>` xếp màn vào nhóm điện thoại hay khung rộng.

**Cần giới thiệu, kịch bản, ghi chú từng màn** thì viết `round.json` rồi `node artifacts/compare/make-round.mjs round.json /tmp/round`:

```json
{ "id": "sakubun-history-r2", "title": "Duyệt Lịch sử, vòng 2", "intro": "...",
  "scenarios": ["Rỗng", "Rất nhiều dòng", "Chữ rất dài"],
  "items": [{ "id": "history-1440", "group": "Laptop", "label": "Lịch sử · 1440", "note": "...",
              "sides": [{ "key": "old", "name": "Trước", "file": "shots/old-1440.png", "scale": 2 },
                        { "key": "new", "name": "Sau", "file": "shots/new-1440.png", "scale": 2 }] }] }
```

Mở thử trên máy: `preview.html` trong thư mục ra (kiểu Tô chỗ khác nhau cần mở qua `python3 -m http.server`, mở thẳng file thì trình duyệt chặn đọc ảnh). Kết quả còn nằm trong db của trang ở `reviews/<id vòng>` (ArtifactData) nếu cần đọc lại.

## File

| File | Là gì |
|---|---|
| `template.html` | Khung trang; make-round thay `__TITLE__`, `__ROUND__` và chép kit vào |
| `compare.js` | Toàn bộ hành vi của trang |
| `shoot.mjs` | Một lệnh: chụp hai bản rồi dựng vòng |
| `make-round.mjs` | Dựng một vòng từ thư mục ảnh hoặc `round.json`, ghi `publish.json` |
| `../kit/kit.css`, `../kit/kit.js` | Lõi chung cho mọi mẫu: màu, chữ, nút, lưu, chép, gửi cho Claude |
