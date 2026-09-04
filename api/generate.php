<?php
// Participant-facing card generation (photo + name composited onto a
// template) is a separate, unbuilt feature — see the project plan. This
// stub exists so the frontend gets a clear, honest error instead of a
// silent failure when USE_MOCKS=false.

require_once __DIR__ . '/helpers.php';
send_cors_headers();

json_response(['message' => 'Card generation is not implemented yet.'], 501);
