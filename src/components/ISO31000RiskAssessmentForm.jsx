import React, { useState, useEffect } from 'react';
import {
	ClipboardDocumentCheckIcon,
	UserIcon,
	CalendarIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	ClockIcon,
	PaperClipIcon,
	DocumentTextIcon,
	ChartBarIcon,
	FlagIcon
} from '@heroicons/react/24/outline';

const ISO31000RiskAssessmentForm = ({ risk, onSubmit, onCancel, loading = false, users = [] }) => {
	const [formData, setFormData] = useState({
		// Risk Identification
		riskId: risk?.risk_code || '',
		riskTitle: risk?.risk_title || '',
		riskDescription: risk?.risk_description || '',
		
		// Risk Owner Information
		riskOwnerName: '',
		riskOwnerTitle: '',
		riskOwnerDepartment: '',
		riskOwnerContact: '',
		
		// Risk Assessment Summary
		assessmentDate: new Date().toISOString().split('T')[0],
		assessedBy: '',
		riskContext: '',
		riskSource: '',
		riskEvent: '',
		riskConsequence: '',
		
		// Risk Analysis Results
		likelihood: '',
		impact: '',
		riskLevel: '',
		riskScore: '',
		
		// Risk Evaluation
		riskAcceptability: '',
		riskTolerance: '',
		escalationRequired: false,
		escalationReason: '',
		
		// Treatment Plan
		treatmentStrategy: '',
		treatmentPlan: '',
		treatmentObjectives: '',
		successCriteria: '',
		
		// Action Items
		actionItems: [
			{
				id: 1,
				description: '',
				responsiblePerson: '',
				deadline: '',
				status: 'pending',
				progress: 0,
				notes: ''
			}
		],
		
		// Resource Requirements
		estimatedCost: '',
		estimatedTimeline: '',
		requiredResources: '',
		budgetApproval: '',
		
		// Monitoring & Review
		reviewFrequency: '',
		nextReviewDate: '',
		keyPerformanceIndicators: '',
		monitoringMechanisms: '',
		
		// Status Tracking
		currentStatus: 'Open',
		statusNotes: '',
		completionDate: '',
		
		// Supporting Documentation
		attachments: [],
		assessmentNotes: '',
		approvalNotes: '',
		
		// Risk Register Updates
		categoryUpdate: '',
		priorityUpdate: '',
		severityUpdate: '',
		statusUpdate: ''
	});

	// Modal-driven UI: open a focused editor for the selected section
	const [openSection, setOpenSection] = useState('');

	// Progress for required fields (dynamic)
	const requiredBySection = {
		riskInfo: ['riskId', 'riskTitle', 'riskDescription'],
		ownerInfo: ['riskOwnerName'],
		summary: ['assessmentDate'],
		evaluation: ['riskAcceptability', 'riskTolerance', 'escalationReason?'],
		treatment: ['treatmentStrategy', 'treatmentPlan'],
		actions: ['actionItems.0.description', 'actionItems.0.responsiblePerson', 'actionItems.0.deadline'],
		monitoring: ['reviewFrequency', 'nextReviewDate'],
		status: ['currentStatus'],
		// Supporting Documentation is optional and excluded from totals
		docs: []
	};
	const allRequired = Object.values(requiredBySection).flat();
	const [progress, setProgress] = useState(0);
	const [sectionDone, setSectionDone] = useState({});
	const [sectionPct, setSectionPct] = useState({});
	// helpers for nested access and conditional requirements
	const getByPath = (obj, path) => {
		try {
			return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
		} catch (_) { return undefined; }
	};

	const isKeySatisfied = (rawKey) => {
		// conditional markers:
		//  - key ending with '?' means conditionally required; for escalationReason?, only when escalationRequired is true
		//  - key ending with '*' denotes list/attachments must have length > 0
		let key = rawKey;
		if (key === 'escalationReason?') {
			if (!formData.escalationRequired) return true; // not required if escalation not checked
			key = 'escalationReason';
		}
		if (key.endsWith('*')) {
			const base = key.slice(0, -1);
			const v = getByPath(formData, base);
			return Array.isArray(v) ? v.length > 0 : !!v;
		}
		const v = getByPath(formData, key);
		if (typeof v === 'boolean') return v !== undefined; // booleans considered set
		return v !== undefined && String(v).trim() !== '';
	};

	useEffect(() => {
		const filledCount = allRequired.reduce((acc, key) => acc + (isKeySatisfied(key) ? 1 : 0), 0);
		const pct = allRequired.length === 0 ? 0 : Math.round((filledCount / allRequired.length) * 100);
		setProgress(pct);
		const perSection = {};
		const perPct = {};
		Object.entries(requiredBySection).forEach(([sec, keys]) => {
			if (keys.length === 0) {
				perSection[sec] = true; perPct[sec] = 100; return;
			}
			const satisfied = keys.filter(isKeySatisfied).length;
			perSection[sec] = satisfied === keys.length;
			perPct[sec] = Math.round((satisfied / keys.length) * 100);
		});
		setSectionDone(perSection);
		setSectionPct(perPct);
	}, [formData]);

	// Risk Acceptability Levels
	const acceptabilityLevels = [
		'Acceptable - Risk is within acceptable limits',
		'Tolerable - Risk is acceptable with monitoring',
		'Unacceptable - Risk requires immediate treatment',
		'Escalation Required - Risk exceeds authority limits'
	];

	// Treatment Strategies (ISO 31000)
	const treatmentStrategies = [
		'Risk Avoidance - Eliminate the risk source',
		'Risk Reduction - Reduce likelihood or impact',
		'Risk Transfer - Transfer to third party (insurance, outsourcing)',
		'Risk Retention - Accept and manage the risk',
		'Risk Sharing - Share with partners or stakeholders'
	];

	// Review Frequencies
	const reviewFrequencies = [
		'Daily',
		'Weekly',
		'Monthly',
		'Quarterly',
		'Annually',
		'As needed'
	];

	// Status Options
	const statusOptions = [
		'Open',
		'In Review',
		'In Progress',
		'On Hold',
		'Completed',
		'Closed',
		'Escalated'
	];

	// Initialize form with risk data
	useEffect(() => {
		if (risk) {
			setFormData(prev => ({
				...prev,
				riskId: risk.risk_code || '',
				riskTitle: risk.risk_title || '',
				riskDescription: risk.risk_description || '',
				likelihood: risk.likelihood || '',
				impact: risk.impact || '',
				riskLevel: risk.riskLevel || '',
				currentStatus: risk.status || 'Open',
				// Prefill persisted assessment fields from backend when editing
				assessmentNotes: risk.assessment_notes ?? prev.assessmentNotes,
				severityUpdate: risk.severity ?? prev.severityUpdate,
				categoryUpdate: risk.category_update ?? prev.categoryUpdate,
				statusUpdate: risk.status_update ?? prev.statusUpdate,
				treatmentPlan: risk.treatment_plan ?? prev.treatmentPlan,
				reviewFrequency: risk.review_frequency ?? prev.reviewFrequency,
				nextReviewDate: risk.next_review_date ? new Date(risk.next_review_date).toISOString().split('T')[0] : prev.nextReviewDate,
				keyPerformanceIndicators: risk.monitoring_kpis ?? prev.keyPerformanceIndicators,
				escalationRequired: typeof risk.escalation_required === 'boolean' ? risk.escalation_required : prev.escalationRequired,
				escalationReason: risk.escalation_reason ?? prev.escalationReason,
				actionItems: Array.isArray(risk.action_items) && risk.action_items.length > 0 ? risk.action_items : prev.actionItems
			}));
		}
	}, [risk]);

	// Auto-calculate risk score
	useEffect(() => {
		if (formData.likelihood && formData.impact) {
			const score = parseInt(formData.likelihood) * parseInt(formData.impact);
			setFormData(prev => ({
				...prev,
				riskScore: score.toString()
			}));
		}
	}, [formData.likelihood, formData.impact]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleActionItemChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			actionItems: prev.actionItems.map((item, i) => 
				i === index ? { ...item, [field]: value } : item
			)
		}));
	};

	const addActionItem = () => {
		const newId = Math.max(...formData.actionItems.map(item => item.id)) + 1;
		setFormData(prev => ({
			...prev,
			actionItems: [
				...prev.actionItems,
				{
					id: newId,
					description: '',
					responsiblePerson: '',
					deadline: '',
					status: 'pending',
					progress: 0,
					notes: ''
				}
			]
		}));
	};

	const removeActionItem = (index) => {
		setFormData(prev => ({
			...prev,
			actionItems: prev.actionItems.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		
		// Validate required fields
		if (!formData.riskOwnerName || !formData.assessmentDate || !formData.treatmentPlan) {
			alert('Please fill in all required fields marked with *');
			return;
		}
		
		// Normalize payload keys expected by backend submit handler
		const normalized = {
			...formData,
			assessmentNotes: formData.assessmentNotes,
			severityUpdate: formData.severityUpdate,
			statusUpdate: formData.statusUpdate,
			categoryUpdate: formData.categoryUpdate,
			treatmentPlan: formData.treatmentPlan,
			reviewFrequency: formData.reviewFrequency,
			nextReviewDate: formData.nextReviewDate,
			keyPerformanceIndicators: formData.keyPerformanceIndicators,
			escalationRequired: formData.escalationRequired,
			escalationReason: formData.escalationReason,
			actionItems: formData.actionItems
		};
		
		onSubmit(normalized);
	};

	const handleFileUpload = (e) => {
		const files = Array.from(e.target.files);
		setFormData(prev => ({
			...prev,
			attachments: [...prev.attachments, ...files]
		}));
	};

	const removeAttachment = (index) => {
		setFormData(prev => ({
			...prev,
			attachments: prev.attachments.filter((_, i) => i !== index)
		}));
	};

	// Section renderers reused inside modal
	const renderRiskInformation = () => (
		<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
				<DocumentTextIcon className="h-5 w-5 mr-2" />
				Risk Information
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Risk ID</label>
					<input type="text" name="riskId" value={formData.riskId} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Risk Title</label>
					<input type="text" name="riskTitle" value={formData.riskTitle} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600" />
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">Risk Description</label>
					<textarea name="riskDescription" value={formData.riskDescription} readOnly rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600" />
				</div>
			</div>
		</div>
	);

	const renderRiskOwnerInfo = () => (
		<div className="bg-green-50 border border-green-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
				<UserIcon className="h-5 w-5 mr-2" />
				Risk Owner Information
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Risk Owner Name *</label>
					<input type="text" name="riskOwnerName" value={formData.riskOwnerName} onChange={handleChange} placeholder="Full Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Title/Position</label>
					<input type="text" name="riskOwnerTitle" value={formData.riskOwnerTitle} onChange={handleChange} placeholder="Job Title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
					<input type="text" name="riskOwnerDepartment" value={formData.riskOwnerDepartment} onChange={handleChange} placeholder="Department" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
					<input type="text" name="riskOwnerContact" value={formData.riskOwnerContact} onChange={handleChange} placeholder="Email/Phone" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500" />
				</div>
			</div>
		</div>
	);

	const renderAssessmentSummary = () => (
		<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
				<ChartBarIcon className="h-5 w-5 mr-2" />
				Risk Assessment Summary
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Assessment Date *</label>
					<input type="date" name="assessmentDate" value={formData.assessmentDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Assessed By</label>
					<input type="text" name="assessedBy" value={formData.assessedBy} onChange={handleChange} placeholder="Assessor Name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" />
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">Risk Context</label>
					<textarea name="riskContext" value={formData.riskContext} onChange={handleChange} rows="3" placeholder="Business context, environment, and factors influencing this risk" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500" />
				</div>
			</div>
			<div className="mt-6 p-4 bg-white border rounded-lg">
				<h4 className="font-medium text-gray-900 mb-3">Risk Matrix Analysis</h4>
				<div className="grid grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Likelihood</label>
						<select name="likelihood" value={formData.likelihood} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
							<option value="">Select</option>
							<option value="1">1 - Rare</option>
							<option value="2">2 - Unlikely</option>
							<option value="3">3 - Possible</option>
							<option value="4">4 - Likely</option>
							<option value="5">5 - Almost Certain</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Impact</label>
						<select name="impact" value={formData.impact} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
							<option value="">Select</option>
							<option value="1">1 - Negligible</option>
							<option value="2">2 - Minor</option>
							<option value="3">3 - Moderate</option>
							<option value="4">4 - Major</option>
							<option value="5">5 - Catastrophic</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Risk Score</label>
						<input type="text" name="riskScore" value={formData.riskScore} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-center font-bold" />
					</div>
				</div>
				{formData.riskScore && (
					<div className="mt-4 p-3 bg-gray-50 rounded-lg">
						<span className="text-sm font-medium text-gray-700">Risk Level: </span>
						<span className={`px-2 py-1 rounded-full text-sm font-medium ml-2 ${
							formData.riskScore <= 4 ? 'bg-green-100 text-green-800' :
							formData.riskScore <= 9 ? 'bg-yellow-100 text-yellow-800' :
							formData.riskScore <= 15 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
						}`}>
							{formData.riskScore <= 4 ? 'Low Risk' : formData.riskScore <= 9 ? 'Medium Risk' : formData.riskScore <= 15 ? 'High Risk' : 'Critical Risk'}
						</span>
					</div>
				)}
			</div>
		</div>
	);

	const renderRiskEvaluation = () => (
		<div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
				<FlagIcon className="h-5 w-5 mr-2" />
				Risk Evaluation
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Risk Acceptability</label>
					<select name="riskAcceptability" value={formData.riskAcceptability} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
						<option value="">Select Acceptability</option>
						{acceptabilityLevels.map(level => (<option key={level} value={level}>{level}</option>))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
					<select name="riskTolerance" value={formData.riskTolerance} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
						<option value="">Select Tolerance</option>
						<option value="Low">Low - Zero tolerance</option>
						<option value="Medium">Medium - Some tolerance</option>
						<option value="High">High - Significant tolerance</option>
					</select>
				</div>
				<div className="md:col-span-2">
					<div className="flex items-center space-x-4">
						<label className="flex items-center">
							<input type="checkbox" name="escalationRequired" checked={formData.escalationRequired} onChange={handleChange} className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
							<span className="text-sm font-medium text-gray-700">Escalation Required</span>
						</label>
					</div>
					{formData.escalationRequired && (
						<div className="mt-3">
							<label className="block text-sm font-medium text-gray-700 mb-2">Escalation Reason</label>
							<textarea name="escalationReason" value={formData.escalationReason} onChange={handleChange} rows="2" placeholder="Explain why this risk requires escalation" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
						</div>
					)}
				</div>
			</div>
		</div>
	);

	const renderTreatmentPlan = () => (
		<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
				<CheckCircleIcon className="h-5 w-5 mr-2" />
				Treatment Plan
			</h3>
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Treatment Strategy *</label>
					<select name="treatmentStrategy" value={formData.treatmentStrategy} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
						<option value="">Select Strategy</option>
						{treatmentStrategies.map(strategy => (<option key={strategy} value={strategy}>{strategy}</option>))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Treatment Plan *</label>
					<textarea name="treatmentPlan" value={formData.treatmentPlan} onChange={handleChange} rows="4" placeholder="Detailed description of the treatment plan, including specific actions, controls, and measures" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Treatment Objectives</label>
						<textarea name="treatmentObjectives" value={formData.treatmentObjectives} onChange={handleChange} rows="3" placeholder="What do you want to achieve with this treatment?" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Success Criteria</label>
						<textarea name="successCriteria" value={formData.successCriteria} onChange={handleChange} rows="3" placeholder="How will you measure success?" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
					</div>
				</div>
			</div>
		</div>
	);

	const renderActionItems = () => (
		<div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
				<ClockIcon className="h-5 w-5 mr-2" />
				Action Items & Responsibilities
			</h3>
			<div className="space-y-4">
				{formData.actionItems.map((item, index) => (
					<div key={item.id} className="p-4 bg-white border rounded-lg">
						<div className="flex items-center justify-between mb-3">
							<h4 className="font-medium text-gray-900">Action Item #{index + 1}</h4>
							<button type="button" onClick={() => removeActionItem(index)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
								<textarea value={item.description} onChange={(e) => handleActionItemChange(index, 'description', e.target.value)} rows="2" placeholder="Describe the action item" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Responsible Person</label>
								<input type="text" value={item.responsiblePerson} onChange={(e) => handleActionItemChange(index, 'responsiblePerson', e.target.value)} placeholder="Name of responsible person" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
								<input type="date" value={item.deadline} onChange={(e) => handleActionItemChange(index, 'deadline', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
								<select value={item.status} onChange={(e) => handleActionItemChange(index, 'status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
									<option value="pending">Pending</option>
									<option value="in-progress">In Progress</option>
									<option value="completed">Completed</option>
									<option value="on-hold">On Hold</option>
								</select>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
								<textarea value={item.notes} onChange={(e) => handleActionItemChange(index, 'notes', e.target.value)} rows="2" placeholder="Additional notes or comments" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
							</div>
						</div>
					</div>
				))}
				<button type="button" onClick={addActionItem} className="w-full py-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:border-orange-400 hover:text-orange-700 transition-colors">+ Add Action Item</button>
			</div>
		</div>
	);

	const renderMonitoring = () => (
		<div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center">
				<CalendarIcon className="h-5 w-5 mr-2" />
				Monitoring & Review
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Review Frequency</label>
					<select name="reviewFrequency" value={formData.reviewFrequency} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
						<option value="">Select Frequency</option>
						{reviewFrequencies.map(freq => (<option key={freq} value={freq}>{freq}</option>))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Next Review Date</label>
					<input type="date" name="nextReviewDate" value={formData.nextReviewDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">Key Performance Indicators</label>
					<textarea name="keyPerformanceIndicators" value={formData.keyPerformanceIndicators} onChange={handleChange} rows="3" placeholder="What metrics will you use to monitor the effectiveness of the treatment?" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">Monitoring Mechanisms</label>
					<textarea name="monitoringMechanisms" value={formData.monitoringMechanisms} onChange={handleChange} rows="3" placeholder="How will you monitor progress and effectiveness?" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
				</div>
			</div>
		</div>
	);

	const renderStatusTracking = () => (
		<div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
				<ExclamationTriangleIcon className="h-5 w-5 mr-2" />
				Status Tracking
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
					<select name="currentStatus" value={formData.currentStatus} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
						{statusOptions.map(status => (<option key={status} value={status}>{status}</option>))}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Completion Date</label>
					<input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500" />
				</div>
				<div className="md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">Status Notes</label>
					<textarea name="statusNotes" value={formData.statusNotes} onChange={handleChange} rows="3" placeholder="Additional notes about the current status" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500" />
				</div>
			</div>
		</div>
	);

	const renderSupportingDocs = () => (
		<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
			<h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
				<PaperClipIcon className="h-5 w-5 mr-2" />
				Supporting Documentation
			</h3>
			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
					<input type="file" multiple onChange={handleFileUpload} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
					<p className="text-xs text-gray-500 mt-1">Supporting documents, assessments, or other relevant files</p>
				</div>
				{formData.attachments.length > 0 && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Files</label>
						<div className="space-y-2">
							{formData.attachments.map((file, index) => (
								<div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
									<span className="text-sm text-gray-600">{file.name}</span>
									<button type="button" onClick={() => removeAttachment(index)} className="text-red-600 hover:text-red-800">Remove</button>
								</div>
							))}
						</div>
					</div>
				)}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Assessment Notes</label>
					<textarea name="assessmentNotes" value={formData.assessmentNotes} onChange={handleChange} rows="4" placeholder="Comprehensive notes about the risk assessment process and findings" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Approval Notes</label>
					<textarea name="approvalNotes" value={formData.approvalNotes} onChange={handleChange} rows="3" placeholder="Notes from approvers or stakeholders" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
				</div>
			</div>
		</div>
	);

	const renderSectionContent = (key) => {
		switch (key) {
			case 'riskInfo': return renderRiskInformation();
			case 'ownerInfo': return renderRiskOwnerInfo();
			case 'summary': return renderAssessmentSummary();
			case 'evaluation': return renderRiskEvaluation();
			case 'treatment': return renderTreatmentPlan();
			case 'actions': return renderActionItems();
			case 'monitoring': return renderMonitoring();
			case 'status': return renderStatusTracking();
			case 'docs': return renderSupportingDocs();
			default: return null;
		}
	};

	return (
		<div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
			<div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-t-lg">
				<div className="flex items-center space-x-3">
					<ClipboardDocumentCheckIcon className="h-8 w-8" />
					<div>
						<h2 className="text-2xl font-bold">Risk Assessment & Treatment Form</h2>
						<p className="text-green-100">Risk Owner (Manager/Lead) - Comprehensive Analysis & Calculations</p>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="p-6 space-y-8">
				{/* Completion progress */}
				<div className="p-4 border rounded-lg bg-gray-50">
					<div className="flex items-center justify-between mb-2">
						<div className="text-sm font-medium text-gray-700">Required fields completion</div>
						<div className="text-sm font-semibold text-gray-900">{progress}%</div>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
					</div>
					<div className="text-xs text-gray-500 mt-2">Required: Risk Owner Name, Assessment Date, Treatment Strategy, Treatment Plan</div>
				</div>
				{/* Section launcher cards (compact) */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="p-4 border rounded-lg bg-blue-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-blue-900">Risk Information</div>
								<div className="text-xs text-blue-700 truncate">{formData.riskTitle || '—'}</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('riskInfo')} className="px-3 py-1 bg-blue-600 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-blue-100 h-1 rounded-full">
								<div className="bg-blue-600 h-1 rounded-full" style={{ width: `${sectionPct.riskInfo||0}%` }}></div>
							</div>
							<div className="text-[10px] text-blue-700 mt-1">{sectionPct.riskInfo||0}%</div>
						</div>
						{sectionDone.riskInfo && (<div className="mt-2 text-xs text-blue-700">✓ Completed</div>)}
					</div>
					<div className="p-4 border rounded-lg bg-green-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-green-900">Risk Owner</div>
								<div className="text-xs text-green-700 truncate">{formData.riskOwnerName || '—'}</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('ownerInfo')} className="px-3 py-1 bg-green-600 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-green-100 h-1 rounded-full">
								<div className="bg-green-600 h-1 rounded-full" style={{ width: `${sectionPct.ownerInfo||0}%` }}></div>
							</div>
							<div className="text-[10px] text-green-700 mt-1">{sectionPct.ownerInfo||0}%</div>
						</div>
						{sectionDone.ownerInfo && (<div className="mt-2 text-xs text-green-700">✓ Completed</div>)}
					</div>
					<div className="p-4 border rounded-lg bg-yellow-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-yellow-900">Assessment Summary</div>
								<div className="text-xs text-yellow-700">Score: {formData.riskScore || '—'}</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('summary')} className="px-3 py-1 bg-yellow-500 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-yellow-100 h-1 rounded-full">
								<div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${sectionPct.summary||0}%` }}></div>
							</div>
							<div className="text-[10px] text-yellow-700 mt-1">{sectionPct.summary||0}%</div>
						</div>
						{sectionDone.summary && (<div className="mt-2 text-xs text-yellow-700">✓ Completed</div>)}
					</div>
					<div className="p-4 border rounded-lg bg-purple-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-purple-900">Risk Evaluation</div>
								<div className="text-xs text-purple-700 truncate">{formData.riskAcceptability || '—'}</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('evaluation')} className="px-3 py-1 bg-purple-600 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-purple-100 h-1 rounded-full">
								<div className="bg-purple-600 h-1 rounded-full" style={{ width: `${sectionPct.evaluation||0}%` }}></div>
							</div>
							<div className="text-[10px] text-purple-700 mt-1">{sectionPct.evaluation||0}%</div>
						</div>
					</div>
					<div className="p-4 border rounded-lg bg-indigo-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-indigo-900">Treatment Plan</div>
								<div className="text-xs text-indigo-700 truncate">{formData.treatmentStrategy || '—'}</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('treatment')} className="px-3 py-1 bg-indigo-600 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-indigo-100 h-1 rounded-full">
								<div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${sectionPct.treatment||0}%` }}></div>
							</div>
							<div className="text-[10px] text-indigo-700 mt-1">{sectionPct.treatment||0}%</div>
						</div>
						{sectionDone.treatment && (<div className="mt-2 text-xs text-indigo-700">✓ Completed</div>)}
					</div>
					<div className="p-4 border rounded-lg bg-orange-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-orange-900">Action Items</div>
								<div className="text-xs text-orange-700">{formData.actionItems.length} item(s)</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('actions')} className="px-3 py-1 bg-orange-600 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-orange-100 h-1 rounded-full">
								<div className="bg-orange-600 h-1 rounded-full" style={{ width: `${sectionPct.actions||0}%` }}></div>
							</div>
							<div className="text-[10px] text-orange-700 mt-1">{sectionPct.actions||0}%</div>
						</div>
					</div>
					<div className="p-4 border rounded-lg bg-teal-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-teal-900">Monitoring & Review</div>
								<div className="text-xs text-teal-700 truncate">{formData.reviewFrequency || '—'}</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('monitoring')} className="px-3 py-1 bg-teal-600 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-teal-100 h-1 rounded-full">
								<div className="bg-teal-600 h-1 rounded-full" style={{ width: `${sectionPct.monitoring||0}%` }}></div>
							</div>
							<div className="text-[10px] text-teal-700 mt-1">{sectionPct.monitoring||0}%</div>
						</div>
					</div>
					<div className="p-4 border rounded-lg bg-gray-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-gray-900">Status Tracking</div>
								<div className="text-xs text-gray-700 truncate">{formData.currentStatus || '—'}</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('status')} className="px-3 py-1 bg-gray-700 text-white rounded">Click</button>
						</div>
						<div className="mt-2">
							<div className="w-full bg-gray-200 h-1 rounded-full">
								<div className="bg-gray-700 h-1 rounded-full" style={{ width: `${sectionPct.status||0}%` }}></div>
							</div>
							<div className="text-[10px] text-gray-700 mt-1">{sectionPct.status||0}%</div>
						</div>
					</div>
					<div className="p-4 border rounded-lg bg-blue-50">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold text-blue-900">Supporting Documents</div>
								<div className="text-xs text-blue-700">{formData.attachments.length} file(s)</div>
							</div>
							<button type="button" onClick={()=>setOpenSection('docs')} className="px-3 py-1 bg-blue-600 text-white rounded">Click</button>
						</div>
						{/* Optional section - no progress bar */}
					</div>
				</div>

				{/* Form Actions */}
				<div className="flex justify-end space-x-4 pt-6 border-t">
					<button
						type="button"
						onClick={onCancel}
						className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
					>
						{loading ? (
							<>
								<ClockIcon className="h-5 w-5 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<CheckCircleIcon className="h-5 w-5 mr-2" />
								Save Assessment & Treatment Plan
							</>
						)}
					</button>
				</div>
			</form>

			{/* Section Editor Modal */}
			{openSection && (
				<div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
					<div className="bg-white rounded-lg shadow-xl w-11/12 md:w-4/5 lg:w-3/4 max-h-[85vh] overflow-auto">
						<div className="flex items-center justify-between px-4 py-3 border-b">
							<h4 className="text-lg font-semibold text-gray-900">
								{(
									{
										riskInfo: 'Risk Information', ownerInfo: 'Risk Owner Information', summary: 'Risk Assessment Summary',
										evaluation: 'Risk Evaluation', treatment: 'Treatment Plan', actions: 'Action Items', monitoring: 'Monitoring & Review', status: 'Status Tracking', docs: 'Supporting Documentation'
									}[openSection]
								)}
							</h4>
							<button onClick={()=>setOpenSection('')} className="text-gray-500 hover:text-gray-700">✕</button>
						</div>
						<div className="p-4 space-y-4">
							{/* section progress */}
							<div className="p-3 bg-gray-50 border rounded">
								<div className="flex items-center justify-between mb-1 text-sm">
									<span className="text-gray-700">Section completion</span>
									<span className="font-semibold text-gray-900">{sectionPct[openSection]||0}%</span>
								</div>
								<div className="w-full bg-gray-200 h-2 rounded-full">
									<div className="bg-green-600 h-2 rounded-full" style={{ width: `${sectionPct[openSection]||0}%` }}></div>
								</div>
							</div>
							{renderSectionContent(openSection)}
						</div>
						<div className="px-4 py-3 border-t flex justify-end">
							<button disabled={!sectionDone[openSection]} onClick={()=>setOpenSection('')} className={`px-4 py-2 text-white rounded ${sectionDone[openSection] ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}>Done</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ISO31000RiskAssessmentForm;
