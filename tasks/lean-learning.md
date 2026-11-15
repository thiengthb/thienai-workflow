# Học nhẹ dần: đợt 2 (hồ sơ nóng cố định và gói buổi)

Repo: thiengthb/thienai-workflow · Nhánh: claude/lean-learning-2 · PR: chưa có
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBXNLQf4kZZBQiEFV6R · Cập nhật: 2026-11-15T06:52Z

## thien muốn gì
"merge xong rồi mình sẽ sang chat mới tiếp tục công việc tối ưu" (2026-11-15): làm tiếp kế hoạch `docs/plans/2026-11-15-lean-learning.md` ở chat mới.

## Đã xong
- Đợt 1 (PR #77, #78): trang bài trong repo chỉ còn nguồn, CI chỉ kiểm trang đổi, bản dựng ra `build/`, mở lại bài cũ ở nick đang dùng.
- Đợt 0: số đo đầu ở PR #79 (55% usage là ngữ cảnh đọc lại). Luật một chat một mục tiêu và `docs/usage-log.md` ở PR #80.
- Đợt 2, phần nhật ký (fd11693, nhánh claude/lean-learning-2): `after-lesson --write` thêm dòng nhật ký nháp và giữ 3 dòng, dòng cũ sang `learning/<môn>/log.md`; `--check-all` chặn quá 3 dòng nhật ký, quá 6 chỗ vướng, còn `<…>`. Đã chuyển nhật ký frontend (1–3), war (1, 2). Sửa luôn lỗi câu ôn môn khác (bước 3 cũ).

## Bước tiếp theo
1. Viết `artifacts/lesson/prepare-lesson.mjs` in gói buổi (buổi kế tiếp, mục tiêu, chỗ còn vướng, 3 thẻ đến hạn, nhánh mở đụng môn đó, đường dẫn luật); sửa bảng "học" trong `profile/MAP.md`. Xong khi `reading-cost.mjs` in luồng "học" khoảng 50 KB (đang 79,9 KB sau buổi Frontend 6) và thêm 10 buổi giả trong test mà số không tăng.
2. Xong thì làm theo `profile/CHATS.md`: đo usage, ghi `docs/usage-log.md` trong PR.

## Đang chờ thien
Không.

## Lưu ý
- Nhánh `claude/frontend-06` đã bị thay bằng `claude/frontend-06-after` (PR #79); xóa được, đừng làm tiếp trên nó.
- Buổi học kế tiếp là BA 3, làm ở chat riêng, không gộp với việc tối ưu.
