# QA report — Thiết kế banner và cơ hội nghề nghiệp

Ngày kiểm tra: **16/10/2026** (Asia/Saigon).

## Kết quả

**26 nhóm kiểm tra đã qua**: hero có search, card thời gian đăng/logo, địa điểm/sắp xếp và carousel 17 logo đúng ảnh tự chạy xoay vòng.

Không có lỗi JavaScript hoặc console ngoài 404 được chủ động tạo trong test ảnh hỏng. Axe-core không phát hiện vi phạm WCAG A/AA ở desktop, mobile, dialog và pagination 4 trang. Đây là kiểm tra tự động và trực quan, không thay thế audit screen reader/thiết bị thật.

Lệnh:

    $env:QN_QA_CHANNELS = 'chrome,msedge'
    node tests/qa.cjs

## Responsive

| Viewport | Grid cơ hội | Overflow ngang | Ảnh lỗi |
| --- | --- | --- | --- |
| 1920px | 4 cột | Không | Không |
| 1440px | 4 cột | Không | Không |
| 1366px | 4 cột | Không | Không |
| 1024px | 3 cột | Không | Không |
| 768px | 2 cột | Không | Không |
| 430px | 1 cột | Không | Không |
| 390px | 1 cột | Không | Không |
| 375px | 1 cột | Không | Không |

Đã kiểm tra scrollWidth, bounding box và số cột grid. Các logo ngoài khung carousel được loại khỏi phép kiểm tra bounding box vì đây là vùng overflow-x có chủ đích; document vẫn không tràn ngang.

Screenshot desktop/tablet/mobile đã được mở để kiểm tra banner, crop ảnh, logo, khoảng cách, card/footer và responsive.

## Browser

- Chromium 149.0.7827.55: toàn bộ QA.
- Google Chrome 155.0.8059.79: 1440px và 390px, không overflow/lỗi JS, dialog mở/đóng đúng.
- Microsoft Edge 155.0.4283.45: 1440px và 390px, không overflow/lỗi JS, dialog mở/đóng đúng.
- Safari/Firefox chưa kiểm tra trực tiếp; cần QA khi tích hợp WordPress.

## Tương tác và dữ liệu

- Search không phân biệt dấu: vị trí, doanh nghiệp, địa điểm, skills; submit đưa focus tới jobs.
- Banner không còn dãy lọc loại tuyển dụng; nhãn trên ảnh thẻ dùng thời gian đăng, có datetime ISO và tooltip ngày đầy đủ.
- Sort mới nhất/cũ nhất/doanh nghiệp A–Z.
- 8 tin mỗi trang, trang cuối không đầy, numeric/previous/next controls, aria-current và disabled ở hai đầu.
- Search/location/sort/payload mới reset page 1.
- Đã bỏ nút lưu tin trên tất cả thẻ, CSS, xử lý sự kiện và truy cập localStorage liên quan. Kiểm tra thẻ không còn nút lưu ở cả 8 viewport.
- Chỉ 17 thương hiệu trong ảnh tham khảo; đã bỏ 6 thương hiệu ngoài ảnh khỏi dải. Ảnh decode thành công ở cả 8 viewport.
- Carousel chạy liên tục ngay khi hiện; con trỏ trên tiêu đề/logo không chặn chuyển động. Kiểm tra nhiều mẫu liên tiếp cách nhau 250ms để phát hiện hiệu ứng chỉ chạy từng đợt.
- Đã bỏ nút Tạm dừng/Tiếp tục và xử lý JS/CSS của nút. Vùng logo có focus bàn phím thì ngừng cuộn.
- Tự chạy mặc định trong cả hai chế độ chuyển động của hệ điều hành, hoạt động sau khi tải lại trang mà không cần thao tác.
- Phím mũi tên xoay vòng từ logo đầu về cuối và ngược lại; nút trước/sau dùng được trên mobile.
- Bản sao vòng lặp inert/aria-hidden, không tạo ID trùng hoặc đọc lặp bằng screen reader.
- Dữ liệu 0/1/2/6/8 tin và partners tương ứng; partners=[] ẩn section.
- Title/excerpt dài, chuỗi không có khoảng trắng và escape HTML.
- Ảnh thiếu/hỏng fallback, ngày không hợp lệ, payload null/sai kiểu, error/recovery.
- H1 duy nhất, không duplicate ID, alt đầy đủ, qn-prefix và CSS root scope.
- Host DOM/style ngoài module không đổi; không inline event.
- Keyboard dialog, focus containment/restoration, Escape/anchor navigation.
- Reduced motion tắt transition/animation và dùng scroll tức thì.

## Lỗi đã sửa

- Dải cũ chờ 2,6 giây giữa các bước và dừng khi hover toàn bộ section, khiến người xem không thấy chuyển động. Đổi sang requestAnimationFrame, tốc độ theo thời gian và bỏ scroll snap bắt buộc để chạy liên tục.
- Focus nút tiếp tục và tùy chọn giảm chuyển động từng chặn cách bật lại hiệu ứng; tách focus vùng logo khỏi nút. Theo yêu cầu mới nhất, bỏ điều kiện giảm chuyển động khỏi autoplay để dải logo tự chạy mặc định.
- Thêm phiên bản URL CSS/JS để trình duyệt lấy bản sửa carousel mới.

- Nhãn trong dialog có contrast 4.28:1 sau khi đổi màu cam; đã dùng sắc đậm hơn và audit qua.
- Padding 3px làm scroll snap dừng ở scrollLeft=3, khiến trạng thái nút đầu carousel sai. Đã bỏ padding và kiểm tra cả hai chiều cuộn.
- Test chờ scroll event cập nhật trạng thái nút trước khi đọc disabled.
- Test ảnh fallback được cập nhật để phân biệt thumbnail với logo mới.

## Tài liệu và artifacts

README, UI-SPEC, DATA-CONTRACT, ASSETS, HERO-PROMPT và IMPLEMENTATION-PLAN đã cập nhật. Mock có 8 jobs, 4 programs và 17 partners. Tài nguyên frontend đều local; hero WebP 125 KB. Bộ 17 logo theo ảnh được lưu WebP và ghi nguồn trong ASSETS.

Output .qa/ (gitignore):

- results.json
- desktop-top.png / mobile-top.png
- 1440-full.png / 768-full.png / 390-full.png
- pagination-reference.png

## Phạm vi và giới hạn

Chỉ triển khai content, không clone header/footer FPT. Banner AI là hình minh họa. Tin/đối tác/ngày đang là mock, một số wordmark là placeholder. Chưa tích hợp WordPress/API/database hoặc ứng tuyển thật.

Bước tiếp theo: duyệt dữ liệu/asset, mapping CMS đúng campus và URL theme/media, dùng permalink thật, kiểm tra trong theme production và browser/thiết bị thật.
