import 'source-map-support/register';

import express from 'express';

const PORT = 3000;
const app = express();

app.get('/', (req, res) => {
  res.send('hello world');
});

app.listen(PORT, e => {
  if (e) {
    return console.error(e);
  }
  console.log(`app listening on port ${PORT}`);
});
