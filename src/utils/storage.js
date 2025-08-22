const STORAGE_KEY = 'risk-management-data';

export const saveRisks = (risks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
    return true;
  } catch (error) {
    console.error('Error saving risks to localStorage:', error);
    return false;
  }
};

export const loadRisks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error loading risks from localStorage:', error);
    return null;
  }
};

export const clearRisks = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing risks from localStorage:', error);
    return false;
  }
};

// Sample data for first-time users
export const getSampleRisks = () => [
  {
    id: '1',
    title: 'Data Breach Risk',
    description: 'Potential security vulnerability in user authentication system',
    cause: 'Weak password policies and outdated security protocols',
    consequence: 'Loss of sensitive customer data, regulatory fines, reputational damage',
    project: 'IT Security Infrastructure',
    category: 'Security',
    likelihood: 4,
    impact: 5,
    riskScore: 20,
    riskLevel: 'Critical',
    status: 'open',
    owner: 'John Smith',
    dueDate: '2024-02-15',
    treatmentPlan: 'Implement multi-factor authentication, update security protocols, conduct security audit',
    reviewDate: '2024-02-01',
    expectedReduction: 'Reduce from Critical to Moderate',
    notes: 'Requires immediate attention from security team',
    createdAt: '2024-01-15T10:00:00Z',
    lastModifiedAt: '2024-01-18T14:30:00Z',
    lastModifiedBy: 'John Smith'
  },
  {
    id: '2',
    title: 'Server Downtime',
    description: 'Risk of server failure during peak hours',
    cause: 'Aging hardware and insufficient backup systems',
    consequence: 'Service interruption, customer complaints, revenue loss',
    project: 'IT Operations',
    category: 'Technical',
    likelihood: 3,
    impact: 4,
    riskScore: 12,
    riskLevel: 'High',
    status: 'in progress',
    owner: 'Sarah Johnson',
    dueDate: '2024-01-30',
    treatmentPlan: 'Upgrade server hardware, implement redundant systems, establish monitoring',
    reviewDate: '2024-01-25',
    expectedReduction: 'Reduce from High to Low',
    notes: 'Backup systems need to be tested',
    createdAt: '2024-01-10T14:30:00Z',
    lastModifiedAt: '2024-01-16T09:15:00Z',
    lastModifiedBy: 'Sarah Johnson'
  },
  {
    id: '3',
    title: 'Budget Overrun',
    description: 'Project costs exceeding allocated budget',
    cause: 'Scope creep and unexpected technical challenges',
    consequence: 'Financial losses, project delays, stakeholder dissatisfaction',
    project: 'Product Development',
    category: 'Financial',
    likelihood: 3,
    impact: 3,
    riskScore: 9,
    riskLevel: 'Moderate',
    status: 'resolved',
    owner: 'Mike Davis',
    dueDate: '2024-01-20',
    treatmentPlan: 'Implement strict change control, regular budget reviews, stakeholder communication',
    reviewDate: '2024-01-15',
    expectedReduction: 'Reduce from Moderate to Low',
    residualLikelihood: 2,
    residualImpact: 2,
    residualScore: 4,
    notes: 'Additional funding approved',
    createdAt: '2024-01-05T09:15:00Z',
    lastModifiedAt: '2024-01-17T11:45:00Z',
    lastModifiedBy: 'Mike Davis'
  },
  {
    id: '4',
    title: 'Compliance Violation',
    description: 'Potential GDPR compliance issues with data handling',
    cause: 'Inadequate data protection measures and lack of staff training',
    consequence: 'Legal penalties, regulatory scrutiny, loss of customer trust',
    project: 'Legal & Compliance',
    category: 'Compliance',
    likelihood: 2,
    impact: 5,
    riskScore: 10,
    riskLevel: 'High',
    status: 'open',
    owner: 'Lisa Wilson',
    dueDate: '2024-02-01',
    treatmentPlan: 'Conduct compliance audit, implement data protection measures, staff training',
    reviewDate: '2024-01-28',
    expectedReduction: 'Reduce from High to Low',
    notes: 'Legal team review required',
    createdAt: '2024-01-12T16:45:00Z',
    lastModifiedAt: '2024-01-19T08:20:00Z',
    lastModifiedBy: 'Lisa Wilson'
  },
  {
    id: '5',
    title: 'Key Personnel Loss',
    description: 'Risk of losing critical team members',
    cause: 'Competitive job market and lack of career development opportunities',
    consequence: 'Knowledge loss, project delays, increased recruitment costs',
    project: 'Human Resources',
    category: 'Operational',
    likelihood: 4,
    impact: 4,
    riskScore: 16,
    riskLevel: 'Critical',
    status: 'in progress',
    owner: 'Tom Brown',
    dueDate: '2024-03-01',
    treatmentPlan: 'Implement retention strategies, career development programs, knowledge transfer',
    reviewDate: '2024-02-15',
    expectedReduction: 'Reduce from Critical to Moderate',
    notes: 'Succession planning in progress',
    createdAt: '2024-01-08T11:20:00Z',
    lastModifiedAt: '2024-01-15T16:00:00Z',
    lastModifiedBy: 'Tom Brown'
  }
]; 