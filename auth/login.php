<?php
session_start();
require_once '../config/database.php';

class AuthSystem {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->connect();
    }
    
    public function login($employee_id, $password) {
        try {
            // Get user with their role information
            $query = "SELECT 
                        u.user_id, 
                        u.employee_id, 
                        u.first_name, 
                        u.last_name, 
                        u.email,
                        u.password_hash,
                        u.employment_status,
                        d.department_name,
                        p.position_title,
                        r.role_name,
                        r.role_code,
                        r.role_category,
                        r.hierarchy_level
                      FROM users u
                      LEFT JOIN departments d ON u.department_id = d.department_id
                      LEFT JOIN positions p ON u.position_id = p.position_id
                      LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = TRUE
                      LEFT JOIN roles r ON ur.role_id = r.role_id AND r.is_active = TRUE
                      WHERE u.employee_id = ? AND u.employment_status = 'Active'
                      ORDER BY r.hierarchy_level DESC
                      LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $employee_id);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                // For demo purposes, we'll check against simple password
                // In production, use proper password hashing
                $stored_hash = hash('sha256', $password);
                
                if ($user['password_hash'] === $stored_hash || $password === 'password123') {
                    // Set session variables
                    $_SESSION['user_id'] = $user['user_id'];
                    $_SESSION['employee_id'] = $user['employee_id'];
                    $_SESSION['full_name'] = $user['first_name'] . ' ' . $user['last_name'];
                    $_SESSION['email'] = $user['email'];
                    $_SESSION['department'] = $user['department_name'];
                    $_SESSION['position'] = $user['position_title'];
                    $_SESSION['role_name'] = $user['role_name'];
                    $_SESSION['role_code'] = $user['role_code'];
                    $_SESSION['role_category'] = $user['role_category'];
                    $_SESSION['hierarchy_level'] = $user['hierarchy_level'];
                    $_SESSION['logged_in'] = true;
                    
                    return ['success' => true, 'user' => $user];
                } else {
                    return ['success' => false, 'message' => 'Invalid password'];
                }
            } else {
                return ['success' => false, 'message' => 'User not found or inactive'];
            }
            
        } catch(PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    public function logout() {
        session_destroy();
        return true;
    }
    
    public function isLoggedIn() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }
    
    public function hasPermission($required_level = 0) {
        if (!$this->isLoggedIn()) return false;
        return $_SESSION['hierarchy_level'] >= $required_level;
    }
    
    public function getUserRole() {
        return $_SESSION['role_code'] ?? null;
    }
}

// Handle login form submission
if ($_POST['action'] ?? '' === 'login') {
    $auth = new AuthSystem();
    $result = $auth->login($_POST['employee_id'], $_POST['password']);
    
    if ($result['success']) {
        header('Location: ../dashboard/index.php');
        exit;
    } else {
        $error_message = $result['message'];
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Management System - Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .login-card {
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        .login-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px 15px 0 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <div class="login-card">
                    <div class="login-header p-4 text-center">
                        <i class="bi bi-shield-lock fs-1"></i>
                        <h3 class="mt-2">Risk Management System</h3>
                        <p class="mb-0">Secure Access Portal</p>
                    </div>
                    
                    <div class="p-4">
                        <?php if (isset($error_message)): ?>
                            <div class="alert alert-danger">
                                <i class="bi bi-exclamation-triangle"></i> <?php echo $error_message; ?>
                            </div>
                        <?php endif; ?>
                        
                        <form method="POST">
                            <input type="hidden" name="action" value="login">
                            
                            <div class="mb-3">
                                <label for="employee_id" class="form-label">Employee ID</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                                    <input type="text" class="form-control" id="employee_id" name="employee_id" required>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label for="password" class="form-label">Password</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                                    <input type="password" class="form-control" id="password" name="password" required>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100 mb-3">
                                <i class="bi bi-box-arrow-in-right"></i> Login
                            </button>
                        </form>
                        
                        <div class="text-center">
                            <small class="text-muted">
                                <strong>Demo Accounts:</strong><br>
                                CEO: CEO001 / password123<br>
                                Risk Admin: RISK001 / password123<br>
                                Risk Manager: RISK002 / password123
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
