<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/../data/todos.json';

function readTodos($file) {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?: [];
}

function writeTodos($file, $todos) {
    $dir = dirname($file);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($file, json_encode(array_values($todos), JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

// Extract optional /id from the URL
preg_match('/\/todos\/(\d+)/', $_SERVER['REQUEST_URI'], $m);
$id = isset($m[1]) ? (int)$m[1] : null;

switch ($method) {

    case 'GET':
        echo json_encode(readTodos($dataFile));
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true);
        $text = trim($body['text'] ?? '');
        if (!$text) {
            http_response_code(400);
            echo json_encode(['error' => 'Text required']);
            break;
        }
        $todos  = readTodos($dataFile);
        $todo   = ['id' => (int)(microtime(true) * 1000), 'text' => $text, 'done' => false];
        $todos[] = $todo;
        writeTodos($dataFile, $todos);
        http_response_code(201);
        echo json_encode($todo);
        break;

    case 'PUT':
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID required']); break; }
        $body  = json_decode(file_get_contents('php://input'), true);
        $todos = readTodos($dataFile);
        $found = false;
        foreach ($todos as &$t) {
            if ($t['id'] === $id) {
                $t     = array_merge($t, $body);
                $t['id'] = $id;
                $found = true;
                $result = $t;
                break;
            }
        }
        unset($t);
        if (!$found) { http_response_code(404); echo json_encode(['error' => 'Not found']); break; }
        writeTodos($dataFile, $todos);
        echo json_encode($result);
        break;

    case 'DELETE':
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID required']); break; }
        $todos = array_filter(readTodos($dataFile), fn($t) => $t['id'] !== $id);
        writeTodos($dataFile, $todos);
        echo json_encode(['ok' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
