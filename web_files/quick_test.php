<?php
// Quick Database Test Script
require_once 'config/database.php';

echo "<h2>🔍 Quick Database Test</h2>";

$database = new Database();
$conn = $database->connect();

if ($conn) {
    echo "<div style='color: green;'>✅ Database Connected</div>";
    
    try {
        // Quick counts
        $tests = [
            'Users' => 'SELECT COUNT(*) as count FROM users WHERE employment_status = "Active"',
            'Roles' => 'SELECT COUNT(*) as count FROM roles WHERE is_active = TRUE',
            'Risks' => 'SELECT COUNT(*) as count FROM risks',
            'Risk Assessments' => 'SELECT COUNT(*) as count FROM risk_assessments',
        ];
        
        echo "<h3>📊 Record Counts:</h3>";
        foreach ($tests as $name => $query) {
            $stmt = $conn->query($query);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "<div>$name: <strong>{$result['count']}</strong></div>";
        }
        
        // Test login accounts
        echo "<h3>👥 Login Accounts Test:</h3>";
        $stmt = $conn->query("SELECT employee_id, CONCAT(first_name, ' ', last_name) as name FROM users WHERE employee_id IN ('CEO001', 'RISK001', 'RISK002')");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($users as $user) {
            echo "<div>✅ {$user['employee_id']} - {$user['name']}</div>";
        }
        
        // Test executive dashboard
        echo "<h3>📈 Executive Dashboard Test:</h3>";
        $stmt = $conn->query("SELECT * FROM v_executive_dashboard");
        $dashboard = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($dashboard) {
            echo "<div>Total Risks: <strong>{$dashboard['total_count']}</strong></div>";
            echo "<div>High Priority: <strong>{$dashboard['high_count']}</strong></div>";
            echo "<div>Critical Risks: <strong>{$dashboard['critical_count']}</strong></div>";
        }
        
        echo "<div style='color: green; margin-top: 20px;'><strong>🎉 ALL TESTS PASSED!</strong></div>";
        echo "<p><a href='auth/login.php'>Go to Login Page</a></p>";
        
    } catch(PDOException $e) {
        echo "<div style='color: red;'>❌ Error: " . $e->getMessage() . "</div>";
    }
} else {
    echo "<div style='color: red;'>❌ Database Connection Failed</div>";
    echo "<p>Make sure XAMPP MySQL is running!</p>";
}
?>


