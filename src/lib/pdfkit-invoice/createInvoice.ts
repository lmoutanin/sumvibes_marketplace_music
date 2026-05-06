import { number } from "joi";
import path from "path";
import PDFDocumentLib from "pdfkit";

const PDFDocument = (PDFDocumentLib as any).default || PDFDocumentLib;

// ─── INFO VENDEUR ─────────────────────────────────────────────────────────────────
const SELLER = {
  name: "BE GREAT",
  siret: "93238647700016",
  tva_number: "FR28932386477",
  status: "SAS",
  address: "37 RUE DE GRIERE 74270 MARLIOZ",
  city: "97100 Guadeloupe",
  country: "France",
}


// ─── Types ────────────────────────────────────────────────────────────────────
export interface InvoiceItem {
  item: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface InvoicePayment {
  invoice_nr: string;
  subtotal: number;
  commission?: number;
  commissionRate?: number;
  tax: number;
  total: number;
  method?: string;
}

export interface InvoiceShipping {
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface InvoiceSeller {
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface Invoice {
  payment: InvoicePayment;
  shipping: InvoiceShipping;
  seller?: InvoiceSeller;
  items: InvoiceItem[];
}

// ─── Mise en page ─────────────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const ML = 48;
const MR = 48;
const CONTENT = PAGE_W - ML - MR;

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const C = {
  ink: "#0D0D0D",
  smoke: "#3A3A3A",
  mist: "#8A8A8A",
  cloud: "#C8C8C8",
  fog: "#F0F0F0",
  white: "#FFFFFF",
  headerBg: "#0D0D0D",
  totalBg: "#0D0D0D",
  footerBg: "#F7F7F7",
} as const;

// ─── Colonnes tableau ─────────────────────────────────────────────────────────
// CONTENT = 499.28  →  desc=175  lic=110  prix=72  qty=32  total=82  (+ marge droite visuelle)
const T = {
  desc: { x: ML, w: 175 },
  lic: { x: ML + 180, w: 110 },
  prix: { x: ML + 295, w: 72 },
  qty: { x: ML + 372, w: 32 },
  total: { x: ML + 409, w: 82 },   // fin = 48+409+82 = 539 (8pt de marge à droite)
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const euro = (n: number): string => Number(n).toFixed(2) + " €";

const percent = (n: number): string => {
  const rounded = Number(n.toFixed(2));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

type LicenseTier = "BASIC" | "PREMIUM" | "EXCLUSIVE";

function toLicenseTier(value: string): LicenseTier | null {
  const normalized = String(value || "").toUpperCase();
  if (normalized.includes("EXCLUSIVE")) return "EXCLUSIVE";
  if (normalized.includes("PREMIUM")) return "PREMIUM";
  if (normalized.includes("BASIC")) return "BASIC";
  return null;
}

function termsForTier(tier: LicenseTier): string {
  switch (tier) {
    case "EXCLUSIVE":
      return "EXCLUSIVE : Usage Commercial Illimité | Droits Cédés | Trackout inclus";
    case "PREMIUM":
      return "PREMIUM (NON-EXCLUSIVE) : Usage Commercial Étendu | 250 000 Streams | Durée Illimitée";
    case "BASIC":
    default:
      return "BASIC : Usage Commercial Limité | 5 000 Streams | Durée Illimitée";
  }
}

function buildRightsAssignment(items: InvoiceItem[]): string {
  const ordered: LicenseTier[] = ["BASIC", "PREMIUM", "EXCLUSIVE"];
  const found = new Set<LicenseTier>();

  for (const item of items) {
    const tier = toLicenseTier(item.description);
    if (tier) found.add(tier);
  }

  if (found.size === 0) {
    return termsForTier("BASIC");
  }

  return ordered.filter((tier) => found.has(tier)).map(termsForTier).join("  •  ");
}

function hr(
  doc: PDFKit.PDFDocument,
  y: number,
  color: string = C.cloud,
  weight = 0.6,
  x1 = ML,
  x2 = PAGE_W - MR
): void {
  doc.save()
    .moveTo(x1, y).lineTo(x2, y)
    .strokeColor(color).lineWidth(weight).stroke()
    .restore();
}

// ─────────────────────────────────────────────────────────────────────────────
export function createInvoiceBuffer(invoice: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true, compress: true });
    const chunks: Buffer[] = [];

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = drawHeader(doc, invoice);
    y = drawBillingSection(doc, invoice, y);
    y = drawTable(doc, invoice, y);
    y = drawTotals(doc, invoice, y);
    drawFooter(doc, invoice);

    doc.end();
  });
}

// ─── 1. HEADER ────────────────────────────────────────────────────────────────
function drawHeader(doc: PDFKit.PDFDocument, invoice: Invoice): number {
  const H = 108;

  doc.rect(0, 0, PAGE_W, H).fill(C.headerBg);

  const logoX = ML;
  const logoY = 18;
  const companyX = ML + 70;
  const rightBlockX = 380;
  const rightBlockW = PAGE_W - MR - rightBlockX;
  const leftBlockW = rightBlockX - companyX - 16;

  // Logo
  try {
    doc.image(path.join(process.cwd(), "public", "logo.png"), logoX, logoY, {
      height: 58, fit: [58, 58],
    });
  } catch (_) {
    doc.save().circle(logoX + 29, logoY + 29, 26).fill("#2A2A2A").restore();
  }

  // Colonne gauche (société) — avec largeur max pour éviter de croiser la colonne droite
  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(21)
    .text(SELLER.name, companyX, 22, { width: leftBlockW, lineBreak: false, ellipsis: true });

  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(9)
    .text("Forme juridique : " + SELLER.status, companyX, 47, { width: leftBlockW, lineBreak: false, ellipsis: true });

  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(8)
    .text("Adresse : " + SELLER.address, companyX, 59, { width: leftBlockW, lineBreak: false, ellipsis: true });

  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(8)
    .text("SIRET : " + SELLER.siret, companyX, 70, { width: leftBlockW, lineBreak: false, ellipsis: true });

  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(8)
    .text("N° de TVA : " + SELLER.tva_number, companyX, 81, { width: leftBlockW, lineBreak: false, ellipsis: true });

  // Colonne droite (facture)
  doc
    .fillColor(C.mist)
    .font("Helvetica")
    .fontSize(7.5)
    .text("FACTURE", rightBlockX, 24, { width: rightBlockW, align: "right", lineBreak: false });

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(11.5)
    .text(String(invoice.payment.invoice_nr), rightBlockX, 39, {
      width: rightBlockW, align: "right", lineBreak: false,
    });

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(8)
    .text(dateStr, rightBlockX, 55, { width: rightBlockW, align: "right", lineBreak: false });

  // Liseré bas du header
  doc.rect(0, H, PAGE_W, 2).fill("#1C1C1C");

  return H + 2;
}

// ─── 2. ADRESSES + MÉTA ───────────────────────────────────────────────────────
function drawBillingSection(doc: PDFKit.PDFDocument, invoice: Invoice, startY: number): number {
  const TOP = startY + 26;
  const colLeft = ML;
  const colRight = PAGE_W / 2 + 10;

  // Labels (en majuscules, petite taille — sans characterSpacing)
  doc.fillColor(C.mist).font("Helvetica").fontSize(7);
  doc.text("DE", colLeft, TOP, { lineBreak: false });
  doc.text("FACTURER A", colRight, TOP, { lineBreak: false });

  // Vendeur
  const seller = invoice.seller ?? SELLER;
  doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(10.5)
    .text(seller.name, colLeft, TOP + 13, { lineBreak: false });
  doc.fillColor(C.smoke).font("Helvetica").fontSize(8.5)
    .text(seller.address, colLeft, TOP + 27, { lineBreak: false })
    .text(seller.city, colLeft, TOP + 39, { lineBreak: false });

  // Client
  doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(10.5)
    .text(invoice.shipping.name, colRight, TOP + 13, { lineBreak: false });
  doc.fillColor(C.smoke).font("Helvetica").fontSize(8.5)
    .text(invoice.shipping.address, colRight, TOP + 27, { lineBreak: false })
    .text(`${invoice.shipping.city}, ${invoice.shipping.country}`, colRight, TOP + 39, { lineBreak: false });

  // Séparateur
  const sep1Y = TOP + 60;
  hr(doc, sep1Y, C.fog, 1);

  // Méta — 3 blocs
  const metaY = sep1Y + 14;
  const metaW = CONTENT / 3;
  const metas = [
    { label: "DATE D'EMISSION", value: new Date().toLocaleDateString("fr-FR") },
    { label: "STATUT", value: "Paiement immédiat" },
    { label: "METHODE", value: invoice.payment.method || "Non spécifiée" },
  ];

  metas.forEach((m, i) => {
    const x = ML + i * metaW;
    doc.fillColor(C.mist).font("Helvetica").fontSize(7)
      .text(m.label, x, metaY, { lineBreak: false });
    doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(9)
      .text(m.value, x, metaY + 12, { lineBreak: false });
  });

  const sep2Y = metaY + 32;
  hr(doc, sep2Y, C.fog, 1);

  return sep2Y + 20;
}

// ─── 3. TABLEAU ───────────────────────────────────────────────────────────────
function drawTable(doc: PDFKit.PDFDocument, invoice: Invoice, startY: number): number {
  const HEADER_H = 26;
  const ROW_H = 33;

  // En-tête fond noir
  doc.rect(ML, startY, CONTENT, HEADER_H).fill(C.ink);

  const hY = startY + 9;
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(7.5);
  doc.text("DESCRIPTION", T.desc.x + 5, hY, { width: T.desc.w, lineBreak: false });
  doc.text("LICENCE", T.lic.x, hY, { width: T.lic.w, lineBreak: false });
  doc.text("PRIX U.", T.prix.x, hY, { width: T.prix.w, align: "right", lineBreak: false });
  doc.text("QTE", T.qty.x, hY, { width: T.qty.w, align: "right", lineBreak: false });
  doc.text("TOTAL", T.total.x, hY, { width: T.total.w, align: "right", lineBreak: false });

  // Lignes
  invoice.items.forEach((item, i) => {
    const rowY = startY + HEADER_H + i * ROW_H;
    const textY = rowY + Math.floor(ROW_H / 2) - 5;

    // Fond alterné
    if (i % 2 === 0) {
      doc.rect(ML, rowY, CONTENT, ROW_H).fill(C.fog);
    }

    // Barre d'accent gauche sur lignes paires
    if (i % 2 === 0) {
      doc.rect(ML, rowY, 3, ROW_H).fill(C.cloud);
    }

    // Description
    doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(9)
      .text(item.item, T.desc.x + 8, textY, {
        width: T.desc.w - 8, lineBreak: false, ellipsis: true,
      });

    // Licence
    doc.fillColor(C.mist).font("Helvetica").fontSize(8.5)
      .text(item.description, T.lic.x, textY, {
        width: T.lic.w, lineBreak: false, ellipsis: true,
      });

    // Prix unitaire
    doc.fillColor(C.smoke).font("Helvetica").fontSize(9)
      .text(euro(item.amount / item.quantity), T.prix.x, textY, {
        width: T.prix.w, align: "right", lineBreak: false,
      });

    // Quantité
    doc.fillColor(C.smoke).font("Helvetica").fontSize(9)
      .text(String(item.quantity), T.qty.x, textY, {
        width: T.qty.w, align: "right", lineBreak: false,
      });

    // Total ligne
    doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(9)
      .text(euro(item.amount), T.total.x, textY, {
        width: T.total.w, align: "right", lineBreak: false,
      });

    // Bordure basse
    hr(doc, rowY + ROW_H, C.cloud, 0.4);
  });

  const tableBottom = startY + HEADER_H + invoice.items.length * ROW_H;
  hr(doc, tableBottom, C.cloud, 1);

  return tableBottom;
}

// ─── 4. TOTAUX ────────────────────────────────────────────────────────────────
function drawTotals(doc: PDFKit.PDFDocument, invoice: Invoice, startY: number): number {
  const TOP = startY + 18;
  const commission = Number(invoice.payment.commission || 0);
  const commissionRate =
    typeof invoice.payment.commissionRate === "number"
      ? Number(invoice.payment.commissionRate)
      : invoice.payment.subtotal > 0
        ? Number(((commission / invoice.payment.subtotal) * 100).toFixed(2))
        : 0;

  // Alignement calé sur les colonnes du tableau
  // Label  : colonne PRIX U. (x = T.prix.x)
  // Valeur : colonne TOTAL   (x = T.total.x, w = T.total.w)
  const LX = T.prix.x;
  const VX = T.total.x;
  const VW = T.total.w;

  // Sous-total
  doc.fillColor(C.mist).font("Helvetica").fontSize(9)
    .text("Sous-total", LX, TOP, { lineBreak: false });
  doc.fillColor(C.smoke).font("Helvetica").fontSize(9)
    .text(euro(invoice.payment.subtotal), VX, TOP, { width: VW, align: "right", lineBreak: false });

  hr(doc, TOP + 17, C.fog, 0.8, LX);

  // Commission
  doc.fillColor(C.mist).font("Helvetica").fontSize(9)
    .text(`Commission (${percent(commissionRate)}%)`, LX, TOP + 21, { lineBreak: false });
  doc.fillColor(C.smoke).font("Helvetica").fontSize(9)
    .text(euro(commission), VX, TOP + 21, { width: VW, align: "right", lineBreak: false });

  hr(doc, TOP + 38, C.fog, 0.8, LX);

  // TVA
  doc.fillColor(C.mist).font("Helvetica").fontSize(9)
    .text("TVA (20%)", LX, TOP + 42, { lineBreak: false });
  doc.fillColor(C.smoke).font("Helvetica").fontSize(9)
    .text(euro(invoice.payment.tax), VX, TOP + 42, { width: VW, align: "right", lineBreak: false });

  hr(doc, TOP + 59, C.cloud, 0.8, LX);

  // Bloc TOTAL — commence à LX, finit exactement à PAGE_W - MR
  const totalY = TOP + 65;
  const totalH = 32;
  const rectX = LX - 8;
  const rectW = (PAGE_W - MR) - rectX;
  doc.rect(rectX, totalY, rectW, totalH).fill(C.totalBg);

  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(10.5)
    .text("TOTAL TTC", LX, totalY + 10, { lineBreak: false });

  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(12)
    .text(euro(invoice.payment.total), VX, totalY + 9, {
      width: VW, align: "right", lineBreak: false,
    });

  return totalY + totalH;
}

// ─── 5. FOOTER ────────────────────────────────────────────────────────────────
function drawFooter(doc: PDFKit.PDFDocument, invoice: Invoice): void {
  const FOOTER_H = 72;
  const footerY = PAGE_H - FOOTER_H;
  const rightsText = buildRightsAssignment(invoice.items);

  doc.rect(0, footerY, PAGE_W, FOOTER_H).fill(C.footerBg);
  hr(doc, footerY, C.cloud, 0.8, 0, PAGE_W);

  doc.fillColor(C.smoke).font("Helvetica-Bold").fontSize(7.5)
    .text(
      "CESSION DE DROITS",
      ML, footerY + 7, { width: CONTENT, align: "center", lineBreak: false }
    );

  doc.fillColor(C.mist).font("Helvetica").fontSize(7)
    .text(
      rightsText,
      ML, footerY + 18, { width: CONTENT, align: "center", lineBreak: false, ellipsis: true }
    );

  doc.fillColor(C.smoke).font("Helvetica").fontSize(8)
    .text(
      "Merci pour votre achat chez SUMVIBES — nous esperons que vous apprecierez votre musique !",
      ML, footerY + 35, { width: CONTENT, align: "center", lineBreak: false }
    );

  doc.fillColor(C.mist).font("Helvetica").fontSize(7.5)
    .text(
      "www.sumvibes.com  •  contact@sumvibes.com",
      ML, footerY + 49, { width: CONTENT, align: "center", lineBreak: false }
    );

  doc.fillColor(C.cloud).font("Helvetica").fontSize(7)
    .text("Page 1 / 1", ML, footerY + 60, { width: CONTENT, align: "right", lineBreak: false });
}