import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfQueue from "./config/pdfQueue.js";
import getBrowser from "./config/browser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────
// Core PDF Generator (NOT queued)
// ─────────────────────────────────────────────
async function generatePdfFromTemplate(templateName, data) {
  let page;

  try {
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

    // 3. Resolve Chrome Executable
    let executablePath;
    try {
      executablePath = puppeteer.executablePath();

      if (!fs.existsSync(executablePath)) {
        throw new Error(`Chrome not found at: ${executablePath}`);
      }
    } catch (err) {
      throw new Error(`Failed to resolve Chrome executable: ${err.message}`);
    }

    // 4. Get Browser (shared instance)
    const browser = await getBrowser(executablePath);

    page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    await page.setViewport({ width: 1200, height: 800 });

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (type === "image" || type === "font" || type === "media") {
        req.abort();
      } else {
        req.continue();
      }
    });

    page.on("error", (err) => {
      console.error("Page crashed:", err.message);
    });

    page.on("pageerror", (err) => {
      console.error("Page JS error:", err.message);
    });

    // 5. Generate PDF
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 0,
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

    return pdfBuffer;
  } catch (error) {
    console.error("PDF Generation Failed:", error.message);
    throw error;
  } finally {
    if (page) {
      await page.close();
    }
  }
}

// ─────────────────────────────────────────────
// Queued Version (THIS is what you call)
// ─────────────────────────────────────────────
export async function generatePdfQueued(templateName, data) {
  return pdfQueue.add(() => generatePdfFromTemplate(templateName, data));
}

export { generatePdfFromTemplate };
export default generatePdfQueued;
