'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Building2, Users, Wallet } from 'lucide-react';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const companyMatch = pathname?.match(/\/dashboard\/companies\/([^/]+)/);
  const companyId = companyMatch?.[1];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Yönlendiriliyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold text-primary text-lg shrink-0">
              OrtakKasa
            </Link>
            {companyId && (
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href={`/dashboard/companies/${companyId}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                    pathname === `/dashboard/companies/${companyId}` ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href={`/dashboard/companies/${companyId}/branches`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                    pathname?.startsWith(`/dashboard/companies/${companyId}/branches`) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  İş Kolları
                </Link>
                <Link
                  href={`/dashboard/companies/${companyId}/members`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                    pathname?.startsWith(`/dashboard/companies/${companyId}/members`) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Üyeler
                </Link>
                <Link
                  href={`/dashboard/companies/${companyId}/accounts`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
                    pathname?.startsWith(`/dashboard/companies/${companyId}/accounts`) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  Hesaplar
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground truncate max-w-[120px]">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Çıkış
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutInner>{children}</DashboardLayoutInner>;
}
