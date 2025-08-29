'use client';

import React, { useState, useEffect } from 'react';
import { 
  chilePeruRegionsCommunes, 
  findProvinciasByRegion, 
  findComunasByProvincia, 
  getRegionsByCountry, 
  type Region, 
  type Provincia,
  type Comuna 
} from '@/data/chilePeruRegions';

interface CountryRegionSelectorProps {
  selectedCountry?: 'Chile' | 'Peru' | '';
  selectedRegionId?: string;
  selectedProvinciaId?: string;
  selectedCommuneId?: string;
  onCountryChange: (country: 'Chile' | 'Peru' | '', countryName: string) => void;
  onRegionChange: (regionId: string, regionName: string) => void;
  onProvinciaChange: (provinciaId: string, provinciaName: string) => void;
  onCommuneChange: (communeId: string, communeName: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function CountryRegionSelector({
  selectedCountry = '',
  selectedRegionId = '',
  selectedProvinciaId = '',
  selectedCommuneId = '',
  onCountryChange,
  onRegionChange,
  onProvinciaChange,
  onCommuneChange,
  disabled = false,
  required = false,
  className = ''
}: CountryRegionSelectorProps) {
  const [availableRegions, setAvailableRegions] = useState<Region[]>([]);
  const [availableProvincias, setAvailableProvincias] = useState<Provincia[]>([]);
  const [availableCommunas, setAvailableCommunas] = useState<Comuna[]>([]);

  // Actualizar regiones cuando cambia el país
  useEffect(() => {
    if (selectedCountry) {
      const regions = getRegionsByCountry(selectedCountry);
      setAvailableRegions(regions);
      
      // Si la región seleccionada no está en el nuevo país, limpiarla
      const currentRegionExists = regions.some(r => r.id === selectedRegionId);
      if (selectedRegionId && !currentRegionExists) {
        onRegionChange('', '');
        onProvinciaChange('', '');
        onCommuneChange('', '');
      }
    } else {
      setAvailableRegions([]);
      if (selectedRegionId) {
        onRegionChange('', '');
        onProvinciaChange('', '');
        onCommuneChange('', '');
      }
    }
  }, [selectedCountry, selectedRegionId, onRegionChange, onProvinciaChange, onCommuneChange]);

  // Actualizar provincias cuando cambia la región
  useEffect(() => {
    if (selectedRegionId) {
      const provincias = findProvinciasByRegion(selectedRegionId);
      setAvailableProvincias(provincias);
      
      // Si la provincia seleccionada no está en la nueva región, limpiarla
      const currentProvinciaExists = provincias.some(p => p.id === selectedProvinciaId);
      if (selectedProvinciaId && !currentProvinciaExists) {
        onProvinciaChange('', '');
        onCommuneChange('', '');
      }
    } else {
      setAvailableProvincias([]);
      if (selectedProvinciaId) {
        onProvinciaChange('', '');
        onCommuneChange('', '');
      }
    }
  }, [selectedRegionId, selectedProvinciaId, onProvinciaChange, onCommuneChange]);

  // Actualizar comunas cuando cambia la provincia
  useEffect(() => {
    if (selectedProvinciaId) {
      const comunas = findComunasByProvincia(selectedProvinciaId);
      setAvailableCommunas(comunas);
      
      // Si la comuna seleccionada no está en la nueva provincia, limpiarla
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
  }, [selectedProvinciaId, selectedCommuneId, onCommuneChange]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value as 'Chile' | 'Peru' | '';
    onCountryChange(country, country);
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    const region = availableRegions.find(r => r.id === regionId);
    onRegionChange(regionId, region?.name || '');
  };

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinciaId = e.target.value;
    const provincia = availableProvincias.find(p => p.id === provinciaId);
    onProvinciaChange(provinciaId, provincia?.name || '');
  };

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const communeId = e.target.value;
    const commune = availableCommunas.find(c => c.id === communeId);
    onCommuneChange(communeId, commune?.name || '');
  };

  const baseSelectClass = `w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selector de País */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          País {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          disabled={disabled}
          required={required}
          className={baseSelectClass}
        >
          <option value="">Selecciona un país</option>
          <option value="Chile">🇨🇱 Chile</option>
          <option value="Peru">🇵🇪 Perú</option>
        </select>
      </div>

      {/* Selector de Región */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Región/Departamento {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedRegionId}
          onChange={handleRegionChange}
          disabled={disabled || !selectedCountry || availableRegions.length === 0}
          required={required}
          className={baseSelectClass}
        >
          <option value="">
            {!selectedCountry 
              ? "Primero selecciona un país" 
              : availableRegions.length === 0 
                ? "Cargando regiones..." 
                : "Selecciona una región"
            }
          </option>
          {availableRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Provincia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Provincia {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedProvinciaId}
          onChange={handleProvinciaChange}
          disabled={disabled || !selectedRegionId || availableProvincias.length === 0}
          required={required}
          className={baseSelectClass}
        >
          <option value="">
            {!selectedRegionId 
              ? "Primero selecciona una región" 
              : availableProvincias.length === 0 
                ? "Cargando provincias..." 
                : "Selecciona una provincia"
            }
          </option>
          {availableProvincias.map((provincia) => (
            <option key={provincia.id} value={provincia.id}>
              {provincia.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Comuna/Distrito */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {selectedCountry === 'Chile' ? 'Comuna' : 'Distrito'} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={selectedCommuneId}
          onChange={handleCommuneChange}
          disabled={disabled || !selectedProvinciaId || availableCommunas.length === 0}
          required={required}
          className={baseSelectClass}
        >
          <option value="">
            {!selectedProvinciaId 
              ? "Primero selecciona una provincia" 
              : availableCommunas.length === 0 
                ? "Cargando..." 
                : `Selecciona una ${selectedCountry === 'Chile' ? 'comuna' : 'distrito'}`
            }
          </option>
          {availableCommunas.map((comuna) => (
            <option key={comuna.id} value={comuna.id}>
              {comuna.name}
            </option>
          ))}
        </select>
      </div>

      {/* Información de confirmación */}
      {selectedCountry && selectedRegionId && selectedProvinciaId && selectedCommuneId && (
        <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <span className="font-medium">Ubicación seleccionada:</span>
              <br />
              {availableCommunas.find(c => c.id === selectedCommuneId)?.name}, {availableProvincias.find(p => p.id === selectedProvinciaId)?.name}, {availableRegions.find(r => r.id === selectedRegionId)?.name}, {selectedCountry === 'Chile' ? '🇨🇱 Chile' : '🇵🇪 Perú'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




