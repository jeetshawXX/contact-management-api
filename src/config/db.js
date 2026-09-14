import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbFile = process.env.DB_FILE || './data/contacts.db';
const resolvedDbFile = path.resolve(dbFile);
fs.mkdirSync(path.dirname(resolvedDbFile), { recursive: true });

export const db = new Database(resolvedDbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE NOCASE,
    email TEXT NOT NULL COLLATE NOCASE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    company TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email),
    UNIQUE(phone)
  );

  CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
  CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
  CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
  CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
  CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
`);
