import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  XCircle
} from 'lucide-react';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export const Consumer: React.FC = () => {
  const navigate = useNavigate();

  // Verification state
  const [cmlInput, setCmlInput] = useState('');
  const [cmlResult, setCmlResult] = useState<any | null>(null);

  const [huidInput, setHuidInput] = useState('');
  const [huidResult, setHuidResult] = useState<any | null>(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleVerifyCml = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmlInput.trim()) return;

    // Simulated check
    const query = cmlInput.trim();
    if (query === '8400123' || query.toLowerCase().includes('led') || query === '10322') {
      setCmlResult({
        valid: true,
        cmlNo: '8400123',
        licensee: 'Surya Illumination India Ltd.',
        product: 'Luminaires - Emergency Lighting',
        standard: 'IS 10322 (Part 5/Sec 8) : 2013',
        validTill: '2027-10-31',
        factoryAddress: 'Plot 42, Sector 8, IMT Manesar, Gurugram, Haryana - 122051'
      });
    } else if (query === '9999999' || query.toLowerCase().includes('fake')) {
      setCmlResult({
        valid: false,
        cmlNo: query,
        message: 'No valid BIS licence found matching this CML number. Suspected spurious or expired licence.'
      });
    } else {
      setCmlResult({
        valid: true,
        cmlNo: query,
        licensee: 'National Consumer Appliances Co.',
        product: 'Domestic Cookware & Electrical Appliances',
        standard: 'IS 2347 / IS 302',
        validTill: '2027-06-30',
        factoryAddress: 'Industrial Area Phase 2, Andheri East, Mumbai, Maharashtra'
      });
    }
  };

  const handleVerifyHuid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!huidInput.trim()) return;

    const code = huidInput.trim().toUpperCase();
    if (code.length === 6) {
      setHuidResult({
        valid: true,
        huid: code,
        jewellerName: 'Kalyan & Tanishq Authorized Jewellers',
        ahcCenter: 'Mumbai Apex Assaying & Hallmarking Centre',
        articleType: 'Gold Ring / Bangle (22 Karat)',
        purity: '22K916 (91.6% Pure Gold)',
        hallmarkingDate: '2026-08-14'
      });
    } else {
      setHuidResult({
        valid: false,
        huid: code,
        message: 'Invalid HUID format. Hallmark Unique Identification must be exactly 6 alphanumeric characters (e.g. AB1234).'
      });
    }
  };

  const consumerFaqs = [
    {
      q: 'How can I check if the ISI mark printed on a product is genuine?',
      a: 'Look directly below the ISI monogram. A genuine ISI mark must always display a 7-digit CM/L (Certification of Marks Licence) number and the corresponding IS standard number at the top. You can verify this CM/L number instantly using BIS Sahayak or the BIS Care app.'
    },
    {
      q: 'Is Gold Hallmarking mandatory across all districts in India?',
      a: 'Yes, mandatory hallmarking has been rolled out across all notified districts for 14K, 18K, 20K, 22K, 23K, and 24K gold jewellery. Jewellers are prohibited from selling un-hallmarked gold ornaments.'
    },
    {
      q: 'What should I do if a seller offers a non-ISI domestic pressure cooker or helmet?',
      a: 'Both pressure cookers and two-wheeler helmets are strictly governed under mandatory Quality Control Orders (QCOs). Selling substandard or counterfeit items is illegal. You can lodge an anonymous complaint via the BIS Redressal cell on this platform.'
    },
    {
      q: 'What is the difference between ISI mark and the CRS logo?',
      a: 'The ISI mark applies to domestic goods, industrial products, and safety equipment undergoing factory inspections. The CRS (Compulsory Registration Scheme) applies to electronic and IT hardware (like laptops, LED lamps, and mobile phones) and carries a rectangular BIS logo with an R-Number.'
    }
  ];

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto space-y-8 text-left">
      <DisclaimerBanner variant="subtle" />

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Consumer Awareness & Protection Zone</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Understand BIS Before You Buy.
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Verify product authenticity, validate pure gold with HUID, and ensure your family buys safe, certified goods conforming to Indian Standards.
        </p>
      </div>

      {/* Visual: "How to Verify" Educational Graphic Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-center sm:text-left">
          Anatomy of a Genuine BIS Certification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ISI Mark anatomy */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                ISI
              </span>
              <span className="text-xs font-bold text-slate-900">ISI Mark on Goods</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-center space-y-1">
              <div className="font-mono text-xs font-bold text-slate-400">IS 10322 (Part 5/Sec 8)</div>
              <div className="inline-block px-4 py-2 border-2 border-slate-800 rounded font-black text-xl tracking-widest my-1">
                ISI
              </div>
              <div className="font-mono text-xs font-bold text-blue-700">CM/L - 8400123</div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Always check that the <strong>IS Number</strong> is printed above the monogram and the <strong>7-digit CM/L Number</strong> is printed directly below.
            </p>
          </div>

          {/* Hallmark HUID anatomy */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                Au
              </span>
              <span className="text-xs font-bold text-slate-900">Gold Hallmark 3-Mark System</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-around py-3">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center text-amber-700 font-bold text-xs mx-auto mb-1">
                  BIS
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">1. BIS Logo</span>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm text-slate-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 mb-1">
                  22K916
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">2. Purity Grade</span>
              </div>
              <div className="text-center">
                <div className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 mb-1">
                  AB1234
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">3. 6-Digit HUID</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every hallmarked piece carries 3 marks: Triangular BIS emblem, karat purity fineness, and a laser-inscribed 6-digit HUID.
            </p>
          </div>
        </div>
      </div>

      {/* Two Interactive Verifiers: CML Number and HUID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CML Licence Verifier */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verify BIS Licence (CM/L)</h3>
              <p className="text-[11px] text-slate-500">Test with: 8400123 or 9999999</p>
            </div>
          </div>

          <form onSubmit={handleVerifyCml} className="flex gap-2">
            <input
              type="text"
              value={cmlInput}
              onChange={(e) => setCmlInput(e.target.value)}
              placeholder="Enter 7-digit CM/L Number..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B192C] hover:bg-[#1E3E62] text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Verify
            </button>
          </form>

          {cmlResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
                cmlResult.valid
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/70 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {cmlResult.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Genuine Active BIS Licence</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Licence Not Found / Invalid</span>
                  </>
                )}
              </div>

              {cmlResult.valid ? (
                <div className="space-y-1 pt-1 text-slate-700">
                  <div><strong>Company:</strong> {cmlResult.licensee}</div>
                  <div><strong>Product:</strong> {cmlResult.product}</div>
                  <div><strong>Standard:</strong> {cmlResult.standard}</div>
                  <div><strong>Validity:</strong> Valid till {cmlResult.validTill}</div>
                </div>
              ) : (
                <p className="text-slate-600">{cmlResult.message}</p>
              )}
            </div>
          )}
        </div>

        {/* HUID Gold Hallmark Verifier */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Verify Hallmark HUID Code</h3>
              <p className="text-[11px] text-slate-500">Test with 6 chars: AB1234 or JK7890</p>
            </div>
          </div>

          <form onSubmit={handleVerifyHuid} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={huidInput}
              onChange={(e) => setHuidInput(e.target.value)}
              placeholder="Enter 6-digit HUID (e.g. AB1234)..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm uppercase font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Verify HUID
            </button>
          </form>

          {huidResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
                huidResult.valid
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/70 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {huidResult.valid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Genuine Hallmarked Jewellery Lot</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Format Error</span>
                  </>
                )}
              </div>

              {huidResult.valid ? (
                <div className="space-y-1 pt-1 text-slate-700">
                  <div><strong>Purity:</strong> {huidResult.purity}</div>
                  <div><strong>Article:</strong> {huidResult.articleType}</div>
                  <div><strong>AHC Testing Centre:</strong> {huidResult.ahcCenter}</div>
                  <div><strong>Hallmarked Date:</strong> {huidResult.hallmarkingDate}</div>
                </div>
              ) : (
                <p className="text-slate-600">{huidResult.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consumer FAQs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Frequently Asked Consumer Questions
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {consumerFaqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
