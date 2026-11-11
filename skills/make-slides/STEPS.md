# Các bước của skill make-slides

File này là phần thân của skill `make-slides`. `SKILL.md` chỉ trỏ tới đây, nên sửa file này thì không phải tải lại skill. Luật nằm ở [`slides/RULES.md`](../../slides/RULES.md); mỗi bước dưới đây ghi mã luật liên quan.

thien chỉ duyệt hai lần: **dàn ý** (bước 3) và **bản chạy thật** (bước 8). Giữa hai mốc đó AI tự làm, tự kiểm, chỉ hỏi khi bị chặn. Khi nói với thien, gọi là "quy trình làm slide", không nhắc tên skill.

## 0. Đọc trước
- `slides/RULES.md`, `profile/VOICE.md` (giọng văn, từ đã chê), `profile/RESEARCH.md` (tra nguồn), và gu giao diện ở repo `thienui`, file `docs/taste.md`.
- Trong repo của project: `docs/slides/` nếu đã có (đang làm dở thì đi tiếp từ đó), `AGENTS.md`, `docs/STATUS.md`, đề và rubric của môn.

## 1. Bản tóm tắt bài (S1 đến S3)
- Chép `slides/BRIEF.template.md` vào `docs/slides/BRIEF.md` của project và tự điền từ đề, rubric, tin nhắn của thien.
- Chỉ hỏi thien những mục không tự tìm được, tối đa 3 câu trong một tin, mỗi câu có lựa chọn để trả lời một chữ. Thường là: thời lượng, nói một mình hay nhóm, câu cần nhớ (AI đưa 2 đến 3 câu để chọn).

## 2. Chọn định dạng

| Định dạng | Chọn khi | Lý do mạnh nhất để không chọn |
|---|---|---|
| **Web tự dựng từ `slides/starter/`** (mặc định) | Gần như mọi bài thien tự làm: cần ghi chú người nói, cửa sổ người nói, hiện từng bước, sơ đồ tự vẽ, máy kiểm tra, link gửi thầy | Thành viên không biết HTML khó tự sửa; thầy bắt nộp file Canva hay .pptx |
| **Canva** | Thầy hoặc nhóm bắt dùng Canva; thành viên cần tự sửa không qua code; cần mẫu đồ họa có sẵn | Không có ghi chú người nói đi cùng máy kiểm tra, chuyển động hạn chế, AI không tự chụp và tự kiểm được |
| **PDF** | Luôn xuất kèm để nộp và để dự phòng ngày nói | Mất chuyển động và hiện từng bước; chỉ là bản phụ |
| **.pptx** | Người chấm bắt buộc PowerPoint | Dùng skill `pptx`; vẫn giữ mọi luật trong `RULES.md` |
| **Slides của Claude (artifact)** | Cần bản nháp nhanh để xem hướng trong vài phút | thien đã chọn không dùng cho bài nộp ở PRM; không chạy được khi không có mạng, không có máy kiểm tra của mình |

Không chắc thì chọn web và xuất PDF kèm. Ghi lựa chọn vào `BRIEF.md`.

## 3. Dàn ý bằng chữ (S4 đến S8). Mốc duyệt 1
- Viết `docs/slides/OUTLINE.md`: bảng gồm số slide, tiêu đề là câu khẳng định (S9), hình chính (S21, S22), một câu lời nói, số phút (S42). Cuối bảng là các slide phụ lục.
- Đọc liền cột tiêu đề phải ra câu chuyện cả bài. Tổng số phút không vượt thời lượng trừ đi 10%.
- Đưa 2 đến 3 hướng cho hình xuyên suốt (S32), mỗi hướng một câu: hình gì, xuất hiện ở đâu, hợp với người nghe nào, chỗ yếu nhất của nó. Để thien chọn trước rồi mới nói AI chọn gì và vì sao (theo `profile/PROFILE.md`, để thien luyện mắt).
- Gửi thien dàn ý trong một tin, kèm 2 đến 3 câu hỏi có lựa chọn. thien duyệt rồi mới dựng.

## 4. Thử hướng hình (bỏ qua với bài dưới 10 phút, hoặc khi thien bảo)
- Dựng 3 slide mẫu (bìa, một slide con số, một slide sơ đồ) theo 2 hướng giao diện khác nhau trong gu của thien.
- Chụp cả 3 slide ở cỡ thật, đưa thien chọn. Không làm thêm hướng thứ ba trừ khi thien chê cả hai.

