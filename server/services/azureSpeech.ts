import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { PassThrough } from 'stream';

export interface TextToSpeechOptions {
  text: string;
  voiceName?: string;
  language?: string;
  style?: string;
}

class AzureSpeechService {
  private speechConfig: sdk.SpeechConfig;

  constructor() {
    // Utiliser les variables d'environnement pour les clés
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      throw new Error('Les clés Azure Speech ne sont pas configurées');
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    this.speechConfig.speechSynthesisVoiceName = "fr-FR-HenriNeural"; // Voix par défaut
    this.speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
  }

  // Convertir du texte en flux audio MP3
  async textToSpeechStream(options: TextToSpeechOptions): Promise<{ audioStream: PassThrough, contentLength: number }> {
    const { text, voiceName, language, style } = options;
    
    // Configurer la voix
    if (voiceName) {
      this.speechConfig.speechSynthesisVoiceName = voiceName;
    }
    
    // Préparer le texte SSML si un style est spécifié
    let ssmlText = '';
    if (style) {
      ssmlText = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${language || 'fr-FR'}">
        <voice name="${this.speechConfig.speechSynthesisVoiceName}">
          <mstts:express-as style="${style}">
            ${text}
          </mstts:express-as>
        </voice>
      </speak>`;
    }
    
    return new Promise((resolve, reject) => {
      // Créer un AudioOutputStream pour stocker les données audio
      const pullStream = sdk.AudioOutputStream.createPullStream();
      
      // Créer un synthétiseur audio avec la configuration
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, sdk.AudioConfig.fromStreamOutput(pullStream));
      
      // Flux de sortie
      const audioStream = new PassThrough();
      let dataLength = 0;
      
      // Détecter les événements de synthèse
      synthesizer.synthesisStarted = () => {
        console.log('Synthèse vocale démarrée');
      };
      
      synthesizer.synthesizing = (_sender, _event) => {
        // En cours de synthèse
      };
      
      // Fonction pour lire et transférer les données audio
      const processAudio = (audioBuffer: ArrayBuffer) => {
        const audioData = Buffer.from(audioBuffer);
        dataLength += audioData.length;
        audioStream.write(audioData);
      };
      
      synthesizer.synthesisCompleted = async (_sender, event) => {
        console.log('Synthèse vocale terminée');
        
        // Lire les données audio du flux
        const audioBuffer = new ArrayBuffer(16000);
        let pullResult = await pullStream.read(audioBuffer);
        while (pullResult.length > 0) {
          processAudio(audioBuffer.slice(0, pullResult.length));
          pullResult = await pullStream.read(audioBuffer);
        }
        
        // Terminer le flux
        audioStream.end();
        synthesizer.close();
        resolve({ audioStream, contentLength: dataLength });
      };
      
      synthesizer.SynthesisCanceled = (_sender, event) => {
        const cancellationDetails = sdk.SpeechSynthesisCancellationDetails.fromResult(event.result);
        console.error(`Synthèse vocale annulée: ${cancellationDetails.reason}`);
        if (cancellationDetails.reason === sdk.CancellationReason.Error) {
          console.error(`Code d'erreur: ${cancellationDetails.errorCode}`);
          console.error(`Détails de l'erreur: ${cancellationDetails.errorDetails}`);
        }
        audioStream.end();
        synthesizer.close();
        reject(new Error(`Synthèse vocale annulée: ${cancellationDetails.errorDetails}`));
      };
      
      // Démarrer la synthèse
      if (style) {
        synthesizer.speakSsmlAsync(
          ssmlText,
          result => {
            if (result.errorDetails) {
              console.error(`Erreur de synthèse: ${result.errorDetails}`);
              reject(new Error(result.errorDetails));
            }
          },
          error => {
            console.error(`Erreur: ${error}`);
            reject(error);
          }
        );
      } else {
        synthesizer.speakTextAsync(
          text,
          result => {
            if (result.errorDetails) {
              console.error(`Erreur de synthèse: ${result.errorDetails}`);
              reject(new Error(result.errorDetails));
            }
          },
          error => {
            console.error(`Erreur: ${error}`);
            reject(error);
          }
        );
      }
    });
  }

  // Fonction pour obtenir les voix disponibles
  async getAvailableVoices(): Promise<sdk.VoiceInfo[]> {
    return new Promise((resolve, reject) => {
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);
      synthesizer.getVoicesAsync(
        result => {
          synthesizer.close();
          if (result.voices && result.voices.length > 0) {
            resolve(result.voices);
          } else {
            reject(new Error('Aucune voix disponible'));
          }
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  }
}

// Exporter une instance singleton du service
export const azureSpeechService = new AzureSpeechService();