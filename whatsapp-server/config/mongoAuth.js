import pkg from "whatsapp-web.js";
import { MongoClient } from "mongodb";

const {BaseAuthStrategy} = pkg;
console.log("🚀 ~ pkg:", pkg)

export class MongoAuth extends BaseAuthStrategy {
  constructor({ mongoUri, dbName = "whatsapp", collectionName = "sessions", clientId = "default" }) {
    super();
    this.mongoUri = mongoUri;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.clientId = clientId;
    this.mongo = null;
    this.collection = null;
  }

  // Called once when the WhatsApp client starts
  async beforeBrowserInitialized() {
    // Connect to MongoDB
    this.mongo = new MongoClient(this.mongoUri);
    await this.mongo.connect();

    const db = this.mongo.db(this.dbName);
    this.collection = db.collection(this.collectionName);
    console.log("✅ MongoDB connected for session storage");

    // Check if a saved session exists and write it to a temp path
    // whatsapp-web.js still needs the session files on disk temporarily
    const saved = await this.collection.findOne({ clientId: this.clientId });
    if (saved?.session) {
      // Write the session data to a temp folder so Puppeteer can load it
      const fs = await import("fs");
      const sessionPath = `./temp_sessions/${this.clientId}`;
      fs.mkdirSync(sessionPath, { recursive: true });

      // Write each file back to disk (they'll be re-saved to Mongo after auth)
      for (const [filename, content] of Object.entries(saved.session)) {
        fs.writeFileSync(`${sessionPath}/${filename}`, content);
      }

      console.log("📂 Session restored from MongoDB to temp path");
    }
  }

  // Called by whatsapp-web.js when it wants to save the session
  async afterAuthReady() {
    const fs = await import("fs");
    const sessionPath = `./temp_sessions/${this.clientId}`;

    if (!fs.existsSync(sessionPath)) return;

    // Read all session files from disk and store them in MongoDB
    const files = fs.readdirSync(sessionPath);
    const sessionData = {};

    for (const file of files) {
      const fullPath = `${sessionPath}/${file}`;
      if (fs.statSync(fullPath).isFile()) {
        sessionData[file] = fs.readFileSync(fullPath, "utf-8");
      }
    }

    // Upsert into MongoDB
    await this.collection.updateOne(
      { clientId: this.clientId },
      { $set: { clientId: this.clientId, session: sessionData, updatedAt: new Date() } },
      { upsert: true }
    );

    console.log("💾 Session saved to MongoDB");
  }

  // Called when the client logs out — delete the session from DB
  async logout() {
    await this.collection?.deleteOne({ clientId: this.clientId });
    console.log("🗑️ Session deleted from MongoDB");
  }
}