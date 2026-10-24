import {readFile, writeFile} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
const refresh=process.argv[2] !== '--check';
for(const family of ['martlet','krigsvold']) {
  const dir=`docs/languages/${family}`, skill=`skills/${family}-builder/references`;
  if(refresh && process.argv[2] !== family) continue;
  if(refresh) {
    const core=resolve(process.argv[3]??''), commit=process.argv[4];
    if(!/^[a-f0-9]{40}$/.test(commit??'')) throw new Error('Usage: sync-language.mjs FAMILY CORE_CHECKOUT FULL_COMMIT, or --check');
    const snapshot={repository:`${family}theme/npm`,commit,files:{}};
    for(const [source,target] of [['docs/grammar.md','grammar.md'],['docs/source-decisions.md','decisions.md'],['language.json','implementation.json']]) {
      const content=await readFile(join(core,source),'utf8');
      await writeFile(join(dir,target),content);
      snapshot.files[target]={sourcePath:source,sha256:hash(content)};
    }
    await writeFile(join(dir,'canonical.json'),JSON.stringify(snapshot,null,2)+'\n');
    for(const name of ['grammar.md','decisions.md','implementation.json']) await writeFile(join(skill,name),await readFile(join(dir,name),'utf8'));
    await writeFile(join(skill,'source.md'),`# Source and framework support\n\nCanonical guidance: https://github.com/${snapshot.repository}/tree/${commit}. The bundled grammar and source decisions are exact copies of that revision; implementation.json records framework availability. Grammar 0.2 remains experimental.\n\nCore 2.2.0 and Astro 1.2.0 are unreleased consolidation candidates. Do not request their new exports from the published 2.1.0 core or 1.1.0 Astro packages. React 0.1.0 remains unpublished and uses theme 2.1.0; copied examples are React examples. Read the canonical docs/consolidation.md for the paired Astro candidate APIs. Shared grammar does not imply shared props or event/focus APIs.\n\nThis ${family} MCP snapshot is local stdio only. Retrieve grammar, decisions, compatibility and actual component references; check manifest family, sourceCommit and sourceDigest. No hosted endpoint or installed personal skill is implied by the downloadable bundle. Manual accessibility, localization/RTL and sustained use remain open.\n`);
  }
  const snapshot=JSON.parse(await readFile(join(dir,'canonical.json'),'utf8'));
  if(snapshot.repository!==`${family}theme/npm` || !/^[a-f0-9]{40}$/.test(snapshot.commit))throw new Error('Invalid canonical source for '+family);
  for(const [name,file] of Object.entries(snapshot.files)) {
    const content=await readFile(join(dir,name),'utf8');
    if(hash(content)!==file.sha256)throw new Error('Canonical guidance drift: '+family+'/'+name);
    if(content!==await readFile(join(skill,name),'utf8'))throw new Error('Offline skill drift: '+family+'/'+name);
  }
  console.log(`Verified ${family} canonical guidance at ${snapshot.commit}`);
}
