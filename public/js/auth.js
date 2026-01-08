// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    console.log('Auth script loaded');
    const token = getToken();
    if (token && (window.location.pathname === '/login.html' || window.location.pathname === '/login')) {
        window.location.href = '/index.html';
    } else if (!token && window.location.pathname !== '/login.html' && window.location.pathname !== '/login') {
        // Don't redirect if we're on root or index
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            window.location.href = '/login.html';
        }
    }
    
    // Check if form exists
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found!');
    }
});

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    try {
        console.log('Attempting login for:', email);
        const response = await authAPI.login({ email, password });
        console.log('Login response:', response);
        
        if (response && response.success) {
            if (response.data && response.data.token) {
                const token = response.data.token;
                const user = response.data.user;
                
                console.log('Token received:', token ? 'Token exists (' + token.length + ' chars)' : 'No token');
                console.log('User data:', user);
                
                // Save token
                setToken(token);
                const savedToken = getToken();
                console.log('Token saved:', savedToken ? 'Yes' : 'No');
                
                // Save user
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    console.log('User saved:', JSON.parse(localStorage.getItem('user') || '{}'));
                }
                
                showNotification('Login successful!', 'success');
                
                // Small delay to show notification
                setTimeout(() => {
                    console.log('Redirecting to dashboard...');
                    window.location.href = '/index.html';
                }, 1000);
            } else {
                console.error('Invalid response structure:', response);
                showNotification('Invalid response from server: missing token or user data', 'error');
            }
        } else {
            console.error('Login failed:', response);
            showNotification(response?.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle validation errors
        if (error.message && error.message.includes(',')) {
            const errors = error.message.split(', ');
            errors.forEach(err => {
                if (err.toLowerCase().includes('email')) {
                    showError('emailError', err);
                } else if (err.toLowerCase().includes('password')) {
                    showError('passwordError', err);
                }
            });
        }
        
        const errorMessage = error.message || 'Login failed. Please check your credentials.';
        showNotification(errorMessage, 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
    });
} else {
    console.error('Login form not found on page');
}

// Register form handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        showError('regPasswordConfirmError', 'Passwords do not match');
        return;
    }
    
    try {
        const response = await authAPI.register({
            name,
            email,
            password,
            password_confirmation: passwordConfirm,
        });
        
        if (response.success) {
            setToken(response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            showNotification('Registration successful!', 'success');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } else {
            showNotification(response.message || 'Registration failed', 'error');
        }
    } catch (error) {
        // Handle validation errors
        if (error.message && error.message.includes(',')) {
            const errors = error.message.split(', ');
            errors.forEach(err => {
                if (err.toLowerCase().includes('name')) {
                    showError('regNameError', err);
                } else if (err.toLowerCase().includes('email')) {
                    showError('regEmailError', err);
                } else if (err.toLowerCase().includes('password')) {
                    if (err.toLowerCase().includes('confirmation')) {
                        showError('regPasswordConfirmError', err);
                    } else {
                        showError('regPasswordError', err);
                    }
                }
            });
        }
        showNotification(error.message || 'Registration failed', 'error');
    }
    });
} else {
    console.warn('Register form not found on page');
}

// Toggle between login and register forms
document.getElementById('registerLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').parentElement.style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
});

document.getElementById('loginLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerCard').style.display = 'none';
    document.getElementById('loginForm').parentElement.style.display = 'block';
});
