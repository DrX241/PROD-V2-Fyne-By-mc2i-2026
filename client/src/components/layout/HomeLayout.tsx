import Header from "./Header";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-slate-50">
      <Header isFeny={true} />

      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}