'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Global Error Boundary for Next.js App Router
 * Catches root-level errors (including those originating from RootLayout)
 * and renders a safe, self-contained recovery UI with complete <html> and <body> tags.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Root Layout Global Error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '24px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: '40px 32px',
            borderRadius: '16px',
            backgroundColor: '#141414',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
              fontSize: '24px',
            }}
          >
            ⚠️
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              color: '#a3a3a3',
              lineHeight: 1.6,
              marginBottom: '28px',
            }}
          >
            A temporary issue occurred while loading this page. Please try again or return to the homepage.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '8px',
                backgroundColor: '#A07D3F',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>

            <Link
              href="/"
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '12px 20px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#a3a3a3',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '0.95rem',
                fontWeight: 500,
                textDecoration: 'none',
                boxSizing: 'border-box',
              }}
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
