'use client';

import React, { useState, useEffect } from 'react';
import { chileRegionsCommunes, findComunasByRegion, type Region, type Comuna } from '@/data/chileRegionsCommunes';

interface RegionCommuneSelectorProps {
  selectedRegionId?: string;
  selectedCommuneId?: string;
  onRegionChange: (regionId: string, regionName: string) => void;
  onCommuneChange: (communeId: string, communeName: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function RegionCommuneSelector({
  selectedRegionId = '',
  selectedCommuneId = '',
  onRegionChange,
  onCommuneChange,
  disabled = false,
  required = false,
  className = ''
}: RegionCommuneSelectorProps) {
  const [availableCommunas, setAvailableCommunas] = useState<Comuna[]>([]);

  // Actualizar comunas cuando cambia la región
  useEffect(() => {
    if (selectedRegionId) {
      const comunas = findComunasByRegion(selectedRegionId);
      setAvailableCommunas(comunas);
      
      // Si la comuna seleccionada no está en la nueva región, limpiarla
      const currentCommuneExists = comunas.some(c => c.id === selectedCommuneId);
      if (selectedCommuneId && !currentCommuneExists) {
        onCommuneChange('', '');
      }
    } else {
      setAvailableCommunas([]);
      if (selectedCommuneId) {
        onCommuneChange('', '');
      }
    }
  }, [selectedRegionId, selectedCommuneId, onCommuneChange]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    const region = chileRegionsCommunes.find(r => r.id === regionId);
    onRegionChange(regionId, region?.name || '');
  };

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const communeId = e.target.value;
    const commune = availableCommunas.find(c => c.id === communeId);
    onCommuneChange(communeId, commune?.name || '');
  };

  const baseSelectClass = `w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selector de Región */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Región {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedRegionId}
          onChange={handleRegionChange}
          disabled={disabled}
          required={required}
          className={baseSelectClass}
        >
          <option value="">Selecciona una región</option>
          {chileRegionsCommunes.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Comuna */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Comuna {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedCommuneId}
          onChange={handleCommuneChange}
          disabled={disabled || !selectedRegionId || availableCommunas.length === 0}
          required={required}
          className={baseSelectClass}
        >
          <option value="">
            {!selectedRegionId 
              ? "Primero selecciona una región" 
              : availableCommunas.length === 0 
                ? "Cargando comunas..." 
                : "Selecciona una comuna"
            }
          </option>
          {availableCommunas.map((comuna) => (
            <option key={comuna.id} value={comuna.id}>
              {comuna.name}
            </option>
          ))}
        </select>
      </div>

      {/* Información adicional */}
      {selectedRegionId && availableCommunas.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No se encontraron comunas para esta región.
        </p>
      )}
      
      {selectedRegionId && selectedCommuneId && (
        <div className="text-sm text-green-600 dark:text-green-400">
          ✓ Seleccionado: {availableCommunas.find(c => c.id === selectedCommuneId)?.name}, {chileRegionsCommunes.find(r => r.id === selectedRegionId)?.name}
        </div>
      )}
    </div>
  );
}

