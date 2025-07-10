import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CookieConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
  onAcceptSelected: (selectedCookies: CookiePreferences) => void;
}

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

const CookieConsentDialog: React.FC<CookieConsentDialogProps> = ({ 
  onAccept, 
  onDecline, 
  onAcceptSelected 
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    personalization: false
  });

  useEffect(() => {
    // Mostrar el diálogo después de 1 segundo
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    onAccept();
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    onDecline();
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    onAcceptSelected(preferences);
    setIsVisible(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // No se puede cambiar
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Cookies Necesarias',
      description: 'Esenciales para el funcionamiento básico del sitio web. No se pueden desactivar.',
      icon: <Shield className="w-4 h-4" />,
      required: true
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Cookies de Análisis',
      description: 'Nos ayudan a entender cómo interactúas con nuestro sitio web mediante la recopilación de información de forma anónima.',
      icon: <Settings className="w-4 h-4" />,
      required: false
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Cookies de Marketing',
      description: 'Utilizadas para mostrar anuncios relevantes y medir la efectividad de nuestras campañas publicitarias.',
      icon: <Cookie className="w-4 h-4" />,
      required: false
    },
    {
      key: 'personalization' as keyof CookiePreferences,
      title: 'Cookies de Personalización',
      description: 'Permiten recordar tus preferencias y personalizar tu experiencia en el sitio.',
      icon: <Check className="w-4 h-4" />,
      required: false
    }
  ];

  return (
    <Dialog 
      open={isVisible} 
      onOpenChange={setIsVisible}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-medium">
                Configuración de Cookies
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Administra tus preferencias
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia de navegación, servir anuncios personalizados 
              y analizar el tráfico del sitio. Puedes personalizar tus preferencias.
            </p>
          </div>

          {/* Cookie Types con diseño más compacto */}
          {showAdvanced && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cookieTypes.map((cookie) => (
                <Card key={cookie.key} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="text-muted-foreground flex-shrink-0">
                          {cookie.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm truncate">
                              {cookie.title}
                            </h3>
                            {cookie.required && (
                              <Badge variant="secondary" className="text-xs text-white">
                                Requerido
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                            {cookie.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-3 flex-shrink-0">
                        <Switch
                          checked={preferences[cookie.key]}
                          onCheckedChange={() => handlePreferenceChange(cookie.key)}
                          disabled={cookie.required}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Advanced toggle */}
          <div>
            <Button
              variant="link"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-auto p-0 text-sm font-medium"
            >
              {showAdvanced ? 'Ocultar opciones' : 'Mostrar opciones'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleAcceptAll}
              className="w-full"
              size="lg"
            >
              Aceptar todas las cookies
            </Button>
            
            {showAdvanced && (
              <Button
                onClick={handleAcceptSelected}
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Aceptar seleccionadas
              </Button>
            )}
            
            <Button
              onClick={handleDeclineAll}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Rechazar todas
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              <a href="/politica-de-privacidad" className="text-primary hover:underline">
                Política de Privacidad
              </a>
              {' • '}
              <a href="/terminos-y-condiciones" className="text-primary hover:underline">
                Términos y Condiciones
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsentDialog;