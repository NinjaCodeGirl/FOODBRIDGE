import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  FileText, 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Info,
  Calendar,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import SearchInput from '../ui/SearchInput';
import StatusBadge from '../ui/StatusBadge';

export default function ComplianceRecords({
  listings = [],
  role = 'DONOR'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentReport, setIncidentReport] = useState({
    listingId: 'list-001',
    type: 'TEMPERATURE_EXCURSION',
    notes: 'Holding temperature dropped below 60°C during transit delay.'
  });
  const [incidentSuccess, setIncidentSuccess] = useState(false);

  // Extended compliance records combining live listings
  const complianceData = [
    {
      id: 'REC-202610-001',
      listingId: 'list-001',
      donorName: 'NSUT Campus Dining Hall',
      recipientNgo: 'Akshaya Patra Foundation',
      foodTitle: 'Fresh Cooked Dal Makhani & Rice',
      category: 'COOKED_MEALS',
      servings: 180,
      weightKg: 54.0,
      storageCondition: 'HEATED (Above 65°C)',
      prepTimestamp: '17 Oct 2026, 11:30 AM',
      pickupTimestamp: '17 Oct 2026, 01:15 PM',
      deliveryTimestamp: '17 Oct 2026, 01:45 PM',
      courierName: 'Arjun Sharma (DL-3C-9821)',
      validationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      handoverStatus: 'CONFIRMED_OTP',
      fssaiCompliance: 'AUDITED_COMPLIANT',
      temperatureLog: 'Initial: 68°C | Handover: 64°C',
      allergenDeclared: ['Dairy', 'Gluten']
    },
    {
      id: 'REC-202610-002',
      listingId: 'list-002',
      donorName: 'Taj Palace Banquet Kitchen',
      recipientNgo: 'Robin Hood Army Janakpuri',
      foodTitle: 'Assorted Paneer Gravy & Rotis',
      category: 'COOKED_MEALS',
      servings: 350,
      weightKg: 105.0,
      storageCondition: 'REFRIGERATED (Below 4°C)',
      prepTimestamp: '17 Oct 2026, 10:00 AM',
      pickupTimestamp: '17 Oct 2026, 12:45 PM',
      deliveryTimestamp: '17 Oct 2026, 01:20 PM',
      courierName: 'Ravi Verma (DL-4S-1122)',
      validationHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      handoverStatus: 'CONFIRMED_QR',
      fssaiCompliance: 'AUDITED_COMPLIANT',
      temperatureLog: 'Initial: 3.5°C | Handover: 4.0°C',
      allergenDeclared: ['Dairy', 'Gluten']
    },
    {
      id: 'REC-202610-003',
      listingId: 'list-003',
      donorName: 'Bikanervala Sweets Dwarka',
      recipientNgo: 'Feeding India Shelter Home',
      foodTitle: 'Assorted Bread Loaves & Vegetable Cutlets',
      category: 'BAKERY',
      servings: 120,
      weightKg: 36.0,
      storageCondition: 'ROOM_TEMP (Sealed Dry Storage)',
      prepTimestamp: '17 Oct 2026, 08:30 AM',
      pickupTimestamp: '17 Oct 2026, 10:45 AM',
      deliveryTimestamp: '17 Oct 2026, 11:15 AM',
      courierName: 'Sanjay Kumar (DL-1T-7788)',
      validationHash: '3f211c4b7890aef481239c01289fe4217643a1290bb3412aef6789a12bc901a1',
      handoverStatus: 'CONFIRMED_OTP',
      fssaiCompliance: 'AUDITED_COMPLIANT',
      temperatureLog: 'Ambient: 24°C',
      allergenDeclared: ['Gluten']
    }
  ];

  // Filtering
  const filteredRecords = complianceData.filter(rec => {
    const matchesSearch = 
      rec.foodTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.recipientNgo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || rec.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadReport = (rec) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      const reportText = `========================================================================
FOODBRIDGE OPERATIONAL FOOD-SAFETY & TRACEABILITY AUDIT RECORD
========================================================================
Record Reference: ${rec.id}
Generated Timestamp: ${new Date().toISOString()}

[CRITICAL STATUTORY DISCLAIMER - SECTION 80G INCOME TAX ACT]
------------------------------------------------------------------------
NOTICE: In-kind surplus food donations (cooked meals, bakery, perishables) 
are NOT eligible for Section 80G income tax deductions under the Indian 
Income Tax Act (1961), which strictly applies to monetary charitable contributions. 
FoodBridge provides immutable operational traceability, cold-chain logs, 
and ESG sustainability records for quality assurance and compliance purposes only.
DO NOT submit this document as an 80G tax deduction receipt.
------------------------------------------------------------------------

1. FOOD DONOR ENTITY
Organization: ${rec.donorName}
Verified FSSAI Category: Commercial Food Business Operator

2. RECIPIENT COMMUNITY PARTNER
Organization: ${rec.recipientNgo}
Partner Status: Verified 12A Non-Profit Shelter

3. SURPLUS FOOD SPECIFICATION
Item: ${rec.foodTitle}
Category: ${rec.category}
Quantity: ${rec.servings} Servings (${rec.weightKg} kg)
Storage Protocol: ${rec.storageCondition}
Temperature Log: ${rec.temperatureLog}
Declared Allergens: ${rec.allergenDeclared.join(', ')}

4. CHAIN OF CUSTODY & HANDOVER TIMESTAMPS
Preparation Recorded: ${rec.prepTimestamp}
Pickup Handshake: ${rec.pickupTimestamp}
Delivery Confirmed: ${rec.deliveryTimestamp}
Courier / Handler: ${rec.courierName}
Handover Verification Mode: ${rec.handoverStatus}

5. CRYPTOGRAPHIC INTEGRITY
Verification Hash: ${rec.validationHash}
Compliance Status: ${rec.fssaiCompliance}
========================================================================`;

      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rec.id}_traceability_log.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 600);
  };

  const handleReportIncident = (e) => {
    e.preventDefault();
    setIncidentSuccess(true);
    setTimeout(() => {
      setIncidentSuccess(false);
      setShowIncidentModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Food Safety, Traceability & Compliance Ledger"
        subtitle="Immutable chain-of-custody records, temperature logs, and cryptographic handover verification for FSSAI compliance"
        badge="Regulatory Compliance"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIncidentModal(true)}
              className="px-3.5 py-2 rounded-xl border border-border hover:bg-gray-50 text-status-warning font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-status-warning" />
              <span>Log Quality Incident</span>
            </button>
            <button
              onClick={() => handleDownloadReport(complianceData[0])}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Audit Log</span>
            </button>
          </div>
        }
      />

      {/* CRITICAL STATUTORY DISCLAIMER BANNER (MANDATORY PHASE 8 REQUIREMENT) */}
      <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 space-y-2">
        <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 stroke-[2.5]" />
          <span>Statutory Tax & Regulatory Notice: Non-80G Income Tax Exemption</span>
        </div>
        <p className="text-amber-900 leading-relaxed text-xs">
          <strong>Food donations in kind are NOT eligible for Section 80G income tax deductions</strong> under the Indian Income Tax Act (1961), which strictly applies to direct monetary contributions. FoodBridge does not issue tax deduction certificates or promise tax savings. 
          The audit records below serve strictly as <strong>operational traceability logs, food safety documentation, and corporate ESG sustainability records</strong> under FSSAI surplus food regulations.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search records, donors, shelters..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-txt-secondary font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-border text-xs font-bold text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Categories</option>
            <option value="COOKED_MEALS">Cooked Meals</option>
            <option value="BAKERY">Bakery & Breads</option>
            <option value="PACKAGED">Packaged Dry Goods</option>
          </select>
        </div>
      </div>

      {/* Compliance Records Table */}
      <div className="fb-card bg-white border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-txt-secondary font-bold">
                <th className="p-3.5">Record ID</th>
                <th className="p-3.5">Food Surplus Item</th>
                <th className="p-3.5">Food Partner (Donor)</th>
                <th className="p-3.5">Recipient Shelter</th>
                <th className="p-3.5">Quantity</th>
                <th className="p-3.5">Handover & Custody</th>
                <th className="p-3.5 text-center">FSSAI Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-txt-primary whitespace-nowrap">
                    {rec.id}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-txt-primary">{rec.foodTitle}</div>
                    <div className="text-[11px] text-txt-muted">{rec.category} • {rec.storageCondition}</div>
                  </td>
                  <td className="p-3.5 text-txt-primary font-medium">{rec.donorName}</td>
                  <td className="p-3.5 text-txt-secondary">{rec.recipientNgo}</td>
                  <td className="p-3.5">
                    <span className="font-bold text-txt-primary">{rec.servings} Servings</span>
                    <span className="text-[10px] text-txt-muted block">({rec.weightKg} kg)</span>
                  </td>
                  <td className="p-3.5 text-[11px]">
                    <div className="font-semibold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>{rec.handoverStatus}</span>
                    </div>
                    <div className="text-txt-muted">{rec.deliveryTimestamp}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      {rec.fssaiCompliance}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-2.5 py-1 rounded-lg border border-border hover:bg-gray-100 text-txt-primary font-semibold text-xs mr-1.5"
                    >
                      Audit View
                    </button>
                    <button
                      onClick={() => handleDownloadReport(rec)}
                      className="p-1 rounded-lg border border-border hover:bg-gray-100 text-primary"
                      title="Download Traceability Record"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Audit View Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-xl p-6 bg-white shadow-elevation relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-txt-muted">
                  Cryptographic Traceability Certificate
                </span>
                <h3 className="text-lg font-bold text-txt-primary mt-1">
                  {selectedRecord.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-lg text-txt-secondary hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border space-y-1">
                <span className="font-bold text-txt-primary block">Food Partner & Recipient Shelter:</span>
                <p className="text-txt-secondary">
                  <strong>Donor:</strong> {selectedRecord.donorName}
                </p>
                <p className="text-txt-secondary">
                  <strong>Recipient:</strong> {selectedRecord.recipientNgo}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border space-y-1">
                <span className="font-bold text-txt-primary block">Cold-Chain & Food Safety Logs:</span>
                <p className="text-txt-secondary">
                  <strong>Storage:</strong> {selectedRecord.storageCondition}
                </p>
                <p className="text-txt-secondary">
                  <strong>Temperature Logs:</strong> {selectedRecord.temperatureLog}
                </p>
                <p className="text-txt-secondary">
                  <strong>Allergens Declared:</strong> {selectedRecord.allergenDeclared.join(', ')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border space-y-1">
                <span className="font-bold text-txt-primary block">Custody Timeline:</span>
                <p className="text-txt-secondary">Prepared: {selectedRecord.prepTimestamp}</p>
                <p className="text-txt-secondary">Picked Up: {selectedRecord.pickupTimestamp}</p>
                <p className="text-txt-secondary">Delivered: {selectedRecord.deliveryTimestamp}</p>
                <p className="text-txt-secondary">Courier: {selectedRecord.courierName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] break-all">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">SHA-256 Validation Hash:</span>
                {selectedRecord.validationHash}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex-1 py-2 rounded-xl border border-border hover:bg-gray-50 text-txt-primary font-semibold text-xs"
              >
                Close View
              </button>
              <button
                onClick={() => handleDownloadReport(selectedRecord)}
                className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Audited Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Log Quality Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-md p-6 bg-white shadow-elevation relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-txt-primary">Log Food Safety Incident</h3>
                <p className="text-xs text-txt-secondary">Submit an operational anomaly or temperature deviation</p>
              </div>
            </div>

            {incidentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <h4 className="font-bold text-sm text-txt-primary">Incident Recorded</h4>
                <p className="text-xs text-txt-secondary">Compliance ref logged. Ops team notified for review.</p>
              </div>
            ) : (
              <form onSubmit={handleReportIncident} className="space-y-3 text-xs">
                <div>
                  <label className="text-txt-secondary font-medium block">Related Listing / Handover</label>
                  <select
                    value={incidentReport.listingId}
                    onChange={(e) => setIncidentReport({ ...incidentReport, listingId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border"
                  >
                    <option value="list-001">list-001: Dal Makhani (NSUT)</option>
                    <option value="list-002">list-002: Paneer Gravy (Taj Palace)</option>
                    <option value="list-003">list-003: Bread Loaves (Bikanervala)</option>
                  </select>
                </div>

                <div>
                  <label className="text-txt-secondary font-medium block">Incident Type</label>
                  <select
                    value={incidentReport.type}
                    onChange={(e) => setIncidentReport({ ...incidentReport, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border"
                  >
                    <option value="TEMPERATURE_EXCURSION">Temperature Excursion</option>
                    <option value="TRANSIT_DELAY">Significant Transit Delay (&gt; 45 mins)</option>
                    <option value="PACKAGING_DAMAGE">Packaging Seal Breach</option>
                    <option value="SHELTER_REJECTION">Quality Rejection at Shelter Intake</option>
                  </select>
                </div>

                <div>
                  <label className="text-txt-secondary font-medium block">Detailed Observations</label>
                  <textarea
                    rows={3}
                    value={incidentReport.notes}
                    onChange={(e) => setIncidentReport({ ...incidentReport, notes: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIncidentModal(false)}
                    className="flex-1 py-2 rounded-xl border border-border hover:bg-gray-50 text-txt-primary font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-status-danger text-white font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
