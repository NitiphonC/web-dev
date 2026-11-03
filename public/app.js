/* =========================================================
   Library Admin — frontend (vanilla JS)
   หลักที่ใช้สอบ: fetch + FormData + render ตาราง + event delegation
   ========================================================= */

const API = "/api";

const state = {
  page: 1,
  limit: 10,
  search: "",
  categoryId: "",
  categories: [],
  editingBook: null,
};

/* ---------------- helpers ---------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const money = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n || 0);

function toast(message, isError = false) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.toggle("is-error", isError);
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.hidden = true), 2600);
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 204) return null;

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
  return body;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/* ---------------- navigation ---------------- */
function showView(name) {
  $$(".view").forEach((v) => v.classList.add("is-hidden"));
  $(`#view-${name}`).classList.remove("is-hidden");
  $$(".nav-link").forEach((a) => a.classList.toggle("is-active", a.dataset.view === name));
}

$$(".nav-link").forEach((link) =>
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showView(link.dataset.view);
    if (link.dataset.view === "categories") loadCategories();
    else loadBooks();
  })
);

/* ---------------- categories ---------------- */
async function loadCategories() {
  try {
    const categories = await request(`${API}/categories`);
    state.categories = categories;

    // ตารางหมวดหมู่
    const tbody = $("#categories-body");
    tbody.innerHTML = categories.length
      ? categories
          .map(
            (c) => `
        <tr>
          <td>${c.id}</td>
          <td><strong>${escapeHtml(c.name)}</strong></td>
          <td class="muted">${escapeHtml(c.description || "-")}</td>
          <td class="num"><span class="badge">${c.book_count}</span></td>
          <td class="actions">
            <button class="btn btn-sm" data-edit-category="${c.id}">แก้ไข</button>
            <button class="btn btn-sm btn-danger" data-delete-category="${c.id}">ลบ</button>
          </td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="5" class="empty">ยังไม่มีหมวดหมู่</td></tr>`;

    // dropdown ในฟอร์มหนังสือ + ตัวกรอง
    const options = categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
    $("#book-category").innerHTML = `<option value="">-- เลือกหมวดหมู่ --</option>${options}`;

    const filter = $("#filter-category");
    const current = filter.value;
    filter.innerHTML = `<option value="">ทุกหมวดหมู่</option>${options}`;
    filter.value = current;
  } catch (e) {
    toast(e.message, true);
  }
}

$("#btn-new-category").addEventListener("click", () => openCategoryDialog());

function openCategoryDialog(category = null) {
  $("#category-dialog-title").textContent = category ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่";
  $("#category-id").value = category?.id ?? "";
  $("#category-name").value = category?.name ?? "";
  $("#category-description").value = category?.description ?? "";
  $("#category-error").hidden = true;
  $("#category-dialog").showModal();
}

$("#category-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("#category-id").value;
  const payload = {
    name: $("#category-name").value.trim(),
    description: $("#category-description").value.trim(),
  };

  try {
    if (id) await request(`${API}/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    else await request(`${API}/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    $("#category-dialog").close();
    toast(id ? "แก้ไขหมวดหมู่แล้ว" : "เพิ่มหมวดหมู่แล้ว");
    await loadCategories();
  } catch (err) {
    const box = $("#category-error");
    box.textContent = err.message;
    box.hidden = false;
  }
});

/* ---------------- books ---------------- */
async function loadBooks() {
  const params = new URLSearchParams({
    page: state.page,
    limit: state.limit,
    search: state.search,
  });
  if (state.categoryId) params.set("category_id", state.categoryId);

  try {
    const { data, total, totalPages } = await request(`${API}/books?${params}`);
    const tbody = $("#books-body");

    tbody.innerHTML = data.length
      ? data
          .map(
            (b) => `
        <tr>
          <td>
            ${
              b.coverUrl
                ? `<img class="thumb" src="${escapeHtml(b.coverUrl)}" alt="${escapeHtml(b.title)}" loading="lazy" />`
                : `<div class="thumb-fallback">📕</div>`
            }
          </td>
          <td><strong>${escapeHtml(b.title)}</strong></td>
          <td class="muted">${escapeHtml(b.author)}</td>
          <td><span class="badge">${escapeHtml(b.categoryName || "-")}</span></td>
          <td class="num">${money(b.price)}</td>
          <td class="num">
            <span class="${b.stock === 0 ? "badge badge-low" : ""}">${b.stock}</span>
          </td>
          <td class="actions">
            <button class="btn btn-sm" data-edit-book="${b.id}">แก้ไข</button>
            <button class="btn btn-sm btn-danger" data-delete-book="${b.id}">ลบ</button>
          </td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="7" class="empty">ไม่พบหนังสือ</td></tr>`;

    // pager
    const pager = $("#books-pager");
    pager.innerHTML = "";
    if (totalPages > 1) {
      pager.innerHTML = `
        <button class="btn btn-sm" ${state.page <= 1 ? "disabled" : ""} data-page="${state.page - 1}">← ก่อนหน้า</button>
        <span class="muted">หน้า ${state.page} / ${totalPages} (ทั้งหมด ${total} รายการ)</span>
        <button class="btn btn-sm" ${state.page >= totalPages ? "disabled" : ""} data-page="${state.page + 1}">ถัดไป →</button>
      `;
    } else {
      pager.innerHTML = `<span class="muted">ทั้งหมด ${total} รายการ</span>`;
    }
  } catch (e) {
    toast(e.message, true);
  }
}

$("#books-pager").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-page]");
  if (!btn) return;
  state.page = Number(btn.dataset.page);
  loadBooks();
});

