# Nhật Ký Tiến Độ Dự Án & Các Lưu Ý Vận Hành (Project_Process.md)

> **Dự án:** Website Thiệp Cưới Trực Tuyến - Nhà Có Tiệc  
> **Trạng thái hiện tại:** Hoàn thiện 100% các tính năng cốt lõi (Core Features Complete)  
> **Môi trường hoạt động:** Local Development & Production Vercel Deployment

---

## 1. Bảng Theo Dõi Tiến Độ Chi Tiết (Project Progress Tracker)

### A. Phân Hệ Public Website (Khách Vãng Lai & Đặt Thiệp)
- [x] **Trang chủ (HomePage):**
  - [x] Hero Section với phiên bản tối ưu riêng cho Desktop (820px sang trọng) và Mobile (`hero-mobile.jpg`).
  - [x] Chỉ hiển thị các mẫu thiệp được ghim tích cực (`isPinned: true`) đồng bộ với cài đặt CMS của Admin.
  - [x] Bộ đếm cam kết chất lượng, Đánh giá từ các cặp đôi thực tế, Câu hỏi thường gặp (FAQ).
  - [x] Chân trang (Footer) kết nối Hotline, Email, Địa chỉ và mạng xã hội tự động từ CMS.
- [x] **Trang danh mục mẫu thiệp (TemplatesPage):**
  - [x] Bộ lọc phong cách (Editorial, Vintage, Tối giản, Hiện đại) và gói cước (Cơ bản / Cao cấp).
  - [x] Tìm kiếm tiếng Việt thông minh loại bỏ dấu tiếng Việt.
- [x] **Trang chi tiết mẫu thiệp (TemplateDetailPage):**
  - [x] Giả lập smartphone sang trọng với viền vàng kim, cụm camera tai thỏ Dynamic Island.
  - [x] Thanh tiêu đề thương hiệu **Nhà Có Tiệc** phía trên đầu ảnh.
  - [x] Ảnh thiệp cưới tràn kín 100% bề ngang không bị hở viền trắng thừa.
  - [x] Trình phát nhạc nền mẫu thiệp (Audio Preview).
  - [x] Danh sách tính năng, cam kết dịch vụ và nút chuyển hướng đặt thiệp an toàn.
- [x] **Quy trình đặt thiệp & Thu thập thông tin (OrderWeddingInfoPage):**
  - [x] Biểu mẫu 5 phần toàn diện: Nhà Trai & Nhà Gái, Lễ Thành Hôn & Vu Quy, Bản đồ & Thời gian, Album ảnh cưới, Cấu hình RSVP.
  - [x] Bắt buộc đăng nhập trước khi điền form để đảm bảo đơn hàng gắn đúng tài khoản người dùng.
- [x] **Thanh toán VietQR (CheckoutQrPage):**
  - [x] Sinh mã QR chuyển khoản VietQR tự động khớp chính xác số tiền và cú pháp `NCT<mã_đơn>`.
  - [x] Upload hình ảnh hóa đơn/bill chuyển khoản thành công với cơ chế nén ảnh tức thì.
  - [x] Lắng nghe thời gian thực: Khi Admin bấm "Xác nhận đã nhận tiền", trang thanh toán tự động chuyển sang thông báo thành công.

---

### B. Phân Hệ Customer Portal (Cổng Khách Hàng)
- [x] **Onboarding cho khách hàng mới:**
  - [x] Loại bỏ hoàn toàn đơn hàng ảo mẫu (M&M demo order); hiển thị hướng dẫn 3 bước cho khách vừa đăng ký.
- [x] **Trang tổng quan đơn hàng (CustomerDashboardPage):**
  - [x] Thanh tiến trình hiển thị trực quan 8 giai đoạn từ "Chờ thanh toán" đến "Đã bàn giao".
  - [x] Màn hình xem thử thiệp cưới cá nhân hóa khi bản thiết kế hoàn thiện.
  - [x] Module quản lý danh sách khách mời xác nhận tham dự (RSVP) kèm thống kê số người đi cùng.
  - [x] Module sổ lưu bút online: Khách hàng có thể đọc lời chúc và bấm ngôi sao ghim lời chúc tâm đắc lên đầu thiệp.
- [x] **Gửi yêu cầu chỉnh sửa (Revision Modal):**
  - [x] Khách hàng chọn chủ đề cần sửa (Nội dung chữ, Hình ảnh, Thời gian, Khác) và nhập mô tả chi tiết.
- [x] **Bổ sung & Tải lên Album ảnh (PhotoAlbumModal):**
  - [x] Upload nhiều ảnh cưới cùng lúc trực tiếp lên Firebase Storage kèm xem trước và xóa ảnh.
