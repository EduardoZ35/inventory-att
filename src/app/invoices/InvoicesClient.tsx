"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Invoice } from '@/types';

export default function InvoicesClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  const router = useRouter();
  const { canManage } = useAuthStore();

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ENFOQUE ALTERNATIVO: Obtener facturas y proveedores por separado
      console.log('🔄 Obteniendo facturas...');
      
      // 1. Obtener facturas
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('purchase_invoices')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (invoicesError) {
        console.error('Error obteniendo facturas:', invoicesError);
        throw invoicesError;
      }

      console.log('✅ Facturas obtenidas:', invoicesData);

      // 2. Obtener proveedores
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('*');

      if (providersError) {
        console.error('Error obteniendo proveedores:', providersError);
        throw providersError;
      }

      console.log('✅ Proveedores obtenidos:', providersData);

      // 3. Obtener items de cada factura para el resumen
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_invoice_items')
        .select('*');

      if (itemsError) {
        console.error('Error obteniendo items:', itemsError);
        throw itemsError;
      }

      console.log('✅ Items obtenidos:', itemsData);

      // 4. Hacer JOIN manual en JavaScript incluyendo items
      const invoicesWithProviders = invoicesData?.map(invoice => {
        const provider = providersData?.find(p => p.id === invoice.provider_id);
        const invoiceItems = itemsData?.filter(item => item.purchase_invoice_id === invoice.id) || [];
        
        console.log(`Factura ${invoice.id}: provider_id=${invoice.provider_id}, provider encontrado:`, provider);
        console.log(`Factura ${invoice.id}: items encontrados:`, invoiceItems.length);
        
        return {
          ...invoice,
          provider: provider || null,
          items: invoiceItems
        };
      });

      console.log('🎯 Facturas con proveedores (JOIN manual):', invoicesWithProviders);
      setInvoices(invoicesWithProviders || []);
    } catch (err) {
      console.error('Error fetching purchase invoices:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.log('Error completo:', err);
      setError(`${errorMessage}. Es posible que la tabla 'purchase_invoices' no exista en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (invoiceId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta factura de compra?')) return;

    try {
      // Primero eliminar items de la factura (por foreign key)
      const { error: itemsError } = await supabase
        .from('purchase_invoice_items')
        .delete()
        .eq('purchase_invoice_id', invoiceId);

      if (itemsError) throw itemsError;

      // Luego eliminar la factura
      const { error } = await supabase
        .from('purchase_invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) {
        throw error;
      }

      // Refrescar la lista
      fetchInvoices();
      alert('Factura eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      alert('Error al eliminar la factura');
    }
  };

  const handleAddNew = () => {
    router.push('/invoices/add');
  };

  const handleEdit = (invoiceId: number) => {
    router.push(`/invoices/edit/${invoiceId}`);
  };

  const handleView = (invoiceId: number) => {
    router.push(`/invoices/${invoiceId}`);
  };

      const filteredInvoices = invoices.filter(invoice => {
      // Búsqueda por múltiples campos
      const matchesSearch =
        invoice.id.toString().includes(searchTerm) ||
        (invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (invoice.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (invoice.provider?.rut?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (invoice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    // Para facturas de compra, no hay estados como pending/paid, así que mostramos todas
    return matchesSearch;
  });



  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const netAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.net_amount || 0), 0);
  const taxAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.tax_amount || 0), 0);

  if (error) {
    return (
      <div className="main-container page-bg">
        <div className="card-theme p-6">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Error al cargar facturas</h3>
          </div>
          <p className="mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={fetchInvoices}
              className="btn-theme-secondary"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container page-bg">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Facturas de Compra
        </h1>
        <p className="page-subtitle">
          Gestiona las facturas de compra a proveedores
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Facturas</p>
              <p className="stats-number text-blue-600">{invoices.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Neto</p>
              <p className="stats-number text-green-600">
                ${invoices.reduce((total, invoice) => total + (invoice.net_amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total IVA</p>
                             <p className="stats-number text-orange-600">
                 ${invoices.reduce((total, invoice) => total + ((invoice.total_amount || 0) - (invoice.net_amount || 0)), 0).toLocaleString()}
               </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total General</p>
              <p className="stats-number text-purple-600">
                ${invoices.reduce((total, invoice) => total + (invoice.total_amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar facturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-theme w-full pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {canManage() && (
          <button
            onClick={() => router.push('/invoices/add')}
            className="btn-theme-primary"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Factura
          </button>
        )}
      </div>

      {/* Lista de facturas */}
      <div className="card-theme overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Cargando facturas...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-theme min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Neto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    IVA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Fecha Compra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Resumen de Compra
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            #{invoice.id}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Factura #{invoice.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.invoice_number || 'Sin número'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {invoice.provider?.name || 'Sin proveedor'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {invoice.provider?.rut || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${invoice.net_amount?.toLocaleString('es-CL') || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${invoice.tax_amount?.toLocaleString('es-CL') || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${invoice.total_amount?.toLocaleString('es-CL') || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {new Date(invoice.purchase_date).toLocaleDateString('es-CL')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {invoice.items && invoice.items.length > 0 ? (
                          <div className="space-y-1">
                            <div className="font-medium">
                              {invoice.items.length} producto{invoice.items.length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                              {invoice.items.slice(0, 2).map((item, index) => (
                                <div key={index}>
                                  • {item.product_name} ({item.quantity})
                                </div>
                              ))}
                              {invoice.items.length > 2 && (
                                <div className="italic">
                                  +{invoice.items.length - 2} más...
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sin items</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(invoice.id)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        Ver
                      </button>
                      {canManage() && (
                        <>
                          <button
                            onClick={() => handleEdit(invoice.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay facturas</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron facturas que coincidan con la búsqueda.' : 'Comienza creando una nueva factura de compra.'}
            </p>
            {canManage() && !searchTerm && (
              <div className="mt-6">
                <button onClick={handleAddNew} className="btn-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Factura
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
