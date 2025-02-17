const API_URL = "https://todo-production-7421.up.railway.app/todos";

async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Gagal mengambil data");
    const todos = await res.json();

    const sortedTodos = todos.sort((a, b) => {
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    renderTodos(sortedTodos);
  } catch (error) {
    console.error(error);
  }
}

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
    li.innerHTML = `
            <div class="todo-info">
                <span>
                    ${todo.title}
                    <span class="priority-badge priority-${todo.priority}">${
      todo.priority
    }</span>
                    <div class="timestamp">Dibuat: ${new Date(
                      todo.created_at
                    ).toLocaleString("id-ID")}</div>
                </span>
            </div>
            <div class="button-group">
                ${
                  !todo.is_completed
                    ? `<button class="button-complete" onclick="toggleComplete(${todo.id})">Complete</button>`
                    : `<button class="button-complete" onclick="restoreTodo(${todo.id})">Tambah Kembali</button>`
                }
                <button class="button-edit" onclick="editTodo(${todo.id}, '${
      todo.title
    }', '${todo.priority}')">Edit</button>
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

async function addTodo() {
  const input = document.getElementById("todoInput");
  const priority = document.getElementById("priorityInput").value;

  if (!input.value.trim()) {
    alert("Judul tidak boleh kosong!");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: input.value, priority }),
    });

    if (!res.ok) throw new Error("Gagal menambahkan todo");

    input.value = "";
    setTimeout(fetchTodos, 500);
  } catch (error) {
    console.error(error);
  }
}

async function editTodo(id, currentTitle, currentPriority) {
  const newTitle = prompt("Edit Judul Todo:", currentTitle);
  if (newTitle === null || newTitle.trim() === "") return;

  const newPriority = prompt(
    "Edit Prioritas (High/Medium/Low):",
    currentPriority
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
        priority: newPriority,
      }),
    });

    if (!res.ok) throw new Error("Gagal mengedit todo");
    setTimeout(fetchTodos, 500);
  } catch (error) {
    console.error(error);
  }
}

async function toggleComplete(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
    if (!res.ok) throw new Error("Gagal mengubah status todo");
    setTimeout(fetchTodos, 500);
  } catch (error) {
    console.error(error);
  }
}

async function restoreTodo(id) {
  try {
    const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PATCH" });
    if (!res.ok) throw new Error("Gagal mengembalikan todo");
    setTimeout(fetchTodos, 500);
  } catch (error) {
    console.error(error);
  }
}

async function deleteTodo(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal menghapus todo");
    setTimeout(fetchTodos, 500);
  } catch (error) {
    console.error(error);
  }
}

function showSection(section) {
  document.getElementById("todoList").style.display =
    section === "todoList" ? "block" : "none";
  document.getElementById("historyList").style.display =
    section === "historyList" ? "block" : "none";
  document.getElementById("historyTitle").style.display =
    section === "historyList" ? "block" : "none";
}

fetchTodos();
