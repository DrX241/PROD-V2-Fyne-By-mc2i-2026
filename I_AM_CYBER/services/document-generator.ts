import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { openAIService } from './openai';
import { ChatCompletionRequestMessage } from '../../shared/schema';

export class DocumentGenerator {
  private documentsDir: string;
  // Nom de l'entreprise fictive à afficher sur les documents
  private companyName: string = "CYBER SECURE SOLUTIONS";

  constructor() {
    this.documentsDir = path.join(process.cwd(), 'I_AM_CYBER', 'documents');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  async generateDocument(
    scenarioId: string,
    documentType: string,
    context: {
      domain: string;
      scenario: string;
      userName: string;
      contactName: string;
      difficultyLevel: string;
    }
  ): Promise<{ fileName: string, content: string }> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const pdfFileName = `${scenarioId}_${documentType.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      const txtFileName = `${scenarioId}_${documentType.replace(/\s+/g, '_')}_${timestamp}.txt`;
      const pdfFilePath = path.join(this.documentsDir, pdfFileName);
      const txtFilePath = path.join(this.documentsDir, txtFileName);

      // Create prompt for document generation - Ne pas inclure les éléments de réponse
      const messages: ChatCompletionRequestMessage[] = [
        {
          role: "system",
          content: `Vous êtes un générateur de documents techniques en cybersécurité. Créez un document ${documentType} réaliste et détaillé pour un scénario de formation. 
          Le document doit faire au maximum une page et contenir des informations techniques précises et pertinentes.
          Format: Utilisez un format structuré avec des en-têtes, des sections et des données techniques appropriées au type de document.
          
          IMPORTANT: Ne fournissez PAS de solutions ou de réponses directes aux problèmes. Ce document sera utilisé dans un contexte de formation où l'utilisateur doit réfléchir par lui-même.
          Incluez seulement le contexte, les détails du problème, et éventuellement quelques éléments historiques ou références utiles.`
        },
        {
          role: "user",
          content: `Générez un document "${documentType}" pour un scénario de formation en cybersécurité avec les détails suivants:
          - Domaine: ${context.domain}
          - Scénario: ${context.scenario}
          - Niveau de difficulté: ${context.difficultyLevel}
          - Contact: ${context.contactName}
          - Destinataire: ${context.userName}
          
          Le document doit être réaliste, comme s'il avait été produit dans un environnement professionnel d'entreprise.
          Incluez suffisamment de détails pour que l'utilisateur puisse comprendre le problème, mais ne donnez PAS de solutions.
          L'objectif est que l'utilisateur réfléchisse par lui-même à la solution.`
        }
      ];

      // Generate document content
      const content = await openAIService.getChatCompletion(messages, 0.7, 1500);

      // Sauvegarder le contenu texte pour référence
      fs.writeFileSync(txtFilePath, content);

      // Créer le document PDF avec le nom de l'entreprise et le contenu
      await this.createPDF(pdfFilePath, content, documentType, context);

      return {
        fileName: pdfFileName,
        content
      };
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error(`Failed to generate ${documentType} document`);
    }
  }

  private async createPDF(filePath: string, content: string, documentType: string, context: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: documentType,
            Author: this.companyName,
            Subject: context.scenario,
            Creator: 'I AM CYBER Platform'
          }
        });
        
        // Définir la police par défaut
        doc.font('Helvetica');

        // Pipe le PDF vers un fichier
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Chargement du logo mc2i
        const logoPath = path.join(process.cwd(), 'I_AM_CYBER', 'assets', 'mc2i.png');
        
        if (fs.existsSync(logoPath)) {
          // Positionnement du logo en haut du document, centré
          const logoWidth = 150; // Largeur du logo en points
          const pageCenter = doc.page.width / 2;
          const logoX = pageCenter - (logoWidth / 2);
          doc.image(logoPath, logoX, doc.y, { width: logoWidth });
          doc.moveDown(2); // Espace après le logo
        }
        
        // Entête avec logo d'entreprise
        doc.fontSize(24).fillColor('#003366').text(this.companyName, {align: 'center'});
        doc.moveDown(0.5);
        
        // Ligne horizontale sous le nom de l'entreprise
        doc.moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke('#003366');
        doc.moveDown(1);

        // Titre du document
        doc.fontSize(16).fillColor('#000').text(context.scenario, {align: 'center'});
        doc.moveDown(0.5);
        
        // Type de document
        doc.fontSize(14).fillColor('#555').text(`Type: ${documentType}`, {align: 'center'});
        doc.moveDown(0.5);
        
        // Information de base
        doc.fontSize(10).fillColor('#333');
        doc.text(`Date: ${new Date().toLocaleDateString()}`, {align: 'right'});
        doc.text(`Référence: ${context.domain}`, {align: 'right'});
        doc.text(`Destinataire: ${context.userName}`, {align: 'right'});
        doc.moveDown(1);
        
        // Texte principal
        doc.fontSize(11).fillColor('#000');
        
        // Traiter le contenu ligne par ligne pour une mise en forme améliorée
        const lines = content.split('\n');
        lines.forEach(line => {
          // Traiter les titres
          if (line.match(/^#{1,3}\s/)) {
            const titleText = line.replace(/^#{1,3}\s/, '');
            doc.fontSize(14).fillColor('#003366').text(titleText.trim(), {underline: true});
            doc.moveDown(0.5);
          } 
          // Traiter les sous-titres ou éléments qui étaient en gras
          else if (line.match(/^\*\*.*\*\*$/) || line.match(/^__.*__$/)) {
            const boldText = line.replace(/^\*\*|\*\*$|^__|__$/g, '');
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#444').text(boldText.trim(), {continued: false});
            doc.moveDown(0.3);
            // Retour à la police normale
            doc.font('Helvetica');
          }
          // Traiter les listes à puces
          else if (line.match(/^[-*•]\s/)) {
            const bulletText = line.replace(/^[-*•]\s/, '');
            doc.fontSize(11).fillColor('#000').text(`• ${bulletText.trim()}`, {indent: 15});
            doc.moveDown(0.2);
          }
          // Traiter les listes numérotées
          else if (line.match(/^\d+\.\s/)) {
            doc.fontSize(11).fillColor('#000').text(line.trim(), {indent: 15});
            doc.moveDown(0.2);
          }
          // Traiter les lignes vides
          else if (line.trim() === '') {
            doc.moveDown(0.5);
          }
          // Texte normal
          else {
            doc.fontSize(11).fillColor('#000').text(line.trim());
            doc.moveDown(0.2);
          }
        });
        
        // Pied de page - on se positionne en bas de page
        const pageHeight = doc.page.height;
        const footerY = pageHeight - 30;
        doc.fontSize(8).fillColor('#888');
        doc.text(`${this.companyName} - Document confidentiel`, 50, footerY, {
          align: 'center',
          width: doc.page.width - 100
        });
        
        // Finaliser le document
        doc.end();
        
        stream.on('finish', () => {
          resolve();
        });
        
        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  getDocumentPath(fileName: string): string {
    return path.join(this.documentsDir, fileName);
  }

  getDocumentContent(fileName: string): string {
    const filePath = this.getDocumentPath(fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Document not found: ${fileName}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  listDocuments(): string[] {
    this.ensureDirectoryExists();
    return fs.readdirSync(this.documentsDir);
  }
}

export const documentGenerator = new DocumentGenerator();
