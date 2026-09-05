import { Laboratory } from '../types/laboratories';
import { MOCK_LABORATORIES } from '../data/laboratories';

export interface LabFilterOptions {
  query?: string;
  region?: string;
  capability?: string;
  samplePickupOnly?: boolean;
}

export const laboratoryService = {
  async getLaboratories(options?: LabFilterOptions): Promise<Laboratory[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    let labs = [...MOCK_LABORATORIES];

    if (options?.query && options.query.trim() !== '') {
      const q = options.query.toLowerCase().trim();
      labs = labs.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          l.capabilities.some((c) => c.toLowerCase().includes(q)) ||
          l.supportedStandards.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (options?.region && options.region !== 'All') {
      labs = labs.filter((l) => l.region === options.region);
    }

    if (options?.capability && options.capability !== 'All') {
      const cap = options.capability.toLowerCase();
      labs = labs.filter((l) => l.capabilities.some((c) => c.toLowerCase().includes(cap)));
    }

    if (options?.samplePickupOnly) {
      labs = labs.filter((l) => l.samplePickupAvailable);
    }

    return labs;
  },

  async getLaboratoryById(id: string): Promise<Laboratory | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return MOCK_LABORATORIES.find((l) => l.id.toLowerCase() === id.toLowerCase());
  }
};
