"""Build the UI snapshot from retrieved PSI metadata; no AI or inferred measurements."""
import hashlib,json,pathlib,re,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
LEGACY={'PSI-69':'flex','PSI-68':'flex2','PSI-25':'bass2','PSI-101':'samer'}
ALIASES={'CIR':r'Combustion Integrated Rack|\bCIR\b','MDCA':r'Droplet Combustion App|\bMDCA\b','MSG':r'Microgravity (?:Science )?Glove\s?box|\bMSG\b','ACME':r'\bACME\b','Cygnus':r'\bCygnus\b','P-Trak':r'P-Trak','SAME':r'Comparitive Soot Diagnostic|\bSAME\b'}
TOPICS={'spread':r'flame spread|flame growth|fire grows|fire growth|propagation','smoke':r'smoke|aerosol|particle size','droplet':r'droplet','suppression':r'suppres|extinct|extinguish','cool':r'cool.flame|low.temperature combustion','oxygen':r'oxygen|\bO2\b','pressure':r'pressure','soot':r'soot','solid':r'solid.fuel|fabric|polymethyl|cotton|flammability','gas':r'gaseous|propane|methane|ethylene|butane'}

def clean(value):
    value=value or ''
    # PSI stores some line breaks and Unicode escapes as literal escaped text.
    value=re.sub(r'\\u([0-9a-fA-F]{4})',lambda m:chr(int(m[1],16)),value)
    return value.replace('\\n','\n').replace('\\r','').replace('\\t',' ').strip()

def excerpt(text, pattern, missing):
    sentences=re.split(r'(?<=[.!?])\s+|\n+',text)
    found=[s.strip() for s in sentences if re.search(pattern,s,re.I)]
    return '\n'.join(found[:5]) or missing

def build(entry, names):
    d=entry['record'];acc=d['accession'];id=LEGACY.get(acc,acc.lower());source='https://psi.nasa.gov/physci/repo/data/investigations/'+acc
    objective=clean(d.get('objective'));approach=clean(d.get('approach'));text=objective+'\n'+approach
    acronym=clean(d.get('investigationAcronym'));name=acronym or acc
    hardware=clean(d.get('experimentHardware'));topics=[k for k,p in TOPICS.items() if re.search(p,text,re.I)]
    fuelCategory='unknown'
    if acc in ['PSI-69','PSI-68','PSI-39']:fuelCategory='liquid'
    elif acc in ['PSI-25','PSI-26','PSI-98','PSI-99','PSI-100','PSI-62']:fuelCategory='solid'
    elif acc in ['PSI-47','PSI-101','PSI-102','PSI-115']:fuelCategory='smoke'
    elif acronym.startswith('ACME') or acc in ['PSI-106','PSI-107','PSI-60','PSI-142','PSI-117']:fuelCategory='gas'
    gravity=[]
    if d.get('projectType')=='Microgravity Investigation':gravity.append('microgravity')
    if d.get('projectType')=='Ground Investigation':gravity.append('ground')
    if re.search(r'normal.gravity|\b1[ -]g\b',text,re.I):gravity.append('normal-comparison')
    if d.get('projectType')=='Ground Investigation' and re.search(r'microgravity',text,re.I):gravity.append('modeled-microgravity')
    related=[]
    for target in re.split(r'[,;\s]+',d.get('related_glds','')):
        if re.fullmatch(r'PSI-\d+',target): related.append({'name':names.get(target,target),'localId':LEGACY.get(target,target.lower()) if target in names else None,'reason':'Explicit Related Investigation in '+acc+'. This is not proof of matched conditions.','url':'https://psi.nasa.gov/physci/repo/data/investigations/'+target})
    tables=entry['tables'];downloaded=[t for t in tables if t['status']=='downloaded']
    available=[f for f in entry['inventory']['files'] if f['visible'] and not f['restricted']]
    raw=[f for f in available if 'raw data' in f['category'].lower() or 'raw data' in f['key'].lower()]
    goals=[]
    if any(t in topics for t in ['spread','solid','suppression']):goals.append('Crew Safety')
    if re.search(r'model|simulat|CFD',text,re.I):goals.append('Predictive Models')
    if any(t in topics for t in ['smoke','suppression']):goals.append('Safety Equipment')
    if clean(d.get('researchImpacts')):goals.append('Earth Applications')
    fuel=excerpt(text,r'fuel|methanol|heptane|cotton|fabric|foam|propane|methane|ethylene|butane|PMMA|sample material','Fuel/material not specified in retrieved objective or approach.')
    conditions=excerpt(text,r'oxygen|\bO2\b|pressure|flow veloc|flow speed','Numerical oxygen, pressure and airflow conditions not identified in retrieved narrative.')
    sensors=excerpt(approach,r'sensor|camera|thermocouple|radiometer|diagnostic|photomultiplier|anemometer|P-Trak|TEM|instrument','Sensor inventory not specified in retrieved approach.')
    measures=excerpt(approach,r'measur|record|data.*collect|determined|observ','Measurement channels not specified in retrieved approach.')
    pressure=excerpt(text,r'pressure.*\d|\d.*(?:atm|psia|torr|mmHg)','') or None
    limitation='Metadata and experimental tables are not a completed scientific review. Original units are retained; ambiguous units and matched test conditions require verification. Hypotheses and intended benefits are not measured outcomes.'
    if acc=='PSI-98': limitation+=' NASA project metadata lists ISS, while the approach describes the deberthed Cygnus vehicle; this platform inconsistency requires review.'
    item={'id':id,'name':name,'title':clean(d['title']),'purpose':objective[:450]+('…' if len(objective)>450 else ''),'fuel':fuel,'conditions':conditions,'facility':hardware or 'Hardware not specified in the retrieved record.','measurements':measures,'finding':'No independent finding extraction completed. NASA objectives, hypotheses and impacts are shown separately from measured results.','limitation':limitation,'source':source,'sourceLabel':acc+' · Version '+str(d['version'])+' · DOI: '+str(d.get('doi') or 'unavailable'),'goals':goals}
    meta={'topics':topics,'fuelCategory':fuelCategory,'gravity':gravity,'hardware':[k for k,p in ALIASES.items() if re.search(p,hardware,re.I)],'oxygenVariation':bool(re.search(r'oxygen|\bO2\b',text,re.I)),'pressureProtocol':pressure,'geometry':excerpt(text,r'diameter|geometr|slab|cylinder|sphere|thick|sample.*(?:size|mm|cm)','Sample geometry not specified in retrieved narrative.'),'variations':conditions,'sensors':sensors,'gravityGap':'Project type: '+d.get('projectType','Unavailable')+'. No direct lunar/Martian-gravity measurements have been identified in this snapshot. Ground modeling is not a flight experiment.','related':related,'sources':[{'label':acc+' · original PSI metadata','url':source}]}
    evidence={'accession':acc,'version':d['version'],'doi':d.get('doi'),'researchArea':d['researchArea'],'projectType':d.get('projectType'),'objective':objective,'approach':approach,'hypothesis':clean(d.get('hypothesis')),'impacts':clean(d.get('researchImpacts')),'retrievedAt':entry['retrievedAt'],'recordSha256':entry['recordSha256'],'license':d.get('licenseIdentifier'),'inventoryStatus':entry['inventory']['status'],'inventoryError':entry['inventory']['error'],'fileCount':len(entry['inventory']['files']),'unrestrictedFiles':len(available),'rawFileCount':len(raw),'restrictedFiles':sum(f['restricted'] for f in entry['inventory']['files']),'tables':tables,'rawFileExamples':[f['name'] for f in raw[:3]],'findingsStatus':'Not extracted / not independently verified','fileExamples':[{'name':f['name'],'category':f['category'],'bytes':f['bytes'],'restricted':f['restricted'],'url':__import__('ingest_psi').stable_download_url(acc,d['version'],f)} for f in available[:5]+raw[:2]],'fieldProvenance':{'purpose':'objective','fuel':'objective / approach — matching source passages','conditions':'objective / approach — matching source passages','facility':'experimentHardware','measurements':'approach — matching source passages','sensors':'approach — matching source passages','related':'related_glds','gravity':'projectType; comparison context from objective / approach'},'publications':[{'title':p.get('title'),'doi':p.get('doi'),'url':p.get('link')} for p in d.get('publications',[])]}
    return {'item':item,'metadata':meta,'evidence':evidence}

