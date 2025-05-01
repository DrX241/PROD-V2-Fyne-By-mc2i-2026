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
  const { passwordValidated, setPasswordValidated } = useChatContext();

  // État pour gérer la validation du mot de passe
  const [password, setPassword] = useState("");
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string; postValidationInfo?: any } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Fonction pour valider le mot de passe
  const validatePassword = async () => {
    if (!password.trim()) return;

    setIsValidating(true);
    try {
      // Extraire les informations nécessaires
      const userRole = localStorage.getItem('userRole') || 'expert';
      const userName = localStorage.getItem('userName') || 'Utilisateur';
      // Extraire le domaine du scénario à partir du sujet ou du corps de l'email
      const domain = email.subject || 'Cybersécurité';
      const companyName = email.from.company || 'mc2i';

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
      setIsValidating(false);
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

  // Group list items into proper lists
  const renderBody = () => {
    let result = [];
    let currentList: JSX.Element[] = [];
    let isOrderedList = false;
    let listKey = 0;

    formattedBody.forEach((element: React.ReactNode, index: number) => {
      if (React.isValidElement(element) && element.type === 'li') {
        // Check if this is a numbered list item
        const originalLine = email.body.split('\n')[index];
        const isNumbered = originalLine.trim().match(/^\d+\.\s/);

        // If switching list types, close current list and start new one
        if ((isNumbered === null) !== isOrderedList && currentList.length > 0) {
          result.push(
            isOrderedList ? 
              <ol key={`list-${listKey++}`} className="list-decimal mb-3 text-white">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-3 text-white">{currentList}</ul>
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
              <ol key={`list-${listKey++}`} className="list-decimal mb-3 text-white">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-3 text-white">{currentList}</ul>
          );
          currentList = [];
        }
        result.push(element);
      }
    });

    // Add any remaining list items
    if (currentList.length > 0) {
      result.push(
        isOrderedList ? 
          <ol key={`list-${listKey++}`} className="list-decimal mb-3 text-white">{currentList}</ol> : 
          <ul key={`list-${listKey++}`} className="list-disc mb-3 text-white">{currentList}</ul>
      );
    }

    return result;
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

  const userRole = localStorage.getItem('userRole') || 'default';
  const domain = email.subject || 'default';


  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await apiRequest('/api/attachments/validate-password', {
        method: 'POST',
        body: JSON.stringify({
          password,
          userRole,
          domain,
          userName: email.to,
          companyName: email.from.company
        })
      });

      if (response.valid) {
        setPasswordValidated(true);

        // Affichage des informations du projet
        const projectInfo = await fetch('/api/cyber/project-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: userRole, domain })
        }).then(res => res.json());

        setValidationResult({
          valid: true,
          message: "Mot de passe validé avec succès",
          postValidationInfo: projectInfo
        });
      } else {
        setValidationResult({
          valid: false,
          message: "Mot de passe incorrect"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la validation du mot de passe.';
      setValidationResult({
        valid: false,
        message: errorMessage
      });
    }
  };

  const projectCard = (projectInfo) => {
    const projectCard = document.createElement('div');
    projectCard.className = 'bg-blue-900/30 p-6 rounded-lg border border-blue-700/50 mt-4';
    projectCard.innerHTML = `
      <h3 class="text-xl font-semibold mb-4">Bienvenue ${email.to} dans ce projet !</h3>

      <div class="space-y-4">
        <div>
          <h4 class="font-medium text-blue-200 mb-2">Vos responsabilités:</h4>
          <ul class="list-disc pl-5 space-y-1">
            ${projectInfo.responsibilities.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-blue-200 mb-2">Budget:</h4>
          <p>${projectInfo.budget}</p>
        </div>

        <div>
          <h4 class="font-medium text-blue-200 mb-2">Hiérarchie:</h4>
          <p>Position: ${projectInfo.hierarchy.position}</p>
          <p>Rapporte à: ${projectInfo.hierarchy.reportsTo}</p>
        </div>

        <div>
          <h4 class="font-medium text-blue-200 mb-2">Équipe:</h4>
          <ul class="space-y-2">
            ${projectInfo.team.map(member => `
              <li class="border-l-2 border-blue-500/30 pl-3">
                <strong>${member.role}:</strong> ${member.name}
                <br><span class="text-sm text-blue-300">${member.expertise}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;

    const container = document.querySelector('.email-content');
    if (container) container.appendChild(projectCard);
  }


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
        <div className="p-4 sm:p-6 text-white prose prose-invert max-w-none prose-blue text-sm sm:text-base email-content">
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
                      onClick={() => handlePasswordSubmit(password)} 
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
                  <p className="text-sm sm:text-base text-green-400 flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    {validationResult.message}
                  </p>

                  {validationResult.postValidationInfo && (
                    <div className="mt-4 p-3 sm:p-4 bg-blue-900/40 border border-blue-700/40 rounded-lg space-y-3">
                      <h6 className="font-bold text-sm sm:text-base text-white">
                        {validationResult.postValidationInfo.title}
                      </h6>

                      {validationResult.postValidationInfo.responsabilites && (
                        <div>
                          <h6 className="font-medium text-xs sm:text-sm text-white mb-1">Responsabilités:</h6>
                          <ul className="list-disc pl-5 text-xs sm:text-sm text-white space-y-1">
                            {validationResult.postValidationInfo.responsabilites.map((resp: string, i: number) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validationResult.postValidationInfo.budget && (
                        <div>
                          <h6 className="font-medium text-xs sm:text-sm text-white mb-1">Budget:</h6>
                          <p className="text-xs sm:text-sm text-white">
                            {validationResult.postValidationInfo.budget}
                          </p>
                        </div>
                      )}

                      {validationResult.postValidationInfo.hierarchie && (
                        <div>
                          <h6 className="font-medium text-xs sm:text-sm text-white mb-1">Hiérarchie:</h6>
                          <p className="text-xs sm:text-sm text-white">
                            {validationResult.postValidationInfo.hierarchie}
                          </p>
                        </div>
                      )}

                      {validationResult.postValidationInfo.equipe && (
                        <div>
                          <h6 className="font-medium text-xs sm:text-sm text-white mb-1">Équipe:</h6>
                          <ul className="list-disc pl-5 text-xs sm:text-sm text-white space-y-1">
                            {validationResult.postValidationInfo.equipe.map((member: any, i: number) => (
                              <li key={i}>
                                <span className="font-medium">{member.name}</span> - {member.role} 
                                {member.skills && <span className="text-blue-300"> ({member.skills})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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