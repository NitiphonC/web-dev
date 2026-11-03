/* =========================================================
   Exam Playbook — quiz + navigation
   ========================================================= */

/* ===================== 1. MCQ (20 ข้อ) ===================== */
const MCQ = [
  {
    q: "HTTP method ใดใช้ \"สร้าง\" ข้อมูลใหม่ และควรตอบกลับด้วย status code อะไร",
    opts: ["POST → 201 Created", "GET → 200 OK", "PUT → 204 No Content", "PATCH → 302 Found"],
    answer: 0,
    why: "POST = สร้างใหม่, สำเร็จแล้วตอบ 201 พร้อม Location หรือ body ของข้อมูลที่สร้าง",
  },
  {
    q: "ถ้าลบข้อมูลสำเร็จและไม่ต้องส่ง body กลับ ควรใช้ status code ใด",
    opts: ["200 OK", "201 Created", "204 No Content", "205 Reset Content"],
    answer: 2,
    why: "204 คือสำเร็จแต่ไม่มี response body — ใช้กับ DELETE (หรือ PUT ที่ไม่คืนข้อมูล) บ่อยที่สุด",
  },
  {
    q: "middleware ใดของ Express ที่จำเป็นสำหรับอ่าน JSON จาก req.body",
    opts: ["express.static()", "express.json()", "express.urlencoded()", "cors()"],
    answer: 1,
    why: "express.json() แปลง JSON body → object; ถ้าลืม req.body จะเป็น undefined",
  },
  {
    q: "ถ้าฝั่ง client ส่ง multipart/form-data มายัง Express ต้องใช้อะไรอ่านไฟล์",
    opts: ["body-parser", "multer", "cookie-parser", "express.json()"],
    answer: 1,
    why: "multer เป็น middleware สำหรับ multipart/form-data โดยเฉพาะ — express.json() อ่านไฟล์ไม่ได้",
  },
  {
    q: "การตั้งค่า multer ข้อใดผิด",
    opts: [
      "upload.single(\"cover\") เพื่อรับไฟล์เดี่ยวชื่อ field cover",
      "upload.array(\"images\", 5) เพื่อรับหลายไฟล์",
      "ตั้ง headers Content-Type: multipart/form-data เองตอน fetch",
      "ใช้ limits.fileSize จำกัดขนาดไฟล์",
    ],
    answer: 2,
    why: "ห้ามตั้ง Content-Type เอง เพราะ browser ต้องใส่ boundary ให้อัตโนมัติ ถ้าตั้งเองจะขาด boundary แล้ว server อ่านไฟล์ไม่ได้",
  },
  {
    q: "คำสั่ง SQL ใดดึงหนังสือพร้อมชื่อหมวดหมู่จาก 2 ตาราง",
    opts: [
      "SELECT * FROM books, categories;",
      "SELECT b.*, c.name FROM books b JOIN categories c ON c.id = b.category_id;",
      "SELECT * FROM books WHERE category_id = categories.id;",
      "SELECT b.*, c.name FROM books b UNION categories c;",
    ],
    answer: 1,
    why: "ต้อง JOIN ด้วย FK (books.category_id = categories.id) — การคูณตารางแบบไม่มีเงื่อนไขจะได้ Cartesian product",
  },
  {
    q: "ตารางลูก (child) ที่อ้าง FK ไปตารางแม่ ควรกำหนด ON DELETE อะไรถ้าไม่ต้องการให้ลบแม่ที่มีลูกอยู่",
    opts: ["CASCADE", "SET NULL", "RESTRICT", "NO ACTION เท่านั้น"],
    answer: 2,
    why: "RESTRICT (หรือ NO ACTION) จะบล็อกการลบ parent ที่ยังมี child อยู่ — CASCADE จะลบลูกตามไปด้วย",
  },
  {
    q: "ใน node:sqlite ค่าที่ได้จาก info.lastInsertRowid ควรทำอย่างไรก่อนใช้ต่อ",
    opts: [
      "ใช้ได้เลยเพราะเป็น number",
      "แปลงเป็น Number() เพราะอาจเป็น BigInt",
      "แปลงเป็น String เพื่อความปลอดภัย",
      "ใช้ JSON.stringify()",
    ],
    answer: 1,
    why: "lastInsertRowid เป็น BigInt — ต้อง Number(info.lastInsertRowid) ก่อนเอาไปใช้ใน JSON หรือ query",
  },
  {
    q: "RESTful ที่ดี ควรตั้ง path สำหรับ \"หนังสือ 1 เล่ม\" อย่างไร",
    opts: ["/getBook?id=1", "/api/books/1", "/api/books?id=1&action=get", "/api/book-detail/1"],
    answer: 1,
    why: "REST ใช้ path แทน resource และระบุตัวตนด้วย path parameter เช่น /api/books/:id",
  },
  {
    q: "PUT กับ PATCH ต่างกันอย่างไร",
    opts: [
      "เหมือนกันทุกอย่าง",
      "PUT แทนที่ทั้ง resource, PATCH แก้บาง field",
      "PUT ใช้ได้กับ GET เท่านั้น",
      "PATCH ใช้ได้เฉพาะ GraphQL",
    ],
    answer: 1,
    why: "PUT = replace ทั้งก้อน, PATCH = partial update เฉพาะ field ที่ส่งมา",
  },
  {
    q: "ข้อใดคือหน้าที่ของ middleware ใน Express",
    opts: [
      "จัดการ request ก่อนถึง route handler และสามารถส่งต่อด้วย next()",
      "สร้างฐานข้อมูลอัตโนมัติ",
      "คอมไพล์ TypeScript",
      "แทนที่ router ทั้งหมด",
    ],
    answer: 0,
    why: "middleware ทำงานเป็นลำดับต่อจาก request เข้ามา ต้องเรียก next() เพื่อไปตัวถัดไป หรือตอบ response เอง",
  },
  {
    q: "ถ้า fetch แล้วได้ 404 จาก endpoint ที่มีอยู่จริง สาเหตุที่น่าจะเป็นคือ",
    opts: [
      "path ไม่ตรง (สะกด/ลำดับ route ผิด) หรือ static ถูกประกาศทับ",
      "ฐานข้อมูลเต็ม",
      "ลืม import express",
      "ไฟล์ CSS หาย",
    ],
    answer: 0,
    why: "404 หมายถึงไม่เจอ route — เช็ก path, method, และลำดับการประกาศ app.use/app.get",
  },
  {
    q: "การทำ pagination ควรส่งอะไรกลับไปให้ frontend รู้ว่ามีทั้งหมดกี่หน้า",
    opts: ["total กับ limit (คำนวณ totalPages)", "แค่ data", "แค่ status 200", "filename"],
    answer: 0,
    why: "ต้องรู้จำนวนทั้งหมด (total) และขนาดหน้า (limit) เพื่อคำนวณ totalPages = ceil(total/limit)",
  },
  {
    q: "ใน Next.js การ fetch ข้อมูลใน Server Component ทำได้อย่างไร",
    opts: [
      "ใช้ useEffect เท่านั้น",
      "ใช้ async function แล้ว await fetch ได้โดยตรง",
      "ต้องใช้ jQuery",
      "ต้องเขียน XMLHttpRequest",
    ],
    answer: 1,
    why: "Server Component เป็น async ได้ และ await fetch ได้ตรง ๆ — ไม่ต้องใช้ useEffect",
  },
  {
    q: "Client-Side Rendering (CSR) ต่างจาก SSR อย่างไร",
    opts: [
      "CSR ให้ browser โหลด JS แล้วค่อย render; SSR render HTML ที่ server ก่อนส่งมา",
      "CSR เร็วกว่าเสมอ",
      "SSR ใช้ได้แค่ PHP",
      "ทั้งสองเหมือนกัน",
    ],
    answer: 0,
    why: "CSR = HTML เปล่า + JS ไปดึงข้อมูลแล้ว render; SSR = server สร้าง HTML พร้อมข้อมูลส่งมาเลย",
  },
  {
    q: "GraphQL ต่างจาก REST จุดสำคัญคือ",
    opts: [
      "ขอเฉพาะ field ที่ต้องการได้ใน query เดียว",
      "ไม่ต้องใช้ HTTP",
      "ใช้ได้เฉพาะฐานข้อมูล SQL",
      "ไม่มี schema",
    ],
    answer: 0,
    why: "GraphQL ให้ client กำหนด shape ของข้อมูลที่ต้องการ ลด over-fetching/under-fetching",
  },
  {
    q: "Prisma ใช้ทำอะไรในโปรเจกต์ Express",
    opts: [
      "ORM จัดการ schema/migration และ query ฐานข้อมูลแบบ type-safe",
      "เป็น web server แทน Express",
      "เป็น CSS framework",
      "เป็นตัว minify JavaScript",
    ],
    answer: 0,
    why: "Prisma เป็น ORM: นิยาม schema.prisma → generate client → เรียก prisma.book.findMany() ฯลฯ",
  },
  {
    q: "ถ้า frontend อยู่คนละ port กับ backend แล้วเรียก API ไม่ได้ ควรเพิ่มอะไร",
    opts: ["CORS middleware ที่ฝั่ง backend", "multer", "dotenv", "nodemon"],
    answer: 0,
    why: "เบราว์เซอร์บล็อก cross-origin — ต้องให้ backend ส่ง header Access-Control-Allow-Origin (ใช้ cors())",
  },
  {
    q: "การเก็บความลับเช่นรหัสฐานข้อมูล ควรทำอย่างไร",
    opts: [
      "เขียนในไฟล์ .env แล้วไม่ commit ขึ้น git",
      "เขียนใน README",
      "ฝังในไฟล์ HTML",
      "ใส่ในชื่อ repo",
    ],
    answer: 0,
    why: "ใช้ .env + dotenv และเพิ่ม .env ใน .gitignore — ห้าม commit secret",
  },
  {
    q: "ข้อใดเรียงลำดับการทำงานของ request→response ได้ถูกต้อง",
    opts: [
      "client → route handler → middleware → response",
      "client → middleware → route handler → response",
      "middleware → client → response → route handler",
      "response → middleware → client",
    ],
    answer: 1,
    why: "request เข้ามาเข้า middleware ก่อน (ตามลำดับที่ประกาศ) แล้วจึงถึง route handler ที่ตอบ response",
  },
];

