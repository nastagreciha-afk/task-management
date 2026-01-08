let currentProjectId = null;
let currentTaskId = null;
let allProjects = [];
let allUsers = [];

// Initialize dashboard
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadUserInfo();
    await loadProjects();
    await loadTasks();
    await loadUsers();
    setupEventListeners();
    setupTabs();
});

// Check authentication
async function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    try {
        await authAPI.me();
    } catch (error) {
        removeToken();
        window.location.href = '/login.html';
    }
}

// Load user information
async function loadUserInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.name || 'User';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Load projects
async function loadProjects(search = '') {
    try {
        const params = {};
        if (search) {
            params.search = search;
        }
        
        const response = await projectAPI.getAll(params);
        
        if (response.success) {
            allProjects = response.data.data || response.data || [];
            renderProjects(allProjects);
        }
    } catch (error) {
        showNotification('Failed to load projects: ' + error.message, 'error');
    }
}

// Render projects
function renderProjects(projects) {
    const container = document.getElementById('projectsList');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<p class="empty-state">No projects found. Create your first project!</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="card">
            <div class="card-header">
                <h3>${escapeHtml(project.name)}</h3>
                <div class="card-actions">
                    <button class="btn-icon" onclick="editProject(${project.id})" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="deleteProject(${project.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="card-body">
                <p>${escapeHtml(project.description || 'No description')}</p>
                <small>Created: ${new Date(project.created_at).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

// Load tasks
async function loadTasks(search = '', projectId = null, status = null) {
    try {
        const params = {};
        if (search) params.search = search;
        if (projectId) params.project_id = projectId;
        if (status) params.status = status;
        
        const response = await taskAPI.getAll(params);
        
        if (response.success) {
            const tasks = response.data.data || response.data || [];
            renderTasks(tasks);
        }
    } catch (error) {
        showNotification('Failed to load tasks: ' + error.message, 'error');
    }
}

// Render tasks
function renderTasks(tasks) {
    const container = document.getElementById('tasksList');
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-state">No tasks found. Create your first task!</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="card" onclick="showTaskDetails(${task.id})">
            <div class="card-header">
                <h3>${escapeHtml(task.title)}</h3>
                <span class="badge badge-${task.status}">${task.status.replace('_', ' ')}</span>
            </div>
            <div class="card-body">
                <p>${escapeHtml(task.description || 'No description')}</p>
                <small>Project: ${escapeHtml(task.project?.name || 'N/A')}</small><br>
                <small>Created: ${new Date(task.created_at).toLocaleDateString()}</small>
                ${task.users && task.users.length > 0 ? 
                    `<small>Assigned to: ${task.users.map(u => u.name).join(', ')}</small>` : ''}
            </div>
            <div class="card-footer">
                <button class="btn btn-sm" onclick="event.stopPropagation(); editTask(${task.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load users
async function loadUsers() {
    try {
        const response = await userAPI.getAll();
        if (response.success) {
            allUsers = response.data || [];
            populateUserSelect();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Populate user select in task form
function populateUserSelect() {
    const select = document.getElementById('taskUsers');
    if (!select) return;
    
    select.innerHTML = allUsers.map(user => 
        `<option value="${user.id}">${escapeHtml(user.name)} (${escapeHtml(user.email)})</option>`
    ).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        removeToken();
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });
    
    // Create project button
    document.getElementById('createProjectBtn')?.addEventListener('click', () => {
        currentProjectId = null;
        document.getElementById('projectModalTitle').textContent = 'New Project';
        document.getElementById('projectForm').reset();
        document.getElementById('projectModal').style.display = 'block';
    });
    
    // Create task button
    document.getElementById('createTaskBtn')?.addEventListener('click', () => {
        currentTaskId = null;
        document.getElementById('taskModalTitle').textContent = 'New Task';
        document.getElementById('taskForm').reset();
        populateProjectSelect();
        document.getElementById('taskModal').style.display = 'block';
    });
    
    // Project form submit
    document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('projectName').value,
            description: document.getElementById('projectDescription').value,
        };
        
        try {
            if (currentProjectId) {
                await projectAPI.update(currentProjectId, formData);
                showNotification('Project updated successfully!', 'success');
            } else {
                await projectAPI.create(formData);
                showNotification('Project created successfully!', 'success');
            }
            document.getElementById('projectModal').style.display = 'none';
            await loadProjects();
        } catch (error) {
            showNotification('Failed to save project: ' + error.message, 'error');
        }
    });
    
    // Task form submit
    document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedUsers = Array.from(document.getElementById('taskUsers').selectedOptions)
            .map(option => parseInt(option.value));
        
        const formData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            project_id: parseInt(document.getElementById('taskProject').value),
            status: document.getElementById('taskStatus').value,
            user_ids: selectedUsers,
        };
        
        try {
            if (currentTaskId) {
                await taskAPI.update(currentTaskId, formData);
                showNotification('Task updated successfully!', 'success');
            } else {
                await taskAPI.create(formData);
                showNotification('Task created successfully!', 'success');
            }
            document.getElementById('taskModal').style.display = 'none';
            await loadTasks();
        } catch (error) {
            showNotification('Failed to save task: ' + error.message, 'error');
        }
    });
    
    // Modal close buttons
    document.getElementById('closeProjectModal')?.addEventListener('click', () => {
        document.getElementById('projectModal').style.display = 'none';
    });
    
    document.getElementById('cancelProjectBtn')?.addEventListener('click', () => {
        document.getElementById('projectModal').style.display = 'none';
    });
    
    document.getElementById('closeTaskModal')?.addEventListener('click', () => {
        document.getElementById('taskModal').style.display = 'none';
    });
    
    document.getElementById('cancelTaskBtn')?.addEventListener('click', () => {
        document.getElementById('taskModal').style.display = 'none';
    });
    
    document.getElementById('closeTaskDetailsModal')?.addEventListener('click', () => {
        document.getElementById('taskDetailsModal').style.display = 'none';
    });
    
    // Search
    document.getElementById('searchBtn')?.addEventListener('click', () => {
        const search = document.getElementById('searchInput').value;
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        
        if (activeTab === 'projects') {
            loadProjects(search);
        } else {
            loadTasks(search);
        }
    });
    
    // Close modals on outside click
    window.onclick = (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
}

