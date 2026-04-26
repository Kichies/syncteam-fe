import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;

  if (code) {
    // Placeholder response — will be replaced with real redirect after profile check
    let finalRedirect = `${baseUrl}${next}`;
    const tempResponse = NextResponse.redirect(finalRedirect);

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              tempResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Redirect user baru (belum isi role) ke halaman setup profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!profile?.role) {
        finalRedirect = `${baseUrl}/profile?setup=true`;
      }

      const successResponse = NextResponse.redirect(finalRedirect);
      // Salin cookies dari tempResponse
      tempResponse.cookies.getAll().forEach(({ name, value, ...opts }) => {
        successResponse.cookies.set(name, value, opts);
      });
      return successResponse;
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_failed`);
}
