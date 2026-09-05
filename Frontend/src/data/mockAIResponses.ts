import { AIStructuredResponse } from '../types/ai';

export const AI_KNOWLEDGE_BASE: Record<string, AIStructuredResponse> = {
  led: {
    productIdentified: 'LED Emergency Light / Luminaire',
    confidence: 'HIGH',
    confidenceScore: 96,
    summary: 'Self-contained LED emergency lighting equipment is governed under Indian Standard IS 10322 (Part 5/Sec 8) : 2013 and is under mandatory certification under the Electrical Equipment (Quality Control) Order. Mandatory ISI Mark (Scheme-I) applies.',
    applicableStandards: [
      {
        id: 'IS-10322-5-8',
        code: 'IS 10322 (Part 5/Sec 8) : 2013',
        title: 'Luminaires - Particular Requirements - Emergency Lighting',
        matchScore: '98% Match',
        isMandatory: true
      },
      {
        id: 'IS-16102-1',
        code: 'IS 16102 (Part 1) : 2012',
        title: 'Self-Ballasted LED Lamps - Safety Requirements',
        matchScore: '84% Component Match',
        isMandatory: true
      }
    ],
    regulatoryStatus: {
      isMandatory: true,
      orderName: 'Electrical Equipment (Quality Control) Order, 2020',
      effectiveDate: 'Enforced since March 2021 (All categories)',
      enforcingMinistry: 'Ministry of Commerce & Industry (DPIIT)'
    },
    keyRequirements: [
      {
        category: 'Product & Construction Requirements',
        points: [
          'Self-contained luminaire must switch to emergency battery mode within 5 seconds of mains failure.',
          'Enclosure must satisfy glow-wire 850°C flammability test (fire retardant).',
          'Minimum rated backup duration: 1 hour, 2 hours, or 3 hours indelibly marked on chassis.'
        ]
      },
      {
        category: 'Electrical Safety Requirements',
        points: [
          'High Voltage Dielectric Test: 1500 V AC applied for 60 seconds with leakage current < 0.5 mA.',
          'Insulation resistance between live terminal parts and outer accessible frame must exceed 2.0 MΩ.',
          'Internal battery overcharge and deep discharge cut-off protection must be fail-safe.'
        ]
      },
      {
        category: 'Documentation Requirements',
        points: [
          'In-house factory Scheme of Inspection and Testing (SIT) manual conforming to BIS Scheme-I.',
          'Valid NABL test reports for raw plastic flammability and secondary battery cell compliance (IS 16046).',
          'Plant machinery layout and calibration certificates for factory high-pot and multimeter instruments.'
        ]
      }
    ],
    testingProtocols: [
      'Dielectric Insulation & High-Voltage Flash Breakdown',
      'Continuous Luminous Flux (Lumen Output) Discharge Photometry',
      'Battery Float Life & Temperature Endurance in 50°C Environmental Chamber',
      'Ingress Protection (Minimum IP20 for Indoor / IP65 for Weatherproof Emergency Luminaires)'
    ],
    nextActions: [
      {
        step: 1,
        action: 'Confirm Applicable Standard & Scope',
        description: 'Review IS 10322 (Part 5/Sec 8) specific clauses for your exact wattage and battery chemistry.',
        targetRoute: '/standards/IS-10322-5-8',
        actionLabel: 'View Standard Clauses'
      },
      {
        step: 2,
        action: 'Review Mandatory QCO Requirements',
        description: 'Verify DPIIT QCO enforcement timelines and check MSME concession eligibility.',
        targetRoute: '/alerts',
        actionLabel: 'Check QCO Details'
      },
      {
        step: 3,
        action: 'Identify Testing Laboratory',
        description: 'Locate a BIS-recognized & NABL-accredited test lab equipped with emergency luminaire goniophotometry.',
        targetRoute: '/laboratories',
        actionLabel: 'Find Testing Labs'
      },
      {
        step: 4,
        action: 'Build Compliance Roadmap',
        description: 'Generate an 8-stage compliance timeline from factory pre-test to Manakonline CML grant.',
        targetRoute: '/compliance',
        actionLabel: 'Start Compliance Journey'
      },
      {
        step: 5,
        action: 'Proceed with Formal BIS Application',
        description: 'Submit Form V under Product Certification Scheme-I with statutory fee schedule.',
        targetRoute: '/services',
        actionLabel: 'Explore BIS Services'
      }
    ],
    sources: [
      {
        id: 'src-1',
        sourceType: 'Indian Standard',
        title: 'IS 10322 (Part 5/Sec 8) : 2013',
        reference: 'Clause 5.2 - Electrical Safety & Insulation Resistance',
        excerpt: 'Dielectric strength test at 1500V AC between live parts and accessible metallic enclosure. Insulation resistance shall be greater than 2 MΩ.',
        dateOrVersion: 'Reaffirmed 2023'
      },
      {
        id: 'src-2',
        sourceType: 'QCO Gazette Notification',
        title: 'Electrical Equipment (Quality Control) Order, 2020',
        reference: 'Gazette S.O. 3824(E) Section 3',
        excerpt: 'Goods specified in column (1) shall conform to the corresponding Indian Standard and shall bear the Standard Mark under a licence from the Bureau of Indian Standards as per Scheme-I of Schedule-II of BIS (Conformity Assessment) Regulations, 2018.',
        dateOrVersion: 'Gazette of India, Published 2020-11-18'
      },
      {
        id: 'src-3',
        sourceType: 'BIS Scheme Manual',
        title: 'BIS Certification Scheme-I (Product Certification) Operational Guidelines',
        reference: 'Section 4.3 - Scheme of Inspection and Testing (SIT)',
        excerpt: 'The applicant must maintain a fully equipped factory test laboratory for routine testing of high voltage breakdown and emergency switch-over timing.',
        dateOrVersion: 'Rev 4, 2024'
      }
    ],
    reasoningPipeline: [
      { step: 1, name: 'Understand Query', description: 'Extracted intent: Manufacturing LED emergency lighting; regulatory scope query.', status: 'completed', outputSnippet: 'Product: LED Emergency Light | Intent: Mandatory BIS Requirements' },
      { step: 2, name: 'Identify Product', description: 'Matched product taxonomy against BIS product schedules and ITC-HS classifications.', status: 'completed', outputSnippet: 'Matched code: Luminaires for Emergency Lighting (8539 / 9405)' },
      { step: 3, name: 'Retrieve BIS Sources', description: 'Queried standards index, Gazette QCO notifications, and Scheme-I regulatory manuals.', status: 'completed', outputSnippet: 'Retrieved IS 10322 (Pt 5/Sec 8), DPIIT QCO S.O. 3824(E)' },
      { step: 4, name: 'Rank Relevant Information', description: 'Ranked clauses by safety impact, mandatory enforcement status, and test parameters.', status: 'completed', outputSnippet: 'Primary: IS 10322-5-8 (Score: 0.98), Secondary: IS 16102-1' },
      { step: 5, name: 'Generate Answer', description: 'Synthesized structured guidance detailing product, electrical, testing, and roadmap steps.', status: 'completed', outputSnippet: 'Synthesized actionable 5-step roadmap' },
      { step: 6, name: 'Validate Evidence', description: 'Verified clause numbers, statutory order citations, and active validity of gazette references.', status: 'completed', outputSnippet: 'Evidence confidence: HIGH (96% ground truth match)' }
    ],
    disclaimer: 'Demo response — prototype data. BIS Sahayak provides informational guidance. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative.'
  },

  pressure_cooker: {
    productIdentified: 'Domestic Pressure Cooker',
    confidence: 'HIGH',
    confidenceScore: 98,
    summary: 'Domestic pressure cookers are under strict mandatory certification under IS 2347 : 2017 pursuant to the Domestic Pressure Cooker (Quality Control) Order. The standard mandates Scheme-I (ISI Mark) and penalizes non-certified sale.',
    applicableStandards: [
      {
        id: 'IS-2347',
        code: 'IS 2347 : 2017',
        title: 'Domestic Pressure Cookers - Specification',
        matchScore: '99% Match',
        isMandatory: true
      }
    ],
    regulatoryStatus: {
      isMandatory: true,
      orderName: 'Domestic Pressure Cooker (Quality Control) Order, 2020',
      effectiveDate: 'Enforced since February 2021',
      enforcingMinistry: 'Ministry of Consumer Affairs, Food and Public Distribution'
    },
    keyRequirements: [
      {
        category: 'Pressure Safety & Relief Mechanisms',
        points: [
          'Mandatory secondary safety relief device (fusible plug or gasket release system) releasing at 130 to 180 kPa.',
          'Proof hydrostatic pressure test at 200 kPa for 2 minutes without permanent distortion or leak.',
          'Bursting pressure test threshold: Vessel must not rupture below 300 kPa gauge pressure.'
        ]
      },
      {
        category: 'Food Contact & Material Standards',
        points: [
          'Aluminium alloy conforming to IS 21 or food-grade stainless steel AISI 304 (04Cr18Ni10).',
          'Rubber gaskets must satisfy food-grade migration and thermal aging under IS 7466.',
          'Zero toxic heavy metal (lead, cadmium) migration into food simulants.'
        ]
      },
      {
        category: 'Marking & Traceability',
        points: [
          'Mandatory ISI Mark prominently stamped on body and lid alongside 7-digit CML licence number.',
          'Nominal capacity in litres, operating pressure (98 kPa), and manufacturer name permanently embossed.'
        ]
      }
    ],
    testingProtocols: [
      'Hydrostatic Proof Pressure Test (200 kPa / 2 min) - 100% Routine Test',
      'Hydraulic Burst Pressure Test (> 300 kPa) - Batch Sampling',
      'Safety Relief Mechanism Operating Pressure Validation (130-180 kPa)',
      'Overall Heavy Metal Migration Test for Cooking Surfaces'
    ],
    nextActions: [
      {
        step: 1,
        action: 'Review IS 2347 Clauses',
        description: 'Verify lid locking dimensions, wall thickness tolerances, and valve specifications.',
        targetRoute: '/standards/IS-2347',
        actionLabel: 'Inspect IS 2347'
      },
      {
        step: 2,
        action: 'Setup In-house Hydrostatic Pressure Rig',
        description: 'Ensure your factory has calibrated hydrostatic testing equipment as mandated by the Scheme of Testing (SIT).',
        targetRoute: '/compliance',
        actionLabel: 'View Factory Checklist'
      },
      {
        step: 3,
        action: 'Find Pressure Vessel Testing Lab',
        description: 'Locate a BIS recognized lab for burst pressure and gasket migration testing.',
        targetRoute: '/laboratories',
        actionLabel: 'Locate Labs'
      },
      {
        step: 4,
        action: 'Submit Online Application on Manakonline',
        description: 'File under Scheme-I for factory inspection and grant of ISI mark licence.',
        targetRoute: '/services',
        actionLabel: 'BIS Services'
      }
    ],
    sources: [
      {
        id: 'src-pc-1',
        sourceType: 'Indian Standard',
        title: 'IS 2347 : 2017',
        reference: 'Clause 7.1 - Hydrostatic Proof Pressure',
        excerpt: 'Every pressure cooker shall withstand hydraulic pressure of 200 kPa for a minimum of 2 minutes without any leakage or permanent deformation.',
        dateOrVersion: 'Revision 2017'
      },
      {
        id: 'src-pc-2',
        sourceType: 'QCO Gazette Notification',
        title: 'Domestic Pressure Cooker (Quality Control) Order, 2020',
        reference: 'Gazette S.O. 297(E) Section 2',
        excerpt: 'No person shall manufacture, import, store, sell, or distribute domestic pressure cookers without bearing the Standard Mark under a licence from the Bureau.',
        dateOrVersion: 'Gazette of India, Published 2020-01-21'
      }
    ],
    reasoningPipeline: [
      { step: 1, name: 'Understand Query', description: 'Extracted product: Domestic pressure cooker; intent: BIS certification requirements.', status: 'completed' },
      { step: 2, name: 'Identify Product', description: 'Matched product: Cookware with pressure containment (Tariff 7615 / 7323).', status: 'completed' },
      { step: 3, name: 'Retrieve BIS Sources', description: 'Queried IS 2347 : 2017 and Consumer Affairs QCO S.O. 297(E).', status: 'completed' },
      { step: 4, name: 'Rank Relevant Information', description: 'Prioritized secondary safety release, burst pressure, and mandatory ISI mark rules.', status: 'completed' },
      { step: 5, name: 'Generate Answer', description: 'Built compliance guidelines with testing requirements and factory readiness items.', status: 'completed' },
      { step: 6, name: 'Validate Evidence', description: 'Validated against active Gazette order and BIS Scheme-I manual.', status: 'completed' }
    ],
    disclaimer: 'Demo response — prototype data. BIS Sahayak provides informational guidance. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative.'
  },

  steel: {
    productIdentified: 'TMT High-Strength Deformed Steel Bars (Fe 500 / 500D)',
    confidence: 'HIGH',
    confidenceScore: 97,
    summary: 'High-strength deformed steel bars and wires for concrete reinforcement are mandatorily regulated under IS 1786 : 2008 by the Ministry of Steel QCO. Scheme-I (ISI Mark) is legally mandatory before commercial dispatch or customs clearance.',
    applicableStandards: [
      {
        id: 'IS-1786',
        code: 'IS 1786 : 2008',
        title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement',
        matchScore: '99% Match',
        isMandatory: true
      }
    ],
    regulatoryStatus: {
      isMandatory: true,
      orderName: 'Steel and Steel Products (Quality Control) Order, 2020',
      effectiveDate: 'Enforced (No exemption without steel ministry technical clearance)',
      enforcingMinistry: 'Ministry of Steel'
    },
    keyRequirements: [
      {
        category: 'Chemical Composition Limits',
        points: [
          'Ladle analysis limits: Carbon max 0.25%, Sulphur max 0.040%, Phosphorus max 0.040%, Sulphur + Phosphorus max 0.075%.',
          'Carbon Equivalent (CE) max 0.42% to guarantee weldability on site.',
          'Mandatory micro-alloying declaration if adding Vanadium, Niobium, Titanium, or Boron.'
        ]
      },
      {
        category: 'Mechanical & Seismic Ductility Requirements',
        points: [
          '0.2% Proof Stress / Yield Stress minimum 500 N/mm² (Fe 500 / Fe 500D).',
          'UTS / YS tensile ratio must be >= 1.10 for Fe 500D (mandatory for seismic zones).',
          'Total elongation at maximum force (Agt) >= 5.0% and standard elongation >= 16%.'
        ]
      },
      {
        category: 'Marking & Surface Rib Geometry',
        points: [
          'Continuous rolling mark with brand name, ISI logo, licence number, and grade embossed every meter.',
          'Specific rib height, rib spacing, and angle parameters to guarantee concrete bond strength.'
        ]
      }
    ],
    testingProtocols: [
      'Universal Testing Machine (UTM) Tensile, Yield & Elongation Test per Heat',
      '180° Mandrel Bend and 23° Rebend Test with Strain Aging',
      'Optical Emission Spectrometer (OES) Ladle Chemical Composition Analysis',
      'Concrete Pull-out Bond Strength Test'
    ],
    nextActions: [
      {
        step: 1,
        action: 'Review IS 1786 Mechanical Parameters',
        description: 'Examine chemical ladle limits and Fe 500D seismic grade specifications.',
        targetRoute: '/standards/IS-1786',
        actionLabel: 'View IS 1786'
      },
      {
        step: 2,
        action: 'Check Steel Ministry QCO Circulars',
        description: 'Review Customs ICEGATE automated clearance rules and recent steel amendments.',
        targetRoute: '/alerts',
        actionLabel: 'View Steel Alerts'
      },
      {
        step: 3,
        action: 'Find Metallurgical Test Labs',
        description: 'Locate NABL accredited facilities for OES chemical spectrometry and UTM tensile testing.',
        targetRoute: '/laboratories',
        actionLabel: 'Find Metallurgical Labs'
      },
      {
        step: 4,
        action: 'Launch Steel Compliance Project',
        description: 'Track factory heat logging, calibration of UTM, and BIS factory audit preparation.',
        targetRoute: '/compliance',
        actionLabel: 'Start Compliance'
      }
    ],
    sources: [
      {
        id: 'src-stl-1',
        sourceType: 'Indian Standard',
        title: 'IS 1786 : 2008',
        reference: 'Clause 8.1 - Tensile & Elongation Testing',
        excerpt: 'The 0.2 percent proof stress, tensile strength and percentage elongation shall be determined in accordance with IS 1608 (Part 1).',
        dateOrVersion: 'Reaffirmed 2023'
      },
      {
        id: 'src-stl-2',
        sourceType: 'QCO Gazette Notification',
        title: 'Steel and Steel Products (Quality Control) Order, 2020',
        reference: 'S.O. 167(E) Ministry of Steel',
        excerpt: 'No person shall manufacture or store for sale, sell or distribute any steel products specified in Table 1 which do not conform to the specified Indian Standard.',
        dateOrVersion: 'Gazette of India, Published 2020'
      }
    ],
    reasoningPipeline: [
      { step: 1, name: 'Understand Query', description: 'Extracted product: TMT Rebar / Reinforcement steel; intent: BIS specifications & QCO.', status: 'completed' },
      { step: 2, name: 'Identify Product', description: 'Matched product: High Strength Deformed Steel Bars for Concrete Reinforcement.', status: 'completed' },
      { step: 3, name: 'Retrieve BIS Sources', description: 'Queried IS 1786 : 2008 and Ministry of Steel QCO Gazette notifications.', status: 'completed' },
      { step: 4, name: 'Rank Relevant Information', description: 'Ranked chemical limits, proof stress, and rolling mark guidelines.', status: 'completed' },
      { step: 5, name: 'Generate Answer', description: 'Formulated engineering checklist for ladle analysis and UTM testing.', status: 'completed' },
      { step: 6, name: 'Validate Evidence', description: 'Confirmed cross-references with IS 1608 tensile test protocols.', status: 'completed' }
    ],
    disclaimer: 'Demo response — prototype data. BIS Sahayak provides informational guidance. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative.'
  },

  helmet: {
    productIdentified: 'Two-Wheeler Protective Helmet',
    confidence: 'HIGH',
    confidenceScore: 95,
    summary: 'Helmets for two-wheeled motor vehicles are mandatorily regulated under IS 4151 : 2020 under the MoRTH Quality Control Order. Non-ISI helmets cannot be legally manufactured, imported, or sold in India.',
    applicableStandards: [
      {
        id: 'IS-4151',
        code: 'IS 4151 : 2020',
        title: 'Protective Helmets for Riders of Two Wheeled Motor Vehicles',
        matchScore: '98% Match',
        isMandatory: true
      }
    ],
    regulatoryStatus: {
      isMandatory: true,
      orderName: 'Two Wheeler Helmets (Quality Control) Order, 2020',
      effectiveDate: 'Enforced since June 2021',
      enforcingMinistry: 'Ministry of Road Transport and Highways (MoRTH)'
    },
    keyRequirements: [
      {
        category: 'Weight & Physical Architecture',
        points: [
          'Maximum permitted helmet weight capped at 1.2 kg to prevent neck injury during impact.',
          'Outer shell constructed of high-impact thermoplastic (ABS/polycarbonate) or composite fibre.',
          'High density expanded polystyrene (EPS) inner liner for uniform kinetic energy dissipation.'
        ]
      },
      {
        category: 'Impact Attenuation & Retention Testing',
        points: [
          'Drop tower impact test on flat and hemispherical anvils: Peak acceleration must not exceed 300g.',
          'Dynamic retention chin strap displacement under 1000 N shock drop must not exceed 25 mm.',
          'Visor must provide >85% light transmission with zero optical distortion or splintering.'
        ]
      }
    ],
    testingProtocols: [
      'Drop Tower Shock Absorption Impact Test across Hot, Cold, and Water Immersion Headforms',
      'Retention Chin-Strap Dynamic Displacement & Quick-Release Buckle Durability',
      'Visor Optical Transmission, Scratch Resistance & Spherical Power Analysis',
      'Rigidity Test across Transverse and Longitudinal Diameters'
    ],
    nextActions: [
      {
        step: 1,
        action: 'Review IS 4151 Specifications',
        description: 'Examine head-form sizing, conditioning temperatures, and test parameters.',
        targetRoute: '/standards/IS-4151',
        actionLabel: 'Examine IS 4151'
      },
      {
        step: 2,
        action: 'Find Automotive Testing Facilities',
        description: 'Locate ARAI, ICAT, or CIRT facilities equipped with instrumented drop towers.',
        targetRoute: '/laboratories',
        actionLabel: 'Locate Helmet Labs'
      },
      {
        step: 3,
        action: 'Prepare BIS Scheme-I Documentation',
        description: 'Assemble factory inspection dossier and sample dispatch authorization.',
        targetRoute: '/compliance',
        actionLabel: 'Start Roadmap'
      }
    ],
    sources: [
      {
        id: 'src-hlm-1',
        sourceType: 'Indian Standard',
        title: 'IS 4151 : 2020',
        reference: 'Clause 7.2 - Shock Absorption Drop Test',
        excerpt: 'The peak acceleration measured by the tri-axial accelerometer shall not exceed 300g and the duration over 150g shall not exceed 5 ms.',
        dateOrVersion: 'Revision 2020'
      },
      {
        id: 'src-hlm-2',
        sourceType: 'QCO Gazette Notification',
        title: 'Two Wheeler Helmets (Quality Control) Order, 2020',
        reference: 'MoRTH Notification S.O. 4252(E)',
        excerpt: 'Protective helmets for riders of two wheeled motor vehicles shall conform to IS 4151:2020 and bear the Standard Mark.',
        dateOrVersion: 'Published November 2020'
      }
    ],
    reasoningPipeline: [
      { step: 1, name: 'Understand Query', description: 'Extracted product: Two-wheeler motorcycle helmet; intent: BIS safety certification.', status: 'completed' },
      { step: 2, name: 'Identify Product', description: 'Matched product: Protective headgear for riders of two-wheeled motor vehicles.', status: 'completed' },
      { step: 3, name: 'Retrieve BIS Sources', description: 'Retrieved IS 4151 : 2020 and MoRTH QCO S.O. 4252(E).', status: 'completed' },
      { step: 4, name: 'Rank Relevant Information', description: 'Identified key 1.2 kg weight cap, shock drop tower thresholds, and retention tests.', status: 'completed' },
      { step: 5, name: 'Generate Answer', description: 'Structured advice covering testing facilities (ARAI/ICAT) and factory readiness.', status: 'completed' },
      { step: 6, name: 'Validate Evidence', description: 'Validated against Gazette notification and automotive safety standards.', status: 'completed' }
    ],
    disclaimer: 'Demo response — prototype data. BIS Sahayak provides informational guidance. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative.'
  },

  certification: {
    productIdentified: 'BIS Certification Schemes Overview',
    confidence: 'HIGH',
    confidenceScore: 94,
    summary: 'BIS operates multiple conformity assessment schemes depending on product category, risk classification, and ministry mandates. The two primary domestic paths are Scheme-I (ISI Mark) and Scheme-II (Compulsory Registration Scheme - CRS).',
    applicableStandards: [
      {
        id: 'IS-10322-5-8',
        code: 'BIS (Conformity Assessment) Regulations, 2018',
        title: 'Regulations governing Schemes I, II, III, IV, and X',
        matchScore: 'Framework Guideline',
        isMandatory: true
      }
    ],
    regulatoryStatus: {
      isMandatory: true,
      orderName: 'Bureau of Indian Standards Act, 2016',
      effectiveDate: 'Enacted by Parliament of India',
      enforcingMinistry: 'Ministry of Consumer Affairs'
    },
    keyRequirements: [
      {
        category: 'Scheme-I (ISI Mark) Pathway',
        points: [
          'Mandatory for products under safety QCOs (appliances, steel, cement, cables, food products).',
          'Requires physical manufacturing plant audit, in-house laboratory equipment, and witness sampling.',
          'Grants 7-digit CML licence number to emboss the ISI mark on goods.'
        ]
      },
      {
        category: 'Scheme-II (CRS - Compulsory Registration)',
        points: [
          'Self-declaration of conformity for electronics, IT goods, and solar equipment notified by MeitY.',
          'No prior factory inspection needed; licence granted purely based on NABL lab test reports.',
          'Grants R-Number (e.g. R-41000000) with BIS CRS border logo.'
        ]
      },
      {
        category: 'MSME & Startup Fee Subsidies',
        points: [
          'Micro enterprises enjoy 50% concession on application and minimum marking fees.',
          'Small enterprises enjoy 20% concession on marking fees with Udyam verification.'
        ]
      }
    ],
    testingProtocols: [
      'Type Testing at BIS Recognized & NABL Accredited Laboratory',
      'Factory Routine Testing calibrated against Scheme of Inspection and Testing (SIT)',
      'Periodic Surveillance Market Sampling by BIS Inspecting Officers'
    ],
    nextActions: [
      {
        step: 1,
        action: 'Browse Available BIS Services',
        description: 'Compare Scheme-I, Scheme-II (CRS), and Foreign Manufacturers Scheme (FMCS).',
        targetRoute: '/services',
        actionLabel: 'Explore Services Directory'
      },
      {
        step: 2,
        action: 'Build a Product Compliance Roadmap',
        description: 'Input your product name to generate an automated 8-stage compliance journey.',
        targetRoute: '/compliance',
        actionLabel: 'Launch Navigator'
      },
      {
        step: 3,
        action: 'Check MSME Concession Guidelines',
        description: 'Learn how to apply for the 50% marking fee concession on Manakonline.',
        targetRoute: '/knowledge',
        actionLabel: 'Read Knowledge Hub'
      }
    ],
    sources: [
      {
        id: 'src-cert-1',
        sourceType: 'BIS Scheme Manual',
        title: 'BIS (Conformity Assessment) Regulations, 2018',
        reference: 'Schedule-II: Scheme-I and Scheme-II Procedural Rules',
        excerpt: 'Specifies licence grant protocols, verification of in-house testing equipment, and surveillance protocols.',
        dateOrVersion: 'Updated 2024'
      },
      {
        id: 'src-cert-2',
        sourceType: 'QCO Gazette Notification',
        title: 'BIS MSME Concession Circular',
        reference: 'Circular No. CMD-I/Concessions/2022',
        excerpt: 'Micro and small enterprises registered on Udyam portal shall be granted fee concessions upon application.',
        dateOrVersion: 'Issued 2022'
      }
    ],
    reasoningPipeline: [
      { step: 1, name: 'Understand Query', description: 'Extracted topic: BIS certification schemes, eligibility and procedures.', status: 'completed' },
      { step: 2, name: 'Identify Product', description: 'Classified query under general BIS conformity assessment regulatory framework.', status: 'completed' },
      { step: 3, name: 'Retrieve BIS Sources', description: 'Queried BIS Act 2016 and Conformity Assessment Regulations 2018.', status: 'completed' },
      { step: 4, name: 'Rank Relevant Information', description: 'Compared Scheme-I vs Scheme-II and MSME fee structures.', status: 'completed' },
      { step: 5, name: 'Generate Answer', description: 'Synthesized side-by-side comparison and clear next steps.', status: 'completed' },
      { step: 6, name: 'Validate Evidence', description: 'Verified against current statutory fee schedules and Gazette orders.', status: 'completed' }
    ],
    disclaimer: 'Demo response — prototype data. BIS Sahayak provides informational guidance. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative.'
  },

  laboratory: {
    productIdentified: 'BIS Recognized & NABL Accredited Laboratories',
    confidence: 'HIGH',
    confidenceScore: 96,
    summary: 'Testing for BIS certification must be performed exclusively at laboratories recognized under the BIS Laboratory Recognition Scheme (LRS) and accredited by NABL under ISO/IEC 17025.',
    applicableStandards: [
      {
        id: 'IS-10322-5-8',
        code: 'ISO/IEC 17025 : 2017 / BIS LRS Guidelines',
        title: 'General Requirements for Competence of Testing and Calibration Laboratories',
        matchScore: 'Accreditation Standard',
        isMandatory: true
      }
    ],
    regulatoryStatus: {
      isMandatory: true,
      orderName: 'BIS Laboratory Recognition Scheme (LRS) 2020',
      effectiveDate: 'Enforced across all conformity assessment testing',
      enforcingMinistry: 'Bureau of Indian Standards Central Laboratory Directorate'
    },
    keyRequirements: [
      {
        category: 'Laboratory Qualification Criteria',
        points: [
          'Laboratory must hold valid NABL accreditation specifically covering the applicable Indian Standard clauses.',
          'Test equipment must possess unbroken calibration traceability back to the National Physical Laboratory (NPL).',
          'Test report must carry the QR code / LIMS reference linking directly to the national testing portal.'
        ]
      },
      {
        category: 'Sample Dispatch & Sealing Rules',
        points: [
          'For Scheme-I applications, witness samples must be drawn and sealed by a designated BIS inspecting officer.',
          'Sample condition, model numbers, and ratings on test reports must match manufacturing declarations exactly.'
        ]
      }
    ],
    testingProtocols: [
      'Type Test Verification against full Standard Clause Suite',
      'Witness Testing during BIS Factory Audit',
      'Annual Surveillance Sample Testing'
    ],
    nextActions: [
      {
        step: 1,
        action: 'Find an Accredited Testing Lab',
        description: 'Search our directory of NABL & BIS testing labs filtered by capability and geographic region.',
        targetRoute: '/laboratories',
        actionLabel: 'Open Laboratory Finder'
      },
      {
        step: 2,
        action: 'Review Required Test Protocols',
        description: 'Check estimated testing turnaround days and sample quantities for your product.',
        targetRoute: '/standards',
        actionLabel: 'Explore Standards'
      }
    ],
    sources: [
      {
        id: 'src-lab-1',
        sourceType: 'Laboratory Guideline',
        title: 'BIS Laboratory Recognition Scheme (LRS) Manual',
        reference: 'Clause 6 - Empanelment & Scope Schedule',
        excerpt: 'Testing reports for BIS conformity assessment shall only be valid when issued by an empaneled LRS laboratory within its approved scope.',
        dateOrVersion: 'Revised 2023'
      }
    ],
    reasoningPipeline: [
      { step: 1, name: 'Understand Query', description: 'Extracted topic: Testing laboratory recognition, NABL empanelment, and sample testing.', status: 'completed' },
      { step: 2, name: 'Identify Product', description: 'Classified under BIS Laboratory Recognition Scheme (LRS).', status: 'completed' },
      { step: 3, name: 'Retrieve BIS Sources', description: 'Queried BIS Central Laboratory directory and LRS guidelines.', status: 'completed' },
      { step: 4, name: 'Rank Relevant Information', description: 'Identified laboratory search filters and sample dispatch protocols.', status: 'completed' },
      { step: 5, name: 'Generate Answer', description: 'Structured laboratory testing recommendations with direct link to Lab Finder.', status: 'completed' },
      { step: 6, name: 'Validate Evidence', description: 'Verified NABL accreditation guidelines and traceability requirements.', status: 'completed' }
    ],
    disclaimer: 'Demo response — prototype data. BIS Sahayak provides informational guidance. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative.'
  }
};

