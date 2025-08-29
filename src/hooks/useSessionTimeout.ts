import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface SessionTimeoutConfig {
  timeoutMinutes: number;
  warningMinutes: number;
}

export const useSessionTimeout = (config: SessionTimeoutConfig = { timeoutMinutes: 30, warningMinutes: 1 }) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const resetSession = () => {
    // Limpiar timeouts existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Ocultar modal de advertencia
    setShowWarning(false);

    // Configurar nuevo timeout
    const timeoutMs = config.timeoutMinutes * 60 * 1000;
    const warningMs = (config.timeoutMinutes - config.warningMinutes) * 60 * 1000;

    // Timeout de advertencia (1 minuto antes)
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(config.warningMinutes * 60);
    }, warningMs);

    // Timeout de cierre de sesión
    timeoutRef.current = setTimeout(async () => {
      await handleLogout();
    }, timeoutMs);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth?logout_success=true');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      router.push('/auth?logout_error=true');
    }
  };

  const handleExtendSession = () => {
    setShowWarning(false);
    resetSession();
  };

  const handleConfirmLogout = async () => {
    setShowWarning(false);
    await handleLogout();
  };

  // Actualizar contador regresivo
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  // Inicializar timeout al montar el componente
  useEffect(() => {
    resetSession();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, []);

  return {
    showWarning,
    timeRemaining,
    handleExtendSession,
    handleConfirmLogout,
    resetSession
  };
};
