"use client";

import Navbar from './Navbar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </>
  );
}
