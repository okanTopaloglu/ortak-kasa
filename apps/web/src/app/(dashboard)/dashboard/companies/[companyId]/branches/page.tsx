'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { branches } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BranchesPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const router = useRouter();
  const [branchList, setBranchList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!companyId) return;
    branches
      .list(companyId)
      .then((res) => setBranchList(res.data))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [companyId, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await branches.create(companyId, newName.trim());
      setBranchList((prev) => [...prev, res.data]);
      setNewName('');
      setShowCreate(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'İş kolu eklenemedi. Yetkinizi kontrol edin.');
    } finally {
      setCreating(false);
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
        <Button onClick={() => setShowCreate(true)}>Yeni İş Kolu</Button>
      </div>

      {showCreate && (
        <Card className="border-border">
            <CardHeader>
            <CardTitle>Yeni İş Kolu</CardTitle>
            <p className="text-sm text-muted-foreground">
              Oluşturduktan sonra &quot;Ortaklık %&quot; butonundan ortak yüzdelerini girebilirsiniz.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>
              )}
              <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Örn: Kurye, E-ticaret..."
                required
                disabled={creating}
              />
              <Button type="submit" disabled={creating}>
                {creating ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                İptal
              </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <h1 className="text-2xl font-bold">İş Kolları</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {branchList.map((branch) => (
          <div
            key={branch.id}
            className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition"
          >
            <Link href={`/dashboard/companies/${companyId}/branches/${branch.id}`}>
              <h3 className="font-semibold text-lg">{branch.name}</h3>
            </Link>
            <div className="mt-3 flex gap-2">
              <Link href={`/dashboard/companies/${companyId}/branches/${branch.id}`}>
                <Button variant="outline" size="sm">İşlemler</Button>
              </Link>
              <Link href={`/dashboard/companies/${companyId}/branches/${branch.id}/partners`}>
                <Button variant="outline" size="sm">Ortaklık %</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
