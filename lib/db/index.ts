import mongoose from "mongoose";

/**
 * Mongoose connection for SOSVEN, using the serverless-safe cached-connection
 * pattern: a single connection promise is memoised on `globalThis` and reused
 * across function invocations and HMR reloads, so we never open a new pool per
 * request on Vercel.
 *
 * Configure `MONGODB_URI` (a MongoDB Atlas SRV string) and optionally
 * `MONGODB_DB` (defaults to "sosven"). When unset, the app falls back to bundled
 * sample data so it still renders on first deploy / `npm run dev`.
 */
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "sosven-server-dev";

export const hasDatabase = Boolean(uri);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _sosvenMongoose: MongooseCache | undefined;
}

const cached: MongooseCache =
  global._sosvenMongoose ?? (global._sosvenMongoose = { conn: null, promise: null });

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName,
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
