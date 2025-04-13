import Header from "./Header";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 overflow-x-hidden max-w-[100vw]">
      <Header isFeny={true} />

      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden max-w-full" style={{ 
        minHeight: 'calc(100vh - 70px)',
        WebkitOverflowScrolling: 'touch' // Pour une meilleure performance de défilement sur iOS
      }}>
        <div className="w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}