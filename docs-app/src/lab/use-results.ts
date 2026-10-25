import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import contracts from '../contracts.json';
import {groups,descriptions} from '../data';
export type Scope={query:string;group:string;sort:string;page:number;empty:boolean};
const initial=():Scope=>({query:'',group:'All groups',sort:'az',page:1,empty:false});
const records=contracts.map(c=>({id:c.name,name:c.name,group:Object.entries(groups).find(([,items])=>items.includes(c.name))?.[0]??'Other',description:descriptions[c.name]}));
export function resultsFor(scope:Scope){
  const found=(scope.empty?[]:records).filter(r=>(scope.group==='All groups'||r.group===scope.group)&&`${r.name} ${r.description}`.toLowerCase().includes(scope.query.trim().toLowerCase())).sort((a,b)=>scope.sort==='za'?b.name.localeCompare(a.name):a.name.localeCompare(b.name));
  const pages=Math.max(1,Math.ceil(found.length/5)),page=Math.min(Math.max(1,scope.page),pages);
  return {total:found.length,pages,page,rows:found.slice((page-1)*5,page*5)};
}
export function useResultsPattern(){
  const [draft,setDraft]=useState(initial),[applied,setApplied]=useState(initial);
  const [phase,setPhase]=useState<'ready'|'loading'|'failed'>('ready');
  const [failNext,setFailNext]=useState(false),[selected,setSelected]=useState<string[]>([]);
  const [failed,setFailed]=useState<Scope|null>(null),[message,setMessage]=useState('');
  const [requested,setRequested]=useState<Scope|null>(null);
  const [dialog,setDialog]=useState(false),[prepare,setPrepare]=useState<'ready'|'pending'|'failed'>('ready');
  const [failPrepare,setFailPrepare]=useState(false);
  const generation=useRef(0),preparation=useRef(0),busy=useRef(false),preparing=useRef(false);
  const dialogError=useRef<HTMLParagraphElement>(null);
  useLayoutEffect(()=>{if(prepare==='failed')dialogError.current?.focus();},[prepare]);
  useEffect(()=>()=>{generation.current++;preparation.current++;busy.current=false;preparing.current=false;},[]);
  async function load(scope:Scope){
    if(busy.current)return;
    const token=++generation.current,fail=failNext;busy.current=true;setRequested(scope);setFailNext(false);setPhase('loading');setMessage('');
    await new Promise(resolve=>setTimeout(resolve,450));if(token!==generation.current)return;
    busy.current=false;
    if(fail){setFailed(scope);setPhase('failed');return;}
    const result=resultsFor(scope),next={...scope,page:result.page};
    const same=JSON.stringify(next)===JSON.stringify(applied);
    setSelected(old=>same?old.filter(id=>result.rows.some(r=>r.id===id)):[]);
    setApplied(next);setFailed(null);setPhase('ready');setMessage(`${result.total} results are current.`);
  }
  function close(){preparation.current++;preparing.current=false;setPrepare('ready');setDialog(false);}
  async function confirm(){
    if(preparing.current)return;
    const token=++preparation.current,fail=failPrepare,count=selected.length;preparing.current=true;setPrepare('pending');setFailPrepare(false);
    await new Promise(resolve=>setTimeout(resolve,450));if(token!==preparation.current)return;
    preparing.current=false;
    if(fail){setPrepare('failed');return;}
    setMessage(`Prepared ${count} component names for comparison. Selection retained.`);setDialog(false);setPrepare('ready');
  }
  return {draft,setDraft,applied,requested,phase,failNext,setFailNext,selected,setSelected,failed,message,load,dialog,setDialog,dialogError,prepare,failPrepare,setFailPrepare,close,confirm,...resultsFor(applied)};
}
