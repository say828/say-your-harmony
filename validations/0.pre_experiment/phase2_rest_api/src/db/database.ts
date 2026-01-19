/**
 * SQLite database connection and schema initialization
 * Implements defensive I/O with auto-recovery and auto-initialization
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'todos.db');

/**
 * Initialize database with auto-recovery
 * Creates directory and database file if not exists
 */
export function initializeDatabase(): Database.Database {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    const db = new Database(DB_PATH);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Create todos table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create index on completed for faster filtering
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)
    `);

    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw new Error('Failed to initialize database');
  }
}

// Singleton database instance
let dbInstance: Database.Database | null = null;

/**
 * Get database instance with auto-initialization
 */
export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
      dbInstance = null;
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
}
