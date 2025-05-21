import OpenAI from "openai";

// Configurer le service OpenAI pour le modèle principal gpt-4o
export const openai = new OpenAI({
  apiKey: process.env.GPT4O_API_KEY,
  baseURL: `${process.env.GPT4O_ENDPOINT}openai/deployments/${process.env.GPT4O_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": process.env.GPT4O_API_VERSION },
});

// Configurer le service OpenAI pour le modèle secondaire gpt-4o-mini (plus rapide, moins cher)
export const openaiMini = new OpenAI({
  apiKey: process.env.GPT4O_MINI_API_KEY,
  baseURL: `${process.env.GPT4O_MINI_ENDPOINT}openai/deployments/${process.env.GPT4O_MINI_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": process.env.GPT4O_MINI_API_VERSION },
});

// Fonction pour tester la connexion à OpenAI
export async function testOpenAIConnection() {
  try {
    // Test de connexion avec le modèle secondaire
    const response = await openaiMini.chat.completions.create({
      model: process.env.GPT4O_MINI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, are you working?" }
      ],
      temperature: 0.7,
      max_tokens: 50,
    });
    
    return {
      success: true,
      model: process.env.GPT4O_MINI_DEPLOYMENT_NAME || "gpt-4o-mini",
      message: response.choices[0].message.content
    };
  } catch (error) {
    console.error("Error testing OpenAI connection:", error);
    return {
      success: false,
      error: error.message
    };
  }
}