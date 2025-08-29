import { Suspense } from 'react';
import EditInvoiceClient from './EditInvoiceClient';

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        </div>
      </div>
    }>
      <EditInvoiceClient invoiceId={params.id} />
    </Suspense>
  );
}




