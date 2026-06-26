/**
 * Seed the SOSVEN database with the sample dataset.
 *   npm run db:seed
 * Requires MONGODB_URI (and optionally MONGODB_DB) in .env.local or the env.
 */
import "dotenv/config";
import { connectToDatabase } from "./index";
import { PersonModel } from "./models";
import { samplePersons } from "../sample-data";
import mongoose from "mongoose";

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local before seeding.");
  }
  await connectToDatabase();

  const ids = samplePersons.map((p) => p._id);
  await PersonModel.deleteMany({ _id: { $in: ids } });
  await PersonModel.insertMany(samplePersons, { ordered: false });
  await PersonModel.syncIndexes();

  console.log(`Seeded ${samplePersons.length} personas into "${mongoose.connection.name}".`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
