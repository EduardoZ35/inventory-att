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
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error al cargar facturas</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          {error.includes('tabla') && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <h4 className="text-blue-800 dark:text-blue-200 font-medium">💡 Solución</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Necesitas crear las tablas 'invoices' y 'clients' en Supabase. 
                Revisa el archivo <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">SETUP_DATABASE.md</code> 
                para instrucciones detalladas.
              </p>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button 
              onClick={fetchInvoices}
              className="btn-secondary"
            >
              Reintentar
            </button>
            <button 
              onClick={() => window.open('https://github.com/tu-repo/inventory-att/blob/main/SETUP_DATABASE.md', '_blank')}
              className="btn-primary text-sm"
            >
              Ver Instrucciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Facturas de Compra
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra las facturas de compra a proveedores
        </p>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, proveedor o descripción..."
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        

        
        {canManage() && (
          <button
            onClick={handleAddNew}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Factura de Compra
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Facturas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredInvoices.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Compras</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAmount.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Neto Total</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">${netAmount.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">IVA Total</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">${taxAmount.toLocaleString('es-CL')}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de facturas */}
      <div className="card-modern overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando facturas...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Neto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IVA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha Compra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Resumen de Compra
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
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
