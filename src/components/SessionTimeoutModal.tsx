"use client";

import { useEffect } from 'react';

interface SessionTimeoutModalProps {
  isVisible: boolean;
  timeLeft: number; // Segundos restantes
  onExtendSession: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutModal({
  isVisible,
  timeLeft,
  onExtendSession,
  onLogout
}: SessionTimeoutModalProps) {
  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}`;
  };

  // Sonido de alerta (opcional)
  useEffect(() => {
    if (isVisible && timeLeft <= 10 && timeLeft > 0) {
      // Reproducir sonido de alerta en los últimos 10 segundos
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuH0fPSiTQGGGO97O2KUQV'); // Tono de alerta simple
        audio.play().catch(() => {
          // Ignorar errores de audio (algunos navegadores bloquean audio sin interacción)
        });
      } catch (error) {
        // Ignorar errores de audio
      }
    }
  }, [isVisible, timeLeft]);

  if (!isVisible) return null;

  const isUrgent = timeLeft <= 30; // Cambiar apariencia en los últimos 30 segundos

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
        isUrgent ? 'animate-pulse scale-105' : ''
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-2xl ${
          isUrgent 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-yellow-500 to-orange-500'
        } text-white text-center`}>
          <div className="text-3xl mb-2">
            {isUrgent ? '🚨' : '⏰'}
          </div>
          <h2 className="text-xl font-bold">
            {isUrgent ? '¡Sesión Expirando!' : 'Aviso de Sesión'}
          </h2>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Mensaje principal */}
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-3">
              {isUrgent 
                ? 'Tu sesión se cerrará automáticamente en:' 
                : 'Tu sesión se cerrará por inactividad en:'
              }
            </p>
            
            {/* Countdown visual */}
            <div className={`text-6xl font-bold mb-2 ${
              isUrgent ? 'text-red-600 animate-bounce' : 'text-orange-600'
            }`}>
              {formatTime(timeLeft)}
            </div>
            
            <p className="text-sm text-gray-500">
              {timeLeft > 60 ? 'minutos:segundos' : 'segundos'}
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  isUrgent ? 'bg-red-500' : 'bg-orange-500'
                }`}
                style={{ 
                  width: `${(timeLeft / 60) * 100}%` // Asumiendo 1 minuto máximo
                }}
              ></div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <button
              onClick={onExtendSession}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                isUrgent
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              ✅ Mantener Sesión Activa
            </button>
            
            <button
              onClick={onLogout}
              className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              🚪 Cerrar Sesión
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              💡 <strong>Consejo:</strong> Tu sesión se mantiene activa mientras uses el sistema. 
              La inactividad prolongada causa cierre automático por seguridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
