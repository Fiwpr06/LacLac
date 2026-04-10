# Các lệnh khởi chạy dự án Lắc Lắc

## 1. Khởi chạy Backend Services và Hạ tầng

Dự án được cấu trúc theo hệ thống Microservices. Bạn có thể khởi chạy tất cả các dịch vụ (Auth, Food, Action, Recommendation, Media) và các thành phần hạ tầng (Database, Cache) bằng Docker Compose:

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

Hay:

```bash
corepack pnpm turbo run dev --filter=auth-service --filter=food-service --filter=action-service --filter=rec-service --filter=media-service
```

Hoặc nếu muốn tắt hệ thống:

```bash
docker compose -f infra/docker-compose.dev.yml down
```

## 2. Khởi chạy từng giao diện (Frontend / Mobile / Admin)

**Chạy Web App (Dành cho người dùng cuối):**

```bash
corepack pnpm --filter web-app dev
```

**Chạy Mobile App (Ứng dụng di động - Expo):**

```bash
corepack pnpm --filter mobile-app dev
```

**Chạy Admin Dashboard (Quản trị viên):**

```bash
corepack pnpm --filter admin-app dev
```

## 3. Lệnh chạy tổng hợp (Monorepo Turborepo)

Nếu `package.json` gốc đã được cấu hình các lệnh Turbo, bạn có thể chạy song song toàn bộ các dịch vụ và giao diện bằng:

```bash
pnpm dev
```

_(Lệnh này sẽ kích hoạt script `dev` trong turbo.json cho tất cả các packages/apps)_
