"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Invoice, Provider, PurchaseInvoiceItem } from '@/types';

interface EditInvoiceClientProps {
  invoiceId: string;
}

export default function EditInvoiceClient({ invoiceId }: EditInvoiceClientProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [items, setItems] = useState<PurchaseInvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    invoice_number: '',
    provider_id: '',
    purchase_date: '',
    net_amount: 0,
    tax_amount: 0,
    total_amount: 0,
    description: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener factura
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('purchase_invoices')
        .select(`
          id,
          invoice_number,
          purchase_date,
          net_amount,
          tax_amount,
          total_amount,
          description,
          provider_id
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Obtener proveedores - con diagnóstico detallado
      console.log('🔄 Intentando obtener proveedores...');
      
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('*');

      console.log('📊 Resultado query providers:');
      console.log('- Data:', providersData);
      console.log('- Error:', providersError);
      console.log('- Count:', providersData?.length || 0);
      
      if (providersData && providersData.length > 0) {
        console.log('✅ Primer proveedor:', providersData[0]);
      } else {
        console.log('❌ No se obtuvieron proveedores');
      }

      if (providersError) throw providersError;

      // Obtener items
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_invoice_items')
        .select('*')
        .eq('purchase_invoice_id', invoiceId)
        .order('id');

      if (itemsError) throw itemsError;

      setInvoice(invoiceData);
      setProviders(providersData || []);
      setItems(itemsData || []);
      
      // Llenar formulario
      setFormData({
        invoice_number: invoiceData.invoice_number || '',
        provider_id: invoiceData.provider_id?.toString() || '',
        purchase_date: invoiceData.purchase_date || '',
        net_amount: invoiceData.net_amount || 0,
        tax_amount: invoiceData.tax_amount || 0,
        total_amount: invoiceData.total_amount || 0,
        description: invoiceData.description || ''
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from('purchase_invoices')
        .update({
          invoice_number: formData.invoice_number,
          provider_id: parseInt(formData.provider_id),
          purchase_date: formData.purchase_date,
          net_amount: formData.net_amount,
          tax_amount: formData.tax_amount,
          total_amount: formData.total_amount,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      alert('Factura actualizada exitosamente');
      router.push('/invoices');
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('amount') ? parseFloat(value) || 0 : value
    }));
  };

  const calculateTotals = () => {
    const netAmount = formData.net_amount;
    const taxAmount = netAmount * 0.19; // IVA 19%
    const totalAmount = netAmount + taxAmount;
    
    setFormData(prev => ({
      ...prev,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  useEffect(() => {
    if (invoiceId) {
      fetchData();
    }
  }, [invoiceId]);

  useEffect(() => {
    calculateTotals();
  }, [formData.net_amount]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error al cargar factura</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <button 
            onClick={() => router.push('/invoices')}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Factura no encontrada
          </h3>
          <button 
            onClick={() => router.push('/invoices')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Volver a facturas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editar Factura {invoice.invoice_number}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Modificar información de la factura de compra
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/invoices/${invoice.id}`)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="card-modern p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Información Básica
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Factura
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proveedor
                </label>
                <select
                  name="provider_id"
                  value={formData.provider_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.rut}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Información financiera */}
          <div className="card-modern p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Información Financiera
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto Neto
                </label>
                <input
                  type="number"
                  name="net_amount"
                  value={formData.net_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IVA (19% - Calculado automáticamente)
                </label>
                <input
                  type="number"
                  name="tax_amount"
                  value={formData.tax_amount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total (Calculado automáticamente)
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items de la factura (solo mostrar, no editar por ahora) */}
        {items.length > 0 && (
          <div className="card-modern p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Items de la Factura
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.product_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ${item.unit_price?.toLocaleString('es-CL')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${item.total_price?.toLocaleString('es-CL')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/invoices')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
