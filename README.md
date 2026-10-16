# FPT University Quy Nhơn — Cơ hội nghề nghiệp

Frontend HTML/CSS/JavaScript thuần, cập nhật ngày **16/10/2026**. Chỉ quản lý phần content trong main#fpt-qn-career; header/footer do WordPress cung cấp khi tích hợp.

## Chạy local

    node scripts/serve.mjs

Mở **http://127.0.0.1:4173**. Không cần npm install để xem giao diện. Cần Node.js 18+ và HTTP server cho ES modules. Ctrl+C để dừng server. Có thể dùng npm.cmd start trên PowerShell.

Nếu server đã chạy, tải lại trang bằng Ctrl+F5 sau khi sửa file.

## Giao diện và chức năng

1. **Banner:** ảnh sinh viên/campus, headline và form tìm kiếm.
2. **Cơ hội mới nhất:** tổng kết quả, lọc địa điểm, sắp xếp và lưới 4 thẻ mỗi hàng trên desktop.
3. **Doanh nghiệp đồng hành:** chỉ gồm 17 logo khác nhau trong ảnh tham khảo, mỗi thương hiệu một bản. Dải chạy liên tục khoảng 44px/giây ngay khi xuất hiện, xoay vòng hai chiều và tự giảm số logo theo màn hình.

Dải logo tự chạy mặc định ngay khi xuất hiện, kể cả khi hệ điều hành bật giảm chuyển động, theo yêu cầu thiết kế. Dải vẫn chạy khi con trỏ nằm trên tiêu đề hoặc các logo. Chỉ có nút trước/sau và phím mũi tên, đã bỏ nút Tạm dừng/Tiếp tục. Focus vào vùng logo hoặc link sẽ ngừng cuộn để điều hướng bằng bàn phím. Tạm ngừng trong lúc vuốt/cuộn, khi tab ẩn hoặc section ra khỏi màn hình. Không chạy khi số logo vừa đủ một khung.

Thẻ gồm ảnh doanh nghiệp, nhãn cam hiển thị thời gian đăng bài, logo/tên doanh nghiệp, title, excerpt, địa điểm và nút chi tiết.

- Tìm theo vị trí, doanh nghiệp, địa điểm hoặc kỹ năng, không phân biệt dấu tiếng Việt.
- Địa điểm: tự lấy từ data; sort mới nhất, cũ nhất hoặc doanh nghiệp A–Z.
- 8 tin/trang; số trang theo kết quả lọc; nút số tròn và mũi tên.
- Dialog mock hỗ trợ keyboard, Escape, focus containment/restoration.
- Empty/error/image fallback được xử lý; partners rỗng thì ẩn section.

## Dữ liệu

mock-data.js export qnCareerData gồm **8 jobs, 4 recruitmentPrograms, 17 partners**. Mọi tin, ngày đăng và quan hệ đối tác là **minh họa**, không xác nhận thông tin tuyển dụng thực tế.

career.js là renderer độc lập, không có global JS hoặc API/database. Văn bản được escape, URL nguy hiểm bị chặn. Các record có isMock: true mở dialog; bỏ cờ này khi dùng permalink production.

[DATA-CONTRACT](docs/DATA-CONTRACT.md) mô tả companyLogo, skills, location và partner mapping.

## Thiết kế và responsive

Tất cả selector CSS scope trong #fpt-qn-career, custom class qn-. Font Manrope local có namespace riêng. Không sửa body hoặc DOM ngoài module.

| Viewport | Grid jobs | Logo trên một khung |
| --- | --- | --- |
| ≥1200px | 4 cột | 8 |
| 900–1199px | 3 cột | 6 |
| 600–899px | 2 cột | 4 |
| <600px | 1 cột | 2 |

Banner trên mobile xếp nội dung/search trước, ảnh sinh viên bên dưới. Search/select không tràn. Respect prefers-reduced-motion.

## Cấu trúc chính

    index.html
    assets/css/{reset,variables,components,career}.css
    assets/js/{mock-data,career,partner-carousel}.js
    assets/images/hero/career-banner-v2.webp
    assets/images/employers/
    assets/images/partners/
    assets/fonts/
    scripts/serve.mjs
    tests/qa.cjs
    docs/{UI-SPEC,DATA-CONTRACT,ASSETS,HERO-PROMPT,QA-REPORT,IMPLEMENTATION-PLAN}.md

Ảnh runtime đều local; hero WebP khoảng 125 KB. Banner là ảnh AI minh họa được tạo bằng imagegen built-in, không phải ảnh xác nhận campus/người thật. [ASSETS](docs/ASSETS.md) ghi nguồn ảnh/logo; [HERO-PROMPT](docs/HERO-PROMPT.md) lưu prompt cuối.

## Kiểm tra

    npm install
    npx playwright install chromium
    npm test

Playwright/axe-core chỉ là devDependencies. PowerShell có thể dùng npm.cmd/npx.cmd. Test tự bật server nếu chưa có và chỉ dừng server do test tạo. Output screenshot/JSON nằm trong .qa/ (gitignore).

Đặt QN_QA_CHANNELS=chrome,msedge để kiểm tra thêm browser đã cài. Kết quả hiện tại: [QA-REPORT](docs/QA-REPORT.md).

## WordPress integration

1. Đưa phần main vào template giữa header/footer, không clone header trong ảnh mẫu.
2. Enqueue 4 CSS theo thứ tự và career.js dạng ES module.
3. Adapter CMS cung cấp jobs/recruitmentPrograms/partners theo contract, query đúng campus.
4. Mapping URL theme/media cho hero, logo, thumbnail và font.
5. Thay dữ liệu minh họa bằng nội dung đã duyệt; bỏ isMock, dùng permalink thật.
6. Kiểm tra H1 của theme, CSS kế thừa, sticky header và CSP.

    const root = document.getElementById('fpt-qn-career');
    root.dispatchEvent(new CustomEvent('qn:career-data', { detail: approvedData }));
    root.dispatchEvent(new CustomEvent('qn:career-error'));

Đợi qn:career-ready hoặc dispatch sau khi module khởi tạo. Payload mới thay toàn bộ collection, page reset 1. Không fetch REST hoặc dùng WP_Query thật trong phase này.

Trước production: duyệt tin, quan hệ đối tác, quyền ảnh/logo, thay wordmark minh họa; kiểm tra trên Safari/Firefox, thiết bị thật và screen reader. Chưa có tài khoản, ứng tuyển hoặc gửi form.
# hoptacdoanhnghiep
