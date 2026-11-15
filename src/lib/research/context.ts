import type {Environment} from '@/types/research';
export function describeMissionContext(environment:Environment) {
 switch(environment){
 case 'Lunar Bases':return 'Lunar context: check partial-gravity transfer, habitat oxygen/pressure, ventilation and materials. This catalog has no identified direct lunar-gravity measurements; microgravity records remain visible as research context. Transfer requires separate validation.';
 case 'Martian Bases':return 'Martian context: check partial-gravity transfer and the pressurized habitat atmosphere, not the outdoor Martian atmosphere. No direct Mars-gravity measurements are identified in this catalog. Transfer requires separate validation.';
 case 'Pressurized Rovers':return 'Rover context: review enclosure size, ventilation, oxygen/pressure and material geometry. Rover gravity depends on the destination; these records do not establish rover operating limits.';
 case 'Spacecraft':return 'Spacecraft context: compare cabin atmosphere, ventilation, material geometry and experiment scale. Shared spaceflight context does not establish vehicle suitability.';
 case 'Space Stations':return 'Station context: microgravity flight research provides context; oxygen/pressure, airflow and hardware still need matching to the intended cabin.';
 default:return 'All environments: browse the source catalog without habitat filtering. Choosing a context adds transfer checks; it does not certify suitability or change the scientific evidence.';
 }
}
