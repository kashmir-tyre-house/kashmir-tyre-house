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
  expiresInMinutes = 15
}: ForgotPasswordEmailProps) {
  const digits = code.split("");

  return (
    <BaseEmail
      preview={`Your Kashmir Tyre House admin reset code is ${code}`}
      title="Reset your password"
    >
      {/* Greeting */}
      <Text style={greetingStyle}>
        Hi{name ? ` ${name}` : ""}, we received a request to reset the password
        for your Kashmir Tyre House admin account.
      </Text>

      {/* Code label */}
      <Text style={codeLabelStyle}>YOUR VERIFICATION CODE</Text>

      {/* OTP digits */}
      <Section style={codeRowStyle}>
        {digits.map((digit, index) => (
          <span key={index} style={index === 3 ? digitStyleWithGap : digitStyle}>
            {digit}
          </span>
        ))}
      </Section>

      {/* Expiry */}
      <Section style={expiryBadgeStyle}>
        <Text style={expiryTextStyle}>
          ⏱ This code expires in {expiresInMinutes} minutes
        </Text>
      </Section>

      <Hr style={dividerStyle} />

      {/* Instructions */}
      <Text style={instructionStyle}>
        Enter this code on the verification screen to continue resetting your
        password. If you did not request a password reset, you can safely ignore
        this email — your account remains secure.
      </Text>

      {/* Security note */}
      <Section style={securityBoxStyle}>
        <Text style={securityTextStyle}>
          🔒 Kashmir Tyre House staff will never ask you for this code. Do not
          share it with anyone.
        </Text>
      </Section>
    </BaseEmail>
  );
}

const greetingStyle = {
  color: "#6f6258",
  fontSize: "14px",
  lineHeight: "1.75",
  margin: "0 0 24px"
};

const codeLabelStyle = {
  color: "#8b7a6c",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  margin: "0 0 12px",
  textAlign: "center" as const
};

const codeRowStyle = {
  margin: "0 auto 16px",
  textAlign: "center" as const
};

const baseDigitStyle = {
  backgroundColor: "#f9eee4",
  border: "1.5px solid #ead9c9",
  borderRadius: "10px",
  color: "#231a12",
  display: "inline-block",
  fontSize: "28px",
  fontWeight: "700",
  height: "52px",
  letterSpacing: "0",
  lineHeight: "52px",
  margin: "0 4px",
  textAlign: "center" as const,
  width: "44px"
};

const digitStyle = baseDigitStyle;

const digitStyleWithGap = {
  ...baseDigitStyle,
  marginLeft: "14px"
};

const expiryBadgeStyle = {
  margin: "0 auto 24px",
  textAlign: "center" as const
};

const expiryTextStyle = {
  backgroundColor: "#fff4e0",
  border: "1px solid #f6d28a",
  borderRadius: "8px",
  color: "#7a4f00",
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
  padding: "6px 14px"
};

const dividerStyle = {
  borderColor: "#ead9c9",
  margin: "0 0 20px"
};

const instructionStyle = {
  color: "#6f6258",
  fontSize: "13px",
  lineHeight: "1.75",
  margin: "0 0 20px"
};

const securityBoxStyle = {
  backgroundColor: "#f3f2f6",
  borderRadius: "10px",
  padding: "12px 16px"
};

const securityTextStyle = {
  color: "#6e6d78",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0"
};
