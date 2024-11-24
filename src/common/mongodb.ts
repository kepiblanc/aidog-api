import mongoose from 'mongoose';
import pino from 'pino';
import dotenv from 'dotenv'

dotenv.config();

const logger = pino()

export const MongoDB = async () => {
  mongoose.set("strictQuery", false);
  
  try {
    const Connection = await mongoose.connect(process.env.MONGO_DB_URL as string, {
      dbName: "aidogs"
    });
    logger.info('Connected to database', { db: Connection.connections[0].name });
    return Connection;
  } catch (err: any) {
    logger.error('Database connection failed', { error: err.message });
  }
}