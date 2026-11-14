# Bộ màu thienui trên claude.ai

Trang Design System (loại trang của claude.ai): https://claude.ai/artifact/2kM7som4ok6kmh7QaCSXZJ

Trang gom màu (hai theme Claude Clay và Slate Teal, mỗi theme sáng và tối), cỡ chữ, khoảng cách, bo góc 8px và gu của thien từ repo thienui, để Claude trên claude.ai đọc khi dựng slide, bản thiết kế hay trang cho thien (đề xuất N4). thienui vẫn là nguồn duy nhất: sửa gu thì sửa thienui trước, rồi đăng lại trang.

| File | Là gì |
|---|---|
| `make-design-system.mjs` | Đọc `packages/tokens/src` của thienui, ghi `project/tokens.json`; chép `brand-book.md` và `cover.html` vào cùng thư mục |
| `brand-book.md` | Phần chữ của trang (README của Design System), tóm từ `docs/taste.md` của thienui |
| `cover.html` | Bìa trang: tên, khối màu, ô vuông bo 8px |

## Cập nhật

1. `node artifacts/design-system/make-design-system.mjs <thư-mục thienui> --out <thư-mục>`.
2. Đăng bằng công cụ Artifact: `url` là link trên, `root` là `<thư-mục>`, `file_path` là `<thư-mục>/project/tokens.json`, `files` gồm `project/README.md` và `project/components/Cover/preview.html`. Đọc `project/design-system.json` của trang trước khi đổi nó (chỉ khi đổi tên).

Trang thuộc tài khoản Claude của thien. Tài khoản khác không ghi được: tạo trang mới từ loại Design System, đăng cùng các file và một `project/design-system.json` mới, rồi sửa link ở đây.
