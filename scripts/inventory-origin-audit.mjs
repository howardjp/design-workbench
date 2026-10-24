// Source-level accounting, not automatic certification of design provenance.
// Usage: node scripts/inventory-origin-audit.mjs /absolute/path/to/audit-sources
// Cache: <root>/{martlet,krigsvold}/<original repository path>.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import postcss from 'postcss';
import { transformSync } from 'rolldown/utils';

const root = process.cwd();
const cache = process.argv[2];
if (!cache || !path.isAbsolute(cache)) throw new Error('Supply an absolute origin-source cache path.');
const out = path.join(root, 'docs/qa/origin-audit-2026-10-23');
await mkdir(out, { recursive: true });
const origins = {
  martlet: { repository: 'k3jph/k3jph.github.io', commit: '32b7166a629ea696147d0d779d911b713e4baf7e' },
  krigsvold: { repository: 'basuhoward/krigsvold.org', commit: 'a3cf072c516c59ed35814e0fa153028cc91ceecd' },
};
const sha = x => createHash('sha256').update(x).digest('hex');
const blob = x => createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${Buffer.byteLength(x)}\0`), Buffer.from(x)])).digest('hex');
const norm = x => x.replace(/\s+/g, ' ').trim();
const csv = rows => rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n') + '\n';
async function files(dir) {
  const result = [];
  for (const e of (await readdir(dir, { withFileTypes: true })).sort((a,b)=>a.name.localeCompare(b.name))) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) result.push(...await files(f)); else result.push(f);
  }
  return result;
}
const manifest = [];
const originalIdentities = JSON.parse(await readFile(path.join(cache,'origins.json'),'utf8'));
const sourceDeclarations = [];
const sourceSelectors = [];
for (const family of Object.keys(origins)) {
  const base = path.join(cache, family);
  for (const f of await files(base)) {
    const relative = path.relative(base, f).split(path.sep).join('/');
    const text = await readFile(f, 'utf8');
    const original = originalIdentities.find(e=>e.family===family && e.path===relative);
    if (!original || blob(text)!==original.gitBlobSha) throw new Error(`Source blob mismatch: ${family}/${relative}`);
    manifest.push({ family, ...origins[family], path: relative, gitBlobSha: original.gitBlobSha,
      url: `https://github.com/${origins[family].repository}/blob/${origins[family].commit}/${relative}`,
      cachedContentSha256: sha(text), cachedGitBlobSha: blob(text), bytes: Buffer.byteLength(text) });
    let blocks = [];
    if (f.endsWith('.css')) blocks = [{ text, line: 0 }];
    if (f.endsWith('.astro')) blocks = [...text.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)].map(m => ({ text: m[1], line: text.slice(0,m.index).split('\n').length-1 }));
    for (const b of blocks) {
      const ast = postcss.parse(b.text, { from: f });
      ast.walkRules(r => sourceSelectors.push({ family, file: relative, line: b.line + r.source.start.line, selector: r.selector }));
      ast.walkDecls(d => sourceDeclarations.push({ family, file: relative, line: b.line + d.source.start.line, selector: d.parent.selector || '', property: d.prop, value: d.value }));
    }
  }
}

