import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {aggregate,analyticsView,rangeError,collectionView,applyBulk,validatePerson,operationsView,comparisonSearch} from '../jekyll/assets/js/dashboard-model.mjs';
const fixture=JSON.parse(fs.readFileSync(new URL('../content/dashboards.json',import.meta.url)));
test('analytics computes rates from totals and duration from weighted observations',()=>{
 const totals=aggregate([{sessions:20,downloads:3,completions:4,duration_seconds:1200},{sessions:80,downloads:7,completions:6,duration_seconds:16800}]);
 assert.equal(totals.conversion,10);assert.equal(totals.mean_duration,180);assert.equal(totals.downloads,10);
});
test('date and category scope constrain every analytic record and comparison',()=>{
 const selected=analyticsView(fixture,{start:'2026-10-22',end:'2026-10-28',category:'Research'});
 assert.equal(selected.rows.length,7);assert.equal(selected.days.length,7);assert.ok(selected.previous);
 assert.ok(selected.rows.every(row=>row.category==='Research'&&row.date>='2026-10-22'&&row.date<='2026-10-28'));
 assert.equal(selected.totals.sessions,selected.days.reduce((sum,day)=>sum+day.sessions,0));
 assert.equal(analyticsView(fixture,{start:'2026-09-03',end:'2026-09-04'}).previous,null);
 assert.ok(rangeError('2026-10-28','2026-10-22','2026-09-03','2026-10-28'));
 assert.ok(rangeError('2026-09-31','2026-10-02','2026-09-03','2026-10-28'));
});
test('collection pages clamp after filtering and bulk writes affect only selected IDs',()=>{
 const view=collectionView(fixture.people,{query:'Mara Ellis',page:8,size:5});assert.equal(view.total,1);assert.equal(view.page,1);
 const result=applyBulk(fixture.people,['P-001'],'Suspended');assert.equal(result[0].status,'Suspended');assert.deepEqual(result.slice(1),fixture.people.slice(1));assert.notEqual(result,fixture.people);
 assert.throws(()=>applyBulk(fixture.people,['P-001'],'Deleted'));
});
test('collection rejects fractional and non-finite page numbers from URLs',()=>{
 for(const page of [1.5,Infinity,NaN,'not-a-page']) {
  const view=collectionView(fixture.people,{page,size:5});
  assert.equal(view.page,1);
  assert.equal(view.rows.length,5);
 }
 assert.equal(collectionView(fixture.people,{page:999,size:5}).page,5);
});
test('editing permits the same record email but rejects a duplicate on another person',()=>{
 const person=fixture.people[0];assert.deepEqual(validatePerson(person,fixture.people,person.id),{});
 assert.ok(validatePerson({...person,id:'new'},fixture.people).email);
 assert.ok(validatePerson({...person,name:' ',email:'broken',role:'Owner'},fixture.people,person.id).name);
});
test('operational scope, threshold and acknowledgement filters remain separate',()=>{
 const low=operationsView(fixture,{threshold:50});assert.equal(low.warnings,5);
 const high=operationsView(fixture,{threshold:1000});assert.equal(high.warnings,0);
 const scoped=operationsView(fixture,{service:'SVC-04',severity:'Critical',hideAcknowledged:true});assert.equal(scoped.services.length,1);assert.equal(scoped.alerts.length,1);assert.equal(scoped.points.length,6);
 const acknowledged=fixture.alerts.map(alert=>({...alert,acknowledged:true}));assert.equal(operationsView(fixture,{hideAcknowledged:true},acknowledged).alerts.length,0);
});

test('collection behaviour accepts another record vocabulary without a new grid',()=>{
 const records=[{id:'b',title:'Beta',status:'Active'},{id:'a',title:'Alpha',status:'Active'}];
 const view=collectionView(records,{query:'Alpha',sort:'untrusted',size:5},{search:['title'],sort:['title'],defaultSort:'title'});
 assert.equal(view.total,1);assert.equal(view.rows[0].id,'a');
});

test('peer comparison receives only the selected dashboard view state',()=>{
 const search='?token=private&start=2026-10-15&category=Research&category=Other&q=Mara+Ellis&status=Active&service=SVC-04&hideAcknowledged=true';
 assert.equal(comparisonSearch('analytics',search),'start=2026-10-15&category=Research');
 assert.equal(comparisonSearch('administration',search),'q=Mara+Ellis&status=Active');
 assert.equal(comparisonSearch('operations',search),'service=SVC-04&hideAcknowledged=true');
 assert.equal(comparisonSearch('analytics','?token=private'),'');
 assert.throws(()=>comparisonSearch('unknown',search));
});

test('analytics ordering is independent of input observation order',()=>{
 const query={start:'2026-10-22',end:'2026-10-28',category:'All'};
 const expected=analyticsView(fixture,query);
 const shuffled={...fixture,analytics:[...fixture.analytics].reverse()};
 const actual=analyticsView(shuffled,query);
 assert.equal(actual.error,'');
 assert.deepEqual(actual,expected);
 assert.deepEqual(analyticsView(shuffled,{...query,category:'Research'}),analyticsView(fixture,{...query,category:'Research'}));
 assert.equal(shuffled.analytics[0],fixture.analytics.at(-1),'caller data must not be mutated');
});

test('empty analytics data is explicit and does not invent zero observations',()=>{
 const result=analyticsView({...fixture,analytics:[]},{start:'2026-10-22',end:'2026-10-28',category:'All'});
 assert.deepEqual(result,{error:'No analytics data is available in this snapshot.',empty:true});
});
