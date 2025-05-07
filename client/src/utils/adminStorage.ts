// Utilitaire simple pour stocker l'état admin et permettre une communication entre composants
// même en l'absence du contexte React

let isAdminModeEnabled = false;
const listeners: Array<(value: boolean) => void> = [];

export const AdminStorage = {
  // Obtenir l'état actuel
  getAdminMode: (): boolean => {
    return isAdminModeEnabled;
  },
  
  // Définir un nouvel état
  setAdminMode: (value: boolean): void => {
    if (value !== isAdminModeEnabled) {
      isAdminModeEnabled = value;
      // Notifier tous les écouteurs
      listeners.forEach(listener => listener(value));
    }
  },
  
  // S'abonner aux changements
  subscribe: (listener: (value: boolean) => void): (() => void) => {
    listeners.push(listener);
    // Retourner une fonction pour se désabonner
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  },
  
  // Valider un mot de passe admin (doit se terminer par "eddyfyne")
  validatePassword: (password: string): boolean => {
    const isValid = password.endsWith("eddyfyne");
    if (isValid) {
      AdminStorage.setAdminMode(true);
    }
    return isValid;
  }
};

export default AdminStorage;