import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function RedirectToAcademie() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate('/amoa/academie');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950">
      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 ml-4">Redirection...</p>
    </div>
  );
}