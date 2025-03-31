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
          content: `Vous êtes un générateur de documents techniques en cybersécurité. Créez un document ${documentType} réaliste et concis pour un scénario de formation.
          Le document doit être TRÈS court (UNE SEULE PAGE MAXIMUM) et contenir des informations techniques précises et pertinentes.
          Format: Utilisez un format structuré avec des en-têtes, des sections et des données techniques appropriées au type de document.
          
          RÈGLES IMPORTANTES :
          1. Ne fournissez PAS de solutions ou de réponses directes aux problèmes
          2. Ne créez JAMAIS de personnages ou contacts fictifs - utilisez UNIQUEMENT le contact spécifié (${context.contactName})
          3. N'incluez PAS de section "Compétences et objectifs d'apprentissage"
          4. Restez bref et factuel - ce document sera utilisé comme pièce jointe d'un email
          5. N'utilisez PAS de nom "Claire Dufour" ou tout autre nom non fourni spécifiquement
          6. LE DOCUMENT NE DOIT PAS DÉPASSER UNE PAGE MAXIMUM - soyez concis`
        },
        {
          role: "user",
          content: `Générez un document "${documentType}" bref et concis pour un scénario de formation en cybersécurité avec les détails suivants:
          - Domaine: ${context.domain}
          - Scénario: ${context.scenario}
          - Niveau de difficulté: ${context.difficultyLevel}
          - Contact: ${context.contactName} (IMPORTANT: n'inventez PAS d'autres contacts)
          - Destinataire: ${context.userName}
          
          Le document doit être réaliste, comme s'il avait été produit dans un environnement professionnel d'entreprise.
          Il doit tenir en UNE SEULE PAGE maximum et ne doit pas dépasser 150-200 mots. Incluez juste assez de détails pour comprendre le contexte.
          Soyez extrêmement concis et allez directement à l'essentiel. 
          N'incluez pas de solutions ni de section d'objectifs d'apprentissage.`
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
        // Limiter le contenu pour qu'il tienne sur une seule page
        const contentLines = content.split('\n');
        let limitedContent = '';
        const maxLines = 45; // Nombre maximum de lignes pour que le contenu tienne sur une page
        
        // Si le contenu est trop long, le réduire et ajouter une note
        if (contentLines.length > maxLines) {
          const reducedContent = contentLines.slice(0, maxLines);
          limitedContent = reducedContent.join('\n') + '\n\n(Suite du contenu non affichée pour respecter la limite d\'une page)';
          content = limitedContent;
        }
        
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
          // Traiter les sous-titres ou éléments en gras
          else if (line.match(/^\*\*.*\*\*$/) || line.match(/^__.*__$/)) {
            // Enlever les marqueurs de gras et garder seulement le texte
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

  // Fonction spécifique pour créer un PDF d'évaluation de fin de scénario
  async createEvaluationPDF(
    filePath: string,
    content: string,
    title: string,
    context: {
      userName: string;
      scenarioTitle: string;
      scenarioDomain: string;
      date: string;
    }
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        // Limiter le contenu pour qu'il tienne sur une seule page
        const contentLines = content.split('\n');
        let limitedContent = '';
        const maxLines = 60; // Nombre maximum de lignes pour que le contenu de l'évaluation tienne sur une page
        
        // Si le contenu est trop long, le réduire et ajouter une note
        if (contentLines.length > maxLines) {
          const reducedContent = contentLines.slice(0, maxLines);
          limitedContent = reducedContent.join('\n') + '\n\n(Suite du contenu non affichée pour respecter la limite d\'une page)';
          content = limitedContent;
        }
        
        // Créer un nouveau document PDF
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
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
        
        // Entête
        doc.fontSize(24).fillColor('#003366').text("FICHE D'ÉVALUATION", {align: 'center'});
        doc.moveDown(0.5);
        
        // Ligne horizontale sous le titre
        doc.moveTo(50, doc.y)
           .lineTo(doc.page.width - 50, doc.y)
           .stroke('#003366');
        doc.moveDown(1);

        // Information sur le scénario
        doc.fontSize(14).fillColor('#003366').text(`Scénario: ${context.scenarioTitle}`, {align: 'center'});
        doc.fontSize(12).fillColor('#555555').text(`Domaine: ${context.scenarioDomain}`, {align: 'center'});
        doc.moveDown(1);
        
        // Information sur l'utilisateur et la date
        doc.fontSize(11).fillColor('#333333');
        doc.text(`Apprenant: ${context.userName}`, {align: 'left'});
        doc.text(`Date de l'évaluation: ${new Date(context.date).toLocaleDateString()}`, {align: 'left'});
        doc.moveDown(1.5);
        
        // Texte principal - Évaluation structurée
        doc.fontSize(11).fillColor('#000');
        
        // Traiter le contenu ligne par ligne pour une mise en forme améliorée
        const lines = content.split('\n');
        let inList = false;
        
        lines.forEach(line => {
          // Traiter les titres principaux (sections numérotées)
          if (line.match(/^\d+\.\s[A-Z\s]+$/)) {
            if (inList) {
              doc.moveDown(0.5);
              inList = false;
            }
            doc.fontSize(14).fillColor('#003366').text(line.trim(), {underline: true});
            doc.moveDown(0.5);
          } 
          // Traiter les éléments en gras (sous-titres)
          else if (line.match(/^\*\*.*\*\*$/) || line.match(/^__.*__$/)) {
            if (inList) {
              doc.moveDown(0.5);
              inList = false;
            }
            // Supprimer les marqueurs ** ou __ et garder le texte
            const boldText = line.replace(/^\*\*|\*\*$|^__|__$/g, '');
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#444').text(boldText.trim(), {continued: false});
            doc.moveDown(0.3);
            // Retour à la police normale
            doc.font('Helvetica');
          }
          // Traiter les listes à puces - Conserver le format des listes
          else if (line.match(/^[-*•]\s/)) {
            const bulletText = line.replace(/^[-*•]\s/, '');
            doc.fontSize(11).fillColor('#000').text(`• ${bulletText.trim()}`, {indent: 20});
            doc.moveDown(0.2);
            inList = true;
          }
          // Traiter les étoiles pour l'évaluation
          else if (line.includes('★')) {
            if (inList) {
              doc.moveDown(0.5);
              inList = false;
            }
            doc.fontSize(12).fillColor('#003366').text(line.trim(), {continued: false});
            doc.moveDown(0.5);
          }
          // Traiter les lignes vides
          else if (line.trim() === '') {
            if (inList) {
              doc.moveDown(0.3);
            } else {
              doc.moveDown(0.5);
            }
          }
          // Texte normal
          else {
            if (inList && !line.match(/^\s+/)) {
              doc.moveDown(0.5);
              inList = false;
            }
            doc.fontSize(11).fillColor('#000').text(line.trim());
            doc.moveDown(0.2);
          }
        });
        
        // Pied de page avec information de confidentialité et copyright
        const pageHeight = doc.page.height;
        const footerY = pageHeight - 30;
        doc.fontSize(8).fillColor('#888');
        doc.text(`Document généré par I_AM_CYBER - Confidentiel - mc2i © ${new Date().getFullYear()}`, 50, footerY, {
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
