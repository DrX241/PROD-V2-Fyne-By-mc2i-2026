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
import { LogOut, Settings, BarChart2, ChevronDown, ShieldCheck, Crown } from "lucide-react";

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

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

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
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <div className="h-9 w-9 rounded-full bg-[#006a9e] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initial}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-slate-800 leading-none">{displayName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email || "Pas d'email"}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setLocation('/mon-suivi')}
          className="cursor-pointer hover:bg-blue-50 hover:text-[#006a9e] focus:bg-blue-50 focus:text-[#006a9e]"
        >
          <BarChart2 className="mr-2 h-4 w-4" />
          <span>Mon Suivi</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 hover:text-[#006a9e] focus:bg-blue-50 focus:text-[#006a9e]">
          <Settings className="mr-2 h-4 w-4" />
          <span>Préférences</span>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setLocation('/admin')}
              className="cursor-pointer hover:bg-blue-50 hover:text-[#006a9e] focus:bg-blue-50 focus:text-[#006a9e]"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              <span>Administration</span>
            </DropdownMenuItem>
          </>
        )}

        {isSuperAdmin && (
          <DropdownMenuItem
            onClick={() => setLocation('/superadmin')}
            className="cursor-pointer hover:bg-amber-50 hover:text-amber-600 focus:bg-amber-50 focus:text-amber-600 text-amber-600"
          >
            <Crown className="mr-2 h-4 w-4" />
            <span>Super Admin</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 text-slate-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}