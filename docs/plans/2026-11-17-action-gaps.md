# KH2 · Các hành động giữa thien và AI còn thiếu luật

Trạng thái: đang chạy · Duyệt: 2026-11-17 · Cập nhật: 2026-11-18 · nick tnt697 · Báo cáo gốc: [Rà soát quy trình làm việc thien và Claude](https://claude.ai/artifact/PWo1UdCofcZ49baViSbe6Q) (mở ở nick tnt697)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: đợt 1 đã merge (PR #104), đã kiểm ở 4 chat: 4 trên 6 PR đủ điều kiện được AI tự merge (bảng ở mục "Kiểm đợt 1"). Đợt 2 xong: lệnh, bảng file đích, bù thuật ngữ (PR #106), gu vào thienui (PR #8), sửa tên trục lưới 2×2 (PR #110, đã merge 2026-11-17).
- Còn thiếu: đợt 3 ở mốc 2026-12-01, gồm quyết định sửa gì cho phần tự merge.
- thien cần làm: không có.

## Mục tiêu
Những gì thien nói với AI (chê, khen, chọn, giao việc) đi tới đúng file và được làm, mà thien không phải nhắc lại hay duyệt thêm.

## Đã biết (chi tiết và nguồn ở báo cáo gốc)
- Quy trình có 32 hành động giữa thien và AI: 7 thien đã nêu, 18 đã làm mà thien chưa nêu, 7 chưa có luật. Bốn cái xảy ra hằng ngày mà chưa có luật: ủy quyền, nhận việc, báo cáo khi xong việc, gom góp ý.
- Luật có lệnh kiểm thì được làm (STATUS, nhật ký buổi học, link nội bộ, trang học); luật chỉ ghi chữ thì trôi: `glossary.md` một lần sửa (08/11), `SKILL-LEVEL.md` chưa chấm lại từ 05/11, `taste.md` của thienui không đổi từ 07/11, 3/3 quyết định để trống phần tóm tắt của thien.
- Luật "mỗi milestone" không có ngày nên không bao giờ tới lượt; luật có ngày (22/11, 01/12, 13/12) thì nằm trong STATUS và kế hoạch.

## Không làm
- Không sửa những gì kế hoạch [`2026-11-17-workflow-review.md`](2026-11-17-workflow-review.md) đã nhận: khởi động, đường beta, nhắc việc dở, ngưỡng đổi chat, tự động hoá phần học.
- Không thêm script mới; chỉ sửa `after-lesson.mjs` có sẵn.
- Không đổi khung 7 bước của buổi học.
- Không dựng quy trình làm việc nhóm trước khi capstone bắt đầu.
- Không thêm luật mới từ sau đợt 2 tới 2026-12-01, trừ khi có lỗi thật chặn việc (thien chọn 2026-11-17).

## Các phương án đã xét
| Phương án | Lý do mạnh nhất để không chọn |
|---|---|
| Làm hết trong một PR lớn | Vượt luật 3 thay đổi, đụng file của PR đang mở và của đợt 5 kế hoạch review |
| Chỉ dọn luật trùng, không thêm hành động | Việc nhắn "merge giúp mình" và góp ý bị trôi vẫn còn mỗi ngày |
| Mỗi hành động một skill | Ba hành động này ngắn và xảy ra ở mọi chat; skill phải tải lên 3 nick |
| Ba đợt nhỏ, đợt 3 gộp vào mốc 01/12 (chọn) | Chậm: tới 13/12 mới xong hết |

## Checkpoint

### 0. thien đọc và chọn
Xong khi: thien trả lời 4 câu hỏi của báo cáo và PR #102 đã merge.
- [x] thien trả lời "ok" cho cả 4 câu (2026-11-17 15:35): nhánh cải thiện workflow là kế hoạch review; ủy quyền merge như đề xuất; ngừng thêm luật sau đợt 2 tới 01/12; gu từ buổi học gom 2 tuần một PR vào thienui
- [x] PR #102 merge (2026-11-17)
- [x] Ghi kế hoạch này và dòng ở STATUS (PR này, chờ merge)

### 1. Ủy quyền, nhận việc, báo cáo
Xong khi: ở 3 chat kế tiếp có PR thuộc dòng đầu của `profile/DELEGATION.md`, thien không phải nhắn "merge giúp mình"; tin cuối của mỗi chat có đủ kết quả, việc thien cần làm, việc tiếp theo; thien đọc bộ tình huống dưới thấy mỗi ca ra đúng một hành vi.
- [x] `profile/DELEGATION.md`; `AGENTS.md` mục Sửa repo trỏ tới nó; một dòng ở `profile/MAP.md` (PR #104)
- [x] `profile/CHATS.md` mục Đầu chat: dòng mục tiêu ba phần cho việc nhiều bước, chỉ hỏi lại khi câu trả lời đổi thứ sẽ ra (PR #104)
- [x] `profile/VOICE.md` mục "Báo cáo khi xong việc"; `PROFILE.md` (bản tóm tắt 2 phút) và `skills/start-project/STEPS.md` trỏ tới mục đó (PR #104)
- [x] thien chọn câu mẫu A (2026-11-17), đã thêm vào bảng câu mẫu của `VOICE.md` (PR #104)
- [ ] Kiểm ở 3 chat kế tiếp: đã kiểm ở 4 chat, chưa đạt: ở chat Chiến tranh 7 công cụ chặn lệnh merge nên thien merge tay (#107); ở chat Frontend 10 AI quên, thien nhắn "merge" thì lệnh chạy được (#117). Bảng ở mục "Kiểm đợt 1". Quyết sửa gì ở mốc 01/12

### 2. Đường chảy cho góp ý (cùng buổi học kế tiếp)
Xong khi: PR sau buổi kế tiếp có dòng bảng thuật ngữ (hay "không có từ mới"), thiếu thì `after-lesson --check` báo; lệnh in câu gu của buổi và nơi ghi (hàng chờ gom 2 tuần một PR vào thienui, không có lệnh kiểm); thien mở `taste.md` thấy mục "Đang thử" có gu từ các buổi frontend.
- [x] `after-lesson.mjs`: in câu gu của buổi và nơi ghi; `--check` đòi file bài có dòng "Từ mới:" và các từ đó có trong `glossary.md`. Ghi một dòng vào "Đã đổi" của [`2026-11-15-lean-learning.md`](2026-11-15-lean-learning.md) để checkpoint 4 ở đó giữ phần kiểm này (PR #106; test trong `.github/scripts/after-lesson.test.mjs`)
- [x] `learning/README.md` mục Sau buổi thêm bước "từ mới vào bảng thuật ngữ, câu gu vào hàng chờ thienui"; `profile/MAP.md` thêm dòng "Góp ý của thien" trỏ bảng file đích (PR #106; bảng nằm ngay trong `MAP.md`)
- [x] Bù một lần: từ mới của 18 buổi vào `glossary.md` (6 từ, PR #106); gu từ nhật ký frontend 1–9 vào `taste.md` mục "Đang thử" qua một PR vào thienui (thien duyệt từng dòng): thien duyệt 5 dòng (2026-11-17): bỏ 1, gộp 2, còn 3 dòng vào thienui PR #8 (đã merge 2026-11-17); buổi 6–9 không có câu gu trong file bài
- [x] Trước buổi BA 5: sửa lỗi tên trục đè thẻ ở lưới 2×2 (PR kit riêng): tên trục ra lề riêng ngoài ô, test `.github/scripts/grid2-axis.test.mjs` (PR #110, đã merge 2026-11-17)

### 3. Cho luật "mỗi milestone" một ngày thật (mốc 2026-12-01)
Xong khi: STATUS có hai mốc 01/12 và 13/12, mỗi mốc kèm danh sách việc; thien duyệt luật "3 thay đổi" mới; `SKILL-LEVEL.md` có ngày chấm mới sau 13/12.
- [ ] `README.md` mục Sửa quy trình: milestone là các mốc ghi trong STATUS; "tối đa 3 luật mới mỗi mốc, sửa chỗ ghi sai không tính"
- [ ] Mốc 01/12 thêm: review code theo giai đoạn cho các PR sau 24/11 (phạm vi theo quyết định 003); câu hỏi "AI có đổi ý chỉ vì thien nói mạnh hơn không"; dọn luật ngôn ngữ về `VOICE.md`; skill `viet-de-hieu` vào repo hay bỏ; ba mức nghiên cứu và bảng công cụ trong `RESEARCH.md`; ghi lịch nhắc thứ Hai, thứ Năm (ở nick tnt628) vào `ACCOUNTS.md`; xem lại bảng ủy quyền, thêm vào đó một dòng "CI không tự chặn merge (repo riêng tư gói Free không có bảo vệ nhánh), AI tự xem CI xanh trước khi merge"; quyết sửa công cụ, sửa luật hay để nguyên phần tự merge, dựa trên bảng "Kiểm đợt 1"; review theo giai đoạn soi trước lệnh xoá hay ghi file, git, token, đồng bộ sang repo khác; lần tới thien nói "tiếp tục" thì ghi nick mới có làm tiếp được từ sổ bàn giao không, thiếu gì (ba ý cuối từ [kế hoạch review Codex 18/11](2026-11-18-codex-review.md)). Gộp phần đụng mẫu AGENTS chung vào đợt 5 của kế hoạch review để chỉ sinh một PR đồng bộ
- [ ] Mốc 13/12: chấm lại `SKILL-LEVEL.md` (AI soạn từ nhật ký, thien duyệt)
- [ ] Trong vòng học sau 22/11: một buổi kiểu "Viết luật cho thienui"

Thời gian: đợt 1 một chat; đợt 2 một chat cộng một PR kit nhỏ, kiểm ở buổi học kế tiếp; đợt 3 một chat ngày 01/12, một chat ngắn ngày 13/12.

Chỗ dễ sa lầy: bảng ủy quyền phình thành danh sách từng trường hợp (giới hạn 8 vùng); kiểm "từ mới" phiền vì cứ phải ghi "không có" (sau 3 buổi đều "không có" thì bỏ kiểm đó); dọn luật ở đợt 3 trượt thành viết lại toàn bộ.

## Bộ tình huống mẫu (kiểm đợt 1 bằng cách đọc)
| Tình huống | Hành vi đúng | Luật quyết định |
|---|---|---|
| PR sau buổi chỉ sửa file trong `learning/` và STATUS, CI xanh, bot không còn góp ý chưa trả lời | AI tự merge, mô tả PR có dòng tự merge, báo một dòng | `DELEGATION.md` dòng 1 |
| PR sửa `artifacts/kit/` hay `profile/`, CI xanh | Báo thien, chờ thien merge hay nhắn "merge" | `DELEGATION.md` dòng 4 |
| thien nhắn "merge rồi nghiên cứu X" ở project bản cũ | Câu đầu: "Mục tiêu: … · Sẽ ra: … · Xong khi: …" kèm thứ tự (merge trước, nghiên cứu sau) | `CHATS.md` Đầu chat |
| Xong một PR sửa 5 file | Tin cuối có kết quả kèm link PR, việc thien cần làm (hay "Không có"), việc tiếp theo; không kể lại từng bước | `VOICE.md` Báo cáo khi xong việc |

## Kiểm đợt 1
Các PR đủ điều kiện tự merge (mọi file trong dòng đầu của `DELEGATION.md`) từ khi PR #104 merge, đọc từ mô tả PR ngày 2026-11-18. Mọi PR tự merge đều chỉ sửa file trong vùng cho phép.

| PR | Chat | Kết quả |
|---|---|---|
| #107 | Chiến tranh 7 (tnt697) | Công cụ chặn lệnh merge, thien merge tay |
| #114, #115 | BA 5 (tnt697) | AI tự merge |
| #117 | Frontend 10 (tnt697) | AI quên, báo "chờ bạn merge", thien phải nhắn |
| #119 | Trang mở nhanh (tnt628) | AI tự merge |
| #120 | Frontend 10 (tnt697) | AI tự merge |

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-17 | Bảng file đích đặt ngay trong `profile/MAP.md` (mục "Góp ý của thien đi đâu"); câu gu chờ ở `learning/frontend/taste-queue.md` | Không thêm file sổ mới cho bảng; hàng chờ cần một chỗ trong repo này vì thienui là repo khác, PR gom 2 tuần một lần |
| 2026-11-17 | Đợt 2 làm sau khi PR #105 merge, sửa chồng lên phần ôn tự sinh của #105 | #105 cũng sửa `after-lesson.mjs` và `learning/README.md`; thien chọn merge #105 trước |
| 2026-11-17 | Dòng mục tiêu ba phần chỉ cho project bản cũ; mẫu báo cáo là nội dung phải có, không ép ba mục ở bản beta; bảng ủy quyền chỉ cho repo này; đợt 2 ghi một dòng vào kế hoạch học nhẹ dần | Ba chỗ chỉnh của nick tnt628 ở PR #103 (mục "Phối hợp với kế hoạch song song" của kế hoạch review) |
| 2026-11-17 | Bộ tình huống của đợt 1 để trong file này, không thêm vào kế hoạch review | File kế hoạch review đang được sửa ở PR #103 |
| 2026-11-17 | Lịch nhắc thứ Hai, thứ Năm: không còn là câu hỏi, chỉ cần ghi vào `ACCOUNTS.md` ở đợt 3 | Nick tnt628 xác nhận lịch nằm ở nick đó, vẫn chạy (lần gần nhất 2026-11-16) |
| 2026-11-18 | Kiểm đợt 1 dừng sau 4 chat, không chờ thêm; mốc 01/12 nhận thêm ba việc từ review Codex | Đủ số liệu để quyết (2 kiểu trượt khác nhau đã lộ ra); thêm việc vào mốc có sẵn thay vì mở mốc mới (nick tnt628, [kế hoạch review Codex](2026-11-18-codex-review.md)) |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
| 2026-11-17 | Kiểm đợt 1, chat Frontend 10 (nick tnt697): PR #117 chỉ có `learning/`, CI xanh, đủ điều kiện tự merge, nhưng AI để PR chờ và báo "chờ bạn merge"; thien phải nhắn "merge giúp mình". Lỗi của AI, không phải công cụ (lệnh merge chạy được ngay sau đó) | Đã merge #117. Chat này tính là trượt lần kiểm này |
| 2026-11-17 | Gắn repo quyền push lại bị bộ duyệt quyền chặn ở chat Chiến tranh 7, dù project instructions có tên repo | thien nhắn cho phép, gắn lại |
| 2026-11-17 | Kiểm đợt 1, chat thứ nhất: PR #107 (chỉ `learning/`, STATUS, CI xanh, bot không góp ý) đủ điều kiện tự merge, nhưng lệnh merge bị bộ duyệt quyền của Claude chặn. Bảng ủy quyền đúng, công cụ không cho làm | Báo thien merge tay; xem ở 2 chat kiểm còn lại có lặp không, nếu lặp thì ghi vào bước kiểm đợt 1 là "tự merge" cần thien cho phép trong chat |
| 2026-11-17 | Lần gắn repo đầu bị bộ duyệt quyền chặn vì tin mở đầu không có tên repo; báo cáo nháp đầu dựa trên bản đồng bộ knowledge chậm hơn main khoảng 2 ngày | thien cho phép gắn repo; viết lại báo cáo trên main `e83e308` |
