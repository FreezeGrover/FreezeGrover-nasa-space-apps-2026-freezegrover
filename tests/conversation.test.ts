import test from "node:test";
import assert from "node:assert/strict";
import {converseResearch,conversationRecords,mentionedInvestigations} from "../src/lib/research/conversation";
import {evidenceText} from "../src/lib/qa/grounding";
import {interpretConversation} from "../src/lib/ai/conversation";
import {conversationHistory,readConversation} from "../src/lib/research/conversation-client";
import {POST} from "../src/app/api/conversation/route";
import type {ConversationInput,ConversationEvent} from "../src/types/conversation";

const input:ConversationInput={message:"How do oxygen and pressure affect droplet extinction in microgravity?",environment:"All",context:{tab:"Overview",recordIds:[]},history:[]};
const statement={recordId:"flex",field:"objective" as const,quote:evidenceText("flex","objective").slice(0,160),interpretation:"The source describes a liquid-fuel research objective. It does not establish a measured pressure trend."};

test("follow-ups retain prior record context while treating history as untrusted dialogue",async()=>{
  const follow={...input,message:"Why does pressure matter?",history:[{role:"user" as const,content:input.message,recordIds:[]},{role:"assistant" as const,content:"Prior answer, not new evidence.",recordIds:["flex","flex2"]}]};
  assert.ok(conversationRecords(follow).includes("flex"));
  assert.deepEqual(conversationRecords({...follow,message:"Compare that with the other experiment."}),["flex","flex2"],"Pronouns do not retrieve unrelated records through incidental prose matches");
  const phases:string[]=[];
  const answer=await converseResearch(follow,{progress:phase=>phases.push(phase),provider:async(received,evidence)=>{
    assert.equal(received.history[0].content,input.message);assert.ok(evidence.records.some(record=>record.id==="flex"));
    return {statements:[statement,{...statement,quote:"Prior answer, not new evidence."}],clarification:null};
  }});
  assert.equal(answer.statements.length,1);assert.equal(answer.groundingIssues.length,1);
  assert.deepEqual(phases,["catalog","conditions","answer","grounding"]);
});

test("ambiguous comparisons are resolved by the conversational model with dashboard context",async()=>{
  let calls=0;
  const answer=await converseResearch({...input,message:"Compare that with the other experiment.",context:{tab:"Investigations",recordIds:["flex","flex2","cfi"]}},{provider:async(received)=>{calls++;assert.equal(received.context.recordIds.length,3);return {statements:[],clarification:"Which two investigations should I compare?"};}});
  assert.match(answer.clarification??"",/Which two investigations/);assert.equal(calls,1);
  const pair={...input,message:"Compare that with the other experiment.",context:{tab:"Compare" as const,recordIds:["flex","flex2"]}};
  await converseResearch(pair,{provider:async()=>{calls++;return {statements:[statement],clarification:null};}});
  assert.equal(calls,2);
  assert.deepEqual(mentionedInvestigations("Compare FLEX-2 with BASS-II"),["bass2","flex2"]);
});

test("conversation grounding retains the numeric and objective safeguards",async()=>{
  const answer=await converseResearch(input,{provider:async()=>({statements:[{...statement,interpretation:"This proved a safe limit of 999999%."},{...statement,recordId:"invented"}],clarification:null})});
  assert.equal(answer.statements.length,0);assert.equal(answer.groundingIssues.length,2);
  assert.match(answer.notice,/do not establish/);
});

test("record identifiers are not mistaken for scientific values",async()=>{
  const quote=evidenceText("flex2","objective").slice(0,200);
  const valid={recordId:"flex2",field:"objective" as const,quote,interpretation:"FLEX-2 describes a liquid-fuel research objective."};
  const answer=await converseResearch({...input,message:"FLEX-2"},{provider:async()=>({statements:[valid,{...valid,interpretation:"FLEX-2 measured an improvement of 999999%."}],clarification:null})});
  assert.equal(answer.statements.length,1);assert.equal(answer.groundingIssues.length,1);
});

