// types/cookie.types.ts

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

export interface CookieConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
  onAcceptSelected: (selectedCookies: CookiePreferences) => void;
}

export interface ShopSettings {
  cookieConsentEnabled: boolean;
  // Otros campos de configuración que tengas
  siteName?: string;
  theme?: 'light' | 'dark';
  currency?: string;
  language?: string;
}

export interface CookieType {
  key: keyof CookiePreferences;
  title: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
}

// Tipos para servicios de terceros
export interface GoogleAnalyticsConfig {
  trackingId: string;
  anonymizeIp?: boolean;
  cookieDomain?: string;
}

export interface FacebookPixelConfig {
  pixelId: string;
  advancedMatching?: boolean;
}

export interface MarketingServicesConfig {
  googleAnalytics?: GoogleAnalyticsConfig;
  facebookPixel?: FacebookPixelConfig;
  googleAds?: {
    conversionId: string;
  };
}

// Utilitarios para cookies
export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

export interface CookieConsentData {
  consent: 'accepted' | 'declined' | 'partial';
  preferences: CookiePreferences;
  timestamp: string;
  version: string; // Para versionado de políticas
}