import Header from "./Header";
import Sidebar from "@/components/cyber/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        {children}
      </main>
    </div>
  );
}
