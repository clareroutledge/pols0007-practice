(function(){
const CFG=window.PRACTICE_CONFIG||{};const $=s=>document.querySelector(s);const app=$('#app');
const LS='pols0007_practice_v1';
let BANK,S;
const LEVELS={1:'Words and symbols',2:'Spot it',3:'Reason it through',4:'Put it together'};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function load(){try{return JSON.parse(localStorage.getItem(LS))||{}}catch(e){return{}}}
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
function log(row){if(!CFG.url)return;try{fetch(CFG.url+'/rest/v1/attempts',{method:'POST',headers:{apikey:CFG.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(Object.assign({student:S.id},row)),keepalive:true}).catch(()=>{})}catch(e){}}
// ---------- calc generators ----------
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;const f1=x=>Math.round(x*10)/10;
function mk(stem,right,wrongs,note){const seen=new Set([String(right)]);const opts=[{t:String(right),ok:true,why:note}];for(const [v,m,w] of wrongs){if(seen.has(String(v)))continue;seen.add(String(v));opts.push({t:String(v),ok:false,mis:m,why:w})}let k=1;while(opts.length<4){const v=f1(right+k*2);k++;if(!seen.has(String(v))){seen.add(String(v));opts.push({t:String(v),ok:false,mis:'CALC',why:'Check your arithmetic.'})}}return{type:'mcq',level:0,stem,options:opts}}
function genCalc(c){let it;
 if(c.kind==='effect'){const a=rnd(45,80),b=rnd(40,85);if(a===b)return genCalc(c);it=mk(`A unit has Y₁ᵢ = ${a} and Y₀ᵢ = ${b}. What is the individual causal effect?`,a-b,[[b-a,'DIR','Right numbers, wrong order: the effect is Y₁ᵢ − Y₀ᵢ.'],[Math.round((a+b)/2),'CALC','That is the average of the two, not the gap.'],[a+b,'CALC','Adding the two gives nothing useful.']],`Y₁ᵢ − Y₀ᵢ = ${a} − ${b} = ${a-b}.`)}
 if(c.kind==='naive'){const t=[rnd(55,80),rnd(55,80),rnd(55,80)],cc=[rnd(45,75),rnd(45,75),rnd(45,75)];const mt=f1(mean(t)),mc=f1(mean(cc));const r=f1(mt-mc);it=mk(`Treated pupils scored ${t.join(', ')} (observed). Control pupils scored ${cc.join(', ')}. What is the naive comparison (treated average − control average)?`,r,[[f1(mc-mt),'DIR','The order is reversed: treated minus control.'],[f1(mean(t.concat(cc))),'CALC','That averages everyone together. We need two averages, then their difference.'],[f1(t.reduce((a,b)=>a+b,0)-cc.reduce((a,b)=>a+b,0)),'CALC','You subtracted the totals. Divide each by 3 first.']],`Treated average ${mt}, control average ${mc}, difference ${r}.`)}
 if(c.kind==='ate'){const rows=Array.from({length:4},()=>{const b=rnd(45,70);return[b+rnd(0,12),b]});const eff=rows.map(r=>r[0]-r[1]);const r=f1(mean(eff));it=mk(`A science table has four units with (Y₁ᵢ, Y₀ᵢ): ${rows.map(r=>`(${r[0]}, ${r[1]})`).join(', ')}. What is the ATE?`,r,[[eff.reduce((a,b)=>a+b,0),'CALC','That is the sum of the effects. Divide by 4 to average.'],[f1(mean(rows.map(r=>r[0]))),'DEF','That is the average Y₁ᵢ only. The ATE averages Y₁ᵢ − Y₀ᵢ.'],[eff[0],'DEF','That is one unit’s effect, not the average.']],`Effects: ${eff.join(', ')}. Average = ${r}.`)}
 if(c.kind==='gap'){const e=rnd(2,6),n=e+rnd(3,9);it=mk(`The naive comparison is ${n} and the true ATE is ${e}. How much of the naive comparison is due to the groups differing, not the treatment?`,n-e,[[e,'DIFF','That is the true effect, which is the part that is not due to group differences.'],[n,'DIFF','That treats all of the naive comparison as group differences.'],[n+e,'CALC','Add vs subtract: the gap between naive and true is a difference.']],`${n} − ${e} = ${n-e}: the naive comparison overstates by this much.`)}
 if(c.kind==='obs'){const x=pick([0,1]),a=rnd(50,80),b=rnd(40,70);if(a===b)return genCalc(c);it=mk(`Unit i has Xᵢ = ${x}, Y₁ᵢ = ${a} and Y₀ᵢ = ${b}. What is the observed outcome Yᵢ?`,x?a:b,[[x?b:a,'BOTH','That is the other potential outcome, which we do not see for this unit.'],[a-b,'LABEL','That is the individual effect, which needs both and is never observed.'],[x,'LABEL','Xᵢ is whether they were treated, not their outcome.']],x?`Xᵢ = 1 so we see Y₁ᵢ = ${a}.`:`Xᵢ = 0 so we see Y₀ᵢ = ${b}.`)}
 it.options=shuf(it.options);it.id=c.id;it.concept=c.concept;it.level=c.level;it.calc=true;return it}
// ---------- item pool ----------
function pool(){const p=[];BANK.mcq.forEach(x=>p.push(Object.assign({type:'mcq'},x)));BANK.anim.forEach(x=>p.push(Object.assign({type:'mcq'},x)));BANK.two.forEach(x=>p.push(Object.assign({type:'two'},x)));BANK.calc.forEach(x=>p.push(Object.assign({type:'calc'},x)));return p}
function concepts(){return[...new Set(POOL.map(x=>x.concept))]}
function cs(c){return(S.c[c]||(S.c[c]={s:.4,n:0}))}
function nextItem(){
 const due=S.wq.filter(w=>S.answered-w.at>=3);
 if(due.length&&Math.random()<.45){const w=due[0];S.wq=S.wq.filter(x=>x!==w);const it=POOL.find(x=>x.id===w.id);if(it)return it}
 const cons=concepts();const wts=cons.map(c=>Math.pow(1-cs(c).s,2)+.08);let r=Math.random()*wts.reduce((a,b)=>a+b,0),c=cons[0];for(let i=0;i<cons.length;i++){r-=wts[i];if(r<=0){c=cons[i];break}}
 const lv=S.level;const tryL=[lv,lv-1,lv+1,lv-2,lv+2].filter(l=>l>=1&&l<=4);
 const last=S.last||[];
 for(const l of tryL){const cand=POOL.filter(x=>x.concept===c&&x.level===l&&!last.includes(x.id));const fresh=cand.filter(x=>!S.seen[x.id]);const pl=fresh.length?fresh:cand;if(pl.length)return pick(pl)}
 const any=POOL.filter(x=>x.level===lv&&!last.includes(x.id));return pick(any.length?any:POOL)}
// ---------- rendering ----------
function home(){const n=S.answered;
 app.innerHTML=`<div class="top"><h1>POLS0007 practice</h1><span class="badge">Week 5</span></div>
 <p>Short questions on the vocab and ideas from this week. They start easy and adapt to what you get wrong. Nothing here counts for marks.</p>
 <div class="home">
 <div class="card" id="h1"><h2>Practice quiz</h2><p>Adaptive questions, animations and “which way does it bias?” questions.</p>${n?`<span class="badge">Level ${S.level} · ${n} answered</span>`:''}</div>
 <div class="card" id="h2"><h2>Short answers</h2><p>Write a few sentences, then compare with a model answer.</p></div>
 <div class="card" id="h3"><h2>Flashcards</h2><p>The glossary terms, one at a time.</p></div>
 ${n?'<div class="card" id="h4"><h2>My progress</h2><p>See your strongest and weakest ideas.</p></div>':''}
 </div><p class="fine">This tool records anonymous usage (a random code, not your name) to help improve teaching.</p>`;
 $('#h1').onclick=quiz;$('#h2').onclick=shortMode;$('#h3').onclick=flash;if($('#h4'))$('#h4').onclick=summary}
function head(){return`<div class="top"><button class="btn alt" id="bk">← Menu</button><span class="badge">Level ${S.level}: ${LEVELS[S.level]}</span><button class="btn alt" id="fin">See my progress</button></div>`}
function wire(){$('#bk').onclick=home;$('#fin').onclick=summary}
function levelNote(){const m=S.msg;S.msg='';return m?`<div class="tip"><b>${m}</b></div>`:''}
function record(it,id,concept,ok,mis,mode){
 const c=cs(concept);c.s=c.s*.7+(ok?1:0)*.3;c.n++;S.answered++;S.seen[it.id]=1;
 if(!ok){if(mis)S.mis[mis]=(S.mis[mis]||0)+1;if(!S.wq.find(w=>w.id===it.id))S.wq.push({id:it.id,at:S.answered})}
 log({question_id:id,concept,level:it.level||null,correct:ok,misconception:mis||null,mode});save()}
function adapt(ok){S.last=(S.last||[]).concat([S.cur]).slice(-6);
 if(ok){S.st=(S.st||0)+1;S.ms=0;if(S.st>=2&&S.level<4){S.level++;S.st=0;S.msg='Nice: moving up to level '+S.level+' ('+LEVELS[S.level]+')'}}
 else{S.ms=(S.ms||0)+1;S.st=0;if(S.ms>=2&&S.level>1){S.level--;S.ms=0;S.msg='Let’s step back to level '+S.level+' and build up again'}}save()}
function quiz(){const it=nextItem();S.cur=it.id;save();
 if(it.type==='two')return two(it);const q=it.type==='calc'?genCalc(it):it;return mcq(q)}
function tipFor(mis){if(!mis||S.mis[mis]!==2)return'';return`<div class="tip"><b>Pattern spotted.</b> You’ve picked this kind of answer twice: <i>${esc(BANK.mis[mis])}</i>.<br>${esc(BANK.tips[mis])}</div>`}
function mcq(q){const opts=q.type&&q.calc?q.options:shuf(q.options);
 app.innerHTML=head()+levelNote()+`<div class="card">${q.anim?window.ANIMS[q.anim]():''}<div class="stem">${esc(q.stem)}</div><div id="o">${opts.map((o,i)=>`<button class="opt" data-i="${i}">${esc(o.t)}</button>`).join('')}</div><div id="fb"></div></div>`;wire();
 document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];const ok=!!o.ok;
  document.querySelectorAll('.opt').forEach((x,i)=>{x.disabled=true;if(opts[i].ok)x.classList.add('right')});if(!ok)b.classList.add('wrong');
  const right=opts.find(x=>x.ok);
  record(q,q.id,q.concept,ok,ok?null:o.mis,q.anim?'anim':'mcq');adapt(ok);
  $('#fb').innerHTML=`<div class="why ${ok?'good':''}">${ok?'✓ ':'✗ '}${esc(ok?o.why:o.why+' ')}${ok?'':'<br><b>Correct:</b> '+esc(right.t)+'. '+esc(right.why)}</div>${ok?'':tipFor(o.mis)}<p><button class="btn" id="nx">Next →</button></p>`;
  $('#nx').onclick=quiz})}
