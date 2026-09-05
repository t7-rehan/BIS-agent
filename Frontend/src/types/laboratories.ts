export interface Laboratory {
  id: string;
  name: string;
  city: string;
  state: string;
  region: 'North' | 'South' | 'West' | 'East' | 'Central';
  address: string;
  nablAccreditationNo: string;
  bisRecognitionValidity: string;
  status: 'BIS Recognized & NABL Accredited' | 'NABL Accredited' | 'BIS Central Lab';
  contactPerson: string;
  email: string;
  phone: string;
  capabilities: string[]; // e.g. ["Electrical Safety", "Photometry (Goniophotometer)", "Thermal Endurance"]
  supportedStandards: string[]; // e.g. ["IS 10322 (Part 5/Sec 8)", "IS 16102", "IS 2347"]
  avgTurnaroundDays: number;
  samplePickupAvailable: boolean;
  rating: number;
  lat: number;
  lng: number;
}
