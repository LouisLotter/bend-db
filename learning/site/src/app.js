import { KV, MAX_ENTRIES, parseKey, entries, logicalView, trace, describe, example } from './lab.mjs';
import { STORAGE_KEY, KINDS, validateNotebook, toMarkdown } from './notebook.mjs';
const $ = id => document.getElementById(id);
const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
};
const routeTitles = {overview:'Starting point', lesson:'First lesson', lab:'Store explorer', proofs:'Proof walkthrough', decisions:'Design decisions', notebook:'Your notebook', journal:'Project journal'};
function route() {
  const id = location.hash.slice(1) in routeTitles ? location.hash.slice(1) : 'overview';
  document.querySelectorAll('.page').forEach(page => page.hidden = page.id !== id);
  document.querySelectorAll('nav a').forEach(a => { if (a.hash === '#'+id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  $('breadcrumb').textContent = routeTitles[id];
  document.title = `${routeTitles[id]} — Bend DB`;
}
route();
addEventListener('hashchange', () => {route(); window.scrollTo(0,0); $('main').focus({preventScroll:true});});

// Read results come from Bend's generated module. UI code only explains the state.
let db = example(), pinned = null, lookupKey = 7;
function renderStore(message = '') {
  const result = trace(db, lookupKey), visible = logicalView(db);
  $('operation-result').classList.remove('error');
  $('operation-result').textContent = `${message ? message + ' → ' : ''}get(${lookupKey}) = ${describe(result.result)} · ${result.comparisons} key comparison${result.comparisons === 1 ? '' : 's'}`;
  $('counts').textContent = `${visible.length} visible key${visible.length === 1 ? '' : 's'} / ${result.rows.length} history entr${result.rows.length === 1 ? 'y' : 'ies'}`;
  $('physical-history').replaceChildren();
  result.rows.forEach((node, i) => {
    const match = i === result.index, visited = result.index < 0 || i <= result.index;
    const row = el('div', undefined, `history-row ${match ? 'match' : visited ? 'visited' : 'unvisited'} ${node.value.$ === 'None' ? 'tombstone' : ''}`);
    row.append(el('span',String(i+1).padStart(2,'0'),'ordinal'),el('strong',String(node.key)),el('span',node.value.$ === 'None' ? 'None{}' : JSON.stringify(node.value.value),'entry-value'));
    row.append(el('span',match ? (node.value.$ === 'None' ? 'MATCH · tombstone: stop, return missing' : 'MATCH · stop, return this value') : visited ? 'different key · continue' : 'not visited by this lookup','entry-detail'));
    $('physical-history').append(row);
  });
  $('physical-history').append(el('div', result.index < 0 ? 'End{} · no match, return missing' : 'End{}','end'));
  $('logical-view').replaceChildren();
  for (const item of visible) {const row = el('div',undefined,'logical-row'); row.append(el('strong',String(item.key)),el('span',JSON.stringify(item.value))); $('logical-view').append(row);}
  if (!visible.length) $('logical-view').append(el('p','No visible keys. A history containing only tombstones can still have entries.','empty-message'));
  $('snapshot-result').textContent = pinned ? `Pinned state (${entries(pinned).length} entries): get(${lookupKey}) = ${describe(KV.get(pinned,lookupKey))}. Updates affect the current state shown above.` : 'Pin a state, then write or delete a key. Compare the old result with the current one.';
}
function operate(kind) {
  try {
    const key = parseKey($('key').value);
    if (kind !== 'get' && entries(db).length >= MAX_ENTRIES) throw new Error('The explorer has 200 entries. Start empty or reload the example to keep the history readable.');
    const value = $('value').value;
    if (kind === 'put' && value.length > 500) throw new Error('Explorer values are limited to 500 characters.');
    if (kind === 'put') db = KV.put(db,key,value);
    if (kind === 'delete') db = KV.delete(db,key);
    lookupKey = key;
    renderStore(kind === 'get' ? '' : `${kind}(${key}${kind === 'put' ? ', '+JSON.stringify(value) : ''})`);
  } catch (error) {$('operation-result').textContent = error.message; $('operation-result').classList.add('error');}
}
$('operation-form').addEventListener('submit', e => {e.preventDefault(); operate('put');});
$('get-button').addEventListener('click', () => operate('get'));
$('delete-button').addEventListener('click', () => operate('delete'));
$('pin-button').addEventListener('click', () => {pinned = db; renderStore('Current state pinned');});
$('sample-button').addEventListener('click', () => {db=example(); pinned=null; lookupKey=7; $('key').value='7'; renderStore('Example loaded');});
$('reset-button').addEventListener('click', () => {db=KV.empty(); pinned=null; renderStore('Started empty');});
renderStore();

const proofSteps = [
  ['THE GOAL','get(empty(), key) == None{}','The key is arbitrary. We must establish the equality without choosing a particular number.'],
  ['UNFOLD THE DEFINITION OF EMPTY','get(End{}, key) == None{}','empty() is defined as End{}, the empty history. Replace the function call with its definition.'],
  ['EVALUATE THE EMPTY BRANCH OF GET','None{} == None{}','get matches its first argument. For End{}, it returns None{}. This branch does not depend on the key.'],
  ['CLOSE WITH REFLEXIVITY','def Laws.empty_is_missing(key):\n  {==}','Both sides compute to the same expression. {==} supplies evidence that an expression equals itself. The checker verifies this; it is not an unchecked assertion.']
];
function showProof(index) {const [label,expression,explanation] = proofSteps[index]; $('proof-step-label').textContent=label; $('proof-expression').textContent=expression; $('proof-explanation').textContent=explanation; document.querySelectorAll('[data-proof-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.proofStep) === index)));}
document.querySelectorAll('[data-proof-step]').forEach(b=>b.addEventListener('click',()=>showProof(Number(b.dataset.proofStep)))); showProof(0);

let decisions=[];
function renderDecisions() {
  const query=$('decision-filter').value.trim().toLowerCase();
  const matches=decisions.filter(d=>Object.values(d).join(' ').toLowerCase().includes(query));
  $('decision-count').textContent=`${matches.length} of ${decisions.length} decisions`;
  $('decisions-list').replaceChildren();
  for (const d of matches) {
    const item=el('article',undefined,'decision'), content=el('div');
    item.append(el('span',`D${d.id}`,'decision-id'),content);
    content.append(el('h2',d.title),el('div',`${d.status} · ${d.date}`,'decision-status'));
    const grid=el('div',undefined,'decision-grid');
    for (const [label,key] of [['Context','context'],['Choice','choice'],['Alternatives considered','alternatives'],['Consequences','consequences']]) {const block=el('div');block.append(el('h3',label),el('p',d[key]));grid.append(block);}
    content.append(grid,el('p',`Think it through: ${d.question}`,'decision-question')); $('decisions-list').append(item);
  }
  if (!matches.length) $('decisions-list').append(el('p','No decisions match. Try a different word.','empty-message'));
}
$('decision-filter').addEventListener('input',renderDecisions);
try {
  const response=await fetch('./content.json');
  if(!response.ok) throw new Error(`Content request returned ${response.status}`);
  const data=await response.json();
  // HTML is escaped and rendered from trusted repository Markdown at build time.
  $('lesson-content').innerHTML=data.lesson;
  $('journal-content').innerHTML=data.journal;
  $('proof-source').textContent=data.proof;
  decisions=data.decisions; renderDecisions();
} catch(error) {$('load-error').hidden=false; $('load-error').textContent=`The learning text could not load: ${error.message}. Try reloading, or read the source on GitHub.`;}

let notebook={version:1,entries:[]}, storageHealthy=true;
try {const saved=localStorage.getItem(STORAGE_KEY); if(saved) notebook=validateNotebook(JSON.parse(saved));} catch(error) {storageHealthy=false; $('note-status').textContent=`Stored notes could not be loaded: ${error.message}. New entries will stay in memory; export them before leaving.`;}
try {const draft=JSON.parse(localStorage.getItem(STORAGE_KEY+'.draft') || 'null'); if(draft && typeof draft.title==='string' && typeof draft.body==='string') {$('note-title').value=draft.title.slice(0,160); $('note-body').value=draft.body.slice(0,20000); $('note-kind').value=KINDS.includes(draft.kind)?draft.kind:'Reflection';}} catch { /* A missing or invalid draft must never overwrite saved entries. */ }
function saveNotebook(message) {
  try {if(!storageHealthy) throw new Error('Existing storage is unavailable'); localStorage.setItem(STORAGE_KEY,JSON.stringify(notebook)); $('note-status').textContent=message;}
  catch {$('note-status').textContent='Kept in this page’s memory only. Browser storage is unavailable; export your notes before leaving.';}
}
function renderNotes() {
  $('note-count').textContent=`(${notebook.entries.length})`; $('notes-list').replaceChildren();
  for (const note of [...notebook.entries].reverse()) {const item=el('article',undefined,'note'); item.append(el('div',`${note.kind} · ${new Date(note.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}`,'note-meta'),el('h3',note.title),el('p',note.body)); $('notes-list').append(item);}
  if(!notebook.entries.length) $('notes-list').append(el('p','Nothing recorded yet. A question is a good first entry.','empty-message'));
}
function noteHint() {$('note-hint').textContent=$('note-kind').value==='Design decision' ? 'Capture the context, alternatives, chosen approach, and consequences. This is a proposal until we review it.' : 'Being unsure is useful information. We won’t mark concepts understood for you.';}
$('note-form').addEventListener('input',()=>{noteHint(); try {localStorage.setItem(STORAGE_KEY+'.draft',JSON.stringify({kind:$('note-kind').value,title:$('note-title').value,body:$('note-body').value})); $('note-status').textContent='Draft saved in this browser.';} catch {$('note-status').textContent='Draft is in memory only; browser storage is unavailable.';}});
$('note-form').addEventListener('submit',e=>{e.preventDefault(); const title=$('note-title').value.trim(),body=$('note-body').value.trim(); if(!title || !body) {$('note-status').textContent='Add a title and a note before saving.'; return;} if(notebook.entries.length>=1000){$('note-status').textContent='This notebook has reached 1,000 entries. Export a backup before starting a new notebook.'; return;} notebook.entries.push({id:crypto.randomUUID(),kind:$('note-kind').value,title,body,date:new Date().toISOString()}); saveNotebook('Entry saved in this browser. Export to bring it into the repository.'); $('note-title').value='';$('note-body').value='';try{localStorage.removeItem(STORAGE_KEY+'.draft');}catch{} renderNotes();});
function download(name,text,type) {const url=URL.createObjectURL(new Blob([text],{type})); const a=el('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('export-notes').addEventListener('click',()=>download('bend-db-notebook.md',toMarkdown(notebook),'text/markdown'));
$('export-backup').addEventListener('click',()=>download('bend-db-notebook.json',JSON.stringify(notebook,null,2),'application/json'));
$('import-notes').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5_000_000)throw new Error('Choose a notebook smaller than 5 MB.');const imported=validateNotebook(JSON.parse(await file.text()));const existing=new Map(notebook.entries.map(n=>[n.id,n]));for(const n of imported.entries) {if(existing.has(n.id) && JSON.stringify(existing.get(n.id))!==JSON.stringify(n))throw new Error('An entry ID conflicts with an existing note. No notes were imported.');existing.set(n.id,n);}if(existing.size>1000)throw new Error('The merged notebook would exceed 1,000 entries.');notebook={version:1,entries:[...existing.values()]};saveNotebook('Backup merged. Existing entries have been preserved.');renderNotes();}catch(error){$('note-status').textContent=error.message;}finally{e.target.value='';}});
noteHint();renderNotes();
