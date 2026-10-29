import {build,createServer} from 'vite';
import {renderToString} from 'react-dom/server';
import React from 'react';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import catalog from '../page-archetypes/content/catalog.json' with {type:'json'};
import selected from './src/selected.json' with {type:'json'};
import {renderMarkdown} from '../astro-slice/src/markdown.mjs';
const family=process.env.NIGHTJAR_FAMILY, base=process.env.NIGHTJAR_BASE || '/';
if(!['martlet','krigsvold'].includes(family)||!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base))throw Error('Provide a family and an absolute directory base');
const root=resolve('examples/react-catalog'),configFile=resolve(root,'vite.config.mjs');
// Only checked-in, schema-validated author content is compiled here. Raw HTML is
// disabled, including for any future untrusted input; no general HTML ingestion.
const rendered={};
for(const page of catalog.pages.filter(item=>selected.includes(item.id))) for(const section of page.sections) if(section.body) rendered[`${page.id}-${section.id}`]=renderMarkdown(section.body,base,{docId:`${page.id}-${section.id}`});
await writeFile(resolve(root,'src/rendered.json'),JSON.stringify(rendered));
await build({configFile,mode:family});
const server=await createServer({configFile,mode:family,server:{middlewareMode:true},appType:'custom'});
try {
 const {App}=await server.ssrLoadModule('/src/app.tsx');
 const {pages,validatePages}=await server.ssrLoadModule('/src/pages.ts');
 validatePages();
 const out=resolve(root,'dist',family),template=await readFile(resolve(out,'index.html'),'utf8');
 const images=resolve(out,'assets/examples');await mkdir(images,{recursive:true});
 for(const file of ['station.svg','coast.svg','notebook.svg']) await copyFile(resolve('examples/page-archetypes/jekyll/assets/examples',file),resolve(images,file));
 for(const page of pages){
  const dir=resolve(out,'examples',page.id);await mkdir(dir,{recursive:true});
  const markup=renderToString(React.createElement(App,{id:page.id}));
  await writeFile(resolve(dir,'index.html'),template.replace('<!--app-->',markup).replace('<title>Northlight examples</title>',`<title>${page.title.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))} · Northlight</title>`));
 }
 // The generic entry cannot render an unknown route; publish only actual records.
 await (await import('node:fs/promises')).rm(resolve(out,'index.html'));
 console.log(`${family}: prerendered ${pages.length} catalog routes at ${base}`);
} finally {await server.close();}
