"use client";

// ARCHIVO NECESITA ACTUALIZACIÓN - Usando equipos en lugar de productos
// Funcionalidad temporal deshabilitada hasta completar la migración

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { useProductsPaginated, useDeleteProduct } from '@/hooks/queries/useProducts'; // Deshabilitado temporalmente
import { useAuthStore } from '@/stores/authStore';
// import { useUIStore } from '@/stores/uiStore'; // Deshabilitado temporalmente
import type { EquipmentFilters } from '@/types';

export default function ProductsClient() {
  const router = useRouter();
  const { canManage } = useAuthStore();

  return (
    <div className="main-container page-bg">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Gestión de Equipos
        </h1>
        <p className="page-subtitle">
          Administrar el catálogo de equipos especializados en control y soporte tecnológico
        </p>
      </div>

      {/* Mensaje temporal */}
      <div className="card-theme p-6">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Gestión de Equipos en Desarrollo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta sección está siendo migrada para manejar equipos especializados en control y soporte tecnológico.
            <br />
            Incluirá relojes de asistencia, huelleros, impresoras térmicas, repuestos y herramientas.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Funcionalidad Actual</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Puedes gestionar equipos a través de las otras secciones del sistema:
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => router.push('/warehouses')}
                className="btn-theme-secondary text-sm"
              >
                Gestión de Bodegas
              </button>
              <button 
                onClick={() => router.push('/service-orders')}
                className="btn-theme-secondary text-sm"
              >
                Órdenes de Servicio
              </button>
              <button 
                onClick={() => router.push('/stock-movements')}
                className="btn-theme-secondary text-sm"
              >
                Movimientos de Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}