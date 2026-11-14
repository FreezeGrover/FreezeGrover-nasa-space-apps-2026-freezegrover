import test from 'node:test';
import assert from 'node:assert/strict';
import {investigations, searchInvestigations} from '../src/lib/research/catalog';
import {retrieveInvestigations} from '../src/lib/research/search';
import {emptyFilters,filterInvestigations,filterDefinitions} from '../src/lib/research/filters';
import {findSharedHardware,getExperimentMetadata} from '../src/lib/research/metadata';
const ids=(items:typeof investigations)=>items.map(item=>item.id);
test('natural-language flame-spread question retrieves the actual solid-fuel research first',()=>{
 const matches=retrieveInvestigations(investigations,'How does microgravity affect flame spread?');
 assert.equal(matches[0].item.id,'bass2');assert.ok(matches[0].reasons.includes('Topic: spread'));
 assert.deepEqual(ids(searchInvestigations('how does microgravity affect flame propagation')),['bass2']);
});
test('unsupported questions do not become fabricated gravity or generic flame results',()=>{
 for(const query of ['how does microgravity affect banana growth','unobtainium','how does microgravity affect zebras','how does lunar gravity affect flame spread','how does microgravity affect']) assert.deepEqual(searchInvestigations(query),[],query);
});
test('search handles names, punctuation, smoke questions and empty input',()=>{
 assert.deepEqual(ids(searchInvestigations('FLEX-2')),['flex2']);
 assert.ok(searchInvestigations('How do smoke particles behave in microgravity?').some(item=>item.id==='samer'));
 assert.equal(searchInvestigations('').length,4);
});
test('fuel dropdown filters liquid, solid and smoke categories',()=>{
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,fuel:'liquid'})),['flex','flex2']);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,fuel:'solid'})),['bass2']);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,fuel:'smoke'})),['samer']);
});
test('oxygen/pressure dropdown separates source-described protocol from unavailable data',()=>{
 for(const conditions of ['oxygen','pressure']) assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,conditions})),['flex']);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,conditions:'unknown'})),['flex2','bass2','samer']);
});
test('gravity dropdown exposes catalog coverage without inventing partial-gravity records',()=>{
 assert.equal(filterInvestigations(investigations,{...emptyFilters,gravity:'microgravity'}).length,4);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,gravity:'normal-comparison'})),['bass2','samer']);
 assert.deepEqual(filterInvestigations(investigations,{...emptyFilters,gravity:'partial'}),[]);
});
test('hardware dropdown identifies shared apparatus and honest missing metadata',()=>{
 for(const hardware of ['MDCA','CIR']) assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,hardware})),['flex','flex2']);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,hardware:'SAME'})),['samer']);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,hardware:'unknown'})),['bass2']);
});
test('related PSI dropdown follows explicit NASA-supported relationships',()=>{
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,related:'PSI-102'})),['samer']);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,related:'PSI-62'})),['bass2']);
 assert.deepEqual(ids(filterInvestigations(investigations,{...emptyFilters,related:'droplets'})),['flex','flex2']);
 assert.equal(filterInvestigations(investigations,{...emptyFilters,related:'linked'}).length,4);
});
test('filters intersect the search results and reset restores the catalog',()=>{
 const found=searchInvestigations('How does microgravity affect flame spread?');
 assert.deepEqual(filterInvestigations(found,{...emptyFilters,fuel:'liquid'}),[]);
 assert.equal(filterInvestigations(investigations,emptyFilters).length,4);
 assert.equal(filterDefinitions.length,5);
});
test('shared hardware and missing evidence remain distinct from verified outcomes',()=>{
 assert.deepEqual(findSharedHardware('flex'),[{id:'flex2',hardware:['MDCA','CIR']}]);
 assert.deepEqual(findSharedHardware('bass2'),[]);
 assert.match(getExperimentMetadata('flex2').gravityGap,/catalog coverage gap/);
 assert.equal(getExperimentMetadata('flex2').pressureProtocol,null);
});
