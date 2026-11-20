# KH9 kit lắp ghép: ga 4 (vòng gu 6: ôn thẻ và trang học ở khổ nửa màn hình)

Repo: thiengthb/thienai-workflow · Nhánh: wide-layouts · PR: #164 đã merge 20/11 (squash f9468e2)
Ghi bởi: Claude tnt697, https://claude.ai/code/session_01WXAvBYqmwzr7tB4gqM4F6T · Cập nhật: 2026-11-20T09:10Z

## thien muốn gì
"hoàn thiện các mẫu artifact hiện có trong workflow và mở rộng artifact và tool ... dễ nắm bắt cho tôi, một người cần nhiều tính năng tương tác, hình ảnh, bố cục, sơ đồ, luồng, hơn chỉ là chữ ... gu của tôi phát triển và hoàn thiện theo từng ngày, chứ không giữ vĩnh viễn". Duyệt kế hoạch 2026-11-18: "ok, duyệt theo cả 4 đề xuất" (kế hoạch `docs/plans/2026-11-18-visual-workflow.md`, PR #123 đã merge).

## Đã xong
- Kế hoạch, dòng STATUS, câu gu "Thích" cho tuyến checkpoint kiểu tuyến tàu: PR #123 (đã merge)
- Trang duyệt kế hoạch (là bản "một nấc" của vòng gu 1): https://claude.ai/artifact/7hVBYXwyHZbfVp7mL4GsV4 (nick tnt697). Nguồn đã vào repo ở `round-1/mot-nac.html` (PR #124)
- Ba bản của màn "trang kế hoạch" (Quen, Một nấc, Thật xa) và 3 ví dụ thật: nguồn ở `docs/plans/2026-11-18-visual-workflow/round-1/`, PR #124 (nháp); `decide` thêm trường `links`
- Trang chọn đã đăng: https://claude.ai/artifact/7sM41GEbSa4kw3hxGwbqMK (nick tnt697); đề xuất ẩn: B Một nấc, lấy bản đồ ga theo ngày và núm vặn của C làm chi tiết thử ở ga 2

- thien chọn B · Một nấc (15:02Z, giống đề xuất), ô ghi chú trống; đã ghi vào hàng chờ gu, kế hoạch, STATUS (commit a6409f9 trên nhánh)
- Câu vì sao của thien đã chép nguyên văn vào `learning/frontend/taste-queue.md`; checkpoint 0 tick đủ 3/3; PR #124 chuyển sẵn sàng
- CodeRabbit 15 ý: sửa 3 (link https bằng new URL, ví dụ JSON trong README, đường dẫn FONTSOURCE), 12 ý trên hai bản phác đã đóng băng thì trả lời và ghi vào việc mới của checkpoint 2; mọi thread đã resolve; CI xanh ở d8f1a6a
- PR #124 đã merge (thien nhắn "ok bạn merge giúp mình", 22:31); PR #125 sửa STATUS sau merge, đã merge (thien nhắn "merge #125")

- Checkpoint 1 dựng xong (18/11, 22:59): `artifacts/kit/diagram.js` (dagre 3.1.3 gắn ở `artifacts/kit/vendor/`, lưới dự phòng), mục Sơ đồ trong `gallery.html`; check-pages 0 lỗi; kế hoạch tick 4 việc, STATUS 7/24; PR #126 (nháp)
- Trang mẫu thành phần có mục Sơ đồ đã đăng: https://claude.ai/artifact/Uecy4Cdp3CsVFrY8omJGst (nick tnt697; link HuyQj… trong artifacts/README.md là của nick khác)
- PR #126 (lớp sơ đồ) và #127 (làm mới kit: nút, icon Lucide, thành phần mới, bảng màu giấy trắng xanh petrol, `kit/pack.mjs`) đã merge 19/11 (thien nhắn "merge"); PR #128 ghi STATUS
- thien bấm sơ đồ trên điện thoại, không lỗi: checkpoint 1 xong; câu vì sao bảng màu đã vào hàng chờ gu (PR #129, tự merge)
- thien chê nút Nhấn sáng hẳn ra (00:31): PR #130 bỏ quầng sáng, chế độ tối dùng petrol đậm chữ trắng và --primary-fill; trang mẫu đã đăng đè; chờ thien merge #130
- Vòng gu 3 (00:42): thien muốn rút style slide MLN122 (repo thiengthb/mln122-nhom9) áp vào sơ đồ, hình, biểu đồ, nền. Đã nghiên cứu, chạy bộ kiểm màu, dựng 3 mức; trang chọn https://claude.ai/artifact/RMSfapmLBg7FvoQ5PFDgad, trang bấm thử https://claude.ai/artifact/9tkpy5E3vqvs5AXqnWJor2; nguồn PR #131 (nháp, chồng #130), kế hoạch PR #132
- thien chọn A · Thêm mực cam (01:11): mực hình --ink-1/2/3, em.k1/k2, kind sơ đồ, .fill-k*, .callout đã vào kit trong PR #131; trang mẫu đăng đè; kết quả ghi ở PR #133 (tự merge)
- 19/11 01:21 thien nhắn merge: #130 (sửa thêm hover nút Nhấn theo CodeRabbit) và #131 (sửa hai ý CodeRabbit ở nguồn vòng 3) đã merge; #134 ghi STATUS và một dòng usage-log (277 lượt, đọc lại 110,9 triệu token)

- 19/11 (phiên mới, cùng link chat): checkpoint 2 dựng phần máy trên nhánh `plan-page`, commit 55f7725: `artifacts/plan/` (parse-plan.mjs, make-plan.mjs, template.html, plan.js, fixture.md), test `.github/scripts/make-plan.test.mjs`, trang mẫu trong check-pages, check-tokens; kế hoạch thêm dòng "Ước:" cho ga 2–5. Bản đồ ga theo ngày và núm vặn đã vào làm chi tiết thử; 7 ý review đã áp. check-pages 0 lỗi.

- README `artifacts/plan/README.md`, trang thử đăng https://claude.ai/artifact/WtTcEXfkxQkTckRan5J28v (nick tnt697, capabilities comments + db), PR #135 nháp, STATUS sửa dòng kế hoạch và "Đang chờ thien"; commit cuối 4f4f491. Bản đồ ngày để `aria-hidden` vì axe báo lỗi khi các ga trong SVG là nút.

- 19/11 02:22: thien gửi từ trang thử: chi tiết thử bản đồ ngày "Thích" + góp ý sidebar, bản đồ dính bớt sát, gọn lại khi lướt (nguyên văn ở hàng chờ gu). Đã sửa (commit 4c7f62b), đăng đè trang thử. Thread comment không trả lời được bằng công cụ (not found), đã trả lời trong chat.

- 02:30 thien chọn cách (a) cho điện thoại: thanh trên tự ẩn khi cuộn xuống, hiện khi cuộn lên; đã làm (commit 1376b3f), đăng đè trang thử.

- 02:35 thien nhắn "merge giúp tôi": PR #135 đã merge (squash c4bbd87; CodeRabbit không review vì PR nháp). PR #136 tick 4 việc checkpoint 2 (11/24), sửa STATUS, sửa một ý CodeRabbit, tự merge theo DELEGATION. Nhánh plan-page chưa xoá được (proxy chặn xoá nhánh).

- 02:48 thien: "thực hiện cho xong nốt". PR #137 (commit 9c408c4): trang tổng quan dẫn sang trang kế hoạch qua dòng `Trang:`; kế hoạch thêm "## Câu hỏi" 3 câu cho checkpoint 3; trang kế hoạch đăng đè (có câu hỏi).

- 02:53 thien trả lời 3 câu hỏi checkpoint 3 bằng nút trên trang: ok cả 3 đề xuất (nguyên văn trong kế hoạch). 02:54 nhắn merge: #137 merge; #138 (STATUS, kế hoạch 11/24) tự merge sau khi sửa ý CodeRabbit (giữ chưa tick việc trang tổng quan). Trang kế hoạch đăng lại (câu hỏi đã trả lời). Trang tổng quan SZGp85… ở nick khác: nick này không đăng đè được (not found).

- 19/11 03:30 (phiên mới, cùng link chat, "tiếp tục"): checkpoint 3 dựng xong trên nhánh `flow-page`: `artifacts/flow/` (make-flow.mjs, template.html, flow.js, fixture.json, README), luồng đầu `docs/flows/lesson.json`, test make-flow trong CI, check-pages có trang luồng (0 lỗi). Trang đăng: https://claude.ai/artifact/S9B86U6MGpnkYTa8enDtVM (nick tnt697, capabilities comments + db). Kế hoạch tick việc 1 của ga 3 (12/24). PR #140.

- 19/11 10:05 (phiên mới, cùng link chat, "tiếp tục"): luồng thứ hai `docs/flows/ba-request-to-story.json` "Từ một lời nhờ tới việc giao được" (gom BA 1–5 theo chuyện Hà, ngăn "để sau" cho cách làm; không vẽ một tối Hà học để khỏi lộ bài BA 6). Trang đăng: https://claude.ai/artifact/QBi7zKgMnEWsAKj6ygBnHw (nick tnt697, comments + db), check-pages 0 lỗi. Kế hoạch ghi tiến độ, chưa tick việc 2 của ga 3 (còn kiến trúc sakubun). STATUS sửa dòng PR #139 thành "đã merge". PR #142.
- 10:24 thien kể lại luồng BA từ trang: đủ 8 bước đúng thứ tự nhưng chép tên khối, thiếu hai vòng lặp và ngăn "để sau" (đã nhận xét trong chat, thread comment báo not found); chi tiết thử "Thích" lần hai. Đã ghi vào kế hoạch và hàng chờ gu. 10:27 thien nhắn merge: PR #142 squash 09b6a2b. CI GitHub không chạy (lỗi billing của tài khoản), đã chạy đủ lệnh test của CI trên máy: 0 lỗi.

- 19/11 10:53 thien chọn làm checkpoint 4 trước buổi học. Nhánh lesson-polish, PR #144: đồng hồ nhìn N giây giữ khi tải lại (it-stage.js, test trong autosave.test.mjs), màn kết có hình (lesson.js endCard, end-card.test.mjs), vòng 4 bảng dán (round-4/: build.mjs, variants.css, shoot.mjs, decision.json). Trang chọn https://claude.ai/artifact/VaxABzqfhzqqF98sgFye2L, trang bấm thử https://claude.ai/artifact/4oPPXDxqm7jSgtAiYmn3yy (nick tnt697). Đề xuất ẩn: B · Tuyến ga. 11:08 thien chọn B (ghi chú trống); đã chuyển vào kit (.zones.flow.line, .filled, bảng inked, template-ba.html) trên cùng PR #144. Kế hoạch 15/24.

- #144 merge (038431b) sau khi CI xanh; job Windows phải bỏ qua end-card.test.mjs (cần trình duyệt). CodeRabbit góp ý đồng hồ ghi giờ ở localStorage bị tab khác ghi đè: PR #145 đổi sang sessionStorage, đã trả lời và resolve thread, #145 merge.

- 19/11 19:13 (giờ VN, phiên mới, thien nhắn "làm tiếp KH6"): hai màn so trước và sau trên bàn thử. Nhánh `bench-compare`, commit d038d48, PR #149: nút `data-compare` và bước `@compare` trong `it-stage.js`/`it.css`, mẫu frontend dùng ở bước "Nhìn 5 giây", test `bench-compare.test.mjs` (job pages, Windows bỏ qua). Mọi test CI chạy trên máy 0 lỗi, check-pages 0 lỗi. Trang thử mở thẳng bước đó: https://claude.ai/artifact/1TjXknw69z6hMDhKaNXeeo (nick tnt697). Kế hoạch 17/24.

- 19/11 19:30 thien nhắn "ok ổn rồi bạn hãy merge giúp tôi và tiếp tục kế hoạch 6": sửa hai ý CodeRabbit ở #149 (data-before thiếu núm thì giữ giá trị lúc mở; cỡ màn so chỉ áp trong .pair), CI xanh, merge (squash c43a8cd).
- Luồng kiến trúc sakubun "Một câu luyện đi qua những đâu" (`docs/flows/practice-turn.json` ở sakubun, 9 bước, 11 khối): trang https://claude.ai/artifact/Xx8GxEfRauxKujP1er9H5v (nick tnt697, comments + db), PR sakubun #339 (risk:low, CI xanh, CodeRabbit một ý: hạn mức ngữ pháp mặc định là 3, đã sửa cả trang). Lệnh merge #339 bị chặn vì thien chỉ nhắn merge #149: chờ thien merge. PR #150 tick ga 3 đủ (19/24), tự merge theo DELEGATION.

- 19/11 20:40 thien trả lời KH8: ok cả 10 đề xuất, kèm ghi chú (chi tiết thử lặp ở mọi trang; mẫu phải là bộ lắp ghép; bố cục theo nội dung, kiểm kỹ artifact). Đã làm: PR #153 luật (DELEGATION, README 3 luật/mốc, quyết định 003 review theo giai đoạn, skill viet-de-hieu vào repo, ngôn ngữ về VOICE, plan/flow vào danh sách mẫu 8/8, MAP), PR #154 mã (start-session không nhận việc ở repo chưa gắn, bỏ Nghe và mic khỏi mẫu học, chi tiết thử thành --trial, ô kể lại hỏi rẽ ở đâu quay lại ở đâu), PR #152 đóng KH1–KH7 và STATUS (tự merge). Mọi góp ý CodeRabbit đã sửa và resolve; CI xanh cả ba.
- KH9 nháp `docs/plans/2026-11-19-modular-kit.md` (PR #155), trang 4 câu hỏi https://claude.ai/artifact/9f8VSi8ttTr7u4STJSLTz5 (nick tnt697). Trang lộ trình học (Vubbj6...) ở nick khác: nick đó chạy `publish-progress.mjs roadmap` rồi đăng đè (learning/roadmap.md đổi ở #152).

- 19/11 21:15 thien trả lời KH9: ok cả 4 đề xuất (KH9 trước MCP; lệnh dựng chọn bố cục theo nội dung, AI đổi thì ghi lý do; trang KH9 dựng lại ở ga 3; kit không giới hạn, trang chỉ mang khối dùng, check-pages báo vượt cỡ gốc +20%). PR #155 (kế hoạch + STATUS) tự merge.
- Ga 1 (PR #156): kiểm kỹ thì `.q`, `.opt`, núm, khung ảnh chỉ trùng tên; khối trùng thật là chép và gửi (4 mẫu) và chi tiết thử (2 mẫu). Đã có `Kit.sendBox`, `.kit-send`, `.choice`, `.trial` trong kit, `kit/blocks.mjs`, hai mục mới ở trang mẫu thành phần, test `kit-blocks.test.mjs`. Ảnh chụp trang kế hoạch, luồng, chọn phương án, ôn thẻ trùng từng điểm ảnh với trước. Ba ý CodeRabbit đã sửa (chép không chờ db, clear() bỏ câu báo cũ, snapshot chép answers).

- 19/11 21:56 thien nhắn "bạn hãy merge hộ mình": #153, #154 merge; #156 gộp main (một xung đột ở ô kể lại, giữ bản của nhánh), CI xanh, merge; sakubun #339 merge. Trang mẫu thành phần đăng lại (Uecy4C…, nick tnt697). PR #157 đóng KH8, tick ga 1 KH9 (2/10), tự merge.

- 19/11 22:08 (phiên mới, cùng link chat, "tiếp tục"): ga 2 KH9 trên nhánh `kit-block-list`, PR #158 (sẵn sàng, chờ CodeRabbit và thien merge). `pack.mjs` trimBlocks bỏ vùng `/* @block */` không dùng; kit.css bọc 14 mục; trang kế hoạch đọc dòng `Khối: … · Vì: …`, trang luồng đọc `"blocks"`/`"blocksWhy"`; check-pages mục 8 so với `artifacts/kit/sizes.json` (main f45b0be), `--write-sizes`. Ảnh chụp 10 trang mẫu trùng main; mọi test CI 0 lỗi. Kế hoạch tick 3 việc ga 2 (5/10), STATUS sửa.
- CodeRabbit 6 ý trên #158 (chuỗi "/*" không phải chú thích, vùng chỉ trong <style>/<script>, `drop` từ lệnh dựng, `.empty`, link ga khi bỏ tuyen, guard plan.js): sửa cả 6 ở 5e93a5e, trả lời và resolve mọi thread; ảnh chụp 10 trang mẫu vẫn trùng main.

- 19/11 23:00 thien nhắn "merge đi": #158 merge (squash b5dde6a). #159 ghi kế hoạch và STATUS, tự merge theo DELEGATION. Nhánh kit-block-list chưa xoá được (proxy chặn).

- 19/11 23:17 (phiên mới, cùng link chat, "tiếp tục"): ga 3 việc 1 trên nhánh `plan-layouts`, PR #160. Vòng gu 5 ở `round-5/` (3 file mẫu: KH9 chờ duyệt, KH9 đang chạy, KH6 đã đóng; build.mjs, variants.css/js, shoot.mjs). Trang `decide/` có `parts` để hỏi nhiều câu trên một trang (test thêm). Đăng trang chọn https://claude.ai/artifact/EzRQAqCHdyNTsEnrgJaRwG (comments, db, sample) và trang bấm thử https://claude.ai/artifact/UrAYhZsa14BVWWkfLtCvPP (nick tnt697). Đề xuất ẩn: C cả ba câu. Mọi test CI 0 lỗi trên máy. Kế hoạch 6/10.

- 19/11 23:38 thien gửi từ trang chọn (comment, thread 635ef771…): chọn B cả ba câu (đề xuất C), chưa ghi vì sao; xin sửa ô hỏi Claude, kiểm lỗi UI khác, thêm phóng to và phím trái phải. Đã làm trên PR #160 (commit thứ hai): ô hỏi có lề và nhãn, icon rec đổi lớp `.ri` (lớp `.ic` của kit đè), 760–999px ảnh trên chữ dưới, hộp phóng to nấc 100–300% + kéo + ← → đổi bản + vuốt, ← → ở màn thường. Trang chọn đăng đè. Lựa chọn ghi vào kế hoạch (7/10) và taste-queue. Trả lời thread bằng công cụ báo not found: đã trả lời trong chat.
- 19/11 23:56 thien: "màu chính là màu trắng, mình không muốn chạy đua với màu sắc nữa", chọn "Trắng đen, màu chỉ để báo". PR #161 (nhánh white-kit, từ main): kit.css nền và thẻ #fff, nhấn gần đen (tối: trắng ngà), ink-1..3 thành ba mức xám, good/bad/warn giữ; artifacts/README đoạn Mực hình, taste-queue. check-pages 34 trang 0 lỗi, test CI 0 lỗi. Khi merge cả #160 và #161: thêm một dòng "Đã đổi" vào KH9 (đổi bộ màu do thien chọn thẳng, không qua vòng gu); bố cục B dựng ở ga 3 việc 3 phải hợp trắng đen (ô số, cột, thẻ phân biệt bằng viền và độ đậm).
- 20/11 00:15 thien nhắn "merge hết": sửa 4 ý CodeRabbit ở #160 (đường dẫn Windows trong test làm job scripts đỏ, picks chỉ đọc thuộc tính riêng, focus sau khi đổi câu, mỗi câu một thư mục ảnh `img/<câu>/`), trả lời 4 ý ở file thử đóng băng; mọi thread resolve. #161 merge (squash 2950391); #160 gộp main (xung đột taste-queue, giữ cả hai dòng; force push bị chặn nên dùng merge), thêm dòng "Đã đổi" bộ màu vào KH9, CI xanh cả bốn job, merge (squash 36dfce4). #162 ghi STATUS, tự merge.

- 20/11 00:30 (phiên mới, cùng link chat, "tiếp tục"): KH9 ga 3 việc 3 trên nhánh `plan-layouts-default`, PR #163. `make-plan.mjs` có `pickLayout`: chờ duyệt còn câu hỏi → phiếu hỏi, đang chạy → bảng tiến độ, xong/bỏ → thẻ kết quả, còn lại một cột; dòng `Bố cục: <tên> · Vì: …` đổi được (`parse-plan.mjs`). HTML dựng sẵn, mỗi bố cục một vùng `@block` trong `template.html`, trắng đen. Khác bản phác 4 chỗ (ghi ở "Đã đổi" KH9). Trang mẫu `fixture-running.md`, `fixture-closed.md` vào check-pages và sizes.json; test bố cục. Mọi lệnh node của CI 0 lỗi, check-pages 36 trang 0 lỗi. Trang KH9 đăng đè bằng bảng tiến độ (9f8VSi8…, nick tnt697). KH9 8/10, STATUS sửa.

- 20/11 00:59 thien: "bố cục checkpoint vẫn chưa hợp ý", trang hay mở nửa màn hình cạnh chat (khoảng 860px) hay 2/3 màn hình project beta (khoảng 950px); bản đồ gọn hiện thay thanh mục lục thì đè lên nội dung. Đã sửa trên PR #163 (commit 2b669f8): bảng tiến độ bản 2 (thẻ lớn ga đang chạy, cột bên "Chưa tới"/"Xong" gập mở, cột trống không vẽ, rộng tới 1000px, hai cột từ 820px); bản đồ gọn nổi chỉ còn ở bố cục một cột; "Ước: mốc" ghi đúng ở dòng dưới bản đồ. Trang KH9 đăng đè. Ghi ở "Đã đổi" KH9. Chờ thien xem lại.

- 20/11 01:16 thien gửi ảnh: "menu đè lên nội dung" là cột mục lục bên trái ở màn rộng (không phải bản đồ gọn như Claude hiểu lúc đầu). Bảng tiến độ rộng 960px mà mục lục đặt cho cột 760px, từ khoảng 1366px thì đè lên ô số. Sửa trên PR #163 (commit 35c6436): mục lục tính vị trí từ `--main-w` (lớp `wide`); test mới `.github/scripts/plan-layout.test.mjs` (job pages) đo ở 1160–1920px cho cả ba bố cục. Ghi ở "Lỗi gặp" KH9. Trang KH9 đăng đè.

- 20/11 01:34 thien: "ok bạn merge giúp mình, và phần xem trang mẫu mình đã xem rồi". CodeRabbit 5 ý trên #163: sửa 4 (ghi chú ga trong thẻ kết quả, đếm ngày chỉ ga xong, ô "Bạn cần làm" chỉ gập khi là link, câu chờ duyệt có/không câu hỏi), ý mục lục đè đã sửa ở 35c6436; trả lời và resolve cả 5. Job Windows đỏ vì plan-layout.test.mjs cần Playwright: thêm vào danh sách bỏ qua ở windows.yml. CI xanh, #163 merge (squash e99afaa). Ga 1 KH9 đóng (thien đã xem trang mẫu thành phần), KH9 8/10, STATUS sửa trong cùng PR. Trang KH9 đăng đè.

- 20/11 01:42 (phiên mới, thien nhắn "làm ga 4"): vòng 6 trên nhánh `wide-layouts`, commit ce3bd14, PR #164 (nháp). `round-6/`: build.mjs, review-variants.css/js, lesson-variants.css/js, shoot.mjs (860 và 950px), decision.json (hai câu: ôn thẻ, trang học). Trang chọn https://claude.ai/artifact/6HmX4EYH3dsuLjUNpUzs9v (comments, db, sample), trang bấm thử https://claude.ai/artifact/3bh7mbjckhWm2zqoUSBMk3 (nick tnt697). Đề xuất ẩn: ôn thẻ C, trang học B. Kế hoạch và STATUS ghi chờ thien.
- 20/11 02:43 thien chọn trên trang (comment): ôn thẻ C · Hai nửa thẻ, trang học B · Tuyến bước (giống đề xuất, không ghi chú). Thread comment báo not found, đã trả lời trong chat. Commit 9972d7c trên #164: `artifacts/review/` hai nửa thẻ và hàng chấm; `lesson.js`/`lesson.css` tuyến bước từ 760px; `it.css`, `war.css` sân khấu và sa bàn cạnh chữ từ 760px. Mọi test node của CI 0 lỗi, check-pages 0 lỗi, cỡ trang dưới gốc. KH9 9/10, taste-queue, STATUS. PR chuyển sẵn sàng.
- 20/11 06:30 thien nhắn "ok bạn hãy thực hiện": sửa 6 ý CodeRabbit ở ebb06d5 (it.css bàn thử cuộn được ở 760–899px; round-6 dựng từ e99afaa bằng git archive, bản A giống hệt trang đã đăng; ba lỗi nhỏ ở biến thể), trả lời từng ý trên PR.
- 20/11 06:38 thien nhắn "merge": thêm commit STATUS/KH9 ghi đã merge, CI xanh, squash merge #164 thành f9468e2, xoá nhánh wide-layouts.

## Bước tiếp theo
1. Trang ôn thẻ link cố định (L612hHx2…) đổi bố cục ở lần dựng lại sau (`make-review.mjs --url`), nick nào có trang đó thì đăng đè. Đã kiểm 20/11 16:10: không ở nick tnt697 (get_artifact báo not found), README ghi không ở tnt628, nên còn lại tnt024.
2. Luật vòng gu hai tuần một lần vào `artifacts/README.md` (việc 2 ga 4); vòng sau khoảng 04/12. Rồi kế hoạch MCP cho nhóm SEP490.

## Đang chờ thien
- Chưa có.

## Lưu ý
- Không thêm dòng luật nào trước mốc 01/12 (luật gom vào checkpoint 5).
- "Một nấc" chỉ đổi bố cục và cách kể, giữ màu, font Onest, bo 8px của kit.
