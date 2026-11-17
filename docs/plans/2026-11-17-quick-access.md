# Trang mở nhanh: kế hoạch, hướng dẫn, trang hay xem

Trạng thái: đang chạy · Duyệt: 2026-11-17 (thien: "ok", theo cả 3 đề xuất và 4 cách mở nhanh) · Cập nhật: 2026-11-17 · nick tnt628 · Thread: [Lên kế hoạch các trang xem nhanh](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvRXeMFLc4SCjNEs5y91GJ1LN) · Bản duyệt: https://claude.ai/artifact/T3wrDfnzvCy1nXyYc6NUHb

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: 1, 2, 4 xong (PR #116); 2026-11-17 thien mở tab "Mở nhanh" trên điện thoại và bấm link kế hoạch mở đúng file. 3: sơ đồ đã vào README (PR #118), thien duyệt qua ảnh chụp cỡ điện thoại, chưa xem README trên điện thoại thật.
- Còn thiếu: thien xem sơ đồ trong README trên điện thoại (gộp vào mốc xem lại 2026-12-01); hai lối tắt trên màn hình chính (tuỳ thien, chưa báo).
- thien cần làm: không bắt buộc; muốn thì thêm hai lối tắt (cách ở mục "Mở nhanh" của `README.md`).

## Mục tiêu
Một chỗ mở nhanh trên điện thoại để thấy kế hoạch đang chạy tới đâu, hướng dẫn cần làm theo và các trang hay xem lại, mà không thêm chỗ nào phải cập nhật tay.

## Không làm
- Không làm trang web riêng: trang GitHub Pages công khai trên mạng kể cả khi repo riêng tư, mà repo có hồ sơ của thien.
- Không chép nội dung hướng dẫn vào trang, chỉ để link.
- Không dựng trang cho nick tnt697 và tnt024; không làm sơ đồ tương tác.

## Checkpoint

### 1. Mục "Mở nhanh" và tab trên trang Tổng quan
Xong khi: thien mở trang Tổng quan trên điện thoại, bấm tab "Mở nhanh", bấm một kế hoạch ra đúng file.
- [x] Mục "Mở nhanh" ở đầu `README.md`, là chỗ duy nhất ghi link (PR #116)
- [x] `templates/progress-page.mjs` dựng tab "Mở nhanh" từ mục đó, có test (PR #116)
- [x] Nhắn "mở nhanh" thì Claude gửi lại các link (`AGENTS.md`) (PR #116)
- [x] Ô Website của repo trên GitHub trỏ tới trang Tổng quan (thien bấm 2026-11-17, Claude kiểm qua API)
- [ ] thien thêm hai lối tắt lên màn hình chính điện thoại

### 2. Gộp trang Tiến độ thienai-workflow, ghim, thư mục
Xong khi: thanh bên claude.ai của nick tnt628 có trang Tổng quan và Lộ trình học được ghim.
- [x] Dòng "Trang tiến độ" của STATUS trỏ về trang Tổng quan; `publish-progress.mjs repo` dừng thay vì đè trang Tổng quan (PR #116)
- [x] Trang cũ báo đã gộp và trỏ sang trang Tổng quan (đăng 2026-11-17)
- [x] Ghim hai trang, thư mục "thienai-workflow" trên trang Artifacts (12 trang kế hoạch, nghiên cứu, tiến độ; trang bài học để ngoài)

### 3. Sơ đồ hệ thống
Xong khi: thien mở README trên điện thoại và thấy hình, không phải chữ Mermaid.
- [x] Sơ đồ tầng lớn trong `README.md`: bản Mermaid ở PR #116 thien chê xấu, vẽ lại thành sơ đồ khối trơn SVG (PR #118, thien: "tạm được" khi xem ảnh chụp cỡ điện thoại)
- [ ] Xem lại 2026-12-01: nếu thien vẫn hay hỏi "cái này nằm đâu" thì đề xuất sơ đồ tự sinh từ `profile/MAP.md`

### 4. Dọn bản chép cũ
Xong khi: thư mục chung của project không còn `progress-pages/` và `thienai-workflow/`.
- [x] Xoá hai thư mục đó (2026-11-17)

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-17 | Phần "Mở nhanh" thành một tab riêng của trang Tổng quan, không đặt trên đầu tab Tổng quan | Không đẩy "Đang chờ bạn" xuống, chỗ dễ sa lầy đã ghi trong bản duyệt |
| 2026-11-17 | Sơ đồ Mermaid đổi thành sơ đồ khối trơn SVG (`docs/images/system-diagram.svg`): viền mảnh, mũi tên, không tô màu, không bóng | thien thấy bản Mermaid "hơi xấu" vì có màu và bóng, muốn "sơ đồ khối giống drawio bình thường" |
| 2026-11-17 | Thêm 4 cách mở: lối tắt màn hình chính, ô Website của repo, câu "mở nhanh", mục trong README | thien hỏi có nên làm web riêng; chọn cách không tốn công duy trì |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
