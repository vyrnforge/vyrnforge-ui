import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { OTPFieldInput, OTPFieldRoot } from '@vyrnforge/react/otp-field';

export function Example() {
  return (
    <Flow gap="sm">
      <label htmlFor="verification-code">Verification code</label>
      <Text as="p" id="verification-code-hint">Enter the four-digit code. You can paste it.</Text>
      <OTPFieldRoot length={4}>
        <OTPFieldInput id="verification-code" name="code" aria-describedby="verification-code-hint" />
      </OTPFieldRoot>
    </Flow>
  );
}
