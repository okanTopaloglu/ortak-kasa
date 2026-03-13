'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { companies } from '@/lib/api';

export default function DashboardPage() {
  const [companyList, setCompanyList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companies
      .list()
      .then((res) => setCompanyList(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>;
  }

  if (companyList.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Henüz şirket yok</h2>
        <p className="text-muted-foreground mb-4">
          Başlamak için bir şirket oluşturun veya mevcut bir şirkete davet edilin.
        </p>
        <Link href="/dashboard/companies/new">
          <span className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Şirket Oluştur
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Şirketlerim</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companyList.map((company) => (
          <Link
            key={company.id}
            href={`/dashboard/companies/${company.id}`}
            className="block p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition"
          >
            <h3 className="font-semibold text-lg">{company.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Dashboard&apos;a git →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
