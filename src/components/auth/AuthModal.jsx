import React, { useState } from 'react';
import { 
  X, 
  Utensils, 
  Building2, 
  Truck, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialRole = 'DONOR' }) {
  const { login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Registration form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '+91 ',
    organizationName: '',
    address: 'Dwarka, New Delhi',
    latitude: 28.6100,
    longitude: 77.0380,
    // Restaurant specific
    fssaiNumber: '10014011001890',
    businessType: 'RESTAURANT',
    // NGO specific
    registrationNumber: 'DL/2021/0087654',
    capacityMeals: 250,
    hasColdStorage: true,
    operatingHours: '09:00 AM - 09:00 PM',
    // Volunteer specific
    transportMode: 'Two-Wheeler (Motorcycle)',
    serviceRadiusKm: 12
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (!loginEmail) throw new Error('Please enter your email address.');
      login(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (!regData.name.trim()) throw new Error('Full name or contact person is required.');
      if (!regData.email.trim()) throw new Error('Valid email address is required.');
      if (!regData.phone.trim()) throw new Error('Phone number is required for verification.');
      if (selectedRole === 'DONOR' && !regData.fssaiNumber) {
        throw new Error('FSSAI License / Registration number is required for food safety auditing.');
      }
      if (selectedRole === 'NGO' && !regData.registrationNumber) {
        throw new Error('NGO Darpan / Society Registration number is required for verification.');
      }

      register({
        ...regData,
        role: selectedRole
      });
      setSuccessMsg('Account registered & verified successfully! Welcome to FoodBridge.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    setErrorMsg('');
    loginAsDemo(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/75 backdrop-blur-sm animate-fadeIn">
      <div className="fb-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white shadow-xl relative border border-border">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-txt-primary rounded-xl hover:bg-surface-subtle transition-colors touch-target"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-white shadow-orange mb-3">
            <Utensils className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-txt-primary tracking-tight font-display">
            {mode === 'login' ? 'Sign In to FoodBridge' : mode === 'register' ? 'Create Your Account' : 'Reset Password'}
          </h2>
          <p className="text-xs sm:text-sm text-txt-secondary mt-1">
            {mode === 'login'
              ? 'Access your food redistribution dashboard and verified records'
              : 'Join as a restaurant donor, recipient shelter, or delivery volunteer'}
          </p>
        </div>

        {/* Mode Selector Tabs (Sign In / Register) */}
        <div className="flex p-1 bg-surface-subtle rounded-xl border border-border mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            Register Now
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-status-danger text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-status-success text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="taj@foodbridge.org"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-txt-primary">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-orange transition-all touch-target flex items-center justify-center gap-2"
            >
              {loading ? 'Signing In...' : 'Sign In to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick 1-Click Demo Login Bar */}
            <div className="pt-4 border-t border-border">
              <span className="text-[11px] font-bold text-txt-muted uppercase tracking-wider block text-center mb-2.5">
                ⚡ Quick 1-Click Demo Logins for Judges & Evaluators:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('DONOR')}
                  className="p-2 rounded-xl border border-border hover:border-primary/50 bg-surface-subtle hover:bg-white text-left text-xs transition-all flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block text-txt-primary truncate">Restaurant</span>
                    <span className="text-[10px] text-txt-secondary block">Taj Palace Banquets</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('NGO')}
                  className="p-2 rounded-xl border border-border hover:border-primary/50 bg-surface-subtle hover:bg-white text-left text-xs transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block text-txt-primary truncate">NGO Recipient</span>
                    <span className="text-[10px] text-txt-secondary block">Akshaya Patra</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('VOLUNTEER')}
                  className="p-2 rounded-xl border border-border hover:border-primary/50 bg-surface-subtle hover:bg-white text-left text-xs transition-all flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block text-txt-primary truncate">Volunteer</span>
                    <span className="text-[10px] text-txt-secondary block">Arjun Courier</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="p-2 rounded-xl border border-border hover:border-primary/50 bg-surface-subtle hover:bg-white text-left text-xs transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block text-txt-primary truncate">Admin</span>
                    <span className="text-[10px] text-txt-secondary block">Full Governance</span>
                  </div>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. ROLE-SPECIFIC REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Role Picker Pills */}
            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1.5">Select Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DONOR', label: 'Restaurant / Donor', icon: Utensils },
                  { id: 'NGO', label: 'NGO / Shelter', icon: Building2 },
                  { id: 'VOLUNTEER', label: 'Volunteer', icon: Truck },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      selectedRole === r.id
                        ? 'border-primary bg-primary-subtle text-primary font-bold shadow-sm'
                        : 'border-border text-txt-secondary hover:text-txt-primary hover:bg-surface-subtle font-medium'
                    }`}
                  >
                    <r.icon className="w-4 h-4" />
                    <span className="text-[11px] leading-tight">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">
                  {selectedRole === 'DONOR' ? 'Restaurant / Business Name' : selectedRole === 'NGO' ? 'NGO Name' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={regData.organizationName}
                  onChange={handleInputChange}
                  placeholder={selectedRole === 'DONOR' ? 'The Oberoi Kitchen' : selectedRole === 'NGO' ? 'Robin Hood Army' : 'Amit Verma'}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  name="name"
                  value={regData.name}
                  onChange={handleInputChange}
                  placeholder="Manager / Coordinator"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={regData.email}
                  onChange={handleInputChange}
                  placeholder="manager@domain.com"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-txt-primary mb-1">Verified Mobile Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={regData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-txt-primary mb-1">Premises Address / GPS Location *</label>
              <input
                type="text"
                name="address"
                value={regData.address}
                onChange={handleInputChange}
                placeholder="Street address, District, City"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs sm:text-sm font-medium focus:border-primary"
                required
              />
            </div>

            {/* ROLE SPECIFIC MANDATORY ATTRIBUTES */}
            {selectedRole === 'DONOR' && (
              <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 space-y-3">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  🛡️ FSSAI & Food Business Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-txt-primary mb-1">14-Digit FSSAI License *</label>
                    <input
                      type="text"
                      name="fssaiNumber"
                      value={regData.fssaiNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 10014011001890"
                      maxLength={14}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-txt-primary mb-1">Kitchen / Business Type</label>
                    <select
                      name="businessType"
                      value={regData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium"
                    >
                      <option value="RESTAURANT">Commercial Restaurant</option>
                      <option value="HOTEL_BANQUET">Hotel & Banquet Hall</option>
                      <option value="CATERER">Catering Service</option>
                      <option value="CAMPUS_CANTEEN">Campus / Corporate Dining</option>
                      <option value="BAKERY">Bakery & Confectionery</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'NGO' && (
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  🏛️ Shelter Intake & NGO Certification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-txt-primary mb-1">NGO Darpan / 80G Registration *</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={regData.registrationNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. DL/2021/0087654"
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-txt-primary mb-1">Max Daily Capacity (Meals)</label>
                    <input
                      type="number"
                      name="capacityMeals"
                      value={regData.capacityMeals}
                      onChange={handleInputChange}
                      placeholder="250"
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasColdStorage"
                    name="hasColdStorage"
                    checked={regData.hasColdStorage}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="hasColdStorage" className="text-xs font-medium text-txt-primary">
                    Has Commercial Cold Storage / Refrigeration for Category B items
                  </label>
                </div>
              </div>
            )}

            {selectedRole === 'VOLUNTEER' && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  🚚 Courier Vehicle & Service Area
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-txt-primary mb-1">Transport Vehicle</label>
                    <select
                      name="transportMode"
                      value={regData.transportMode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-medium"
                    >
                      <option value="Insulated Van">Insulated Van / Car</option>
                      <option value="Two-Wheeler (Motorcycle)">Two-Wheeler / Bike with Carrier</option>
                      <option value="Bicycle">Bicycle with insulated box</option>
                      <option value="Walking">Walking / Local Area</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-txt-primary mb-1">Service Radius (km)</label>
                    <input
                      type="number"
                      name="serviceRadiusKm"
                      value={regData.serviceRadiusKm}
                      onChange={handleInputChange}
                      placeholder="15"
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-orange transition-all touch-target flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Verified Account...' : 'Complete Registration & Access'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD SIMULATION */}
        {mode === 'forgot' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-txt-secondary leading-relaxed">
              Enter your registered email address and our automated security ledger will transmit an instant 6-digit verification code.
            </p>
            <input
              type="email"
              placeholder="your-email@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setSuccessMsg('A secure password reset link has been dispatched to your email.');
                setTimeout(() => setMode('login'), 2000);
              }}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs"
            >
              Send Reset Instructions
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs text-txt-secondary hover:text-txt-primary font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

