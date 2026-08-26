import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';

import { appConfig } from '@config/app.config';
import { useGoogleLogin } from '@features/auth/hooks';
import { useTheme } from '@hooks/useTheme';

interface GoogleLoginButtonProps {
  /** Copy shown inside Google's button. Defaults to "continue_with". */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

/**
 * Renders Google's official "Sign in with Google" button and exchanges the
 * returned ID token for an Axiora session via {@link useGoogleLogin}.
 *
 * Renders nothing when no Google client ID is configured, so the surrounding
 * auth forms degrade gracefully to email/password only. The guard lives in
 * this outer component so that none of the provider-dependent hooks in
 * {@link GoogleLoginButtonInner} run when the button is disabled.
 */
export function GoogleLoginButton(props: GoogleLoginButtonProps) {
  if (!appConfig.googleClientId) {
    return null;
  }
  return <GoogleLoginButtonInner {...props} />;
}

function GoogleLoginButtonInner({ text = 'continue_with' }: GoogleLoginButtonProps) {
  const { resolvedTheme } = useTheme();
  const googleLogin = useGoogleLogin();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <div className="flex justify-center" aria-busy={googleLogin.isPending}>
        <GoogleLogin
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
          theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
          size="large"
          shape="pill"
          text={text}
          width="320"
          useOneTap={false}
        />
      </div>
    </div>
  );
}
