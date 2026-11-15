# Học càng nhiều, repo không nặng thêm

Trạng thái: đang chạy · Duyệt: 2026-11-15 · Cập nhật: 2026-11-15 · nick tnt697 · Đầu vào: review lần 3 của Codex (bd5c611), số đo trên main bd5c611 và PR #76

Luật ghi file này ở `profile/PLANNING.md`. Tick khi có bằng chứng; đổi bước thì ghi vào "Đã đổi"; lỗi thì ghi vào "Lỗi gặp".

## Đang ở đâu
- Đang ở: đợt 1 đã làm xong trong PR #77 (chờ merge). Đợt 0 làm cùng buổi Frontend 6.
- Còn thiếu: đo buổi Frontend 6 (đợt 0), rồi đợt 2.
- thien cần làm: merge PR #77. PR #76 (chiến tranh 5) để tới khi học xong bài đó mới merge, như mọi bài khác. Buổi tới nhắn "học" như thường.
- Khi học chiến tranh 5: AI rebase nhánh của PR #76 lên main, chạy `make-lesson.mjs` trên trang `lesson-05.html` của môn chiến tranh (nguồn tự gọn), thêm chữ "kit" vào tiêu đề PR #76 vì nó có sửa `sandtable.js` (câu 3: giữ nguyên, không tách).

## Mục tiêu
Chi phí của một buổi học (AI phải đọc bao nhiêu, phải viết bao nhiêu, CI chạy bao lâu, PR đụng bao nhiêu file chung) giữ gần như **cố định** dù đã học 10 hay 200 buổi. Trải nghiệm 7 bước và mọi luật thien đã chốt giữ nguyên.

## Mình đã đo gì (2026-11-15)

Đo bằng lệnh trên bản clone, không phải usage thật của tài khoản. Token là ước tính 3 byte một token như `reading-cost.mjs`.

