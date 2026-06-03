import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

export type EnquiryEmailProduct = {
  id: string;
  name: string;
  tyreSize?: string | null;
  category?: string | null;
  pattern?: string | null;
};

export type EnquiryEmailProps = {
  customerName: string;
  phone: string;
  email?: string;
  companyName?: string;
  message?: string;
  products?: EnquiryEmailProduct[];
  enquiryId?: string;
  createdAt?: Date | string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

function formatRef(enquiryId?: string) {
  if (!enquiryId) return null;
  return `ENQ-${enquiryId.slice(0, 8).toUpperCase()}`;
}

function formatDate(createdAt?: Date | string) {
  if (!createdAt) return null;
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return DATE_FORMATTER.format(date);
}

function productSpec(p: EnquiryEmailProduct) {
  return [p.tyreSize, p.category, p.pattern].filter(Boolean).join(" · ");
}

export function EnquiryEmail({
  customerName,
  phone,
  email,
  companyName,
  message,
  products = [],
  enquiryId,
  createdAt,
}: EnquiryEmailProps) {
  const ref = formatRef(enquiryId);
  const dateLabel = formatDate(createdAt);
  const meta = [ref, dateLabel].filter(Boolean).join("  ·  ");

  return (
    <Html>
      <Head>
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/dmsans/v15/rP2Cp2ywxg089UriAWCrCBimC2QU.woff2",
            format: "woff2",
          }}
          fontWeight={300}
          fontStyle="normal"
        />
        <Font
          fontFamily="DM Sans"
          fallbackFontFamily={["Helvetica", "Arial", "sans-serif"]}
          webFont={{
            url: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZ2IHTWEBlw.woff2",
            format: "woff2",
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        <Font
          fontFamily="DM Mono"
          fallbackFontFamily="monospace"
          webFont={{
            url: "https://fonts.gstatic.com/s/dmmono/v14/aFTU7PB1QTsUX8KYhh2aBYyMcKw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{`New enquiry from ${customerName}${companyName ? ` · ${companyName}` : ""}`}</Preview>
      <Body style={bodyStyle}>
        <Container style={cardStyle}>
          {/* ── Hero ─────────────────────────────────────────── */}
          <Section style={heroStyle}>
            {/* Diagonal accent stripe — uses table cell with linear gradient */}
            <div style={heroStripeStyle} />
            {/* Dot pattern */}
            <div style={heroDotsStyle} />

            <div style={heroContentStyle}>
              <Text style={heroEyebrowStyle}>NEW PRODUCT ENQUIRY</Text>
              <Text style={heroTitleStyle}>
                A customer wants to{" "}
                <span style={heroTitleStrongStyle}>know more about your tyres</span>
              </Text>
              {meta ? <Text style={heroMetaStyle}>{meta}</Text> : null}
            </div>
          </Section>

          {/* ── Body ─────────────────────────────────────────── */}
          <Section style={cardBodyStyle}>
            {/* Customer Details */}
            <SectionLabel>CUSTOMER DETAILS</SectionLabel>

            <Section style={detailGridStyle}>
              <Row>
                <Column
                  style={{
                    ...detailCellStyle,
                    ...detailCellRightStyle,
                    ...detailCellBottomStyle,
                  }}
                >
                  <Text style={cellKeyStyle}>FULL NAME</Text>
                  <Text style={cellValStyle}>{customerName}</Text>
                </Column>
                <Column style={{ ...detailCellStyle, ...detailCellBottomStyle }}>
                  <Text style={cellKeyStyle}>EMAIL ADDRESS</Text>
                  <Text style={cellValStyle}>{email ?? "—"}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={{ ...detailCellStyle, ...detailCellRightStyle }}>
                  <Text style={cellKeyStyle}>PHONE NUMBER</Text>
                  <Text style={cellValStyle}>{phone}</Text>
                </Column>
                <Column style={detailCellStyle}>
                  <Text style={cellKeyStyle}>COMPANY NAME</Text>
                  <Text style={cellValStyle}>{companyName ?? "—"}</Text>
                </Column>
              </Row>
            </Section>

            {/* Message */}
            {message ? (
              <Section style={blockSpacerStyle}>
                <SectionLabel>MESSAGE FROM CUSTOMER</SectionLabel>
                <Section style={messageBoxStyle}>
                  <Text style={messageTextStyle}>{message}</Text>
                </Section>
              </Section>
            ) : null}

            {/* Products */}
            {products.length > 0 ? (
              <Section style={blockSpacerStyle}>
                <SectionLabel>ENQUIRED PRODUCTS</SectionLabel>

                <Section style={productsTableStyle}>
                  <Row style={productsHeaderRowStyle}>
                    <Column style={{ ...productsHeaderCellStyle, width: "40%" }}>
                      PRODUCT ID
                    </Column>
                    <Column style={productsHeaderCellStyle}>
                      PRODUCT NAME &amp; SPEC
                    </Column>
                  </Row>
                  {products.map((p, index) => {
                    const spec = productSpec(p);
                    const isAlt = index % 2 === 1;
                    return (
                      <Row
                        key={p.id}
                        style={isAlt ? productsRowAltStyle : productsRowStyle}
                      >
                        <Column
                          style={{
                            ...productsCellStyle,
                            ...productsIdCellStyle,
                            width: "40%",
                          }}
                        >
                          {`KTHPL-${p.id.slice(0, 8).toUpperCase()}`}
                        </Column>
                        <Column style={productsCellStyle}>
                          <Text style={productNameStyle}>{p.name}</Text>
                          {spec ? <Text style={productSpecStyle}>{spec}</Text> : null}
                        </Column>
                      </Row>
                    );
                  })}
                </Section>
              </Section>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Section label component (label + divider line on the same row) ─────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      width="100%"
      style={sectionLabelTableStyle}
    >
      <tbody>
        <tr>
          <td style={sectionLabelTextStyle}>{children}</td>
          <td style={sectionLabelLineCellStyle}>
            <div style={sectionLabelLineStyle} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const FONT_SANS =
  "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const FONT_MONO =
  "'DM Mono', 'SF Mono', Menlo, Consolas, 'Courier New', monospace";

const bodyStyle = {
  backgroundColor: "#EDEAE4",
  color: "#1A1A1A",
  fontFamily: FONT_SANS,
  margin: "0",
  padding: "44px 16px",
};

const cardStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: "2px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 10px 48px rgba(0,0,0,0.06)",
  margin: "0 auto",
  maxWidth: "620px",
  overflow: "hidden",
  padding: "0",
};

// ── Hero ───────────────────────────────────────────────────────────────────
const heroStyle = {
  backgroundColor: "#111111",
  position: "relative" as const,
  overflow: "hidden" as const,
  padding: "0",
};

const heroStripeStyle = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  width: "38%",
  background:
    "linear-gradient(135deg, transparent 30%, rgba(200,169,110,0.09) 100%)",
  pointerEvents: "none" as const,
};

const heroDotsStyle = {
  position: "absolute" as const,
  right: "24px",
  bottom: "16px",
  width: "80px",
  height: "80px",
  backgroundImage:
    "radial-gradient(circle, rgba(200,169,110,0.18) 1.5px, transparent 1.5px)",
  backgroundSize: "10px 10px",
  pointerEvents: "none" as const,
};

const heroContentStyle = {
  padding: "34px 44px",
  position: "relative" as const,
  zIndex: 1,
};

const heroEyebrowStyle = {
  color: "#C8A96E",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.28em",
  margin: "0",
  textTransform: "uppercase" as const,
};

const heroTitleStyle = {
  color: "#FFFFFF",
  fontFamily: FONT_SANS,
  fontSize: "22px",
  fontWeight: 300,
  letterSpacing: "-0.01em",
  lineHeight: "1.35",
  margin: "10px 0 0",
};

const heroTitleStrongStyle = {
  fontWeight: 500,
};

const heroMetaStyle = {
  color: "#555555",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
  margin: "10px 0 0",
};

// ── Body ───────────────────────────────────────────────────────────────────
const cardBodyStyle = {
  padding: "36px 44px",
};

// ── Section label (label + line) ──────────────────────────────────────────
const sectionLabelTableStyle = {
  borderCollapse: "collapse" as const,
  margin: "0 0 14px",
  width: "100%",
};

const sectionLabelTextStyle = {
  color: "#C8A96E",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.28em",
  paddingRight: "10px",
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
  width: "1%",
  verticalAlign: "middle" as const,
};

const sectionLabelLineCellStyle = {
  verticalAlign: "middle" as const,
  width: "auto",
};

const sectionLabelLineStyle = {
  backgroundColor: "#F0ECE4",
  height: "1px",
  width: "100%",
  fontSize: "1px",
  lineHeight: "1px",
};

const blockSpacerStyle = {
  marginTop: "30px",
};

// ── Detail grid ───────────────────────────────────────────────────────────
const detailGridStyle = {
  border: "1px solid #EDEAE4",
  borderRadius: "2px",
  borderCollapse: "collapse" as const,
};

const detailCellStyle = {
  padding: "14px 18px",
  verticalAlign: "top" as const,
  width: "50%",
};

const detailCellRightStyle = {
  borderRight: "1px solid #EDEAE4",
};

const detailCellBottomStyle = {
  borderBottom: "1px solid #EDEAE4",
};

const cellKeyStyle = {
  color: "#BBAA99",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.22em",
  margin: "0 0 5px",
  textTransform: "uppercase" as const,
};

const cellValStyle = {
  color: "#1A1A1A",
  fontFamily: FONT_SANS,
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};

// ── Message box ───────────────────────────────────────────────────────────
const messageBoxStyle = {
  backgroundColor: "#F8F6F2",
  border: "1px solid #EDEAE4",
  borderLeft: "3px solid #C8A96E",
  padding: "16px 20px",
};

const messageTextStyle = {
  color: "#444444",
  fontFamily: FONT_SANS,
  fontSize: "13px",
  fontWeight: 300,
  lineHeight: "1.8",
  margin: "0",
};

// ── Products table ────────────────────────────────────────────────────────
const productsTableStyle = {
  borderCollapse: "collapse" as const,
};

const productsHeaderRowStyle = {
  backgroundColor: "#111111",
};

const productsHeaderCellStyle = {
  color: "#C8A96E",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  fontWeight: 400,
  letterSpacing: "0.22em",
  padding: "10px 14px",
  textAlign: "left" as const,
  textTransform: "uppercase" as const,
};

const productsRowStyle = {
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid #F0EDE7",
};

const productsRowAltStyle = {
  backgroundColor: "#FAFAF8",
  borderBottom: "1px solid #F0EDE7",
};

const productsCellStyle = {
  color: "#1A1A1A",
  fontFamily: FONT_SANS,
  fontSize: "13px",
  padding: "13px 14px",
  verticalAlign: "middle" as const,
};

const productsIdCellStyle = {
  color: "#888888",
  fontFamily: FONT_MONO,
  fontSize: "11px",
  letterSpacing: "0.08em",
};

const productNameStyle = {
  color: "#1A1A1A",
  fontFamily: FONT_SANS,
  fontSize: "13px",
  margin: "0",
};

const productSpecStyle = {
  color: "#AAAAAA",
  fontFamily: FONT_SANS,
  fontSize: "11px",
  fontWeight: 300,
  margin: "2px 0 0",
};