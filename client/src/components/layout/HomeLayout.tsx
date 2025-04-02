import Header from "./Header";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      <Header isFeny={true} />

      <main className="flex-1 w-full overflow-y-auto" style={{ height: 'calc(100vh - 70px)' }}>
        {children}
      </main>
    </div>
  );
}