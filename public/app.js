// API base URL
const API_URL = '/api/tasks';

// DOM elements
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const filterStatus = document.getElementById('filterStatus');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

// Event listeners
taskForm.addEventListener('submit', handleAddTask);
filterStatus.addEventListener('change', loadTasks);
editForm.addEventListener('submit', handleEditTask);

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal();
    }
});

// Load and display tasks
async function loadTasks() {
    const status = filterStatus.value;
    const url = status ? `${API_URL}?status=${status}` : API_URL;
    
    taskList.innerHTML = '<div class="loading">Loading tasks...</div>';
    
    try {
        const response = await fetch(url);
        const tasks = await response.json();
        
        if (tasks.length === 0) {
            taskList.innerHTML = '';
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            renderTasks(tasks);
        }
    } catch (err) {
        console.error('Error loading tasks:', err);
        taskList.innerHTML = '<p class="empty-message">Failed to load tasks. Is the server running?</p>';
    }
}

// Render task list
function renderTasks(tasks) {
    taskList.innerHTML = tasks.map(task => `
        <div class="task-item status-${task.status}" data-id="${task._id}">
            <div class="task-header">
                <span class="task-title">${escapeHtml(task.title)}</span>
                <span class="task-status status-${task.status}">${formatStatus(task.status)}</span>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-footer">
                <span class="task-date">Created: ${formatDate(task.createdAt)}</span>
                <div class="task-actions">
                    <button class="btn btn-secondary btn-small" onclick="openEditModal('${task._id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteTask('${task._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add new task
async function handleAddTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        
        taskForm.reset();
        loadTasks();
        showNotification('Task added successfully!', 'success');
    } catch (err) {
        console.error('Error adding task:', err);
        showNotification('Failed to add task', 'error');
    }
}

// Open edit modal
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const task = await response.json();
        
        document.getElementById('editId').value = task._id;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description || '';
        document.getElementById('editStatus').value = task.status;
        
        editModal.style.display = 'flex';
    } catch (err) {
        console.error('Error fetching task:', err);
        showNotification('Failed to load task details', 'error');
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
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, status })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        closeModal();
        loadTasks();
        showNotification('Task updated!', 'success');
    } catch (err) {
        console.error('Error updating task:', err);
        showNotification('Failed to update task', 'error');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        loadTasks();
        showNotification('Task deleted', 'success');
    } catch (err) {
        console.error('Error deleting task:', err);
        showNotification('Failed to delete task', 'error');
    }
}

// Helper functions
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
