"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import CountryRegionSelector from '@/components/common/CountryRegionSelector';

export default function AddProviderPage() {
  const [formData, setFormData] = useState({
    organization: '',
    dni: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    country: '',
    region_id: '',
    region_name: '',
    provincia_id: '',
    provincia_name: '',
    commune_id: '',
    commune_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Datos a insertar:', formData);
      
             const insertData = { 
         organization: formData.organization.trim(), 
         dni: formData.dni.trim(),
         contact_name: formData.contact_name.trim() || null,
         contact_email: formData.contact_email.trim() || null,
         contact_phone: formData.contact_phone.trim() || null,
         address: formData.address.trim() || null,
         country: formData.country || null,
         region_id: formData.region_id || null,
         region_name: formData.region_name || null,
         provincia_id: formData.provincia_id || null,
         provincia_name: formData.provincia_name || null,
         commune_id: formData.commune_id || null,
         commune_name: formData.commune_name || null
       };
      
      console.log('Datos procesados:', insertData);

      const { data, error } = await supabase
        .from('providers')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      
      console.log('Proveedor insertado exitosamente:', data);

      setSuccess('Proveedor agregado exitosamente!');
      
             // Limpiar formulario
       setFormData({
         organization: '',
         dni: '',
         contact_name: '',
         contact_email: '',
         contact_phone: '',
         address: '',
         country: '',
         region_id: '',
         region_name: '',
         provincia_id: '',
         provincia_name: '',
         commune_id: '',
         commune_name: ''
       });
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/providers');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container page-bg">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Agregar Proveedor
        </h1>
        <p className="page-subtitle">
          Registra un nuevo proveedor en el sistema
        </p>
      </div>

      {/* Formulario */}
      <div className="card-theme p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la empresa */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información de la Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Ej: Tecnología y Suministros S.A."
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  RUT/DNI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Ej: 12.345.678-9"
                  required
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información de Contacto
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  id="contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Ej: Juan Pérez"
                  maxLength={100}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="contacto@empresa.com"
                    maxLength={150}
                  />
                </div>

                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="+56 9 1234 5678"
                    maxLength={50}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información de ubicación */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Ubicación
            </h3>
            
            <div className="space-y-4">
              {/* Dirección */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Ej: Av. Providencia 1234"
                  maxLength={200}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Dirección exacta (calle y número)
                </p>
              </div>

                         {/* Selector de País, Región, Provincia y Comuna */}
           <CountryRegionSelector
             selectedCountry={formData.country as 'Chile' | 'Peru' | ''}
             selectedRegionId={formData.region_id}
             selectedProvinciaId={formData.provincia_id}
             selectedCommuneId={formData.commune_id}
             onCountryChange={(country, countryName) => {
               setFormData(prev => ({
                 ...prev,
                 country: country,
                 region_id: '',
                 region_name: '',
                 provincia_id: '',
                 provincia_name: '',
                 commune_id: '',
                 commune_name: ''
               }));
             }}
             onRegionChange={(regionId, regionName) => {
               setFormData(prev => ({
                 ...prev,
                 region_id: regionId,
                 region_name: regionName,
                 provincia_id: '',
                 provincia_name: '',
                 commune_id: '',
                 commune_name: ''
               }));
             }}
             onProvinciaChange={(provinciaId, provinciaName) => {
               setFormData(prev => ({
                 ...prev,
                 provincia_id: provinciaId,
                 provincia_name: provinciaName,
                 commune_id: '',
                 commune_name: ''
               }));
             }}
             onCommuneChange={(communeId, communeName) => {
               setFormData(prev => ({
                 ...prev,
                 commune_id: communeId,
                 commune_name: communeName
               }));
             }}
             required={false}
           />
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/providers')}
              className="btn-theme-secondary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-theme-primary"
              disabled={loading || !formData.organization.trim() || !formData.dni.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Guardar Proveedor
                </>
              )}
            </button>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error al agregar proveedor
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    ¡Éxito!
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    {success} Redirigiendo...
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
