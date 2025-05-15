import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IoArrowBack, IoBookOutline, IoDesktopOutline, IoStatsChartOutline } from 'react-icons/io5';

export default function DataAcademie() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('fondamentaux');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050c15] to-[#0a1525]">
      <div className="container mx-auto px-4 py-6 max-w-screen-xl">
        <div className="flex items-center mb-6 mt-10">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 hover:bg-blue-500/10"
            onClick={() => setLocation('/data-ia')}
          >
            <IoArrowBack className="mr-1 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DATA ACADÉMIE
          </h1>
        </div>
        
        <div className="rounded-lg border bg-[#0c1625]/80 backdrop-blur-sm border-blue-500/20">
          <div className="p-4 border-b border-gray-700">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 w-full bg-gray-900/50">
                <TabsTrigger value="fondamentaux" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Fondamentaux
                </TabsTrigger>
                <TabsTrigger value="intelligence_artificielle" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                  IA & ML
                </TabsTrigger>
                <TabsTrigger value="sql" className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400">
                  SQL
                </TabsTrigger>
                <TabsTrigger value="python" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Python
                </TabsTrigger>
                <TabsTrigger value="data_engineering" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                  Data Engineering
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-[#1a3a60]/90 to-[#152a40]/90 border border-blue-400/20 hover:border-blue-400/40 hover:shadow-lg transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <IoStatsChartOutline className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl">Introduction à la Data Science</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                      débutant
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 mb-4">
                    Comprendre les bases de la Data Science et les types d'analyses
                  </CardDescription>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1">
                      <IoBookOutline className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-400">20 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-[#1a3a60]/90 to-[#152a40]/90 border border-blue-400/20 hover:border-blue-400/40 hover:shadow-lg transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <IoDesktopOutline className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl">Statistiques Fondamentales</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                      débutant
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 mb-4">
                    Maîtriser les concepts statistiques essentiels pour l'analyse de données
                  </CardDescription>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1">
                      <IoBookOutline className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-400">30 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}