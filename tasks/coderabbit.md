# Review PR bằng Claude (quyết định 002, 003)

Repo: thiengthb/thienai-workflow · Nhánh: chore/coderabbit-draft-review · PR: https://github.com/thiengthb/thienai-workflow/pull/66 (và thiengthb/sakubun#316)
Ghi bởi: Claude, https://claude.ai/code/session_01WXAvBYKvaws5Vq55EH6RAZ · Cập nhật: 2026-11-14T15:05Z

## thien muốn gì
Review PR lâu dài bằng Claude, không trả thêm tiền. thien chọn C (quyết định 003): agent mới review trong phiên + gọi Claude trên GitHub khi cần; CodeRabbit một lần mỗi PR tới 24/11.

## Đã xong
- PR #66 (299bdaa) và sakubun #316 (d26efac): REVIEW.md, check-review + review-check.yml, claude.yml, quyết định 002/003, luật chung. Đã review bằng agent mới 2 lượt + CodeRabbit; mọi ý đã sửa hay trả lời trong mục Review của mô tả PR. CI xanh, PR đã sẵn sàng.

## Bước tiếp theo
1. Chờ thien merge #66 rồi sakubun #316. Sau đó: review PR #63, #64 theo cách mới; `node templates/handoff.mjs done thiengthb/thienai-workflow coderabbit`.
2. Ngày 2026-11-24: thien gỡ app CodeRabbit, AI xoá `.coderabbit.yaml` ở hai repo (dòng Việc dở trong STATUS).

## Đang chờ thien
- Merge #66 trước, rồi sakubun #316; cài app Claude + secret CLAUDE_CODE_OAUTH_TOKEN; quyết luật merge risk:medium của sakubun (mô tả #316).

## Lưu ý
- Comment của AI đăng bằng tài khoản thien: không viết chữ "@claude" trừ khi muốn gọi Claude trên GitHub.
