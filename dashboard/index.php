<?php
session_start();
require_once '../config/database.php';
require_once '../auth/login.php';

$auth = new AuthSystem();

// Check if user is logged in
if (!$auth->isLoggedIn()) {
    header('Location: ../auth/login.php');
    exit;
}

// Get dashboard data based on user role
$database = new Database();
$conn = $database->connect();

// Get executive dashboard data
$exec_query = "SELECT * FROM v_executive_dashboard";
$exec_stmt = $conn->query($exec_query);
$exec_data = $exec_stmt->fetch(PDO::FETCH_ASSOC);

// Get user's risks based on role
$user_id = $_SESSION['user_id'];
$role_code = $_SESSION['role_code'];

if ($role_code === 'CEO' || $role_code === 'RISK_ADMIN') {
    // CEO and Risk Admin see all risks
    $risk_query = "SELECT * FROM v_risk_overview ORDER BY priority DESC, next_review_date ASC LIMIT 10";
} else {
    // Other users see only their assigned risks
    $risk_query = "SELECT * FROM v_risk_overview 
                   WHERE risk_owner_name LIKE ? OR system_user_name LIKE ?
                   ORDER BY priority DESC, next_review_date ASC LIMIT 10";
}

$risk_stmt = $conn->prepare($risk_query);

if ($role_code === 'CEO' || $role_code === 'RISK_ADMIN') {
    $risk_stmt->execute();
} else {
    $user_name = $_SESSION['full_name'];
    $risk_stmt->execute(["%$user_name%", "%$user_name%"]);
}

$user_risks = $risk_stmt->fetchAll(PDO::FETCH_ASSOC);

