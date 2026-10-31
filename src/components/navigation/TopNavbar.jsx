import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  HelpCircle, 
  PlusCircle, 
  Utensils, 
  ShieldCheck,
  ChevronDown,
  Sparkles,
  User,
  LogOut,
  Globe,
  Building2,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function TopNavbar({
  onToggleDrawer,
  onOpenNotifications,
  unreadCount = 2,
  onOpenOnboarding,
  onPostFood,
  currentPlan = 'FOOD_PARTNER_PRO',
  onNavigateToSubscription,
  onNavigateToPricing,
  onOpenAuth,
  onNavigateToLanding,
  lang = 'en',
  setLang,
  className = ''
}) {
  const { currentUser, role, logout, switchRole, isAuthenticated } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const roleColors = {
    DONOR: 'bg-orange-100 text-primary border-orange-200',
    NGO: 'bg-blue-100 text-blue-700 border-blue-200',
    VOLUNTEER: 'bg-amber-100 text-amber-800 border-amber-200',
    ADMIN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const roleLabels = {
    DONOR: 'Restaurant / Donor',
    NGO: 'NGO Shelter',
    VOLUNTEER: 'Courier Volunteer',
    ADMIN: 'Admin Console'
  };

  return (
    <header className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border pt-safe ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDrawer}
              className="lg:hidden p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-surface-subtle transition-colors touch-target"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo Click -> Return to Landing or Overview */}
            <button 
              onClick={onNavigateToLanding}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-orange transition-transform group-hover:scale-105">
                <Utensils className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-navy font-display">
                  Food<span className="text-primary">Bridge</span>
                </span>
                <span className="hidden sm:block text-[10px] text-txt-muted -mt-1 font-semibold">
                  Universal Redistribution Network
                </span>
              </div>
            </button>
          </div>

          {/* Right Actions: Role badge, notifications, language & profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher */}
            {setLang && (
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-surface-subtle text-xs font-bold text-txt-secondary flex items-center gap-1 transition-colors"
                title="Toggle Language (English / हिंदी)"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>{lang === 'en' ? 'हिंदी' : 'EN'}</span>
              </button>
            )}

            {/* How It Works Guide */}
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-surface-subtle text-txt-secondary text-xs font-bold transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>How It Works</span>
              </button>
            )}

            {/* Quick "+ Post Surplus Food" CTA on desktop for donors */}
            {role === 'DONOR' && onPostFood && (
              <button
                onClick={onPostFood}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-orange touch-target"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Post Food</span>
              </button>
            )}

            {/* Notification Bell & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-surface-subtle relative transition-colors touch-target"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              <NotificationDropdown
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                role={role}
                onNotificationClick={() => setNotificationsOpen(false)}
              />
            </div>

            {/* User Profile or Sign In CTA */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-border hover:bg-surface-subtle transition-all touch-target"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-primary flex items-center justify-center font-bold text-xs">
                    {currentUser?.name ? currentUser.name[0] : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-navy block truncate max-w-[120px]">
                      {currentUser?.organizationName || currentUser?.name}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${roleColors[role] || 'text-txt-muted'}`}>
                      {roleLabels[role] || role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-txt-muted hidden sm:block" />
                </button>

                {/* Profile & Role Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-border py-2 z-50 text-xs animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-border">
                      <span className="font-bold text-navy block">{currentUser?.name}</span>
                      <span className="text-txt-muted text-[11px] block">{currentUser?.email}</span>
                      <span className="text-primary font-bold text-[11px] block mt-0.5">{currentUser?.organizationName}</span>
                    </div>

                    {/* Quick Demo Switcher inside profile for testing */}
                    <div className="px-4 py-2 border-b border-border bg-surface-subtle">
                      <span className="text-[10px] font-bold text-txt-muted uppercase tracking-wider block mb-1.5">
                        ⚡ Switch Workspace Role:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => { switchRole('DONOR'); setProfileDropdownOpen(false); }}
                          className={`p-1.5 rounded-lg text-[11px] font-bold text-left ${role === 'DONOR' ? 'bg-primary text-white' : 'hover:bg-white text-txt-secondary'}`}
                        >
                          🍽️ Restaurant
                        </button>
                        <button
                          onClick={() => { switchRole('NGO'); setProfileDropdownOpen(false); }}
                          className={`p-1.5 rounded-lg text-[11px] font-bold text-left ${role === 'NGO' ? 'bg-primary text-white' : 'hover:bg-white text-txt-secondary'}`}
                        >
                          🏛️ NGO Shelter
                        </button>
                        <button
                          onClick={() => { switchRole('VOLUNTEER'); setProfileDropdownOpen(false); }}
                          className={`p-1.5 rounded-lg text-[11px] font-bold text-left ${role === 'VOLUNTEER' ? 'bg-primary text-white' : 'hover:bg-white text-txt-secondary'}`}
                        >
                          🚚 Volunteer
                        </button>
                        <button
                          onClick={() => { switchRole('ADMIN'); setProfileDropdownOpen(false); }}
                          className={`p-1.5 rounded-lg text-[11px] font-bold text-left ${role === 'ADMIN' ? 'bg-primary text-white' : 'hover:bg-white text-txt-secondary'}`}
                        >
                          🛡️ Admin
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => { logout(); setProfileDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-status-danger hover:bg-red-50 font-bold flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-txt-primary hover:text-primary transition-colors touch-target"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-orange transition-all touch-target"
                >
                  Join Now
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
