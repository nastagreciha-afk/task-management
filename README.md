# Task Management Application

A modern, user-friendly task management application built with Laravel (backend) and HTML/CSS/JavaScript (frontend). This application allows users to manage tasks, create projects, and assign users to tasks.

## Features

### Authentication & Authorization
- User Registration and Login
- JWT-based authentication using Laravel Sanctum
- Secure password hashing
- Token management

### Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Validation**: Request validation on all endpoints
- **User Assignment**: Assign users from available user list to tasks
- **Task Status**: Track task status (pending, in_progress, completed)
- **Search**: Search tasks by title or description
- **Filtering**: Filter tasks by project and status

### Project Management
- **CRUD Operations**: Create, read, update, and delete projects
- **Validation**: Request validation on all endpoints
- **Search**: Search projects by name or description

## Technology Stack

### Frontend
- HTML5
- CSS3 (Modern styling with CSS Variables)
- JavaScript (Vanilla JS - no frameworks required)
- Responsive design

### Backend
- Laravel 12
- MySQL
- Eloquent ORM
- Laravel Sanctum (JWT Authentication)
- RESTful API

### Development Tools
- Docker & Docker Compose
- PHP CodeSniffer (PSR-12, PSR-4)
- PHP MD

## Project Structure

```
app/
 ├── Http/
 │   ├── Controllers/
 │   │   ├── Auth/
 │   │   │   └── AuthController.php
 │   │   ├── ProjectController.php
 │   │   ├── TaskController.php
 │   │   └── UserController.php
 │   ├── Requests/
 │   │   ├── Auth/
 │   │   │   ├── LoginRequest.php
 │   │   │   └── RegisterRequest.php
 │   │   ├── Project/
 │   │   │   ├── StoreProjectRequest.php
 │   │   │   └── UpdateProjectRequest.php
 │   │   └── Task/
 │   │       ├── StoreTaskRequest.php
 │   │       └── UpdateTaskRequest.php
 │   └── Middleware/
 │       └── JwtMiddleware.php (handled by Sanctum)
 │
 ├── Models/
 │   ├── User.php
 │   ├── Project.php
 │   └── Task.php
 │
 └── Services/
     ├── AuthService.php
     ├── ProjectService.php
     └── TaskService.php

database/
 └── migrations/
     ├── 0001_01_01_000000_create_users_table.php
     ├── 2024_01_01_000001_create_projects_table.php
     ├── 2024_01_01_000002_create_tasks_table.php
     └── 2024_01_01_000003_create_task_user_table.php

public/
 ├── css/
 │   └── app.css
 ├── js/
 │   ├── api.js
 │   ├── auth.js
 │   └── dashboard.js
 ├── index.html
 └── login.html

routes/
 └── api.php
```

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed
- Git installed

### Installation Steps

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd task-management
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Laravel Sanctum**
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   php artisan migrate
   ```

4. **Configure environment variables**
   
   Create a `.env` file from `.env.example` (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database configuration:
   ```env
   APP_NAME=TaskManagement
   APP_URL=http://localhost
   
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=task_management
   DB_USERNAME=sail
   DB_PASSWORD=password
   
   SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
   SESSION_DOMAIN=localhost
   ```

5. **Generate application key**
   ```bash
   php artisan key:generate
   ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Start Docker containers**
   ```bash
   docker compose up -d
   ```
   
   Or if using Laravel Sail:
   ```bash
   ./vendor/bin/sail up -d
   ```

8. **Access the application**
   - Frontend: http://localhost (or the port configured in your `.env`)
   - API: http://localhost/api

### Using Laravel Sail

If you prefer using Laravel Sail for Docker management:

