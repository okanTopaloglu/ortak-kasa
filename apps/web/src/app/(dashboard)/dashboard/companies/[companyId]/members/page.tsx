'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { companies } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CompanyMembersPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const router = useRouter();
  const [company, setCompany] = useState<{
    userCompanies: { user: { id: string; name: string; email: string }; role: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!companyId) return;
    companies
      .get(companyId)
      .then((res) => setCompany(res.data))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [companyId, router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      await companies.addMember(companyId, email);
      const res = await companies.get(companyId);
      setCompany(res.data);
      setEmail('');
      setShowForm(false);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Üye eklenemedi');
    } finally {
      setAdding(false);
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
        <Button onClick={() => setShowForm(true)}>Üye Ekle</Button>
      </div>

      {showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Üye Ekle</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sisteme kayıtlı bir kullanıcının email adresi ile ekleyin
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="uyesi@email.com"
                  required
                  disabled={adding}
                />
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

      <h1 className="text-2xl font-bold">Şirket Üyeleri</h1>
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Ad</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Rol</th>
                  <th className="w-24"></th>
                </tr>
              </thead>
              <tbody>
                {company?.userCompanies?.map((uc) => (
                  <tr key={uc.user.id} className="border-b border-border/50">
                    <td className="p-4">{uc.user.name}</td>
                    <td className="p-4">{uc.user.email}</td>
                    <td className="p-4">{uc.role}</td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-400"
                        onClick={async () => {
                          if (!confirm(`${uc.user.name} üyeyi şirketten çıkarmak istediğinize emin misiniz?`)) return;
                          try {
                            await companies.removeMember(companyId, uc.user.id);
                            const res = await companies.get(companyId);
                            setCompany(res.data);
                          } catch (err: unknown) {
                            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                            alert(msg || 'Üye çıkarılamadı');
                          }
                        }}
                      >
                        Çıkar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
