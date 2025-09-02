const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function insertTestRiskData() {
  console.log('🔄 Starting test risk data insertion...');

  try {
    // First, get the risk owner user
    const riskOwner = await prisma.users.findUnique({
      where: { email: 'riskowner@ecwc.com' }
    });

    if (!riskOwner) {
      console.error('❌ Risk owner user (riskowner@ecwc.com) not found');
      return;
    }

    console.log(`✅ Found risk owner: ${riskOwner.first_name} ${riskOwner.last_name} (ID: ${riskOwner.id})`);

    // Get some departments and categories for realistic data
    const departments = await prisma.departments.findMany();
    const categories = await prisma.risk_categories.findMany();

    console.log(`📊 Found ${departments.length} departments and ${categories.length} categories`);

    // Create comprehensive test risks with different statuses and completion levels
    const testRisks = [
      {
        risk_code: 'RISK-2024-001',
        risk_title: 'Server Infrastructure Vulnerability',
        risk_description: 'Critical security vulnerability discovered in main server infrastructure affecting customer data protection.',
        what_can_happen: 'Potential data breach, system downtime, regulatory penalties, and reputation damage.',
        risk_category_id: categories.find(c => c.category_name.includes('Security'))?.id || categories[0]?.id,
        department_id: departments.find(d => d.department_name.includes('IT'))?.id || departments[0]?.id,
        risk_owner_id: riskOwner.id,
        status: 'Mitigated',
        priority: 'High',
        date_reported: new Date('2024-01-15'),
        submitted_by: riskOwner.id - 1, // Simulate different submitter
        evaluated_by: riskOwner.id,
        date_evaluated: new Date('2024-01-18'),
        assessment_notes: 'Comprehensive security assessment completed. Vulnerability patched and additional monitoring implemented.',
        severity: 'High',
        category_update: 'Security',
        status_update: 'Mitigated',
        workflow_step: 6,
        workflow_status: {
          step1_completed: true,
          step2_completed: true,
          step3_completed: true,
          step4_completed: true,
          step5_completed: true,
          step6_completed: true,
          last_updated: '2024-01-20T10:00:00Z'
        },
        treatment_plan: 'Immediate patch deployment, enhanced firewall configuration, implement 24/7 monitoring, conduct security audit.',
        action_items: [
          {
            id: 1,
            action: 'Deploy security patches',
            responsible: 'IT Security Team',
            dueDate: '2024-01-20',
            priority: 'High',
            status: 'Completed'
          },
          {
            id: 2,
            action: 'Implement enhanced monitoring',
            responsible: 'Network Operations',
            dueDate: '2024-01-25',
            priority: 'High',
            status: 'Completed'
          }
        ],
        monitoring_kpis: {
          keyPerformanceIndicators: 'System uptime, Security incident count, Patch deployment time',
          riskOwnerName: `${riskOwner.first_name} ${riskOwner.last_name}`,
          riskOwnerTitle: 'IT Security Manager',
          riskOwnerDepartment: 'Information Technology',
          riskOwnerContact: riskOwner.email
        },
        review_frequency: 'Monthly',
        escalation_required: false,
        closure_date: new Date('2024-01-25'),
        closure_reason: 'Risk successfully mitigated through patch deployment and enhanced monitoring'
      },
      {
        risk_code: 'RISK-2024-002',
        risk_title: 'Supply Chain Disruption Risk',
        risk_description: 'Potential disruption in critical material supply chain due to geopolitical tensions and supplier concentration.',
        what_can_happen: 'Project delays, increased costs, inability to meet client commitments, and revenue loss.',
        risk_category_id: categories.find(c => c.category_name.includes('Operational'))?.id || categories[1]?.id,
        department_id: departments.find(d => d.department_name.includes('Operations'))?.id || departments[1]?.id,
        risk_owner_id: riskOwner.id,
        status: 'In Review',
        priority: 'High',
        date_reported: new Date('2024-02-01'),
        submitted_by: riskOwner.id - 2,
        evaluated_by: riskOwner.id,
        date_evaluated: new Date('2024-02-03'),
        assessment_notes: 'Supply chain analysis in progress. Alternative suppliers identified. Risk mitigation plan under development.',
        severity: 'High',
        category_update: 'Operational',
        status_update: 'In Review',
        workflow_step: 4,
        workflow_status: {
          step1_completed: true,
          step2_completed: true,
          step3_completed: true,
          step4_completed: true,
          step5_completed: false,
          step6_completed: false,
          last_updated: '2024-02-05T14:30:00Z'
        },
        treatment_plan: 'Diversify supplier base, establish strategic partnerships, implement supply chain monitoring system.',
        action_items: [
          {
            id: 1,
            action: 'Identify alternative suppliers',
            responsible: 'Procurement Team',
            dueDate: '2024-02-15',
            priority: 'High',
            status: 'In Progress'
          },
          {
            id: 2,
            action: 'Negotiate backup contracts',
            responsible: 'Supply Chain Manager',
            dueDate: '2024-02-28',
            priority: 'Medium',
            status: 'Pending'
          }
        ],
        monitoring_kpis: {
          keyPerformanceIndicators: 'Supplier diversity index, Lead time variance, Cost stability',
          riskOwnerName: `${riskOwner.first_name} ${riskOwner.last_name}`,
          riskOwnerTitle: 'Operations Director',
          riskOwnerDepartment: 'Operations',
          riskOwnerContact: riskOwner.email
        },
        review_frequency: 'Weekly',
        escalation_required: false
      },
      {
        risk_code: 'RISK-2024-003',
        risk_title: 'Regulatory Compliance Gap',
        risk_description: 'Potential non-compliance with new environmental regulations affecting construction operations.',
        what_can_happen: 'Regulatory penalties, project suspensions, legal action, and reputation damage.',
        risk_category_id: categories.find(c => c.category_name.includes('Compliance'))?.id || categories[2]?.id,
        department_id: departments.find(d => d.department_name.includes('Legal'))?.id || departments[2]?.id,
        risk_owner_id: riskOwner.id,
        status: 'Escalated',
        priority: 'Critical',
        date_reported: new Date('2024-01-20'),
        submitted_by: riskOwner.id - 3,
        evaluated_by: riskOwner.id,
        date_evaluated: new Date('2024-01-22'),
        assessment_notes: 'Critical compliance gap identified. Immediate executive attention required. Legal consultation in progress.',
        severity: 'Critical',
        category_update: 'Compliance',
        status_update: 'Escalated',
        workflow_step: 5,
        workflow_status: {
          step1_completed: true,
          step2_completed: true,
          step3_completed: true,
          step4_completed: true,
          step5_completed: true,
          step6_completed: false,
          last_updated: '2024-01-25T09:15:00Z'
        },
        treatment_plan: 'Engage legal counsel, conduct compliance audit, implement corrective measures, establish monitoring framework.',
        action_items: [
          {
            id: 1,
            action: 'Legal consultation',
            responsible: 'Legal Department',
            dueDate: '2024-01-30',
            priority: 'Critical',
            status: 'Completed'
          },
          {
            id: 2,
            action: 'Compliance audit',
            responsible: 'Compliance Officer',
            dueDate: '2024-02-10',
            priority: 'High',
            status: 'In Progress'
          }
        ],
        monitoring_kpis: {
          keyPerformanceIndicators: 'Compliance score, Audit findings, Regulatory communications',
          riskOwnerName: `${riskOwner.first_name} ${riskOwner.last_name}`,
          riskOwnerTitle: 'Compliance Manager',
          riskOwnerDepartment: 'Legal & Compliance',
          riskOwnerContact: riskOwner.email
        },
        review_frequency: 'Weekly',
        escalation_required: true,
        escalation_reason: 'Critical regulatory compliance issue requiring executive decision and immediate action'
      },
      {
        risk_code: 'RISK-2024-004',
        risk_title: 'Key Personnel Departure Risk',
        risk_description: 'Risk of critical project knowledge loss due to potential departure of senior project manager.',
        what_can_happen: 'Project delays, knowledge gaps, team disruption, and client relationship impact.',
        risk_category_id: categories.find(c => c.category_name.includes('Strategic'))?.id || categories[3]?.id,
        department_id: departments.find(d => d.department_name.includes('HR'))?.id || departments[3]?.id,
        risk_owner_id: riskOwner.id,
        status: 'Mitigated',
        priority: 'Medium',
        date_reported: new Date('2024-01-10'),
        submitted_by: riskOwner.id - 1,
        evaluated_by: riskOwner.id,
        date_evaluated: new Date('2024-01-12'),
        assessment_notes: 'Knowledge transfer plan implemented. Backup personnel trained. Risk successfully mitigated.',
        severity: 'Medium',
        category_update: 'Strategic',
        status_update: 'Mitigated',
        workflow_step: 6,
        workflow_status: {
          step1_completed: true,
          step2_completed: true,
          step3_completed: true,
          step4_completed: true,
          step5_completed: true,
          step6_completed: true,
          last_updated: '2024-01-30T16:45:00Z'
        },
        treatment_plan: 'Implement knowledge transfer program, cross-train team members, document critical processes.',
        action_items: [
          {
            id: 1,
            action: 'Knowledge transfer sessions',
            responsible: 'HR Department',
            dueDate: '2024-01-25',
            priority: 'High',
            status: 'Completed'
          },
          {
            id: 2,
            action: 'Process documentation',
            responsible: 'Project Team',
            dueDate: '2024-01-30',
            priority: 'Medium',
            status: 'Completed'
          }
        ],
        monitoring_kpis: {
          keyPerformanceIndicators: 'Team productivity, Knowledge retention, Project continuity',
          riskOwnerName: `${riskOwner.first_name} ${riskOwner.last_name}`,
          riskOwnerTitle: 'HR Director',
          riskOwnerDepartment: 'Human Resources',
          riskOwnerContact: riskOwner.email
        },
        review_frequency: 'Monthly',
        escalation_required: false,
        closure_date: new Date('2024-02-01'),
        closure_reason: 'Knowledge transfer completed successfully, team cross-trained, processes documented'
      },
      {
        risk_code: 'RISK-2024-005',
        risk_title: 'Financial Market Volatility Impact',
        risk_description: 'Risk of project cost overruns due to volatile material prices and currency fluctuations.',
        what_can_happen: 'Budget overruns, reduced profit margins, project financial viability concerns.',
        risk_category_id: categories.find(c => c.category_name.includes('Financial'))?.id || categories[4]?.id,
        department_id: departments.find(d => d.department_name.includes('Finance'))?.id || departments[0]?.id,
        risk_owner_id: riskOwner.id,
        status: 'Submitted',
        priority: 'Medium',
        date_reported: new Date('2024-02-10'),
        submitted_by: riskOwner.id - 2,
        assessment_notes: 'Initial assessment pending. Market analysis required.',
        severity: 'Medium',
        workflow_step: 2,
        workflow_status: {
          step1_completed: true,
          step2_completed: false,
          step3_completed: false,
          step4_completed: false,
          step5_completed: false,
          step6_completed: false,
          last_updated: '2024-02-12T11:20:00Z'
        }
      },
      {
        risk_code: 'RISK-2024-006',
        risk_title: 'Construction Equipment Failure Risk',
        risk_description: 'Risk of major construction equipment failure during critical project phases.',
        what_can_happen: 'Project delays, increased costs, safety incidents, and client dissatisfaction.',
        risk_category_id: categories.find(c => c.category_name.includes('Operational'))?.id || categories[1]?.id,
        department_id: departments.find(d => d.department_name.includes('Operations'))?.id || departments[1]?.id,
        risk_owner_id: riskOwner.id,
        status: 'In Review',
        priority: 'High',
        date_reported: new Date('2024-02-05'),
        submitted_by: riskOwner.id - 1,
        evaluated_by: riskOwner.id,
        date_evaluated: new Date('2024-02-07'),
        assessment_notes: 'Equipment assessment ongoing. Maintenance schedule review in progress.',
        severity: 'High',
        category_update: 'Operational',
        status_update: 'In Review',
        workflow_step: 3,
        workflow_status: {
          step1_completed: true,
          step2_completed: true,
          step3_completed: true,
          step4_completed: false,
          step5_completed: false,
          step6_completed: false,
          last_updated: '2024-02-08T13:45:00Z'
        },
        treatment_plan: 'Implement predictive maintenance, establish backup equipment arrangements, enhance monitoring.',
        action_items: [
          {
            id: 1,
            action: 'Equipment inspection',
            responsible: 'Maintenance Team',
            dueDate: '2024-02-15',
            priority: 'High',
            status: 'In Progress'
          }
        ],
        monitoring_kpis: {
          keyPerformanceIndicators: 'Equipment uptime, Maintenance costs, Safety incidents',
          riskOwnerName: `${riskOwner.first_name} ${riskOwner.last_name}`,
          riskOwnerTitle: 'Operations Manager',
          riskOwnerDepartment: 'Operations',
          riskOwnerContact: riskOwner.email
        },
        review_frequency: 'Weekly',
        escalation_required: false
      }
    ];

    // Insert the test risks
    console.log('📝 Inserting test risks...');
    
    for (const risk of testRisks) {
      try {
        const createdRisk = await prisma.risks.create({
          data: risk
        });
        console.log(`✅ Created risk: ${createdRisk.risk_code} - ${createdRisk.risk_title}`);
      } catch (error) {
        console.error(`❌ Failed to create risk ${risk.risk_code}:`, error.message);
      }
    }

    console.log('🎉 Test risk data insertion completed successfully!');
    console.log('\n📊 Summary of inserted data:');
    console.log('- 6 test risks with various statuses');
    console.log('- 2 Mitigated risks (showing successful completion)');
    console.log('- 2 In Review/Under Review risks');
    console.log('- 1 Escalated risk (critical compliance)');
    console.log('- 1 Submitted risk (pending evaluation)');
    console.log('- Complete workflow tracking and KPIs');
    console.log('- Realistic action items and treatment plans');
    console.log(`- All assigned to: ${riskOwner.first_name} ${riskOwner.last_name} (${riskOwner.email})`);

  } catch (error) {
    console.error('❌ Error inserting test risk data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
insertTestRiskData(); 