# Mẫu buổi học

Khung cho mọi trang học (frontend, BA, chiến tranh, môn mới), dựng trên lõi chung `../kit/`. Thay `lesson-page.html` cũ từ 2026-11-14. Cách dạy (khung 7 bước, 8 kiểu bài) vẫn ở [`learning/README.md`](../../learning/README.md) và [`learning/teaching/README.md`](../../learning/teaching/README.md); thư mục này chỉ lo phần khung.

## Trang làm được gì

- Mỗi màn một bước, đầu trang có tên buổi, số bước ("3/8") và thanh tiến độ. Nút "Tiếp" mờ tới khi làm xong bước đó.
- Câu hỏi một lựa chọn chấm ngay: chữ "Bạn chọn", "Đúng" và lời giải thích hiện cùng lúc, không chỉ đổi màu.
- Ô tự nói lại, bản của Claude ẩn tới khi bấm xem (ghi lại là xem trước hay sau khi tự viết).
- Góp ý độ dài, độ khó, cách học so với các buổi trước bằng nhóm nút (nút đã chọn tô đen), ô ghi thêm.
- **Xong buổi học**: lưu toàn bộ kết quả vào db của trang ở `sessions/<id>-<thời điểm>`, rồi gửi tóm tắt cho Claude bằng comment (Claude đang theo dõi trang thì tự thức dậy, thien không cần nhắn "xong"). Gửi không được thì hiện nút "Chép kết quả".
- Tự lưu chỗ đang học (`../kit/autosave.js`): tải lại, tắt màn, mở trên máy khác, hay mở bản AI vừa sửa đều về đúng chỗ, vì phần tự lưu nhớ nút theo tên chứ không theo thứ tự. Học lại thì bỏ phần ôn.
- **Hỏi Claude ngay trong bài** (khả năng `sample`, xem `../README.md`): nhận xét bài tự nói lại, giải thích chỗ chọn sai, ô "Hỏi Claude về bước này". lesson.js tự gắn vào mọi bài, không cần sửa trang. Nút hỏi có `data-noreplay`, ô hỏi là `<input>`: phần tự lưu không bấm lại nên tải lại không tốn lượt hỏi.
- **Claude biết chỗ còn vướng của các buổi trước**: `make-lesson.mjs` đọc mục "Chỗ còn vướng" của `learning/<môn>.md` (6 dòng mới nhất) vào cấu hình bài (`"stuck"`); lời dặn khi hỏi về một bước và khi nhận xét bài tự nói lại có thêm phần này, dặn chỉ nối vào khi liên quan. Sửa mục đó rồi dựng lại trang là trang có bản mới.
- **Nói thay gõ** ở ô tự nói lại (khả năng `dictation`, `Kit.micRow` trong lõi chung): nút mic cạnh ô, chỉ có ở Chrome và app Claude trên máy tính, nơi khác tự ẩn. Số lần nói ghi vào `R.spoke`.
- Chế độ tối theo máy, theo màu của lõi chung. Một bo góc 8px, nút và dòng đáp án cao 44px (thienui `docs/taste.md`).

## Cách AI soạn một buổi

1. `node artifacts/lesson/make-lesson.mjs learning/<môn>/pages/lesson-NN.html`: trang chưa có thì script chép `template.html` ra đó rồi dừng. Trước đó script tải nhánh mới nhất và dừng nếu có nhánh chưa merge (PR của phiên khác) sửa `learning/<môn>.md` hay `learning/<môn>/`: đọc nhánh đó, gộp vào nhánh của mình nếu cần, rồi chạy lại với `--ack-open`.
2. Thay mọi chỗ `__…__` (id dạng `frontend-06`, tên môn, tên buổi, tiêu đề) và nội dung mẫu. Phần riêng của bài (sơ đồ, mô phỏng) viết trong `<style>` và `<script>` cuối trang; ghi kết quả vào `R`, gọi `Lesson.done('<khóa>')` khi một việc xong. Chỉ đổi `R` và gọi `Lesson.done` trong lúc bấm nút hay gõ chữ: phần tự lưu chỉ ghi lại lần bấm và chữ đã gõ, tải lại thì bấm lại đúng thứ tự, nên thứ gì sinh ra từ đó đều tự về. Kéo thả hay hẹn giờ thì không về được, cần thì đổi thành nút.
3. Chạy lại đúng lệnh ở bước 1. Script chép lõi chung và khung vào trang (chạy lại được, thay bản cũ), tự chạy `learning/teaching/check-page.cjs` trên điện thoại và laptop, qua thì ghi `publish.json` vào thư mục tạm `lesson-<id>` (hoặc `--out <thư-mục>`). Chưa qua thì sửa rồi chạy lại.
4. Gọi Artifact với đúng tham số trong `publish.json` (trang, `capabilities` `{"db": {}, "comments": {}, "sample": {}, "dictation": {}}`).
5. Khi thien gửi: đọc comment (ArtifactComments) và `sessions/` (ArtifactData), lưu bản đó ra file JSON, rồi làm đúng mục "Sau buổi" trong `learning/README.md`: `node artifacts/lesson/after-lesson.mjs <file.json> --write` soạn nháp và ghi chỗ còn vướng, `--check <lesson-id>` kiểm đã ghi đủ.

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
| `make-lesson.mjs` | Chép mẫu ra trang mới; chép `../kit/kit.css`, `../kit/kit.js`, khung và phần tự lưu vào trang, đưa chỗ còn vướng vào cấu hình, kiểm trang, ghi `publish.json` |
| `learning-week.mjs`, `learning-week.html` | Bảng học tuần (xem dưới) |
| `after-lesson.mjs` | Sau buổi: soạn nháp nhật ký, chỗ còn vướng, thẻ, dòng "Trạng thái" từ bản lưu của trang; `--write` ghi chỗ còn vướng và dòng `learning/usage.md`; `--check` kiểm đã ghi đủ. Test: `.github/scripts/after-lesson.test.mjs` |

## Bảng học tuần

Trang https://claude.ai/artifact/LijnAF7tSR4gBMrspPuQtV (loại trang Data của claude.ai): số buổi từng môn theo tuần, thẻ đến hạn, chỗ còn vướng, môn hay hỏi Claude. Bấm vào một số để xem nó lấy từ dòng nào, tính thế nào.

Trang không đọc repo được, nên số liệu là 4 file JSON tải lên trang. Mỗi Chủ nhật (hoặc khi thien hỏi), AI làm:

1. `node artifacts/lesson/learning-week.mjs --out <thư-mục>` ghi `sessions.json`, `cards.json`, `stuck.json`, `asks.json`. Mỗi file mang luôn code của script, để trên trang ai cũng xem được.
2. Tải từng file lên trang: công cụ Artifact, `asset: true`, `url` là link trang trên.
3. Ghi đè nguồn `datasets/<tên>` của trang (công cụ ArtifactData, `update`): `source.url` là `/_blob/<id>` vừa nhận, `updated: {at, by: "Claude"}`, `edit: {via: "claude", at}`. Xóa file cũ (`delete` với id cũ) khi không còn nguồn nào trỏ tới.

Giao diện trang là `learning-week.html` trong thư mục này; sửa thì ghi lại vào `files/index.html` của trang. Tài khoản Claude khác không ghi được vào trang này: khi đó tạo trang mới từ loại Data, ghi `dash/meta` (`{title: "Học tuần này", lang: "vi"}`), 4 nguồn và `files/index.html`, rồi sửa link ở đây, trong `artifacts/README.md` và trong `learning/README.md`.
