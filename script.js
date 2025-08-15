// Todo List App JavaScript
class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateUI();
    }

    bindEvents() {
        // Form submission
        const todoForm = document.getElementById('todoForm');
        todoForm.addEventListener('submit', (e) => this.handleAddTodo(e));

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Clear completed button
        const clearCompletedBtn = document.getElementById('clearCompleted');
        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Initialize drag and drop
        this.initDragAndDrop();
    }

    handleAddTodo(e) {
        e.preventDefault();
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.todos.unshift(todo);
            this.saveTodos();
            this.render();
            this.updateUI();
            input.value = '';
            input.focus();
        }
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.updateUI();
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
                this.updateUI();
            }, 300);
        }
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveTodos();
        this.render();
        this.updateUI();
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}" draggable="true">
                <div class="todo-drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="todoApp.toggleTodo(${todo.id})"></div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="todo-delete" onclick="todoApp.deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `).join('');
    }

    updateUI() {
        const todoFooter = document.getElementById('todoFooter');
        const emptyState = document.getElementById('emptyState');
        const todoCount = document.getElementById('todoCount');
        const clearCompletedBtn = document.getElementById('clearCompleted');

        const activeTodos = this.todos.filter(t => !t.completed);
        const completedTodos = this.todos.filter(t => t.completed);

        // Show/hide footer and empty state
        if (this.todos.length > 0) {
            todoFooter.style.display = 'flex';
            emptyState.style.display = 'none';
        } else {
            todoFooter.style.display = 'none';
            emptyState.style.display = 'block';
        }

        // Update todo count
        const countText = activeTodos.length === 1 ? '1 item left' : `${activeTodos.length} items left`;
        todoCount.textContent = countText;

        // Show/hide clear completed button
        if (completedTodos.length > 0) {
            clearCompletedBtn.style.display = 'block';
        } else {
            clearCompletedBtn.style.display = 'none';
        }

        // Update filter button states
        this.updateFilterCounts();
    }

    updateFilterCounts() {
        const allCount = this.todos.length;
        const activeCount = this.todos.filter(t => !t.completed).length;
        const completedCount = this.todos.filter(t => t.completed).length;

        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            const filter = btn.dataset.filter;
            let count = 0;
            
            switch (filter) {
                case 'all':
                    count = allCount;
                    break;
                case 'active':
                    count = activeCount;
                    break;
                case 'completed':
                    count = completedCount;
                    break;
            }

            // Update button text with count
            const baseText = btn.textContent.split('(')[0].trim();
            btn.textContent = count > 0 ? `${baseText} (${count})` : baseText;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initDragAndDrop() {
        const todoList = document.getElementById('todoList');
        
        todoList.addEventListener('dragstart', (e) => this.handleDragStart(e));
        todoList.addEventListener('dragover', (e) => this.handleDragOver(e));
        todoList.addEventListener('drop', (e) => this.handleDrop(e));
        todoList.addEventListener('dragend', (e) => this.handleDragEnd(e));
    }

    handleDragStart(e) {
        if (e.target.classList.contains('todo-item')) {
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', e.target.outerHTML);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;

        const afterElement = this.getDragAfterElement(e.clientY);
        if (afterElement) {
            afterElement.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;

        // Remove drag-over styling
        document.querySelectorAll('.todo-item').forEach(item => {
            item.classList.remove('drag-over');
        });

        const afterElement = this.getDragAfterElement(e.clientY);
        const todoList = document.getElementById('todoList');
        
        if (afterElement) {
            todoList.insertBefore(draggingElement, afterElement);
        } else {
            todoList.appendChild(draggingElement);
        }

        // Update the todos array order
        this.updateTodosOrder();
    }

    handleDragEnd(e) {
        if (e.target.classList.contains('todo-item')) {
            e.target.classList.remove('dragging');
        }
        
        // Remove drag-over styling
        document.querySelectorAll('.todo-item').forEach(item => {
            item.classList.remove('drag-over');
        });
    }

    getDragAfterElement(y) {
        const draggableElements = [...document.querySelectorAll('.todo-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateTodosOrder() {
        const todoItems = document.querySelectorAll('.todo-item');
        const newOrder = [];
        
        todoItems.forEach(item => {
            const id = parseInt(item.dataset.id);
            const todo = this.todos.find(t => t.id === id);
            if (todo) {
                newOrder.push(todo);
            }
        });
        
        this.todos = newOrder;
        this.saveTodos();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Add some sample todos for demonstration (remove this in production)
document.addEventListener('DOMContentLoaded', () => {
    // Only add sample todos if no todos exist
    if (localStorage.getItem('todos') === null) {
        const sampleTodos = [
            { id: 1, text: 'Welcome to your Todo List!', completed: false, createdAt: new Date().toISOString() },
            { id: 2, text: 'Click the checkbox to mark as complete', completed: false, createdAt: new Date().toISOString() },
            { id: 3, text: 'Use the filters to view different todo states', completed: true, createdAt: new Date().toISOString() }
        ];
        localStorage.setItem('todos', JSON.stringify(sampleTodos));
    }
});
