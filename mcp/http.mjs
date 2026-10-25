import { createMcpHandler } from '@modelcontextprotocol/server';
import { CfWorkerJsonSchemaValidator } from '@modelcontextprotocol/server/validators/cf-worker';
import { createLanguageServer } from './language.mjs';

// The same registration factory serves stdio and HTTP. No registry or user data.
export function createLanguageHttp(catalog) {
  const handler = createMcpHandler(() => createLanguageServer(catalog, {
    jsonSchemaValidator: new CfWorkerJsonSchemaValidator(),
  }), { legacy: 'stateless', responseMode: 'auto', maxRequestBodySize: 32768 });
  return {
    async fetch(request) {
      const origin = request.headers.get('origin');
      const languageOrigins=[catalog.distribution.mcp.url,...(catalog.distribution.mcp.aliases??[])].map(value=>new URL(value).origin);
      const allowed = [new URL(request.url).origin,...languageOrigins, 'https://chatgpt.com', 'https://claude.ai'];
      if (origin && !allowed.includes(origin)) return new Response('Origin not allowed', {status:403});
      if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:{
        'Access-Control-Allow-Origin': origin || new URL(request.url).origin,
        'Access-Control-Allow-Methods':'POST, GET, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id',
        'Vary':'Origin',
      }});
      const response = await handler.fetch(request);
      const headers = new Headers(response.headers);
      headers.set('Cache-Control','no-store');
      headers.set('X-Content-Type-Options','nosniff');
      if(origin) headers.set('Access-Control-Allow-Origin',origin);
      headers.set('Vary','Origin');
      return new Response(response.body,{status:response.status,headers});
    },
    close: handler.close,
  };
}
