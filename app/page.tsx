import { redirect } from 'next/navigation';

export default function HomePage() {
  // Sesuai instruksi dokumen tim, kita langsung lempar user ke Dashboard
  redirect('/dashboard');
}