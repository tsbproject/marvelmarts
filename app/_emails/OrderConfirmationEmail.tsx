import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

export const OrderConfirmationEmail = ({ order }: { order: any }) => (
  <Html>
    <Head />
    <Preview>Your MarvelMarts order #{order.orderNumber} is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
           <Text style={logoText}>MARVEL<span style={logoAccent}>MARTS</span></Text>
        </Section>
        
        <Heading style={heading}>Order Confirmed.</Heading>
        <Text style={paragraph}>
          Hi {order.firstName}, thank you for your purchase! We're getting your order ready for shipment. You'll receive another email when your items are on the way.
        </Text>

        <Section style={orderInfoSection}>
          <Text style={orderInfoTitle}>Order Number</Text>
          <Text style={orderInfoValue}>{order.orderNumber}</Text>
        </Section>

        <Hr style={hr} />

        <Section>
          {order.items.map((item: any) => (
            <Row key={item.id} style={{ marginBottom: "20px" }}>
              <Column style={{ width: "64px" }}>
                <Img
                  src={item.imageUrl}
                  width="64"
                  height="64"
                  alt={item.title}
                  style={productImage}
                />
              </Column>
              <Column style={{ paddingLeft: "20px" }}>
                <Text style={productTitle}>{item.title}</Text>
                <Text style={productDetails}>Qty: {item.qty} | ₦{Number(item.unitPrice).toLocaleString()}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Hr style={hr} />

        <Section style={totalSection}>
          <Row>
            <Column><Text style={totalLabel}>Total</Text></Column>
            <Column align="right">
              <Text style={totalValue}>₦{Number(order.total).toLocaleString()}</Text>
            </Column>
          </Row>
        </Section>

        <Text style={footer}>
          MarvelMarts | Lagos, Nigeria | https://marvelmarts.vercel.app
        </Text>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

// --- STYLES ---
const main = { backgroundColor: "#ffffff", fontFamily: 'Inter, -apple-system, sans-serif' };
const container = { margin: "0 auto", padding: "20px 0 48px", width: "580px" };
const headerSection = { padding: "32px 0" };
const logoText = { fontSize: "24px", fontWeight: "900", fontStyle: "italic", letterSpacing: "-1px" };
const logoAccent = { color: "#2563eb" };
const heading = { fontSize: "32px", fontWeight: "900", fontStyle: "italic", textTransform: "uppercase" as const, letterSpacing: "-1px", margin: "16px 0" };
const paragraph = { fontSize: "16px", lineHeight: "26px", color: "#4b5563" };
const orderInfoSection = { background: "#f9fafb", padding: "24px", borderRadius: "16px", margin: "24px 0" };
const orderInfoTitle = { fontSize: "10px", fontWeight: "900", textTransform: "uppercase" as const, color: "#9ca3af", letterSpacing: "1px", margin: "0 0 4px" };
const orderInfoValue = { fontSize: "18px", fontWeight: "900", color: "#111827", margin: "0" };
const productImage = { borderRadius: "12px", objectFit: "cover" as const };
const productTitle = { fontSize: "14px", fontWeight: "800", margin: "0", textTransform: "uppercase" as const };
const productDetails = { fontSize: "12px", color: "#6b7280", margin: "4px 0 0" };
const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const totalSection = { marginTop: "20px" };
const totalLabel = { fontSize: "16px", fontWeight: "900", textTransform: "uppercase" as const };
const totalValue = { fontSize: "24px", fontWeight: "900", color: "#2563eb", fontStyle: "italic" };
const footer = { fontSize: "12px", color: "#9ca3af", textAlign: "center" as const, marginTop: "48px" };