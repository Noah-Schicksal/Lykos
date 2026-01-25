import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(__dirname, '../../data/database.db');

const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
