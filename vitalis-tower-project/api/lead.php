<?php
// Vitalis Tower lead endpoint. PHP 7+ compatible, no Composer required.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

function clean_text($value, $max = 160) {
    $value = is_string($value) ? trim($value) : '';
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $max, 'UTF-8');
    }
    return substr($value, 0, $max);
}

// Honeypot: bots usually fill it, humans never see it.
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$name = clean_text(isset($_POST['nombre']) ? $_POST['nombre'] : '', 80);
$phone = clean_text(isset($_POST['telefono']) ? $_POST['telefono'] : '', 40);
$email = filter_var(clean_text(isset($_POST['correo']) ? $_POST['correo'] : '', 120), FILTER_VALIDATE_EMAIL);
$interest = clean_text(isset($_POST['interes']) ? $_POST['interes'] : '', 80);
$consent = isset($_POST['consent']) && $_POST['consent'] === '1';

if ($name === '' || $phone === '' || !$email || $interest === '' || !$consent) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Invalid fields']);
    exit;
}

$allowedInterests = ['Conocer el proyecto', 'Conocer disponibilidad', 'Saber cómo invertir'];
if (!in_array($interest, $allowedInterests, true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Invalid interest']);
    exit;
}

$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$ua = clean_text(isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '', 240);
$fields = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
$campaign = [];
foreach ($fields as $field) {
    $campaign[$field] = clean_text(isset($_POST[$field]) ? $_POST[$field] : '', 160);
}

$timestamp = date('c');
$storageDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage';
$csvPath = $storageDir . DIRECTORY_SEPARATOR . 'leads.csv';

// Save server-side when storage is writable. The landing still works if it isn't.
if (is_dir($storageDir) && is_writable($storageDir)) {
    $isNew = !file_exists($csvPath) || filesize($csvPath) === 0;
    $fp = @fopen($csvPath, 'a');
    if ($fp) {
        if (flock($fp, LOCK_EX)) {
            if ($isNew) {
                fputcsv($fp, array_merge(['timestamp','name','phone','email','interest','ip','user_agent'], $fields));
            }
            $row = [$timestamp,$name,$phone,$email,$interest,$ip,$ua];
            foreach ($fields as $field) $row[] = $campaign[$field];
            fputcsv($fp, $row);
            flock($fp, LOCK_UN);
        }
        fclose($fp);
    }
}

// Email notification. mail() availability depends on the hosting configuration.
$to = 'realestate.davar@gmail.com';
$subject = 'Nuevo lead - Vitalis Tower';
$body = "Nuevo interesado en Vitalis Tower\n\n";
$body .= "Nombre: {$name}\nTeléfono: {$phone}\nEmail: {$email}\nInterés: {$interest}\n";
$body .= "Fecha: {$timestamp}\nIP: {$ip}\n\nAtribución:\n";
foreach ($fields as $field) $body .= $field . ': ' . $campaign[$field] . "\n";
$headers = "From: Vitalis Tower Landing <no-reply@inversionesdavar.com>\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
@mail($to, $subject, $body, $headers);

echo json_encode(['ok' => true]);
