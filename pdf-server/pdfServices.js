import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔍 Helper: log system info once on startup
function logSystemInfo() {
  console.log("=".repeat(60));
  console.log("🖥️  SYSTEM INFO");
  console.log("=".repeat(60));

  const checks = {
    "Node version": () => process.version,
    "Platform": () => process.platform,
    "Arch": () => process.arch,
    "CWD": () => process.cwd(),
    "PUPPETEER_EXECUTABLE_PATH env": () => process.env.PUPPETEER_EXECUTABLE_PATH || "(not set)",
    "Puppeteer default executablePath": () => {
      try { return puppeteer.executablePath(); }
      catch (e) { return `ERROR: ${e.message}`; }
    },
    "Chrome at /usr/bin/google-chrome-stable": () => {
      try { execSync("which google-chrome-stable"); return "✅ found"; }
      catch { return "❌ not found"; }
    },
    "Chrome at /usr/bin/chromium-browser": () => {
      try { execSync("which chromium-browser"); return "✅ found"; }
      catch { return "❌ not found"; }
    },
    "Chrome at /usr/bin/chromium": () => {
      try { execSync("which chromium"); return "✅ found"; }
      catch { return "❌ not found"; }
    },
    "Chrome version (system)": () => {
      try { return execSync("google-chrome-stable --version 2>/dev/null || chromium --version 2>/dev/null || echo 'none'").toString().trim(); }
      catch { return "❌ could not determine"; }
    },
  };

  for (const [label, fn] of Object.entries(checks)) {
    try { console.log(`  ${label}: ${fn()}`); }
    catch (e) { console.log(`  ${label}: ERROR - ${e.message}`); }
  }

  console.log("=".repeat(60));
}

// Run once at module load
logSystemInfo();

async function generatePdfFromTemplate(templateName, data) {
  let browser;
  const startTime = Date.now();

  console.log("\n" + "=".repeat(60));
  console.log("🧾 PDF GENERATION START");
  console.log(`  Template: ${templateName}`);
  console.log(`  Data keys: ${Object.keys(data).join(", ")}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log("=".repeat(60));

  try {
    // ── STEP 1: Resolve template ───────────────────────────────
    const templatePath = path.join(__dirname, "templates", templateName);
    console.log(`\n📄 [1/5] Loading template...`);
    console.log(`  Path: ${templatePath}`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at: ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, "utf-8");
    console.log(`  ✅ Template loaded (${html.length} chars)`);

    // ── STEP 2: Inject data ────────────────────────────────────
    console.log(`\n🔧 [2/5] Injecting template data...`);
    let replacedCount = 0;
    for (const [key, value] of Object.entries(data)) {
      const before = html;
      html = html.replaceAll(`{{${key}}}`, value ?? "");
      if (html !== before) replacedCount++;
    }
    console.log(`  ✅ Replaced ${replacedCount}/${Object.keys(data).length} placeholders`);

    // ── STEP 3: Resolve Chrome executable ─────────────────────
    console.log(`\n🔍 [3/5] Resolving Chrome executable...`);

    const candidatePaths = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      "/usr/bin/chromium",             // ✅ what apt-get installs on Render
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
    ].filter(Boolean);

    let executablePath = null;

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        executablePath = candidate;
        console.log(`  ✅ Found Chrome at: ${candidate}`);
        break;
      } else {
        console.log(`  ⬜ Not found: ${candidate}`);
      }
    }

    // Last resort: puppeteer bundled (only works if npm install downloaded it)
    if (!executablePath) {
      try {
        // Temporarily remove env var so puppeteer returns its real internal cache path
        const savedEnv = process.env.PUPPETEER_EXECUTABLE_PATH;
        delete process.env.PUPPETEER_EXECUTABLE_PATH;
        const bundledPath = puppeteer.executablePath();
        process.env.PUPPETEER_EXECUTABLE_PATH = savedEnv;

        console.log(`  ⚠️  Trying puppeteer bundled path: ${bundledPath}`);
        console.log(`  Exists: ${fs.existsSync(bundledPath) ? "✅ yes" : "❌ NO - this will fail!"}`);

        if (fs.existsSync(bundledPath)) {
          executablePath = bundledPath;
        } else {
          throw new Error(`No Chrome found. Tried: ${candidatePaths.join(", ")} and bundled: ${bundledPath}`);
        }
      } catch (e) {
        throw new Error(`Cannot resolve any Chrome executable: ${e.message}`);
      }
    }

    // ── STEP 4: Launch browser ─────────────────────────────────
    console.log(`\n🚀 [4/5] Launching browser...`);
    console.log(`  executablePath: ${executablePath}`);

    const launchArgs = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
    ];
    console.log(`  args: ${launchArgs.join(" ")}`);

    const launchStart = Date.now();
    browser = await puppeteer.launch({
      headless: "new",
      executablePath,
      args: launchArgs,
      timeout: 60000,
    });

    console.log(`  ✅ Browser launched in ${Date.now() - launchStart}ms`);
    const version = await browser.version();
    console.log(`  Browser version: ${version}`);

    // ── STEP 5: Generate PDF ───────────────────────────────────
    console.log(`\n📑 [5/5] Generating PDF...`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Log any page-level errors
    page.on("error", (err) => console.error(`  ⚠️  Page crash: ${err.message}`));
    page.on("pageerror", (err) => console.error(`  ⚠️  Page JS error: ${err.message}`));
    page.on("console", (msg) => console.log(`  [page console] ${msg.type()}: ${msg.text()}`));

    console.log(`  Setting page content...`);
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    console.log(`  ✅ Content loaded`);

    const pdfStart = Date.now();
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    console.log(`  ✅ PDF generated in ${Date.now() - pdfStart}ms`);
    console.log(`  PDF size: ${(pdfBuffer.length / 1024).toFixed(1)} KB`);

    console.log(`\n✅ TOTAL PDF GENERATION TIME: ${Date.now() - startTime}ms`);
    console.log("=".repeat(60) + "\n");

    return pdfBuffer;

  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ PDF GENERATION FAILED");
    console.error("=".repeat(60));
    console.error(`  Error type:    ${error.constructor.name}`);
    console.error(`  Error message: ${error.message}`);
    console.error(`  Failed after:  ${Date.now() - startTime}ms`);
    console.error(`  Stack trace:\n${error.stack}`);
    console.error("=".repeat(60) + "\n");
    throw error;

  } finally {
    if (browser) {
      await browser.close();
      console.log("🔒 Browser closed");
    }
  }
}

export { generatePdfFromTemplate };
export default generatePdfFromTemplate;