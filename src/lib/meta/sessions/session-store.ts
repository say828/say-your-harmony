/**
 * Session Storage - Recent 10 sessions (FIFO)
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { SessionSummary } from '../core/schema.js';

const SESSIONS_DIR = path.join(os.homedir(), '.claude', 'meta', 'sessions');
const MAX_SESSIONS = 10;

/**
 * Save session summary
 *
 * @param session - Session summary
 */
export async function saveSession(session: SessionSummary): Promise<void> {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });

  const filePath = path.join(SESSIONS_DIR, `${session.sessionId}.json`);
  await fs.writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');

  // Cleanup old sessions
  await cleanupOldSessions();
}

/**
 * Load session summary
 *
 * @param sessionId - Session ID
 * @returns Session summary or null
 */
export async function loadSession(sessionId: string): Promise<SessionSummary | null> {
  const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as SessionSummary;
  } catch {
    return null;
  }
}

/**
 * List all sessions (sorted by start time, newest first)
 *
 * @returns Session summaries
 */
export async function listSessions(): Promise<SessionSummary[]> {
  try {
    const files = await fs.readdir(SESSIONS_DIR);
    const sessions: SessionSummary[] = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(SESSIONS_DIR, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const session = JSON.parse(content) as SessionSummary;
        sessions.push(session);
      } catch {
        // Skip invalid files
      }
    }

    return sessions.sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Cleanup old sessions (keep only 10 most recent)
 */
async function cleanupOldSessions(): Promise<void> {
  const sessions = await listSessions();

  if (sessions.length <= MAX_SESSIONS) return;

  // Delete oldest sessions
  const toDelete = sessions.slice(MAX_SESSIONS);
  for (const session of toDelete) {
    const filePath = path.join(SESSIONS_DIR, `${session.sessionId}.json`);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore errors
    }
  }
}
