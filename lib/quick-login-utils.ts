// Utilidades para manejo de inicio de sesión rápido
export interface QuickLoginData {
  email: string;
  name: string;
  userId: string;
  timestamp: number;
}

export interface QuickLoginSession {
  id: string;
  email: string;
  name: string;
  userId: string;
  timestamp: number;
  token: string;
}

// Clave secreta para encriptación (en producción debería estar en variables de entorno)
const SECRET_KEY = process.env.NEXT_PUBLIC_REMEMBER_SECRET || 'your-secret-key-change-in-production';

/**
 * Encriptación simple usando Base64 y XOR
 */
const simpleEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
};

/**
 * Desencriptación simple usando Base64 y XOR
 */
const simpleDecrypt = (encryptedText: string, key: string): string => {
  try {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    return '';
  }
};

/**
 * Genera un token encriptado para el inicio de sesión rápido
 */
export const generateQuickLoginToken = (email: string, name: string, userId: string): string => {
  const data = {
    email,
    name,
    userId,
    timestamp: Date.now(),
    expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 días
  };
  
  const jsonData = JSON.stringify(data);
  return simpleEncrypt(jsonData, SECRET_KEY);
};

/**
 * Desencripta y valida un token de inicio rápido
 */
export const validateQuickLoginToken = (token: string): QuickLoginData | null => {
  try {
    const decryptedData = simpleDecrypt(token, SECRET_KEY);
    
    if (!decryptedData) {
      return null;
    }
    
    const data = JSON.parse(decryptedData);
    
    // Verificar si el token ha expirado
    if (Date.now() > data.expires) {
      return null;
    }
    
    return {
      email: data.email,
      name: data.name,
      userId: data.userId,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error validating quick login token:', error);
    return null;
  }
};

/**
 * Guarda múltiples sesiones de inicio rápido en localStorage
 */
export const saveQuickLoginSession = (email: string, name: string, userId: string): void => {
  try {
    const sessions = getQuickLoginSessions();
    const sessionId = `${userId}_${Date.now()}`;
    const token = generateQuickLoginToken(email, name, userId);
    
    // Verificar si ya existe una sesión para este usuario
    const existingSessionIndex = sessions.findIndex(session => session.userId === userId);
    
    const newSession: QuickLoginSession = {
      id: sessionId,
      email,
      name,
      userId,
      timestamp: Date.now(),
      token
    };
    
    if (existingSessionIndex >= 0) {
      // Actualizar sesión existente
      sessions[existingSessionIndex] = newSession;
    } else {
      // Añadir nueva sesión
      sessions.push(newSession);
    }
    
    // Limitar a máximo 5 sesiones
    if (sessions.length > 5) {
      sessions.splice(0, sessions.length - 5);
    }
    
    localStorage.setItem('quickLoginSessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving quick login session:', error);
  }
};

/**
 * Obtiene todas las sesiones de inicio rápido guardadas
 */
export const getQuickLoginSessions = (): QuickLoginSession[] => {
  try {
    const sessionsData = localStorage.getItem('quickLoginSessions');
    if (!sessionsData) {
      return [];
    }
    
    const sessions: QuickLoginSession[] = JSON.parse(sessionsData);
    
    // Filtrar sesiones expiradas
    const validSessions = sessions.filter(session => {
      const quickLoginData = validateQuickLoginToken(session.token);
      return quickLoginData !== null;
    });
    
    // Actualizar localStorage si se eliminaron sesiones expiradas
    if (validSessions.length !== sessions.length) {
      localStorage.setItem('quickLoginSessions', JSON.stringify(validSessions));
    }
    
    return validSessions;
  } catch (error) {
    console.error('Error getting quick login sessions:', error);
    return [];
  }
};

/**
 * Elimina una sesión específica de inicio rápido
 */
export const removeQuickLoginSession = (sessionId: string): void => {
  try {
    const sessions = getQuickLoginSessions();
    const filteredSessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem('quickLoginSessions', JSON.stringify(filteredSessions));
  } catch (error) {
    console.error('Error removing quick login session:', error);
  }
};

/**
 * Elimina todas las sesiones de inicio rápido
 */
export const clearAllQuickLoginSessions = (): void => {
  try {
    localStorage.removeItem('quickLoginSessions');
  } catch (error) {
    console.error('Error clearing all quick login sessions:', error);
  }
};

/**
 * Verifica si hay sesiones de inicio rápido guardadas
 */
export const hasQuickLoginSessions = (): boolean => {
  return getQuickLoginSessions().length > 0;
};

/**
 * Obtiene una sesión específica por ID
 */
export const getQuickLoginSessionById = (sessionId: string): QuickLoginSession | null => {
  const sessions = getQuickLoginSessions();
  return sessions.find(session => session.id === sessionId) || null;
};

// Funciones de compatibilidad con el sistema anterior
export const getQuickLogin = (): QuickLoginData | null => {
  const sessions = getQuickLoginSessions();
  if (sessions.length === 0) {
    return null;
  }
  
  // Devolver la sesión más reciente
  const latestSession = sessions[sessions.length - 1];
  return validateQuickLoginToken(latestSession.token);
};

export const hasQuickLogin = (): boolean => {
  return hasQuickLoginSessions();
};

export const clearQuickLogin = (): void => {
  clearAllQuickLoginSessions();
};
