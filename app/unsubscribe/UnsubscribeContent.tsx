'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const email = searchParams.get('email');

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#f8f6f3' }}
    >
      <div
        className="max-w-md w-full text-center rounded-2xl p-10"
        style={{ background: '#ffffff', boxShadow: '0 4px 24px rgba(156,136,255,0.08)' }}
      >
        {/* Logo */}
        <p
          className="font-italiana mb-1"
          style={{ fontSize: '28px', color: '#6B5B95', letterSpacing: '1px' }}
        >
          iPurpose
        </p>
        <p
          className="font-marcellus mb-8"
          style={{ fontSize: '13px', color: '#9C88FF', fontStyle: 'italic' }}
        >
          Where Alignment Meets Action
        </p>

        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✓</div>
            <h1
              className="font-italiana mb-3"
              style={{ fontSize: '28px', color: '#2A2A2A' }}
            >
              You've been unsubscribed
            </h1>
            <p
              className="font-marcellus mb-6"
              style={{ fontSize: '15px', color: '#666', lineHeight: '1.7' }}
            >
              {email ? (
                <>
                  <strong style={{ color: '#2A2A2A' }}>{email}</strong> has been
                  removed from our email list. You won&rsquo;t receive any more
                  marketing emails from us.
                </>
              ) : (
                <>
                  Your email has been removed from our list. You won&rsquo;t
                  receive any more marketing emails from us.
                </>
              )}
            </p>
            <p
              className="font-marcellus mb-8"
              style={{ fontSize: '13px', color: '#999' }}
            >
              Changed your mind? You can always re-subscribe from the{' '}
              <a
                href="/clarity-check"
                style={{ color: '#9C88FF', textDecoration: 'underline' }}
              >
                Clarity Check
              </a>{' '}
              page.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <h1
              className="font-italiana mb-3"
              style={{ fontSize: '28px', color: '#2A2A2A' }}
            >
              Something went wrong
            </h1>
            <p
              className="font-marcellus mb-8"
              style={{ fontSize: '15px', color: '#666', lineHeight: '1.7' }}
            >
              We couldn&rsquo;t process your unsubscribe request. Please reply
              to any email from us and ask to be removed — we&rsquo;ll take care
              of it immediately.
            </p>
          </>
        )}

        {status === 'missing' && (
          <>
            <div className="text-4xl mb-4">🔗</div>
            <h1
              className="font-italiana mb-3"
              style={{ fontSize: '28px', color: '#2A2A2A' }}
            >
              Invalid unsubscribe link
            </h1>
            <p
              className="font-marcellus mb-8"
              style={{ fontSize: '15px', color: '#666', lineHeight: '1.7' }}
            >
              This link appears to be missing your email address. Please reply
              to any email from us and ask to be removed.
            </p>
          </>
        )}

        {!status && (
          <>
            <h1
              className="font-italiana mb-3"
              style={{ fontSize: '28px', color: '#2A2A2A' }}
            >
              Unsubscribe
            </h1>
            <p
              className="font-marcellus mb-8"
              style={{ fontSize: '15px', color: '#666', lineHeight: '1.7' }}
            >
              To unsubscribe, use the link in the footer of any email we&rsquo;ve
              sent you, or reply to any email asking to be removed.
            </p>
          </>
        )}

        <Link
          href="/"
          className="font-marcellus"
          style={{ fontSize: '14px', color: '#9C88FF' }}
        >
          ← Back to iPurpose
        </Link>
      </div>
    </div>
  );
}
