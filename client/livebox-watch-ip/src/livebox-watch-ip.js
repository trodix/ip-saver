const axios = require('axios');
const fs = require('fs');

const LIVEBOX_BASE_URL = 'http://livebox';
const LIVEBOX_API_PATH = '/ws';

const LIVEBOX_USERNAME = 'admin';
const LIVEBOX_PASSWORD = process.env.LIVEBOX_PASSWORD;

if (LIVEBOX_PASSWORD == undefined) {
  throw new Error('LIVEBOX_PASSWORD is undefined, use `export LIVEBOX_PASSWORD=<your_livebox_password>`');
}


httpClient = axios.create({
  baseURL: new URL(LIVEBOX_API_PATH, LIVEBOX_BASE_URL).href,
  headers: {
    'Content-Type': 'application/x-sah-ws-4-call+json',
    'Authorization': 'X-Sah-Login'
  }
})

const login = async () => {
  return httpClient.post('/', {
    "service": "sah.Device.Information",
    "method": "createContext",
    "parameters": {
        "applicationName": "so_sdkut",
        "username": `${LIVEBOX_USERNAME}`,
        "password": `${LIVEBOX_PASSWORD}`
    }
  })
  .then(response => {
    const body = response.data
    const data = body.data;
    httpClient.defaults.headers['X-Context'] = data.contextID
    delete httpClient.defaults.headers['Authorization']
    httpClient.defaults.withCredentials = true
  })
  .catch(err => console.error(err.response.data));
}

const getWANStatus = async () => {
  return httpClient.post('/', {
    "service": "NMC",
    "method": "getWANStatus",
    "parameters": {}
  })
  .then(response => response.data.data)
  .catch(err => console.error(err.response.data));
}

const sendIpToServerIfNew = () => {
  fs.readFile('var/log/ip-list.log', 'utf8', (err, data) => {
    const lines = data.split('\n').filter(r => !!r);
    const ipList = [];
    lines.forEach(line => ipList.push(line.split(/(\[(.*?)\]\s-\s)/)[3]));
    
    // if new ip available, send a ping request
    ipList.reverse();
    if (ipList[0] != ipList[1]) {
      console.log(`A new IPAddress is available: ${ipList[0]}`);
      axios.get('http://app.trodix.com/ping')
        .catch(err => console.error('Error: ' + err.response.data));
    } else {
      console.log(`Your IPAddress has not been updated by your ISP since the last time we check.`);
    }

    if (err) throw err;
  });
}

const logIp = (clientIpAddress) => {
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

  sendIpToServerIfNew();
}


login().then(() => {
  getWANStatus()
    .then(data => {
      console.log(data);
      logIp(data.IPAddress)
    })
})


