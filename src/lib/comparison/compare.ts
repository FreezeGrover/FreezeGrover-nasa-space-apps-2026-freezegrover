import type { Investigation } from "@/types/research";
import {getExperimentMetadata} from "../research/metadata";
import {getInvestigationEvidence} from "../research/catalog";
export function analyzeComparison(a:Investigation,b:Investigation){
  const left=getExperimentMetadata(a.id),right=getExperimentMetadata(b.id);
  const sharedHardware=left.hardware.filter(value=>right.hardware.includes(value));
  const sharedGravity=left.gravity.filter(value=>right.gravity.includes(value));
  const similarities:string[]=[],differences:string[]=[];
  // Shared hardware means shared apparatus labels, not equivalent test conditions.
  if(a.id===b.id) similarities.push("The same NASA investigation is selected on both sides.");
  if(sharedHardware.length) similarities.push("Shared documented hardware/facility: "+sharedHardware.join(", ")+".");
  if(left.fuelCategory===right.fuelCategory && left.fuelCategory!=="unknown") similarities.push("Both have the imported fuel category: "+left.fuelCategory+". Individual fuel chemistry and geometry still need matching.");
  if(sharedGravity.length) similarities.push("Shared gravity classification: "+sharedGravity.join(", ")+". This is not a matched-test comparison.");
  if(left.fuelCategory!==right.fuelCategory) differences.push(a.name+" fuel category: "+left.fuelCategory+"; "+b.name+": "+right.fuelCategory+".");
  const uniqueLeft=left.hardware.filter(value=>!right.hardware.includes(value));
  const uniqueRight=right.hardware.filter(value=>!left.hardware.includes(value));
  if(uniqueLeft.length||uniqueRight.length) differences.push("Hardware labels unique to "+a.name+": "+(uniqueLeft.join(", ")||"none imported")+"; unique to "+b.name+": "+(uniqueRight.join(", ")||"none imported")+".");
  if(left.gravity.join()!==right.gravity.join()) differences.push("Gravity coverage differs: "+a.name+" ("+left.gravity.join(", ")+"); "+b.name+" ("+right.gravity.join(", ")+").");
  const tableCount=(id:string)=>getInvestigationEvidence(id).tables.filter(table=>table.status==="downloaded").length;
  differences.push("Downloaded tables: "+a.name+" "+tableCount(a.id)+"; "+b.name+" "+tableCount(b.id)+". Column names and test conditions must be checked before numerical comparison.");
  return {similarities:similarities.length?similarities:["No shared specific attributes established from imported metadata."],
    differences,limitations:[a.name+": "+a.limitation,b.name+": "+b.limitation]};
}
export function compareExperimentalConditions(
  a: Investigation,
  b: Investigation,
) {
  return [
    ["Experimental Objective", a.purpose, b.purpose],
    ["Fuel & Sample", a.fuel, b.fuel],
    ["Test Conditions", a.conditions, b.conditions],
    ["Apparatus / Facility", a.facility, b.facility],
    ["Sensors & Measurements", a.measurements, b.measurements],
    ["Reported Findings", a.finding, b.finding],
    ["Limitations & Uncertainty", a.limitation, b.limitation],
  ];
}
