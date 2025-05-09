const taskText = document.getElementById("task-text");
const taskAddButton = document.getElementById("task-add-button");
const taskList = document.getElementById("task-list");

let tasks = [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem("tasks");

    if (saved) {
        tasks = JSON.parse(saved);
    }
}

function generateRandomId() {
    return '_' + Math.random().toString(36).slice(2, 11);
}

function addTask() {
    const textValue = taskText.value.trim();

    if (textValue === "") {
        alert("할 일을 입력하세요!");
        return;
    }

    tasks.push({
        id: generateRandomId(),
        text: textValue,
        isChecked: false,
        isEditing: false
    });

    taskText.value = "";
    
    render();
    saveTasks();
}

function editTask(id) {
    const taskEditText = document.querySelector(`li[data-id="${id}"] .task-edit-text`);
    const editTextValue = taskEditText.value.trim();

    if (editTextValue === "") {
        alert("할 일을 입력하세요!");
        return;
    }

    for (let task of tasks) {
        if (task.id === id) {
            task.text = editTextValue;
            task.isEditing = false;
            break;
        }
    }

    render();
    saveTasks();
}

function deleteTask(id) {
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            tasks.splice(i, 1);
            break;
        }
    }

    render();
    saveTasks();
}

function toggleTaskCheck(id) {
    for (let task of tasks) {
        if (task.id === id) {
            task.isChecked = !task.isChecked;
            break;
        }
    }

    render();
    saveTasks();
}

function editModeOn(id) {
    for (let task of tasks) {
        if (task.id === id) {
            task.isEditing = true;
            break;
        }
    }

    render();

    const editText = document.querySelector(`li[data-id="${id}"] .task-edit-text`);

    if (editText) {
        editText.focus();
        editText.setSelectionRange(editText.value.length, editText.value.length);
    }
}

function render() {
    taskList.innerHTML = createTaskHTML();
}

function createTaskHTML() {
    let resultHTML = "";

    tasks.forEach(task => {
        let checkboxHTML = "";
        let contentHTML = "";
        let buttonHTML = "";

        if (task.isEditing) {
            contentHTML = `<input type="text" class="task-edit-text" value="${task.text}">`;
            buttonHTML = `<button class="task-edit-done-button"><i class="fas fa-check"></i></button>`;
        } else {
            checkboxHTML = `<input type="checkbox" class="task-check" ${task.isChecked ? "checked" : ""}>`;
            contentHTML = `<span class="task-text">${task.text}</span>`;
            buttonHTML = `<button class="task-edit-button"><i class="fas fa-pen"></i></button>`;
        }

        resultHTML += `
            <li data-id="${task.id}">
                ${checkboxHTML}
                ${contentHTML}
                ${buttonHTML}
                <button class="task-delete-button"><i class="fas fa-trash"></i></button>
            </li>`;
    });

    return resultHTML;
}

taskText.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        taskAddButton.click();
    }
});

taskAddButton.addEventListener("click", addTask);

taskList.addEventListener("click", e => {
    const li = e.target.closest("li");

    if (!li) 
        return;

    const id = li.dataset.id;

    if (e.target.closest(".task-edit-button")) {
        editModeOn(id);
    } else if (e.target.closest(".task-edit-done-button")) {
        editTask(id);
    } else if (e.target.closest(".task-delete-button")) {
        deleteTask(id);
    }
});

taskList.addEventListener("change", e => {
    if (e.target.matches(".task-check")) {
        const li = e.target.closest("li");

        if (!li)
            return;
        
        toggleTaskCheck(li.dataset.id);
    }
});

taskList.addEventListener("keydown", e => {
    if (e.target.matches(".task-edit-text") && e.key === "Enter") {
        const li = e.target.closest("li");

        if (!li)
            return;
        
        editTask(li.dataset.id);
    }
});

// 초기 로드
loadTasks();
render();
