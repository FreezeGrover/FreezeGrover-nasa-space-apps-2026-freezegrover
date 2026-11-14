"use client";
import {useState} from 'react';
import {ShieldCheck,FileMagnifyingGlass,Flask,Stack,Users,ArrowSquareOut,ClockCounterClockwise} from '@phosphor-icons/react';
import {investigations,getInvestigationEvidence} from '@/lib/research/catalog';
import {reviewScientificClaim} from '@/lib/qa/review';
import {InvestigationPicker} from '@/components/InvestigationPicker';
import {ResearchDialog} from '@/components/ResearchDialog';
import {PsiEvidence} from '@/components/PsiEvidence';
import {SourceLink,Status} from '@/components/ui';
import {createReviewNote,type ReviewNote} from "@/lib/qa/notes";
const reviewAreas=[
 {label:'Source Grounding',description:'Trace statements to original NASA evidence.',icon:FileMagnifyingGlass},
 {label:'Experimental Conditions',description:'Check fuel, atmosphere, gravity and units.',icon:Flask},
 {label:'Uncertainty & Gaps',description:'Identify missing evidence and comparison baselines.',icon:Stack},
 {label:'Independent Assessment',description:'Keep scientific review separate from generated answers.',icon:Users},
];
export function ScientificQA({review}:{review?:{recordId:string;statement:string}}={}){
 const [recordId,setRecordId]=useState(review?.recordId??'bass2');const record=investigations.find(item=>item.id===recordId)!;
 const [drafts,setDrafts]=useState<Record<string,string>>(review?{[review.recordId]:review.statement}:{});
 const statement=drafts[recordId]??'';
 const [dialog,setDialog]=useState<'evidence'|'history'|number|null>(null);
 const [notes,setNotes]=useState<ReviewNote[]>([]);const [saved,setSaved]=useState('');
 const evidence=getInvestigationEvidence(recordId);const checks=reviewScientificClaim(statement,recordId);
 function saveNote(){const note=createReviewNote(recordId,statement);if(!note)return;setNotes(previous=>[note,...previous]);setSaved('Review note saved for this session. No scientific verification was performed.');}
 const title=dialog==='history'?'Review History':dialog==='evidence'?`${record.name} · Original Evidence`:typeof dialog==='number'?reviewAreas[dialog].label:'Scientific Review';
 return <div className="qa-page qa-workspace">
  <section className="qa-introduction"><span className="qa-eyebrow">EVIDENCE BEFORE CONFIDENCE</span><h2>Review the science, independently.</h2><p>Source-linked review of research statements. Deterministic source and condition checks run locally; independent scientific verification remains pending.</p></section>
  <div className="qa-record-toolbar"><InvestigationPicker label="investigation for QA" value={recordId} onChange={id=>{setRecordId(id);setSaved('');}}/><SourceLink href={record.source} label={evidence.accession}/><span className="qa-session-label">Local review session</span></div>
  <section className="qa-review-card"><div className="qa-review-card-heading"><div><span className="qa-eyebrow">STATEMENT TO REVIEW</span><h3>{record.name}</h3></div><Status label="Scientific review pending"/></div><label htmlFor="qa-statement" className="qa-draft-label">Draft statement · not a verified finding</label><textarea id="qa-statement" value={statement} onChange={e=>{setDrafts(previous=>({...previous,[recordId]:e.target.value}));setSaved('');}} placeholder="Write a statement to check against NASA sources…" rows={2}/><div className="qa-review-actions"><button className="qa-primary-action" onClick={()=>setDialog('evidence')}><FileMagnifyingGlass/>Review evidence</button><button onClick={()=>setDialog('history')}><ClockCounterClockwise/>Review history <span>{notes.length}</span></button><button disabled={!statement.trim()} onClick={saveNote}>Save review note</button></div><p role="status" className="qa-save-status">{saved||'Notes are temporary and reset when leaving Scientific QA or reloading the page.'}</p></section>
  <div className="qa-review-grid">{reviewAreas.map(({label,description,icon:Icon},index)=><button className="qa-area-card" key={label} onClick={()=>setDialog(index)}><div className="qa-area-icon"><Icon/></div><div><h3>{label}</h3><p>{description}</p><span className="qa-area-status">{checks[index].status}</span></div><ArrowSquareOut className="qa-card-arrow"/></button>)}</div>
  <div className="qa-integrity-note"><ShieldCheck/><p><strong>No verified conclusion yet.</strong> Claim support, experimental comparability, uncertainty and independent review remain pending. This workflow does not trust an AI provider as scientific evidence.</p></div>
  <ResearchDialog open={dialog!==null} onClose={()=>setDialog(null)} title={title}>
   {dialog==='evidence'&&<><p>Use the original source narrative and downloaded tables to inspect this draft. Opening evidence does not verify the statement.</p><div className="qa-popup-draft"><strong>Draft statement</strong><p>{statement||'No statement entered.'}</p></div><PsiEvidence id={recordId}/><SourceLink href={record.source} label={record.sourceLabel}/></>}
   {typeof dialog==='number'&&<div className="qa-check-detail"><Status label={checks[dialog].status}/><h3>{checks[dialog].question}</h3><p>{checks[dialog].detail}</p>{dialog===2&&<ul><li>Name the comparison baseline before asserting an increase or decrease.</li><li>Match material, geometry, oxygen, pressure, ventilation and gravity.</li><li>Keep hypotheses, intended benefits and measurements distinct.</li></ul>}{dialog===3&&<p>No independent scientific reviewer is connected. Saving a note does not approve a claim or a relevance ranking.</p>}<button className="research-open-button" onClick={()=>setDialog('evidence')}>Open original evidence ↗</button></div>}
   {dialog==='history'&&<><p>Session notes across investigations. These are saved drafts, not completed scientific checks.</p>{notes.length===0?<div className="qa-empty-history"><ClockCounterClockwise/><h3>No review notes yet</h3><p>Write a statement and choose “Save review note” to keep a session snapshot.</p></div>:notes.map((note,index)=><article className="qa-history-note" key={index}><small>{investigations.find(item=>item.id===note.recordId)?.name} · {note.accession} v{note.version} · {new Date(note.time).toLocaleString()}</small><p>{note.statement}</p><Status label="Not scientifically verified"/></article>)}</>}
  </ResearchDialog>
 </div>;
}
