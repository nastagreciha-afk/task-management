

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

### Installation Steps

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd task-management
   ```

cp .env.example .env 

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
#and make
./vendor/bin/sail up -d && ./vendor/bin/sail composer install && ./vendor/bin/sail artisan key:generate && ./vendor/bin/sail artisan migrate
 ./vendor/bin/sail php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
./vendor/bin/sail php artisan migrate
  

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