export function getMockAIResponse(userPrompt: string): AIStructuredResponse {
  const query = userPrompt.toLowerCase();

  if (query.includes('led') || query.includes('light') || query.includes('luminaire') || query.includes('emergency')) {
    return AI_KNOWLEDGE_BASE['led'];
  }
  if (query.includes('pressure') || query.includes('cooker') || query.includes('cookware')) {
    return AI_KNOWLEDGE_BASE['pressure_cooker'];
  }
  if (query.includes('steel') || query.includes('tmt') || query.includes('rebar') || query.includes('iron') || query.includes('metal')) {
    return AI_KNOWLEDGE_BASE['steel'];
  }
  if (query.includes('helmet') || query.includes('headgear') || query.includes('rider') || query.includes('bike')) {
    return AI_KNOWLEDGE_BASE['helmet'];
  }
  if (query.includes('certif') || query.includes('scheme') || query.includes('isi') || query.includes('crs') || query.includes('licence') || query.includes('process')) {
    return AI_KNOWLEDGE_BASE['certification'];
  }
  if (query.includes('lab') || query.includes('test') || query.includes('nabl') || query.includes('facility')) {
    return AI_KNOWLEDGE_BASE['laboratory'];
  }

  // Fallback intelligent response
  return {
    productIdentified: 'General BIS Regulatory & Standards Consultation',
    confidence: 'MEDIUM',
    confidenceScore: 82,
    summary: `I analyzed your query: "${userPrompt}". I can help you identify applicable Indian Standards, verify mandatory Quality Control Orders (QCOs), locate accredited test laboratories, and navigate the BIS Manakonline certification journey.`,
    applicableStandards: [
      {
        id: 'IS-10322-5-8',
        code: 'IS 10322 (Part 5/Sec 8) : 2013',
        title: 'Emergency Lighting Luminaires',
        matchScore: 'Demo Match',
        isMandatory: true
      },
      {
        id: 'IS-2347',
        code: 'IS 2347 : 2017',
        title: 'Domestic Pressure Cookers',
        matchScore: 'Demo Match',
        isMandatory: true
      }
    ],
    regulatoryStatus: {
      isMandatory: false,
      orderName: 'General BIS Standards Directory',
      effectiveDate: 'Active',
      enforcingMinistry: 'Bureau of Indian Standards / Central Ministries'
    },
    keyRequirements: [
      {
        category: 'How to Pinpoint Your Exact Requirements',
        points: [
          'Specify your manufacturing product category or HS tariff code for exact clause-level mapping.',
          'Verify whether your product falls under Scheme-I (ISI Mark) or Scheme-II (CRS).',
          'Explore our interactive Standards Explorer or launch the Compliance Navigator.'
        ]
      }
    ],
    testingProtocols: [
      'Identify required routine factory tests vs third-party type tests in accredited NABL laboratories.',
      'Check turnaround timelines in our Laboratory Finder directory.'
    ],
    nextActions: [
      {
        step: 1,
        action: 'Search Indian Standards',
        description: 'Explore active Indian Standards by product keyword or category.',
        targetRoute: '/standards',
        actionLabel: 'Standards Explorer'
      },
      {
        step: 2,
        action: 'Build Compliance Roadmap',
        description: 'Generate an 8-stage compliance journey tailored to your manufacturing unit.',
        targetRoute: '/compliance',
        actionLabel: 'Launch Navigator'
      },
      {
        step: 3,
        action: 'Browse BIS Services',
        description: 'View licensing requirements, application fees, and MSME concessions.',
        targetRoute: '/services',
        actionLabel: 'Explore Services'
      }
    ],
    sources: [
      {
        id: 'src-gen-1',
        sourceType: 'Indian Standard',
        title: 'Bureau of Indian Standards Catalog',
        reference: 'Sectional Committees & Standards Repository',
        excerpt: 'Over 21,000 active Indian Standards covering 14 engineering and scientific sectors.',
        dateOrVersion: 'Live Portal'
      }
    ],
    reasoningPipeline: [
      { step: 1, name: 'Understand Query', description: `Parsed keywords from prompt: "${userPrompt.substring(0, 40)}..."`, status: 'completed' },
      { step: 2, name: 'Identify Product', description: 'Scanned product taxonomy schedules for best match.', status: 'completed' },
      { step: 3, name: 'Retrieve BIS Sources', description: 'Queried national standards index and regulatory manuals.', status: 'completed' },
      { step: 4, name: 'Rank Relevant Information', description: 'Calculated relevance scores and highlighted key discovery paths.', status: 'completed' },
      { step: 5, name: 'Generate Answer', description: 'Synthesized multi-option guidance with direct navigational links.', status: 'completed' },
      { step: 6, name: 'Validate Evidence', description: 'Verified against authoritative BIS information repository.', status: 'completed' }
    ],
    disclaimer: 'Demo response — prototype data. BIS Sahayak provides informational guidance. Official BIS processes, Gazette notifications, and Scheme manuals remain authoritative.'
  };
}
