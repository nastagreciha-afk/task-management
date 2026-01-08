// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (token && window.location.pathname === '/login.html') {
        window.location.href = '/index.html';
    } else if (!token && window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
});

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await authAPI.login({ email, password });
        
        if (response.success) {
            setToken(response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } else {
            showNotification(response.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
    }
});

// Register form handler
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
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
        showNotification(error.message || 'Registration failed', 'error');
    }
});

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
