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
  email: "contact@sumvibes.com",
  website: "www.sumvibes.com",
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type LicenseType = "BASIC" | "PREMIUM" | "EXCLUSIVE";

export interface ContractParties {
  licensorName: string;
  licensorEmail: string;
  licenseeName: string;
  licenseeEmail: string;
  licenseeAddress: string;
  licenseeCity: string;
}

export interface ContractWork {
  title: string;
  artist: string;
  duration: number;
}

export interface ContractData {
  parties: ContractParties;
  work: ContractWork;
  licenseType: LicenseType;
  purchaseDate: Date;
  contractNumber: string;
  acceptedAt?: Date;
  acceptedIp?: string;
  sellerSignatureBuffer?: Buffer;
}

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const C = {
  ink: "#0D0D0D",
  smoke: "#3A3A3A",
  mist: "#8A8A8A",
  cloud: "#C8C8C8",
  fog: "#F0F0F0",
  white: "#FFFFFF",
  headerBg: "#0D0D0D",
  accentBg: "#16006a",
  footerBg: "#F7F7F7",
} as const;

// ─── Mise en page ─────────────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const ML = 48;
const MR = 48;
const CONTENT = PAGE_W - ML - MR;
const PAGE_TOP = 36;
const PAGE_BOTTOM_SAFE = PAGE_H - 70;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const euro = (n: number): string => Number(n).toFixed(2) + " €";

function getLicenseTerms(licenseType: LicenseType): {
  title: string;
  territory: string;
  duration: string;
  exclusivity: string;
  supports: string[];
  streamingPlays: string;
  distributionCopies: string;
  creditRequired: boolean;
  profitRadio: boolean;
  trackoutIncluded: boolean;
} {
  switch (licenseType) {
    case "BASIC":
      return {
        title: "LICENCE BASIC — Usage Commercial Limité",
        territory: "Monde entier (Droits mondiaux)",
        duration: "Perpétuité",
        exclusivity: "Non-exclusive (l'auteur peut vendre à d'autres)",
        supports: [
          "YouTube et réseaux sociaux",
          "Projets personnels et contenus web",
          "Usage promotionnel limité",
        ],
        streamingPlays: "Jusqu'à 5 000 lectures en streaming",
        distributionCopies: "Jusqu'à 2 500 copies distribuées",
        creditRequired: true,
        profitRadio: false,
        trackoutIncluded: false,
      };

    case "PREMIUM":
      return {
        title: "LICENCE PREMIUM — Usage Commercial Étendu",
        territory: "Monde entier (Droits mondiaux)",
        duration: "Perpétuité",
        exclusivity: "Non-exclusive (l'auteur peut vendre à d'autres)",
        supports: [
          "YouTube, réseaux sociaux et podcasts",
          "Publicités et contenus commerciaux",
          "Télévision, streaming et jeux vidéo",
        ],
        streamingPlays: "Jusqu'à 250 000 lectures en streaming",
        distributionCopies: "Jusqu'à 10 000 copies distribuées",
        creditRequired: true,
        profitRadio: true,
        trackoutIncluded: true,
      };

    case "EXCLUSIVE":
      return {
        title: "LICENCE EXCLUSIVE — Droits Complets",
        territory: "Monde entier (Droits exclusifs mondiaux)",
        duration: "Perpétuité",
        exclusivity: "EXCLUSIVE — Vous êtes le seul à pouvoir utiliser cette musique au niveau mondial. Le fichier est archivé et n'est plus vendu.",
        supports: [
          "Tous supports audio, vidéo et publicité",
          "Synchronisation, diffusion et exploitation commerciale",
          "Remixes et adaptations autorisés",
        ],
        streamingPlays: "Illimité",
        distributionCopies: "Illimité",
        creditRequired: false,
        profitRadio: true,
        trackoutIncluded: true,
      };

    default:
      return getLicenseTerms("BASIC");
  }
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
    .moveTo(x1, y)
    .lineTo(x2, y)
    .strokeColor(color)
    .lineWidth(weight)
    .stroke()
    .restore();
}