| Thứ | Số đo | Nguồn |
|---|---|---|
| AI đọc khi nhận "học" | 77,6 KB, khoảng 26,5 nghìn token | `reading-cost.mjs` |
| Nhật ký mỗi buổi thêm vào file môn | khoảng 0,9–1,1 KB một dòng; nhật ký đã chiếm 27–33% file môn | `learning/war.md`, `frontend.md`, `ba.md` |
| Thẻ mỗi buổi thêm vào `cards.md` | 2–3 thẻ, khoảng 0,45 KB | 28 thẻ sau 11 buổi |
| Trang bài kiểu mới trong repo | chiến tranh 5 (PR #76): 238 KB, trong đó chỉ khoảng 25 KB là của riêng bài; còn lại là kit chung chép vào (141 KB) và dữ liệu trận chép lần hai (71 KB) | đo `lesson-05.html` của PR #76 |
| Phần của riêng bài | 20–35 KB HTML, trong đó chữ thien thật sự đọc chỉ 5–9 KB, phần còn lại là thẻ, nút, thuộc tính | đo 4 trang |
| Phần ôn 3 thẻ đầu buổi | AI viết lại câu hỏi, các lựa chọn, lời giải thích ở mỗi bài, dù thẻ đó đã có từ trước | `template-frontend.html` bước 1 |
| CI kiểm trang | job `pages` khoảng 4,5 phút (job test khoảng 20 giây); mở **mọi** trang bài ở 3 khổ, cả tối lẫn sáng | GitHub Actions, run 43622600445 |
| File chung mỗi PR buổi học phải sửa | `cards.md`, `learning/README.md`, `roadmap.md`, `usage.md`, cộng file môn | mục "Sau buổi" |
| Bài trộn nội dung với sửa kit | PR #76 vừa thêm bài vừa sửa `artifacts/war/sandtable.js` (+15 −5) | danh sách file PR #76 |

## Vì sao càng học càng nặng

Có bốn thứ tăng theo số buổi, và một thứ nặng ở mỗi lần dựng:

1. **File đọc mỗi buổi dài dần.** Nhật ký và thẻ nằm ngay trong file AI đọc mỗi lần. Với nhịp hiện tại, luồng "học" tăng khoảng 0,7–0,9 KB mỗi buổi, nên chạm ngân sách 120 KB của CI sau khoảng 45–60 buổi nữa (3–4 tháng ở nhịp 4 buổi một tuần). Tới lúc đó CI đỏ dù không ai làm sai gì.
2. **Repo chứa bản dựng.** Mỗi trang bài kiểu mới mang theo bản sao kit chung, nên gần 90% dung lượng trang chiến tranh 5 là chép lại (kit và dữ liệu trận). Tệ hơn: sửa kit thì bài cũ hoặc phải dựng lại (PR to, khó đọc), hoặc lệch phiên bản.
3. **CI kiểm lại mọi bài cũ.** Thời gian job `pages` tăng theo số bài, và một lần sửa kit có thể làm đỏ một bài đã học xong từ lâu, dù bài đó đã đăng và thien không mở lại.
4. **Mỗi buổi sửa nhiều file chung.** Hai buổi ở hai nick (hay PR #76 đang mở trong khi buổi Frontend 6 sắp tới) cùng sửa `cards.md` và bảng "Trạng thái", nên dễ đụng nhau khi merge.
5. **Mỗi lần dựng, AI viết nhiều hơn nội dung cần.** AI đọc mẫu 20–30 KB, rồi viết lại cả phần khung (ôn, nhớ lại, góp ý, kết thúc) vốn giống nhau ở mọi bài. Phần AI viết ra là phần tốn nhất: ở API, token viết ra đắt gấp 5 lần token đọc vào, còn phần đọc lại từ cache chỉ bằng 1/20 ([bảng giá Anthropic](https://platform.claude.com/docs/en/about-claude/pricing), đọc 2026-11-15). Quota trên claude.ai không công bố cách tính, nhưng Anthropic ghi rõ độ dài tin, độ dài hội thoại, công cụ và artifact đều làm tốn usage ([Usage limit best practices](https://support.claude.com/en/articles/9797557-usage-limit-best-practices), [Understanding usage and length limits](https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits)).

## Cấu trúc mới: ba loại file

Ý chính: tách thứ AI **viết một lần** (nguồn), thứ AI **đọc mỗi buổi** (hồ sơ nóng, kích thước cố định) và thứ **máy sinh ra** (không ai sửa tay). Cách này giống H5P, chuẩn bài tương tác mở: nội dung bài là một file dữ liệu, phần chạy và giao diện là thư viện dùng chung, nên thêm bài không phải chép lại thư viện ([H5P](https://en.wikipedia.org/wiki/H5P)).

| Loại | Ở đâu | Ai viết | Kích thước theo thời gian |
|---|---|---|---|
| Nguồn của bài | `learning/<môn>/pages/lesson-NN.html` chỉ còn phần riêng (thẻ kit để trống), file trận `battles/*.json` | AI, một lần mỗi bài | thêm 20–35 KB mỗi bài, không bao giờ phải sửa lại |
| Bản ghi buổi | `learning/<môn>/sessions/NN.json`: kết quả thô từ db trang, cộng nhận xét của AI (chỗ thien đổi cách nhìn, thẻ mới kèm lựa chọn) | AI sau buổi | một file mới mỗi buổi, không sửa file chung |
| Hồ sơ nóng | `learning/<môn>.md` chỉ giữ: mục tiêu, cách dạy, bản đồ ý, **3 dòng nhật ký gần nhất**, chỗ còn vướng (tối đa 6), buổi tiếp theo | AI sau buổi | cố định, CI chặn khi phình |
| Lưu trữ | `learning/<môn>/log.md` (nhật ký cũ), các bài và bản ghi cũ | script chuyển sang | tăng, nhưng không ai đọc mặc định |
| Sinh ra | trang đã dựng (thư mục tạm, rồi lên Artifact), bảng "Trạng thái", "Bài đã học" trong roadmap, hạn ôn của thẻ, `usage.md` | script | không commit, hoặc script tự ghi |

Hai điều không đổi: trang học vẫn là một trang HTML tương tác trên claude.ai, và link bản đăng vẫn ghi trong file bài như bây giờ. Bài đã học xong coi là **đóng băng**: bản đăng là bản thật, không cần chạy được với kit mới. Muốn học lại bài cũ thì dựng lại lúc đó.

## Quy trình một buổi sau khi đổi

1. **Gói buổi** (`prepare-lesson`, lệnh mới, chỉ đọc). In ra một bản ngắn: môn và buổi kế tiếp, mục tiêu, chỗ còn vướng, 3 thẻ đến hạn (đã kèm câu ôn có sẵn), nhánh hay PR chưa merge đụng môn đó, kiểu tương tác của môn, và đường dẫn tới từng luật. Luật dạy (`profile/TUTOR.md`) vẫn đọc nguyên văn, không tóm. Chỗ nào script không chắc (không đọc được nhánh, thẻ thiếu lựa chọn) thì in "chưa kiểm", không đoán. Ước tính luồng "học" còn khoảng 50 KB thay vì 77,6 KB, và không tăng theo số buổi.
2. **AI soạn phần lõi**: thử trước, hiểu sau, câu hỏi, bản tự nói lại mẫu, và cấu hình sân khấu hay sa bàn. Phần ôn 3 thẻ, nhớ lại, góp ý, kết thúc do script tự sinh từ gói buổi, vì chúng giống nhau ở mọi bài. AI không cần mở mẫu 20–30 KB nữa.
3. **Dựng, kiểm, đăng** như hiện nay (`make-lesson.mjs` rồi `publish_files`), chỉ khác là bản dựng ra thư mục tạm, không ghi đè nguồn.
4. **Sau buổi** AI đọc kết quả thật, viết một bản ghi buổi và sửa hồ sơ nóng của đúng môn đó. Script sinh phần còn lại (bảng "Trạng thái", tick roadmap, hạn ôn, `usage.md`) và kiểm đủ. PR buổi học chủ yếu là file mới, nên hai nick học hai môn không còn đụng nhau.
5. **Sửa kit tách khỏi bài.** Bài cần một khả năng mà sa bàn hay sân khấu chưa có thì mở PR "kit" riêng có test, bài chỉ dùng nó. PR #76 là ví dụ nên tách.

Một mẹo thử ở đợt 0: hội thoại dài thì tốn usage hơn, nên phần "sau buổi" có thể làm ở một chat mới ("ghi buổi frontend-06"). Repo và db trang đã giữ đủ dữ liệu nên chat mới không mất gì. Đổi lại là mất việc Claude tự thức khi thien bấm "Xong buổi học". Đo rồi mới quyết.

## Luật giữ repo nhẹ (CI giữ hộ)

- Hồ sơ nóng mỗi môn tối đa 3 dòng nhật ký; quá thì `after-lesson.mjs` tự chuyển dòng cũ sang `log.md`. CI đỏ nếu còn hơn 3.
- `reading-cost.mjs` giữ ngân sách 120 KB, thêm dòng in "luồng học tăng bao nhiêu so với main" để thấy sớm.
- CI chỉ mở trong trình duyệt: trang có thay đổi trong PR, cộng một trang mẫu cho mỗi loại (bài thường, frontend, BA, chiến tranh). Bài đóng băng không kiểm lại.
- Nguồn bài không được chứa code kit đã điền; CI kiểm thẻ `kit-js`, `lesson-js`… phải rỗng. Phần riêng của bài quá 60 KB thì cảnh báo: có thể đó là thứ nên vào kit.
- PR có file trong `learning/*/pages/` thì không sửa `artifacts/*/` (trừ khi tiêu đề PR ghi rõ "kit").

## Đồng ý và khác gì với review của Codex

- **Đồng ý**: đo trước khi đổi lớn; gói thông tin cho buổi; giữ mọi luật; tách nội dung khỏi code; mã phiên để không ghi trùng; tách "máy kiểm được" với "người kiểm"; không cắt bước học chỉ để tiết kiệm.
- **Thêm** điều Codex chưa nêu: vấn đề lớn nhất về lâu dài không phải một lần dựng mà là bốn thứ tăng theo số buổi ở trên. Riêng bản dựng trong repo, CI kiểm bài cũ và file chung bị sửa mỗi buổi đều sửa được bằng máy, không đụng tới trải nghiệm học, nên làm trước.
- **Khác**: Codex đề xuất viết cả bài thành JSON theo một schema. Mình đề xuất nửa chừng: chỉ phần khung (ôn, nhớ lại, câu hỏi, tự nói lại, góp ý, kết thúc) thành dữ liệu, vì phần đó vốn đều nhau; phần lõi (thử trước, hiểu sau, sân khấu) vẫn là HTML như bây giờ. Như vậy không bóp bài sáng tạo vào khuôn, mà vẫn bỏ được phần lặp lại.
- **Cách đo**: ngoài Settings > Usage, Claude có skill `explain-usage` chia số token của một phiên theo từng loại (đọc file, công cụ, viết). Chạy nó ở cuối phiên dựng bài là có đường cơ sở thật, không cần đếm tay từ trace. [chưa kiểm] skill này có ở cả 3 nick không.

## Các phương án đã xét

| Phương án | Lý do mạnh nhất để không chọn |
|---|---|
| Giữ nguyên, chỉ nâng ngân sách khi CI đỏ | Chỉ dời vấn đề; mỗi lần dời là thêm token mỗi buổi, mãi mãi |
| Viết toàn bộ bài thành JSON theo schema (Codex lớp 2) | Bài sáng tạo nào cũng phải sửa schema; tốn công dựng bộ chuyển trước khi biết tiết kiệm được bao nhiêu |
| Bỏ bớt tính năng trong trang (nghe, nói, làm mẫu) | Giảm công kiểm nhưng không giảm thứ tăng theo số buổi; thien đã chốt chỉ bỏ khi có dữ liệu và đồng ý |
| Chuyển bài cũ sang repo khác | Thêm một repo phải gắn ở 3 nick; cách "đóng băng" ở trên đạt cùng kết quả mà không thêm gì |
| Viết lại lịch sử git cho nhẹ | Pack hiện chỉ 1,5 MB, không đáng; dễ hỏng clone của các nick |

## Không làm
- Không đổi khung 7 bước, không bỏ tính năng nào của trang.
- Không dựng lại các bài đã học bằng kit mới.
- Không viết lại lịch sử git.
- Không tóm luật dạy trong gói buổi; luật vẫn đọc nguyên văn.

## Checkpoint

### 0. Đo một buổi thật (Frontend 6)
Xong khi: thien thấy một bảng trong file này ghi số token của buổi Frontend 6 chia theo đọc luật, đọc mẫu, viết trang, sửa lỗi, đăng, sau buổi; kèm mức Settings > Usage trước và sau.
- [ ] Dựng Frontend 6 như hiện nay, cuối phiên chạy `explain-usage`, ghi số
- [ ] Làm phần "sau buổi" ở chat mới, ghi số để so

### 1. Repo hết nặng thêm (chỉ máy, không đổi trải nghiệm)
Xong khi: PR thêm một bài mới chỉ thêm khoảng 20–35 KB; job `pages` không chạy lại bài cũ; thien mở lại 2 link bài cũ trên điện thoại vẫn học được.
- [ ] `make-lesson.mjs` ghi bản dựng ra thư mục tạm, giữ nguồn rỗng thẻ kit; chạy trên nguồn cũ thì tự làm gọn; đã làm gọn hai trang sa bàn (210 và 185 KB còn 14 và 21 KB) (chờ merge PR #77)
- [ ] `check-pages.mjs --changed` chỉ kiểm trang đổi trong PR cộng trang mẫu mỗi loại (chờ merge PR #77)
- [ ] `check-lesson-sources.mjs` chặn nguồn có kit đã điền, chặn PR vừa sửa bài vừa sửa kit (chờ merge PR #77)

### 2. Hồ sơ nóng cố định và gói buổi
Xong khi: `reading-cost.mjs` in luồng "học" khoảng 50 KB; thêm 10 buổi giả trong test mà con số không tăng; gói buổi in đúng 3 thẻ đến hạn so với `cards.md`.
- [ ] Chuyển nhật ký cũ sang `learning/<môn>/log.md`, giữ 3 dòng
- [ ] `prepare-lesson.mjs` và test; sửa bảng "học" trong `profile/MAP.md`

### 3. Khung tự sinh, thử với một bài Frontend
Xong khi: thien học một bài dựng theo cách mới và chấm độ dài, độ khó, độ thú vị không kém các buổi trước; số token phần dựng thấp hơn đợt 0 ở ít nhất 2 lần đo.
- [ ] Thẻ lưu sẵn câu hỏi, lựa chọn, lời giải thích (viết một lần khi tạo thẻ)
- [ ] Script sinh phần ôn, nhớ lại, góp ý, kết thúc; AI chỉ viết phần lõi

### 4. Sau buổi chỉ ghi file mới
Xong khi: hai PR buổi học của hai môn mở cùng lúc merge được mà không đụng nhau; `after-lesson.mjs --check-all` vẫn ra toàn ✓.
- [ ] Bản ghi buổi `sessions/NN.json`, chạy lại cùng mã phiên không ghi trùng
- [ ] Bảng "Trạng thái", "Bài đã học", hạn ôn, `usage.md` sinh từ bản ghi

### 5. Mở rộng sang BA và chiến tranh
Xong khi: một bài BA và một bài chiến tranh dựng theo cách mới, sa bàn và bảng dán vẫn như cũ.
- [ ] Áp đợt 3 cho BA, chiến tranh; giữ luật nguồn và nhãn "Mô phỏng"

Thời gian dự kiến: đợt 0 đi cùng buổi học kế tiếp; đợt 1 và 2 mỗi đợt một phiên; đợt 3 hai phiên cộng một buổi học thật; đợt 4 một phiên; đợt 5 làm dần theo vòng học.

Chỗ dễ sa lầy: đợt 3, nếu cứ muốn phần khung tự sinh phủ hết mọi biến thể. Giới hạn: biến thể nào chưa có thì bài đó tự viết phần đó bằng HTML như cũ. Nếu đợt 0 cho thấy phần tốn nhất là tìm nguồn hay sửa đi sửa lại theo yêu cầu, thì dừng đợt 3, chuyển sang làm rõ yêu cầu trước khi dựng và giữ sẵn nguồn theo trận.

## Câu hỏi đã chốt (thien, 2026-11-15)
1. Bài đã học là đóng băng: bản đăng là bản thật, CI không kiểm lại với kit mới.
2. Đợt 0 thử làm "sau buổi" ở chat mới một lần để so, dù mất việc Claude tự thức khi bấm "Xong buổi học".
3. PR #76 giữ nguyên lần này; luật tách bài với kit áp từ bài sau.

## Đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-15 | Làm đợt 1 trước đợt 0 | Đợt 1 chỉ đổi phần máy, không đụng trải nghiệm học, nên không cần số đo của đợt 0 để quyết. Đợt 0 vẫn đo ở buổi Frontend 6 |
| 2026-11-15 | Thứ tự merge: PR #77 trước, PR #76 sau khi học xong | Ban đầu định merge #76 trước. Nhưng bài chưa học thì CI của #76 đỏ sẵn (`after-lesson --check-all` cần thẻ và dòng roadmap của bài), merge vào sẽ làm main đỏ. Nên #76 chờ học như mọi bài; khi rebase thì làm gọn nguồn và thêm chữ "kit" vào tiêu đề, vẫn giữ câu 3 là không tách |

## Lỗi gặp
| Ngày | Lỗi | Đã xử lý |
|---|---|---|
