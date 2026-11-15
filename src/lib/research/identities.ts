import {investigations} from "./catalog";

export function mentionedInvestigations(text:string):string[] {
  let remaining=text;
  const found:string[]=[];
  // Match longer names first so FLEX-2 does not also become a mention of FLEX.
  const aliases=investigations.flatMap(item=>[item.name,item.sourceLabel.split(" · ")[0],item.id].map(alias=>({id:item.id,alias})))
    .sort((a,b)=>b.alias.length-a.alias.length);
  for(const {id,alias} of aliases){
    const escaped=(alias.toUpperCase()==="SAME"?"SAME":alias).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const pattern=new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`,alias.toUpperCase()==="SAME"?"g":"gi");
    if(pattern.test(remaining)){found.push(id);remaining=remaining.replace(pattern," ");}
  }
  return [...new Set(found)];
}
