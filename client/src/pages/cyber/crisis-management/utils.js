/**
 * Utilitaires pour le module de gestion de crise
 */

// Importer ce fichier dans le composant principal ou l'ajouter via une balise script
export function fixCrisisDialogIssues() {
  // 1. Correction du problème de fenêtre qui disparaît lors du clic sur un stakeholder
  const fixDialogs = () => {
    document.querySelectorAll('[data-stakeholder-id], .card, .stakeholder-item').forEach(element => {
      if (!element.getAttribute('data-fixed')) {
        element.setAttribute('data-fixed', 'true');
        element.addEventListener('click', e => {
          e.stopPropagation();
          console.log('Clic sur stakeholder intercepté');
        }, true);
      }
    });
  };

  // Observer le DOM pour appliquer le correctif aux nouveaux éléments
  const observer = new MutationObserver(() => {
    fixDialogs();
  });

  // Appliquer le correctif immédiatement et configurer l'observateur
  fixDialogs();
  observer.observe(document.body, { childList: true, subtree: true });
  
  return () => observer.disconnect(); // Fonction de nettoyage
}

// Usage dans votre composant React:
// useEffect(() => {
//   const cleanup = fixCrisisDialogIssues();
//   return cleanup;
// }, []);