// API base URL
const API_URL = '/api/tasks';
const AUTH_URL = '/api/auth';

// State
let authToken = localStorage.getItem('token');
let currentUser = null;
let searchTimeout = null;

// DOM elements
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const authModal = document.getElementById('authModal');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('searchInput');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const sortBy = document.getElementById('sortBy');
const exportBtn = document.getElementById('exportBtn');
const taskCount = document.getElementById('taskCount');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAuth();
    loadTasks();
    loadStats();
    setupEventListeners();
});

// Event listeners setup
function setupEventListeners() {
    taskForm.addEventListener('submit', handleAddTask);
    editForm.addEventListener('submit', handleEditTask);
    
    // Filters
    filterStatus.addEventListener('change', loadTasks);
    filterPriority.addEventListener('change', loadTasks);
    sortBy.addEventListener('change', loadTasks);
    
    // Search with debounce
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadTasks, 300);
    });
    
    // Export
    exportBtn.addEventListener('click', exportTasks);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Close modals on outside click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal();
    });
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });
    
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Escape to close modals
    if (e.key === 'Escape') {
        closeModal();
        closeAuthModal();
    }
    
    // Ctrl+N to focus new task
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('title').focus();
    }
    
    // Ctrl+/ to focus search
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        searchInput.focus();
    }
}

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Auth management
function initAuth() {
    updateAuthUI();
    if (authToken) {
        fetchCurrentUser();
    }
}

function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    
    if (authToken && currentUser) {
        authSection.innerHTML = `
            <div class="user-info">
                <span class="user-name">👤 ${escapeHtml(currentUser.username)}</span>
                <button class="btn btn-small btn-secondary" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        authSection.innerHTML = `
            <button class="btn btn-small btn-primary" onclick="openAuthModal()">Login</button>
        `;
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch(`${AUTH_URL}/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
        } else {
            logout();
        }
    } catch (err) {
        console.error('Error fetching user:', err);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('token', authToken);
        
        closeAuthModal();
        updateAuthUI();
        loadTasks();
        loadStats();
        showNotification('Welcome back!', 'success');
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    try {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('token', authToken);
        
        closeAuthModal();
        updateAuthUI();
        loadTasks();
        loadStats();
        showNotification('Account created!', 'success');
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('token');
    updateAuthUI();
    loadTasks();
    loadStats();
    showNotification('Logged out', 'info');
}

function openAuthModal() {
    authModal.style.display = 'flex';
    document.getElementById('loginEmail').focus();
}

function closeAuthModal() {
    authModal.style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Get auth headers
function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats/summary`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) return;
        
        const stats = await response.json();
        
        document.getElementById('statTotal').textContent = stats.total || 0;
        document.getElementById('statPending').textContent = stats.pending || 0;
        document.getElementById('statProgress').textContent = stats.inProgress || 0;
        document.getElementById('statCompleted').textContent = stats.completed || 0;
        document.getElementById('statOverdue').textContent = stats.overdue || 0;
        document.getElementById('statRate').textContent = `${stats.completionRate || 0}%`;
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Load and display tasks
async function loadTasks() {
    const params = new URLSearchParams();
    
    if (filterStatus.value !== 'all') params.append('status', filterStatus.value);
    if (filterPriority.value !== 'all') params.append('priority', filterPriority.value);
    if (searchInput.value.trim()) params.append('search', searchInput.value.trim());
    if (sortBy.value) params.append('sortBy', sortBy.value);
    
    const url = `${API_URL}?${params.toString()}`;
    
    taskList.innerHTML = '<div class="loading">Loading tasks...</div>';
    
    try {
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const tasks = await response.json();
        
        if (tasks.length === 0) {
            taskList.innerHTML = '';
            emptyMessage.style.display = 'block';
            taskCount.textContent = '';
        } else {
            emptyMessage.style.display = 'none';
            taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
            renderTasks(tasks);
        }
    } catch (err) {
        console.error('Error loading tasks:', err);
        taskList.innerHTML = '<p class="empty-message">Failed to load tasks</p>';
    }
}

// Render task list
function renderTasks(tasks) {
    const now = new Date();
    
    taskList.innerHTML = tasks.map(task => {
        const isOverdue = task.dueDate && 
                         new Date(task.dueDate) < now && 
                         task.status !== 'completed';
        
        return `
        <div class="task-item priority-${task.priority} status-${task.status}" data-id="${task._id}">
            <div class="task-header">
                <span class="task-title">${escapeHtml(task.title)}</span>
                <div class="task-badges">
                    ${isOverdue ? '<span class="badge badge-overdue">Overdue</span>' : ''}
                    <span class="badge badge-status ${task.status}">${formatStatus(task.status)}</span>
                    <span class="badge badge-priority ${task.priority}">${task.priority}</span>
                </div>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-footer">
                <div class="task-meta">
                    <span>📅 ${formatDate(task.createdAt)}</span>
                    ${task.dueDate ? `<span>⏰ Due: ${formatDate(task.dueDate)}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn btn-secondary btn-small" onclick="openEditModal('${task._id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteTask('${task._id}')">Delete</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Add new task
async function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;
    const dueDate = document.getElementById('dueDate').value || null;
    
    if (!title) {
        showNotification('Title is required', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, description, status, priority, dueDate })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        
        taskForm.reset();
        document.getElementById('priority').value = 'medium';
        loadTasks();
        loadStats();
        showNotification('Task added!', 'success');
    } catch (err) {
        console.error('Error adding task:', err);
        showNotification('Failed to add task', 'error');
    }
}

// Open edit modal
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        const task = await response.json();
        
        document.getElementById('editId').value = task._id;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description || '';
        document.getElementById('editStatus').value = task.status;
        document.getElementById('editPriority').value = task.priority || 'medium';
        document.getElementById('editDueDate').value = task.dueDate ? 
            new Date(task.dueDate).toISOString().split('T')[0] : '';
        
        editModal.style.display = 'flex';
    } catch (err) {
        console.error('Error fetching task:', err);
        showNotification('Failed to load task', 'error');
    }
}

// Close modal
function closeModal() {
    editModal.style.display = 'none';
}

// Handle edit form submit
async function handleEditTask(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const status = document.getElementById('editStatus').value;
    const priority = document.getElementById('editPriority').value;
    const dueDate = document.getElementById('editDueDate').value || null;
    
    if (!title) {
        showNotification('Title is required', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, description, status, priority, dueDate })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        closeModal();
        loadTasks();
        loadStats();
        showNotification('Task updated!', 'success');
    } catch (err) {
        console.error('Error updating task:', err);
        showNotification('Failed to update task', 'error');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        loadTasks();
        loadStats();
        showNotification('Task deleted', 'success');
    } catch (err) {
        console.error('Error deleting task:', err);
        showNotification('Failed to delete task', 'error');
    }
}

// Export tasks
function exportTasks() {
    const headers = getAuthHeaders();
    
    // Create a link to download
    const a = document.createElement('a');
    a.href = `${API_URL}/export/csv`;
    a.download = 'tasks.csv';
    
    // For authenticated requests, fetch and download
    fetch(`${API_URL}/export/csv`, { headers })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.click();
            window.URL.revokeObjectURL(url);
            showNotification('Tasks exported!', 'success');
        })
        .catch(() => showNotification('Export failed', 'error'));
}

// Helper functions
function formatStatus(status) {
    const map = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };
    return map[status] || status;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}
