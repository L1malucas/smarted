import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local")
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface GlobalMongoose {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: GlobalMongoose;
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'SMARTED',
    }

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose
    }).catch((error) => {
      console.error('Erro ao conectar ao MongoDB:', error);
      throw new Error('Falha na conexão com o banco de dados.');
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect