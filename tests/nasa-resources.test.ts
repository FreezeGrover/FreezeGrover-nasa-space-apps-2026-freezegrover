import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {nasaResources,findNasaResource,resourcesForInvestigation,retrieveNasaResources} from "../src/lib/resources/catalog";
import {validateResourceStatements,reviewResourceClaim,createResourceReviewNote} from "../src/lib/qa/resources";
import {investigations} from "../src/lib/research/catalog";
import {findRelevantInvestigations} from "../src/lib/ranking/rank";
import {converseResearch} from "../src/lib/research/conversation";
import {conversationHistory,readConversation} from "../src/lib/research/conversation-client";
import type {ConversationInput,ConversationMessage} from "../src/types/conversation";
import type {ResourceStatement} from "../src/types/resources";
import {POST} from "../src/app/api/conversation/route";


const source=findNasaResource("nasa-fire-detector")!,excerpt=source.excerpts[0];
const detector:ResourceStatement={sourceId:source.id,excerptId:excerpt.id,quote:excerpt.text,interpretation:"NASA's Spinoff account describes a detector that discriminates combustion particles from dust. This is a technology-transfer account, not a PSI measurement.",claimType:"application"};
const input:ConversationInput={message:"What Earth applications for fire detection does NASA document?",environment:"All",history:[],context:{tab:"Overview",recordIds:[]}};

test("all requested NASA resources, guide PDF and official captions have hashed source snapshots",()=>{
  assert.equal(nasaResources.length,11);assert.equal(nasaResources.reduce((sum,s)=>sum+s.excerpts.length,0),43);
  for(const source of nasaResources){
    assert.equal(createHash("sha256").update(readFileSync(source.snapshotPath)).digest("hex"),source.sha256);
    assert.ok(source.excerpts.length);assert.ok(source.limitations);
    assert.ok(new URL(source.url).hostname.endsWith("nasa.gov")||new URL(source.url).hostname==="www.spaceappschallenge.org"||source.url==="https://www.youtube.com/watch?v=W1oXykoz9zg");
    for(const excerpt of source.excerpts)assert.equal(createHash("sha256").update(excerpt.text).digest("hex"),excerpt.sha256);
    for(const link of source.links){assert.ok(investigations.some(item=>item.id===link.recordId));assert.ok(source.excerpts.some(item=>item.id===link.excerptId));}
  }
  assert.equal(investigations.length,24);assert.ok(!investigations.some(item=>item.id.startsWith("nasa-")));
});

test("official-resource retrieval distinguishes history, background and documented engineering",()=>{
  assert.equal(retrieveNasaResources("What happened on Mir?")[0].id,"nasa-mir-fire");
  assert.ok(retrieveNasaResources("Brunswick fire detector dust Earth applications").some(source=>source.id==="nasa-fire-detector"));
  assert.ok(resourcesForInvestigation("flex").some(source=>source.id==="nasa-combustion-guide-pdf"));
  assert.ok(!resourcesForInvestigation("bass2").some(source=>source.id==="nasa-glenn-combustion"));
  assert.ok(nasaResources.filter(source=>source.role==="Technology transfer").every(source=>source.links.length===0));
  const before=findRelevantInvestigations(investigations,"Earth Applications").map(item=>item.id);
  retrieveNasaResources("Apollo Mir Earth technology");
  assert.deepEqual(findRelevantInvestigations(investigations,"Earth Applications").map(item=>item.id),before);
});

test("resource grounding rejects fabricated lineage, numbers, quotes and source-role changes",()=>{
  assert.equal(validateResourceStatements([detector],[source.id]).accepted.length,1);
  const bad=[{...detector,quote:"An invented official quotation, not in NASA."},{...detector,claimType:"observation" as const},{...detector,interpretation:"FLEX produced this fire detector."},{...detector,interpretation:"The detector reduced false alarms by 999999%."}];
  for(const statement of bad)assert.equal(validateResourceStatements([statement],[source.id]).accepted.length,0);
  const denial={...detector,interpretation:"The supplied Spinoff account does not establish that the detector came from FLEX."};
  assert.equal(validateResourceStatements([denial],[source.id]).accepted.length,1);
  assert.equal(validateResourceStatements([{...denial,interpretation:denial.interpretation+" FLEX produced this detector."}],[source.id]).accepted.length,0);
  assert.equal(validateResourceStatements([{...denial,interpretation:"This does not establish the lineage from FLEX, but FLEX produced the detector."}],[source.id]).accepted.length,0);
  const prospective=findNasaResource("nasa-sciencecasts")!.excerpts.find(item=>item.kind==="prospect")!;
  assert.equal(validateResourceStatements([{sourceId:"nasa-sciencecasts",excerptId:prospective.id,quote:prospective.text,claimType:"application",interpretation:"This is an established commercial application."}],["nasa-sciencecasts"]).accepted.length,0);
});

