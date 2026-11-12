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
- **Giao diện phải giống hệt các trang trước, không tự viết lại.** Ngày 2026-11-12 Codex tự viết trang BA 2 từ đầu: font hệ thống thay vì Onest, không có thanh tiến độ, nút chọn không đổi màu đúng sai, và thien thấy kém hẳn các trang cũ. Vì vậy:
  - Chép nguyên file trang mới nhất của cùng môn (`cp learning/ba/pages/lesson-02.html learning/ba/pages/lesson-03.html`), rồi chỉ thay chữ, câu hỏi và dữ liệu trong `<script>`. Không viết lại `<head>`, `<style>`, thanh trên cùng, các lớp `.btn`, `.opt`, `.card`, `.chip`. Môn chưa có trang mẫu tốt thì chép trang BA 2.
  - Cần kiểu bài mới thì chép đúng phần HTML, CSS, JS của kiểu đó từ `learning/teaching/patterns.html`, giữ tên lớp và biến màu.
  - Trước khi gửi, tự kiểm 5 điều: font Onest; thanh tiến độ có "số bước/tổng"; bấm chọn thì có màu đúng sai và chữ ("Bạn chọn", "Đúng"); mỗi bước có ít nhất một hình hay sơ đồ cho thấy đang ở đâu, không chỉ chữ; khổ điện thoại không tràn ngang; bật chế độ tối của máy rồi xem lại, không chỗ nào chữ trùng màu nền (trong `<style>` của trang dùng biến `var(--card)`, `var(--ink)`, đừng viết cứng `#fff`). Gu giao diện của thien ở repo thienui, file `docs/taste.md`.
- Chọn kiểu bài theo `learning/teaching/README.md` và mục "Buổi tiếp theo" của môn.
- Các bước dựng:
  1. Ghi trang vào `learning/<môn>/pages/lesson-NN.html` (NN là số buổi, hai chữ số).
  2. Gắn bộ khung: `node learning/teaching/kit/apply-kit.mjs learning/<môn>/pages/lesson-NN.html`.
  3. Nếu máy có Playwright: `node learning/teaching/check-page.cjs learning/<môn>/pages/lesson-NN.html`, sửa hết lỗi. Không có thì ghi "chưa kiểm khổ điện thoại".
  4. Gửi thien đường dẫn đầy đủ của file trên máy và cách mở: mở thư mục đó rồi bấm đúp vào file, hoặc kéo file vào Chrome.
- **Codex chạy trên cloud** (chatgpt.com/codex) thì thien không mở được file. Nói thẳng điều đó, khuyên mở Codex trên laptop, không tự chuyển sang dạy bằng chat.
- **Chỉ dạy bằng chat khi thien tự xin** ("học bằng chat"). Khi đó vẫn giữ nhịp thử trước, hiểu sau, mỗi lần một câu, và ghi "học bằng chat" vào nhật ký.

## Trước buổi
- Làm trên máy thì `git pull` trước.
- Xem PR đang mở. Có PR buổi học chưa merge thì bảng "Trạng thái" trên main còn thiếu buổi đó: nhắc thien merge trước, hoặc đọc bảng trong nhánh của PR đó.

## Sau buổi
1. Ghi đủ như mục "Sau buổi" trong `learning/README.md`: nhật ký trong `learning/<môn>.md`, file bài trong `learning/<môn>/lessons/` và dòng trong `learning/<môn>/README.md`, 2–3 thẻ trong `cards.md`, bảng "Trạng thái", tick chặng trong `roadmap.md`. Sửa luôn mục "Buổi tiếp theo" của môn đó.
2. Trong dòng nhật ký, ghi công cụ: "(Codex)". Để sau này so được buổi ở Codex với buổi ở Claude.
3. thien dán kết quả (nút "Chép kết quả") vào chat. Đọc kết quả rồi mới ghi nhật ký; ghi chỗ thien đổi cách nhìn, không ghi như bảng điểm.
4. Tạo nhánh `learning/<môn>-<số buổi>` (ví dụ `learning/ba-02`), commit, push, mở PR. Không mở được PR thì đưa thien link tạo PR. Nhắc thien merge trước buổi kế tiếp, ở công cụ nào cũng vậy.
