"use client";
import {useState} from 'react';
import {investigations} from '@/lib/research/catalog';
import {ResearchDialog} from './ResearchDialog';
export function InvestigationPicker({label,value,onChange}:{label:string;value:string;onChange:(id:string)=>void}) {
 const [open,setOpen]=useState(false);const [query,setQuery]=useState('');const current=investigations.find(item=>item.id===value)!;
 const items=investigations.filter(item=>(item.name+' '+item.title+' '+item.sourceLabel).toLowerCase().includes(query.toLowerCase()));
 return <><button className="comparison-picker" onClick={()=>{setQuery('');setOpen(true);}} aria-label={`Choose ${label}`}><strong>{label}:</strong><span>{current.name}</span><span aria-hidden="true">⌄</span></button><ResearchDialog open={open} onClose={()=>setOpen(false)} title={`Choose ${label}`}><label className="popup-search">Find an investigation<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, PSI identifier or title"/></label><div className="picker-results">{items.map(item=><button key={item.id} className="picker-result" aria-pressed={value===item.id} onClick={()=>{onChange(item.id);setOpen(false);}}><strong>{item.name}</strong><span>{item.title}</span><small>{item.sourceLabel.split(' · ')[0]}</small></button>)}</div>{!items.length&&<p>No documented investigations match this search.</p>}</ResearchDialog></>;
}
