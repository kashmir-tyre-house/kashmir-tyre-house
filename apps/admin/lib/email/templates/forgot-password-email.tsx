import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export type ForgotPasswordEmailProps = {
  name?: string;
  code: string;
  expiresInMinutes?: number;
  logoUrl?: string;
  recipientEmail?: string;
};

export function ForgotPasswordEmail({
  name,
  code,
  expiresInMinutes = 15,
  logoUrl,
  recipientEmail,
}: ForgotPasswordEmailProps) {
  const formattedCode = code.split("").join("  ");

  return (
    <Html lang="en">
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`}</style>
      </Head>
      <Preview>Your password reset code is {code}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* ── Top bar ── */}
          <Section style={topBarStyle}>
            <Row>
              {/* <Column>
                {logoUrl ? (
                  <Img src={logoUrl} height={44} alt="KTHPL" style={{ display: "block" }} />
                ) : (
                  <Text style={logoFallbackStyle}>KTHPL</Text>
                )}
              </Column> */}
              <Column style={{ textAlign: "right" }}>
                <Text style={topTagStyle}>Security Notice</Text>
              </Column>
            </Row>
          </Section>

          {/* ── Card ── */}
          <Section style={cardStyle}>
            {/* Hero band */}
            <Section style={heroStyle}>
              <Text style={heroEyebrowStyle}>Password Reset</Text>
              <Text style={heroTitleStyle}>
                Your one-time
                <br />
                <span style={{ fontWeight: 500 }}>verification code</span>
              </Text>
            </Section>

            {/* Body */}
            <Section style={cardBodyStyle}>
              <Text style={greetingStyle}>Hello, {name || "there"}</Text>
              <Text style={messageStyle}>
                We received a request to reset the password associated with your
                account. Use the code below to proceed. If you did not make this
                request, you can safely ignore this email.
              </Text>

              {/* Short divider */}
              <Row style={{ paddingTop: "32px", paddingBottom: "32px" }}>
                <Column
                  style={{
                    maxWidth: "40px",
                    borderBottom: "1px solid #E8E4DC",
                    fontSize: "0",
                    lineHeight: "0",
                  }}
                >
                  &nbsp;
                </Column>
                <Column />
              </Row>

              <Text style={otpLabelStyle}>One-Time Passcode</Text>

              {/* OTP box */}
              <Section style={otpBoxStyle}>
                <Text style={otpDigitsStyle}>{formattedCode}</Text>
              </Section>

              {/* Expiry */}
              <Row style={{ paddingTop: "16px" }}>
                <Column style={{ width: "16px" }}>
                  <Text style={expiryDotStyle}>●</Text>
                </Column>
                <Column>
                  <Text style={expiryTextStyle}>
                    This code expires in{" "}
                    <strong style={{ color: "#555555", fontWeight: 500 }}>
                      {expiresInMinutes} minutes
                    </strong>{" "}
                    and can only be used once.
                  </Text>
                </Column>
              </Row>

              {/* Warning block */}
              <Section style={warningBlockStyle}>
                <Row>
                  <Column>
                    <Text style={warningTextStyle}>
                      <strong style={{ color: "#444444", fontWeight: 500 }}>
                        Never share this code
                      </strong>{" "}
                      with anyone — including KTHPL support staff. We will never
                      ask for your OTP over phone, email, or chat.
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* Card footer */}
            <Section style={cardFooterStyle}>
              <Row>
                <Column>
                  {recipientEmail ? (
                    <Text style={footerNoteStyle}>
                      This email was sent to{" "}
                      <span style={{ color: "#C8A96E" }}>{recipientEmail}</span>
                      .
                    </Text>
                  ) : null}
                </Column>
                <Column style={{ textAlign: "right", width: "80px" }}>
                  <Text style={badgeSecureStyle}>Secured</Text>
                  <Row>
                    <Column
                      style={{
                        borderBottom: "1px solid #E8E4DC",
                        fontSize: "0",
                        lineHeight: "0",
                      }}
                    >
                      &nbsp;
                    </Column>
                  </Row>
                </Column>
              </Row>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#F2F0EB",
  fontFamily:
    "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: "0",
  padding: "0",
};

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "48px 16px 48px",
};

const topBarStyle = {
  paddingBottom: "24px",
};

const logoFallbackStyle = {
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontSize: "14px",
  fontWeight: "700" as const,
  color: "#1A1A1A",
  margin: "0",
};

const topTagStyle = {
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "#999999",
  margin: "0",
};

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "2px",
};

const heroStyle = {
  backgroundColor: "#1A1A1A",
  padding: "48px 48px 44px",
};

const heroEyebrowStyle = {
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontSize: "10px",
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  color: "#C8A96E",
  margin: "0 0 16px",
};

const heroTitleStyle = {
  fontSize: "28px",
  fontWeight: "300" as const,
  color: "#FFFFFF",
  lineHeight: "1.3",
  letterSpacing: "-0.02em",
  margin: "0",
};

const cardBodyStyle = {
  padding: "44px 48px",
};

const greetingStyle = {
  fontSize: "15px",
  fontWeight: "400" as const,
  color: "#1A1A1A",
  margin: "0 0 16px",
};

const messageStyle = {
  fontSize: "14px",
  fontWeight: "300" as const,
  color: "#555555",
  lineHeight: "1.75",
  margin: "0",
};

const otpLabelStyle = {
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontSize: "10px",
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  color: "#999999",
  margin: "0 0 14px",
};

const otpBoxStyle = {
  backgroundColor: "#F8F7F4",
  border: "1px solid #E8E4DC",
  borderLeft: "3px solid #C8A96E",
  borderRadius: "2px",
  padding: "13px 22px",
};

const otpDigitsStyle = {
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontSize: "24px",
  fontWeight: "500" as const,
  letterSpacing: "0.25em",
  color: "#1A1A1A",
  margin: "0",
};

const expiryDotStyle = {
  fontSize: "8px",
  color: "#C8A96E",
  margin: "0",
  lineHeight: "1.8",
};

const expiryTextStyle = {
  fontSize: "12px",
  color: "#999999",
  fontWeight: "300" as const,
  letterSpacing: "0.02em",
  margin: "0",
};

const warningBlockStyle = {
  marginTop: "36px",
  backgroundColor: "#FBF9F5",
  border: "1px solid #EDE8DC",
  borderRadius: "2px",
  padding: "18px 22px",
};

const warningTextStyle = {
  fontSize: "12px",
  color: "#777777",
  lineHeight: "1.7",
  fontWeight: "300" as const,
  margin: "0",
};

const cardFooterStyle = {
  borderTop: "1px solid #F0EDE7",
  padding: "28px 48px",
};

const footerNoteStyle = {
  fontSize: "11px",
  color: "#AAAAAA",
  fontWeight: "300" as const,
  lineHeight: "1.6",
  margin: "0",
};

const badgeSecureStyle = {
  fontFamily: "'DM Mono', 'Courier New', monospace",
  fontSize: "9px",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
  color: "#C8A96E",
  margin: "0 0 4px",
};
