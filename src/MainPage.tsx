import { useState, useCallback } from 'react';
import { AppStateProvider, useApp } from '@/AppState';
import SiteHeader from '@/components/SiteHeader';
import HeroSection from '@/components/HeroSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import OffersCatalog from '@/components/OffersCatalog';
import PartnersMap from '@/components/PartnersMap';
import DealTemplatesSection from '@/components/DealTemplatesSection';
import ReviewsSection from '@/components/ReviewsSection';
import FinalCta from '@/components/FinalCta';
import SiteFooter from '@/components/SiteFooter';
import AuthDialog from '@/components/AuthDialog';
import DealDialog from '@/components/DealDialog';
import ChatPage from '@/components/ChatPage';
import ProfilePage from '@/components/ProfilePage';
import OfferDialog from '@/components/OfferDialog';
import CalendarPage from '@/components/CalendarPage';
import NotificationToast from '@/components/NotificationToast';
import type { BusinessCard } from '@/models';

type View = 'landing' | 'chat' | 'profile' | 'calendar';

function AppContent() {
  const { data, notifications, dismissNotification } = useApp();
  const [view, setView] = useState<View>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [dealOffer, setDealOffer] = useState<BusinessCard | null>(null);
  const [dealTemplate, setDealTemplate] = useState<{ name: string; terms: string } | null>(null);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);

  const scrollTo = useCallback((section: string) => {
    setView('landing');
    setTimeout(() => {
      const el = document.getElementById(section);
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  const openAuth = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
  }, []);

  const requireAuth = useCallback(() => {
    setAuthMode('login');
  }, []);

  const handleOfferDeal = useCallback((offer: BusinessCard) => {
    if (!data.currentUser) {
      requireAuth();
    } else {
      setDealOffer(offer);
    }
  }, [data.currentUser, requireAuth]);

  const handleUseTemplate = useCallback((name: string, terms: string) => {
    if (!data.currentUser) {
      requireAuth();
    } else {
      // Find the first offer that matches, or show the catalog
      setDealTemplate({ name, terms });
      scrollTo('catalog');
    }
  }, [data.currentUser, requireAuth, scrollTo]);

  const handleCreateOffer = useCallback(() => {
    if (!data.currentUser) {
      requireAuth();
    } else {
      setCreateOfferOpen(true);
    }
  }, [data.currentUser, requireAuth]);

  // If dealTemplate is set and user clicks an offer, apply template
  const handleOfferDealWithTemplate = useCallback((offer: BusinessCard) => {
    if (dealTemplate) {
      setDealOffer(offer);
    } else {
      handleOfferDeal(offer);
    }
  }, [dealTemplate, handleOfferDeal]);

  return (
    <div className="min-h-screen bg-ink-950">
      <SiteHeader
        onNavigate={scrollTo}
        onOpenAuth={openAuth}
        onOpenProfile={() => setView('profile')}
        onOpenChat={() => setView('chat')}
        onOpenCalendar={() => setView('calendar')}
        activeView={view}
      />

      {view === 'chat' && data.currentUser ? (
        <ChatPage onBack={() => { setView('landing'); scrollTo('hero'); }} />
      ) : view === 'profile' && data.currentUser ? (
        <ProfilePage onBack={() => { setView('landing'); scrollTo('hero'); }} onOpenCalendar={() => setView('calendar')} />
      ) : view === 'calendar' && data.currentUser ? (
        <CalendarPage onBack={() => { setView('landing'); scrollTo('hero'); }} onOpenChat={() => setView('chat')} />
      ) : (
        <main>
          <HeroSection
            onPrimary={() => scrollTo('catalog')}
            onSecondary={() => scrollTo('how')}
          />
          <HowItWorksSection />
          <OffersCatalog
            onRequireAuth={requireAuth}
            onOfferDeal={handleOfferDealWithTemplate}
            onCreateOffer={handleCreateOffer}
          />
          <PartnersMap />
          <DealTemplatesSection onUseTemplate={handleUseTemplate} />
          <ReviewsSection />
          <FinalCta onRegister={() => openAuth('register')} />
          <SiteFooter onNavigate={scrollTo} />
        </main>
      )}

      {/* Modals */}
      {authMode && (
        <AuthDialog
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitch={setAuthMode}
        />
      )}

      {dealOffer && (
        <DealDialog
          offer={dealOffer}
          templateName={dealTemplate?.name}
          templateTerms={dealTemplate?.terms}
          onClose={() => { setDealOffer(null); setDealTemplate(null); }}
        />
      )}

      {createOfferOpen && (
        <OfferDialog onClose={() => setCreateOfferOpen(false)} />
      )}

      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}
