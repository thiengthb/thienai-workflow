# Học bằng Codex hay công cụ khác Claude

Để khi hết quota Claude, thien vẫn học tiếp được ở Codex, và buổi sau quay lại Claude thì Claude biết đúng buổi vừa học. Áp cho mọi công cụ không phải Claude trên claude.ai. Luật dạy và khung buổi vẫn y như cũ (`profile/TUTOR.md`, `learning/README.md`); file này chỉ ghi chỗ khác.

## Chỗ khác so với Claude

| Ở Claude | Ở Codex |
|---|---|
| Đăng trang học thành artifact, mở trên điện thoại | Ghi trang vào `learning/<môn>/pages/lesson-NN.html`, thien mở file đó bằng trình duyệt trên laptop. Không mở được trên điện thoại |
| Kết quả tự lưu vào db của trang (`sessions`), AI đọc lại | Không có db. Cuối bài bấm "Xong buổi học", trang báo chưa lưu được và hiện nút "Chép kết quả". thien bấm rồi dán vào chat Codex. Đã thử với trang chiến tranh 2 mở dạng file ngày 2026-11-12: chạy đúng, không lỗi |
| Tự lưu chỗ đang học, mở lại trên máy khác vẫn còn | Vẫn tự lưu, nhưng chỉ trên trình duyệt của máy đó |
| Chụp màn thật bằng Firecrawl | Tự dựng màn bằng HTML (như frontend 3–5) và ghi rõ là màn dựng lại; hoặc chụp bằng Playwright nếu máy có |
| Tra nguồn trên web cho bài lịch sử | Chỉ dùng nguồn khi Codex tra và đọc được thật. Không tra được thì dùng nguồn đã có ở bài trước, hoặc đổi sang buổi ôn; không đoán chi tiết lịch sử |
| Memory của Claude | Không có. Mọi thứ cần nhớ ghi vào repo |

## Buổi học là một trang, không phải chat

thien quen học bằng trang tương tác như ở Claude. Ngày 2026-11-12 Codex mở buổi BA 2 bằng cách hỏi câu nhớ lại ngay trong chat, và thien thấy đó không phải quy trình học. Vì vậy:

- **Không hỏi gì trong chat trước khi có trang.** Đọc file rồi dựng trang luôn. Câu trả lời đầu tiên cho thien là đường dẫn trang và cách mở, kèm một dòng nói buổi này học gì.
- **Trang chứa đủ 7 bước** của khung buổi trong `learning/README.md`: 3 thẻ ôn (không có thẻ đến hạn thì lấy thẻ cũ nhất của môn khác), nhớ lại buổi trước, thử trước, hiểu sau, câu hỏi nhanh, tự nói lại rồi mới xem bản của AI, góp ý. Phần ôn bọc bằng `data-part="review"`. Cuối trang có nút `#finish` và `#copy`.
- **Chỉ một cách dựng: `artifacts/lesson/make-lesson.mjs`. Không tự viết trang, không chép trang cũ.** Ngày 2026-11-12 Codex tự viết trang BA 2 từ đầu: font hệ thống thay vì Onest, không có thanh tiến độ, nút chọn không đổi màu đúng sai, và thien thấy kém hẳn các trang cũ. Bộ dựng gắn sẵn những thứ đó (font, thanh "số bước/tổng", màu và chữ đúng sai, tự lưu, chế độ tối) và tự kiểm trang, nên trang nào cũng giống nhau. Môn có mẫu riêng (frontend, BA, chiến tranh) thì script tự chọn mẫu đó.
  - Trang cũ trong `learning/<môn>/pages/` chỉ để xem lại nội dung và cách tương tác, không làm khung cho bài mới (trang trước 2026-11-14 còn dùng khung cũ). Ngoại lệ: sửa lại đúng một bài cũ thì sửa trên chính file đó rồi chạy lại make-lesson.
  - Cần kiểu bài mới thì lấy phần HTML, CSS, JS của kiểu đó từ `learning/teaching/patterns.html` đặt vào `<style>` và `<script>` cuối trang, dùng biến màu `var(--card)`, `var(--ink)`, không viết cứng `#fff`. Gu giao diện của thien ở repo thienui, file `docs/taste.md`.
- Chọn kiểu bài theo `learning/teaching/README.md` và mục "Buổi tiếp theo" của môn.
- Các bước dựng:
  1. `node artifacts/lesson/make-lesson.mjs learning/<môn>/pages/lesson-NN.html` (NN là số buổi, hai chữ số) chép mẫu buổi học ra đó. Điền nội dung theo `artifacts/lesson/README.md`.
  2. Chạy lại đúng lệnh đó: script gắn bộ khung và tự kiểm trang bằng Playwright, sửa hết lỗi nó báo.
  3. Máy không có Playwright thì thêm `--no-check`, tự xem 3 điều mà script không kiểm được nữa (khổ điện thoại không tràn ngang; bật chế độ tối không chỗ nào chữ trùng màu nền; mỗi bước có ít nhất một hình hay sơ đồ), và ghi "chưa kiểm bằng máy" vào nhật ký.
  4. Gửi thien đường dẫn đầy đủ của file trên máy và cách mở: mở thư mục đó rồi bấm đúp vào file, hoặc kéo file vào Chrome.
- **Codex chạy trên cloud** (chatgpt.com/codex) thì thien không mở được file. Nói thẳng điều đó, khuyên mở Codex trên laptop, không tự chuyển sang dạy bằng chat.
- **Chỉ dạy bằng chat khi thien tự xin** ("học bằng chat"). Khi đó vẫn giữ nhịp thử trước, hiểu sau, mỗi lần một câu, và ghi "học bằng chat" vào nhật ký.

## Trước buổi
- Làm trên máy thì `git pull` trước.
- Xem PR đang mở. Có PR buổi học chưa merge thì bảng "Trạng thái" trên main còn thiếu buổi đó: nhắc thien merge trước, hoặc đọc bảng trong nhánh của PR đó.

## Sau buổi
1. Ghi đủ như mục "Sau buổi" trong `learning/README.md` (chạy `after-lesson.mjs` như ở đó, kết quả thien dán thì lưu phần json ra file): nhật ký trong `learning/<môn>.md`, file bài trong `learning/<môn>/lessons/` và dòng trong `learning/<môn>/README.md`, 2–3 thẻ trong `cards.md`, bảng "Trạng thái", tick chặng trong `roadmap.md`. Sửa luôn mục "Buổi tiếp theo" của môn đó.
2. Trong dòng nhật ký, ghi công cụ: "(Codex)". Để sau này so được buổi ở Codex với buổi ở Claude.
3. thien dán kết quả (nút "Chép kết quả") vào chat. Đọc kết quả rồi mới ghi nhật ký; ghi chỗ thien đổi cách nhìn, không ghi như bảng điểm.
4. Tạo nhánh `learning/<môn>-<số buổi>` (ví dụ `learning/ba-02`), commit, push, mở PR. Không mở được PR thì đưa thien link tạo PR. Nhắc thien merge trước buổi kế tiếp, ở công cụ nào cũng vậy.
