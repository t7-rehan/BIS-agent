import { RegulatoryAlert } from '../types/alerts';

export const MOCK_ALERTS: RegulatoryAlert[] = [
  {
    id: 'ALT-2026-09-01',
    title: 'Standard Revision: IS 10322 (Part 5/Sec 8) Amendment No. 2 Enforced',
    summary: 'Amendment No. 2 introducing tightened endurance cycling for high-ambient industrial emergency luminaires (up to 50°C) is now mandatory for all active licence holders.',
    affectedStandardCode: 'IS 10322 (Part 5/Sec 8) : 2013',
    affectedStandardId: 'IS-10322-5-8',
    industry: 'Electrical & Electronics',
    sourceMinistry: 'Bureau of Indian Standards / DPIIT',
    datePublished: '2026-09-01',
    effectiveDate: '2026-11-01',
    severity: 'warning',
    gazetteNotificationRef: 'BIS/PUB/CMD-I/2026/1182',
    actionRequired: 'Update Factory Test Records & re-verify ambient temperature ratings on product labels.'
  },
  {
    id: 'ALT-2026-08-18',
    title: 'QCO Enforcement: Stainless Steel Cookware Mandatory Compliance Extended',
    summary: 'The Ministry of Consumer Affairs has issued a 90-day grace period extension for Micro-enterprises manufacturing domestic stainless steel pressure cookers and utensils.',
    affectedStandardCode: 'IS 2347 : 2017',
    affectedStandardId: 'IS-2347',
    industry: 'Mechanical / Domestic Appliances',
    sourceMinistry: 'Ministry of Consumer Affairs, Food & Public Distribution',
    datePublished: '2026-08-18',
    effectiveDate: '2026-12-31',
    severity: 'info',
    gazetteNotificationRef: 'Gazette S.O. 3491(E)',
    actionRequired: 'Verify MSME Udyam status to ensure eligibility for the extended transition window.'
  },
  {
    id: 'ALT-2026-08-05',
    title: 'CRITICAL: Mandatory QCO Enforcement on Low-Carbon Structural Steel',
    summary: 'Customs ICEGATE automated BIS verification activated for all imported structural steel billets and rebars. Shipments without valid CML or FMCS licence will be detained.',
    affectedStandardCode: 'IS 1786 : 2008',
    affectedStandardId: 'IS-1786',
    industry: 'Civil & Metallurgy',
    sourceMinistry: 'Ministry of Steel / CBIC',
    datePublished: '2026-08-05',
    effectiveDate: '2026-08-15',
    severity: 'critical',
    gazetteNotificationRef: 'CBIC Circular No. 19/2026-Customs',
    actionRequired: 'Link 7-digit CML licence number with Bill of Entry prior to port arrival.'
  },
  {
    id: 'ALT-2026-07-28',
    title: 'Draft Standard for EV Battery Swapping Safety Open for Public Comments',
    summary: 'Sectional committee TED 26 has published draft standard for quick-swap electric 2W/3W battery docking interfaces. Stakeholder feedback deadline is 45 days.',
    affectedStandardCode: 'Draft IS 18320 (Part 1)',
    industry: 'Automotive & Clean Mobility',
    sourceMinistry: 'BIS Transport Engineering Division',
    datePublished: '2026-07-28',
    effectiveDate: '2026-10-15',
    severity: 'info',
    gazetteNotificationRef: 'BIS/TED/26/Draft-04',
    actionRequired: 'Review draft specifications and submit committee comments via Standards Portal.'
  }
];
