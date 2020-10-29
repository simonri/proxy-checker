const axios = require("axios");
const { O_TRUNC } = require("constants");
const fs = require("fs");

require("chromedriver");
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const getProxysFromFile = async (fileName) => {
  const data = fs.readFileSync(fileName);
  const parsed = JSON.parse(data);
  
  return parsed;
};

const run = async () => {
  const proxys = await getProxysFromFile("working.txt");

  const proxy = proxys[5];
  console.log("Proxy", proxy);

  const options = new chrome.Options().addArguments(`--proxy-server="http://${proxy}"`);
  console.log(options);

  let driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

  driver.get("http://whatismyip.host/")
      .then(() => console.log("DONE"));
};

run();