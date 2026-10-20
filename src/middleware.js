import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || 'innet-creations-admin-super-secret-key-2024-madurai';

// ── In-Memory Rate Limiting (Sliding Window per IP) ─────────────────
// Allows 120 req/min for public routes, 15 req/min for auth/login
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_PUBLIC_REQUESTS = 120;
const MAX_AUTH_REQUESTS = 15;

// Periodically clean up stale rate-limit entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now - data.startTime > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

// ── Web Application Firewall (WAF) Attack Signatures ──────────────
// Inspects request paths and query parameters to block SQL injection, XSS, and LFI attacks
const ATTACK_PATTERNS = [
  // SQL Injection patterns
  /(\b(select\s+.*from|union\s+select|insert\s+into|delete\s+from|drop\s+table|update\s+.*set|benchmark\s*\(|sleep\s*\(|waitfor\s+delay)\b)/i,
  /('|\b)(or|and)\s+[\d'\"]+\s*=\s*[\d'\"]+/i,
  /;\s*(--|#|\/\*)/,
  /(\b(information_schema|table_schema|into\s+outfile|load_file)\b)/i,

  // Cross-Site Scripting (XSS) patterns
  /<script\b[^>]*>/i,
  /javascript:\s*/i,
  /(onerror|onload|onclick|onmouseover)\s*=/i,
  /eval\s*\(|expression\s*\(/i,
  /<iframe\b|<object\b|<embed\b/i,

  // Path Traversal & LFI
  /(\.\.[/\\]|\%2e\%2e[/\\]|\%2e\%2e\%2f)/i,
  /(\/etc\/passwd|\bwin\.ini\b|\/proc\/self)/i,

  // Command Injection
  /;\s*(cat|ls|whoami|curl|wget|powershell|cmd\.exe|netcat|bash|sh)\b/i,
];

function isMalicious(input) {
  if (!input) return false;
  return ATTACK_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Enterprise Middleware — Route Protection, Web Application Firewall (WAF),
 * and Multi-User Concurrency Rate Limiter.
 */
export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. WAF: Inspect URL Path & Query for Injection Attacks
  const decodedPath = decodeURIComponent(pathname).toLowerCase();
  const decodedSearch = search ? decodeURIComponent(search).toLowerCase() : '';

  if (isMalicious(decodedPath) || isMalicious(decodedSearch)) {
    console.warn(`[WAF Security Block] Blocked attack attempt from IP ${ip} on ${pathname}${search}`);
    return NextResponse.json(
      {
        error: 'Forbidden: Request blocked by security firewall',
        code: 'SECURITY_VIOLATION',
      },
      { status: 403 }
    );
  }

  // 2. Multi-User Access & Rate Limiting
  const isAuthRoute = pathname.startsWith('/api/auth') || pathname === '/admin/login';
  const maxRequests = isAuthRoute ? MAX_AUTH_REQUESTS : MAX_PUBLIC_REQUESTS;

  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, startTime: now };

  if (now - clientData.startTime < RATE_LIMIT_WINDOW_MS) {
    clientData.count += 1;
    if (clientData.count > maxRequests) {
      console.warn(`[Rate Limit Exceeded] IP ${ip} exceeded ${maxRequests} requests/min`);
      return NextResponse.json(
        {
          error: 'Too many requests. Please slow down.',
          retryAfterSeconds: 60,
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }
  } else {
    clientData.count = 1;
    clientData.startTime = now;
  }
  rateLimitMap.set(ip, clientData);

  // 3. Admin Authentication Route Protection
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminRoute || isAdminApi) {
    const token = await getToken({
      req,
      secret: NEXTAUTH_SECRET,
    });

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Attach Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all requests except static files, favicon, and next internal files
     */
    '/((?!_next/static|_next/image|assets/|favicon.ico).*)',
  ],
};
