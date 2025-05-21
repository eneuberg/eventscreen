import { Router } from 'express';
import { upload } from '../lib/upload.js';        // path as ESM
import { io } from '../socket';                // export io once from server

export const boardsRouter = Router();

/* POST /boards/:id/upload  — multipart/form-data body */
boardsRouter.post(
  '/:id/upload',
  upload.single('file'),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file received' });
      return;
    }

  /* Build a minimal metadata object */
  const meta = {
    id: crypto.randomUUID(),            // element id (TS type later)
    boardId,
    url: `/uploads/${req.file.filename}`,
    type: req.file.mimetype,
    /* client will send x / y / width / height in Phase 4 — ignore for now */
    createdAt: Date.now()
  };

  /* Broadcast to everyone already on the board */
  io.to(req.params.id).emit('element_added', meta);

  /* Respond to the uploader too */
  res.status(201).json(meta);
});
