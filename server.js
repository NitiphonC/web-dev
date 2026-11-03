const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const multer = require("multer");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "1h" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/study", express.static(path.join(__dirname, "study")));

/* ------------------------------------------------------------------ */
/*  Upload (multer)                                                    */
/* ------------------------------------------------------------------ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9ก-๙_-]/g, "_")
      .slice(0, 40);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.mimetype);
    if (!ok) return cb(new Error("อนุญาตเฉพาะไฟล์รูปภาพ (png, jpg, webp, gif)"));
    cb(null, true);
  },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const toInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

function bookRowToJson(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    stock: row.stock,
    coverUrl: row.cover_url,
    categoryId: row.category_id,
    categoryName: row.category_name ?? null,
    createdAt: row.created_at,
  };
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */
app.get("/api/categories", (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id) AS book_count
       FROM categories c ORDER BY c.id`
    )
    .all();
  res.json(rows);
});

app.post("/api/categories", (req, res) => {
  const { name, description = "" } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: "ต้องระบุชื่อหมวดหมู่" });

  try {
    const info = db
      .prepare("INSERT INTO categories (name, description) VALUES (?, ?)")
      .run(name.trim(), description);
    const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(Number(info.lastInsertRowid));
    res.status(201).json(row);
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) {
      return res.status(409).json({ message: "มีชื่อหมวดหมู่นี้อยู่แล้ว" });
    }
    throw e;
  }
});

app.put("/api/categories/:id", (req, res) => {
  const id = toInt(req.params.id);
  const { name, description = "" } = req.body;
  if (!id) return res.status(400).json({ message: "id ไม่ถูกต้อง" });
  if (!name || !name.trim()) return res.status(400).json({ message: "ต้องระบุชื่อหมวดหมู่" });

  const info = db
    .prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?")
    .run(name.trim(), description, id);
  if (info.changes === 0) return res.status(404).json({ message: "ไม่พบหมวดหมู่" });

  res.json(db.prepare("SELECT * FROM categories WHERE id = ?").get(id));
});

app.delete("/api/categories/:id", (req, res) => {
  const id = toInt(req.params.id);
  if (!id) return res.status(400).json({ message: "id ไม่ถูกต้อง" });

  const used = db.prepare("SELECT COUNT(*) AS c FROM books WHERE category_id = ?").get(id).c;
  if (used > 0) {
    return res.status(409).json({ message: `ลบไม่ได้ เพราะมีหนังสืออยู่ในหมวดนี้ ${used} เล่ม` });
  }

  const info = db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  if (info.changes === 0) return res.status(404).json({ message: "ไม่พบหมวดหมู่" });
  res.status(204).end();
});

/* ------------------------------------------------------------------ */
/*  Books                                                              */
/* ------------------------------------------------------------------ */
app.get("/api/books", (req, res) => {
  const { search = "", category_id } = req.query;
  const page = Math.max(1, toInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, toInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];
  if (search.trim()) {
    where.push("(b.title LIKE ? OR b.author LIKE ?)");
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }
  if (toInt(category_id)) {
    where.push("b.category_id = ?");
    params.push(toInt(category_id));
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const total = db
    .prepare(`SELECT COUNT(*) AS c FROM books b ${whereSql}`)
    .get(...params).c;

  const rows = db
    .prepare(
      `SELECT b.*, c.name AS category_name
       FROM books b JOIN categories c ON c.id = b.category_id
       ${whereSql}
       ORDER BY b.id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({ data: rows.map(bookRowToJson), page, limit, total, totalPages: Math.ceil(total / limit) });
});

app.get("/api/books/:id", (req, res) => {
  const id = toInt(req.params.id);
  const row = db
    .prepare(
      `SELECT b.*, c.name AS category_name
       FROM books b JOIN categories c ON c.id = b.category_id
       WHERE b.id = ?`
    )
    .get(id);
  if (!row) return res.status(404).json({ message: "ไม่พบหนังสือ" });
  res.json(bookRowToJson(row));
});

