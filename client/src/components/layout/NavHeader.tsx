import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/LoginButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export function NavHeader() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <span className="text-xl font-bold">I AM CYBER</span>
            </a>
          </Link>
          <nav className="hidden md:flex gap-4 ml-4">
            <Link href="/">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Accueil
              </a>
            </Link>
            <Link href="/modules">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Modules
              </a>
            </Link>
            <Link href="/cyber">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Cyber
              </a>
            </Link>
            <Link href="/outils-ia">
              <a className="text-sm font-medium transition-colors hover:text-primary">
                Outils IA
              </a>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? <UserMenu /> : <LoginButton />}
        </div>
      </div>
    </header>
  );
}