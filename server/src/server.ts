import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors';
import helmet from 'helmet';
import path from "node:path";
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as IOServer } from "socket.io";
import dotenv from "dotenv";

import { boardsRouter } from './routes/boards.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: process.env.ALLOWED_ORIGIN?.split(","), credentials: true }
});

/* ─── Express middleware ──────────────────────────────────────────────── */
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(","), credentials: true }));
app.use(express.json());                 // parse JSON bodies
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", process.env.UPLOAD_DIR!))
);
app.use('/boards', boardsRouter);


/* ─── Health check route ──────────────────────────────────────────────── */
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});


/* ─── Socket.IO setup ─────────────────────────────────────────────────── */
io.on("connection", socket => {
  console.log("👤  socket connected", socket.id);

  socket.on("join", (boardId: string) => {
    socket.join(boardId);
    console.log(`socket ${socket.id} joined board ${boardId}`);
  });

  socket.on("disconnect", () => console.log("socket disconnected", socket.id));
});

/* ─── Start server ────────────────────────────────────────────────────── */
const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 server listening on http://localhost:${PORT}`);
});