function ensureSpace(
  doc: PDFKit.PDFDocument,
  y: number,
  neededHeight: number,
): number {
  if (y + neededHeight <= PAGE_BOTTOM_SAFE) return y;
  doc.addPage({ size: "A4", margin: 0 });
  return PAGE_TOP;
}

// ─────────────────────────────────────────────────────────────────────────────
export function createContractBuffer(data: ContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      autoFirstPage: true,
      compress: true,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = drawHeader(doc, data);
    y = drawTitle(doc, data, y);
    y = drawParties(doc, data, y);
    y = drawWork(doc, data, y);
    y = drawLicenseGrant(doc, data, y);
    y = drawTerms(doc, data, y);
    y = drawOblications(doc, data, y);
    y = drawSignature(doc, data, y);
    drawFooter(doc, data);

    doc.end();
  });
}

// ─── 1. HEADER ────────────────────────────────────────────────────────────────
function drawHeader(doc: PDFKit.PDFDocument, data: ContractData): number {
  const H = 72;

  doc.rect(0, 0, PAGE_W, H).fill(C.headerBg);

  // Logo
  const logoX = ML;
  const logoY = 12;
  try {
    doc.image(path.join(process.cwd(), "public", "logo.png"), logoX, logoY, {
      height: 48,
      fit: [48, 48],
    });
  } catch (_) {
    doc.save().circle(logoX + 24, logoY + 24, 20).fill("#2A2A2A").restore();
  }

  // Title
  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(17)
    .text("SUMVIBES", ML + 60, 18, { lineBreak: false });

  doc
    .fillColor("#fecc33")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("CONTRAT DE LICENCE MUSICALE", ML + 60, 38, { lineBreak: false });

  // Numéro de contrat (droite)
  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(8)
    .text(`Contrat n° ${data.contractNumber}`, PAGE_W - MR - 140, 20, {
      lineBreak: false,
    });

  const dateStr = new Date(data.purchaseDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(8)
    .text(`Date : ${dateStr}`, PAGE_W - MR - 140, 31, { lineBreak: false });

  // Liseré bas
  doc.rect(0, H - 2, PAGE_W, 2).fill("#fecc33");

  return H;
}

// ─── 2. TITRE + TYPE LICENCE ──────────────────────────────────────────────────
function drawTitle(doc: PDFKit.PDFDocument, data: ContractData, startY: number): number {
  const TOP = startY + 14;
  const terms = getLicenseTerms(data.licenseType);

  // Type de licence en surbrillance
  doc.rect(ML, TOP, CONTENT, 22).fill(C.accentBg);
  doc
    .fillColor("#fecc33")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(terms.title, ML + 12, TOP + 5, { lineBreak: false });

  return TOP + 26;
}

// ─── 3. PARTIES ──────────────────────────────────────────────────────────────
function drawParties(
  doc: PDFKit.PDFDocument,
  data: ContractData,
  startY: number
): number {
  const TOP = ensureSpace(doc, startY, 96);

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ARTICLE 1 — PARTIES SIGNATAIRES", ML, TOP, { lineBreak: false });

  hr(doc, TOP + 14, C.fog, 1);

  const colLeft = ML + 12;
  const colRight = PAGE_W / 2 + 10;

  // Donneur de licence
  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("DONNEUR DE LICENCE (Vendeur/Producteur) :", colLeft, TOP + 28, {
      lineBreak: false,
    });

  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(8)
    .text(data.parties.licensorName, colLeft, TOP + 40, { lineBreak: false })
    .text(data.parties.licensorEmail, colLeft, TOP + 49, { lineBreak: false })
    .text("Vendeur vérifié sur SUMVIBES", colLeft, TOP + 58, { lineBreak: false });

  // Licencié
  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("LICENCIÉ (Acheteur) :", colRight, TOP + 28, { lineBreak: false });

  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(8)
    .text(data.parties.licenseeName, colRight, TOP + 40, { lineBreak: false })
    .text(data.parties.licenseeEmail, colRight, TOP + 49, { lineBreak: false })
    .text(data.parties.licenseeAddress, colRight, TOP + 58, { lineBreak: false })
    .text(data.parties.licenseeCity, colRight, TOP + 67, { lineBreak: false });

  return TOP + 80;
}

// ─── 4. DESCRIPTION DE L'ŒUVRE ────────────────────────────────────────────────
function drawWork(doc: PDFKit.PDFDocument, data: ContractData, startY: number): number {
  const TOP = ensureSpace(doc, startY, 86);

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ARTICLE 2 — DESCRIPTION DE L'ŒUVRE MUSICALE", ML, TOP, {
      lineBreak: false,
    });

  hr(doc, TOP + 14, C.fog, 1);

  const labelX = ML + 12;
  const valueX = ML + 130;

  const details = [
    { label: "Titre :", value: data.work.title },
    { label: "Artiste/Producteur :", value: data.work.artist },
    {
      label: "Durée :",
      value: `${Math.floor(data.work.duration / 60)}:${String(data.work.duration % 60).padStart(2, "0")}`,
    },
    {
      label: "Date d'acquisition :",
      value: new Date(data.purchaseDate).toLocaleDateString("fr-FR"),
    },
  ];

  let y = TOP + 28;
  details.forEach(({ label, value }) => {
    doc
      .fillColor(C.mist)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(label, labelX, y, { lineBreak: false });

    doc
      .fillColor(C.ink)
      .font("Helvetica")
      .fontSize(8)
      .text(value, valueX, y, { width: CONTENT - 100, lineBreak: false });

    y += 14;
  });

  return y + 4;
}

