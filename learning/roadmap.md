# Lộ trình học của thien

Mỗi môn đi từ người mới đến khá qua vài chặng. Mỗi chặng ghi học xong thì biết gì, làm được gì, và thế nào là xong. Chặng đang học thì chi tiết; chặng sau chỉ phác, sẽ rõ dần khi tới gần. Lộ trình được đổi, nhưng mỗi lần đổi đều ghi ở bảng cuối file kèm lý do.

Cách cập nhật: sau mỗi buổi học, AI tick việc đã xong trong chặng và thêm link bài vào mục "Bài đã học" của môn đó, trong cùng PR ghi nhật ký buổi. Vòng xoay và buổi tới học gì ở [README.md](README.md); trạng thái chi tiết từng môn ở file của môn. Nguồn học ghi rõ đã đọc hay chưa, theo `profile/RESEARCH.md`. Trang để xem trên điện thoại: https://claude.ai/artifact/Vubbj6ghT9L7eKYegTfT9n, AI đăng lại bằng `templates/progress-page.mjs --roadmap` sau mỗi lần sửa file này.

## Frontend
Môn chính, một nửa số buổi. Đích sau 6 tháng: nhìn một màn bất kỳ, chỉ ra được chỗ cấn mắt ở mức cả màn, sửa được và nói được vì sao; viết được luật cho thienui từ những gì đã học. Chi tiết ở [frontend.md](frontend.md).

### Chặng 1: Con mắt nhìn cả màn
Xong khi: bài so sánh mù ngày 2026-11-22, thien chấm lại các màn cũ và giải thích được bằng các ý đã học.
- [x] Một điểm nhấn cho mỗi màn (buổi 1, 2026-11-07)
- [x] Thứ bậc chữ: ít bậc, mỗi bậc khác hẳn nhau (buổi 2, 2026-11-07)
- [x] Khoảng cách là cách nhóm (buổi 3, 2026-11-11)
- [x] Sửa theo mục đích của màn (buổi 4, 2026-11-11)
- [x] Một màu nhấn, màu khác chỉ khi mang nghĩa (buổi 5, 2026-11-12)
- [ ] Chọn màu cho cả một app theo loại app, người dùng, độ tuổi (buổi 6)
- [ ] So sánh mù các màn đã xem (2026-11-22)

### Chặng 2: Áp vào app của mình
Xong khi: thien tự sửa được một màn của sakubun hoặc todo và viết được 3 luật cho thienui. Bắt đầu sau mốc 2026-11-22.
- [ ] Soi một màn của app mình dùng hằng ngày, chọn một chỗ sửa
- [ ] Chép lại một màn tốt theo đúng con số, rồi nói ra mẹo vừa thấy
- [ ] Viết luật đầu tiên cho thienui, kiểm bằng hai màn thật

### Chặng 3: Phần kỹ thuật nền
Chưa chốt. Ở mốc 2026-11-22 sẽ chọn học phần nào trước trong: trình duyệt và mạng, TypeScript, kiến trúc, dễ truy cập (a11y), hiệu năng, test.
- [ ] Chốt thứ tự ở mốc 2026-11-22

