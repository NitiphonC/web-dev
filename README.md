# Library Catalog — ตัวอย่างสำหรับสอบปฏิบัติ Web Engineering & Contemporary Technology

โปรเจกต์ตัวอย่างสำหรับซ้อมข้อสอบปฏิบัติ: **CRUD 2 ตาราง + อัปโหลดไฟล์**
ใช้ **Express + SQLite (node:sqlite) + Vanilla JS** — clone แล้ว `npm install` แล้วรันได้เลย ไม่ต้องติดตั้งฐานข้อมูลเพิ่ม

> มี **เว็บคู่มือสอบ** อยู่ที่ `/study/` (เปิดหลังรัน server) — สอนตั้งแต่เปิด terminal, อ่าน error, จับคู่ชิ้นส่วนโค้ด ไปจนถึงแนวข้อสอบ 30 + 10 + 5 ข้อ พร้อมเฉลย

---

## Quickstart

```bash
git clone <repo-url> exam
cd exam
npm install
npm start
```

เปิด http://localhost:3000

| หน้า | คำอธิบาย |
|---|---|
| `/` | ตัวแอป (ตารางหนังสือ + หมวดหมู่ + อัปโหลดปก) |
| `/study/` | หน้าหลักคู่มือ: ภาพรวมข้อสอบ, แผน 4 ชั่วโมง, checklist |
| `/study/build.html` | ลงมือทำทีละขั้น (terminal → DB → CRUD → upload → frontend → Git) |
| `/study/help.html` | รวม error + วิธีอ่าน, ชิ้นส่วนที่ต้องจับคู่, วิธี adapt โจทย์ |
| `/study/quiz.html` | แนวข้อสอบ 30 + 10 + 5 ข้อ ตรวจคะแนนได้ |
| `/api/*` | REST API |

โหมด dev (รีสตาร์ทเองเมื่อแก้ไฟล์):

```bash
npm run dev
```

รีเซ็ตฐานข้อมูล (ลบ `library.db` แล้ว seed ใหม่):

```bash
npm run db:reset
```

---

## โครงสร้างโปรเจกต์

```
.
├── server.js          # Express app + CRUD + multer upload + error handler
├── db.js              # schema 2 ตาราง (categories, books) + seed
├── openapi.yaml       # สเปกไว้ gen โค้ด / import Postman
├── package.json
├── public/            # frontend (vanilla JS)
│   ├── index.html
│   ├── styles.css
│   └── app.js         # fetch / FormData / render / event delegation
├── study/             # คู่มือสอบ (static site 4 หน้า)
│   ├── index.html     # ภาพรวม + แผนเวลา + checklist
│   ├── build.html     # สอนทีละขั้น (terminal, DB, CRUD, upload, frontend, Git)
│   ├── help.html      # error dictionary + wiring + adapt โจทย์
│   ├── quiz.html      # แนวข้อสอบ 45 ข้อ
│   ├── styles.css
│   └── app.js         # quiz data + grading + scroll spy + checklist
└── uploads/           # ไฟล์ที่อัปโหลด (ignored ยกเว้น .gitkeep)
```

---

## API

Base URL: `http://localhost:3000`

### Categories

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/categories` | ดูทั้งหมด (พร้อมจำนวนหนังสือ) |
| POST | `/api/categories` | เพิ่ม `{ name, description }` |
| PUT | `/api/categories/:id` | แก้ไข |
| DELETE | `/api/categories/:id` | ลบ (409 ถ้ายังมีหนังสืออยู่) |

### Books

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/books?search=&category_id=&page=&limit=` | list + ค้นหา + แบ่งหน้า |
| GET | `/api/books/:id` | ดู 1 รายการ |
| POST | `/api/books` | เพิ่ม (multipart/form-data, field `cover`) |
| PUT | `/api/books/:id` | แก้ไข (multipart/form-data) |
| DELETE | `/api/books/:id` | ลบ + ลบไฟล์ปก |

