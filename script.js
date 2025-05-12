const taskInput = document.getElementById("task-input");
const taskAddButton = document.getElementById("task-add-button");
const taskListEl = document.getElementById("task-list");

let tasks = [];

const Storage = {
    key: "tasks",

    save(tasks) {
        localStorage.setItem(Storage.key, JSON.stringify(tasks));
    },

    load() {
        const saved = localStorage.getItem(Storage.key);
        return saved ? JSON.parse(saved) : [];
    }
};

function init() {
    tasks = Storage.load();
    render();
}

function render() {
    taskListEl.innerHTML = tasks.map(task => createTaskItemHTML(task)).join("");
}

function createTaskItemHTML(task) {
    const { id, text, isChecked, isEditing } = task;

    if (isEditing) {
        return `
            <li data-id="${id}">
                <input type="text" class="task-edit-input" value="${escapeHtml(text)}">
                <button class="task-edit-button"><i class="fas fa-check"></i></button>
                <button class="task-delete-button"><i class="fas fa-trash"></i></button>
            </li>
        `;
    } else {
        return `
            <li data-id="${id}">
                <input type="checkbox" class="task-check" ${isChecked ? "checked" : ""}>
                <span class="task-text">${escapeHtml(text)}</span>
                <button class="task-edit-mode-button"><i class="fas fa-pen"></i></button>
                <button class="task-delete-button"><i class="fas fa-trash"></i></button>
            </li>
        `;
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toggleTaskCheck(id) {
    const task = tasks.find(task => task.id === id);
    
    if (task) {
        task.isChecked = !task.isChecked;
    }

    Storage.save(tasks);

    render();
}

function addTask() {
    const text = getTrimmedTaskInput();
    
    if (validateText(text)) {
        return;
    }
        
    const task = createTask(text);
    tasks.push(task);

    clearTaskInput();

    Storage.save(tasks);

    render();
}

function getTrimmedTaskInput() {
    return taskInput.value.trim();
}

function validateText(text) {
    const message = getValidationMessage(text);

    if (message) {
        alert(message);
        return true;
    }
    
    return false;
}

function getValidationMessage(text) {
    if (isEmpty(text)) {
        return "할 일을 입력하세요!";
    }

    if (isTooLong(text)) {
        return "할 일은 20자 이내로 입력하세요!";
    }

    return null;
}

function isEmpty(text) {
    return text === "";
}

function isTooLong(text) {
    return text.length > 20;
}

function createTask(text) {
    return {
        id: generateRandomId(),
        text,
        isChecked: false,
        isEditing: false
    };
}

function generateRandomId() {
    return '_' + Math.random().toString(36).slice(2, 11);
}

function clearTaskInput() {
    taskInput.value = "";
}

function enableEditMode(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.isEditing = true;
    }

    render();

    focusEditInput(id);
}

function focusEditInput(id) {
    const inputEl = document.querySelector(`li[data-id="${id}"] .task-edit-input`);

    if (inputEl) {
        inputEl.focus();
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    }
}

function editTask(id) {
    const newText = getTrimmedTaskEditedInput(id);
    const errorMessage = validateText(newText);

    if (errorMessage) {
        alert(errorMessage);
        return;
    }

    updateTaskText(id, newText);

    Storage.save(tasks);

    render();
}

function getTrimmedTaskEditedInput(id) {
    const inputEl = document.querySelector(`li[data-id="${id}"] .task-edit-input`);
    return inputEl?.value.trim() ?? "";
}

function updateTaskText(id, newText) {
    const task = tasks.find(t => t.id === id);

    if (task) {
        task.text = newText;
        task.isEditing = false;
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    Storage.save(tasks);

    render();
}

taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        taskAddButton.click();
    }
});

taskAddButton.addEventListener("click", addTask);

taskListEl.addEventListener("click", event => {
    const id = getTaskIdFromEvent(event);

    if (!id)
        return;

    if (event.target.closest(".task-edit-mode-button")) {
        enableEditMode(id);
    } else if (event.target.closest(".task-edit-button")) {
        editTask(id);
    } else if (event.target.closest(".task-delete-button")) {
        deleteTask(id);
    }
});

taskListEl.addEventListener("change", event => {
    const id = getTaskIdFromEvent(event);

    if (!id)
        return;

    if (event.target.matches(".task-check")) {
        toggleTaskCheck(id);
    }
});

taskListEl.addEventListener("keydown", event => {
    const id = getTaskIdFromEvent(event);

    if (!id)
        return;
        
    if (event.target.matches(".task-edit-input") && event.key === "Enter") {
        editTask(id);
    }
});

function getTaskIdFromEvent(event) {
    const li = event.target.closest("li");
    return li ? li.dataset.id : null;
}


init();
