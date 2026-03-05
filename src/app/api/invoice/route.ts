import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { userSchema, itemSchema, invoiceSchema } from "./schema/invoiceModel";
import { createInvoiceBuffer } from "@/lib/pdfkit-invoice/createInvoice";
import { sendInvoiceEmail } from "@/lib/resend";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try { 
        const authHeader = req.headers.get("authorization");

        const token = authHeader?.split(" ")[1];

        if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

        const decoded = verifyToken(token);

        if (!decoded) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

        const body = await req.json();
        const { shipping, items, payment } = body;

        await userSchema.validateAsync(shipping);

        for (const item of items) {
            await itemSchema.validateAsync(item);
        }

        await invoiceSchema.validateAsync(payment);

        const data = {shipping, items, payment};
        const pdfBuffer = await createInvoiceBuffer(data);

        const itemsHtml = items.map((item: any) => `
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #2a2a3a;color:#e2e8f0;font-size:14px;">${item.item}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #2a2a3a;color:#94a3b8;font-size:14px;">${item.description}</td>
            <td style="padding:12px 16px;border-bottom:1px solid #2a2a3a;color:#f59e0b;font-size:14px;text-align:right;font-weight:600;">${Number(item.amount).toFixed(2)} €</td>
          </tr>`).join("");

        const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
          <h1 style="margin:0;font-size:32px;font-weight:800;color:#f59e0b;letter-spacing:2px;">SUMVIBES</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;letter-spacing:1px;">MARKETPLACE MUSICALE</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:#13131f;padding:40px;">

          <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">Merci pour votre achat ! 🎵</h2>
          <p style="margin:0 0 32px;color:#94a3b8;font-size:15px;">Bonjour <strong style="color:#e2e8f0;">${shipping.name}</strong>, votre commande a bien été confirmée.</p>

          <!-- Invoice info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1e1e2e;border-radius:12px;margin-bottom:28px;">
            <tr>
              <td style="padding:20px 24px;border-right:1px solid #2a2a3a;">
                <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Numéro de facture</p>
                <p style="margin:6px 0 0;color:#f59e0b;font-size:14px;font-weight:700;">${payment.invoice_nr}</p>
              </td>
              <td style="padding:20px 24px;border-right:1px solid #2a2a3a;">
                <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Date</p>
                <p style="margin:6px 0 0;color:#e2e8f0;font-size:14px;font-weight:600;">${new Date().toLocaleDateString("fr-FR")}</p>
              </td>
              <td style="padding:20px 24px;">
                <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Montant total</p>
                <p style="margin:6px 0 0;color:#10b981;font-size:18px;font-weight:800;">${Number(payment.total).toFixed(2)} €</p>
              </td>
            </tr>
          </table>

          <!-- Items table -->
          <p style="margin:0 0 12px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Détail de la commande</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;margin-bottom:28px;">
            <thead>
              <tr style="background-color:#1e1e2e;">
                <th style="padding:12px 16px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Beat</th>
                <th style="padding:12px 16px;text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Licence</th>
                <th style="padding:12px 16px;text-align:right;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-size:14px;">Sous-total</td>
              <td style="padding:6px 0;color:#e2e8f0;font-size:14px;text-align:right;">${Number(payment.subtotal).toFixed(2)} €</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#94a3b8;font-size:14px;">TVA (20%)</td>
              <td style="padding:6px 0;color:#e2e8f0;font-size:14px;text-align:right;">${Number(payment.tax).toFixed(2)} €</td>
            </tr>
            <tr style="border-top:1px solid #2a2a3a;">
              <td style="padding:14px 0 6px;color:#f1f5f9;font-size:16px;font-weight:700;">Total TTC</td>
              <td style="padding:14px 0 6px;color:#10b981;font-size:18px;font-weight:800;text-align:right;">${Number(payment.total).toFixed(2)} €</td>
            </tr>
          </table>
 
          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">Votre facture est disponible en pièce jointe à cet email. Pour toute question, contactez-nous à <a href="mailto:contact@sumvibes.dev" style="color:#f59e0b;text-decoration:none;">contact@sumvibes.dev</a>.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background-color:#0d0d1a;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;border-top:1px solid #1e1e2e;">
          <p style="margin:0 0 8px;color:#f59e0b;font-weight:700;font-size:15px;">SUMVIBES</p>
          <p style="margin:0;color:#374151;font-size:12px;">© ${new Date().getFullYear()} SumVibes. Tous droits réservés.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        await sendInvoiceEmail(
            shipping.email,
            `Votre facture ${payment.invoice_nr} — SumVibes`,
            emailHtml,
            pdfBuffer,
            payment.invoice_nr
        );

        console.log("Facture créée et email envoyé pour l'utilisateur :", shipping.email);

        return NextResponse.json({
            message: "Facture créée avec succès",
            invoiceId: payment.invoice_nr
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error in POST /api/invoice:", error);
        if (error?.isJoi) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}