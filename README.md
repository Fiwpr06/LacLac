# Lắc Lắc - "Lắc một cái, ra món ngay"

Lắc Lắc là một hệ sinh thái ứng dụng đa nền tảng (Web App, Mobile App, Admin Dashboard) giúp định hướng người dùng giải quyết bài toán đau đầu mỗi ngày: **"Hôm nay ăn gì?"** một cách nhanh chóng, thú vị và tự nhiên. 

Dự án mang đến trải nghiệm **"Lắc" (Shake)** thiết bị trực quan và thao tác **"Quẹt" (Swipe)** thẻ món ăn để đề xuất món ngon phù hợp với ngân sách, bữa ăn và khẩu vị của bạn trong vòng vài giây mà không cần thao tác phức tạp.

---

## 📌 Định Hướng Phát Triển (Bản v1)

*   **Không sử dụng GPS hay Bản đồ:** Giữ cho luồng trải nghiệm đơn giản và riêng tư. Người dùng chỉ cần lọc món ăn theo sở thích mà không bị phân tâm bởi yếu tố vị trí địa lý.
*   **Kiến trúc Microservices & Monorepo:** Tận dụng công nghệ hiện đại giúp đảm bảo tính linh hoạt, khả năng tái sử dụng mã nguồn cao và dễ dàng mở rộng theo chiều ngang (Horizontal Scaling).
*   **Thu thập dữ liệu làm tiền đề cho AI (v3):** Chưa vội tích hợp các mô hình AI phức tạp ở v1. Thay vào đó, hệ thống tập trung hoàn thiện core (Backend logic, Mobile/Web UI mượt mà) và ghi nhận toàn bộ lịch sử tương tác của người dùng (`user_actions`) để làm dữ liệu huấn luyện (training data) cho AI Recommendation Engine ở bản v3.
*   **Thương hiệu Nhận diện Đồng nhất:** Hệ thống nhận diện thương hiệu Lắc Lắc (với tone màu chủ đạo Đỏ Cam rực rỡ) xuyên suốt từ giao diện Landing Page, Web App, Mobile App đến Admin Dashboard.

---

## 🏗️ Sơ Đồ Kiến Trúc Hệ Thống

Dự án được quản lý dưới dạng **Monorepo** sử dụng **Turborepo** và **pnpm workspace** để tối ưu hóa thời gian build và chia sẻ thư viện dùng chung.

```text
lac-lac/
├── apps/
│   ├── mobile/          # Mobile App (React Native + Expo Router) - Chế độ lắc & quẹt món
│   ├── web/             # Landing Page & Web App (Next.js 14 App Router) - Fix Hydration, tối ưu SEO
│   └── admin/           # Admin Dashboard (Next.js 14) - Quản lý món ăn, danh mục, calo
├── services/
│   ├── auth-service/    # NestJS - Quản lý định danh, JWT Authentication, Refresh Token
│   ├── food-service/    # NestJS - API chính về món ăn, danh mục, gợi ý ngữ cảnh, seed data
│   ├── action-service/  # NestJS - Xử lý không đồng bộ (via BullMQ) tương tác quẹt, yêu thích, đánh giá
│   ├── rec-service/     # NestJS - Đề xuất món ăn thịnh hành (Trending) và cá nhân hóa
│   └── media-service/   # NestJS - Tải ảnh từ xa, upload ảnh lên Cloudinary với fallback mock mode
├── packages/
│   ├── shared-types/    # Thư viện TypeScript Types & Interfaces dùng chung cho Backend và Frontend
│   ├── ui-kit/          # Thư viện React Native/Web UI components dùng chung
│   └── api-client/      # SDK gọi API thống nhất giữa các app
├── infra/
│   ├── docker-compose.yml       # Docker Compose chạy toàn bộ services & Nginx Gateway ở production
│   ├── docker-compose.dev.yml   # Docker Compose chạy nhanh hạ tầng local (MongoDB, Redis)
│   └── nginx.conf               # Cấu hình Reverse Proxy cho Gateway phân tuyến API /api/v1
└── postman/
    └── lac-lac.postman_collection.json  # Bộ sưu tập API test trên Postman
```

