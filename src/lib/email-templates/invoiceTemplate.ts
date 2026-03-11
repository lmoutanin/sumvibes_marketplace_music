// ─── CHARTE GRAPHIQUE SUMVIBES ────────────────────────────────────────────────
const B = {
  gold:         "#fecc33",
  goldDark:     "#e5b82e",
  goldFaint:    "rgba(254, 204, 51, 0.08)",
  goldBorder:   "rgba(254, 204, 51, 0.18)",
  goldBorder2:  "rgba(254, 204, 51, 0.35)",
  dark:         "#0e0048",
  darkMid:      "#120058",
  darkCard:     "#16006a",
  darkCardHi:   "#1c007e",
  white:        "#ffffff",
  textPrimary:  "#ffffff",
  textSecond:   "#d4d0e8",
  textMuted:    "#8b85a8",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem {
  item:         string;
  description:  string;
  amount:       number;
  quantity?:    number;
}

interface InvoicePayment {
  invoice_nr: string;
  subtotal:   number;
  commission?: number;
  tax:        number;
  total:      number;
}

interface InvoiceShipping {
  name:   string;
  email?: string;
}

interface InvoiceData {
  shipping: InvoiceShipping;
  items:    InvoiceItem[];
  payment:  InvoicePayment;
}

interface InvoiceEmailOptions {
  includeContract?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function esc(t: string): string {
  return t.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c] ?? c));
}

const euro = (n: number): string => `${Number(n).toFixed(2)}&nbsp;€`;

