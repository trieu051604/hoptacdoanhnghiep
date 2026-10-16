# UI specification — Mẫu banner, thẻ và doanh nghiệp

Cập nhật 16/10/2026 theo ảnh tham khảo mới nhất. Chỉ phần content, không dựng header/footer FPT.

## 01 — Hero

- Banner ảnh rộng sinh viên/campus bên phải, vùng màu kem bên trái cho text.
- H1 “Bắt đầu sự nghiệp từ đây.”, eyebrow và description là HTML thật.
- Search pill gồm icon, input, nút Tìm kiếm.
- Ảnh career-banner-v2.webp được ưu tiên tải, không embed chữ UI trong ảnh.
- Desktop ảnh nền; tablet overlay sáng để đọc rõ; mobile text/search trước, ảnh dưới.
- Input live search không cướp focus; submit đưa focus tới jobs.

## 02 — Cơ hội mới nhất

- Heading, lời dẫn, tổng kết quả và select địa điểm/sắp xếp.
- Grid 4/3/2/1 cột theo ≥1200 / 900–1199 / 600–899 / <600px.
- 8 tin/trang. Ảnh 1.78:1, góc bo 11px, border nhẹ.
- Nhãn cam/chữ nâu ở góc trên trái ảnh hiển thị thời gian đăng bài kèm icon đồng hồ.
- Logo doanh nghiệp đặt chồng mép ảnh; tên doanh nghiệp, title 2 dòng, excerpt 3 dòng.
- Thời gian đăng trong 7 ngày hiển thị Hôm nay/Hôm qua/2–7 ngày trước, ngày khác hiển thị DD/MM/YYYY; time giữ datetime ISO và title ngày đầy đủ. Không lặp ngày ở metadata; phần này chỉ có địa điểm kèm icon.
- Nút Xem chi tiết có viền, không link click giả. Mock mở dialog; permalink production điều hướng tự nhiên.
- Card dùng flex để metadata/footer cùng đáy. Hover nhẹ, reduced motion tắt hiệu ứng.

## Pagination

Nút tròn, trang hiện tại cam, aria-current=page. Trước/sau luôn có khi phân trang hiện; disabled ở hai đầu. Tối đa 5 số quanh trang hiện tại. Search/location/sort/payload mới reset trang 1. Ẩn pagination khi ≤8 kết quả hoặc lỗi nguồn.

Chuyển trang cập nhật nội dung/live region và focus đầu danh sách. Không có pagination server trong prototype.

## 03 — Doanh nghiệp đồng hành

- Nền kem, heading và dải logo nền trắng bo góc.
- 8/6/4/2 logo theo breakpoint grid jobs.
- Chỉ giữ đúng 17 thương hiệu trong ảnh tham khảo, mỗi thương hiệu một bản; bỏ các logo ngoài ảnh khỏi dải doanh nghiệp. Idemitsu chỉ có một bản.
- Chạy liên tục khoảng 44px/giây ngay khi hiển thị, nối vòng không có khoảng trống ở cuối dải; không có thời gian chờ giữa từng logo.
- Nút trái/phải và phím mũi tên chuyển từng logo, xoay vòng đầu/cuối. Disable khi danh sách không vượt khung.
- Con trỏ nằm trong section không làm dừng hiệu ứng. Đã bỏ nút Tạm dừng/Tiếp tục theo yêu cầu; giữ hai nút chuyển trái/phải. Focus vào vùng logo hoặc link dừng chuyển động để điều hướng bàn phím.
- Tự chạy mặc định ngay khi xuất hiện, không phụ thuộc prefers-reduced-motion và không cần người dùng bấm chạy. Tải lại trang trở về trạng thái tự chạy. Cảm ứng/cuộn thủ công tạm ngừng autoplay; tab ẩn/section ngoài màn hình ngừng chạy.
- Track không ép scroll snap để cuộn từng pixel không bị kéo về vị trí cũ. Hỗ trợ cuộn cảm ứng và ResizeObserver. Bản sao phục vụ vòng lặp có inert/aria-hidden và không nhận focus; không đọc lặp logo bằng screen reader.
- Logo showName có thể bổ sung tên khi asset chỉ chứa biểu tượng.
- partners rỗng: ẩn section. Chú thích minh họa hiển thị trong prototype.

## State và accessibility

Search không phân biệt dấu, bao gồm skills; location động theo data; sort newest/oldest/company.

Semantic main/section/article/time, H1 duy nhất, H2 cho jobs và partners, H3 cho tin. Focus ring, label input/select, native buttons, live region cho kết quả tìm kiếm. Dialog native đóng bằng nút/Escape/backdrop, giữ focus và trả về trigger hoặc jobs khi chọn anchor.

Empty/no-results/error riêng biệt; thumbnail/logo hỏng có ảnh fallback. Mọi selector scope, prefix qn-, DOM mutation trong root.
