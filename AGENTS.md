# AGENTS.md

Luật cho mọi AI làm việc trong repo thienai-workflow (Claude, Codex, công cụ khác). Codex và Claude Code tự nạp file này; Claude trên claude.ai đọc repo qua connector GitHub. Người quyết: thien.

## Repo này là gì
- Bộ quy trình chung khi thien làm việc với AI, kèm hồ sơ và tiến độ học của thien. Mục lục ở `README.md`, tiến độ ở `docs/STATUS.md`.
- Repo là nguồn sự thật duy nhất. Công cụ nào cũng đọc và ghi cùng các file ở đây, không giữ trạng thái riêng ở chỗ khác (memory của Claude, lịch sử chat của Codex). Chưa ghi vào repo thì công cụ khác không biết.

## Đầu phiên
- Làm trên máy thì `git pull` trước. Rồi đọc `docs/STATUS.md`.
- Xem việc chưa merge: `node templates/check-open-work.mjs` (in mọi nhánh trên origin chưa vào main, trừ nhánh `handoff`, kèm file nó sửa), hoặc trang Pull requests. PR chưa merge nghĩa là main còn thiếu việc đó: đọc nhánh đó trước, nhắc thien merge trước khi làm việc phụ thuộc vào nó. Lỗi đã gặp: 2026-11-13 dựng lại bài chiến tranh 4 từ main trong khi PR #44 đã có bài đó.
- Luật làm việc chung (ai quyết, thế nào là xong, không được làm, cách viết, cuối phiên) là phần trên dòng "Phần riêng của project" trong `templates/AGENTS.template.md`. Áp đúng như vậy ở repo này. Link trong file đó trỏ về GitHub; ở đây mở thẳng `profile/...`.

## Khi thien nhắn "học" (hay "học tiếp", "dạy mình")
1. Đọc `learning/README.md` để biết buổi tới học môn gì và khung một buổi.
2. Đọc `profile/TUTOR.md` (luật dạy), file của môn đó `learning/<môn>.md` (mục "Buổi tiếp theo" và "Cách dạy môn này"), và `learning/cards.md` (thẻ đến hạn).
3. Không phải Claude trên claude.ai thì đọc thêm `learning/codex.md` và làm đúng các bước ở đó.
4. Một buổi học là **một trang HTML tương tác** chứa đủ khung 7 bước, dựng từ mẫu `artifacts/lesson/` (xem README ở đó). Không dạy từng câu trong chat. Câu trả lời đầu tiên cho thien là trang đã dựng xong, kèm cách mở; chỉ dạy bằng chat khi thien tự xin.
5. Sau buổi ghi đủ các file như mục "Sau buổi" trong `learning/README.md`, rồi mở PR.

## Sửa repo
- Mọi thay đổi qua nhánh và PR, thien merge. Tên nhánh, tên file, thư mục, commit viết tiếng Anh; nội dung cho thien đọc viết tiếng Việt tự nhiên theo `profile/VOICE.md`.
- Chạy được thì chạy test như CI (`.github/workflows/test.yml`), nhất là `node templates/check-status.mjs docs/STATUS.md` khi sửa STATUS.
- Giữ file này ngắn, dưới 40 dòng. Chi tiết để ở file riêng rồi trỏ tới.
