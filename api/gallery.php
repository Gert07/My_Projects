<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/../data/gallery.json';

function readGallery($file) {
    if (!file_exists($file)) return ['categories' => [], 'pictures' => []];
    $data = json_decode(file_get_contents($file), true);
    return $data ?: ['categories' => [], 'pictures' => []];
}

function writeGallery($file, $data) {
    $dir = dirname($file);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];
$uri    = $_SERVER['REQUEST_URI'];

// /api/gallery/categories/{catId}  — specific category operations
preg_match('/\/api\/gallery\/categories\/([^\/?]+)/', $uri, $catM);
$catSlug = isset($catM[1]) ? urldecode($catM[1]) : null;

// /api/gallery/{numericId}  — specific picture operations
preg_match('/\/api\/gallery\/(\d+)/', $uri, $m);
$id = isset($m[1]) ? (int) $m[1] : null;

$isCategories = (bool) preg_match('/\/api\/gallery\/categories/', $uri);

if ($isCategories && $catSlug !== null) {

    // DELETE /api/gallery/categories/{catId}
    if ($method === 'DELETE') {
        $data = readGallery($dataFile);
        $data['categories'] = array_values(
            array_filter($data['categories'], fn($c) => $c['id'] !== $catSlug)
        );
        writeGallery($dataFile, $data);
        echo json_encode(['ok' => true]);

    // POST /api/gallery/categories/{catId}  — add a subcategory
    } elseif ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $sub  = trim($body['subcategory'] ?? '');
        if (!$sub) {
            http_response_code(400);
            echo json_encode(['error' => 'subcategory required']);
            exit;
        }
        $data  = readGallery($dataFile);
        $found = false;
        foreach ($data['categories'] as &$c) {
            if ($c['id'] === $catSlug) {
                if (!in_array($sub, $c['subcategories'])) {
                    $c['subcategories'][] = $sub;
                }
                $found  = true;
                $result = $c;
                break;
            }
        }
        unset($c);
        if (!$found) {
            http_response_code(404);
            echo json_encode(['error' => 'Category not found']);
            exit;
        }
        writeGallery($dataFile, $data);
        echo json_encode($result);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} elseif ($isCategories) {

    // GET /api/gallery/categories
    if ($method === 'GET') {
        echo json_encode(readGallery($dataFile)['categories']);

    // POST /api/gallery/categories  — create category
    } elseif ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $name = trim($body['name'] ?? '');
        if (!$name) {
            http_response_code(400);
            echo json_encode(['error' => 'name required']);
            exit;
        }
        $data  = readGallery($dataFile);
        $catId = strtolower(preg_replace('/\s+/', '-', $name));
        foreach ($data['categories'] as $c) {
            if ($c['id'] === $catId) {
                http_response_code(409);
                echo json_encode(['error' => 'Category already exists']);
                exit;
            }
        }
        $subcategories = (isset($body['subcategories']) && is_array($body['subcategories']))
            ? $body['subcategories'] : [];
        $cat = ['id' => $catId, 'name' => $name, 'subcategories' => $subcategories];
        $data['categories'][] = $cat;
        writeGallery($dataFile, $data);
        http_response_code(201);
        echo json_encode($cat);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} elseif ($id !== null) {

    // PUT /api/gallery/{id}  — update picture fields
    if ($method === 'PUT') {
        $body  = json_decode(file_get_contents('php://input'), true);
        $data  = readGallery($dataFile);
        $found = false;
        foreach ($data['pictures'] as &$p) {
            if ($p['id'] === $id) {
                if (array_key_exists('label',       $body)) $p['label']       = trim($body['label']);
                if (array_key_exists('alt',         $body)) $p['alt']         = trim($body['alt']);
                if (array_key_exists('category',    $body)) $p['category']    = trim($body['category']);
                if (array_key_exists('subcategory', $body)) $p['subcategory'] = trim($body['subcategory']);
                $found  = true;
                $result = $p;
                break;
            }
        }
        unset($p);
        if (!$found) {
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
            exit;
        }
        writeGallery($dataFile, $data);
        echo json_encode($result);

    // DELETE /api/gallery/{id}
    } elseif ($method === 'DELETE') {
        $data = readGallery($dataFile);
        $data['pictures'] = array_values(
            array_filter($data['pictures'], fn($p) => $p['id'] !== $id)
        );
        writeGallery($dataFile, $data);
        echo json_encode(['ok' => true]);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} else {

    // GET /api/gallery
    if ($method === 'GET') {
        $data = readGallery($dataFile);
        $pics = $data['pictures'];
        if (!empty($_GET['category']))    $pics = array_values(array_filter($pics, fn($p) => $p['category']    === $_GET['category']));
        if (!empty($_GET['subcategory'])) $pics = array_values(array_filter($pics, fn($p) => $p['subcategory'] === $_GET['subcategory']));
        echo json_encode(['categories' => $data['categories'], 'pictures' => $pics]);

    // POST /api/gallery  — add picture
    } elseif ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $url  = trim($body['url'] ?? '');
        if (!$url) {
            http_response_code(400);
            echo json_encode(['error' => 'url required']);
            exit;
        }
        $data    = readGallery($dataFile);
        $label   = trim($body['label'] ?? $body['alt'] ?? '');
        $alt     = trim($body['alt']   ?? $body['label'] ?? '');
        $picture = [
            'id'          => (int)(microtime(true) * 1000),
            'url'         => $url,
            'label'       => $label,
            'alt'         => $alt,
            'category'    => trim($body['category']    ?? 'other'),
            'subcategory' => trim($body['subcategory'] ?? '')
        ];
        $data['pictures'][] = $picture;
        writeGallery($dataFile, $data);
        http_response_code(201);
        echo json_encode($picture);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}