function two(it){
 const o1=shuf(it.opts1);const dirs=[{t:'Too large (it overstates the effect)',k:'large'},{t:'Too small (it understates the effect)',k:'small'},{t:'No systematic bias from this source',k:'none'}];
 app.innerHTML=head()+levelNote()+`<div class="card"><p class="stem">${esc(it.scen)}</p><div id="s1"><p class="stem">Step 1 · ${esc(it.s1)}</p>${o1.map((o,i)=>`<button class="opt" data-i="${i}">${esc(o.t)}</button>`).join('')}</div><div id="f1"></div><div id="s2" class="hide"></div><div id="f2"></div></div>`;wire();
 document.querySelectorAll('#s1 .opt').forEach(b=>b.onclick=()=>{const o=o1[+b.dataset.i];const ok=!!o.ok;
  document.querySelectorAll('#s1 .opt').forEach((x,i)=>{x.disabled=true;if(o1[i].ok)x.classList.add('right')});if(!ok)b.classList.add('wrong');
  record(it,it.id+'.1',it.concept,ok,ok?null:o.mis,'two1');
  $('#f1').innerHTML=`<div class="why ${ok?'good':''}">${ok?'✓ ':'✗ '}${esc(o.why)}${ok?'':'<br><b>Correct:</b> '+esc(o1.find(x=>x.ok).t)}</div>${ok?'':tipFor(o.mis)}`;
  const s2=$('#s2');s2.classList.remove('hide');s2.innerHTML=`<p class="stem" style="margin-top:14px">Step 2 · ${esc(it.s2)}</p>`+dirs.map((d,i)=>`<button class="opt" data-k="${d.k}">${esc(d.t)}</button>`).join('');
  s2.querySelectorAll('.opt').forEach(b2=>b2.onclick=()=>{const k=b2.dataset.k;const ok2=k===it.dir;
   s2.querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.k===it.dir)x.classList.add('right')});if(!ok2)b2.classList.add('wrong');
   record(it,it.id+'.2','direction-of-bias',ok2,ok2?null:'DIR','two2');adapt(ok&&ok2);
   const est=it.dir==='large'?9:it.dir==='small'?2:5;
   $('#f2').innerHTML=`<div class="why ${ok2?'good':''}">${ok2?'✓ ':'✗ '}${esc(it.why)}</div>${ok2?'':tipFor('DIR')}
   <div style="margin-top:10px"><b>True effect: 5</b><div class="trk"><i class="bar" style="background:var(--green)" data-w="50"></i></div><b>What you would estimate: ${est}</b><div class="trk"><i class="bar" style="background:${it.dir==='none'?'var(--green)':'var(--orange)'}" data-w="${est*10}"></i></div></div><p><button class="btn" id="nx">Next →</button></p>`;
   setTimeout(()=>document.querySelectorAll('.bar').forEach(b=>b.style.width=b.dataset.w+'%'),50);
   $('#nx').onclick=quiz})})}
