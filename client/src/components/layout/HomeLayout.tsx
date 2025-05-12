import Header from "./Header";

interface HomeLayoutProps {
  children: React.ReactNode;
  gradientBg?: boolean;
}

export default function HomeLayout({ children, gradientBg = false }: HomeLayoutProps) {
  // Calculer la hauteur du header (environ 60px sur mobile, 70px sur desktop)
  const headerHeight = "70px";
  
  return (
    <div className={`min-h-screen w-full flex flex-col ${!gradientBg ? 'bg-slate-50' : ''} overflow-x-hidden overflow-y-auto max-w-[100vw]`}>
      <Header isFeny={true} />

      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden max-w-full pt-[70px]" style={{ 
        minHeight: `calc(100vh - ${headerHeight})`,
        WebkitOverflowScrolling: 'touch' // Pour une meilleure performance de défilement sur iOS
      }}>
        <div className="w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}