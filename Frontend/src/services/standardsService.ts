import { Standard } from '../types/standards';
import { MOCK_STANDARDS } from '../data/standards';

export interface StandardsFilterOptions {
  query?: string;
  industry?: string;
  status?: string;
  isMandatoryOnly?: boolean;
}

export const standardsService = {
  async getStandards(options?: StandardsFilterOptions): Promise<Standard[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));

    let list = [...MOCK_STANDARDS];

    if (options?.query && options.query.trim() !== '') {
      const q = options.query.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.code.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.industry.toLowerCase().includes(q) ||
          s.scope.toLowerCase().includes(q)
      );
    }

    if (options?.industry && options.industry !== 'All') {
      list = list.filter((s) => s.industry === options.industry);
    }

    if (options?.status && options.status !== 'All') {
      list = list.filter((s) => s.status === options.status);
    }

    if (options?.isMandatoryOnly) {
      list = list.filter((s) => s.isMandatory);
    }

    return list;
  },

  async getStandardById(id: string): Promise<Standard | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_STANDARDS.find(
      (s) => s.id.toLowerCase() === id.toLowerCase() || s.code.toLowerCase().replace(/[\s():/]/g, '-').includes(id.toLowerCase())
    );
  },

  async compareStandards(id1: string, id2: string): Promise<{ standard1?: Standard; standard2?: Standard }> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const standard1 = MOCK_STANDARDS.find((s) => s.id === id1);
    const standard2 = MOCK_STANDARDS.find((s) => s.id === id2);
    return { standard1, standard2 };
  }
};
