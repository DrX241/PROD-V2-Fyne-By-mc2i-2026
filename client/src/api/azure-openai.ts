// API client pour Azure OpenAI

// Fonction pour générer un parcours personnalisé
export async function genererParcoursPersonnalise(intention: string) {
  try {
    const response = await fetch('/api/azure-openai/generer-parcours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intention }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération du parcours');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}