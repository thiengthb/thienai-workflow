# Tải skill nhanh bằng file zip

Repo: thiengthb/thienai-workflow · Nhánh: feat/skill-zip-release · PR: https://github.com/thiengthb/thienai-workflow/pull/65
Ghi bởi: Claude, https://claude.ai/code/session_01WXAvBYKvaws5Vq55EH6RAZ · Cập nhật: 2026-11-14T11:55Z

## thien muốn gì
Tải một skill trong `skills/` về thành một file zip để tải lên Claude, thay vì tải từng file rồi tự nén.

## Đã xong
- Script, test, workflow, sửa README, SETUP.md, setup-check.mjs, STATUS (commit a52ec31), mở PR #65
- Gửi thien 2 file zip trong chat để tải skill ngay, chưa cần chờ merge

## Bước tiếp theo
1. Sau khi thien merge PR #65: xem Actions > Skill zips chạy xanh, mở 2 link trong mô tả PR thấy tải được, rồi `node templates/handoff.mjs done thiengthb/thienai-workflow skill-zip`.

## Đang chờ thien
- Merge PR #65.

## Lưu ý
- STEPS.md không đóng vào zip: skill đọc bản mới nhất từ repo mỗi lần chạy.
