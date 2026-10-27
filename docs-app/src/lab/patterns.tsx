import {useId} from 'react';
import {family,familyName,Button,Field,TextInput,Textarea,Select,Checkbox,Fieldset,ErrorSummary,Dialog,DataTable,Pagination} from 'docs-family';
import {PatternLayout} from 'docs-reference-pattern';
import {useFormPattern,type Draft} from './use-form';
import {useResultsPattern} from './use-results';
import {groups} from '../data';
import martlet from '../../../docs/languages/martlet/implementation.json';
import krigsvold from '../../../docs/languages/krigsvold/implementation.json';
export function FormPattern({heading="A publication request",formLabel="Publication request"}:{heading?:string;formLabel?:string}={}){
  const f=useFormPattern(),prefix=useId(),id=(key:string)=>`${prefix}-${key}`;
  const errors=Object.entries(f.errors).map(([key,message])=>({message:message!,targetId:id(key)}));
  function field(key:'title'|'name'|'email',label:string,hint:string){return <Field id={id(key)} label={label} hint={hint} error={f.errors[key]}>{p=><TextInput {...p} type={key==='email'?'email':'text'} autoComplete={key==='name'?'name':key==='email'?'email':undefined} required maxLength={key==='title'?120:200} value={f.draft[key]} onChange={e=>f.change(key,e.target.value)} />}</Field>;}
  return <section className="reference-form-pattern" aria-labelledby={id('heading')}>
    <h2 id={id('heading')}>{heading}</h2>
    <p>Complete the related details, then send the request. This specimen sends nothing and keeps values only while this page is open. Reloading the page clears your entries; use sample details rather than personal information.</p>
    <form aria-label={formLabel} noValidate onSubmit={e=>{e.preventDefault();void f.save();}}>
      {(f.phase==='invalid'||f.phase==='failed')&&<ErrorSummary ref={f.summary} title={f.phase==='failed'?'Your request has not been sent':'Check the request'} errors={f.phase==='failed'?[{message:'The simulated save failed. Your entries are retained; try sending again.',targetId:id('submit')}]:errors} />}
      <div className="reference-form-groups">
        <Fieldset legend="The request" disabled={f.phase==='saving'}>
          {field('title','Title (required)','Use a title someone can recognize. At least three characters.')}
          <Field label="Request type">{p=><Select {...p} value={f.draft.kind} onChange={e=>f.change('kind',e.target.value)}><option>Article</option><option>Reference material</option><option>Correction</option></Select>}</Field>
          <Field id={id('summary')} label="Summary (required)" hint="Explain the request in at least ten characters." error={f.errors.summary}>{p=><Textarea {...p} required rows={5} maxLength={1000} value={f.draft.summary} onChange={e=>f.change('summary',e.target.value)} />}</Field>
        </Fieldset>
        <Fieldset legend="Response preferences" disabled={f.phase==='saving'} hint="These fields belong to the response, rather than the publication itself.">
          {field('name','Response name (required)','The name to use when responding.')}
          {field('email','Response email (required)','Use a fictional address such as reader@example.org.')}
          <Checkbox label="Include a copy of the request in the response" checked={f.draft.notify} onChange={e=>f.change('notify',e.target.checked)} />
        </Fieldset>
      </div>
      <div className="reference-pattern-actions">
        <Button ref={f.submit} id={id('submit')} type="submit" disabled={f.phase==='saving'}>{f.phase==='saving'?'Sending…':f.phase==='failed'?'Try sending again':'Send request'}</Button>
        <Button variant="quiet" disabled={f.phase==='saving'} onClick={f.requestReset}>Reset specimen</Button>
      </div>
      <p role="status">{f.phase==='saving'?'Sending this request…':f.phase==='saved'?'Request saved in this example. Nothing was transmitted.':f.dirty?'Unsaved changes in this specimen.':'Ready for a request.'}</p>
    </form>
    <details className="reference-pattern-inspection"><summary>Inspect form failure</summary><Checkbox label="Fail the next valid save" checked={f.failNext} disabled={f.phase==='saving'} onChange={e=>f.setFailNext(e.target.checked)} /><p>Documentation tooling: one simulated failure, then retry can succeed. Leaving this page resets the specimen; its draft guard covers Reset specimen.</p></details>
    <Dialog open={f.guard} title="Discard this request?" onDismiss={()=>f.setGuard(false)}><p>This specimen has unsaved changes. Keep editing, or discard them and reset the example.</p><div className="reference-pattern-actions"><Button onClick={()=>f.setGuard(false)}>Keep editing</Button><Button variant="secondary" onClick={f.reset}>Discard changes</Button></div></Dialog>
  </section>;
}
function ResultsPattern(){
  const r=useResultsPattern(),prefix=useId();
  const busy=r.phase==='loading',current=r.phase==='ready';
  const scope=`${r.applied.query.trim()?`“${r.applied.query.trim()}”`:'All component names'} · ${r.applied.group} · ${r.applied.sort==='az'?'A–Z':'Z–A'}`;
  return <section className="reference-results-pattern" aria-labelledby={`${prefix}-title`}>
    <h2 id={`${prefix}-title`}>Query and compare components</h2>
    <p>Apply a query, select names on the current result page, then review the exact selection. These controls operate on the documented component catalogue.</p>
    <form className="reference-query" aria-label="Component query" onSubmit={e=>{e.preventDefault();void r.load({...r.draft,page:1});}}>
      <Field label="Search the component catalogue">{p=><TextInput {...p} type="search" value={r.draft.query} onChange={e=>r.setDraft(d=>({...d,query:e.target.value}))} />}</Field>
      <Field label="Component group">{p=><Select {...p} value={r.draft.group} onChange={e=>r.setDraft(d=>({...d,group:e.target.value}))}><option>All groups</option>{Object.keys(groups).map(g=><option key={g}>{g}</option>)}</Select>}</Field>
      <Field label="Sort component names">{p=><Select {...p} value={r.draft.sort} onChange={e=>r.setDraft(d=>({...d,sort:e.target.value}))}><option value="az">A–Z</option><option value="za">Z–A</option></Select>}</Field>
      <Button type="submit" disabled={busy}>{busy?'Applying…':'Apply query'}</Button>
    </form>
    <section className="reference-results" aria-label="Committed component results" aria-busy={busy}>
      <p className="reference-applied-scope"><strong>Showing:</strong> {scope}</p>
      {!current&&r.requested&&<p className="reference-applied-scope"><strong>Requested:</strong> {r.requested.query.trim()||'All component names'} · {r.requested.group} · Page {r.requested.page}</p>}
      <p role="status">{busy?'Loading requested results. Previous results remain below with their applied scope.':r.phase==='failed'?'The requested results could not load. Previous results and selection remain shown.':`${r.total} results · Page ${r.page} of ${r.pages}`}</p>
      {r.phase==='failed'&&<Button onClick={()=>r.failed&&void r.load(r.failed)}>Retry results</Button>}
      {r.total===0?<div className="reference-empty"><h3>{r.applied.empty?'The source catalogue is empty':'No matching components'}</h3><p>{r.applied.empty?'There are no source records in this simulated state.':'Try another name or clear the applied query.'}</p><Button disabled={busy} onClick={()=>{const scope={query:'',group:'All groups',sort:'az',page:1,empty:false};r.setDraft(scope);void r.load(scope);}}>{r.applied.empty?'Restore example catalogue':'Clear query'}</Button></div>:<>
        <DataTable caption="Component comparison candidates"><thead><tr><th scope="col">Selection</th><th scope="col">Component</th><th scope="col">Group</th><th scope="col">Purpose</th></tr></thead><tbody>{r.rows.map(row=><tr key={row.id} data-selected={r.selected.includes(row.id)}><td><Checkbox label={<span className="reference-pattern-sr">Select {row.name}</span>} checked={r.selected.includes(row.id)} disabled={!current} onChange={e=>r.setSelected(old=>e.target.checked?[...old,row.id]:old.filter(id=>id!==row.id))} /></td><th scope="row">{row.name}</th><td>{row.group}</td><td>{row.description}</td></tr>)}</tbody></DataTable>
        <Pagination page={r.page} pageCount={r.pages} onPageChange={page=>void r.load({...r.applied,page})} disabled={busy} />
      </>}
    </section>
    <div className="reference-selection"><p>{r.selected.length} selected on the displayed page. Selection resets when a changed scope commits.</p><div className="reference-pattern-actions"><Button disabled={!current||r.selected.length===0} onClick={()=>r.setDialog(true)}>Review selection</Button><Button variant="quiet" disabled={busy} onClick={()=>void r.load(r.applied)}>Refresh results</Button></div><p role="status">{r.message}</p></div>
    <details className="reference-pattern-inspection"><summary>Inspect result states</summary><div className="reference-inspection-controls"><Checkbox label="Fail the next result request" checked={r.failNext} disabled={busy} onChange={e=>r.setFailNext(e.target.checked)} /><Checkbox label="Use an empty source catalogue on the next query" checked={r.draft.empty} onChange={e=>r.setDraft(d=>({...d,empty:e.target.checked}))} /></div><p>Failure retains the committed page. Empty source is distinct from an applied query with no matches. Requests and preparation are simulated.</p></details>
    <Dialog open={r.dialog} title="Review selected components" onDismiss={r.close}>
      <p>Prepare a local list of these names. This does not record a real review or change component maturity.</p><ul>{r.selected.map(name=><li key={name}>{name}</li>)}</ul>
      {r.prepare==='failed'&&<p ref={r.dialogError} tabIndex={-1} role="alert">Preparation failed. Your selection is retained. Try again or cancel.</p>}
      <p role="status">{r.prepare==='pending'?'Preparing the comparison…':''}</p>
      <div className="reference-pattern-actions"><Button disabled={r.prepare==='pending'} onClick={()=>void r.confirm()}>{r.prepare==='pending'?'Preparing…':r.prepare==='failed'?'Try preparation again':'Prepare comparison'}</Button><Button variant="quiet" onClick={r.close}>Cancel comparison</Button></div>
      <Checkbox label="Fail the next preparation" checked={r.failPrepare} disabled={r.prepare==='pending'} onChange={e=>r.setFailPrepare(e.target.checked)} />
    </Dialog>
  </section>;
}
function Coverage(){
  const source=(family==='martlet'?martlet:krigsvold) as unknown as {grammarVersion:string;coverage?:{id:string;domain:string;status:string;rule:string}[]};
  return <section><h2>Coverage and remaining evidence</h2><p>Grammar {source.grammarVersion} remains experimental. A documented rule, a passing specimen and sustained consumer evidence are separate claims.</p><DataTable caption={`${familyName} grammar coverage`}><thead><tr><th scope="col">Area</th><th scope="col">Disposition</th><th scope="col">Rule or open work</th></tr></thead><tbody>{source.coverage?.map(row=><tr key={row.id}><th scope="row">{row.domain}</th><td>{row.status}</td><td>{row.rule}</td></tr>)}</tbody></DataTable><p>Manual assistive-technology review, localization/RTL, sustained use, compact density and broader content vocabulary remain open. Astro has native-HTML guidance for these patterns; no Astro form or query controller is claimed.</p></section>;
}
export function ReferencePatterns(){
  const params=new URLSearchParams(location.search),pattern=['results','coverage'].includes(params.get('pattern')??'')?params.get('pattern')!:'form';
  const links=<nav className="reference-pattern-nav" aria-label="Reference patterns">{[['form','Validated form'],['results','Query and selection'],['coverage','Coverage review']].map(([id,label])=><a key={id} href={`?page=patterns&pattern=${id}`} aria-current={pattern===id?'page':undefined}>{label}</a>)}</nav>;
  const context=<><p>{family==='martlet'?'Keep a readable progression through related decisions. Use proximity first; give assistance a place beside the choice.':'Give query, work, supporting context and commands clear jobs. Common edges support comparison within a region.'}</p><p>Field, group and region relationships use the existing family roles. Comfortable density is demonstrated; compact remains proposed.</p><p>Session-only specimens use simulated latency and failure. They are documentation exercises and leave the surrounding documentation navigation to the host.</p><a href="?page=language">Read the grammar and source decisions →</a></>;
  return <PatternLayout navigation={links} context={context}>{pattern==='results'?<ResultsPattern/>:pattern==='coverage'?<Coverage/>:<FormPattern/>}</PatternLayout>;
}
