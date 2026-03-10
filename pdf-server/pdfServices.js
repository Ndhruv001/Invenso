import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePdfFromTemplate(templateName, data) {
  let browser;

  try {
    console.log("🧾 PDF SERVICE START");

    // 1️⃣ Load template
    const templatePath = path.join(__dirname, "templates", templateName);
    let html = fs.readFileSync(templatePath, "utf-8");

    for (const [key, value] of Object.entries(data)) {
      html = html.replaceAll(`{{${key}}}`, value ?? "");
    }

    console.log("Executable Path:", puppeteer.executablePath());
    // 2️⃣ Launch Chrome (Render-safe)
    browser = await puppeteer.launch({
      headless: "new",
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu"
  ],
      timeout: 60000 // increase launch timeout
    });

    const page = await browser.newPage();

    // prevent memory leaks
    await page.setViewport({ width: 1200, height: 800 });

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" }
    });

    return pdfBuffer;
  } catch (error) {
    console.error("❌ PDF GENERATION ERROR:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export { generatePdfFromTemplate };
export default generatePdfFromTemplate;
