import { PDFDocument } from "pdf-lib";
import { ContractData, createContractBuffer } from "./createContract";
import { createInvoiceBuffer, Invoice } from "./createInvoice";

export async function mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of buffers) {
    if (!buffer?.length) continue;

    const sourcePdf = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const bytes = await mergedPdf.save();
  return Buffer.from(bytes);
}

export async function createMergedPurchaseDocumentBuffer(
  invoiceData: Invoice,
  contractDocuments: ContractData[]
): Promise<Buffer> {
  const buffers: Buffer[] = [await createInvoiceBuffer(invoiceData)];

  for (const contractDocument of contractDocuments) {
    buffers.push(await createContractBuffer(contractDocument));
  }

  return mergePdfBuffers(buffers);
}
