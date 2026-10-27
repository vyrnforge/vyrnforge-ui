import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
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
  const [note, setNote] = useState('Quarterly planning notes');
  const [step, setStep] = useState<AuthStep>('task');
  const [providerResult, setProviderResult] = useState<ProviderResult>('idle');
  const [username, setUsername] = useState('editor@example.com');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [credentialAttempts, setCredentialAttempts] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [saved, setSaved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

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

  function submitPassword(event: FormEvent<HTMLFormElement>) {
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

  function submitOtp(event: FormEvent<HTMLFormElement>) {
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
          <h2 id="identity-heading" ref={headingRef} tabIndex={-1}>Edit profile note</h2>
          <p>Your session is active. Changes remain local until you choose Save changes.</p>
          <label htmlFor="identity-note">Profile note</label>
          <Input id="identity-note" name="note" value={note} onChange={(event) => { setNote(event.currentTarget.value); setSaved(false); }} />
          <div className="vf-identity-actions">
            <Button type="button" onClick={() => setSaved(true)}>Save changes</Button>
            <Button type="button" variant="secondary" onClick={signOut}>Sign out of this app</Button>
          </div>
          {saved && <p role="status">Profile note saved by the example service.</p>}
          <div className="vf-identity-test-controls" aria-label="Example provider controls">
            <Button type="button" variant="ghost" onClick={expireSession}>Simulate session expiry</Button>
          </div>
        </>
      )}

      {step === 'reauth' && (
        <>
          <h2 id="identity-heading" ref={headingRef} tabIndex={-1}>Sign in again to continue editing</h2>
          <p>Your profile note is still available in this page. Nothing was saved automatically.</p>
          <div className="vf-identity-actions">
            <Button type="button" onClick={() => failProvider('passkey-failed')}>Continue with passkey</Button>
            <Button type="button" variant="secondary" onClick={() => failProvider('sso-failed')}>Continue with organization SSO</Button>
          </div>
          {providerResult === 'passkey-failed' && <div ref={statusRef} tabIndex={-1} role="alert">The passkey sign-in did not complete. You can try another allowed sign-in method.</div>}
          {providerResult === 'sso-failed' && <div ref={statusRef} tabIndex={-1} role="alert">Organization sign-in did not complete. You can try another allowed sign-in method.</div>}
          <Button type="button" variant="secondary" onClick={usePasswordFallback}>Use password instead</Button>
          <p className="vf-identity-draft">Unsaved note: <span data-testid="draft-value">{note}</span></p>
        </>
      )}

      {step === 'password' && (
        <>
          <h2 id="identity-heading" ref={headingRef} tabIndex={-1}>Sign in with your password</h2>
          <p>Your unsaved profile note remains available while you sign in again.</p>
          <form onSubmit={submitPassword} noValidate>
            <label htmlFor="identity-username">Email address</label>
            <Input id="identity-username" name="username" type="email" autoComplete="username" value={username} onChange={(event) => { setUsername(event.currentTarget.value); setProviderResult('idle'); }} />
            <label htmlFor="identity-password">Password</label>
            <PasswordFieldRoot>
              <PasswordFieldInput id="identity-password" name="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.currentTarget.value); setProviderResult('idle'); }} />
              <PasswordFieldToggle aria-label="Show or hide password">Show or hide password</PasswordFieldToggle>
            </PasswordFieldRoot>
            {providerResult === 'credentials-failed' && <p role="alert">We could not sign you in with those credentials. Check them or use another allowed method.</p>}
            <Button type="submit">Continue</Button>
          </form>
          <Button type="button" variant="secondary" onClick={() => { setStep('reauth'); setProviderResult('idle'); focusHeading(); }}>Choose another method</Button>
        </>
      )}

      {step === 'otp' && (
        <>
          <h2 id="identity-heading" ref={headingRef} tabIndex={-1}>Enter your verification code</h2>
          <p>The example provider requires a second factor before returning to your edit.</p>
          <form onSubmit={submitOtp} noValidate>
            <OTPFieldRoot value={otp} onValueChange={(value) => { setOtp(value); setProviderResult('idle'); }} length={4} aria-label="Verification code">
              {[0, 1, 2, 3].map((index) => <OTPFieldInput key={index} index={index} aria-label={`Verification code digit ${index + 1} of 4`} />)}
            </OTPFieldRoot>
            {providerResult === 'otp-failed' && <p role="alert">That verification code is incorrect or expired. Enter the current code and try again.</p>}
            <Button type="submit">Verify and return to edit</Button>
          </form>
          <p className="vf-identity-draft">Unsaved note: <span data-testid="draft-value">{note}</span></p>
        </>
      )}
    </section>
  );
}

const mount = document.querySelector<HTMLElement>('#root');
if (mount) import('react-dom/client').then(({ createRoot }) => createRoot(mount).render(<Example />));
