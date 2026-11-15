import { OTPFieldInput, OTPFieldRoot } from '@vyrnforge/react/otp-field';

export function Example() {
  return (
    <div>
      <label htmlFor="verification-code">Verification code</label>
      <p id="verification-code-hint">Enter the four-digit code. You can paste it.</p>
      <OTPFieldRoot length={4}>
        <OTPFieldInput id="verification-code" name="code" aria-describedby="verification-code-hint" />
      </OTPFieldRoot>
    </div>
  );
}