/* ===================== 2. True / False (10 ข้อ) ===================== */
const TF = [
  {
    q: "express.json() ต้องประกาศก่อน route ที่อ่าน req.body จึงจะทำงานได้ถูกต้อง",
    answer: true,
    why: "middleware ทำงานตามลำดับที่ประกาศ ถ้าอยู่หลัง route จะไม่ทันใช้",
  },
  {
    q: "สามารถส่ง FormData ด้วย fetch โดยไม่ต้องตั้ง Content-Type เองได้",
    answer: true,
    why: "browser จะใส่ Content-Type: multipart/form-data พร้อม boundary ให้เอง",
  },
  {
    q: "DELETE ที่สำเร็จควรตอบ 200 พร้อม body เสมอ",
    answer: false,
    why: "นิยมตอบ 204 No Content (ไม่ต้องมี body) — 200 ก็ใช้ได้แต่ไม่จำเป็นต้องมี body",
  },
  {
    q: "FK ช่วยรักษาความถูกต้องของข้อมูลระหว่างตารางได้",
    answer: true,
    why: "Foreign key บังคับว่าค่าที่อ้างอิงต้องมีอยู่จริงในตารางแม่",
  },
  {
    q: "การลบ parent ที่มี child อยู่จะลบ child ให้อัตโนมัติเสมอ",
    answer: false,
    why: "ขึ้นกับ ON DELETE — ค่าเริ่มต้นมักเป็น NO ACTION/RESTRICT ซึ่งจะบล็อก",
  },
  {
    q: "multer เก็บไฟล์ลงดิสก์ได้ด้วย diskStorage และตั้งชื่อไฟล์เองได้",
    answer: true,
    why: "diskStorage กำหนด destination + filename ผ่าน callback ได้",
  },
  {
    q: "ถ้าไม่เพิ่ม uploads/ ใน .gitignore ไฟล์ที่ผู้ใช้อัปโหลดจะถูก commit ขึ้น git ด้วย",
    answer: true,
    why: "ไฟล์จริงใน uploads/ จะถูก track ถ้าไม่ ignore — ควรเก็บแค่ .gitkeep",
  },
  {
    q: "REST บังคับว่าต้องใช้ JSON เท่านั้น",
    answer: false,
    why: "REST เป็นแนวคิดด้านสถาปัตยกรรม ไม่ได้บังคับ format — ใช้ XML, HTML, JSON ได้",
  },
  {
    q: "การ query ด้วยการต่อ string จาก input ผู้ใช้ปลอดภัยจาก SQL injection",
    answer: false,
    why: "ต้องใช้ prepared statement / parameter binding (?) เท่านั้น การต่อ string เสี่ยง SQL injection",
  },
  {
    q: "ใน GraphQL query เดียวสามารถขอข้อมูลหลาย resource ได้",
    answer: true,
    why: "ข้อดีหลักของ GraphQL คือขอหลาย field/resource ใน request เดียว",
  },
];

