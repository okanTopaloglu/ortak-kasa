'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { accounts } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banknote, CreditCard, Wallet } from 'lucide-react';

const ACCOUNT_TYPES = [
  { value: 'NAKIT', label: 'Nakit', icon: Banknote },
  { value: 'BANKA_HESABI', label: 'Banka Hesabı', icon: Wallet },
  { value: 'KREDI_KARTI', label: 'Kredi Kartı', icon: CreditCard },
] as const;

const typeLabels: Record<string, string> = {
  NAKIT: 'Nakit',
  BANKA_HESABI: 'Banka Hesabı',
  KREDI_KARTI: 'Kredi Kartı',
};

export default function AccountsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const router = useRouter();
  const [list, setList] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('NAKIT');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    if (!companyId) return;
    accounts
      .list(companyId)
      .then((res) => setList(res.data))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    load();
  }, [companyId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      await accounts.create(companyId, { name: name.trim(), type });
      setName('');
      setShowForm(false);
      load();
    } catch {
      setError('Hesap eklenemedi');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hesabı silmek istediğinize emin misiniz? İşlemlerdeki referanslar kaldırılacak.')) return;
    try {
      await accounts.delete(companyId, id);
      load();
    } catch {
      alert('Hesap silinemedi');
    }
  };

  if (loading) {
    return <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/companies/${companyId}`}>
          <Button variant="ghost" size="sm">← Geri</Button>
        </Link>
        <Button onClick={() => setShowForm(true)}>+ Hesap Ekle</Button>
      </div>

      {showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Yeni Hesap / Kart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gider veya gelir işlemlerinde hangi hesaptan/karttan yapıldığını seçebilirsiniz
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Ad (örn: Garanti Hesap, Kasa, İş Kartı)</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hesap adı"
                  required
                  disabled={adding}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tip</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  disabled={adding}
                >
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={adding}>
                  {adding ? 'Ekleniyor...' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <h1 className="text-2xl font-bold">Hesaplar & Kartlar</h1>
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Ad</th>
                  <th className="text-left p-4">Tip</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      Henüz hesap eklenmemiş. Gider ve gelirlerde hesap/kart seçmek için ekleyin.
                    </td>
                  </tr>
                ) : (
                  list.map((acc) => (
                    <tr key={acc.id} className="border-b border-border/50">
                      <td className="p-4 font-medium">{acc.name}</td>
                      <td className="p-4">{typeLabels[acc.type] || acc.type}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400"
                          onClick={() => handleDelete(acc.id)}
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
