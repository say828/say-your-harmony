import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Note, CreateNoteInput, createNoteSchema } from './schemas.js';

const app = express();
app.use(express.json());

// In-memory storage
const notes = new Map<string, Note>();

// GET /api/notes - List all notes
app.get('/api/notes', (_req: Request, res: Response) => {
  const allNotes = Array.from(notes.values());
  res.json(allNotes);
});

// POST /api/notes - Create note
app.post('/api/notes', (req: Request, res: Response) => {
  try {
    const input: CreateNoteInput = createNoteSchema.parse(req.body);

    const note: Note = {
      id: randomUUID(),
      title: input.title,
      content: input.content,
      createdAt: new Date(),
    };

    notes.set(note.id, note);
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: 'Invalid input', details: error });
  }
});

// GET /api/notes/:id - Get single note
app.get('/api/notes/:id', (req: Request, res: Response) => {
  const note = notes.get(req.params.id);

  if (!note) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  res.json(note);
});

// DELETE /api/notes/:id - Delete note
app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const existed = notes.delete(req.params.id);

  if (!existed) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }

  res.status(204).send();
});

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Note API running on http://localhost:${PORT}`);
  });
}

export { app, notes };