/* ===================== 3. Practical (5 ข้อ) ===================== */
const PRACTICAL = [
  {
    q: "ข้อ 1 — ออกแบบฐานข้อมูล 2 ตารางที่มีความสัมพันธ์ 1:N พร้อมไฟล์อัปโหลด",
    points: [
      "ระบุตารางแม่ (เช่น categories) และตารางลูก (เช่น books) ให้ชัด",
      "ตารางลูกมี FK <code>category_id INTEGER NOT NULL REFERENCES categories(id)</code>",
      "มีคอลัมน์เก็บ path ไฟล์ เช่น <code>cover_url TEXT</code>",
      "เปิด <code>PRAGMA foreign_keys = ON;</code> (SQLite ปิดเป็นค่าเริ่มต้น)",
      "มี created_at DEFAULT (datetime('now')) และ seed ข้อมูล 3–5 แถว",
      "เขียน CREATE TABLE ทั้งสองตารางได้โดยไม่ต้องเปิดเอกสาร",
    ],
  },
  {
    q: "ข้อ 2 — เขียน CRUD API ครบ 5 endpoint สำหรับตารางลูก",
    points: [
      "<code>GET /api/books</code> — list + search + filter + pagination",
      "<code>GET /api/books/:id</code> — คืน 404 ถ้าไม่พบ",
      "<code>POST /api/books</code> — validate แล้วตอบ 201 + ข้อมูลที่สร้าง",
      "<code>PUT /api/books/:id</code> — อัปเดตแล้วตอบ 200 (หรือ 404)",
      "<code>DELETE /api/books/:id</code> — ตอบ 204 (หรือ 404)",
      "แปลง id จาก path เป็น Number ทุกครั้ง",
      "ใช้ prepared statement (?) ทุก query",
    ],
  },
  {
    q: "ข้อ 3 — ทำระบบอัปโหลดรูปภาพให้ครบวงจร",
    points: [
      "ฝั่ง server: multer diskStorage + limits.fileSize + fileFilter ชนิดไฟล์",
      "เสิร์ฟไฟล์ด้วย <code>app.use('/uploads', express.static(UPLOAD_DIR))</code>",
      "route รับไฟล์ด้วย <code>upload.single('cover')</code>",
      "เก็บ path ลง DB แล้วส่งกลับ frontend",
      "ฝั่ง client: สร้าง FormData, append ไฟล์, fetch โดยไม่ตั้ง Content-Type",
      "แสดง preview ด้วย URL.createObjectURL(file)",
      "ลบไฟล์จริงเมื่อลบ record (ถ้ามีเวลา)",
    ],
  },
  {
    q: "ข้อ 4 — เขียน frontend JS ให้เรียก API และแสดงผล",
    points: [
      "โหลดข้อมูลด้วย fetch แล้ว render ตารางผ่าน innerHTML",
      "escape HTML ก่อนแทรกค่าจาก DB (กัน XSS)",
      "ฟอร์มเพิ่ม/แก้ไขใช้ event listener แบบ submit + preventDefault",
      "ปุ่มแก้ไข/ลบ ใช้ event delegation (data-id + closest)",
      "จัดการ error: ถ้า !res.ok ให้อ่าน message แล้วแจ้งผู้ใช้",
      "อัปเดตตารางใหม่หลังบันทึก/ลบ โดยไม่ต้อง reload หน้า",
    ],
  },
  {
    q: "ข้อ 5 — ใช้ OpenAPI/Swagger ให้เป็นประโยชน์ตอนสอบ",
    points: [
      "อ่าน <code>paths</code> เพื่อรู้ endpoint + method ทั้งหมด",
      "อ่าน <code>components.schemas</code> เพื่อรู้ชื่อ field + type → เอาไปสร้างตาราง",
      "ดู <code>requestBody</code> ว่าเป็น multipart/form-data → รู้ว่าต้องใช้ multer",
      "gen โค้ด: <code>npx @openapitools/openapi-generator-cli generate -i openapi.yaml -g nodejs-express-server -o generated</code>",
      "หรือ import เข้า Postman เพื่อยิงทดสอบและดู code snippet",
      "ตรวจ spec ด้วย <code>npx @redocly/cli lint openapi.yaml</code>",
    ],
  },
];

