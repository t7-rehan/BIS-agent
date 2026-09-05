import { ComplianceProject } from '../types/compliance';
import { INITIAL_COMPLIANCE_PROJECTS, generateRoadmapForProduct } from '../data/compliance';
import { MOCK_STANDARDS } from '../data/standards';

// In-memory store for interactive session changes
let projectsStore: ComplianceProject[] = [...INITIAL_COMPLIANCE_PROJECTS];

export const complianceService = {
  async getProjects(): Promise<ComplianceProject[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...projectsStore];
  },

  async getProjectById(id: string): Promise<ComplianceProject | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return projectsStore.find((p) => p.id.toLowerCase() === id.toLowerCase());
  },

  async createProject(productName: string, preferredStandardId?: string): Promise<ComplianceProject> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let matched = MOCK_STANDARDS[0];
    if (preferredStandardId) {
      const found = MOCK_STANDARDS.find((s) => s.id === preferredStandardId);
      if (found) matched = found;
    } else {
      const lower = productName.toLowerCase();
      if (lower.includes('cooker')) matched = MOCK_STANDARDS.find((s) => s.id === 'IS-2347') || matched;
      else if (lower.includes('steel') || lower.includes('tmt')) matched = MOCK_STANDARDS.find((s) => s.id === 'IS-1786') || matched;
      else if (lower.includes('helmet')) matched = MOCK_STANDARDS.find((s) => s.id === 'IS-4151') || matched;
      else if (lower.includes('battery')) matched = MOCK_STANDARDS.find((s) => s.id === 'IS-14144') || matched;
    }

    const newProject = generateRoadmapForProduct(productName, { code: matched.code, id: matched.id });
    projectsStore.unshift(newProject);
    return newProject;
  },

  async toggleChecklistItem(projectId: string, stageId: number, itemId: string): Promise<ComplianceProject | undefined> {
    const projectIndex = projectsStore.findIndex((p) => p.id === projectId);
    if (projectIndex === -1) return undefined;

    const project = { ...projectsStore[projectIndex] };
    const stage = project.stages.find((s) => s.id === stageId);
    if (!stage) return project;

    const item = stage.checklist.find((c) => c.id === itemId);
    if (!item) return project;

    item.isCompleted = !item.isCompleted;

    // Recalculate progress
    const allItems = project.stages.flatMap((s) => s.checklist);
    const completedItems = allItems.filter((c) => c.isCompleted).length;
    project.overallProgress = Math.round((completedItems / allItems.length) * 100);

    // Update stage statuses
    for (const s of project.stages) {
      const stageDone = s.checklist.every((c) => c.isCompleted);
      const stageSome = s.checklist.some((c) => c.isCompleted);
      if (stageDone) s.status = 'completed';
      else if (stageSome) s.status = 'in_progress';
      else s.status = 'pending';
    }

    projectsStore[projectIndex] = project;
    return project;
  }
};
