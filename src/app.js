const express = require('express');

const app = express();
const port = 3000;

app.set('trust proxy', true);


app.get('/ping', (req, res) => {
  const clientIpAddress = req.ip;
  res.send(200, `${clientIpAddress}`);
});

// '0.0.0.0' force the ip address to be ipv4 to avoid ::ffff: prefix
app.listen(port, '0.0.0.0', () => {
  console.log(`app is listening on port ${port}`);
});