# Tải skill nhanh bằng file zip

Repo: thiengthb/thienai-workflow · Nhánh: feat/skill-zip-release · PR: chưa có
Ghi bởi: Claude, https://claude.ai/code/session_01WXAvBYKvaws5Vq55EH6RAZ · Cập nhật: 2026-11-14T11:45Z

## thien muốn gì
Tải một skill trong `skills/` về thành một file zip để tải lên Claude, thay vì tải từng file rồi tự nén.

## Đã xong
- Tạo nhánh feat/skill-zip-release

## Bước tiếp theo
1. Viết `.github/scripts/pack-skills.mjs` (nén từng thư mục skill, bỏ STEPS.md) và test, workflow `.github/workflows/skill-zips.yml` đưa zip lên release `skills`, sửa README, SETUP.md, setup-check.mjs chỉ link tải; mở PR.

## Đang chờ thien
Không.

## Lưu ý
- STEPS.md không đóng vào zip: skill đọc bản mới nhất từ repo mỗi lần chạy.
