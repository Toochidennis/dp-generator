<?php
// GET  -> current session ({authenticated:true, username, csrfToken} or 401)
// POST -> {action:"login", username, password} | {action:"logout"}

require_once __DIR__ . '/helpers.php';
send_cors_headers();

function admin_record(): ?array {
    $admins = read_store(ADMIN_FILE, fn() => []);
    return $admins[0] ?? null;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (!is_admin()) {
        json_response(['authenticated' => false], 401);
    }
    json_response([
        'authenticated' => true,
        'username' => $_SESSION['admin_username'],
        'csrfToken' => $_SESSION['csrf_token'] ?? new_csrf_token(),
    ]);
}

if ($method === 'POST') {
    $body = json_body();
    $action = $body['action'] ?? 'login';

    if ($action === 'logout') {
        $_SESSION = [];
        session_destroy();
        json_response(['authenticated' => false]);
    }

    if ($action === 'login') {
        $username = clean_text($body['username'] ?? '');
        $password = (string) ($body['password'] ?? '');
        $admin = admin_record();

        if (!$admin || $username === '' || $password === '' ||
            !hash_equals($admin['username'], $username) ||
            !password_verify($password, $admin['passwordHash'])
        ) {
            json_response(['message' => 'Incorrect username or password.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['admin_username'] = $admin['username'];
        json_response([
            'authenticated' => true,
            'username' => $admin['username'],
            'csrfToken' => new_csrf_token(),
        ]);
    }

    json_response(['message' => 'Unknown action.'], 400);
}

json_response(['message' => 'Method not allowed.'], 405);
