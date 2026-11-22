// Public note-taking metadata only. No scientific validation occurs client-side.
import { findNasaResource } from "../resources/catalog";
export interface ResourceReviewNote {sourceId:string;statement:string;time:string;sourceHash:string;scientificStatus:"Not verified"}
export function createResourceReviewNote(sourceId:string,statement:string):ResourceReviewNote|null{
  const source=findNasaResource(sourceId);
  if(!source||!statement.trim())return null;
  return {sourceId,statement:statement.trim(),time:new Date().toISOString(),sourceHash:source.sha256,scientificStatus:"Not verified"};
}