app.post("/api/books", upload.single("cover"), (req, res) => {
  const { title, author, price = 0, stock = 0, category_id } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: "ต้องระบุชื่อหนังสือ" });
  if (!author || !author.trim()) return res.status(400).json({ message: "ต้องระบุชื่อผู้แต่ง" });
  if (!toInt(category_id)) return res.status(400).json({ message: "ต้องเลือกหมวดหมู่" });

  const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(toInt(category_id));
  if (!category) return res.status(400).json({ message: "ไม่พบหมวดหมู่ที่เลือก" });

  const coverUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const info = db
    .prepare(
      `INSERT INTO books (title, author, price, stock, cover_url, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(title.trim(), author.trim(), Number(price) || 0, Number(stock) || 0, coverUrl, toInt(category_id));

  const row = db
    .prepare(
      `SELECT b.*, c.name AS category_name FROM books b
       JOIN categories c ON c.id = b.category_id WHERE b.id = ?`
    )
    .get(Number(info.lastInsertRowid));

  res.status(201).json(bookRowToJson(row));
});

app.put("/api/books/:id", upload.single("cover"), (req, res) => {
  const id = toInt(req.params.id);
  const existing = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ message: "ไม่พบหนังสือ" });

  const { title, author, price, stock, category_id } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ message: "ต้องระบุชื่อหนังสือ" });
  if (!author || !author.trim()) return res.status(400).json({ message: "ต้องระบุชื่อผู้แต่ง" });
  if (!toInt(category_id)) return res.status(400).json({ message: "ต้องเลือกหมวดหมู่" });

  const coverUrl = req.file ? `/uploads/${req.file.filename}` : existing.cover_url;

  db.prepare(
    `UPDATE books SET title = ?, author = ?, price = ?, stock = ?, cover_url = ?, category_id = ?
     WHERE id = ?`
  ).run(
    title.trim(),
    author.trim(),
    Number(price) || 0,
    Number(stock) || 0,
    coverUrl,
    toInt(category_id),
    id
  );

  const row = db
    .prepare(
      `SELECT b.*, c.name AS category_name FROM books b
       JOIN categories c ON c.id = b.category_id WHERE b.id = ?`
    )
    .get(id);

  res.json(bookRowToJson(row));
});

app.delete("/api/books/:id", (req, res) => {
  const id = toInt(req.params.id);
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(id);
  if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });

  db.prepare("DELETE FROM books WHERE id = ?").run(id);

  // ลบไฟล์ปกที่ผูกอยู่ (ถ้ามี)
  if (book.cover_url) {
    const filePath = path.join(UPLOAD_DIR, path.basename(book.cover_url));
    fs.promises.unlink(filePath).catch(() => {});
  }

  res.status(204).end();
});

/* ------------------------------------------------------------------ */
/*  อัปโหลดไฟล์เดี่ยว (เผื่อโจทย์ให้ทำ endpoint อัปโหลดแยก)                 */
/* ------------------------------------------------------------------ */
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "ไม่พบไฟล์ที่อัปโหลด" });
  res.status(201).json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });
});

/* ------------------------------------------------------------------ */
/*  Errors                                                             */
/* ------------------------------------------------------------------ */
app.use("/api", (req, res) => res.status(404).json({ message: "ไม่พบ endpoint นี้" }));

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "ไฟล์ใหญ่เกิน 2 MB" : err.message;
    return res.status(400).json({ message: msg });
  }
  if (err) return res.status(400).json({ message: err.message || "เกิดข้อผิดพลาด" });
  next();
});

app.listen(PORT, () => {
  console.log(`\n  ✅ Server: http://localhost:${PORT}`);
  console.log(`  📚 Books : http://localhost:${PORT}/#books`);
  console.log(`  🗂️  Cats  : http://localhost:${PORT}/#categories\n`);
});
