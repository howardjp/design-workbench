import {useEffect,useState} from 'react';
import {Button} from 'catalog-family';
import catalog from '../../page-archetypes/content/catalog.json';
import selected from './selected.json';
const base=import.meta.env.BASE_URL.replace(/\/$/,'');

export function Search() {
 const [ready,setReady]=useState(false),[draft,setDraft]=useState(''),[query,setQuery]=useState('');
 useEffect(()=>{const url=new URL(location.href),initial=(url.searchParams.get('q')||'').trim().slice(0,200);initial?url.searchParams.set('q',initial):url.searchParams.delete('q');history.replaceState(history.state,'',url);setDraft(initial);setQuery(initial);setReady(true);},[]);
 const matches=query?catalog.pages.filter(page=>query.toLocaleLowerCase().split(/\s+/u).every(word=>`${page.title} ${page.summary} ${page.category}`.toLocaleLowerCase().includes(word))):[];
 const submit=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();const value=draft.trim().slice(0,200);setDraft(value);setQuery(value);const url=new URL(location.href);value?url.searchParams.set('q',value):url.searchParams.delete('q');history.replaceState(history.state,'',url);};
 return <><form role="search" onSubmit={submit}><label htmlFor="example-query">Search the example record</label><div><input type="search" id="example-query" name="q" maxLength={200} value={draft} onChange={event=>setDraft(event.target.value)} disabled={!ready} placeholder="Try shoreline, workshop, or protocol"/> <Button type="submit" disabled={!ready}>Search</Button></div></form>
  <p role="status">{!query?'Enter a word or phrase to search the collection.':matches.length?`${matches.length} result${matches.length===1?'':'s'} for “${query}”.`:<>No results for “{query}”. Try fewer words or <a href={`${base}/examples/`}>browse the example index</a>.</>}</p>
  <ul>{matches.map(entry=><li key={entry.id}><h3>{selected.includes(entry.id)?<a href={`${base}/examples/${entry.id}/`}>{entry.title}</a>:<span>{entry.title}</span>}</h3><p>{entry.summary}</p>{!selected.includes(entry.id)&&<p>Not yet available in this React preview.</p>}</li>)}</ul>
  <noscript><p>Search requires JavaScript. <a href={`${base}/examples/`}>Browse the complete example index</a>.</p></noscript>
 </>;
}
const formKinds=['contact','sign-in','sign-up','password-reset','two-factor','newsletter'] as const;
type FormKind=(typeof formKinds)[number];
export function DemoForm({kind}:{kind:string}) {
 if(!formKinds.includes(kind as FormKind))throw Error(`Unsupported form: ${kind}`);
 const [ready,setReady]=useState(false),[status,setStatus]=useState('');useEffect(()=>setReady(true),[]);
 const title=kind.replaceAll('-',' ').replace(/^./,c=>c.toUpperCase());
 const submit=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;form.querySelectorAll<HTMLInputElement>('input[type=password],input[name=code]').forEach(input=>{input.value='';});setStatus('Example validated locally. Nothing was sent, saved, or authenticated.');};
 return <><p id="form-notice">Local interface demonstration. Use invented values only. Nothing is sent, saved, subscribed, or authenticated.</p>
 <form onSubmit={submit} onInput={()=>setStatus('')} onChange={()=>setStatus('')} onReset={()=>setStatus('')} aria-describedby="form-notice"><fieldset disabled={!ready} className="demo-fields"><legend>{title}</legend>
  {['contact','sign-up'].includes(kind)&&<><label htmlFor="demo-name">Name</label><input id="demo-name" name="name" autoComplete="off" required maxLength={120}/></>}
  {kind!=='two-factor'&&<><label htmlFor="demo-email">Email address</label><input id="demo-email" name="email" type="email" autoComplete="off" required maxLength={254}/></>}
  {['sign-in','sign-up'].includes(kind)&&<><label htmlFor="demo-password">Example password</label><input id="demo-password" name="password" type="password" autoComplete="off" required minLength={8} maxLength={128} aria-describedby="password-help"/><p id="password-help">Use an invented password of at least eight characters.</p></>}
  {kind==='two-factor'&&<><label htmlFor="demo-code">Six-digit example code</label><input id="demo-code" name="code" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="off" required aria-describedby="code-help"/><p id="code-help">Any six digits demonstrate local format validation.</p></>}
  {kind==='contact'&&<><label htmlFor="demo-topic">Topic</label><select id="demo-topic" name="topic"><option>Research</option><option>Visits</option><option>Corrections</option></select><label htmlFor="demo-message">Message</label><textarea id="demo-message" name="message" required rows={6} maxLength={4000}/></>}
  {['newsletter','sign-up'].includes(kind)&&<label><input type="checkbox" required name="consent"/> I understand this is a local demonstration.</label>}
  <div className="demo-actions"><Button type="submit">Validate example</Button> <Button type="reset">Clear</Button></div>
 </fieldset><p role="status">{status}</p></form><noscript><p>JavaScript is needed for local form validation. The demonstration form is disabled to prevent accidental submission.</p></noscript></>;
}
