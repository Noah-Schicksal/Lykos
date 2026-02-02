const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'data/database.db');
const db = new Database(dbPath);

const stmt = db.prepare('SELECT certificate_hash FROM enrollments WHERE certificate_hash IS NOT NULL LIMIT 5');
const rows = stmt.all();

console.log('Sample Certificate Hashes:');
console.log(JSON.stringify(rows, null, 2));

const countStmt = db.prepare('SELECT COUNT(*) as total FROM enrollments WHERE certificate_hash IS NOT NULL');
const count = countStmt.get();
console.log('Total certificates:', count.total);
