import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

interface ResetPasswordEmailProps {
  resetUrl: string;
  expiresInMinutes?: number;
}

export function ResetPasswordEmail({ resetUrl, expiresInMinutes = 60 }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={text}>We received a request to reset your password. Click the button below to choose a new one. This link expires in {expiresInMinutes} minutes.</Text>
          <Section style={buttonSection}>
            <Button href={resetUrl} style={button}>
              Reset password
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>If you did not request a password reset, you can safely ignore this email.</Text>
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

const buttonSection = { marginTop: "24px" };

const button = {
  backgroundColor: "#111111",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
};

const hr = { borderColor: "#eeeeee", margin: "32px 0" };

const footer = { fontSize: "12px", color: "#999999" };

export default ResetPasswordEmail;
