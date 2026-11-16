import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const hash=value=>createHash("sha256").update(value).digest("hex");
const {resources}=JSON.parse(readFileSync(resolve(root,"src/data/nasa-resources.json"),"utf8"));
for(const source of resources){
  const bytes=readFileSync(resolve(root,source.snapshotPath));
  if(hash(bytes)!==source.sha256)throw new Error("Source snapshot changed: "+source.id);
  const textPath=source.id==="nasa-combustion-guide-pdf"?"data/nasa-resources/combustion-guide-selected-pages.txt":source.id==="nasa-sciencecasts"?"data/nasa-resources/sciencecasts-transcript.txt":source.snapshotPath.replace(/\.html$/,".txt");
  const textBytes=readFileSync(resolve(root,textPath));
  if(hash(textBytes)!==source.extractedTextSha256)throw new Error("Extracted text changed: "+source.id);
  let original=textBytes.toString("utf8");
  // Captions retain timestamps in the saved original; quotations join adjacent cues.
  if(source.id==="nasa-sciencecasts")original=original.replace(/\[[0-9:]+\]\s*/g,"");
  original=original.replace(/\s+/g," ");
  for(const excerpt of source.excerpts){
    if(hash(excerpt.text)!==excerpt.sha256||!original.includes(excerpt.text))throw new Error("Excerpt does not match saved source text: "+source.id+"/"+excerpt.id);
  }
}
console.log(`Verified ${resources.length} official source snapshots and ${resources.reduce((sum,source)=>sum+source.excerpts.length,0)} excerpts. PDF excerpts are reviewed transcriptions with printed-page locators, not full-PDF text extraction.`);
