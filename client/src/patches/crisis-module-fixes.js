/**
 * Solution immédiate pour les deux problèmes dans le module de gestion de crise:
 * 1. La fenêtre de dialogue qui disparaît quand on clique sur un stakeholder
 * 2. Les personnages qui ne répondent pas aux messages
 * 
 * Instructions: 
 * - Ajouter une balise script dans le HTML référençant ce fichier
 * - Ou copier-coller ce code dans la console développeur du navigateur
 */

(function fixCrisisModule() {
  console.log("🛠 Patch pour le module de gestion de crise chargé");
  
  // Fonction pour empêcher la fermeture des dialogues quand on clique sur un stakeholder
  function fixDialogClosing() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Trouver tous les stakeholders et les cartes
          const stakeholders = document.querySelectorAll('[class*="stakeholder-"], [class*="Card-"], .stakeholder-card, .stakeholder-item');
          
          stakeholders.forEach(item => {
            // Vérifier si l'élément a déjà un gestionnaire de clic
            if (!item.getAttribute('data-click-handled')) {
              item.setAttribute('data-click-handled', 'true');
              
              // Ajouter un gestionnaire d'événements qui arrête la propagation
              item.addEventListener('click', e => {
                e.stopPropagation();
                console.log("🛑 Propagation du clic arrêtée pour", item);
              }, true);
            }
          });
        }
      });
    });
    
    // Observer tout le document
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    
    console.log("✅ Correctif pour les dialogues appliqué");
  }
  
  // Fonction pour simuler les réponses des personnages (PNJ)
  function simulateNPCResponses() {
    // Intercepter les envois de messages
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // Laisser passer l'appel original
      return originalFetch.apply(this, arguments).then(response => {
        // Vérifie si c'est un envoi de message dans l'interface de crise
        if (url.includes('/api/messages') && options && options.method === 'POST') {
          try {
            // Récupérer les données du message
            const body = JSON.parse(options.body);
            const receiverId = body.receiverId;
            
            // Si un message est envoyé à un stakeholder, simuler une réponse
            if (receiverId && receiverId !== 'warroom') {
              setTimeout(() => {
                console.log("🤖 Simulation de réponse du PNJ:", receiverId);
                
                // Trouver le stakeholder dans l'état
                const stakeholderElement = document.querySelector(`[data-stakeholder-id="${receiverId}"]`);
                const stakeholderName = stakeholderElement?.querySelector('h3')?.textContent || 'Contact';
                
                // Créer une réponse simulée basée sur le contenu du message
                let responseContent = "Je comprends votre message. Donnez-moi plus de détails sur la situation.";
                
                if (body.content.toLowerCase().includes('plan') || body.content.toLowerCase().includes('solution')) {
                  responseContent = "Votre proposition de plan semble pertinente. Nous devons agir rapidement et de façon coordonnée.";
                } else if (body.content.toLowerCase().includes('urgent') || body.content.toLowerCase().includes('critique')) {
                  responseContent = "Cette situation est effectivement critique. J'ai besoin de plus d'informations sur l'impact et les mesures déjà prises.";
                } else if (body.content.toLowerCase().includes('système') || body.content.toLowerCase().includes('données')) {
                  responseContent = "La sécurité de nos systèmes et données est prioritaire. Quelles mesures de confinement proposez-vous?";
                }
                
                // Créer un événement personnalisé pour simuler la réception d'un message
                const event = new CustomEvent('npc-response', {
                  detail: {
                    id: `sim-${Date.now()}`,
                    senderId: receiverId,
                    content: responseContent,
                    timestamp: new Date().toISOString()
                  }
                });
                
                // Déclencher l'événement
                document.dispatchEvent(event);
                
                // Tenter d'insérer la réponse dans l'interface
                const conversationContainer = document.querySelector('.conversation-messages, .messages-container');
                if (conversationContainer) {
                  const messageElement = document.createElement('div');
                  messageElement.className = 'message stakeholder-message';
                  messageElement.innerHTML = `
                    <div class="message-avatar">
                      <div class="avatar">${stakeholderName.substring(0, 2).toUpperCase()}</div>
                    </div>
                    <div class="message-content">
                      <div class="message-header">
                        <span class="message-name">${stakeholderName}</span>
                        <span class="message-time">${new Date().toLocaleTimeString()}</span>
                      </div>
                      <div class="message-text">${responseContent}</div>
                    </div>
                  `;
                  conversationContainer.appendChild(messageElement);
                  conversationContainer.scrollTop = conversationContainer.scrollHeight;
                }
              }, 2000); // Délai réaliste de réponse
            }
          } catch (error) {
            console.error("Erreur lors de la simulation de réponse:", error);
          }
        }
        return response;
      });
    };
    
    console.log("✅ Simulation de réponses des PNJ activée");
  }
  
  // Lancer les correctifs lorsque le DOM est chargé
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      fixDialogClosing();
      simulateNPCResponses();
    });
  } else {
    fixDialogClosing();
    simulateNPCResponses();
  }
})();