// ─── 5. DROITS ACCORDÉS ───────────────────────────────────────────────────────
function drawLicenseGrant(
  doc: PDFKit.PDFDocument,
  data: ContractData,
  startY: number
): number {
  const TOP = ensureSpace(doc, startY, 86);
  const terms = getLicenseTerms(data.licenseType);

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ARTICLE 3 — DROITS ACCORDÉS", ML, TOP, { lineBreak: false });

  hr(doc, TOP + 14, C.fog, 1);

  let y = TOP + 28;

  // Territoire
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("Territoire :", ML + 12, y, { lineBreak: false });
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(8)
    .text(terms.territory, ML + 130, y, {
      width: CONTENT - 120,
      lineBreak: true,
    });
  y += 14;

  // Durée
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("Durée :", ML + 12, y, { lineBreak: false });
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(8)
    .text(terms.duration, ML + 130, y, { lineBreak: false });
  y += 12;

  // Exclusivité
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("Exclusivité :", ML + 12, y, { lineBreak: false });
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(8)
    .text(terms.exclusivity, ML + 130, y, {
      width: CONTENT - 120,
      lineBreak: true,
    });
  y += 16;

  return y + 4;
}

// ─── 6. CONDITIONS DÉTAILLÉES ─────────────────────────────────────────────────
function drawTerms(
  doc: PDFKit.PDFDocument,
  data: ContractData,
  startY: number
): number {
  let TOP = ensureSpace(doc, startY, 130);
  const terms = getLicenseTerms(data.licenseType);

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ARTICLE 4 — CONDITIONS D'UTILISATION", ML, TOP, { lineBreak: false });

  hr(doc, TOP + 14, C.fog, 1);

  let y = TOP + 24;

  // Supports autorisés
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Usages autorisés :", ML + 12, y, { lineBreak: false });
  y += 14;

  terms.supports.forEach((support) => {
    y = ensureSpace(doc, y, 12);
    doc
      .fillColor(C.ink)
      .font("Helvetica")
      .fontSize(7.4)
      .text(`• ${support}`, ML + 20, y, { lineBreak: true, width: CONTENT - 30 });
    y += 11;
  });

  y = ensureSpace(doc, y, 26);
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Limites essentielles :", ML + 12, y + 2, { lineBreak: false });
  y += 14;

  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(7.4)
    .text(`• Streaming : ${terms.streamingPlays}`, ML + 20, y, {
      lineBreak: true,
      width: CONTENT - 30,
    });
  y += 11;

  y = ensureSpace(doc, y, 14);
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(7.4)
    .text(`• Distribution : ${terms.distributionCopies}`, ML + 20, y, {
      lineBreak: true,
      width: CONTENT - 30,
    });
  y += 12;

  y = ensureSpace(doc, y, 24);
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Fichiers fournis :", ML + 12, y + 2, { lineBreak: false });
  y += 12;

  const files =
    data.licenseType === "BASIC"
      ? ["• Fichier MP3"]
      : data.licenseType === "PREMIUM"
        ? ["• Fichier MP3", "• Fichier WAV"]
        : ["• Fichier MP3", "• Fichier WAV", "• Trackout"];

  files.forEach((file) => {
    y = ensureSpace(doc, y, 12);
    doc
      .fillColor(C.ink)
      .font("Helvetica")
      .fontSize(7.4)
      .text(file, ML + 20, y, { lineBreak: true });
    y += 11;
  });

  return y + 10;
}

