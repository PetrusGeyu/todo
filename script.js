// Tetap menggunakan API URL yang sama
const API_URL = "https://todo-production-7421.up.railway.app/todos";

//  Fungsi untuk mengambil data dari array di backend
async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Gagal mengambil data");
    const todos = await res.json();

    //  Sort berdasarkan prioritas (data dari array)
    const sortedTodos = todos.sort((a, b) => {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    renderTodos(sortedTodos);
  } catch (error) {
    console.error("Error:", error.message);
    alert("Gagal mengambil data todo");
  }
}

// Render todos dari array ke UI
function renderTodos(todos) {
  const todoList = document.getElementById("todoList");
  const historyList = document.getElementById("historyList");
  const historyTitle = document.getElementById("historyTitle");

  todoList.innerHTML = "";
  historyList.innerHTML = "";

  let hasHistory = false;

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.is_completed ? "completed" : "";

    //  Tambahkan handling untuk description jika ada
    const description = todo.description
      ? `<p class="todo-description">${todo.description}</p>`
      : "";

    li.innerHTML = `
      <div class="todo-info">
        <span>
          ${todo.title}
          <span class="priority-badge priority-${todo.priority.toLowerCase()}">${
      todo.priority
    }</span>
          ${description}
          <div class="timestamp">
            Dibuat: ${new Date(todo.created_at).toLocaleString("id-ID")}
            ${
              todo.updated_at !== todo.created_at
                ? `<br>Diupdate: ${new Date(todo.updated_at).toLocaleString(
                    "id-ID"
                  )}`
                : ""
            }
          </div>
        </span>
      </div>
      <div class="button-group">
        ${
          !todo.is_completed
            ? `<button class="button-complete" onclick="toggleComplete(${todo.id})">Complete</button>`
            : `<button class="button-complete" onclick="restoreTodo(${todo.id})">Tambah Kembali</button>`
        }
        <button class="button-edit" onclick="editTodo(${todo.id})">Edit</button>
        <button class="button-delete" onclick="deleteTodo(${
          todo.id
        })">Hapus</button>
      </div>
    `;

    if (todo.is_completed) {
      historyList.appendChild(li);
      hasHistory = true;
    } else {
      todoList.appendChild(li);
    }
  });

  historyTitle.classList.toggle("hidden", !hasHistory);
  historyList.classList.toggle("hidden", !hasHistory);
}

//  Fungsi add yang mempertimbangkan description
async function addTodo() {
  const titleInput = document.getElementById("todoInput");
  const descInput = document.getElementById("descriptionInput");
  const priority = document.getElementById("priorityInput").value;

  const title = titleInput.value.trim();
  const description = descInput?.value.trim() || "";

  if (!title) {
    alert("Judul tidak boleh kosong!");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        priority,
      }),
    });

    if (!res.ok) throw new Error("Gagal menambahkan todo");

    titleInput.value = "";
    if (descInput) descInput.value = "";

    await fetchTodos();
  } catch (error) {
    console.error("Error:", error.message);
    alert("Gagal menambahkan todo");
  }
}

//  Fungsi edit yang lebih komprehensif
async function editTodo(id) {
  // Ambil data todo yang akan diedit
  const res = await fetch(`${API_URL}/${id}`);
  const todo = await res.json();

  const newTitle = prompt("Edit Judul Todo:", todo.title);
  if (newTitle === null) return;
  if (newTitle.trim() === "") {
    alert("Judul tidak boleh kosong!");
    return;
  }

  const newDescription = prompt(
    "Edit Deskripsi (optional):",
    todo.description || ""
  );
  const newPriority = prompt(
    "Edit Prioritas (High/Medium/Low):",
    todo.priority
  );

  if (!["High", "Medium", "Low"].includes(newPriority)) {
    alert("Prioritas harus High, Medium, atau Low!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        is_completed: todo.is_completed,
      }),
    });

    if (!res.ok) throw new Error("Gagal mengedit todo");
    await fetchTodos();
  } catch (error) {
    console.error("Error:", error.message);
    alert("Gagal mengedit todo");
  }
}

//  Fungsi toggle dengan error handling yang lebih baik
async function toggleComplete(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/toggle`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Gagal mengubah status todo");
    await fetchTodos();
  } catch (error) {
    console.error("Error:", error.message);
    alert("Gagal mengubah status todo");
  }
}

// Fungsi restore menggunakan toggle yang sama
const restoreTodo = toggleComplete;

//  Fungsi delete dengan konfirmasi dan error handling
async function deleteTodo(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus todo ini?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Gagal menghapus todo");
    await fetchTodos();
  } catch (error) {
    console.error("Error:", error.message);
    alert("Gagal menghapus todo");
  }
}

// Fungsi untuk menampilkan section yang dipilih
function showSection(section) {
  document.getElementById("todoList").style.display =
    section === "todoList" ? "block" : "none";
  document.getElementById("historyList").style.display =
    section === "historyList" ? "block" : "none";
  document.getElementById("historyTitle").style.display =
    section === "historyList" ? "block" : "none";
}

// Inisialisasi dengan mengambil data
fetchTodos();
