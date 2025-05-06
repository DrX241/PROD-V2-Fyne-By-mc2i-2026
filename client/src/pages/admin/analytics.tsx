import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Redirect, useLocation } from 'wouter';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, FileBarChart, Users, Database, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type AnalyticsStats = {
  totalSessions: number;
  totalTokens: number;
  totalRequests: number;
  avgSessionDuration: number;
  uniqueUsers: number;
  modelStats: ModelStats[];
};

type ModelStats = {
  model: string;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalRequests: number;
};

type ModuleStats = {
  moduleId: string;
  moduleName: string;
  totalSessions: number;
  totalTokens: number;
  totalRequests: number;
  avgSessionDuration: number;
};

type UserStats = {
  userId: string;
  userName: string;
  totalSessions: number;
  totalTokens: number;
  totalRequests: number;
  avgSessionDuration: number;
};

type TokenUsageDetail = {
  id: number;
  userId: string;
  userName: string;
  moduleId: string;
  moduleName: string;
  requestId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  requestType: string;
  responseTime: number;
  success: boolean;
  errorCode: string | null;
  date: string;
};

const AnalyticsPage = () => {
  const { isAuthenticated, isSuperAdmin } = useAdminAuth();
  const [location, setLocation] = useLocation();
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('global');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les différentes statistiques
  const [globalStats, setGlobalStats] = useState<AnalyticsStats | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageDetail[]>([]);
  
  // Filtre pour les détails de consommation de tokens
  const [userFilter, setUserFilter] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>('');
  
  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) {
      return;
    }
    
    fetchData();
  }, [isAuthenticated, isSuperAdmin, activeTab, startDate, endDate]);
  
  // Fonction pour charger les données en fonction de l'onglet actif
  const fetchData = async () => {
    if (!isAuthenticated || !isSuperAdmin) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Préparer les paramètres de requête avec les dates
      const queryParams = new URLSearchParams();
      if (startDate) {
        queryParams.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        queryParams.append('endDate', endDate.toISOString());
      }
      
      // Charger les données en fonction de l'onglet actif
      switch (activeTab) {
        case 'global':
          const globalRes = await axios.get(`/api/admin/analytics/global?${queryParams.toString()}`);
          setGlobalStats(globalRes.data.data);
          break;
          
        case 'modules':
          const modulesRes = await axios.get(`/api/admin/analytics/modules?${queryParams.toString()}`);
          setModuleStats(modulesRes.data.data);
          break;
          
        case 'users':
          const usersRes = await axios.get(`/api/admin/analytics/users?${queryParams.toString()}`);
          setUserStats(usersRes.data.data);
          break;
          
        case 'tokens':
          // Ajouter les filtres supplémentaires pour les détails de tokens
          if (userFilter) {
            queryParams.append('userId', userFilter);
          }
          if (moduleFilter) {
            queryParams.append('moduleId', moduleFilter);
          }
          if (modelFilter) {
            queryParams.append('model', modelFilter);
          }
          
          const tokensRes = await axios.get(`/api/admin/analytics/token-usage?${queryParams.toString()}`);
          setTokenUsage(tokensRes.data.data);
          break;
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des données d\'analyse:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };
  
  // Réinitialiser les filtres
  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setUserFilter('');
    setModuleFilter('');
    setModelFilter('');
  };
  
  // Formater des nombres pour l'affichage
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };
  
  // Formater la durée en secondes au format hh:mm:ss
  const formatDuration = (seconds: number) => {
    if (!seconds) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Rediriger si non authentifié
  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  // Rediriger si authentifié mais pas super admin
  if (isAuthenticated && !isSuperAdmin) {
    return <Redirect to="/admin" />;
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord d'analyse</h1>
        
        {/* Sélection de la période */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Sélectionnez une période pour affiner les résultats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de début</label>
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                />
              </div>
              <Button variant="outline" onClick={resetFilters} className="ml-auto">
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Message d'erreur */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Onglets pour les différents types de statistiques */}
        <Tabs defaultValue="global" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="global">
              <FileBarChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Statistiques globales</span>
              <span className="inline sm:hidden">Global</span>
            </TabsTrigger>
            <TabsTrigger value="modules">
              <Database className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Par module</span>
              <span className="inline sm:hidden">Modules</span>
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Par utilisateur</span>
              <span className="inline sm:hidden">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="tokens">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Consommation de tokens</span>
              <span className="inline sm:hidden">Tokens</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Contenu de l'onglet Statistiques Globales */}
          <TabsContent value="global" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {globalStats ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Utilisateurs uniques</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatNumber(globalStats.uniqueUsers)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Sessions totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatNumber(globalStats.totalSessions)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Tokens consommés</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatNumber(globalStats.totalTokens)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Durée moyenne session</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatDuration(globalStats.avgSessionDuration)}</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Statistiques par modèle de langage */}
                    <h2 className="text-xl font-bold mb-4">Répartition par modèle</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">Modèle</th>
                            <th className="text-right py-2 px-4">Requêtes</th>
                            <th className="text-right py-2 px-4">Tokens prompt</th>
                            <th className="text-right py-2 px-4">Tokens réponse</th>
                            <th className="text-right py-2 px-4">Total tokens</th>
                          </tr>
                        </thead>
                        <tbody>
                          {globalStats.modelStats.map((modelStat, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-4">
                                <Badge variant="outline" className="font-mono">
                                  {modelStat.model}
                                </Badge>
                              </td>
                              <td className="text-right py-2 px-4">{formatNumber(modelStat.totalRequests)}</td>
                              <td className="text-right py-2 px-4">{formatNumber(modelStat.totalPromptTokens)}</td>
                              <td className="text-right py-2 px-4">{formatNumber(modelStat.totalCompletionTokens)}</td>
                              <td className="text-right py-2 px-4 font-bold">{formatNumber(modelStat.totalTokens)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune donnée disponible pour la période sélectionnée</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Contenu de l'onglet Statistiques par Module */}
          <TabsContent value="modules" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                {moduleStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Module</th>
                          <th className="text-right py-2 px-4">Sessions</th>
                          <th className="text-right py-2 px-4">Requêtes</th>
                          <th className="text-right py-2 px-4">Tokens</th>
                          <th className="text-right py-2 px-4">Durée moy. session</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moduleStats.map((moduleStat, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">
                              <div className="font-medium">{moduleStat.moduleName}</div>
                              <div className="text-xs text-muted-foreground">{moduleStat.moduleId}</div>
                            </td>
                            <td className="text-right py-2 px-4">{formatNumber(moduleStat.totalSessions)}</td>
                            <td className="text-right py-2 px-4">{formatNumber(moduleStat.totalRequests)}</td>
                            <td className="text-right py-2 px-4">{formatNumber(moduleStat.totalTokens)}</td>
                            <td className="text-right py-2 px-4">{formatDuration(moduleStat.avgSessionDuration)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune donnée disponible pour la période sélectionnée</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Contenu de l'onglet Statistiques par Utilisateur */}
          <TabsContent value="users" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                {userStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Utilisateur</th>
                          <th className="text-right py-2 px-4">Sessions</th>
                          <th className="text-right py-2 px-4">Requêtes</th>
                          <th className="text-right py-2 px-4">Tokens</th>
                          <th className="text-right py-2 px-4">Durée moy. session</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userStats.map((userStat, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">
                              <div className="font-medium">{userStat.userName}</div>
                              <div className="text-xs text-muted-foreground">{userStat.userId}</div>
                            </td>
                            <td className="text-right py-2 px-4">{formatNumber(userStat.totalSessions)}</td>
                            <td className="text-right py-2 px-4">{formatNumber(userStat.totalRequests)}</td>
                            <td className="text-right py-2 px-4">{formatNumber(userStat.totalTokens)}</td>
                            <td className="text-right py-2 px-4">{formatDuration(userStat.avgSessionDuration)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune donnée disponible pour la période sélectionnée</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Contenu de l'onglet Détails de Consommation de Tokens */}
          <TabsContent value="tokens" className="mt-6">
            {/* Filtres supplémentaires pour la consommation de tokens */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtres supplémentaires</CardTitle>
                <CardDescription>Affinez votre recherche de consommation de tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Utilisateur</label>
                    <input
                      type="text"
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      placeholder="ID utilisateur"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Module</label>
                    <input
                      type="text"
                      value={moduleFilter}
                      onChange={(e) => setModuleFilter(e.target.value)}
                      placeholder="ID module"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modèle</label>
                    <input
                      type="text"
                      value={modelFilter}
                      onChange={(e) => setModelFilter(e.target.value)}
                      placeholder="Nom du modèle"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={fetchData}>Appliquer les filtres</Button>
                </div>
              </CardContent>
            </Card>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                {tokenUsage.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Utilisateur</th>
                          <th className="text-left py-2 px-4">Module</th>
                          <th className="text-left py-2 px-4">Modèle</th>
                          <th className="text-right py-2 px-4">Prompt</th>
                          <th className="text-right py-2 px-4">Complétion</th>
                          <th className="text-right py-2 px-4">Total</th>
                          <th className="text-center py-2 px-4">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenUsage.map((usage) => (
                          <tr key={usage.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">
                              {new Date(usage.date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-2 px-4 max-w-[150px] truncate" title={usage.userName}>
                              {usage.userName}
                            </td>
                            <td className="py-2 px-4 max-w-[150px] truncate" title={usage.moduleName}>
                              {usage.moduleName}
                            </td>
                            <td className="py-2 px-4">
                              <Badge variant="outline" className="font-mono">
                                {usage.model}
                              </Badge>
                            </td>
                            <td className="text-right py-2 px-4">{formatNumber(usage.promptTokens)}</td>
                            <td className="text-right py-2 px-4">{formatNumber(usage.completionTokens)}</td>
                            <td className="text-right py-2 px-4 font-bold">{formatNumber(usage.totalTokens)}</td>
                            <td className="text-center py-2 px-4">
                              {usage.success ? (
                                <Badge variant="success">Succès</Badge>
                              ) : (
                                <Badge variant="destructive">Erreur</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune donnée disponible pour la période et les filtres sélectionnés</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;