import {useLayoutEffect, useEffect, useRef, useState} from 'react';
export type Draft = {title:string; summary:string; kind:string; name:string; email:string; notify:boolean};
const empty = ():Draft => ({title:'',summary:'',kind:'Article',name:'',email:'',notify:true});
type Errors = Partial<Record<keyof Draft,string>>;
export function useFormPattern() {
  const [draft,setDraft]=useState(empty),[saved,setSaved]=useState(empty);
  const [phase,setPhase]=useState<'editing'|'invalid'|'saving'|'failed'|'saved'>('editing');
  const [errors,setErrors]=useState<Errors>({}),[attempt,setAttempt]=useState(0);
  const [failNext,setFailNext]=useState(false),[guard,setGuard]=useState(false);
  const generation=useRef(0),busy=useRef(false),summary=useRef<HTMLDivElement>(null),submit=useRef<HTMLButtonElement>(null);
  useEffect(()=>()=>{generation.current++;busy.current=false;},[]);
  useLayoutEffect(()=>{if(phase==='invalid'||phase==='failed')summary.current?.focus();else if(phase==='saved'&&document.activeElement===document.body)submit.current?.focus();},[phase,attempt]);
  const dirty=JSON.stringify(draft)!==JSON.stringify(saved);
  function change<K extends keyof Draft>(key:K,value:Draft[K]) {setDraft(d=>({...d,[key]:value}));if(phase==='saved')setPhase('editing');}
  function reset(){generation.current++;busy.current=false;setDraft(empty());setSaved(empty());setErrors({});setPhase('editing');setGuard(false);setFailNext(false);}
  async function save(){
    if(busy.current)return;
    setAttempt(n=>n+1);
    const next:Errors={};
    if(draft.title.trim().length<3)next.title='Enter a title of at least three characters.';
    if(draft.summary.trim().length<10)next.summary='Describe the request in at least ten characters.';
    if(!draft.name.trim())next.name='Enter the name to use in the response.';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))next.email='Enter an email address with a domain, such as reader@example.org.';
    setErrors(next);
    if(Object.keys(next).length){setPhase('invalid');return;}
    const token=++generation.current, submitted={...draft}, fail=failNext;
    busy.current=true;setPhase('saving');setFailNext(false);
    await new Promise(resolve=>setTimeout(resolve,450));
    if(token!==generation.current)return;
    busy.current=false;
    if(fail){setPhase('failed');return;}
    setSaved(submitted);setPhase('saved');
  }
  return {draft,phase,errors,summary,submit,dirty,guard,setGuard,failNext,setFailNext,change,save,reset,requestReset:()=>dirty?setGuard(true):reset()};
}
