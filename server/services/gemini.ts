import { ChatCompletionRequestMessage } from "./openAiTypes";

interface CachedResponse {
  content: string;
  timestamp: number;
}

export type ApiKeyType = 'primary' | 'secondary';

const GATEWAY_URL = process.env.AI_GATEWAY_URL || "https://aigateway.mc2i-lab.fr/v1";
const GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY || "";
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const PRIMARY_MODEL = process.env.AI_PRIMARY_MODEL || "gemini-2.5-flash";
const SECONDARY_MODEL = process.env.AI_SECONDARY_MODEL || "gemini-2.5-flash";
const USE_GEMINI_DIRECT = !GATEWAY_KEY && !!GEMINI_KEY;

class GeminiService {
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5;
  private currentConfig: ApiKeyType = 'secondary';

  constructor() {
    if (USE_GEMINI_DIRECT) {
      console.log("Initializing Gemini Direct Service (fallback)");
      console.log(`Gemini API Key: ***${GEMINI_KEY.slice(-5)}`);
    } else {
      console.log("Initializing AI Gateway Service");
      console.log(`Gateway URL: ${GATEWAY_URL}`);
      console.log(`API Key: ***${GATEWAY_KEY ? GATEWAY_KEY.slice(-5) : "non définie"}`);
    }
    console.log(`Primary model: ${PRIMARY_MODEL}`);

    if (!GATEWAY_KEY && !GEMINI_KEY) {
      console.warn("Aucune clé IA configurée — fonctionnalité IA désactivée");
    }

    this.checkConnection();
    this.startPeriodicConnectionCheck();
  }