---

## 🌟 Chi Tiết Các Tính Năng Đã Hoàn Thiện

### 1. Mobile App (React Native/Expo)
*   **Swipe Mode:** Giao diện thẻ quẹt trực quan (vuốt trái để bỏ qua, vuốt phải để lưu món yêu thích).
*   **List Mode & Toggle:** Chuyển đổi linh hoạt giữa chế độ Quẹt thẻ sinh động và chế độ Xem danh sách truyền thống.
*   **Localization:** Hiển thị dữ liệu đa ngôn ngữ chuẩn xác (Việt / Anh).
*   **Thông tin Món ăn Chi tiết:** Xem công thức (recipes) từng bước, lượng calo, độ khó và các chất dinh dưỡng đi kèm.
*   **Build-ready:** Hỗ trợ cấu hình môi trường preview/production sẵn sàng cho việc đóng gói APK trực tiếp.

### 2. Web App (Next.js 14)
*   **Tối ưu hóa SEO & Hydration**: Tốc độ tải trang cực nhanh, tối ưu hóa thẻ Meta OpenGraph, sửa đổi hoàn toàn lỗi React Hydration Mismatch.
*   **Trang Download ứng dụng (/download) cao cấp**:
    *   Thiết kế phong cách **Glassmorphism** kính mờ sang trọng kèm lưới background SVG và các đốm sáng gradient rực rỡ.
    *   Tích hợp mô hình điện thoại **iPhone 15 Pro sống động** hiển thị giao diện app thật với ảnh món ăn chất lượng cao lấy từ Cloudinary.
    *   Thẻ tải thông minh (`DownloadCard`) tự động thay đổi giao diện theo tab (Android APK có QR Code tải trực tiếp và hướng dẫn cài đặt; Web App có link mở nhanh).
    *   Lưới hiển thị 4 tính năng lõi (Quẹt, Lắc, Công thức, Calo) trực quan.

### 3. Admin App (Next.js)
*   Quản lý danh sách món ăn, danh mục ẩm thực, thiết lập calories, nguyên liệu, công thức chế biến.
*   Hỗ trợ upload ảnh trực tiếp lên Cloudinary với cơ chế chịu lỗi tự động (mock mode trả về link gốc nếu chưa cấu hình Cloudinary).

### 4. Dịch vụ Backend (Microservices)
*   **auth-service:** Đăng ký, đăng nhập, cấp và thu hồi JWT / Refresh Token.
*   **food-service:** API lấy danh sách, chi tiết món ăn, lấy món ngẫu nhiên (`/foods/random`), gợi ý theo ngữ cảnh (`/foods/context` - rule-based).
*   **action-service:** Sử dụng queue hàng đợi **BullMQ** để xử lý không đồng bộ các hành vi quẹt món, yêu thích, đánh giá để UI không bị nghẽn. Có Cron Job tự động tính điểm thịnh hành (`popularityScore`) mỗi giờ dựa trên lượt quẹt phải, xem chi tiết và yêu thích.
*   **media-service:** Tải ảnh từ xa và upload lên Cloudinary.

---

## 💾 Quản Lý Dữ Liệu & Tự Động Cập Nhật Ảnh Món Ăn

Hệ thống sở hữu bộ dữ liệu món ăn đặc sắc được chuẩn hóa và nâng cấp toàn diện:

### 1. Seed dữ liệu 423 món ăn (Đặc sản Đà Nẵng & Việt Nam)
Bộ dữ liệu seed được mở rộng lên **423 món ăn** (bao gồm 119 món ăn truyền thống ban đầu và 304 món ăn đặc sản miền Trung/Đà Nẵng được chuẩn hóa từ tài liệu PDF). Để seed dữ liệu vào database MongoDB:
```bash
corepack pnpm --filter food-service seed
```
*(Lưu ý: Lệnh seed sẽ reset toàn bộ danh mục và nạp lại thông tin gốc của 423 món ăn vào MongoDB).*

