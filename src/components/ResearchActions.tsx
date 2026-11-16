"use client";
import {createContext,useContext} from "react";
import type {ResearchContext} from "@/types/conversation";
import type {ScientificReviewRequest} from "@/types/resources";
export const ResearchActions=createContext<{pending:boolean;ask:(question:string,context?:Partial<ResearchContext>)=>void;review:(request:ScientificReviewRequest)=>void}|null>(null);
export const useResearchActions=()=>useContext(ResearchActions);
