import { KnowledgeArticle } from '../types/knowledge';

export const MOCK_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-qco-explained',
    title: 'Understanding Quality Control Orders (QCOs): Mandatory vs Voluntary Standards',
    category: 'Understanding BIS',
    description: 'A comprehensive guide for manufacturers on how the Government of India issues mandatory Quality Control Orders under the BIS Act, 2016.',
    readTime: '6 min read',
    author: 'BIS Regulatory Affairs Desk',
    publishedDate: '2026-08-10',
    tags: ['QCO', 'Mandatory Standards', 'DPIIT', 'MSME Exemption'],
    keyTakeaways: [
      'While Indian Standards are generally voluntary, a Quality Control Order (QCO) issued in the Official Gazette makes compliance legally mandatory.',
      'Manufacturing, importing, storing, or selling goods without BIS certification after a QCO date constitutes a penal offense.',
      'Micro and Small Enterprises (MSEs) frequently receive extended transition periods (usually 6 to 12 additional months).'
    ],
    contentSections: [
      {
        heading: 'What is a Quality Control Order?',
        body: 'The Central Government, under Section 16 of the Bureau of Indian Standards Act, 2016, notifies Quality Control Orders (QCOs) in public interest to safeguard human, animal or plant health, safety of the environment, prevention of unfair trade practices, and national security.'
      },
      {
        heading: 'Legal Ramifications of Non-Compliance',
        body: 'Once a QCO enters into force, no person shall manufacture, import, distribute, sell, hire, lease, store or exhibit for sale any goods that do not conform to the specified Indian Standard and do not bear the Standard Mark under a licence from the Bureau.'
      },
      {
        heading: 'Transition Windows for MSMEs',
        body: 'To prevent supply chain disruptions, recent QCOs issued by DPIIT and Ministry of Steel establish tiered enforcement timelines: Large enterprises comply first, followed by Small enterprises (+6 months) and Micro enterprises (+12 months).'
      }
    ]
  },
  {
    id: 'art-isi-vs-crs',
    title: 'Scheme-I (ISI Mark) vs Scheme-II (CRS): Which Path Applies to Your Product?',
    category: 'Certification',
    description: 'Deciphering the operational, audit, and testing differences between the classic ISI Mark licence and the Compulsory Registration Scheme (CRS).',
    readTime: '5 min read',
    author: 'Conformity Assessment Directorate',
    publishedDate: '2026-07-22',
    tags: ['ISI Mark', 'CRS', 'Scheme I', 'Electronics', 'Factory Inspection'],
    keyTakeaways: [
      'Scheme-I (ISI Mark) requires a rigorous physical factory inspection, in-house laboratory equipment, and continuous surveillance.',
      'Scheme-II (CRS) is a self-declaration scheme primarily for electronics & IT hardware, requiring only third-party lab test reports.',
      'CRS products carry the BIS CRS border logo with an R-Number, while Scheme-I goods carry the iconic ISI monogram with a CML number.'
    ],
    contentSections: [
      {
        heading: 'Core Difference: Inspection vs Paper Assessment',
        body: 'Scheme-I ensures ongoing manufacturing process capability by requiring manufacturers to maintain in-house test facilities. In contrast, Scheme-II (CRS) is designed for fast-moving technology products where the manufacturer provides a formal Undertaking of Conformity alongside a test report from a BIS-recognized laboratory.'
      },
      {
        heading: 'Cost and Timeline Implications',
        body: 'Scheme-I typically takes 45 to 60 days due to the mandatory physical factory inspection and sample drawing. Scheme-II (CRS) can be completed within 15 to 25 days provided lab test reports are available.'
      }
    ]
  },
  {
    id: 'art-how-to-read-clause',
    title: 'How to Read an Indian Standard: Deconstructing Clauses, Tolerances & SIT',
    category: 'Indian Standards',
    description: 'An engineering roadmap to breaking down an IS document into actionable engineering specifications and quality control checks.',
    readTime: '7 min read',
    author: 'Standards Formulation Cell',
    publishedDate: '2026-06-15',
    tags: ['IS Clauses', 'SIT', 'Routine Tests', 'Acceptance Tests'],
    keyTakeaways: [
      'Understand the distinction between Type Tests, Routine Tests, and Acceptance Tests.',
      'The Scheme of Inspection and Testing (SIT) defines the exact sampling frequency mandated for every production heat or batch.',
      'Always verify whether an Amendment replaces or supplements specific clause wording.'
    ],
    contentSections: [
      {
        heading: 'Classification of Test Protocols',
        body: 'Type tests verify basic design and material characteristics and are usually done during licence grant. Routine tests are 100% tests carried out by the manufacturer on every finished unit (e.g. electrical flash test). Acceptance tests are performed on random lots to determine batch acceptability.'
      }
    ]
  },
  {
    id: 'art-huid-consumer-guide',
    title: 'Gold Hallmarking & HUID: How Consumers Can Verify Pure Gold in Seconds',
    category: 'Hallmarking',
    description: 'Learn how to verify the 6-digit Hallmark Unique Identification (HUID) code stamped on gold jewellery using digital tools.',
    readTime: '4 min read',
    author: 'Consumer Protection Directorate',
    publishedDate: '2026-08-25',
    tags: ['Gold Purity', 'HUID', 'Consumer Tips', 'Hallmarking'],
    keyTakeaways: [
      'Hallmarked gold jewellery in India carries three distinct marks: BIS Logo, Purity in Karat & Fineness, and 6-character alphanumeric HUID.',
      'Consumers can verify the jeweller registration, date of hallmarking, and tested purity through the BIS Care app or BIS Sahayak.',
      'Selling non-hallmarked gold in notified districts is strictly prohibited by law.'
    ],
    contentSections: [
      {
        heading: 'Anatomy of Genuine Gold Hallmarking',
        body: 'Every certified gold ornament must bear: (1) The triangular BIS logo, (2) Purity stamp such as 22K916 (91.6% pure) or 18K750 (75.0% pure), and (3) The unique 6-digit laser-engraved HUID code assigned by the Assaying and Hallmarking Centre.'
      }
    ]
  },
  {
    id: 'art-msme-subsidies',
    title: 'BIS Subsidies and Concessions for MSMEs & Women-Led Startups',
    category: 'Compliance Basics',
    description: 'Detailed review of fee rebates, fast-track processing, and financial support available under the Ministry of MSME guidelines.',
    readTime: '5 min read',
    author: 'MSME Growth Desk',
    publishedDate: '2026-07-05',
    tags: ['MSME', 'Subsidies', 'Startup India', 'Marking Fee Rebate'],
    keyTakeaways: [
      'Micro enterprises receive a 50% flat concession on both application fees and annual minimum marking fees.',
      'Small enterprises receive a 20% flat concession on marking fees.',
      'DPIIT-recognized Startups can leverage simplified testing schemes and dedicated branch office liaison officers.'
    ],
    contentSections: [
      {
        heading: 'Availing the 50% Concession',
        body: 'To avail the 50% fee concession, manufacturers need only provide their active Udyam Registration Certificate during the Manakonline application submission. The portal automatically computes the discounted fee schedule.'
      }
    ]
  }
];
