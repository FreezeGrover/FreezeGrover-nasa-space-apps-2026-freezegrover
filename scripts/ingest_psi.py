"""Read-only PSI ingestion. Website endpoints are observed, not a supported API contract."""
import argparse, concurrent.futures, csv, datetime, hashlib, io, json, pathlib, re, time, urllib.parse, urllib.request
ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/psi'
HOST = 'https://psi.nasa.gov'
BASE = HOST + '/geode-py/ws'

def request(url, payload=None, limit=24_000_000):
    headers = {'User-Agent': 'FlamesInFreeFall/0.1 (NASA PSI local research catalog)', 'Accept': 'application/json'}
    body = None if payload is None else json.dumps(payload).encode()
    if body: headers['Content-Type'] = 'application/json'
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=body, headers=headers), timeout=50) as response:
                if response.headers.get('Content-Length') and int(response.headers['Content-Length']) > limit: raise ValueError('File exceeds ingestion size limit')
                data = response.read(limit + 1)
                if len(data) > limit: raise ValueError('Response exceeds ingestion size limit')
                return data
        except urllib.error.HTTPError as error:
            if error.code in (401,403): raise  # Never retry or bypass an access restriction.
            if attempt == 2: raise
            time.sleep(attempt + 1)
        except (TimeoutError, urllib.error.URLError):
            if attempt == 2: raise
            time.sleep(attempt + 1)

def save(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)

def discover():
    hits=[]; start=0
    while True:
        query=urllib.parse.urlencode({'source':'psi','type':'investigation','from':start,'size':100,'ffield':'Research Area','fvalue':'combustion science'})
        body=request(BASE+'/repo/search?'+query); result=json.loads(body)
        save(DATA/'raw'/f'search-{start}.json',body)
        page=result['hits']['hits']; total=result['hits']['total']
        if isinstance(total,dict): total=total['value']
        hits.extend(page)
        if len(hits)>=total: break
        if not page: raise ValueError('Incomplete search pagination')
        start+=len(page)
    ids=[h['_source']['Accession'] for h in hits]
    if len(ids)!=len(set(ids)): raise ValueError('Duplicate repository records')
    return ids

def flatten(nodes):
    for node in nodes:
        if node.get('files'): yield from flatten(node['files'])
        elif node.get('id') and not node.get('directory'): yield node

def stable_download_url(accession, version, file):
    query=urllib.parse.urlencode({'file':file['id'],'version':file.get('version',1),'studyVersion':version,'redirect':'true'})
    return BASE+'/studies/'+accession+'/download?'+query

def ingest_record(accession, refresh=False):
    path=DATA/'raw'/(accession+'.json')
    if refresh or not path.exists(): save(path,request(BASE+'/repo/investigations/'+accession))
    record=json.loads(path.read_bytes())
    if record['accession']!=accession or record['researchArea'].lower()!='combustion science' or not record['public']: raise ValueError('Identity, scope or visibility failed: '+accession)
    inventory={'status':'unavailable','files':[],'error':None}
    try:
        payload={'folder':accession+'/','fileType':'study','studyId':accession,'version':record['version'],'obfuscationcode':''}
        raw=request(BASE+'/files/v2',payload)
        files=list(flatten(json.loads(raw)['files']))
        inventory={'status':'retrieved','files':[{'id':f['id'],'name':f.get('displayName') or f['key'].split('/')[-1],'key':f['key'],'category':f.get('sortingCategory',''),'bytes':f.get('bytes_size',0),'version':f.get('version',1),'restricted':bool(f.get('restricted')),'visible':f.get('visible',True)} for f in files],'error':None}
    except Exception as error: inventory['error']=str(error)
    save(DATA/'inventories'/(accession+'.json'),json.dumps(inventory,indent=2).encode())
    tables=[]
    for f in inventory['files']:
        if f['restricted'] or not f['visible'] or not f['name'].lower().endswith('.csv') or f['bytes']>2_000_000: continue
        if 'experimental' not in f['category'].lower() and 'experimental' not in f['name'].lower(): continue
        info={'name':f['name'],'url':stable_download_url(accession,record['version'],f),'status':'unavailable','kind':'experimental table; column semantics require review'}
        try:
            # Resolve only the unrestricted file ID returned by the official inventory.
            resolve=info['url'].replace('redirect=true','redirect=false')
            signed=request(resolve,limit=20_000).decode().strip()
            parsed=urllib.parse.urlparse(signed)
            if parsed.scheme!='https' or not (parsed.hostname.endswith('.amazonaws.com') or parsed.hostname.endswith('.nasa.gov')): raise ValueError('Unexpected download host')
            body=request(signed,limit=2_000_000)
            try:
                decoded=body.decode('utf-8-sig'); encoding='utf-8-sig'
            except UnicodeDecodeError:
                decoded=body.decode('cp1252'); encoding='cp1252'
            rows=list(csv.reader(io.StringIO(decoded)))
            if not rows or len(rows[0])<2: raise ValueError('Not a usable CSV table')
            filename=accession+'-'+hashlib.sha256(body).hexdigest()[:12]+'.csv'
            save(ROOT/'public/psi'/filename,body)
            info.update(status='downloaded',encoding=encoding,sha256=hashlib.sha256(body).hexdigest(),bytes=len(body),rows=len(rows)-1,columns=rows[0],preview=rows[1:4],localUrl='/psi/'+filename)
        except Exception as error: info['error']=str(error).split('?')[0]
        tables.append(info)
    return {'accession':accession,'record':record,'inventory':inventory,'tables':tables,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'recordSha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--cached-discovery',action='store_true');parser.add_argument('--refresh',action='store_true');args=parser.parse_args()
    if args.cached_discovery:
        search=json.loads((DATA/'raw/search.json').read_bytes());ids=[h['_source']['Accession'] for h in search['hits']['hits']]
        if len(ids)!=search['hits']['total']: raise ValueError('Incomplete cached discovery')
    else: ids=discover()
    records=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        for record in executor.map(lambda id:ingest_record(id,args.refresh),ids):
            records.append(record);print(record['accession'],record['inventory']['status'],len(record['tables']),flush=True)
    # Atomic publication preserves the last working snapshot if ingestion fails.
    temp=DATA/'ingestion.tmp.json';save(temp,json.dumps({'records':records},ensure_ascii=False).encode());temp.replace(DATA/'ingestion.json')
    print('Retrieved combustion records:',len(records))
if __name__=='__main__': main()
