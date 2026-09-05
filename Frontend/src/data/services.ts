import { BISService } from '../types/services';

export const MOCK_SERVICES: BISService[] = [
  // Certification
  {
    id: 'srv-isi-mark',
    category: 'CERTIFICATION',
    title: 'Product Certification Scheme (Scheme-I / ISI Mark)',
    shortDescription: 'The flagship BIS scheme granting licence to use the standard ISI mark on manufactured goods meeting Indian Standards.',
    fullDescription: 'Under Scheme-I, manufacturers establish internal quality control facilities, adhere to the Scheme of Inspection and Testing (SIT), and undergo third-party laboratory verification before being granted a Certification of Marks Licence (CML).',
    iconName: 'ShieldCheck',
    eligibility: 'Domestic and foreign manufacturing units with factory-level quality infrastructure.',
    portalUrlName: 'Manakonline Portal',
    keySteps: [
      'Preliminary factory quality infrastructure assessment',
      'Testing of sample in BIS recognized NABL laboratory',
      'Submission of Form V on Manakonline with fee remittance',
      'Factory verification inspection by BIS officer',
      'Grant of 7-digit CML licence number'
    ],
    documentsRequired: [
      'Manufacturing machinery layout & process flow chart',
      'List of in-house testing equipment with calibration records',
      'Independent laboratory test reports',
      'MSME / Udyam registration certificate'
    ],
    timeline: '30 to 60 days (Fast track available for MSMEs with pre-tested samples)',
    badge: 'Flagship'
  },
  {
    id: 'srv-crs-scheme',
    category: 'CERTIFICATION',
    title: 'Compulsory Registration Scheme (Scheme-II / CRS)',
    shortDescription: 'Self-declaration of conformity for electronics, IT goods, and solar components notified by MeitY and MNRE.',
    fullDescription: 'Scheme-II enables faster market access for electronics and IT hardware. Manufacturers submit test reports from BIS recognized labs directly to obtain a Registration Number (R-Number) without mandatory prior factory inspection.',
    iconName: 'Cpu',
    eligibility: 'Manufacturers of electronic and IT products listed in the CRO schedules.',
    portalUrlName: 'BIS CRS Portal',
    keySteps: [
      'Sample testing at BIS recognized Indian lab',
      'Generation of test report in CRS portal format',
      'Online submission of application within 90 days of test report',
      'Verification and issuance of R-Number'
    ],
    documentsRequired: [
      'Valid test report from BIS recognized Indian lab',
      'Brand authorization letter / Trademark certificate',
      'Indian Representative (AIR) authorization for foreign entities'
    ],
    timeline: '15 to 25 days',
    badge: 'Electronics & IT'
  },
  {
    id: 'srv-fmcs',
    category: 'CERTIFICATION',
    title: 'Foreign Manufacturers Certification Scheme (FMCS)',
    shortDescription: 'Grant of ISI mark licence to overseas manufacturing plants exporting goods into the Indian domestic market.',
    fullDescription: 'Overseas manufacturers producing goods covered under mandatory Indian QCOs must obtain a BIS licence through an appointed Authorized Indian Representative (AIR).',
    iconName: 'Globe',
    eligibility: 'Manufacturing locations located outside the territory of India.',
    portalUrlName: 'FMCS Central Portal',
    keySteps: [
      'Appointment of Authorized Indian Representative (AIR)',
      'Submission of application dossier to BIS HQ New Delhi',
      'Physical inspection of overseas factory premises by BIS audit team',
      'Testing of witness samples in designated laboratory'
    ],
    documentsRequired: [
      'Business licence in country of origin',
      'AIR agreement with resident Indian citizen/firm',
      'Detailed manufacturing and test equipment inventory'
    ],
    timeline: '90 to 180 days',
    badge: 'International'
  },
  {
    id: 'srv-cert-guidance',
    category: 'CERTIFICATION',
    title: 'Certification Guidance & MSME Concessions',
    shortDescription: 'Special fee rebates, simplified testing guidelines, and incubation assistance for MSMEs and Women-led Startups.',
    fullDescription: 'BIS provides a 50% concession on minimum marking fee for micro-enterprises and a 20% concession for small enterprises, alongside fast-track scrutiny under Startup India initiatives.',
    iconName: 'Award',
    eligibility: 'Registered Micro, Small, and Medium Enterprises (Udyam) and DPIIT recognized Startups.',
    portalUrlName: 'MSME Helpdesk',
    keySteps: [
      'Verification of Udyam registration category',
      'Application fee concession calculation',
      'Dedicated technical handholding by local BIS Branch Office'
    ],
    documentsRequired: [
      'Udyam Registration Certificate',
      'DPIIT Startup Recognition Certificate (if applicable)',
      'Bank statement verifying MSME category turnover'
    ],
    timeline: 'Ongoing facilitation',
    badge: '50% MSME Rebate'
  },

  // Standards
  {
    id: 'srv-find-standard',
    category: 'STANDARDS',
    title: 'Search & Procure Indian Standards',
    shortDescription: 'Access over 21,000 active Indian Standards (IS), sectional committees, and draft documents under public consultation.',
    fullDescription: 'Search the complete repository of Indian Standards, view scope and amendments, and download standards through the official BIS Standards Portal.',
    iconName: 'FileText',
    eligibility: 'Open to all industries, researchers, academia, and the public.',
    portalUrlName: 'Standards Sales Portal',
    keySteps: [
      'Search by IS number or industry keyword',
      'Preview scope and table of contents',
      'Download draft standards for public commenting'
    ],
    documentsRequired: ['User registration (free)'],
    timeline: 'Instant digital access'
  },
  {
    id: 'srv-amendments',
    category: 'STANDARDS',
    title: 'Amendments & Gazette Quality Control Orders (QCOs)',
    shortDescription: 'Track mandatory Quality Control Orders issued by Central Ministries enforcing compulsory BIS compliance.',
    fullDescription: 'Real-time database of QCOs issued by DPIIT, Ministry of Steel, MeitY, Ministry of Heavy Industries, and Ministry of Chemicals.',
    iconName: 'AlertTriangle',
    eligibility: 'Manufacturers, importers, and supply chain managers.',
    portalUrlName: 'Gazette QCO Tracker',
    keySteps: [
      'Filter by administrative ministry and HS code',
      'Check enforcement timeline and grace period extensions',
      'Download official Gazette PDF notification'
    ],
    documentsRequired: ['None (Public regulatory repository)'],
    timeline: 'Updated daily'
  },

  // Testing
  {
    id: 'srv-lrs',
    category: 'TESTING',
    title: 'Laboratory Recognition Scheme (LRS)',
    shortDescription: 'Empanelment and auditing of private and governmental testing laboratories across India.',
    fullDescription: 'Private and autonomous laboratories conforming to ISO/IEC 17025 apply for BIS recognition to test regulatory samples drawn for conformity assessment.',
    iconName: 'FlaskConical',
    eligibility: 'NABL accredited test laboratories across civil, mechanical, electrical, chemical, and biological domains.',
    portalUrlName: 'BIS LRS Portal',
    keySteps: [
      'Verification of NABL accreditation scope',
      'On-site technical assessment by BIS laboratory cell',
      'Proficiency testing (PT) round validation',
      'Issuance of BIS Recognition Certificate'
    ],
    documentsRequired: [
      'NABL Accreditation Certificate and scope schedule',
      'Calibration records with unbroken traceability to NPL',
      'Proficiency test results'
    ],
    timeline: '45 to 60 days'
  },

  // Hallmarking
  {
    id: 'srv-hallmark',
    category: 'HALLMARKING',
    title: 'Gold & Silver Hallmarking (HUID System)',
    shortDescription: 'Mandatory purity certification of gold jewellery using a 6-digit alphanumeric Hallmark Unique Identification code.',
    fullDescription: 'Protects consumers from purity adulteration. Each gold piece is tested at an Assaying & Hallmarking Centre (AHC) and laser-marked with BIS Logo, purity grade (e.g. 22K916), and unique HUID.',
    iconName: 'Sparkles',
    eligibility: 'Jewellers selling gold jewellery and Assaying & Hallmarking Centres (AHCs).',
    portalUrlName: 'Manakonline Hallmarking',
    keySteps: [
      'One-time jeweller registration on Manakonline (Zero fee)',
      'Dispatch jewellery lots to certified AHC',
      'Assay fire test and XRF spectroscopic analysis',
      'Laser embossing of 6-digit HUID code'
    ],
    documentsRequired: [
      'GSTIN Certificate',
      'Shop and Establishment Act licence / Municipal registration',
      'Proof of outlet address'
    ],
    timeline: 'Instant registration for jewellers; 24-48 hr lot turnaround'
  },

  // Consumers
  {
    id: 'srv-consumer-verify',
    category: 'CONSUMERS',
    title: 'Verify ISI Licence (CML) & R-Number',
    shortDescription: 'Public verification tool to validate whether an ISI mark or CRS number printed on a product is genuine.',
    fullDescription: 'Consumers and procurement teams can verify manufacturer name, factory address, brand, standard validity, and product scope by entering the 7-digit CML number.',
    iconName: 'SearchCheck',
    eligibility: 'All Indian citizens, corporate buyers, and institutional tenders.',
    portalUrlName: 'BIS Care Portal',
    keySteps: [
      'Locate 7-digit CML number below the ISI monogram on product',
      'Enter CML or R-number in verification box',
      'Instantly view manufacturer credentials and licence expiry'
    ],
    documentsRequired: ['None'],
    timeline: 'Instant'
  },
  {
    id: 'srv-consumer-complaint',
    category: 'CONSUMERS',
    title: 'Lodge Complaint for Substandard / Fake ISI Goods',
    shortDescription: 'Direct redressal portal for reporting misuse of ISI mark, un-hallmarked gold, or hazardous substandard consumer goods.',
    fullDescription: 'Enforcement officers conduct search and seizure raids on reported premises. Whistleblowers can track complaint progress with guaranteed confidentiality.',
    iconName: 'MessageSquareWarning',
    eligibility: 'Consumers, trade associations, and vigilant citizens.',
    portalUrlName: 'BIS Redressal Cell',
    keySteps: [
      'Submit product details, seller invoice, and store location',
      'Attach photograph of defective product and spurious marking',
      'Track investigation status via unique complaint reference ID'
    ],
    documentsRequired: ['Invoice/Cash receipt (preferred)', 'Photograph of product and packaging'],
    timeline: 'Investigation initiated within 7 working days'
  }
];
