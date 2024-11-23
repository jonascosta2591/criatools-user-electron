const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
const axios = require("axios");
require("dotenv").config();
const fs = require("fs").promises;
const { delay } = require("./utils/delay");
const { reverse } = require("./utils/reverse");

puppeteer.use(StealthPlugin());

function lerAuthtokenCompletoComInfoAdicionais() {
  return new Promise((resolve) => {
    fs.readFile("./authtoken.txt", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      resolve(data.split(";")[2]);
    });
  });
}

async function selectcookiesession_chatgpt(lerTXT_uuid_grupo) {
  try {
    let authtoken = (await fs.readFile("./authtoken.txt", "utf8")).split(
      ";"
    )[0];

    const response = await axios.post(
      "http://localhost:3344/select_chat_gpt_session",
      {
        uuid_grupo: lerTXT_uuid_grupo,
      },
      {
        headers: {
          authorization: "Bearer " + authtoken,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.log(err);
  }
}

async function init_puppeteerChatGPT() {
  let hasproxy = false;
  // let path = randomIntFromInterval(10000000,99999999)
  const browser = await puppeteer.launch({
    headless: false,
    args: [hasproxy ? "--proxy-server=brd.superproxy.io:22225" : ""],
    ignoreDefaultArgs: ["--disable-extensions"],
    targetFilter: (target) => target.type() !== "other",
    // ignoreHTTPSErrors: true,
    // userDataDir: `./myUserDataDir/${randomString(10)}`,
    executablePath: executablePath(),
    // executablePath: './chrome/win64-126.0.6478.182/chrome-win64/chrome.exe'
  });

  try {
    const newPage = await browser.newPage();

    let lerTXT_uuid_grupo = (
      await fs.readFile("./authtoken.txt", "utf8")
    ).split(";")[2];

    let cookies = await selectcookiesession_chatgpt(lerTXT_uuid_grupo);
    cookies = cookies[0].cookie_chatgpt;

    cookies = JSON.parse(cookies);
    await newPage.setCookie(...cookies);

    hasproxy
      ? await newPage.authenticate({
          username:
            "brd-customer-hl_331d1452-zone-data_center-ip-178.171.117.112",
          password: "z1536rz4zbu5",
        })
      : null;

    await newPage.goto("https://chatgpt.com/");

    // await browser.close()
    // await init_puppeteerChatGPT()

    // console.log('testando')

    // let content = await newPage.evaluate(() => {
    //     return document.querySelector('*').innerHTML
    // })

    // await delay(5000)
    // await newPage.click('*')

    // await browser.close()
    // await page.waitForSelector('#spreedly-number-frame-7136')
    // const elementcc = await page.$('#spreedly-number-frame-7136');
    // const framecc = await elementcc.contentFrame();
    // await framecc.type('#card_number', number)

    // await page.evaluate(() => {
    //     document.querySelector('button[class="rw-button orange-button large"]').click()
    // })

    // await browser.close()
    // await deletePasta()
  } catch (err) {
    console.log(err);
    // await browser.close()
    // return await init_puppeteerChatGPT()
  }
}

module.exports = { init_puppeteerChatGPT };
