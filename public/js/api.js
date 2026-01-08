// API Configuration
const API_BASE_URL = '/api';

// Get authentication token from localStorage
function getToken() {
    return localStorage.getItem('auth_token');
}

// Set authentication token in localStorage
function setToken(token) {
    localStorage.setItem('auth_token', token);
}

// Remove authentication token
function removeToken() {
    localStorage.removeItem('auth_token');
}

// API Request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };
    
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {}),
        },
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Auth API
const authAPI = {
    register: async (userData) => {
        return apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },
    
    login: async (credentials) => {
        return apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },
    
    logout: async () => {
        return apiRequest('/logout', {
            method: 'POST',
        });
    },
    
    me: async () => {
        return apiRequest('/me');
    },
};

// Project API
const projectAPI = {
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/projects${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: async (id) => {
        return apiRequest(`/projects/${id}`);
    },
    
    create: async (projectData) => {
        return apiRequest('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    },
    
    update: async (id, projectData) => {
        return apiRequest(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData),
        });
    },
    
    delete: async (id) => {
        return apiRequest(`/projects/${id}`, {
            method: 'DELETE',
        });
    },
};

// Task API
const taskAPI = {
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/tasks${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: async (id) => {
        return apiRequest(`/tasks/${id}`);
    },
    
    create: async (taskData) => {
        return apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    },
    
    update: async (id, taskData) => {
        return apiRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        });
    },
    
    delete: async (id) => {
        return apiRequest(`/tasks/${id}`, {
            method: 'DELETE',
        });
    },
};

// User API
const userAPI = {
    getAll: async () => {
        return apiRequest('/users');
    },
};

// Utility function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification') || 
                        document.getElementById('registerNotification');
    
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }
}

// Utility function to show errors
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Utility function to clear errors
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}
