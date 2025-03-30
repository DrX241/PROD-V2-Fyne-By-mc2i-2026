import Header from "./Header";
import Sidebar from "@/components/cyber/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-gray-50 h-screen w-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 flex w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
