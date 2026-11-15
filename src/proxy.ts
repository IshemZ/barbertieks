import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATH = "/gerant/connexion";

/**
 * Espace gérant : rafraîchit la session Supabase (seul endroit où les cookies peuvent être
 * réécrits avant le rendu) et redirige selon l'état de connexion. Contrôle optimiste :
 * chaque page et action revérifie avec requireManager().
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const onLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!signedIn && !onLoginPage) return redirectKeepingCookies(request, LOGIN_PATH, response);
  if (signedIn && onLoginPage) return redirectKeepingCookies(request, "/gerant", response);
  return response;
}

function redirectKeepingCookies(request: NextRequest, path: string, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  matcher: ["/gerant", "/gerant/:path*"],
};