let searchTimer;
$("#search-books").addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = e.target.value;
    state.page = 1;
    loadBooks();
  }, 250);
});

$("#filter-category").addEventListener("change", (e) => {
  state.categoryId = e.target.value;
  state.page = 1;
  loadBooks();
});

$("#btn-new-book").addEventListener("click", () => openBookDialog());

function openBookDialog(book = null) {
  state.editingBook = book;
  $("#book-dialog-title").textContent = book ? "แก้ไขหนังสือ" : "เพิ่มหนังสือ";
  $("#book-id").value = book?.id ?? "";
  $("#book-title").value = book?.title ?? "";
  $("#book-author").value = book?.author ?? "";
  $("#book-price").value = book?.price ?? 0;
  $("#book-stock").value = book?.stock ?? 0;
  $("#book-category").value = book?.categoryId ?? "";
  $("#book-cover").value = "";
  $("#book-error").hidden = true;

  const preview = $("#cover-preview");
  if (book?.coverUrl) {
    $("#cover-preview-img").src = book.coverUrl;
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }

  $("#book-dialog").showModal();
}

// preview รูปก่อนอัปโหลด
$("#book-cover").addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  $("#cover-preview-img").src = URL.createObjectURL(file);
  $("#cover-preview").hidden = false;
});

$("#book-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = $("#book-id").value;
  const formData = new FormData();
  formData.append("title", $("#book-title").value.trim());
  formData.append("author", $("#book-author").value.trim());
  formData.append("price", $("#book-price").value);
  formData.append("stock", $("#book-stock").value);
  formData.append("category_id", $("#book-category").value);

  const file = $("#book-cover").files?.[0];
  if (file) formData.append("cover", file); // ชื่อ field ต้องตรงกับ upload.single("cover")

  const submit = $("#book-submit");
  submit.disabled = true;

  try {
    if (id) await request(`${API}/books/${id}`, { method: "PUT", body: formData });
    else await request(`${API}/books`, { method: "POST", body: formData });

    $("#book-dialog").close();
    toast(id ? "แก้ไขหนังสือแล้ว" : "เพิ่มหนังสือแล้ว");
    await loadBooks();
    await loadCategories();
  } catch (err) {
    const box = $("#book-error");
    box.textContent = err.message;
    box.hidden = false;
  } finally {
    submit.disabled = false;
  }
});

/* ---------------- event delegation (ปุ่มในตาราง) ---------------- */
document.addEventListener("click", async (e) => {
  const editBookId = e.target.closest("[data-edit-book]")?.dataset.editBook;
  const deleteBookId = e.target.closest("[data-delete-book]")?.dataset.deleteBook;
  const editCategoryId = e.target.closest("[data-edit-category]")?.dataset.editCategory;
  const deleteCategoryId = e.target.closest("[data-delete-category]")?.dataset.deleteCategory;

  try {
    if (editBookId) {
      const book = await request(`${API}/books/${editBookId}`);
      openBookDialog(book);
    } else if (deleteBookId) {
      if (!confirm("ต้องการลบหนังสือเล่มนี้หรือไม่?")) return;
      await request(`${API}/books/${deleteBookId}`, { method: "DELETE" });
      toast("ลบหนังสือแล้ว");
      await loadBooks();
    } else if (editCategoryId) {
      const category = state.categories.find((c) => String(c.id) === String(editCategoryId));
      openCategoryDialog(category);
    } else if (deleteCategoryId) {
      if (!confirm("ต้องการลบหมวดหมู่นี้หรือไม่?")) return;
      await request(`${API}/categories/${deleteCategoryId}`, { method: "DELETE" });
      toast("ลบหมวดหมู่แล้ว");
      await loadCategories();
    }
  } catch (err) {
    toast(err.message, true);
  }
});

/* ---------------- ปิด dialog ---------------- */
$$("[data-close-dialog]").forEach((btn) =>
  btn.addEventListener("click", () => btn.closest("dialog").close())
);

/* ---------------- init ---------------- */
(async function init() {
  showView("books");
  await loadCategories();
  await loadBooks();
})();
