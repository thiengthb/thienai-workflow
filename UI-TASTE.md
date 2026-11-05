# Gu UI của thien

thien duyệt ngày 2026-11-05. Nguồn và bằng chứng (5 vòng hỏi, so sánh giấu tên, đối chiếu lịch sử commit sakubun): https://claude.ai/artifact/XdjCdBrq5PT79jHZMER3i2

**Gốc:** đồng bộ trước, đẹp sau. Mọi chi tiết khớp nhau (bo góc, cỡ, khoảng cách, font) quan trọng hơn ấn tượng đầu, vì "đẹp chỉ ở lúc đầu, tính đồng bộ đi lâu dài". Tối giản nghĩa là bớt nhiễu cho mắt, không bớt chức năng. "Sang" là màu tiết chế, chi tiết nhỏ chính xác, căn lề thẳng hàng. Sáng tạo là lệch nhỏ trong khuôn khổ để tạo điểm nhấn, không phải cái lạ không ăn nhập với xung quanh.

**Mặc định** (đã kiểm bằng so sánh giấu tên, hai lần):

- Chữ: Onest, một font cho cả app. Tiêu đề chỉ to hơn và khít hơn, không đổi font. Chữ có chân hoặc kiểu tạp chí chỉ cho màn đặc biệt như trang giới thiệu.
- Cỡ: bo 8px cho nút, ô, thẻ. Nút và ô cao 30px trên laptop.
- Nút bấm nổi có gờ dưới 2px. Thẻ phẳng có viền, nhiều nhất là bóng rất nhẹ. Kính mờ chỉ cho đầu trang khi cuộn.
- Màu: nền trung tính và một màu chủ đạo đổi theo chủ đề và người dùng của từng project, độ đậm vừa. Màu chủ đạo nằm ở nút chính, mục đang chọn, dấu hoàn thành. Nhãn có vài màu nhấn nhạt kiểu Notion. Không gradient nhiều màu; gradient một màu chỉ cho phần mở đầu trang giới thiệu. Viền và chữ phụ đậm vừa. Nền theo màu chủ đạo: màu ấm như cam đi với nền ngà ấm, màu lạnh như xanh ngọc đi với nền trắng lạnh (cách thienui sinh theme Slate Teal từ theme Claude).
- Icon: Lucide. Tabler cũng được, không dùng Phosphor.
- Chuyển động: lò xo nhẹ, không nảy rõ, ở menu và nút. Danh sách hiện ra lần lượt khi mở trang. Không chuyển động trên chữ.
- Stack quen: React (Vite hoặc Next.js), shadcn, Lucide, thư viện motion.

**Những lỗi AI hay mắc mà thien ghét:** bo góc nút và ô lệch nhau; nút và tiêu đề quá to; màn không cân; gradient tím xanh; tự viết code "giả shadcn" thay vì dùng component thật.

**Vùng đang thử để gu lớn lên:** màu tới mức vạch màu theo nhãn; xanh ngọc như màu riêng (thắng hai lần ở vòng màu); thư viện khác shadcn (chưa so). Thích Inter, Be Vietnam Pro, Lucide một phần vì quen mắt: khi giấu tên, Inter và Be Vietnam Pro đều thua.

**Project tham gia cùng người khác:** luật của nhóm đứng trước, gu của thien chỉ là đề xuất.
