import { Router } from 'express';
import { OpenAIClient, AzureKeyCredential, ChatCompletionRequestMessage } from "@azure/openai";

const router = Router();

// Route pour générer une réponse de conversation
router.post('/generate-response', async (req, res) => {
  try {
    const { systemPrompt, messages, model = "gpt-4o-mini", temperature = 0.7, max_tokens = 150 } = req.body;
    
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Les messages doivent être fournis sous forme de tableau" });
    }
    
    // Configuration Azure OpenAI
    const endpoint = process.env.GPT4O_MINI_ENDPOINT || "";
    const apiKey = process.env.GPT4O_MINI_API_KEY || "";
    const deploymentName = process.env.GPT4O_MINI_DEPLOYMENT_NAME || "";
    
    if (!endpoint || !apiKey || !deploymentName) {
      return res.status(500).json({ error: "Configuration Azure OpenAI manquante" });
    }
    
    // Initialiser le client Azure OpenAI
    const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );
    
    // Préparer les messages pour l'API OpenAI
    const chatMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))
    ];
    
    // Appeler l'API OpenAI
    const response = await client.getChatCompletions(
      deploymentName,
      chatMessages,
      { temperature, maxTokens: max_tokens }
    );
    
    // Extraire la réponse
    const responseContent = response.choices[0]?.message?.content || "Je n'ai pas de réponse à fournir pour le moment.";
    
    return res.json({ response: responseContent });
    
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse OpenAI:", error);
    return res.status(500).json({ error: "Erreur lors de la génération de la réponse" });
  }
});

export default router;