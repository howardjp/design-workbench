import {useEffect,useRef,useState} from 'react';
import {AppShell,Article,DefinitionList,Pagination,family} from 'catalog-family';
import {pages} from './pages';
import './style.css';

type Item={title:string;summary:string;url:string;date?:string;tag?:string};
type Section={id:string;title:string;kind?:string;body?:string;items?:Item[];facts?:{label:string;value:string}[];actions?:{label:string;url:string}[]};
const base=import.meta.env.BASE_URL.replace(/\/$/,'');
const href=(url:string)=>url.startsWith('/')&&!url.startsWith('//') ? `${base}${url}` : url;
function Listing({items,title}:{items:Item[];title:string}) {
 const [page,setPage]=useState(1),[enhanced,setEnhanced]=useState(false);
 const nav=useRef<HTMLElement>(null),pendingFocus=useRef(false);
 useEffect(()=>setEnhanced(true),[]);
 const pageCount=Math.ceil(items.length/3);
 useEffect(()=>{if(!pendingFocus.current)return;pendingFocus.current=false;const buttons=nav.current?.querySelectorAll('button');if(page===1)buttons?.[1]?.focus();else if(page===pageCount)buttons?.[0]?.focus();},[page,pageCount]);
 return <><ul className="recipe-listing">{items.map((item,i)=><li key={item.url} hidden={enhanced&&pageCount>1&&(i<3*(page-1)||i>=3*page)}>
  {(item.date||item.tag)&&<p className="recipe-meta">{item.date&&<time dateTime={item.date}>{new Intl.DateTimeFormat('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(`${item.date}T00:00:00Z`))}</time>}{item.date&&item.tag?' · ':''}{item.tag}</p>}
  <h3><a href={href(item.url)}>{item.title}</a></h3><p>{item.summary}</p>
 </li>)}</ul>{enhanced&&pageCount>1&&<Pagination ref={nav} page={page} pageCount={pageCount} onPageChange={next=>{pendingFocus.current=true;setPage(next);}} label={`${title} pages`}/>}</>;
}
function SectionView({section}:{section:Section}){
 return <section aria-labelledby={section.id}><h2 id={section.id} tabIndex={-1}>{section.title}</h2>
  {section.body&&<p>{section.body}</p>}
  {section.kind==='cards'&&<ul className="recipe-cards">{section.items!.map(item=><li key={item.url}><h3><a href={href(item.url)}>{item.title}</a></h3><p>{item.summary}</p></li>)}</ul>}
  {section.kind==='facts'&&<DefinitionList items={section.facts!.map((fact,i)=>({id:`${section.id}-${i}`,term:fact.label,description:fact.value}))}/>}
  {section.kind==='listing'&&<Listing title={section.title} items={section.items!}/>}
  {section.actions&&<ul className="recipe-actions">{section.actions.map(action=><li key={action.url}><a href={href(action.url)}>{action.label}</a></li>)}</ul>}
 </section>;
}
export function App({id}:{id:string}) {
 const page=pages.find(item=>item.id===id);
 if(!page) throw Error(`Unported catalog route: ${id}`);
 return <div className={family} {...{[`data-${family}`]:'light'}}><AppShell brand={<a href={href('/examples/home/')}>Northlight Field Institute</a>} navigationLabel="Example navigation" navigationPlacement="top" navigation={<><a href={href('/examples/home/')}>Home</a><a href={href('/examples/about/')}>About</a><a href={href('/examples/archive/')}>Archive</a></>} utilities={<span>Fictional examples</span>}>
  <Article title={page.title} eyebrow={page.category} summary={page.summary} {...('date' in page && page.date ? {metadata:<time dateTime={page.date}>{page.date}</time>}: {})}>
   <div data-example={page.id} data-semantic-class={page.semantic_class}>{page.sections.map(section=><SectionView key={section.id} section={section as Section}/>)}</div>
  </Article>
 </AppShell></div>;
}
