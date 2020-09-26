const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.set('trust proxy', true);

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.get('/ping', (req, res) => {
  const clientIpAddress = req.ip;

  const logLine = `[${new Date().toISOString()}] - ${clientIpAddress}\n`;

  fs.open('var/log/ip-list.log', 'a', (err, fd) => {
    if (err) throw err;
    fs.appendFile(fd, logLine, 'utf8', (err) => {
      fs.close(fd, (err) => {
        if (err) throw err;
      });
      if (err) throw err;
    });
  });

  res.status(200).send(clientIpAddress);
});

// '0.0.0.0' force the ip address to be ipv4 to avoid ::ffff: prefix
app.listen(port, '0.0.0.0', () => {
  console.log(`app is listening on port ${port}`);
});