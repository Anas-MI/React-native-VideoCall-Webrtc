import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import https from 'https';
import http from 'http';
import helmet from 'helmet';
import fs from 'fs';
import socketIO from 'socket.io';

import { loggerMiddleware, logger } from './helpers/loggerHelper';
import { APP_BASE, APP_PORT } from './configs/app';
import { onError } from './helpers/serverHelper';
import errorHandle from './helpers/errorHandle';
import appRouter from './appRouter';

var options = {
  key: fs.readFileSync(`${APP_BASE}/../keys/server.key`),
  cert: fs.readFileSync(`${APP_BASE}/../keys/server.crt`),
};

const app = express();
// const server = https.createServer(options, app);
const server = http.createServer(app);
const io = socketIO(server);
// const io = null;

app.set('port', APP_PORT);

// app.use(logger('dev'));
app.use(cors());
app.use(helmet());
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(APP_BASE, 'public')));
app.use('/api', appRouter(io));
app.use('*', (req, res) =>
  res.sendFile(path.join(APP_BASE, 'public', 'index.html'))
);
app.use(errorHandle);

server.listen(APP_PORT, () => {
  logger.info(`listening on :${APP_PORT}`);
});

server.on('error', onError);