// Setup tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(`${tab}Tab`).classList.add('active');
        });
    });
}

// Populate project select
function populateProjectSelect() {
    const select = document.getElementById('taskProject');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select a project</option>' +
        allProjects.map(project => 
            `<option value="${project.id}">${escapeHtml(project.name)}</option>`
        ).join('');
}

// Edit project
window.editProject = async function(id) {
    const project = allProjects.find(p => p.id === id);
    if (!project) return;
    
    currentProjectId = id;
    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectModal').style.display = 'block';
};

// Delete project
window.deleteProject = async function(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        await projectAPI.delete(id);
        showNotification('Project deleted successfully!', 'success');
        await loadProjects();
    } catch (error) {
        showNotification('Failed to delete project: ' + error.message, 'error');
    }
};

// Edit task
window.editTask = async function(id) {
    try {
        const response = await taskAPI.getById(id);
        if (!response.success) throw new Error('Failed to load task');
        
        const task = response.data;
        currentTaskId = id;
        document.getElementById('taskModalTitle').textContent = 'Edit Task';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskProject').value = task.project_id;
        document.getElementById('taskStatus').value = task.status;
        populateProjectSelect();
        document.getElementById('taskProject').value = task.project_id;
        
        // Select assigned users
        if (task.users && task.users.length > 0) {
            const userIds = task.users.map(u => u.id.toString());
            Array.from(document.getElementById('taskUsers').options).forEach(option => {
                if (userIds.includes(option.value)) {
                    option.selected = true;
                }
            });
        }
        
        document.getElementById('taskModal').style.display = 'block';
    } catch (error) {
        showNotification('Failed to load task: ' + error.message, 'error');
    }
};

// Delete task
window.deleteTask = async function(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        await taskAPI.delete(id);
        showNotification('Task deleted successfully!', 'success');
        await loadTasks();
    } catch (error) {
        showNotification('Failed to delete task: ' + error.message, 'error');
    }
};

// Show task details
window.showTaskDetails = async function(id) {
    try {
        const response = await taskAPI.getById(id);
        if (!response.success) throw new Error('Failed to load task');
        
        const task = response.data;
        const content = document.getElementById('taskDetailsContent');
        
        content.innerHTML = `
            <div class="task-details-content">
                <h4>${escapeHtml(task.title)}</h4>
                <p><strong>Status:</strong> <span class="badge badge-${task.status}">${task.status.replace('_', ' ')}</span></p>
                <p><strong>Project:</strong> ${escapeHtml(task.project?.name || 'N/A')}</p>
                <p><strong>Description:</strong></p>
                <p>${escapeHtml(task.description || 'No description')}</p>
                <p><strong>Created by:</strong> ${escapeHtml(task.creator?.name || 'N/A')}</p>
                <p><strong>Assigned to:</strong> ${task.users && task.users.length > 0 ? 
                    task.users.map(u => escapeHtml(u.name)).join(', ') : 'No one assigned'}</p>
                <p><strong>Created:</strong> ${new Date(task.created_at).toLocaleString()}</p>
                <p><strong>Updated:</strong> ${new Date(task.updated_at).toLocaleString()}</p>
            </div>
        `;
        
        document.getElementById('taskDetailsModal').style.display = 'block';
    } catch (error) {
        showNotification('Failed to load task details: ' + error.message, 'error');
    }
};

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
