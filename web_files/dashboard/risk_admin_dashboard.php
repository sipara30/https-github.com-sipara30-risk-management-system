<?php
session_start();
require_once __DIR__ . '/../config/database.php';

// Check if user is logged in and is Risk Admin
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true || $_SESSION['employee_id'] !== 'RISK001') {
    header('Location: ../auth/login.php');
    exit;
}

$database = new Database();
$conn = $database->connect();

// Get risk management data
$risk_query = "SELECT * FROM v_risk_overview ORDER BY priority DESC, next_review_date ASC LIMIT 10";
$risk_stmt = $conn->query($risk_query);
$all_risks = $risk_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get risk categories
$category_query = "SELECT * FROM risk_categories ORDER BY category_name";
$category_stmt = $conn->query($category_query);
$categories = $category_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get departments
$dept_query = "SELECT * FROM departments ORDER BY department_name";
$dept_stmt = $conn->query($dept_query);
$departments = $dept_stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Admin Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background-color: #FFFFFF;
            font-family: 'Arial', sans-serif;
            color: #000000;
        }
        
        .navbar {
            background-color: #45a049;
            border-bottom: 3px solid #3d8b40;
            padding: 1rem 2rem;
        }
        
        .navbar-brand {
            color: #FFFFFF !important;
            font-weight: 600;
            font-size: 1.5rem;
        }
        
        .user-info {
            color: #FFFFFF;
            font-weight: 500;
        }
        
        .main-container {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .dashboard-header {
            background-color: #45a049;
            color: #FFFFFF;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .dashboard-header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .dashboard-header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .action-buttons {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        
        .btn-primary {
            background-color: #45a049;
            color: #FFFFFF;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary:hover {
            background-color: #3d8b40;
            color: #FFFFFF;
            text-decoration: none;
        }
        
        .btn-secondary {
            background-color: #6c757d;
            color: #FFFFFF;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-secondary:hover {
            background-color: #5a6268;
            color: #FFFFFF;
            text-decoration: none;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        
        .card {
            background: #FFFFFF;
            border: 2px solid #45a049;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .card-header {
            background-color: #45a049;
            color: #FFFFFF;
            margin: -1.5rem -1.5rem 1.5rem -1.5rem;
            padding: 1rem 1.5rem;
            border-radius: 10px 10px 0 0;
            font-weight: 600;
            font-size: 1.2rem;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th {
            background-color: #f8f9fa;
            color: #000000;
            padding: 0.75rem;
            text-align: left;
            border-bottom: 2px solid #45a049;
            font-weight: 600;
        }
        
        .table td {
            padding: 0.75rem;
            border-bottom: 1px solid #e0e0e0;
            color: #000000;
        }
        
        .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .priority-high {
            background-color: #ffeb3b;
            color: #000000;
        }
        
        .priority-medium {
            background-color: #2196f3;
            color: #FFFFFF;
        }
        
        .priority-low {
            background-color: #4caf50;
            color: #FFFFFF;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .status-active {
            background-color: #28a745;
            color: #FFFFFF;
        }
        
        .status-treated {
            background-color: #17a2b8;
            color: #FFFFFF;
        }
        
        .logout-btn {
            background-color: #dc3545;
            color: #FFFFFF;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }
        
        .logout-btn:hover {
            background-color: #c82333;
            color: #FFFFFF;
            text-decoration: none;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: #FFFFFF;
            border: 2px solid #45a049;
            border-radius: 8px;
            padding: 1rem;
            text-align: center;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #45a049;
        }
        
        .stat-label {
            color: #000000;
            font-weight: 500;
            margin-top: 0.5rem;
        }
    </style>
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
            <span class="navbar-brand">Risk Management System - Admin</span>
            <div class="navbar-nav ms-auto">
                <span class="user-info me-3">
                    <i class="bi bi-person-circle"></i> 
                    Risk Admin: <?php echo htmlspecialchars($_SESSION['employee_id']); ?>
                </span>
                <a href="../auth/logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
    </nav>

    <div class="main-container">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
            <h1>Risk Administration Dashboard</h1>
            <p>Manage Risks, Categories, and System Configuration</p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
            <a href="#" class="btn-primary">
                <i class="bi bi-plus-circle"></i> Register New Risk
            </a>
            <a href="#" class="btn-primary">
                <i class="bi bi-pencil-square"></i> Edit Risk
            </a>
            <a href="#" class="btn-primary">
                <i class="bi bi-folder-plus"></i> Add Risk Category
            </a>
            <a href="#" class="btn-secondary">
                <i class="bi bi-gear"></i> System Settings
            </a>
            <a href="#" class="btn-secondary">
                <i class="bi bi-file-earmark-text"></i> Generate Reports
            </a>
        </div>

        <!-- Statistics -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value"><?php echo count($all_risks); ?></div>
                <div class="stat-label">Total Risks</div>
            </div>
            <div class="stat-card">
                <div class="stat-value"><?php echo count($categories); ?></div>
                <div class="stat-label">Risk Categories</div>
            </div>
            <div class="stat-card">
                <div class="stat-value"><?php echo count($departments); ?></div>
                <div class="stat-label">Departments</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">5</div>
                <div class="stat-label">Active Users</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content-grid">
            <!-- All Risks Table -->
            <div class="card">
                <div class="card-header">
                    <i class="bi bi-exclamation-triangle"></i> All Registered Risks
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Risk Code</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Department</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($all_risks as $risk): ?>
                        <tr>
                            <td><strong><?php echo htmlspecialchars($risk['risk_code']); ?></strong></td>
                            <td><?php echo htmlspecialchars($risk['risk_title']); ?></td>
                            <td><?php echo htmlspecialchars($risk['category_name'] ?? 'N/A'); ?></td>
                            <td><?php echo htmlspecialchars($risk['department_name'] ?? 'N/A'); ?></td>
                            <td>
                                <span class="priority-badge priority-<?php echo strtolower($risk['priority']); ?>">
                                    <?php echo htmlspecialchars($risk['priority']); ?>
                                </span>
                            </td>
                            <td>
                                <span class="status-badge status-<?php echo strtolower($risk['status']); ?>">
                                    <?php echo htmlspecialchars($risk['status']); ?>
                                </span>
                            </td>
                            <td>
                                <a href="#" class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                    <i class="bi bi-pencil"></i> Edit
                                </a>
                                <a href="#" class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-left: 0.25rem;">
                                    <i class="bi bi-eye"></i> View
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>


