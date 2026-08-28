import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { appConfig } from '@config/app.config';
import { useGoogleLogin } from '@features/auth/hooks';

interface GoogleLoginButtonProps {
  /** Which label to show. Defaults to "continue_with". */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

const LABELS: Record<NonNullable<GoogleLoginButtonProps['text']>, string> = {
  signin_with: 'Sign in with Google',
  signup_with: 'Sign up with Google',
  continue_with: 'Continue with Google',
  signin: 'Sign in with Google',
};

/** Google's multi-colour "G" mark. */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/**
 * A themed "Continue with Google" button that matches the app's light/dark
 * design. Google's own rendered button ignores dark mode for signed-in
 * (personalised) users, so we render our own button and lay Google's real
 * button invisibly on top of it to capture the click — keeping the secure
 * ID-token flow unchanged. Renders nothing when no client ID is configured.
 */
export function GoogleLoginButton(props: GoogleLoginButtonProps) {
  if (!appConfig.googleClientId) {
    return null;
  }
  return <GoogleLoginButtonInner {...props} />;
}

function GoogleLoginButtonInner({ text = 'continue_with' }: GoogleLoginButtonProps) {
  const googleLogin = useGoogleLogin();
  const containerRef = useRef<HTMLDivElement>(null);
  // Google's button needs an explicit pixel width; track the container's so the
  // invisible button always fully covers our themed one (clamped to Google's
  // supported 200–400px range).
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.round(Math.min(400, Math.max(200, el.offsetWidth))));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <div ref={containerRef} className="relative h-10 w-full" aria-busy={googleLogin.isPending}>
        {/* Visible, theme-aware button (purely presentational). */}
        <div
          aria-hidden="true"
          className="border-input bg-background text-foreground pointer-events-none absolute inset-0 flex items-center justify-center gap-3 rounded-md border text-sm font-medium shadow-sm"
        >
          <GoogleGlyph />
          <span>{LABELS[text]}</span>
        </div>

        {/* Real Google button, laid on top and made transparent — it receives
            the click and drives the credential flow. Sized to the container
            (width prop + large=40px height) so it covers the visible button. */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0">
          <GoogleLogin
            // Re-render when the measured width changes (Google's width isn't reactive).
            key={width}
            onSuccess={(credentialResponse: CredentialResponse) => {
              const credential = credentialResponse.credential;
              if (!credential) {
                toast.error('Google did not return a credential. Please try again.');
                return;
              }
              googleLogin.mutate({ credential });
            }}
            onError={() => {
              toast.error('Google sign-in was cancelled or failed.');
            }}
            size="large"
            text={text}
            width={String(width)}
            useOneTap={false}
          />
        </div>
      </div>
    </div>
  );
}
