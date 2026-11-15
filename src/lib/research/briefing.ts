import {investigations} from "./catalog";
import {retrieveInvestigations} from "./search";
import type {Investigation} from "@/types/research";
export function buildCatalogBriefing(query:string,records?:Investigation[]){
 // A filtered result list takes priority over the full catalog.
 // An empty list stays empty rather than quietly showing unrelated examples.
 const matches=records??retrieveInvestigations(investigations,query).map(match=>match.item);
 return matches.slice(0,3).map(item=>({item,excerpt:item.purpose.split(/(?<=[.!?])\s/)[0].slice(0,150)}));
}
