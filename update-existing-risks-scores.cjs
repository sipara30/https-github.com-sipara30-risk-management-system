const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function updateExistingRiskScores() {
  try {
    console.log('🔄 Updating existing risks with calculated risk scores...');

    // Get all existing risks
    const risks = await prisma.risks.findMany({
      select: { id: true, risk_title: true, priority: true, status: true }
    });

    console.log(`Found ${risks.length} risks to update`);

    for (const risk of risks) {
      // Generate realistic risk scores based on priority
      let likelihood, impact, calculatedScore, riskLevel;
      
      switch (risk.priority) {
        case 'High':
          likelihood = 0.7 + (Math.random() * 0.2); // 0.7-0.9
          impact = 0.6 + (Math.random() * 0.3); // 0.6-0.9
          break;
        case 'Medium':
          likelihood = 0.4 + (Math.random() * 0.3); // 0.4-0.7
          impact = 0.3 + (Math.random() * 0.4); // 0.3-0.7
          break;
        case 'Low':
        default:
          likelihood = 0.1 + (Math.random() * 0.3); // 0.1-0.4
          impact = 0.1 + (Math.random() * 0.3); // 0.1-0.4
          break;
      }

      calculatedScore = likelihood * impact;
      
      // Determine risk level based on score
      if (calculatedScore >= 0.561) riskLevel = 'Critical';
      else if (calculatedScore >= 0.241) riskLevel = 'High';
      else if (calculatedScore >= 0.081) riskLevel = 'Medium';
      else riskLevel = 'Low';

      // Generate individual impact scores
      const financialImpact = 0.2 + (Math.random() * 0.6); // 0.2-0.8
      const reputationImpact = 0.1 + (Math.random() * 0.7); // 0.1-0.8
      const legalImpact = 0.1 + (Math.random() * 0.5); // 0.1-0.6
      const environmentalImpact = 0.1 + (Math.random() * 0.4); // 0.1-0.5
      const timeImpact = 0.2 + (Math.random() * 0.6); // 0.2-0.8

      // Calculate individual risk scores
      const financialRiskScore = likelihood * financialImpact;
      const reputationRiskScore = likelihood * reputationImpact;
      const legalRiskScore = likelihood * legalImpact;
      const environmentalRiskScore = likelihood * environmentalImpact;
      const timeRiskScore = likelihood * timeImpact;

      // Highest risk score is the maximum of all category scores
      const highestRiskScore = Math.max(
        financialRiskScore,
        reputationRiskScore,
        legalRiskScore,
        environmentalRiskScore,
        timeRiskScore,
        calculatedScore
      );

      // Update the risk with calculated scores
      await prisma.risks.update({
        where: { id: risk.id },
        data: {
          likelihood: parseFloat(likelihood.toFixed(3)),
          impact: parseFloat(impact.toFixed(3)),
          calculated_risk_score: parseFloat(calculatedScore.toFixed(3)),
          risk_level: riskLevel,
          financial_impact: parseFloat(financialImpact.toFixed(3)),
          reputation_impact: parseFloat(reputationImpact.toFixed(3)),
          legal_impact: parseFloat(legalImpact.toFixed(3)),
          environmental_impact: parseFloat(environmentalImpact.toFixed(3)),
          time_impact: parseFloat(timeImpact.toFixed(3)),
          financial_risk_score: parseFloat(financialRiskScore.toFixed(3)),
          reputation_risk_score: parseFloat(reputationRiskScore.toFixed(3)),
          legal_risk_score: parseFloat(legalRiskScore.toFixed(3)),
          environmental_risk_score: parseFloat(environmentalRiskScore.toFixed(3)),
          time_risk_score: parseFloat(timeRiskScore.toFixed(3)),
          highest_risk_score: parseFloat(highestRiskScore.toFixed(3))
        }
      });

      console.log(`✅ Updated "${risk.risk_title}" - Score: ${calculatedScore.toFixed(3)} (${riskLevel})`);
    }

    console.log('🎉 All risk scores updated successfully!');
    
    // Show summary statistics
    const summary = await prisma.risks.groupBy({
      by: ['risk_level'],
      _count: { id: true },
      where: {
        risk_level: { not: null }
      }
    });

    console.log('\n📊 Risk Distribution Summary:');
    summary.forEach(group => {
      console.log(`  ${group.risk_level}: ${group._count.id} risks`);
    });

  } catch (error) {
    console.error('❌ Error updating risk scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateExistingRiskScores(); 