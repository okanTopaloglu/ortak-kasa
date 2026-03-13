'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { transactions as txApi, accounts as accountsApi, partners as partnersApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type TxItem = {
  id: string;
  amount: string;
  description: string | null;
  date: string;
  type: string;
  account?: { id: string; name: string; type: string } | null;
};

export default function TransactionsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const branchId = params.branchId as string;
  const [txList, setTxList] = useState<TxItem[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string; type: string }[]>([]);
  const [partners, setPartners] = useState<{ userId: string; user: { name: string } }[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState<'GELIR' | 'GIDER'>('GELIR');
  const [accountId, setAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const PRESET_DESCRIPTIONS = [
    { label: '💰 Ortak kasaya para koydu', value: 'Ortak kasaya para yatırıldı', type: 'GELIR' as const },
    { label: '💸 Ortak kasadan para çekti', value: 'Ortak kasadan para çekildi', type: 'GIDER' as const },
    { label: 'Satış geliri', value: 'Satış geliri', type: 'GELIR' as const },
    { label: 'Kasaya para yatırıldı', value: 'Kasaya para yatırıldı', type: 'GELIR' as const },
    { label: 'Kasadan para alındı', value: 'Kasadan para alındı', type: 'GIDER' as const },
    { label: 'Masraf / Gider', value: 'Masraf / Gider', type: 'GIDER' as const },
    { label: 'Diğer', value: '', type: null },
  ];

  const load = () => {
    txApi.list(branchId).then((res) => setTxList(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!branchId) return;
    load();
  }, [branchId]);

  useEffect(() => {
    if (companyId) {
      accountsApi.list(companyId).then((res) => setAccounts(res.data)).catch(() => {});
    }
  }, [companyId]);

  useEffect(() => {
    if (branchId) {
      partnersApi.list(branchId).then((res) => setPartners(res.data)).catch(() => {});
    }
  }, [branchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await txApi.create(branchId, {
        amount: parseFloat(amount),
        description: description || undefined,
        date,
        type,
        accountId: accountId || undefined,
      });
      setAmount('');
      setDescription('');
      setAccountId('');
      setPartnerId('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'İşlem eklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePresetSelect = (preset: { value: string; type: 'GELIR' | 'GIDER' | null }) => {
    let desc = preset.value;
    if (partnerId && preset.value && (preset.value.includes('Ortak') || preset.value.includes('ortak'))) {
      const p = partners.find((x) => x.userId === partnerId);
      if (p) {
        desc = preset.value
          .replace('Ortak kasaya', `${p.user.name} kasaya`)
          .replace('Ortak kasadan', `${p.user.name} kasadan`);
      }
    }
    if (desc) setDescription(desc);
    if (preset.type) setType(preset.type);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
    await txApi.delete(branchId, id);
    load();
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/companies/${companyId}/branches/${branchId}`}>
          <Button variant="ghost" size="sm">← Geri</Button>
        </Link>
        <Button onClick={() => setShowForm(true)}>+ Gelir/Gider Ekle</Button>
      </div>

      {showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Yeni İşlem</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ortak kasaya para koyduğunda Gelir, kasadan para çektiğinde Gider seçin. Önce ortak seçip sonra butona tıklayabilirsiniz.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Tutar</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tarih</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tip</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'GELIR' | 'GIDER')}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  disabled={submitting}
                >
                  <option value="GELIR">Gelir</option>
                  <option value="GIDER">Gider</option>
                </select>
              </div>
              {partners.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Ortak (opsiyonel - kim para koydu/çekti?)</label>
                  <select
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={submitting}
                  >
                    <option value="">Belirtilmedi</option>
                    {partners.map((p) => (
                      <option key={p.userId} value={p.userId}>{p.user.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {accounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Hesap / Kart (opsiyonel)</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    disabled={submitting}
                  >
                    <option value="">Belirtilmedi</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PRESET_DESCRIPTIONS.map((p) => (
                    <Button
                      key={p.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetSelect(p)}
                      disabled={submitting}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Kasaya para yatırıldı, Satış geliri..."
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Ekleniyor...' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <h1 className="text-2xl font-bold">Gelir & Gider</h1>
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Tarih</th>
                  <th className="text-left p-4">Açıklama</th>
                  <th className="text-left p-4">Tip</th>
                  <th className="text-left p-4">Hesap/Kart</th>
                  <th className="text-right p-4">Tutar</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {txList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
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
                      <td className="p-4 text-muted-foreground text-sm">
                        {tx.account?.name || '-'}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {tx.type === 'GELIR' ? '+' : '-'}
                        {formatCurrency(Number(tx.amount))}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(tx.id)}
                        >
                          Sil
                        </Button>
                      </td>
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