- [x] **Trang tài khoản (CustomerAccountPage):**
  - [x] Quản lý thông tin cá nhân, số điện thoại liên hệ và lịch sử các đơn hàng đã đặt.

---

### C. Phân Hệ Admin Operations Hub (Quản Trị Viên)
- [x] **Bảo vệ truy cập bằng Email Allowlist:**
  - [x] Chỉ cho phép các email trong danh sách ủy quyền truy cập vào đường dẫn `/admin/*`.
- [x] **Quản lý đơn hàng (AdminOrdersPage & AdminOrderDetailPage):**
  - [x] Bộ lọc theo 8 giai đoạn đơn hàng, trạng thái thanh toán, tìm kiếm tên cô dâu/chú rể hoặc mã đơn.
  - [x] Nút bấm 1 chạm: "Duyệt thanh toán", "Chuyển giai đoạn thiết kế", "Gửi bản duyệt demo cho khách", "Bàn giao link thiệp chính thức".
  - [x] Xem trước hóa đơn thanh toán khách đã tải lên.
- [x] **Quản lý mẫu thiệp (AdminTemplatesPage & TemplateFormModal):**
  - [x] Thêm mới, chỉnh sửa thông tin, giá bán, nhạc nền, danh sách tính năng của mẫu thiệp.
  - [x] Bật/tắt ghim mẫu lên trang chủ (`isPinned`) đồng bộ tức thì.
  - [x] Tải ảnh thumbnail mẫu lên Cloud Storage kèm tính năng xem trước ngay lập tức.
- [x] **Cài đặt thanh toán (AdminPaymentSettingsPage):**
  - [x] Quản lý thông tin ngân hàng thụ hưởng (Tên ngân hàng, Chủ tài khoản, Số tài khoản, Cú pháp chuyển khoản).
  - [x] Thay đổi ảnh mã QR thanh toán với cơ chế bảo vệ form (`isDirtyRef`) chống ghi đè dữ liệu đang gõ.
- [x] **CMS Quản lý nội dung (AdminCmsPage):**
  - [x] Quản lý thông điệp tiêu đề Hero, ảnh bìa Desktop/Mobile, Hotline, Zalo, mạng xã hội.
  - [x] Đồng bộ thông tin liên hệ xuống toàn bộ PublicLayout và CustomerLayout.
- [x] **Quản trị khách mời & Lời chúc (AdminGuestsWishesPage):**
  - [x] Theo dõi toàn bộ phản hồi tham dự tiệc cưới và kiểm duyệt lời chúc gửi đến các thiệp.
- [x] **Báo cáo phân tích (AdminAnalyticsPage):**
  - [x] Biểu đồ doanh thu theo ngày/tháng, tỷ lệ chuyển đổi, danh sách mẫu thiệp thịnh hành nhất.

---

## 2. Các Việc Cần Lưu Ý Khi Vận Hành (Operational Gotchas)

### 1. Quy Trình Cập Nhật Lên Môi Trường Thực Tế (Deployment via GitHub Desktop)
- Tất cả các chỉnh sửa mã nguồn được cam kết vào nhánh `main` cục bộ.
- **Thao tác bắt buộc:** Người quản trị/lập trình viên mở **GitHub Desktop** và bấm nút **"Push origin"**.
- Nền tảng **Vercel** đã liên kết với kho lưu trữ GitHub sẽ tự động kích hoạt tiến trình Build & Deploy trong khoảng 1–2 phút.

