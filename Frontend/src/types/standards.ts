export interface StandardClause {
  clauseNumber: string;
  title: string;
  summary: string;
  mandatory: boolean;
}

export interface TestRequirement {
  name: string;
  methodStandard: string;
  frequency: string;
  criticalParameters: string;
}

export interface Standard {
  id: string; // e.g. "IS-10322-5-8"
  code: string; // e.g. "IS 10322 (Part 5/Sec 8) : 2013"
  title: string;
  industry: 'Electrical & Electronics' | 'Mechanical' | 'Civil & Metallurgy' | 'Automotive' | 'Consumer Goods' | 'Chemical';
  category: string;
  status: 'Active' | 'Under Revision' | 'Withdrawn';
  isMandatory: boolean;
  qcoReference?: string; // Quality Control Order citation
  qcoEffectiveDate?: string;
  certificationScheme: 'Scheme I (ISI Mark)' | 'Scheme II (CRS - Compulsory Registration)' | 'FMCS' | 'Voluntary';
  scope: string;
  keyRequirements: string[];
  clauses: StandardClause[];
  testingRequirements: TestRequirement[];
  relatedStandards: { code: string; title: string }[];
  amendments: { amendmentNumber: string; date: string; summary: string }[];
  year: number;
  laboratoryTestingDaysEst: number;
}
