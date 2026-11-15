import test from 'node:test';
import assert from 'node:assert/strict';
import {describeMissionContext} from '../src/lib/research/context';
test('mission context adds transfer checks without inventing habitat suitability',()=>{
 assert.match(describeMissionContext('All'),/without habitat filtering/);
 assert.match(describeMissionContext('Lunar Bases'),/no identified direct lunar-gravity measurements/);
 assert.match(describeMissionContext('Martian Bases'),/not the outdoor Martian atmosphere/);
 assert.match(describeMissionContext('Pressurized Rovers'),/gravity depends on the destination/);
 assert.match(describeMissionContext('Space Stations'),/still need matching/);
 assert.match(describeMissionContext('Spacecraft'),/does not establish vehicle suitability/);
});
