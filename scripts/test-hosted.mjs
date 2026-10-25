import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
for(const family of ['martlet','krigsvold']) {
 const {default:worker}=await import(pathToFileURL(resolve(`mcp-dist/${family}/index.js`)));
 const health=await (await worker.fetch(new Request('https://language.test/health'))).json();
 assert.equal(health.family,family);assert.equal(health.readOnly,true);
 assert.equal(await (await worker.fetch(new Request('https://language.test/design-language/'),{ASSETS:{fetch:()=>new Response('existing site')}})).text(),'existing site');
 for(const mode of ['legacy',{pin:'2026-07-28'}]) {
  const client=new Client({name:'compiled-worker-consumer',version:'1.0.0'},{mode});
  try {
   await client.connect(new StreamableHTTPClientTransport(new URL('https://language.test/mcp'),{fetch:(input,init)=>worker.fetch(new Request(input,init))}));
   const r=await client.callTool({name:'get_manifest',arguments:{}}),manifest=JSON.parse(r.content[0].text);
   assert.equal(manifest.family,family);assert.equal(manifest.references.length,57);
   assert.ok(manifest.references.some(r=>r.id==='builder-skill'));
   const skill=await client.callTool({name:'get_reference',arguments:{id:'builder-skill'}});
   assert.ok(JSON.parse(skill.content[0].text).content.includes(`name: ${family}-builder`));
  } finally {await client.close();}
 }
 console.log(`${family}: compiled Worker serves both MCP eras and preserves static asset fallback`);
}
