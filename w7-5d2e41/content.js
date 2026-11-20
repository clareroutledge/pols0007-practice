/* POLS0007 Week 7 content: the AI tutor consultancy. Uses window.W7 from engine.js */
(function(){
const {info,mcq,taps,sortRows,match,tapTable,runSteps,cont,start,esc,shuf,log,el}=window.W7;
const DES={};          // the pair's design choices
let twistsDone=0;

/* ---------- helpers ---------- */
const chk=(id,concept,stem,opts)=>mcq({id,concept,tag:'Check question',stem,opts});
const O=(t,ok,why,mis)=>({t,ok:!!ok,why,mis});
const KW='Kestin et al. (adapted)',LW='Liu et al. (adapted)';

/* the kinds of problem, used in three places */
const kindOpts=(ans,whys)=>['Bias: the groups are no longer comparable','Dilution: the effect is spread over people who never got the treatment','Imprecision: too few units, so chance matters a lot','Not a problem: the groups were randomised'].map((t,i)=>O(t,i===ans,whys[i]));
const dirOpts=(ans,whys)=>['Too big','Too small','Can’t tell: chance can push either way'].map((t,i)=>O(t,i===ans,whys[i]));

/* ================= STAGE 0: BRIEF ================= */
const brief=()=>[info(`<span class="badge">The brief</span><h2>UCL’s Vice-Provost needs your advice</h2>
<p>UCL is deciding whether to put an <b>AI tutor</b> on every science course’s Moodle page. Two randomised experiments have asked whether AI tutors help university students learn, and they <b>disagree</b>.</p>
<p>You are an evidence-review consultancy. Over this session you will:</p>
<ol><li><b>Diagnose</b> the problems in each study (Q1)</li><li><b>Explain</b> why they reach different answers (Q2)</li><li><b>Design</b> the trial UCL should run first (Q3)</li></ol>
<div class="tip"><b>How this works.</b> One device per pair. <b>Talk before you tap.</b> You get feedback on every step and you can try again. Nothing here counts for marks.</div>
<p class="fine">This page records anonymous usage (a random code, not your name) to help improve teaching.</p>`,'Start →')];

/* ================= STAGE 1: WARM-UP ================= */
const TERMS=['Sampling frame','SATE','PATE','Differential attrition','Non-compliance','Intention-to-treat (ITT)','Per-protocol analysis','Take-up','Impact variation'];
const GL=[
 {term:'Sampling frame',def:'A list of the units who could be in the experiment, e.g. a list of all pupils in state primary schools.',why:'A sampling frame turns “the population” into an actual list.',wrong:{'PATE':'PATE is an effect, not a list.'}},
 {term:'SATE',def:'The average treatment effect among the people who are in the study.',why:'Sample average treatment effect: experiments estimate this one.',wrong:{'PATE':'PATE is the effect in the whole population of interest, not just the study.'}},
 {term:'PATE',def:'The average treatment effect in the whole population of interest. This is usually what policy-makers want.',why:'Population average treatment effect. It equals the SATE in expectation only with a random sample.',wrong:{'SATE':'SATE is only for the people in the study.'}},
 {term:'Differential attrition',def:'Drop-out from the study that differs between treatment and control, so groups balanced at the start may not be balanced at the end.',why:'Like self-selection bias, but it happens after randomisation.',wrong:{'Non-compliance':'Non-compliance means people did something different from what they were assigned, but we still have their outcomes.','Take-up':'Take-up is the share of people who accept an offer.'}},
 {term:'Non-compliance',def:'When what someone actually did differs from what they were assigned. We still have outcome data for them.',why:'Unlike attrition, we still observe their outcomes.',wrong:{'Differential attrition':'Attrition means we lose the outcome data; here we still have it.','Take-up':'Close: low take-up of the treatment is a kind of non-compliance, but this term is the general idea.'}},
 {term:'Intention-to-treat (ITT)',def:'Compare everyone assigned to treatment with everyone assigned to control, whatever they actually did. “Analyse as you randomise”.',why:'It estimates the effect of being offered the treatment.',wrong:{'Per-protocol analysis':'Per-protocol keeps only people who did what they were assigned.'}},
 {term:'Per-protocol analysis',def:'Compare only the people who did what they were assigned with the control group. Generally not a good idea.',why:'It brings self-selection bias back in.',wrong:{'Intention-to-treat (ITT)':'ITT keeps everyone in the group they were assigned to.'}},
 {term:'Take-up',def:'The share of people who accept what they are offered (an invitation to join, or the treatment itself).',why:'Low take-up shrinks the effect you can see, or makes the sample less like the population.',wrong:{'Non-compliance':'Not quite: take-up is the share who accept; non-compliance is the wider idea of doing something other than assigned.'}},
 {term:'Impact variation',def:'When the treatment effect differs across participants (heterogeneous effects).',why:'Impact variation plus a sample that differs from the population is what makes external validity a problem.',wrong:{'SATE':'SATE is an average; impact variation is about effects differing from person to person.'}}
];
const warm=()=>[
 match({id:'w7.gl',instr:'Pick the glossary term that fits each definition. You get feedback straight away.',terms:TERMS,items:shuf(GL)}),
 chk('w7.p1','w7-sampling-vs-assignment','A poll randomly selects 2,000 UK adults and compares people who use AI tools with people who don’t. Which statement is true?',[
  O('Random selection means the comparison shows the causal effect of using AI',0,'Random selection helps with who is in the sample. People chose whether to use AI, so users and non-users may differ (self-selection).','SELFSEL'),
  O('Random sampling supports external validity, but with no random assignment there is self-selection bias',1,'Right: this is the “representative survey” cell. Who is sampled and who is treated are two separate questions.'),
  O('Both internal and external validity are strong',0,'Only the external side is helped by the random sample. Nobody was randomly assigned.','SAMPASSIGN'),
  O('Neither is affected by how people were chosen',0,'How people are chosen into the sample and into treatment is exactly what drives both kinds of validity.','SAMPASSIGN')]),
 chk('w7.p2','w7-sate-pate','When would the SATE equal the PATE in expectation?',[
  O('Whenever treatment is randomly assigned',0,'Random assignment protects internal validity (who is treated). SATE = PATE depends on who is in the study.','SAMPASSIGN'),
  O('When the participants are a random sample of the population, with full take-up',1,'Right: a random sample represents the population in expectation, so the SATE equals the PATE.'),
  O('When there is no attrition',0,'Attrition threatens internal validity. It does not make the sample representative.','ATTR'),
  O('When the sample is large',0,'A large volunteer sample can still differ from the population. Size isn’t representativeness.','SIZE')])
];

/* ================= STAGE 2: Q1 EVIDENCE ================= */
const K1={who:KW,html:'Of the <b>233</b> students enrolled in the course, <b>194</b> were eligible for the study (they consented and completed all the pre-tests and post-tests).',target:true,why:'The expected number: 194 eligible students.'};
const K2={who:KW,html:'Post-test scores. <b>AI lesson:</b> N = <b>142</b> (median 4.5). <b>In-class active learning:</b> N = <b>174</b> (median 3.5).',target:true,why:'The numbers actually reported in each arm.'};
const K3={who:KW,html:'Every student did <i>both</i> lessons: one with the AI tutor, <b>at home at their own pace</b>, and one in a 75-minute class (a crossover design).',why:'This helps explain <i>why</i> the arms might lose students differently, but the check itself needs the numbers.'};
const K6={who:KW,html:'The AI tutor was built on GPT-4 by the course’s own instructors, and tested over several months.',why:'Relevant to external validity, but not to who went missing.'};
const L1={who:LW,html:'Randomisation was at the <b>instructor</b> level, within blocks of similar courses: if an instructor was assigned to the tutor, all their students could use it.',target:true,why:'The unit of randomisation is the instructor, not the student.'};
const L2={who:LW,html:'<b>30 instructors</b> (34 sections) and 2,379 undergraduates took part.',target:true,why:'Only about 30 randomised units, however many students there are.'};
const L3={who:LW,html:'<b>Three instructors</b> assigned to the tutor who never switched it on were <b>removed</b> from the sample.',target:true,why:'A quiet exclusion, made after randomisation.'};
const L4={who:LW,html:'Students in <b>both</b> groups had free access to ChatGPT and Gemini.',why:'This is the control condition: important for Q2 and Q3, but not what is being asked here.'};
const L5={who:LW,html:'Only about <b>15%</b> of students in tutor sections used the tutor at least once; about 40% of those used it in a single session.',target:true,why:'Take-up: about 15%.'};
const L6={who:LW,html:'Of 3,460 questions students asked the tutor, <b>73.8%</b> asked for information, explanations or solutions; 0.7% asked for feedback on their own work.',why:'That is about what the tutor was used for, not how many used it.'};
const L8={who:LW,html:'Instructors who introduced and encouraged the tutor may have changed students’ use of <b>other AI tools</b> too.',why:'Interesting (it could affect non-users), but not the take-up figure.'};
const L9={who:LW,html:'Final grades were set by <b>each section’s instructor</b>.',why:'That is an outcome problem. We come back to it in Q3.'};
const nt=(o,why)=>Object.assign({},o,{target:false,why:why||o.why});

const q1=()=>[
 info(`<span class="badge">Q1</span><h2>Diagnose the problems</h2><p>For each problem you will (1) <b>find the evidence</b> in the excerpts, (2) say <b>what kind</b> of problem it is, and (3) say <b>which way</b> it pushes the estimate.</p><p>Watch for the three look-alikes: <b>bias</b>, <b>dilution</b> and <b>imprecision</b>.</p>`),
 /* ---- Kestin attrition ---- */
 taps({id:'w7.q1a',concept:'w7-attrition',instr:'<b>Kestin et al.</b> Tap the two excerpts you would need to check whether students went missing differently in the two arms.',items:[K3,K1,K6,K2]}),
 mcq({id:'w7.q1a.exp',concept:'w7-attrition',stem:'Every eligible student did both lessons. How many post-tests should <b>each arm</b> have?',opts:[
  O('194',1,'194 eligible students, each doing the AI lesson once and the class lesson once.'),
  O('233',0,'233 enrolled, but only 194 were eligible for the study.','CALC'),
  O('97',0,'Halving is for a design where each student gets one condition. Here every student does both.','CALC'),
  O('316',0,'142 + 174 = 316 is the total actually reported, not the number expected.','CALC')]}),
 mcq({id:'w7.q1a.miss',concept:'w7-attrition',stem:'So how many post-tests are <b>missing</b> from each arm?',opts:[
  O('AI: 52 missing (27%). Class: 20 missing (10%)',1,'194 − 142 = 52 and 194 − 174 = 20. The AI lesson lost far more students.'),
  O('AI: 20 missing. Class: 52 missing',0,'Other way round: the AI arm has 142, so 194 − 142 = 52 are missing there.','DIR'),
  O('52 missing from each arm',0,'The two arms are missing different numbers: 52 and 20.','CALC'),
  O('None: 142 and 174 are just different group sizes',0,'Both arms should have 194, so the gap is missing data, not different group sizes.','DEF')]}),
 mcq({id:'w7.q1a.kind',concept:'w7-attrition',stem:'What <b>kind</b> of problem is this? (Missing students differ between the arms.)',opts:kindOpts(0,[
  'Yes: differential attrition. It is analogous to self-selection bias.',
  'Dilution is about people who didn’t receive the treatment. Here the issue is who is missing.',
  'Imprecision is about having few units. The problem here is that the remaining groups may not be comparable.',
  'Randomisation balances groups at the start, not at the end. Differential attrition breaks the balance.'])}),
 mcq({id:'w7.q1a.dir',concept:'w7-attrition',stem:'The AI lesson was done at home and lost more students. If the missing ones are mostly the <b>less motivated</b>, the estimated AI effect is probably…',opts:dirOpts(0,[
  'Too big: the AI arm that remains is positively selected, as in the surgical-checklist example.',
  'That would happen if the missing students were the most motivated. Which students skip an at-home lesson?',
  'We can’t be certain, but the setup gives a reason: at-home lessons tend to lose the less motivated. Use it.'])}),
 /* ---- Liu take-up ---- */
 taps({id:'w7.q1b',concept:'w7-take-up',instr:'<b>Liu et al.</b> Tap the excerpt that says how many students in tutor sections actually used the tutor.',items:[nt(L4),nt(L2,'That is the number of randomised units, which matters later.'),L5,nt(L1,'That is the unit of randomisation.')]}),
 mcq({id:'w7.q1b.kind',concept:'w7-take-up',stem:'Only about 15% used the tutor. What <b>kind</b> of problem is this?',opts:kindOpts(1,[
  'Take-up doesn’t unbalance the groups. Everyone was still assigned at random.',
  'Yes: dilution. The measured effect is spread over the 85% who never used it.',
  'Imprecision is about the number of randomised units, not about use.',
  'It is a limit on what we can learn. The offered and not-offered groups are still balanced, but the effect is diluted.'])}),
 mcq({id:'w7.q1b.bias',concept:'w7-take-up',stem:'Does low take-up <b>bias</b> the comparison of everyone offered the tutor with everyone not offered it?',opts:[
  O('No. Randomisation still balanced the groups, so low take-up only dilutes what the comparison measures',1,'Right: this is ITT. It estimates the effect of being offered the tutor, and it is not biased by low take-up.'),
  O('Yes. The groups are no longer balanced because most treated students ignored it',0,'Assignment was random, not use. The offered and not-offered groups are still balanced.','ITT'),
  O('Yes. It creates self-selection among treated students',0,'Self-selection appears only if you compare users with non-users. That is the per-protocol comparison.','PP'),
  O('Only if take-up is below 10%',0,'There is no cut-off: assignment is what keeps the groups comparable.','ITT')]}),
 mcq({id:'w7.q1b.dir',concept:'w7-take-up',stem:'As a measure of the effect of <b>actually using</b> the tutor, the Liu estimate is…',opts:dirOpts(1,[
  'Not too big. Dilution moves an effect toward zero.',
  'Too small: it is diluted by the 85% of treated students who never used it.',
  'Take-up doesn’t make the direction unknown. It shrinks the estimate toward zero.'])}),
 /* ---- Liu few units ---- */
 taps({id:'w7.q1c',concept:'w7-imprecision',instr:'<b>Liu et al.</b> Tap the two excerpts that tell you how many units were randomised, and at what level.',items:[L1,nt(L5,'That is take-up, which we have already dealt with.'),L2,nt(L9)]}),
 mcq({id:'w7.q1c.kind',concept:'w7-imprecision',stem:'With only about 30 randomised instructors, what <b>kind</b> of problem is this?',opts:kindOpts(2,[
  'Randomisation balances instructors in expectation. The worry here is chance, not a broken design.',
  'Dilution comes from low take-up, which is a different problem.',
  'Yes: imprecision. Randomisation balances 30 instructors only in expectation, so strict vs lenient graders can be unevenly split by chance.',
  'Randomisation doesn’t guarantee balance. With few units chance imbalances can be large.'])}),
 mcq({id:'w7.q1c.dir',concept:'w7-imprecision',stem:'Which way does chance imbalance between instructors push the estimate?',opts:dirOpts(2,[
  'Nothing says it must push up.',
  'Nothing says it must push down.',
  'Right: chance can go either way. This limits how much we should trust the number, not which direction it errs in.'])}),
 /* ---- Table 3 ---- */
 tapTable({id:'w7.q1d.est',concept:'w7-table3',anyOne:true,instr:'<b>Liu et al., Table 3.</b> Tap the estimate of the tutor’s effect on <b>final grades</b> (start with the “without controls” row).',targets:{g_est:{why:'−2.68 grade points, with one star.'},g_est2:{tier:'partial',why:'That is the “with controls” version, which is fine and very close. The top row is the simpler comparison.'}},bad:'That’s another outcome or statistic. Look for the “Final grades” column and the “Treated” row.'}),
 tapTable({id:'w7.q1d.se',concept:'w7-table3',anyOne:true,instr:'Now tap that estimate’s <b>standard error</b> (in brackets underneath).',targets:{g_se:{why:'1.54. The bracketed number is how uncertain the estimate is.'},g_se2:{tier:'partial',why:'That’s the standard error for the “with controls” version, which works too.'}},bad:'The standard error is the bracketed number under the final-grades estimate.'}),
 mcq({id:'w7.q1d.strong',concept:'w7-table3',stem:'−2.68 with a standard error of 1.54 is about 1.7 standard errors from zero, and it has one star (p &lt; 0.10). How strong is the evidence that offering the tutor changed final grades?',opts:[
  O('Weak: only marginally significant, and the letter-grade and homework effects show nothing',1,'Right. Compare it with the page-view effects, which have three stars (p &lt; 0.01).'),
  O('Strong: it is clearly significant',0,'One star means only p &lt; 0.10. The activity outcomes have three stars; the grade result is much weaker.','OVERSTATE'),
  O('None at all: p is above 0.10',0,'It just clears the 10% bar. It does not clear the usual 5% bar.','DEF'),
  O('Impossible to say without knowing take-up',0,'We can read the strength of evidence from the estimate and its standard error.','DEF')]}),
 mcq({id:'w7.q1d.size',concept:'w7-table3',stem:'The control group’s SD for final grades is 10.10. About how big is the −2.68 effect in <b>SD units</b>?',opts:[
  O('About −0.27 SD',1,'−2.68 ÷ 10.10 ≈ −0.27. Kestin’s effect was +0.63 SD, so this is a different scale of result.'),
  O('About −2.7 SD',0,'That treats grade points as SDs. Divide by the SD, 10.10.','CALC'),
  O('About +0.27 SD',0,'Right size, wrong sign: the effect is negative.','DIR'),
  O('About −0.03 SD',0,'You divided by 100 (the grade scale) instead of by the control SD.','CALC')]}),
 /* ---- bonus ---- */
 taps({id:'w7.q1e',concept:'w7-attrition',instr:'<b>Bonus.</b> One excerpt quietly changes who is in the sample <i>after</i> randomisation. Tap it.',items:[L4,L3,nt(L1),nt(L8)]}),
 info(`<span class="badge">Bonus note</span><p>Dropping treated instructors who never switched the tutor on, <b>after</b> randomising, removes a group from the treated arm only. The control arm had nothing to switch on, so no equivalent group left it. That makes the groups less comparable, just like differential attrition, and it breaks the “analyse as you randomise” principle.</p><p class="fine">This detail isn’t in the seminar solutions, so treat it as a discussion point.</p>`),
 chk('w7.p3','w7-attrition','In a tutoring-app trial, control students get nothing and the <b>least engaged</b> control students lose interest and leave. Few treated students leave. Estimating the effect for those who stay will likely:',[
  O('Overstate the effect of the app',0,'That happens when the treated group loses its least engaged students. Here it is the control group that does.','DIR'),
  O('Understate the effect of the app',1,'Right: the control group that remains is more engaged than it should be, so it looks better and the effect looks smaller.'),
  O('Be fine, because treatment was randomly assigned',0,'Randomisation balances groups at the start, not at the end.','ATTR'),
  O('Be fine, because people always drop out of studies',0,'It is not drop-out itself that matters, but whether it differs between the arms.','ATTR')]),
 chk('w7.p4','w7-itt','Liu et al. compare <b>all</b> students in tutor sections with <b>all</b> students in non-tutor sections, though only about 15% used the tutor. This estimates:',[
  O('The effect of using the tutor, for users',0,'That would need only users. This compares everyone in each arm.','PP'),
  O('The effect of being offered access to the tutor',1,'Right: intention-to-treat. Everyone counts in the group they were assigned to.'),
  O('The size of the self-selection bias',0,'There is no comparison of self-selected users here.','SELFSEL'),
  O('The PATE for all UK students',0,'It is an effect for the people in this study (a SATE), and a sample from one university at that.','SAMPASSIGN')])
];

/* ================= STAGE 3: Q2 WHY DIFFERENT ================= */
const mk=(html,ans,good,bad)=>({html,ans,why:[0,1,2,3].map(j=>j===ans?good:bad)});
const q2=()=>[
 info(`<span class="badge">Q2</span><h2>Why do the studies disagree?</h2><p>Kestin finds a large gain (+0.63 SD). Liu finds that access to a tutor lowered participation, and (weakly) final grades. Four things could explain the gap: <b>treatment vs control</b>, <b>take-up</b>, <b>the tutor itself</b> and <b>the outcome</b>.</p>`),
 sortRows({id:'w7.q2a',concept:'w7-comparison',badge:'Sort it',instr:'Which of the four factors is each sentence about?',cats:['Treatment vs control','Take-up','The tutor itself','The outcome'],items:[
  mk(`<b>Kestin:</b> the control group worked through the same worksheet in a 75-minute active-learning class.`,0,'It describes what the comparison group got: here a class, which the tutor replaced.','Ask what the comparison group received.'),
  mk(`<b>Liu:</b> students in both groups had free access to ChatGPT and Gemini.`,0,'That’s the control condition: Liu compares “tutor + ChatGPT” with “ChatGPT alone”.','Ask what the control group had.'),
  mk(`<b>Kestin:</b> students got participation credit for completing either lesson and its tests.`,1,'Credit pushes use (completion) up.','Is this about who used the tutor, how it works, or what was measured?'),
  mk(`<b>Liu:</b> only about 15% of students in tutor sections used it at least once.`,1,'This is the take-up figure.','Is this about who used the tutor, how it works, or what was measured?'),
  mk(`<b>Kestin:</b> the tutor was told not to give away full solutions, and took students through each problem in order.`,2,'That is the design of the tutor itself.','Is it about what the tutor does, or what happened around it?'),
  mk(`<b>Liu:</b> 73.8% of the 3,460 questions asked for information, explanations or solutions.`,2,'It shows how the tutor was used and designed: mostly answer-giving.','Is it about what the tutor does, or what happened around it?'),
  mk(`<b>Kestin:</b> a short test on the lesson topic, taken straight after the lesson.`,3,'That is the outcome and when it was measured.','Which thing was measured, and when?'),
  mk(`<b>Liu:</b> final grades set by each instructor at the end of a 16-week semester.`,3,'That is the outcome and its timing.','Which thing was measured, and when?')]}),
 sortRows({id:'w7.q2b',concept:'w7-comparison',badge:'What can it explain?',instr:'Could this factor explain the result <b>on its own</b>? Be careful with the second column of each pair.',cats:['Yes, plausibly','Not on its own'],items:[
  {html:'<b>Treatment vs control</b> → why Liu’s effect is <b>smaller</b> than Kestin’s',ans:0,why:['Yes: Liu adds a tutor to business as usual (with ChatGPT), while Kestin replaces a class. Different comparisons give different effects.','Think again: the two studies compare different things.']},
  {html:'<b>Treatment vs control</b> → why Liu’s effect is <b>negative</b>',ans:0,why:['Yes: an added tool can crowd out other study, which fits the fall in participation on the course page.','It can: an extra tool can crowd out other studying.']},
  {html:'<b>Take-up</b> → why Liu’s effect is <b>smaller</b>',ans:0,why:['Yes: with only about 15% using it, the average over everyone offered is pulled toward zero.','It can: dilution shrinks an average effect toward zero.']},
  {html:'<b>Take-up</b> → why Liu’s effect is <b>negative</b>',ans:1,why:['Dilution only shrinks an effect toward zero; it can’t flip its sign.','Right: if 15% gain and the rest are unaffected, the average is a small gain, never a loss.']},
  {html:'<b>The tutor itself</b> (gives direct answers) → why Liu’s effect is <b>smaller</b>',ans:0,why:['Yes: a tool that hands out answers lets students skip the thinking that produces learning.','It can: answer-giving tutors tend to teach less than step-by-step ones.']},
  {html:'<b>The outcome</b> (short test vs end-of-term grades) → why Liu’s effect is <b>smaller</b>',ans:0,why:['Yes: a short test straight after a lesson can show gains that don’t last until the exam.','It can: short-run gains may fade by the end of term.']},
  {html:'<b>The outcome</b> (short test vs end-of-term grades) → why Liu’s effect is <b>negative</b>',ans:1,why:['A different timing can explain a gain that fades, not a fall.','Right: it explains a gain that fades to nothing, not by itself a fall below zero.']}]}),
 /* ---- dilution calculator ---- */
 (box,next)=>{box.innerHTML=`<span class="badge">Try it</span><div class="stem">Offering the tutor can only change the <b>average</b> through the students who use it (assume non-users are unaffected). Move the sliders to reproduce Liu’s final-grade result of <b>−2.68</b> points.</div>
 <div class="sl"><span>Take-up (share who use it)</span><input type="range" id="tk" min="5" max="100" step="1" value="15"><span id="tkv">15%</span></div>
 <div class="sl"><span>Effect among users (points)</span><input type="range" id="ef" min="-30" max="30" step="1" value="0"><span id="efv">0</span></div>
 <div class="big" id="ov"></div>
 <div class="trk"><div class="zero"></div><i id="bar"></i><b id="tg"></b></div><p class="fine">Scale: −5 to +5 grade points. The red line is Liu’s −2.68.</p><div class="fb"></div><p><button class="btn alt sm" id="show">Show me what it takes</button></p>`;
  const tk=box.querySelector('#tk'),ef=box.querySelector('#ef'),ov=box.querySelector('#ov'),bar=box.querySelector('#bar'),tg=box.querySelector('#tg'),fb=box.querySelector('.fb');let fin=false;
  const pos=v=>50+Math.max(-5,Math.min(5,v))*10;tg.style.left=pos(-2.68)+'%';
  const fin1=()=>{if(!fin){fin=true;cont(box,next)}};
  const upd=()=>{const t=+tk.value/100,e=+ef.value,o=t*e;box.querySelector('#tkv').textContent=tk.value+'%';box.querySelector('#efv').textContent=e;ov.textContent='Average effect across everyone offered: '+(Math.round(o*100)/100);
   const a=pos(0),b=pos(o);bar.style.left=Math.min(a,b)+'%';bar.style.width=Math.abs(b-a)+'%';
   if(Math.abs(o+2.68)<0.2){fb.innerHTML=fbHtml('good','✓ A match: at '+tk.value+'% take-up, users would need an effect of about <b>'+e+' points</b> ('+(Math.round(e/10.10*100)/100)+' SD). Compare that with Kestin’s +0.63 SD.');log({question_id:'w7.q2c',concept:'w7-dilution',correct:true});fin1()}else fb.innerHTML=''};
  const fbHtml=(c,h)=>`<div class="why ${c}">${h}</div>`;
  tk.oninput=upd;ef.oninput=upd;upd();
  box.querySelector('#show').onclick=()=>{const t=+tk.value/100,need=-2.68/t;fb.innerHTML=fbHtml('part','~ At '+tk.value+'% take-up users would need an average effect of <b>'+(Math.round(need*10)/10)+' points</b> ('+(Math.round(need/10.10*100)/100)+' SD) to produce −2.68 across everyone.');fin1()}},
 mcq({id:'w7.q2c.concl',concept:'w7-dilution',stem:'What is the best conclusion from the calculator?',opts:[
  O('Low take-up alone explains Liu’s negative result',0,'To get −2.68 at 15% take-up, users would need to lose about 18 points (about 1.8 SD), if non-users were unaffected. That is implausibly large.','OVERSTATE'),
  O('Take-up shrinks the effect, but would need an implausibly large effect among users to give −2.7, so other things must matter too',1,'Right: crowding out, instructors changing behaviour (which can affect non-users), and chance (the result is only marginally significant) are all candidates.'),
  O('The estimate must be wrong',0,'Nothing says that. The estimate is honest: it just can’t be explained by dilution alone.','DEF'),
  O('Users must have been negatively selected',0,'Users self-selecting doesn’t matter for ITT. The comparison is between everyone offered and everyone not offered.','ITT')]}),
 /* ---- engagement outcomes ---- */
 tapTable({id:'w7.q2d',concept:'w7-outcome',instr:'<b>Liu, Table 3.</b> Tap the outcomes that are measured on the <b>same website</b> where the tutor sits (all three).',targets:{h4:{why:'Page views on the course page.'},h5:{why:'Active days on the course page.'},h6:{why:'Total participation (submissions, posts, quizzes) on the course page.'}},bad:'That outcome comes from the instructor or the grade book, not from activity on the course page.'}),
 mcq({id:'w7.q2d.concl',concept:'w7-outcome',stem:'What should UCL conclude from the fall in participation on the course page?',opts:[
  O('Students learned less',0,'Activity on a page isn’t learning. The result tells you about use of the page.','DEF'),
  O('Students used the course page less, which is not the same as learning. And because the tutor sits on that page, it needs careful interpretation',1,'Right: a useful secondary outcome, but it partly measures use of the tool and where studying happens.'),
  O('It is just noise',0,'The three-star results are far from noise: students really did use the page less.','OVERSTATE'),
  O('It shows take-up was high',0,'Take-up was about 15%. Lower use of the page isn’t evidence of high take-up.','DEF')]}),
 chk('w7.p5','w7-itt','In a trial, 20% of students offered a tutor use it, and users gain 10 points. Assume non-users and controls are unaffected. The intention-to-treat effect is:',[
  O('2 points',1,'0.20 × 10 = 2: only a fifth of the offered group gets the gain, so the average is diluted.'),
  O('10 points',0,'That’s the effect among users, not the average over everyone offered.','ITT'),
  O('8 points',0,'That is 10 × 0.8: the share who did not use it.','CALC'),
  O('12 points',0,'Adding the numbers makes no sense here: take-up shrinks the effect.','CALC')])
];

/* ================= STAGE 4: Q3 DESIGN ================= */
const THREAT={
 contam:{t:'Contamination: control students benefit from treated classmates'},units:{t:'Too few randomised units (less precise, chance imbalance)'},selfsel:{t:'Self-selection into treatment'},ext:{t:'Unrepresentative sample (SATE ≠ PATE)'},
 cf:{t:'The control isn’t UCL’s real alternative'},noncomp:{t:'Non-compliance'},
 outcome:{t:'Outcomes aren’t comparable across courses (different exams and markers)'},short:{t:'Only short-run learning is measured'},ev:{t:'Outcome measured where the treatment sits'},attr:{t:'Differential attrition'}};
const CRIT=['Names a specific threat (e.g. contamination, non-compliance)','Says which way it pushes the estimate (too big, too small, towards zero)','Is about this UCL study (courses, Moodle, ChatGPT, exams), not just general'];
const DIRX=/too (big|small|large)|overstat|understat|toward|towards zero|upward|downward|inflat|bias(ed)? (up|down)|exaggerat|shrink|dilut|push/i,LINKX=/course|moodle|chatgpt|exam|ucl|lectur|student/i;

const element=c=>{
 const choose=mcq({id:'w7.q3.'+c.key,concept:'w7-design-'+c.key,tag:'Q3 · Choice '+c.n+' of 3',ctx:c.intro,stem:c.stem,opts:c.opts,hints:c.hints,onPick:x=>{DES[c.key]=x;x.key=c.key}});
 const threat=(box,next)=>{const x=DES[c.key];
  mcq({id:'w7.q3.'+c.key+'.threat',concept:'w7-design-'+c.key,tag:'Name the threat',stem:'Which threat is your choice mainly designed to <b>guard against</b>?',shuffle:false,
   opts:c.threats.map(id=>{const ok=x.guards.includes(id);return O(THREAT[id].t,ok,ok?x.guardWhy:((x.threatWhy&&x.threatWhy[id])||'Not the main reason for this choice.'))}),
   onPick:t=>{x.threat=t.t}})(box,next)};
 const frame=(box,next)=>{const x=DES[c.key];
  box.innerHTML=`<span class="badge">Write it</span><div class="stem">${c.frame}</div><textarea>${esc(c.starter)}</textarea><p><button class="btn" id="ck">Check my sentence</button></p><div class="fb"></div>`;
  const ta=box.querySelector('textarea'),fb=box.querySelector('.fb');let fin=false;
  box.querySelector('#ck').onclick=()=>{const v=ta.value;x.text=v;const auto=[c.kw.test(v),DIRX.test(v),v.length>35&&LINKX.test(v)];
   fb.innerHTML=`<div class="ex"><b>A strong version:</b> ${x.exemplar}</div><p class="fine">Tick what <b>your</b> sentence does. We pre-ticked what we spotted; untick if we’re wrong.</p>${CRIT.map((t,i)=>`<label class="ck"><input type="checkbox" ${auto[i]?'checked':''} data-i="${i}"> ${t}</label>`).join('')}<div class="msg"></div>`;
   const upd=()=>{const n=fb.querySelectorAll('input:checked').length;const miss=[...fb.querySelectorAll('input')].filter(i=>!i.checked).map(i=>CRIT[+i.dataset.i].split(' (')[0].toLowerCase());
    fb.querySelector('.msg').innerHTML=n===3?fbHtml('good','✓ Strong: threat, direction and context are all there. This is the shape of an exam answer.'):fbHtml('part','~ '+n+' of 3. To make it exam-ready, add: '+miss.join('; ')+'. Edit your sentence and press check again.');
    log({question_id:'w7.q3.'+c.key+'.write',concept:'w7-design-'+c.key,correct:n===3})};
   fb.querySelectorAll('input').forEach(i=>i.onchange=upd);upd();if(!fin){fin=true;cont(box,next)}}};
 return[choose,threat,frame]};
const fbHtml=(cls,html)=>`<div class="why ${cls}">${html}</div>`;

const UNIT=element({n:1,key:'unit',intro:`<h2>Design the trial UCL should run first</h2><p>UCL would build the tutor into Moodle, like Liu’s. For each of three choices you will <b>choose</b>, <b>name the threat</b> it guards against, and <b>write one sentence</b> in the exam style. You can ask for hints and try again.</p>`,
 stem:'<b>Unit of randomisation.</b> What gets randomly assigned to have the tutor or not?',hints:['Think about who talks to whom: do students in the same course share notes and answers?','If control students can get help from treated classmates, which way does the estimate move?'],
 opts:[
  {t:'Whole courses (modules), grouped by department and year before randomising',ok:1,why:'Yes: the tutor sits on a course’s Moodle page and classmates talk, so courses keep the two arms apart. The price is fewer units, so aim for many courses.',guards:['contam'],guardWhy:'Yes: students in one course share notes and answers, so randomising whole courses keeps the arms apart. The price is fewer units (Liu had only 30 instructors).',threatWhy:{units:'That is the <i>price</i> of this choice (fewer units), not what it guards against.'},exemplar:'Because students in the same course share notes and answers, randomising individuals would let control students benefit from the tutor (contamination), pushing the estimate towards zero. So I randomise whole courses, grouped by department and year, and aim for many courses to keep chance differences small.'},
  {t:'Individual students, randomly chosen within each course',tier:'partial',why:'Defensible: it gives far more units. But classmates will share, so you would need to explain how you limit contamination.',guards:['units'],guardWhy:'Yes: thousands of students means small chance differences. But it leaves contamination open: control students can get help from treated classmates, which pushes the estimate toward zero.',threatWhy:{contam:'That is the risk this choice <i>runs</i>, not what it guards against.'},exemplar:'Because randomising individual students gives thousands of units, chance differences between the arms are small. But students in the same course talk (contamination), which would push the estimate towards zero, so I would need to explain how I limit it.'},
  {t:'Let departments choose whether to switch the tutor on, then compare',why:'Choosing is self-selection. Keen departments may differ in lots of ways, so it isn’t a randomised trial any more.'},
  {t:'Whole departments (e.g. all of Physics vs all of Chemistry)',why:'Only a handful of units, and departments differ in many ways that have nothing to do with the tutor.'}],
 threats:['contam','units','selfsel','ext'],frame:'Write <b>one sentence</b> in this shape: “Because ____ (the threat), which would make the estimate too ____, I ____.”',starter:'Because ____ , which would make the estimate too ____ , I ____ .',kw:/contamin|spillover|share|few|chance|precision|imprecis|self-select|unit/i});
const COND=element({n:2,key:'cond',stem:'<b>Treatment and control.</b> What do the treated and control courses get?',hints:['What will students in control courses actually do about AI tools?','Which two situations is UCL really choosing between?'],
 opts:[
  {t:'Treated: the tutor on for the whole term, set to guide students rather than hand over answers. Control: business as usual, including ChatGPT and other AI tools',ok:1,why:'Yes: UCL’s real choice is “tutor + ChatGPT” vs “ChatGPT alone”, and guided mode is what UCL would want to test.',guards:['cf'],guardWhy:'Yes: UCL’s real alternative is students using ChatGPT anyway, so the control must include it, as in Liu.',exemplar:'Because UCL’s real alternative is students using ChatGPT anyway, control courses keep business as usual including AI tools, while treated courses get the tutor in guided mode. A ban in the control arm would be unenforceable and would make the tutor look better than it is.'},
  {t:'Treated: the tutor on for the whole term in its default answer-giving mode. Control: business as usual, including ChatGPT',tier:'partial',why:'Fine as a test of the default product. But Liu’s tutor mostly handed out answers (73.8% of questions), so you would be testing that. If UCL would use guided mode, test that.',guards:['cf'],guardWhy:'Yes: the control keeps ChatGPT, the real alternative. (Your treatment is the default answer-giving mode, so a small or negative effect would be unsurprising.)',exemplar:'Because UCL’s real alternative is ChatGPT, control keeps it and treated courses get the default tutor. As the default mode mostly hands out answers, I might find a small or even negative effect.'},
  {t:'Treated: the tutor on. Control: courses are told to ban all AI tools',why:'That isn’t UCL’s real alternative (students will use ChatGPT anyway) and you can’t enforce a ban: non-compliance in the control arm.'},
  {t:'Treated: the tutor replaces a weekly class, as in Kestin. Control: the normal class',why:'That tests a different policy (swap a class for a tutor). UCL is considering adding a tutor to Moodle.'}],
 threats:['cf','noncomp','selfsel','ext'],frame:'Write <b>one sentence</b> on why this is the right comparison. Use: “Because ____ , which would make the estimate too ____ .”',starter:'Because ____ , which would make the estimate too ____ .',kw:/real alternative|chatgpt|non-?complian|enforce|counterfactual|compar|ban/i,n:2});
const OUTC=element({n:3,key:'out',stem:'<b>Outcome and timing.</b> How will you measure whether students learned?',hints:['How do you compare courses fairly when each lecturer sets and marks their own exam?','Kestin measured learning straight after a lesson. Is that enough for UCL?'],
 opts:[
  {t:'A common exam taken without AI, marked blind to which courses had the tutor, at the end of the course and again next term',ok:1,why:'Yes: a common blind-marked exam removes lecturer differences, and the follow-up checks that learning lasts.',guards:['outcome','short'],guardWhy:'Yes: a common blind-marked exam removes lecturer differences, and the next-term follow-up checks learning lasts (Kestin only measured straight after).',threatWhy:{ev:'Moodle activity is the outcome measured where the treatment sits. A common exam isn’t.'},exemplar:'Because each lecturer sets and marks their own exam, differences could come from lecturers rather than the tutor (the Liu problem), so I use one common AI-free exam marked blind, at the end of term and again next term to see whether learning lasts.'},
  {t:'A common exam taken without AI, marked blind, at the end of the course only',tier:'partial',why:'Good: common and blind-marked. Adding a follow-up next term would show whether learning lasts.',guards:['outcome'],guardWhy:'Yes: one common blind-marked exam removes lecturer differences. It leaves open whether learning lasts beyond the end of term.',threatWhy:{short:'That is the threat this option <i>leaves open</i>: end of course only.'},exemplar:'Because lecturers’ own exams differ in difficulty and marking, I use one common AI-free exam marked blind. A follow-up next term would also show whether learning lasts, which an end-of-term exam can’t.'},
  {t:'Final grades set by each course’s lecturer',why:'Each lecturer sets and marks their own exam, so a “treatment effect” could just be strict vs lenient lecturers (the problem in Liu).'},
  {t:'Moodle activity: page views, active days, participation',why:'The tutor sits on Moodle, so activity partly measures use of the tool itself, and activity isn’t learning. Fine as a secondary outcome, not the main one.'}],
 threats:['outcome','short','ev','attr'],frame:'Write <b>one sentence</b> on why this outcome measure is right. No starter this time: you are writing it yourself.',starter:'',kw:/comparab|lecturer|short|lasting|follow|where the (treatment|tutor)|blind|common|differ/i,n:3});

/* ---- complications ---- */
const TWISTS=[
 {id:'t1',txt:'<b>30% of the courses assigned to the tutor never switch it on.</b>',stem:'What should you do?',opts:[
   O('Keep them in the analysis as assigned (ITT) and report take-up',1,'Right: analyse as you randomise. The estimate is the effect of being offered the tutor, with take-up reported.'),
   O('Drop them and compare the rest with control',0,'That is a per-protocol-style exclusion: the treated courses that remain may differ from control courses, so the groups are no longer comparable.','PP'),
   O('Swap them for other courses that will switch it on',0,'Choosing keen courses brings self-selection back in.','SELFSEL'),
   O('Move them into the control group',0,'Moving them by what they did breaks the randomisation.','PP')],term:'Non-compliance',termWhy:'Courses did something different from what they were assigned, but you still have their outcomes.'},
 {id:'t2',txt:'<b>Half of the students skip the follow-up exam, and most of the skippers were in tutor courses.</b>',stem:'What should you do?',opts:[
   O('Compare attrition by arm, and try to get exam data for everyone (e.g. a compulsory exam or administrative records)',1,'Right: you must check whether missing data differs by arm, and reduce it, instead of analysing only who turned up.'),
   O('Analyse only the students who sat the exam. It was still randomised',0,'Randomisation balances groups at the start. Differential attrition breaks that balance.','ATTR'),
   O('Replace the missing students with new volunteers',0,'New volunteers aren’t comparable to the students you lost.','SELFSEL'),
   O('Ignore it, as the missing students are a small group',0,'Half is not small, and the missing are unevenly spread across arms.','ATTR')],term:'Differential attrition',termWhy:'We lose outcome data, and more in one arm than the other.'},
 {id:'t3',txt:'<b>Some control-course lecturers switch the tutor on for their students anyway.</b>',stem:'What should you do?',opts:[
   O('Keep them in control as assigned, and report how many control students used the tutor',1,'Right: analyse as you randomise. The estimate becomes the effect of being offered the tutor, with the take-up in each arm reported.'),
   O('Move them into the treatment group',0,'Moving courses by what they did breaks the randomisation.','PP'),
   O('Drop those courses',0,'Dropping them leaves a control group that differs from the treated arm.','PP'),
   O('Ignore it. Randomisation fixes it',0,'Randomisation balances who is assigned. It doesn’t stop people doing something different.','ITT')],term:'Non-compliance',termWhy:'Courses did something different from what they were assigned, but you still have their outcomes.'}];
const twistSteps=t=>[
 mcq({id:'w7.q3.'+t.id,concept:'w7-stress',tag:'Complication',ctx:`<div class="tip">${t.txt}</div>`,stem:t.stem,opts:t.opts,onPick:()=>{twistsDone++}}),
 mcq({id:'w7.q3.'+t.id+'.term',concept:'w7-stress',tag:'Name it',stem:'Which term is this?',opts:['Non-compliance','Differential attrition','Contamination (spillovers)','Impact variation'].map(x=>O(x,x===t.term,x===t.term?t.termWhy:'Not this one. '+(x==='Differential attrition'?'Attrition means losing outcome data.':x==='Non-compliance'?'Non-compliance means doing something other than assigned (we still have outcomes).':x==='Impact variation'?'Impact variation is about effects differing across people.':'Contamination is spillover between treated and control units.'))),shuffle:false})];
const stressStart=(box,next)=>{box.innerHTML=`<span class="badge">Stress test</span><h2>A complication arrives</h2><p>Real trials go wrong. For each complication choose the best response, then name it.</p>`;const first=TWISTS[Math.floor(Math.random()*TWISTS.length)];
 box.dataset.first=first.id;cont(box,()=>{const h=box.parentNode;const c=el('');h.append(c);runSteps(c,twistSteps(first),()=>{
  const rest=TWISTS.filter(t=>t.id!==first.id);const more=el(`<p><b>Want another complication?</b></p><p>${rest.map(t=>`<button class="btn alt sm" data-id="${t.id}">${t.txt.replace(/<\/?b>/g,'')}</button>`).join(' ')}</p>`,'card');c.append(more);
  more.querySelectorAll('button').forEach(b=>b.onclick=()=>{b.disabled=true;const t=TWISTS.find(x=>x.id===b.dataset.id);const cc=el('');more.after(cc);runSteps(cc,twistSteps(t),null)});
  cont(more,next,'Finish: see my design →');},false)},'Go →')};

/* ---- report card ---- */
const report=(box,next)=>{const u=DES.unit,cn=DES.cond,o=DES.out;
 const tick=(ok,good,bad)=>`<li>${ok?'✓':'⚠'} ${ok?good:bad}</li>`;
 const lines=[
  tick(u&&u.ok,'<b>Contamination handled</b> by randomising whole courses.','<b>Contamination left open</b> (students in the same course share). Say how you would limit it.'),
  `<li>⚠ <b>Many units needed.</b> Aim for many courses: Liu had only 30 instructors, so chance imbalance was a worry.</li>`,
  tick(cn&&(cn.ok||cn.tier),'<b>Real alternative as control</b> (ChatGPT stays available).','<b>Control not the real alternative.</b>'),
  tick(cn&&cn.ok,'<b>Guided mode</b> tested, not just an answer-giving tutor.','<b>Default mode</b> tested: it mostly hands out answers, so expect a small or negative effect.'),
  tick(o&&(o.ok||o.tier),'<b>Common, blind-marked, AI-free exam</b> as the outcome.','<b>Outcome not comparable</b> across courses.'),
  tick(o&&o.ok,'<b>Follow-up next term</b> shows whether learning lasts.','<b>No follow-up:</b> you can’t say whether learning lasts.'),
  tick(twistsDone>0,'<b>Complications</b> handled by analysing as you randomise (ITT) and checking attrition.','<b>Complications not yet tried</b>: go back and try one.'),
  `<li>✓ <b>Moodle activity</b> is best kept as a secondary outcome only, because the tutor sits on Moodle.</li>`];
 const txt=['MY STUDY DESIGN (POLS0007 Week 7)',
  'Unit: '+(u?u.t:''),'  '+(u&&u.text?u.text:''),
  'Treatment and control: '+(cn?cn.t:''),'  '+(cn&&cn.text?cn.text:''),
  'Outcome and timing: '+(o?o.t:''),'  '+(o&&o.text?o.text:'')].join('\n');
 box.innerHTML=`<span class="badge">Your design</span><h2>Report card</h2>
 <div class="ex"><b>Unit:</b> ${u?esc(u.t):'—'}<br><b>Treatment and control:</b> ${cn?esc(cn.t):'—'}<br><b>Outcome and timing:</b> ${o?esc(o.t):'—'}</div>
 <p><b>What your design handles</b></p><ul class="rep">${lines.join('')}</ul>
 <p class="fine">⚠ lines are the trade-offs and gaps still open. Good designs name them.</p>
 <p><button class="btn alt" id="cp">Copy my design</button> <span class="fine" id="cps"></span></p>`;
 box.querySelector('#cp').onclick=()=>{const done=ok=>box.querySelector('#cps').textContent=ok?'Copied.':'Couldn’t copy: select the text above instead.';
  try{navigator.clipboard.writeText(txt).then(()=>done(true),()=>done(false))}catch(e){done(false)}};
 cont(box,next)};

const q3=()=>[...UNIT,...COND,...OUTC,stressStart,report,
 chk('w7.p6','w7-design-unit','Why might UCL randomise whole courses rather than individual students?',[
  O('It guarantees a larger sample',0,'Courses give fewer randomised units, not more.','SIZE'),
  O('It avoids contamination between treated and control students in the same course',1,'Right: classmates share notes and answers, which would push the estimate toward zero.'),
  O('It guarantees balance on prior grades',0,'No randomisation guarantees balance. With few courses chance imbalance can be large.','DEF'),
  O('It removes the need to measure outcomes',0,'Randomisation tells you about causation; you still need to measure outcomes.','DEF')]),
 chk('w7.p7','w7-sate-pate','A trial shows large gains among volunteers. Which would make it a reliable guide for all students?',[
  O('A large sample',0,'Size doesn’t make volunteers representative.','SIZE'),
  O('A very small p-value',0,'Significance says the effect isn’t chance, not that it holds for everyone.','SIZE'),
  O('If the characteristics that make the effect bigger or smaller are known and measured, so it can be adjusted for the whole population',1,'Right: if we understand what drives the variation, we can say how the effect would differ in the wider population.'),
  O('If volunteers were split evenly across arms',0,'That helps internal validity (who is treated), not whether volunteers represent everyone.','SAMPASSIGN')]),
 info(`<span class="badge">Done</span><h2>That’s the page finished</h2><p>You diagnosed the threats in two studies, explained why they disagree, and designed a trial that guards against them. The same three moves (<b>name the threat, say which way it pushes, tie it to the design</b>) are what an exam answer needs.</p><p>Wait for your seminar leader’s next instruction.</p>`,'Close')];

start([
 {short:'Brief',title:'The AI tutor consultancy',mins:0,steps:brief},
 {short:'Warm-up',title:'Warm-up: the vocabulary',mins:5,steps:warm},
 {short:'Q1 Evidence',title:'Q1: Diagnose the problems',mins:10,steps:q1},
 {short:'Q2 Why',title:'Q2: Why do they disagree?',mins:8,steps:q2},
 {short:'Q3 Design',title:'Q3: Design the trial',mins:22,steps:q3}]);
})();
