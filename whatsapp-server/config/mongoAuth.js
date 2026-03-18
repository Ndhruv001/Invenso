import pkg from "whatsapp-web.js";
import { MongoStore } from "wwebjs-mongo";
import mongoose from "mongoose";

const { RemoteAuth } = pkg;

export async function createMongoAuthStrategy() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected for session storage");

  const store = new MongoStore({ mongoose });

  return new RemoteAuth({
    store,
    backupSyncIntervalMs: 3000000, // saves every 50 minutes
  });
}