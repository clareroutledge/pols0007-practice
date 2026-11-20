/* POLS0007 Week 7 activity: small step engine. Everything runs in the browser.
   Logging to the shared Supabase project is best-effort and silent on failure. */
(function(){
const CFG=window.PRACTICE_CONFIG||{};
const LS='pols0007_w7_v1';
let S;try{S=JSON.parse(localStorage.getItem(LS))||{}}catch(e){S={}}
if(!S.id){S.id='W7-'+Math.random().toString(36).slice(2,8).toUpperCase();try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function log(row){if(!CFG.url)return;try{fetch(CFG.url+'/rest/v1/attempts',{method:'POST',headers:{apikey:CFG.key,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(Object.assign({student:S.id,level:null,misconception:null,mode:'w7'},row)),keepalive:true}).catch(()=>{})}catch(e){}}
const el=(html,cls)=>{const d=document.createElement('div');if(cls)d.className=cls;d.innerHTML=html;return d};

/* ---------- running steps ---------- */
function runSteps(holder,steps,done,scroll){let k=0;
 const next=()=>{if(k>=steps.length){if(done)done();return}
  const box=el('','card');holder.append(box);const fn=steps[k++];fn(box,next);
  if(scroll!==false&&k>1)setTimeout(()=>box.scrollIntoView({behavior:'smooth',block:'start'}),60)};
 next()}
function cont(box,next,label){const p=document.createElement('p');const b=document.createElement('button');b.className='btn';b.textContent=label||'Continue →';
 b.onclick=()=>{b.disabled=true;p.style.display='none';next()};p.append(b);box.append(p)}
const fbHtml=(cls,html)=>`<div class="why ${cls}">${html}</div>`;

/* ---------- step builders ---------- */
const info=(html,label)=>(box,next)=>{box.innerHTML=html;cont(box,next,label)};

/* multiple choice with instant, option-specific feedback. opts: {t, ok, tier:'partial', why, mis} */
const mcq=o=>(box,next)=>{
 const opts=o.shuffle===false?o.opts:shuf(o.opts);
 box.innerHTML=`${o.tag?`<span class="badge ${o.tag==='Check question'?'chk':''}">${o.tag}</span>`:''}${o.ctx||''}<div class="stem">${o.stem}</div>
 <div>${opts.map((x,i)=>`<button class="opt" data-i="${i}">${esc(x.t)}</button>`).join('')}</div>
 ${o.hints?'<p><button class="btn alt sm" data-h>Need a hint?</button></p><div class="hint"></div>':''}<div class="fb"></div>`;
 const fb=box.querySelector('.fb');let first=true,done=false,hi=0;
 if(o.hints){const hb=box.querySelector('[data-h]'),hd=box.querySelector('.hint');
  hb.onclick=()=>{if(hi<o.hints.length){hd.innerHTML=`<div class="tip"><b>Hint ${hi+1}:</b> ${o.hints[hi]}</div>`;hi++;if(hi>=o.hints.length){hb.textContent='No more hints'}}else hb.disabled=true}}
 box.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(done)return;const x=opts[+b.dataset.i];const ok=!!x.ok,part=x.tier==='partial';
  if(first){log({question_id:o.id,concept:o.concept,correct:ok||part,misconception:x.mis||null});first=false}
  if(ok||part){done=true;box.querySelectorAll('.opt').forEach(z=>z.disabled=true);b.classList.add(ok?'right':'part');
   fb.innerHTML=fbHtml(ok?'good':'part',(ok?'✓ ':'~ ')+x.why);if(o.onPick)o.onPick(x);cont(box,next)}
  else{b.disabled=true;b.classList.add('wrong');fb.innerHTML=fbHtml('bad','✗ '+x.why+'<br><i>Have another go.</i>')}})};

/* tap the evidence: items {html, who, target, why} */
const taps=o=>(box,next)=>{
 box.innerHTML=`<span class="badge">Find the evidence</span><div class="stem">${o.instr}</div><div class="tapwrap">${o.items.map((it,i)=>`<div class="tap" data-i="${i}"><span class="who">${esc(it.who||'')}</span>${it.html}<div class="tapfb"></div></div>`).join('')}</div><div class="fb"></div>`;
 const need=o.items.filter(i=>i.target).length;let found=0,wrongs=0,shown=false,fin=false;
 const finish=()=>{if(fin)return;fin=true;cont(box,next)};
 box.querySelectorAll('.tap').forEach(d=>d.onclick=()=>{if(fin||d.dataset.done)return;const it=o.items[+d.dataset.i];const f=d.querySelector('.tapfb');
  if(it.target){d.dataset.done=1;d.classList.add('right');f.textContent='✓ '+(it.why||'Yes.');found++;log({question_id:o.id+'.'+d.dataset.i,concept:o.concept,correct:true});if(found>=need)finish()}
  else{wrongs++;d.classList.add('wrong');f.textContent='✗ '+(it.why||'Not that one.');log({question_id:o.id+'.'+d.dataset.i,concept:o.concept,correct:false});
   if(wrongs>=2&&!shown){shown=true;const p=document.createElement('p');const b=document.createElement('button');b.className='btn alt sm';b.textContent='Show me';
    b.onclick=()=>{box.querySelectorAll('.tap').forEach((z,i)=>{if(o.items[i].target&&!z.dataset.done){z.classList.add('part');z.querySelector('.tapfb').textContent='← '+(o.items[i].why||'This one.')}});p.remove();finish()};p.append(b);box.querySelector('.fb').append(p)}}})};

/* sort rows: items {html, ans:index, why:[text per choice]}, cats [labels] */
const sortRows=o=>(box,next)=>{
 box.innerHTML=`<span class="badge">${o.badge||'Sort it'}</span><div class="stem">${o.instr}</div>${o.items.map((it,i)=>`<div class="rowq" data-i="${i}"><div class="q">${it.html}</div><div class="cats">${o.cats.map((c,j)=>`<button class="cat" data-j="${j}">${esc(c)}</button>`).join('')}</div><div class="rf"></div></div>`).join('')}`;
 let left=o.items.length,fin=false;
 box.querySelectorAll('.rowq').forEach(r=>{const it=o.items[+r.dataset.i];let first=true,ok0=false;
  r.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{if(r.dataset.done)return;const j=+b.dataset.j,ok=j===it.ans;
   if(first){log({question_id:o.id+'.'+r.dataset.i,concept:o.concept,correct:ok,misconception:ok?null:(it.mis||null)});first=false}
   const rf=r.querySelector('.rf');
   if(ok){r.dataset.done=1;r.querySelectorAll('.cat').forEach(z=>z.disabled=true);b.classList.add('right');rf.innerHTML=fbHtml('good','✓ '+it.why[j]);left--;if(left===0&&!fin){fin=true;cont(box,next)}}
   else{b.disabled=true;b.classList.add('wrong');rf.innerHTML=fbHtml('bad','✗ '+it.why[j]+' <i>Try another.</i>')}})})};

/* match definitions to terms with dropdowns */
const match=o=>(box,next)=>{
 box.innerHTML=`<span class="badge">Warm-up</span><div class="stem">${o.instr}</div>${o.items.map((it,i)=>`<div class="rowq" data-i="${i}"><div class="q">${it.def}</div><select><option value="">Choose a term…</option>${o.terms.map(t=>`<option>${esc(t)}</option>`).join('')}</select><div class="rf"></div></div>`).join('')}`;
 let left=o.items.length,fin=false;
 box.querySelectorAll('.rowq').forEach(r=>{const it=o.items[+r.dataset.i];const s=r.querySelector('select');let first=true;
  s.onchange=()=>{if(!s.value||r.dataset.done)return;const ok=s.value===it.term;if(first){log({question_id:o.id+'.'+r.dataset.i,concept:'w7-glossary',correct:ok,misconception:ok?null:s.value});first=false}
   const rf=r.querySelector('.rf');s.classList.remove('right','wrong');
   if(ok){r.dataset.done=1;s.disabled=true;s.classList.add('right');rf.innerHTML=fbHtml('good','✓ '+it.why);left--;if(left===0&&!fin){fin=true;cont(box,next)}}
   else{s.classList.add('wrong');rf.innerHTML=fbHtml('bad','✗ '+(it.wrong&&it.wrong[s.value]?it.wrong[s.value]:'That is a different term.')+' <i>Try another.</i>')}}})};

/* Table 3 (adapted) with tappable cells */
function table3(ids){const D=[['Final grades','Course letter grade','HW score','Page views','Active days','Total participation']];
 const rows=[['Without controls',['−2.68*','(1.54)'],['0.05','(0.07)'],['−0.74','(0.72)'],['−566.08***','(153.92)'],['−9.43***','(1.57)'],['−21.37***','(4.07)']],
 ['With controls',['−2.88*','(1.60)'],['0.02','(0.06)'],['−0.92','(0.79)'],['−593.08***','(159.97)'],['−9.27***','(1.56)'],['−22.51***','(4.18)']]];
 const sd=['10.10','0.78','10.18','1,559.40','15.29','25.36'],obs=['2,379','2,362','2,379','2,379','2,379','2,379'];
 const hd=D[0].map((h,i)=>`<th class="c" data-id="h${i+1}">(${i+1}) ${h}</th>`).join('');
 const body=rows.map((r,ri)=>`<tr><td class="lab">${r[0]}<small>“Treated”</small></td>${r.slice(1).map((c,ci)=>`<td><div class="c" data-id="${ci===0?(ri?'g_est2':'g_est'):'x'+ri+ci}">${c[0]}</div><div class="c se" data-id="${ci===0?(ri?'g_se2':'g_se'):'s'+ri+ci}">${c[1]}</div></td>`).join('')}</tr>`).join('');
 return`<div style="overflow-x:auto"><table class="t3"><tr><th></th>${hd}</tr>${body}<tr><td class="lab">Control SD</td>${sd.map((v,i)=>`<td class="c" data-id="sd${i+1}">${v}</td>`).join('')}</tr><tr><td class="lab">Observations</td>${obs.map(v=>`<td>${v}</td>`).join('')}</tr></table></div><p class="fine">Adapted from Table 3 of Liu et al. (2026). Each cell is a separate regression of the outcome on assignment to the AI tutor. * p&lt;0.10, ** p&lt;0.05, *** p&lt;0.01. Standard errors in brackets.</p>`}
/* tapTable: targets {id:{why,tier}}; msgs default for others */
const tapTable=o=>(box,next)=>{
 box.innerHTML=`<span class="badge">Find the evidence</span><div class="stem">${o.instr}</div>${table3()}<div class="fb"></div>`;
 const need=Object.keys(o.targets).filter(k=>!o.targets[k].tier);let found=new Set(),fin=false,wrongs=0;
 const fb=box.querySelector('.fb');
 box.querySelectorAll('.c').forEach(c=>c.onclick=ev=>{if(fin)return;ev.stopPropagation();const id=c.dataset.id;const t=o.targets[id];
  if(t){c.classList.add(t.tier==='partial'?'part':'right');fb.innerHTML=fbHtml(t.tier?'part':'good',(t.tier?'~ ':'✓ ')+t.why);
   if(!t.tier||o.anyOne){found.add(id);log({question_id:o.id,concept:o.concept,correct:true});if(o.anyOne||found.size>=need.length){fin=true;cont(box,next)}}}
  else{wrongs++;c.classList.add('wrong');fb.innerHTML=fbHtml('bad','✗ '+(o.bad||'Not that one.')+' <i>Have another go.</i>');log({question_id:o.id,concept:o.concept,correct:false})}})};

/* ---------- navigation ---------- */
let STAGES=[],cur=0;const app=()=>document.getElementById('app');
function header(){const n=el('','nav');n.innerHTML=STAGES.map((s,i)=>`<button class="chip ${i===cur?'on':''}" data-i="${i}">${i+1}. ${s.short}</button>`).join('');
 n.querySelectorAll('.chip').forEach(b=>b.onclick=()=>go(+b.dataset.i));return n}
function go(i){cur=i;const a=app();a.innerHTML='';a.append(header());const st=STAGES[i];
 const h=el(`<h1>${st.title}</h1>${st.mins?`<p class="fine">About ${st.mins} minutes</p>`:''}`);a.append(h);const holder=el('');a.append(holder);
 runSteps(holder,st.steps(),()=>{const f=el('','');if(i<STAGES.length-1){f.innerHTML=`<p><button class="btn" id="nxt">Next: ${STAGES[i+1].short} →</button></p>`;holder.append(f);f.querySelector('#nxt').onclick=()=>{go(i+1);window.scrollTo(0,0)}}},true);
 window.scrollTo(0,0)}
function start(stages){STAGES=stages;go(0)}

window.W7={info,mcq,taps,sortRows,match,tapTable,table3,runSteps,cont,start,esc,shuf,log,el,S};
})();
