import { ComplianceProject, RoadmapStage } from '../types/compliance';

export const DEFAULT_ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 1,
    name: 'Product Identification & Classification',
    shortTitle: 'Product Identified',
    status: 'completed',
    description: 'Determine exact product scope, technical variants, electrical ratings, and sub-assemblies.',
    estimatedDays: 3,
    checklist: [
      { id: '1-1', title: 'Determine product taxonomy and design variants', description: 'Catalog all wattage ratings, driver variants, and battery backup durations.', isCompleted: true },
      { id: '1-2', title: 'Verify tariff head / HS Code classification', description: 'Confirm 8-digit ITC-HS code matching standard classification.', isCompleted: true }
    ]
  },
  {
    id: 2,
    name: 'Applicable Standards & Mandatory QCO Check',
    shortTitle: 'Standards Identified',
    status: 'completed',
    description: 'Map product to corresponding Indian Standard and verify if covered under mandatory Quality Control Orders.',
    estimatedDays: 2,
    checklist: [
      { id: '2-1', title: 'Confirm Primary Indian Standard (IS Code)', description: 'Confirm latest version with all active amendments.', isCompleted: true },
      { id: '2-2', title: 'Verify relevant Gazette Quality Control Order', description: 'Cross-check effective enforcement dates and small-scale MSME transition periods.', isCompleted: true }
    ]
  },
  {
    id: 3,
    name: 'Technical Requirements & Gap Review',
    shortTitle: 'Requirements Reviewed',
    status: 'completed',
    description: 'Review design compliance, component approvals, bill of materials, and insulation clearances against standard clauses.',
    estimatedDays: 7,
    checklist: [
      { id: '3-1', title: 'BOM Component Certification Audit', description: 'Verify that safety-critical components (LED drivers, cells) possess individual BIS approvals.', isCompleted: true },
      { id: '3-2', title: 'Enclosure fire flammability pre-check', description: 'Verify raw plastic datasheet specifies UL94 V-0 or glow-wire 850°C rating.', isCompleted: true }
    ]
  },
  {
    id: 4,
    name: 'Laboratory Identification & Sample Preparation',
    shortTitle: 'Laboratory Selection',
    status: 'in_progress',
    description: 'Select a BIS-recognized & NABL-accredited test laboratory and fabricate test samples with required sealing.',
    estimatedDays: 10,
    checklist: [
      { id: '4-1', title: 'Select accredited third-party test laboratory', description: 'Compare laboratory turnaround times, accreditation validity, and geographical proximity.', isCompleted: true },
      { id: '4-2', title: 'Sample preparation & factory pre-testing', description: 'Prepare 3 complete production units with factory test reports for laboratory submission.', isCompleted: false, requiredDocument: 'Sample Dispatch Note & Pre-test Check Sheet' }
    ],
    actionLink: {
      label: 'Find Accredited Laboratory',
      route: '/laboratories'
    }
  },
  {
    id: 5,
    name: 'Product Type Testing Protocol',
    shortTitle: 'Type Testing',
    status: 'in_progress',
    description: 'Comprehensive physical, electrical, and environmental tests performed at third-party accredited lab.',
    estimatedDays: 25,
    checklist: [
      { id: '5-1', title: 'Electrical Safety & High Voltage Breakdown', description: '1500V dielectric insulation verification under Clause 5.2.', isCompleted: true },
      { id: '5-2', title: 'Emergency Lumen Maintenance (Photometry)', description: 'Continuous measurement across 180 minutes discharge duration under Clause 6.3.', isCompleted: false },
      { id: '5-3', title: 'Thermal Endurance & Ingress Protection (IP)', description: 'Oven bake cycling followed by dust and moisture chamber test.', isCompleted: false }
    ]
  },
  {
    id: 6,
    name: 'Documentation & Scheme of Inspection Preparation',
    shortTitle: 'Documentation & STI',
    status: 'in_progress',
    description: 'Compile technical dossier, manufacturing plant layout, in-house test equipment calibration records, and Scheme of Inspection and Testing (SIT).',
    estimatedDays: 8,
    checklist: [
      { id: '6-1', title: 'Prepare Scheme of Inspection and Testing (SIT)', description: 'Define routine and acceptance testing sampling frequencies for factory QA.', isCompleted: true },
      { id: '6-2', title: 'Calibrate in-house laboratory test instruments', description: 'Ensure all factory gauges, multimeters, and high-pot testers have valid NABL calibration certificates.', isCompleted: false, requiredDocument: 'Calibration Certificates Dossier' }
    ]
  },
  {
    id: 7,
    name: 'Manakonline Portal Application Submission',
    shortTitle: 'BIS Portal Filing',
    status: 'pending',
    description: 'Submit formal application under Scheme-I on the official BIS Manakonline portal with required statutory fees.',
    estimatedDays: 5,
    checklist: [
      { id: '7-1', title: 'Fill Form V online on Manakonline', description: 'Upload manufacturing layout, list of machinery, and laboratory test reports.', isCompleted: false },
      { id: '7-2', title: 'Pay statutory application and inspection fees', description: 'Pay application processing fee and first-year minimum marking fee.', isCompleted: false }
    ],
    actionLink: {
      label: 'Open BIS Manakonline Guidance',
      route: '/services'
    }
  },
  {
    id: 8,
    name: 'Factory Inspection & Grant of Licence (CML)',
    shortTitle: 'Grant of Licence',
    status: 'pending',
    description: 'BIS inspecting officer audits manufacturing plant, draws verification samples, and issues Certification of Marks Licence (CML).',
    estimatedDays: 14,
    checklist: [
      { id: '8-1', title: 'Factory physical inspection by BIS officer', description: 'Verification of quality controls, raw material testing, and staff competency.', isCompleted: false },
      { id: '8-2', title: 'Receipt of CML number and ISI mark authorization', description: 'Issuance of 7-digit CML licence number to begin commercial ISI labelling.', isCompleted: false }
    ]
  }
];

