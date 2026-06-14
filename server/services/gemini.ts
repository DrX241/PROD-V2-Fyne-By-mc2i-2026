import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { ChatCompletionRequestMessage } from "./openAiTypes";
import { trackLlmUsage } from "./llmTracker";
import { getLlmContext } from "./llmContext";

interface CachedResponse {
  content: string;
  timestamp: number;
}

export type ApiKeyType = 'primary' | 'secondary';

// ─── Modèles Bedrock ──────────────────────────────────────────────────────────
const BEDROCK_REGION = process.env.AWS_REGION || "eu-west-3";

// Seul Haiku 4.5 est souscrit dans ce compte — Sonnet nécessite AWS Marketplace (NOT_AVAILABLE)
const HAIKU_MODEL = process.env.BEDROCK_MODEL || "eu.anthropic.claude-haiku-4-5-20251001-v1:0";

export const MODEL_CATALOG = [
  {
    key: 'standard',
    label: 'Claude Haiku 4.5',
    description: 'Modèle actif — rapide et efficace',
    modelId: HAIKU_MODEL,
    eco: false,
  },
];

const BEDROCK_MODELS = [HAIKU_MODEL];

const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });

class GeminiService {
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5;
  private currentConfig: ApiKeyType = 'primary';
  private activeModelIdx: number = 0;
  // Choix utilisateur global : 0 = standard, 1 = éco
  private preferredModelIdx: number = 0;

  constructor() {
    console.log("Initializing AI Service — Bedrock");
    console.log(`Models: ${BEDROCK_MODELS.join(' → ')} | Region: ${BEDROCK_REGION}`);
    this.checkConnection();
    this.startPeriodicConnectionCheck();
  }

  private startPeriodicConnectionCheck(): void {
    setInterval(() => {
      if (Date.now() - this.lastConnectionCheck >= this.CONNECTION_CHECK_INTERVAL) {
        this.checkConnection();
      }
    }, this.CONNECTION_CHECK_INTERVAL);
  }

  switchApiKey(type: ApiKeyType): void {
    this.currentConfig = type;
    this.preferredModelIdx = type === 'secondary' ? 1 : 0;
    this.responseCache.clear();
    this.lastConnectionCheck = 0;
  }

  setModel(modelKey: string): boolean {
    const idx = MODEL_CATALOG.findIndex(m => m.key === modelKey);
    if (idx === -1) return false;
    this.preferredModelIdx = idx;
    this.currentConfig = idx === 0 ? 'primary' : 'secondary';
    this.responseCache.clear();
    return true;
  }

  getAvailableModels() { return MODEL_CATALOG; }
  getCurrentModelKey(): string { return MODEL_CATALOG[this.preferredModelIdx]?.key ?? 'standard'; }
  getCurrentConfig(): any { return this.currentConfig; }
  getConnectionStatus(): string { return this.connectionStatus; }
  getLastConnectionCheck(): number { return this.lastConnectionCheck; }
  getCurrentApiKeyType(): ApiKeyType { return this.currentConfig; }
  getCurrentModelName(): string { return MODEL_CATALOG[this.preferredModelIdx]?.label ?? BEDROCK_MODELS[this.activeModelIdx]; }
  getModelName(): string { return this.getCurrentModelName(); }

  async checkConnection(): Promise<boolean> {
    const now = Date.now();
    const recentlyChecked = (now - this.lastConnectionCheck) < this.CONNECTION_CHECK_INTERVAL;
    if (recentlyChecked && this.connectionStatus === 'connected') {
      return true;
    }

    for (let idx = 0; idx < BEDROCK_MODELS.length; idx++) {
      try {
        await this.callBedrock([{ role: "user", content: "Hi" }], 0, 5, BEDROCK_MODELS[idx]);
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = now;
        this.activeModelIdx = idx;
        console.log(`AI connection (Bedrock) OK — ${BEDROCK_MODELS[idx]}`);
        return true;
      } catch (err: any) {
        console.warn(`Bedrock connection check failed (${BEDROCK_MODELS[idx]}): ${err?.message}`);
      }
    }

    this.connectionStatus = 'disconnected';
    this.lastConnectionCheck = now;
    return false;
  }

  async forceReconnect(): Promise<boolean> {
    this.connectionStatus = 'reconnecting';
    this.lastConnectionCheck = 0;
    return this.checkConnection();
  }

  // ─── Appel Bedrock (Anthropic Messages API) avec retry sur throttling ────────
  private async callBedrock(
    messages: ChatCompletionRequestMessage[],
    temperature: number,
    maxTokens: number,
    modelId: string,
    retries = 2,
  ): Promise<{ text: string; promptTokens: number; completionTokens: number }> {
    const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
    const convo = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    if (convo.length === 0) convo.push({ role: 'user', content: 'Bonjour' });

    const body: any = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      temperature,
      messages: convo,
    };
    if (system) body.system = system;

