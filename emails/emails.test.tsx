import { render } from "@react-email/components";
import { describe, expect, it } from "vitest";

import { OtpEmail } from "@/emails/otp";
import { ResetPasswordEmail } from "@/emails/reset-password";
import { WelcomeEmail } from "@/emails/welcome";

describe("WelcomeEmail", () => {
  it("renders username and login URL", async () => {
    const html = await render(<WelcomeEmail username="Alice" loginUrl="https://example.com/login" />);
    expect(html).toContain("Alice");
    expect(html).toContain("https://example.com/login");
    expect(html).toContain("Sign in");
  });

  it("renders plain text version", async () => {
    const text = await render(<WelcomeEmail username="Bob" loginUrl="https://example.com/login" />, { plainText: true });
    expect(text.toLowerCase()).toContain("bob");
    expect(text).toContain("https://example.com/login");
  });
});

describe("ResetPasswordEmail", () => {
  it("renders reset URL", async () => {
    const html = await render(<ResetPasswordEmail resetUrl="https://example.com/reset?token=abc" />);
    expect(html).toContain("https://example.com/reset?token=abc");
    expect(html).toContain("Reset password");
  });

  it("renders default expiry in plain text", async () => {
    const text = await render(<ResetPasswordEmail resetUrl="https://example.com/reset" />, { plainText: true });
    expect(text).toContain("60 minutes");
  });

  it("renders custom expiry in plain text", async () => {
    const text = await render(<ResetPasswordEmail resetUrl="https://example.com/reset" expiresInMinutes={30} />, { plainText: true });
    expect(text).toContain("30 minutes");
  });
});

describe("OtpEmail", () => {
  it("renders OTP code", async () => {
    const html = await render(<OtpEmail otpCode="123456" />);
    expect(html).toContain("123456");
  });

  it("renders default expiry in plain text", async () => {
    const text = await render(<OtpEmail otpCode="123456" />, { plainText: true });
    expect(text).toContain("10 minutes");
  });

  it("renders custom expiry in plain text", async () => {
    const text = await render(<OtpEmail otpCode="999999" expiresInMinutes={5} />, { plainText: true });
    expect(text).toContain("5 minutes");
  });

  it("includes OTP in plain text", async () => {
    const text = await render(<OtpEmail otpCode="654321" />, { plainText: true });
    expect(text).toContain("654321");
  });
});
