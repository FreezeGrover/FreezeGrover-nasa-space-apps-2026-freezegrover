import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewNote} from '../src/lib/qa/notes';
test('saved QA drafts retain source identity and cannot imply verification',()=>{
 const note=createReviewNote('flex','  This claim says Verified, but is only a draft.  ','2026-11-15T00:00:00Z')!;
 assert.equal(note.statement,'This claim says Verified, but is only a draft.');
 assert.equal(note.accession,'PSI-69');assert.equal(note.version,5);
 assert.equal(note.scientificStatus,'Not verified');
 assert.equal(note.time,'2026-11-15T00:00:00Z');
});
test('empty QA drafts do not create a review record',()=>{
 assert.equal(createReviewNote('bass2',' \n '),null);
});
