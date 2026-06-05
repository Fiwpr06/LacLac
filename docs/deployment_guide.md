# Hướng Dẫn Vận Hành & Triển Khai Hệ Thống Lắc Lắc (Production Deployment)

Tài liệu này hướng dẫn chi tiết quy trình triển khai toàn bộ hệ thống Lắc Lắc (LACLAC) lên môi trường Production thực tế với cấu hình:
1. **Database**: MongoDB Atlas (Cloud)
2. **Cache & Queue**: Redis ngoài (Cloud / Upstash / RedisLabs)
3. **Backend Microservices + API Gateway**: Triển khai trên máy chủ VPS riêng bằng Docker Compose.
4. **Frontend Web Client**: Deploy lên Vercel (Next.js).
5. **Mobile App**: Đóng gói tệp tin cài đặt `.apk` Android thông qua Expo Application Services (EAS).

---

## 🏢 1. Mô hình Kiến trúc Triển khai (Deployment Topology)

```text
[ VERCEL FRONTEND ]                [ EXPO MOBILE APP ]
        │                                  │
        │ (HTTPS /api/v1)                  │ (HTTPS /api/v1)
        └─────────────────┐                ┌───────────────┘
                          ▼                ▼
                  [ VPS: Nginx SSL (Port 443) ]
                          │
                          ▼ (Reverse Proxy)
                  [ docker-compose: Nginx Gateway (Port 3100) ]
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        ▼                 ▼                 ▼                 ▼
  [ auth-service ]  [ food-service ]  [ action-service ]  [ rec-service ]
        │                 │                 │                 │
        │                 │                 │                 │
        ├─────────────────┴─────────────────┼─────────────────┘
        ▼                                   ▼
[ MONGODB ATLAS (Cloud) ]           [ REDIS CLOUD / UPSTASH ]
```

---

## 🔌 2. Cấu hình MongoDB Atlas & Redis ngoài

### 2.1. Cấu hình MongoDB Atlas
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) và tạo một Cluster miễn phí hoặc trả phí.
2. Tại mục **Security > Network Access**, thêm địa chỉ **IP tĩnh của VPS** vào Whitelist. *(Để thuận tiện kiểm thử với Vercel, bạn có thể tạm thời cấu hình cho phép truy cập từ mọi nơi `0.0.0.0/0`)*.
3. Tại mục **Database Access**, tạo một User với quyền `Read and write to any database`.
4. Copy chuỗi kết nối (Connection String) dạng:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/Laclac?retryWrites=true&w=majority
   ```

### 2.2. Cấu hình Redis ngoài (Upstash / Redis Labs)
1. Truy cập [Upstash](https://upstash.com/) hoặc [Redis Labs](https://redislabs.com/) và tạo một database mới.
2. Copy chuỗi kết nối có mật khẩu bảo mật (hỗ trợ TLS/SSL nếu dùng Upstash):
   ```text
   rediss://default:mat_khau_redis@pleasant-cicada.upstash.io:6379
   ```
   *(Lưu ý: Upstash Redis sử dụng giao thức bảo mật `rediss://` với chữ **s** ở cuối, microservice NestJS của chúng ta đã hỗ trợ tự động giải mã giao thức này)*.

---

## 🖥️ 3. Triển khai Backend và API Gateway trên VPS

### 3.1. Chuẩn bị VPS
1. Cài đặt các gói phần mềm cần thiết: **Docker**, **Docker Compose** và **Git**.
2. Mở các cổng mạng trên tường lửa của VPS:
   * **80** (HTTP) và **443** (HTTPS) cho kết nối người dùng.
   * **3100** (nếu muốn debug trực tiếp cổng Nginx Gateway container).

### 3.2. Cấu hình File Môi trường `.env` trên VPS
Tạo file `.env` tại thư mục gốc của dự án trên VPS với nội dung cấu hình sản xuất như sau:

