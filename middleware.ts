import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, clearAuthCookies, setAuthCookies, type SessionTokens } from '@/lib/auth-cookies';

interface JwtPayload {
  exp?: number;
  app_metadata?: { role?: string };
}

function decodeJwt(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

async function refreshSession(refreshToken: string): Promise<SessionTokens | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.access_token || !data.refresh_token) return null;
    return { access_token: data.access_token, refresh_token: data.refresh_token };
  } catch {
    return null;
  }
}

// Page-level gate (UX only). Every API route re-verifies the token and role on the server.
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  let token = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let payload = decodeJwt(token);

  const isExpired = (p: JwtPayload | null) => !p?.exp || p.exp * 1000 < Date.now() + 30_000;

  let refreshed: SessionTokens | null = null;
  let clear = false;

  if (isExpired(payload) && refreshToken) {
    refreshed = await refreshSession(refreshToken);
    if (refreshed) {
      token = refreshed.access_token;
      payload = decodeJwt(token);
      request.cookies.set(ACCESS_COOKIE, refreshed.access_token);
      request.cookies.set(REFRESH_COOKIE, refreshed.refresh_token);
    } else {
      clear = true;
      token = undefined;
      payload = null;
      request.cookies.delete(ACCESS_COOKIE);
      request.cookies.delete(REFRESH_COOKIE);
    }
  }

  const signedIn = Boolean(token) && !isExpired(payload);
  const role = payload?.app_metadata?.role;
  const home = role === 'GOVERNMENT' ? '/officer' : '/dashboard';

  const finish = (response: NextResponse) => {
    if (refreshed) setAuthCookies(response, refreshed);
    if (clear) clearAuthCookies(response);
    return response;
  };
  const redirect = (to: string) => finish(NextResponse.redirect(new URL(to, request.url)));

  if (path.startsWith('/api')) {
    return finish(NextResponse.next({ request }));
  }

  if (path.startsWith('/dashboard')) {
    if (!signedIn) return redirect('/auth/login');
    if (role === 'GOVERNMENT') return redirect('/officer');
  }

  if (path.startsWith('/officer')) {
    if (!signedIn) return redirect('/auth/login?portal=government');
    if (role === 'USER') return redirect('/dashboard');
  }

  const isAuthEntry = path === '/auth' || path.startsWith('/auth/login') || path.startsWith('/auth/register');
  if (isAuthEntry && signedIn) {
    return redirect(home);
  }

  return finish(NextResponse.next({ request }));
}

export const config = {
  matcher: ['/dashboard/:path*', '/officer/:path*', '/auth/:path*', '/api/:path*'],
};