/* =========================================================
   Render
   ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const escapeHtml = (str) =>
  String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const LETTERS = ["ก", "ข", "ค", "ง"];

function renderMCQ() {
  const box = $("#mcq");
  box.innerHTML = MCQ.map(
    (item, i) => `
    <div class="q" data-q="${i}" data-type="mcq">
      <div class="q-head">
        <span class="q-num">${i + 1}</span>
        <span>${item.q}</span>
      </div>
      <div class="opts">
        ${item.opts
          .map(
            (opt, j) => `
          <label class="opt" data-opt="${j}">
            <input type="radio" name="mcq-${i}" value="${j}" />
            <span><b>${LETTERS[j]}.</b> ${opt}</span>
          </label>`
          )
          .join("")}
      </div>
      <p class="q-explain" hidden></p>
    </div>`
  ).join("");
}

function renderTF() {
  const box = $("#tf");
  box.innerHTML = TF.map(
    (item, i) => `
    <div class="q" data-q="${i}" data-type="tf">
      <div class="q-head">
        <span class="q-num">${i + 1}</span>
        <span>${item.q}</span>
      </div>
      <div class="opts tf-row">
        <label class="opt" data-opt="true">
          <input type="radio" name="tf-${i}" value="true" />
          <span>ถูก</span>
        </label>
        <label class="opt" data-opt="false">
          <input type="radio" name="tf-${i}" value="false" />
          <span>ผิด</span>
        </label>
      </div>
      <p class="q-explain" hidden></p>
    </div>`
  ).join("");
}

function renderPractical() {
  const box = $("#practical");
  box.innerHTML = PRACTICAL.map(
    (item) => `
    <div class="practical-q">
      <div class="q-head">
        <span>${escapeHtml(item.q)}</span>
      </div>
      <details>
        <summary>ดูแนวคำตอบ / สิ่งที่ต้องมี</summary>
        <ol>
          ${item.points.map((p) => `<li>${p}</li>`).join("")}
        </ol>
      </details>
    </div>`
  ).join("");
}

/* =========================================================
   Grading
   ========================================================= */
