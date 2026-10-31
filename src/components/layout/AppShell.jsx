import React, { useState } from 'react';
import Sidebar from '../navigation/Sidebar';
import TopNavbar from '../navigation/TopNavbar';
import MobileBottomNav from '../navigation/MobileBottomNav';
import ResponsiveDrawer from '../navigation/ResponsiveDrawer';
import Toast from '../ui/Toast';

export default function AppShell({
  role = 'DONOR',
  setRole,
  activeTab,
  setActiveTab,
  unreadNotifications = 2,
  onOpenOnboarding,
  onPostFood,
  toastMessage,
  toastType = 'success',
  onCloseToast,
  currentPlan = 'FOOD_PARTNER_PRO',
  onNavigateToSubscription,
  onNavigateToPricing,
  onOpenAuth,
  onNavigateToLanding,
  lang = 'en',
  setLang,
  children
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg text-txt-primary flex flex-col antialiased">
      <div className="flex-1 flex w-full">
        
        {/* Desktop Sidebar (>= 1024px) */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            role={role}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadNotifications={unreadNotifications}
            onOpenOnboarding={onOpenOnboarding}
          />
        </div>

        {/* Mobile & Tablet Slide-over Drawer */}
        <ResponsiveDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          role={role}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenOnboarding={onOpenOnboarding}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navbar */}
          <TopNavbar
            onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
            onOpenNotifications={() => setActiveTab('notifications')}
            unreadCount={unreadNotifications}
            onOpenOnboarding={onOpenOnboarding}
            onPostFood={onPostFood}
            currentPlan={currentPlan}
            onNavigateToSubscription={onNavigateToSubscription}
            onNavigateToPricing={onNavigateToPricing}
            onOpenAuth={onOpenAuth}
            onNavigateToLanding={onNavigateToLanding}
            lang={lang}
            setLang={setLang}
          />

          {/* Page Content Container */}
          <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 lg:pb-12">
            {children}
          </main>

        </div>
      </div>

      {/* Mobile Bottom Navigation (< 1024px) */}
      <MobileBottomNav
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={onCloseToast}
      />
    </div>
  );
}
