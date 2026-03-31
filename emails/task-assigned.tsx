import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

import { siteConfig } from "@/lib/config";

interface TaskAssignedEmailProps {
  assigneeName: string;
  assignerName: string;
  taskTitle: string;
  projectName: string;
  taskUrl: string;
  priority: "low" | "medium" | "high" | "urgent";
  appName?: string;
}

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "🚨 Urgent",
};

export function TaskAssignedEmail({ assigneeName, assignerName, taskTitle, projectName, taskUrl, priority, appName = siteConfig.name }: TaskAssignedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {assignerName} assigned you a task in {projectName}: {taskTitle}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>New task assigned to you</Heading>
          <Text style={text}>
            Hi {assigneeName}, {assignerName} has assigned you a task in <strong>{projectName}</strong>.
          </Text>

          <Section style={taskBox}>
            <Text style={taskTitle_}>
              <strong>{taskTitle}</strong>
            </Text>
            <Text style={metaText}>
              Priority: <span style={{ color: priority === "urgent" ? "#ef4444" : "#555555" }}>{priorityLabels[priority]}</span>
            </Text>
            <Text style={metaText}>Project: {projectName}</Text>
          </Section>

          <Section style={buttonSection}>
            <Button href={taskUrl} style={button}>
              View Task
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>This email was sent by {appName}. If you believe this was a mistake, please contact your project admin.</Text>
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

const taskBox = {
  backgroundColor: "#f4f4f5",
  borderRadius: "6px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: "4px solid #6366f1",
};

const taskTitle_ = { fontSize: "16px", color: "#111111", margin: "0 0 8px 0" };

const metaText = { fontSize: "13px", color: "#666666", margin: "4px 0" };

const buttonSection = { marginTop: "24px" };

const button = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
};

const hr = { borderColor: "#eeeeee", margin: "32px 0" };

const footer = { fontSize: "12px", color: "#999999" };

export default TaskAssignedEmail;
