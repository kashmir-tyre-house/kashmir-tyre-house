import { Hr, Section, Text } from "@react-email/components";

import { BaseEmail } from "./base-email";

export type ForgotPasswordEmailProps = {
  name?: string;
  code: string;
  expiresInMinutes?: number;
};

export function ForgotPasswordEmail({
  name,
  code,
  expiresInMinutes = 15,
}: ForgotPasswordEmailProps) {
  const digits = code.split("");

  return (
    <BaseEmail
      preview={`Your password reset code is ${code}`}
      title="Reset your password"
    >
      {/* Eyebrow */}
      <Text style={eyebrowStyle}>KASHMIR TYRE HOUSE · ADMIN PORTAL</Text>

      {/* Heading */}
      <Text style={headingStyle}>Password Reset</Text>

      <Hr style={thickDividerStyle} />

      {/* Greeting */}
      <Text style={bodyStyle}>Hi{name ? ` ${name}` : ""},</Text>
      <Text style={bodyStyle}>
        We received a request to reset the password for your account. Use the
        verification code below to proceed. If you did not initiate this
        request, no action is required — your account remains secure.
      </Text>

      {/* Code label */}
      <Text style={codeLabelStyle}>VERIFICATION CODE</Text>

      {/* OTP digits */}
      <Section style={codeRowStyle}>
        {digits.map((digit, index) => (
          <span
            key={index}
            style={index === 3 ? digitStyleWithGap : digitStyle}
          >
            {digit}
          </span>
        ))}
      </Section>

      {/* Expiry */}
      <Text style={expiryStyle}>
        This code expires in {expiresInMinutes} minutes.
      </Text>

      <Hr style={thinDividerStyle} />

      {/* Security note */}
      <Text style={footerStyle}>
        Kashmir Tyre House staff will never ask you for this code. Do not share
        it with anyone.
      </Text>
    </BaseEmail>
  );
}

const eyebrowStyle = {
  color: "#000000",
  fontSize: "9px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  margin: "0 0 20px",
};

const headingStyle = {
  color: "#000000",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  lineHeight: "1.1",
  margin: "0 0 20px",
};

const thickDividerStyle = {
  borderColor: "#000000",
  borderWidth: "2px",
  margin: "0 0 28px",
};

const thinDividerStyle = {
  borderColor: "#d0d0d0",
  margin: "28px 0 20px",
};

const bodyStyle = {
  color: "#000000",
  fontSize: "14px",
  lineHeight: "1.7",
  margin: "0 0 14px",
};

const codeLabelStyle = {
  color: "#000000",
  fontSize: "9px",
  fontWeight: "700",
  letterSpacing: "0.18em",
  margin: "28px 0 14px",
};

const codeRowStyle = {
  margin: "0 0 12px",
};

const baseDigitStyle = {
  border: "1.5px solid #000000",
  borderRadius: "0px",
  color: "#000000",
  display: "inline-block",
  fontSize: "26px",
  fontWeight: "700",
  height: "52px",
  letterSpacing: "0",
  lineHeight: "52px",
  margin: "0 4px 0 0",
  textAlign: "center" as const,
  width: "44px",
  backgroundColor: "#ffffff",
};

const digitStyle = baseDigitStyle;

const digitStyleWithGap = {
  ...baseDigitStyle,
  marginLeft: "16px",
};

const expiryStyle = {
  color: "#000000",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.02em",
  margin: "10px 0 0",
};

const footerStyle = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "1.65",
  margin: "0",
};
