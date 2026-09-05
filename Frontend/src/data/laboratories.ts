import { Laboratory } from '../types/laboratories';

export const MOCK_LABORATORIES: Laboratory[] = [
  {
    id: 'LAB-DEL-01',
    name: 'National Test House (Northern Region)',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh / Delhi-NCR',
    region: 'North',
    address: 'Kamla Nehru Nagar, Post Box No. 112, Ghaziabad - 201002',
    nablAccreditationNo: 'TC-5128',
    bisRecognitionValidity: 'Valid till 2027-11-30',
    status: 'BIS Recognized & NABL Accredited',
    contactPerson: 'Dr. R.K. Sharma (Technical Director)',
    email: 'nthnr-testing@gov.in',
    phone: '+91 120 2789824',
    capabilities: [
      'Luminaires & Emergency Lighting (IS 10322 Part 5 Sec 8)',
      'Self-Ballasted LED Lamps (IS 16102 Part 1 & 2)',
      'High-Temperature Glow Wire & Flammability',
      'EMC / EMI Radiated Emissions (CISPR 15)',
      'Electrical Insulation & High Voltage Breakdown (up to 10 kV)'
    ],
    supportedStandards: [
      'IS 10322 (Part 5/Sec 8) : 2013',
      'IS 16102 (Part 1) : 2012',
      'IS 15885 (Part 2/Sec 13)',
      'IS 2347 : 2017'
    ],
    avgTurnaroundDays: 18,
    samplePickupAvailable: true,
    rating: 4.8,
    lat: 28.6692,
    lng: 77.4538
  },
  {
    id: 'LAB-BLR-02',
    name: 'Central Power Research Institute (CPRI)',
    city: 'Bengaluru',
    state: 'Karnataka',
    region: 'South',
    address: 'Prof. Sir C.V. Raman Road, Sadashivanagar, Bengaluru - 560080',
    nablAccreditationNo: 'TC-5014',
    bisRecognitionValidity: 'Valid till 2028-03-31',
    status: 'BIS Recognized & NABL Accredited',
    contactPerson: 'K. Venkatesh (Head of Illumination Lab)',
    email: 'cpri-illumination@cpri.res.in',
    phone: '+91 80 22072210',
    capabilities: [
      'Goniophotometry & Integrating Sphere Spectral Flux',
      'Emergency Inverter & Battery Float Life Cycles',
      'IP Code Ingress Testing (IP54 to IP68 water/dust)',
      'Surge Immunity up to 6 kV (IEC 61000-4-5)',
      'EV Charging & Battery Safety Verification'
    ],
    supportedStandards: [
      'IS 10322 (Part 5/Sec 8) : 2013',
      'IS 16102 (Part 1) : 2012',
      'IS 14144 : 2023',
      'IS 17017 (Part 1)'
    ],
    avgTurnaroundDays: 22,
    samplePickupAvailable: false,
    rating: 4.9,
    lat: 13.0118,
    lng: 77.5806
  },
  {
    id: 'LAB-MUM-03',
    name: 'BIS Western Regional Office Laboratory (WROL)',
    city: 'Mumbai',
    state: 'Maharashtra',
    region: 'West',
    address: 'Manakalaya, E9, MIDC, Andheri (East), Mumbai - 400093',
    nablAccreditationNo: 'TC-6230',
    bisRecognitionValidity: 'Apex Central BIS Laboratory',
    status: 'BIS Central Lab',
    contactPerson: 'Sunita Patil (Joint Director, Testing)',
    email: 'wrol-mumbai@bis.gov.in',
    phone: '+91 22 28329295',
    capabilities: [
      'Domestic Pressure Cookers (IS 2347) Hydrostatic Proof & Burst',
      'Food Contact Material Leaching & Rubber Gasket Aging',
      'Protective Helmets Impact Drop Tower & Retention (IS 4151)',
      'Structural Steel Chemical Ladle & Tensile Stress (IS 1786)',
      'Electrical Domestic Appliances (IS 302)'
    ],
    supportedStandards: [
      'IS 2347 : 2017',
      'IS 4151 : 2020',
      'IS 1786 : 2008',
      'IS 10322 (Part 5/Sec 8) : 2013'
    ],
    avgTurnaroundDays: 14,
    samplePickupAvailable: true,
    rating: 4.7,
    lat: 19.1176,
    lng: 72.8631
  },
  {
    id: 'LAB-PUN-04',
    name: 'Automotive Research Association of India (ARAI)',
    city: 'Pune',
    state: 'Maharashtra',
    region: 'West',
    address: 'Survey No. 102, Vetal Hill, Off Paud Road, Kothrud, Pune - 411038',
    nablAccreditationNo: 'TC-5390',
    bisRecognitionValidity: 'Valid till 2027-08-15',
    status: 'BIS Recognized & NABL Accredited',
    contactPerson: 'Anand Deshpande (Sr. Deputy Director)',
    email: 'arai-safety@araiindia.com',
    phone: '+91 20 67621111',
    capabilities: [
      'Two-Wheeler Protective Helmets Shock Absorption (IS 4151)',
      'Helmet Retention System Dynamic Slip & Rigidity',
      'Visor Optical Distortion & Spherical Power Validation',
      'EV Traction Battery Thermal Runaway & Nail Penetration (IS 14144)',
      'Automotive Electrical Components EMI/EMC'
    ],
    supportedStandards: [
      'IS 4151 : 2020',
      'IS 14144 : 2023',
      'IS 2925 : 1984'
    ],
    avgTurnaroundDays: 20,
    samplePickupAvailable: true,
    rating: 4.9,
    lat: 18.5167,
    lng: 73.8167
  },
  {
    id: 'LAB-KOL-05',
    name: 'National Test House (Eastern Region)',
    city: 'Kolkata',
    state: 'West Bengal',
    region: 'East',
    address: 'Block CP, Sector V, Salt Lake, Kolkata - 700091',
    nablAccreditationNo: 'TC-5088',
    bisRecognitionValidity: 'Valid till 2026-12-31',
    status: 'BIS Recognized & NABL Accredited',
    contactPerson: 'Subhash Mukherjee (Chief Chemist & Metallurgist)',
    email: 'nthe-kolkata@gov.in',
    phone: '+91 33 23673869',
    capabilities: [
      'High-Strength Deformed Steel Bars Tensile & Rebend (IS 1786)',
      'Optical Emission Spectroscopy Ladle Composition (C, S, P, CE)',
      'Structural Steel Corrosion & Salt Spray Testing',
      'Pressure Vessel Hydrostatic Pressure & Non-Destructive Testing',
      'Cement & Construction Material Compression'
    ],
    supportedStandards: [
      'IS 1786 : 2008',
      'IS 2062 : 2011',
      'IS 2347 : 2017'
    ],
    avgTurnaroundDays: 12,
    samplePickupAvailable: true,
    rating: 4.6,
    lat: 22.5800,
    lng: 88.4200
  },
  {
    id: 'LAB-CHN-06',
    name: 'SAMEER Centre for Electromagnetics (Govt of India)',
    city: 'Chennai',
    state: 'Tamil Nadu',
    region: 'South',
    address: 'CIT Campus, 2nd Cross Road, Taramani, Chennai - 600113',
    nablAccreditationNo: 'TC-5441',
    bisRecognitionValidity: 'Valid till 2027-05-20',
    status: 'BIS Recognized & NABL Accredited',
    contactPerson: 'M. Senthil Kumar (Scientist F)',
    email: 'sameer-chennai@sameer.gov.in',
    phone: '+91 44 22541817',
    capabilities: [
      'EMI/EMC Chamber Compliance for LED Drivers and Luminaires',
      'Radio Frequency Interference & Harmonic Distortion',
      'Electrostatic Discharge (ESD) up to 15 kV',
      'LED Thermal Management & Driver Reliability'
    ],
    supportedStandards: [
      'IS 10322 (Part 5/Sec 8) : 2013',
      'IS 16102 (Part 1) : 2012',
      'IS 15885 (Part 2/Sec 13)'
    ],
    avgTurnaroundDays: 16,
    samplePickupAvailable: false,
    rating: 4.8,
    lat: 12.9863,
    lng: 80.2432
  }
];
