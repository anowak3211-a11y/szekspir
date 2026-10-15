/* ============================================================================
   cdiff.js, silnik porównywania dwóch tekstów dla strony /ai-diff.
   Czysty silnik: zero DOM, zero CSS, zero sieci. Zwraca wiersze/segmenty/staty,
   renderowanie i klasy Tailwind nakłada ai_diff.html.
   Adaptacja zewnętrznego narzędzia "Copy Diff" (dwupoziomowy Myers linie->słowa,
   parowanie akapitów po Dice, wykrywanie przeniesień, granularność
   słowo/zdanie/znak, opcje ignorowania, rafinacja znakowa z bramkami
   anty-konfetti). Guard module.exports zostaje: testy headless node
   (tests/engine/test_cdiff.js).
   ==========================================================================*/
/* ============================================================================
   ENGINE, two-level diff (line units -> words), similarity pairing,
   prose-tuned readability passes. No dependencies, no network.
   ==========================================================================*/
var CD = (function(){
'use strict';

var SPACE=1, EMOJI=2, WORD=3, PUNCT=4;

var LIMITS = {
  maxChars: 500000, warnChars: 150000,
  traceBytes: 16<<20,
  l1Cells: 4000000, l2Cells: 25000000,
  l2Span: 40000, work: 24000000,
  refineWord: 40, refineChar: 400, refineCells: 4000,
  pairAll: 2500, pairBand: 8, moveDice: 20000
};
var SIM_MIN=0.35, SIM_SHORT=0.60, SIM_MOVE=0.90, TINY_EQ=3;

/* ---------- intern ---------- */
function makeIntern(){
  var m=new Map(), n=0;
  return function(s){ var v=m.get(s); if(v===undefined){ v=++n; m.set(s,v); } return v; };
}

/* ---------- tokenizer ---------- */
var RE_OK=true;
function newTokenRe(){
  if(RE_OK){
    try{
      return new RegExp(
        '([^\\S\\n]+)'
      + '|(\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic}|\\p{Emoji_Modifier})*)'
      + '|([\\p{L}\\p{N}\\p{M}](?:[\\p{L}\\p{N}\\p{M}]|[\'\\u2019\\u02BC\\-](?=[\\p{L}\\p{N}\\p{M}])'
      + '|[\\u200B\\u200C\\u200D\\uFEFF\\u00AD]+(?=[\\p{L}\\p{N}\\p{M}])|[.,:](?=\\p{N}))*)'
      + '|([\\s\\S])','gu');
    }catch(e){ RE_OK=false; }
  }
  return /([^\S\n]+)|([←-⯿\u{1F000}-\u{1FAFF}\u{FE0F}]+)|([0-9A-Za-zÀ-ɏͰ-ӿ](?:[0-9A-Za-zÀ-ɏͰ-ӿ]|['’ʼ-](?=[0-9A-Za-zÀ-ɏͰ-ӿ])|[​‌‍﻿­]+(?=[0-9A-Za-zÀ-ɏͰ-ӿ])|[.,:](?=[0-9]))*)|([\s\S])/gu;
}
var ZW=/[​‌‍﻿­]/g;
var SMART_S=/[‘’ʼ‛]/g, SMART_D=/[“”„‟]/g;
var DASH=/[–\u2014−―]/g, ELL=/…/g, NBSP=/[      ]/g;
var WCH=RE_OK?/[\p{L}\p{N}\p{M}]/u:/[0-9A-Za-zÀ-ɏ]/;
function norm(s){
  return s.replace(SMART_S,"'").replace(SMART_D,'"').replace(DASH,'-').replace(ELL,'...').replace(NBSP,' ');
}

function tokenize(text, from, to, o){
  var re=newTokenRe(), out=[], m, seg=text.slice(from,to);
  re.lastIndex=0;
  while((m=re.exec(seg))!==null){
    if(m[0]==='') { re.lastIndex++; continue; }
    var kind = m[1]!==undefined?SPACE : m[2]!==undefined?EMOJI : m[3]!==undefined?WORD : PUNCT;
    var raw=m[0], k=raw, ign=false, pk=raw;
    if(kind!==EMOJI){ k=k.replace(ZW,''); pk=pk.replace(ZW,''); }
    /* pkey: always fully normalized. Used only for similarity/pairing bags, never
       for marking, whether two paragraphs are "the same paragraph" must not hinge
       on quote style or capitalisation, regardless of the ignore flags. */
    pk=norm(pk).toLowerCase();
    if(o.typo) k=norm(k);
    if(kind===SPACE){ if(o.ws) k=' '; }
    else if(kind===PUNCT && o.punct){ k=''; ign=true; }
    if(o.icase && !ign) k=k.toLowerCase();
    if(!ign && k==='' && kind!==SPACE) ign=true;
    out.push({kind:kind,start:from+m.index,end:from+m.index+raw.length,raw:raw,key:k,pkey:pk,ignorable:ign});
  }
  return out;
}

/* ---------- units: one per line ---------- */
function splitUnits(text){
  var u=[], i=0, j;
  if(text.length===0) return u;
  for(;;){
    j=text.indexOf('\n', i);
    if(j<0){ u.push({start:i,end:text.length}); break; }
    u.push({start:i,end:j}); i=j+1;
  }
  return u;
}

function buildSide(raw, o, intern){
  var text=raw.normalize?raw.normalize('NFC'):raw;
  text=text.replace(/\r\n|\r/g,'\n');
  var units=splitUnits(text), i, k, t, n;
  for(i=0;i<units.length;i++){
    var U=units[i];
    U.n=i;
    U.text=text.slice(U.start,U.end);
    U.tokens=tokenize(text,U.start,U.end,o);
    var keys=[], words=[], wc=0;
    for(k=0;k<U.tokens.length;k++){
      t=U.tokens[k];
      if(!t.ignorable) keys.push(t.key);
      if(t.kind===WORD||t.kind===EMOJI){ words.push(intern('W '+t.pkey)); wc++; }
    }
    if(o.ws){ while(keys.length&&keys[0]===' ') keys.shift();
              while(keys.length&&keys[keys.length-1]===' ') keys.pop(); }
    U.keyStr=keys.join('\u0001');
    U.id=intern('L\u0000'+U.keyStr);
    U.words=Int32Array.from(words);
    U.wordCount=wc;
    U.blank=U.wordCount===0 && /^\s*$/.test(U.text);
    n=0;
    for(k=0;k<U.tokens.length;k++) if(!U.tokens[k].ignorable) n++;
    U.cmpLen=n;
  }
  return {text:text, units:units};
}

/* ---------- cmp view ---------- */
function cmpView(tokens, intern){
  var idx=[], ids=[], i;
  for(i=0;i<tokens.length;i++) if(!tokens[i].ignorable){ idx.push(i); ids.push(intern(tokens[i].key)); }
  return {idx:Int32Array.from(idx), ids:Int32Array.from(ids)};
}

/* ---------- coalesce ---------- */
function coalesce(ops){
  var out=[], i, o, p;
  for(i=0;i<ops.length;i++){
    o=ops[i];
    if(o.a1===o.a0 && o.b1===o.b0) continue;
    p=out.length?out[out.length-1]:null;
    if(p && p.t===o.t && p.a1===o.a0 && p.b1===o.b0 && !p.sub && !o.sub){ p.a1=o.a1; p.b1=o.b1; }
    else out.push({t:o.t,a0:o.a0,a1:o.a1,b0:o.b0,b1:o.b1});
  }
  return out;
}

/* ---------- Myers ---------- */
function myers(A,B,ctx){
  var N=A.length, M=B.length;
  if(!N && !M) return [];
  if(!N) return [{t:'+',a0:0,a1:0,b0:0,b1:M}];
  if(!M) return [{t:'-',a0:0,a1:N,b0:0,b1:0}];
  if(N*M > ctx.maxCells){ ctx.bail='size'; return null; }
  var MAXD=N+M, off=MAXD, rowLen=2*MAXD+1;
  var maxD=Math.min(MAXD, Math.floor(ctx.traceBytes/(4*rowLen)));
  var V=new Int32Array(rowLen), trace=[], d, k, x, y;
  for(d=0; d<=maxD; d++){
    trace.push(V.slice());
    for(k=-d;k<=d;k+=2){
      if(k===-d || (k!==d && V[off+k-1]<V[off+k+1])) x=V[off+k+1]; else x=V[off+k-1]+1;
      y=x-k;
      while(x<N && y<M && A[x]===B[y]){ x++; y++; }
      V[off+k]=x;
      if(x>=N && y>=M) return backtrack(trace,A,B,d,off);
    }
    ctx.work += 2*d+1;
    if(ctx.work > LIMITS.work){ ctx.bail='work'; return null; }
  }
  ctx.bail='depth';
  return null;
}
function backtrack(trace,A,B,d,off){
  var x=A.length, y=B.length, ops=[], D, V, k, pk, px, py;
  for(D=d; D>0; D--){
    V=trace[D]; k=x-y;
    if(k===-D || (k!==D && V[off+k-1]<V[off+k+1])) pk=k+1; else pk=k-1;
    px=V[off+pk]; py=px-pk;
    while(x>px && y>py){ x--; y--; ops.push({t:'=',a0:x,a1:x+1,b0:y,b1:y+1}); }
    if(x===px){ y--; ops.push({t:'+',a0:x,a1:x,b0:y,b1:y+1}); }
    else { x--; ops.push({t:'-',a0:x,a1:x+1,b0:y,b1:y}); }
    x=px; y=py;
  }
  while(x>0 && y>0){ x--; y--; ops.push({t:'=',a0:x,a1:x+1,b0:y,b1:y+1}); }
  ops.reverse();
  return ops;
}

/* ---------- diffSeq: affix trim + Myers ---------- */
function diffSeq(A,B,ctx){
  var N=A.length, M=B.length, lim=Math.min(N,M), p=0, s=0;
  if(!N && !M) return [];
  while(p<lim && A[p]===B[p]) p++;
  while(s<lim-p && A[N-1-s]===B[M-1-s]) s++;
  var oa=p, ob=p, a1=N-s, b1=M-s, mid, i, sub;
  if(oa===a1 && ob===b1) mid=[];
  else if(oa===a1) mid=[{t:'+',a0:oa,a1:oa,b0:ob,b1:b1}];
  else if(ob===b1) mid=[{t:'-',a0:oa,a1:a1,b0:ob,b1:ob}];
  else{
    sub=myers(A.subarray(oa,a1), B.subarray(ob,b1), ctx);
    if(!sub) return null;
    mid=[];
    for(i=0;i<sub.length;i++) mid.push({t:sub[i].t,a0:sub[i].a0+oa,a1:sub[i].a1+oa,b0:sub[i].b0+ob,b1:sub[i].b1+ob});
  }
  var ops=[];
  if(p>0) ops.push({t:'=',a0:0,a1:p,b0:0,b1:p});
  for(i=0;i<mid.length;i++) ops.push(mid[i]);
  if(s>0) ops.push({t:'=',a0:N-s,a1:N,b0:M-s,b1:M});
  return coalesce(ops);
}

/* ---------- Dice similarity over word bags ---------- */
function dice(wa,wb){
  var la=wa.length, lb=wb.length, i, m, c, inter=0;
  if(!la && !lb) return 1;
  if(!la || !lb) return 0;
  var shortA = la<=lb, S = shortA?wa:wb, L = shortA?wb:wa;
  m=new Map();
  for(i=0;i<S.length;i++){ c=m.get(S[i]); m.set(S[i], c===undefined?1:c+1); }
  for(i=0;i<L.length;i++){ c=m.get(L[i]); if(c>0){ m.set(L[i],c-1); inter++; } }
  return 2*inter/(la+lb);
}

/* ---------- non-crossing greedy pairing ---------- */
function pairBlocks(dels, inss, wordsOf, lenOf){
  var D=dels.length, I=inss.length, cands=[], d, i, s, la, lb, thr, band;
  if(!D || !I) return {pairs:[], moves:[]};
  var all = D*I <= LIMITS.pairAll;
  for(d=0;d<D;d++){
    if(all){ band=[0,I-1]; }
    else{ var c=Math.round(d*I/D); band=[Math.max(0,c-LIMITS.pairBand), Math.min(I-1,c+LIMITS.pairBand)]; }
    for(i=band[0];i<=band[1];i++){
      la=lenOf(dels[d]); lb=lenOf(inss[i]);
      s=dice(wordsOf(dels[d]), wordsOf(inss[i]));
      thr=SIM_MIN;
      if(la<4 || lb<4) thr=SIM_SHORT;
      if(Math.max(la,lb) > 3*Math.max(1,Math.min(la,lb))) thr=Math.max(thr,SIM_SHORT);
      cands.push({d:d,i:i,s:s,ok:s>=thr});
    }
  }
  cands.sort(function(x,y){
    if(y.s!==x.s) return y.s-x.s;
    if((x.d+x.i)!==(y.d+y.i)) return (x.d+x.i)-(y.d+y.i);
    if(x.d!==y.d) return x.d-y.d;
    return x.i-y.i;
  });
  var usedD=new Uint8Array(D), usedI=new Uint8Array(I), acc=[], moves=[], j, cross, k;
  for(j=0;j<cands.length;j++){
    var c2=cands[j];
    if(usedD[c2.d]||usedI[c2.i]) continue;
    cross=false;
    for(k=0;k<acc.length;k++){
      if((c2.d>acc[k].d) !== (c2.i>acc[k].i)){ cross=true; break; }
    }
    if(cross){ if(c2.s>=0.80) moves.push(c2); continue; }
    if(!c2.ok) continue;
    usedD[c2.d]=1; usedI[c2.i]=1; acc.push(c2);
  }
  acc.sort(function(x,y){ return x.d-y.d; });
  return {pairs:acc, moves:moves};
}

/* ---------- level 1: unit diff with patience fallback ---------- */
function unitIds(units){
  var a=new Int32Array(units.length), i;
  for(i=0;i<units.length;i++) a[i]=units[i].id;
  return a;
}
function diffUnits(UA, UB, ctx){
  var A=unitIds(UA), B=unitIds(UB);
  var save=ctx.maxCells; ctx.maxCells=LIMITS.l1Cells;
  var ops=diffSeq(A,B,ctx);
  ctx.maxCells=save;
  if(ops) return ops;
  ctx.degraded=true; ctx.reason='structure diff exceeded its budget; used anchor matching';
  return patience(A,B,UA,UB,ctx);
}
function patience(A,B,UA,UB,ctx){
  var ca=new Map(), cb=new Map(), i, key;
  for(i=0;i<A.length;i++){ if(UA[i].blank||UA[i].wordCount<3) continue; ca.set(A[i], ca.has(A[i])?-1:i); }
  for(i=0;i<B.length;i++){ if(UB[i].blank||UB[i].wordCount<3) continue; cb.set(B[i], cb.has(B[i])?-1:i); }
  var m=[];
  ca.forEach(function(av,k2){ var bv=cb.get(k2); if(av>=0 && bv!==undefined && bv>=0) m.push([av,bv]); });
  m.sort(function(x,y){ return x[0]-y[0]; });
  // LIS on b
  var tails=[], from=[], pos=[];
  for(i=0;i<m.length;i++){
    var lo=0, hi=tails.length;
    while(lo<hi){ var mid=(lo+hi)>>1; if(m[tails[mid]][1] < m[i][1]) lo=mid+1; else hi=mid; }
    from[i] = lo>0 ? tails[lo-1] : -1;
    if(lo===tails.length) tails.push(i); else tails[lo]=i;
  }
  var anchors=[];
  if(tails.length){ var cur=tails[tails.length-1]; while(cur>=0){ anchors.push(m[cur]); cur=from[cur]; } anchors.reverse(); }
  var ops=[], pa=0, pb=0, save=ctx.maxCells;
  function gap(a0,a1,b0,b1){
    if(a0===a1 && b0===b1) return;
    if(a0===a1){ ops.push({t:'+',a0:a0,a1:a0,b0:b0,b1:b1}); return; }
    if(b0===b1){ ops.push({t:'-',a0:a0,a1:a1,b0:b0,b1:b0}); return; }
    var n=a1-a0, q=b1-b0, sub=null;
    if(n*q<=LIMITS.l1Cells){ ctx.maxCells=LIMITS.l1Cells; sub=diffSeq(A.subarray(a0,a1),B.subarray(b0,b1),ctx); ctx.maxCells=save; }
    if(!sub){ ops.push({t:'-',a0:a0,a1:a1,b0:b0,b1:b0}); ops.push({t:'+',a0:a1,a1:a1,b0:b0,b1:b1}); return; }
    for(var z=0;z<sub.length;z++) ops.push({t:sub[z].t,a0:sub[z].a0+a0,a1:sub[z].a1+a0,b0:sub[z].b0+b0,b1:sub[z].b1+b0});
  }
  for(i=0;i<anchors.length;i++){
    gap(pa,anchors[i][0],pb,anchors[i][1]);
    ops.push({t:'=',a0:anchors[i][0],a1:anchors[i][0]+1,b0:anchors[i][1],b1:anchors[i][1]+1});
    pa=anchors[i][0]+1; pb=anchors[i][1]+1;
  }
  gap(pa,A.length,pb,B.length);
  return coalesce(ops);
}

/* ---------- sentence spans over a token array ---------- */
var SENT_END=/^[.!?…]$/, SENT_CLOSE=/^["'”’)\]»›]$/;
function sentSpans(tokens){
  var out=[], t0=0, i, j, e;
  for(i=0;i<tokens.length;i++){
    if(tokens[i].kind===PUNCT && SENT_END.test(tokens[i].raw)){
      j=i+1;
      while(j<tokens.length && tokens[j].kind===PUNCT && SENT_CLOSE.test(tokens[j].raw)) j++;
      if(j>=tokens.length || tokens[j].kind===SPACE){
        e=j; while(e<tokens.length && tokens[e].kind===SPACE) e++;
        out.push({t0:t0,t1:e}); t0=e; i=e-1;
      }
    }
  }
  if(t0<tokens.length) out.push({t0:t0,t1:tokens.length});
  if(!out.length) out.push({t0:0,t1:tokens.length});
  return out;
}
function cmpPrefix(tokens){
  var p=new Int32Array(tokens.length+1), i;
  for(i=0;i<tokens.length;i++) p[i+1]=p[i]+(tokens[i].ignorable?0:1);
  return p;
}
function spanInfo(tokens, spans, prefix, intern){
  var out=[], i, s, k, keys, words, wc, t;
  for(i=0;i<spans.length;i++){
    s=spans[i]; keys=[]; words=[]; wc=0;
    for(k=s.t0;k<s.t1;k++){
      t=tokens[k];
      if(!t.ignorable) keys.push(t.key);
      if(t.kind===WORD||t.kind===EMOJI){ words.push(intern('W '+t.pkey)); wc++; }
    }
    out.push({c0:prefix[s.t0], c1:prefix[s.t1], t0:s.t0, t1:s.t1,
              id:intern('S\u0000'+keys.join('\u0001')), words:Int32Array.from(words), wordCount:wc});
  }
  return out;
}

/* ---------- level 2 ---------- */
function wordOps(va, vb, ctx, gran){
  var save=ctx.maxCells;
  ctx.maxCells = LIMITS.l2Cells;
  var ops=null;
  if(va.ids.length + vb.ids.length <= LIMITS.l2Span) ops=diffSeq(va.ids, vb.ids, ctx);
  else ctx.bail='span';
  ctx.maxCells=save;
  return ops;
}
function sentenceOps(ta, tb, va, vb, ctx, refine){
  var intern=ctx.intern;
  var sa=spanInfo(ta, sentSpans(ta), cmpPrefix(ta), intern);
  var sb=spanInfo(tb, sentSpans(tb), cmpPrefix(tb), intern);
  var A=new Int32Array(sa.length), B=new Int32Array(sb.length), i;
  for(i=0;i<sa.length;i++) A[i]=sa[i].id;
  for(i=0;i<sb.length;i++) B[i]=sb[i].id;
  var save=ctx.maxCells; ctx.maxCells=LIMITS.l1Cells;
  var sops=diffSeq(A,B,ctx);
  ctx.maxCells=save;
  if(!sops){
    return [{t:'-',a0:0,a1:va.ids.length,b0:0,b1:0},{t:'+',a0:va.ids.length,a1:va.ids.length,b0:0,b1:vb.ids.length}];
  }
  var ops=[], k;
  function emitPair(A1,B1){
    // A1/B1 are spanInfo entries
    if(refine){
      var subA={ids:va.ids.subarray(A1.c0,A1.c1)}, subB={ids:vb.ids.subarray(B1.c0,B1.c1)};
      var s2=null, sv=ctx.maxCells; ctx.maxCells=LIMITS.l2Cells;
      if((A1.c1-A1.c0)+(B1.c1-B1.c0) <= LIMITS.l2Span) s2=diffSeq(subA.ids, subB.ids, ctx);
      ctx.maxCells=sv;
      if(s2){
        for(var z=0;z<s2.length;z++) ops.push({t:s2[z].t,a0:s2[z].a0+A1.c0,a1:s2[z].a1+A1.c0,b0:s2[z].b0+B1.c0,b1:s2[z].b1+B1.c0});
        return;
      }
      ctx.degraded=true; ctx.reason='a very long paragraph was compared sentence by sentence';
    }
    ops.push({t:'-',a0:A1.c0,a1:A1.c1,b0:B1.c0,b1:B1.c0});
    ops.push({t:'+',a0:A1.c1,a1:A1.c1,b0:B1.c0,b1:B1.c1});
  }
  for(k=0;k<sops.length;k++){
    var o=sops[k], x, dels, inss, pr, seen, y;
    if(o.t==='='){
      for(x=0;x<o.a1-o.a0;x++){
        var Ai=sa[o.a0+x], Bi=sb[o.b0+x];
        if((Ai.c1-Ai.c0)===(Bi.c1-Bi.c0)) ops.push({t:'=',a0:Ai.c0,a1:Ai.c1,b0:Bi.c0,b1:Bi.c1});
        else emitPair(Ai,Bi);
      }
    } else if(o.t==='-' && sops[k+1] && sops[k+1].t==='+'){
      dels=[]; inss=[];
      for(x=o.a0;x<o.a1;x++) dels.push(sa[x]);
      for(x=sops[k+1].b0;x<sops[k+1].b1;x++) inss.push(sb[x]);
      pr=pairBlocks(dels,inss,function(u){return u.words;},function(u){return u.wordCount;});
      seen=new Map();
      for(y=0;y<pr.pairs.length;y++) seen.set(pr.pairs[y].d, pr.pairs[y].i);
      var di=0, ii=0;
      for(y=0;y<pr.pairs.length;y++){
        var P=pr.pairs[y];
        while(di<P.d){ ops.push({t:'-',a0:dels[di].c0,a1:dels[di].c1,b0:inss[ii]?inss[ii].c0:(inss.length?inss[inss.length-1].c1:0),b1:inss[ii]?inss[ii].c0:(inss.length?inss[inss.length-1].c1:0)}); di++; }
        while(ii<P.i){ ops.push({t:'+',a0:dels[di]?dels[di].c0:dels[dels.length-1].c1,a1:dels[di]?dels[di].c0:dels[dels.length-1].c1,b0:inss[ii].c0,b1:inss[ii].c1}); ii++; }
        emitPair(dels[di], inss[ii]); di++; ii++;
      }
      while(di<dels.length){ ops.push({t:'-',a0:dels[di].c0,a1:dels[di].c1,b0:inss.length?inss[inss.length-1].c1:0,b1:inss.length?inss[inss.length-1].c1:0}); di++; }
      while(ii<inss.length){ ops.push({t:'+',a0:dels.length?dels[dels.length-1].c1:0,a1:dels.length?dels[dels.length-1].c1:0,b0:inss[ii].c0,b1:inss[ii].c1}); ii++; }
      k++;
    } else if(o.t==='-'){
      ops.push({t:'-',a0:sa[o.a0].c0,a1:sa[o.a1-1].c1,b0:o.b0?sb[o.b0-1].c1:0,b1:o.b0?sb[o.b0-1].c1:0});
    } else {
      ops.push({t:'+',a0:o.a0?sa[o.a0-1].c1:0,a1:o.a0?sa[o.a0-1].c1:0,b0:sb[o.b0].c0,b1:sb[o.b1-1].c1});
    }
  }
  return coalesce(ops);
}

/* ---------- boundary scoring + sliding ---------- */
function boundaryScore(l,r){
  if(l==='' || r==='') return 6;
  var lc=l.charAt(l.length-1), rc=r.charAt(0);
  if(lc==='\n'||rc==='\n') return 4;
  if(/[.!?…]["'”’)\]»]*[^\S\n]*$/.test(l) && /^\s/.test(r)) return 3;
  if(/[,;:\u2014–][^\S\n]*$/.test(l)) return 2;
  if(WCH.test(lc) && WCH.test(rc)) return 0;
  return 1;
}
function slideOps(ops, SA, SB){
  var i, op, prev, next, isDel, S, ids, sh, best, bestSh, sc;
  function bounds(o,side){
    var Sx=side?SA:SB, s=side?o.a0:o.b0, e=side?o.a1:o.b1, v=Sx.view, T=Sx.tokens, base=Sx.base;
    if(e<=s){ var at = s<v.idx.length ? T[v.idx[s]].start-base : Sx.text.length; return [at,at]; }
    return [T[v.idx[s]].start-base, T[v.idx[e-1]].end-base];
  }
  function scoreAt(o,side){
    var Sx=side?SA:SB, b=bounds(o,side), txt=Sx.text;
    var a=boundaryScore(txt.slice(Math.max(0,b[0]-32), b[0]), txt.slice(b[0], b[0]+32));
    var c=boundaryScore(txt.slice(Math.max(0,b[1]-32), b[1]), txt.slice(b[1], b[1]+32));
    return a+c;
  }
  function mv(p,o,n,dir){
    p.a1+=dir; p.b1+=dir; o.a0+=dir; o.a1+=dir; o.b0+=dir; o.b1+=dir; n.a0+=dir; n.b0+=dir;
  }
  for(i=1;i<ops.length-1;i++){
    op=ops[i]; prev=ops[i-1]; next=ops[i+1];
    if(prev.t!=='=' || next.t!=='=') continue;
    if(op.t!=='-' && op.t!=='+') continue;
    isDel = op.t==='-';
    S = isDel?SA:SB; ids=S.view.ids;
    var lo0 = isDel?prev.a0:prev.b0, s0=function(){return isDel?op.a0:op.b0;}, s1=function(){return isDel?op.a1:op.b1;};
    var hi1 = isDel?next.a1:next.b1;
    sh=0;
    while(s0()>lo0 && ids[s1()-1]===ids[s0()-1]){ mv(prev,op,next,-1); sh--; if(sh<-5000) break; }
    best=scoreAt(op,isDel); bestSh=0; var cur=0;
    while(s1()<hi1 && ids[s0()]===ids[s1()]){
      mv(prev,op,next,1); cur++;
      sc=scoreAt(op,isDel);
      if(sc>=best){ best=sc; bestSh=cur; }
      if(cur>5000) break;
    }
    while(cur>bestSh){ mv(prev,op,next,-1); cur--; }
  }
  return coalesce(ops);
}

/* ---------- replace detection + char refinement ---------- */
var SEGR=(typeof Intl!=='undefined' && Intl.Segmenter) ? new Intl.Segmenter(undefined,{granularity:'grapheme'}) : null;
function graphemes(s){
  if(SEGR){ var o=[], it=SEGR.segment(s), x; for(x of it) o.push(x.segment); return o; }
  return Array.from(s);
}
/* force: 'Char' granularity means the reader has explicitly asked to see
   sub-word edits, so the readability gates that normally suppress noisy
   refinements are bypassed. Everything else still applies. */
function refinePair(at,bt,limit,force){
  if(at.length+bt.length>limit) return null;
  var A=graphemes(at), B=graphemes(bt), i, k, o;
  if(!A.length || !B.length) return null;
  if(A.length*B.length > LIMITS.refineCells) return null;
  var m=new Map(), n=0;
  function id(s){ var v=m.get(s); if(v===undefined){ v=++n; m.set(s,v); } return v; }
  var IA=new Int32Array(A.length), IB=new Int32Array(B.length);
  for(i=0;i<A.length;i++) IA[i]=id(A[i]);
  for(i=0;i<B.length;i++) IB[i]=id(B[i]);
  var ops=diffSeq(IA,IB,{work:0,traceBytes:1<<20,maxCells:LIMITS.refineCells,bail:null});
  if(!ops || !ops.length) return null;

  /* Gates. Two ways in:
     - normal: real shared substance (a run of >=2, >=30% of the shorter side,
       similarity > 0.6). Keeps `recieve/receive` and `29.99/29.49`, kills
       `jumps/leaps` and `bloating/heaviness`, which read as garbage refined.
     - typography: every differing grapheme is a non-word character, so the
       change IS the punctuation. Highlighting exactly the curly quote or the
       em dash is the whole point, however little text surrounds it. */
  var eqTotal=0, longRun=false, residueWordy=false, changed=0;
  for(k=0;k<ops.length;k++){
    o=ops[k];
    if(o.t==='='){ eqTotal += o.a1-o.a0; if(o.a1-o.a0>=2) longRun=true; continue; }
    var run = o.t==='-' ? A.slice(o.a0,o.a1) : B.slice(o.b0,o.b1);
    changed += run.length;
    for(i=0;i<run.length;i++) if(WCH.test(run[i])) residueWordy=true;
  }
  if(!changed) return null;
  var shorter=Math.min(A.length,B.length);
  var typographyOnly = !residueWordy && eqTotal>=1;
  if(!typographyOnly && !force){
    if(!longRun) return null;
    if(eqTotal < 0.3*shorter) return null;
    if(2*eqTotal/(A.length+B.length) <= 0.6) return null;
  }

  /* Absorb 1-grapheme equal islands between two edits. Myers prefers
     rec[-i-]e[+i+]ve (minimal), but rec[-ie-][+ei+]ve is what a reader wants:
     fewer edits, higher distance. dmp's tiny-equality rule, at grapheme scale. */
  var split=false;
  for(k=1;k<ops.length-1;k++){
    if(ops[k].t!=='=' || ops[k].a1-ops[k].a0>1) continue;
    if(ops[k-1].t==='=' || ops[k+1].t==='=') continue;
    ops[k].t='x'; split=true;
  }
  if(split){
    var na=[];
    for(k=0;k<ops.length;k++){
      o=ops[k];
      if(o.t==='x'){ na.push({t:'-',a0:o.a0,a1:o.a1,b0:o.b0,b1:o.b0});
                     na.push({t:'+',a0:o.a1,a1:o.a1,b0:o.b0,b1:o.b1}); }
      else na.push(o);
    }
    ops=coalesce(na);
    for(k=0;k<ops.length;k++) if(ops[k].t==='=') break;
    if(k===ops.length) return null;   /* nothing shared survived, plain mark reads better */
  }

  var a=[], b=[];
  for(k=0;k<ops.length;k++){
    o=ops[k];
    if(o.t==='='){ a.push({type:'eq',text:A.slice(o.a0,o.a1).join('')});
                   b.push({type:'eq',text:B.slice(o.b0,o.b1).join('')}); }
    else if(o.t==='-') a.push({type:'sub',text:A.slice(o.a0,o.a1).join('')});
    else b.push({type:'sub',text:B.slice(o.b0,o.b1).join('')});
  }
  return {a:a,b:b};
}
function detectReplaces(ops, perA, perB, ctx, gran){
  var i, tmp, pid=ctx.pid, lim = gran==='char'?LIMITS.refineChar:LIMITS.refineWord, r;
  for(i=0;i<ops.length-1;i++){
    /* perA/perB are indexed BY OP POSITION, so any reorder here must carry them
       along or compose() reads the neighbour's slot, always '', and the text
       vanishes from the rendered row. */
    if(ops[i].t==='+' && ops[i+1].t==='-'){
      tmp=ops[i]; ops[i]=ops[i+1]; ops[i+1]=tmp;
      tmp=perA[i]; perA[i]=perA[i+1]; perA[i+1]=tmp;
      tmp=perB[i]; perB[i]=perB[i+1]; perB[i+1]=tmp;
    }
    if(ops[i].t==='-' && ops[i+1].t==='+'){
      pid++;
      ops[i].pair=pid; ops[i+1].pair=pid;
      r = gran==='sentence' ? null : refinePair(perA[i]||'', perB[i+1]||'', lim, gran==='char');
      if(r){ ops[i].subA=r.a; ops[i+1].subB=r.b; }
      i++;
    }
  }
  ctx.pid=pid;
  return ops;
}

/* ---------- attach ignorable tokens, per-op text ---------- */
function attach(ops, view, tokens, side){
  var n=tokens.length, owner=new Int32Array(n), i, o, s, e, p, last, first=-1;
  for(i=0;i<n;i++) owner[i]=-1;
  for(i=0;i<ops.length;i++){
    o=ops[i]; s=side?o.a0:o.b0; e=side?o.a1:o.b1;
    for(p=s;p<e;p++) owner[view.idx[p]]=i;
  }
  last=-1;
  for(i=0;i<n;i++){ if(owner[i]>=0) last=owner[i]; else if(last>=0) owner[i]=last; }
  for(i=0;i<n;i++) if(owner[i]>=0){ first=owner[i]; break; }
  if(first<0) first=0;
  for(i=0;i<n;i++){ if(owner[i]<0) owner[i]=first; else break; }
  var per=new Array(ops.length);
  for(i=0;i<ops.length;i++) per[i]='';
  for(i=0;i<n;i++) per[owner[i]] += tokens[i].raw;
  return per;
}

/* ---------- seg composition + absorb passes ---------- */
function push(list, type, text, op){
  if(!text) return;
  var s={type:type,text:text};
  if(op){ if(op.pair) s.pair=op.pair; }
  list.push(s);
}
function expand(list, subs, type, op){
  var i;
  for(i=0;i<subs.length;i++){
    if(subs[i].type==='sub') list.push({type:type,text:subs[i].text,pair:op.pair,mark:true});
    else list.push({type:type,text:subs[i].text,pair:op.pair});
  }
}
function compose(ops, perA, perB){
  var L=[], R=[], U=[], i, o;
  for(i=0;i<ops.length;i++){
    o=ops[i];
    if(o.t==='='){ push(L,'eq',perA[i]); push(R,'eq',perB[i]); push(U,'eq',perA[i]); }
    else if(o.t==='-'){
      if(o.subA){ expand(L,o.subA,'del',o); expand(U,o.subA,'del',o); }
      else { push(L,'del',perA[i],o); push(U,'del',perA[i],o); }
    } else {
      if(o.subB){ expand(R,o.subB,'ins',o); expand(U,o.subB,'ins',o); }
      else { push(R,'ins',perB[i],o); push(U,'ins',perB[i],o); }
    }
  }
  return {L:L,R:R,U:U};
}
var ONLY_WS=/^\s+$/;
function absorb(segs){
  var i, prev, next, s;
  for(i=1;i<segs.length-1;i++){
    s=segs[i]; if(s.type!=='eq') continue;
    prev=segs[i-1]; next=segs[i+1];
    if(prev.type!==next.type || prev.type==='eq') continue;
    if(ONLY_WS.test(s.text)){ s.type=prev.type; s.absorbed=true; continue; }
    if(!/\n/.test(s.text) && s.text.replace(/\s/g,'').length<=TINY_EQ){ s.type=prev.type; s.absorbed=true; }
  }
  var out=[];
  for(i=0;i<segs.length;i++){
    s=segs[i];
    var p=out.length?out[out.length-1]:null;
    if(p && p.type===s.type && !p.mark && !s.mark && p.pair===s.pair){ p.text+=s.text; }
    else out.push({type:s.type,text:s.text,pair:s.pair,mark:s.mark});
  }
  return out;
}
function countMarked(segs){
  var i, c=0, t=0;
  for(i=0;i<segs.length;i++){ t+=segs[i].text.length; if(segs[i].type!=='eq') c+=segs[i].text.length; }
  return t? c/t : 0;
}

/* ---------- change row ---------- */
function changeRow(ua, ub, ctx, o){
  var ta=ua.tokens, tb=ub.tokens;
  var va=cmpView(ta,ctx.intern), vb=cmpView(tb,ctx.intern);
  var ops=null;
  if(o.gran==='sentence') ops=sentenceOps(ta,tb,va,vb,ctx,false);
  else{
    ops=wordOps(va,vb,ctx,o.gran);
    if(!ops){ ctx.degraded=true; ctx.reason='a very long paragraph was compared sentence by sentence'; ops=sentenceOps(ta,tb,va,vb,ctx,true); }
  }
  if(!ops.length) ops=[{t:'=',a0:0,a1:0,b0:0,b1:0}];
  var SA={text:ua.text,tokens:ta,view:va,base:ua.start};
  var SB={text:ub.text,tokens:tb,view:vb,base:ub.start};
  ops=slideOps(ops,SA,SB);
  if(!ops.length) ops=[{t:'=',a0:0,a1:0,b0:0,b1:0}];
  var perA=attach(ops,va,ta,1), perB=attach(ops,vb,tb,0);
  ops=detectReplaces(ops,perA,perB,ctx,o.gran);
  var c=compose(ops,perA,perB);
  var L=absorb(c.L), R=absorb(c.R), U=absorb(c.U);
  var marks=0, i;
  for(i=0;i<ops.length;i++) if(ops[i].t!=='=') marks++;
  return {left:L,right:R,uni:U,marks:marks,
          heavy: countMarked(L)>=0.9 && countMarked(R)>=0.9,
          eqWordsA:eqWords(ops,va,ta,1), eqWordsB:eqWords(ops,vb,tb,0)};
}
function eqWords(ops,view,tokens,side){
  var i,p,s,e,c=0,t;
  for(i=0;i<ops.length;i++){
    if(ops[i].t!=='=') continue;
    s=side?ops[i].a0:ops[i].b0; e=side?ops[i].a1:ops[i].b1;
    for(p=s;p<e;p++){ t=tokens[view.idx[p]]; if(t.kind===WORD||t.kind===EMOJI) c++; }
  }
  return c;
}
function plainRow(u, side){
  return side ? {left:[{type:'del',text:u.text}], right:null, uni:[{type:'del',text:u.text}]}
              : {left:null, right:[{type:'ins',text:u.text}], uni:[{type:'ins',text:u.text}]};
}

/* ---------- assemble rows ---------- */
function assemble(UA, UB, ops, ctx, o){
  var rows=[], i, x, blk=0;
  function eqRow(a,b){
    var k = a.text===b.text ? 'equal' : 'equal-normalized';
    rows.push({kind:k,aLine:a.n,bLine:b.n,left:[{type:'eq',text:a.text}],right:[{type:'eq',text:b.text}],
               uni:[{type:'eq',text:b.text}],blk:-1,aBlank:a.blank,bBlank:b.blank});
  }
  function delRow(u,b){ var r=plainRow(u,1); r.kind='delete'; r.aLine=u.n; r.bLine=null; r.blk=b; r.aBlank=u.blank; rows.push(r); return r; }
  function insRow(u,b){ var r=plainRow(u,0); r.kind='insert'; r.aLine=null; r.bLine=u.n; r.blk=b; r.bBlank=u.blank; rows.push(r); return r; }
  function chRow(a,b,blk2){
    if(a.blank!==b.blank){ delRow(a,blk2); insRow(b,blk2); return; }
    var c=changeRow(a,b,ctx,o);
    if(!c.marks){ rows.push({kind:'equal-normalized',aLine:a.n,bLine:b.n,left:c.left,right:c.right,uni:c.uni,blk:-1,
                             aBlank:a.blank,bBlank:b.blank,eqA:c.eqWordsA,eqB:c.eqWordsB}); return; }
    rows.push({kind:'change',aLine:a.n,bLine:b.n,left:c.left,right:c.right,uni:c.uni,blk:blk2,
               heavy:c.heavy,aBlank:a.blank,bBlank:b.blank,eqA:c.eqWordsA,eqB:c.eqWordsB});
  }
  for(i=0;i<ops.length;i++){
    var op=ops[i];
    if(op.t==='='){ for(x=0;x<op.a1-op.a0;x++) eqRow(UA[op.a0+x],UB[op.b0+x]); continue; }
    var dels=[], inss=[], j=i;
    if(op.t==='-' && ops[i+1] && ops[i+1].t==='+'){
      for(x=op.a0;x<op.a1;x++) dels.push(UA[x]);
      for(x=ops[i+1].b0;x<ops[i+1].b1;x++) inss.push(UB[x]);
      i++;
    } else if(op.t==='+' && ops[i+1] && ops[i+1].t==='-'){
      for(x=op.b0;x<op.b1;x++) inss.push(UB[x]);
      for(x=ops[i+1].a0;x<ops[i+1].a1;x++) dels.push(UA[x]);
      i++;
    } else if(op.t==='-'){ for(x=op.a0;x<op.a1;x++) dels.push(UA[x]); }
    else { for(x=op.b0;x<op.b1;x++) inss.push(UB[x]); }
    blk++;
    if(!dels.length){ for(x=0;x<inss.length;x++) insRow(inss[x],blk); continue; }
    if(!inss.length){ for(x=0;x<dels.length;x++) delRow(dels[x],blk); continue; }
    var pr=pairBlocks(dels,inss,function(u){return u.words;},function(u){return u.wordCount;});
    var di=0, ii=0, y;
    function flush(dEnd,iEnd){
      var nd=dEnd-di, ni=iEnd-ii;
      if(nd===1 && ni===1 && !dels[di].blank && !inss[ii].blank){
        var a=dels[di], b=inss[ii];
        rows.push({kind:'replace-unrelated',aLine:a.n,bLine:b.n,
                   left:[{type:'del',text:a.text}],right:[{type:'ins',text:b.text}],
                   uni:[{type:'del',text:a.text},{type:'ins',text:b.text}],blk:blk,
                   aBlank:a.blank,bBlank:b.blank});
        di++; ii++; return;
      }
      while(di<dEnd) delRow(dels[di++],blk);
      while(ii<iEnd) insRow(inss[ii++],blk);
    }
    for(y=0;y<pr.pairs.length;y++){
      flush(pr.pairs[y].d, pr.pairs[y].i);
      chRow(dels[di],inss[ii],blk); di++; ii++;
    }
    flush(dels.length, inss.length);
  }
  return rows;
}

/* ---------- moves ---------- */
function linkMoves(rows, UA, UB){
  var outs=[], ins=[], i, r, mid=0;
  for(i=0;i<rows.length;i++){
    r=rows[i];
    if(r.kind==='delete' && !r.aBlank) outs.push(i);
    else if(r.kind==='insert' && !r.bBlank) ins.push(i);
  }
  if(!outs.length || !ins.length) return rows;
  var usedI={}, a, b, j, budget=LIMITS.moveDice;
  for(i=0;i<outs.length;i++){
    r=rows[outs[i]]; a=UA[r.aLine];
    var bestJ=-1, bestS=0;
    for(j=0;j<ins.length;j++){
      if(usedI[j]) continue;
      var rb=rows[ins[j]];
      if(rb.blk===r.blk) continue;
      b=UB[rb.bLine];
      var s;
      if(a.keyStr===b.keyStr && a.wordCount>0) s=1;
      else{
        /* dice = 2*inter/(la+lb) <= 2*min/(la+lb), so reaching SIM_MOVE at all
           requires the lengths within ~1.22x. Exact prefilter, no Map allocated. */
        if(a.wordCount<6 || b.wordCount<6) continue;
        var lo=Math.min(a.wordCount,b.wordCount), hi=Math.max(a.wordCount,b.wordCount);
        if(2*lo < SIM_MOVE*(lo+hi)) continue;
        if(budget<=0) continue;
        budget--;
        s=dice(a.words,b.words);
      }
      if(s>=SIM_MOVE && s>bestS){ bestS=s; bestJ=j; }
    }
    if(bestJ<0) continue;
    usedI[bestJ]=1; mid++;
    rows[outs[i]].kind='move-out'; rows[outs[i]].moveId=mid;
    rows[ins[bestJ]].kind='move-in'; rows[ins[bestJ]].moveId=mid;
  }
  return rows;
}

/* ---------- stats ---------- */
function wordsOf(units){ var i,c=0; for(i=0;i<units.length;i++) c+=units[i].wordCount; return c; }
function statsOf(rows, A, B){
  var s={changes:0,added:0,removed:0,rewritten:0,moved:0,
         wordsA:wordsOf(A.units),wordsB:wordsOf(B.units),
         charsA:A.text.length,charsB:B.text.length,unchanged:0},i,r;
  for(i=0;i<rows.length;i++){
    r=rows[i];
    if(r.kind==='equal'||r.kind==='equal-normalized'){
      s.unchanged += r.eqA!==undefined ? r.eqA : (A.units[r.aLine]?A.units[r.aLine].wordCount:0);
      continue;
    }
    if(r.kind==='change'){ s.rewritten++; s.unchanged += r.eqA||0; }
    else if(r.kind==='replace-unrelated') s.rewritten++;
    else if(r.kind==='delete') s.removed++;
    else if(r.kind==='insert') s.added++;
    else if(r.kind==='move-out') s.moved++;
    else if(r.kind==='move-in') continue;
  }
  s.changes=s.added+s.removed+s.rewritten+s.moved;
  s.wordDelta=s.wordsB-s.wordsA;
  s.wordPct=s.wordsA? (s.wordDelta/s.wordsA*100) : (s.wordsB?100:0);
  s.similarity=(s.wordsA+s.wordsB)? 2*s.unchanged/(s.wordsA+s.wordsB) : 1;
  s.readA=s.wordsA/225; s.readB=s.wordsB/225;
  return s;
}

/* ---------- public ---------- */
function compare(rawA, rawB, opt){
  var o={ws:opt.ws!==false, typo:opt.typo!==false, icase:!!opt.icase, punct:!!opt.punct,
         gran:opt.gran||'word'};
  var intern=makeIntern();
  var ctx={intern:intern, work:0, traceBytes:LIMITS.traceBytes, maxCells:LIMITS.l2Cells,
           degraded:false, reason:null, pid:0, bail:null};
  var A=buildSide(rawA,o,intern), B=buildSide(rawB,o,intern);
  var ops=diffUnits(A.units,B.units,ctx);
  var rows=assemble(A.units,B.units,ops,ctx,o);
  rows=linkMoves(rows,A.units,B.units);
  var changes=[], i;
  for(i=0;i<rows.length;i++){
    rows[i].i=i;
    if(rows[i].kind!=='equal' && rows[i].kind!=='equal-normalized' && rows[i].kind!=='move-in'){
      rows[i].changeIdx=changes.length; changes.push(i);
    } else rows[i].changeIdx=null;
  }
  return {rows:rows, changes:changes, stats:statsOf(rows,A,B),
          degraded:ctx.degraded, reason:ctx.reason, textA:A.text, textB:B.text};
}

return {compare:compare, LIMITS:LIMITS, _t:{tokenize:tokenize,splitUnits:splitUnits,myers:myers,
        diffSeq:diffSeq,dice:dice,refinePair:refinePair,boundaryScore:boundaryScore,graphemes:graphemes}};
})();
if(typeof module!=='undefined' && module.exports) module.exports=CD;
