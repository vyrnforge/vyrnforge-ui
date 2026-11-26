import { Text } from '@vyrnforge/react/text';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';
import { PasswordFieldInput, PasswordFieldRoot, PasswordFieldToggle } from '@vyrnforge/react/password-field';
import { OTPFieldInput, OTPFieldRoot } from '@vyrnforge/react/otp-field';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/input.css';
import '@vyrnforge/web/styles/password-field.css';
import '@vyrnforge/web/styles/otp-field.css';
import './example.css';

type AuthStep = 'task' | 'reauth' | 'password' | 'otp';
type ProviderResult = 'idle' | 'passkey-failed' | 'sso-failed' | 'credentials-failed' | 'otp-failed';

export function Example() {
  const [note, setNote] = React.useState('Quarterly planning notes');
  const [step, setStep] = React.useState<AuthStep>('task');
  const [providerResult, setProviderResult] = React.useState<ProviderResult>('idle');
  const [username, setUsername] = React.useState('editor@example.com');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [credentialAttempts, setCredentialAttempts] = React.useState(0);
  const [otpAttempts, setOtpAttempts] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const statusRef = React.useRef<HTMLDivElement>(null);

  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function expireSession() {
    setStep('reauth');
    setProviderResult('idle');
    focusHeading();
  }

  function failProvider(result: 'passkey-failed' | 'sso-failed') {
    setProviderResult(result);
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  function usePasswordFallback() {
    setStep('password');
    setProviderResult('idle');
    focusHeading();
  }

  function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAttempt = credentialAttempts + 1;
    setCredentialAttempts(nextAttempt);
    if (nextAttempt === 1) {
      setProviderResult('credentials-failed');
      return;
    }
    setProviderResult('idle');
    setStep('otp');
    focusHeading();
  }

  function submitOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAttempt = otpAttempts + 1;
    setOtpAttempts(nextAttempt);
    if (nextAttempt === 1) {
      setProviderResult('otp-failed');
      return;
    }
    setProviderResult('idle');
    setOtp('');
    setPassword('');
    setStep('task');
    focusHeading();
  }

  function signOut() {
    setStep('reauth');
    setProviderResult('idle');
    setPassword('');
    setOtp('');
    focusHeading();
  }

  return (
    <section className="vf-identity-example" aria-labelledby="identity-heading">
      {step === 'task' && (
        <>
          <Text as="h2" variant="heading-md" id="identity-heading" ref={headingRef} tabIndex={-1}>
            Edit profile note
          </Text>
          <Text as="p">Your session is active. Changes remain local until you choose Save changes.</Text>
          <label htmlFor="identity-note">Profile note</label>
          <Input
            id="identity-note"
            name="note"
            value={note}
            onChange={(event) => {
              setNote(event.currentTarget.value);
              setSaved(false);
            }}
          />
          <div className="vf-identity-actions">
            <Button type="button" onClick={() => setSaved(true)}>
              Save changes
            </Button>
            <Button type="button" variant="secondary" onClick={signOut}>
              Sign out of this app
            </Button>
          </div>
          {saved && <Text as="p" role="status">Profile note saved by the example service.</Text>}
          <div className="vf-identity-test-controls" aria-label="Example provider controls">
            <Button type="button" variant="ghost" onClick={expireSession}>
              Simulate session expiry
            </Button>
          </div>
        </>
      )}

      {step === 'reauth' && (
        <>
          <Text as="h2" variant="heading-md" id="identity-heading" ref={headingRef} tabIndex={-1}>
            Sign in again to continue editing
          </Text>
          <Text as="p">Your profile note is still available in this page. Nothing was saved automatically.</Text>
          <div className="vf-identity-actions">
            <Button type="button" onClick={() => failProvider('passkey-failed')}>
              Continue with passkey
            </Button>
            <Button type="button" variant="secondary" onClick={() => failProvider('sso-failed')}>
              Continue with organization SSO
            </Button>
          </div>
          {providerResult === 'passkey-failed' && (
            <div ref={statusRef} tabIndex={-1} role="alert">
              The passkey sign-in did not complete. You can try another allowed sign-in method.
            </div>
          )}
          {providerResult === 'sso-failed' && (
            <div ref={statusRef} tabIndex={-1} role="alert">
              Organization sign-in did not complete. You can try another allowed sign-in method.
            </div>
          )}
          <Button type="button" variant="secondary" onClick={usePasswordFallback}>
            Use password instead
          </Button>
          <Text as="p" className="vf-identity-draft">
            Unsaved note: <Text as="span" data-testid="draft-value">{note}</Text>
          </Text>
        </>
      )}

      {step === 'password' && (
        <>
          <Text as="h2" variant="heading-md" id="identity-heading" ref={headingRef} tabIndex={-1}>
            Sign in with your password
          </Text>
          <Text as="p">Your unsaved profile note remains available while you sign in again.</Text>
          <form onSubmit={submitPassword} noValidate>
            <label htmlFor="identity-username">Email address</label>
            <Input
              id="identity-username"
              name="username"
              type="email"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.currentTarget.value);
                setProviderResult('idle');
              }}
            />
            <label htmlFor="identity-password">Password</label>
            <PasswordFieldRoot>
              <PasswordFieldInput
                id="identity-password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.currentTarget.value);
                  setProviderResult('idle');
                }}
              />
              <PasswordFieldToggle showLabel="Show password" hideLabel="Hide password" />
            </PasswordFieldRoot>
            {providerResult === 'credentials-failed' && (
              <Text as="p" role="alert">
                We could not sign you in with those credentials. Check them or use another allowed method.
              </Text>
            )}
            <Button type="submit">Continue</Button>
          </form>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setStep('reauth');
              setProviderResult('idle');
              focusHeading();
            }}
          >
            Choose another method
          </Button>
        </>
      )}

      {step === 'otp' && (
        <>
          <Text as="h2" variant="heading-md" id="identity-heading" ref={headingRef} tabIndex={-1}>
            Enter your verification code
          </Text>
          <Text as="p">The example provider requires a second factor before returning to your edit.</Text>
          <form onSubmit={submitOtp} noValidate>
            <label htmlFor="identity-otp">Verification code</label>
            <Text as="p" id="identity-otp-hint">Enter or paste the four-digit code.</Text>
            <OTPFieldRoot
              value={otp}
              onValueChange={(value) => {
                setOtp(value);
                setProviderResult('idle');
              }}
              length={4}
            >
              <OTPFieldInput id="identity-otp" name="code" aria-describedby="identity-otp-hint" />
            </OTPFieldRoot>
            {providerResult === 'otp-failed' && (
              <Text as="p" role="alert">That verification code is incorrect or expired. Enter the current code and try again.</Text>
            )}
            <Button type="submit">Verify and return to edit</Button>
          </form>
          <Text as="p" className="vf-identity-draft">
            Unsaved note: <Text as="span" data-testid="draft-value">{note}</Text>
          </Text>
        </>
      )}
    </section>
  );
}

const mount = document.querySelector<HTMLElement>('#root');
if (mount) createRoot(mount).render(<Example />);
