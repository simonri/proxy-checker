const axios = require("axios");
const fs = require("fs");
const Promise = require("bluebird");

const getProxysApi = async (proxyType, anonymity) => {
  if (!(["http", "socks4", "socks5"].includes(proxyType))) {
    throw new Error("Invalid proxy type!");
  }

  if (!(["all", "elite", "anonymous", "transparent"].includes(anonymity))) {
    throw new Error("Invalid anonymity level!");
  }

  const api = `https://api.proxyscrape.com/?request=getproxies&timeout=500&country=all&ssl=all&type=${proxyType}&anonymity=${anonymity}`;

  const { data } = await axios.get(api);
  const proxys = data.split("\r\n");
  return proxys;
};

const getProxysFromFile = async (fileName) => {
  const data = fs.readFileSync(fileName);
  const parsed = JSON.parse(data);
  
  return parsed;
}

const saveProxys = (fileName, proxys) => {
  fs.writeFile(fileName, JSON.stringify(proxys), (err) => {
    if(err) throw new Error(err);
  });
};

const testProxys = async (proxys) => {
  const theUrl = "https://www.dropbox.com/robots.txt";

  let working = [];
  let count = 0;

  await Promise.map(proxys, async (proxy, i) => {
    const [ip, port] = proxy.split(":");
    count += 1;
    console.log(`${count}/${proxys.length}`);

    const options = {
      url: theUrl,
      headers: {
        "Host": theUrl,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US",
        "Accept-Encoding": "br, gzip, deflate",
        "Connection": "keep-alive",
      },
      proxy: {
        host: ip,
        port: port
      },
      timeout: 6000
    }

    try {
      await axios(options);
      working.push(proxy);
    } catch {}
  }, {concurrency: 60});

  console.log(working);

  fs.writeFile("working.txt", JSON.stringify(working), (err) => {
    if(err) throw new Error(err);
  });
};

const run = async () => {
  let proxys = [];
  const path = "proxys.txt";

  if (fs.existsSync("proxys.txt")) {
    proxys = await getProxysFromFile(path);
  } else {
    proxys = await getProxysApi("http", "all");
    saveProxys(path, proxys);
  }

  testProxys(proxys);
};

run();