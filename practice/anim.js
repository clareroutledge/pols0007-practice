// Small looping SVG animations, one per concept. Returns an SVG string.
(function(){
const B='#3B6FE0',O='#F28C28',I='#1B2340',L='#CBD3F0',Y='#FFE08A',G='#2E8B57';
const dot=(x,y,f,cls='',st='',r=11)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${I}" stroke-width="2" class="${cls}" style="${st}"/>`;
const box=(x,c,w=180)=>`<rect x="${x}" y="40" width="${w}" height="170" rx="16" fill="none" stroke="${c}" stroke-width="5"/>`;
const wrap=s=>`<svg viewBox="0 0 480 250" role="img" class="anim">${s}</svg>`;
const grid=(x0,y0,n,f,cls='',stFn)=>{let s='';for(let i=0;i<n;i++){s+=dot(x0+(i%3)*50,y0+Math.floor(i/3)*55,typeof f==='function'?f(i):f,typeof cls==='function'?cls(i):cls,stFn?stFn(i):'');}return s;};
const A={};
A.selfsel=()=>wrap(box(20,B)+box(280,O)+
 [[240,70,1],[240,110,0],[240,150,1],[240,190,0],[216,90,1],[264,130,0],[216,170,1],[264,70,0]].map(([x,y,k])=>dot(x,y,k?I:'#fff','mv',`--dx:${k?-165:165}px;animation-delay:${(x%7)*0.08}s`)).join(''));
A.attrit=()=>wrap(box(20,B)+box(280,O)+
 grid(65,75,6,B,i=>i<4?'lv':'',i=>`--dx:-150px;--dy:${(i%2?1:-1)*30}px`)+
 grid(325,75,6,O,i=>i===5?'lv':'',()=>`--dx:150px;--dy:30px`));
A.contam=()=>wrap(box(20,B)+box(280,O)+
 `<circle cx="200" cy="125" r="60" fill="${B}" opacity=".35" class="glow"/>`+grid(65,75,6,B)+grid(325,75,6,O,'tint'));
A.expbias=()=>wrap(box(20,B)+box(280,O)+grid(65,95,6,B)+grid(325,95,6,O)+
 `<text x="110" y="30" font-size="34" text-anchor="middle" class="bob">👀</text>`+
 [0,1,2].map(i=>`<text x="${65+i*50}" y="${80}" font-size="22" fill="${G}" font-weight="800" text-anchor="middle" class="tick" style="animation-delay:${i*0.35}s">✓</text>`).join(''));
A.demand=()=>wrap(dot(120,150,B,'',"",34)+
 `<text x="120" y="160" font-size="34" text-anchor="middle">🙂</text>`+
 `<text x="390" y="170" font-size="64" text-anchor="middle">🧑‍🔬</text>`+
 `<g class="say"><rect x="30" y="30" width="250" height="60" rx="18" fill="#fff" stroke="${I}" stroke-width="3"/><text x="155" y="68" font-size="20" font-weight="700" text-anchor="middle" fill="${I}">They want me to say it helped!</text></g>`);
A.ge=()=>wrap(
 `<g class="g1">${box(150,B,180)}${grid(195,85,3,B)}<text x="240" y="235" font-size="18" font-weight="700" text-anchor="middle" fill="${I}">small pilot</text></g>`+
 `<g class="g2"><rect x="20" y="30" width="440" height="190" rx="16" fill="none" stroke="${B}" stroke-width="5"/>`+
 Array.from({length:30},(_,i)=>dot(50+(i%10)*42,55+Math.floor(i/10)*55,i%3?B:'#F5B7B1','jit',`animation-delay:${(i%5)*0.1}s`,9)).join('')+
 `<text x="240" y="242" font-size="18" font-weight="700" text-anchor="middle" fill="${I}">whole country</text></g>`);
A.fund=()=>wrap(
 dot(70,125,'#fff','',"",26)+`<text x="70" y="133" font-size="22" font-weight="800" text-anchor="middle" fill="${I}">i</text>`+
 `<path d="M100 115 L270 65" stroke="${B}" stroke-width="5" fill="none"/><path d="M100 135 L270 185" stroke="#5A6385" stroke-width="5" stroke-dasharray="10 8" fill="none"/>`+
 `<g class="real"><circle cx="330" cy="62" r="40" fill="${B}" stroke="${I}" stroke-width="3"/><text x="330" y="72" font-size="28" font-weight="800" text-anchor="middle" fill="#fff">68</text></g>`+
 `<g class="ghost"><circle cx="330" cy="188" r="40" fill="none" stroke="#5A6385" stroke-width="4" stroke-dasharray="8 7"/><text x="330" y="200" font-size="36" font-weight="800" text-anchor="middle" fill="#5A6385">?</text></g>`+
 `<text x="190" y="62" font-size="16" font-weight="700" fill="${I}">path taken</text><text x="190" y="215" font-size="16" font-weight="700" fill="#5A6385">path not taken</text>`);
A.indiv=()=>wrap(
 dot(70,125,'#fff','',"",26)+`<text x="70" y="133" font-size="22" font-weight="800" text-anchor="middle" fill="${I}">i</text>`+
 `<path d="M100 115 L220 70" stroke="${B}" stroke-width="5" fill="none"/><path d="M100 135 L220 180" stroke="${O}" stroke-width="5" fill="none"/>`+
 `<circle cx="260" cy="65" r="36" fill="${B}" stroke="${I}" stroke-width="3"/><text x="260" y="75" font-size="26" font-weight="800" text-anchor="middle" fill="#fff">68</text>`+
 `<circle cx="260" cy="185" r="36" fill="${O}" stroke="${I}" stroke-width="3"/><text x="260" y="195" font-size="26" font-weight="800" text-anchor="middle" fill="${I}">61</text>`+
 `<g class="gap"><path d="M330 70 V180" stroke="${I}" stroke-width="3"/><rect x="350" y="100" width="90" height="50" rx="12" fill="${Y}" stroke="${I}" stroke-width="3"/><text x="395" y="134" font-size="26" font-weight="800" text-anchor="middle" fill="${I}">+7</text></g>`);
A.internal=()=>wrap(box(20,B)+box(280,O)+
 [[65,85,1],[115,85,0],[165,85,0],[65,140,0],[115,140,1],[165,140,0]].map(([x,y,k])=>dot(x,y,k?I:'#fff')).join('')+
 [[325,85,0],[375,85,1],[425,85,0],[325,140,1],[375,140,0],[425,140,0]].map(([x,y,k])=>dot(x,y,k?I:'#fff')).join('')+
 `<g class="pulse"><ellipse cx="240" cy="125" rx="225" ry="105" fill="none" stroke="${G}" stroke-width="5" stroke-dasharray="14 8"/><text x="240" y="240" font-size="34" font-weight="800" fill="${G}" text-anchor="middle">✓</text></g>`);
A.external=()=>wrap(
 `<circle cx="95" cy="125" r="70" fill="none" stroke="${I}" stroke-width="4" stroke-dasharray="10 8"/>`+
 [[70,100,B],[110,95,O],[85,145,B],[125,140,O]].map(([x,y,c])=>dot(x,y,c,'',"",10)).join('')+
 `<path d="M175 125 H250" stroke="${I}" stroke-width="6" class="arr"/><path d="M250 105 L280 125 L250 145Z" fill="${I}" class="arr"/>`+
 `<circle cx="375" cy="125" r="100" fill="none" stroke="${I}" stroke-width="4" stroke-dasharray="10 8"/>`+
 Array.from({length:14},(_,i)=>dot(310+(i%5)*35+((i/5|0)%2)*14,70+(i/5|0)*40,[B,O,I,'#fff'][i%4],'pop',`animation-delay:${i*0.12}s`,9)).join(''));
window.ANIMS=A;
})();