```env
# Node Environment
NODE_ENV=production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://LacLac:laclac123@cluster0.3qcejvd.mongodb.net/Laclac?retryWrites=true&w=majority

# Cache & Queue (Redis ngoài)
REDIS_URL=rediss://default:mat_khau_redis@pleasant-cicada.upstash.io:6379

# Auth Secrets
JWT_SECRET=bab2fd9be8d96483a6108216fa01f818a63ea699da7d792b72c6c259df849fb1
JWT_REFRESH_SECRET=e9bff887a95d35f74c49dca3d3eab89ca6109510750dcc255265e2a79445982c
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=dwob9c2dv
CLOUDINARY_API_KEY=314943263466562
CLOUDINARY_API_SECRET=6jMyEYjxaAXQotg-OMIZh8wSJKU

# Services Ports (Nội bộ Docker)
PORT=3000
AUTH_SERVICE_PORT=3001
FOOD_SERVICE_PORT=3002
ACTION_SERVICE_PORT=3003
REC_SERVICE_PORT=3004
MEDIA_SERVICE_PORT=3005

# Nginx Gateway Port (Ánh xạ ra ngoài VPS)
GATEWAY_PORT=3100

# CORS Cho phép các frontend kết nối (Bắt buộc phải điền domain Vercel sau khi tạo)
CORS_ORIGINS=https://laclac-web.vercel.app,http://localhost:3000,http://localhost:3101,http://localhost:8081
```

### 3.3. Đóng gói & Khởi chạy Backend bằng Docker Compose
Tạo file `docker-compose.prod.yml` chỉ chạy các NestJS microservices và Nginx Gateway (không chạy mongodb và redis cục bộ nữa vì đã dùng Atlas và Redis ngoài):

```yaml
version: '3.8'

services:
  rabbitmq:
    image: rabbitmq:3-alpine
    container_name: laclac-rabbitmq
    restart: unless-stopped
    ports:
      - '5672:5672'
    volumes:
      - rabbitmq_prod_data:/var/lib/rabbitmq
    networks:
      - laclac-net

  auth-service:
    build:
      context: ./
      dockerfile: services/auth-service/Dockerfile
    container_name: laclac-auth-service
    env_file:
      - .env
    environment:
      PORT: 3001
      SERVICE_NAME: auth-service
      RABBITMQ_URL: amqp://rabbitmq:5672
    depends_on:
      - rabbitmq
    networks:
      - laclac-net

  food-service:
    build:
      context: ./
      dockerfile: services/food-service/Dockerfile
    container_name: laclac-food-service
    env_file:
      - .env
    environment:
      PORT: 3002
      SERVICE_NAME: food-service
    networks:
      - laclac-net

  action-service:
    build:
      context: ./
      dockerfile: services/action-service/Dockerfile
    container_name: laclac-action-service
    env_file:
      - .env
    environment:
      PORT: 3003
      SERVICE_NAME: action-service
      RABBITMQ_URL: amqp://rabbitmq:5672
    depends_on:
      - rabbitmq
    networks:
      - laclac-net

  rec-service:
    build:
      context: ./
      dockerfile: services/rec-service/Dockerfile
    container_name: laclac-rec-service
    env_file:
      - .env
    environment:
      PORT: 3004
      SERVICE_NAME: rec-service
    networks:
      - laclac-net

  media-service:
    build:
      context: ./
      dockerfile: services/media-service/Dockerfile
    container_name: laclac-media-service
    env_file:
      - .env
    environment:
      PORT: 3005
      SERVICE_NAME: media-service
    networks:
      - laclac-net

  nginx:
    image: nginx:1.27-alpine
    container_name: laclac-nginx
    restart: unless-stopped
    ports:
      - '3100:80'
    volumes:
      - ./infra/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - auth-service
      - food-service
      - action-service
      - rec-service
      - media-service
    networks:
      - laclac-net

networks:
  laclac-net:
    driver: bridge

volumes:
  rabbitmq_prod_data:
```

Chạy lệnh để build và khởi động tất cả microservices dưới dạng tiến trình nền:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### 3.4. Cấu hình HTTPS và SSL Let's Encrypt cho Gateway (Tùy chọn khuyến nghị)
Để đảm bảo bảo mật và được trình duyệt/app di động chấp nhận kết nối HTTPS, bạn nên cấu hình reverse proxy ngoài trên VPS (sử dụng Nginx độc lập hoặc Certbot):