test("provider sends conversation roles, selected conditions, no stored state and a cancellable signal",async()=>{
  const previous={key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL};
  process.env.OPENAI_API_KEY="test-not-a-real-key";process.env.OPENAI_MODEL="test-model";
  try{
    const signal=new AbortController().signal;
    const history=[{role:"user" as const,content:input.message,recordIds:[]},{role:"assistant" as const,content:statement.interpretation,recordIds:["flex"]}];
    const result=await interpretConversation({...input,message:"Why pressure?",history},{missionContext:"All",records:[]},signal,async(_url,options)=>{
      const body=JSON.parse(options!.body as string);
      assert.equal(body.store,false);assert.equal(body.stream,true);assert.equal(body.model,"test-model");if(!body.instructions.startsWith("You independently"))assert.equal(body.input.at(-1).content,"Why pressure?");
      if(!body.instructions.startsWith("You independently")){assert.equal(body.input[1].role,"user");assert.equal(body.input[2].role,"assistant");}assert.ok(options?.signal);
      return Response.json({status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify(body.instructions.startsWith("You independently")?{approved:true,issues:[]}:{reply:"Hello! What would you like to explore?",claims:[]})}]}]});
    });
    assert.match(result.reply!,/Hello/);
    const completed={status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify({reply:"Hello!",claims:[]})}]}]};
    const frames='data: '+JSON.stringify({type:"response.output_text.delta",delta:"An unfinished, unsupported draft"})+'\n\n'+'data: '+JSON.stringify({type:"response.completed",response:completed})+'\n\n';
    const streamed=await interpretConversation(input,{missionContext:"All",records:[]},signal,async(_url,options)=>JSON.parse(options!.body as string).instructions.startsWith("You independently")?Response.json({status:"completed",output:[{content:[{type:"output_text",text:JSON.stringify({approved:true,issues:[]})}]}]}):new Response(frames,{headers:{"Content-Type":"text/event-stream"}}));
    assert.equal(streamed.reply,"Hello!");assert.deepEqual(streamed.statements,[]);
    await assert.rejects(()=>interpretConversation(input,{missionContext:"All",records:[]},signal,async()=>new Response('data: {"type":"response.output_text.delta","delta":"unfinished"}\n\n',{headers:{"Content-Type":"text/event-stream"}})),/INCOMPLETE/);
    await assert.rejects(()=>interpretConversation(input,{missionContext:"All",records:[]},signal,async()=>Response.json({status:"incomplete"})),/INCOMPLETE/);
  }finally{for(const [name,value] of Object.entries({OPENAI_API_KEY:previous.key,OPENAI_MODEL:previous.model})){if(value===undefined)delete process.env[name];else process.env[name]=value;}}
});

test("event reader handles fragmented UTF-8 and rejects an interrupted final answer",async()=>{
  const answer={query:"x",mode:"catalog" as const,recordIds:[],statements:[],groundingIssues:[],notice:"Pressure — context"};
  const bytes=new TextEncoder().encode(JSON.stringify({type:"phase",phase:"catalog"})+"\n"+JSON.stringify({type:"result",answer})+"\n");
  const stream=new ReadableStream<Uint8Array>({start(controller){for(const byte of bytes)controller.enqueue(new Uint8Array([byte]));controller.close();}});
  const phases:string[]=[];
  assert.equal((await readConversation(new Response(stream),phase=>phases.push(phase))).notice,answer.notice);
  assert.deepEqual(phases,["catalog"]);
  await assert.rejects(()=>readConversation(new Response('{"type":"phase","phase":"answer"}\n'),()=>{}),/before a complete/);
  const messages=Array.from({length:24},(_,i)=>({id:String(i),role:"user" as const,content:"question "+i,status:"complete" as const}));
  assert.equal(conversationHistory(messages).length,20);assert.equal(messages.length,24);
});

test("conversation route validates input, streams real local stages and reports provider failure truthfully",async()=>{
  const previous={key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL,fetch:globalThis.fetch};
  const request=(body:unknown,origin?:string)=>new Request("http://localhost:3022/api/conversation",{method:"POST",headers:{"Content-Type":"application/json",...(origin?{Origin:origin}:{})},body:JSON.stringify(body)});
  try{
    delete process.env.OPENAI_API_KEY;
    assert.equal((await POST(request({...input,message:""}))).status,400);
    assert.equal((await POST(request({...input,context:{...input.context,recordIds:["fake"]}}))).status,400);
    assert.equal((await POST(request(input,"https://example.org"))).status,403);
    const response=await POST(request(input));assert.match(response.headers.get("content-type")!,/ndjson/);
    const events=(await response.text()).trim().split("\n").map(line=>JSON.parse(line) as ConversationEvent);
    assert.equal(events.at(-1)?.type,"result");
    assert.deepEqual(events.filter(event=>event.type==="phase").map(event=>event.phase),["catalog","conditions"]);
    process.env.OPENAI_API_KEY="test-not-a-real-key";process.env.OPENAI_MODEL="test-model";
    globalThis.fetch=async()=>Response.json({error:"do not echo this"},{status:429});
    const failed=await readConversation(await POST(request(input)),()=>{});
    assert.equal(failed.retryable,true);assert.equal(failed.mode,"unavailable");assert.match(failed.notice,/quota/);assert.doesNotMatch(failed.notice,/do not echo/);
    globalThis.fetch=async()=>{throw new DOMException("Provider timed out","TimeoutError");};
    const timeout=await readConversation(await POST(request(input)),()=>{});
    assert.match(timeout.notice,/timed out/);assert.equal(timeout.retryable,true);
    let providerSignal:AbortSignal|undefined;
    globalThis.fetch=async(_url,options)=>new Promise((_resolve,reject)=>{providerSignal=options?.signal??undefined;providerSignal?.addEventListener("abort",()=>reject(new DOMException("Cancelled","AbortError")),{once:true});});
    const cancellation=await POST(request(input));
    const reader=cancellation.body!.getReader();await reader.read();
    await reader.cancel();assert.equal(providerSignal?.aborted,true,"Closing the client stream cancels the provider transport");
  }finally{globalThis.fetch=previous.fetch;for(const [name,value] of Object.entries({OPENAI_API_KEY:previous.key,OPENAI_MODEL:previous.model})){if(value===undefined)delete process.env[name];else process.env[name]=value;}}
});
