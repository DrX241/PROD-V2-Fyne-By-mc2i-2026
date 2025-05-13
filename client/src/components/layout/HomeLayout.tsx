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

      <main 
        className="flex-1 w-full overflow-y-auto overflow-x-hidden max-w-full pt-[70px] bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-900/50 dark:to-gray-950"
        style={{ 
          minHeight: `calc(100vh - ${headerHeight})`,
          WebkitOverflowScrolling: 'touch', // Pour une meilleure performance de défilement sur iOS
          backgroundSize: '100% 100%',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="w-full max-w-full flex justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 backdrop-blur-[2px] relative">
            <div className="absolute inset-0 bg-white/40 dark:bg-gray-950/40 shadow-xl rounded-b-3xl backdrop-blur-sm"></div>
            <div className="relative z-10 py-6">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}