### Upload

| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/api/upload` | อัปโหลดไฟล์เดี่ยว (field `file`) |

ตัวอย่าง:

```bash
# list
curl http://localhost:3000/api/books

# create (JSON, ไม่มีไฟล์)
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Refactoring","author":"Martin Fowler","price":950,"stock":2,"category_id":1}'

# create (มีไฟล์ปก)
curl -X POST http://localhost:3000/api/books \
  -F "title=Refactoring" \
  -F "author=Martin Fowler" \
  -F "price=950" \
  -F "stock=2" \
  -F "category_id=1" \
  -F "cover=@cover.jpg"
```

---

## จุดที่ต้องจำเข้าห้องสอบ

### 1. Schema + FK

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE categories (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE books (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT
);
```

### 2. multer + static

```js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

app.use("/uploads", express.static(UPLOAD_DIR));
app.post("/api/books", upload.single("cover"), handler);
```

### 3. FormData ฝั่ง client

```js
const fd = new FormData();
fd.append("title", title);
fd.append("cover", fileInput.files[0]);   // ชื่อต้องตรงกับ upload.single("cover")

await fetch("/api/books", { method: "POST", body: fd });
// ห้ามใส่ Content-Type เอง — browser ใส่ boundary ให้
```

### 4. Status codes

| Code | ใช้เมื่อ |
|---|---|
| 200 | อ่าน/แก้ไขสำเร็จ |
| 201 | สร้างสำเร็จ |
| 204 | ลบสำเร็จ (ไม่มี body) |
| 400 | ข้อมูลไม่ถูกต้อง |
| 404 | ไม่พบข้อมูล |
| 409 | ชนกัน (ชื่อซ้ำ / ลบ parent ไม่ได้) |
| 500 | server error |

---

## Gen โค้ดจาก OpenAPI

```bash
# สร้าง Express server scaffold จาก spec
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g nodejs-express-server \
  -o generated

# ตรวจ spec
npx @redocly/cli lint openapi.yaml

# เปิดเอกสาร
npx @redocly/cli preview-docs openapi.yaml
```

หรือ import `openapi.yaml` เข้า **Postman** → ได้ collection ครบทุก endpoint → ยิงทดสอบ → กด Code snippet เพื่อเอาโค้ด fetch/axios ไปใช้

---

## แผนซ้อมก่อนสอบ

1. รันโปรเจกต์นี้ให้ผ่าน 1 รอบ แล้วไล่อ่าน `server.js` ทีละ route
2. อ่าน `/study/build.html` บท 0–5 ให้เข้าใจว่าทุกคำสั่งทำอะไร และควรเห็น output อะไร
3. ลบ `public/app.js` ทิ้ง แล้วเขียนใหม่จาก cheat sheet ให้ได้ใน 30 นาที
4. ลองเปลี่ยนโดเมนเป็นอย่างอื่น (products/categories, courses/lessons) แล้วทำ CRUD ใหม่ทั้งหมด
5. ซ้อมทำ quiz ที่ `/study/quiz.html` ให้ได้ ≥ 80%
6. เปิด `/study/help.html` ตอนเจอ error — อย่าเสียเวลาเดา
7. ลอง gen โค้ดจาก `openapi.yaml` และต่อ DB เข้ากับ service ที่ gen มา

---

## หมายเหตุด้านความปลอดภัยของข้อสอบ

- ตอนที่ 2 เปิดอินเทอร์เน็ตได้ แต่ **ห้ามใช้ AI / เว็บ AI / extension AI** ทุกชนิด
- มีการเก็บ log internet และบันทึกหน้าจอตลอดเวลาสอบ
- ทุจริต = **F ทุกรายวิชา**
- อนุญาตให้ดูโค้ดเก่า/docs ได้ แต่ต้องพิมพ์และเข้าใจเอง

---

## License

ใช้เพื่อการศึกษา
