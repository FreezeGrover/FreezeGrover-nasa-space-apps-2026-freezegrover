import test from "node:test";
import assert from "node:assert/strict";
import React,{act} from "react";
import {Window} from "happy-dom";
import {catalogAnswer} from "../src/lib/research/answer";
import {evidenceText} from "../src/lib/qa/grounding";

test("five-tab DOM workflow: search, dismissal, filters, comparison, ranking and QA",async()=>{
 const window=new Window({url:"http://localhost:3022"});
 const globals=globalThis as unknown as Record<string,unknown>;
 for(const name of ["window","document","HTMLElement","HTMLInputElement","HTMLTextAreaElement","HTMLSelectElement","HTMLDialogElement","Event","MouseEvent","Node"]){
  Object.defineProperty(globalThis,name,{configurable:true,writable:true,value:(window as unknown as Record<string,unknown>)[name]});
 }
 globals.React=React;globals.IS_REACT_ACT_ENVIRONMENT=true;
 const originalFetch=globalThis.fetch;
 let finishSearch:((response:Response)=>void)|undefined;
 let requestCount=0;
 globalThis.fetch=async(_url,options)=>{
  if(options?.method!=="POST")return Response.json({configured:false});
  requestCount++;
  return new Promise<Response>(resolve=>{finishSearch=resolve;});
 };
 const {createRoot}=await import("react-dom/client");
 const {Dashboard}=await import("../src/components/Dashboard");
 const container=window.document.createElement("div");window.document.body.append(container);
 const root=createRoot(container as unknown as Element);
 const buttons=()=>[...window.document.querySelectorAll("button")];
 const button=(text:string)=>{const found=buttons().find(el=>el.textContent.trim()===text);assert.ok(found,"Button not found: "+text);return found;};
 const click=async(el:unknown)=>{await act(async()=>{(el as {click:()=>void}).click();});};
 const close=async()=>{const el=window.document.querySelector('button[aria-label="Close research popup"]');assert.ok(el);await click(el);};
 const dialog=()=>window.document.querySelector("dialog[open]");
 const field=async(selector:string,value:string,event="input")=>{
  const el=window.document.querySelector(selector);assert.ok(el);
  const proto=el.tagName==="TEXTAREA"?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;
  await act(async()=>{Object.getOwnPropertyDescriptor(proto,"value")!.set!.call(el,value);el.dispatchEvent(new window.Event(event,{bubbles:true}));});
 };
 try{
  await act(async()=>{root.render(React.createElement(Dashboard));});
  assert.equal(window.document.querySelectorAll("nav button").length,5);
  await field('input[aria-label="Research question"]',"How does microgravity affect flame propagation");
  await act(async()=>{window.document.querySelector("form")!.dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true}));});
  assert.ok(dialog());assert.match(dialog()!.textContent,/Fetching information/);
  assert.equal(window.document.querySelectorAll(".result-row").length,0,"No provisional results may flash during a request");
  assert.doesNotMatch(dialog()!.textContent,/BASS-II|No documented records/);
  assert.equal(window.document.querySelector('.research-search button')!.getAttribute("disabled"),"");
  await act(async()=>{window.document.querySelector("form")!.dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true}));});
  assert.equal(requestCount,1,"Duplicate submissions must not spend another AI attempt");
  await act(async()=>{finishSearch!(Response.json(catalogAnswer("How does microgravity affect flame propagation")));});
  globalThis.fetch=async(_url,options)=>options?.method==="POST"?Response.json(catalogAnswer(JSON.parse(options.body as string).query)):Response.json({configured:false});
  assert.match(dialog()!.textContent,/BASS-II/);assert.doesNotMatch(dialog()!.textContent,/Fetching information/);
  await close();await click(button("Compare"));await click(button("Investigations"));
  assert.equal(dialog(),null,"A dismissed search must not reopen on tab navigation");
  assert.equal((window.document.querySelector('input[aria-label="Research question"]') as unknown as HTMLInputElement).value,"How does microgravity affect flame propagation");
  assert.equal(window.document.querySelectorAll(".filter-dropdowns select").length,5);
  const fuel=window.document.querySelector(".filter-dropdowns select")!;
  await act(async()=>{(fuel as unknown as HTMLSelectElement).value="liquid";fuel.dispatchEvent(new window.Event("change",{bubbles:true}));});
  assert.match(window.document.querySelector(".investigation-columns")!.textContent,/No matches/);
  assert.equal(window.document.querySelectorAll(".investigation-columns .panel").length,2);
  await click(button("Reset filters"));
  for(const select of window.document.querySelectorAll(".filter-dropdowns select")){
   const option=select.querySelectorAll("option")[1];
   await act(async()=>{(select as unknown as HTMLSelectElement).value=option.getAttribute("value")!;select.dispatchEvent(new window.Event("change",{bubbles:true}));});
   assert.equal(dialog(),null,"Changing a filter must not open a popup");
   await click(button("Reset filters"));
  }
  await click(button("View search results · 6 ↗"));assert.ok(dialog());
  await click(window.document.querySelector(".research-dialog .result-row")!);
  assert.match(dialog()!.textContent,/Burning and Suppression of Solids/);await close();
  await click(button("Compare"));await click(window.document.querySelector(".compare-controls .search-button")!);
  assert.match(dialog()!.textContent,/Shared documented hardware.*MDCA/);await close();
  await click(window.document.querySelector('button[aria-label="Choose Investigation B"]')!);
  await click([...window.document.querySelectorAll(".picker-result")].find(el=>el.querySelector("strong")?.textContent==="BASS-II")!);
  await click(window.document.querySelector(".compare-controls .search-button")!);
  assert.match(dialog()!.textContent,/fuel category/);await close();
  await click(button("Rankings"));await click([...window.document.querySelectorAll(".goal-options button")].find(el=>el.textContent.includes("Earth Applications"))!);
  await click(button("Environment: All · Choose ↗"));await click(button("Lunar Bases"));
  const browse=buttons().find(el=>el.textContent.startsWith("Browse all"));assert.ok(browse);await click(browse);
  assert.match(dialog()!.textContent,/Earth Applications/);assert.match(dialog()!.textContent,/Lunar context/);assert.ok(dialog()!.querySelectorAll(".ranking-row").length>0);await close();
  await click(button("Scientific QA"));await field("#qa-statement","Flame spread increased by 999999%");
  await click(window.document.querySelector(".qa-area-card")!);
  assert.match(dialog()!.textContent,/999999/);await close();
  await click(button("Save review note"));await click(buttons().find(el=>el.textContent.startsWith("Review history"))!);
  assert.match(dialog()!.textContent,/999999/);await close();
  await click(button("Overview"));assert.equal(dialog(),null);
  globalThis.fetch=async()=>Response.json({query:"PSI-69",mode:"openai",recordIds:["flex"],notice:"Test transport only",groundingIssues:[],statements:[{recordId:"flex",field:"objective",quote:evidenceText("flex","objective").slice(0,100),interpretation:"A liquid-fuel research objective."}]});
  await field('input[aria-label="Research question"]',"PSI-69");
  await act(async()=>{window.document.querySelector("form")!.dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true}));});
  await click(button("Review statement in Scientific QA ↗"));
  assert.equal(window.document.querySelector(".page-title")!.textContent,"Scientific QA");
  assert.equal((window.document.querySelector("#qa-statement") as unknown as HTMLTextAreaElement).value,"A liquid-fuel research objective.");
  await click(button("Overview"));
  let pausedRequests=0;
  globalThis.fetch=async()=>{pausedRequests++;return Response.json({query:"PSI-69",mode:"unavailable",recordIds:[],statements:[],groundingIssues:[],notice:"AI allowance used. No further OpenAI request was sent."});};
  await act(async()=>{window.document.querySelector("form")!.dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true}));});
  assert.match(dialog()!.textContent,/AI Search Paused/);
  assert.doesNotMatch(dialog()!.textContent,/No documented records/);
  assert.equal(dialog()!.querySelectorAll(".result-row").length,0);
  await click(button("Browse catalog matches instead ↗"));
  assert.match(dialog()!.textContent,/FLEX/);assert.equal(pausedRequests,1);

 }finally{
  await act(async()=>root.unmount());
  globalThis.fetch=originalFetch;
  await window.happyDOM.close();
 }
});
