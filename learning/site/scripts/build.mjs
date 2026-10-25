import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(site, '../..');
const dist = path.join(site, 'dist');
const compiler = process.env.BEND || 'bend';
const result = spawnSync(compiler, [path.join(root,'db/store.bend'), '-o', path.join(site,'store-build.mjs')], {encoding:'utf8', env:{...process.env,BEND_NO_TELEMETRY:'1'}});
if (result.error || result.status !== 0) {console.error(result.error?.message || result.stderr || result.stdout);process.exit(1);}
await mkdir(dist,{recursive:true});
for(const name of await readdir(path.join(site,'src'))) await copyFile(path.join(site,'src',name),path.join(dist,name));
await copyFile(path.join(site,'store-build.mjs'),path.join(dist,'store.mjs'));
await rm(path.join(site,'store-build.mjs'));
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function linkTarget(target, documentPath) {
  if (target === '../JOURNAL.md') return '#journal';
  if (/^https:\/\//.test(target)) return target;
  if (/^[a-z]+:/i.test(target) || target.startsWith('//')) throw new Error('Unsupported Markdown URL: '+target);
  const file = path.posix.normalize(path.posix.join(path.posix.dirname(documentPath),target));
  if(file.startsWith('../')) throw new Error('Markdown link escapes the repository');
  return 'https://github.com/LouisLotter/bend-db/blob/main/'+file;
}
function inline(text, documentPath) {
  const tokens=[];
  const token=html=>{const index=tokens.push(html)-1;return `\u0000${index}\u0000`;};
  text=text.replace(/`([^`]+)`/g,(_,code)=>token(`<code>${escape(code)}</code>`));
  text=text.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g,(_,label,target)=>token(`<a href="${escape(linkTarget(target,documentPath))}">${escape(label)}</a>`));
  return escape(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\u0000(\d+)\u0000/g,(_,index)=>tokens[Number(index)]);
}
// Deliberately small renderer for our tracked Markdown subset. Raw HTML is escaped.
export function markdown(source, documentPath) {
  const lines=source.replace(/^# .*\n/,'').split('\n');let i=0;const out=[];
  const tableCells=line=>line.trim().replace(/^\||\|$/g,'').split('|').map(v=>v.trim());
  while(i<lines.length) {
    const line=lines[i];
    if(!line.trim()){i++;continue;}
    if(line.startsWith('```')) {const code=[];i++;while(i<lines.length&&!lines[i].startsWith('```'))code.push(lines[i++]);if(i>=lines.length)throw new Error('Unclosed Markdown fence');i++;out.push('<pre><code>'+escape(code.join('\n'))+'</code></pre>');continue;}
    const heading=line.match(/^(#{1,4}) (.*)$/);if(heading){const level=Math.max(2,heading[1].length);out.push(`<h${level}>${inline(heading[2],documentPath)}</h${level}>`);i++;continue;}
    if(line.startsWith('|') && /^\|[\s:|-]+\|$/.test(lines[i+1]||'')) {const header=tableCells(line);i+=2;let rows='';while(i<lines.length&&lines[i].startsWith('|'))rows+='<tr>'+tableCells(lines[i++]).map(c=>'<td>'+inline(c,documentPath)+'</td>').join('')+'</tr>';out.push('<table><thead><tr>'+header.map(c=>'<th scope="col">'+inline(c,documentPath)+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table>');continue;}
    const item=line.match(/^(- |\d+\. )(.*)$/);if(item){const ordered=/^\d/.test(item[1]);const tag=ordered?'ol':'ul';const rows=[];while(i<lines.length){const match=lines[i].match(ordered?/^\d+\. (.*)$/:/^- (.*)$/);if(!match)break;let text=match[1];i++;while(i<lines.length&&/^  \S/.test(lines[i]))text+=' '+lines[i++].trim();rows.push('<li>'+inline(text,documentPath)+'</li>');}out.push(`<${tag}>`+rows.join('')+`</${tag}>`);continue;}
    const paragraph=[line];i++;while(i<lines.length&&lines[i].trim()&&!/^(#|```|\||- |\d+\. )/.test(lines[i]))paragraph.push(lines[i++]);out.push('<p>'+inline(paragraph.join(' '),documentPath)+'</p>');
  }
  return out.join('\n');
}
const read = name => readFile(path.join(root,name),'utf8');
const [lesson,journal,proof,decisions] = await Promise.all([read('learning/lessons/01-memory-store.md'),read('learning/JOURNAL.md'),read('db/PROOF.bend'),read('learning/decisions.json')]);
await writeFile(path.join(dist,'content.json'),JSON.stringify({lesson:markdown(lesson,'learning/lessons/01-memory-store.md'),journal:markdown(journal,'learning/JOURNAL.md'),proof,decisions:JSON.parse(decisions)},null,2));
console.log('Built learning/site/dist from the learning record and db/store.bend.');
