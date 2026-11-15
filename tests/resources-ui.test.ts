import test from "node:test";
import assert from "node:assert/strict";
import React,{act} from "react";
import {Window} from "happy-dom";
import {findNasaResource} from "../src/lib/resources/catalog";

test("official-source exploration, resource QA and conversational follow-up work without masquerading as PSI evidence",async()=>{
  const window=new Window({url:"http://localhost:3022"});
  for(const name of ["window","document","sessionStorage","HTMLElement","HTMLInputElement","HTMLTextAreaElement","HTMLSelectElement","HTMLDialogElement","Event","MouseEvent","Node"]){Object.defineProperty(globalThis,name,{configurable:true,writable:true,value:(window as unknown as Record<string,unknown>)[name]});}
  (globalThis as unknown as Record<string,unknown>).React=React;(globalThis as unknown as Record<string,unknown>).IS_REACT_ACT_ENVIRONMENT=true;
  const original=globalThis.fetch;let request:Record<string,unknown>|undefined;
  const source=findNasaResource("nasa-air-tanks")!,excerpt=source.excerpts[0];
  globalThis.fetch=async(_url,options)=>{
    if(options?.method!=="POST")return Response.json({configured:true});
    request=JSON.parse(options.body as string);
    return new Response(JSON.stringify({type:"result",answer:{query:request!.message,mode:"openai",recordIds:[],sourceIds:[source.id],statements:[],resourceStatements:[{sourceId:source.id,excerptId:excerpt.id,quote:excerpt.text,interpretation:"NASA documents lightweight firefighter air tanks developed with Scott Aviation. The source does not establish lineage from a PSI experiment.",claimType:"application"}],groundingIssues:[],notice:"Scientific interpretation pending review."}})+"\n");
  };
  const {createRoot}=await import("react-dom/client");const {Dashboard}=await import("../src/components/Dashboard");
  const container=window.document.createElement("div");window.document.body.append(container);const root=createRoot(container as unknown as Element);
  const buttons=()=>[...window.document.querySelectorAll("button")];const click=async(el:unknown)=>act(async()=>{assert.ok(el);(el as {click:()=>void}).click();});
  const dialog=()=>window.document.querySelector("dialog[open]")!;
  try{
    await act(async()=>root.render(React.createElement(Dashboard)));
    await click(buttons().find(button=>button.textContent.startsWith("From Space to Earth")));
    assert.match(dialog().textContent,/Technology transfer/);assert.match(dialog().textContent,/Fireman's Air Tanks/);
    const resource=dialog().querySelector(".qa-check-detail")!;
    assert.ok([...resource.querySelectorAll("a")].some(link=>link.getAttribute("href")==="https://spinoff.nasa.gov/node/9582"));
    await click([...resource.querySelectorAll("button")].find(button=>button.textContent==="Review official source in Scientific QA ↗"));
    assert.equal(window.document.querySelector("dialog[open]"),null);
    assert.match(window.document.querySelector(".qa-review-card h3")!.textContent,/Fireman's Air Tanks/);
    await click(window.document.querySelectorAll(".qa-area-card")[1]);assert.match(dialog().textContent,/Technology transfer/);assert.doesNotMatch(dialog().textContent,/Selected conditions:.*BASS/);
    await click(buttons().find(button=>button.getAttribute("aria-label")==="Close research popup"));
    await click(buttons().find(button=>button.textContent==="Save review note"));await click(buttons().find(button=>button.textContent.startsWith("Review history")));
    assert.match(dialog().textContent,/Fireman's Air Tanks/);assert.match(dialog().textContent,/Not scientifically verified/);
    await click(buttons().find(button=>button.getAttribute("aria-label")==="Close research popup"));
    await click(buttons().find(button=>button.textContent==="Overview"));
    await click(buttons().find(button=>button.textContent.startsWith("From Space to Earth")));
    await click([...dialog().querySelectorAll("button")].find(button=>button.textContent==="Explore documented Earth application ↗"));
    assert.match(dialog().textContent,/NASA documents lightweight firefighter/);assert.match(dialog().textContent,/Fireman's Air Tanks/);
    assert.ok(request);assert.deepEqual((request.context as {sourceIds:string[]}).sourceIds,[source.id]);
    assert.equal(dialog().querySelectorAll(".result-row").length,0,"Resource statements do not become experimental investigation rows");
    await click(buttons().find(button=>button.textContent==="Browse NASA investigations ↗"));
    assert.match(dialog().textContent,/NASA documents lightweight firefighter/,"Browsing PSI must not discard a resource-only answer");
    assert.equal(dialog().querySelectorAll(".result-row").length,0);
    const stored=window.sessionStorage.getItem("flames-research-conversation-v1")!;assert.match(stored,/nasa-air-tanks/);
  }finally{await act(async()=>root.unmount());globalThis.fetch=original;await window.happyDOM.close();}
});
