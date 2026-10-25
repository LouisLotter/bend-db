import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {KV,parseKey,entries,logicalView,trace,describe,example} from '../dist/lab.mjs';
import {validateNotebook,toMarkdown} from '../dist/notebook.mjs';
test('Bend browser module preserves overwritten, deleted, empty and Unicode values',()=>{
  const old=example(); let db=KV.delete(old,7);
  assert.deepEqual(KV.get(db,7),{$:'None'});
  assert.deepEqual(KV.get(old,7),{$:'Some',value:'plum'});
  assert.deepEqual(logicalView(db),[{key:9,value:'pear'}]);
  assert.equal(trace(db,7).comparisons,1);
  db=KV.put(db,7,'');assert.equal(describe(KV.get(db,7)),'Some{""}');
  db=KV.put(db,300,'🌱 <script> & "text"');assert.equal(KV.get(db,300).value,'🌱 <script> & "text"');
});
test('representation display agrees with real Bend results across mixed operations',()=>{
  let db=KV.empty();const expected=new Map();let count=0;
  for(let i=0;i<100;i++){
    const key=(i*7)%13;
    if(i%4===0){db=KV.delete(db,key);expected.delete(key);}else{db=KV.put(db,key,String(i));expected.set(key,String(i));}
    count++;assert.equal(entries(db).length,count);
    assert.deepEqual(logicalView(db),[...expected.entries()].sort((a,b)=>a[0]-b[0]).map(([key,value])=>({key,value})));
    for(let k=0;k<14;k++){const t=trace(db,k);assert.deepEqual(t.result,expected.has(k)?{$:'Some',value:expected.get(k)}:{$:'None'});assert.equal(t.comparisons,t.index<0?count:t.index+1);}
  }
});
test('key input rejects invalid and out-of-range values before entering Bend',()=>{
  for(const x of ['','-1','1.5','NaN','Infinity','1e3','1000001','<script>'])assert.throws(()=>parseKey(x));
  assert.equal(parseKey('0'),0);assert.equal(parseKey('1000000'),1000000);assert.equal(parseKey(' 007 '),7);
});
test('notebook backups round-trip and reject malformed records',()=>{
  const note={id:'test',kind:'Question',title:'Why a tombstone?',body:'What happens to the old value?',date:'2026-10-25T12:00:00Z'};
  const book={version:1,entries:[note]};assert.deepEqual(validateNotebook(JSON.parse(JSON.stringify(book))),book);
  assert.match(toMarkdown(book),/Why a tombstone/);
  for(const bad of [{},{version:2,entries:[]},{version:1,entries:[{...note,body:null}]},{version:1,entries:[note,note]},{version:1,entries:[{...note,date:'bad'}]}])assert.throws(()=>validateNotebook(bad));
});
test('generated learning content includes all decisions, proofs and safe Markdown',async()=>{
  const content=JSON.parse(await readFile(new URL('../dist/content.json',import.meta.url),'utf8'));
  assert.equal(content.decisions.length,9);assert.equal(new Set(content.decisions.map(d=>d.id)).size,9);
  assert.match(content.lesson,/Maybe&lt;&amp;2, String&gt;/);assert.match(content.lesson,/href="#journal"/);
  assert.match(content.journal,/Other-key|other-key/);assert.match(content.proof,/def Laws.read_after_put/);
  assert.doesNotMatch(content.lesson,/<script|href="javascript:|\/home\/decay/);
});
