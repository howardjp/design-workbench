/* Portable behaviour and calculations. No DOM, theme, framework, or network dependencies. */
export const dayMillis = 86400000;
export function rangeError(start, end, min, max) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return 'Enter both dates.';
  if ([start,end].some(value=>!Number.isFinite(Date.parse(value))||new Date(Date.parse(value)).toISOString().slice(0,10)!==value)) return 'Enter valid calendar dates.';
  if (start > end) return 'The start date must be on or before the end date.';
  if (start < min || end > max) return `Choose dates from ${min} to ${max}.`;
  return '';
}
export function aggregate(rows) {
  const totals = rows.reduce((sum, row) => ({ sessions:sum.sessions+row.sessions, downloads:sum.downloads+row.downloads, completions:sum.completions+row.completions, duration_seconds:sum.duration_seconds+row.duration_seconds }), {sessions:0,downloads:0,completions:0,duration_seconds:0});
  return {...totals, conversion:totals.sessions ? 100*totals.completions/totals.sessions : 0, mean_duration:totals.sessions ? totals.duration_seconds/totals.sessions : 0};
}
export function analyticsView(fixture, {start, end, category='All'}) {
  const min=fixture.analytics[0].date, max=fixture.analytics.at(-1).date;
  const error=rangeError(start,end,min,max);
  if(error) return {error};
  const rows=fixture.analytics.filter(row=>row.date>=start&&row.date<=end&&(category==='All'||row.category===category));
  const length=Math.round((Date.parse(end)-Date.parse(start))/dayMillis)+1;
  const previousEnd=new Date(Date.parse(start)-dayMillis).toISOString().slice(0,10);
  const previousStart=new Date(Date.parse(start)-length*dayMillis).toISOString().slice(0,10);
  const previousRows=fixture.analytics.filter(row=>row.date>=previousStart&&row.date<=previousEnd&&(category==='All'||row.category===category));
  const days=[...new Set(rows.map(row=>row.date))].map(date=>({date,...aggregate(rows.filter(row=>row.date===date))}));
  const categories=fixture.categories.map(name=>({name,...aggregate(rows.filter(row=>row.category===name))}));
  return {error:'', rows, days, categories, totals:aggregate(rows), previous:previousStart>=min ? aggregate(previousRows) : null};
}
export function collectionView(records,{query='',status='All',sort='name',direction='asc',page=1,size=5},fields={search:['name','email','role','id'],sort:['name','email','role','status','id'],defaultSort:'name'}) {
  const needle=query.trim().toLocaleLowerCase();
  const filtered=records.filter(record=>(status==='All'||record.status===status)&&fields.search.some(key=>String(record[key]??'').toLocaleLowerCase().includes(needle)));
  const safeSort=fields.sort.includes(sort)?sort:fields.defaultSort;
  filtered.sort((a,b)=>String(a[safeSort]).localeCompare(String(b[safeSort]),'en')*(direction==='desc'?-1:1)||String(a.id).localeCompare(String(b.id)));
  const pageSize=[5,10,20].includes(Number(size))?Number(size):5;
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const requestedPage=Number(page);
  const current=Number.isSafeInteger(requestedPage) ? Math.max(1,Math.min(requestedPage,pages)) : 1;
  return {filtered,rows:filtered.slice((current-1)*pageSize,current*pageSize),page:current,pages,size:pageSize,total:filtered.length};
}
export function validatePerson(draft,records,id=null) {
  const errors={};
  if(draft.name.trim().length<2)errors.name='Enter a name of at least two characters.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))errors.email='Enter an email address.';
  else if(records.some(record=>record.id!==id&&record.email.toLocaleLowerCase()===draft.email.trim().toLocaleLowerCase()))errors.email='This email address is already in the directory.';
  if(!['Researcher','Editor','Coordinator'].includes(draft.role))errors.role='Choose an available role.';
  if(!['Active','Invited','Suspended'].includes(draft.status))errors.status='Choose an available status.';
  return errors;
}
export function applyBulk(records,ids,status) {
  if(!['Active','Suspended'].includes(status))throw new Error('Unsupported bulk action');
  const selected=new Set(ids);
  return records.map(record=>selected.has(record.id)?{...record,status}:record);
}
export function operationsView(fixture,{hours=6,threshold=250,service='All',severity='All',hideAcknowledged=false},alerts=fixture.alerts) {
  const limit=[6,12,24].includes(Number(hours))?Number(hours):6;
  const warning=Math.max(50,Math.min(1000,Number(threshold)||250));
  const services=fixture.services.filter(item=>service==='All'||item.id===service).map(item=>({...item,samples:item.samples.slice(-limit)}));
  const points=services[0]?.samples.map((sample,index)=>({time:sample.time,latency_ms:Math.round(services.reduce((sum,item)=>sum+item.samples[index].latency_ms,0)/services.length)}))||[];
  const relevant=alerts.filter(alert=>(service==='All'||alert.service_id===service));
  const visible=relevant.filter(alert=>(severity==='All'||alert.severity===severity)&&(!hideAcknowledged||!alert.acknowledged));
  const last=services.map(item=>({...item,latest:item.samples.at(-1),warning:item.samples.at(-1).latency_ms>=warning}));
  return {services:last,points,alerts:visible,open:relevant.filter(alert=>!alert.acknowledged).length,warnings:last.filter(item=>item.warning).length,queue:last.reduce((sum,item)=>sum+item.latest.queue,0),latency:points.at(-1)?.latency_ms||0,availability:services.length?Math.min(...services.flatMap(item=>item.samples.map(sample=>sample.availability))):0,threshold:warning};
}
