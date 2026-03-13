'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      // Tam sayfa yüklemesi - AuthProvider token ile auth.me() yapacak
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border">
      <CardHeader>
        <CardTitle className="text-2xl text-center">OrtakKasa</CardTitle>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Hesabınıza giriş yapın
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
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmet@ortakkasa.com"
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Kayıt olun
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
