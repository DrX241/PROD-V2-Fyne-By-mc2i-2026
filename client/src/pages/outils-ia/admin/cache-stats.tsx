import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Database, BarChart, RefreshCw, Trash2, Clock } from 'lucide-react';
import AdminPageTitle from '@/components/layout/AdminPageTitle';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CacheStats {
  totalEntries: number,
  totalHits: number,
  entriesByDomain: Record<string, number>,
  hitsByDomain: Record<string, number>,
  topQueries: Array<{query: string, domain: string, hits: number}>
}

interface RateLimiterStats {
  totalUsers: number,
  blockedUsers: number,
  queuedRequests: number,
  topUsers: Array<{key: string, count: number, blocked: boolean}>
}

interface Stats {
  cache: CacheStats,
  rateLimiter: RateLimiterStats,
  cacheHitRate: number,
  timestamp: string
}

export default function CacheStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Fonction pour récupérer les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simuler un utilisateur admin pour le développement
        const headers = { 'x-user-role': 'admin' };
        
        const response = await apiRequest('/api/admin/stats', {
          method: 'GET',
          headers
        });
        
        if (response.success && response.stats) {
          setStats(response.stats);
        } else {
          setError(response.error || 'Erreur inconnue lors de la récupération des statistiques');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [refreshKey]);

  // Fonction pour vider le cache
  const handleClearCache = async () => {
    try {
      // Simuler un utilisateur admin pour le développement
      const headers = { 'x-user-role': 'admin' };
      
      const response = await apiRequest('/api/admin/cache/clear', {
        method: 'POST',
        headers
      });
      
      if (response.success) {
        toast({
          title: 'Cache vidé',
          description: 'Le cache a été vidé avec succès',
          variant: 'default'
        });
        // Rafraîchir les statistiques
        setRefreshKey(prev => prev + 1);
      } else {
        toast({
          title: 'Erreur',
          description: response.error || 'Erreur inconnue lors du vidage du cache',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  // Fonction pour invalider une partie du cache par domaine
  const handleInvalidateDomain = async (domain: string) => {
    try {
      // Simuler un utilisateur admin pour le développement
      const headers = { 'x-user-role': 'admin' };
      
      const response = await apiRequest(`/api/admin/cache/invalidate/${domain}`, {
        method: 'POST',
        headers
      });
      
      if (response.success) {
        toast({
          title: 'Cache invalidé',
          description: `${response.entriesRemoved} entrées supprimées pour le domaine "${domain}"`,
          variant: 'default'
        });
        // Rafraîchir les statistiques
        setRefreshKey(prev => prev + 1);
      } else {
        toast({
          title: 'Erreur',
          description: response.error || 'Erreur inconnue lors de l\'invalidation du cache',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  // Fonction pour réinitialiser les limites de débit pour un utilisateur
  const handleResetRateLimits = async (userId: string) => {
    try {
      // Extraire l'ID utilisateur
      const id = userId.replace('user:', '');
      
      // Simuler un utilisateur admin pour le développement
      const headers = { 'x-user-role': 'admin' };
      
      const response = await apiRequest(`/api/admin/ratelimiter/reset/${id}`, {
        method: 'POST',
        headers
      });
      
      if (response.success) {
        toast({
          title: 'Limites réinitialisées',
          description: `Limites de débit réinitialisées pour l'utilisateur "${id}"`,
          variant: 'default'
        });
        // Rafraîchir les statistiques
        setRefreshKey(prev => prev + 1);
      } else {
        toast({
          title: 'Erreur',
          description: response.error || 'Erreur inconnue lors de la réinitialisation des limites',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  // Obtenir le libellé d'un domaine
  const getDomainLabel = (domain: string): string => {
    const labels: Record<string, string> = {
      'general': 'Général',
      'cybersecurite': 'Cybersécurité',
      'amoa': 'AMOA',
      'data_ia': 'Data & IA',
      'developpement': 'Développement',
      'cloud': 'Cloud',
      'agile': 'Agile & Méthodes'
    };
    
    return labels[domain] || domain;
  };

  // Formater un timestamp
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <AdminPageTitle title="Statistiques du cache et rate limiter" />
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          onClick={() => setRefreshKey(prev => prev + 1)}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Chargement des statistiques...</p>
            </div>
          </CardContent>
        </Card>
      ) : stats ? (
        <>
          {/* En-tête avec les statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taux de hits du cache</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cacheHitRate.toFixed(2)}%</div>
                <Progress value={stats.cacheHitRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.cache.totalHits} hits sur {stats.cache.totalHits + stats.rateLimiter.topUsers.reduce((sum, user) => sum + user.count, 0)} requêtes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Entrées en cache</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cache.totalEntries}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Object.keys(stats.cache.entriesByDomain).length} domaines différents
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Dernière mise à jour</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatTimestamp(stats.timestamp)}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.rateLimiter.blockedUsers} utilisateurs bloqués, {stats.rateLimiter.queuedRequests} requêtes en attente
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="cache">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cache">Cache</TabsTrigger>
              <TabsTrigger value="ratelimiter">Rate Limiter</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cache" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques du cache par domaine</CardTitle>
                  <CardDescription>
                    Répartition des entrées et hits par domaine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(stats.cache.entriesByDomain).sort().map(domain => (
                      <Card key={domain} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm font-medium">{getDomainLabel(domain)}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm font-medium">Entrées</div>
                              <div className="text-2xl font-bold">{stats.cache.entriesByDomain[domain]}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Hits</div>
                              <div className="text-2xl font-bold">{stats.cache.hitsByDomain[domain] || 0}</div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 bg-muted/50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full flex items-center gap-2"
                            onClick={() => handleInvalidateDomain(domain)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Invalider le cache
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={handleClearCache}
                  >
                    <Trash2 className="h-4 w-4" />
                    Vider tout le cache
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {stats.cache.totalEntries} entrées au total
                  </div>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Requêtes les plus fréquentes</CardTitle>
                  <CardDescription>
                    Top 10 des requêtes ayant le plus de hits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.cache.topQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center mb-1">
                            <Badge variant="outline" className="mr-2">{getDomainLabel(query.domain)}</Badge>
                            <span className="text-xs text-muted-foreground">{query.hits} hits</span>
                          </div>
                          <p className="text-sm line-clamp-2">{query.query}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleInvalidateDomain(query.domain)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {stats.cache.topQueries.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune requête mise en cache pour le moment
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ratelimiter" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques du rate limiter</CardTitle>
                  <CardDescription>
                    Informations sur les limitations de débit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.rateLimiter.totalUsers}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">Utilisateurs bloqués</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.rateLimiter.blockedUsers}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm font-medium">Requêtes en attente</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{stats.rateLimiter.queuedRequests}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Top utilisateurs</h3>
                    
                    {stats.rateLimiter.topUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="font-medium">{user.key}</span>
                            {user.blocked && (
                              <Badge variant="destructive" className="ml-2">Bloqué</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.count} requêtes</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResetRateLimits(user.key)}
                        >
                          Réinitialiser
                        </Button>
                      </div>
                    ))}
                    
                    {stats.rateLimiter.topUsers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur n'a encore effectué de requêtes
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune statistique disponible</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}