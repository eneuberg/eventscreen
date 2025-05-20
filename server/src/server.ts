import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app  = express();
const http = createServer(app);
const io   = new Server(http, { cors: { origin: '*' } });

app.use(cors());
app.use(helmet());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


http.listen(process.env.PORT ?? 3000);
