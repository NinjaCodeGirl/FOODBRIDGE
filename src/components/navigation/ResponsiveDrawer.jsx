import React, { useEffect } from 'react';
import { 
  X, 
  Utensils, 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Truck, 
  BarChart3, 
  Bell, 
  Settings, 
  Search, 
  BookmarkCheck, 
  Layers, 
  History, 
  User, 
  HelpCircle, 
  ShieldCheck, 
  CreditCard, 
  TrendingUp, 
  PieChart, 
  Tag,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ResponsiveDrawer({
  isOpen,
  onClose,
  role = 'DONOR',
  activeTab,
  setActiveTab,
  onOpenOnboarding
}) {
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getNavItems = () => {
    switch (role) {
      case 'DONOR':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'donations', label: 'My Food Listings', icon: Package },
          { id: 'post', label: '+ Post Surplus Food', icon: PlusCircle, isHighlight: true },
          { id: 'pickups', label: 'Live Pickups', icon: Truck },
          { id: 'compliance', label: 'FSSAI Compliance', icon: ShieldCheck },
          { id: 'pricing', label: 'Plans & Pricing', icon: Tag },
          { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'impact', label: 'Impact & Leaderboard', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'NGO':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'find-food', label: 'Browse Surplus Food', icon: Search, isHighlight: true },
          { id: 'map', label: 'Nearby Map', icon: MapPin },
          { id: 'requests', label: 'My Requests', icon: BookmarkCheck },
          { id: 'pickups', label: 'Incoming Transit', icon: Truck },
          { id: 'distributions', label: 'Distribution Records', icon: HeartHandshake },
          { id: 'compliance', label: 'Safety & Audit', icon: ShieldCheck },
          { id: 'pricing', label: 'Pricing (Free NGO)', icon: Tag },
          { id: 'impact', label: 'Impact', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'VOLUNTEER':
        return [
          { id: 'overview', label: 'Console', icon: LayoutDashboard },
          { id: 'pickups', label: 'Active Pickup', icon: Truck, isHighlight: true },
          { id: 'history', label: 'Delivery History', icon: History },
          { id: 'compliance', label: 'Audit Handshakes', icon: ShieldCheck },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'ADMIN':
      default:
        return [
          { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
          { id: 'revenue', label: 'B2B SaaS Revenue', icon: TrendingUp, isHighlight: true },
          { id: 'unit-economics', label: 'Unit Economics', icon: PieChart },
          { id: 'compliance', label: 'FSSAI Regulatory Ledger', icon: ShieldCheck },
          { id: 'donations', label: 'All Surplus Flow', icon: Package },
          { id: 'pickups', label: 'Dispatch Matrix', icon: Truck },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-dark/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col justify-between z-10 animate-fadeIn">
        
        {/* Top Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-orange">
              <Utensils className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-base text-navy font-display">
              Food<span className="text-primary">Bridge</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-txt-secondary hover:text-navy hover:bg-surface-subtle transition-colors touch-target"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-surface-subtle border-b border-border">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-txt-muted block">
            Logged In As
          </span>
          <span className="font-extrabold text-xs text-navy block truncate mt-0.5">
            {currentUser?.organizationName || currentUser?.name || 'Guest User'}
          </span>
          <span className="text-[11px] text-primary font-bold">
            Role: {role}
          </span>
        </div>

        {/* Links Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all touch-target ${
                  isActive
                    ? 'bg-primary text-white shadow-orange'
                    : item.isHighlight
                    ? 'bg-orange-50 text-primary border border-orange-200'
                    : 'text-txt-secondary hover:text-navy hover:bg-surface-subtle'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isHighlight ? 'text-primary' : 'text-txt-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {onOpenOnboarding && (
            <button
              onClick={() => {
                onOpenOnboarding();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-txt-secondary hover:text-navy hover:bg-surface-subtle"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>How It Works Guide</span>
            </button>
          )}
          <span className="text-[10px] text-txt-muted block text-center">
            FoodBridge Operational Ledger
          </span>
        </div>

      </div>
    </div>
  );
}
