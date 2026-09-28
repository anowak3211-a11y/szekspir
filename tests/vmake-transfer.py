import sys
from pathlib import Path
from types import SimpleNamespace as N
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from api import vmake_transfer as t
class Req:
 def __init__(self,**kw):self.__dict__.update(kw)
class Client:
 fail=False
 def initiate_multipart_upload(self,r):return N(upload_id='id')
 def upload_part(self,r):
  assert len(r.body)<=8*1024*1024
  if self.fail:raise RuntimeError('transfer failed')
  events.append(('part',r.part_number,len(r.body)));return N(etag=str(r.part_number))
 def complete_multipart_upload(self,r):
  assert [x.part_number for x in r.complete_multipart_upload.parts]==[1,2]
  events.append(('complete',));return N(status_code=200)
 def abort_multipart_upload(self,r):events.append(('abort',))
client=Client();events=[]
sys.modules['alibabacloud_oss_v2']=N(config=N(load_default=lambda:N()),credentials=N(StaticCredentialsProvider=lambda *a:None),Client=lambda c:client,**{x:Req for x in ['InitiateMultipartUploadRequest','UploadPartRequest','UploadPart','CompleteMultipartUpload','CompleteMultipartUploadRequest','AbortMultipartUploadRequest']})
sys.modules['sdk.storage.oss']=N(resolve_oss_region=lambda *a:'region',normalize_oss_endpoint=lambda x:x)
closed=[]
def chunks(url):
 try:yield b'a'*(8*1024*1024);yield b'b'*15
 finally:closed.append(True)
t.chunks=chunks
api=N(oss_region=None,getStorageStrategy=lambda:{'credentials':{'access_key':'test','secret_key':'test'},'url':'https://example.test','bucket':'b','key':'k','data':'uploaded'})
assert t.upload_video(api,'input')=='uploaded';assert events[-1]==('complete',);assert closed
client.fail=True;events.clear()
try:t.upload_video(api,'input');raise AssertionError('must fail')
except RuntimeError:pass
assert events==[('abort',)]
print('PASS multipart order, bounded chunks, failed upload abort and stream cleanup')
