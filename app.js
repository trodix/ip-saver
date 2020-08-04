const express = require('express');

const app = express();
const port = 3000;

app.set('trust proxy', true);


app.get('/ping', (req, res) => {
  const clientIpAddress = req.ip;
  res.send(200, `${clientIpAddress}`);
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});