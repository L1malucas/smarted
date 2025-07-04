/**
 * @file `db.ts` é responsável pela configuração e conexão com o banco de dados MongoDB.
 * Ele gerencia a instância do cliente MongoDB, garantindo uma única conexão
 * para toda a aplicação e fornecendo funções para acessar o banco de dados e coleções específicas.
 * @module Database
 */

import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';

/**
 * URI de conexão com o MongoDB, obtida da variável de ambiente `MONGODB_URI`.
 * @constant
 * @type {string}
 */
const uri = process.env.MONGODB_URI as string;

// Verifica se a URI do MongoDB está definida, lançando um erro se não estiver.
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Instância do cliente MongoDB.
 * @type {MongoClient}
 */
let client: MongoClient;

/**
 * Promessa que resolve para a instância do cliente MongoDB conectado.
 * Utilizada para garantir que a conexão seja estabelecida antes de qualquer operação de banco de dados.
 * Em desenvolvimento, usa uma variável global para preservar a conexão entre reloads de módulo (HMR).
 * Em produção, cria uma nova instância para cada importação.
 * @type {Promise<MongoClient>}
 */
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Em modo de desenvolvimento, usa uma variável global para que o valor
  // seja preservado entre recarregamentos de módulo causados por HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Em modo de produção, é melhor não usar uma variável global.
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
}

/**
 * Exporta uma promessa de cliente MongoClient com escopo de módulo.
 * Ao fazer isso em um módulo separado, o cliente pode ser compartilhado entre funções.
 */
export default clientPromise;

/**
 * Retorna uma instância do objeto de banco de dados MongoDB.
 * Conecta-se ao banco de dados especificado (`SMARTED`).
 *
 * @returns {Promise<Db>} Uma promessa que resolve para a instância do banco de dados.
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('SMARTED');
}

/**
 * Retorna a coleção 'users' do banco de dados MongoDB.
 * @returns {Promise<Collection>} Uma promessa que resolve para a coleção 'users'.
 */
export async function getUsersCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('users');
}

/**
 * Retorna a coleção 'jobs' do banco de dados MongoDB.
 * @returns {Promise<Collection>} Uma promessa que resolve para a coleção 'jobs'.
 */
export async function getJobsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('jobs');
}

/**
 * Retorna a coleção 'candidates' do banco de dados MongoDB.
 * @returns {Promise<Collection>} Uma promessa que resolve para a coleção 'candidates'.
 */
export async function getCandidatesCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('candidates');
}

/**
 * Retorna a coleção 'shareablelinks' do banco de dados MongoDB.
 * @returns {Promise<Collection>} Uma promessa que resolve para a coleção 'shareablelinks'.
 */
export async function getShareableLinksCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('shareablelinks');
}

/**
 * Retorna a coleção 'logs' do banco de dados MongoDB.
 * @returns {Promise<Collection>} Uma promessa que resolve para a coleção 'logs'.
 */
export async function getLogsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('logs');
}

/**
 * Retorna a coleção 'systemsettings' do banco de dados MongoDB.
 * @returns {Promise<Collection>} Uma promessa que resolve para a coleção 'systemsettings'.
 */
export async function getSystemSettingsCollection(): Promise<Collection> {
  const db = await getDb();
  return db.collection('systemsettings');
}
