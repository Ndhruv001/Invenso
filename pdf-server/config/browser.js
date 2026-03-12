import puppeteer from "puppeteer";

let browser;

export async function getBrowser(executablePath) {

  if (!browser) {

    browser = await puppeteer.launch({
      headless: "new",
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
      timeout: 60000,
    });

  }

  return browser;
}

export default getBrowser;