### Bài đã học
- Bài 1 đến 5: đọc nhanh và làm lại ở [frontend/README.md](frontend/README.md)
- Trang buổi 1: [Một điểm nhấn](https://claude.ai/artifact/A3nqpsF7j3wnNaYpfdmoKC)
- Trang buổi 5: [Màu](https://claude.ai/artifact/Gn4VUaqRzfT7jBDFz9GZ5z)
- Thẻ ôn của mọi môn: [cards.md](cards.md)

### Nguồn học
- [5 bài tập học UI của Erik Kennedy](https://learnui.design/blog/5-practical-exercises-learn-ui-design-free.html): nói ra vì sao một màn đẹp, chép lại một màn tốt. Thread học đã đọc khi viết "Cách dạy môn này".
- [Bản đồ frontend cho người mới của roadmap.sh](https://roadmap.sh/frontend-beginner): dùng ở chặng 3 để chọn phần kỹ thuật, không học theo hết. Mới thấy qua tìm kiếm, chưa đọc.
- Sách Refactoring UI (trả phí): dạy bằng cặp trước và sau có con số. Chưa đọc.

## BA
Môn mở rộng, khoảng một buổi mỗi tuần. Đích sau 6 tháng: làm PO đồ án capstone tốt hơn, tức là hỏi ra được nhu cầu thật, viết user story có điều kiện hoàn thành rõ, và giao việc cho AI không phải sửa lại nhiều. Chi tiết ở [ba.md](ba.md).

### Chặng 1: Mười ý lớn
Xong khi: học đủ 10 ý trên bản đồ, mỗi ý một buổi; thứ tự do thien xếp ở buổi 1.
- [x] Yêu cầu và nhu cầu (buổi 1, 2026-11-12)
- [x] Hỏi chuyện người dùng (buổi 2, 2026-11-12)
- [ ] Các bên liên quan
- [ ] User story
- [ ] Điều kiện hoàn thành
- [ ] Vẽ luồng công việc
- [ ] Xếp ưu tiên
- [ ] Use case
- [ ] Yêu cầu không ai nói ra
- [ ] Dữ liệu nhìn từ nghiệp vụ

### Chặng 2: Áp vào đồ án capstone
Xong khi: có một tính năng capstone đi trọn từ phỏng vấn người dùng đến user story có điều kiện hoàn thành, nhóm dùng được.
- [ ] Phỏng vấn một người dùng thật của capstone
- [ ] Viết 3 user story kèm điều kiện hoàn thành cho một tính năng
- [ ] Vẽ bản đồ user story cho cả capstone

### Bài đã học
- Bài 1–2: đọc nhanh và làm lại ở [ba/README.md](ba/README.md)
- Trang buổi 1: [Yêu cầu và nhu cầu](https://claude.ai/artifact/TXQ8HGSbo7dXQ51XVsq1Q9)
- Trang buổi 2 (làm lại): [Hỏi chuyện người dùng](https://claude.ai/artifact/Tb8UxcbkAzFyGxFZ8t5r2m)

### Nguồn học
- [The Mom Test](https://www.momtestbook.com/) của Rob Fitzpatrick: 3 luật hỏi chuyện người dùng (hỏi về đời sống của họ chứ không về ý tưởng của mình, hỏi chuyện cụ thể đã xảy ra, nghe nhiều nói ít). Hợp với buổi BA 2. Đã đọc trang giới thiệu và [một bản tóm tắt](https://readingraphics.com/book-summary-the-mom-test/), chưa đọc sách.
- [Bản đồ user story của Jeff Patton](https://jpattonassociates.com/the-new-backlog/): xếp việc thành xương sống và các nhánh để thấy bức tranh lớn. Hợp với chặng 2. Đã đọc đoạn trích.

## Chiến tranh
Môn mở rộng, khoảng một buổi mỗi tuần. Đích và lý do học: ở mục "Mục tiêu" của `war.md`.

### Chặng 1: Làm quen và mười ý lớn
Xong khi: thien xếp xong 10 ý lớn và học được vài ý đầu qua các trận có thật.
- [x] Buổi làm quen: làm chỉ huy trận Bạch Đằng 938 (2026-11-12, [bài](war/lessons/01-bach-dang-938.md))
- [x] thien xếp thứ tự 10 ý lớn (buổi 1, ở `war.md`)
- [x] Ý 1, mục tiêu chính trị: làm triều đình Lý 1075–1077 (2026-11-12, [bài](war/lessons/02-ly-song-war-1075-1077.md))
- [x] Ý 2, ba tầng: xếp việc 1075–1077 vào tầng, làm Đại tướng Võ Nguyên Giáp ở Điện Biên Phủ (2026-11-12, [bài](war/lessons/03-three-levels-dien-bien-phu.md))
- [x] Ý 4, hậu cần: đánh chắc cần thêm bao nhiêu, chở bằng gì ở Điện Biên Phủ (2026-11-12, [bài](war/lessons/04-logistics-dien-bien-phu.md))
- [ ] Ý 3, địa hình và thời tiết (đã chạm ở buổi 1)
- [ ] Ý 7 tinh thần, ý 8 vũ khí và công nghệ, ý 9 sương mù chiến tranh, ý 10 chiến tranh nhân dân và du kích (ý 5, 6 đã chạm ở buổi 1)

### Chặng 2: Đi sâu một chiến dịch (thien chọn hướng 1 ngày 2026-11-12)
Bắt đầu khi: xong 10 ý ở chặng 1, khoảng 5 buổi nữa. Quyết định ở mốc 2026-12-13: đi sâu, giữ ở mức ôn, hay cho môn nghỉ. Bốn hướng, đều lấy từ mục "Mục tiêu" trong `war.md`:
1. Đi sâu một chiến dịch từ đầu đến cuối (ví dụ Điện Biên Phủ): dàn binh bố trận, hậu cần, từng đợt đánh. **thien đã chọn hướng này.** Chiến dịch cụ thể chốt khi gần xong chặng 1; ứng viên đầu là Điện Biên Phủ vì đã học buổi 3 và 4.
2. Ngồi ghế người lãnh đạo: mỗi buổi một quyết định lớn có thật, cả Á lẫn Âu.
3. So học thuyết Đông và Tây: Tôn Tử, Clausewitz, chiến tranh nhân dân, mỗi học thuyết thử trên một trận thật.
4. Hiểu thời sự: dùng 10 ý để đọc các cuộc chiến đang diễn ra.

### Bài đã học
- Trang buổi 1: [Bạch Đằng 938](https://claude.ai/artifact/EZzNBAA7saekceEaKU36up)
- Trang buổi 2: [Mục tiêu chính trị](https://claude.ai/artifact/ESWNPJdCAgzDYZyDWG8xfP)
- Trang buổi 3: [Ba tầng](https://claude.ai/artifact/3JnZLK7bgfqWoqRfoEtZWr)
- Trang buổi 4: [Hậu cần](https://claude.ai/artifact/8w59Y36sfADf6oy8wQuGfJ)

### Nguồn học
- Cách dạy môn này (bắt người học quyết định trước khi biết kết cục, như trường quân sự Mỹ): ở mục "Cách dạy môn này" của `war.md`.

## Hàng chờ
Testing, kinh tế, chính trị. Một môn chỉ vào học khi có môn khác nghỉ, tối đa 3 môn cùng lúc (luật ở [README.md](README.md)). Mốc xem lại: 2026-11-22 cho frontend, 2026-12-13 cho cả ba môn.

## Lộ trình đã đổi
| Ngày | Đổi gì | Vì sao |
|---|---|---|
| 2026-11-11 | Từ chỉ học frontend sang 3 môn xoay vòng: frontend, BA, chiến tranh | thien muốn học rộng nhiều lĩnh vực |
| 2026-11-12 | Buổi frontend 6 đổi thành chọn màu cho cả một app | thien muốn học sâu về màu sau buổi 5 |
| 2026-11-12 | Học buổi làm quen chiến tranh trước BA 2 | thien muốn học chiến tranh ngay |
| 2026-11-12 | Học chiến tranh 3 trước BA 2 | thien nhắn "học tiếp chiến tranh" |
| 2026-11-12 | Học chiến tranh 4 trước Frontend 6; phác chặng 2 môn chiến tranh | thien nhắn "học chiến tranh"; thien hỏi học xong tổng quan thì học gì tiếp |
