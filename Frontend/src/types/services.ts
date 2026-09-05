export type ServiceCategory = 'CERTIFICATION' | 'STANDARDS' | 'TESTING' | 'HALLMARKING' | 'CONSUMERS';

export interface BISService {
  id: string;
  category: ServiceCategory;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  eligibility: string;
  portalUrlName: string;
  keySteps: string[];
  documentsRequired: string[];
  timeline: string;
  badge?: string;
}