### 2. Script cào ảnh tự động và upload Cloudinary
Script `backfill-food-images.ts` tự động quét các món ăn chưa có ảnh trong database để tải và cập nhật ảnh chất lượng cao:
*   **Tìm kiếm thông minh**: Sử dụng **DuckDuckGo Images API** làm backend tìm kiếm (lấy dữ liệu từ Bing Search) để tránh bị Google chặn bot.
*   **Lọc ảnh rác khắt khe**: Loại bỏ các ảnh từ Wikipedia/Wikimedia; bỏ qua ảnh chứa từ khóa `logo`, `banner`, `menu`, `giá`, v.v.; lọc kích thước ảnh tối thiểu `500x400` và tỷ lệ khung hình chuẩn từ `0.7` đến `1.8` để đảm bảo chất lượng hình ảnh thực tế tốt nhất.
*   **Upload & Đồng bộ**: Tải ảnh về Buffer hệ thống, upload lên thư mục `lac-lac/foods` trên Cloudinary với tên slug tương ứng, cập nhật link public an toàn vào MongoDB.
*   **Cách chạy script cập nhật ảnh**:
    ```bash
    # Chạy thực tế (Tải ảnh, upload Cloudinary thật và lưu MongoDB)
    corepack pnpm --filter food-service seed:images
    
    # Chạy thử nghiệm Dry Run (Chỉ tìm và tải thử ảnh, không ghi đè DB, không upload thật)
    # CMD (Windows):
    set DRY_RUN=true&& pnpm --filter food-service seed:images
    # PowerShell (Windows):
    $env:DRY_RUN="true"; pnpm --filter food-service seed:images
    ```

---

## ⚙️ Yêu Cầu Môi Trường

*   **Node.js**: Phiên bản 20 LTS (hoặc 22 LTS)
*   **pnpm**: Phiên bản 9 trở lên (khuyến nghị cài đặt qua Corepack)
*   **Docker & Docker Compose** (để chạy nhanh hoặc đóng gói container production)
*   **MongoDB 7**, **Redis 7** (nếu chạy local không qua Docker)

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### 1. Khởi tạo dự án và cài đặt
Kích hoạt corepack và cài đặt toàn bộ dependencies trong monorepo:
```bash
corepack enable
corepack pnpm install
```

### 2. Thiết lập biến môi trường
Tạo file `.env` ở thư mục gốc của dự án từ file example:
```bash
cp .env.example .env
```
Cập nhật các giá trị cấu hình thực tế trong file `.env`:
*   `MONGODB_URI`: Đường dẫn kết nối MongoDB.
*   `REDIS_URL`: Đường dẫn kết nối Redis.
*   `JWT_SECRET` / `JWT_REFRESH_SECRET`: Khóa bảo mật token.
*   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cấu hình Cloudinary để lưu trữ ảnh món ăn thật.

---

### 3. Cách chạy ứng dụng

#### 👉 Cách 3.1: Chạy bằng Docker (Khuyến nghị chạy nhanh toàn bộ)
Tất cả 5 services backend cùng cổng Gateway Nginx Reverse Proxy sẽ được khởi tạo trong container:
```bash
cd infra
docker compose up --build
```
*   **Cổng API Gateway Nginx mặc định**: `http://localhost:3100` (hoặc cổng cấu hình qua `GATEWAY_PORT` trong `.env`).

#### 👉 Cách 3.2: Chạy local các service và app (Dành cho việc Phát triển/Dev)
Cách này giúp bạn thay đổi code và thấy kết quả ngay lập tức nhờ cơ chế hot-reload:

1.  **Chạy MongoDB & Redis bằng Docker ở nền**:
    ```bash
    cd infra
    docker compose -f docker-compose.dev.yml up -d
    ```
