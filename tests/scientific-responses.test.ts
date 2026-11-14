import test from "node:test";
import assert from "node:assert/strict";
import {investigations,findInvestigationById} from "../src/lib/research/catalog";
import {retrieveInvestigations} from "../src/lib/research/search";
import {buildCatalogBriefing} from "../src/lib/research/briefing";
import {analyzeComparison} from "../src/lib/comparison/compare";
import {reviewScientificClaim} from "../src/lib/qa/review";
import {evidenceText,validateGrounding} from "../src/lib/qa/grounding";
import {answerResearchQuestion,catalogAnswer} from "../src/lib/research/answer";
import {aiConfiguration,interpretQuestion} from "../src/lib/ai/openai";
import {POST} from "../src/app/api/research/route";
import type {CitedStatement} from "../src/types/answer";
const record=(id:string)=>findInvestigationById(id)!;
test("complex questions preserve subject relevance and accept propagation spelling",()=>{
 const droplets=retrieveInvestigations(investigations,"How do oxygen and pressure affect droplet extinction in microgravity?");
 assert.ok(droplets.some(match=>match.item.id==="flex"));
 assert.ok(!droplets.some(match=>match.item.id==="bass2"));
 const solids=retrieveInvestigations(investigations,"Which experiments show whether changing ventilation and oxygen concentration alters flame propagation over solid materials in weightlessness?");
 assert.ok(solids.some(match=>match.item.id==="bass2"));
 assert.ok(!solids.some(match=>match.item.id==="flex"));
 assert.ok(catalogAnswer("how does microgravity affect flame propogation").recordIds.includes("bass2"));
});
test("briefings follow the question and never replace empty results with stock examples",()=>{
 assert.deepEqual(buildCatalogBriefing("PSI-69").map(topic=>topic.item.id),["flex"]);
 assert.deepEqual(buildCatalogBriefing("smoke",[]),[]);
 assert.equal(buildCatalogBriefing("unobtainium").length,0);
});
test("comparison changes with selected records and handles self comparison",()=>{
 const droplets=analyzeComparison(record("flex"),record("flex2"));
 assert.ok(droplets.similarities.some(text=>text.includes("MDCA")));
 const mixed=analyzeComparison(record("flex"),record("bass2"));
 assert.ok(mixed.differences.some(text=>text.includes("fuel category")));
 assert.ok(!mixed.similarities.some(text=>text.includes("MDCA")));
 assert.ok(analyzeComparison(record("flex"),record("flex")).similarities.some(text=>text.includes("same NASA")));
});
test("QA reacts to unsupported numbers and a missing comparison baseline",()=>{
 const checks=reviewScientificClaim("Flame spread increased by 999999%","bass2");
 assert.equal(checks[0].status,"Needs Review");
 assert.match(checks[0].detail,/999999/);
 assert.match(checks[2].detail,/no explicit baseline/);
 assert.match(reviewScientificClaim("Flame spread increased compared to Earth gravity","bass2")[2].detail,/baseline is mentioned/);
 assert.notEqual(reviewScientificClaim("oxygen","flex")[1].detail,reviewScientificClaim("oxygen","bass2")[1].detail);
});
test("source grounding rejects invented quotes, record IDs, numeric claims and objective-as-result wording",()=>{
 const quote=evidenceText("flex","objective").slice(0,100);
 const valid:CitedStatement={recordId:"flex",field:"objective",quote,interpretation:"This is an objective for research into liquid-fuel combustion."};
 assert.equal(validateGrounding([valid]).accepted.length,1);
 for(const bad of [{...valid,recordId:"invented"},{...valid,quote:"NASA proved an entirely invented outcome."},{...valid,interpretation:"A 999999% improvement occurred."},{...valid,interpretation:"This proves the habitat is safe."}]){
  assert.equal(validateGrounding([bad]).accepted.length,0);
 }
 assert.match(evidenceText("flex","table"),/Ambient pressure/);
});
test("a replaceable provider cannot bypass independent grounding checks",async()=>{
 const answer=await answerResearchQuestion("droplets","All",async()=>[
  {recordId:"flex",field:"objective",quote:evidenceText("flex","objective").slice(0,100),interpretation:"This objective concerns liquid-fuel research."},
  {recordId:"fake",field:"conditions",quote:"This source and experiment do not exist.",interpretation:"An invented result."},
 ]);
 assert.deepEqual(answer.recordIds,["flex"]);assert.equal(answer.groundingIssues.length,1);
 assert.match(answer.notice,/scientific review pending/);
});
test("API validates input and returns usable catalog responses without a key",async()=>{
 const previous=process.env.OPENAI_API_KEY;delete process.env.OPENAI_API_KEY;
 try{
  const request=(body:unknown,origin?:string)=>new Request("http://localhost:3022/api/research",{method:"POST",headers:{"Content-Type":"application/json",...(origin?{Origin:origin}:{})},body:JSON.stringify(body)});
  assert.equal((await POST(request({query:"x",environment:"invalid"}))).status,400);
  assert.equal((await POST(request({query:"FLEX",environment:"All"},"https://example.org"))).status,403);
  const result=await (await POST(request({query:"PSI-69",environment:"All"}))).json();
  assert.equal(result.mode,"catalog");assert.deepEqual(result.recordIds,["flex"]);assert.deepEqual(result.statements,[]);
 }finally{if(previous!==undefined)process.env.OPENAI_API_KEY=previous;}
});
test("OpenAI adapter contract is tested with a fake transport, never a paid call",async()=>{
 assert.equal(aiConfiguration({}).configured,false);
 assert.equal(aiConfiguration({OPENAI_API_KEY:"test",OPENAI_MODEL:"test",AI_MAX_REQUESTS:"0"}).configured,false);
 const previous={key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL,limit:process.env.AI_MAX_REQUESTS};
 process.env.OPENAI_API_KEY="test-not-a-real-key";process.env.OPENAI_MODEL="test-model";process.env.AI_MAX_REQUESTS="10";
 try{
  const statements:CitedStatement[]=[{recordId:"flex",field:"objective",quote:evidenceText("flex","objective").slice(0,100),interpretation:"A liquid-fuel research objective."}];
  const transport:typeof fetch=async(url,options)=>{
   assert.equal(url,"https://api.openai.com/v1/responses");
   const body=JSON.parse(options!.body as string);assert.equal(body.store,false);assert.equal(body.model,"test-model");assert.equal(body.text.format.type,"json_schema");
   assert.match(body.input,/Ambient pressure/);
   return Response.json({status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify({statements})}]}]});
  };
  assert.deepEqual(await interpretQuestion("droplets","All",transport),statements);
  await assert.rejects(()=>interpretQuestion("droplets","All",async()=>Response.json({}, {status:401})),/OPENAI_HTTP_401/);
  await assert.rejects(()=>interpretQuestion("droplets","All",async()=>Response.json({status:"incomplete"})),/OPENAI_INCOMPLETE/);
 }finally{
  for(const [name,value] of Object.entries({OPENAI_API_KEY:previous.key,OPENAI_MODEL:previous.model,AI_MAX_REQUESTS:previous.limit})){if(value===undefined)delete process.env[name];else process.env[name]=value;}
 }
});


test("spent AI allowance pauses search without replacing it with catalog results",async()=>{
 const previous={key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL,limit:process.env.AI_MAX_REQUESTS};
 const originalFetch=globalThis.fetch;
 process.env.OPENAI_API_KEY="test-not-a-real-key";process.env.OPENAI_MODEL="test-model";process.env.AI_MAX_REQUESTS="1";
 globalThis.fetch=async()=>{throw new Error("A spent allowance must not contact OpenAI");};
 try{
  const response=await POST(new Request("http://localhost:3022/api/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:"PSI-69",environment:"All"})}));
  const answer=await response.json();assert.equal(answer.mode,"unavailable");assert.deepEqual(answer.recordIds,[]);assert.match(answer.notice,/No further OpenAI request was sent/);
 }finally{
  globalThis.fetch=originalFetch;
  for(const [name,value] of Object.entries({OPENAI_API_KEY:previous.key,OPENAI_MODEL:previous.model,AI_MAX_REQUESTS:previous.limit})){if(value===undefined)delete process.env[name];else process.env[name]=value;}
 }
});
