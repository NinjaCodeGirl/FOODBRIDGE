import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Pre-seeded authentic demo users for hackathon review and testing
const INITIAL_ACCOUNTS = [
  {
    id: 'user-donor-01',
    email: 'taj@foodbridge.org',
    name: 'Chef Rajesh',
    role: 'DONOR',
    organizationName: 'Taj Palace Banquet Kitchen',
    phone: '+91 98999 11223',
    address: 'Sardar Patel Marg, Diplomatic Enclave, New Delhi',
    latitude: 28.5975,
    longitude: 77.1724,
    fssaiNumber: '10014011001890',
    businessType: 'HOTEL_BANQUET',
    status: 'APPROVED',
    trustScore: 4.98,
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'user-ngo-01',
    email: 'akshaya@foodbridge.org',
    name: 'Rajesh Kumar',
    role: 'NGO',
    organizationName: 'Akshaya Patra Foundation Shelter',
    phone: '+91 98101 23456',
    address: 'Dwarka Sector 10, New Delhi',
    latitude: 28.5833,
    longitude: 77.0500,
    registrationNumber: 'DL/2018/0192847',
    capacityMeals: 500,
    hasColdStorage: true,
    operatingHours: '08:00 AM - 10:00 PM',
    status: 'APPROVED',
    trustScore: 4.97,
    createdAt: '2026-02-10T10:30:00.000Z'
  },
  {
    id: 'user-volunteer-01',
    email: 'arjun@foodbridge.org',
    name: 'Arjun Sharma',
    role: 'VOLUNTEER',
    organizationName: 'Delhi Green Courier Volunteers',
    phone: '+91 98234 56789',
    address: 'Janakpuri District Centre, New Delhi',
    latitude: 28.6219,
    longitude: 77.0878,
    serviceRadiusKm: 15,
    transportMode: 'Insulated Van (DL-3C-9821)',
    availability: 'Full Time / On Call',
    status: 'APPROVED',
    trustScore: 4.94,
    createdAt: '2026-03-01T12:00:00.000Z'
  },
  {
    id: 'user-admin-01',
    email: 'admin@foodbridge.org',
    name: 'Pooja Verma',
    role: 'ADMIN',
    organizationName: 'FoodBridge Central Governance',
    phone: '+91 98000 00000',
    address: 'Barakhamba Road, Connaught Place, New Delhi',
    latitude: 28.6304,
    longitude: 77.2177,
    status: 'APPROVED',
    trustScore: 5.00,
    createdAt: '2025-11-01T00:00:00.000Z'
  }
];

export function AuthProvider({ children }) {
  // Accounts directory persisted in localStorage
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('foodbridge_accounts_v2');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch (e) {
      return INITIAL_ACCOUNTS;
    }
  });

  // Current session user (defaulting to null so user sees Landing Page initially, or auto-loads if previously logged in)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('foodbridge_current_user_v2');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Persist accounts
  useEffect(() => {
    try {
      localStorage.setItem('foodbridge_accounts_v2', JSON.stringify(accounts));
    } catch (e) {}
  }, [accounts]);

  // Persist active session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('foodbridge_current_user_v2', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('foodbridge_current_user_v2');
      }
    } catch (e) {}
  }, [currentUser]);

  // Login handler
  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const found = accounts.find(a => a.email.toLowerCase() === trimmedEmail);
    if (!found) {
      throw new Error('No registered account found with this email address.');
    }
    // Set active session
    setCurrentUser(found);
    return found;
  };

  // Demo Login Quick-switch
  const loginAsDemo = (role) => {
    const found = accounts.find(a => a.role === role);
    if (found) {
      setCurrentUser(found);
      return found;
    }
  };

  // Register handler
  const register = (registrationData) => {
    const trimmedEmail = registrationData.email.trim().toLowerCase();
    const existing = accounts.find(a => a.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error('An account with this email address is already registered.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      name: registrationData.name,
      role: registrationData.role || 'DONOR',
      organizationName: registrationData.organizationName || registrationData.name,
      phone: registrationData.phone,
      address: registrationData.address,
      latitude: Number(registrationData.latitude || 28.6100),
      longitude: Number(registrationData.longitude || 77.0380),
      // Role specific fields
      fssaiNumber: registrationData.fssaiNumber || null,
      businessType: registrationData.businessType || null,
      registrationNumber: registrationData.registrationNumber || null,
      capacityMeals: registrationData.capacityMeals ? Number(registrationData.capacityMeals) : null,
      hasColdStorage: Boolean(registrationData.hasColdStorage),
      operatingHours: registrationData.operatingHours || '09:00 AM - 08:00 PM',
      transportMode: registrationData.transportMode || null,
      serviceRadiusKm: registrationData.serviceRadiusKm ? Number(registrationData.serviceRadiusKm) : 10,
      status: registrationData.role === 'ADMIN' ? 'APPROVED' : 'APPROVED', // Auto-approved for hackathon demonstration
      trustScore: 5.00,
      createdAt: new Date().toISOString()
    };

    setAccounts(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return newUser;
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
  };

  // Switch role directly (admin utility or developer preview)
  const switchRole = (newRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      setAccounts(prev => prev.map(a => a.id === currentUser.id ? updated : a));
    } else {
      loginAsDemo(newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        login,
        loginAsDemo,
        register,
        logout,
        switchRole,
        accounts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
