/**
 * Create / sync all indexes defined on the Mongoose models.
 *   npm run db:indexes
 * Safe to run repeatedly. Requires MONGODB_URI in the environment.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectToDatabase } from "./index";
import { PersonModel, SightingModel, CheckInModel } from "./models";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local first.");
  }
  await connectToDatabase();
  await Promise.all([
    PersonModel.syncIndexes(),
    SightingModel.syncIndexes(),
    CheckInModel.syncIndexes(),
  ]);
  console.log("Indexes synced.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