// ---------- short answers ----------
function shortMode(){const it=pick(BANK.short);
 app.innerHTML=`<div class="top"><button class="btn alt" id="bk">← Menu</button><span class="badge">Short answer</span></div><div class="card"><div class="stem">${esc(it.q)}</div><textarea placeholder="Write 2–3 sentences, in your own words"></textarea><p><button class="btn" id="rv">Show model answer</button></p><div id="m"></div></div>`;
 $('#bk').onclick=home;$('#rv').onclick=()=>{$('#rv').disabled=true;$('#m').innerHTML=`<div class="tan card"><b>A strong answer covers three things:</b>${it.model.map((m,i)=>`<p><b>${i+1}.</b> ${esc(m)}</p>`).join('')}<p><b>How did yours compare?</b></p><button class="btn" data-r="1">I had all three</button> <button class="btn warn" data-r="0.5">Some of it</button> <button class="btn alt" data-r="0">I missed it</button></div>`;
  document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const r=+b.dataset.r;log({question_id:it.id,concept:it.concept,level:4,correct:r===1,misconception:r===0?'VAGUE':null,mode:'short'});$('#m').innerHTML+=`<p><button class="btn" id="nx">Another →</button></p>`;$('#nx').onclick=shortMode;document.querySelectorAll('[data-r]').forEach(x=>x.disabled=true)})}}
