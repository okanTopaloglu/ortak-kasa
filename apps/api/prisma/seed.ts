import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';

async function main() {
  const dbPath = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Seed başlıyor...');

  await prisma.transaction.deleteMany();
  await prisma.branchPartner.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userCompany.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('demo1234', 10);

  const ahmet = await prisma.user.create({
    data: {
      email: 'ahmet@ortakkasa.com',
      password: hashedPassword,
      name: 'Ahmet Yılmaz',
    },
  });

  const okan = await prisma.user.create({
    data: {
      email: 'okan@ortakkasa.com',
      password: hashedPassword,
      name: 'Okan Demir',
    },
  });

  const cagatay = await prisma.user.create({
    data: {
      email: 'cagatay@ortakkasa.com',
      password: hashedPassword,
      name: 'Çağatay Kaya',
    },
  });

  console.log('✓ 3 kullanıcı oluşturuldu');

  const company = await prisma.company.create({
    data: {
      name: 'Ortak İşler Ltd.',
      slug: 'ortak-isler-' + Date.now(),
      userCompanies: {
        create: [
          { userId: ahmet.id, role: 'ADMIN' },
          { userId: okan.id, role: 'ORTAK' },
          { userId: cagatay.id, role: 'KULLANICI' },
        ],
      },
    },
  });

  console.log('✓ Şirket oluşturuldu:', company.name);

  await prisma.account.createMany({
    data: [
      { companyId: company.id, name: 'Kasa', type: 'NAKIT' },
      { companyId: company.id, name: 'Garanti Banka', type: 'BANKA_HESABI' },
      { companyId: company.id, name: 'İş Kredi Kartı', type: 'KREDI_KARTI' },
    ],
  });
  console.log('✓ 3 hesap/kart oluşturuldu');

  const kurye = await prisma.branch.create({
    data: { companyId: company.id, name: 'Kurye' },
  });

  const nakliye = await prisma.branch.create({
    data: { companyId: company.id, name: 'Nakliye' },
  });

  const eTicaret = await prisma.branch.create({
    data: { companyId: company.id, name: 'E-ticaret' },
  });

  const yazilim = await prisma.branch.create({
    data: { companyId: company.id, name: 'Yazılım' },
  });

  console.log('✓ 4 iş kolu oluşturuldu');

  await prisma.branchPartner.createMany({
    data: [
      { branchId: kurye.id, userId: ahmet.id, percentage: 50 },
      { branchId: kurye.id, userId: okan.id, percentage: 50 },
    ],
  });

  await prisma.branchPartner.createMany({
    data: [
      { branchId: nakliye.id, userId: ahmet.id, percentage: 30 },
      { branchId: nakliye.id, userId: okan.id, percentage: 30 },
      { branchId: nakliye.id, userId: cagatay.id, percentage: 40 },
    ],
  });

  await prisma.branchPartner.createMany({
    data: [{ branchId: eTicaret.id, userId: ahmet.id, percentage: 100 }],
  });

  await prisma.branchPartner.createMany({
    data: [
      { branchId: yazilim.id, userId: ahmet.id, percentage: 60 },
      { branchId: yazilim.id, userId: okan.id, percentage: 40 },
    ],
  });

  console.log('✓ Ortak dağılımları ayarlandı');

  const now = new Date();
  const branches = [kurye, nakliye, eTicaret, yazilim];
  const branchNames = ['Kurye', 'Nakliye', 'E-ticaret', 'Yazılım'];

  const transactions: Array<{
    branchId: string;
    amount: number;
    description: string;
    date: Date;
    type: 'GELIR' | 'GIDER';
  }> = [];

  for (let m = 0; m < 3; m++) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
    for (let b = 0; b < branches.length; b++) {
      const branch = branches[b];
      const name = branchNames[b];
      transactions.push(
        { branchId: branch.id, amount: 15000 + b * 3000 + m * 2000, description: `${name} - Aylık gelir`, date: new Date(month), type: 'GELIR' },
        { branchId: branch.id, amount: 5000 + b * 1000, description: `${name} - Yakıt gideri`, date: new Date(month.getFullYear(), month.getMonth(), 5), type: 'GIDER' },
        { branchId: branch.id, amount: 2000 + m * 500, description: `${name} - Bakım`, date: new Date(month.getFullYear(), month.getMonth(), 15), type: 'GIDER' }
      );
    }
  }

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        branchId: tx.branchId,
        amount: tx.amount,
        description: tx.description,
        date: tx.date,
        type: tx.type,
      },
    });
  }

  console.log(`✓ ${transactions.length} örnek işlem oluşturuldu`);

  console.log('\n📋 Demo Giriş Bilgileri:');
  console.log('─────────────────────────');
  console.log('Email: ahmet@ortakkasa.com');
  console.log('Şifre: demo1234');
  console.log('─────────────────────────');
  console.log('\n✅ Seed tamamlandı!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
