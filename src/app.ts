import 'source-map-support/register';

import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

// import { Active } from './shared/types';

const PORT = 4000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/lol', (req, res) => {
  res.send('hello world');
});

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static('client/build'));
}

io.on('connection', socket => {
  console.log('a socket connected');

  const interval = setInterval(() => {
    socket.emit('boo', { hello: 'world' });
  }, 1500);

  socket.on('disconnect', () => {
    console.log('the socket disconnected');
    clearInterval(interval);
  });
});

server.listen(PORT);
