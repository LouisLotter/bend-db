// Build first. Produce a new isolated checkout for the Sites source helper.
// No Git metadata, credentials, installed tools, or browser notes are copied.
import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(site,'../..');
const destination=process.argv[2];
if(!destination || !path.isAbsolute(destination) || destination===root || destination.startsWith(root+path.sep)) throw new Error('Choose a new absolute directory outside the canonical repository.');
const manifest=JSON.parse(await readFile(path.join(site,'.openai/hosting.json'),'utf8'));
await readFile(path.join(site,'dist/index.html'),'utf8');
await mkdir(destination,{recursive:false});
await mkdir(path.join(destination,'source'));
for(const name of ['README.md','AGENTS.md','Makefile','.gitignore','db','learning']) {
  await cp(path.join(root,name),path.join(destination,'source',name),{recursive:true,filter: file=>!['.git','build','dist','node_modules','.env','store-build.mjs'].includes(path.basename(file))});
}
await cp(path.join(site,'dist'),path.join(destination,'dist'),{recursive:true});
await mkdir(path.join(destination,'.openai'));
await writeFile(path.join(destination,'.openai/hosting.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(destination,'README.md'),'# Bend DB learning site export\n\nCanonical source: https://github.com/LouisLotter/bend-db\n\n`dist/` is the verified static output. `source/` contains the inputs and build\nscripts. To reproduce: run `make site` in `source/`, then replace `dist/` with\n`source/learning/site/dist/`. Use the Sites source helper only in this isolated\nexport. Never replace the canonical GitHub repository remote.\n');
console.log('Created isolated hosting export at '+destination);
