# Viết hướng dẫn cài đặt và hướng dẫn test tay cho thien

File này do thien sở hữu. AI đọc trước khi viết bất kỳ hướng dẫn nào bắt thien bấm, gõ hay điền form: hướng dẫn cài đặt, hướng dẫn test tay, kịch bản demo, hay chỉ ba bước trong một tin nhắn.

Vì sao có file này: ngày 08/11/2026 thien cài bản tin sáng theo 7 bước AI viết và gặp đủ thứ: đường dẫn không bấm được phải copy dán, tab sai hoặc chỉ nói "ở phần gì đó", nút không đúng chỗ phải tự mò, form không nói điền gì nên thien đặt đại tên token, làm xong không biết đã đúng chưa. Mẫu thien thấy ổn là kịch bản demo và file tài khoản test của repo `fap-attendance-assistant` (`docs/13-demo-runbook.md`, `docs/demo-test-accounts.csv`).

Giọng văn vẫn theo [`VOICE.md`](VOICE.md). File này chỉ nói về cách dựng các bước.

## 1. Mỗi bước có đủ năm phần

Viết theo thứ tự thien sẽ nhìn trên màn hình:

1. **Mở ở đâu.** Link bấm được tới đúng trang, không phải trang chủ. Không có link riêng thì ghi đường đi từ trang có link: "Thanh bên trái, bấm biểu tượng bánh răng **Project Settings**".
2. **Chỗ nào trên màn hình.** Tên tab, tên mục, và vị trí (trên cùng, thanh bên trái, góc phải, cuối trang). Không viết "ở phần cài đặt" hay "trong mục liên quan".
3. **Bấm gì.** Tên nút in đậm, đúng từng chữ như trên màn hình, đúng ngôn ngữ giao diện (giao diện tiếng Anh thì giữ tiếng Anh). Có hộp thoại bật lên thì ghi luôn nút bấm trong hộp thoại.
4. **Điền gì.** Có form thì dùng bảng `Ô | Điền hoặc chọn`. Giá trị gõ được thì để trong khối code để thien bấm copy. Không có ô nào để "tùy bạn": AI chọn sẵn, kể cả tên, mô tả, hạn dùng. Ô nào bỏ trống thì ghi "để trống".
5. **Thấy gì là đúng.** Màn hình hay thông báo thien sẽ thấy sau bước đó: chữ gì hiện ra, trang chuyển tới đâu, mail nào tới. Không viết "xong bước này".

Thêm hai phần nữa khi bước đó có thật:

- **Dễ nhầm:** chỗ hay chọn sai (hai nút gần giống nhau, ô mặc định sai, phải bấm Save mới lưu).
- **Nếu lỗi:** lỗi hay gặp, chữ báo lỗi trông thế nào, và cách sửa. Không bịa lỗi cho đủ mục.

Mỗi bước chỉ làm một việc trên một màn hình. Một bước mà phải đổi trang thì tách làm hai.

## 2. Link

- Mọi đường dẫn, file, trang đều là link bấm được. Không để đường dẫn trơn trong backtick.
- File trong repo thì link tới bản trên GitHub. Phải copy nội dung file thì link tới bản raw (`raw.githubusercontent.com/...`) để thien bấm Ctrl+A, Ctrl+C.
- Link phải mở được bằng tài khoản của thien. AI mở thử link trước khi gửi; link cần đăng nhập mà AI không mở được thì ghi rõ là chưa mở thử.

## 3. Tên đã thống nhất

Tên token, tên project, tên biến, tên trigger do AI đặt sẵn và ghi vào [`../life/names.md`](../life/names.md) trước khi gửi hướng dẫn. Thien chỉ copy theo.

- Trước khi đặt tên mới, AI đọc `names.md`. Tên đã có thì dùng lại, không hỏi lại thien.
- Thien đã đặt tên khác thì AI ghi tên thien đặt vào bảng, không bắt đổi.
- Tên luôn bằng tiếng Anh, chữ thường, nối bằng gạch ngang (`morning-brief-github`), trừ khi hệ thống bắt kiểu khác (biến môi trường viết hoa: `GITHUB_TOKEN`).

## 4. AI tự thử trước khi đưa

Trước khi gửi, AI đi lại từng bước trên giao diện thật nếu làm được (trình duyệt của AI, Playwright, hoặc chạy lệnh trong máy ảo). Ghi ở đầu hướng dẫn một dòng:

- "Đã thử ngày ...: bước 1 đến 5." hoặc
- "Bước 3 đến 6 cần tài khoản của bạn nên mình chưa thử được. Mình viết theo tài liệu [tên trang](link), đọc ngày ...". Bước nào chưa thử thì đánh dấu `(chưa thử)` ngay ở bước đó, để thien biết chỗ nào có thể lệch.

Giao diện từng đổi gần đây (GitHub, Google hay đổi chữ trên nút) thì ghi cả hai cách gọi: "nút **Add permissions** (giao diện cũ hiện sẵn danh sách quyền)".

Thien làm và báo một bước không khớp thì AI sửa ngay file hướng dẫn trong repo, không chỉ trả lời trong chat.

## 5. Hướng dẫn test tay

Theo mẫu [`../templates/MANUAL-TEST.template.md`](../templates/MANUAL-TEST.template.md). Khác hướng dẫn cài đặt ở bốn chỗ:

- **Dữ liệu test có sẵn.** AI tạo file tài khoản test (theo [`../templates/test-accounts.template.csv`](../templates/test-accounts.template.csv)) và dữ liệu mẫu (file import, nội dung form). Tài khoản test chỉ dùng mật khẩu giả, không dùng email hay mật khẩu thật, và ghi rõ chỉ dùng ở môi trường local hoặc demo.
- **Mỗi ca test có mã** (`TC01`, `TC02`) để thien báo lại cho ngắn: "TC03 sai ở bước 2".
- **Kết quả mong đợi viết cụ thể đến mức so được bằng mắt:** con số, chữ trên màn hình, trạng thái. Ví dụ "Số ATTEND trên desktop tăng từ 0 lên 1", không phải "điểm danh thành công".
- **Có bảng ghi kết quả** ở cuối để thien điền `Đạt` hoặc `Sai` kèm ghi chú. AI đọc bảng đó để biết sửa gì.

Thứ tự trong file: chuẩn bị (checklist trước khi test), tài khoản và dữ liệu, các ca test đường chính, các ca lỗi, dọn dẹp sau khi test, bảng kết quả.

## 6. Trước khi gửi, AI tự soát

- [ ] Mọi đường dẫn là link bấm được và đã mở thử.
- [ ] Mỗi bước có đủ: mở ở đâu, chỗ nào, bấm gì, điền gì, thấy gì là đúng.
- [ ] Không còn ô nào để thien tự nghĩ tên hay giá trị; tên mới đã ghi vào `names.md`.
- [ ] Bước nào chưa thử đã đánh dấu `(chưa thử)`.
- [ ] Test tay: có dữ liệu test, mã ca test, kết quả mong đợi cụ thể, bảng ghi kết quả.
