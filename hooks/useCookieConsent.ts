import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface CookieConsentState {
  showDialog: boolean;
  cookiesAccepted: boolean;
  cookiePreferences: CookiePreferences | null;
  acceptAllCookies: () => void;
  declineAllCookies: () => void;
  acceptSelectedCookies: (preferences: CookiePreferences) => void;
  openCookieSettings: () => void;
}

export const useCookieConsent = (): CookieConsentState => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(false);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    checkCookieConsent();
  }, []);

  const checkCookieConsent = (): void => {
    const consent = localStorage.getItem('cookieConsent');
    const preferences = localStorage.getItem('cookiePreferences');
    
    if (consent === null) {
      // No hay consentimiento previo, mostrar diálogo
      setShowDialog(true);
    } else {
      // Ya hay consentimiento
      setCookiesAccepted(consent === 'accepted');
      
      if (preferences) {
        try {
          const parsedPreferences = JSON.parse(preferences);
          setCookiePreferences(parsedPreferences);
          initializeServices(parsedPreferences);
        } catch (error) {
          console.error('Error parsing cookie preferences:', error);
        }
      }
    }
  };

  const acceptAllCookies = (): void => {
    const allAcceptedPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };

    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookiePreferences', JSON.stringify(allAcceptedPreferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    setCookiesAccepted(true);
    setCookiePreferences(allAcceptedPreferences);
    setShowDialog(false);
    
    initializeServices(allAcceptedPreferences);
  };

  const declineAllCookies = (): void => {
    const minimalPreferences: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    };

    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookiePreferences', JSON.stringify(minimalPreferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    setCookiesAccepted(false);
    setCookiePreferences(minimalPreferences);
    setShowDialog(false);
    
    // Limpiar cookies existentes si es necesario
    cleanupCookies();
  };

  const acceptSelectedCookies = (preferences: CookiePreferences): void => {
    const hasAcceptedAny = preferences.analytics || preferences.marketing || preferences.personalization;
    
    localStorage.setItem('cookieConsent', hasAcceptedAny ? 'accepted' : 'declined');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    setCookiesAccepted(hasAcceptedAny);
    setCookiePreferences(preferences);
    setShowDialog(false);
    
    initializeServices(preferences);
  };

  const openCookieSettings = (): void => {
    setShowDialog(true);
  };

  const initializeServices = (preferences: CookiePreferences): void => {
    if (typeof window === 'undefined') return;

    // Google Analytics
    if (preferences.analytics) {
      initializeGoogleAnalytics();
    }

    // Marketing cookies (Facebook Pixel, Google Ads, etc.)
    if (preferences.marketing) {
      initializeMarketingServices();
    }

    // Personalization cookies
    if (preferences.personalization) {
      initializePersonalizationServices();
    }
  };

  const initializeGoogleAnalytics = (): void => {
    // Inicializar Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
    
    // También puedes inicializar otros servicios de analytics aquí
    console.log('Google Analytics initialized');
  };

  const initializeMarketingServices = (): void => {
    // Inicializar servicios de marketing
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    }
    
    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('consent', 'grant');
    }
    
    console.log('Marketing services initialized');
  };

  const initializePersonalizationServices = (): void => {
    // Inicializar servicios de personalización
    console.log('Personalization services initialized');
  };

  const cleanupCookies = (): void => {
    // Limpiar cookies de terceros si el usuario las rechaza
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    
    // Limpiar cookies específicas
    const cookiesToClear = ['_ga', '_gid', '_gat', '_fbp', '_fbc'];
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  };

  return {
    showDialog,
    cookiesAccepted,
    cookiePreferences,
    acceptAllCookies,
    declineAllCookies,
    acceptSelectedCookies,
    openCookieSettings
  };
};

// Extensión del objeto Window para TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}