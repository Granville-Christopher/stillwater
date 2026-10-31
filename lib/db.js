import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "stillwater";

let clientPromise;

export function mongoConfigured() {
  return Boolean(uri);
}

export async function getDb() {
  if (!uri) {
    const error = new Error("MONGODB_URI is not set.");
    error.code = "NO_MONGO";
    throw error;
  }
  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  const client = await clientPromise;
  return client.db(dbName);
}

export async function deskCollection() {
  const db = await getDb();
  return db.collection("desk");
}

export async function purchaseCollection() {
  const db = await getDb();
  return db.collection("purchases");
}
