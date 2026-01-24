import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/database.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export default db;