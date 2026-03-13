'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { partners as partnersApi, companies } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PartnersPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const branchId = params.branchId as string;
  const router = useRouter();
  const [partnerList, setPartnerList] = useState<
    { id: string; userId: string; percentage: string; user: { id: string; name: string; email: string } }[]
  >([]);
  const [companyUsers, setCompanyUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [percentage, setPercentage] = useState('');
  const [partners, setPartners] = useState<{ userId: string; percentage: number }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!branchId || !companyId) return;
    Promise.all([
      partnersApi.list(branchId),
      companies.get(companyId),
    ])
      .then(([partnerRes, companyRes]) => {
        setPartnerList(partnerRes.data);
        const users = companyRes.data.userCompanies?.map(
          (uc: { user: { id: string; name: string; email: string } }) => uc.user
        ) || [];
        setCompanyUsers(users);
        setPartners(
          partnerRes.data.map((p: { userId: string; percentage: string }) => ({
            userId: p.userId,
            percentage: Number(p.percentage),
          }))
        );
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [branchId, companyId, router]);

  const handleAddPartner = () => {
    if (!selectedUserId || !percentage) return;
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) return;
    if (partners.some((p) => p.userId === selectedUserId)) return;
    setPartners((prev) => [...prev, { userId: selectedUserId, percentage: pct }]);
    setSelectedUserId('');
    setPercentage('');
  };

  const handleRemovePartner = (userId: string) => {
    setPartners((prev) => prev.filter((p) => p.userId !== userId));
  };

  const handleSave = async () => {
    const total = partners.reduce((s, p) => s + p.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      alert('Ortak yüzdeleri toplamı 100 olmalıdır.');
      return;
    }
    setSaving(true);
    try {
      await partnersApi.set(branchId, partners);
      const res = await partnersApi.list(branchId);
      setPartnerList(res.data);
      setPartners(res.data.map((p: { userId: string; percentage: string }) => ({
        userId: p.userId,
        percentage: Number(p.percentage),
      })));
      setShowForm(false);
    } catch (e) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
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
        <Button onClick={() => setShowForm(true)}>Ortakları Düzenle</Button>
      </div>

      {showForm && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Ortak Yönetimi</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ortak yüzdeleri toplamı 100 olmalıdır. Mevcut: {partners.reduce((s, p) => s + p.percentage, 0).toFixed(1)}%
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Şirket Üyesi</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm min-w-[200px]"
                >
                  <option value="">Seçin...</option>
                  {companyUsers
                    .filter((u) => !partners.some((p) => p.userId === u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pay (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="50"
                  className="w-24"
                />
              </div>
              <Button type="button" onClick={handleAddPartner}>
                Ekle
              </Button>
            </div>
            <div className="space-y-2">
              {partners.map((p) => {
                const user = companyUsers.find((u) => u.id === p.userId) || partnerList.find(
                  (pl) => pl.userId === p.userId
                )?.user;
                return (
                  <div
                    key={p.userId}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span>{user?.name || user?.email || p.userId}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={p.percentage}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setPartners((prev) =>
                            prev.map((x) =>
                              x.userId === p.userId ? { ...x, percentage: v } : x
                            )
                          );
                        }}
                        className="w-20"
                      />
                      %
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleRemovePartner(p.userId)}
                      >
                        Kaldır
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <h1 className="text-2xl font-bold">Ortaklar</h1>
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