test("the same safety margin is not mistaken for a reference to the SAME investigation",()=>{
  const guide=findNasaResource("nasa-combustion-guide-pdf")!,finding=guide.excerpts.find(item=>item.id==="flex-report")!;
  const statement:ResourceStatement={sourceId:guide.id,excerptId:finding.id,quote:finding.text,claimType:"observation",interpretation:"NASA's guide reports that the flammability limit is lower in reduced gravity. Terrestrial inert-gas suppressant standards therefore do not offer the same margin of safety as in normal gravity."};
  assert.equal(validateResourceStatements([statement],[guide.id]).accepted.length,1);
  assert.equal(validateResourceStatements([{...statement,claimType:"background"}],[guide.id]).accepted.length,0,"A model category mismatch is rejected, never silently relabelled");
  assert.equal(validateResourceStatements([{...detector,interpretation:"SAME produced the Brunswick detector."}],[source.id]).accepted.length,0);
  assert.doesNotMatch(reviewResourceClaim(statement.interpretation,guide.id,finding.id)[2].detail,/without an explicit relationship/);
});

test("misattributed review quotations are rejected rather than silently re-attributed",async()=>{
  const guide=findNasaResource("nasa-combustion-guide-pdf")!,excerpt=guide.excerpts.find(item=>item.id==="flex-report")!;
  const answer=await converseResearch({...input,message:"FLEX flammability limits",context:{tab:"Overview",recordIds:["flex"],sourceIds:[guide.id]}},{provider:async()=>({statements:[{recordId:"flex",field:"conditions",quote:excerpt.text,interpretation:"The guide reports lower limits."}],clarification:null})});
  assert.equal(answer.statements.length,0);assert.equal(answer.resourceStatements?.length,0);assert.ok(answer.groundingIssues.length);
});

test("resource-only conversations retain source context without inventing PSI experimental matches",async()=>{
  const answer=await converseResearch(input,{provider:async(_input,evidence)=>{assert.ok(evidence.resources?.some(item=>item.id===source.id));return {statements:[],resourceStatements:[detector],clarification:null};}});
  assert.deepEqual(answer.recordIds,[]);assert.deepEqual(answer.sourceIds,[source.id]);assert.equal(answer.resourceStatements?.length,1);
  const transcript:ConversationMessage[]=[{id:"u",role:"user",content:input.message},{id:"a",role:"assistant",content:detector.interpretation,answer}];
  const history=conversationHistory(transcript);assert.deepEqual(history[1].sourceIds,[source.id]);
  await converseResearch({...input,message:"What uncertainty remains for that application?",history},{provider:async(_input,evidence)=>{assert.ok(evidence.resources?.some(item=>item.id===source.id));return {statements:[],resourceStatements:[detector],clarification:null};}});
  let calls=0;
  const mixed=await converseResearch({...input,message:"Compare Apollo 1 with FLEX"},{provider:async()=>{calls++;return {statements:[],clarification:null};}});
  assert.equal(calls,1,"The model can discuss historical comparisons naturally while keeping roles distinct");assert.equal(mixed.statements.length,0);
  await converseResearch({...input,message:"Compare fires in FLEX and BASS"},{provider:async()=>{calls++;return {statements:[],clarification:null};}});
  assert.equal(calls,2,"Ordinary fires must not be mistaken for the FIRES protective-equipment project");
});

test("resource QA uses the actual source snapshot and never marks an incident as scientifically verified",()=>{
  const checks=reviewResourceClaim("The measured extinction limit is 999999%.","nasa-mir-fire","incident");
  assert.match(checks[0].detail,/999999/);assert.match(checks[1].detail,/Historical safety evidence/);
  assert.ok(checks.every(check=>check.status!=="Verified"));
  const note=createResourceReviewNote(source.id,"A draft about detection.")!;
  assert.equal(note.sourceHash,source.sha256);assert.equal(note.scientificStatus,"Not verified");
  assert.equal(createResourceReviewNote(source.id," "),null);
});

test("resource context is validated by the API and source-only answers survive event decoding",async()=>{
  const response=new Response(JSON.stringify({type:"result",answer:{query:input.message,mode:"openai",recordIds:[],sourceIds:[source.id],statements:[],resourceStatements:[detector],notice:"Review pending",groundingIssues:[]}})+"\n");
  assert.equal((await readConversation(response,()=>{})).resourceStatements?.[0].sourceId,source.id);
  const result=await POST(new Request("http://localhost:3022/api/conversation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...input,context:{...input.context,sourceIds:["invented"]}})}));
  assert.equal(result.status,400);
});
