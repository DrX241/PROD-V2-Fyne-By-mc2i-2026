export function mapEnvironmentVariables() {
  console.log("=== Variables d'environnement mappées ===");
  console.log(`AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '***configuré' : 'non configuré'}`);
  console.log(`AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '***configuré' : 'non configuré'}`);
  console.log(`AWS_REGION: ${process.env.AWS_REGION || 'non configuré'}`);
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '***configuré' : 'non configuré'}`);
}

export default mapEnvironmentVariables;
