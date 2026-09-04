<?php
// All admin-only.
// GET   (no params)          -> every template, flattened across programs
// GET   ?programId=          -> templates for one program
// GET   ?id=                 -> one template
// POST                       -> create a template on a program
// PATCH ?programId=&id=      -> update a template (e.g. {isDefault:true}); returns the program's templates[]

require_once __DIR__ . '/helpers.php';
send_cors_headers();
require_admin();

function all_templates(array $programs): array {
    $out = [];
    foreach ($programs as $p) {
        foreach (($p['templates'] ?? []) as $t) $out[] = $t;
    }
    return $out;
}

$method = $_SERVER['REQUEST_METHOD'];
$programs = read_programs();

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        foreach (all_templates($programs) as $t) {
            if ($t['id'] === $_GET['id']) json_response($t);
        }
        json_response(['message' => 'Template not found.'], 404);
    }
    if (isset($_GET['programId'])) {
        foreach ($programs as $p) {
            if ($p['id'] === $_GET['programId']) json_response(array_values($p['templates'] ?? []));
        }
        json_response(['message' => 'Program not found.'], 404);
    }
    json_response(all_templates($programs));
}

if ($method === 'POST') {
    require_csrf();
    $body = json_body();
    $programId = (string) ($body['programId'] ?? '');
    $name = clean_text($body['name'] ?? '');
    if ($programId === '' || $name === '') {
        json_response(['message' => 'programId and name are required.'], 422);
    }

    $idx = null;
    foreach ($programs as $i => $p) {
        if ($p['id'] === $programId) { $idx = $i; break; }
    }
    if ($idx === null) json_response(['message' => 'Program not found.'], 404);

    $type = in_array($body['type'] ?? '', ['image', 'pdf'], true) ? $body['type'] : 'image';
    $previewUrl = save_data_url_image($body['previewUrl'] ?? null, 'templates');
    if (!$previewUrl) $previewUrl = placeholder_preview($name);

    $isFirst = empty($programs[$idx]['templates']);
    $template = [
        'id' => new_id('temp'),
        'programId' => $programId,
        'name' => $name,
        'previewUrl' => $previewUrl,
        'type' => $type,
        'status' => in_array($body['status'] ?? '', ['active', 'draft', 'archived'], true) ? $body['status'] : 'active',
        'isDefault' => !empty($body['isDefault']) || $isFirst,
    ];

    if ($template['isDefault']) {
        foreach ($programs[$idx]['templates'] as &$t) $t['isDefault'] = false;
        unset($t);
    }
    $programs[$idx]['templates'][] = $template;
    write_store(PROGRAMS_FILE, $programs);
    json_response($template, 201);
}

if ($method === 'PATCH') {
    require_csrf();
    $programId = (string) ($_GET['programId'] ?? '');
    $templateId = (string) ($_GET['id'] ?? ($_GET['templateId'] ?? ''));
    if ($templateId === '') json_response(['message' => 'Missing template id.'], 400);

    $body = json_body();
    $progIdx = null;
    $tmplIdx = null;
    foreach ($programs as $i => $p) {
        if ($programId !== '' && $p['id'] !== $programId) continue;
        foreach (($p['templates'] ?? []) as $j => $t) {
            if ($t['id'] === $templateId) { $progIdx = $i; $tmplIdx = $j; break 2; }
        }
    }
    if ($progIdx === null) json_response(['message' => 'Template not found.'], 404);

    foreach (['name', 'status'] as $field) {
        if (array_key_exists($field, $body)) $programs[$progIdx]['templates'][$tmplIdx][$field] = clean_text($body[$field]);
    }
    if (!empty($body['isDefault'])) {
        foreach ($programs[$progIdx]['templates'] as &$t) $t['isDefault'] = false;
        unset($t);
        $programs[$progIdx]['templates'][$tmplIdx]['isDefault'] = true;
    }

    write_store(PROGRAMS_FILE, $programs);
    json_response(array_values($programs[$progIdx]['templates']));
}

json_response(['message' => 'Method not allowed.'], 405);
