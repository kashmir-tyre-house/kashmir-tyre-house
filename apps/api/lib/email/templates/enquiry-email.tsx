import {
  Column,
  Hr,
  Img,
  Row,
  Section,
  Text
} from "@react-email/components";

import { BaseEmail } from "./base-email";

export type EnquiryEmailProps = {
  customerName: string;
  phone: string;
  email?: string;
  companyName?: string;
  message?: string;
  products?: Array<{
    id: string;
    name: string;
  }>;
};

export function EnquiryEmail({
  customerName,
  phone,
  email,
  companyName,
  message,
  products = []
}: EnquiryEmailProps) {
  return (
    <BaseEmail
      preview={`New enquiry from ${customerName}${companyName ? ` · ${companyName}` : ""}`}
      title="New Enquiry Received"
    >
      {/* Intro */}
      <Text style={introStyle}>
        A new product enquiry has been submitted through the Kashmir Tyre House
        website. Review the details below and follow up promptly.
      </Text>

      {/* Customer details card */}
      <Section style={cardStyle}>
        <Text style={cardLabelStyle}>CUSTOMER DETAILS</Text>
        <Hr style={cardDividerStyle} />

        <Row style={fieldRowStyle}>
          <Column style={fieldLabelColStyle}>
            <Text style={fieldLabelStyle}>Name</Text>
          </Column>
          <Column>
            <Text style={fieldValueStyle}>{customerName}</Text>
          </Column>
        </Row>

        <Row style={fieldRowStyle}>
          <Column style={fieldLabelColStyle}>
            <Text style={fieldLabelStyle}>Phone</Text>
          </Column>
          <Column>
            <Text style={fieldValueStyle}>{phone}</Text>
          </Column>
        </Row>

        <Row style={fieldRowStyle}>
          <Column style={fieldLabelColStyle}>
            <Text style={fieldLabelStyle}>Email</Text>
          </Column>
          <Column>
            <Text style={fieldValueStyle}>{email ?? "N/A"}</Text>
          </Column>
        </Row>

        <Row style={fieldRowStyle}>
          <Column style={fieldLabelColStyle}>
            <Text style={fieldLabelStyle}>Company</Text>
          </Column>
          <Column>
            <Text style={fieldValueStyle}>{companyName ?? "N/A"}</Text>
          </Column>
        </Row>
      </Section>

      {/* Products */}
      {products.length > 0 ? (
        <Section style={{ marginTop: "20px" }}>
          <Text style={cardLabelStyle}>ENQUIRED PRODUCTS</Text>
          <Hr style={cardDividerStyle} />
          {products.map((product, index) => (
            <Section key={index} style={productRowStyle}>
              <Row>
                <Column style={productIndexColStyle}>
                  <Text style={productIndexStyle}>{index + 1}</Text>
                </Column>
                <Column>
                  <Text style={productNameStyle}>{product.name}</Text>
                  <Text style={productIdStyle}>{product.id}</Text>
                </Column>
              </Row>
            </Section>
          ))}
        </Section>
      ) : null}

      {/* Message */}
      {message ? (
        <Section style={{ marginTop: "20px" }}>
          <Text style={cardLabelStyle}>MESSAGE</Text>
          <Hr style={cardDividerStyle} />
          <Section style={messageBoxStyle}>
            <Text style={messageTextStyle}>{message}</Text>
          </Section>
        </Section>
      ) : null}

      {/* CTA note */}
      <Section style={ctaBoxStyle}>
        <Text style={ctaTextStyle}>
          Log in to the admin portal to update the enquiry status and track
          follow-up actions.
        </Text>
      </Section>
    </BaseEmail>
  );
}

const introStyle = {
  color: "#6f6258",
  fontSize: "14px",
  lineHeight: "1.75",
  margin: "0 0 20px"
};

const cardStyle = {
  backgroundColor: "#fffaf6",
  border: "1px solid #ead9c9",
  borderRadius: "12px",
  padding: "18px 20px"
};

const cardLabelStyle = {
  color: "#8b7a6c",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  margin: "0 0 10px"
};

const cardDividerStyle = {
  borderColor: "#ead9c9",
  margin: "0 0 14px"
};

const fieldRowStyle = {
  marginBottom: "10px"
};

const fieldLabelColStyle = {
  width: "100px"
};

const fieldLabelStyle = {
  color: "#8b7a6c",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0"
};

const fieldValueStyle = {
  color: "#231a12",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0"
};

const productRowStyle = {
  backgroundColor: "#fffaf6",
  border: "1px solid #ead9c9",
  borderRadius: "10px",
  marginBottom: "8px",
  padding: "12px 16px"
};

const productIndexColStyle = {
  width: "32px"
};

const productIndexStyle = {
  backgroundColor: "#f69300",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "700",
  margin: "0",
  padding: "2px 7px",
  textAlign: "center" as const
};

const productNameStyle = {
  color: "#231a12",
  fontSize: "13px",
  fontWeight: "600",
  margin: "0 0 2px"
};

const productIdStyle = {
  color: "#8b7a6c",
  fontFamily: "monospace",
  fontSize: "11px",
  margin: "0"
};

const messageBoxStyle = {
  backgroundColor: "#fffaf6",
  border: "1px solid #ead9c9",
  borderLeft: "3px solid #f69300",
  borderRadius: "10px",
  padding: "14px 16px"
};

const messageTextStyle = {
  color: "#544434",
  fontSize: "14px",
  lineHeight: "1.75",
  margin: "0",
  whiteSpace: "pre-line" as const
};

const ctaBoxStyle = {
  backgroundColor: "#f3f2f6",
  borderRadius: "10px",
  marginTop: "20px",
  padding: "14px 18px"
};

const ctaTextStyle = {
  color: "#6e6d78",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0"
};
