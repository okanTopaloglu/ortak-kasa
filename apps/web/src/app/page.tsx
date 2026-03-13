import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <h1 className="text-4xl font-bold text-primary mb-4">OrtakKasa</h1>
      <p className="text-muted-foreground mb-8">Gelir-Gider Takip ve Kar Paylaşımı Yönetim Sistemi</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
        >
          Giriş Yap
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition"
        >
          Kayıt Ol
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Zaten giriş yaptıysanız{' '}
        <Link href="/dashboard" className="text-primary hover:underline">
          Dashboard&apos;a gidin
        </Link>
      </p>
    </div>
  );
}
