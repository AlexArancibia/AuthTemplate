import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookieBarProps {
  onAccept: () => void;
  onClose: () => void;
}

const CookieBar: React.FC<CookieBarProps> = ({ onAccept, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Mostrar la barra después de 2 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    onAccept();
    setIsVisible(false);
  };

  const handleClose = () => {
    onClose();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      data-cookie-bar
      className="fixed bottom-0 left-0 right-0 z-50 bg-gray-600 text-white shadow-lg border-t border-gray-500"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Icono y texto */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <Cookie className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200" />
            </div>
            <p className="text-xs sm:text-sm text-gray-100 leading-relaxed">
              Usamos cookies para mejorar tu experiencia y mostrarte productos que te interesan.{' '}
              <a 
                href="/politica-de-privacidad" 
                className="text-gray-300 hover:text-white underline"
              >
                Revisa nuestras políticas de privacidad y cookies
              </a>
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 text-sm font-medium border border-gray-500"
            >
              Aceptar
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-gray-200 hover:text-white hover:bg-gray-500 p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBar;