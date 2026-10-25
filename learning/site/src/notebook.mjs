export const STORAGE_KEY = 'bend-db.notebook.v1';
export const KINDS = ['Reflection', 'Question', 'Design decision'];
export function validateNotebook(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.entries) || value.entries.length > 1000) throw new Error('Expected a Bend DB notebook export (version 1, at most 1,000 entries).');
  const ids = new Set();
  for (const note of value.entries) {
    if (!note || typeof note.id !== 'string' || !note.id || note.id.length > 100 || ids.has(note.id) || !KINDS.includes(note.kind) || typeof note.title !== 'string' || !note.title.trim() || note.title.length > 160 || typeof note.body !== 'string' || !note.body.trim() || note.body.length > 20000 || typeof note.date !== 'string' || !Number.isFinite(Date.parse(note.date))) throw new Error('The notebook has an invalid or duplicate entry. No notes were imported.');
    ids.add(note.id);
  }
  return {version: 1, entries: value.entries.map(({id, kind, title, body, date}) => ({id, kind, title, body, date}))};
}
export function toMarkdown(notebook) {
  return '# Bend DB — personal notebook\n\nExported browser notes. Review before adding to the shared learning journal.\n\n' + notebook.entries.map(n => `## ${n.title.replace(/\s+/g, ' ')}\n\n${n.kind} · ${n.date}\n\n${n.body}\n`).join('\n---\n\n');
}
