import {conversationInputSchema, type ConversationEvent} from "@/types/conversation";
import {converseResearch} from "@/lib/research/conversation";
import {interpretConversation} from "@/lib/ai/conversation";
import {aiConfiguration} from "@/lib/ai/openai";
import {findInvestigationById} from "@/lib/research/catalog";
import {findNasaResource} from "@/lib/resources/catalog";

export const runtime="nodejs";
export async function POST(request:Request){
  const origin=request.headers.get("origin");
  if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"Cross-origin requests are not allowed."},{status:403});
  if(Number(request.headers.get("content-length")??0)>100000)return Response.json({error:"Conversation context is too large."},{status:413});
  let input;
  try{
    const raw=await request.text();
    if(raw.length>100000)return Response.json({error:"Conversation context is too large."},{status:413});
    input=conversationInputSchema.parse(JSON.parse(raw));
    if([...input.context.recordIds,...input.history.flatMap(message=>message.recordIds)].some(id=>!findInvestigationById(id)))throw new Error("UNKNOWN_RECORD");
    if([...(input.context.sourceIds??[]),...input.history.flatMap(message=>message.sourceIds??[])].some(id=>!findNasaResource(id)))throw new Error("UNKNOWN_SOURCE");
  }catch{return Response.json({error:"Enter a message of at most 1200 characters with valid conversation context."},{status:400});}
  const controller=new AbortController();
  const abort=()=>controller.abort();
  request.signal.addEventListener("abort",abort,{once:true});
  if(request.signal.aborted)abort();
  const encoder=new TextEncoder();
  const stream=new ReadableStream<Uint8Array>({
    start(output){
      let closed=false;
      const send=(event:ConversationEvent)=>{if(!closed&&!controller.signal.aborted)output.enqueue(encoder.encode(JSON.stringify(event)+"\n"));};
      void (async()=>{
        try{
          const answer=await converseResearch(input,{provider:aiConfiguration().configured?interpretConversation:undefined,signal:controller.signal,progress:phase=>send({type:"phase",phase})});
          send({type:"result",answer});
        }catch(error){
          if(!controller.signal.aborted){
            const code=error instanceof Error?error.message:"";
            console.warn("Conversation request failed",{name:error instanceof Error?error.name:"Unknown",code:/^OPENAI_[A-Z0-9_]+$/.test(code)?code:"UNEXPECTED_PROVIDER_RESPONSE"});
            const notice=code==="OPENAI_HTTP_401"?"OpenAI authentication failed.":code==="OPENAI_HTTP_429"?"OpenAI rate or quota limit reached.":code==="OPENAI_HTTP_403"?"OpenAI access was denied.":error instanceof Error&&error.name==="TimeoutError"?"The AI request timed out.":"The research request could not be completed.";
            // Do not echo provider bodies or substitute catalog text for an AI answer.
            send({type:"result",answer:{query:input.message,mode:"unavailable",recordIds:[],statements:[],groundingIssues:[],retryable:true,notice:notice+" Your conversation is intact. You can retry or browse the NASA catalog."}});
          }
        }finally{
          request.signal.removeEventListener("abort",abort);
          closed=true;
          try{output.close();}catch{}
        }
      })();
    },
    cancel(){controller.abort();request.signal.removeEventListener("abort",abort);},
  });
  return new Response(stream,{headers:{"Content-Type":"application/x-ndjson; charset=utf-8","Cache-Control":"no-store, no-transform","X-Accel-Buffering":"no"}});
}
