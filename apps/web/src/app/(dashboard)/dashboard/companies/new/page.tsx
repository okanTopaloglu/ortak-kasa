'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { companies } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await companies.create(name);
      router.push(`/dashboard/companies/${res.data.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Şirket oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Yeni Şirket</CardTitle>
          <p className="text-sm text-muted-foreground">
            Yeni bir şirket oluşturun
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Şirket Adı</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: ABC Ltd."
                required
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
