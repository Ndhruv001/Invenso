import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePdfFromTemplate(templateName, data) {
  console.log("GENERATE PDF FROM TEMPLATE SERVICE START")
  // 1. Load the HTML template
  const templatePath = path.join(__dirname, "../templates", templateName);
  let html = fs.readFileSync(templatePath, "utf-8");

  // 2. Replace all {{placeholders}} with real data
  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value ?? "");
  }

  // 3. Launch Puppeteer (headless Chrome)
  const browser = await puppeteer.launch({ headless: true });
  console.log("🚀 ~ generatePdfFromTemplate ~ browser:", browser)
  const page = await browser.newPage();
  console.log("🚀 ~ generatePdfFromTemplate ~ page:", page)

  // 4. Load your HTML into the browser
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  // 5. Print to PDF — A4, no extra margins
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" }
  });
  console.log("🚀 ~ generatePdfFromTemplate ~ pdfBuffer:", pdfBuffer)

  await browser.close();

  // 6. Return as Buffer (ready to send via HTTP)
  return Buffer.from(pdfBuffer);
}

export { generatePdfFromTemplate };
