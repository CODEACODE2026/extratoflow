import fs from "node:fs/promises";

import pdfParse from "pdf-parse";

import { AppError } from "../../shared/errors/app-error";

export const extractTextFromPdf = async (filePath: string) => {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);
  const text = result.text.trim();

  if (!text) {
    throw new AppError("PDF sem texto extraivel. OCR nao faz parte do MVP.", 422, "PDF_TEXT_NOT_EXTRACTABLE");
  }

  return text;
};
