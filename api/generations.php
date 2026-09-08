<?php
// GET ?id=            -> public: one generation, mapped to the public share shape
//                        (404 always today — nothing writes to generations.json
//                        until the "generate" pipeline in api/generate.php exists)
// GET ?programId=     -> admin: generations for one program
// GET (no params)     -> admin: every generation, newest first

require_once __DIR__ . '/helpers.php';
send_cors_headers();

function to_public_generation(array $gen, array $programs): ?array {
    $program = null;
    foreach ($programs as $p) {
        if ($p['id'] === $gen['programId']) { $program = $p; break; }
    }
    if (!$program) return null;
    $text = str_ireplace(
        ['{{name}}', '{{ name }}', '{{programName}}', '{{ programName }}'],
        [$gen['participantName'], $gen['participantName'], $program['title'], $program['title']],
        $program['attendanceText'] ?? ''
    );
    return [
        'id' => $gen['id'],
        'participantName' => $gen['participantName'],
        'programName' => $program['title'],
        'programSlug' => $program['slug'],
        'attendanceText' => $text,
        'imageUrl' => $gen['imageUrl'] ?? '',
        'pdfUrl' => $gen['pdfUrl'] ?? '',
        'createdAt' => $gen['generatedAt'],
        'expiresAt' => $gen['expiresAt'] ?? null,
    ];
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['message' => 'Method not allowed.'], 405);
}

$generations = read_store(GENERATIONS_FILE, fn() => []);

if (isset($_GET['id'])) {
    foreach ($generations as $gen) {
        if ($gen['id'] === $_GET['id']) {
            $public = to_public_generation($gen, read_programs());
            if ($public) json_response($public);
            break;
        }
    }
    json_response(['message' => 'This attendance card does not exist.'], 404);
}

require_admin();

usort($generations, fn($a, $b) => strcmp($b['generatedAt'] ?? '', $a['generatedAt'] ?? ''));

if (isset($_GET['programId'])) {
    json_response(array_values(array_filter($generations, fn($g) => $g['programId'] === $_GET['programId'])));
}

json_response(array_values($generations));
