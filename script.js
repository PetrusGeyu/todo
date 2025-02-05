const API_URL = "http://localhost:8080/todos";

// ✅ Fetch Todo dari Server
async function fetchTodos() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const todos = await res.json();
        renderTodos(todos);
    } catch (error) {
        console.error(error);
    }
}

// ✅ Format Tanggal ke Format yang Mudah Dibaca
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

// ✅ Render Todo List ke HTML
function renderTodos(todos) {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    todos.forEach((todo) => {
        const li = document.createElement("li");
        li.className = todo.isComplete ? "completed" : "";
        li.innerHTML = `
            <span onclick="toggleComplete(${todo.id}, ${todo.isComplete})">
                ${todo.title} - <strong>${todo.priority}</strong> 
                <br><small>Dibuat: ${formatDate(todo.created_at)}</small>
            </span>
            <button onclick="editTodo(${todo.id}, '${todo.title}', '${todo.priority}')">Edit</button>
            <button onclick="deleteTodo(${todo.id})">Hapus</button>
        `;
        todoList.appendChild(li);
    });
}

// ✅ Tambah Todo
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
        fetchTodos();
    } catch (error) {
        console.error(error);
    }
}

// ✅ Edit Todo
async function editTodo(id, currentTitle, currentPriority) {
    const newTitle = prompt("Edit Judul Todo:", currentTitle);
    if (newTitle === null || newTitle.trim() === "") return; // Jika user cancel
    
    const newPriority = prompt("Edit Prioritas (High/Medium/Low):", currentPriority);
    if (!["High", "Medium", "Low"].includes(newPriority)) {
        alert("Prioritas harus High, Medium, atau Low!");
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT", // Pastikan menggunakan PUT untuk update keseluruhan 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newTitle,     // Pastikan title dikirim dengan benar
                priority: newPriority
            }),
        });
        
        if (!res.ok) throw new Error("Gagal mengedit todo");
        fetchTodos(); // Refresh daftar todo
    } catch (error) {
        console.error(error);
    }
}

// ✅ Toggle Selesai / Belum
async function toggleComplete(id, isComplete) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isComplete: !isComplete }),
        });
        fetchTodos();
    } catch (error) {
        console.error(error);
    }
}

// ✅ Hapus Todo
async function deleteTodo(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus todo");

        fetchTodos();
    } catch (error) {
        console.error(error);
    }
}

// Muat Todo saat halaman dimuat
fetchTodos();

