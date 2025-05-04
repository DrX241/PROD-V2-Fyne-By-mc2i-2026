import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, RefreshCw, Search, FileDown, Filter, Calendar } from 'lucide-react';
import AdminPageTitle from '@/components/layout/AdminPageTitle';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Types pour les logs
interface AssistantLog {
  id: number;
  timestamp: string;
  operation: string;
  userId: number;
  assistantId?: number;
  templateId?: number;
  details: Record<string, any>;
  status: string;
}

interface ApiLog {
  id: number;
  timestamp: string;
  endpoint: string;
  method: string;
  userId?: number;
  ip: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
}

interface CacheLog {
  id: number;
  timestamp: string;
  action: 'hit' | 'miss' | 'set' | 'invalidate' | 'clear';
  domain: string;
  userId?: number;
  query?: string;
  cacheKey?: string;
}

interface RateLimitLog {
  id: number;
  timestamp: string;
  action: 'limit' | 'queue' | 'block' | 'reset';
  userId: string;
  domain?: string;
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState('assistants');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [operationType, setOperationType] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  
  const pageSize = 10;

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Construire les paramètres de requête
  const buildQueryParams = () => {
    const params: Record<string, any> = {
      page: currentPage,
      pageSize,
    };

    if (filter) params.filter = filter;
    if (dateRange.start) params.startDate = dateRange.start;
    if (dateRange.end) params.endDate = dateRange.end;
    if (operationType !== 'all') params.operation = operationType;

    return params;
  };

  // Obtenir les logs d'assistants
  const { data: assistantLogs, isLoading: isLoadingAssistantLogs, error: assistantLogsError } = useQuery({
    queryKey: ['assistantLogs', activeTab === 'assistants', currentPage, filter, dateRange, operationType, refreshKey],
    queryFn: async () => {
      if (activeTab !== 'assistants') return null;
      
      try {
        // En développement, simuler des données
        // Dans un environnement de production, remplacer par une requête API réelle
        const headers = { 'x-user-role': 'admin' };
        
        // Simulation de délai et de données pour le développement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Données simulées pour le développement
        return {
          logs: Array.from({ length: 20 }).map((_, i) => ({
            id: i + 1,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            operation: ['CREATE', 'UPDATE', 'DELETE', 'MERGE_TEMPLATE'][Math.floor(Math.random() * 4)],
            userId: Math.floor(Math.random() * 5) + 1,
            assistantId: Math.floor(Math.random() * 10) + 1,
            templateId: Math.random() > 0.5 ? Math.floor(Math.random() * 5) + 1 : undefined,
            details: {
              name: `Assistant ${i + 1}`,
              domain: ['cybersecurite', 'amoa', 'data_ia'][Math.floor(Math.random() * 3)],
              ip: `192.168.1.${Math.floor(Math.random() * 255)}`
            },
            status: Math.random() > 0.1 ? 'SUCCESS' : 'ERROR',
          })),
          total: 100,
          page: currentPage,
          pageSize,
          totalPages: 10,
        };
      } catch (error) {
        console.error('Error fetching assistant logs:', error);
        throw error;
      }
    },
    enabled: activeTab === 'assistants',
  });

  // Obtenir les logs d'API
  const { data: apiLogs, isLoading: isLoadingApiLogs, error: apiLogsError } = useQuery({
    queryKey: ['apiLogs', activeTab === 'api', currentPage, filter, dateRange, refreshKey],
    queryFn: async () => {
      if (activeTab !== 'api') return null;
      
      try {
        // En développement, simuler des données
        // Dans un environnement de production, remplacer par une requête API réelle
        const headers = { 'x-user-role': 'admin' };
        
        // Simulation de délai et de données pour le développement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Données simulées pour le développement
        return {
          logs: Array.from({ length: 20 }).map((_, i) => ({
            id: i + 1,
            timestamp: new Date(Date.now() - i * 1800000).toISOString(),
            endpoint: ['/api/assistants/templates', '/api/assistants/user/:id', '/api/chat/completion', '/api/openai/status'][Math.floor(Math.random() * 4)],
            method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
            userId: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : undefined,
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            statusCode: [200, 201, 400, 404, 500][Math.floor(Math.random() * 5)],
            responseTime: Math.floor(Math.random() * 1000) + 50,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          })),
          total: 120,
          page: currentPage,
          pageSize,
          totalPages: 12,
        };
      } catch (error) {
        console.error('Error fetching API logs:', error);
        throw error;
      }
    },
    enabled: activeTab === 'api',
  });

