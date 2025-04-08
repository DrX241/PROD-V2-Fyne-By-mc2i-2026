import { openAIService } from "./I_AM_CYBER/services/openai";

try {
  console.log("Testing OpenAI Service...");
  console.log(`Current model: ${openAIService.getCurrentModelName()}`);
  console.log("Test completed successfully");
} catch (error) {
  console.error("Error running test:", error);
}