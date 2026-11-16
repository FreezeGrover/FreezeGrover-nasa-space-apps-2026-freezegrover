import test from "node:test";
import assert from "node:assert/strict";
import React,{act} from "react";
import {Window} from "happy-dom";
import {evidenceText} from "../src/lib/qa/grounding";
import type {ConversationEvent,ConversationInput} from "../src/types/conversation";

test("chat keyboard, elapsed clock, cancellation, retry, context and session restoration",async()=>{
  const window=new Window({url:"http://localhost:3022"});
  for(const name of ["window","document","sessionStorage","HTMLElement","HTMLInputElement","HTMLTextAreaElement","HTMLSelectElement","HTMLDialogElement","Event","KeyboardEvent","MouseEvent","Node"]){
    Object.defineProperty(globalThis,name,{configurable:true,writable:true,value:(window as unknown as Record<string,unknown>)[name]});
  }
  (globalThis as unknown as Record<string,unknown>).React=React;
  (globalThis as unknown as Record<string,unknown>).IS_REACT_ACT_ENVIRONMENT=true;
  const originalFetch=globalThis.fetch;
  const requests:ConversationInput[]=[];
  let output:ReadableStreamDefaultController<Uint8Array>;
  let wasAborted=false;
  const encoder=new TextEncoder();
  globalThis.fetch=async(_url,options)=>{
    if(options?.method!=="POST")return Response.json({configured:true});
    requests.push(JSON.parse(options.body as string));
    const stream=new ReadableStream<Uint8Array>({start(controller){output=controller;options.signal?.addEventListener("abort",()=>{wasAborted=true;try{controller.error(new DOMException("Aborted","AbortError"));}catch{}},{once:true});}});
    return new Response(stream,{headers:{"Content-Type":"application/x-ndjson"}});
  };
  const {createRoot}=await import("react-dom/client");
  const {Dashboard}=await import("../src/components/Dashboard");
  const container=window.document.createElement("div");window.document.body.append(container);
  let root=createRoot(container as unknown as Element);
  const click=async(element:unknown)=>act(async()=>{assert.ok(element);(element as {click:()=>void}).click();});
  const button=(text:string)=>[...window.document.querySelectorAll("button")].find(node=>node.textContent.trim()===text);
  const fill=async(value:string)=>{const el=window.document.querySelector('dialog[open] textarea')??window.document.querySelector('textarea[aria-label="Research question"]');assert.ok(el);
    await act(async()=>{Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,"value")!.set!.call(el,value);el.dispatchEvent(new window.Event("input",{bubbles:true}));});return el;};
  const event=async(value:ConversationEvent)=>act(async()=>{output.enqueue(encoder.encode(JSON.stringify(value)+"\n"));});
  const finish=async()=>act(async()=>{output.close();});
  const text=()=>window.document.querySelector(".conversation-log")?.textContent??"";
  const response={query:"droplet extinction",mode:"openai" as const,recordIds:["flex"],groundingIssues:[],notice:"Interpretation requires scientific review.",statements:[{recordId:"flex",field:"objective" as const,quote:evidenceText("flex","objective").slice(0,100),interpretation:"This objective studies liquid-fuel combustion; a measured pressure trend is not established by this excerpt."}]};
  try{
    await act(async()=>root.render(React.createElement(Dashboard)));
    const input=await fill("droplet extinction");
    const shift=new window.KeyboardEvent("keydown",{key:"Enter",shiftKey:true,bubbles:true,cancelable:true});
    await act(async()=>{input.dispatchEvent(shift);});
    assert.equal(shift.defaultPrevented,false);assert.equal(requests.length,0);
    await act(async()=>{input.dispatchEvent(new window.KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true}));});
    assert.equal(requests.length,1);assert.match(text(),/droplet extinction/);
    assert.equal(window.document.querySelectorAll(".conversation-user").length,1);
    await event({type:"phase",phase:"catalog"});assert.match(text(),/Searching the local NASA/);
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,1150));});
    assert.match(text(),/[1-9]\ds? elapsed|[1-9]s elapsed/);
    await click(button("Cancel request"));assert.equal(wasAborted,true);assert.match(text(),/Request cancelled/);
    const stopped=text();await act(async()=>{await new Promise(resolve=>setTimeout(resolve,300));});assert.equal(text(),stopped);
    await click(button("Retry request"));assert.equal(requests.length,2);assert.deepEqual(requests[1],requests[0]);
    assert.equal(window.document.querySelectorAll(".conversation-user").length,1,"Retry does not duplicate the user message");
    await event({type:"result",answer:response});
    assert.doesNotMatch(text(),/liquid-fuel combustion/,'A final event is held until the response finishes');
    await finish();assert.match(text(),/liquid-fuel combustion/);
    assert.equal(window.document.querySelectorAll(".conversation-user .research-open-button").length,0,"Completed user messages have no retry action");
    await fill("Why does pressure matter?");
    await click(window.document.querySelector('dialog[open] button[aria-label="Send message"]'));
    assert.equal(requests.at(-1)?.history[0].content,"droplet extinction");
    assert.ok(requests.at(-1)?.history.some(message=>message.role==="assistant"&&message.recordIds.includes("flex")));
    await event({type:"result",answer:{...response,query:"Why does pressure matter?"}});await finish();
    await click(window.document.querySelector('button[aria-label="Close research popup"]'));
    await click(button("Compare"));
    await click(button("Continue research"));
    await fill("Compare the selected experiments");
    await click(window.document.querySelector('dialog[open] button[aria-label="Send message"]'));
    assert.equal(requests.at(-1)?.context.tab,"Compare");assert.deepEqual(requests.at(-1)?.context.recordIds,["flex","flex2"]);
    await event({type:"result",answer:{...response,query:"Compare the selected experiments"}});await finish();
    await act(async()=>root.unmount());root=createRoot(container as unknown as Element);
    await act(async()=>root.render(React.createElement(Dashboard)));
    await click(button("Continue research"));assert.match(text(),/Why does pressure matter/);assert.match(text(),/Compare the selected experiments/);
    assert.equal(requests.length,4,"Restoring a session never spends another request");
  }finally{await act(async()=>root.unmount());globalThis.fetch=originalFetch;await window.happyDOM.close();}
});
