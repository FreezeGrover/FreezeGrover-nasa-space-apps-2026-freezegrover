import {getInvestigationEvidence,findInvestigationById} from "../research/catalog";
import {getExperimentMetadata} from "../research/metadata";
export interface ReviewCheck {title:string;question:string;status:string;detail:string;}
export function reviewScientificClaim(claim:string,investigationId="bass2"):ReviewCheck[]{
 const evidence=getInvestigationEvidence(investigationId),record=findInvestigationById(investigationId)!;
 const metadata=getExperimentMetadata(investigationId);
 const source=[evidence.objective,evidence.approach,record.measurements,record.conditions].join(" ");
 const numbers=claim.match(/\d+(?:\.\d+)?(?:\s*%)?/g)??[];
 // A number absent from the narrative needs checking in the original tables.
 // A matching number alone does not prove that its quantity or units are correct.
 const unsupported=numbers.filter(number=>!source.includes(number));
 const comparative=/\b(increas|decreas|higher|lower|faster|slower|safer|more effective)/i.test(claim);
 const baseline=/\b(compared (?:with|to)|relative to|versus|baseline|than)\b/i.test(claim);
 const tables=evidence.tables.filter(table=>table.status==="downloaded");
 const columns=tables.flatMap(table=>table.columns??[]);
 // Every result stays short of Verified: this checks text and available evidence,
 // not experimental reproducibility or whether a scientific conclusion follows.
 return [
 {title:"Evidence & Source Verification",question:"Can this statement be traced to the selected NASA evidence?",
 status:unsupported.length?"Needs Review":"Pending Evidence",
 detail:evidence.accession+" v"+evidence.version+": "+tables.length+" downloaded table(s). "+
 (unsupported.length?"Numeric text absent from the imported narrative: "+unsupported.join(", ")+". Check the original tables. ":"No absent numeric narrative values detected; claim support still needs review. ")+"Source: "+record.source},
 {title:"Scientific Accuracy & Experimental Conditions",question:"Do the claim's conditions match this experiment?",status:"Pending Evidence",
 detail:"Selected conditions: "+record.conditions+" Gravity classification: "+metadata.gravity.join(", ")+". Downloaded columns: "+(columns.slice(0,12).join("; ")||"none imported")+". Original units are not automatically equivalent."},
 {title:"Uncertainty, Multiple Interpretations & Research Gaps",question:"Which gaps affect this specific statement?",status:claim.trim()?"Needs Review":"Pending Review",
 detail:(comparative&&!baseline?"Comparative wording has no explicit baseline. ":comparative?"A baseline is mentioned; matched conditions still need checking. ":"No comparative wording detected. ")+metadata.gravityGap+" "+record.limitation},
 {title:"Independent QA Review & Ranking Verification",question:"Has a separate scientific reviewer assessed this claim?",status:"Pending Review",
 detail:"Deterministic checks ran on "+evidence.accession+" independently of answer generation. No independent human or AI scientific reviewer is connected. Metadata checks and saved notes do not establish scientific validity."}
 ];
}
