<?php
$db = new SQLite3('location_data.db');

// 查询表中的所有数据
$results = $db->query("SELECT * FROM data_log ORDER BY created_at DESC");

// 构建返回数据
$data = [];
while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
    $data[] = $row; // 保留字段名称
}

// 返回 JSON 数据
header('Content-Type: application/json');
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
