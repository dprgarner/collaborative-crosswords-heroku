import 'source-map-support/register';

import _ from 'lodash';
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

import setupCrossword from './crossword';

const PORT = 4000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static('client/build'));
}

setupCrossword(io);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