// ─── 7. OBLIGATIONS ───────────────────────────────────────────────────────────
function drawOblications(
  doc: PDFKit.PDFDocument,
  data: ContractData,
  startY: number
): number {
  let TOP = ensureSpace(doc, startY, 110);
  const terms = getLicenseTerms(data.licenseType);

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ARTICLE 5 — OBLIGATIONS DU LICENCIÉ", ML, TOP, { lineBreak: false });

  hr(doc, TOP + 14, C.fog, 1);

  let y = TOP + 26;

  if (terms.creditRequired) {
    y = ensureSpace(doc, y, 22);
    doc
      .fillColor(C.ink)
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        `Crédit obligatoire : Vous devez mentionner le producteur « ${data.work.artist} » dans le générique ou la description.`,
        ML + 12,
        y,
        { width: CONTENT - 24, lineBreak: true }
      );
    y += 16;
  }

  y = ensureSpace(doc, y, 24);
  if (data.licenseType === "EXCLUSIVE") {
    doc
      .fillColor(C.ink)
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        `Interdictions : Revente du beat "en l'état", sous-licence non autorisée, et transfert du contrat à un tiers sans accord écrit de SUMVIBES.`,
        ML + 12,
        y,
        { width: CONTENT - 24, lineBreak: true }
      );
  } else {
    doc
      .fillColor(C.ink)
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        `Interdictions : Vous ne pouvez pas revendre, louer ni céder cette licence. Cette licence est personnelle et incessible.`,
        ML + 12,
        y,
        { width: CONTENT - 24, lineBreak: true }
      );
  }
  y += 18;

  if (data.licenseType === "EXCLUSIVE") {
    y = ensureSpace(doc, y, 22);
    doc
      .fillColor(C.ink)
      .font("Helvetica")
      .fontSize(7.5)
      .text(
        `Exclusivité : SUMVIBES confirme que ce beat n'a été vendu qu'une seule fois. Vous jouissez d'une exclusivité mondiale complète sur cette création musicale.`,
        ML + 12,
        y,
        { width: CONTENT - 24, lineBreak: true }
      );
    y += 28;
  }

  y = ensureSpace(doc, y, 24);
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `Garanties : SUMVIBES garantit être propriétaire des droits musicaux concédés et autorisé légalement à les concéder.`,
      ML + 12,
      y,
      { width: CONTENT - 24, lineBreak: true }
    );
  y += 18;

  return y + 10;
}

