"use client";

import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="flex flex-grow">
      <Sidebar />
      <main className="flex-grow p-4">
        {children}
      </main>
    </div>
  );
}
