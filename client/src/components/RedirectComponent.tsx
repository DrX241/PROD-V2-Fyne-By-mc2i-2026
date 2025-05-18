import { useEffect } from "react";
import { useLocation } from "wouter";

type RedirectProps = {
  to: string;
};

export default function RedirectComponent({ to }: RedirectProps) {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950">
      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white mt-4 ml-4">Redirection...</p>
    </div>
  );
}