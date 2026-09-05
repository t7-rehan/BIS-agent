import { RegulatoryAlert } from '../types/alerts';
import { MOCK_ALERTS } from '../data/alerts';

export const alertService = {
  async getAlerts(severity?: string): Promise<RegulatoryAlert[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (!severity || severity === 'All') return [...MOCK_ALERTS];
    return MOCK_ALERTS.filter((a) => a.severity === severity);
  },

  async getAlertById(id: string): Promise<RegulatoryAlert | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return MOCK_ALERTS.find((a) => a.id === id);
  }
};
