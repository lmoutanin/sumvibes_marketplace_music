const path = require("path");
const PDFDocumentLib = require("pdfkit");
const PDFDocument = PDFDocumentLib.default || PDFDocumentLib;

function createInvoiceBuffer(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);

    doc.end();
  });
}

function generateHeader(doc) {
  doc
    .image(path.join(process.cwd(), "public", "logo.png"), 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("SUMVIBES", 110, 57)
    .fontSize(10)
    .text("SUMVIBES", 200, 50, { align: "right" })
    .text("431 rue de l'industrie prolongée".toUpperCase(), 200, 65, { align: "right" })
    .text("GUADELOUPE", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("FACTURE", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Numéro de facture:", 50, customerInformationTop).font("Helvetica-Bold")
    .text(invoice.payment.invoice_nr, 150, customerInformationTop).font("Helvetica")
    .text("Date de facture:", 50, customerInformationTop + 15)
    .text(new Date().toLocaleDateString("fr"), 150, customerInformationTop + 15)
    .text("Montant:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.payment.total),
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      invoice.shipping.city +
        ", " +
        invoice.shipping.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "DESCRIPTION",
    "LICENCE",
    "PRIX",
    "QUANTITÉ",
    "TOTAL"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.description,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Sous-total",
    "",
    formatCurrency(invoice.payment.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "TVA",
    "",
    formatCurrency(invoice.payment.tax)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Total",
    "",
    formatCurrency(invoice.payment.total)
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Merci pour votre achat chez SUMVIBES. Nous espérons que vous apprécierez votre musique !",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(amount) {
  return Number(amount).toFixed(2) + " €";
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

module.exports = {
  createInvoiceBuffer
};