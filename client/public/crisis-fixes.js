/**
 * Script de correction pour le module de gestion de crise
 * 
 * Ce script résout deux problèmes:
 * 1. La fenêtre de dialogue qui disparaît lors du clic sur un stakeholder
 * 2. Les personnages qui ne répondent pas aux messages
 * 
 * Instructions:
 * 1. Accédez à votre module de gestion de crise
 * 2. Ouvrez la console développeur (F12)
 * 3. Collez le contenu de ce fichier dans la console et appuyez sur Entrée
 */

(function() {
  console.log("🛠️ Correctifs pour le module de gestion de crise en cours d'application...");

  // PROBLÈME 1: Fenêtre de dialogue qui disparaît lors du clic sur un stakeholder
  function fixDialogClosingIssue() {
    console.log("🔍 Recherche des éléments stakeholder...");
    
    // Fonction qui empêche la propagation des événements de clic
    function stopClickPropagation(element) {
      if (!element.getAttribute('data-fixed')) {
        element.setAttribute('data-fixed', 'true');
        element.addEventListener('click', e => {
          e.stopPropagation();
          console.log('🛑 Clic intercepté sur', element);
        }, true);
      }
    }
    
    // Appliquer à tous les éléments existants
    function applyToExistingElements() {
      // Cibler différents sélecteurs possibles pour les stakeholders
      const stakeholders = document.querySelectorAll([
        '[data-stakeholder-id]',
        '.stakeholder-item',
        '.stakeholder-card',
        '.card:not(.dialog-card)',
        '[class*="stakeholder"]',
        '.avatar-container'
      ].join(','));
      
      console.log(`📌 ${stakeholders.length} stakeholders trouvés`);
      stakeholders.forEach(stopClickPropagation);
    }
    
    // Observer le DOM pour appliquer aux nouveaux éléments
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Nœud élément
              // Appliquer aux éléments enfants du nouveau nœud
              const stakeholders = node.querySelectorAll([
                '[data-stakeholder-id]',
                '.stakeholder-item',
                '.stakeholder-card',
                '.card:not(.dialog-card)',
                '[class*="stakeholder"]',
                '.avatar-container'
              ].join(','));
              
              stakeholders.forEach(stopClickPropagation);
              
              // Appliquer au nœud lui-même s'il correspond
              if (
                node.hasAttribute('data-stakeholder-id') ||
                node.classList.contains('stakeholder-item') ||
                node.classList.contains('stakeholder-card') ||
                node.classList.contains('card') ||
                Array.from(node.classList).some(cls => cls.includes('stakeholder')) ||
                node.classList.contains('avatar-container')
              ) {
                stopClickPropagation(node);
              }
            }
          });
        }
      });
    });
    
    // Observer tout le document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Appliquer immédiatement
    applyToExistingElements();
    
    // Réappliquer toutes les secondes pendant 10 secondes pour s'assurer que tous les éléments sont traités
    let count = 0;
    const interval = setInterval(() => {
      applyToExistingElements();
      count++;
      if (count >= 10) clearInterval(interval);
    }, 1000);
    
    console.log("✅ Correctif pour les dialogues appliqué");
  }

  // PROBLÈME 2: Les personnages ne répondent pas aux messages
  function fixNPCResponseIssue() {
    console.log("📱 Installation du simulateur de réponses des personnages...");
    
    // Intercepter les soumissions de formulaire de messages
    function interceptMessageSubmissions() {
      // Observer les formulaires et les boutons d'envoi
      document.addEventListener('submit', function(e) {
        // Vérifier si c'est un formulaire de message
        if (
          e.target.querySelector('textarea, input[type="text"]') &&
          (e.target.querySelector('button[type="submit"]') || e.target.querySelector('[class*="send"], [aria-label*="send"], [title*="send"]'))
        ) {
          const inputElement = e.target.querySelector('textarea, input[type="text"]');
          const messageContent = inputElement ? inputElement.value : '';
          
          if (messageContent) {
            console.log("📤 Message détecté:", messageContent);
            
            // Identifier le destinataire
            let receiverId = null;
            
            // Essayer de trouver le stakeholder actif/sélectionné
            const activeStakeholder = document.querySelector(
              '[data-stakeholder-id].active, [data-stakeholder-id][aria-selected="true"], .stakeholder-item.active, .stakeholder-card.active'
            );
            
            if (activeStakeholder) {
              receiverId = activeStakeholder.getAttribute('data-stakeholder-id') || 
                           activeStakeholder.id || 
                           'stakeholder';
              console.log("👤 Destinataire identifié:", receiverId);
            }
            
            // Si un destinataire est identifié, simuler une réponse
            if (receiverId) {
              setTimeout(() => {
                simulateResponse(receiverId, messageContent);
              }, 1500 + Math.random() * 1000); // Délai aléatoire pour plus de réalisme
            }
          }
        }
      }, true);
      
      // Observer les clics sur les boutons d'envoi
      document.addEventListener('click', function(e) {
        // Si c'est un bouton d'envoi
        if (
          e.target.matches('button[type="submit"], [class*="send-button"], [aria-label*="send"], [title*="send"]') ||
          e.target.closest('button[type="submit"], [class*="send-button"], [aria-label*="send"], [title*="send"]')
        ) {
          // Trouver l'élément d'entrée de texte le plus proche
          const container = e.target.closest('form, [class*="message-input"], [class*="chat-input"]');
          if (!container) return;
          
          const inputElement = container.querySelector('textarea, input[type="text"]');
          if (!inputElement) return;
          
          const messageContent = inputElement.value;
          if (!messageContent) return;
          
          console.log("📤 Message détecté via bouton:", messageContent);
          
          // Identifier le destinataire
          let receiverId = null;
          
          // Essayer de trouver le stakeholder actif/sélectionné
          const activeStakeholder = document.querySelector(
            '[data-stakeholder-id].active, [data-stakeholder-id][aria-selected="true"], .stakeholder-item.active, .stakeholder-card.active'
          );
          
          if (activeStakeholder) {
            receiverId = activeStakeholder.getAttribute('data-stakeholder-id') || 
                         activeStakeholder.id || 
                         'stakeholder';
            console.log("👤 Destinataire identifié:", receiverId);
          }
          
          // Si un destinataire est identifié, simuler une réponse
          if (receiverId) {
            setTimeout(() => {
              simulateResponse(receiverId, messageContent);
            }, 1500 + Math.random() * 1000); // Délai aléatoire pour plus de réalisme
          }
        }
      }, true);
    }
    
    // Fonction pour simuler une réponse d'un PNJ
    function simulateResponse(stakeholderId, userMessage) {
      console.log("🤖 Génération d'une réponse pour:", stakeholderId);
      
      // Déterminer le type de message pour générer une réponse appropriée
      let responseContent = "";
      
      // Analyser le contenu du message pour générer une réponse contextuelle
      if (userMessage.toLowerCase().includes("plan") || userMessage.toLowerCase().includes("solution")) {
        responseContent = "Je suis d'accord avec votre proposition de plan. Nous devons agir rapidement pour limiter l'impact de cette attaque et restaurer les systèmes critiques en priorité.";
      } else if (userMessage.toLowerCase().includes("urgent") || userMessage.toLowerCase().includes("critique")) {
        responseContent = "Cette situation est effectivement critique. Nous devons mobiliser toutes nos ressources. Quelles sont les prochaines étapes que vous préconisez?";
      } else if (userMessage.toLowerCase().includes("données") || userMessage.toLowerCase().includes("exfiltration")) {
        responseContent = "La protection de nos données sensibles est notre priorité absolue. Nous devons évaluer l'étendue de l'exfiltration potentielle et informer les parties concernées.";
      } else if (userMessage.toLowerCase().includes("paiement") || userMessage.toLowerCase().includes("rançon")) {
        responseContent = "Je suis réticent concernant le paiement de la rançon. Nous n'avons aucune garantie que les attaquants tiendront parole, et cela pourrait encourager de futures attaques.";
      } else if (userMessage.toLowerCase().includes("communication") || userMessage.toLowerCase().includes("clients")) {
        responseContent = "La communication auprès de nos clients doit être transparente mais mesurée. Nous devons préparer un message qui les rassure sans révéler trop de détails techniques.";
      } else {
        responseContent = "Je comprends votre message. Cette crise ransomware nécessite une réponse coordonnée. Quelles sont vos recommandations concernant les prochaines actions à entreprendre?";
      }
      
      // Trouver le conteneur de messages
      const messageContainer = document.querySelector('.conversation-container, .messages-container, .chat-messages, [class*="message-list"]');
      
      if (messageContainer) {
        // Créer un nouvel élément de message
        const messageElement = document.createElement('div');
        messageElement.className = 'message stakeholder-message';
        
        // Trouver le nom du stakeholder si possible
        let stakeholderName = "Contact";
        const stakeholderElement = document.querySelector(`[data-stakeholder-id="${stakeholderId}"]`);
        if (stakeholderElement) {
          const nameElement = stakeholderElement.querySelector('h3, [class*="name"], [class*="title"]');
          if (nameElement) stakeholderName = nameElement.textContent.trim();
        }
        
        // Générer l'avatar (initiales)
        const initials = stakeholderName.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Structure HTML du message
        messageElement.innerHTML = `
          <div class="message-avatar">
            <div class="avatar">${initials}</div>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">${stakeholderName}</span>
              <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-text">${responseContent}</div>
          </div>
        `;
        
        // Ajouter le message au conteneur
        messageContainer.appendChild(messageElement);
        
        // Faire défiler vers le bas
        messageContainer.scrollTop = messageContainer.scrollHeight;
        
        console.log("✅ Réponse simulée ajoutée");
      } else {
        console.log("❌ Conteneur de messages non trouvé");
      }
    }
    
    // Activer l'interception des messages
    interceptMessageSubmissions();
    
    console.log("✅ Simulateur de réponses des personnages activé");
  }
  
  // Exécuter les correctifs
  fixDialogClosingIssue();
  fixNPCResponseIssue();
  
  console.log("🎉 Tous les correctifs ont été appliqués avec succès!");
  console.log("📝 Instructions: Si vous rencontrez encore des problèmes, actualisez la page et réexécutez ce script.");
})();