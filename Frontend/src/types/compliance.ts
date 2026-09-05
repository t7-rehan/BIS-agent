export type StageStatus = 'completed' | 'in_progress' | 'pending' | 'blocked';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  requiredDocument?: string;
  guidanceNote?: string;
}

export interface RoadmapStage {
  id: number;
  name: string;
  shortTitle: string;
  status: StageStatus;
  description: string;
  estimatedDays: number;
  checklist: ChecklistItem[];
  actionLink?: {
    label: string;
    route: string;
  };
}

export interface ComplianceProject {
  id: string;
  projectName: string;
  productName: string;
  standardCode: string;
  standardId: string;
  overallProgress: number; // percentage, e.g. 72%
  lastUpdated: string;
  currentStageId: number;
  stages: RoadmapStage[];
  assignedLab?: string;
  cmlApplicationNumber?: string;
}
