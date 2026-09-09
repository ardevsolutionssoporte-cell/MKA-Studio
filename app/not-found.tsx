import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-6 text-center font-mono">
      <h2 className="text-3xl font-serif italic mb-4">404 - Página no encontrada</h2>
      <p className="text-white/60 mb-6 text-xs">La sección solicitada en MKA Studio no existe o ha sido movida.</p>
      <Link href="/" className="px-6 py-3 bg-[#00F0FF] text-black font-bold text-[10px] tracking-[0.2em] uppercase">
        Volver al Catálogo 3D
      </Link>
    </div>
  );
}

