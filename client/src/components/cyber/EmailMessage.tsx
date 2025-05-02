import React, { useState } from "react";
import { Users, Paperclip, FileText, FileCode, FileWarning, FileQuestion, Download, Lock, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ScenarioContact, EmailMessageContent, AttachmentMetadata } from "@shared/types/cyber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatContext } from "@/contexts/ChatContext";

// Types aliases pour simplifier la transition
type EmailContact = ScenarioContact;
type EmailContent = EmailMessageContent;

interface EmailMessageProps {
  email: EmailContent;
}

export default function EmailMessage({ email }: EmailMessageProps) {
  // Accès au contexte de chat
  const { passwordValidated, setPasswordValidated, confirmMissionBrief } = useChatContext();

  // État pour gérer la validation du mot de passe
  const [password, setPassword] = useState("");
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string; postValidationInfo?: any } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Extraire les informations nécessaires pour l'authentification
  const userRole = localStorage.getItem('userRole') || 'expert';
  const userName = localStorage.getItem('userName') || 'Utilisateur';
  const domain = email.subject || 'Cybersécurité';
  const companyName = email.from.company || 'mc2i';

  // Fonction pour valider le mot de passe
  const handlePasswordValidation = async () => {
    if (!password.trim()) return;

    setIsValidating(true);
    try {
      const response = await apiRequest('/api/attachments/validate-password', {
        method: 'POST',
        body: JSON.stringify({
          password: password.trim(),
          userRole,
          domain,
          userName,
          companyName
        })
      });

      setValidationResult(response);
      setPasswordSubmitted(true);

      // Si le mot de passe est valide, mettre à jour l'état global
      if (response.valid) {
        setPasswordValidated(true);
      }
    } catch (error) {
      console.error('Erreur lors de la validation du mot de passe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la validation du mot de passe.';
      setValidationResult({
        valid: false,
        message: errorMessage
      });
    } finally {
      setIsValidating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Fonction pour formater correctement le prénom (première lettre en majuscule, reste en minuscules)
  const formatFirstName = (text: string, userName: string) => {
    if (!text || !userName || typeof text !== 'string' || typeof userName !== 'string') {
      return text;
    }

    // Obtenir le prénom formaté correctement (première lettre majuscule, reste minuscule)
    const formattedName = userName.split(' ')[0];
    if (!formattedName) return text;

    const properName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase();

    // Remplacer toutes les variations du prénom (tout min, tout maj, etc.) par la version formatée
    const variations = [
      userName.toLowerCase(),
      userName.toUpperCase(),
      userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase(),
      userName
    ];

    let result = text;
    variations.forEach(variant => {
      result = result.replace(new RegExp(variant, 'g'), properName);
    });

    return result;
  };

  // Convert email body text to paragraphs
  const formattedBody = email.body.split('\n').map((line: string, i: number) => {
    if (line.trim() === '') return <div key={i} className="h-4"></div>;

    // Formater le prénom dans la ligne
    const formattedLine = formatFirstName(line, email.to);

    // Handle bullet points or numbered lists
    if (formattedLine.trim().match(/^[•\-*]\s/)) {
      const bulletText = formattedLine.replace(/^[•\-*]\s/, '');
      // Aussi formater le texte dans les puces
      const formattedBulletText = formatFirstName(bulletText, email.to);
      return <li key={i} className="ml-6 mb-1 text-white">{formattedBulletText}</li>;
    }

    // Check for numbered list items
    const numberedListMatch = formattedLine.trim().match(/^(\d+\.)\s(.+)/);
    if (numberedListMatch) {
      // S'assurer que le texte du point numéroté est aussi formaté avec un prénom correct
      const formattedListItem = formatFirstName(numberedListMatch[2], email.to);
      return <li key={i} className="ml-6 mb-1 text-white">{formattedListItem}</li>;
    }

    // Traitement amélioré pour les titres et sous-titres (qui étaient en markdown)
    if (formattedLine.trim().match(/^\*\*.*\*\*$/) || formattedLine.trim().match(/^__.*__$/)) {
      const boldText = formattedLine.replace(/^\*\*|\*\*$|^__|__$/g, '');
      return <p key={i} className="mb-3 font-medium text-white">{boldText}</p>;
    }

    // Convertir tout le markdown en HTML correct
    if (formattedLine.includes('**') || formattedLine.includes('__')) {
      // Convertir le markdown en HTML propre
      let processedLine = formattedLine;

      // Remplacer **text** par du texte en gras
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      processedLine = processedLine.replace(/__(.*?)__/g, '<strong class="text-white">$1</strong>');

      // Ajouter d'autres conversions markdown au besoin (italique, etc.)
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="text-white">$1</em>');
      processedLine = processedLine.replace(/_(.*?)_/g, '<em class="text-white">$1</em>');

      return <p key={i} className="mb-3 text-white" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    }

    return <p key={i} className="mb-3 text-white">{formattedLine}</p>;
  });

  // Group list items into proper lists and enhance content presentation
  const renderBody = () => {
    let result = [];
    let currentList: JSX.Element[] = [];
    let isOrderedList = false;
    let listKey = 0;
    
    // Identifier les sections potentielles dans le contenu
    const hasSections = email.body.includes('CONTEXTE:') || 
                        email.body.includes('OBJECTIFS:') ||
                        email.body.includes('RESSOURCES:') ||
                        email.body.includes('DÉLAI:') ||
                        email.body.includes('BUDGET:');

    // Grouper les éléments de liste ensemble
    formattedBody.forEach((element: React.ReactNode, index: number) => {
      if (React.isValidElement(element) && element.type === 'li') {
        // Check if this is a numbered list item
        const originalLine = email.body.split('\n')[index];
        const isNumbered = originalLine.trim().match(/^\d+\.\s/);

        // If switching list types, close current list and start new one
        if ((isNumbered === null) !== isOrderedList && currentList.length > 0) {
          result.push(
            isOrderedList ? 
              <ol key={`list-${listKey++}`} className="list-decimal mb-4 text-white pl-5 space-y-1">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-4 text-white pl-5 space-y-1">{currentList}</ul>
          );
          currentList = [];
        }

        isOrderedList = Boolean(isNumbered);
        currentList.push(element);
      } else {
        // If we have list items, add the list before adding the non-list element
        if (currentList.length > 0) {
          result.push(
            isOrderedList ? 
              <ol key={`list-${listKey++}`} className="list-decimal mb-4 text-white pl-5 space-y-1">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-4 text-white pl-5 space-y-1">{currentList}</ul>
          );
          currentList = [];
        }
        
        // Mettre en évidence les titres de section
        if (React.isValidElement(element)) {
          const elementProps = element.props as { children?: string };
          if (elementProps && typeof elementProps.children === 'string') {
            const content = elementProps.children;
            
            // Détecter et formater les titres de section
            if (/^(CONTEXTE|OBJECTIFS|RESSOURCES|DÉLAI|BUDGET|MISSION|IMPACT|INSTRUCTIONS)[\s:]/i.test(content)) {
              const sectionTitle = content.split(':')[0].trim();
              const sectionContent = content.split(':').slice(1).join(':').trim();
            
              // Créer un élément de titre de section avec style amélioré
              result.push(
                <div key={`section-${index}`} className="mb-4 p-3 bg-blue-900/30 rounded-md border border-blue-700/30">
                  <h3 className="font-bold text-blue-300 mb-2 text-base">{sectionTitle}:</h3>
                  {sectionContent && <p className="text-white">{sectionContent}</p>}
                </div>
              );
              return;
            }
          }
        }
        
        result.push(element);
      }
    });

    // Add any remaining list items
    if (currentList.length > 0) {
      result.push(
        isOrderedList ? 
          <ol key={`list-${listKey++}`} className="list-decimal mb-4 text-white pl-5 space-y-1">{currentList}</ol> : 
          <ul key={`list-${listKey++}`} className="list-disc mb-4 text-white pl-5 space-y-1">{currentList}</ul>
      );
    }
    
    // Approche simplifiée pour la mise en forme des montants budgétaires
    // Puisque nous savons que chaque élément div/p peut contenir du text
    function formatBudgetElements(elements: React.ReactNode[]): React.ReactNode[] {
      // Pour chaque élément de type paragraphe ou div, on remplace directement son contenu textuel
      return elements.map((element) => {
        // Si ce n'est pas un élément React valide (ex: string, number), on le retourne tel quel
        if (!React.isValidElement(element)) {
          return element;
        }
        
        // Récupérer les propriétés
        const elementType = element.type as string;
        
        // Si c'est un paragraphe, une div ou un span qui pourrait contenir du texte
        if (elementType === 'p' || elementType === 'div' || elementType === 'span' || 
            elementType === 'h3' || elementType === 'h4' || elementType === 'li') {
          
          // Format simplifié pour les éléments avec enfants
          if (element.props.children) {
            if (typeof element.props.children === 'string') {
              // Pour les éléments contenant uniquement du texte
              const regex = /(\d+(\s*[kK])?€)/g;
              if (regex.test(element.props.children)) {
                return (
                  <element.type {...element.props}>
                    {element.props.children.split(regex).map((part: string, i: number) => {
                      if (regex.test(part)) {
                        return <span key={i} className="text-green-400 font-semibold">{part}</span>;
                      }
                      return part;
                    })}
                  </element.type>
                );
              }
            } else if (Array.isArray(element.props.children)) {
              // Pour les éléments avec des enfants multiples (tableau)
              return (
                <element.type {...element.props}>
                  {formatBudgetElements(element.props.children)}
                </element.type>
              );
            }
          }
          
          // Traitement spécial pour le contenu HTML dangereux
          if (element.props.dangerouslySetInnerHTML) {
            const html = element.props.dangerouslySetInnerHTML.__html;
            const regex = /(\d+(\s*[kK])?€)/g;
            
            if (regex.test(html)) {
              const formattedHtml = html.replace(regex, (match: string) => {
                return `<span class="text-green-400 font-semibold">${match}</span>`;
              });
              
              return React.cloneElement(
                element,
                {
                  ...element.props,
                  dangerouslySetInnerHTML: { __html: formattedHtml }
                }
              );
            }
          }
        }
        
        // Si c'est un élément qui contient potentiellement d'autres éléments (comme ul, ol)
        if (element.props.children && Array.isArray(element.props.children)) {
          return React.cloneElement(
            element,
            { ...element.props },
            formatBudgetElements(element.props.children)
          );
        }
        
        // Si aucune condition n'est remplie, retourner l'élément tel quel
        return element;
      });
    }
    
    // Si le contenu n'a pas de sections mais est court, ajouter une présentation améliorée
    if (!hasSections && result.length <= 3) {
      const enhancedResult = [
        <div key="email-intro" className="mb-5 p-4 bg-blue-900/20 rounded-lg border border-blue-700/20">
          <p className="text-blue-200 text-sm italic mb-2">Message important concernant votre mission :</p>
          <div className="space-y-3">
            {result}
          </div>
        </div>
      ];
      
      return formatBudgetElements(enhancedResult);
    }
    
    // Sinon retourner le résultat avec mise en forme des montants
    return formatBudgetElements(result);
  };

  // Fonction pour obtenir l'icône appropriée selon le type de pièce jointe
  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'log_file':
        return <FileCode className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />;
      case 'incident_report':
      case 'security_analysis':
      case 'vulnerability_scan':
        return <FileWarning className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
      case 'confidential_memo':
      case 'regulatory_filing':
      case 'data_breach_notification':
      case 'customer_communication':
        return <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />;
      default:
        return <FileQuestion className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
    }
  };

  // Convertir les tailles de fichiers en format lisible
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Vérifier si l'email a des pièces jointes (anciennes ou nouvelles)
  const hasAttachments = (email.attachment && email.attachment.length > 0) || 
                        (email.attachments && email.attachments.length > 0);

  return (
    <div className="my-6 sm:my-8 max-w-4xl mx-auto">
      <div className="backdrop-blur-md bg-gray-900/60 rounded-xl border border-blue-800/40 overflow-hidden shadow-glow-md">
        {/* Email Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-b border-blue-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4 border border-blue-500/30 shadow-glow-sm">
                <span className="font-semibold text-sm sm:text-base">
                  {email.from.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">{email.from.name}</h3>
                <p className="text-white text-xs sm:text-sm">{email.from.role}</p>
              </div>
            </div>
            <div className="text-white text-xs sm:text-sm bg-blue-900/50 px-3 py-1 rounded-md border border-blue-700/30 self-start sm:self-auto">
              {formatDate(email.date)}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 pt-3 border-t border-blue-700/30">
            <div className="flex flex-wrap sm:flex-nowrap">
              <p className="font-medium text-white w-12 sm:w-16 text-sm sm:text-base">À :</p>
              <p className="text-white text-sm sm:text-base">
                {typeof email.to === 'string' && email.to.includes('@') 
                  ? email.to 
                  : email.to.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap">
              <p className="font-medium text-white w-12 sm:w-16 text-sm sm:text-base">Objet :</p>
              <p className="text-white font-medium text-sm sm:text-base">{email.subject}</p>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-4 sm:p-6 text-white prose prose-invert max-w-none prose-blue text-sm sm:text-base email-content bg-blue-950/40 border border-blue-800/30 rounded-lg mx-3 sm:mx-6 my-3 backdrop-blur-sm">
          <div className="email-header mb-4 pb-3 border-b border-blue-700/30">
            <h3 className="text-lg sm:text-xl font-bold text-blue-200">Briefing de mission - Informations confidentielles</h3>
            <p className="text-sm text-blue-300">Ce message contient les détails essentiels pour votre mission de sécurité</p>
          </div>
          {renderBody()}
        </div>

        {/* Pièces jointes */}
        {hasAttachments && (
          <div className="mx-3 sm:mx-6 my-3 sm:my-4 p-3 sm:p-5 bg-blue-900/40 rounded-lg border border-blue-700/30 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <Paperclip className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" />
              <span>Pièces jointes</span>
            </h4>

            <div className="space-y-2">
              {/* Anciennes pièces jointes (format chaîne de caractères) */}
              {email.attachment && email.attachment.length > 0 && (
                <div className="flex flex-col gap-2">
                  <a
                    href={`/download-attachment/${localStorage.getItem('userRole') || 'default'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-2 sm:p-3 backdrop-blur-sm bg-gradient-to-br from-gray-900/70 to-blue-900/40 rounded-lg border border-blue-800/40 text-white hover:bg-blue-800/30 transition-colors cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                    <span className="flex-1 text-sm sm:text-base truncate">{email.attachment}</span>
                    <Download className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                  </a>
                  <div className="text-center">
                    <a 
                      href={`/download-attachment/${localStorage.getItem('userRole') || 'default'}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 mt-2 text-sm font-medium bg-blue-800/30 border-blue-800/60 text-white hover:bg-blue-700/40 rounded-md border transition-colors"
                    >
                      <Download className="mr-2 h-4 w-4" /> 
                      Télécharger la pièce jointe
                    </a>
                  </div>
                </div>
              )}

              {/* Nouvelles pièces jointes (format métadonnées) */}
              {email.attachments && email.attachments.map((attachment: AttachmentMetadata, index: number) => (
                <a 
                  key={index}
                  href={`/api/attachments/content/${userRole}/${encodeURIComponent(domain)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 sm:p-3 backdrop-blur-sm bg-gradient-to-br from-gray-900/70 to-blue-900/40 rounded-lg border border-blue-800/40 text-white hover:bg-blue-800/30 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`/api/attachments/content/${userRole}/${encodeURIComponent(domain)}`, '_blank');
                  }}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {getAttachmentIcon(attachment.type)}
                    <div className="ml-2 flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base text-white truncate">{attachment.filename}</p>
                      <p className="text-xs text-gray-300">{formatFileSize(attachment.size)} · {attachment.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <Download className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                </a>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-white mt-3 mb-4">
              Ces documents contiennent des informations importantes pour l'analyse de la situation.
            </p>

            {/* Zone de validation de mot de passe */}
            <div className="mt-4 p-3 sm:p-4 bg-blue-950/50 border border-blue-800/40 rounded-lg">
              <div className="flex items-center mb-2 text-white">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-400" />
                <h5 className="font-medium text-sm sm:text-base">
                  {passwordSubmitted 
                    ? (validationResult?.valid 
                      ? "Mot de passe validé avec succès!" 
                      : "Mot de passe incorrect")
                    : "Mot de passe requis"
                  }
                </h5>
              </div>

              {!passwordSubmitted || !validationResult?.valid ? (
                <>
                  <p className="text-xs sm:text-sm text-white mb-3">
                    <span className="font-bold text-amber-400">Vous devez cliquer sur la pièce jointe ci-dessus</span> pour l'ouvrir et trouver le mot de passe caché. Entrez-le ci-dessous pour accéder au contenu du projet.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="text"
                      placeholder="Entrez le mot de passe trouvé"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-blue-900/30 border-blue-700/50 text-white"
                    />
                    <Button 
                      onClick={handlePasswordValidation} 
                      disabled={isValidating || !password.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isValidating ? "Validation..." : "Valider"}
                    </Button>
                  </div>

                  {validationResult && !validationResult.valid && (
                    <p className="mt-2 text-xs sm:text-sm text-red-400 flex items-center">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      {validationResult.message}
                    </p>
                  )}
                </>
              ) : validationResult?.valid && (
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-green-400 flex items-center mb-4">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    {validationResult.message}
                  </p>
                  
                  {validationResult.postValidationInfo && (
                    <div className="mt-4 p-5 sm:p-6 bg-gradient-to-br from-blue-950/80 to-indigo-900/70 border border-blue-700/40 rounded-lg">
                      {/* En-tête avec nom du joueur */}
                      <h2 className="text-lg sm:text-xl text-white font-bold mb-4 pb-2 border-b border-blue-500/30">
                        Bienvenue <span className="text-blue-300">{localStorage.getItem('userName') || 'Utilisateur'}</span> dans ce projet !
                      </h2>
                      
                      {validationResult.postValidationInfo.responsabilites && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-sm sm:text-base text-blue-200 mb-2">Voici vos responsabilités:</h3>
                          <ul className="list-disc pl-5 text-xs sm:text-sm text-white space-y-1.5">
                            {validationResult.postValidationInfo.responsabilites.map((resp: string, i: number) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validationResult.postValidationInfo.budget && (
                        <div className="mb-4 p-3 bg-blue-900/30 rounded-md border border-blue-700/40">
                          <h3 className="font-semibold text-sm sm:text-base text-blue-200 mb-1">Budget:</h3>
                          <p className="text-sm sm:text-base text-white">
                            {validationResult.postValidationInfo.budget}
                          </p>
                        </div>
                      )}
                      
                      {validationResult.postValidationInfo.hierarchie && (
                        <div className="mb-4 p-3 bg-blue-900/30 rounded-md border border-blue-700/40">
                          <h3 className="font-semibold text-sm sm:text-base text-blue-200 mb-1">Hiérarchie:</h3>
                          <p className="text-sm sm:text-base text-white whitespace-pre-line">
                            {validationResult.postValidationInfo.hierarchie}
                          </p>
                        </div>
                      )}
                      
                      {validationResult.postValidationInfo.equipe && (
                        <div className="mb-5 p-3 bg-blue-900/30 rounded-md border border-blue-700/40">
                          <h3 className="font-semibold text-sm sm:text-base text-blue-200 mb-2">Équipe:</h3>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white">
                            {validationResult.postValidationInfo.equipe.map((member: any, i: number) => (
                              <li key={i} className="flex items-start p-2 rounded-md hover:bg-blue-800/20 transition-colors">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-700/60 to-indigo-700/60 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0 border border-blue-500/30">
                                  <span className="font-semibold text-[10px] sm:text-xs">
                                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{member.name}</div>
                                  <div className="text-xs text-gray-300">{member.role}</div>
                                  {member.skills && <div className="text-xs text-blue-300 mt-0.5">{member.skills}</div>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Règles et consignes importantes */}
                      <div className="mb-5 p-3 bg-amber-900/30 rounded-md border border-amber-700/40">
                        <h3 className="font-semibold text-sm sm:text-base text-amber-200 mb-2">Règles importantes:</h3>
                        <ul className="list-disc pl-5 text-xs sm:text-sm text-white space-y-1.5">
                          <li>Vous devez strictement répondre au besoin exprimé dans les emails à venir.</li>
                          <li>Vous pouvez solliciter votre équipe pour effectuer certaines tâches en leur déléguant.</li>
                          <li>Les mauvaises décisions ou réponses inadaptées impacteront votre budget.</li>
                          <li>Une succession d'erreurs peut entraîner une fin de mission immédiate sans préavis.</li>
                          <li>Votre performance sera évaluée sur la pertinence des actions et l'utilisation efficace du budget.</li>
                        </ul>
                      </div>
                      
                      {/* Bouton de confirmation */}
                      <div className="mt-5 pt-4 border-t border-blue-500/30 text-center">
                        <p className="text-sm text-white mb-3">
                          Veuillez confirmer que vous avez bien pris connaissance de ces informations pour continuer la mission.
                        </p>
                        <Button 
                          onClick={() => confirmMissionBrief()}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                        >
                          J'ai compris - Commencer la mission
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interlocuteurs */}
        {email.scenarioContacts && email.scenarioContacts.length > 0 && (
          <div className="mx-3 sm:mx-6 my-3 sm:my-4 p-3 sm:p-5 bg-blue-900/40 rounded-lg border border-blue-700/30 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" />
              <span>Interlocuteurs du scénario</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {email.scenarioContacts.map((contact: EmailContact, index: number) => (
                <div 
                  key={index} 
                  className="flex p-3 sm:p-4 backdrop-blur-sm bg-gradient-to-br from-gray-900/70 to-blue-900/40 rounded-lg border border-blue-800/40 shadow-md hover:shadow-glow-sm transition-all duration-300"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-700/60 to-indigo-700/60 rounded-full flex items-center justify-center text-white mr-2 sm:mr-3 flex-shrink-0 border border-blue-500/30 shadow-glow-sm">
                    <span className="font-semibold text-xs sm:text-sm">
                      {contact.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="w-full">
                    <h5 className="font-bold text-white text-sm sm:text-base">{contact.name}</h5>
                    <p className="text-white text-xs sm:text-sm mb-1 sm:mb-2">{contact.role}</p>
                    {(contact.expertise || contact.concern) && (
                      <div className="mt-1 sm:mt-2 p-1.5 sm:p-2 rounded-md bg-blue-950/50 border border-blue-800/40 space-y-1 sm:space-y-2">
                        {contact.expertise && (
                          <p className="text-[10px] sm:text-xs text-white">
                            <span className="font-medium text-white">Expertise:</span> {contact.expertise}
                          </p>
                        )}
                        {contact.concern && (
                          <p className="text-[10px] sm:text-xs text-white">
                            <span className="font-medium text-white">Préoccupation:</span> {contact.concern}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-white mt-3 sm:mt-4">
              Ces interlocuteurs interviendront dans ce scénario pour vous offrir différentes perspectives sur la problématique cyber centrale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}