// config/browser.js
import puppeteer from "puppeteer";

// Use globalThis to survive multiple module evaluations
const BROWSER_KEY = "__puppeteer_browser__";

export async function getBrowser(executablePath) {
  if (!globalThis[BROWSER_KEY]) {
    console.log("  🚀 Launching NEW browser instance...");
    globalThis[BROWSER_KEY] = await puppeteer.launch({
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
  return globalThis[BROWSER_KEY];
}

export default getBrowser;