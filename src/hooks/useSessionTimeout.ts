import { useEffect, useRef, useState, useCallback } from 'react';
import { useSignOut } from './useSignOut';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number; // Tiempo total de inactividad antes del logout (default: 30 min)
  warningMinutes?: number; // Minutos antes del timeout para mostrar aviso (default: 1 min)
  onWarning?: () => void; // Callback cuando se muestra el aviso
  onTimeout?: () => void; // Callback cuando se hace logout automático
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    timeoutMinutes = 30,
    warningMinutes = 1,
    onWarning,
    onTimeout
  } = options;

  const { signOut } = useSignOut();
  
  // Estados
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Segundos restantes
  
  // Referencias para los timers
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Convertir minutos a milisegundos
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  // Limpiar todos los timers
  const clearAllTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // Logout automático
  const handleAutoLogout = useCallback(async () => {
    console.log('🚪 Sesión expirada por inactividad - cerrando sesión automáticamente');
    clearAllTimers();
    setIsWarningVisible(false);
    onTimeout?.();
    await signOut();
  }, [signOut, onTimeout, clearAllTimers]);

  // Mostrar aviso de cierre próximo
  const showWarning = useCallback(() => {
    console.log('⚠️ Mostrando aviso de cierre de sesión próximo');
    setIsWarningVisible(true);
    setTimeLeft(warningMinutes * 60); // Convertir a segundos
    onWarning?.();

    // Iniciar countdown
    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer para logout automático
    logoutTimerRef.current = setTimeout(handleAutoLogout, warningMs);
  }, [warningMs, warningMinutes, onWarning, handleAutoLogout]);

  // Reiniciar los timers cuando hay actividad
  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    clearAllTimers();
    setIsWarningVisible(false);

    console.log(`🔄 Actividad detectada - reiniciando timer de sesión (${timeoutMinutes} min)`);

    // Timer para mostrar aviso
    warningTimerRef.current = setTimeout(showWarning, timeoutMs - warningMs);
  }, [timeoutMs, warningMs, timeoutMinutes, showWarning, clearAllTimers]);

  // Extender la sesión (cuando el usuario hace clic en "mantener activa")
  const extendSession = useCallback(() => {
    console.log('✅ Usuario eligió mantener sesión activa');
    resetTimers();
  }, [resetTimers]);

  // Eventos que indican actividad del usuario
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ];

  useEffect(() => {
    // Throttle para evitar demasiadas llamadas
    let throttleTimer: NodeJS.Timeout | null = null;
    
    const handleActivity = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        
        // Solo resetear si no estamos en el aviso
        if (!isWarningVisible) {
          resetTimers();
        }
      }, 1000); // Throttle de 1 segundo
    };

    // Inicializar timers
    resetTimers();

    // Agregar listeners de actividad
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      clearAllTimers();
      if (throttleTimer) clearTimeout(throttleTimer);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetTimers, isWarningVisible, clearAllTimers]);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    isWarningVisible,
    timeLeft,
    extendSession,
    forceLogout: handleAutoLogout,
    resetTimers
  };
}
