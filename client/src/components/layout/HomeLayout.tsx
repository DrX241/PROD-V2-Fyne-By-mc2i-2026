import Header from "./Header";

interface HomeLayoutProps {
  children: React.ReactNode;
  gradientBg?: boolean;
}

export default function HomeLayout({ children, gradientBg = false }: HomeLayoutProps) {
  // Calculer la hauteur du header (environ 60px sur mobile, 70px sur desktop)
  const headerHeight = "70px";
  
  return (
    <div className={`min-h-screen w-full flex flex-col ${!gradientBg ? '' : ''} overflow-x-hidden overflow-y-auto max-w-[100vw]`}>
      <Header isFeny={true} />

      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden max-w-full pt-[70px]" style={{ 
        minHeight: `calc(100vh - ${headerHeight})`,
        WebkitOverflowScrolling: 'touch' // Pour une meilleure performance de défilement sur iOS
      }}>
        <div className="w-full max-w-full flex justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}