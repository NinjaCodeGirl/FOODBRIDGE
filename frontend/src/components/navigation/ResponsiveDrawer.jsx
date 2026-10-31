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
  ExternalLink,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  PieChart,
  Tag
} from 'lucide-react';

export default function ResponsiveDrawer({
  isOpen,
  onClose,
  role = 'DONOR',
  activeTab,
  setActiveTab,
  onOpenOnboarding
}) {
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
          { id: 'donations', label: 'My Donations', icon: Package },
          { id: 'post', label: 'Post Food', icon: PlusCircle },
          { id: 'pickups', label: 'Pickups', icon: Truck },
          { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck },
          { id: 'pricing', label: 'Plans & Pricing', icon: Tag },
          { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'impact', label: 'Impact', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'NGO':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'find-food', label: 'Find Food', icon: Search },
          { id: 'claims', label: 'My Claims', icon: BookmarkCheck },
          { id: 'pickups', label: 'Incoming Pickups', icon: Truck },
          { id: 'compliance', label: 'Safety & Audit', icon: ShieldCheck },
          { id: 'capacity', label: 'Capacity', icon: Layers },
          { id: 'pricing', label: 'Pricing (Free NGO)', icon: Tag },
          { id: 'impact', label: 'Impact', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'VOLUNTEER':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'pickups', label: 'Available Pickups', icon: Truck },
          { id: 'my-pickups', label: 'My Pickups', icon: Package },
          { id: 'compliance', label: 'Audit Handshakes', icon: ShieldCheck },
          { id: 'history', label: 'History', icon: History },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'ADMIN':
      default:
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
          { id: 'unit-economics', label: 'Unit Economics', icon: PieChart },
          { id: 'compliance', label: 'Audit & Compliance', icon: ShieldCheck },
          { id: 'donations', label: 'All Surplus', icon: Package },
          { id: 'pickups', label: 'Pickups', icon: Truck },
          { id: 'pricing', label: 'Plan Matrix', icon: Tag },
          { id: 'impact', label: 'Impact', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden animate-fadeIn" role="dialog" aria-modal="true">
      {/* Dimmed backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer panel */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-slideRight">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-txt-primary">
                  Food<span className="text-primary">Bridge</span>
                </span>
                <span className="block text-[10px] text-txt-secondary">
                  Surplus Network
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-gray-100 transition-colors touch-target"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-6 space-y-1" aria-label="Mobile menu">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors touch-target ${
                    isActive
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'text-txt-secondary hover:text-txt-primary hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-txt-muted'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border space-y-3">
          {onOpenOnboarding && (
            <button
              onClick={() => {
                onOpenOnboarding();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border text-xs font-semibold text-txt-secondary hover:text-txt-primary hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>How It Works Guide</span>
            </button>
          )}

          <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
              {role.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-txt-primary truncate">
                {role === 'DONOR' ? 'Taj Palace Kitchen' : role === 'NGO' ? 'Akshaya Patra' : 'Arjun Courier'}
              </p>
              <p className="text-[10px] text-txt-secondary truncate">
                Role: {role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
