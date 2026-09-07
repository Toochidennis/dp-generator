<?php
// Shared configuration: paths + session bootstrap.
// No database — everything lives in JSON files under data/.

define('DATA_DIR', __DIR__ . '/../data');
define('PROGRAMS_FILE', DATA_DIR . '/programs.json');
define('TEMPLATES_FILE', DATA_DIR . '/templates.json');
define('GENERATIONS_FILE', DATA_DIR . '/generations.json');
define('ADMIN_FILE', DATA_DIR . '/admin.json');

define('UPLOADS_DIR', __DIR__ . '/../uploads');
define('UPLOADS_URL_BASE', '/uploads');

// Dev-only cross-origin allowance so `npm run dev` (Vite on its own port) can
// talk to `php -S` on another port with cookies. Same-origin production
// requests never hit this (no Origin header, or it won't match).
const DEV_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