const authored = [
  'packages/martlet-react/src/styles.css', 'packages/krigsvold-react/src/styles.css',
  'docs-app/src/layouts/martlet.css', 'docs-app/src/layouts/krigsvold.css',
  'docs-app/src/patterns/martlet.css', 'docs-app/src/patterns/krigsvold.css',
  'docs-app/src/shared.css',
];
const activeDependencies = Object.keys(origins).flatMap(f => ['theme.css','foundation.css'].map(file => `node_modules/@${f}/theme/dist/${file}`));
function classify(file, selector, prop, value, context) {
  if (file.includes('/theme/dist/theme.css')) return ['theme semantic roles, not origin-use proof', 'F01 F02 F03 F04 F05'];
  if (file.includes('/theme/dist/foundation.css')) return ['origin foundation vocabulary; role use still requires trace', 'F06 F14 F15 F17 F18'];
  if (/forced-colors|prefers-reduced-motion/.test(context)) return ['shared accessibility obligation', 'F13 C18'];
  if (context.includes('@media print')) return ['print extension', 'R11 C18'];
  if (file.endsWith('shared.css')) return ['documentation tooling / shared host styles; visual values provisional', 'F11 N18 C17'];
  if (file.includes('/patterns/')) return ['new application specimen; constituent rules require justification', 'F10 F14 F16 C14 C15 C16 C17'];
  if (file.includes('/layouts/krigsvold.css')) {
    if (/menu|summary|app-header|search|brand|app-utilities/.test(selector)) return ['source navbar analogue with recorded drift', 'N04 N05 N06 N07 N08 N09 N12 N13'];
    if (/heading|contract|sections|register/.test(selector)) return ['new documentation framing, unsupported accents and mono', 'F09 F10 F11 N16 N17'];
    if (/footer/.test(selector)) return ['documentation footer differs from origin footer', 'N15'];
    return ['documentation host composition; source relationship unproven', 'F15 F16 N14 N18'];
  }
  if (file.includes('/layouts/martlet.css')) {
    if (/article|prose/.test(selector)) return ['overrides source reading composition', 'R01 R02 R03 R05 R06 R07'];
    if (/footer/.test(selector)) return ['documentation footer differs from origin footer', 'N15'];
    if (/brand/.test(selector)) return ['system identity, not consumer identity', 'N12 N13'];
    return ['documentation host composition; source relationship unproven', 'F11 F15 F16 N14 N16 N18'];
  }
  if (/aria-invalid/.test(selector)) return ['state defect or adjacent state styling', 'C04'];
  if (/switch/.test(selector)) return ['new control extension', 'C10 C18'];
  if (/tabs/.test(selector)) return ['new control extension; visual differentiation unproven', 'C11 C18'];
  if (/contents/.test(selector)) return ['TOC source mismatch / new extension', 'R01 R02 R03 R04'];
  if (/article|prose/.test(selector)) return ['reading object mismatch / extension', 'R01 R05 R06 R07 R08 R09 R10 R11 R12'];
  if (/button/.test(selector) && !/file/.test(selector)) return ['source control analogue with geometry and role drift', 'C01 C02'];
  if (/file|checkbox|radio|fieldset/.test(selector)) return ['native-control application extension', 'C05'];
  if (/input|textarea|field|hint/.test(selector)) return ['source form analogue / new linked help', 'C03 C04 C05'];
  if (/notice|badge|error/.test(selector)) return ['new application feedback object', 'F05 C06'];
  if (/table/.test(selector)) return ['source table analogue with density drift', 'C07'];
  if (/dialog/.test(selector)) return ['new task dialog, not source gallery object', 'C09'];
  if (/disclosure/.test(selector)) return ['native details extension / source FAQ variant missing', 'C08 N06'];
  if (/pagination/.test(selector)) return ['controlled data-paging extension', 'C13'];
  if (/definitions/.test(selector)) return ['definition layouts improperly differentiated by family', 'C12 R12'];
  if (/app|skip/.test(selector)) return ['application shell analogue / extension', 'N01 N02 N03 N10 N11 F13'];
  if (prop.startsWith('--')) return ['application role assignment; origin value does not prove role', 'F01 F14 F15 C07'];
  if (/focus/.test(selector)) return ['focus behavior / visual reconciliation', 'F13 C18'];
  return ['foundation/type/reset requires contextual reconciliation', 'F01 F02 F03 F06 F07 F08 F12 F19'];
}
const declarationRows = [['family','layer','file','line','context','selector','property','value','important','tokenReferences','auditCategory','registerIds','literalOriginCandidates','candidateWarning']];
const totals = { auditedImplementation: '594055a647a84fa30bb400c98810f946b66a7c0b', date: '2026-10-23', authoredStylesheets: authored.length, activeDependencyStylesheets: activeDependencies.length, rules: 0, declarations: 0, authoredDeclarations: 0, dependencyDeclarations: 0, imports: [], files: [] };
for (const file of [...authored, ...activeDependencies]) {
  const text = await readFile(path.join(root,file), 'utf8');
  const ast = postcss.parse(text, { from: file });
  const layer = authored.includes(file) ? 'authored' : 'active dependency';
  const family = /martlet/.test(file) ? 'martlet' : /krigsvold/.test(file) ? 'krigsvold' : 'both';
  const record = { file, layer, sha256: sha(text), rules: 0, declarations: 0 };
  ast.walkAtRules('import', r => totals.imports.push({file, line:r.source.start.line, value:r.params}));
  ast.walkRules(() => { totals.rules++; record.rules++; });
  ast.walkDecls(d => {
    let p=d.parent; const ancestry=[]; let selector='';
    while(p && p.type!=='root') { if(p.type==='rule' && !selector) selector=p.selector; if(p.type==='atrule') ancestry.unshift(`@${p.name} ${p.params}`); p=p.parent; }
    const context=ancestry.join(' > ');
    const [category, ids] = classify(file,selector,d.prop,d.value,context);
    const matches = sourceDeclarations.filter(s => (family==='both'||family===s.family) && s.property===d.prop && norm(s.value)===norm(d.value));
    const candidates=matches.slice(0,3).map(s=>`${s.family}:${s.file}:${s.line} ${s.selector}`).join(' ; ');
    declarationRows.push([family,layer,file,d.source.start.line,context,selector,d.prop,d.value,!!d.important,[...d.value.matchAll(/var\((--[^,)\s]+)/g)].map(m=>m[1]).join(' '),category,ids,candidates,matches.length ? 'Literal equality is a search lead, not contextual provenance.' : 'No literal property/value match in the inspected origin styles; aliases/context may still establish a trace.']);
    record.declarations++; totals.declarations++; if(layer==='authored') totals.authoredDeclarations++; else totals.dependencyDeclarations++;
  });
  totals.files.push(record);
}

