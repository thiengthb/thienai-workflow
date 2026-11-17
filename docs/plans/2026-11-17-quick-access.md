# Trang mở nhanh: kế hoạch, hướng dẫn, trang hay xem

Trạng thái: đang chạy · Duyệt: 2026-11-17 (thien: "ok", theo cả 3 đề xuất và 4 cách mở nhanh) · Cập nhật: 2026-11-17 · nick tnt628 · Thread: [Lên kế hoạch các trang xem nhanh](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvRXeMFLc4SCjNEs5y91GJ1LN) · Bản duyệt: https://claude.ai/artifact/T3wrDfnzvCy1nXyYc6NUHb

Luật ghi file này ở `profile/PLANNING.md` của repo thienai-workflow. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: 1–4 đã làm trong PR này, chờ merge rồi thien kiểm trên điện thoại.
- Còn thiếu: ô Website của repo (thien bấm); thien mở tab "Mở nhanh" và README trên điện thoại; xem lại sơ đồ sau 2026-12-01.
- thien cần làm: merge PR, thêm hai lối tắt lên màn hình chính (cách ở mục "Mở nhanh" của `README.md`).

## Mục tiêu
Một chỗ mở nhanh trên điện thoại để thấy kế hoạch đang chạy tới đâu, hướng dẫn cần làm theo và các trang hay xem lại, mà không thêm chỗ nào phải cập nhật tay.

## Không làm
- Không làm trang web riêng: trang GitHub Pages công khai trên mạng kể cả khi repo riêng tư, mà repo có hồ sơ của thien.
- Không chép nội dung hướng dẫn vào trang, chỉ để link.
- Không dựng trang cho nick tnt697 và tnt024; không làm sơ đồ tương tác.

## Checkpoint

### 1. Mục "Mở nhanh" và tab trên trang Tổng quan
Xong khi: thien mở trang Tổng quan trên điện thoại, bấm tab "Mở nhanh", bấm một kế hoạch ra đúng file.
- [ ] Mục "Mở nhanh" ở đầu `README.md`, là chỗ duy nhất ghi link (chờ merge PR)
- [ ] `templates/progress-page.mjs` dựng tab "Mở nhanh" từ mục đó, có test (chờ merge PR)
- [ ] Nhắn "mở nhanh" thì Claude gửi lại các link (`AGENTS.md`) (chờ merge PR)
- [ ] Ô Website của repo trên GitHub trỏ tới trang Tổng quan (thien bấm: Claude không được đổi cài đặt repo)
- [ ] thien thêm hai lối tắt lên màn hình chính điện thoại

### 2. Gộp trang Tiến độ thienai-workflow, ghim, thư mục
Xong khi: thanh bên claude.ai của nick tnt628 có trang Tổng quan và Lộ trình học được ghim.
- [ ] Dòng "Trang tiến độ" của STATUS trỏ về trang Tổng quan; `publish-progress.mjs repo` dừng thay vì đè trang Tổng quan (chờ merge PR)
- [x] Trang cũ báo đã gộp và trỏ sang trang Tổng quan (đăng 2026-11-17)
- [x] Ghim hai trang, thư mục "thienai-workflow" trên trang Artifacts (12 trang kế hoạch, nghiên cứu, tiến độ; trang bài học để ngoài)

### 3. Sơ đồ hệ thống
Xong khi: thien mở README trên điện thoại và thấy hình, không phải chữ Mermaid.
- [ ] Sơ đồ tầng lớn trong `README.md` (chờ merge PR)
- [ ] Xem lại 2026-12-01: nếu thien vẫn hay hỏi "cái này nằm đâu" thì đề xuất sơ đồ tự sinh từ `profile/MAP.md`

### 4. Dọn bản chép cũ
Xong khi: thư mục chung của project không còn `progress-pages/` và `thienai-workflow/`.
- [x] Xoá hai thư mục đó (2026-11-17)

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-17 | Phần "Mở nhanh" thành một tab riêng của trang Tổng quan, không đặt trên đầu tab Tổng quan | Không đẩy "Đang chờ bạn" xuống, chỗ dễ sa lầy đã ghi trong bản duyệt |
| 2026-11-17 | Thêm 4 cách mở: lối tắt màn hình chính, ô Website của repo, câu "mở nhanh", mục trong README | thien hỏi có nên làm web riêng; chọn cách không tốn công duy trì |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
