# AI được tự làm gì

File này do thien sở hữu. Bảng dưới đây ghi một lần, cho từng vùng việc, AI tự làm, làm rồi báo, hay phải hỏi trước, để thien không phải nhắn "merge giúp mình" cho từng PR (15–17/11 thien nhắn vậy ở ít nhất 8 chat; một vòng mở PR, chờ CI, merge tốn khoảng 5 lượt). Đặt mức theo vùng chứ không theo từng việc, như [Appelo](https://medium.com/@jurgenappelo/the-7-levels-of-delegation-672ec2a48103) khuyên (đọc 2026-11-17). Kế hoạch: [`docs/plans/2026-11-17-action-gaps.md`](../docs/plans/2026-11-17-action-gaps.md).

Chỉ áp cho repo thienai-workflow. Repo khác theo luật của chính nó (sakubun có mức rủi ro riêng trong `CLAUDE.md`). thien nói khác trong chat thì lời thien thắng, cho đúng việc đó. Luật "thien duyệt" ở mục Sửa quy trình của `README.md` vẫn giữ nguyên: file quy trình (`profile/`, `templates/`, `skills/`, `README.md`, `AGENTS.md`) đều ở dòng "hỏi trước". thien duyệt bảng này ngày 2026-11-17 (câu 2 của báo cáo rà soát).

| Vùng việc | Mức |
|---|---|
| Merge PR mà mọi file đều nằm trong `learning/`, `docs/plans/`, `docs/STATUS.md`, `docs/usage-log.md` (ghi buổi học, tick kế hoạch, ghi số đo) | Tự làm khi CI xanh và đã sửa hay trả lời từng góp ý của bot review; báo một dòng sau |
| Xoá nhánh đã merge, đẩy sổ bàn giao, trả lời góp ý của bot review | Tự làm, báo một dòng sau |
| Đổi bước trong kế hoạch đã duyệt, không đổi mục tiêu | Làm, rồi nói thien một câu trong tin kế tiếp (luật ở `PLANNING.md`) |
| Merge PR có file ngoài danh sách ở dòng đầu (`profile/`, `templates/`, `skills/`, `artifacts/`, `.github/`, `README.md`, `AGENTS.md`...) | Hỏi trước: thien merge, hoặc nhắn "merge" cho đúng PR đó |
| Quyết định làm rồi rất khó sửa lại, đổi mục tiêu kế hoạch | Hỏi trước, thien chọn trước (luật ở `PROFILE.md`) |
| Production, dữ liệu thật, secret, force push nhánh chung | Không làm |

Cách kiểm: PR AI tự merge có dòng `Tự merge theo profile/DELEGATION.md` trong mô tả, và danh sách file của PR (trang Files changed) cho thấy mọi file đều nằm trong dòng đầu của bảng. Xem lại bảng này ở mốc 2026-12-01.
