<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Please submit the form from the website.');
}
if (($_SERVER['HTTP_X_SUNSHINE_FORM'] ?? '') !== '1') {
    respond(403, false, 'Please submit the form from the website.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) {
    respond(413, false, 'Your request is too large. Please shorten your message.');
}

function field(string $name, int $limit): string
{
    $value = $_POST[$name] ?? '';
    if (!is_string($value) || strlen($value) > $limit * 4 || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
        respond(422, false, 'Please check the form fields and try again.');
    }
    if (!preg_match('//u', $value) || preg_match_all('/[\s\S]/u', $value) > $limit) {
        respond(422, false, 'Please check the form fields and try again.');
    }
    return trim($value);
}

$fields = [
    'Parent / guardian' => field('parent-name', 150),
    'Email' => field('email', 254),
    'Phone' => field('phone', 40),
    'Child’s age' => field('child-age', 80),
    'Best time to call' => field('best-time', 120),
    'Desired start date' => field('start-date', 120),
    'Questions / notes' => field('notes', 2000),
];
$email = $fields['Email'];
if ($fields['Parent / guardian'] === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    respond(422, false, 'Please enter your name and a valid email address.');
}
$inquiry = field('inquiry', 20);
if (!in_array($inquiry, ['tour', 'enrollment'], true)) {
    respond(422, false, 'Please submit the form from the website.');
}
if (field('website', 200) !== '') {
    respond(422, false, 'Please submit the form from the website.');
}

// Cloudways keeps this configuration outside public_html. No SMTP credentials enter the browser.
$private = dirname(__DIR__) . '/private_html';
$configFile = $private . '/sunshine-mail.php';
if (!is_file($configFile)) {
    respond(503, false, 'Online requests are temporarily unavailable. Please email erika.byrd3@gmail.com or call 919.317.1500.');
}
$config = require $configFile;
$from = is_array($config) ? ($config['from_email'] ?? '') : '';
$to = is_array($config) ? ($config['to_email'] ?? '') : '';
if (empty($config['enabled']) || !is_string($from) || !is_string($to) ||
    !filter_var($from, FILTER_VALIDATE_EMAIL) || !filter_var($to, FILTER_VALIDATE_EMAIL) ||
    preg_match('/[\r\n]/', $from . $to)) {
    respond(503, false, 'Online requests are temporarily unavailable. Please email erika.byrd3@gmail.com or call 919.317.1500.');
}
$allowedHosts = $config['allowed_hosts'] ?? [];
$host = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($host, $allowedHosts, true) ||
    ($origin !== '' && (parse_url($origin, PHP_URL_SCHEME) !== 'https' || strtolower((string) parse_url($origin, PHP_URL_HOST)) !== $host))) {
    respond(403, false, 'Please submit the form from the website.');
}

// Bound abuse per IP and across the site; store only counters, never inquiry content.
$limitDir = $private . '/sunshine-form-limits';
if (!is_dir($limitDir) && !@mkdir($limitDir, 0700, true) && !is_dir($limitDir)) {
    respond(503, false, 'We couldn’t send your request. Please contact us directly.');
}
$counterFile = $limitDir . '/counters.json';
$counter = @fopen($counterFile, 'c+');
if (!$counter || !flock($counter, LOCK_EX)) {
    if ($counter) fclose($counter);
    respond(503, false, 'We couldn’t send your request. Please contact us directly.');
}
@chmod($counterFile, 0600);
$counters = json_decode(stream_get_contents($counter), true);
$counters = is_array($counters) ? $counters : [];
$now = time();
foreach ($counters as $key => $entry) {
    if (!is_array($entry) || ($entry['until'] ?? 0) <= $now) unset($counters[$key]);
}
// REMOTE_ADDR cannot be chosen by a submitted form or a forwarded-IP header.
$ipKey = hash('sha256', __DIR__ . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
foreach ([$ipKey => 5, 'global' => 100] as $key => $maximum) {
    if (($counters[$key]['count'] ?? 0) >= $maximum) {
        flock($counter, LOCK_UN);
        fclose($counter);
        header('Retry-After: 3600');
        respond(429, false, 'Too many requests. Please contact us directly or try again later.');
    }
}
foreach ([$ipKey, 'global'] as $key) {
    if (!isset($counters[$key])) $counters[$key] = ['count' => 0, 'until' => $now + 3600];
    $counters[$key]['count']++;
}
rewind($counter);
$encoded = json_encode($counters);
if (!ftruncate($counter, 0) || fwrite($counter, $encoded) !== strlen($encoded) || !fflush($counter)) {
    flock($counter, LOCK_UN);
    fclose($counter);
    respond(503, false, 'We couldn’t send your request. Please contact us directly.');
}
flock($counter, LOCK_UN);
fclose($counter);

$subject = 'Sunshine Smiles - ' . ($inquiry === 'enrollment' ? 'Enrollment inquiry' : 'Tour request');
$lines = [$subject, ''];
foreach ($fields as $label => $value) {
    if ($value !== '') $lines[] = $label . ': ' . $value;
}
$body = implode("\r\n", $lines);
$headers = [
    'From: Sunshine Smiles Academy <' . $from . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];
// The server's PHP mail transport must be bound to Cloudways Elastic Email before enabling.
if (!function_exists('mail') || !@mail($to, $subject, $body, implode("\r\n", $headers))) {
    error_log('Sunshine Smiles inquiry: mail transport failed.');
    respond(502, false, 'We couldn’t send your request. Please try again or contact us directly.');
}
respond(200, true, 'Your request has been submitted.');
