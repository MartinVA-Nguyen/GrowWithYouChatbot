import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('chat.db');

// Initialize tables
export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId TEXT,
      role TEXT,
      text TEXT,
      createdAt INTEGER
    );
  `);
}

export function getLastMessages(conversationId: string, limit: number) {
  const result = db.getAllSync(
    `SELECT role, text
     FROM messages
     WHERE conversationId = ?
     ORDER BY createdAt DESC
     LIMIT ?`,
    [conversationId, limit]
  );

  return result.reverse();
}

export function insertMessage(
  conversationId: string,
  role: string,
  text: string
) {
  db.runSync(
    `INSERT INTO messages (conversationId, role, text, createdAt)
     VALUES (?, ?, ?, ?)`,
    [conversationId, role, text, Date.now()]
  );
}

export default db;