// ─────────────────────────────────────────────────────────────────────────────
export function generateInvoiceEmailHtml(data: InvoiceData, options: InvoiceEmailOptions = {}): string {
  const { shipping, items, payment } = data;
  const { includeContract = false } = options;
  const commission = Number(payment.commission || 0);
  const date        = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const year        = new Date().getFullYear();
  const firstName   = esc(shipping.name).split(" ")[0];

  // ── Lignes items ──
  const itemRows = items.map((item, i) => `
  <tr>
    <td style="padding:18px 24px; border-bottom:1px solid ${B.goldBorder};">
      <span style="display:block; color:${B.white}; font-size:14px; font-weight:700; letter-spacing:0.3px; margin-bottom:3px;">${esc(item.item)}</span>
      <span style="color:${B.textMuted}; font-size:12px;">${esc(item.description)}</span>
    </td>
    <td style="padding:18px 24px; border-bottom:1px solid ${B.goldBorder}; text-align:center; color:${B.textSecond}; font-size:13px; vertical-align:top; padding-top:21px;">${item.quantity ?? 1}</td>
    <td style="padding:18px 24px; border-bottom:1px solid ${B.goldBorder}; text-align:right; color:${B.gold}; font-size:15px; font-weight:800; vertical-align:top; padding-top:20px; font-family:'Courier New',monospace;">${euro(item.amount)}</td>
  </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Facture SUMVIBES — ${esc(payment.invoice_nr)}</title>
</head>
<body style="margin:0;padding:0;background-color:${B.dark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<!--  Outer wrapper  -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${B.dark};padding:48px 20px;">
<tr><td align="center">

<!--  Card  -->
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

  <!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
  <tr>
    <td style="
      background: linear-gradient(160deg, ${B.darkCard} 0%, ${B.dark} 100%);
      border-radius:16px 16px 0 0;
      border:1px solid ${B.goldBorder2};
      border-bottom:none;
      padding:52px 48px 44px;
      text-align:center;
      position:relative;
    ">
      <!-- Glow top -->
      <div style="width:220px;height:1px;background:linear-gradient(90deg,transparent,${B.gold},transparent);margin:0 auto 36px;"></div>

      <!-- Logo text -->
      <div style="font-size:38px;font-weight:900;color:${B.gold};letter-spacing:6px;font-family:Georgia,'Times New Roman',serif;line-height:1;">SUMVIBES</div>
      <div style="margin-top:10px;color:${B.textMuted};font-size:11px;letter-spacing:3px;text-transform:uppercase;">Marketplace Musicale</div>

      <!-- Divider -->
      <div style="width:48px;height:2px;background:${B.gold};margin:28px auto 0;border-radius:2px;"></div>
    </td>
  </tr>

  <!-- ══ CONFIRMATION BANNER ══════════════════════════════════════════════ -->
  <tr>
    <td style="
      background:linear-gradient(135deg, ${B.darkCardHi} 0%, ${B.darkCard} 100%);
      border-left:1px solid ${B.goldBorder2};
      border-right:1px solid ${B.goldBorder2};
      padding:36px 48px;
      border-bottom:1px solid ${B.goldBorder};
    ">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:22px;font-weight:800;color:${B.white};margin-bottom:10px;line-height:1.3;">
              Paiement&nbsp;<span style="color:${B.gold};">confirmé</span>
            </div>
            <div style="color:${B.textSecond};font-size:14px;line-height:1.7;">
              Bonjour <strong style="color:${B.gold};">${firstName}</strong>, merci pour votre achat&nbsp;!<br/>
              ${includeContract ? "Votre document d'achat (facture + contrat de licence)" : "Votre facture"} est en pièce jointe et vos fichiers sont prêts.
            </div>
          </td>
          <td width="100" style="text-align:right;vertical-align:top;">
            <!-- Montant total mis en avant -->
            <div style="background:${B.goldFaint};border:1px solid ${B.goldBorder2};border-radius:12px;padding:14px 18px;display:inline-block;">
              <div style="color:${B.textMuted};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:6px;">Total payé</div>
              <div style="color:${B.gold};font-size:22px;font-weight:900;font-family:'Courier New',monospace;white-space:nowrap;">${euro(payment.total)}</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══ INFO COMMANDE (3 colonnes) ═══════════════════════════════════════ -->
  <tr>
    <td style="
      background:${B.dark};
      border-left:1px solid ${B.goldBorder2};
      border-right:1px solid ${B.goldBorder2};
      padding:0;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid ${B.goldBorder};">
        <tr>
          <td width="33%" style="padding:22px 28px;border-right:1px solid ${B.goldBorder};">
            <div style="color:${B.textMuted};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:8px;">Numéro</div>
            <div style="color:${B.gold};font-size:11px;font-weight:700;font-family:'Courier New',monospace;word-break:break-all;">${esc(payment.invoice_nr)}</div>
          </td>
          <td width="33%" style="padding:22px 28px;border-right:1px solid ${B.goldBorder};">
            <div style="color:${B.textMuted};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:8px;">Date</div>
            <div style="color:${B.white};font-size:13px;font-weight:600;">${date}</div>
          </td>
          <td width="33%" style="padding:22px 28px;">
            <div style="color:${B.textMuted};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:8px;">Statut</div>
            <div>
              <span style="background:rgba(254,204,51,0.12);border:1px solid ${B.goldBorder2};color:${B.gold};font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;">✓ PAYÉ</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══ TABLEAU ARTICLES ══════════════════════════════════════════════════ -->
  <tr>
    <td style="
      background:${B.dark};
      border-left:1px solid ${B.goldBorder2};
      border-right:1px solid ${B.goldBorder2};
      padding:32px 0 0;
    ">
      <!-- Label section -->
      <div style="padding:0 28px 16px;color:${B.textMuted};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Détail de commande</div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${B.goldBorder};border-bottom:1px solid ${B.goldBorder};">
        <!-- En-tête -->
        <thead>
          <tr style="background:${B.darkCard};">
            <th style="padding:13px 24px;text-align:left;color:${B.gold};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:800;">Beat / Licence</th>
            <th style="padding:13px 24px;text-align:center;color:${B.gold};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:800;width:50px;">Qté</th>
            <th style="padding:13px 24px;text-align:right;color:${B.gold};font-size:9px;text-transform:uppercase;letter-spacing:1.5px;font-weight:800;">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </td>
  </tr>

  <!-- ══ TOTAUX ════════════════════════════════════════════════════════════ -->
  <tr>
    <td style="
      background:${B.dark};
      border-left:1px solid ${B.goldBorder2};
      border-right:1px solid ${B.goldBorder2};
      padding:24px 28px 32px;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:280px;margin-left:auto;">
        <tr>
          <td style="padding:8px 0;color:${B.textMuted};font-size:13px;">Sous-total</td>
          <td style="padding:8px 0;text-align:right;color:${B.textSecond};font-size:13px;font-weight:600;">${euro(payment.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${B.textMuted};font-size:13px;">Commission</td>
          <td style="padding:8px 0;text-align:right;color:${B.textSecond};font-size:13px;font-weight:600;">${euro(commission)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0 16px;color:${B.textMuted};font-size:13px;border-bottom:1px solid ${B.goldBorder};">TVA (20%)</td>
          <td style="padding:8px 0 16px;text-align:right;color:${B.textSecond};font-size:13px;font-weight:600;border-bottom:1px solid ${B.goldBorder};">${euro(payment.tax)}</td>
        </tr>
        <tr>
          <td style="padding:16px 0 0;color:${B.white};font-size:15px;font-weight:800;">Total TTC</td>
          <td style="padding:16px 0 0;text-align:right;color:${B.gold};font-size:22px;font-weight:900;font-family:'Courier New',monospace;">${euro(payment.total)}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══ NOTE PIÈCE JOINTE ═════════════════════════════════════════════════ -->
  <tr>
    <td style="
      background:${B.dark};
      border-left:1px solid ${B.goldBorder2};
      border-right:1px solid ${B.goldBorder2};
      padding:0 28px 36px;
    ">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:${B.darkCard};border-left:3px solid ${B.gold};border-radius:0 8px 8px 0;padding:16px 20px;">
            <span style="color:${B.textSecond};font-size:13px;line-height:1.7;">
              📎 ${includeContract ? "Votre document PDF (facture + contrat de licence) est joint" : "Votre facture PDF est jointe"} à cet email. Vos fichiers sont accessibles dans votre espace
              <strong style="color:${B.gold};">Téléchargements</strong>.
              Pour toute question, <a href="mailto:contact@sumvibes.com" style="color:${B.gold};font-weight:700;">contactez-nous</a>.
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ══ FOOTER ════════════════════════════════════════════════════════════ -->
  <tr>
    <td style="
      background:linear-gradient(160deg, ${B.darkCard} 0%, ${B.dark} 100%);
      border-radius:0 0 16px 16px;
      border:1px solid ${B.goldBorder2};
      border-top:1px solid ${B.goldBorder};
      padding:36px 48px;
      text-align:center;
    ">
      <!-- Divider top -->
      <div style="width:48px;height:2px;background:${B.gold};margin:0 auto 24px;border-radius:2px;"></div>

      <div style="font-size:18px;font-weight:900;color:${B.gold};letter-spacing:5px;font-family:Georgia,'Times New Roman',serif;margin-bottom:8px;">SUMVIBES</div>
      <div style="color:${B.textMuted};font-size:11px;margin-bottom:16px;">© ${year} SUMVIBES by SAS BE GREAT. Tous droits réservés.</div>
      <div style="color:${B.textMuted};font-size:11px;">
        <a href="https://sumvibes.com" style="color:${B.gold};font-weight:700;text-decoration:none;">www.sumvibes.com</a>
        &nbsp;•&nbsp;
        <a href="mailto:contact@sumvibes.com" style="color:${B.textMuted};text-decoration:none;">contact@sumvibes.com</a>
      </div>

      <!-- Glow bottom -->
      <div style="width:220px;height:1px;background:linear-gradient(90deg,transparent,${B.gold},transparent);margin:28px auto 0;"></div>
    </td>
  </tr>

</table>
<!--  /Card  -->

</td></tr>
</table>
<!--  /Outer wrapper  -->

</body>
</html>`;
}