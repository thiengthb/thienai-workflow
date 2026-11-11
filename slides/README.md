# Làm slide

Bộ quy tắc và bộ khung để AI làm slide thuyết trình cho thien. Quy trình từng bước nằm ở skill [`skills/make-slides/`](../skills/make-slides/STEPS.md).

| File | Dùng để |
|---|---|
| [`RULES.md`](RULES.md) | 48 luật có mã (S1 đến S48): mạch bài, chữ trên slide, lời nói, hình và sơ đồ, giao diện, chuyển động, nguồn, thời lượng, tập dượt, ngày nói, bài nhóm |
| [`BRIEF.template.md`](BRIEF.template.md) | Mẫu tóm tắt bài: ai nghe, ai chấm, bao nhiêu phút, câu cần nhớ. Chép vào `docs/slides/BRIEF.md` của project |
| [`starter/`](starter/) | Khung slide web chép vào project: `deck.html` (6 slide mẫu), `deck.css` (token màu, cỡ chữ cho máy chiếu, in PDF), `deck.js` (phím, ghi chú, cửa sổ người nói, đồng hồ, tổng quan), `check.mjs` (máy kiểm tra), `pages.yml` (đăng GitHub Pages), font Onest |

## Phím trong slide

| Phím | Việc |
|---|---|
| → Space PageDown, bút trình chiếu, bấm 2/3 bên phải | Tiếp (hiện từng bước nếu slide có bước) |
| ← PageUp, bấm 1/3 bên trái | Lùi |
| N | Ghi chú lời nói ở đáy màn |
| P | Cửa sổ người nói: lời nói chữ to, slide tiếp theo, đồng hồ, số phút dự kiến; hai cửa sổ đi cùng nhau |
| T | Bắt đầu hoặc dừng đồng hồ |
| O | Tổng quan, bấm một slide để nhảy tới |
| D | Sáng hoặc tối |
| F | Toàn màn hình |
| Ctrl+P | In ra PDF, mỗi slide một trang |

## Máy kiểm tra

```
npm i -D playwright && npx playwright install chromium
node slides/check.mjs slides/deck.html --pdf
```

Báo lỗi khi chữ tràn khung, chữ đè chữ, chữ nhỏ hơn 22px, hoặc lời nói ước tính vượt `data-budget`. Nhắc khi chữ nội dung nhỏ hơn 30px, slide quá 30 từ ngoài tiêu đề, tiêu đề ngắn như nhãn chủ đề, slide chưa có lời nói, hoặc lời nói dài hơn `data-min`. Ra ảnh từng slide và `check/sheet.png` (cả bài trên một trang) để tự chê ở mức cả bài.

Khung này rút từ runtime của hai bộ slide MLN122 và PRM393, bỏ phần riêng của từng bài (soi nguồn bằng phím K, ba kiểu màu, GSAP). Bài cần soi nguồn thì lấy `proofs.js` của PRM393 làm mẫu.
