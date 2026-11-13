# Mẫu buổi học

Khung cho mọi trang học (frontend, BA, chiến tranh, môn mới), dựng trên lõi chung `../kit/`. Thay `lesson-page.html` cũ từ 2026-11-14. Cách dạy (khung 7 bước, 8 kiểu bài) vẫn ở [`learning/README.md`](../../learning/README.md) và [`learning/teaching/README.md`](../../learning/teaching/README.md); thư mục này chỉ lo phần khung.

## Trang làm được gì

- Mỗi màn một bước, đầu trang có tên buổi, số bước ("3/8") và thanh tiến độ. Nút "Tiếp" mờ tới khi làm xong bước đó.
- Câu hỏi một lựa chọn chấm ngay: chữ "Bạn chọn", "Đúng" và lời giải thích hiện cùng lúc, không chỉ đổi màu.
- Ô tự nói lại, bản của Claude ẩn tới khi bấm xem (ghi lại là xem trước hay sau khi tự viết).
- Góp ý độ dài, độ khó, cách học so với các buổi trước bằng nhóm nút (nút đã chọn tô đen), ô ghi thêm.
- **Xong buổi học**: lưu toàn bộ kết quả vào db của trang ở `sessions/<id>-<thời điểm>`, rồi gửi tóm tắt cho Claude bằng comment (Claude đang theo dõi trang thì tự thức dậy, thien không cần nhắn "xong"). Gửi không được thì hiện nút "Chép kết quả".
- Tự lưu chỗ đang học (`learning/teaching/kit/kit.js`): tải lại, tắt màn, mở trên máy khác đều về đúng chỗ. Học lại thì bỏ phần ôn.
- Chế độ tối theo máy, theo màu của lõi chung. Một bo góc 8px, nút và dòng đáp án cao 44px (thienui `docs/taste.md`).

## Cách AI soạn một buổi

1. Chép `template.html` sang `learning/<môn>/pages/lesson-NN.html`.
2. Thay mọi chỗ `__…__` (id dạng `frontend-06`, tên môn, tên buổi, tiêu đề) và nội dung mẫu. Phần riêng của bài (sơ đồ, mô phỏng) viết trong `<style>` và `<script>` cuối trang; ghi kết quả vào `R`, gọi `Lesson.done('<khóa>')` khi một việc xong. Chỉ đổi `R` và gọi `Lesson.done` trong lúc bấm nút hay gõ chữ: phần tự lưu chỉ ghi lại lần bấm và chữ đã gõ, tải lại thì bấm lại đúng thứ tự, nên thứ gì sinh ra từ đó đều tự về. Kéo thả hay hẹn giờ thì không về được, cần thì đổi thành nút.
3. `node artifacts/lesson/make-lesson.mjs learning/<môn>/pages/lesson-NN.html` chép lõi chung và khung vào trang (chạy lại được, thay bản cũ).
4. `node learning/teaching/check-page.cjs learning/<môn>/pages/lesson-NN.html` rồi đăng trang thành artifact, `capabilities`: `{"db": {}, "comments": {}}`.
5. Khi thien gửi: đọc comment (ArtifactComments) và `sessions/` (ArtifactData), ghi nhật ký như mục "Sau buổi" trong `learning/README.md`.

## Quy ước trong trang

| Thứ | Viết thế nào |
|---|---|
| Cấu hình | `<script type="application/json" id="lesson">{ "id", "subject", "title" }</script>` |
| Bước | `<section class="step" data-s="N">`, bước đầu thêm `on`; phần ôn thêm `data-part="review"` |
| Nút đi tiếp | `<button class="btn primary next" data-go="N" data-need="khóa1 khóa2" disabled>`; nút bị phần ôn khóa thêm `data-review-gate` |
| Câu hỏi | `<div class="q" data-q="khóa" data-a="chỉ số đúng" [data-kind="review"]>` chứa `.status`, các `.opt`, `.why` |
| Ô viết | `<textarea data-key="teach" data-min="5">`; nút xem bản mẫu `data-show="mine"`, hộp `#mine.mine` |
| Góp ý | `<div class="crit"><b>Tên tiêu chí</b><div class="seg full" data-f="len">` với nút `data-v`; ô `#note`. Tóm tắt lấy tên trong `<b>` |
| Kết thúc | `#finish`, `#done-msg`, `#copy.hide` |
| Phản hồi | `.fb`, `.fb.good`, `.fb.bad` |

## File

| File | Là gì |
|---|---|
| `template.html` | Buổi mẫu đủ 8 màn, chép ra làm buổi mới |
| `lesson.css`, `lesson.js` | Khung: bước, câu hỏi, góp ý, kết thúc |
| `make-lesson.mjs` | Chép `../kit/kit.css`, `../kit/kit.js`, khung và phần tự lưu vào trang |
