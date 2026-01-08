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
    
    // If body is provided in options, convert it to string if it's an object
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(url, config);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(text || 'An error occurred');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            // Handle validation errors
            if (response.status === 422 && data.errors) {
                const errors = Object.values(data.errors).flat().join(', ');
                throw new Error(errors || data.message || 'Validation failed');
            }
            
            // Handle unauthorized
            if (response.status === 401) {
                removeToken();
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login.html') {
                    window.location.href = '/login.html';
                }
            }
            
            throw new Error(data.message || data.error || 'An error occurred');
        }
        
        return data;
    } catch (error) {
        // If it's already an Error object, just throw it
        if (error instanceof Error) {
            throw error;
        }
        // Otherwise, wrap it in an Error
        throw new Error(error.message || 'An error occurred');
    }
}

// Auth API
const authAPI = {
    register: async (userData) => {
        return apiRequest('/register', {
            method: 'POST',
            body: userData,
        });
    },
    
    login: async (credentials) => {
        return apiRequest('/login', {
            method: 'POST',
            body: credentials,
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
            body: projectData,
        });
    },
    
    update: async (id, projectData) => {
        return apiRequest(`/projects/${id}`, {
            method: 'PUT',
            body: projectData,
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
            body: taskData,
        });
    },
    
    update: async (id, taskData) => {
        return apiRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: taskData,
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
