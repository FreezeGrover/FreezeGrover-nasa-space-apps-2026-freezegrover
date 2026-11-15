import {unsupportedNumericValues} from "./numbers";
import {findInvestigationById,getInvestigationEvidence} from "../research/catalog";
import type {CitedStatement,EvidenceField} from "@/types/answer";

export function evidenceText(recordId:string,field:EvidenceField):string {
  const item=findInvestigationById(recordId);
  if(!item) return "";
  const evidence=getInvestigationEvidence(recordId);
  if(field==="table") return evidence.tables.filter(table=>table.status==="downloaded").map(table=>
    table.name+"\n"+(table.columns??[]).join(" | ")+"\n"+(table.preview??[]).map(row=>row.join(" | ")).join("\n")).join("\n\n");
  return field==="objective" ? evidence.objective : field==="approach" ? evidence.approach : item[field];
}
export function validateGrounding(statements:CitedStatement[]) {
  const accepted:CitedStatement[]=[];const issues:string[]=[];
  // Look up each quote again instead of trusting the answer generator.
  // A real PSI identifier alone cannot ground an invented statement.
  for(const statement of statements){
    const original=evidenceText(statement.recordId,statement.field);
    if(statement.field==="objective" && /\b(proves?|proved|confirmed|demonstrates?|demonstrated|safe limit|verified)\b/i.test(statement.interpretation)){
      issues.push("A statement was withheld because an experimental objective was presented as a confirmed finding.");
      continue;
    }
    if(statement.quote.trim().length<20 || !original.includes(statement.quote)){
      issues.push("A statement was withheld because its quote was not found in the named NASA source field.");
      continue;
    }
    // Example: a quote about flame spread cannot support an invented 50% change.
    const record=findInvestigationById(statement.recordId)!;
    let numericClaim=statement.interpretation;
    // FLEX-2 and PSI-68 are source identities, not experimental measurements.
    // Ignore only the complete identity of this cited record, never bare digits.
    for(const label of [record.name,record.sourceLabel.split(" · ")[0]]){
      const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      numericClaim=numericClaim.replace(new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`,"gi"),"");
    }
    const unsupported=unsupportedNumericValues(numericClaim,statement.quote);
    if(unsupported.length){
      issues.push("A statement was withheld because it introduced an unsupported numerical value.");
      continue;
    }
    accepted.push(statement);
  }
  // Quote presence checks provenance, not scientific entailment.
  // Accepted interpretations still need independent scientific review.
  return {accepted,issues};
}

