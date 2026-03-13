'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body style={{ padding: '2rem', fontFamily: 'system-ui', background: '#0F172A', color: '#F8FAFC' }}>
        <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Bir hata oluştu</h1>
        <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '14px' }}>
          {error.message}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Tekrar Dene
        </button>
        <p style={{ marginTop: '1rem', fontSize: '14px', color: '#94a3b8' }}>
          Sorun devam ederse tarayıcı konsolunu (F12) kontrol edin.
        </p>
      </body>
    </html>
  );
}
