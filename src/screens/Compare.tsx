"use client";
import { InvestigationPicker } from "@/components/InvestigationPicker";
import { ResearchDialog } from "@/components/ResearchDialog";
import { useEffect,useState } from "react";
import {
  ArrowsLeftRight,
  MagnifyingGlass,
  CheckCircle,
  Scales,
  Flame,
  ShareNetwork,
  FileText,
} from "@phosphor-icons/react";
import { getExperimentMetadata } from "@/lib/research/metadata";
import { investigations } from "@/lib/research/catalog";
type ComparisonResult = {
  rows: string[][];
  analysis: {similarities:string[];differences:string[];limitations:string[]};
};
import { Notice, Panel, Expandable, Status, SourceLink } from "@/components/ui";
export function Compare({initialPair,onContextChange}:{initialPair?:string[];onContextChange?:(ids:string[])=>void}={}) {
  const [a, setA] = useState(initialPair?.[0]??"flex");
  const [b, setB] = useState(initialPair?.[1]??"flex2");
  const [all, setAll] = useState(false);
  const [pair, setPair] = useState(initialPair??["flex", "flex2"]);
  useEffect(()=>{if(initialPair?.length===2){setA(initialPair[0]);setB(initialPair[1]);setPair(initialPair);}},[initialPair]);
  useEffect(()=>{onContextChange?.([a,b]);},[a,b,onContextChange]);
  const left = investigations.find((i) => i.id === pair[0])!;
  const right = investigations.find((i) => i.id === pair[1])!;
  const [result,setResult] = useState<ComparisonResult|null>(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  useEffect(() => {
    const controller=new AbortController();
    setResult(null);
    setError("");
    setLoading(true);
    void fetch("/api/analysis",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({action:"compare",left:pair[0],right:pair[1]}),
      signal:controller.signal,
    }).then(async response=>{
      if(!response.ok) throw new Error("Protected scientific comparison is temporarily unavailable.");
      return response.json() as Promise<ComparisonResult>;
    }).then(data=>{if(!controller.signal.aborted)setResult(data);})
      .catch(()=>{if(!controller.signal.aborted)setError("Protected scientific comparison is unavailable. Please try again later.");})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[pair[0],pair[1]]);
  const rows = result?.rows??[];
  const analysis = result?.analysis;
  const related=[...getExperimentMetadata(left.id).related,...getExperimentMetadata(right.id).related].filter((entry,index,all)=>all.findIndex(other=>other.url===entry.url)===index);
  function selectInvestigation(
    label: string,
    value: string,
    setValue: (v: string) => void,
  ) {
    return <InvestigationPicker label={label} value={value} onChange={setValue}/>;
  }
  return (
    <div className="compare-page">
      <div className="compare-controls">
        {selectInvestigation("Investigation A", a, setA)}
        <button
          aria-label="Swap investigations"
          onClick={() => {
            setA(b);
            setB(a);
            setPair([pair[1], pair[0]]);
          }}
        >
          <ArrowsLeftRight />
        </button>
        {selectInvestigation("Investigation B", b, setB)}
        <button className="search-button" onClick={() => {setPair([a,b]);setAll(true);}}>
          <MagnifyingGlass />
          Compare
        </button>
      </div>
      <Notice>
        Compare NASA investigations side by side. Retrieved NASA metadata;
        downloaded tables remain separate from matched quantitative comparisons.
      </Notice>
      <div className="comparison-preview-grid">{[left,right].map((record,index)=><Panel key={record.id+index} title={record.name}><div className="investigation-preview"><h3>{record.title}</h3><p>{record.purpose}</p><SourceLink href={record.source} label={record.sourceLabel.split(" · ")[0]}/></div></Panel>)}</div>
      <button className="research-open-button" onClick={()=>setAll(true)}>Open full comparison ↗</button>
      <Notice>Open the comparison to explore every attribute, evidence source, and related investigation in one scrollable popup.</Notice>
      <ResearchDialog open={all} onClose={()=>setAll(false)} title={`${left.name} vs ${right.name} · Full Comparison`}>
      {loading && <p role="status">Loading verified comparison…</p>}
      {error && <p role="alert">{error}</p>}
      <div className="comparison-attributes">{rows.map((row,index)=><details className="comparison-attribute" key={row[0]} open={index===0}><summary><span className="attribute-number">{String(index+1).padStart(2,"0")}</span><strong>{row[0]}</strong><span className="attribute-chevron">⌄</span></summary><div className="comparison-attribute-grid"><article><span className="attribute-record">{left.name}</span><p>{row[1]}</p></article><article><span className="attribute-record">{right.name}</span><p>{row[2]}</p></article></div></details>)}</div>
      <div className="two-panels">
        <Panel title="Key Similarities" icon={<CheckCircle />}>
          <ul>
            {(analysis?.similarities??[]).map(text=><li key={text}>{text}</li>)}
          </ul>
        </Panel>
        <Panel title="Key Differences" icon={<Scales />}>
          <ul>{(analysis?.differences??[]).map(text=><li key={text}>{text}</li>)}</ul>
        </Panel>
      </div>
      <Expandable
        title="Scientific Interpretation & Fire-Safety Relevance"
        subtitle="What the evidence may suggest"
        icon={<Flame />}
      >
        {(analysis?.limitations??[]).map(text=><p key={text}>{text}</p>)}
      </Expandable>
      <Expandable
        title="Related Investigations"
        subtitle="Other relevant NASA research"
        icon={<ShareNetwork />}
      >
        <p>
          {!related.length && "No explicit related PSI investigations are listed in these imported records."}
          {related.map((relation, index) => (
            <SourceLink key={index} href={relation.url} label={relation.name} />
          ))}
        </p>
      </Expandable>
      <Expandable
        title="Sources, Evidence & Uncertainty"
        subtitle="Citations, evidence status, and limitations"
        icon={<FileText />}
        open
      >
        <div className="source-grid">
          <div>
            <strong>{left.name}</strong>
            <Status label="Not Assessed" />
            <SourceLink href={left.source} label={left.sourceLabel} />
          </div>
          <div>
            <strong>{right.name}</strong>
            <Status label="Not Assessed" />
            <SourceLink href={right.source} label={right.sourceLabel} />
          </div>
          <p>
            Source links are available. Original test files, cross-source
            consistency, and quantitative comparisons have not been verified.
          </p>
        </div>
      </Expandable>
      <Notice>
        Scientific QA: Verification pending. Research relevance does not
        establish hazard probability.
      </Notice>      </ResearchDialog>
    </div>
  );
}
