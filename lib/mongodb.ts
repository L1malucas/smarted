import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const dbName = "SMARTED"; // Nome do banco de dados

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let db: Db; // Adiciona a variável para o objeto Db

if (process.env.NODE_ENV === 'development') {
  // No modo de desenvolvimento, usa uma variável global para preservar o valor
  // entre recarregamentos do módulo causados pelo HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Em produção, é melhor não usar uma variável global.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Garante que o cliente retorne o banco de dados específico
const databasePromise = clientPromise.then(client => {
  db = client.db(dbName);
  return db;
});

export default databasePromise;