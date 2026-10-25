import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {build} from 'vite';
for(const family of ['martlet','krigsvold']) {
 const temporary=await mkdtemp(join(tmpdir(),'language-worker-'));
 try {
  const catalog=JSON.parse(await readFile(`mcp/catalogs/${family}.json`,'utf8'));
  await writeFile(join(temporary,'entry.mjs'),`
import {createLanguageHttp} from ${JSON.stringify(resolve('mcp/http.mjs'))};
const catalog=${JSON.stringify(catalog)};
const mcp=createLanguageHttp(catalog);
export default {async fetch(request,env) {
 const url=new URL(request.url);
 if(url.pathname==='/mcp')return mcp.fetch(request);
 if(url.pathname==='/health')return Response.json({family:catalog.family,version:catalog.version,grammarVersion:catalog.grammarVersion,sourceCommit:catalog.sourceCommit,sourceDigest:catalog.sourceDigest,readOnly:true});
 const oldOrigins=(catalog.distribution.mcp.aliases??[]).map(value=>new URL(value).origin);
 if(oldOrigins.includes(url.origin))return Response.redirect(new URL(url.pathname+url.search,catalog.distribution.home),308);
 if(url.pathname==='/react')return Response.redirect(new URL('/react/'+url.search,url.origin),308);
 return env?.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});
}};
`);
  await mkdir(`mcp-dist/${family}`,{recursive:true});
  await build({configFile:false,publicDir:false,logLevel:'warn',resolve:{conditions:['workerd','browser','module']},ssr:{noExternal:true,target:'webworker',resolve:{conditions:['workerd','browser','module']}},build:{ssr:join(temporary,'entry.mjs'),target:'es2022',minify:true,outDir:resolve(`mcp-dist/${family}`),emptyOutDir:true,rollupOptions:{output:{entryFileNames:'index.js'}}}});
  console.log(`Built independent ${family} knowledge Worker`);
 }finally{await rm(temporary,{recursive:true,force:true});}
}
