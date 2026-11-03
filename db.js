const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "library.db");

const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT    DEFAULT '',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    author      TEXT    NOT NULL,
    price       REAL    NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    cover_url   TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
  CREATE INDEX IF NOT EXISTS idx_books_title    ON books(title);
`);

// seed ข้อมูลตัวอย่างครั้งแรก
const categoryCount = db.prepare("SELECT COUNT(*) AS c FROM categories").get().c;
if (categoryCount === 0) {
  const insertCategory = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)");
  insertCategory.run("Programming", "หนังสือเขียนโปรแกรมและวิศวกรรมซอฟต์แวร์");
  insertCategory.run("Database", "ฐานข้อมูลและการออกแบบสคีมา");
  insertCategory.run("Web Technology", "เว็บสมัยใหม่ frontend/backend");

  const insertBook = db.prepare(
    "INSERT INTO books (title, author, price, stock, category_id) VALUES (?, ?, ?, ?, ?)"
  );
  insertBook.run("Clean Code", "Robert C. Martin", 890, 5, 1);
  insertBook.run("Designing Data-Intensive Applications", "Martin Kleppmann", 1290, 3, 2);
  insertBook.run("You Don't Know JS Yet", "Kyle Simpson", 450, 8, 3);
}

module.exports = db;
