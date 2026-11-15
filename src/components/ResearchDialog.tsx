"use client";
import {useEffect,useRef,useId,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
export function ResearchDialog({open,onClose,title,children,className=""}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;className?:string}) {
 const ref=useRef<HTMLDialogElement>(null);const titleId=useId();
 useEffect(()=>{const dialog=ref.current;if(open&&dialog&&!dialog.open)dialog.showModal();if(!open&&dialog?.open)dialog.close();},[open]);
 if(!open)return null;
 return createPortal(<dialog ref={ref} className={"research-dialog "+className} aria-labelledby={titleId} onCancel={onClose} onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="research-dialog-shell"><header><div><small>NASA PSI · COMBUSTION RESEARCH</small><h2 id={titleId}>{title}</h2></div><button onClick={onClose} aria-label="Close research popup" autoFocus>Close ×</button></header><div className="research-dialog-content">{children}</div></div></dialog>,document.body);
}
