"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Invoice, PurchaseInvoiceItem } from '@/types';

interface InvoiceDetailClientProps {
  invoiceId: string;
}

export default function InvoiceDetailClient({ invoiceId }: InvoiceDetailClientProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<PurchaseInvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchInvoiceDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener factura básica
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
          created_at,
          provider_id
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Obtener datos del proveedor por separado
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id, name, rut, address, phone, email, provider_type, contact_person, credit_terms, delivery_time, created_at, updated_at')
        .eq('id', invoiceData.provider_id)
        .single();

      if (providerError) throw providerError;

      // Obtener items de la factura
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_invoice_items')
        .select('*')
        .eq('purchase_invoice_id', invoiceId)
        .order('id');

      if (itemsError) throw itemsError;

      // Crear el objeto Invoice con la estructura correcta
      const transformedInvoice: Invoice = {
        ...invoiceData,
        provider: providerData
      };

      setInvoice(transformedInvoice);
      setItems(itemsData || []);
    } catch (err) {
      console.error('Error fetching invoice detail:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetail();
    }
  }, [invoiceId]);

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
            onClick={() => router.back()}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Regresar
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Factura no encontrada</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">La factura solicitada no existe o ha sido eliminada.</p>
          <button
            onClick={() => router.push('/invoices')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Ver todas las facturas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Factura #{invoice.invoice_number || 'Sin número'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Proveedor: {invoice.provider?.name || 'Sin proveedor'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/invoices/edit/${invoice.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Editar
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Regresar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card-modern p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Factura
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Número de Factura
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {invoice.invoice_number || 'Sin número'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Fecha de Compra
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(invoice.purchase_date).toLocaleDateString('es-CL')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Proveedor
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {invoice.provider?.name || 'Sin proveedor'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                RUT del Proveedor
              </label>
              <p className="text-gray-900 dark:text-white">
                {invoice.provider?.rut || 'Sin RUT'}
              </p>
            </div>
          </div>
        </div>

        <div className="card-modern p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información del Proveedor
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Nombre
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {invoice.provider?.name || 'Sin proveedor'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                RUT
              </label>
              <p className="text-gray-900 dark:text-white">
                {invoice.provider?.rut || 'Sin RUT'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Dirección
              </label>
              <p className="text-gray-900 dark:text-white">
                {invoice.provider?.address || 'Sin dirección'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Teléfono
              </label>
              <p className="text-gray-900 dark:text-white">
                {invoice.provider?.phone || 'Sin teléfono'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-modern p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Resumen Financiero
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Neto</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${invoice.net_amount?.toLocaleString('es-CL') || '0'}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">IVA (19%)</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${invoice.tax_amount?.toLocaleString('es-CL') || '0'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${invoice.total_amount?.toLocaleString('es-CL') || '0'}
            </p>
          </div>
        </div>
      </div>

      <div className="card-modern p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Items de la Factura
        </h2>
        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
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
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.product_name || 'Producto desconocido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${item.unit_price?.toLocaleString('es-CL') || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${(item.quantity * item.unit_price)?.toLocaleString('es-CL') || '0'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay items asociados a esta factura.
          </p>
        )}
      </div>
    </div>
  );
}
