import { ChatCompletionRequestMessage } from "./openAiTypes";

interface CachedResponse {
  content: string;
  timestamp: number;
}

export type ApiKeyType = 'primary' | 'secondary';

class GeminiService {
  private apiKey: string;
  private baseUrl: string;
  private currentConfig: ApiKeyType = 'secondary';
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

    console.log("Initializing Gemini FYNE Service");
    console.log(`Gemini API Key: ***${this.apiKey ? this.apiKey.slice(-5) : "non définie"}`);

    if (!this.apiKey) {
      console.error("ERREUR: Aucune clé API Gemini fournie (GEMINI_API_KEY)");
    }

    this.checkConnection();
    this.startPeriodicConnectionCheck();
  }

  private startPeriodicConnectionCheck(): void {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastConnectionCheck >= this.CONNECTION_CHECK_INTERVAL) {
        console.log('Performing periodic connection check to Gemini FYNE...');
        this.checkConnection();
      }
    }, this.CONNECTION_CHECK_INTERVAL);
  }

  switchApiKey(type: ApiKeyType): void {
    this.currentConfig = type;
    this.responseCache.clear();
    this.lastConnectionCheck = 0;
    console.log(`Switched to ${type} mode (Gemini FYNE)`);
  }

  getCurrentConfig(): any {
    return this.currentConfig;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const now = Date.now();
      if (now - this.lastConnectionCheck < this.CONNECTION_CHECK_INTERVAL && this.connectionStatus === 'connected') {
        return true;
      }

      const response = await fetch(
        `${this.baseUrl}/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }],
            generationConfig: { maxOutputTokens: 5 }
          })
        }
      );

      if (response.ok) {
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        console.log("Connection to Gemini FYNE successful");
        return true;
      } else {
        const errorData = await response.text();
        console.error("Gemini FYNE connection check failed:", errorData);
        this.connectionStatus = 'disconnected';
        return false;
      }
    } catch (error) {
      console.error("Error checking Gemini FYNE connection:", error);
      this.connectionStatus = 'disconnected';
      return false;
    }
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getLastConnectionCheck(): number {
    return this.lastConnectionCheck;
  }

  getCurrentApiKeyType(): ApiKeyType {
    return this.currentConfig;
  }

  getCurrentModelName(): string {
    return "Gemini FYNE";
  }

  getModelName(): string {
    return "Gemini FYNE";
  }

  async forceReconnect(): Promise<boolean> {
    console.log('Force reconnection to Gemini FYNE requested');
    this.connectionStatus = 'reconnecting';
    this.lastConnectionCheck = 0;
    return await this.checkConnection();
  }

  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    useSecondaryKey: boolean,
    temperature: number,
    maxTokens: number,
    options?: { responseFormat?: string }
  ): Promise<string>;

  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperature?: number,
    maxTokens?: number,
    options?: { responseFormat?: string, useSecondaryKey?: boolean }
  ): Promise<string>;

  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperatureOrUseSecondary?: number | boolean,
    maxTokensOrTemperature?: number,
    maxTokensOrOptions?: number | { responseFormat?: string },
    options?: { responseFormat?: string }
  ): Promise<string> {
    let temperature: number = 0.7;
    let actualMaxTokens: number = 2000;

    if (typeof temperatureOrUseSecondary === 'boolean') {
      temperature = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 0.7;
      actualMaxTokens = typeof maxTokensOrOptions === 'number' ? maxTokensOrOptions : 2000;
    } else {
      temperature = typeof temperatureOrUseSecondary === 'number' ? temperatureOrUseSecondary : 0.7;
      actualMaxTokens = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 2000;
    }

    return this.callGemini(messages, temperature, actualMaxTokens);
  }

  private readonly MODEL_CHAIN = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
  ];

  private async callGeminiModel(
    model: string,
    contents: any[],
    systemInstruction: string,
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    const requestBody: any = {
      contents,
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };
    if (systemInstruction) {
      requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(
        `${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`${model} HTTP ${response.status}: ${errorData.slice(0, 300)}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`${model}: réponse vide ou format inattendu`);
      return text;
    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async callGemini(
    messages: ChatCompletionRequestMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<string> {
    console.log(`Making Gemini FYNE API request`);
    console.log(`Request parameters: temperature=${temperature}, max_tokens=${maxTokens}`);
    console.log(`Nombre de messages: ${messages.length}, Premier role: ${messages[0]?.role}`);

    const geminiContents: any[] = [];
    let systemInstruction = "";

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction += (systemInstruction ? "\n" : "") + msg.content;
      } else {
        geminiContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    if (geminiContents.length === 0) {
      geminiContents.push({ role: 'user', parts: [{ text: 'Bonjour' }] });
    }

    let lastError: Error = new Error('Aucun modèle disponible');

    for (let modelIdx = 0; modelIdx < this.MODEL_CHAIN.length; modelIdx++) {
      const model = this.MODEL_CHAIN[modelIdx];
      try {
        console.log(`[Gemini] Tentative avec le modèle: ${model}`);
        const result = await this.callGeminiModel(model, geminiContents, systemInstruction, temperature, maxTokens);
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        if (modelIdx > 0) console.log(`[Gemini] ✓ Succès avec le modèle de secours: ${model}`);
        return result;
      } catch (error: any) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`[Gemini] ✗ Modèle ${model} échoué: ${lastError.message.slice(0, 120)}`);

        const isRateLimit = lastError.message.includes('429') || lastError.message.toLowerCase().includes('quota');
        const isLastModel = modelIdx === this.MODEL_CHAIN.length - 1;

        if (isLastModel) break;

        const delay = isRateLimit ? 4000 : 1200;
        console.log(`[Gemini] Bascule vers le prochain modèle dans ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }

    this.connectionStatus = 'disconnected';
    console.error('[Gemini] Tous les modèles ont échoué.');
    throw lastError;
  }

  async getChatCompletionWithModel(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000,
    usePrimaryModel: boolean = false,
    options: { responseFormat?: string } = {}
  ): Promise<string> {
    return this.callGemini(messages, temperature, maxTokens);
  }

  private getCacheKey(messages: ChatCompletionRequestMessage[], temperature: number, maxTokens: number): string {
    return JSON.stringify({ messages, temperature, maxTokens, model: 'gemini-fyne' });
  }

  async getChatCompletionWithCache(
    messages: ChatCompletionRequestMessage[],
    temperature: number,
    maxTokens: number,
    useSecondaryKey: boolean
  ): Promise<string>;

  async getChatCompletionWithCache(
    options: {
      messages: ChatCompletionRequestMessage[],
      temperature?: number,
      maxTokens?: number,
      useSecondaryKey?: boolean,
      responseFormat?: string
    }
  ): Promise<string>;

  async getChatCompletionWithCache(
    messagesOrOptions: ChatCompletionRequestMessage[] | {
      messages: ChatCompletionRequestMessage[],
      temperature?: number,
      maxTokens?: number,
      useSecondaryKey?: boolean,
      responseFormat?: string
    },
    temperature: number = 0.7,
    maxTokens: number = 2000,
    useSecondaryKey: boolean = false
  ): Promise<string> {
    let messages: ChatCompletionRequestMessage[];
    let actualTemperature = temperature;
    let actualMaxTokens = maxTokens;

    if (!Array.isArray(messagesOrOptions)) {
      messages = messagesOrOptions.messages;
      actualTemperature = messagesOrOptions.temperature ?? 0.7;
      actualMaxTokens = messagesOrOptions.maxTokens ?? 2000;
    } else {
      messages = messagesOrOptions;
    }

    const cacheKey = this.getCacheKey(messages, actualTemperature, actualMaxTokens);

    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_TTL) {
      console.log("Using cached response");
      return cachedResponse.content;
    }

    const content = await this.callGemini(messages, actualTemperature, actualMaxTokens);

    this.responseCache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });

    return content;
  }

  async getChatCompletionSecondary(options: {
    messages: {role: string, content: string}[];
    temperature?: number;
    max_tokens?: number;
  }) {
    const messages: ChatCompletionRequestMessage[] = options.messages.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content
    }));

    const content = await this.callGemini(
      messages,
      options.temperature ?? 0.7,
      options.max_tokens ?? 2000
    );

    return {
      choices: [{
        message: {
          content: content
        }
      }]
    };
  }

  async generateSystemPrompt(configParams: {
    difficultyLevel?: string;
    responseStyle?: string;
  } = {}): Promise<string> {
    try {
      let systemPrompt = `
# I AM CYBER - ASSISTANT DE CYBERSÉCURITÉ
Version 2.0 - Avril 2025

## OBJECTIF
Tu es I AM CYBER, un assistant spécialisé en cybersécurité conçu pour former et accompagner les professionnels débutants à experts. Ton objectif est de fournir des informations précises, actuelles et adaptées au niveau de l'utilisateur.

## PRINCIPES DE COMMUNICATION
- Adapte ton langage au niveau de connaissance de l'utilisateur (débutant, intermédiaire, expert)
- Reste factuel et précis dans tes informations
- Utilise un ton professionnel mais accessible
- Fournis des explications claires et des exemples concrets
- Reste concentré sur les problématiques de cybersécurité et de sécurité informatique

## STRUCTURE DE RÉPONSE
1. Réponds de manière directe à la question posée
2. Ajoute du contexte et des nuances importantes
3. Fournis des exemples concrets ou des cas d'usage
4. Si pertinent, suggère des ressources ou des étapes supplémentaires
`;

      const { difficultyLevel = "Intermédiaire", responseStyle = "Professionnel" } = configParams;

      systemPrompt += `\n\n# CONFIGURATION ACTUELLE:`;
      systemPrompt += `\n- Niveau de difficulté: ${difficultyLevel}`;
      systemPrompt += `\n- Style de réponse: ${responseStyle}`;

      if (difficultyLevel === "Débutant") {
        systemPrompt += `\n\nComme il s'agit d'un niveau débutant, utilisez un langage accessible, évitez le jargon technique trop complexe et fournissez plus d'explications pour les concepts clés.`;
      } else if (difficultyLevel === "Expert") {
        systemPrompt += `\n\nComme il s'agit d'un niveau expert, utilisez une terminologie technique précise et supposez que l'utilisateur a une bonne compréhension des concepts de cybersécurité. Proposez des défis plus complexes.`;
      }

      if (responseStyle === "Détaillé et pédagogique") {
        systemPrompt += `\n\nAdoptez un style détaillé et pédagogique. Fournissez des explications complètes et contextuelles.`;
      } else if (responseStyle === "Concis et direct") {
        systemPrompt += `\n\nAdoptez un style concis et direct. Allez droit au but et évitez les détails superflus.`;
      }

      return systemPrompt;
    } catch (error) {
      console.error("Error generating system prompt:", error);
      throw new Error("Failed to generate system prompt");
    }
  }

  async generateCustomAssistantPrompt(assistantParams: {
    name: string;
    description?: string;
    domain?: string;
    personality?: string;
    expertise?: string;
    gamificationLevel?: 'none' | 'low' | 'medium' | 'high';
    responseStyle?: string;
    additionalInfo?: string;
  }): Promise<string> {
    try {
      const {
        name,
        description = "un assistant IA personnalisé",
        domain = "général",
        personality = "professionnel",
        expertise = "intermédiaire",
        gamificationLevel = "none",
        responseStyle = "conversationnel",
        additionalInfo = ""
      } = assistantParams;

      let systemPrompt = `
# ASSISTANT PERSONNALISÉ: ${name.toUpperCase()}

## VOTRE IDENTITÉ ET MISSION
Tu es ${name}, ${description}. Tu es spécialisé dans le domaine: ${domain}.

## TON STYLE ET TON APPROCHE
- Ton niveau d'expertise est: ${expertise}
- Ta personnalité est: ${personality}
- Ton style de réponse est: ${responseStyle}
`;

      if (domain && domain !== "général") {
        systemPrompt += `\n## SPÉCIALISATION DANS LE DOMAINE: ${domain.toUpperCase()}`;
        systemPrompt += `\nEn tant qu'expert en ${domain}, tu dois:`;
        systemPrompt += `\n- Prioriser les connaissances et concepts de ce domaine`;
        systemPrompt += `\n- Adapter ta terminologie au vocabulaire spécifique de ce domaine`;
        systemPrompt += `\n- Faire référence aux bonnes pratiques et tendances actuelles du secteur`;
        systemPrompt += `\n- Citer des exemples pertinents pour illustrer tes réponses`;
      }

      systemPrompt += `\n\n## PERSONNALITÉ: ${personality.toUpperCase()}`;
      switch (personality.toLowerCase()) {
        case "amical":
          systemPrompt += `\nAdopte un ton chaleureux et conversationnel.`;
          break;
        case "formel":
          systemPrompt += `\nAdopte un ton soutenu et professionnel.`;
          break;
        case "pédagogique":
          systemPrompt += `\nAdopte une approche explicative et didactique.`;
          break;
        case "inspirant":
          systemPrompt += `\nAdopte un style motivant et énergique.`;
          break;
        case "analytique":
          systemPrompt += `\nAdopte une approche méthodique et factuelle.`;
          break;
        default:
          systemPrompt += `\nAdopte un ton professionnel mais accessible.`;
      }

      if (gamificationLevel && gamificationLevel !== "none") {
        systemPrompt += `\n\n## NIVEAU DE GAMIFICATION: ${gamificationLevel.toUpperCase()}`;
        switch (gamificationLevel) {
          case "low":
            systemPrompt += `\nIntègre occasionnellement des éléments ludiques.`;
            break;
          case "medium":
            systemPrompt += `\nIntègre régulièrement des défis et quiz.`;
            break;
          case "high":
            systemPrompt += `\nIntègre systématiquement une approche fortement gamifiée.`;
            break;
        }
      }

      if (additionalInfo && additionalInfo.trim().length > 0) {
        systemPrompt += `\n\n## INSTRUCTIONS SUPPLÉMENTAIRES`;
        systemPrompt += `\n${additionalInfo.trim()}`;
      }

      systemPrompt += `\n\n## FORMAT ET COMPORTEMENT GÉNÉRAL`;
      systemPrompt += `\n- N'utilise pas de formatage markdown (pas d'astérisques, de dièses, etc.)`;
      systemPrompt += `\n- Réponds toujours de manière directe et pertinente aux questions`;
      systemPrompt += `\n- Adapte ton niveau de détail au contexte de la conversation`;
      systemPrompt += `\n- Sois précis et factuel, évite les généralisations`;
      systemPrompt += `\n- Si tu ne connais pas la réponse, admets-le clairement`;

      return systemPrompt;
    } catch (error) {
      console.error("Error generating custom assistant prompt:", error);
      throw new Error("Failed to generate custom assistant prompt");
    }
  }
}

export const geminiService = new GeminiService();
export const openAIService = geminiService;
