# Kế hoạch redesign — 16/10/2026

## Mục tiêu

Bám ảnh mới: banner lớn kèm search, card có logo và thời gian đăng bài, filter địa điểm/sắp xếp, pagination và dải doanh nghiệp. Header/footer vẫn do WordPress quản lý theo phạm vi dự án.

Điều chỉnh mới nhất: bỏ dãy lọc loại tuyển dụng trong banner; nhãn trên ảnh thẻ hiển thị thời gian đăng bài. Partners được giữ lại; các khối activities/statistics/CTA riêng vẫn không dùng.

Phần doanh nghiệp: chỉ giữ đúng 17 logo thật theo ảnh, bỏ các thương hiệu ngoài ảnh khỏi dải, tối ưu WebP local, chạy liên tục xoay vòng. Sửa phản hồi chưa thấy hiệu ứng: bỏ bộ đếm chờ 2,6 giây và điều kiện dừng khi hover cả section. Tự chạy mặc định cả khi hệ điều hành bật giảm chuyển động, bỏ nút Tạm dừng/Tiếp tục. Giữ điều hướng trái/phải, bàn phím, cảm ứng và dừng khi không còn hiển thị.

## Triển khai

1. Tạo banner minh họa bằng imagegen built-in; copy vào project, tối ưu WebP.
2. Thu thập ảnh doanh nghiệp/logo công khai, lưu local và ghi nguồn.
3. Thay HTML/CSS theo bố cục mới, giữ root scope và qn-prefix.
4. Data gồm jobs, recruitmentPrograms, partners; thêm companyLogo và skills.
5. Renderer: location, sort, search, partner carousel; giữ dialog/pagination. Bỏ nút lưu và xử lý lưu tin theo yêu cầu mới nhất.
6. Kiểm tra responsive, accessibility, dữ liệu lỗi, thẻ không còn nút lưu và carousel.
7. Cập nhật docs/source inventory và final QA.

## Kiểm tra

1920/1440/1366/1024/768/430/390/375px, Chrome/Edge, axe-core, keyboard/focus, 0/1/2/6/8 records, title/excerpt dài, ảnh thiếu, ngày lỗi, partner rỗng, storage bị chặn và cuộn logo hai chiều.

Không cài WordPress, viết PHP/plugin/database hoặc kết nối API thật.
