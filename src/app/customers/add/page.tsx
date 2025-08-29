"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import CountryRegionSelector from '@/components/common/CountryRegionSelector';

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
         name: formData.name.trim(), 
         email: formData.email.trim(),
         phone: formData.phone.trim() || null,
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
        .from('clients')
        .insert([insertData])
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }
      
      console.log('Cliente insertado exitosamente:', data);

      setSuccess('Cliente agregado exitosamente!');
      
             // Limpiar formulario
       setFormData({
         name: '',
         email: '',
         phone: '',
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
        router.push('/customers');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Agregar Cliente
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Registra un nuevo cliente en el sistema
        </p>
      </div>

      {/* Formulario */}
      <div className="card-modern p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Ej: Juan Pérez López"
              required
              maxLength={200}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Ej: juan.perez@email.com"
              required
              maxLength={250}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Ej: +56 9 1234 5678"
              maxLength={20}
            />
          </div>

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
              placeholder="Ej: Av. Principal 123"
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

          {/* Botones */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/customers')}
              className="btn-secondary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.name.trim() || !formData.email.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Agregando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Cliente
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
                    Error al agregar cliente
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




