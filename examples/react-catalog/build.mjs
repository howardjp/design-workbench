import {build,createServer} from 'vite';
import {renderToString} from 'react-dom/server';
import React from 'react';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const family=process.env.NIGHTJAR_FAMILY, base=process.env.NIGHTJAR_BASE || '/';
if(!['martlet','krigsvold'].includes(family)||!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base))throw Error('Provide a family and an absolute directory base');
const root=resolve('examples/react-catalog'),configFile=resolve(root,'vite.config.mjs');
await build({configFile,mode:family});
const server=await createServer({configFile,mode:family,server:{middlewareMode:true},appType:'custom'});
try {
 const {App}=await server.ssrLoadModule('/src/app.tsx');
 const {pages,validatePages}=await server.ssrLoadModule('/src/pages.ts');
 validatePages();
 const out=resolve(root,'dist',family),template=await readFile(resolve(out,'index.html'),'utf8');
 for(const page of pages){
  const dir=resolve(out,'examples',page.id);await mkdir(dir,{recursive:true});
  const markup=renderToString(React.createElement(App,{id:page.id}));
  await writeFile(resolve(dir,'index.html'),template.replace('<!--app-->',markup).replace('<title>Northlight examples</title>',`<title>${page.title.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))} · Northlight</title>`));
 }
 // The generic entry cannot render an unknown route; publish only actual records.
 await (await import('node:fs/promises')).rm(resolve(out,'index.html'));
 console.log(`${family}: prerendered ${pages.length} catalog routes at ${base}`);
} finally {await server.close();}
