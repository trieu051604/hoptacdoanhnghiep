# Asset inventory — Mẫu career mới

Cập nhật 16/10/2026. Toàn bộ tài nguyên runtime được lưu local. URL dưới đây chỉ ghi nguồn, không được hotlink trong website.

## Banner AI

- Runtime: assets/images/hero/career-banner-v2.webp — 2172×724px, 125.160 bytes.
- Nguồn project: assets/images/hero/career-banner-v2.png.
- Tạo bằng **imagegen built-in**, sau đó tối ưu định dạng WebP.
- Prompt cuối và mode: [HERO-PROMPT](HERO-PROMPT.md).
- Đây là ảnh minh họa AI, không phải ảnh xác nhận sinh viên/campus thực tế.
- Headline, slogan và search được dựng bằng HTML/CSS riêng.

## Ảnh doanh nghiệp

| Asset WebP | Nguồn |
| --- | --- |
| employers/fpt-office.webp | [FPT Chúng ta — F-Town](https://i.chungta.vn/2020/05/29/10004515913964868372064903485057783915610112o-1590750331.jpg) |
| employers/vietcombank-office.webp | [Knauf — Vietcombank Tower](https://media.knauf.com/a/D33Etb2WQomCRDDctqkbU1) |
| employers/mb-office.webp | [Vietnam Investment Review](https://vir.com.vn/stores/news_dataimages/luuhuong/122021/02/08/5011_MB_headquarter.jpg) |
| employers/tpbank-office.webp | [MarketTimes](https://mkt.1cdn.vn/2023/01/10/ava-tpb.jpg) |
| employers/shopee-office.webp | [Singapore EDB](https://www.edb.gov.sg/content/dam/edb-en/business-insights/insights/singapore-brands-going-overseas-the-future-of-retail/picture-2-682px.jpg) |
| employers/unilever-office.webp | [PTW — Unilever Vietnam](https://ptw.com.au/uploads/images/_AUTOx1800_crop_center-center_82_none/UnileverHQ_04.jpg) |
| employers/shizuoka.webp | [Unsplash — Mount Fuji](https://images.unsplash.com/photo-1490806843957-31f4c9a91c65) |
| employers/telecom-office.webp | [Unsplash — building illustration](https://images.unsplash.com/photo-1486406146926-c627a92ad1ab) |

Ảnh được dùng để minh họa doanh nghiệp/môi trường làm việc, không xác nhận chi nhánh hoặc vị trí tuyển dụng ở địa điểm đang hiển thị. Tin và ngày đều là mock.

Bản JPG nguồn giữ trong cùng folder; frontend chỉ tham chiếu WebP.

## Logo

| File | Nguồn / trạng thái |
| --- | --- |
| partners/fpt-software.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/FPT-Software-Logo.png) |
| partners/fpt-telecom.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/FPT-Telecom-Logo.png) |
| partners/vietcombank.png | [Vietcombank official](https://www.vietcombank.com.vn/-/media/Project/VCB-Sites/VCB/Home-page/VCB-Logo/Logo-VCB-no-60.png?ts=20240605031450) |
| partners/tpbank.png | [TPBank official](https://tpb.vn/wps/wcm/connect/90f5dc35-bac5-4032-b8ab-ad309077554b/logo-fix%281%29.png?MOD=AJPERES) |
| partners/mb.png | [VietQR bank logo](https://api.vietqr.io/img/MB.png) |
| partners/topcv.png | [TopCV static CDN](https://cdn-new.topcv.vn/unsafe/https://static.topcv.vn/v4/image/logo/topcv-logo-6.png) |
| partners/shopee.svg | [Simple Icons source](https://github.com/simple-icons/simple-icons/blob/develop/icons/shopee.svg), fill màu thương hiệu |
| partners/unilever.svg | [Simple Icons source](https://github.com/simple-icons/simple-icons/blob/develop/icons/unilever.svg), fill màu thương hiệu |
| partners/shizuoka.svg | Biểu tượng Fuji + wordmark minh họa, không phải logo sự kiện được duyệt |
| partners/yazi.svg | Wordmark minh họa theo ảnh mẫu, không xác nhận doanh nghiệp/quan hệ đối tác |

Các bản có showName=true được ghép tên bằng HTML khi file chỉ có biểu tượng. Logo/card dùng object-fit: contain; ảnh doanh nghiệp dùng cover.

### Logo bổ sung theo ảnh ngày 16/10/2026

17 logo thật được đối chiếu với [dải doanh nghiệp Campus Quy Nhơn](https://daihoc.fpt.edu.vn/quy-nhon/), cắt phần trắng ngoài và tối ưu WebP, tổng 201.706 bytes. Đất Xanh/Toshiba dùng nguồn hãng để có nền sạch. Dải doanh nghiệp chỉ giữ đúng 17 thương hiệu trong ảnh, loại bản Idemitsu trùng. Vietcombank, MB Bank, Shopee, Unilever, TopCV và Yazi đã được bỏ khỏi dải; asset dùng trên thẻ tuyển dụng vẫn phục vụ nội dung tương ứng.

| File trong partners/ | Nguồn |
| --- | --- |
| sunlife.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Cong-Ty-Bao-Hiem-Nhan-Tho-Sunlife-Viet-Nam.png) |
| dat-xanh.webp | [Đất Xanh Miền Bắc](https://datxanhmienbac.com.vn/public/images/DX-Mien-Bac_2021_D.png) |
| toshiba.webp | [Toshiba Lifestyle CDN](https://web-res.midea.com/content/dam/toshiba-aem/system/Toshiba-logo-2x.png) |
| elca.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Cong-Ty-TNHH-Cong-Nghe-Thong-Tin-Elca.jpg) |
| fpt-software.webp / fpt-telecom.webp | Nguồn FPT University ghi trong bảng trên, tối ưu lại crop |
| idemitsu.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Idemitsu-Logo-2.png) |
| wgr.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/WGR-Logo-Transparent.png) |
| iviec.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/He-Sinh-Thai-Tuyen-Dung-IViec-scaled.png) |
| delta-galil.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Cong-Ty-Delta-Galil-Viet-Nam-scaled.png) |
| vti.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/VTI-Group-scaled.png) |
| tpbank-partner.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/TPBank-Logo-2.jpg) |
| anya-premier.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Logo-Anya-Hotel-5-Sao.jpg) |
| nab.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Ngan-Hang-Quoc-Gia-Uc.jpg) |
| glotrans.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Cong-Ty-TNHH-Van-Tai-Va-Tiep-Van-Toan-Cau.jpg) |
| golden-gate.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/Cong-Ty-Co-Phan-Tap-Doan-Golden-Gate.png) |
| fpt-education.webp | [FPT University](https://daihoc.fpt.edu.vn/wp-content/uploads/2025/12/To-Chuc-Giao-Duc-FPT.png) |

Các SVG chữ minh họa dat-xanh.svg/toshiba.svg cũ được giữ nhưng không sử dụng trong dải logo mới. TPBank dùng bản wordmark đầy đủ trên dải đối tác; thẻ tuyển dụng vẫn dùng biểu tượng tpbank.png. Manifest nguồn/kích thước phục vụ QA: .qa/partner-logo-sources.json.

## Font và tài nguyên khác

Manrope variable 400–800, WOFF2 Vietnamese/Latin; [SIL Open Font License](../assets/fonts/OFL.txt). Font namespace qn-Manrope.

fallback.svg và favicon.svg là icon prototype. Các asset của bố cục cũ vẫn được giữ, nhưng không tải nếu không được tham chiếu trong HTML/data hiện tại.

## Bàn giao production

Campus cần duyệt tin, danh sách đối tác, quyền sử dụng ảnh/logo và thay các asset minh họa khi cần. Khi đưa vào WordPress, mapping URL media/theme cho hero, thumbnail, companyLogo, partner.logo và font. Giữ alt, intrinsic sizes và crop chủ thể. Không cần chuyển file nguồn PNG/JPG hoặc asset cũ nếu chỉ triển khai frontend tối ưu hiện tại.
