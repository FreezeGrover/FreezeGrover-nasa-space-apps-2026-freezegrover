import {getInvestigationEvidence} from '../research/catalog';
export interface ReviewNote {recordId:string;statement:string;time:string;accession:string;version:number;scientificStatus:'Not verified';}
export function createReviewNote(recordId:string,statement:string,time=new Date().toISOString()):ReviewNote|null {
 if(!statement.trim())return null;
 const evidence=getInvestigationEvidence(recordId);
 return {recordId,statement:statement.trim(),time,accession:evidence.accession,version:evidence.version,scientificStatus:'Not verified'};
}
