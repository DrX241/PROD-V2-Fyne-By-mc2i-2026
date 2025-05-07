// Énumérations pour le jeu CYBER ESCAPE v2.0

// Énumération des étapes du jeu
export enum GameStage {
  VESTIBULE = 1,
  MUR_REVELATIONS = 2,
  COULOIR_BADGES = 3,
  SALLE_STRATEX = 4,
  CENTRE_ALERTE = 5,
  CHAINE_FANTOME = 6,
  NUAGE_TROUE = 7,
  ZONE_ROOTLAB = 8,
  ATELIER_FORENSIC = 9,
  PORTE_SIGMA = 10
}

// Énumération du statut du jeu
export enum GameStatus {
  INITIAL = 'initial',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error'
}