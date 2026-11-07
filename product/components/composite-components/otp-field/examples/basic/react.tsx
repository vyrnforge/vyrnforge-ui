import { OTPFieldInput, OTPFieldRoot } from '@vyrnforge/react/otp-field';

export function Example() {
  return (
    <OTPFieldRoot length={4} aria-label="Verification code">
      {[0, 1, 2, 3].map((index) => (
        <OTPFieldInput
          key={index}
          index={index}
          aria-label={`Verification code digit ${index + 1} of 4`}
        />
      ))}
    </OTPFieldRoot>
  );
}
