import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { ChatCompletionRequestMessage } from "./openAiTypes";

interface BedrockConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  modelId: string;
  modelName: string;
}

interface CachedResponse {
  content: string;
  timestamp: number;
}

export type ApiKeyType = 'primary' | 'secondary';

class BedrockService {
  private primaryConfig: BedrockConfig;
  private secondaryConfig: BedrockConfig;
  private primaryClient: BedrockRuntimeClient;
  private secondaryClient: BedrockRuntimeClient;
  private currentConfig: ApiKeyType = 'secondary';
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5;

  constructor() {
    console.log("Initializing Amazon Bedrock Service with configuration from secrets");

    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
    const awsRegion = process.env.AWS_REGION || "us-east-1";
    
    const primaryModelId = process.env.BEDROCK_PRIMARY_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";
    const secondaryModelId = process.env.BEDROCK_SECONDARY_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

    console.log(`AWS Access Key: ***${awsAccessKeyId ? awsAccessKeyId.slice(-5) : "non définie"}`);
    console.log(`AWS Region: ${awsRegion}`);
    console.log(`Primary Model ID: ${primaryModelId}`);
    console.log(`Secondary Model ID: ${secondaryModelId}`);

    if (!awsAccessKeyId) {
      console.error("ERREUR: Aucune clé d'accès AWS fournie (AWS_ACCESS_KEY_ID)");
    }

    if (!awsSecretAccessKey) {
      console.error("ERREUR: Aucune clé secrète AWS fournie (AWS_SECRET_ACCESS_KEY)");
    }

    this.primaryConfig = {
      region: awsRegion,
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
      modelId: primaryModelId,
      modelName: this.getModelDisplayName(primaryModelId)
    };

    this.secondaryConfig = {
      region: awsRegion,
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
      modelId: secondaryModelId,
      modelName: this.getModelDisplayName(secondaryModelId)
    };

    const clientConfig = {
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey
      }
    };

    this.primaryClient = new BedrockRuntimeClient(clientConfig);
    this.secondaryClient = new BedrockRuntimeClient(clientConfig);

    console.log(`Amazon Bedrock Service initialized with primary model: ${this.primaryConfig.modelName}`);
    console.log(`Amazon Bedrock Service initialized with secondary model: ${this.secondaryConfig.modelName}`);

