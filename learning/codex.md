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

## Hai cách học

**Có trang (đủ nhất).** Codex chạy trên laptop, mở thư mục repo (Codex app, CLI hay extension trong VS Code). Codex dựng trang theo `learning/teaching/README.md`, gắn bộ khung bằng `node learning/teaching/kit/apply-kit.mjs <trang>`, chạy `node learning/teaching/check-page.cjs <trang>` nếu máy có Playwright (không có thì nói "chưa kiểm khổ điện thoại"), rồi đưa thien đường dẫn file để mở.

**Chỉ chat (khi vội, hoặc dùng Codex trên web).** Giữ đúng nhịp "thử trước, hiểu sau": AI hỏi từng câu, chờ thien trả lời rồi mới giải thích. Phần bấm, kéo thay bằng chọn A/B/C, gõ thứ tự (ví dụ "3 1 2"), hay mô tả hai bản rồi hỏi chọn bản nào. Mỗi lần chỉ hỏi một câu. Buổi kiểu này không có trang trong `pages/`; ghi "học bằng chat" vào nhật ký.

## Trước buổi
- Làm trên máy thì `git pull` trước.
- Xem PR đang mở. Có PR buổi học chưa merge thì bảng "Trạng thái" trên main còn thiếu buổi đó: nhắc thien merge trước, hoặc đọc bảng trong nhánh của PR đó.

## Sau buổi
1. Ghi đủ như mục "Sau buổi" trong `learning/README.md`: nhật ký trong `learning/<môn>.md`, file bài trong `learning/<môn>/lessons/` và dòng trong `learning/<môn>/README.md`, 2–3 thẻ trong `cards.md`, bảng "Trạng thái", tick chặng trong `roadmap.md`. Sửa luôn mục "Buổi tiếp theo" của môn đó.
2. Trong dòng nhật ký, ghi công cụ: "(Codex)". Để sau này so được buổi ở Codex với buổi ở Claude.
3. Tạo nhánh `learning/<môn>-<số buổi>` (ví dụ `learning/ba-02`), commit, push, mở PR. Không mở được PR thì đưa thien link tạo PR. Nhắc thien merge trước buổi kế tiếp, ở công cụ nào cũng vậy.