const componentMap={ AppShell:'N01 N02 N03 N04 N05 N06 N07 N08 N09 N10 N11', Button:'C01 C02', TextInput:'C03 C04', Select:'C03 C05', Textarea:'C03 C05', Field:'C03 C06', FileInput:'C05', Checkbox:'C05', Radio:'C05', Fieldset:'C05 C06', Notice:'F05 C06', Badge:'C06', DataTable:'C07', Disclosure:'C08 N06', Dialog:'C09', ErrorSummary:'C06', TableOfContents:'R01 R02 R03 R04', Article:'R01 R02 R03 R04 R05 R06 R07 R08 R09 R10 R11 R12', Pagination:'C13', DefinitionList:'C12 R12', Switch:'C10', Tabs:'C11' };
const componentRows=[['family','export','file','line','registerIds','status']];
const normalized=[];
for(const family of Object.keys(origins)){
 const file=`packages/${family}-react/src/index.tsx`; const text=await readFile(path.join(root,file),'utf8');
 const found=[...text.matchAll(/export function (\w+)\(/g)];
 if(found.length!==22)throw new Error(`${family}: expected 22 component exports`);
 for(const m of found){ if(!componentMap[m[1]])throw new Error(`Unaccounted export ${m[1]}`); componentRows.push([family,m[1],file,text.slice(0,m.index).split('\n').length,componentMap[m[1]],'See manual register: behavior sharing does not certify visual grammar.']); }
 const compiled=transformSync('components.tsx',text.replaceAll(family,'FAMILY'),{lang:'tsx',jsx:{runtime:'automatic'},target:'es2022'});
 if(compiled.errors.length)throw new Error(`${family}: normalization compilation failed`);
 normalized.push(compiled.code);
}
totals.componentExports=componentRows.length-1;
totals.compiledBehaviorIdenticalAfterFamilySubstitution=normalized[0]===normalized[1];
const inlineRows=[['file','line','expression','classification','registerIds']];
for(const file of (await files(path.join(root,'docs-app/src'))).filter(f=>f.endsWith('.tsx'))){
 const text=await readFile(file,'utf8');
 for(const m of text.matchAll(/style=\{\{([\s\S]*?)\}\}/g)) inlineRows.push([path.relative(root,file),text.slice(0,m.index).split('\n').length,m[1].trim(),file.includes('/patterns/')?'application content formatting extension':'host inspection or isolated example layout',file.includes('/patterns/')?'R06 C14 C15':'N18 C17']);
 for(const m of text.matchAll(/document\.documentElement\.style\.colorScheme\s*=\s*[^;]+/g))inlineRows.push([path.relative(root,file),text.slice(0,m.index).split('\n').length,m[0],'document mode plumbing; full dark grammar unproven','F04 C17']);
}
totals.inlineStyleAssignments=inlineRows.length-1;
totals.originFiles=manifest.length;
totals.originStyleRules=sourceSelectors.length;
totals.originStyleDeclarations=sourceDeclarations.length;
totals.reviewItems=67;
await writeFile(path.join(out,'declarations.csv'),csv(declarationRows));
await writeFile(path.join(out,'components.csv'),csv(componentRows));
await writeFile(path.join(out,'inline-styles.csv'),csv(inlineRows));
await writeFile(path.join(out,'sources.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(out,'source-selectors.json'),JSON.stringify(sourceSelectors.filter(s=>s.file.startsWith('src/')),null,2)+'\n');
await writeFile(path.join(out,'totals.json'),JSON.stringify(totals,null,2)+'\n');
console.log(JSON.stringify({...totals, files: totals.files.map(f=>({file:f.file,rules:f.rules,declarations:f.declarations})), imports:totals.imports},null,2));
