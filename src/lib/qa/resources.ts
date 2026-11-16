import {findNasaResource} from "../resources/catalog";
import {unsupportedNumericValues} from "./numbers";
import {mentionedInvestigations} from "../research/identities";
import type {ResourceStatement} from "@/types/resources";
import type {ReviewCheck} from "./review";

function namedInvestigationsInProse(text:string){
  // SAME is an experiment acronym, but “the same safety margin” is ordinary
  // language. Only the uppercase acronym counts as that identity in prose.
  return mentionedInvestigations(text.replace(/\bsame\b/gi,word=>word==="SAME"?word:""));
}

function affirmativeConnectionText(text:string){
  // “This source does not establish that the detector came from FLEX” is an
  // honest limit on attribution. A later affirmative sentence still gets checked.
  return text.replace(/\b(?:does not|do not|doesn't|doesn’t|cannot)\s+(?:document|establish|demonstrate|show|identify|support|prove)\b[^.!?;]*\b(?:link\w*|lineage|deriv\w*|came from|develop\w*|origin|connection|causal|produced|caused)[^.!?;]*(?:[.!?;]|$)/gi,
    clause=>/\b(but|however|yet|although|nevertheless)\b/i.test(clause)?clause:"");
}

export function validateResourceStatements(statements:ResourceStatement[],allowedSourceIds:string[]){
  const accepted:ResourceStatement[]=[],issues:string[]=[];
  for(const statement of statements){
    const source=findNasaResource(statement.sourceId),excerpt=source?.excerpts.find(item=>item.id===statement.excerptId);
    let reason="";
    if(!source||!excerpt||!allowedSourceIds.includes(statement.sourceId))reason="its official source or excerpt was outside the retrieved context";
    else if(statement.quote.trim().length<20||!excerpt.text.includes(statement.quote))reason="its quote was not found in the named NASA excerpt";
    else if(statement.claimType!==excerpt.kind)reason="it changed the source's scientific role or turned a research prospect into an established result";
    else if(unsupportedNumericValues(statement.interpretation,statement.quote).length)reason="it introduced unsupported numeric text";
    else if(namedInvestigationsInProse(affirmativeConnectionText(statement.interpretation)).some(id=>!source.links.some(link=>link.recordId===id&&link.excerptId===excerpt.id)))reason="it connected an investigation without an explicit source-backed relationship";
    else if(/\b(certified safe|proven safe|guarantees? safety|eliminates? (?:all )?risk)\b/i.test(statement.interpretation))reason="it asserted an unsupported safety guarantee";
    else if((source.role!=="Scientific background"||excerpt.kind!=="observation")&&/\b(controlled experiment (?:proved|showed)|measured extinction limit|experimentally validated)\b/i.test(statement.interpretation))reason="it presented context as primary experimental validation";
    // A review can report an observation while remaining a background source.
    // The inspected excerpt supplies that label; a model cannot promote a prospect.
    if(reason)issues.push("An official-resource statement was withheld because "+reason+".");else accepted.push(statement);
  }
  // These are provenance and applicability checks, not a semantic truth engine.
  return {accepted,issues};
}

export function reviewResourceClaim(claim:string,sourceId:string,excerptId?:string):ReviewCheck[]{
  const source=findNasaResource(sourceId);
  if(!source)throw new Error("Unknown NASA source");
  const excerpts=excerptId?source.excerpts.filter(item=>item.id===excerptId):source.excerpts;
  const unsupported=unsupportedNumericValues(claim,excerpts.map(excerpt=>excerpt.text).join(" "));
  const unlinked=namedInvestigationsInProse(affirmativeConnectionText(claim)).filter(id=>!source.links.some(link=>link.recordId===id&&excerpts.some(excerpt=>excerpt.id===link.excerptId)));
  return [
    {title:"Source Grounding",question:"Is the attribution traceable to this official NASA snapshot?",status:unsupported.length?"Needs Review":"Pending Evidence",detail:`${source.title}. Retrieved ${source.retrievedAt}. SHA-256 ${source.sha256}. ${unsupported.length?"Numeric text not supported by the selected excerpt: "+unsupported.join(", ")+".":"Quote presence alone does not establish that the claim follows."} Original: ${source.url}`},
    {title:"Experimental Conditions",question:"What kind of evidence does this source actually provide?",status:"Pending Evidence",detail:`${source.role}. ${source.limitations} Locators: ${excerpts.map(excerpt=>excerpt.locator).join("; ")}. No controlled experimental conditions are inferred from an incident or equipment article.`},
    {title:"Uncertainty & Gaps",question:"Are an observation, interpretation and cross-source connection being kept distinct?",status:claim.trim()?"Needs Review":"Pending Review",detail:unlinked.length?"An investigation is mentioned without an explicit relationship in the selected source excerpt. A thematic connection does not establish experimental applicability or technology lineage.":"Check the original wording and time frame. Research prospects are not demonstrated applications; reported review findings are not newly analysed PSI measurements."},
    {title:"Independent Assessment",question:"Has a separate scientific reviewer assessed this interpretation?",status:"Pending Review",detail:"Deterministic provenance, numeric and source-role checks run independently of answer generation. Conversational replies receive a separate automated semantic review; drafts entered here receive deterministic checks and still need human scientific review. Historical context and technology transfer do not add experimental ranking scores."},
  ];
}

export interface ResourceReviewNote {sourceId:string;statement:string;time:string;sourceHash:string;scientificStatus:"Not verified"}
export function createResourceReviewNote(sourceId:string,statement:string):ResourceReviewNote|null{
  const source=findNasaResource(sourceId);
  if(!source||!statement.trim())return null;
  return {sourceId,statement:statement.trim(),time:new Date().toISOString(),sourceHash:source.sha256,scientificStatus:"Not verified"};
}
