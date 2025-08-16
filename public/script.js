// Todo List App with Authentication
class TodoApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.todos = [];
        this.currentFilter = 'all';
        this.API_BASE = window.location.origin + '/api';
        this.init();
    }

    async init() {
        this.bindEvents();
        
        // Check if user is already logged in
        if (this.token) {
            const isValid = await this.verifyToken();
            if (isValid) {
                this.showTodoApp();
                await this.loadTodos();
                this.render();
                this.updateUI();
            } else {
                this.showAuthForms();
            }
        } else {
            this.showAuthForms();
        }
    }

    bindEvents() {
        // Authentication toggle
        document.getElementById('showLogin').addEventListener('click', () => this.showLoginForm());
        document.getElementById('showRegister').addEventListener('click', () => this.showRegisterForm());

        // Authentication forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Todo functionality
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

    // Authentication Methods
    showAuthForms() {
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('todoApp').classList.add('hidden');
    }

    showTodoApp() {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('todoApp').classList.remove('hidden');
        if (this.user) {
            document.getElementById('welcomeUser').textContent = `Welcome, ${this.user.username}!`;
        }
    }

    showLoginForm() {
        document.getElementById('showLogin').classList.add('active');
        document.getElementById('showRegister').classList.remove('active');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        this.clearErrors();
    }

    showRegisterForm() {
        document.getElementById('showRegister').classList.add('active');
        document.getElementById('showLogin').classList.remove('active');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
        this.clearErrors();
    }

    clearErrors() {
        document.getElementById('loginError').textContent = '';
        document.getElementById('registerError').textContent = '';
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                
                this.showTodoApp();
                await this.loadTodos();
                this.render();
                this.updateUI();
                
                // Clear form
                document.getElementById('loginForm').reset();
            } else {
                document.getElementById('loginError').textContent = data.error;
            }
        } catch (error) {
            document.getElementById('loginError').textContent = 'Network error. Please try again.';
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${this.API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                
                this.showTodoApp();
                await this.loadTodos();
                this.render();
                this.updateUI();
                
                // Clear form
                document.getElementById('registerForm').reset();
            } else {
                document.getElementById('registerError').textContent = data.error;
            }
        } catch (error) {
            document.getElementById('registerError').textContent = 'Network error. Please try again.';
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(`${this.API_BASE}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                return true;
            } else {
                this.token = null;
                localStorage.removeItem('token');
                return false;
            }
        } catch (error) {
            this.token = null;
            localStorage.removeItem('token');
            return false;
        }
    }

    handleLogout() {
        this.token = null;
        this.user = null;
        this.todos = [];
        localStorage.removeItem('token');
        this.showAuthForms();
        this.showLoginForm();
    }

    // Todo API Methods
    async loadTodos() {
        try {
            const response = await fetch(`${this.API_BASE}/todos`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (response.ok) {
                this.todos = await response.json();
            }
        } catch (error) {
            console.error('Failed to load todos:', error);
        }
    }

    async handleAddTodo(e) {
        e.preventDefault();
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text) {
            try {
                const response = await fetch(`${this.API_BASE}/todos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                    },
                    body: JSON.stringify({ text }),
                });

                if (response.ok) {
                    const newTodo = await response.json();
                    this.todos.unshift(newTodo);
                    this.render();
                    this.updateUI();
                    input.value = '';
                    input.focus();
                }
            } catch (error) {
                console.error('Failed to add todo:', error);
            }
        }
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const newCompleted = !todo.completed;
            
            try {
                const response = await fetch(`${this.API_BASE}/todos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                    },
                    body: JSON.stringify({ completed: newCompleted }),
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // Update the todo with the latest data from server (including updated_at)
                    if (result.todo) {
                        Object.assign(todo, result.todo);
                    } else {
                        todo.completed = newCompleted;
                        todo.updated_at = new Date().toISOString();
                    }
                    
                    // Reorganize todos: active tasks first, then completed tasks
                    this.reorganizeTodos();
                    
                    this.render();
                    this.updateUI();
                } else {
                    const errorData = await response.json();
                    console.error('Failed to update todo:', response.status, errorData);
                }
            } catch (error) {
                console.error('Failed to update todo:', error);
            }
        }
    }

    async deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(async () => {
                try {
                    const response = await fetch(`${this.API_BASE}/todos/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                        },
                    });

                    if (response.ok) {
                        this.todos = this.todos.filter(t => t.id !== id);
                        this.render();
                        this.updateUI();
                    }
                } catch (error) {
                    console.error('Failed to delete todo:', error);
                    // Remove the removing class if deletion failed
                    todoElement.classList.remove('removing');
                }
            }, 300);
        }
    }

    async clearCompleted() {
        const completedTodos = this.todos.filter(t => t.completed);
        
        for (const todo of completedTodos) {
            try {
                await fetch(`${this.API_BASE}/todos/${todo.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                    },
                });
            } catch (error) {
                console.error('Failed to delete todo:', error);
            }
        }

        this.todos = this.todos.filter(t => !t.completed);
        this.render();
        this.updateUI();
    }

    // Todo Organization Method
    reorganizeTodos() {
        // Separate active and completed todos
        const activeTodos = this.todos.filter(t => !t.completed);
        const completedTodos = this.todos.filter(t => t.completed);
        
        // Sort completed todos so newest completed items appear first in the completed section
        completedTodos.sort((a, b) => {
            // If both have updated_at, use that; otherwise use created_at or current time
            const aTime = new Date(a.updated_at || a.created_at || Date.now());
            const bTime = new Date(b.updated_at || b.created_at || Date.now());
            return bTime - aTime; // Newest first
        });
        
        // Combine: active todos first (in their current order), then completed todos (newest first)
        this.todos = [...activeTodos, ...completedTodos];
    }

    // UI Methods (same as before)
    handleFilter(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        this.render();
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

    // Drag and Drop Methods (simplified - server sync would need more work)
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

        // Update the todos array order (local only for now)
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
        // Note: In a real app, you'd sync this order to the server
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});