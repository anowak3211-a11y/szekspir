import sys, os, types, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
os.environ['MT_AK']='test'; os.environ['MT_SK']='test'
from sdk.core import api
from api.vmake_status import _status
class StatusTests(unittest.TestCase):
 def run_status(self,r):
  client=types.SimpleNamespace(api=types.SimpleNamespace(getAiStrategy=lambda:{'url':'https://example.com','status_query':{'path':'status'}},queryStatus=lambda *a:r))
  sys.modules['sdk.core.client']=types.SimpleNamespace(SkillClient=lambda **kw:client)
  return _status('existing-task')
 def test_empty_success_waits(self):
  r=self.run_status({'is_finished':True,'result':{'data':{'status':10,'result':{}}}})
  self.assertFalse(r['done']);self.assertTrue(r['awaiting_output'])
 def test_video_success(self):
  r=self.run_status({'is_finished':True,'result':{'data':{'status':10,'result':{'videos':['https://example.com/result.mp4']}}}})
  self.assertTrue(r['done']);self.assertEqual(len(r['output_urls']),1)
 def test_timeout_is_terminal_failure(self):
  r=self.run_status({'is_finished':True,'result':{'code':29902,'error_code':29902,'message':'TIMEOUT_EXCEPTION','data':{'status':2,'result':{'data':{'media_info_list':[]}}}}})
  self.assertTrue(r['failed']);self.assertTrue(r['resubmit_required']);self.assertEqual(r['message'],'TIMEOUT_EXCEPTION')
 def test_failure_retained(self):
  r=self.run_status({'is_finished':True,'is_failure':True,'result':{'meta':{'msg':'Failed'}}})
  self.assertTrue(r['failed'])
if __name__=='__main__':unittest.main()
