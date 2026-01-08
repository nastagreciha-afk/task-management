# Quick Setup Guide

## Prerequisites
- Docker and Docker Compose
- PHP 8.2+ and Composer (if not using Docker)

## Quick Start

1. **Install dependencies**
   ```bash
   composer install
   ```

2. **Configure environment**
   
   Create `.env` file:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   
   Update `.env` with database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=task_management
   DB_USERNAME=sail
   DB_PASSWORD=password
   
   SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,127.0.0.1:8000
   SESSION_DOMAIN=localhost
   ```

3. **Publish Sanctum configuration** (if needed)
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

4. **Run migrations**
   ```bash
   php artisan migrate
   ```

5. **Start Docker containers**
   ```bash
   docker compose up -d
   ```
   
   Or using Laravel Sail:
   ```bash
   ./vendor/bin/sail up -d
   ```

6. **Access the application**
   - Frontend: http://localhost
   - Login: http://localhost/login.html
   - API: http://localhost/api

## Testing the API

### Register a user
```bash
curl -X POST http://localhost/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response and use it in subsequent requests:
```bash
export TOKEN="your-token-here"
```

### Get projects
```bash
curl -X GET http://localhost/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

## Notes

- All API endpoints require authentication except `/api/register` and `/api/login`
- Tokens are stored in localStorage on the frontend
- Frontend files are served from the `public` directory
- Database migrations include: users, projects, tasks, task_user pivot table, and personal_access_tokens (for Sanctum)
