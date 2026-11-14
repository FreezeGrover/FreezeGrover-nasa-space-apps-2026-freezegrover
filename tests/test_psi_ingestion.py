import importlib.util, tempfile, pathlib, json, unittest, urllib.error
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('psi_ingest',pathlib.Path(__file__).resolve().parents[1]/'scripts/ingest_psi.py')
psi=importlib.util.module_from_spec(spec);spec.loader.exec_module(psi)
class IngestionTests(unittest.TestCase):
 def test_complete_pagination(self):
  pages=[{'hits':{'total':3,'hits':[{'_source':{'Accession':'PSI-1'}},{'_source':{'Accession':'PSI-2'}}]}},{'hits':{'total':3,'hits':[{'_source':{'Accession':'PSI-3'}}]}}]
  with tempfile.TemporaryDirectory() as tmp,patch.object(psi,'DATA',pathlib.Path(tmp)),patch.object(psi,'request',side_effect=[json.dumps(p).encode() for p in pages]) as request:
   self.assertEqual(psi.discover(),['PSI-1','PSI-2','PSI-3']);self.assertIn('from=2',request.call_args.args[0])
 def test_incomplete_pagination_rejected(self):
  page={'hits':{'total':2,'hits':[]}}
  with tempfile.TemporaryDirectory() as tmp,patch.object(psi,'DATA',pathlib.Path(tmp)),patch.object(psi,'request',return_value=json.dumps(page).encode()):
   with self.assertRaisesRegex(ValueError,'Incomplete'):psi.discover()
 def test_access_restrictions_not_retried(self):
  error=urllib.error.HTTPError('https://psi.nasa.gov',403,'Forbidden',{},None)
  with patch.object(psi.urllib.request,'urlopen',side_effect=error) as open_url:
   with self.assertRaises(urllib.error.HTTPError):psi.request('https://psi.nasa.gov/example')
   self.assertEqual(open_url.call_count,1)
 def test_noncombustion_record_rejected(self):
  with tempfile.TemporaryDirectory() as tmp,patch.object(psi,'DATA',pathlib.Path(tmp)):
   raw=pathlib.Path(tmp)/'raw';raw.mkdir();(raw/'PSI-1.json').write_text(json.dumps({'accession':'PSI-1','researchArea':'Fluid Physics','public':True}))
   with self.assertRaisesRegex(ValueError,'scope'):psi.ingest_record('PSI-1')
if __name__=='__main__':unittest.main()
