<?php
session_start();
require_once __DIR__ . '/../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: ../auth/login.php');
    exit;
}

$database = new Database();
$conn = $database->connect();

// Get dashboard data
$exec_query = "SELECT * FROM v_executive_dashboard";
$exec_stmt = $conn->query($exec_query);
$exec_data = $exec_stmt->fetch(PDO::FETCH_ASSOC);

// Get recent risks
$risk_query = "SELECT * FROM v_risk_overview ORDER BY priority DESC, next_review_date ASC LIMIT 5";
$risk_stmt = $conn->query($risk_query);
$recent_risks = $risk_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get recent indicators
$indicator_query = "SELECT 
    ri.indicator_name,
    riv.measurement_date,
    riv.measured_value,
    riv.status,
    r.risk_title
FROM risk_indicator_values riv
JOIN risk_indicators ri ON riv.indicator_id = ri.indicator_id
JOIN risks r ON ri.risk_id = r.risk_id
ORDER BY riv.measurement_date DESC
LIMIT 5";

$indicator_stmt = $conn->query($indicator_query);
$recent_indicators = $indicator_stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Management Dashboard</title>
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
        
        .navbar-nav .nav-link {
            color: #FFFFFF !important;
            margin: 0 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            transition: background-color 0.3s ease;
        }
        
        .navbar-nav .nav-link:hover {
            background-color: rgba(255,255,255,0.2);
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
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .metric-card {
            background: #FFFFFF;
            border: 2px solid #45a049;
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #45a049;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            color: #000000;
            font-weight: 500;
            font-size: 1rem;
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
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
        
        .status-warning {
            background-color: #ff9800;
            color: #FFFFFF;
        }
        
        .status-normal {
            background-color: #4caf50;
            color: #FFFFFF;
        }
        
        .logout-btn {
            background-color: #45a049;
            color: #FFFFFF;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s ease;
        }
        
        .logout-btn:hover {
            background-color: #3d8b40;
            color: #FFFFFF;
            text-decoration: none;
        }
        
        .indicator-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .indicator-item:last-child {
            border-bottom: none;
        }
        
        .indicator-info h6 {
            color: #000000;
            margin-bottom: 0.25rem;
            font-size: 0.9rem;
        }
        
        .indicator-info small {
            color: #666666;
            font-size: 0.8rem;
        }
        
        .indicator-value {
            text-align: right;
        }
        
        .indicator-value .value {
            font-weight: 600;
            color: #000000;
            font-size: 1rem;
        }
    </style>
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg">
        <div class="container-fluid">
            <span class="navbar-brand">Risk Management System</span>
            <div class="navbar-nav ms-auto">
                <span class="user-info me-3">
                    <i class="bi bi-person-circle"></i> 
                    Welcome, <?php echo htmlspecialchars($_SESSION['employee_id'] ?? 'User'); ?>
                </span>
                <a href="../auth/logout.php" class="logout-btn">Logout</a>
            </div>
        </div>
    </nav>

    <div class="main-container">
        <!-- Dashboard Header -->
        <div class="dashboard-header">
            <h1>Executive Dashboard</h1>
            <p>Risk Management Overview & Key Performance Indicators</p>
        </div>

        <!-- Key Metrics -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value"><?php echo $exec_data['total_count'] ?? '0'; ?></div>
                <div class="metric-label">Total Risks</div>
            </div>
            <div class="metric-card">
                <div class="metric-value"><?php echo $exec_data['high_count'] ?? '0'; ?></div>
                <div class="metric-label">High Priority</div>
            </div>
            <div class="metric-card">
                <div class="metric-value"><?php echo $exec_data['critical_count'] ?? '0'; ?></div>
                <div class="metric-label">Critical Risks</div>
            </div>
            <div class="metric-card">
                <div class="metric-value"><?php echo $exec_data['treated_count'] ?? '0'; ?></div>
                <div class="metric-label">Treated Risks</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content-grid">
            <!-- Recent Risks -->
            <div class="card">
                <div class="card-header">
                    <i class="bi bi-exclamation-triangle"></i> Recent Risks
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Risk Code</th>
                            <th>Title</th>
                            <th>Priority</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recent_risks as $risk): ?>
                        <tr>
                            <td><strong><?php echo htmlspecialchars($risk['risk_code']); ?></strong></td>
                            <td><?php echo htmlspecialchars($risk['risk_title']); ?></td>
                            <td>
                                <span class="priority-badge priority-<?php echo strtolower($risk['priority']); ?>">
                                    <?php echo htmlspecialchars($risk['priority']); ?>
                                </span>
                            </td>
                            <td><?php echo htmlspecialchars($risk['status']); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Recent Indicators -->
            <div class="card">
                <div class="card-header">
                    <i class="bi bi-graph-up"></i> Recent Indicators
                </div>
                <?php foreach ($recent_indicators as $indicator): ?>
                <div class="indicator-item">
                    <div class="indicator-info">
                        <h6><?php echo htmlspecialchars($indicator['indicator_name']); ?></h6>
                        <small><?php echo htmlspecialchars($indicator['risk_title']); ?></small>
                    </div>
                    <div class="indicator-value">
                        <div class="value"><?php echo htmlspecialchars($indicator['measured_value']); ?></div>
                        <span class="status-badge status-<?php echo strtolower($indicator['status']); ?>">
                            <?php echo htmlspecialchars($indicator['status']); ?>
                        </span>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</body>
</html>
