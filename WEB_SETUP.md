# Настройка веб-версии для работы в браузере

## Что было настроено

### 1. CORS и CSRF
- ✅ API маршруты исключены из проверки CSRF (`api/*`)
- ✅ CORS настроен для работы с браузером
- ✅ Sanctum настроен для работы с фронтендом

### 2. Обработка ошибок
- ✅ Улучшена обработка ошибок валидации (422)
- ✅ Обработка неавторизованных запросов (401)
- ✅ Автоматический редирект на страницу входа при истечении токена
- ✅ Показ ошибок валидации пользователю

### 3. API клиент
- ✅ Автоматическое добавление Bearer токена в заголовки
- ✅ Обработка JSON и не-JSON ответов
- ✅ Обработка ошибок валидации Laravel
- ✅ Автоматическое преобразование объектов в JSON

## Как проверить работу

### 1. Запустите приложение

```bash
# Если используете Docker
docker compose up -d

# Или Laravel Sail
./vendor/bin/sail up -d

# Или напрямую PHP
php artisan serve
```

### 2. Откройте браузер

Перейдите по адресу:
- **Локальный сервер**: `http://localhost` или `http://127.0.0.1`
- **Laravel Sail**: `http://localhost` (порт 80)
- **PHP artisan serve**: `http://127.0.0.1:8000`

### 3. Проверьте работу

1. **Страница входа**: Откройте `http://localhost/login.html`
   - Форма входа должна работать
   - Форма регистрации должна работать
   - После успешной авторизации должен произойти редирект на `/index.html`

2. **Дашборд**: После входа откроется `/index.html`
   - Должны отображаться проекты и задачи
   - Кнопки "New Project" и "New Task" должны открывать модальные окна
   - Поиск должен работать
   - Клик по задаче должен открывать детали

3. **API запросы**: Откройте DevTools (F12) → Network
   - Все запросы должны идти на `/api/*`
   - В заголовках должен быть `Authorization: Bearer {token}`
   - Ответы должны быть в формате JSON

## Типичные проблемы и решения

### Проблема: CORS ошибки в консоли

**Решение**: Проверьте `config/cors.php`:
```php
'allowed_origins' => ['*'],
'supports_credentials' => true,
```

### Проблема: 401 Unauthorized

**Решение**: 
- Проверьте, что токен сохраняется в localStorage после логина
- Проверьте, что токен отправляется в заголовке `Authorization: Bearer {token}`
- Проверьте, что токен не истек

### Проблема: 419 CSRF Token Mismatch

**Решение**: 
- Убедитесь, что в `bootstrap/app.php` API маршруты исключены:
```php
$middleware->validateCsrfTokens(except: [
    'api/*',
]);
```

### Проблема: Ошибки валидации не отображаются

**Решение**: 
- Проверьте консоль браузера на наличие ошибок JavaScript
- Проверьте, что ответ от API содержит поле `errors` при статусе 422

### Проблема: Страницы не открываются

**Решение**: 
- Убедитесь, что файлы находятся в `public/` директории
- Проверьте, что `.htaccess` настроен правильно (если используется Apache)
- Проверьте маршруты в `routes/web.php`

## Проверка через консоль браузера

Откройте консоль браузера (F12) и проверьте:

```javascript
// Проверка токена
localStorage.getItem('auth_token')

// Проверка пользователя
localStorage.getItem('user')

// Тестовый API запрос
fetch('/api/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'application/json',
    }
}).then(r => r.json()).then(console.log)
```

## Настройки для продакшена

Для продакшена обновите:

1. **CORS** (`config/cors.php`):
```php
'allowed_origins' => [env('FRONTEND_URL', 'https://yourdomain.com')],
```

2. **Sanctum** (`config/sanctum.php`):
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'yourdomain.com')),
```

3. **APP_URL** (`.env`):
```
APP_URL=https://yourdomain.com
```

4. **SESSION_DOMAIN** (`.env`):
```
SESSION_DOMAIN=yourdomain.com
```

## Структура запросов

Все API запросы идут через функцию `apiRequest()` в `public/js/api.js`:

```javascript
// Пример запроса
fetch('/api/projects', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer {token}'
    },
    body: JSON.stringify({ name: 'Project', description: 'Description' })
})
```

Функция `apiRequest()` автоматически:
- Добавляет базовый URL `/api`
- Добавляет токен из localStorage
- Обрабатывает ошибки
- Преобразует объекты в JSON
