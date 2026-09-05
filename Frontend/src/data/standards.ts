import { Standard } from '../types/standards';

export const MOCK_STANDARDS: Standard[] = [
  {
    id: 'IS-10322-5-8',
    code: 'IS 10322 (Part 5/Sec 8) : 2013',
    title: 'Luminaires - Particular Requirements - Emergency Lighting',
    industry: 'Electrical & Electronics',
    category: 'Lighting Equipment & Drivers',
    status: 'Active',
    isMandatory: true,
    qcoReference: 'Electrical Equipment (Quality Control) Order, 2020 / DPIIT Notification',
    qcoEffectiveDate: '2021-03-01',
    certificationScheme: 'Scheme I (ISI Mark)',
    year: 2013,
    laboratoryTestingDaysEst: 25,
    scope: 'This section of Part 5 specifies requirements for emergency luminaires for use with electrical light sources on emergency power supplies not exceeding 1000 V. Covers emergency escape lighting, standby lighting, self-contained and centrally supplied luminaires.',
    keyRequirements: [
      'Self-contained emergency luminaires must provide rated lumen output within 5 seconds of mains failure.',
      'Battery charging circuit must maintain full operational readiness under continuous float conditions.',
      'Enclosure fire hazard classification rating conforming to 850°C glow-wire flammability test.',
      'Internal thermal cut-outs and battery overcharge protection must be fail-safe.',
      'Marking must clearly indicate rated emergency duration (1 hr, 2 hr, or 3 hr) and ambient temp limit.'
    ],
    clauses: [
      {
        clauseNumber: 'Clause 4.1',
        title: 'General Design and Construction',
        summary: 'Emergency luminaires shall comply with the general requirements of IS 10322 (Part 1) and specific ingress protection (minimum IP20 indoor, IP65 outdoor).',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 5.2',
        title: 'Electrical Safety and Insulation Resistance',
        summary: 'Dielectric strength test at 1500V AC between live parts and accessible metallic enclosure. Insulation resistance shall be greater than 2 MΩ.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 6.3',
        title: 'Photometric Performance in Emergency Mode',
        summary: 'Luminous flux output in emergency operation shall not drop below 85% of claimed rated emergency lumens throughout the rated duration.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 8.4',
        title: 'Thermal Endurance and Battery Float Life',
        summary: 'Continuous 10-day endurance cycling at maximum ambient rating followed by discharge test verifying battery capacity.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 12.1',
        title: 'Marking & Product Labeling',
        summary: 'Standard BIS Mark (ISI), CML number, nominal supply voltage, emergency duration, and battery chemistry must be indelibly marked.',
        mandatory: true
      }
    ],
    testingRequirements: [
      {
        name: 'Insulation Resistance & High Voltage Breakdown Test',
        methodStandard: 'IS 10322 (Part 1) Clause 10',
        frequency: '100% Routine Test at factory',
        criticalParameters: 'Leakage current < 0.5 mA at 1500V applied for 60 seconds.'
      },
      {
        name: 'Emergency Mode Luminous Flux Measurement',
        methodStandard: 'IS 16102 / Goniophotometer Protocol',
        frequency: 'Type Test (NABL Lab)',
        criticalParameters: 'Lumen maintenance measured at 5s, 60s, and end of rated discharge period.'
      },
      {
        name: 'Glow-wire Flammability & Thermal Resistance',
        methodStandard: 'IS 11000 / IEC 60695-2-11',
        frequency: 'Type Test (Material batch check)',
        criticalParameters: 'No sustained flame after 30s glow-wire contact at 850°C.'
      },
      {
        name: 'Battery Charge/Discharge Life Cycle Verification',
        methodStandard: 'IS 16046 (Secondary Lithium/Ni-Cd Cells)',
        frequency: 'Type Test (Periodic 6-month)',
        criticalParameters: 'Autonomous duration under 100% full load exceeds 180 minutes.'
      }
    ],
    relatedStandards: [
      { code: 'IS 10322 (Part 1) : 2014', title: 'Luminaires - General Requirements and Tests' },
      { code: 'IS 15885 (Part 2/Sec 13)', title: 'Lamp Controlgear for LED Modules' },
      { code: 'IS 16046 (Part 2) : 2018', title: 'Secondary Cells Containing Alkaline or other Non-Acid Electrolytes (Lithium)' }
    ],
    amendments: [
      { amendmentNumber: 'Amendment No. 1', date: 'October 2018', summary: 'Aligned battery specifications with IS 16046 rechargeable lithium chemistry guidelines.' },
      { amendmentNumber: 'Amendment No. 2', date: 'December 2022', summary: 'Clarified testing frequency for high-ambient industrial emergency luminaires (up to 50°C).' }
    ]
  },
  {
    id: 'IS-16102-1',
    code: 'IS 16102 (Part 1) : 2012',
    title: 'Self-Ballasted LED Lamps for General Lighting Services - Part 1: Safety Requirements',
    industry: 'Electrical & Electronics',
    category: 'Consumer Electronics & Lighting',
    status: 'Active',
    isMandatory: true,
    qcoReference: 'Electronics and Information Technology Goods (Compulsory Registration) Order, 2012 / MeitY',
    qcoEffectiveDate: '2014-05-01',
    certificationScheme: 'Scheme II (CRS - Compulsory Registration)',
    year: 2012,
    laboratoryTestingDaysEst: 20,
    scope: 'Specifies the safety and interchangeability requirements, together with the test methods and conditions required to show compliance of LED lamps with integrated means for controlling, intended for domestic and similar general lighting purposes.',
    keyRequirements: [
      'Safety requirements for caps (B22d, E27) including torsion and mechanical strength.',
      'Creepage distance and electrical clearance between live parts and accessible parts.',
      'Protection against electric shock under normal and fault conditions.',
      'Resistance to heat, fire, and tracking on insulating materials.',
      'Mandatory registration under BIS Compulsory Registration Scheme (CRS).'
    ],
    clauses: [
      {
        clauseNumber: 'Clause 6',
        title: 'Interchangeability and Mechanical Dimensions',
        summary: 'Cap dimensions and gauge fit conformity according to standard gauges.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 8',
        title: 'Resistance to Torque (Cap Strength)',
        summary: 'B22d and E27 caps must withstand torsional torque of 3.0 Nm without detachment or rotation.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 11',
        title: 'Fault Condition Testing',
        summary: 'Lamps shall not catch fire or produce flammable gases when individual electronic components are short-circuited or opened.',
        mandatory: true
      }
    ],
    testingRequirements: [
      {
        name: 'Torsion Test on Lamp Cap',
        methodStandard: 'IS 16102 (Part 1) Clause 8',
        frequency: 'Every production lot',
        criticalParameters: '3.0 Nm torque applied for 1 minute without slippage.'
      },
      {
        name: 'Fault Condition Safety Assessment',
        methodStandard: 'IS 16102 (Part 1) Clause 11',
        frequency: 'Type Test',
        criticalParameters: 'Simulated bridge rectifier breakdown and open filter capacitor.'
      }
    ],
    relatedStandards: [
      { code: 'IS 16102 (Part 2) : 2012', title: 'Self-Ballasted LED Lamps - Performance Requirements' },
      { code: 'IS 16103 (Part 1) : 2012', title: 'Led Modules for General Lighting - Safety' }
    ],
    amendments: [
      { amendmentNumber: 'Amendment No. 2', date: 'March 2021', summary: 'Incorporated revised creepage distances for compact SMD LED driver topologies.' }
    ]
  },
  {
    id: 'IS-2347',
    code: 'IS 2347 : 2017',
    title: 'Domestic Pressure Cookers - Specification',
    industry: 'Mechanical',
    category: 'Cookware & Domestic Appliances',
    status: 'Active',
    isMandatory: true,
    qcoReference: 'Domestic Pressure Cooker (Quality Control) Order, 2020 / Ministry of Consumer Affairs',
    qcoEffectiveDate: '2021-02-01',
    certificationScheme: 'Scheme I (ISI Mark)',
    year: 2017,
    laboratoryTestingDaysEst: 15,
    scope: 'Specifies requirements for domestic pressure cookers manufactured from aluminium alloys, stainless steel, or composite metals, having capacities between 1 and 20 litres, operating at nominal operating gauge pressures up to 100 kPa.',
    keyRequirements: [
      'Mandatory secondary safety device (fusible plug or gasket release system).',
      'Proof pressure hydrostatic test at triple the normal operating pressure without permanent distortion.',
      'Bursting pressure test ensuring safety rupture threshold is higher than 300 kPa.',
      'Food-grade compliance for all internal cooking surfaces and gasket rubber elastomers.',
      'Mandatory ISI Mark embossing on body, lid, and container.'
    ],
    clauses: [
      {
        clauseNumber: 'Clause 4.2',
        title: 'Material Specifications',
        summary: 'Aluminium sheet conforming to IS 21 or stainless steel conforming to grade AISI 304 (04Cr18Ni10).',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 7.1',
        title: 'Proof Pressure Hydrostatic Test',
        summary: 'Vessel must withstand 200 kPa hydraulic pressure for 2 minutes without leakage or permanent deflection.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 8.3',
        title: 'Operating Pressure & Venting Mechanism',
        summary: 'Normal operating pressure shall maintain 98 ± 7 kPa with continuous weight-valve steam regulation.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 9.2',
        title: 'Safety Relief Device Operating Pressure',
        summary: 'Secondary safety device must operate reliably between 130 kPa and 180 kPa if primary vent pipe is blocked.',
        mandatory: true
      }
    ],
    testingRequirements: [
      {
        name: 'Hydrostatic Proof Pressure Test',
        methodStandard: 'IS 2347 Clause 7.1',
        frequency: '100% Factory Inspection',
        criticalParameters: '200 kPa pressure held for 120s; zero weld seam weeping.'
      },
      {
        name: 'Burst Pressure Hydraulic Test',
        methodStandard: 'IS 2347 Clause 7.2',
        frequency: 'Type Test (1 per 1000 batch)',
        criticalParameters: 'Must not burst below 300 kPa gauge pressure.'
      },
      {
        name: 'Food Contact Rubber Gasket Migration Test',
        methodStandard: 'IS 7466 / IS 9845',
        frequency: 'Raw material batch verification',
        criticalParameters: 'Overall migration into food stimulants < 10 mg/dm².'
      }
    ],
    relatedStandards: [
      { code: 'IS 21 : 1992', title: 'Wrought Aluminium and Aluminium Alloys for Utensils' },
      { code: 'IS 6911 : 2017', title: 'Stainless Steel Plate, Sheet and Strip' }
    ],
    amendments: [
      { amendmentNumber: 'Amendment No. 1', date: 'January 2022', summary: 'Added validation parameters for hard anodised composite aluminium bases with induction caps.' }
    ]
  },
  {
    id: 'IS-1786',
    code: 'IS 1786 : 2008',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement',
    industry: 'Civil & Metallurgy',
    category: 'Structural Steel & Construction',
    status: 'Active',
    isMandatory: true,
    qcoReference: 'Steel and Steel Products (Quality Control) Order, 2020 / Ministry of Steel',
    qcoEffectiveDate: '2020-08-01',
    certificationScheme: 'Scheme I (ISI Mark)',
    year: 2008,
    laboratoryTestingDaysEst: 10,
    scope: 'Covers the requirements of high strength deformed steel bars and wires for use as reinforcement in concrete in grades Fe 415, Fe 415D, Fe 500, Fe 500D, Fe 550, Fe 550D, and Fe 600.',
    keyRequirements: [
      'Chemical limits on Carbon (max 0.25%), Sulphur (max 0.040%), Phosphorus (max 0.040%), and Carbon Equivalent.',
      '0.2% Proof stress / yield stress minimum thresholds for seismic grades (Fe 500D requires 500 N/mm² minimum).',
      'Elongation percentage at gauge length and Total Elongation at Maximum Force (TS/YS ratio >= 1.10).',
      'Mandatory hot rolled rib deformation pattern dimensions for concrete bond strength.',
      'Rolling mark with brand name, ISI mark, licence number, and grade embossed on every meter.'
    ],
    clauses: [
      {
        clauseNumber: 'Clause 4.2',
        title: 'Chemical Composition Analysis',
        summary: 'Ladle analysis of molten steel batch to verify C, S, P, N, and Micro-alloy additions (Nb, V, Ti, B).',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 8.1',
        title: 'Tensile and Elongation Testing',
        summary: 'Universal Testing Machine tensile pull verifying yield point, ultimate tensile strength, and uniform strain.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 9.3',
        title: 'Bend and Rebend Test',
        summary: 'Mandrel bending through 180° followed by reverse bend through 23° without surface transverse cracking.',
        mandatory: true
      }
    ],
    testingRequirements: [
      {
        name: 'Tensile, Yield and Total Elongation Test',
        methodStandard: 'IS 1608 (Part 1)',
        frequency: 'Every heat/batch (approx every 40 tonnes)',
        criticalParameters: 'Yield >= 500 MPa, UTS >= 565 MPa, Elongation >= 16% (Fe 500D).'
      },
      {
        name: 'Rebend Test (Ductility and Strain Aging)',
        methodStandard: 'IS 1786 Clause 9.3',
        frequency: '1 sample per diameter per heat',
        criticalParameters: 'No rupture or cleavage when bent across standardized mandrels.'
      }
    ],
    relatedStandards: [
      { code: 'IS 2062 : 2011', title: 'Hot Rolled Medium and High Tensile Structural Steel' },
      { code: 'IS 2830 : 2012', title: 'Carbon Steel Cast Billet Ingots, Billets, Blooms and Slabs for Re-rolling' }
    ],
    amendments: [
      { amendmentNumber: 'Amendment No. 3', date: 'August 2021', summary: 'Strengthened seismic ductility parameters and mandatory micro-alloy tagging for corrosion resistance.' }
    ]
  },
  {
    id: 'IS-4151',
    code: 'IS 4151 : 2020',
    title: 'Protective Helmets for Riders of Two Wheeled Motor Vehicles - Specification',
    industry: 'Consumer Goods',
    category: 'Automotive Safety & PPE',
    status: 'Active',
    isMandatory: true,
    qcoReference: 'Two Wheeler Helmets (Quality Control) Order, 2020 / MoRTH',
    qcoEffectiveDate: '2021-06-01',
    certificationScheme: 'Scheme I (ISI Mark)',
    year: 2020,
    laboratoryTestingDaysEst: 18,
    scope: 'Specifies requirements regarding construction, finish, mass, retention system, and testing of protective helmets for riders of two-wheeled motor vehicles to minimize head injuries in road crashes.',
    keyRequirements: [
      'Maximum helmet weight restricted to 1.2 kg to avoid cervical strain.',
      'Impact absorption drop tower testing across 4 head-forms under hot (+50°C), cold (-10°C), and water immersion conditioning.',
      'Chin strap retention system dynamic displacement and slippage thresholds.',
      'Visor optical transparency (>85%), scratch resistance, and shatterproof non-splintering polycarbonate.',
      'Prominently visible ISI logo, CML number, helmet size, and manufacturing month/year on outer shell.'
    ],
    clauses: [
      {
        clauseNumber: 'Clause 5.1',
        title: 'Shell and Impact Absorption Liner',
        summary: 'High impact ABS/polycarbonate shell with high density expanded polystyrene (EPS) inner lining.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 7.2',
        title: 'Shock Absorption Drop Test',
        summary: 'Peak head-form acceleration shall not exceed 300g (gravity) and duration above 150g shall not exceed 5 ms.',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 8.4',
        title: 'Retention System Dynamic Extension',
        summary: 'Chin strap under 1000 N dynamic tensile drop must not extend by more than 25 mm.',
        mandatory: true
      }
    ],
    testingRequirements: [
      {
        name: 'Drop Tower Impact Attenuation Test',
        methodStandard: 'IS 4151 Clause 7.2 / Tri-axial accelerometer',
        frequency: 'Type Test (NABL Accredited Facility)',
        criticalParameters: 'Max acceleration < 275g on flat and hemispherical anvils.'
      },
      {
        name: 'Visor Luminous Transmittance & Optical Distortion',
        methodStandard: 'IS 4151 Clause 10',
        frequency: 'Lot sampling',
        criticalParameters: 'Light transmittance >= 85%; refractive power < 0.12 diopter.'
      }
    ],
    relatedStandards: [
      { code: 'IS 9873 : 2019', title: 'Safety of Toys - Mechanical and Physical Properties' },
      { code: 'IS 2925 : 1984', title: 'Specification for Industrial Safety Helmets' }
    ],
    amendments: [
      { amendmentNumber: 'Amendment No. 1', date: 'October 2022', summary: 'Added provisions for quick-release micrometric buckle retention systems.' }
    ]
  },
  {
    id: 'IS-14144',
    code: 'IS 14144 : 2023',
    title: 'Electric Power Driven Vehicles - Lithium-Ion Based Traction Battery Systems - Safety',
    industry: 'Automotive',
    category: 'Electric Mobility & Clean Tech',
    status: 'Active',
    isMandatory: true,
    qcoReference: 'Automotive Vehicles (Traction Battery Safety) Notification / MoRTH AIS 156 & 038 Phase 2',
    qcoEffectiveDate: '2023-04-01',
    certificationScheme: 'Scheme I (ISI Mark)',
    year: 2023,
    laboratoryTestingDaysEst: 35,
    scope: 'Covers safety requirements and validation tests for lithium-ion secondary cells and battery packs intended for traction power in pure electric and hybrid road vehicles.',
    keyRequirements: [
      'Thermal runaway propagation testing - failure of one cell must not trigger adjacent cell catch-fire.',
      'Active battery management system (BMS) with high voltage interlock and real-time cell voltage telemetry.',
      'Water ingress protection minimum IPX7 (immersion 1 meter depth for 30 minutes).',
      'Mechanical crush and drop shock validation conforming to harsh Indian road vibrations.',
      'Mandatory thermal chamber cycling (-20°C to +65°C) with continuous telemetry logging.'
    ],
    clauses: [
      {
        clauseNumber: 'Clause 6.1',
        title: 'Overcharge and Over-discharge Protection',
        summary: 'BMS must cut off power within 100 milliseconds upon detecting cell over-voltage (>4.25V).',
        mandatory: true
      },
      {
        clauseNumber: 'Clause 7.4',
        title: 'Thermal Propagation and Venting Test',
        summary: 'Single cell nail-penetration trigger must not cause explosion or fire propagation to pack exterior within 10 minutes.',
        mandatory: true
      }
    ],
    testingRequirements: [
      {
        name: 'Single Cell Thermal Runaway Propagation Test',
        methodStandard: 'IS 14144 Clause 7.4 / AIS-038',
        frequency: 'Type Test (ARAI / ICAT / NABL Recognized)',
        criticalParameters: 'Smoke release channeled through one-way pressure vent without open flame.'
      },
      {
        name: 'Pack Submersion & Ingress Protection (IPX7)',
        methodStandard: 'IS 14144 / IS/IEC 60529',
        frequency: 'Type Test',
        criticalParameters: 'No water penetration into cell compartment after 30 min water bath.'
      }
    ],
    relatedStandards: [
      { code: 'IS 16046 (Part 2) : 2018', title: 'Secondary Lithium Cells for Portable Applications' },
      { code: 'IS 17017 (Part 1) : 2018', title: 'Electric Vehicle Conductive AC Charging Systems' }
    ],
    amendments: [
      { amendmentNumber: 'Amendment No. 1', date: 'November 2023', summary: 'Mandated on-board fire suppression sensors and fuse telemetry integration.' }
    ]
  }
];
