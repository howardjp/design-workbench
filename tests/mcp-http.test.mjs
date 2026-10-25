import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Client, StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {createLanguageHttp} from '../mcp/http.mjs';
for(const family of ['martlet','krigsvold']) for(const mode of ['legacy',{pin:'2026-07-28'}]) {
  test(`${family}: HTTP ${typeof mode==='string'?mode:mode.pin} retrieves the same isolated canonical knowledge`, async()=>{
    const catalog=JSON.parse(await readFile(`mcp/catalogs/${family}.json`,'utf8'));
    const handler=createLanguageHttp(catalog);
    const client=new Client({name:'independent-http-consumer',version:'1.0.0'},{mode});
    const transport=new StreamableHTTPClientTransport(new URL('https://language.test/mcp'),{fetch:async(input,init)=>handler.fetch(new Request(input,init))});
    try {
      await client.connect(transport);
      const tools=(await client.listTools()).tools;
      assert.equal(tools.length,3);assert.ok(tools.every(t=>t.annotations.readOnlyHint));
      const call=async(name,args={})=>{const raw=await client.callTool({name,arguments:args});return {raw,value:JSON.parse(raw.content[0].text)};};
      const manifest=(await call('get_manifest')).value;
      assert.equal(manifest.family,family);assert.equal(manifest.references.length,57);
      const found=(await call('search_guidance',{query:'validation form retained work'})).value;
      assert.ok(found.results.some(r=>r.id==='pattern:validated-form'));
      const reference=(await call('get_reference',{id:'pattern:validated-form'})).value;
      assert.equal(reference.family,family);
      assert.equal(createHash('sha256').update(reference.content).digest('hex'),reference.contentSha256);
      assert.equal((await call('get_reference',{id:'grammar',version:'nonexistent'})).raw.isError,true);
      assert.equal((await call('get_reference',{id:'../registry.sqlite'})).raw.isError,true);
      assert.equal((await client.callTool({name:'search_guidance',arguments:{query:'x',limit:99}})).isError,true);
      const resources=await client.listResources();assert.equal(resources.resources.length,57);
      assert.ok(resources.resources.every(r=>r.uri.startsWith(family+'://')));
    } finally {await client.close();await handler.close();}
  });
}
test('HTTP rejects unrelated browser origins and oversized bodies before tool execution',async()=>{
  const catalog=JSON.parse(await readFile('mcp/catalogs/martlet.json','utf8'));
  const handler=createLanguageHttp(catalog);
  try {
    assert.equal((await handler.fetch(new Request('https://language.test/mcp',{method:'POST',headers:{Origin:'https://unrelated.test'},body:'{}'}))).status,403);
    assert.equal((await handler.fetch(new Request('https://language.test/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:'x'.repeat(32769)}))).status,413);
    assert.equal((await handler.fetch(new Request('https://language.test/mcp',{method:'OPTIONS',headers:{Origin:'https://claude.ai'}}))).status,204);
  } finally {await handler.close();}
});
