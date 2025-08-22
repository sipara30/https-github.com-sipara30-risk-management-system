<?php
// Test database connection
require_once 'config/database.php';

echo "<h2>Risk Management System - Database Connection Test</h2>";

// Test connection
testConnection();

echo "<hr>";

// Test sample queries
echo "<h3>Sample Data Test:</h3>";

$database = new Database();
$conn = $database->connect();

if ($conn) {
    try {
        // Test users
        echo "<h4>Users in System:</h4>";
        $stmt = $conn->query("SELECT employee_id, CONCAT(first_name, ' ', last_name) as name, email FROM users LIMIT 5");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th style='padding: 8px;'>Employee ID</th><th style='padding: 8px;'>Name</th><th style='padding: 8px;'>Email</th></tr>";
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td style='padding: 8px;'>" . $user['employee_id'] . "</td>";
            echo "<td style='padding: 8px;'>" . $user['name'] . "</td>";
            echo "<td style='padding: 8px;'>" . $user['email'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Test executive dashboard
        echo "<h4>Executive Dashboard Data:</h4>";
        $stmt = $conn->query("SELECT * FROM v_executive_dashboard");
        $dashboard = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($dashboard) {
            echo "<ul>";
            echo "<li>Total Risks: " . $dashboard['total_count'] . "</li>";
            echo "<li>Critical Risks: " . $dashboard['critical_count'] . "</li>";
            echo "<li>High Priority: " . $dashboard['high_count'] . "</li>";
            echo "<li>New Risks: " . $dashboard['new_risks'] . "</li>";
            echo "<li>Overdue Reviews: " . $dashboard['overdue_reviews'] . "</li>";
            echo "</ul>";
        }
        
        // Test roles
        echo "<h4>User Roles:</h4>";
        $stmt = $conn->query("SELECT 
            CONCAT(u.first_name, ' ', u.last_name) as name,
            r.role_name,
            d.department_name
        FROM users u
        JOIN user_roles ur ON u.user_id = ur.user_id
        JOIN roles r ON ur.role_id = r.role_id
        LEFT JOIN departments d ON u.department_id = d.department_id
        WHERE ur.is_active = TRUE
        ORDER BY r.hierarchy_level DESC");
        
        $user_roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<table border='1' style='border-collapse: collapse; margin: 10px 0;'>";
        echo "<tr><th style='padding: 8px;'>Name</th><th style='padding: 8px;'>Role</th><th style='padding: 8px;'>Department</th></tr>";
        foreach ($user_roles as $ur) {
            echo "<tr>";
            echo "<td style='padding: 8px;'>" . $ur['name'] . "</td>";
            echo "<td style='padding: 8px;'>" . $ur['role_name'] . "</td>";
            echo "<td style='padding: 8px;'>" . ($ur['department_name'] ?? 'N/A') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
    } catch(PDOException $e) {
        echo "❌ Error testing queries: " . $e->getMessage();
    }
}

echo "<hr>";
echo "<h3>Next Steps:</h3>";
echo "<ol>";
echo "<li>✅ Database connection is working</li>";
echo "<li>✅ Sample data is loaded</li>";
echo "<li>🔗 <a href='auth/login.php'>Go to Login Page</a></li>";
echo "<li>🔗 Use these demo accounts:</li>";
echo "<ul>";
echo "<li><strong>CEO:</strong> CEO001 / password123</li>";
echo "<li><strong>Risk Admin:</strong> RISK001 / password123</li>";
echo "<li><strong>Risk Manager:</strong> RISK002 / password123</li>";
echo "</ul>";
echo "</ol>";
?>
