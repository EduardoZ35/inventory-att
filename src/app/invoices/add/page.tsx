"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Client } from '@/types';

export default function AddInvoicePage() {
  const [clientId, setClientId] = useState<number | ''>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid' | 'cancelled'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, client_type, contact_person, technical_contact, contract_number, service_level')
        .order('name');

      if (error) {
        console.error('Error fetching clients:', error);
      } else {
        setClients(data || []);
      }
    };

    fetchClients();

    // Establecer fecha de vencimiento por defecto (30 días desde hoy)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('invoices')
        .insert([{ 
          client_id: clientId,
          total,
          status,
          issued_at: issuedAt,
          due_date: dueDate,
          paid_at: status === 'paid' ? new Date().toISOString() : null
        }])
        .select();

      if (error) {
        throw error;
      }

      setSuccess('Factura creada exitosamente!');
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/invoices');
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
          Nueva Factura
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crea una nueva factura en el sistema
        </p>
      </div>

      {/* Formulario */}
      <div className="card-modern p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              id="client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>

          {/* Total */}
          <div>
            <label htmlFor="total" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="total"
              value={total}
              onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'pending' | 'paid' | 'cancelled')}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          {/* Fecha de emisión */}
          <div>
            <label htmlFor="issued_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Emisión <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="issued_at"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Vencimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="due_date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/invoices')}
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
              disabled={loading || !clientId || total <= 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Factura
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
                    Error al crear factura
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




