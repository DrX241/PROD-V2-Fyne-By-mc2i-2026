// Ce script permet de forcer l'affichage de l'intro FYNE en réinitialisant localStorage
// Il peut être exécuté dans la console du navigateur pour tests

export function resetIntroState() {
  localStorage.removeItem('fyneIntroCompleted');
  console.log('État de l\'intro réinitialisé. L\'animation sera affichée au prochain chargement de page.');
}

// Exécuter automatiquement au chargement pour les tests
if (process.env.NODE_ENV === 'development') {
  localStorage.removeItem('fyneIntroCompleted');
  console.log('Animation FYNE activée pour cette session de développement.');
}
