# Demo Veriler

## Ön gereksinimler

- PostgreSQL çalışıyor olmalı (localhost:5432)
- Migration uygulanmış olmalı: `npm run db:migrate`

## Seed çalıştırma

```bash
cd apps/api
npm run prisma:seed
```

Veya root'tan:
```bash
npm run db:seed
```

## Demo Giriş Bilgileri

| Kullanıcı | Email | Şifre | Rol |
|-----------|-------|-------|-----|
| Ahmet Yılmaz | ahmet@ortakkasa.com | demo1234 | Admin |
| Okan Demir | okan@ortakkasa.com | demo1234 | Ortak |
| Çağatay Kaya | cagatay@ortakkasa.com | demo1234 | Kullanıcı |

## Oluşturulan Veriler

- **Şirket:** Ortak İşler Ltd.
- **İş kolları:** Kurye, Nakliye, E-ticaret, Yazılım
- **Ortak dağılımı:**
  - Kurye: Ahmet %50, Okan %50
  - Nakliye: Ahmet %30, Okan %30, Çağatay %40
  - E-ticaret: Ahmet %100
  - Yazılım: Ahmet %60, Okan %40
- **İşlemler:** Son 3 aya ait örnek gelir/gider kayıtları
