export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface RegulatoryAlert {
  id: string;
  title: string;
  summary: string;
  affectedStandardCode: string;
  affectedStandardId?: string;
  industry: string;
  sourceMinistry: string;
  datePublished: string;
  effectiveDate: string;
  severity: AlertSeverity;
  gazetteNotificationRef: string;
  actionRequired: string;
  isRead?: boolean;
}
