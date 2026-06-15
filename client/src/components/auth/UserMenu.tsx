import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { LogOut, Settings, BarChart2, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.username ?? 'Utilisateur';

  const initial = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : user?.username?.charAt(0).toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-all group outline-none">
          <div className="h-8 w-8 rounded-full bg-[#006a9e] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-semibold text-slate-700 group-hover:text-[#006a9e] transition-colors">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">{user?.role ?? 'user'}</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#006a9e] transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "Pas d'email"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLocation('/mon-suivi')}>
          <BarChart2 className="mr-2 h-4 w-4" />
          <span>Mon Suivi</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Préférences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}