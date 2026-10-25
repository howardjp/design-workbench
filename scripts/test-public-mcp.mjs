import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createHash} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
const observations=[];
for(const family of ['martlet','krigsvold']) {
 const origin=`https://${family}theme.dev`;
 const healthResponse=await fetch(origin+'/health',{signal:AbortSignal.timeout(20000)});assert.equal(healthResponse.status,200);
 const health=await healthResponse.json();assert.equal(health.family,family);assert.equal(health.readOnly,true);
 for(const mode of ['legacy',{pin:'2026-07-28'}]) {
  const client=new Client({name:'public-language-acceptance',version:'1.0.0'},{mode});
  try {
   await client.connect(new StreamableHTTPClientTransport(new URL(origin+'/mcp'),{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(20000)})}));
   const call=async(name,args={})=>{const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,JSON.stringify(r));return JSON.parse(r.content[0].text);};
   const manifest=await call('get_manifest');assert.equal(manifest.family,family);assert.equal(manifest.sourceCommit,health.sourceCommit);assert.equal(manifest.references.length,58);
   const tools=await client.listTools();assert.equal(tools.tools.length,3);assert.ok(tools.tools.every(t=>t.annotations.readOnlyHint));
   for(const id of ['grammar','builder-skill','platform:Astro']) {const ref=await call('get_reference',{id});assert.equal(createHash('sha256').update(ref.content).digest('hex'),ref.contentSha256);if(id==='platform:Astro')assert.ok(ref.content.includes('href'));}
   const resources=await client.listResources();assert.equal(resources.resources.length,58);
   observations.push({family,mode,sourceCommit:manifest.sourceCommit,sourceDigest:manifest.sourceDigest,references:manifest.references.length,distribution:manifest.distribution,passed:true});
  }finally{await client.close();}
 }
 console.log(family+': actual public MCP health, both protocol eras, tools/resources and full skill/Astro/hash retrieval pass');
}
await mkdir('test-results',{recursive:true});await writeFile('test-results/public-mcp.json',JSON.stringify({checkedAt:new Date().toISOString(),observations},null,2)+'\n');