  private startPeriodicConnectionCheck(): void {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastConnectionCheck >= this.CONNECTION_CHECK_INTERVAL) {
        this.checkConnection();
      }
    }, this.CONNECTION_CHECK_INTERVAL);
  }

  switchApiKey(type: ApiKeyType): void {
    this.currentConfig = type;
    this.responseCache.clear();
    this.lastConnectionCheck = 0;
  }

  getCurrentConfig(): any {
    return this.currentConfig;
  }

  async checkConnection(): Promise<boolean> {
    if (!GATEWAY_KEY && !GEMINI_KEY) {
      this.connectionStatus = 'disconnected';
      return false;
    }
    try {
      const now = Date.now();
      if (now - this.lastConnectionCheck < this.CONNECTION_CHECK_INTERVAL && this.connectionStatus === 'connected') {
        return true;
      }

      const url = USE_GEMINI_DIRECT
        ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
        : `${GATEWAY_URL}/chat/completions`;

      const headers: any = { 'Content-Type': 'application/json' };
      let body: any;

      if (USE_GEMINI_DIRECT) {
        headers['x-goog-api-key'] = GEMINI_KEY;
        body = { contents: [{ parts: [{ text: "Hello" }] }], generationConfig: { maxOutputTokens: 5 } };
      } else {
        headers['Authorization'] = `Bearer ${GATEWAY_KEY}`;
        headers['x-litellm-tags'] = 'FYNE';
        body = { model: PRIMARY_MODEL, messages: [{ role: "user", content: "Hello" }], max_tokens: 5 };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        console.log("AI connection successful");
        return true;
      } else {
        const err = await response.text();
        console.error("AI connection check failed:", err);
        this.connectionStatus = 'disconnected';
        return false;
      }
    } catch (error) {
      console.error("Error checking AI connection:", error);
      this.connectionStatus = 'disconnected';
      return false;
    }
  }

  getConnectionStatus(): string { return this.connectionStatus; }
  getLastConnectionCheck(): number { return this.lastConnectionCheck; }
  getCurrentApiKeyType(): ApiKeyType { return this.currentConfig; }
  getCurrentModelName(): string { return PRIMARY_MODEL; }
  getModelName(): string { return PRIMARY_MODEL; }

  async forceReconnect(): Promise<boolean> {
    this.connectionStatus = 'reconnecting';
    this.lastConnectionCheck = 0;
    return await this.checkConnection();
  }

  private async callGateway(
    messages: ChatCompletionRequestMessage[],
    temperature: number,
    maxTokens: number,
    responseFormat?: string,
    model?: string
  ): Promise<string> {
    if (!GATEWAY_KEY && !GEMINI_KEY) {
      throw new Error("Aucune clé IA configurée (AI_GATEWAY_API_KEY ou GEMINI_API_KEY)");
    }

    const targetModel = model || PRIMARY_MODEL;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      let text: string;

      if (USE_GEMINI_DIRECT) {
        console.log(`[Gemini Direct] Appel modèle: ${targetModel}, temp=${temperature}, max_tokens=${maxTokens}`);

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

        const generationConfig: any = { temperature, maxOutputTokens: maxTokens };
        if (responseFormat === 'json_object') generationConfig.responseMimeType = 'application/json';
        if (targetModel.includes('2.5')) generationConfig.thinkingConfig = { thinkingBudget: 0 };

        const requestBody: any = { contents: geminiContents, generationConfig };
        if (systemInstruction) requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Gemini HTTP ${response.status}: ${errorData.slice(0, 300)}`);
        }

        const data = await response.json();
        text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Réponse vide ou format inattendu depuis Gemini");

      } else {
        console.log(`[AI Gateway] Appel modèle: ${targetModel}, temp=${temperature}, max_tokens=${maxTokens}`);

        const requestBody: any = { model: targetModel, messages, temperature, max_tokens: maxTokens };
        if (responseFormat === 'json_object') requestBody.response_format = { type: "json_object" };

        const response = await fetch(`${GATEWAY_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GATEWAY_KEY}`,
            'x-litellm-tags': 'FYNE',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Gateway HTTP ${response.status}: ${errorData.slice(0, 300)}`);
        }

        const data = await response.json();
        text = data?.choices?.[0]?.message?.content;
        if (!text) throw new Error("Réponse vide ou format inattendu depuis la gateway");
      }

      this.connectionStatus = 'connected';
      this.lastConnectionCheck = Date.now();
      return text;
    } catch (error: any) {
      clearTimeout(timeoutId);
      this.connectionStatus = 'disconnected';
      throw error;
    }
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
    options: { temperature?: number, maxTokens?: number, responseFormat?: string }
  ): Promise<string>;

  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperatureOrUseSecondary?: number | boolean | { temperature?: number, maxTokens?: number, responseFormat?: string },
    maxTokensOrTemperature?: number,
    maxTokensOrOptions?: number | { responseFormat?: string },
    options?: { responseFormat?: string }
  ): Promise<string> {
    let temperature: number = 0.7;
    let actualMaxTokens: number = 2000;
    let responseFormat: string | undefined;
    let useSecondary = false;

    if (typeof temperatureOrUseSecondary === 'boolean') {
      useSecondary = temperatureOrUseSecondary;
      temperature = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 0.7;
      actualMaxTokens = typeof maxTokensOrOptions === 'number' ? maxTokensOrOptions : 2000;
      responseFormat = options?.responseFormat;
    } else if (typeof temperatureOrUseSecondary === 'object' && temperatureOrUseSecondary !== null) {
      const opts = temperatureOrUseSecondary as any;
      temperature = opts.temperature ?? 0.7;
      actualMaxTokens = opts.maxTokens ?? 2000;
      responseFormat = opts.responseFormat;
    } else {
      temperature = typeof temperatureOrUseSecondary === 'number' ? temperatureOrUseSecondary : 0.7;
      actualMaxTokens = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 2000;
      if (typeof maxTokensOrOptions === 'object' && maxTokensOrOptions !== null) {
        responseFormat = (maxTokensOrOptions as { responseFormat?: string }).responseFormat;
      }
      responseFormat = responseFormat ?? options?.responseFormat;
    }

    const model = useSecondary ? SECONDARY_MODEL : PRIMARY_MODEL;
    return this.callGateway(messages, temperature, actualMaxTokens, responseFormat, model);
  }

  async getChatCompletionWithModel(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000,
    usePrimaryModel: boolean = false,
    options: { responseFormat?: string } = {}
  ): Promise<string> {
    const model = usePrimaryModel ? PRIMARY_MODEL : SECONDARY_MODEL;
    return this.callGateway(messages, temperature, maxTokens, options.responseFormat, model);
  }

  private getCacheKey(messages: ChatCompletionRequestMessage[], temperature: number, maxTokens: number): string {
    return JSON.stringify({ messages, temperature, maxTokens, model: PRIMARY_MODEL });
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
    let responseFormat: string | undefined;

    if (!Array.isArray(messagesOrOptions)) {
      messages = messagesOrOptions.messages;
      actualTemperature = messagesOrOptions.temperature ?? 0.7;
      actualMaxTokens = messagesOrOptions.maxTokens ?? 2000;
      responseFormat = messagesOrOptions.responseFormat;
    } else {
      messages = messagesOrOptions;
    }

    const cacheKey = this.getCacheKey(messages, actualTemperature, actualMaxTokens);
    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_TTL) {
      console.log("Using cached response");
      return cachedResponse.content;
    }

    const content = await this.callGateway(messages, actualTemperature, actualMaxTokens, responseFormat);
    this.responseCache.set(cacheKey, { content, timestamp: Date.now() });
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

    const content = await this.callGateway(
      messages,
      options.temperature ?? 0.7,
      options.max_tokens ?? 2000,
      undefined,
      SECONDARY_MODEL
    );

    return { choices: [{ message: { content } }] };
  }

  async generateSystemPrompt(configParams: {
    difficultyLevel?: string;
    responseStyle?: string;
  } = {}): Promise<string> {
    const { difficultyLevel = "Intermédiaire", responseStyle = "Professionnel" } = configParams;

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
  }
}

export const geminiService = new GeminiService();
export const openAIService = geminiService;
