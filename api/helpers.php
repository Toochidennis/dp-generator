<?php
// Shared helpers: response/JSON-store plumbing, auth guards, id/slug utils,
// and the data:-URL -> file-on-disk image handler.

require_once __DIR__ . '/config.php';

function send_cors_headers(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && in_array($origin, DEV_ALLOWED_ORIGINS, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function now_iso(): string {
    return (new DateTime('now'))->format(DateTime::ATOM);
}

function is_admin(): bool {
    return !empty($_SESSION['admin_username']);
}

function require_admin(): void {
    if (!is_admin()) {
        json_response(['message' => 'Unauthorized.'], 401);
    }
}

function require_csrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        json_response(['message' => 'Invalid or missing CSRF token.'], 403);
    }
}

function new_csrf_token(): string {
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf_token'] = $token;
    return $token;
}

/** Reads a JSON store, seeding it (and creating data/) on first read. */
function read_store(string $file, callable $seedFactory): array {
    if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
    if (!file_exists($file)) {
        $seed = $seedFactory();
        write_store($file, $seed);
        return $seed;
    }
    $raw = @file_get_contents($file);
    if ($raw === false || trim($raw) === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Writes a JSON store with an exclusive lock so concurrent requests can't corrupt it. */
function write_store(string $file, array $data): bool {
    if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0755, true);
    $json = json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) return false;
    $fp = @fopen($file, 'c');
    if (!$fp) return false;
    $ok = false;
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, $json);
        fflush($fp);
        flock($fp, LOCK_UN);
        $ok = true;
    }
    fclose($fp);
    return $ok;
}

function new_id(string $prefix): string {
    return $prefix . '_' . bin2hex(random_bytes(6));
}

function slugify(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9\s-]/', '', $value) ?? '';
    $value = preg_replace('/[\s-]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function unique_slug(string $slug, array $programs, ?string $ignoreId = null): string {
    $base = $slug !== '' ? $slug : 'program';
    $candidate = $base;
    $n = 1;
    while (true) {
        $hit = false;
        foreach ($programs as $p) {
            if (($p['slug'] ?? '') === $candidate && ($ignoreId === null || ($p['id'] ?? '') !== $ignoreId)) {
                $hit = true;
                break;
            }
        }
        if (!$hit) return $candidate;
        $candidate = $base . '-' . (++$n);
    }
}

/**
 * If $value is a `data:image/...;base64,...` string, decodes and writes it
 * under uploads/$subdir, returning the served path. Otherwise returns $value
 * untouched (already a URL/path, or empty).
 */
function save_data_url_image(?string $value, string $subdir): ?string {
    if ($value === null || $value === '') return $value;
    if (!preg_match('/^data:image\/(png|jpe?g|webp);base64,(.+)$/i', $value, $m)) {
        return $value;
    }
    $ext = strtolower($m[1]) === 'jpeg' ? 'jpg' : strtolower($m[1]);
    $bytes = base64_decode($m[2], true);
    if ($bytes === false) {
        json_response(['message' => 'Could not read that image.'], 400);
    }
    if (strlen($bytes) > 12 * 1024 * 1024) {
        json_response(['message' => 'Image must be smaller than 12 MB.'], 413);
    }
    $dir = UPLOADS_DIR . '/' . $subdir;
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $filename = bin2hex(random_bytes(16)) . '.' . $ext;
    file_put_contents($dir . '/' . $filename, $bytes);
    return UPLOADS_URL_BASE . '/' . $subdir . '/' . $filename;
}

/** Inline SVG placeholder used when a template is created without a preview image. */
function placeholder_preview(string $label): string {
    $label = htmlspecialchars(strtoupper(trim($label)) ?: 'ATTENDANCE', ENT_XML1);
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">'
        . '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        . '<stop stop-color="#4267b2"/><stop offset="1" stop-color="#159568"/></linearGradient></defs>'
        . '<rect width="800" height="800" fill="url(#g)"/>'
        . '<text x="400" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff">'
        . $label . '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' . rawurlencode($svg);
}

function clean_text(?string $value): string {
    return trim(strip_tags((string) $value));
}

/** Seed data for programs.json on a fresh deploy — the one real program that exists today. */
function seed_programs(): array {
    return [[
        'id' => 'prog_kids_coding_bootcamp',
        'title' => 'Kids Coding Bootcamp',
        'slug' => 'kids-coding-bootcamp',
        'description' => "A hands-on coding bootcamp — onsite and online — where curious kids go from playing games to building them, guided by Digital Dreams coaches who've trained Nigeria's developers since 2007.",
        'startDate' => '2026-07-01',
        'endDate' => null,
        'bannerUrl' => '/images/kids-coding-bootcamp-banner.jpg',
        'status' => 'active',
        'attendanceText' => '{{name}} is attending {{programName}}',
        'generationCount' => 0,
        'createdAt' => now_iso(),
    ]];
}

/** Seed data for templates.json. Templates are a flat store — programId is
 * null until a template is attached to a program, so they don't need a
 * program to exist first. */
function seed_templates(): array {
    return [[
        'id' => 'temp_kids_coding_bootcamp_2026',
        'programId' => 'prog_kids_coding_bootcamp',
        'name' => 'Kids Coding Bootcamp 2026',
        'previewUrl' => '/uploads/templates/kids-coding-bootcamp-2026.png',
        'type' => 'image',
        'status' => 'active',
        'isDefault' => true,
    ]];
}

function read_programs(): array {
    return read_store(PROGRAMS_FILE, 'seed_programs');
}

function read_templates(): array {
    return read_store(TEMPLATES_FILE, 'seed_templates');
}

/** Joins templates onto a program (or every program in an array) as `templates`,
 * matching the Program type's shape even though templates are stored separately. */
function attach_templates(array $programOrPrograms, ?array $templates = null): array {
    $templates = $templates ?? read_templates();
    $isList = array_is_list($programOrPrograms);

    $withTemplates = function (array $program) use ($templates): array {
        $program['templates'] = array_values(array_filter($templates, fn($t) => ($t['programId'] ?? null) === $program['id']));
        return $program;
    };

    return $isList ? array_map($withTemplates, $programOrPrograms) : $withTemplates($programOrPrograms);
}