function grade() {
  let correct = 0;
  const total = MCQ.length + TF.length;

  // ---- MCQ ----
  MCQ.forEach((item, i) => {
    const q = $(`.q[data-type="mcq"][data-q="${i}"]`);
    const picked = $("input:checked", q);
    const explain = $(".q-explain", q);

    $$(".opt", q).forEach((label, j) => {
      label.classList.remove("is-correct", "is-wrong", "is-chosen");
      if (j === item.answer) label.classList.add("is-correct");
      if (picked && Number(picked.value) === j && j !== item.answer) label.classList.add("is-wrong");
      if (picked && Number(picked.value) === j) label.classList.add("is-chosen");
    });

    const ok = picked && Number(picked.value) === item.answer;
    if (ok) correct++;

    explain.hidden = false;
    explain.classList.toggle("bad", !ok);
    explain.textContent = (ok ? "✓ ถูกต้อง — " : "✗ ยังไม่ถูก — ") + item.why;
  });

  // ---- TF ----
  TF.forEach((item, i) => {
    const q = $(`.q[data-type="tf"][data-q="${i}"]`);
    const picked = $("input:checked", q);
    const explain = $(".q-explain", q);

    $$(".opt", q).forEach((label) => {
      label.classList.remove("is-correct", "is-wrong", "is-chosen");
      const isAnswer = label.dataset.opt === String(item.answer);
      if (isAnswer) label.classList.add("is-correct");
      if (picked && picked.value === label.dataset.opt) {
        label.classList.add("is-chosen");
        if (!isAnswer) label.classList.add("is-wrong");
      }
    });

    const ok = picked && picked.value === String(item.answer);
    if (ok) correct++;

    explain.hidden = false;
    explain.classList.toggle("bad", !ok);
    explain.textContent = (ok ? "✓ ถูกต้อง — " : "✗ ยังไม่ถูก — ") + item.why;
  });

  const scoreEl = $("#score");
  const pct = Math.round((correct / total) * 100);
  scoreEl.textContent = `ได้ ${correct}/${total} คะแนน (${pct}%)`;
  scoreEl.classList.toggle("good", pct >= 80);
  scoreEl.classList.toggle("bad", pct < 60);

  // เลื่อนไปดูคะแนน
  scoreEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function reset() {
  $$('#quiz input[type="radio"]').forEach((input) => (input.checked = false));
  $$("#quiz .q-explain").forEach((p) => {
    p.hidden = true;
    p.textContent = "";
    p.classList.remove("bad");
  });
  $$("#quiz .opt").forEach((l) => l.classList.remove("is-correct", "is-wrong", "is-chosen"));

  const scoreEl = $("#score");
  scoreEl.textContent = "";
  scoreEl.classList.remove("good", "bad");
}

/* =========================================================
   Sidebar scroll spy
   ========================================================= */
function initScrollSpy() {
  const links = $$(".side-nav a");
  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) map.set(el, a);
  });

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove("is-active"));
        map.get(entry.target)?.classList.add("is-active");
      });
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
  );

  map.forEach((_, el) => obs.observe(el));
}

/* =========================================================
   Init
   ========================================================= */
renderMCQ();
renderTF();
renderPractical();
initScrollSpy();

$("#grade-btn").addEventListener("click", grade);
$("#reset-btn").addEventListener("click", reset);

// เลือกแล้วให้ไฮไลต์เบา ๆ
document.addEventListener("change", (e) => {
  if (!e.target.matches('#quiz input[type="radio"]')) return;
  const q = e.target.closest(".q");
  $$(".opt", q).forEach((l) => l.classList.remove("is-chosen"));
  e.target.closest(".opt")?.classList.add("is-chosen");
});
