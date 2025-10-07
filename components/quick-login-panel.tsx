"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { User, X, Loader2, Trash2 } from "lucide-react"
import { getQuickLoginSessions, removeQuickLoginSession, clearAllQuickLoginSessions, type QuickLoginSession } from "@/lib/quick-login-utils"
import { quickLoginAction } from "@/actions/auth-action"

interface QuickLoginPanelProps {
  onClose?: () => void;
}

export function QuickLoginPanel({ onClose }: QuickLoginPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [sessions, setSessions] = useState<QuickLoginSession[]>([]);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const router = useRouter();
  
  // Cargar sesiones al montar y cuando cambie el estado
  useEffect(() => {
    const loadedSessions = getQuickLoginSessions();
    setSessions(loadedSessions);
  }, []);
  
  if (sessions.length === 0) {
    return null;
  }

  const handleQuickLogin = async (session: QuickLoginSession) => {
    setLoadingSessionId(session.id);
    startTransition(async () => {
      try {
        const result = await quickLoginAction(session.token);

        if (result.error) {
          throw new Error(result.error);
        }

        toast.success("Inicio de sesión exitoso", {
          description: `Bienvenido de nuevo, ${result.user?.name}!`
        });

        // Redirigir al dashboard
        window.location.href = '/dashboard';
        
      } catch (error) {
        console.error('Error en inicio rápido:', error);
        toast.error("Error en inicio rápido", {
          description: error instanceof Error ? error.message : "Por favor inicia sesión normalmente"
        });
        setLoadingSessionId(null);
      }
    });
  };

  const handleRemoveSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeQuickLoginSession(sessionId);
    const updatedSessions = getQuickLoginSessions();
    setSessions(updatedSessions);
    
    toast.success("Cuenta eliminada", {
      description: "La cuenta ha sido eliminada del inicio rápido"
    });

    // Si no quedan sesiones, cerrar el panel
    if (updatedSessions.length === 0 && onClose) {
      onClose();
    }
  };

  const handleClearAll = () => {
    clearAllQuickLoginSessions();
    setSessions([]);
    toast.success("Todas las cuentas eliminadas", {
      description: "Se han eliminado todas las cuentas del inicio rápido"
    });
    if (onClose) {
      onClose();
    }
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generar un color basado en el email para que cada cuenta tenga un color único
  const getColorForEmail = (email: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-teal-500',
    ];
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Card className="w-80 border-slate-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-700">
            Inicio Rápido
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearAll}
            className="h-6 w-6 text-slate-400 hover:text-red-600"
            title="Eliminar todas las cuentas"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm text-slate-500">
          {sessions.length === 1 
            ? "1 cuenta guardada" 
            : `${sessions.length} cuentas guardadas`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Lista de sesiones guardadas */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group relative flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200"
              onClick={() => handleQuickLogin(session)}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className={`${getColorForEmail(session.email)} text-white text-sm font-medium`}>
                  {getInitials(session.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {session.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {session.email}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(session.timestamp).toLocaleDateString()}
                </p>
              </div>

              {loadingSessionId === session.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400 flex-shrink-0" />
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveSession(session.id, e)}
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-opacity flex-shrink-0"
                    title="Eliminar esta cuenta"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <User className="h-5 w-5 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-slate-400 text-center pt-2 border-t">
          Click en una cuenta para iniciar sesión rápidamente
        </div>
      </CardContent>
    </Card>
  );
}
