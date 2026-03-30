import { Router } from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const TIMEOUT_MS = 10000;

router.post('/execute', async (req, res) => {
  const { code, language } = req.body as {
    code: string;
    language: 'python' | 'javascript' | 'sql';
  };

  if (!code || !language) {
    return res.status(400).json({ error: 'Code et langage requis' });
  }
  if (code.length > 15000) {
    return res.status(400).json({ error: 'Code trop long (max 15 000 caractères)' });
  }

  const tmpDir = os.tmpdir();
  const fileId = uuidv4().replace(/-/g, '');
  const startTime = Date.now();

  let filePath: string;
  let command: string;

  if (language === 'python' || language === 'sql') {
    filePath = path.join(tmpDir, `fyne_${fileId}.py`);
    command = `python3 ${filePath}`;
  } else if (language === 'javascript') {
    filePath = path.join(tmpDir, `fyne_${fileId}.js`);
    command = `node ${filePath}`;
  } else {
    return res.status(400).json({ error: 'Langage non supporté' });
  }

  try {
    fs.writeFileSync(filePath, code, 'utf8');
  } catch (err: any) {
    return res.status(500).json({ error: 'Impossible d\'écrire le fichier temporaire' });
  }

  exec(command, { timeout: TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024 }, (error, stdout, stderr) => {
    try { fs.unlinkSync(filePath); } catch {}

    const executionTime = Date.now() - startTime;

    if (error?.killed) {
      return res.json({
        stdout: '',
        stderr: '⏱ Délai dépassé — ton code tourne depuis plus de 10 secondes. Vérifie les boucles infinies.',
        exitCode: 1,
        executionTime,
      });
    }

    return res.json({
      stdout: stdout,
      stderr: stderr,
      exitCode: error ? (error as any).code ?? 1 : 0,
      executionTime,
    });
  });
});

export default router;
