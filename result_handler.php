<?php
$db = new SQLite3('location_data.db');

// 获取客户端 IP
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

// 获取客户端 User-Agent
function getUserAgent() {
    $headers = getallheaders();
    return $headers['User-Agent'] ?? 'Unknown';
}

// 检查 POST 数据是否为空
if (empty($_POST)) {
    echo "No data received.";
    exit;
}

// 准备数据
$columns = [];
$values = [];

// 添加客户端 IP 和 Headers
$_POST['IP'] = getClientIP();
$_POST['User_Agent'] = getUserAgent(); // 修改为合法的字段名

// 遍历 POST 数据生成字段
foreach ($_POST as $key => $value) {
    $safeKey = preg_replace('/[^a-zA-Z0-9_]/', '_', $key); // 字段名处理
    $columns[] = "`" . SQLite3::escapeString($safeKey) . "` TEXT";
    $values[$safeKey] = SQLite3::escapeString($value); // 确保字段名与数据一致
}

// 动态创建表（只创建一次）
$tableDefinition = implode(", ", $columns);
$db->exec("CREATE TABLE IF NOT EXISTS data_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    $tableDefinition
)");

// 插入数据
$fields = array_keys($values);
$fieldNames = "`" . implode("`, `", $fields) . "`";
$fieldPlaceholders = ":" . implode(", :", $fields);

$stmt = $db->prepare("INSERT INTO data_log (created_at, $fieldNames) VALUES (datetime('now','localtime'), $fieldPlaceholders)");

if (!$stmt) {
    echo "Error preparing statement: " . $db->lastErrorMsg();
    exit;
}

foreach ($values as $key => $value) {
    $stmt->bindValue(":$key", $value, SQLITE3_TEXT);
}

$result = $stmt->execute();

echo $result ? "Data inserted successfully." : "Error inserting data: " . $db->lastErrorMsg();
?>
