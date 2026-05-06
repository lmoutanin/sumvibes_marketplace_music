import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from_email = process.env.FROM_EMAIL || "noreply@example.com";

export async function sendInvoiceEmail(
  to_email: string,
  subject_email: string,
  content_email: string,
  pdfBuffer?: Buffer,
  invoiceNumber?: string
) {
  if (pdfBuffer) {
    console.log(`[Resend] PDF buffer size: ${pdfBuffer.length} bytes`);
  } else {
    console.warn("[Resend] No PDF buffer provided, sending without attachment");
  }

  const { data, error } = await resend.emails.send({
    from: from_email,
    to: to_email,
    subject: subject_email,
    html: content_email,
    attachments:
      pdfBuffer && pdfBuffer.length > 0
        ? [
            {
              filename: `${invoiceNumber || "facture"}.pdf`,
              content: pdfBuffer.toString("base64"),
            },
          ]
        : [],
  });

  if (error) {
    console.error("[Resend] Failed to send email to", to_email, error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  console.log("[Resend] Email sent successfully, id:", data?.id);
}