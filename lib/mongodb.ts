import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URL;
if (!uri)
  throw new Error("Please add MONGODB_URI or DATABASE_URL to your .env");

// Get database name from environment variable or extract from URI
const getDatabaseName = (): string => {
  // First, check if DATABASE_NAME is explicitly set
  if (process.env.DATABASE_NAME) {
    return process.env.DATABASE_NAME;
  }

  // Try to extract database name from URI
  // Format: mongodb://host:port/database or mongodb+srv://host/database
  const uriMatch = uri.match(/\/([^/?]+)(\?|$)/);
  if (uriMatch && uriMatch[1]) {
    return uriMatch[1];
  }

  // Default fallback (you can change this to your preferred default)
  return process.env.MONGODB_DATABASE || "rim-ebay";
};

const databaseName = getDatabaseName();

const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 8000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalForMongo = global as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const c = await clientPromise;
  // Explicitly specify the database name to ensure we connect to the correct database
  return c.db(databaseName);
}
