import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotYetImplemented() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-900 text-white flex items-center justify-center p-4">
      <Card className="bg-blue-900/20 border-blue-800 w-full max-w-md">
        <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
          <FileQuestion className="h-16 w-16 text-blue-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Page non trouvée</h1>
          <p className="text-blue-200 mb-6">
            La page que vous recherchez n'existe pas ou n'est pas encore disponible.
          </p>
          <Button className="bg-blue-700 hover:bg-blue-600" asChild>
            <Link href="/cyber/learning-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au centre d'apprentissage
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}