// Get recent risk indicators
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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        .sidebar {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .nav-link {
            color: rgba(255,255,255,0.8) !important;
            border-radius: 8px;
            margin: 2px 0;
        }
        .nav-link:hover, .nav-link.active {
            background: rgba(255,255,255,0.2);
            color: white !important;
        }
        .card {
            border: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 10px;
        }
        .metric-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .status-badge {
            font-size: 0.8em;
        }
    </style>
</head>
<body class="bg-light">
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav class="col-md-3 col-lg-2 d-md-block sidebar collapse">
                <div class="position-sticky pt-3">
                    <div class="text-center text-white mb-4">
                        <i class="bi bi-shield-check fs-1"></i>
                        <h5>Risk Management</h5>
                        <small><?php echo $_SESSION['role_name']; ?></small>
                    </div>
                    
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="#dashboard">
                                <i class="bi bi-speedometer2"></i> Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="risks.php">
                                <i class="bi bi-exclamation-triangle"></i> Risks
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="assessments.php">
                                <i class="bi bi-clipboard-data"></i> Assessments
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="treatments.php">
                                <i class="bi bi-tools"></i> Treatments
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="indicators.php">
                                <i class="bi bi-graph-up"></i> Indicators
                            </a>
                        </li>
                        <?php if ($_SESSION['role_code'] === 'CEO' || $_SESSION['role_code'] === 'RISK_ADMIN'): ?>
                        <li class="nav-item">
                            <a class="nav-link" href="reports.php">
                                <i class="bi bi-file-earmark-text"></i> Reports
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="users.php">
                                <i class="bi bi-people"></i> Users
                            </a>
                        </li>
                        <?php endif; ?>
                    </ul>
                    
                    <hr class="text-white">
                    <div class="dropdown">
                        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
                            <i class="bi bi-person-circle me-2"></i>
                            <strong><?php echo $_SESSION['full_name']; ?></strong>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item" href="profile.php"><i class="bi bi-person"></i> Profile</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="../auth/logout.php"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
            
            <!-- Main content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">
                        <i class="bi bi-speedometer2"></i> Dashboard
                        <?php if ($_SESSION['role_code'] === 'CEO'): ?>
                            <span class="badge bg-warning">Executive View</span>
                        <?php endif; ?>
                    </h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-download"></i> Export
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Executive Metrics -->
                <?php if ($_SESSION['role_code'] === 'CEO' || $_SESSION['role_code'] === 'RISK_ADMIN'): ?>
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card metric-card">
                            <div class="card-body text-center">
                                <i class="bi bi-exclamation-triangle fs-1"></i>
                                <h3><?php echo $exec_data['total_count']; ?></h3>
                                <p class="mb-0">Total Risks</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-danger text-white">
                            <div class="card-body text-center">
                                <i class="bi bi-exclamation-circle fs-1"></i>
                                <h3><?php echo $exec_data['critical_count']; ?></h3>
                                <p class="mb-0">Critical Risks</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body text-center">
                                <i class="bi bi-exclamation-triangle fs-1"></i>
                                <h3><?php echo $exec_data['high_count']; ?></h3>
                                <p class="mb-0">High Priority</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card bg-info text-white">
                            <div class="card-body text-center">
                                <i class="bi bi-clock fs-1"></i>
                                <h3><?php echo $exec_data['overdue_reviews']; ?></h3>
                                <p class="mb-0">Overdue Reviews</p>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <div class="row">
                    <!-- Recent Risks -->
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-list-ul"></i> 
                                    <?php echo ($_SESSION['role_code'] === 'CEO' || $_SESSION['role_code'] === 'RISK_ADMIN') ? 'Recent Risks' : 'My Assigned Risks'; ?>
                                </h5>
                            </div>
                            <div class="card-body">
                                <?php if (empty($user_risks)): ?>
                                    <div class="text-center text-muted py-4">
                                        <i class="bi bi-inbox fs-1"></i>
                                        <p>No risks assigned to you</p>
                                    </div>
                                <?php else: ?>
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Risk Code</th>
                                                    <th>Title</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Owner</th>
                                                    <th>Next Review</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($user_risks as $risk): ?>
                                                <tr>
                                                    <td><strong><?php echo $risk['risk_code']; ?></strong></td>
                                                    <td><?php echo htmlspecialchars($risk['risk_title']); ?></td>
                                                    <td>
                                                        <?php
                                                        $priority_class = [
                                                            'Critical' => 'danger',
                                                            'High' => 'warning',
                                                            'Medium' => 'info',
                                                            'Low' => 'secondary'
                                                        ];
                                                        ?>
                                                        <span class="badge bg-<?php echo $priority_class[$risk['priority']] ?? 'secondary'; ?>">
                                                            <?php echo $risk['priority']; ?>
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span class="badge bg-primary status-badge">
                                                            <?php echo $risk['status']; ?>
                                                        </span>
                                                    </td>
                                                    <td><?php echo $risk['risk_owner_name'] ?? $risk['system_user_name'] ?? 'Unassigned'; ?></td>
                                                    <td>
                                                        <?php 
                                                        $review_date = $risk['next_review_date'];
                                                        $is_overdue = $review_date && strtotime($review_date) < time();
                                                        ?>
                                                        <span class="<?php echo $is_overdue ? 'text-danger fw-bold' : ''; ?>">
                                                            <?php echo $review_date ? date('M j, Y', strtotime($review_date)) : 'Not set'; ?>
                                                            <?php if ($is_overdue): ?>
                                                                <i class="bi bi-exclamation-circle"></i>
                                                            <?php endif; ?>
                                                        </span>
                                                    </td>
                                                </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Indicators -->
                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-graph-up"></i> Recent Indicators
                                </h5>
                            </div>
                            <div class="card-body">
                                <?php if (empty($recent_indicators)): ?>
                                    <div class="text-center text-muted py-4">
                                        <i class="bi bi-graph-up fs-3"></i>
                                        <p class="small">No recent measurements</p>
                                    </div>
                                <?php else: ?>
                                    <?php foreach ($recent_indicators as $indicator): ?>
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <div class="fw-bold small"><?php echo htmlspecialchars($indicator['indicator_name']); ?></div>
                                            <div class="text-muted small"><?php echo htmlspecialchars($indicator['risk_title']); ?></div>
                                            <div class="text-muted small"><?php echo date('M j', strtotime($indicator['measurement_date'])); ?></div>
                                        </div>
                                        <div class="text-end">
                                            <div class="fw-bold"><?php echo $indicator['measured_value']; ?></div>
                                            <span class="badge bg-<?php 
                                                echo $indicator['status'] === 'Normal' ? 'success' : 
                                                    ($indicator['status'] === 'Warning' ? 'warning' : 'danger'); 
                                            ?> status-badge">
                                                <?php echo $indicator['status']; ?>
                                            </span>
                                        </div>
                                    </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