    this.checkConnection();
    this.startPeriodicConnectionCheck();
  }

  private getModelDisplayName(modelId: string): string {
    if (modelId.includes('claude-3-5-sonnet')) return 'Claude 3.5 Sonnet';
    if (modelId.includes('claude-3-sonnet')) return 'Claude 3 Sonnet';
    if (modelId.includes('claude-3-haiku')) return 'Claude 3 Haiku';
    if (modelId.includes('claude-3-opus')) return 'Claude 3 Opus';
    if (modelId.includes('llama3')) return 'Llama 3';
    if (modelId.includes('titan')) return 'Amazon Titan';
    if (modelId.includes('mistral')) return 'Mistral';
    return modelId;
  }

  private startPeriodicConnectionCheck(): void {
    setInterval(() => {
      console.log('Performing periodic connection check to Amazon Bedrock...');
      this.checkConnection();
    }, this.CONNECTION_CHECK_INTERVAL);
  }

  switchApiKey(type: ApiKeyType): void {
    this.currentConfig = type;
    this.responseCache.clear();
    this.lastConnectionCheck = 0;
    console.log(`Switched to ${type} model (${this.getCurrentConfig().modelName})`);
  }

  getCurrentConfig(): BedrockConfig {
    return this.currentConfig === 'primary' ? this.primaryConfig : this.secondaryConfig;
  }

  private getCurrentClient(): BedrockRuntimeClient {
    return this.currentConfig === 'primary' ? this.primaryClient : this.secondaryClient;
  }

  private formatMessagesForClaude(messages: ChatCompletionRequestMessage[]): { system: string; messages: any[] } {
    let systemPrompt = "";
    const formattedMessages: any[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt += (systemPrompt ? "\n" : "") + msg.content;
      } else {
        formattedMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    if (formattedMessages.length === 0) {
      formattedMessages.push({ role: 'user', content: 'Hello' });
    }

    if (formattedMessages[0].role === 'assistant') {
      formattedMessages.unshift({ role: 'user', content: 'Continue the conversation.' });
    }

    return { system: systemPrompt, messages: formattedMessages };
  }

  private formatMessagesForLlama(messages: ChatCompletionRequestMessage[]): string {
    let prompt = "";
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${msg.content}<|eot_id|>`;
      } else if (msg.role === 'user') {
        prompt += `<|start_header_id|>user<|end_header_id|>\n${msg.content}<|eot_id|>`;
      } else if (msg.role === 'assistant') {
        prompt += `<|start_header_id|>assistant<|end_header_id|>\n${msg.content}<|eot_id|>`;
      }
    }
    prompt += `<|start_header_id|>assistant<|end_header_id|>\n`;
    return prompt;
  }

  private formatMessagesForTitan(messages: ChatCompletionRequestMessage[]): string {
    let prompt = "";
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Bot: ${msg.content}\n\n`;
      }
    }
    prompt += "Bot: ";
    return prompt;
  }

  async getChatCompletionWithModel(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000,
    usePrimaryModel: boolean = false,
    options: { responseFormat?: string } = {}
  ): Promise<string> {
    const config = usePrimaryModel ? this.primaryConfig : this.secondaryConfig;
    const client = usePrimaryModel ? this.primaryClient : this.secondaryClient;
    
    return this.invokeModel(client, config, messages, temperature, maxTokens, options);
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
    maxTokens?: number,
    options?: { responseFormat?: string }
  ): Promise<string> {
    let useSecondaryKey: boolean = false;
    let temperature: number = 0.7;
    let actualMaxTokens: number = 2000;
    let responseFormat: string | undefined = options?.responseFormat;

    if (typeof temperatureOrUseSecondary === 'boolean') {
      useSecondaryKey = temperatureOrUseSecondary;
      temperature = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 0.7;
      actualMaxTokens = typeof maxTokens === 'number' ? maxTokens : 2000;
    } else {
      temperature = typeof temperatureOrUseSecondary === 'number' ? temperatureOrUseSecondary : 0.7;
      actualMaxTokens = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 2000;
    }

    if (useSecondaryKey) {
      this.currentConfig = 'secondary';
    }

    const config = this.getCurrentConfig();
    const client = this.getCurrentClient();

    return this.invokeModel(client, config, messages, temperature, actualMaxTokens, { responseFormat });
  }

  private async invokeModel(
    client: BedrockRuntimeClient,
    config: BedrockConfig,
    messages: ChatCompletionRequestMessage[],
    temperature: number,
    maxTokens: number,
    options: { responseFormat?: string } = {}
  ): Promise<string> {
    try {
      console.log(`Making Bedrock API request with model: ${config.modelId}`);
      console.log(`Request parameters: temperature=${temperature}, max_tokens=${maxTokens}`);
      console.log(`Nombre de messages: ${messages.length}, Premier role: ${messages[0]?.role}`);

      let requestBody: any;

      if (config.modelId.includes('anthropic.claude')) {
        const { system, messages: formattedMessages } = this.formatMessagesForClaude(messages);
        requestBody = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: maxTokens,
          temperature: temperature,
          messages: formattedMessages,
          ...(system && { system })
        };
      } else if (config.modelId.includes('meta.llama')) {
        const prompt = this.formatMessagesForLlama(messages);
        requestBody = {
          prompt,
          max_gen_len: maxTokens,
          temperature: temperature
        };
      } else if (config.modelId.includes('amazon.titan')) {
        const prompt = this.formatMessagesForTitan(messages);
        requestBody = {
          inputText: prompt,
          textGenerationConfig: {
            maxTokenCount: maxTokens,
            temperature: temperature
          }
        };
      } else if (config.modelId.includes('mistral')) {
        const prompt = messages.map(m => m.content).join('\n');
        requestBody = {
          prompt: `<s>[INST] ${prompt} [/INST]`,
          max_tokens: maxTokens,
          temperature: temperature
        };
      } else {
        const { system, messages: formattedMessages } = this.formatMessagesForClaude(messages);
        requestBody = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: maxTokens,
          temperature: temperature,
          messages: formattedMessages,
          ...(system && { system })
        };
      }

      const command = new InvokeModelCommand({
        modelId: config.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody)
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      let content: string;

      if (config.modelId.includes('anthropic.claude')) {
        content = responseBody.content?.[0]?.text || "";
      } else if (config.modelId.includes('meta.llama')) {
        content = responseBody.generation || "";
      } else if (config.modelId.includes('amazon.titan')) {
        content = responseBody.results?.[0]?.outputText || "";
      } else if (config.modelId.includes('mistral')) {
        content = responseBody.outputs?.[0]?.text || "";
      } else {
        content = responseBody.content?.[0]?.text || responseBody.generation || "";
      }

      if (content) {
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        return content;
      } else {
        throw new Error("Invalid response format from Amazon Bedrock API");
      }
    } catch (error: any) {
      console.error("Error calling Amazon Bedrock API:", error);
      this.connectionStatus = 'disconnected';
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const now = Date.now();
      if (now - this.lastConnectionCheck < this.CONNECTION_CHECK_INTERVAL) {
        return this.connectionStatus === 'connected';
      }

      this.lastConnectionCheck = now;
      const config = this.getCurrentConfig();
      const client = this.getCurrentClient();

      const testMessages: ChatCompletionRequestMessage[] = [
        { role: "user", content: "Hello" }
      ];

      await this.invokeModel(client, config, testMessages, 0, 10, {});
      console.log(`Connection to Amazon Bedrock successful with model: ${config.modelName}`);
      this.connectionStatus = 'connected';
      return true;
    } catch (error) {
      console.error("Error checking connection to Amazon Bedrock:", error);
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
    return this.getCurrentConfig().modelName;
  }

  async forceReconnect(): Promise<boolean> {
    console.log('Force reconnection requested');
    this.connectionStatus = 'reconnecting';
    this.lastConnectionCheck = 0;
    return await this.checkConnection();
  }

  private getCacheKey(messages: ChatCompletionRequestMessage[], temperature: number, maxTokens: number): string {
    return JSON.stringify({ messages, temperature, maxTokens, model: this.getCurrentConfig().modelId });
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
    let actualUseSecondaryKey = useSecondaryKey;
    let responseFormat: string | undefined;

    if (!Array.isArray(messagesOrOptions)) {
      messages = messagesOrOptions.messages;
      actualTemperature = messagesOrOptions.temperature ?? 0.7;
      actualMaxTokens = messagesOrOptions.maxTokens ?? 2000;
      actualUseSecondaryKey = messagesOrOptions.useSecondaryKey ?? false;
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

    const content = await this.getChatCompletion(
      messages, 
      actualUseSecondaryKey,
      actualTemperature, 
      actualMaxTokens,
      { responseFormat: responseFormat }
    );

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

    const content = await this.invokeModel(
      this.secondaryClient,
      this.secondaryConfig,
      messages,
      options.temperature ?? 0.7,
      options.max_tokens ?? 2000,
      {}
    );

    return {
      choices: [{
        message: {
          content: content
        }
      }]
    };
  }
}

export const bedrockService = new BedrockService();
export const openAIService = bedrockService;