```bash
# Start containers
./vendor/bin/sail up -d

# Run migrations
./vendor/bin/sail artisan migrate

# Install dependencies
./vendor/bin/sail composer install
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

#### Get Current User
```http
GET /api/me
Authorization: Bearer {token}
```

### Project Endpoints

#### List Projects
```http
GET /api/projects?search=project_name&per_page=15
Authorization: Bearer {token}
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Project Description"
}
```

#### Get Project
```http
GET /api/projects/{id}
Authorization: Bearer {token}
```

#### Update Project
```http
PUT /api/projects/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated Description"
}
```

#### Delete Project
```http
DELETE /api/projects/{id}
Authorization: Bearer {token}
```

### Task Endpoints

#### List Tasks
```http
GET /api/tasks?search=task_title&project_id=1&status=pending&per_page=15
Authorization: Bearer {token}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Task Title",
  "description": "Task Description",
  "project_id": 1,
  "status": "pending",
  "user_ids": [1, 2, 3]
}
```

#### Get Task
```http
GET /api/tasks/{id}
Authorization: Bearer {token}
```

#### Update Task
```http
PUT /api/tasks/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "status": "in_progress",
  "user_ids": [1, 2]
}
```

#### Delete Task
```http
DELETE /api/tasks/{id}
Authorization: Bearer {token}
```

### User Endpoints

#### List Users
```http
GET /api/users
Authorization: Bearer {token}
```

## Database Schema

### Users Table
- `id` (primary key)
- `name`
- `email` (unique)
- `password` (hashed)
- `email_verified_at` (nullable)
- `remember_token`
- `created_at`, `updated_at`

### Projects Table
- `id` (primary key)
- `name`
- `description` (nullable)
- `user_id` (foreign key to users)
- `created_at`, `updated_at`

### Tasks Table
- `id` (primary key)
- `title`
- `description` (nullable)
- `status` (enum: pending, in_progress, completed)
- `project_id` (foreign key to projects)
- `created_by` (foreign key to users)
- `created_at`, `updated_at`

### Task User Pivot Table (task_user)
- `id` (primary key)
- `task_id` (foreign key to tasks)
- `user_id` (foreign key to users)
- `created_at`, `updated_at`
- Unique constraint on (`task_id`, `user_id`)

## Code Quality

This project follows PSR-12 and PSR-4 coding standards.

### Running Code Style Checks

```bash
# Using Laravel Pint (included with Laravel)
./vendor/bin/pint

# Or using PHP CodeSniffer (if installed)
./vendor/bin/phpcs --standard=PSR12 app/
```

## Frontend Usage

1. **Login/Register**: Navigate to `login.html` to authenticate
2. **Dashboard**: After login, you'll be redirected to `index.html`
3. **Create Project**: Click "New Project" button
4. **Create Task**: Click "New Task" button
5. **View Details**: Click on a task card to view details
6. **Search**: Use the search bar to filter projects or tasks
7. **Tabs**: Switch between Projects and Tasks views

## Error Handling

All API errors are returned in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (in debug mode)"
}
```

Validation errors include field-specific messages:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password confirmation does not match."]
  }
}
```

## Logging

All application activities are logged to `storage/logs/laravel.log`. This includes:
- User registration and login attempts
- CRUD operations on projects and tasks
- Error messages and exceptions

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- CSRF protection (via Sanctum)
- Request validation on all endpoints
- Authorization checks (users can only modify their own projects/tasks)
- SQL injection protection (via Eloquent ORM)

## Development

### Running Tests
```bash
php artisan test
```

### Running Migrations
```bash
php artisan migrate
php artisan migrate:rollback
php artisan migrate:refresh
```

### Creating New Migrations
```bash
php artisan make:migration create_table_name
```

### Creating New Controllers
```bash
php artisan make:controller ControllerName
```

### Creating New Models
```bash
php artisan make:model ModelName
```

## Docker Compose Services

The application uses Docker Compose with the following services:
- **Laravel Application**: PHP 8.5, Nginx
- **MySQL**: Database server
- **Redis**: Caching (optional)
- **Meilisearch**: Search engine (optional)
- **Mailpit**: Email testing (optional)
- **Selenium**: Browser testing (optional)

## Troubleshooting

### Common Issues

1. **Database connection error**
   - Check `.env` file has correct database credentials
   - Ensure MySQL container is running: `docker compose ps`

2. **CORS errors**
   - Verify `SANCTUM_STATEFUL_DOMAINS` in `.env` includes your frontend domain
   - Check `config/cors.php` configuration

3. **Token not working**
   - Ensure token is being sent in Authorization header: `Bearer {token}`
   - Check token hasn't expired
   - Verify user hasn't logged out

4. **Migration errors**
   - Run `php artisan migrate:fresh` to reset database (⚠️ deletes all data)
   - Check database connection is working

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
