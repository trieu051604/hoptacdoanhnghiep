# Data contract — Career page

Cập nhật 16/10/2026. Toàn bộ nguồn đang là mock; adapter WordPress sau này cung cấp cùng shape.

## Root

    { jobs: [], recruitmentPrograms: [], partners: [] }

Các collection null/thiếu/sai kiểu được xử lý như rỗng. Phần tử null/scalar bị bỏ qua. Payload mới thay toàn bộ collection; page reset 1; search/sort giữ, location giữ nếu còn tồn tại trong nguồn.

## Job

| Field | Kiểu | Ý nghĩa |
| --- | --- | --- |
| id | string/number | Unique và ổn định trong collection |
| title | string | Plain text, bắt buộc |
| thumbnail | string/null | URL ảnh doanh nghiệp/minh họa |
| thumbnailAlt | string | Tùy chọn, alt chính xác |
| company | string | Tên doanh nghiệp |
| companyLogo | string/null | Logo local/media URL, fallback nếu thiếu |
| publishedDate | string | YYYY-MM-DD; hiển thị trên nhãn cam ở ảnh thẻ; ngày không hợp lệ xếp cuối |
| excerpt | string | Plain text |
| permalink | string | URL bài chi tiết |
| category | string | internship / fresher / fulltime; nhãn loại trong dialog |
| location | string | Nhãn địa điểm và giá trị filter |
| campus | string | quy-nhon; adapter chịu trách nhiệm query campus |
| skills | string[] | Tùy chọn, được dùng trong search và dialog |
| responsibilities | string[] | Tùy chọn, nội dung dialog |
| requirements | string[] | Tùy chọn, nội dung dialog |
| isMock | boolean | true mở preview; false/omit cho permalink production |

## Recruitment program

Các field chung như job: id, title, thumbnail, thumbnailAlt, company, companyLogo, publishedDate, excerpt, permalink, location, campus, skills, isMock.

Collection này luôn thuộc mục program ở lớp UI, không cần sửa category gốc. featured có thể giữ từ nguồn cũ nhưng không điều khiển layout hiện tại.

## Partner

| Field | Kiểu | Ý nghĩa |
| --- | --- | --- |
| id | string/number | Unique |
| name | string | Tên/alt doanh nghiệp |
| logo | string/null | URL logo |
| showName | boolean | Tùy chọn, thêm tên bên cạnh biểu tượng |
| url | string | Tùy chọn, link đã được duyệt; thiếu thì logo là nội dung tĩnh |

Danh sách và logo minh họa không chứng minh quan hệ hợp tác hiện tại. Hai wordmark Shizuoka/Yazi là asset prototype, cần thay bằng bản được duyệt.

Nguồn hiện chỉ có 17 partners đúng ảnh tham khảo. Idemitsu chỉ có một record. Các logo ngoài ảnh đã bị loại khỏi partners; companyLogo của thẻ tuyển dụng là field độc lập. Carousel tạo bản sao DOM để nối vòng, không thêm record vào dữ liệu; bản sao có inert/aria-hidden. Nguồn ít logo vừa một khung: không clone, không autoplay và disable hai nút điều hướng. Khi nhận payload mới, tái tạo vòng lặp. Dải tự chạy mặc định và không có nút tạm dừng.

## Filter, sort và pagination

- Gộp jobs/programs; default sort publishedDate giảm dần.
- Sort oldest tăng dần; company dùng so sánh locale vi.
- Ngày không hợp lệ luôn xếp sau record hợp lệ; display “Đang cập nhật”.
- Search chuẩn hóa dấu tiếng Việt và đ, match title/excerpt/company/location/skills.
- Location options lấy từ tất cả record; phối hợp với search.
- 8 tin mỗi trang, tổng số trang tính trên kết quả sau filter/search.
- Số kết quả hiển thị là tổng phù hợp, không phải số item của trang hiện tại.
- Render date theo Asia/Ho_Chi_Minh: hôm nay/hôm qua/2–7 ngày; ngoài khoảng này dùng ngày đầy đủ.

## Event bridge

    const root = document.getElementById('fpt-qn-career');
    root.dispatchEvent(new CustomEvent('qn:career-data', {
      detail: { jobs: [], recruitmentPrograms: [], partners: [] }
    }));

Đăng ký qn:career-ready trước khi module khởi tạo hoặc dispatch sau khi sẵn sàng. qn:career-error hiển thị lỗi ở jobs và ẩn pagination; payload mới khôi phục. partners rỗng tự ẩn section.

## WordPress mapping và an toàn nội dung

id ← ID; title/excerpt ← plain text sau strip HTML; thumbnail/companyLogo ← media URL; publishedDate ← post_date YYYY-MM-DD; permalink ← link/get_permalink. Taxonomy/ACF cung cấp category/campus/location/company/skills.

URL theme/media được adapter cung cấp, không hard-code domain/path local. Văn bản luôn escape; không nhận HTML tùy ý. Chỉ cho relative/fragment/http(s), chặn javascript/data/file/protocol-relative/control characters.

Bỏ isMock cho production, dùng tin đã duyệt. Prototype chưa có fetch REST/WP_Query/database, tài khoản hoặc form ứng tuyển.
