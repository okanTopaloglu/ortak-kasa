'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.register({
        email,
        password,
        name,
        companyName: companyName || undefined,
      });
      localStorage.setItem('token', res.data.access_token);
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border">
      <CardHeader>
        <CardTitle className="text-2xl text-center">OrtakKasa</CardTitle>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Yeni hesap oluşturun
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
            <label className="block text-sm font-medium mb-1">Ad Soyad</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız Soyadınız"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Şirket Adı (opsiyonel)
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="İlk şirketinizi oluşturun"
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Giriş yapın
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
