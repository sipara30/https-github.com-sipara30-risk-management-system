<?php
// Database configuration for Risk Management System
// Make sure XAMPP MySQL is running

class Database {
    private $host = "localhost";
    private $db_name = "risk_management";
    private $username = "root";
    private $password = ""; // Default XAMPP password is empty
    private $connection;

    public function connect() {
        $this->connection = null;
        
        try {
            $this->connection = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connection->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->connection;
    }
}

// Test connection function
function testConnection() {
    $database = new Database();
    $conn = $database->connect();
    
    if ($conn) {
        echo "✅ Database connection successful!<br>";
        
        // Test query
        try {
            $stmt = $conn->query("SELECT COUNT(*) as user_count FROM users");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "✅ Found " . $result['user_count'] . " users in database<br>";
            
            $stmt = $conn->query("SELECT COUNT(*) as risk_count FROM risks");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "✅ Found " . $result['risk_count'] . " risks in database<br>";
            
            return true;
        } catch(PDOException $e) {
            echo "❌ Query error: " . $e->getMessage();
            return false;
        }
    } else {
        echo "❌ Database connection failed!";
        return false;
    }
}

// Uncomment the line below to test connection
// testConnection();
?>
