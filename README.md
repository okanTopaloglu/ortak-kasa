# OrtakKasa

Küçük işletmeler ve ortaklı iş yapan kişiler için gelir-gider takibi ve kar paylaşımı yönetim sistemi.

## Teknoloji Stack

- **Frontend:** Next.js, Tailwind CSS, Shadcn UI
- **Backend:** NestJS, REST API
- **Veritabanı:** PostgreSQL, Prisma ORM
- **Cache:** Redis
- **Auth:** JWT

## Geliştirme

### Gereksinimler

- Node.js 18+
- Docker & Docker Compose (opsiyonel, yerel PostgreSQL/Redis için)
- pnpm veya npm

### Kurulum

1. Bağımlılıkları yükle:
```bash
npm install
```

2. Ortam değişkenlerini ayarla:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# .env dosyalarını düzenle (DATABASE_URL, JWT_SECRET vb.)
```

3. Veritabanı için Docker kullanıyorsanız:
```bash
npm run docker:up
```

4. Prisma migration çalıştır:
```bash
cd apps/api && npx prisma migrate dev
# veya: npm run db:migrate (root'tan)
```

5. Geliştirme sunucularını başlat:
```bash
npm run dev
```

- API: http://localhost:3001
- Web: http://localhost:3000

### Scriptler

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | API ve Web birlikte çalıştır |
| `npm run dev:api` | Sadece API |
| `npm run dev:web` | Sadece Web |
| `npm run build` | Tüm projeleri derle |
| `npm run db:migrate` | Prisma migration |
| `npm run db:studio` | Prisma Studio |
| `npm run docker:up` | Docker Compose başlat |

## Proje Yapısı

```
ortak-kasa/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Ortak tipler
├── docker/
│   └── nginx/        # Nginx konfigürasyonu
├── docker-compose.yml
└── .env.example
```
