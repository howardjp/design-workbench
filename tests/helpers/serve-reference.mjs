import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
for(const [family,port] of [['martlet',4189],['krigsvold',4190]]) {
const root=resolve('docs-dist',family);
createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 const pathname=decodeURIComponent(url.pathname).replace(new RegExp('^/'+family+'/'),'/');
 const path=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
 if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}
 res.setHeader('Content-Type',types[extname(path)]??'application/octet-stream');res.end(await readFile(path));
}catch{res.writeHead(404).end();}}).listen(port,'127.0.0.1',()=>console.log(`Reference tests at http://127.0.0.1:${port}`));
}
