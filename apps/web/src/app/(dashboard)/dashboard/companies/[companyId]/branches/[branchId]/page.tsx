'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { transactions, partners } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function BranchDetailPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const branchId = params.branchId as string;
  const router = useRouter();
  const [txList, setTxList] = useState<
    { id: string; amount: string; description: string | null; date: string; type: string }[]
  >([]);
  const [partnerList, setPartnerList] = useState<
    { id: string; percentage: string; user: { name: string; email: string } }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!branchId) return;
    Promise.all([
      transactions.list(branchId),
      partners.list(branchId),
    ])
      .then(([txRes, partnerRes]) => {
        setTxList(txRes.data);
        setPartnerList(partnerRes.data);
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [branchId, router]);

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/companies/${companyId}/branches`}>
          <Button variant="ghost" size="sm">← Geri</Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/companies/${companyId}/branches/${branchId}/transactions`}>
            <Button>Gelir/Gider</Button>
          </Link>
          <Link href={`/dashboard/companies/${companyId}/branches/${branchId}/partners`}>
            <Button variant="outline">Ortaklar</Button>
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-bold">İşlemler</h1>
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Tarih</th>
                  <th className="text-left p-4">Açıklama</th>
                  <th className="text-left p-4">Tip</th>
                  <th className="text-right p-4">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {txList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      Henüz işlem yok
                    </td>
                  </tr>
                ) : (
                  txList.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50">
                      <td className="p-4">
                        {format(new Date(tx.date), 'd MMM yyyy', { locale: tr })}
                      </td>
                      <td className="p-4">{tx.description || '-'}</td>
                      <td className="p-4">
                        <span
                          className={
                            tx.type === 'GELIR'
                              ? 'text-primary'
                              : 'text-red-500'
                          }
                        >
                          {tx.type === 'GELIR' ? 'Gelir' : 'Gider'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium">
                        {tx.type === 'GELIR' ? '+' : '-'}
                        {formatCurrency(Number(tx.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold">Ortaklar</h2>
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Ortak</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-right p-4">Pay (%)</th>
                </tr>
              </thead>
              <tbody>
                {partnerList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      Henüz ortak atanmamış
                    </td>
                  </tr>
                ) : (
                  partnerList.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="p-4">{p.user.name}</td>
                      <td className="p-4">{p.user.email}</td>
                      <td className="p-4 text-right">{Number(p.percentage)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
