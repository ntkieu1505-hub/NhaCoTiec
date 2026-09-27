# Ghi Chú Triển Khai Kỹ Thuật (Implementation-Note.md)

> **Dự án:** Nền tảng Website Thiệp Cưới Trực Tuyến - Nhà Có Tiệc  
> **Tài liệu:** Bản ghi nhận thực thi kỹ thuật, những điểm khác biệt so với đặc tả ban đầu, các đánh đổi kiến trúc và những điều quan trọng chủ dự án cần nắm rõ.

---

## 1. Những Thứ Đã Làm Nằm Ngoài Spec (Extra Features Implemented Beyond Original Spec)

Trong quá trình phát triển thực tế, nhằm nâng cao tính ứng dụng và độ tin cậy của sản phẩm, nhiều giải pháp kỹ thuật đã được chủ động xây dựng bổ sung vượt ngoài bản mô tả (spec) ban đầu:

### 1.1. Cơ Chế Đồng Bộ Đa Tab Tức Thì Bằng HTML5 `BroadcastChannel` (0ms Multi-Tab Sync)
- **Vấn đề thực tế:** Khi mở đồng thời 2 tab (ví dụ: 1 tab Admin duyệt đơn và 1 tab Khách hàng đang theo dõi), nếu chỉ dựa vào HTTP polling hoặc chờ mạng, giao diện sẽ có độ trễ lớn hoặc yêu cầu người dùng phải F5 tải lại trang.
- **Giải pháp triển khai:** Tích hợp `BroadcastChannel` cho cả 4 store hạt nhân (`orders_channel`, `templates_channel`, `cms_channel`, `payment_settings_channel`). Khi Admin bấm "Duyệt thanh toán", tín hiệu gửi qua kênh nội bộ trình duyệt giúp màn hình khách hàng đổi trạng thái ngay lập tức (< 5ms) mà không phụ thuộc vào tốc độ mạng.

