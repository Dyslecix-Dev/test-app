# Email

## Stack

- **Sending**: Resend (`resend`)
- **Templates**: React Email (`@react-email/components`)
- **Preview**: `react-email` dev server

## Architecture

```text
emails/                     # React Email template components
  welcome.tsx
  reset-password.tsx
  otp.tsx
lib/email/index.ts          # Resend client + sendEmail() helper
```

Never instantiate `Resend` directly in feature code. Use `sendEmail()` or `createEmailClient()` from `@/lib/email`.

## Sending Email

Use `sendEmail()` from `@/lib/email`. It renders both HTML and plain-text versions automatically from your React Email template:

```ts
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/emails/welcome";

await sendEmail({
  from: "My App <hello@yourdomain.com>",
  to: user.email,
  subject: "Welcome!",
  template: <WelcomeEmail username={user.name} loginUrl="https://yourdomain.com/auth/login" />,
});
```

Call `sendEmail()` from a Server Action or Route Handler — never from a Client Component.

## Available Templates

| Template       | File                        | Props                           |
| -------------- | --------------------------- | ------------------------------- |
| Welcome        | `emails/welcome.tsx`        | `username`, `loginUrl`          |
| Password reset | `emails/reset-password.tsx` | `resetUrl`, `expiresInMinutes?` |
| OTP code       | `emails/otp.tsx`            | `otp`, `expiresInMinutes?`      |

## Adding a Template

1. Create a new file in `emails/` (e.g., `emails/invoice.tsx`)
2. Build it with React Email components from `@react-email/components`
3. Export a default and a named export

```tsx
// emails/invoice.tsx
import { Body, Container, Head, Heading, Html, Text } from "@react-email/components";

interface InvoiceEmailProps {
  invoiceNumber: string;
  total: string;
}

export function InvoiceEmail({ invoiceNumber, total }: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Invoice #{invoiceNumber}</Heading>
          <Text>Total due: {total}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InvoiceEmail;
```

4. Use it with `sendEmail()`:

```ts
import { InvoiceEmail } from "@/emails/invoice";

await sendEmail({
  from: "Billing <billing@yourdomain.com>",
  to: customer.email,
  subject: `Invoice #${invoice.number}`,
  template: <InvoiceEmail invoiceNumber={invoice.number} total={invoice.total} />,
});
```

## Previewing Templates

Run the React Email dev server to preview templates in your browser with live reload:

```bash
pnpm email:dev
```

Open [http://localhost:3001](http://localhost:3001) to preview all templates in `emails/`.

## `render` Import

`render` is re-exported from `@react-email/components` — do not install or import from `@react-email/render` separately:

```ts
// correct
import { render } from "@react-email/components";

// do not use
import { render } from "@react-email/render";
```

## Setting Up Resend

1. Create a [Resend](https://resend.com) account and generate an API key
2. Add it to `.env`: `RESEND_API_KEY=re_...`
3. Verify your sending domain in the Resend dashboard (required for production)
4. Update the `from` address in your `sendEmail()` calls to use your verified domain

> In development, Resend allows sending to any address using your test API key. In production, the `from` domain must be verified.

## Error Handling

`sendEmail()` returns the Resend API response. Check for errors in critical flows:

```ts
const { data, error } = await sendEmail({ ... });

if (error) {
  console.error("Failed to send email:", error);
  // handle gracefully — don't block the user flow for non-critical emails
}
```
