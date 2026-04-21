import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Menangkap URL dan kode rahasia dari Supabase setelah user login
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // Jika ada parameter 'next', kita arahkan ke sana, kalau tidak, default ke /dashboard
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    /* Catatan untuk Integrasi Tim Backend:
      Di sinilah kita memanggil Supabase Server Client yang sudah dibuat timmu.
      Biasanya kodenya seperti ini:
      
      const supabase = createClient();
      await supabase.auth.exchangeCodeForSession(code);
    */
    
    // (Simulasi sukses untuk MVP Front-end)
    console.log("Token OAuth berhasil ditangkap:", code);
  }

  // Setelah berhasil, lempar pengguna langsung ke halaman Dashboard
  return NextResponse.redirect(`${origin}${next}`);
}