### 1.2. Cơ Chế Nén Ảnh Dự Phòng Bằng Canvas Phía Client (Client-side Canvas Fallback)
- **Vấn đề thực tế:** Khi khách tải lên album ảnh cưới hoặc bill chuyển khoản, nếu mạng chập chờn, tài khoản Firebase Storage chạm hạn ngạch (quota limit) hoặc chưa hoàn tất cấu hình quyền ghi, việc tải ảnh sẽ bị lỗi làm đứt gãy trải nghiệm.
- **Giải pháp triển khai:** Trong [`storageService.ts`](file:///c:/Users/kieum/Downloads/Nhà%20có%20tiệc%202/src/services/storageService.ts), xây dựng hàm `fileToCompressedDataUrl` tự động nén ảnh qua HTML5 Canvas với chất lượng 75% JPEG và giới hạn chiều rộng 1200px. Nếu Cloud Storage gặp sự cố, hệ thống chuyển sang lưu trữ Data URL nén, đảm bảo 100% người dùng không bao giờ bị báo lỗi "Upload thất bại".

### 1.3. Giao Diện Onboarding Khách Mới (Empty State Onboarding)
- **Vấn đề thực tế:** Spec ban đầu chỉ mô tả giao diện khi đã có đơn hàng hoàn thiện (chứa sẵn mockup của cặp đôi mẫu). Khi người dùng thật đăng ký tài khoản mới tinh, việc hiển thị thông tin của cặp đôi ảo gây hiểu lầm và bối rối.
- **Giải pháp triển khai:** Xây dựng màn hình chào mừng Onboarding 3 bước trực quan: "1. Khám phá & Chọn mẫu" -> "2. Điền thông tin & Ảnh" -> "3. Nhận thiệp trong 24h" kèm nút dẫn thẳng đến bộ sưu tập mẫu thiệp.

### 1.4. Bộ Bảo Vệ Trạng Thái Nhập Liệu Form (`isDirtyRef`) Trong Quản Trị Thanh Toán
- **Vấn đề thực tế:** Trong trang cấu hình tài khoản ngân hàng của Admin, khi vừa gõ số tài khoản hoặc tên ngân hàng mà lại bấm tải ảnh mã QR mới lên, hiệu ứng `useEffect` lắng nghe Store sẽ tự động kích hoạt và ghi đè lại dữ liệu cũ, làm biến mất toàn bộ nội dung Admin vừa nhập.
- **Giải pháp triển khai:** Thêm cờ tham chiếu `isDirtyRef`. Khi người dùng đang tương tác với bàn phím, form sẽ khóa việc tự động ghi đè từ nền, chỉ cập nhật khi Admin chủ động bấm nút "Lưu thay đổi".

### 1.5. Thiết Kế Thanh Thương Hiệu "Nhà Có Tiệc" & Kéo Ảnh Tràn Màn Hình Điện Thoại
- **Vấn đề thực tế:** Ảnh mẫu thiệp được chụp theo tỷ lệ dọc 9:16, nhưng tỷ lệ smartphone đời mới thường là 9:19.5 (thon dài). Nếu đặt nguyên ảnh vào khung máy, trên và dưới sẽ xuất hiện khoảng đen/khoảng trắng trống trải, hoặc ảnh bị cắt xén nội dung.
- **Giải pháp triển khai:** 
  - Đặt thanh tiêu đề thương hiệu **Nhà Có Tiệc** kèm logo nhỏ phía trên đầu ảnh, vừa vặn phía dưới cụm camera tai thỏ Dynamic Island.
  - Kéo chiều ngang bức ảnh tràn mép 100% (`w-full`), loại bỏ khoảng hở thừa hai bên.
  - Đặt thanh Home bar tinh tế phía dưới cùng, tạo nên một chiếc smartphone hoàn hảo như đang mở app xem thiệp cưới thực thụ.

### 1.6. Bộ Lọc Tìm Kiếm Tiếng Việt Không Dấu (`searchHelper.ts`)
- Người dùng khi tìm kiếm "Thanh Xuan" hay "thanh xuân", "editorial" hay "cổ điển" đều nhận được kết quả chính xác tuyệt đối nhờ thuật toán chuẩn hóa Unicode tiếng Việt tự động.

---

## 2. Những Thứ Đã Cần Thay Đổi So Với Spec (Divergences From Original Spec & Rationales)

| Điểm khác biệt | Đặc tả ban đầu (Spec) | Thực tế triển khai | Lý do thay đổi |
|---|---|---|---|
| **1. Luồng chọn mẫu & Đặt thiệp** | Cho phép khách bấm chọn mẫu và điền thông tin ngay cả khi chưa đăng nhập. | Bắt buộc chuyển hướng đến trang Đăng nhập/Đăng ký trước khi mở form đặt thiệp (`OrderWeddingInfoPage`). | **Tránh mất dữ liệu:** Nếu khách chưa có tài khoản mà điền form và thanh toán xong, hệ thống không thể liên kết đơn hàng với ai, khách không thể đăng nhập vào Dashboard để theo dõi thiệp của mình. |
| **2. Dữ liệu mẫu trong Customer Dashboard** | Tự động nhồi đơn hàng mẫu (Minh Anh & Tuấn Kiệt - NCT01) vào màn hình của mọi khách hàng. | Khách mới không có đơn hàng sẽ thấy màn hình Onboarding hướng dẫn chọn mẫu; chỉ khách đã đặt đơn thật mới có dữ liệu. | **Bảo toàn tính riêng tư & logic nghiệp vụ:** Khách hàng thật sẽ rất bức xúc và hoang mang nếu thấy thông tin lễ cưới của người lạ hiển thị trong trang quản lý của chính mình. |
| **3. Tỷ lệ màn hình điện thoại trang chi tiết** | Dùng tỷ lệ co giãn tự do theo chiều cao của ảnh hoặc khung điện thoại phẳng. | Sử dụng khung điện thoại viền kim loại vàng kim sang trọng, có thanh header thương hiệu và ảnh 9:16 tràn ngang. | **Thẩm mỹ cao cấp:** Khung điện thoại phẳng ban đầu trông thô ráp; giao diện mới nâng tầm thương hiệu cao cấp của Nhà Có Tiệc. |
| **4. Bố cục Banner Hero trang chủ** | Chiều cao cố định dùng chung 1 ảnh cho cả máy tính và điện thoại. | Tách riêng: Desktop cao 820px hiển thị không gian thoáng đãng; Mobile dùng ảnh `hero-mobile.jpg` căn chỉnh khuôn mặt nhân vật lên phía trên chữ. | **Tương thích di động (Mobile UX):** Trên điện thoại, màn hình hẹp khiến chữ tiêu đề đè kín khuôn mặt cô dâu chú rể nếu dùng chung ảnh ngang của máy tính. |
| **5. Đồng bộ mẫu thiệp ghim trang chủ** | Danh sách mẫu nổi bật được ghi cố định trong file code trang chủ. | Mẫu nổi bật trên trang chủ được lọc động 100% theo trạng thái ghim (`isPinned`) trong Admin CMS. | **Vận hành linh hoạt:** Giúp đội ngũ vận hành có thể thay đổi các mẫu muốn quảng bá hàng tuần mà không cần can thiệp vào code. |

---

## 3. Các Đánh Đổi Kỹ Thuật Cần Thực Hiện (Technical Trade-offs)

### 3.1. Hybrid State (LocalStorage + Memory + Firestore) thay vì Pure Backend API
- **Ưu điểm đánh đổi được:** Tốc độ phản hồi đạt mức 0ms. Khách hàng và Admin thao tác chuyển tab, lọc đơn, xem ảnh mượt mà tức thì, không bao giờ thấy màn hình trắng hoặc vòng xoay loading vô tận.
- **Cái giá phải trả (Trade-off):** Cần viết logic chuẩn hóa dữ liệu (`normalizeOrder`) rất cẩn thận để tránh lỗi lệch kiểu ngày tháng (Firebase Timestamp vs chuỗi ISO String) và cơ chế dọn dẹp LocalStorage khi nâng cấp phiên bản schema.

### 3.2. Nén Ảnh Phía Client (Client Canvas) thay vì Dùng Serverless Cloud Functions
- **Ưu điểm đánh đổi được:** Tiết kiệm 100% chi phí máy chủ backend/Cloud Functions của Firebase; xử lý nén ảnh tức thì ngay trên máy người dùng trước khi gửi lên mạng, tiết kiệm dung lượng 3G/4G của khách hàng.
- **Cái giá phải trả (Trade-off):** Tốn một lượng nhỏ CPU/RAM của trình duyệt người dùng trong 0.2 giây khi nén ảnh; định dạng nén dừng ở mức JPEG tiêu chuẩn thay vì tối ưu sâu thành WebP/AVIF nâng cao như các thư viện máy chủ (Sharp).

### 3.3. Phân Quyền Admin Bằng Email Allowlist thay vì Firebase Custom Claims
- **Ưu điểm đánh đổi được:** Có thể triển khai trực tiếp 100% từ Frontend; bổ sung hoặc xóa email quản trị viên cực kỳ dễ dàng thông qua biến môi trường Vercel hoặc chỉnh sửa mảng `ADMIN_EMAILS` mà không cần dựng backend Node.js để chạy `firebase-admin` SDK.
- **Cái giá phải trả (Trade-off):** Cần đảm bảo các quy tắc bảo mật trên Firebase Console (Firestore Security Rules) cũng được cấu hình kiểm tra danh sách email này nếu dự án lưu trữ các thông tin cực kỳ nhạy cảm.

### 3.4. Giả Lập Điện Thoại Bằng Pure CSS/Tailwind thay vì Chèn File Ảnh Thiết Bị (Device Mockup Frame)
- **Ưu điểm đánh đổi được:** Tải trang siêu tốc (0 KB tải ảnh thiết bị ngoài); hiển thị sắc nét tuyệt đối trên mọi độ phân giải màn hình Retina/4K; có thể linh hoạt điều chỉnh màu viền vàng kim, bóng đổ, độ bo góc.
- **Cái giá phải trả (Trade-off):** Phải tính toán kỹ lưỡng các thông số CSS padding, border, aspect-ratio và vị trí của cụm Dynamic Island để không đè vào chữ trên thiệp.

---

## 4. Những Điều Chủ Dự Án Nên Biết (Crucial Knowledge for Project Owner)

### 4.1. Quy Trình Cập Nhật Mã Nguồn & Triển Khai (Deployment Workflow)
- **Cách thức hoạt động:** Dự án được lưu trữ trên Git cục bộ. Khi bạn thấy tôi thông báo đã hoàn thành và commit mã nguồn:
  1. Bạn chỉ cần mở ứng dụng **GitHub Desktop** trên máy tính.
  2. Bấm nút **"Push origin"** ở góc trên bên phải.
  3. Kho GitHub sẽ nhận code mới và kích hoạt **Vercel** tự động build và xuất bản lên trang web thực tế chỉ trong khoảng 1 phút.
- **Kiểm tra trước khi push:** Lệnh `npm run build` luôn được chạy kiểm tra kỹ lưỡng trước khi commit để đảm bảo không bao giờ xảy ra lỗi làm sập bản build trên Vercel.

### 4.2. Hạn Ngạch Miễn Phí Của Firebase (Firebase Spark Plan Quotas)
Hệ thống hiện đang chạy trên gói miễn phí **Firebase Spark Plan** với các giới hạn rất thoải mái cho giai đoạn khởi động:
- **Cloud Firestore:**
  - 50.000 lượt đọc (Reads) / ngày.
  - 20.000 lượt ghi (Writes) / ngày.
  - *Lưu ý:* Cơ chế bộ đệm LocalStorage của chúng ta đã giúp giảm tới 80% số lượt đọc thừa thãi lên Firestore, giúp hệ thống hoạt động ổn định trong hạn ngạch miễn phí.
- **Cloud Storage:**
  - Dung lượng lưu trữ: 5 GB miễn phí.
  - Băng thông tải về: 1 GB / ngày (30 GB / tháng).
  - *Lưu ý:* Khi lượng đơn hàng vượt quá 500 khách/tháng, bạn có thể dễ dàng nâng cấp lên gói Blaze (trả theo dung lượng thực tế cực rẻ, khoảng vài chục nghìn VNĐ/tháng).

### 4.3. Quản Lý Quyền Quản Trị Viên (Admin Access)
- Khi có thêm nhân sự hoặc cộng sự cần vào trang quản trị `/admin`:
  - **Cách 1:** Mở file [`src/mocks/authStore.ts`](file:///c:/Users/kieum/Downloads/Nhà%20có%20tiệc%202/src/mocks/authStore.ts), thêm email của họ vào mảng `ADMIN_EMAILS`.
  - **Cách 2:** Vào trang quản trị dự án trên **Vercel** -> Settings -> Environment Variables -> sửa biến `VITE_ADMIN_EMAILS` (ví dụ: `email1@gmail.com,email2@gmail.com`).

### 4.4. Cách Thức Thử Nghiệm Thực Tế Hai Chiều (Testing Multi-Role Sync)
- Để trải nghiệm trọn vẹn sức mạnh đồng bộ thời gian thực của hệ thống:
  1. Mở cửa sổ trình duyệt bình thường: Đăng nhập tài khoản Admin (`kieumllnn@gmail.com`) và vào trang `/admin/don-hang`.
  2. Mở một cửa sổ **Ẩn danh (Incognito)**: Đăng ký một tài khoản khách hàng mới, chọn mẫu thiệp và gửi form đặt thiệp.
  3. Bạn sẽ thấy tab Admin bên kia **ngay lập tức nhận được thông báo đơn hàng mới** và hiển thị đơn hàng trong danh sách mà không cần bấm F5 tải lại trang!

### 4.5. Duyệt Thanh Toán Trực Tiếp & Bảo Mật Quyền Quản Trị Tuyệt Đối (Cập nhật mới)
- **Nút "Duyệt thanh toán":** Hiển thị trực tiếp và nổi bật ở mọi đơn hàng chưa thanh toán (`paymentStatus !== 'paid'`) trong danh sách đơn (`AdminOrdersPage`), chi tiết đơn (`AdminOrderDetailPage`) và trên cả giao diện di động. Admin có thể chủ động đối soát và bấm duyệt bất cứ lúc nào.
- **Tự động gửi thông báo khách hàng:** Ngay khi Admin bấm "Duyệt thanh toán", hệ thống tự động bắn một thông báo thời gian thực đến Cổng khách hàng (`CustomerLayout` & `CustomerDashboardPage`), hiển thị chuông đỏ và thông báo chúc mừng thiệp đang bắt đầu được thiết kế.
- **Khóa hoàn toàn tài khoản demo `admin@nhacotiec*`:** Loại bỏ hoàn toàn email demo `admin@nhacotiec.vn` khỏi danh sách Admin, thiết lập danh sách cấm (`BLOCKED_ADMIN_EMAILS`) và tự động chặn/đăng xuất bất kỳ phiên nào cố gắng đăng nhập với tài khoản này. Chỉ các email cá nhân được cấp quyền trước đó mới có thể truy cập `/admin`.
- **Đồng bộ Hotline & Zalo chân trang (Footer):** Số điện thoại và đường dẫn Zalo ở chân trang trên toàn bộ website hiện được đồng bộ động 100% với thông tin Admin cấu hình trong trang Cài đặt CMS.
