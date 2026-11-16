import {z} from "zod";
import {conversationInputSchema, type ConversationAnswer, type ConversationMessage, type HistoryMessage, type ResearchPhase} from "@/types/conversation";

const answerSchema=z.object({query:z.string(),mode:z.enum(["openai","catalog","unavailable"]),recordIds:z.array(z.string()),
  statements:z.array(z.object({citationNumber:z.number().optional(),recordId:z.string(),field:z.enum(["objective","approach","measurements","conditions","table"]),quote:z.string(),interpretation:z.string()})),
  reply:z.string().optional(),audit:z.object({promptVersion:z.string(),frameworkVersion:z.string(),toolTrace:z.array(z.string()),checks:z.array(z.string()),scientificStatus:z.string()}).optional(),notice:z.string(),groundingIssues:z.array(z.string()),clarification:z.string().optional(),retryable:z.boolean().optional(),
  sourceIds:z.array(z.string()).optional(),resourceStatements:z.array(z.object({citationNumber:z.number().optional(),sourceId:z.string(),excerptId:z.string(),quote:z.string(),interpretation:z.string(),claimType:z.enum(["background","observation","history","application","prospect"])})).optional()});
const eventSchema=z.discriminatedUnion("type",[
  z.object({type:z.literal("phase"),phase:z.enum(["catalog","conditions","answer","grounding"])}),
  z.object({type:z.literal("result"),answer:answerSchema}),
]);
export const storedConversationSchema=z.array(z.object({id:z.string(),role:z.enum(["user","assistant"]),content:z.string(),
  answer:answerSchema.optional(),status:z.enum(["complete","failed","cancelled"]).optional(),elapsed:z.number().optional(),request:conversationInputSchema.optional()}));

export function conversationHistory(messages:ConversationMessage[]):HistoryMessage[]{
  const selected:HistoryMessage[]=[];
  let size=0;
  // Keep the entire transcript on screen. Bound only the context sent per request,
  // and disclose that window in the conversation instead of implying endless memory.
  for(const message of [...messages].reverse()){
    if(message.status==="failed"||message.status==="cancelled"||!message.content.trim())continue;
    if(selected.length===20||size+message.content.length>48000)break;
    size+=message.content.length;
    selected.unshift({role:message.role,content:message.content,recordIds:message.answer?.recordIds??[],...(message.answer?.sourceIds?{sourceIds:message.answer.sourceIds}:{})});
  }
  return selected;
}

export async function readConversation(response:Response,onPhase:(phase:ResearchPhase)=>void,signal?:AbortSignal):Promise<ConversationAnswer>{
  if(!response.ok)throw new Error(response.status===400?"The message or conversation context was rejected. Please shorten the message or start a new conversation.":"The research service could not complete the request.");
  if(!response.body)throw new Error("The research service returned an empty response.");
  const reader=response.body.getReader();
  const decoder=new TextDecoder();
  let pending="",size=0,result:ConversationAnswer|undefined;
  const line=(value:string)=>{
    if(!value.trim())return;
    const event=eventSchema.parse(JSON.parse(value));
    if(event.type==="phase")onPhase(event.phase);else result=event.answer;
  };
  try{
    while(true){
      signal?.throwIfAborted();
      const {done,value}=await reader.read();
      if(done)break;
      size+=value.byteLength;
      if(size>200000)throw new Error("The research response was too large.");
      pending+=decoder.decode(value,{stream:true});
      let boundary;
      while((boundary=pending.indexOf("\n"))!==-1){line(pending.slice(0,boundary));pending=pending.slice(boundary+1);}
    }
    pending+=decoder.decode();line(pending);
    if(!result)throw new Error("The connection ended before a complete, checked answer arrived.");
    return result;
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