// ─── 8. SIGNATURE ────────────────────────────────────────────────────────────────
function drawSignature(
  doc: PDFKit.PDFDocument,
  data: ContractData,
  startY: number
): number {
  const TOP = ensureSpace(doc, startY, 126);

  doc
    .fillColor(C.white)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("ARTICLE 6 — VALIDATION ET SIGNATURES ÉLECTRONIQUES", ML, TOP, { lineBreak: false });

  hr(doc, TOP + 14, C.fog, 1);

  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(7.4)
    .text(
      `Le contrat est généré automatiquement lors de l'achat. La signature vendeur est intégrée au document et l'acheteur valide ce contrat lors du paiement.`,
      ML + 12,
      TOP + 24,
      { width: CONTENT - 24, lineBreak: true }
    );

  const sigY = TOP + 66;
  const colLeft = ML + 12;
  const colRight = PAGE_W / 2 + 10;

  // Signature donneur
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("DONNEUR DE LICENCE", colLeft, sigY, { lineBreak: false });
  doc
    .fillColor(C.mist)
    .font("Helvetica")
    .fontSize(7)
    .text(data.parties.licensorName, colLeft, sigY + 12, { lineBreak: false });

  if (data.sellerSignatureBuffer) {
    try {
      doc.image(data.sellerSignatureBuffer, colLeft, sigY + 20, {
        fit: [120, 28],
      });
      doc
        .fillColor(C.cloud)
        .font("Helvetica")
        .fontSize(6)
        .text("Signature vendeur enregistrée", colLeft, sigY + 49, { lineBreak: false });
    } catch {
      doc
        .fillColor(C.mist)
        .font("Helvetica")
        .fontSize(7)
        .text("Signé électroniquement", colLeft, sigY + 22, { lineBreak: false });
    }
  } else {
    doc
      .fillColor(C.mist)
      .font("Helvetica")
      .fontSize(7)
      .text("Signé électroniquement", colLeft, sigY + 22, { lineBreak: false });
  }

  // Signature licencié
  doc
    .fillColor(C.mist)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("LICENCIÉ", colRight, sigY, { lineBreak: false });
  doc
    .fillColor(C.mist)
    .font("Helvetica")
    .fontSize(7)
    .text(data.parties.licenseeName, colRight, sigY + 12, { lineBreak: false });

  // Date de validation (achat) si disponible
  if (data.acceptedAt) {
    const acceptedStr = data.acceptedAt.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    doc
      .fillColor(C.mist)
      .font("Helvetica")
      .fontSize(6.5)
      .text(`Validé le : ${acceptedStr}`, colRight, sigY + 22, { lineBreak: false });
    
    if (data.acceptedIp) {
      doc
        .fillColor(C.cloud)
        .font("Helvetica")
        .fontSize(6)
        .text(`IP: ${data.acceptedIp}`, colRight, sigY + 31, { lineBreak: false });
    }
  } else {
    doc
      .fillColor(C.mist)
      .font("Helvetica")
      .fontSize(7)
        .text("Validation enregistrée au paiement", colRight, sigY + 22, { lineBreak: false });
  }

      return sigY + 58;
}

// ─── 9. FOOTER ────────────────────────────────────────────────────────────────
function drawFooter(doc: PDFKit.PDFDocument, data: ContractData): void {
  const FOOTER_H = 28;
  const footerY = PAGE_H - FOOTER_H;

  doc.rect(0, footerY, PAGE_W, FOOTER_H).fill(C.footerBg);
  hr(doc, footerY, C.cloud, 0.8, 0, PAGE_W);

  doc
    .fillColor(C.mist)
    .font("Helvetica")
    .fontSize(6)
    .text(
      `${SELLER.website} — ${SELLER.email}`,
      ML,
      footerY + 9,
      { width: CONTENT, align: "center", lineBreak: false }
    );

  doc
    .fillColor(C.cloud)
    .font("Helvetica")
    .fontSize(6)
    .text("© 2026 SUMVIBES", ML, footerY + 17, {
      width: CONTENT,
      align: "center",
      lineBreak: false,
    });
}