    const cmd = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    let lastErr: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await bedrockClient.send(cmd);
        const decoded = JSON.parse(new TextDecoder().decode(res.body));
        const text = decoded?.content?.[0]?.text;
        if (!text) throw new Error("Réponse vide depuis Bedrock");
        return {
          text,
          promptTokens: decoded?.usage?.input_tokens ?? 0,
          completionTokens: decoded?.usage?.output_tokens ?? 0,
        };
      } catch (err: any) {
        lastErr = err;
        const isThrottle = err?.name === 'ThrottlingException' || err?.message?.includes('throttl');
        if (isThrottle && attempt < retries) {
          const wait = 3000 * (attempt + 1);
          console.warn(`[Bedrock] Throttling sur ${modelId} — retry dans ${wait}ms (tentative ${attempt + 1}/${retries})`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  // ─── Appel avec fallback : Bedrock Sonnet → Bedrock Haiku ───────────────────
  private async callWithFallback(
    messages: ChatCompletionRequestMessage[],
    temperature: number,
    maxTokens: number,
    responseFormat?: string,
    preferredModelIdx?: number,
  ): Promise<string> {
    const jsonMessages = responseFormat === 'json_object'
      ? [...messages, { role: 'user' as const, content: 'Réponds uniquement avec du JSON valide, sans markdown ni explications.' }]
      : messages;

    let lastError: Error | undefined;
    const startIdx = preferredModelIdx ?? this.preferredModelIdx;

    for (let i = 0; i < BEDROCK_MODELS.length; i++) {
      const idx = (startIdx + i) % BEDROCK_MODELS.length;
      const modelId = BEDROCK_MODELS[idx];
      // Haiku 4.5 : limite stricte 4096 tokens output
      const bedrockMaxTokens = Math.min(maxTokens, 4000);

      try {
        console.log(`[Bedrock] Appel modèle: ${modelId}, temp=${temperature}, max_tokens=${bedrockMaxTokens}`);
        const { text, promptTokens, completionTokens } = await this.callBedrock(
          jsonMessages, temperature, bedrockMaxTokens, modelId
        );
        this.activeModelIdx = idx;
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        this.trackUsage(promptTokens, completionTokens, modelId);
        return text;
      } catch (err: any) {
        console.warn(`[Bedrock] ${modelId} échoué: ${err?.message} (code: ${err?.name || err?.code || 'unknown'}) — essai modèle suivant`);
        lastError = err;
      }
    }

    this.connectionStatus = 'disconnected';
    throw new Error(`Tous les modèles Bedrock ont échoué. Dernier: ${lastError?.message}`);
  }

  private trackUsage(promptTokens: number, completionTokens: number, model: string): void {
    const ctx = getLlmContext();
    if (!ctx) return;
    trackLlmUsage({
      userId: ctx.userId,
      username: ctx.username,
      model,
      feature: ctx.feature,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    });
  }

  // ─── API publique (inchangée pour compatibilité) ──────────────────────────────

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
    let temperature = 0.7;
    let actualMaxTokens = 2000;
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

    // useSecondary → commence par le modèle secondaire (idx 1)
    const startIdx = useSecondary ? 1 : 0;
    return this.callWithFallback(messages, temperature, actualMaxTokens, responseFormat, startIdx);
  }

  async getChatCompletionWithModel(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000,
    usePrimaryModel: boolean = false,
    options: { responseFormat?: string } = {}
  ): Promise<string> {
    const startIdx = usePrimaryModel ? 0 : 1;
    return this.callWithFallback(messages, temperature, maxTokens, options.responseFormat, startIdx);
  }

  private getCacheKey(messages: ChatCompletionRequestMessage[], temperature: number, maxTokens: number): string {
    return JSON.stringify({ messages, temperature, maxTokens, model: BEDROCK_MODELS[0] });
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
    const cached = this.responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log("Using cached response");
      return cached.content;
    }

    const content = await this.callWithFallback(messages, actualTemperature, actualMaxTokens, responseFormat);
    this.responseCache.set(cacheKey, { content, timestamp: Date.now() });
    return content;
  }

  async getChatCompletionSecondary(options: {
    messages: { role: string, content: string }[];
    temperature?: number;
    max_tokens?: number;
  }) {
    const messages: ChatCompletionRequestMessage[] = options.messages.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));
    const content = await this.callWithFallback(messages, options.temperature ?? 0.7, options.max_tokens ?? 2000, undefined, 1);
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
      case "amical": systemPrompt += `\nAdopte un ton chaleureux et conversationnel.`; break;
      case "formel": systemPrompt += `\nAdopte un ton soutenu et professionnel.`; break;
      case "pédagogique": systemPrompt += `\nAdopte une approche explicative et didactique.`; break;
      case "inspirant": systemPrompt += `\nAdopte un style motivant et énergique.`; break;
      case "analytique": systemPrompt += `\nAdopte une approche méthodique et factuelle.`; break;
      default: systemPrompt += `\nAdopte un ton professionnel mais accessible.`;
    }
    if (gamificationLevel && gamificationLevel !== "none") {
      systemPrompt += `\n\n## NIVEAU DE GAMIFICATION: ${gamificationLevel.toUpperCase()}`;
      switch (gamificationLevel) {
        case "low": systemPrompt += `\nIntègre occasionnellement des éléments ludiques.`; break;
        case "medium": systemPrompt += `\nIntègre régulièrement des défis et quiz.`; break;
        case "high": systemPrompt += `\nIntègre systématiquement une approche fortement gamifiée.`; break;
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
