// config/browser.js
import puppeteer from "puppeteer";

const BROWSER_KEY = "__puppeteer_browser__";
const BROWSER_LAUNCHING_KEY = "__puppeteer_launching__";

async function launchBrowser(executablePath) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      // ❌ REMOVED: --single-process  (kills entire browser on any page crash)
      // ❌ REMOVED: --no-zygote       (causes instability without single-process)
    ],
    timeout: 60000,
  });

  // ✅ When browser disconnects, clear the singleton so next call relaunches
  browser.on("disconnected", () => {
    console.warn("⚠️  Browser disconnected. Will relaunch on next request.");
    globalThis[BROWSER_KEY] = null;
    globalThis[BROWSER_LAUNCHING_KEY] = null;
  });

  return browser;
}

export async function getBrowser(executablePath) {
  // ✅ If healthy browser exists, reuse it
  if (globalThis[BROWSER_KEY]) {
    try {
      // Quick health check — will throw if browser is dead
      await globalThis[BROWSER_KEY].version();
      return globalThis[BROWSER_KEY];
    } catch {
      console.warn("⚠️  Browser health check failed. Relaunching...");
      globalThis[BROWSER_KEY] = null;
    }
  }

  // ✅ Prevent multiple simultaneous launches (race condition guard)
  if (!globalThis[BROWSER_LAUNCHING_KEY]) {
    globalThis[BROWSER_LAUNCHING_KEY] = launchBrowser(executablePath)
      .then((browser) => {
        globalThis[BROWSER_KEY] = browser;
        globalThis[BROWSER_LAUNCHING_KEY] = null;
        return browser;
      })
      .catch((err) => {
        globalThis[BROWSER_LAUNCHING_KEY] = null;
        throw err;
      });
  }

  return globalThis[BROWSER_LAUNCHING_KEY];
}

export default getBrowser;