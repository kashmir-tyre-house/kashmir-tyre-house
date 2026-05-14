import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from "@react-email/components";
import type { ReactNode } from "react";

type BaseEmailProps = {
  children: ReactNode;
  preview: string;
  title: string;
};

export function BaseEmail({ children, preview, title }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={brandBarStyle}>
            <Text style={brandTextStyle}>Kashmir Tyre House</Text>
          </Section>
          <Heading style={headingStyle}>{title}</Heading>
          <Section>{children}</Section>
          <Hr style={dividerStyle} />
          <Text style={footerStyle}>Kashmir Tyre House Private Limited</Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#f9eee4",
  color: "#231a12",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: "0",
  padding: "32px 16px"
};

const containerStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #ead9c9",
  borderRadius: "18px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px"
};

const brandBarStyle = {
  backgroundColor: "#2d2c33",
  borderRadius: "12px",
  marginBottom: "24px",
  padding: "14px 16px"
};

const brandTextStyle = {
  color: "#fff8f5",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.04em",
  margin: "0"
};

const headingStyle = {
  color: "#231a12",
  fontSize: "26px",
  lineHeight: "1.2",
  margin: "0 0 18px"
};

const dividerStyle = {
  borderColor: "#ead9c9",
  margin: "28px 0 18px"
};

const footerStyle = {
  color: "#8b7a6c",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0"
};