## 5. Dựng đủ bài
- Chép `slides/starter/` vào thư mục `slides/` của project (đổi tên `deck.html` theo bài nếu có nhiều bộ). Đổi token màu ở đầu `deck.css` theo màu chủ đạo của bài (S31); không sửa phần còn lại của khung trừ khi thiếu.
- Mỗi slide: tiêu đề câu khẳng định, một hình chính, chữ dưới 30 từ, `data-min`, `data-src` nếu có số liệu, lời nói đầy đủ trong `<aside class="notes">` theo S15 đến S20.
- Số liệu: chỉ thứ đã mở nguồn (S39). Ảnh sản phẩm: chụp từ app chạy thật, cắt đúng vùng đang nói (S24).
- Chuyển động: chỉ dùng `data-step` (hiện từng bước) và `data-dim` (làm mờ bước cũ) có sẵn. Thêm hiệu ứng khác thì phải trả lời được "nó nói điều gì" (S34) và không nằm trong danh sách đã bỏ (S38).

## 6. Kiểm máy và tự chê
- Chạy `node slides/check.mjs slides/deck.html --pdf` (cần Playwright; trên máy Claude cloud dùng `NODE_PATH=$(npm root -g) node ...`). Sửa đến khi không còn ERROR; WARN nào giữ lại thì ghi lý do.
- Mở `check/sheet.png` (cả bài trên một trang) và tự chê ở mức cả bài trước: nhịp có đều không, các slide có như một người vẽ không, có slide nào dày hơn hẳn, khoảnh khắc đáng nhớ nằm ở đâu (S33). Rồi xem từng slide ở cỡ thật với phép thử 3 giây: che lời nói, nhìn 3 giây, có nói lại được ý của slide không.
- Đọc to lời nói của 3 slide bất kỳ: chỗ nào vấp thì sửa câu (S15, S16).

## 7. Gói tập dượt
- `docs/slides/SCRIPT.md`: kịch bản sinh từ ghi chú (bảng người nói, slide, phút ước tính, rồi lời nói từng slide).
- `docs/slides/QA.md`: 10 đến 15 câu hỏi khó nhất (S44), mỗi câu có ý trả lời và slide hay nguồn để chỉ vào. Bài nhóm thì ghi ai trả lời câu nào.
- Lịch tập ghi vào `BRIEF.md`: ba lần tập thành tiếng, lần cuối có bấm giờ (S43).
- Danh sách cho ngày nói (S45 đến S47): USB có thư mục slide và PDF, link Pages, thử máy chiếu, bút trình chiếu.

## 8. Đăng và mốc duyệt 2
- Đăng lên GitHub Pages của repo: chép `slides/starter/pages.yml` vào `.github/workflows/`, thien bật Pages một lần (Settings > Pages > Source: GitHub Actions).
- Một PR cho cả bài. Báo thien trong 5 dòng: link slide, link PDF, tổng thời gian ước tính so với thời lượng, những chỗ còn "chưa kiểm", việc thien cần làm (tập, thử máy chiếu).
- thien duyệt bằng cách mở link thật toàn màn hình, tốt nhất trên màn to. Không gửi từng slide lẻ để duyệt.

## 9. Canva khi cần
- Có Canva connector: đưa thẳng bản PDF đã xuất vào Canva bằng công cụ nhập thiết kế từ link (chữ thành chữ sửa được), hoặc dựng từ mẫu thương hiệu của nhóm nếu có. Kịch bản dán vào phần ghi chú của từng trang.
- Chưa có connector: đề nghị thien kết nối Canva một lần. Không muốn kết nối thì đưa PDF và kịch bản, kèm các bước nhập vào Canva ghi thẳng trong tin nhắn.
- Canva vẫn theo `RULES.md`. Khung Canva 1920×1080 lớn hơn khung web 1,2 lần, nên chữ nội dung tối thiểu 36px, nhãn tối thiểu 26px.
- Sau khi thành viên sửa trên Canva, xuất lại PDF và so với dàn ý: tiêu đề còn là câu khẳng định không, có slide nào thêm chữ quá nhiều không.

## 10. Sau buổi nói
- Hỏi thien ba câu, có lựa chọn khi được: thầy khen hay chê gì, chỗ nào vấp, nói hết bao nhiêu phút.
- Ghi thời gian thật vào `BRIEF.md`. Đề xuất tối đa 3 sửa cho `slides/RULES.md`, mỗi sửa kèm lý do mạnh nhất để không sửa, qua một PR vào repo thienai-workflow. Không tự sửa luật.
