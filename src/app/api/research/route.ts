import {z} from "zod";
import type {ResearchAnswer} from "@/types/answer";
import {aiConfiguration,aiStatus,interpretQuestion} from "@/lib/ai/openai";
import {answerResearchQuestion,catalogAnswer} from "@/lib/research/answer";
export const runtime="nodejs";
const input=z.object({query:z.string().max(1200),environment:z.enum(["All","Spacecraft","Space Stations","Lunar Bases","Martian Bases","Pressurized Rovers"])}).strict();
export function GET(){return Response.json(aiStatus(),{headers:{"Cache-Control":"no-store"}});}
export async function POST(request:Request){
  const url=new URL(request.url);const origin=request.headers.get("origin");
  if(origin && origin!==url.origin) return Response.json({error:"Cross-origin requests are not allowed."},{status:403});
  if(Number(request.headers.get("content-length")??0)>10000) return Response.json({error:"Question too large."},{status:413});
  let value;
  try {const body=await request.text();if(body.length>10000) return Response.json({error:"Question too large."},{status:413});value=input.parse(JSON.parse(body));}catch{return Response.json({error:"Enter a question of at most 1200 characters and a valid environment."},{status:400});}
  let answer:ResearchAnswer;
  if(!value.query.trim() || !aiConfiguration().configured) answer=catalogAnswer(value.query);
  else try {answer=await answerResearchQuestion(value.query,value.environment,interpretQuestion);}
  catch(error){
    // Keep the useful catalog available after a provider failure.
    // Error bodies are never echoed because they may contain request data.
    const code=error instanceof Error?error.message:"";
    const reason=code==="OPENAI_HTTP_401" ? "OpenAI authentication failed." :
      code==="OPENAI_HTTP_429" ? "OpenAI rate or quota limit reached." :
      code==="OPENAI_HTTP_403" ? "OpenAI access was denied." : "OpenAI could not complete a source-grounded response.";
    answer=catalogAnswer(value.query,reason+" Showing catalog matches only.");
  }
  return Response.json(answer,{headers:{"Cache-Control":"no-store"}});
}