2.  **Chạy toàn bộ dịch vụ Backend cục bộ**:
    ```bash
    corepack pnpm dev
    ```
    *(Lệnh này sẽ khởi chạy song song 5 services backend: auth, food, action, rec, media).*
3.  **Khởi chạy từng ứng dụng Frontend**:
    *   *Web App (Next.js)*: `corepack pnpm --filter web-app dev` (hoặc chạy nhanh bằng `corepack pnpm dev:web`) -> Mở `http://localhost:3101`
    *   *Admin App (Next.js)*: `corepack pnpm --filter admin-app dev` -> Mở `http://localhost:3102`
    *   *Mobile App (React Native)*: Đọc tiếp phần cấu hình bên dưới.

---

### 📱 Hướng Dẫn Cấu Hình và Chạy Mobile App Local

Do ứng dụng di động chạy trên thiết bị thật (qua Expo Go) hoặc trình giả lập, bạn cần cấu hình để ứng dụng kết nối đúng với các API Service local đang chạy trên máy tính.

#### 1. Cấu hình file `apps/mobile/.env`
Mở file `apps/mobile/.env` (tạo mới nếu chưa có) và cấu hình chính xác địa chỉ IP máy tính local của bạn trong mạng Wifi nội bộ kèm cổng port tương ứng:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:3002/api/v1
EXPO_PUBLIC_FOOD_API_URL=http://192.168.1.5:3002/api/v1
EXPO_PUBLIC_ACTION_API_URL=http://192.168.1.5:3003/api/v1

EXPO_PUBLIC_APP_SCHEME=laclac
EXPO_OFFLINE=1
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.5
```
*(Hãy kiểm tra IP local của máy tính bằng lệnh `ipconfig` trên Windows và thay thế `192.168.1.5` bằng IP thật của bạn).*

#### 2. Khắc phục lỗi Expo CLI `TypeError: Body is unusable`
Nếu gặp lỗi `Body has already been read` khi chạy `expo start` do xung đột `fetch` của Node.js, bạn cần khởi chạy Metro Bundler ở **chế độ Offline** bằng cách đặt biến môi trường `EXPO_OFFLINE=1`.

*   **Khởi chạy Mobile App cùng các Service Backend đi kèm:**
    *   CMD (Windows): `set EXPO_OFFLINE=1&& pnpm dev:mobile`
    *   PowerShell (Windows): `$env:EXPO_OFFLINE=1; pnpm dev:mobile`
*   **Chỉ khởi chạy riêng ứng dụng Mobile:**
    *   CMD: `set EXPO_OFFLINE=1&& pnpm --filter mobile-app dev`
    *   PowerShell: `$env:EXPO_OFFLINE=1; pnpm --filter mobile-app dev`

Khi Metro Bundler chạy, quét mã QR hiển thị trên màn hình bằng ứng dụng **Expo Go** trên điện thoại để bắt đầu trải nghiệm!

---

## 🛠️ Một Số Lệnh Build và Quản Trị Khác

*   **Kiểm tra lỗi TypeScript & Build nhanh tất cả các package**:
    ```bash
    corepack pnpm build
    ```
*   **Biên dịch riêng dịch vụ Web App**:
    ```bash
    corepack pnpm --filter web-app build
    ```
*   **Địa chỉ tài liệu Swagger API khi chạy local**:
    *   Dịch vụ Auth: `http://localhost:3001/api/docs/auth`
    *   Dịch vụ Food: `http://localhost:3002/api/docs/food`
    *   Dịch vụ Action: `http://localhost:3003/api/docs/action`
    *   Dịch vụ Media: `http://localhost:3005/api/docs/media`

---

## 📄 Bản Quyền & Giấy Phép

Copyright © 2024 Lắc Lắc. All rights reserved.

Mã nguồn dự án thuộc quyền sở hữu riêng của Lắc Lắc. Nghiêm cấm mọi hành vi sao chép, chỉnh sửa, phát tán hoặc sử dụng trái phép mã nguồn này khi chưa có sự đồng ý bằng văn bản từ tác giả.
