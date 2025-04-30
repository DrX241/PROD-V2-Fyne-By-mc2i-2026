import axios from 'axios';
import { ChatCompletionRequestMessage } from '@shared/schema';

export class OpenAIService {
  private apiKey: string;
  private endpoint: string;
  private model: string;
  
  constructor() {
    // Utiliser la clé API d'Azure OpenAI ou une clé de test
    this.apiKey = process.env.AZURE_OPENAI_API_KEY || '';
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    this.model = 'gpt-4o'; // Le modèle le plus récent disponible
    
    if (!this.apiKey || !this.endpoint) {
      console.warn('Attention: Clé API ou endpoint Azure OpenAI non configurés');
    }
  }
  
  /**
   * Génère une complétion de texte à partir d'un prompt
   */
  async generateCompletion(prompt: string, maxTokens: number = 1000): Promise<string> {
    try {
      const messages: ChatCompletionRequestMessage[] = [
        { role: 'system', content: 'Tu es un assistant IA spécialisé en cybersécurité qui aide à créer des simulations réalistes de gestion de crise.' },
        { role: 'user', content: prompt }
      ];
      
      return await this.createChatCompletion(messages, maxTokens);
    } catch (error) {
      console.error('Erreur lors de la génération de texte:', error);
      return 'Une erreur est survenue lors de la génération du contenu.';
    }
  }
  
  /**
   * Génère une réponse JSON à partir d'un prompt
   */
  async generateJSONResponse(prompt: string, maxTokens: number = 1000): Promise<any> {
    try {
      const messages: ChatCompletionRequestMessage[] = [
        { 
          role: 'system', 
          content: 'Tu es un assistant IA spécialisé en cybersécurité qui fournit des réponses au format JSON uniquement. ' +
                   'Tes réponses ne doivent contenir que du JSON valide, sans aucun texte d\'introduction ou de conclusion.'
        },
        { role: 'user', content: prompt }
      ];
      
      const response = await this.createChatCompletion(messages, maxTokens);
      
      // Nettoyer la réponse pour extraire uniquement le JSON
      const jsonStr = this.extractJSON(response);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Erreur lors de la génération de JSON:', error);
      // Retourner un objet vide en cas d'erreur
      return {};
    }
  }
  
  /**
   * Crée une complétion de chat en utilisant l'API OpenAI
   */
  private async createChatCompletion(messages: ChatCompletionRequestMessage[], maxTokens: number): Promise<string> {
    try {
      // Utiliser l'API Azure OpenAI si configurée
      if (this.apiKey && this.endpoint) {
        const requestUrl = `${this.endpoint}/openai/deployments/${this.model}/chat/completions?api-version=2023-12-01-preview`;
        
        const response = await axios.post(
          requestUrl,
          {
            messages,
            max_tokens: maxTokens,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': this.apiKey,
            },
          }
        );
        
        return response.data.choices[0].message.content.trim();
      } else {
        // Mode de secours: retourner une réponse fictive pour le développement
        console.warn('API OpenAI non configurée, génération de réponse fictive pour le développement');
        return this.getFallbackResponse(messages[messages.length - 1].content);
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API OpenAI:', error);
      throw error;
    }
  }
  
  /**
   * Extrait le JSON d'une réponse qui peut contenir du texte supplémentaire
   */
  private extractJSON(text: string): string {
    // Rechercher tout ce qui ressemble à du JSON dans la réponse
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // Si le JSON commence par ``` (format markdown)
    const markdownMatch = text.match(/```(?:json)?([\s\S]*?)```/);
    if (markdownMatch) {
      const extractedJson = markdownMatch[1].trim();
      return extractedJson;
    }
    
    // Si aucun match, retourner la réponse complète
    return text;
  }
  
  /**
   * Génère une réponse fictive pour le développement
   */
  private getFallbackResponse(prompt: string): string {
    // Vérifier si on demande du JSON
    if (prompt.toLowerCase().includes('json')) {
      return '{"title": "Exemple de réponse", "description": "Ceci est une réponse fictive générée pour le développement", "data": [1, 2, 3]}';
    }
    
    // Réponse textuelle standard
    return 'Ceci est une réponse fictive générée pour le développement. L\'API OpenAI n\'est pas configurée.';
  }
}