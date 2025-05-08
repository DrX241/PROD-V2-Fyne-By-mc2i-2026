import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, LogIn, LogOut, User, Settings, Shield } from "lucide-react";

export function UserMenu() {
  const { user, isLoading, isAuthenticated, isAdmin, login, logout } = useAuth();

  // Si le statut d'authentification est en cours de chargement, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  // Si l'utilisateur n'est pas authentifié, afficher le bouton de connexion
  if (!isAuthenticated) {
    return (
      <Button onClick={login} className="flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        <span>Connexion</span>
      </Button>
    );
  }

  // Si l'utilisateur est authentifié, afficher le menu utilisateur
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user?.profileImageUrl || undefined} 
              alt={user?.username || "Utilisateur"} 
              className="object-cover"
            />
            <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{user?.username}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user?.email || "Aucun email"}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Administration</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}