def main():
    entries=json.loads((ROOT/'data/psi/ingestion.json').read_text())['records'];names={e['accession']:e['record'].get('investigationAcronym') or e['accession'] for e in entries}
    records=[build(e,names) for e in entries]
    by_id={r['item']['id']:r for r in records}
    for record in records:
        for relation in list(record['metadata']['related']):
            target=by_id.get(relation.get('localId'))
            if target and not any(link.get('localId')==record['item']['id'] for link in target['metadata']['related']):
                target['metadata']['related'].append({'name':record['item']['name'],'localId':record['item']['id'],'reason':record['evidence']['accession']+' explicitly lists this investigation as related (reverse lookup). No matched conditions are implied.','url':record['item']['source']})
    records.sort(key=lambda r:(r['item']['id'] not in ['flex','flex2','bass2','samer'],int(r['evidence']['accession'].split('-')[1])))
    summary={'verifiedCombustionRecords':len(records),'inventoryRetrieved':sum(r['evidence']['inventoryStatus']=='retrieved' for r in records),'recordsListingRawData':sum(r['evidence']['rawFileCount']>0 for r in records),'recordsWithDownloadedTables':sum(any(t['status']=='downloaded' for t in r['evidence']['tables']) for r in records),'downloadedTables':sum(t['status']=='downloaded' for r in records for t in r['evidence']['tables']),'retrievedAt':max(e['retrievedAt'] for e in entries),'mode':'Retrieved NASA PSI snapshot; not a continuous live feed','endpointContract':'Observed website endpoints; undocumented and subject to change'}
    target=ROOT/'src/data/psi-catalog.json';target.parent.mkdir(exist_ok=True);target.write_text(json.dumps({'summary':summary,'records':records},indent=2,ensure_ascii=False));print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
