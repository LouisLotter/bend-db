import KV from './store.mjs';
export { KV };
export const MAX_ENTRIES = 200;
export function parseKey(text) {
  if (!/^\d+$/.test(text.trim())) throw new Error('Use a whole-number key from 0 to 1,000,000.');
  const key = Number(text);
  if (!Number.isSafeInteger(key) || key > 1_000_000) throw new Error('Explorer keys range from 0 to 1,000,000.');
  return key;
}
export function entries(db) {
  const result = [];
  for (let node = db; node.$ === 'Entry'; node = node.rest) result.push(node);
  return result;
}
export function logicalView(db) {
  const seen = new Set(), result = [];
  for (const node of entries(db)) {
    if (seen.has(node.key)) continue;
    seen.add(node.key);
    if (node.value.$ === 'Some') result.push({key: node.key, value: node.value.value});
  }
  return result.sort((a, b) => a.key - b.key);
}
// This is a visual explanation of the representation, not instrumentation of Bend.
export function trace(db, key) {
  const rows = entries(db);
  const index = rows.findIndex(node => node.key === key);
  return { rows, index, comparisons: index < 0 ? rows.length : index + 1, result: KV.get(db, key) };
}
export function describe(value) {
  return value.$ === 'Some' ? `Some{${JSON.stringify(value.value)}}` : 'None{} · missing';
}
export function example() {
  return KV.put(KV.put(KV.put(KV.empty(), 7, 'apple'), 9, 'pear'), 7, 'plum');
}
