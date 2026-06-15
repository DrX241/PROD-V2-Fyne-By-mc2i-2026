import { useCallback } from 'react';

interface KpiUpdate {
  scoreIncrement?: number;
  exerciceCompleted?: boolean;
  reussite?: boolean;
}

const NIVEAU_THRESHOLDS = [
  { niveau: 'Novice', min: 0 },
  { niveau: 'Padawan', min: 100 },
  { niveau: 'Chevalier', min: 300 },
  { niveau: 'Maître', min: 600 },
  { niveau: 'Grand Maître', min: 1000 },
];

function computeNiveau(score: number): string {
  let niveau = 'Novice';
  for (const t of NIVEAU_THRESHOLDS) {
    if (score >= t.min) niveau = t.niveau;
  }
  return niveau;
}

function computeBadges(score: number): number {
  return NIVEAU_THRESHOLDS.filter(t => score >= t.min).length - 1;
}

export function useKpi() {
  const updateKpi = useCallback(async ({ scoreIncrement = 0, exerciceCompleted = false, reussite }: KpiUpdate) => {
    try {
      // Récupère l'état actuel
      const checkRes = await fetch('/api/auth/check', { credentials: 'include' });
      const checkData = await checkRes.json();
      if (!checkData.authenticated) return;

      const user = checkData.user;
      const newScore = (user.score ?? 0) + scoreIncrement;
      const newExercices = (user.exercicesRealises ?? 0) + (exerciceCompleted ? 1 : 0);

      // Calcul du taux de réussite glissant
      let newTaux = user.tauxReussite ?? 0;
      if (exerciceCompleted && reussite !== undefined) {
        const totalEx = newExercices;
        const previousReussites = Math.round(((user.tauxReussite ?? 0) / 100) * (user.exercicesRealises ?? 0));
        const newReussites = previousReussites + (reussite ? 1 : 0);
        newTaux = totalEx > 0 ? Math.round((newReussites / totalEx) * 100) : 0;
      }

      const newNiveau = computeNiveau(newScore);
      const newBadges = computeBadges(newScore);

      await fetch('/api/companies/kpi/me', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: newScore,
          exercicesRealises: newExercices,
          tauxReussite: newTaux,
          niveau: newNiveau,
          badges: newBadges,
        }),
      });
    } catch {
      // Silencieux — le KPI est best-effort
    }
  }, []);

  return { updateKpi };
}
