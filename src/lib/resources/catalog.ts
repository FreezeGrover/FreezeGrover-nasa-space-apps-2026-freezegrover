import snapshot from "@/data/nasa-resources.json";
import type {NasaResource} from "@/types/resources";

export const nasaResources=snapshot.resources as NasaResource[];
export const findNasaResource=(id:string)=>nasaResources.find(source=>source.id===id);
export function resourcesForInvestigation(recordId:string){
  // Only curated, excerpt-backed mentions create an investigation link.
  // Shared subject matter alone must not imply that a Spinoff came from FLEX.
  return nasaResources.filter(source=>source.links.some(link=>link.recordId===recordId));
}
const stop=new Set("a an the this that it other with what why how does do about explain explore could might are is were was can and or of to in for from their say sources imported conditions experimental original nasa official research science spacecraft safety application applications earth documented related evidence implications review uncertainty more tell me there any".split(" "));
function words(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g," ").split(/\s+/).filter(word=>word&&!stop.has(word));}
export function retrieveNasaResources(query:string,recordIds:string[]=[],previousIds:string[]=[]){
  const tokens=words(query),historical=/\b(history|historical|incident|apollo|mir)\b/i.test(query);
  const technology=/\b(earth|spinoff|application|technology transfer|firefighter|equipment|brunswick|fires)\b/i.test(query);
  return nasaResources.map(source=>{
    const text=words([source.title,...source.tags,...source.excerpts.map(excerpt=>excerpt.text)].join(" ")).join(" ");
    const matches=tokens.filter(token=>new RegExp(`\\b${token}\\b`).test(text));
    const linked=source.links.some(link=>recordIds.includes(link.recordId));
    const named=query.toLowerCase().includes(source.id)||source.tags.some(tag=>/apollo|mir|brunswick|fires|sciencecasts|air tanks/i.test(tag)&&query.toLowerCase().includes(tag.toLowerCase()));
    const roleMatch=(historical&&source.role==="Historical safety evidence")||(technology&&source.role==="Technology transfer");
    return {source,score:(named?100:0)+matches.length*4+(linked?8:0)+(previousIds.includes(source.id)?5:0)+(roleMatch?6:0),relevant:named||matches.length>0||linked||previousIds.includes(source.id)||roleMatch};
  }).filter(match=>match.relevant).sort((a,b)=>b.score-a.score).slice(0,6).map(match=>match.source);
}
