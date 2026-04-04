document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');

    // Load tasks from LocalStorage
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const saveToLocalStorage = () => {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            tasks.push({
                text: li.querySelector('span').textContent,
                completed: li.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const toggleEmptyState = () => {
        if (emptyImage) {
            emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        }
    };

    const createTaskElement = (text, completed = false) => {
        const li = document.createElement('li');
        if (completed) li.classList.add('completed');

        // Build structure (Safe from XSS)
        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''} />
            <span></span>
            <div class="task-buttons">
                <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        // Set text content safely
        const span = li.querySelector('span');
        span.textContent = text;

        const checkbox = li.querySelector('.checkbox');
        const editBtn = li.querySelector('.edit-btn');
        const deleteBtn = li.querySelector('.delete-btn');

        // Toggle Completed
        checkbox.addEventListener('change', () => {
            li.classList.toggle('completed', checkbox.checked);
            editBtn.disabled = checkbox.checked;
            editBtn.style.opacity = checkbox.checked ? '0.5' : '1';
            saveToLocalStorage();
        });

        // Edit Task
        editBtn.addEventListener('click', () => {
            const newText = prompt("Edit your task:", span.textContent);
            if (newText !== null && newText.trim() !== "") {
                span.textContent = newText.trim();
                saveToLocalStorage();
            }
        });

        // Delete Task
        deleteBtn.addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            saveToLocalStorage();
        });

        return li;
    };

    const addTask = (text = null, completed = false) => {
        const taskText = text || taskInput.value.trim();
        if (!taskText) return;

        const taskElement = createTaskElement(taskText, completed);
        taskList.appendChild(taskElement);
        
        taskInput.value = '';
        toggleEmptyState();
        saveToLocalStorage();
    };

    // Initialize
    savedTasks.forEach(task => addTask(task.text, task.completed));
    
    addTaskBtn.addEventListener('click', () => addTask());
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
});