export const INITIAL_COMPLIANCE_PROJECTS: ComplianceProject[] = [
  {
    id: 'PRJ-LED-001',
    projectName: 'LED Emergency Light Certification',
    productName: 'Self-Contained LED Emergency Luminaire',
    standardCode: 'IS 10322 (Part 5/Sec 8) : 2013',
    standardId: 'IS-10322-5-8',
    overallProgress: 72,
    lastUpdated: '2026-09-02',
    currentStageId: 4,
    assignedLab: 'National Test House (Northern Region)',
    cmlApplicationNumber: 'APP/2026/DEL/78219',
    stages: DEFAULT_ROADMAP_STAGES
  },
  {
    id: 'PRJ-CKR-002',
    projectName: 'Domestic Pressure Cooker ISI Approval',
    productName: 'Aluminium Inner-Lid Domestic Pressure Cooker (5L)',
    standardCode: 'IS 2347 : 2017',
    standardId: 'IS-2347',
    overallProgress: 45,
    lastUpdated: '2026-08-28',
    currentStageId: 3,
    stages: DEFAULT_ROADMAP_STAGES.map((s, idx) => ({
      ...s,
      status: idx < 2 ? 'completed' : idx === 2 ? 'in_progress' : 'pending',
      checklist: s.checklist.map((c, cIdx) => ({
        ...c,
        isCompleted: idx < 2 || (idx === 2 && cIdx === 0)
      }))
    }))
  },
  {
    id: 'PRJ-STL-003',
    projectName: 'Fe 500D TMT Rebar Compliance',
    productName: 'Thermo-Mechanically Treated High-Strength Steel Bar (12mm)',
    standardCode: 'IS 1786 : 2008',
    standardId: 'IS-1786',
    overallProgress: 20,
    lastUpdated: '2026-08-15',
    currentStageId: 2,
    stages: DEFAULT_ROADMAP_STAGES.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'pending',
      checklist: s.checklist.map(c => ({
        ...c,
        isCompleted: idx === 0
      }))
    }))
  }
];

export function generateRoadmapForProduct(productName: string, matchedStandard: { code: string; id: string }): ComplianceProject {
  const projectId = `PRJ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  return {
    id: projectId,
    projectName: `${productName} Compliance Project`,
    productName,
    standardCode: matchedStandard.code,
    standardId: matchedStandard.id,
    overallProgress: 25,
    lastUpdated: new Date().toISOString().split('T')[0],
    currentStageId: 2,
    stages: DEFAULT_ROADMAP_STAGES.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'pending',
      checklist: s.checklist.map(c => ({
        ...c,
        isCompleted: idx === 0
      }))
    }))
  };
}
