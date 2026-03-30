import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

import { siteConfig } from "@/lib/config";

interface WelcomeEmailProps {
  username: string;
  loginUrl: string;
  appName?: string;
}

// TODO: update email copy (Preview, Heading, Text) to reference your app's actual name and messaging
export function WelcomeEmail({ username, loginUrl, appName = siteConfig.name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Welcome to {appName}, {username}!
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {username}!</Heading>
          <Text style={text}>Your account has been created. You can now sign in and get started.</Text>
          <Section style={buttonSection}>
            <Button href={loginUrl} style={button}>
              Sign in
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>If you did not create this account, you can safely ignore this email.</Text>
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

export default WelcomeEmail;
