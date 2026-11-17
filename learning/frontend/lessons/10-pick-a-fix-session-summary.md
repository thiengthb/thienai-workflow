# Bài 10: Chọn bản sửa cho màn "Xong buổi ôn" của sakubun

Học ngày 2026-11-17 · Trang tương tác: [`../pages/lesson-10.html`](../pages/lesson-10.html) (nguồn; bản đăng ở nick tnt697: https://claude.ai/artifact/YCAUfunNa6871a6y8WrJqQ)

Từ mới: không có

## Ý chính

**Muốn một thứ nổi thì hạ những thứ khác xuống, đừng thêm màu. Câu "người dùng mở màn để làm gì" quyết định thứ gì được to.**

Buổi đầu của chặng 2 (áp vào app của mình), kiểu bài "chọn bản sửa": một màn có một chỗ cấn mắt, ba bản sửa, chọn bản tốt nhất và nói một câu vì sao.

1. Người vừa ôn xong mở màn "Xong buổi ôn" để biết mình nhớ được bao nhiêu và thẻ nào cần xem lại.
2. Ở màn gốc, tiêu đề, ba số và nhãn ô gần cùng cỡ (18, 18, 17). Không có thứ gì khác hẳn, nên mắt đi khắp màn.
3. Ba cách sửa: tô màu ba ô (A) thì ba ô vẫn bằng nhau, chỉ thêm ba màu giành mắt. Băng chuỗi ngày to (B) đẹp nhất nhưng nhấn vào việc phụ. Một số "7/10" to, hai số kia thành dòng nhỏ xám (C) không thêm gì mà chỉ hạ, và đây là bản tốt.

## Ví dụ đã xem

- Màn "Xong buổi ôn" của sakubun, dựng lại bằng HTML từ `components/features/review/session-summary.tsx` (bản 2026-11-17), số liệu buổi ôn là số mẫu (10 thẻ, nhớ 7, chuỗi 12 ngày).
- Nhớ lại buổi 9: hộp hỏi "Xóa thẻ?" có hai nút đặc "Hủy" và "Xóa" (lỗi điểm nhấn); thẻ "Đến hạn hôm nay" bốn khối màu so với một màu nhấn.

## Con số để nhớ

| Chuyện | Con số |
|---|---|
| Màn gốc: tiêu đề, số trong ô, nhãn ô | 18 đậm, 18 đậm, 17: gần như phẳng |
| Số chính ở bản C | 34 (gần gấp đôi chữ thường 17, bằng cỡ số thẻ ở màn Hôm nay của sakubun) |
| Hai số phụ và tiêu đề ở bản C | 14, xám |
| Vì sao không 18, không 56 | 18 bằng chữ thường nên không nổi; 56 to hơn mọi số trong app, đẩy danh sách thẻ chưa nhớ xuống |

## Tự kiểm

1. Muốn "Nhớ 70%" nổi lên giữa ba ô bằng nhau, làm gì?
   <details><summary>Đáp án</summary>Làm số đó to hẳn và hạ hai số kia thành một dòng nhỏ xám. Tô màu, thêm viền hay bóng là thêm vào, ba ô vẫn ngang nhau.</details>
2. Băng chuỗi ngày to, màu cam hồng, đẹp và có động lực. Vì sao vẫn không hợp màn "Xong buổi ôn"?
   <details><summary>Đáp án</summary>Màn này để biết vừa nhớ bao nhiêu và xem lại thẻ quên. Băng to kéo mắt vào chuỗi ngày, việc phụ, và đẩy danh sách thẻ quên xuống.</details>

## Bạn đã làm

- Nhìn 5 giây: mắt "đi khắp màn", đúng chỗ cấn của màn gốc.
- Chọn bản B (băng chuỗi ngày), lý do: "vì vào màn là mình nhìn được con số chính là số mình cần ôn". Lý do này tả đúng bản C hơn bản B, chưa rõ là lẫn số chuỗi ngày với số chính hay bấm nhầm.
- Câu hỏi nhanh 1 chọn "tô ô Nhớ màu xanh lá đậm"; câu 2 (vì sao băng chuỗi ngày không hợp) đúng.
- Bàn thử: thử đủ hai giá trị mọi núm, chốt một số to, trắng, cỡ 18. Có thể do lỗi trang: nút "Đặt bản C, số 18" đặt lại cỡ về 18 nếu bấm sau khi đã thử 56 và 34 (AI suy ra; đã sửa nút trong nguồn).
- Với sakubun thật: "để sau, xem thêm các màn khác trước". Chưa sửa gì trong sakubun.

## Bạn đã nói

Đề (có khung 3 ý, thien chọn thử ở đầu buổi): Linh nhắn "Màn 'Xong buổi ôn' có ba ô số gọn gàng mà. Sao bạn bỏ ba ô, chỉ để một số to? Mình lại thích thấy chuỗi ngày to cơ, nhìn có động lực."

> Linh ơi, người ta mở màn này để xem quá trình mình đang ở đâu
> Giờ chỗ quá trình đang nhỏ, nên mình sửa thành to và nổi bật
> Vì mắt sẽ tập trung đầu tiên vào những thứ khác biệt và nổi bật

Lần đầu sau ba buổi có "vì sao": mắt dừng trước ở thứ khác biệt. Còn thiếu: mục đích còn chung ("quá trình mình đang ở đâu" thay vì "vừa nhớ được bao nhiêu, thẻ nào cần xem lại"), chưa gọi tên chỗ trên màn (số "Nhớ 70%"), chưa có con số (18 thành 34), và chưa trả lời ý của Linh về chuỗi ngày. Bản của Claude: người ta mở màn ngay sau khi ôn để biết vừa nhớ bao nhiêu và thẻ nào cần xem lại; giờ tiêu đề, ba số và nhãn đều 17–18 nên "Nhớ 70%" ngang hàng "Chuỗi 12 ngày", sửa thành một số "7/10" cỡ 34, hai số kia thành dòng nhỏ xám; vì mắt cần một thứ khác hẳn mới biết nhìn đâu trước; chuỗi ngày vẫn ở đầu màn Hôm nay.

## Góp ý của bạn

Độ dài "vừa", độ khó "vừa" (buổi 9 là "dài"; rút còn 9 bước có tác dụng). Chọn bản sửa trên màn sakubun so với các buổi trước "như nhau". Khung 3 ý "bình thường".

## Lỗi của trang, sửa ở buổi sau

- Nút "Đặt bản C, số 18" ở bước tự vặn đặt lại cỡ chữ, nên bấm sau khi thử thì mất lựa chọn. Đã đổi thành "Đặt bản C" (không đụng cỡ) trong nguồn.
- Phần "Claude làm mẫu" ở bước ba bản sửa tự vặn lên 56, lệch với số 34 trang chốt ở bước sau. Bản làm mẫu không biết đáp án của bài; bước có đáp án số nên ghi đáp án vào ngữ cảnh làm mẫu (việc của bộ mẫu `artifacts/it/`, chưa làm).

## Nguồn và mức chắc chắn

- Cỡ chữ, màu, khoảng cách của màn lấy từ code sakubun (session-summary.tsx, globals.css, card.tsx) ngày 2026-11-17; màn là bản dựng lại, không phải ảnh chụp.
- Ba bản sửa và việc chọn bản C là ý của Claude dựa trên năm ý của chặng 1, chưa thử với người dùng thật.
- Quy ước nghề: muốn nổi thì tạo chênh lệch (cỡ, độ đậm, màu), và hạ thứ khác xuống thường gọn hơn thêm vào.
