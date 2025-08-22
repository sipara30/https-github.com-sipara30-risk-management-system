<?php
session_start();

// Simple login logic
if ($_POST['action'] ?? '' === 'login') {
    $employee_id = $_POST['employee_id'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Demo login - accept any valid employee ID with password123
    if ($password === 'password123' && in_array($employee_id, ['CEO001', 'RISK001', 'RISK002'])) {
        $_SESSION['logged_in'] = true;
        $_SESSION['employee_id'] = $employee_id;
        
        // Redirect based on user role
        if ($employee_id === 'RISK001') {
            header('Location: dashboard/risk_admin_dashboard.php');
        } else {
            header('Location: dashboard/clean_dashboard.php');
        }
        exit;
    } else {
        $error_message = 'Invalid credentials. Use demo accounts below.';
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Management System - Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background-color: #FFFFFF;
            font-family: 'Arial', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .login-container {
            width: 100%;
            max-width: 400px;
            padding: 20px;
        }
        
        .login-card {
            background: #FFFFFF;
            border: 2px solid #45a049;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .login-header {
            background-color: #45a049;
            color: #FFFFFF;
            text-align: center;
            padding: 30px 20px;
        }
        
        .login-header h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .login-header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .login-body {
            padding: 30px 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            color: #000000;
            font-weight: 500;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #45a049;
            box-shadow: 0 0 0 3px rgba(69, 160, 73, 0.1);
        }
        
        .btn-login {
            width: 100%;
            background-color: #45a049;
            color: #FFFFFF;
            border: none;
            padding: 14px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .btn-login:hover {
            background-color: #3d8b40;
        }
        
        .demo-accounts {
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .demo-accounts h6 {
            color: #000000;
            margin-bottom: 12px;
            font-weight: 600;
            font-size: 14px;
        }
        
        .demo-accounts .account {
            color: #666666;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 4px;
        }
        
        .error-message {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h1>Risk Management System</h1>
                <p>Secure Access Portal</p>
            </div>
            
            <div class="login-body">
                <?php if (isset($error_message)): ?>
                    <div class="error-message">
                        <?php echo htmlspecialchars($error_message); ?>
                    </div>
                <?php endif; ?>
                
                <form method="POST">
                    <input type="hidden" name="action" value="login">
                    
                    <div class="form-group">
                        <label for="employee_id" class="form-label">Employee ID</label>
                        <input type="text" class="form-input" id="employee_id" name="employee_id" placeholder="Enter your Employee ID" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" class="form-input" id="password" name="password" placeholder="Enter your password" required>
                    </div>
                    
                    <button type="submit" class="btn-login">
                        Login
                    </button>
                </form>
                
                <div class="demo-accounts">
                    <h6>Demo Accounts</h6>
                    <div class="account"><strong>CEO:</strong> CEO001 / password123</div>
                    <div class="account"><strong>Risk Admin:</strong> RISK001 / password123</div>
                    <div class="account"><strong>Risk Manager:</strong> RISK002 / password123</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
