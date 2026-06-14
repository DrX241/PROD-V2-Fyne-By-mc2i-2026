import PDFDocument from 'pdfkit';
import { db } from '../db';
import { users, userLearningProgress, investigationProgress } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Response } from 'express';

export async function generateUserReport(userId: number, res: Response): Promise<void> {
  const [userRow] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!userRow) throw new Error('Utilisateur non trouvé');

  const [learningRows, investigationRows] = await Promise.all([
    db.select().from(userLearningProgress).where(eq(userLearningProgress.userId, String(userId))),
    db.select().from(investigationProgress).where(eq(investigationProgress.userId, String(userId))),
  ]);

  const fullName = [userRow.firstName, userRow.lastName].filter(Boolean).join(' ') || userRow.username;
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="rapport-${userRow.username}-${now.getTime()}.pdf"`);
  res.setHeader('Cache-Control', 'no-store');
  doc.pipe(res);

  // ─── EN-TÊTE ─────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 90).fill('#006a9e');
  doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('FYNE', 50, 28);
  doc.fontSize(11).font('Helvetica').text('Rapport de progression utilisateur', 50, 56);
  doc.text(dateStr, doc.page.width - 160, 56, { width: 110, align: 'right' });

  doc.fillColor('#111827').fontSize(18).font('Helvetica-Bold').text(fullName, 50, 110);
  doc.fontSize(11).font('Helvetica').fillColor('#6b7280')
    .text(`@${userRow.username}`, 50, 132)
    .text(userRow.email || '', 50, 148);

  const badgeY = 110;
  const roleColor = userRow.role === 'admin' ? '#dd0061' : '#006a9e';
  const roleLabel = userRow.role === 'admin' ? 'Administrateur' : 'Utilisateur';
  doc.roundedRect(doc.page.width - 160, badgeY, 110, 22, 11).fill(roleColor + '20');
  doc.fillColor(roleColor).fontSize(10).font('Helvetica-Bold')
    .text(roleLabel, doc.page.width - 160, badgeY + 6, { width: 110, align: 'center' });

  doc.moveTo(50, 180).lineTo(doc.page.width - 50, 180).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // ─── INFOS COMPTE ────────────────────────────────────────────────────────
  let y = 200;
  doc.fillColor('#006a9e').fontSize(13).font('Helvetica-Bold').text('Informations du compte', 50, y);
  y += 22;

  const infoFields = [
    ['Statut', userRow.isActive ? 'Actif' : 'Inactif'],
    ['Membre depuis', userRow.createdAt ? new Date(userRow.createdAt).toLocaleDateString('fr-FR') : '—'],
    ['Dernière connexion', userRow.lastLogin ? new Date(userRow.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'],
    ['Email', userRow.email || '—'],
  ];
  for (const [label, value] of infoFields) {
    doc.fillColor('#6b7280').font('Helvetica').fontSize(10).text(label, 50, y, { width: 140 });
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text(value, 200, y);
    y += 18;
  }

  y += 15;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // ─── PROGRESSION APPRENTISSAGE ───────────────────────────────────────────
  y += 20;
  doc.fillColor('#006a9e').fontSize(13).font('Helvetica-Bold').text('Parcours d\'apprentissage', 50, y);
  y += 8;
  doc.fillColor('#6b7280').fontSize(10).font('Helvetica').text(`${learningRows.length} module${learningRows.length > 1 ? 's' : ''} suivi${learningRows.length > 1 ? 's' : ''}`, 50, y + 14);
  y += 32;

  if (learningRows.length === 0) {
    doc.fillColor('#9ca3af').fontSize(10).font('Helvetica').text('Aucun module suivi pour l\'instant.', 50, y);
    y += 25;
  } else {
    for (const row of learningRows) {
      if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
      doc.roundedRect(50, y, doc.page.width - 100, 46, 6).fill('#f9fafb');
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(row.moduleId, 65, y + 8, { width: 280 });
      doc.fillColor('#006a9e').font('Helvetica-Bold').fontSize(10).text(`Niveau ${row.level}`, 65, y + 24);
      doc.fillColor('#6b7280').font('Helvetica').fontSize(10).text(`${row.xp} XP`, 140, y + 24);
      doc.fillColor('#374151').font('Helvetica').fontSize(10).text(row.rank, 195, y + 24);
      const updated = new Date(row.lastUpdated).toLocaleDateString('fr-FR');
      doc.fillColor('#9ca3af').font('Helvetica').fontSize(9).text(updated, doc.page.width - 110, y + 28, { width: 60, align: 'right' });
      y += 56;
    }
  }

  y += 5;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // ─── INVESTIGATIONS ──────────────────────────────────────────────────────
  y += 20;
  doc.fillColor('#006a9e').fontSize(13).font('Helvetica-Bold').text('Investigations & Challenges', 50, y);
  y += 8;
  doc.fillColor('#6b7280').fontSize(10).font('Helvetica').text(`${investigationRows.length} scénario${investigationRows.length > 1 ? 's' : ''} joué${investigationRows.length > 1 ? 's' : ''}`, 50, y + 14);
  y += 32;

  if (investigationRows.length === 0) {
    doc.fillColor('#9ca3af').fontSize(10).font('Helvetica').text('Aucune investigation pour l\'instant.', 50, y);
    y += 25;
  } else {
    for (const row of investigationRows.slice(0, 10)) {
      if (y > doc.page.height - 100) { doc.addPage(); y = 50; }
      doc.roundedRect(50, y, doc.page.width - 100, 46, 6).fill('#f9fafb');
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(row.gameId, 65, y + 8, { width: 260 });
      doc.fillColor('#dd0061').font('Helvetica-Bold').fontSize(10).text(`Score: ${row.bestScore}`, 65, y + 24);
      doc.fillColor('#6b7280').font('Helvetica').fontSize(10).text(`${row.attempts} tentative${row.attempts > 1 ? 's' : ''}`, 150, y + 24);
      doc.fillColor('#374151').font('Helvetica').fontSize(10).text(row.currentLevel, 240, y + 24);
      y += 56;
    }
  }

  // ─── PIED DE PAGE ─────────────────────────────────────────────────────────
  doc.moveTo(50, doc.page.height - 60).lineTo(doc.page.width - 50, doc.page.height - 60).strokeColor('#e5e7eb').lineWidth(1).stroke();
  doc.fillColor('#9ca3af').fontSize(9).font('Helvetica')
    .text('Généré par FYNE · Plateforme mc2i · ' + dateStr, 50, doc.page.height - 45, {
      width: doc.page.width - 100,
      align: 'center',
    });

  doc.end();
}
