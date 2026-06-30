import fs from "node:fs";
import path from "node:path";

import multer from "multer";

import { AppError } from "../errors/app-error";

export const privateUploadDirectory = path.resolve(process.cwd(), "uploads/private");

fs.mkdirSync(privateUploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, privateUploadDirectory);
  },
  filename: (_request, file, callback) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    callback(null, `${Date.now()}-${safeOriginalName}`);
  }
});

export const pdfUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new AppError("Only PDF files are allowed.", 400, "INVALID_PDF_FILE"));
      return;
    }

    callback(null, true);
  }
});