  // Obtenir les logs de cache
  const { data: cacheLogs, isLoading: isLoadingCacheLogs, error: cacheLogsError } = useQuery({
    queryKey: ['cacheLogs', activeTab === 'cache', currentPage, filter, dateRange, refreshKey],
    queryFn: async () => {
      if (activeTab !== 'cache') return null;
      
      try {
        // En développement, simuler des données
        // Dans un environnement de production, remplacer par une requête API réelle
        const headers = { 'x-user-role': 'admin' };
        
        // Simulation de délai et de données pour le développement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Données simulées pour le développement
        return {
          logs: Array.from({ length: 20 }).map((_, i) => ({
            id: i + 1,
            timestamp: new Date(Date.now() - i * 900000).toISOString(),
            action: ['hit', 'miss', 'set', 'invalidate', 'clear'][Math.floor(Math.random() * 5)] as 'hit' | 'miss' | 'set' | 'invalidate' | 'clear',
            domain: ['cybersecurite', 'amoa', 'data_ia', 'general'][Math.floor(Math.random() * 4)],
            userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 5) + 1}` : undefined,
            query: Math.random() > 0.5 ? `Comment fonctionne la sécurité des applications web ?` : undefined,
            cacheKey: `cybersecurite:comment_fonctionne_securite_${i}`,
          })),
          total: 80,
          page: currentPage,
          pageSize,
          totalPages: 8,
        };
      } catch (error) {
        console.error('Error fetching cache logs:', error);
        throw error;
      }
    },
    enabled: activeTab === 'cache',
  });

  // Obtenir les logs de rate limiting
  const { data: rateLimitLogs, isLoading: isLoadingRateLimitLogs, error: rateLimitLogsError } = useQuery({
    queryKey: ['rateLimitLogs', activeTab === 'ratelimit', currentPage, filter, dateRange, refreshKey],
    queryFn: async () => {
      if (activeTab !== 'ratelimit') return null;
      
      try {
        // En développement, simuler des données
        // Dans un environnement de production, remplacer par une requête API réelle
        const headers = { 'x-user-role': 'admin' };
        
        // Simulation de délai et de données pour le développement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Données simulées pour le développement
        return {
          logs: Array.from({ length: 20 }).map((_, i) => ({
            id: i + 1,
            timestamp: new Date(Date.now() - i * 1200000).toISOString(),
            action: ['limit', 'queue', 'block', 'reset'][Math.floor(Math.random() * 4)] as 'limit' | 'queue' | 'block' | 'reset',
            userId: `user_${Math.floor(Math.random() * 5) + 1}`,
            domain: Math.random() > 0.3 ? ['cybersecurite', 'amoa', 'data_ia', 'general'][Math.floor(Math.random() * 4)] : undefined,
          })),
          total: 60,
          page: currentPage,
          pageSize,
          totalPages: 6,
        };
      } catch (error) {
        console.error('Error fetching rate limit logs:', error);
        throw error;
      }
    },
    enabled: activeTab === 'ratelimit',
  });

  // En développement, simuler l'exportation des logs
  const handleExportLogs = () => {
    toast({
      title: 'Export en cours',
      description: `Les logs ${activeTab} ont été exportés avec succès.`,
      variant: 'default',
    });
  };

  // Déterminer l'état de chargement actif
  const isLoading = 
    (activeTab === 'assistants' && isLoadingAssistantLogs) ||
    (activeTab === 'api' && isLoadingApiLogs) ||
    (activeTab === 'cache' && isLoadingCacheLogs) ||
    (activeTab === 'ratelimit' && isLoadingRateLimitLogs);
  
  // Déterminer l'erreur active
  const activeError =
    (activeTab === 'assistants' && assistantLogsError) ||
    (activeTab === 'api' && apiLogsError) ||
    (activeTab === 'cache' && cacheLogsError) ||
    (activeTab === 'ratelimit' && rateLimitLogsError);
  
  // Obtenir les données actives
  const activeData = 
    activeTab === 'assistants' ? assistantLogs :
    activeTab === 'api' ? apiLogs :
    activeTab === 'cache' ? cacheLogs :
    activeTab === 'ratelimit' ? rateLimitLogs :
    null;
  
  // Obtenir le nombre total de pages
  const totalPages = activeData?.totalPages || 1;

  // En-tête des colonnes pour chaque type de log
  const getTableHeaders = () => {
    switch (activeTab) {
      case 'assistants':
        return (
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Opération</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Assistant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Détails</TableHead>
          </TableRow>
        );
      case 'api':
        return (
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Méthode</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Temps (ms)</TableHead>
          </TableRow>
        );
      case 'cache':
        return (
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Domaine</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Clé de cache</TableHead>
          </TableRow>
        );
      case 'ratelimit':
        return (
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Domaine</TableHead>
          </TableRow>
        );
      default:
        return null;
    }
  };

  // Corps du tableau pour chaque type de log
  const getTableContent = () => {
    if (!activeData?.logs?.length) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-24 text-center">
            Aucun log trouvé.
          </TableCell>
        </TableRow>
      );
    }

    switch (activeTab) {
      case 'assistants':
        return activeData.logs.map((log: AssistantLog) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.id}</TableCell>
            <TableCell>{formatDate(log.timestamp)}</TableCell>
            <TableCell>
              <Badge variant={log.operation.includes('DELETE') ? 'destructive' : 'default'}>
                {log.operation}
              </Badge>
            </TableCell>
            <TableCell>User {log.userId}</TableCell>
            <TableCell>{log.assistantId ? `#${log.assistantId}` : (log.templateId ? `Template #${log.templateId}` : '-')}</TableCell>
            <TableCell>
              <Badge variant={log.status === 'SUCCESS' ? 'outline' : 'destructive'}>
                {log.status}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {log.details ? JSON.stringify(log.details).substring(0, 30) + '...' : '-'}
            </TableCell>
          </TableRow>
        ));
      case 'api':
        return activeData.logs.map((log: ApiLog) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.id}</TableCell>
            <TableCell>{formatDate(log.timestamp)}</TableCell>
            <TableCell className="max-w-[200px] truncate">{log.endpoint}</TableCell>
            <TableCell>
              <Badge variant={
                log.method === 'GET' ? 'outline' :
                log.method === 'POST' ? 'default' :
                log.method === 'PUT' ? 'secondary' :
                'destructive'
              }>
                {log.method}
              </Badge>
            </TableCell>
            <TableCell>{log.userId ? `User ${log.userId}` : log.ip}</TableCell>
            <TableCell>
              <Badge variant={
                log.statusCode < 300 ? 'outline' :
                log.statusCode < 400 ? 'default' :
                log.statusCode < 500 ? 'secondary' :
                'destructive'
              }>
                {log.statusCode}
              </Badge>
            </TableCell>
            <TableCell>{log.responseTime} ms</TableCell>
          </TableRow>
        ));
      case 'cache':
        return activeData.logs.map((log: CacheLog) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.id}</TableCell>
            <TableCell>{formatDate(log.timestamp)}</TableCell>
            <TableCell>
              <Badge variant={
                log.action === 'hit' ? 'outline' :
                log.action === 'set' ? 'default' :
                log.action === 'miss' ? 'secondary' :
                'destructive'
              }>
                {log.action.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell>{log.domain}</TableCell>
            <TableCell>{log.userId || '-'}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {log.cacheKey || '-'}
            </TableCell>
          </TableRow>
        ));
      case 'ratelimit':
        return activeData.logs.map((log: RateLimitLog) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{log.id}</TableCell>
            <TableCell>{formatDate(log.timestamp)}</TableCell>
            <TableCell>
              <Badge variant={
                log.action === 'limit' ? 'outline' :
                log.action === 'queue' ? 'secondary' :
                log.action === 'reset' ? 'default' :
                'destructive'
              }>
                {log.action.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell>{log.userId}</TableCell>
            <TableCell>{log.domain || '-'}</TableCell>
          </TableRow>
        ));
      default:
        return null;
    }
  };

  // Obtenir les options de filtrage pour chaque type de log
  const getFilterOptions = () => {
    switch (activeTab) {
      case 'assistants':
        return (
          <>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type d'opération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les opérations</SelectItem>
                <SelectItem value="CREATE">Création</SelectItem>
                <SelectItem value="UPDATE">Mise à jour</SelectItem>
                <SelectItem value="DELETE">Suppression</SelectItem>
                <SelectItem value="MERGE_TEMPLATE">Fusion de modèle</SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      case 'api':
        return (
          <>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Méthode HTTP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les méthodes</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      case 'cache':
        return (
          <>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="hit">HIT</SelectItem>
                <SelectItem value="miss">MISS</SelectItem>
                <SelectItem value="set">SET</SelectItem>
                <SelectItem value="invalidate">INVALIDATE</SelectItem>
                <SelectItem value="clear">CLEAR</SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      case 'ratelimit':
        return (
          <>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="limit">LIMIT</SelectItem>
                <SelectItem value="queue">QUEUE</SelectItem>
                <SelectItem value="block">BLOCK</SelectItem>
                <SelectItem value="reset">RESET</SelectItem>
              </SelectContent>
            </Select>
          </>
        );
      default:
        return null;
    }
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilter('');
    setDateRange({ start: '', end: '' });
    setOperationType('all');
    setCurrentPage(1);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <AdminPageTitle 
          title="Journaux d'activité" 
          description="Consultez et analysez les logs d'activité du système"
        />

        {activeError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement des logs : {(activeError as Error).message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="assistants" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assistants">Assistants</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="ratelimit">Rate Limiter</TabsTrigger>
          </TabsList>

          {/* Filtres communs */}
          <div className="my-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-40"
                placeholder="Date début"
              />
              <span>-</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-40"
                placeholder="Date fin"
              />
            </div>

            {getFilterOptions()}

            <Button variant="outline" onClick={handleResetFilters} className="gap-1">
              <Filter className="h-4 w-4" />
              Réinitialiser
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="gap-1 ml-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>

            <Button onClick={handleExportLogs} variant="secondary" className="gap-1">
              <FileDown className="h-4 w-4" />
              Exporter
            </Button>
          </div>

          {/* Table des logs */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    {getTableHeaders()}
                  </TableHeader>
                  <TableBody>
                    {getTableContent()}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, activeData?.total || 0)} sur {activeData?.total || 0} entrées
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calcul pour afficher les pages autour de la page courante
                    const pageNum = currentPage <= 3 
                      ? i + 1
                      : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                    
                    // Ne pas afficher si la page est hors limites
                    if (pageNum <= 0 || pageNum > totalPages) return null;
                    
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </Tabs>
      </div>
    </Layout>
  );
}