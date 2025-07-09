/**
 * @file `db.ts` é responsável pela configuração e conexão com o banco de dados MongoDB.
 * Ele gerencia a instância do cliente MongoDB, garantindo uma única conexão
 * para toda a aplicação e fornecendo funções para acessar o banco de dados e coleções específicas.
 * @module Database
 */

import { IUser } from '@/domain/models/User';
import { INotification } from '@/domain/models/Notification';
import { IJob } from '@/domain/models/Job'; // Import IJob
import { ICandidate } from '@/domain/models/Candidate';
import { IShareableLink } from '@/domain/models/ShareableLink';
import { IFileMetadata } from '@/domain/models/FileMetadata'; // Import IFileMetadata
import { ISystemSettings } from '@/domain/models/SystemSettings';
import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import { ITenant } from '@/domain/models/Tenant';

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
 * @returns {Promise<Collection<IUser>>} Uma promessa que resolve para a coleção 'users'.
 */
export async function getUsersCollection(): Promise<Collection<IUser>> {
  const db = await getDb();
  const usersCollection = db.collection('users');
  await usersCollection.createIndex({ email: 1 }, { unique: true }); // Ensure unique index on email
  return usersCollection;
}

/**
 * Retorna a coleção 'jobs' do banco de dados MongoDB.
 * @returns {Promise<Collection<IJob>>} Uma promessa que resolve para a coleção 'jobs'.
 */
export async function getJobsCollection(): Promise<Collection<IJob>> {
  const db = await getDb();
  return db.collection('jobs');
}

/**
 * Retorna a coleção 'candidates' do banco de dados MongoDB.
 * @returns {Promise<Collection<ICandidate>>} Uma promessa que resolve para a coleção 'candidates'.
 */
export async function getCandidatesCollection(): Promise<Collection<ICandidate>> {
  const db = await getDb();
  return db.collection<ICandidate>('candidates');
}

/**
 * Retorna a coleção 'shareablelinks' do banco de dados MongoDB.
 * @returns {Promise<Collection<IShareableLink>>} Uma promessa que resolve para a coleção 'shareablelinks'.
 */
export async function getShareableLinksCollection(): Promise<Collection<IShareableLink>> {
  const db = await getDb();
  return db.collection<IShareableLink>('shareablelinks');
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
 * @returns {Promise<Collection<ISystemSettings>>} Uma promessa que resolve para a coleção 'systemsettings'.
 */
export async function getSystemSettingsCollection(): Promise<Collection<ISystemSettings>> {
  const db = await getDb();
  return db.collection<ISystemSettings>('systemsettings');
}

/**
 * Retorna a coleção 'notifications' do banco de dados MongoDB.
 * @returns {Promise<Collection<INotification>>} Uma promessa que resolve para a coleção 'notifications'.
 */
export async function getNotificationsCollection(): Promise<Collection<INotification>> {
  const db = await getDb();
  return db.collection('notifications');
}

/**
 * Retorna a coleção 'files' do banco de dados MongoDB.
 * @returns {Promise<Collection<IFileMetadata>>} Uma promessa que resolve para a coleção 'files'.
 */
export async function getFilesCollection(): Promise<Collection<IFileMetadata>> {
  const db = await getDb();
  return db.collection('files');
}

/**
 * Retorna a coleção 'tenants' do banco de dados MongoDB.
 * @returns {Promise<Collection<ITenant>>} Uma promessa que resolve para a coleção 'tenants'.
 */
export async function getTenantsCollection(): Promise<Collection<ITenant>> {
  const db = await getDb();
  return db.collection('tenants');
}