### 2. Quản Lý Danh Sách Email Quản Trị Viên (Admin Email Allowlist)
- File cấu hình: [`src/mocks/authStore.ts`](file:///c:/Users/kieum/Downloads/Nhà%20có%20tiệc%202/src/mocks/authStore.ts)
- Hiện tại danh sách bao gồm:
  - `kieumllnn@gmail.com`
  - `vutrang280805@gmail.com`
  - `haiyenng4598@gmail.com`
  - `tranthihuyentrang07122005@gmail.com`
  - `admin@nhacotiec.vn`
- Khi cần cấp quyền quản trị cho nhân sự mới, có 2 cách:
  - **Cách 1:** Thêm email vào mảng `ADMIN_EMAILS` trong `authStore.ts`, sau đó commit và push.
  - **Cách 2:** Thêm biến môi trường `VITE_ADMIN_EMAILS` trên trang cấu hình Vercel (các email cách nhau bởi dấu phẩy).

### 3. Vận Hành Đồng Thời Firebase & Local Storage
- Ứng dụng áp dụng cơ chế bộ đệm **LocalStorage song hành cùng Cloud Firestore**.
- **Khi kiểm tra trên nhiều trình duyệt/máy tính khác nhau:**
  - Nếu vừa đăng nhập trên máy tính mới hoặc cửa sổ ẩn danh (Incognito), Firestore sẽ tự động tải các đơn hàng và cài đặt CMS mới nhất về máy trong lần đầu mở trang.
  - Khi xóa dữ liệu trình duyệt (Clear Cache / LocalStorage), hệ thống sẽ đồng bộ lại từ Firestore mà không làm mất các đơn hàng thực tế của khách hàng.

### 4. Tải Ảnh Lên Cloud Storage & Cơ Chế Dự Phòng (Canvas Compression Fallback)
- Toàn bộ ảnh khách tải lên (Album cưới, Bill chuyển khoản, Thumbnail mẫu) được ưu tiên tải lên Firebase Storage (`storageService.ts`).
- **Trường hợp mạng yếu hoặc Firebase Storage hết hạn ngạch (Quota Exceeded):**
  - Hệ thống tự động kích hoạt bộ chuyển đổi Canvas sang chuỗi Data URL nén chuẩn JPEG chất lượng 75% với chiều rộng tối đa 1200px.
  - Giúp khách hàng không bao giờ gặp lỗi "Upload Failed" hoặc đứng hình trang web.

### 5. Cú Pháp Thanh Toán VietQR Tự Động
- Mã đơn hàng được sinh tự động theo quy chuẩn: `NCT<số_thứ_tự>` (Ví dụ: `NCT01`, `NCT02`, `NCT03`).
- Khách hàng khi quét mã VietQR trên app ngân hàng sẽ được tự động điền sẵn số tiền và nội dung chuyển khoản là mã đơn hàng.
- Admin khi nhận được biến động số dư ngân hàng chỉ cần so sánh mã này trong trang **Quản lý đơn hàng** và bấm **"Duyệt thanh toán"** là đơn hàng sẽ tự động tiến sang giai đoạn 2.

---

## 3. Lịch Sử Các Đợt Sửa Lỗi & Tinh Chỉnh Quan Trọng Gần Đây

1. **Khắc phục lỗi hiển thị mẫu thiệp ghim trên trang chủ (`3abfe43` & `6713d3d`):**
   - *Vấn đề:* Mẫu thiệp đã bỏ ghim trong Admin CMS vẫn xuất hiện ở mục Mẫu nổi bật trên trang chủ.
   - *Khắc phục:* Viết lại hàm lọc `publicTemplates.filter(t => Boolean(t.isPinned))` và đồng bộ danh sách `featuredTemplateIds` 2 chiều giữa `templateStore` và `cmsStore`.
2. **Khắc phục lỗi mất thông tin ngân hàng khi thay ảnh QR (`20c7dd6`):**
   - *Vấn đề:* Admin đang gõ tên ngân hàng/số tài khoản, nếu bấm chọn ảnh QR mới thì `useEffect` bị kích hoạt làm tải lại dữ liệu cũ, xóa sạch chữ vừa gõ.
   - *Khắc phục:* Thêm `isDirtyRef` bảo vệ toàn bộ form nhập liệu, chỉ cập nhật khi người dùng chủ động bấm "Lưu thay đổi".
3. **Đồng bộ Hotline động toàn hệ thống (`20c7dd6`):**
   - *Vấn đề:* Khách hàng thấy số hotline cố định `0982 123 456` dù trong Admin đã cập nhật số điện thoại mới.
   - *Khắc phục:* Nối dữ liệu `cmsContent.siteSettings.hotline` vào `CustomerLayout`, `CustomerOrderDetailPage` và `PublicLayout`.
4. **Tối ưu hóa dung lượng Bundle & Code Splitting (`c286845`):**
   - *Vấn đề:* Toàn bộ trang Admin CMS và Customer Dashboard bị tải chung vào file JS đầu tiên khiến tốc độ mở trang chủ ban đầu bị chậm.
   - *Khắc phục:* Phân tách mã nguồn bằng `React.lazy` và `Suspense`, giảm kích thước file tải ban đầu xuống hơn 75%.
5. **Cải tiến khung giả lập Smartphone trên trang chi tiết mẫu thiệp (`e61f090`):**
   - *Vấn đề:* Ảnh thiệp cưới tỷ lệ 9:16 khi đặt vào khung điện thoại tỷ lệ 9:19.5 bị co cụm hoặc để lại khoảng trắng lớn ở các cạnh.
   - *Khắc phục:* Thiết kế thanh thương hiệu "Nhà Có Tiệc" phía trên đầu ảnh dưới cụm tai thỏ, kéo ảnh tràn viền 100% bề ngang (`w-full`) và đặt thanh Home bar phía dưới, tạo trải nghiệm smartphone chân thực, không thừa khoảng trắng.
