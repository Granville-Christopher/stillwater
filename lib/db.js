import { MongoClient } from "mongodb";
import { runtimeVar } from "./runtime-env.js";

let clientPromise;

export function mongoConfigured() {
  return Boolean(runtimeVar("MONGODB_URI"));
}

export async function getDb() {
  const uri = runtimeVar("MONGODB_URI");
  const dbName = runtimeVar("MONGODB_DB") || "stillwater";
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

export async function adminCollection() {
  const db = await getDb();
  return db.collection("admins");
}