// ---------- flashcards ----------
function flash(){let g=shuf(BANK.gloss),i=0,back=false;
 const draw=()=>{const [t,d,k]=g[i];app.innerHTML=`<div class="top"><button class="btn alt" id="bk">← Menu</button><span class="badge">${i+1} / ${g.length}</span></div><div class="card flash" id="fc"><div>${back?`${k&&window.ANIMS[k]?window.ANIMS[k]():''}<h3>${esc(t)}</h3>${esc(d)}`:`<h2>${esc(t)}</h2><small>tap to flip</small>`}</div></div><p><button class="btn alt" id="pv">← Back</button> <button class="btn" id="nxc">Next →</button></p>`;
  $('#bk').onclick=home;$('#fc').onclick=()=>{back=!back;draw()};$('#nxc').onclick=()=>{i=(i+1)%g.length;back=false;draw()};$('#pv').onclick=()=>{i=(i-1+g.length)%g.length;back=false;draw()}};draw()}
// ---------- summary ----------
function summary(){const cons=Object.keys(S.c).filter(c=>S.c[c].n>0).sort((a,b)=>S.c[a].s-S.c[b].s);const nice=c=>c.replace(/-/g,' ').replace(/^./,m=>m.toUpperCase());
 const mis=Object.entries(S.mis).sort((a,b)=>b[1]-a[1]).slice(0,3);
 app.innerHTML=`<div class="top"><button class="btn alt" id="bk">← Menu</button><span class="badge">${S.answered} answered</span></div><div class="card"><h2>Your progress</h2>${cons.length?cons.map(c=>`<div class="row"><span>${nice(c)}</span><div class="meter"><i style="width:${Math.round(S.c[c].s*100)}%"></i></div></div>`).join(''):'<p>Answer a few questions first.</p>'}</div>${mis.length?`<div class="card tan"><h2>Mix-ups to watch</h2>${mis.map(([m,n])=>`<p><b>${esc(BANK.mis[m]||m)}</b> (${n}×)<br>${esc(BANK.tips[m]||'')}</p>`).join('')}</div>`:''}<p><button class="btn" id="go">Keep practising</button> <button class="btn alt" id="rs">Start again</button></p>`;
 $('#bk').onclick=home;$('#go').onclick=quiz;$('#rs').onclick=()=>{if(confirm('Reset your progress on this device?')){const id=S.id;S=fresh(id);save();home()}}}
function fresh(id){return{id:id||Math.random().toString(36).slice(2,10),level:1,c:{},mis:{},seen:{},wq:[],answered:0,last:[],st:0,ms:0,msg:''}}
fetch('bank_full.json').then(r=>r.json()).then(b=>{BANK=b;window.POOL=pool();S=Object.assign(fresh(),load());S.c=S.c||{};S.mis=S.mis||{};S.seen=S.seen||{};S.wq=S.wq||[];save();home()}).catch(e=>{app.innerHTML='<p>Sorry, the questions did not load. Try refreshing.</p>'});
})();
