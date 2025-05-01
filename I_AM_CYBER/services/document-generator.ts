import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { openAIService } from './openai';
import { ChatCompletionRequestMessage } from '../../shared/schema';

export class DocumentGenerator {
  private documentsDir: string;
  // Nom de l'entreprise fictive à afficher sur les documents
  private companyName: string = "CYBER SECURE SOLUTIONS";
  private htmlDir: string;

  constructor() {
    this.documentsDir = path.join(process.cwd(), 'I_AM_CYBER', 'documents');
    this.htmlDir = path.join(process.cwd(), 'I_AM_CYBER', 'html');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
    if (!fs.existsSync(this.htmlDir)) {
      fs.mkdirSync(this.htmlDir, { recursive: true });
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
          content: `Vous êtes un expert en cybersécurité travaillant pour ${context.contactName}. Créez un document ${documentType} engageant et immersif qui :
          1. Établit un contexte réaliste avec des enjeux business clairs
          2. Intègre des éléments techniques précis et pertinents
          3. Crée une tension narrative pour motiver l'apprenant
          4. Inclut des indices subtils liés aux objectifs d'apprentissage
          5. Reflète la personnalité et l'expertise du contact qui l'envoie

          Le document doit être professionnel mais captivant, comme dans une simulation réelle.`
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

  // Fonction pour générer une pièce jointe HTML simple avec juste le nom de l'entreprise
  async generateWelcomeHTML(
    scenarioId: string,
    companyName: string
  ): Promise<{ fileName: string, content: string }> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const htmlFileName = `${scenarioId}_bienvenue_${timestamp}.html`;
      const htmlFilePath = path.join(this.htmlDir, htmlFileName);

      // Crée un contenu HTML élégant avec le nom de l'entreprise
      const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue chez ${companyName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    }
    .container {
      width: 100%;
      max-width: 800px;
      padding: 3rem;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .logo {
      max-width: 220px;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #003366;
      font-family: 'Georgia', serif;
    }
    .tagline {
      font-size: 1.2rem;
      font-weight: 300;
      color: #666;
      margin-bottom: 2rem;
      font-style: italic;
    }
    .border-bottom {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #003366, transparent);
      margin: 2rem 0;
    }
    .footer {
      font-size: 0.85rem;
      color: #999;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Logo mc2i -->
    <img src="data:image/png;base64,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" alt="Logo mc2i" class="logo">

    <h1>${companyName}</h1>
    <p class="tagline">Excellence et innovation dans le domaine de la cybersécurité</p>

    <div class="border-bottom"></div>

    <div class="footer">
      <p>${companyName} &copy; ${new Date().getFullYear()} - Document confidentiel</p>
      <p>Généré par la plateforme I AM CYBER de mc2i</p>
    </div>
  </div>
</body>
</html>`;

      // Sauvegarder le fichier HTML
      fs.writeFileSync(htmlFilePath, htmlContent);

      return {
        fileName: htmlFileName,
        content: htmlContent
      };
    } catch (error) {
      console.error('Error generating HTML welcome document:', error);
      throw new Error(`Failed to generate welcome HTML document`);
    }
  }

  // Fonction pour obtenir le chemin d'un fichier HTML
  getHTMLPath(fileName: string): string {
    return path.join(this.htmlDir, fileName);
  }

  // Fonction pour obtenir le contenu d'un fichier HTML
  getHTMLContent(fileName: string): string {
    const filePath = this.getHTMLPath(fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`HTML document not found: ${fileName}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }
}

export const documentGenerator = new DocumentGenerator();