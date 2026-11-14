# Trang ôn thẻ

Trang để thien ôn các thẻ đến hạn trong [`learning/cards.md`](../../learning/cards.md) lúc nào cũng được, không phải chờ tới buổi học mới. Thêm ngày 2026-11-14 (đợt 2 trong tài liệu đề xuất https://claude.ai/artifact/FrUscTcs6BWMVBJGzJTYqF).

**Link cố định:** https://claude.ai/artifact/L612hHx2vHUokcPBgH7RPu (tài khoản của thien). Dựng lại thì đăng đè lên link này bằng `--url`.

## Trang làm được gì

- Mỗi lần một thẻ: thien gõ (hoặc nói) điều mình nhớ trước, rồi mới bấm "Xem đáp án", rồi tự chấm **Nhớ** hay **Quên**. Đúng nhịp "thử trước, giải thích sau" của `profile/TUTOR.md`.
- Đáp án lấy từ mục "Tự kiểm" trong file bài mà cột "Đáp án ở" trỏ tới (ghép theo chữ trùng). Không ghép được thì trang cho xem đoạn ý chính của bài.
- **Claude chấm câu của mình** (khả năng `sample`): Claude so câu trả lời với đáp án và đoạn bài, nói khớp gì, thiếu gì, rồi gợi ý nên chấm Nhớ hay Quên. Lời dặn cấm thêm chi tiết ngoài bài (luật nguồn số 10 của TUTOR, quan trọng với môn chiến tranh). Không hỏi được thì nút tự ẩn.
- **Nói thay gõ** (khả năng `dictation`): nút mic cạnh ô trả lời (`Kit.dictate` trong lõi chung), chỉ có ở Chrome và app Claude trên máy tính; nơi khác nút tự ẩn.
- Xong lượt thì có danh sách Nhớ/Quên, nút "Ôn lại thẻ quên" (không đổi kết quả, chỉ để ôn thêm), "Chép kết quả", "Gửi cho Claude".
- Lưu theo trạng thái ở máy và ở db `reviews/<ngày>`: tải lại hay đổi máy vẫn về đúng thẻ đang ôn.

## Cách AI dùng

1. Dựng: `node artifacts/review/make-review.mjs learning/cards.md --url https://claude.ai/artifact/L612hHx2vHUokcPBgH7RPu` (thêm `--max 10` để đổi số thẻ, `--today` để thử ngày khác). Lệnh in ra chỗ có `publish.json`; đăng bằng đúng các tham số đó.
2. thien bấm "Gửi cho Claude" (hoặc dán kết quả đã chép): đọc db `reviews/<ngày>` của trang bằng ArtifactData, lưu ra file JSON, rồi chạy `node artifacts/review/apply-review.mjs learning/cards.md <file.json>`. Lệnh sửa cột Hộp và Hỏi lại theo luật trong `cards.md` (nhớ lên một hộp, quên về hộp 1) và in các dòng đã đổi. Lệnh cũng thêm một dòng vào `learning/usage.md`: Claude chấm mấy thẻ, nói thay gõ mấy lần.
3. Dựng lại trang (bước 1) để link cố định hiện các thẻ đến hạn mới, rồi mở PR cho `cards.md`.

`node templates/check-status.mjs docs/STATUS.md --cards learning/cards.md` (CI chạy sẵn) nhắc khi có thẻ quá hạn hơn 3 ngày.

## File

- `make-review.mjs`: đọc bảng thẻ, chọn thẻ đến hạn, tìm đáp án, dựng trang; cũng có `applyReview` cho bước ghi kết quả.
- `apply-review.mjs`: ghi kết quả một buổi ôn vào `cards.md`.
- `template.html`, `review.js`: trang, dựng trên lõi chung `../kit/`.
- Test: `.github/scripts/make-review.test.mjs`; trang mẫu được `../kit/check-pages.mjs` mở ở 3 khổ, lời dặn chấm bài nằm trong `.github/prompts/review-grade.txt`.
