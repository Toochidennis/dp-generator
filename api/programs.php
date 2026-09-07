<?php
// GET   (no params)      -> admin session: every program; else: active programs only
// GET   ?id=             -> admin-only, one program by id
// GET   ?slug=           -> public, one program by slug (404 if missing/archived)
// POST                   -> admin, create a program
// PATCH ?id=             -> admin, update a program (incl. status/defaultTemplateId)
//
// `templates` on the returned program is joined in from templates.json (see
// helpers.php:attach_templates) — templates are stored independently of
// programs so a template can exist before any program does.

require_once __DIR__ . '/helpers.php';
send_cors_headers();

function find_program_index(array $programs, string $id): ?int {
    foreach ($programs as $i => $p) {
        if (($p['id'] ?? '') === $id) return $i;
    }
    return null;
}

function public_view(array $program): array {
    // Program has no admin-only secrets, but keep this seam in case that changes.
    return $program;
}

$method = $_SERVER['REQUEST_METHOD'];
$programs = read_programs();

if ($method === 'GET') {
    if (isset($_GET['slug'])) {
        $slug = (string) $_GET['slug'];
        foreach ($programs as $p) {
            if (($p['slug'] ?? '') === $slug) {
                if (($p['status'] ?? '') === 'archived') {
                    json_response(['message' => 'This program link is no longer active.'], 404);
                }
                json_response(public_view(attach_templates($p)));
            }
        }
        json_response(['message' => 'This program link could not be found.'], 404);
    }

    if (isset($_GET['id'])) {
        require_admin();
        $idx = find_program_index($programs, (string) $_GET['id']);
        if ($idx === null) json_response(['message' => 'Program not found.'], 404);
        json_response(attach_templates($programs[$idx]));
    }

    if (is_admin()) {
        json_response(attach_templates(array_values($programs)));
    }
    json_response(attach_templates(array_values(array_filter($programs, fn($p) => ($p['status'] ?? '') === 'active'))));
}

if ($method === 'POST') {
    require_admin();
    require_csrf();
    $body = json_body();

    $title = clean_text($body['title'] ?? '');
    $slugInput = slugify(clean_text($body['slug'] ?? $title));
    if ($title === '' || $slugInput === '') {
        json_response(['message' => 'Title and slug are required.'], 422);
    }

    $program = [
        'id' => new_id('prog'),
        'title' => $title,
        'slug' => unique_slug($slugInput, $programs),
        'description' => clean_text($body['description'] ?? ''),
        'startDate' => $body['startDate'] ?? null,
        'endDate' => $body['endDate'] ?? null,
        'bannerUrl' => save_data_url_image($body['bannerUrl'] ?? null, 'banners'),
        'status' => in_array($body['status'] ?? '', ['active', 'draft', 'archived'], true) ? $body['status'] : 'draft',
        'attendanceText' => clean_text($body['attendanceText'] ?? '{{name}} is attending {{programName}}'),
        'generationCount' => 0,
        'createdAt' => now_iso(),
    ];

    $programs[] = $program;
    write_store(PROGRAMS_FILE, $programs);
    json_response(attach_templates($program), 201);
}

if ($method === 'PATCH') {
    require_admin();
    require_csrf();
    if (!isset($_GET['id'])) json_response(['message' => 'Missing id.'], 400);

    $idx = find_program_index($programs, (string) $_GET['id']);
    if ($idx === null) json_response(['message' => 'Program not found.'], 404);

    $body = json_body();
    $program = $programs[$idx];

    foreach (['title', 'description', 'attendanceText'] as $field) {
        if (array_key_exists($field, $body)) $program[$field] = clean_text($body[$field]);
    }
    foreach (['startDate', 'endDate'] as $field) {
        if (array_key_exists($field, $body)) $program[$field] = $body[$field];
    }
    if (array_key_exists('slug', $body) && $body['slug'] !== '') {
        $program['slug'] = unique_slug(slugify($body['slug']), $programs, $program['id']);
    }
    if (array_key_exists('status', $body) && in_array($body['status'], ['active', 'draft', 'archived'], true)) {
        $program['status'] = $body['status'];
    }
    if (array_key_exists('bannerUrl', $body)) {
        $program['bannerUrl'] = save_data_url_image($body['bannerUrl'], 'banners');
    }

    $programs[$idx] = $program;
    write_store(PROGRAMS_FILE, $programs);

    if (!empty($body['defaultTemplateId'])) {
        $templates = read_templates();
        foreach ($templates as &$t) {
            if (($t['programId'] ?? null) === $program['id']) {
                $t['isDefault'] = ($t['id'] === $body['defaultTemplateId']);
            }
        }
        unset($t);
        write_store(TEMPLATES_FILE, $templates);
    }

    json_response(attach_templates($program));
}

json_response(['message' => 'Method not allowed.'], 405);
