import multer, { FileFilterCallback, File as MulterFile } from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import type { Request } from 'express';

/* ------------------------------------------------------------------ */
/* 1) Ensure the uploads directory exists at boot                     */
/* ------------------------------------------------------------------ */
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';
await fs.mkdir(UPLOAD_DIR, { recursive: true });

/* ------------------------------------------------------------------ */
/* 2) Configure Multer’s disk storage                                 */
/* ------------------------------------------------------------------ */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),

  filename: (_, file, cb) => {
    /* generate collision-proof filename: <uuid>.<original-ext> */
    const ext = path.extname(file.originalname);
    const id  = crypto.randomUUID();
    cb(null, `${id}${ext}`);
  }
});

/* ------------------------------------------------------------------ */
/* 3) Optional – accept only media MIME types & limit size            */
/* ------------------------------------------------------------------ */
const ALLOWED = /^(image|audio|video)\//;

function fileFilter(
  _req: Request,
  file: MulterFile,
  cb: FileFilterCallback
) {
  ALLOWED.test(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Unsupported file type'));
}

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },  // 25 MB cap
  fileFilter
});
