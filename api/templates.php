<?php
// All admin-only. Templates are stored independently of programs (a
// template's programId can be null), so uploading one never requires a
// program to exist first.
//
// GET   (no params)   -> every template
// GET   ?unassigned=1 -> templates with no program yet
// GET   ?programId=   -> templates for one program
// GET   ?id=          -> one template
// POST                -> create a template; programId optional (omit/null = unassigned)
// PATCH ?id=          -> {isDefault:true} marks default within its current program (returns that program's templates[])
//                        {programId:"..."|null} assigns/reassigns/unassigns (returns the updated template)
//                        {name, status} general field updates (returns the updated template)

require_once __DIR__ . '/helpers.php';
send_cors_headers();
require_admin();

function find_template_index(array $templates, string $id): ?int {
    foreach ($templates as $i => $t) {
        if (($t['id'] ?? '') === $id) return $i;
    }
    return null;
}

function program_exists(string $id): bool {
    foreach (read_programs() as $p) {
        if (($p['id'] ?? '') === $id) return true;
    }
    return false;
}

$method = $_SERVER['REQUEST_METHOD'];
$templates = read_templates();

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $idx = find_template_index($templates, (string) $_GET['id']);
        if ($idx === null) json_response(['message' => 'Template not found.'], 404);
        json_response($templates[$idx]);
    }
    if (isset($_GET['unassigned'])) {
        json_response(array_values(array_filter($templates, fn($t) => empty($t['programId']))));
    }
    if (isset($_GET['programId'])) {
        json_response(array_values(array_filter($templates, fn($t) => ($t['programId'] ?? null) === $_GET['programId'])));
    }
    json_response(array_values($templates));
}

if ($method === 'POST') {
    require_csrf();
    $body = json_body();
    $name = clean_text($body['name'] ?? '');
    if ($name === '') json_response(['message' => 'Template name is required.'], 422);

    $programId = !empty($body['programId']) ? (string) $body['programId'] : null;
    if ($programId !== null && !program_exists($programId)) {
        json_response(['message' => 'Program not found.'], 404);
    }

    $type = in_array($body['type'] ?? '', ['image', 'pdf'], true) ? $body['type'] : 'image';
    $previewUrl = save_data_url_image($body['previewUrl'] ?? null, 'templates');
    if (!$previewUrl) $previewUrl = placeholder_preview($name);

    $siblingCount = $programId
        ? count(array_filter($templates, fn($t) => ($t['programId'] ?? null) === $programId))
        : 0;
    $isDefault = $programId ? (!empty($body['isDefault']) || $siblingCount === 0) : false;

    $template = [
        'id' => new_id('temp'),
        'programId' => $programId,
        'name' => $name,
        'previewUrl' => $previewUrl,
        'type' => $type,
        'status' => in_array($body['status'] ?? '', ['active', 'draft', 'archived'], true) ? $body['status'] : 'active',
        'isDefault' => $isDefault,
    ];

    if ($isDefault && $programId) {
        foreach ($templates as &$t) {
            if (($t['programId'] ?? null) === $programId) $t['isDefault'] = false;
        }
        unset($t);
    }
    $templates[] = $template;
    write_store(TEMPLATES_FILE, $templates);
    json_response($template, 201);
}

if ($method === 'PATCH') {
    require_csrf();
    $id = (string) ($_GET['id'] ?? '');
    if ($id === '') json_response(['message' => 'Missing id.'], 400);

    $idx = find_template_index($templates, $id);
    if ($idx === null) json_response(['message' => 'Template not found.'], 404);

    $body = json_body();

    // Assign / reassign / unassign.
    if (array_key_exists('programId', $body)) {
        $programId = !empty($body['programId']) ? (string) $body['programId'] : null;
        if ($programId !== null && !program_exists($programId)) {
            json_response(['message' => 'Program not found.'], 404);
        }
        $templates[$idx]['programId'] = $programId;
        if ($programId) {
            $hasDefault = false;
            foreach ($templates as $t) {
                if ($t['id'] !== $id && ($t['programId'] ?? null) === $programId && !empty($t['isDefault'])) $hasDefault = true;
            }
            $templates[$idx]['isDefault'] = !$hasDefault;
        } else {
            $templates[$idx]['isDefault'] = false;
        }
        write_store(TEMPLATES_FILE, $templates);
        json_response($templates[$idx]);
    }

    // Mark as the default within its current program.
    if (!empty($body['isDefault'])) {
        $programId = $templates[$idx]['programId'] ?? null;
        if (!$programId) json_response(['message' => 'Attach this template to a program before making it the default.'], 422);
        foreach ($templates as &$t) {
            if (($t['programId'] ?? null) === $programId) $t['isDefault'] = ($t['id'] === $id);
        }
        unset($t);
        write_store(TEMPLATES_FILE, $templates);
        json_response(array_values(array_filter($templates, fn($t) => ($t['programId'] ?? null) === $programId)));
    }

    // General field updates.
    foreach (['name', 'status'] as $field) {
        if (array_key_exists($field, $body)) $templates[$idx][$field] = clean_text($body[$field]);
    }
    write_store(TEMPLATES_FILE, $templates);
    json_response($templates[$idx]);
}

json_response(['message' => 'Method not allowed.'], 405);
