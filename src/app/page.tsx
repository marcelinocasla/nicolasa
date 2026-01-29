import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative', width: '280px', height: '200px' }}>
          <Image
            src="/images/nicolasa_logo_1769651001908.png"
            alt="Nicolasa Logo"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 700, background: 'linear-gradient(to right, var(--color-secondary), #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
          NICOLASA
        </h1>

        <p style={{ fontSize: '1.25rem', color: '#e4e4e7', lineHeight: 1.6 }}>
          Sabores auténticos de Bolivia.<br />
          Tradición y modernidad en cada plato.
        </p>

        <Link href="/order" className="btn-primary">
          <span>Realizar Pedido</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </Link>
      </div>
    </main>
  );
}
