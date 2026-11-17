# Sửa quy trình sau review 2026-11-17

Trạng thái: đang chạy · Duyệt: 2026-11-17 (thien: "ok mình duyệt và bạn hãy bắt đầu làm", đợt 0, 1, 2 và 5 câu hỏi theo đề xuất) · Cập nhật: 2026-11-17 · Thread: [Review sâu và tối ưu thienai-workflow](https://claude.ai/code/project/chan_01SGACbRV5gySBUzjhLdLPvR?thread=cmsg_01SGACbRV5gySBUzjhLdLPvRL6Rmzan9FkewxyJuLWWw6Z) · nick tnt628 · Đầu vào: [bản review và kế hoạch gộp](https://claude.ai/artifact/Wi411et6UDhnH1Eo147PM4) (gộp cả review của Codex cùng ngày, cùng commit 08334ae)

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: đợt 0, 1, 2 xong, PR #98 merge 2026-11-17; sakubun nhận phần chung mới qua PR #327 (merge cùng ngày).
- Còn thiếu: đợt 3 xong (BA 4: 15,8 triệu token; Frontend 9: 23,1 triệu). Đã sửa các lượt phí đợt 3 tìm ra (xem "Kết luận đợt 3"). Đợt 4 để tới lần xem lại 2026-12-01 (thien chọn 2026-11-17).
- thien cần làm: không có.

## Mục tiêu
Bộ quy trình đúng và gọn hơn mà không mất luật nào: sửa chỗ ghi sai, luật áp theo điều kiện thay vì áp mọi lúc, có đường riêng cho project bản beta, và bám tính năng có sẵn của Claude thay vì tự làm lại.

## Không làm
- Không viết lại từ đầu, không xây hệ thống điều phối hay khoá mới.
- Không thêm script mới; chỉ sửa script có sẵn.
- Không dùng hook SessionStart: thread của project beta không chạy hook trong `.claude/settings.json` ([tài liệu Claude Projects](https://code.claude.com/docs/en/claude-projects), mục "What threads pick up from your repositories", đọc 2026-11-17).
- Không cắt luật dạy hay nén luật quan trọng chỉ để giảm KB. Không tách hệ thống học ra repo riêng.

## Nguyên tắc
Bám tính năng có sẵn của Claude và cập nhật theo nó; không làm lại thứ Claude đã có, không sửa hay cắt hướng dẫn gốc của Claude. Phần tự làm chỉ giữ khi tính năng có sẵn không làm được (ví dụ đổi nick: Claude không chia sẻ thread giữa các tài khoản).

## Checkpoint

### 0. Dọn sự thật, không đổi luật
Xong khi: thien đọc STATUS thấy đúng; `start-session --claim` không nhận việc đã xong.
- [x] STATUS viết lại theo trạng thái 2026-11-17 (bỏ PR đã merge, nhánh đã merge, sakubun #301 cũ thành #326) (PR #98)
- [x] Đầu 3 kế hoạch cũ đúng trạng thái; `handoff.mjs done` việc `claude-only-learning` (đã xoá khỏi sổ 2026-11-17) (PR #98)
- [x] Con trỏ cũ "đọc `learning/README.md` trước" ở `TUTOR.md`, `learning/README.md`, `MAP.md` đổi thành gói buổi (PR #98)
- [x] Lấy lại cách gắn repo qua ô Project knowledge của PR #74 cho project bản cũ (PR #98)
- [x] Xoá 5 nhánh cũ (thien xoá 2026-11-17; `check-open-work` báo không còn nhánh chưa merge)

### 1. Luật theo điều kiện áp dụng (chỉ sửa chữ)
Xong khi: đọc bộ tình huống dưới với luật mới thì mỗi ca ra đúng một hành vi; câu hỏi đơn giản không phải chờ kiểm việc dở.
- [x] Nhắc việc dở ba mức (chặn / không chặn / hỏi đáp), file chủ `PROFILE.md` (PR #98)
- [x] Phương án đã xét chỉ bắt buộc với quyết định khó sửa lại hay có đánh đổi thật; STATUS sửa khi trạng thái đổi (PR #98)
- [x] Sổ bàn giao ghi ở mốc có nghĩa, không sau từng bước (PR #98)
- [x] `CHATS.md`: ngưỡng là hướng dẫn đang thử, chỉ cho project bản cũ; đo usage chỉ khi đang có thí nghiệm, bỏ khỏi phần chung (PR #98)
- [x] Giới hạn số dòng đổi thành nguyên tắc kèm cỡ KB; câu hỏi thứ tư "luật này xem lại khi nào" (PR #98)

### 2. Đường beta và bớt báo động giả (sửa script có sẵn)
Xong khi: thread beta mới khởi động không gọi `project_info`, không clone lại, không báo thiếu setup sai; `check-open-work` ghi rõ nhánh nào đã có PR đóng.
- [x] `SETUP.md` v4: hai đoạn instructions (project beta và project cũ), chỗ bấm đúng cho từng loại (PR #98)
- [x] `start-session.mjs`: chế độ beta không in lại `AGENTS.md`; báo lỗi khi gặp tham số lạ; cảnh báo khi STATUS bảo chờ một PR đã đóng (PR #98)
- [x] `check-open-work.mjs` ghi PR của từng nhánh (đang mở, đã đóng, chưa có) (PR #98)
- [x] `reading-cost.mjs` ghi rõ đây là cỡ tài liệu, không phải usage (PR #98)

### 3. Đo buổi học (chạy cùng hai buổi học kế tiếp)
Xong khi: có tổng số lượt của chat dựng bài và chat sau buổi ở hai buổi, kèm một câu "bước nào lâu nhất"; ở beta thêm số token của thread trong Project settings > Usage.
- [x] Buổi 1: BA 4 (2026-11-17, nick tnt628, project beta, một thread cho cả dựng bài và sau buổi). Dựng bài khoảng 35 lượt gọi trong 9 phút, sau buổi khoảng 18 lượt. Lâu nhất là dựng trang (khoảng 18 lượt: đọc kit `artifacts/it/` và bài BA 3 làm mẫu, viết trang, sửa hai lỗi bài kiểm). Lượt phí: 3 lần chạy lại `start-session.mjs` vì truyền thiếu `--instructions`, 4 lượt tìm công cụ đăng trang (`publish_files`, khai khả năng, `watch` không bật được nên trang không tự báo về thread). Project settings > Usage lúc 11:08 (sau khi merge PR #100): thread 15,8 triệu token, 2% của project; để so, thread "Review sâu và tối ưu thienai-workflow" 60,6 triệu, "Học luân phiên nhiều môn" 137,3 triệu
- [x] Buổi 2: Frontend 9 (2026-11-17, nick tnt628, project beta, một thread cho cả dựng bài và sau buổi). Dựng bài khoảng 43 lượt gọi trong 18 phút (04:12–04:30 UTC), sau buổi khoảng 16 lượt (gồm mở PR). Lâu nhất là dựng trang (khoảng 16 lượt: viết trang 12 bước có ảnh chụp buổi 1, năm cặp màn và bàn thử mới; hai lần chạy `make-lesson.mjs`, mỗi lần khoảng 4 phút vì `check-page.cjs` bấm từng nút, lần đầu trượt vì hàng 4 nút góp ý tràn khổ điện thoại). Lượt phí: 3 lượt chờ lệnh chạy nền; trang lại không tự báo về thread (`watch` báo `no_address`) nên thien phải nhắn "xong". Buổi dài hơn BA 4 vì là buổi mốc (12 bước, thien chấm "dài"). Project settings > Usage lúc 12:26 (sau khi sửa hai góp ý review, chưa merge PR #102): thread 23,1 triệu token, 3% của project; BA 4 là 15,8 triệu

Kết luận đợt 3 (2026-11-17): mỗi buổi khoảng 50–60 lượt gọi. Dựng trang khoảng 16–18 lượt, khoảng một phần ba. Khoảng 7–10 lượt là phí, sửa được mà không thêm script:
- [x] 4 lượt đi tìm công cụ đăng trang ở bản beta: `artifacts/kit/publish.mjs` in sẵn cách đăng cho bản beta (`publish_files`, `read_declaration`, `declare_capabilities`); `artifacts/lesson/README.md` ghi tên công cụ đọc kết quả ở bản beta
- [x] 3 lần chạy lại `start-session.mjs` vì thiếu `--instructions`: lời báo lỗi của `setup-check.mjs` nói rõ tham số nhận gì
- [x] Trang không tự báo về thread ở bản beta (hai buổi đều vậy, `watch` báo `no_address`): `artifacts/lesson/README.md` dặn khi đưa trang thì bảo thien nhắn "xong" trong thread. [Chưa kiểm] vì sao không tự thức; tài liệu công cụ nói đăng bằng `publish_files` là đã tự theo dõi trang

### 4. Tự động hoá phần học, chỉ khi đợt 3 cho thấy đáng
Kết quả (2026-11-17, thien bấm trên thẻ hỏi "Làm đợt 4 (tự sinh khung bài học) ngay, hay để tới 1/12?"): "Để tới 1/12 (đề xuất)". Lý do của đề xuất: dựng trang chỉ khoảng một phần ba số lượt mỗi buổi, sửa lượt phí gần như không tốn gì, và kế hoạch của nick tnt697 cũng đề xuất ngừng thêm luật tới 2026-12-01. Ngày 2026-12-01 xem số đo các buổi sau PR #103 rồi mới quyết.
Ngưỡng và cách làm ở checkpoint 3, 4 của `2026-11-15-lean-learning.md`.

### 5. Chiều bớt (làm sớm phần làm được, 2026-11-17, thien muốn tận dụng CodeRabbit trước khi hết dùng thử 2026-11-24)
- [x] Phần chung `AGENTS.template.md`, dòng xem nhánh chưa merge: khi không có `check-open-work.mjs` thì xem cả nhánh đã đẩy mà chưa có PR và sổ bàn giao (góp ý đúng của CodeRabbit trên sakubun PR #327)
- [ ] Đối chiếu phần tự làm với tính năng mới của Claude: để tới 2026-12-01, vì làm bây giờ thì tới ngày đó phải đối chiếu lại với tài liệu mới

## Phối hợp với kế hoạch song song (nick tnt697)
Ngày 2026-11-17 nick tnt697 soạn báo cáo "Rà soát quy trình làm việc thien và Claude" (bảng ủy quyền, dòng mục tiêu khi nhận việc, mẫu báo cáo khi xong việc, đường chảy cho góp ý), dự định ghi thành file `2026-11-17-action-gaps.md` trong thư mục kế hoạch. thien giao nick đó làm. Nick tnt628 so với kế hoạch này và đề xuất ba chỗ chỉnh, nick nào làm kế hoạch kia thì áp:
1. Dòng mục tiêu ba phần ("Mục tiêu · Sẽ ra · Xong khi") chỉ cho project bản cũ. Project bản beta đã có tên thread và bảng tiến độ của thread, nên ghi "Sẽ ra" và "Xong khi" vào dòng đầu bảng tiến độ, không đổi mục "Project bản beta" của `profile/CHATS.md`.
2. Mẫu báo cáo khi xong việc ghi trong `profile/VOICE.md` là nội dung phải có (kết quả kèm bằng chứng, thien cần làm gì, việc tiếp theo), không ép khuôn ba mục ở bản beta: thread beta đã có cách báo cáo của Claude (mở đầu bằng kết quả hay việc cần thien làm, viết ngắn khi thien vắng lâu). Theo nguyên tắc ở trên, không đè hướng dẫn gốc.
3. Sửa `artifacts/lesson/after-lesson.mjs` để kiểm từ mới thì ghi một dòng vào "Đã đổi" của `2026-11-15-lean-learning.md`, để checkpoint 4 ở đó (sau buổi chỉ ghi file mới) giữ lại phần kiểm này, không phải sửa lệnh hai lần.
Thêm: bảng ủy quyền chỉ áp cho repo này (sakubun có luật mức rủi ro riêng trong `CLAUDE.md`). Lịch nhắc thứ Hai, thứ Năm nằm ở nick tnt628, vẫn chạy (lần gần nhất 2026-11-16).

## Bộ tình huống mẫu (kiểm đợt 1 bằng cách đọc)
| Tình huống | Hành vi đúng | Luật quyết định |
|---|---|---|
| thien hỏi một câu tra cứu ("CHATS.md nói gì?") | Trả lời ngay, không kiểm việc dở | `PROFILE.md`, nhắc việc dở mức 3 |
| thien bảo sửa một dòng chữ | Làm luôn, nói một câu đã sửa gì; không đưa bảng phương án | `PROFILE.md`, ra quyết định (việc nhỏ) |
| Việc mới về môn BA trong khi có PR mở sửa bài BA | Báo PR đó trước, làm trên nhánh đó hay chờ merge | nhắc việc dở mức 1; phần chung "Đầu phiên" |
| Việc mới trong khi có PR sakubun chờ merge, không liên quan | Nhắc một dòng rồi làm luôn | nhắc việc dở mức 2 |
| "tiếp tục" khi sổ có việc của nick khác | `start-session --claim`, so nhánh với sổ, làm tiếp | `HANDOFF.md` |
| Nhắn "học" | Chạy `prepare-lesson.mjs`, dựng trang, không dạy trong chat | `AGENTS.md` mục "học" |
| Thread beta mới | Không gọi `project_info`, không clone; chạy `start-session --beta` | `SETUP.md` bản beta |
| Chat bản cũ đã 35 lượt, việc kế tiếp lớn | Gợi ý mở chat mới kèm câu nhắn "tiếp tục" | `CHATS.md` (bản cũ) |

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-17 | Bỏ ý thử hook SessionStart ở đợt 2 | Tài liệu chính thức: thread project beta không chạy hook |
| 2026-11-17 | Bản instructions beta làm ngay trong PR này thay vì chờ sau đợt 2 | thien vừa dán v3 vào project beta; v3 bảo gọi `project_info` mà beta không có |
| 2026-11-17 | Xoá 5 nhánh cũ chuyển cho thien | Phiên cloud bị chặn đẩy (403) lên nhánh khác nhánh làm việc |
| 2026-11-17 | Đợt 5 làm sớm dòng mẫu AGENTS; bỏ việc chuyển kế hoạch xong vào thư mục `done`; bỏ bảng "luật nằm ở đâu kèm mốc xem lại" khỏi đợt này | thien muốn làm đợt 4, 5 ngay để CodeRabbit review trước 2026-11-24. Trang tiến độ đã tự ẩn kế hoạch có "Trạng thái: xong" (`templates/progress-page.mjs`), còn chuyển thư mục thì phải sửa link ở nhiều file mà không được gì thêm. Mốc xem lại của luật đã nằm trong đợt 3 của kế hoạch `2026-11-17-action-gaps.md` (PR #104), không làm hai lần |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
| 2026-11-17 | Lúc review, AI chạy thử `start-session.mjs --claim ... --dry-run`; lệnh không có `--dry-run` mà lặng lẽ bỏ qua, nên đã nhận thật việc `claude-only-learning` trong sổ (ghi "Claude tnt628, test") | Việc đó đã xong nên xoá khỏi sổ; đợt 2 cho lệnh báo lỗi khi gặp tham số lạ |
