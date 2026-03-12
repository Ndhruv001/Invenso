import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfQueue from "./config/pdfQueue.js";
import getBrowser from "./config/browser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_RETRIES = 2;

// ─────────────────────────────────────────────
// Core PDF Generator (NOT queued)
// ─────────────────────────────────────────────
async function generatePdfFromTemplate(templateName, data) {
  // 1. Load Template
  const templatePath = path.join(__dirname, "templates", templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  let html = fs.readFileSync(templatePath, "utf-8");

  // 2. Inject Data
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value ?? "");
  }

  if (html.length > 500000) {
    throw new Error("HTML too large for PDF");
  }

  // 3. Resolve Chrome Executable (once, outside retry loop)
  let executablePath;
  try {
    executablePath = puppeteer.executablePath();
    if (!fs.existsSync(executablePath)) {
      throw new Error(`Chrome not found at: ${executablePath}`);
    }
  } catch (err) {
    throw new Error(`Failed to resolve Chrome executable: ${err.message}`);
  }

  // 4. Retry loop
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let page;

    try {
      console.log(`  🔄 Attempt ${attempt}/${MAX_RETRIES}`);

      // Get browser (shared singleton with auto-relaunch)
      const browser = await getBrowser(executablePath);

      page = await browser.newPage();
      page.setDefaultNavigationTimeout(30000);

      await page.setViewport({ width: 1200, height: 800 });

      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const type = req.resourceType();
        if (["image", "font", "media"].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      page.on("error", (err) => {
        console.error("  ❌ Page crashed:", err.message);
      });

      page.on("pageerror", (err) => {
        console.error("  ❌ Page JS error:", err.message);
      });

      // 5. Generate PDF
      await page.setContent(html, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0",
          bottom: "0",
          left: "0",
          right: "0",
        },
      });

      console.log("  ✅ PDF generated successfully");
      return pdfBuffer;
    } catch (error) {
      lastError = error;

      const isConnectionError =
        error.message.includes("Connection closed") ||
        error.message.includes("Target closed") ||
        error.message.includes("Protocol error") ||
        error.message.includes("Session closed");

      console.warn(
        `  ⚠️  Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`,
      );

      if (isConnectionError && attempt < MAX_RETRIES) {
        // Force browser relaunch on next attempt
        console.log(
          "  🔁 Clearing dead browser, will relaunch on next attempt...",
        );
        globalThis["__puppeteer_browser__"] = null;
        globalThis["__puppeteer_launching__"] = null;
      } else if (!isConnectionError) {
        // Non-connection error (e.g. bad HTML) — no point retrying
        console.error("  ❌ Non-retryable error, aborting.");
        throw error;
      }
    } finally {
      if (page && !page.isClosed()) {
        await page.close().catch((e) => {
          console.warn("  ⚠️  Failed to close page:", e.message);
        });
      }
    }
  }

  // All retries exhausted
  console.error(
    "  ❌ PDF Generation Failed after all retries:",
    lastError?.message,
  );
  throw lastError;
}

// ─────────────────────────────────────────────
// Queued Version (THIS is what you call)
// ─────────────────────────────────────────────
export async function generatePdfQueued(templateName, data) {
  return pdfQueue.add(() => generatePdfFromTemplate(templateName, data));
}

export { generatePdfFromTemplate };
export default generatePdfQueued;
