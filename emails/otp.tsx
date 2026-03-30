import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

interface OtpEmailProps {
  otpCode: string;
  expiresInMinutes?: number;
}

export function OtpEmail({ otpCode, expiresInMinutes = 10 }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code: {otpCode}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Your verification code</Heading>
          <Text style={text}>Enter the code below to sign in. This code expires in {expiresInMinutes} minutes and can only be used once.</Text>
          <Section style={codeSection}>
            <Text style={code}>{otpCode}</Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>If you did not request this code, you can safely ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#f9f9f9", fontFamily: "sans-serif" };

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "40px",
  borderRadius: "8px",
  maxWidth: "600px",
};

const heading = { fontSize: "24px", color: "#111111", marginBottom: "8px" };

const text = { fontSize: "16px", lineHeight: "1.6", color: "#555555" };

const codeSection = { marginTop: "24px", textAlign: "center" as const };

const code = {
  fontSize: "32px",
  fontWeight: "700",
  letterSpacing: "6px",
  color: "#111111",
  backgroundColor: "#f4f4f4",
  padding: "16px 24px",
  borderRadius: "6px",
  display: "inline-block",
};

const hr = { borderColor: "#eeeeee", margin: "32px 0" };

const footer = { fontSize: "12px", color: "#999999" };

export default OtpEmail;