1. Trỏ tên miền phụ của bạn (Ví dụ: `api.laclac.com`) về địa chỉ IP của VPS.
2. Cài đặt Certbot để lấy chứng chỉ SSL miễn phí:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.laclac.com
   ```
3. Cấu hình Nginx bên ngoài VPS để proxy các yêu cầu HTTPS từ cổng `443` về cổng `3100` của docker gateway:
   ```nginx
   server {
       server_name api.laclac.com;
       listen 443 ssl;
       
       # (Được tự động thêm bởi Certbot)
       ssl_certificate /etc/letsencrypt/live/api.laclac.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.laclac.com/privkey.pem;

       location / {
           proxy_pass http://127.0.0.1:3100;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Restart Nginx VPS: `sudo systemctl restart nginx`. Giờ đây API của bạn có thể truy cập an toàn tại: `https://api.laclac.com/api/v1`

---

## 🌐 4. Triển khai Frontend (Web Client) lên Vercel

Vercel hỗ trợ rất tốt các dự án Monorepo/Turborepo. Bạn thực hiện các bước sau:

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/) bằng tài khoản GitHub chứa mã nguồn dự án.
2. Nhấn **Add New > Project**, chọn kho lưu trữ chứa mã nguồn Lắc Lắc.
3. Cấu hình Project:
   * **Framework Preset**: Chọn `Next.js`.
   * **Root Directory**: Chọn thư mục `apps/web`.
   * **Build and Development Settings**: Giữ mặc định (Vercel sẽ tự nhận diện Turborepo và chạy lệnh build tối ưu).
4. Thêm các biến môi trường (**Environment Variables**) tại Vercel Dashboard:
   * `NEXT_PUBLIC_API_URL` = `https://api.api.laclac.com/api/v1` *(Domain API Gateway của bạn)*
   * `NEXT_PUBLIC_FOOD_API_URL` = `https://api.api.laclac.com/api/v1`
   * `NEXT_PUBLIC_ACTION_API_URL` = `https://api.api.laclac.com/api/v1`
   * `NEXT_PUBLIC_APK_URL` = *(Link tải file APK sau khi bạn build thành công)*
5. Nhấn **Deploy**. Sau khi deploy hoàn tất, Vercel sẽ cung cấp cho bạn một domain dạng `https://laclac-web.vercel.app`.
6. **BẮT BUỘC**: Copy domain này trỏ ngược lại vào biến `CORS_ORIGINS` trong file `.env` trên VPS để backend cho phép Web Client gửi API đăng ký/đăng nhập.

---

## 📱 5. Đóng gói Ứng dụng Di động (Android APK) bằng Expo EAS

Để đóng gói file cài đặt `.apk` cài trực tiếp lên điện thoại Android thay vì tệp `.aab` gửi lên Google Play, chúng ta sử dụng **Expo Application Services (EAS)**:

### 5.1. Cấu hình API Endpoint cho Mobile
Mở tệp tin `apps/mobile/.env` và cập nhật thông tin API sản xuất:
```env
EXPO_PUBLIC_API_URL=https://api.laclac.com/api/v1
EXPO_PUBLIC_FOOD_API_URL=https://api.laclac.com/api/v1
EXPO_PUBLIC_ACTION_API_URL=https://api.laclac.com/api/v1
EXPO_PUBLIC_APP_SCHEME=laclac
EXPO_OFFLINE=0
```

### 5.2. Cấu hình EAS Build Profile (`apps/mobile/eas.json`)
Đảm bảo tệp tin `eas.json` của bạn có cấu hình profile `preview` để trả về định dạng tệp cài đặt `.apk` trực tiếp:

```json
{
  "cli": {
    "version": ">= 9.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 5.3. Tiến hành Build APK
Mở terminal trên máy cá nhân và thực hiện quy trình đóng gói:

1. Di chuyển vào thư mục mobile:
   *(Lưu ý: Không dùng lệnh cd trong terminal model, hãy thao tác trên terminal của bạn)*
2. Cài đặt công cụ dòng lệnh EAS:
   ```bash
   npm install -g eas-cli
   ```
3. Đăng nhập vào tài khoản Expo của bạn:
   ```bash
   eas login
   ```
4. Liên kết dự án với Expo Dashboard (nếu chưa):
   ```bash
   eas project:init
   ```
5. Chạy lệnh build file APK:
   ```bash
   eas build --platform android --profile preview
   ```
6. **Kết quả**: Sau khi quá trình build trên máy chủ Expo hoàn tất (mất khoảng 5-10 phút), Expo sẽ trả về một đường dẫn tải xuống file `.apk`. Bạn có thể tải file này về, đổi tên thành `laclac.apk` và lưu trữ lên VPS hoặc liên kết vào nút tải xuống trên Vercel Frontend để người dùng cài đặt dễ dàng!
