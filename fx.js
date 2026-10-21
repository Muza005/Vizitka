/* Decorative motion for the page.
   Every device: hero auras, a ground shadow under the card and slow floating (CSS, off under reduced motion);
   scroll reveals, price count-up, the pinned card, the projects carousel, the project card ⇄ dialog morph (all off
   under reduced motion).
   Fine pointer only: cursor halo, magnetic buttons, spotlight cards, hero-wide gold, card depth parallax,
   project cover tilt and hover preview; on capable devices it also loads the WebGL card (card3d.js).
   One rAF loop drives the pointer effects; it sleeps once all motion has settled.
   Relies on fine / tilt from script.js (fine is already false under reduced motion). */
(function(){
  if(typeof fine==="undefined") return;

  const AURA_SHIFT=.025, AURA_LERP=.04;  // aura follows the pointer by this share of its offset from center
  const TILT_IN=.2, TILT_OUT=.07;         // how fast depth catches up with the card's tilt (while tilting / settling)
  // Emulated height above the card surface, px: positive layers float above, negative sink below
  const DEPTH=[[".fx-gl",-16],[".bc-city",14],[".bc-name",34],[".bc-role",22],[".bc-lines",18],[".back svg",22],[".back > div",14]];
  const SHADOW_H=110;                     // how far below the card the "table" is, px
  // Scroll reveal: observed blocks, and the pieces inside them that rise in turn
  const RV_BLOCKS=".sec-head,#strip,.price-group,.terms,.steps-title,.contact > div:first-child,.clist";
  const RV_ITEMS=".sec-head p,#strip > *,.price-group > *,.terms > *,.contact .lead,.contact .tg,.clist > li";
  const RV_HEADS=".sec-head h2,.steps-title,.contact h2";
  const RV_STEP=70, RV_WORD=55, RV_AFTER_WORDS=140, RV_MAX_I=8, RV_DUR=900; // ms
  // Price count-up: a price counts from zero in steps of 0.1 (millions), 10 (thousands) or 1 (percent),
  // COUNT_STEP_MS a step, but never shorter than COUNT_MIN or longer than COUNT_MAX
  const COUNT_STEP_MS=60, COUNT_MIN=2000, COUNT_MAX=3000;
  const COUNT_SEEN=.6, COUNT_STAGGER=120, COUNT_DELAY=200; // starts once this much of the row is in view; rows in turn
  const PIN_FADE=.82, PIN_SAMPLES=24;     // card fades into the logo after this share of the flight
  const MORPH_WAIT=300;                   // how long the card → dialog morph waits for the first frame to decode, ms
  const MIN_MEMORY=4, MIN_CORES=4;        // 3D card: weaker devices keep the CSS card (deviceMemory GB, hardwareConcurrency)

  const root=document.documentElement;
  const heroEl=document.querySelector(".hero"), sceneEl=document.querySelector(".scene");
  root.classList.add("fx-base");

  // Auras: three big radial-gradient spots; drift is CSS, the pointer nudges the inner layer
  const aura=document.createElement("div");
  aura.className="fx-aura"; aura.setAttribute("aria-hidden","true");
  aura.innerHTML='<div><i></i><i></i><i></i></div>';
  const auraIn=aura.firstChild;
  if(heroEl) heroEl.prepend(aura);

  // Ground shadow sits outside #tilt, so it doesn't rotate or float with the card
  const shadow=document.createElement("div");
  shadow.className="fx-shadow"; shadow.setAttribute("aria-hidden","true");
  shadow.innerHTML='<i class="soft"></i><i class="contact"></i>';
  if(sceneEl) sceneEl.prepend(shadow);
  // it fades in once web fonts are in: the font swap moves the hero card, and a visible 2D layer there
  // would be counted as layout shift (the card itself, in its 3D context, isn't)
  const showShadow=()=>shadow.classList.add("on");
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>requestAnimationFrame(showShadow)); else showShadow();

  // Guilloche moves to its own layer so it can sit deeper than the text
  const front=document.querySelector(".front");
  if(front){ const gl=document.createElement("i"); gl.className="fx-gl"; gl.setAttribute("aria-hidden","true"); front.prepend(gl); }

  // Nothing animates while the hero is off screen
  if(heroEl && "IntersectionObserver" in window)
    new IntersectionObserver(([e])=>heroEl.classList.toggle("fx-idle",!e.isIntersecting)).observe(heroEl);

  /* ---------- hero text keeps its height across languages ---------- */
  // The title wraps to 4 lines in RU and 3 in EN (and the lead differs by width), so a switch used to resize the hero
  // and jolt the card and every section below it. From the first switch on, each block reserves the height of its
  // tallest language: the spare room goes above the title (it sits on the lead) and below the lead and the buttons,
  // so their tops stay put too. Not before it: at load the scripts can run after the first paint, and reserving then
  // would itself shift the page.
  // Whatever still moves on a switch (the first reserve growing the hero, prices or terms rewrapping above what you
  // look at) glides there: the card, every section and the footer start where they were on screen and ease into
  // their new places (FLIP on translate) while the text fades back in.
  // Afterwards a ResizeObserver redoes it whenever a block's text box changes (width, the web font): it runs after
  // layout but before paint, and the reserve is padding, outside the observed content box, so it doesn't loop.
  const HOLD=[[".hero h1","paddingTop"],[".hero .lead","paddingBottom"],[".hero .actions","paddingBottom"]];
  const HOLD_MOVERS=".hero-card, .hero ~ section, body > footer";
  const GLIDE_DUR=650, GLIDE_EASE="cubic-bezier(.22,1,.36,1)"; // a long, soft landing
  const holdItems=typeof T==="undefined"?[]:HOLD.map(([sel,prop])=>({el:document.querySelector(sel),prop})).filter(x=>x.el);
  function holdHero(){
    const items=holdItems;
    if(!items.length) return;
    const langs=Object.keys(T);
    // every language in a hidden copy of the block, at the block's width; all appended first, then read once.
    // The block keeps its current reserve meanwhile: dropping it, even for a moment, would let the page shrink
    // and clamp the scroll position at the bottom
    for(const it of items){
      const width=it.el.getBoundingClientRect().width;
      it.copies=langs.map(l=>{
        const c=it.el.cloneNode(true);
        c.removeAttribute("style"); c.lang=l; c.setAttribute("aria-hidden","true"); c.inert=true;
        c.style.cssText=`position:absolute;left:0;top:0;width:${width}px;visibility:hidden;pointer-events:none;animation:none`;
        for(const n of [c,...c.querySelectorAll("[data-i]")]){
          const v=T[l][n.dataset.i]; if(typeof v!=="string") continue;
          if(n.dataset.html) n.innerHTML=v; else n.textContent=v;
        }
        it.el.parentElement.append(c);
        return c;
      });
    }
    for(const it of items){
      const hs=it.copies.map(c=>c.getBoundingClientRect().height);
      it.copies.forEach(c=>c.remove());
      const max=Math.max(...hs), own=hs[langs.indexOf(lang)];
      it.el.style[it.prop]=own!=null && max-own>.5?`${(max-own).toFixed(2)}px`:"";
      it.copies=null;
    }
  }
  if(holdItems.length){
    let holding=false, before=null;
    // on-screen position without transforms (a running glide left out)
    const layoutTop=el=>{ let y=0; for(let e=el;e;e=e.offsetParent) y+=e.offsetTop; return y-scrollY; };
    const glides=new Map();
    // a switch starts with a click on a language; script.js fades the text out first, so nothing has moved yet.
    // Where it was is where it is seen, a glide still running included. The browser's own scroll anchoring would
    // move the page a frame later, after the glides are set up, so it's off for the switch and done here instead:
    // the block under the upper part of the screen keeps its place exactly, the rest glides around it
    let anchor=null;
    document.addEventListener("click",e=>{
      if(!(e.target.closest && e.target.closest(".langs button"))) return;
      before=[...document.querySelectorAll(HOLD_MOVERS)].map(el=>[el,el.getBoundingClientRect().top]);
      const look=innerHeight*.3;
      anchor=null;
      for(const el of document.querySelectorAll(".hero, .hero ~ section, body > footer")){
        const r=el.getBoundingClientRect();
        if(r.top<=look && r.bottom>look){ anchor=[el,r.top]; break; }
      }
      root.style.overflowAnchor=document.body.style.overflowAnchor="none";
    },true);
    const glide=from=>{
      for(const [el,y] of from){
        const to=layoutTop(el), d=y-to, h=el.offsetHeight;
        const prev=glides.get(el); if(prev) prev.cancel();
        if(el===cardSwap.el && cardSwap.on) continue;            // it leaves and comes back on its own (below)
        // only what can be seen on the way
        if(Math.abs(d)<.5 || Math.max(y,to)+h<0 || Math.min(y,to)>innerHeight) continue;
        const a=el.animate({translate:[`0 ${d.toFixed(1)}px`,"0 0"]},{duration:GLIDE_DUR,easing:GLIDE_EASE});
        glides.set(el,a); a.onfinish=()=>glides.delete(el);
      }
    };
    document.addEventListener("vz:lang",()=>{
      holding=true; holdHero();
      if(before){
        if(anchor){
          const shift=layoutTop(anchor[0])-anchor[1];
          if(Math.abs(shift)>.5) scrollTo({top:scrollY+shift,behavior:"instant"});
        }
        if(!REDUCED) glide(before);
        requestAnimationFrame(()=>requestAnimationFrame(()=>{ root.style.overflowAnchor=document.body.style.overflowAnchor=""; }));
      }
      before=anchor=null;
    });
    if("ResizeObserver" in window){
      const ro=new ResizeObserver(()=>{ if(holding) holdHero(); });
      holdItems.forEach(it=>ro.observe(it.el));
    }
  }

  /* ---------- language switch: the hero card leaves and comes back with the texts ---------- */
  // script.js fades the texts out (vz:langout), swaps the language (vz:lang) and fades them back in. The hero card
  // goes along as a whole: it sinks and fades out with them and rises back in, already in the new language, so its
  // text never visibly changes. Only while the hero is on screen (not while the card sits in the header).
  const CARD_OUT=180, CARD_IN=520, CARD_SINK=18;  // ms (out matches the texts' fade-out in script.js), px
  const cardSwap={el:heroEl && heroEl.querySelector(".hero-card"),on:false,out:null};
  if(cardSwap.el && !REDUCED && Element.prototype.animate){
    const c=cardSwap;
    document.addEventListener("vz:langout",()=>{
      const r=heroEl.getBoundingClientRect();
      if(r.bottom<innerHeight*.6 || r.top>innerHeight*.4) return;
      c.on=true;
      if(c.out) c.out.cancel();
      c.out=c.el.animate([{opacity:1,translate:"0 0"},{opacity:0,translate:`0 ${CARD_SINK}px`}],
        {duration:CARD_OUT,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"});
    });
    // registered after the hero glides above, so this runs once they're set up
    document.addEventListener("vz:lang",()=>{
      if(!c.on) return;
      const back=c.el.animate([{opacity:0,translate:`0 ${CARD_SINK}px`},{opacity:1,translate:"0 0"}],
        {duration:CARD_IN,easing:"cubic-bezier(.22,.61,.36,1)"});
      if(c.out){ c.out.cancel(); c.out=null; }
      back.onfinish=back.oncancel=()=>{ if(!c.out) c.on=false; };
    });
  }

  /* ---------- hero intro: the card and the buttons rise in, the text types itself out ---------- */
  // fx.css keeps the hero hidden until here (html.fx-intro-on). It plays on a fresh load at the top of the page;
  // a #link, a back/forward visit, a restored scroll, reduced motion or a failsafe that already fired skip it.
  // Screen readers get each text whole from the start; the typed copy is aria-hidden and becomes plain text again.
  // Any input (pointer, key, wheel, touch, scroll) finishes it at once, so it never stands in the way.
  const INTRO_DELAY=150;                  // ms before anything moves
  const TYPE_H1_MS=32, TYPE_LEAD_MS=9;    // per character; the lead speeds up if needed to finish by INTRO_TOTAL_MAX
  const TYPE_GAP=140, INTRO_TOTAL_MAX=2600; // pause between title and lead; all typing done by then (ms from start)
  const CARET_HOLD=600;                   // the caret blinks this long after the last character, then fades
  // the card rises and fades in, the auras fade in. No scale: script.js sizes the guilloche from the card's on-screen
  // box, and a scaled card would make it redraw (a long task) at a lower resolution
  const CARD_DUR=700, AURA_DUR=1000;
  const BTN_AT=.6, BTN_DUR=450, BTN_STEP=90; // buttons start once this share of the title is typed, one after another
  let introDone=Promise.resolve();
  {
    const h1=heroEl && heroEl.querySelector("h1"), lead=heroEl && heroEl.querySelector(".lead");
    const actions=heroEl && heroEl.querySelector(".actions"), heroCard=heroEl && heroEl.querySelector(".hero-card");
    const nav=performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    const play=!REDUCED && h1 && lead && actions && heroCard && !location.hash && scrollY<1
      && !(nav && nav.type==="back_forward") && getComputedStyle(h1).opacity==="0";
    if(play) introDone=new Promise(resolve=>{
      const split=el=>{
        const text=el.textContent, sr=document.createElement("span"), vis=document.createElement("span");
        sr.className="fx-sr"; sr.textContent=text;
        vis.setAttribute("aria-hidden","true");
        const chars=[...text].map(ch=>{ const s=document.createElement("span"); s.className="fx-ch"; s.textContent=ch; return s; });
        vis.append(...chars);
        el.classList.add("fx-type"); el.replaceChildren(sr,vis);
        return {el,text,vis,chars,times:[],n:0};
      };
      // per-character times with a little human unevenness, longer after punctuation, scaled to the set pace
      const pace=(t,start,per,stops)=>{
        const raw=t.chars.map(c=>(.55+Math.random()*.9)*(stops && /[,.:;!?—]/.test(c.textContent)?3:1));
        const k=per*raw.length/raw.reduce((a,b)=>a+b,0);
        let x=start; t.times=raw.map(r=>{ const at=x; x+=r*k; return at; });
        return x;
      };
      const title=split(h1), body=split(lead);
      const h1End=pace(title,INTRO_DELAY,TYPE_H1_MS,true);
      const leadStart=h1End+TYPE_GAP;
      const leadEnd=pace(body,leadStart,Math.min(TYPE_LEAD_MS,Math.max(1,(INTRO_TOTAL_MAX-leadStart)/body.chars.length)),false);
      const caret=document.createElement("i");
      caret.className="fx-caret"; caret.setAttribute("aria-hidden","true");
      h1.append(caret);

      const ease="cubic-bezier(.22,.61,.36,1)";
      const btnAt=title.times[Math.floor(title.times.length*BTN_AT)]||INTRO_DELAY;
      const anims=[
        heroCard.animate({opacity:[0,1],translate:["0 16px","0 0"]},{duration:CARD_DUR,delay:INTRO_DELAY,easing:"cubic-bezier(.33,1,.68,1)",fill:"backwards"}),
        aura.animate({opacity:[0,1]},{duration:AURA_DUR,easing:"linear",fill:"backwards"}),
        ...[...actions.children].map((b,i)=>b.animate({opacity:[0,1],translate:["0 12px","0 0"]},{duration:BTN_DUR,delay:btnAt+i*BTN_STEP,easing:ease,fill:"backwards"}))
      ];
      root.classList.add("fx-intro-on");

      let t0=0, raf=0, over=false, endAt=0;
      const place=(t,s)=>{
        if(caret.parentNode!==t.el) t.el.append(caret);
        const x=s?s.offsetLeft+s.offsetWidth:(t.chars[0]?t.chars[0].offsetLeft:0), ref=s||t.chars[0];
        if(ref){ caret.style.height=ref.offsetHeight*.8+"px"; caret.style.transform=`translate(${x.toFixed(1)}px,${(ref.offsetTop+ref.offsetHeight*.1).toFixed(1)}px)`; }
      };
      const type=(t,now)=>{ while(t.n<t.chars.length && t.times[t.n]<=now) t.chars[t.n++].classList.add("on"); };
      const tick=now=>{
        if(over) return;
        if(!t0) t0=now;
        const t=now-t0;
        type(title,t); type(body,t);
        if(t<leadStart) place(title,title.chars[title.n-1]);
        else if(body.n<body.chars.length) place(body,body.chars[body.n-1]);
        else if(!endAt){ place(body,body.chars[body.n-1]); caret.classList.add("blink"); endAt=t; }
        if(endAt && t-endAt>=CARET_HOLD){ caret.classList.add("out"); setTimeout(finish,220); return; }
        raf=requestAnimationFrame(tick);
      };
      // back to plain text (unless a language switch has already replaced it), every animation at its end
      function finish(){
        if(over) return; over=true;
        cancelAnimationFrame(raf);
        removeEventListener("scroll",onScroll);
        for(const ev of ["pointerdown","keydown","wheel","touchstart"]) removeEventListener(ev,finish,true);
        caret.remove();
        for(const t of [title,body]) if(t.vis.isConnected){ t.el.textContent=t.text; t.el.classList.remove("fx-type"); }
        anims.forEach(a=>a.finish());
        resolve();
      }
      const onScroll=()=>{ if(scrollY>1) finish(); };
      for(const ev of ["pointerdown","keydown","wheel","touchstart"]) addEventListener(ev,finish,{capture:true,passive:true});
      addEventListener("scroll",onScroll,{passive:true});
      document.addEventListener("vz:lang",finish);
      place(title,null);
      raf=requestAnimationFrame(tick);
    });
    else root.classList.add("fx-intro-on");
  }

  /* ---------- scroll reveal ---------- */
  // Content is hidden only once html.fx-rv is set here, so without JS (or with reduced motion) it's all just visible.
  // A block waits (.fx-wait) until it scrolls in, plays once (.fx-in), then settles (no class), so pieces that
  // applyLang re-renders later show up as they are instead of replaying.
  const io="IntersectionObserver" in window && !REDUCED;
  if(io){
    root.classList.add("fx-rv");
    const splitWords=h=>{
      if(h.querySelector(".fx-w")) return;
      h.innerHTML=h.textContent.trim().split(/[ \t\n]+/).map((w,i)=>`<span class="fx-w"><span style="--w:${i}">${esc(w)}</span></span>`).join(" ");
    };
    const seenBlocks=new WeakSet();
    const reveal=b=>{
      b.classList.remove("fx-wait"); b.classList.add("fx-in");
      const words=b.querySelectorAll(".fx-w").length, base=words?RV_AFTER_WORDS+words*RV_WORD/2:0;
      const items=[...b.querySelectorAll(RV_ITEMS)];
      items.forEach((el,i)=>el.style.setProperty("--d",`${base+Math.min(i,RV_MAX_I)*RV_STEP}ms`));
      setTimeout(()=>{ b.classList.remove("fx-in"); items.forEach(el=>el.style.removeProperty("--d")); },
        base+Math.max(words*RV_WORD,Math.min(items.length,RV_MAX_I)*RV_STEP)+RV_DUR);
    };
    const obs=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ obs.unobserve(e.target); reveal(e.target); } }),{rootMargin:"0px 0px -12% 0px"});
    // first: blocks above the bottom of the viewport stay put; later (re-render): anything already reached stays put
    const scan=first=>{
      document.querySelectorAll(RV_HEADS).forEach(splitWords);
      document.querySelectorAll(RV_BLOCKS).forEach(b=>{
        if(seenBlocks.has(b)) return; seenBlocks.add(b);
        const r=b.getBoundingClientRect();
        if(first ? r.bottom<0 : r.top<innerHeight) return;
        b.classList.add("fx-wait"); obs.observe(b);
      });
    };
    scan(true);
    document.addEventListener("vz:lang",()=>scan(false));
  }

  /* ---------- price count-up ---------- */
  // Each price counts up from zero in the same format fmtPrice produced: "0,1 → 0,2 → … → 1,9 → 2 млн",
  // "10 → 20 → … → 400 тыс.", "+1% → … → +25%" (the separator follows the language). It starts when its row is
  // well in view, once per page load; a language switch mid-count just shows the result.
  // The final text keeps its place in the layout (transparent, still read by screen readers) and the counting copy
  // lies over it, so a wider value on the way ("1,9" over "2") never moves anything.
  if(io){
    const counted=new Set();              // indices of the prices already counted (or counting)
    const all=()=>[...document.querySelectorAll(".pprice")];
    // what to count: the number, its step and the decimals shown on the way
    function plan(text){
      const m=text.match(/\d+(?:[.,]\d+)?/); if(!m) return null;
      const after=text.slice(m.index+m[0].length), to=parseFloat(m[0].replace(",","."));
      const sep=m[0].match(/[.,]/)?m[0].match(/[.,]/)[0]:(root.lang==="en"?".":",");
      const step=/^\s*(млн|mln|M)/.test(after)?.1:/^\s*(тыс|ming|K)/.test(after)?10:1;
      return {m,to,sep,step,dec:step<1?1:0,n:Math.max(1,Math.round(to/step))};
    }
    function prepare(el){
      if(el.querySelector(".fx-pcount")) return;
      const text=el.textContent, p=plan(text); if(!p) return;
      const fmt=k=>k>=p.n?text:text.slice(0,p.m.index)+(k*p.step).toFixed(p.dec).replace(".",p.sep)+text.slice(p.m.index+p.m[0].length);
      el.classList.add("fx-count");
      el.innerHTML='<span class="fx-pfinal"></span><span class="fx-pcount" aria-hidden="true"></span>';
      el.firstChild.textContent=text;
      // as wide as its widest value from the start ("1,9" or the result), so only the text changes inside it
      const vis=el.lastChild; let w=0;
      for(const v of [fmt(p.n-1),text]){ vis.textContent=v; w=Math.max(w,vis.getBoundingClientRect().width); }
      vis.style.minWidth=Math.ceil(w)+"px"; vis.textContent=fmt(0);
      align(el);
      el._count={text,fmt,n:p.n};
    }
    // the copy hugs the side the price is aligned to (right on wide screens, left in the one-column layout)
    const align=el=>{ const c=el.lastChild, right=getComputedStyle(el).textAlign==="right"; c.style.right=right?"0":"auto"; c.style.left=right?"auto":"0"; };
    function run(el){
      const c=el._count; if(!c) return;
      const vis=el.lastChild, dur=Math.min(COUNT_MAX,Math.max(COUNT_MIN,c.n*COUNT_STEP_MS));
      let t0=0, k=0;
      const done=()=>{ if(el.isConnected){ el.textContent=c.text; el.classList.remove("fx-count"); } };
      const tick=now=>{
        if(!el.isConnected) return;
        if(!t0) t0=now;
        const t=Math.min(1,(now-t0)/dur);
        // eased by step index: brisk at first, the last steps slow down into the result; never skips back
        const next=Math.max(k,Math.floor(c.n*Math.sin(t*Math.PI/2)));
        if(next!==k){ k=next; vis.textContent=c.fmt(k); }
        if(t<1) requestAnimationFrame(tick); else done();
      };
      requestAnimationFrame(tick);
    }
    const obs=new IntersectionObserver(es=>{
      const ready=es.filter(e=>e.isIntersecting).map(e=>e.target);
      ready.forEach((el,i)=>{
        obs.unobserve(el);
        const idx=all().indexOf(el); if(idx<0 || counted.has(idx)) return;
        counted.add(idx);
        // wait for the row's own reveal, then go one after another
        const go=()=>{ if(!el.isConnected) return; if(el.closest(".fx-wait")) return setTimeout(go,100); run(el); };
        setTimeout(go,COUNT_DELAY+i*COUNT_STAGGER);
      });
    },{threshold:COUNT_SEEN});
    // the prices still to count show zero and wait; the counted ones (re-rendered by a language switch) stay as they are
    const arm=()=>all().forEach((el,i)=>{ if(counted.has(i)) return; prepare(el); obs.observe(el); });
    arm();
    document.addEventListener("vz:lang",arm);
    addEventListener("resize",()=>document.querySelectorAll(".fx-count").forEach(align),{passive:true});
  }

  /* ---------- steps timeline: the line draws in time, each circle lights up as it passes ---------- */
  // When the steps are well in view, the accent line draws over TL_DUR (eased in and out); each circle is lit
  // the moment the line's head reaches its centre (measured, so the vertical phone layout with uneven steps keeps
  // in sync): for DOT_GLOW_MS it fills, swells to DOT_SCALE and sends off a halo to HALO_SCALE, and its text rises
  // in. It plays again on every return, once the steps have been out of view (reset unseen).
  const TL_DUR=3200, DOT_GLOW_MS=1000, DOT_SCALE=1.12, HALO_SCALE=2.4, TL_SEEN=.6;
  const steps=document.getElementById("steps");
  if(io && steps && Element.prototype.animate){
    root.classList.add("fx-tl");
    const EASE="cubic-bezier(.37,0,.63,1)";                      // sine in-out, as easeAt() below
    const easeAt=y=>Math.acos(1-2*y)/Math.PI;                    // when (share of TL_DUR) the eased line reaches y
    const vertical=()=>matchMedia("(max-width:900px)").matches;
    let anims=[], timers=[], played=false;
    function reset(){
      anims.forEach(a=>a.cancel()); anims=[]; timers.forEach(clearTimeout); timers=[];
      steps.querySelectorAll("li").forEach(li=>li.classList.remove("fx-on"));
      played=false;
    }
    const halo=li=>{ if(li.querySelector(".fx-halo")) return; const h=document.createElement("i"); h.className="fx-halo"; h.setAttribute("aria-hidden","true"); li.prepend(h); };
    function play(){
      reset(); played=true;
      const v=vertical(), lis=[...steps.children], L=(v?steps.offsetHeight:steps.offsetWidth)||1;
      anims.push(steps.animate({transform:v?["scaleY(0)","scaleY(1)"]:["scaleX(0)","scaleX(1)"]},
        {duration:TL_DUR,easing:EASE,fill:"forwards",pseudoElement:"::before"}));
      for(const li of lis){
        halo(li);
        const at=TL_DUR*easeAt(Math.max(0,Math.min(1,(v?li.offsetTop+12:li.offsetLeft+14)/L)));
        timers.push(setTimeout(()=>li.classList.add("fx-on"),at));
        const o={duration:DOT_GLOW_MS,delay:at,easing:"cubic-bezier(.33,1,.68,1)"};
        const swell=[{transform:"scale(1)"},{transform:`scale(${DOT_SCALE})`,offset:.3},{transform:"scale(1)"}];
        anims.push(li.animate(swell,{...o,pseudoElement:"::before"}));
        anims.push(li.animate([{opacity:0,transform:"scale(1)"},{opacity:1,transform:`scale(${DOT_SCALE})`,offset:.3},{opacity:1,offset:.6,transform:"scale(1.04)"},{opacity:0,transform:"scale(1)"}],{...o,pseudoElement:"::after"}));
        anims.push(li.querySelector(".fx-halo").animate([{opacity:0,transform:"scale(.8)"},{opacity:.7,offset:.2},{opacity:0,transform:`scale(${HALO_SCALE})`}],o));
      }
    }
    // a language switch re-renders the steps: if they have played, the new ones are simply there
    document.addEventListener("vz:lang",()=>{ if(played) steps.querySelectorAll("li").forEach(li=>{ halo(li); li.classList.add("fx-on"); }); });
    let tlObs=null;
    const watch=()=>{
      if(tlObs) tlObs.disconnect();
      // a list taller than the screen can't be 60 % in view: then most of what fits is enough
      const thr=Math.min(TL_SEEN,innerHeight*.8/Math.max(1,steps.offsetHeight));
      tlObs=new IntersectionObserver(es=>es.forEach(e=>{
        if(e.isIntersecting && e.intersectionRatio>=thr-.001){ if(!played) play(); }
        else if(!e.isIntersecting && played) reset();
      }),{threshold:[0,thr]});
      tlObs.observe(steps);
    };
    watch();
    let wt=0; addEventListener("resize",()=>{ clearTimeout(wt); wt=setTimeout(watch,200); },{passive:true});
  }

  /* ---------- projects carousel: the section holds the screen, each gesture shows the next project ---------- */
  // On screens tall enough for the pages (not with reduced motion), #projects becomes a stage (html.fx-car-on, fx.css):
  // the active project in the middle, its neighbours smaller and faded at the sides, a glow of its color behind.
  // While the page rests on the section, the pages code below hands the wheel, keys and swipes over to it: a gesture
  // moves exactly one project, the move always plays out (input meanwhile is dropped, not queued), and past the last
  // (or before the first) project the page goes on. Elsewhere script.js's plain strip stays.
  const CAR_MIN_H=560;                    // as PAGES_MIN_H below
  const CAR_DUR=950;                      // ms per move (fx.css: --car-dur, with its easing)
  const CAR_COOL=180;                     // ms of quiet after a move before the next gesture counts
  const CAR_STEP=24, CAR_TOUCH=40;        // px of wheel (summed over a gesture) / of a swipe that make a step
  const CAR_GAP=220;                      // ms without wheel events that starts a new gesture
  const CAR_RELEASE=450;                  // ms after the carousel lets the page go when a fling isn't caught on it again
  const CAR_STOP=500;                     // ms a touch fling caught on the projects is held there (its tail pulled back)
  const CAR_MIN_D=3, CAR_DECAY=.92, CAR_HIST=12; // touchpad inertia: deltas under CAR_MIN_D, or a force falling under
                                                 // CAR_DECAY of the one before, are the tail of a swipe, not a new one
  const CAR_ROOM=600, CAR_K=[.5,1.25];    // height the 900×540 design card needs; its scale range (--k)
  const CAR_NARROW=1000;                  // below this width the card stands upright: the picture on top, text below
  const CAR_POS=[[1,1,0],[.8,.45,840],[.7,0,1480]]; // by distance from the middle: scale, opacity, x (design px · k)
  const CAR_POS_N=[[1,1],[.88,.45],[.8,0]];         // upright: x is set so a neighbour shows CAR_PEEK of the screen
  const CAR_PEEK=.06;
  const CAR_EXTRA={crm:["crm_car","crm_deal"],arcade:["arc_game2","arc_lobby2"],drive:["drv_s2","drv_s3"]}; // the two smaller screens
  const CAR_T={
    ru:{sub:"Листайте вниз — проекты сменяются по одному.",next:"Скролл вниз — следующий проект",end:"Скролл вниз — дальше по странице",
      prev_b:"Предыдущий проект",next_b:"Следующий проект",car:"карусель",slide:"слайд",
      show:n=>`Показать проект «${n}»`,live:(i,n,t)=>`Проект ${i} из ${n}: ${t}`},
    uz:{sub:"Pastga aylantiring — loyihalar birma-bir almashadi.",next:"Pastga aylantiring — keyingi loyiha",end:"Pastga aylantiring — sahifa davom etadi",
      prev_b:"Oldingi loyiha",next_b:"Keyingi loyiha",car:"karusel",slide:"slayd",
      show:n=>`«${n}» loyihasini koʻrsatish`,live:(i,n,t)=>`Loyiha ${i} / ${n}: ${t}`},
    en:{sub:"Scroll down — projects change one at a time.",next:"Scroll down for the next project",end:"Scroll down to go on",
      prev_b:"Previous project",next_b:"Next project",car:"carousel",slide:"slide",
      show:n=>`Show project “${n}”`,live:(i,n,t)=>`Project ${i} of ${n}: ${t}`}
  };
  const car=(()=>{
    const sec=document.getElementById("projects"), head=sec&&sec.querySelector(".sec-head");
    if(REDUCED || !head || typeof PROJECTS==="undefined" || !PROJECTS.length) return null;
    const N=PROJECTS.length, pad=n=>String(n).padStart(2,"0"), tt=()=>CAR_T[lang]||CAR_T.ru;
    const svg=(d,w)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const img=(k,cls)=>IMG[k]?`<img src="${IMG[k]}" alt="" loading="lazy" decoding="async"${cls||""}>`:"";
    const card=(p,i)=>{
      const ex=(CAR_EXTRA[p.id]||p.shots.map(s=>s[0]).filter(k=>k!==p.cover)).slice(0,2);
      return `<div class="fx-car-card" data-p="${i}" data-id="${esc(p.id)}" role="group">
        <div class="fx-car-in">
          <div class="fx-car-vis">
            <div class="fx-car-main"><div class="fx-car-bar" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="pcover">${img(p.cover)}</div></div>
            ${ex.map((k,j)=>`<div class="fx-car-x fx-car-x${j+1}" aria-hidden="true">${img(k)}</div>`).join("")}
          </div>
          <div class="fx-car-txt">
            <div class="fx-car-g" style="--n:0"><span class="fx-car-num">${pad(i+1)}</span><span class="fx-car-of">/ ${pad(N)}</span></div>
            <div class="fx-car-g" style="--n:1"><p class="fx-car-type"></p><h3></h3></div>
            <div class="fx-car-g" style="--n:2"><p class="fx-car-short"></p><div class="chips">${p.stack.slice(0,3).map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div></div>
            <div class="fx-car-g fx-car-foot" style="--n:3"><span class="fx-car-cnt"></span><button type="button" class="fx-car-go"><span></span>${svg('<path d="M5 12h14M13 6l6 6-6 6"/>',2.2)}</button></div>
          </div>
        </div>
        <button type="button" class="fx-car-hit" tabindex="-1" hidden></button>
      </div>`;
    };
    const stage=document.createElement("div");
    stage.className="fx-car";
    stage.innerHTML=`<div class="fx-car-glow" aria-hidden="true">${PROJECTS.map(p=>`<i data-id="${esc(p.id)}"></i>`).join("")}</div>
      <div class="fx-car-track">${PROJECTS.map(card).join("")}</div>
      <div class="fx-car-bot"><div class="fx-car-dots" aria-hidden="true">${PROJECTS.map(()=>"<i></i>").join("")}<b></b></div>
        <p class="fx-car-hint" aria-hidden="true">${svg('<rect x="6.5" y="3" width="11" height="18" rx="5.5"/><path class="wh" d="M12 7v3"/>',1.7)}<span></span></p></div>
      <p class="fx-sr" aria-live="polite"></p>`;
    sec.append(stage);
    // the head gets its own subtitle, counter and arrows (script.js keeps driving the strip's, which are hidden now)
    const sub=document.createElement("p"); sub.className="fx-car-sub";
    head.firstElementChild.append(sub);
    const ctrl=document.createElement("div"); ctrl.className="fx-car-ctrl";
    ctrl.innerHTML=`<span class="fx-car-count"><b>01</b> / ${pad(N)}</span>`
      +`<button type="button" class="icon-btn" data-go="-1">${svg('<path d="m15 18-6-6 6-6"/>')}</button>`
      +`<button type="button" class="icon-btn" data-go="1">${svg('<path d="m9 18 6-6-6-6"/>')}</button>`;
    head.append(ctrl);
    const track=stage.querySelector(".fx-car-track"), live=stage.querySelector(".fx-sr");
    const cards=[...track.children].map((el,i)=>({el,i,p:PROJECTS[i],in:el.querySelector(".fx-car-in"),hit:el.querySelector(".fx-car-hit")}));
    const glows=[...stage.querySelectorAll(".fx-car-glow i")], dots=[...stage.querySelectorAll(".fx-car-dots i")], pill=stage.querySelector(".fx-car-dots b");
    const [prevB,nextB]=ctrl.querySelectorAll("button"), countB=ctrl.querySelector("b"), hintT=stage.querySelector(".fx-car-hint span");

    let on=false, index=0, k=1, narrow=false, lockUntil=0;
    function fill(){
      const t=T[lang], c=tt();
      for(const {el,i,p,hit} of cards){
        el.setAttribute("aria-roledescription",c.slide);
        el.setAttribute("aria-label",`${i+1} ${t.of} ${N}: ${p.name[lang]}`);
        el.querySelector(".fx-car-type").textContent=p.type[lang];
        el.querySelector("h3").textContent=p.name[lang];
        el.querySelector(".fx-car-short").textContent=p.short[lang];
        el.querySelector(".fx-car-cnt").textContent=t.screens(p.shots.length);
        el.querySelector(".fx-car-go span").textContent=t.open_project;
        const cover=el.querySelector(".pcover img"); if(cover) cover.alt=p.name[lang];
        hit.setAttribute("aria-label",c.show(p.name[lang]));
      }
      sub.textContent=c.sub;
      prevB.setAttribute("aria-label",c.prev_b); nextB.setAttribute("aria-label",c.next_b);
      if(on){ sec.setAttribute("aria-roledescription",c.car); sec.setAttribute("aria-label",t.projects_h); }
      hintT.textContent=index===N-1?c.end:c.next;
    }
    // where a card at distance a from the middle goes: [scale, opacity, x]
    function pos(a){
      if(!narrow){ const [s,o,x]=CAR_POS[a]; return [s,o,x*k]; }
      const w=cards[0].el.offsetWidth, x1=innerWidth*(.5-CAR_PEEK)+CAR_POS_N[1][0]*w/2;
      const [s,o]=CAR_POS_N[a]; return [s,o,[0,x1,x1*1.9][a]];
    }
    function place(){
      for(const c of cards){
        const d=c.i-index, a=Math.min(2,Math.abs(d)), [s,o,x]=pos(a);
        c.el.style.transform=`translate3d(${(Math.sign(d)*x).toFixed(1)}px,0,0) scale(${s})`;
        c.el.style.opacity=o; c.el.style.zIndex=20-a*4;
        c.el.style.setProperty("--d",Math.max(-2,Math.min(2,d)));
        c.el.classList.toggle("on",!d); c.el.classList.toggle("side",a===1);
        c.in.inert=!!d; c.hit.hidden=a!==1;
      }
      glows.forEach((g,i)=>g.classList.toggle("on",i===index));
      // the bars: 14px each, the active one 40px (the pill), 8px apart
      let x=0;
      dots.forEach((b,i)=>{ b.style.transform=`translateX(${x}px)`; b.style.opacity=i===index?0:1; if(i===index) pill.style.transform=`translateX(${x}px)`; x+=(i===index?40:14)+8; });
      pill.parentNode.style.width=x-8+"px";
      stage.dataset.on=PROJECTS[index].id;
      countB.textContent=pad(index+1);
      prevB.disabled=index===0; nextB.disabled=index===N-1;
      const c=tt(); hintT.textContent=index===N-1?c.end:c.next;
    }
    // jump without the move (the section is out of view, or the layout changed)
    function now(f){ stage.classList.add("fx-car-now"); f(); void stage.offsetWidth; stage.classList.remove("fx-car-now"); }
    // short of room: the description gets shorter, then the chips go, then the description (fx.css)
    const TIGHT=["fx-car-t1","fx-car-t2","fx-car-t3","fx-car-t4"];
    function fit(){
      stage.classList.remove(...TIGHT);
      const room=track.clientHeight-8;
      const over=()=>cards.some(c=>narrow?c.el.offsetHeight>room:c.el.querySelector(".fx-car-txt").scrollHeight>c.el.offsetHeight+1);
      for(const t of TIGHT){ if(!over()) break; stage.classList.add(t); }
    }
    function layout(){
      on=innerHeight>=CAR_MIN_H;
      root.classList.toggle("fx-car-on",on);
      if(!on){ sec.removeAttribute("aria-roledescription"); sec.removeAttribute("aria-label"); return; }
      narrow=innerWidth<CAR_NARROW;
      stage.classList.toggle("fx-car-n",narrow);
      k=Math.max(CAR_K[0],Math.min(CAR_K[1],innerWidth/1440,track.clientHeight/CAR_ROOM));
      stage.style.setProperty("--k",k.toFixed(4));
      fill(); fit(); now(place);
    }
    function go(i){
      i=Math.max(0,Math.min(N-1,i));
      if(i===index) return false;
      index=i; lockUntil=performance.now()+CAR_DUR+CAR_COOL;
      place();
      const p=PROJECTS[i]; live.textContent=tt().live(i+1,N,p.name[lang]);
      return true;
    }
    const locked=()=>performance.now()<lockUntil;
    // wheel → a step (±1), or 0 while it's the same gesture, a move is playing, or a swipe's inertia is fading out
    let hist=[], accum=0, lastT=0;
    function intent(dy,t){
      if(t-lastT>CAR_GAP){ hist=[]; accum=0; }
      lastT=t;
      hist.push(Math.abs(dy)); if(hist.length>CAR_HIST) hist.shift();
      if(t<lockUntil){ accum=0; return 0; }
      const n=hist.length;
      if(Math.abs(dy)<CAR_MIN_D) return 0;
      if(n>=6 && hist[n-1]+hist[n-2]+hist[n-3]<(hist[n-4]+hist[n-5]+hist[n-6])*CAR_DECAY) return 0;
      if(accum && Math.sign(accum)!==Math.sign(dy)) accum=0;
      accum+=dy;
      if(Math.abs(accum)<CAR_STEP) return 0;
      const d=Math.sign(accum); accum=0; return d;
    }
    const api={
      get on(){ return on; }, get index(){ return index; }, count:N, locked, intent,
      // a step: "moved", "locked" (a move is playing) or "edge" (nothing that way: the page should go on)
      step(d){ if(locked()) return "locked"; return go(index+d)?"moved":"edge"; },
      // out of view: the next visit from above starts at the first project, from below at the last
      reset(i){ if(i!==index && !locked()){ index=i; now(place); } },
      // show this one: moving if the section is in view, silently if not
      show(i){ const r=sec.getBoundingClientRect(); if(r.bottom>0 && r.top<innerHeight){ lockUntil=0; go(i); } else api.reset(i); },
      land(){}                            // the pages code (below) sets this: bring the page onto the section first
    };
    const move=i=>{ if(locked() || i<0 || i>=N || i===index) return; api.land(); go(i); };
    ctrl.addEventListener("click",e=>{ const b=e.target.closest("[data-go]"); if(b) move(index+ +b.dataset.go); });
    track.addEventListener("click",e=>{
      const hit=e.target.closest(".fx-car-hit");
      if(hit){ move(+hit.parentNode.dataset.p); return; }
      const open=e.target.closest(".fx-car-go,.fx-car-vis"), c=open&&open.closest(".fx-car-card");
      if(c && +c.dataset.p===index) openProject(index,c.querySelector(".fx-car-go"));
    });
    // the language: the texts fade out and back in with the rest of the page (script.js fades the head)
    let outs=[];
    const texts=()=>[...stage.querySelectorAll(".fx-car-txt,.fx-car-hint")];
    document.addEventListener("vz:langout",()=>{
      if(!on) return;
      outs.forEach(a=>a.cancel());
      outs=texts().map(el=>el.animate([{opacity:1,filter:"blur(0px)"},{opacity:0,filter:"blur(4px)"}],{duration:180,easing:"cubic-bezier(.4,0,1,1)",fill:"forwards"}));
    });
    document.addEventListener("vz:lang",()=>{
      layout();
      if(!outs.length) return;
      outs.forEach(a=>a.cancel()); outs=[];
      texts().forEach(el=>el.animate([{opacity:0,filter:"blur(4px)",transform:"translateY(5px)"},{opacity:1,filter:"blur(0px)",transform:"translateY(0)"}],{duration:380,easing:"cubic-bezier(.22,.61,.36,1)"}));
    });
    // the screens load after the hero intro, once the section is near (all of them: a card off to the side is clipped,
    // and lazy loading alone would only fetch its screens as it slides in); the cards rise in the first time it's in view
    if("IntersectionObserver" in window){
      const near=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ near.disconnect(); stage.querySelectorAll("img").forEach(im=>{ if(!narrow || !im.closest(".fx-car-x")) im.loading="eager"; }); } },{rootMargin:"100% 0px"});
      introDone.then(()=>near.observe(sec));
      const seen=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ seen.disconnect(); stage.classList.add("fx-car-shown"); } },{threshold:.25});
      seen.observe(sec);
    } else stage.classList.add("fx-car-shown");
    let lt=0; const relayout=()=>{ clearTimeout(lt); lt=setTimeout(layout,100); };
    addEventListener("resize",relayout,{passive:true});
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    if("ResizeObserver" in window) new ResizeObserver(relayout).observe(sec);
    layout();
    return api;
  })();
  let settleNow=()=>{};

  /* ---------- pages: each section a screen, and a magnet that settles the scroll on them ---------- */
  // fx.css sizes the pages (hero, projects, terms: a screen under the header; contact + footer: one screen; prices
  // keeps its length). Once a scroll comes to rest, it is eased to the next page edge in the direction it was going,
  // or back if it only went a little: under-scrolled, it pulls you on; over-scrolled, it pulls you back. Inside a
  // page taller than the screen it stays quiet, so long pages read freely.
  // Hero ⇄ projects is a gated step: one gesture (wheel, swipe, key) starts a GATE_DUR glide, the card flies into
  // the logo along with it, and the rest of that gesture (trackpad inertia too) is swallowed.
  // Any pointer, touch or key stops a glide at once. Off with reduced motion, on short screens, while a dialog is open.
  const PAGES_MIN_H=560;                  // px of viewport height; below it the page just scrolls (as in fx.css)
  const INTENT=.1, INTENT_MAX=80;         // share of the screen (capped, px) a gesture must travel to go on a page
  const SNAP_MIN=500, SNAP_MAX=900, SNAP_K=.35; // glide ms: SNAP_MIN + SNAP_K·distance, capped at SNAP_MAX
  const GATE_DUR=1100;                    // hero ⇄ projects glide, ms
  const WHEEL_GAP=140;                    // ms without wheel events that ends a gesture
  const SETTLE=150;                       // without scrollend: ms of scroll silence that counts as rest
  const SETTLE_SAFE=400;                  // with it: the same after this long, in case a scrollend never comes
  // Smooth wheel: the page follows the wheel on a critically damped spring of this angular frequency (rad/s):
  // it speeds up, then settles softly into place, ~95 % there after 4.74/SMOOTH_W s (about 0.6 s)
  const SMOOTH_W=8;
  const SMOOTH_ACC=9000;                  // px/s²: speeding up is capped at this (a far target pulls smoothly, not
                                          // with a kick); slowing down isn't, so it never overshoots
  const headEl=document.querySelector(".top"), footEl=document.querySelector("body > footer");
  const pageEls=[heroEl,...["projects","prices","terms","contact"].map(id=>document.getElementById(id))].filter(Boolean);
  const projEl=document.getElementById("projects");
  const docTop=el=>{ let y=0; for(let e=el;e;e=e.offsetParent) y+=e.offsetTop; return y; };
  const headH=()=>headEl?headEl.offsetHeight:0;
  const maxScroll=()=>root.scrollHeight-innerHeight;
  const pageStart=el=>el===heroEl?0:Math.max(0,Math.min(maxScroll(),docTop(el)-headH()));
  // the hero fits one screen, so it can be a gated step (on phones it's taller and simply scrolls)
  const heroFits=()=>!!(heroEl && projEl) && heroEl.offsetHeight<=innerHeight-headH()+2;
  const pagesOn=()=>!REDUCED && innerHeight>=PAGES_MIN_H;
  const easeIO=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
  let glideNow=null;                      // {raf, gate}
  function stopGlide(){ if(glideNow){ cancelAnimationFrame(glideNow.raf); glideNow=null; } }
  let smoothNow=null;                     // the smooth wheel (below): {y, v, target, at, t, raf}
  function stopSmooth(){ if(smoothNow){ cancelAnimationFrame(smoothNow.raf); smoothNow=null; } }
  function glideTo(y,dur,gate){
    stopGlide(); stopSmooth();
    const from=scrollY, d=Math.max(0,Math.min(maxScroll(),y))-from;
    if(Math.abs(d)<1) return;
    dur=dur||Math.min(SNAP_MAX,SNAP_MIN+SNAP_K*Math.abs(d));
    const g={gate,raf:0}; let t0=0, at=from;
    const step=now=>{
      if(glideNow!==g) return;
      // something else scrolled the page meanwhile (a script, find in page): it wins
      if(Math.abs(scrollY-at)>3){ glideNow=null; return; }
      if(!t0) t0=now;
      const p=Math.min(1,(now-t0)/dur);
      scrollTo({top:at=from+d*easeIO(p),behavior:"instant"});
      at=scrollY;
      if(p<1) g.raf=requestAnimationFrame(step); else glideNow=null;
    };
    glideNow=g; g.raf=requestAnimationFrame(step);
  }
  // for the rest of this file: go somewhere the way the pages do (glide), or natively where they're off
  const goTo=y=>{ if(pagesOn()) glideTo(y); else scrollTo({top:y,behavior:REDUCED?"auto":"smooth"}); };

  if(pageEls.length>1){
    const setFoot=()=>{ if(footEl) root.style.setProperty("--fx-foot",footEl.offsetHeight+"px"); };
    setFoot(); addEventListener("resize",setFoot,{passive:true}); document.addEventListener("vz:lang",setFoot);

    const busy=()=>!pagesOn() || !!document.querySelector("dialog[open]") || root.classList.contains("fx-vt");
    let dir=0, lastY=scrollY, lastInput="", quietUntil=0, touching=false, dragging=false;
    let wheelAt=0, wheelLock=false;
    // page edges: where each page starts and, if taller than the screen, where it ends (the last one ends the document)
    function stops(){
      const max=maxScroll(), vh=innerHeight;
      return pageEls.map((el,i)=>{
        const s=pageStart(el), e=i===pageEls.length-1?max:Math.min(max,Math.max(s,docTop(el)+el.offsetHeight-vh));
        return {s,e};
      });
    }
    let settleT=0;
    function settle(){
      clearTimeout(settleT);
      if(busy() || glideNow || smoothNow || touching || dragging || performance.now()<quietUntil) return;
      // a wheel gesture still going (a pause between notches, or a scrollend from a glide it just stopped):
      // wait for it to end, or the pull would fight it
      const idle=performance.now()-wheelAt;
      if(idle<WHEEL_GAP){ settleT=setTimeout(settle,WHEEL_GAP-idle+10); return; }
      const to=snapFor(scrollY);
      if(to!==null) glideTo(to);
    }
    // the page edge a scroll resting at y should settle on, or null where it may rest as it is
    function snapFor(y){
      const pages=stops();
      if(pages.some(p=>y>p.s+1 && y<p.e-1)) return null; // inside a long page: read freely
      const pts=[...new Set(pages.flatMap(p=>[p.s,p.e]).map(Math.round))].sort((a,b)=>a-b);
      let a=null, b=null;
      for(const p of pts){ if(p<=y+.5) a=p; if(p>=y-.5 && b===null) b=p; }
      if(a===null || b===null || Math.abs(y-a)<1 || Math.abs(y-b)<1) return null;
      const th=lastInput==="key"?1:Math.min(INTENT*innerHeight,INTENT_MAX);
      return dir>0?(y-a>=th?b:a):dir<0?(b-y>=th?a:b):(y-a<b-y?a:b);
    }
    addEventListener("scroll",()=>{
      const y=scrollY;
      if(!glideNow && Math.abs(y-lastY)>.5) dir=Math.sign(y-lastY);
      lastY=y;
    },{passive:true});
    settleNow=settle;
    const hasEnd="onscrollend" in window;
    if(hasEnd) addEventListener("scrollend",settle);
    { let t=0; addEventListener("scroll",()=>{ clearTimeout(t); t=setTimeout(settle,hasEnd?SETTLE_SAFE:SETTLE); },{passive:true}); }

    // a glide the rest of the gesture can't stop (it's swallowed, trackpad inertia too)
    const gateTo=(y,dur)=>{ glideTo(y,dur,true); wheelLock=true; };
    // hero ⇄ projects
    const gate=y=>gateTo(y,GATE_DUR);
    // where a gesture going this way from here should be gated to, if anywhere
    const gateTarget=down=>{
      if(busy() || !heroFits()) return null;
      const y=scrollY, ps=pageStart(projEl);
      if(down && y<ps-1) return ps;
      if(!down && y>.5 && y<=ps+1) return 0;
      return null;
    };
    // Smooth wheel (mouse and touchpad; touch keeps its own momentum): each wheel step moves a target and the page
    // follows on the spring, so slow turns glide in with a slight lag and fast spins ease up and settle softly.
    // Not over boxes that scroll themselves, in a dialog, or when a handler already took the wheel.
    const scrollsInside=el=>{
      for(let n=el;n && n!==document.body && n!==root;n=n.parentElement){
        if(/(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.scrollHeight>n.clientHeight+1) return true;
      }
      return false;
    };
    const smoothable=e=>!REDUCED && !e.defaultPrevented && !document.querySelector("dialog[open]")
      && !root.classList.contains("fx-vt") && !scrollsInside(e.target);
    function smoothStep(now){
      const m=smoothNow; if(!m) return;
      if(Math.abs(scrollY-m.at)>3){ smoothNow=null; return; }   // something else scrolled the page: it wins
      const dt=Math.min(.032,m.t?(now-m.t)/1000:1/60); m.t=now;
      let a=SMOOTH_W*SMOOTH_W*(m.target-m.y)-2*SMOOTH_W*m.v;
      if(Math.sign(a)===Math.sign(m.v) || Math.abs(m.v)<1) a=Math.max(-SMOOTH_ACC,Math.min(SMOOTH_ACC,a));
      m.v+=a*dt; m.y+=m.v*dt;
      const done=Math.abs(m.target-m.y)<1 && Math.abs(m.v)<40;
      if(done) m.y=m.target;
      scrollTo({top:m.y,behavior:"instant"}); m.at=scrollY;
      if(done){ smoothNow=null; settle(); return; }
      m.raf=requestAnimationFrame(smoothStep);
    }
    function smoothBy(dy){
      if(!smoothNow){ smoothNow={y:scrollY,v:0,target:scrollY,at:scrollY,t:0,raf:0,snap:0}; smoothNow.raf=requestAnimationFrame(smoothStep); }
      const m=smoothNow;
      m.target=Math.max(0,Math.min(maxScroll(),m.target+dy));
      // once the wheel goes quiet, the spring heads straight for where the magnet would take it: one motion that
      // eases out on the page edge, instead of stopping short and starting again
      clearTimeout(m.snap);
      m.snap=setTimeout(()=>{
        if(smoothNow!==m || busy() || touching || dragging) return;
        const to=snapFor(m.target);
        if(to!==null) m.target=to;
      },WHEEL_GAP);
    }
    // The projects carousel (above): while the page rests on it, gestures move the projects instead of the page.
    // Past its ends the page goes on to the neighbouring page, a glide the rest of the gesture can't stop.
    const pinned=()=>!!(car && car.on) && !busy() && Math.abs(scrollY-pageStart(projEl))<2;
    let carFree=0;                        // until then a fling across the projects isn't caught on them
    function carGesture(d){
      stopGlide(); stopSmooth();
      const ps=pageStart(projEl);
      if(Math.abs(scrollY-ps)>=.5) scrollTo({top:ps,behavior:"instant"});
      if(car.step(d)!=="edge") return;
      carFree=performance.now()+CAR_RELEASE;
      const pages=stops(), i=pageEls.indexOf(projEl), to=d>0?pages[i+1]:pages[i-1];
      if(!to) return;
      if(d<0 && heroFits()) gate(0); else gateTo(d>0?to.s:to.e);
    }
    if(car) car.land=()=>{ if(!pinned() && !busy()) glideTo(pageStart(projEl)); };
    // a flight across the projects (the wheel's, or a native one: touch momentum, keys) stops on them; not a scroll the
    // page makes by itself (to a #hash at load, find in page)
    const crosses=(from,to,ps)=>(from<ps-1 && to>ps-1) || (from>ps+1 && to<ps+1);
    let carY=scrollY, carAt=false, carHold=0, carUnhold=0;
    addEventListener("scroll",()=>{
      if(!car || !car.on) return;
      const y=scrollY, ps=pageStart(projEl), now=performance.now();
      const free=!busy() && !glideNow && !smoothNow && !touching && !dragging;
      if(free && (lastInput==="touch" || lastInput==="key") && now>carFree && now>quietUntil
        && Math.abs(y-carY)<innerHeight && (crosses(carY,y,ps) || (now<carHold && Math.abs(y-ps)>1))){
        // a touch fling goes on after a programmatic scroll: taking the overflow away for a moment ends it, and
        // for CAR_STOP whatever is left of it is pulled back
        if(lastInput==="touch"){
          if(now>=carHold) carHold=now+CAR_STOP;
          root.style.overflow="hidden"; clearTimeout(carUnhold); carUnhold=setTimeout(()=>{ root.style.overflow=""; },120);
        }
        scrollTo({top:ps,behavior:"instant"});
      }
      carY=scrollY; carAt=Math.abs(carY-ps)<2;
      // out of view: the next visit from above starts at the first project, from below at the last
      const r=projEl.getBoundingClientRect();
      if(r.top>=innerHeight-1) car.reset(0); else if(r.bottom<=headH()+1) car.reset(car.count-1);
    },{passive:true});
    // a resize while resting on the projects keeps it there (page edges move under the scroll position)
    addEventListener("resize",()=>{ if(carAt) requestAnimationFrame(()=>{ if(car.on && !busy()) scrollTo({top:pageStart(projEl),behavior:"instant"}); }); },{passive:true});

    addEventListener("wheel",e=>{
      if(e.ctrlKey) return;
      const side=Math.abs(e.deltaX)>Math.abs(e.deltaY);
      if(side && !pinned()) return;
      lastInput="wheel";
      const now=performance.now(), fresh=now-wheelAt>WHEEL_GAP; wheelAt=now;
      if(glideNow && glideNow.gate){ e.preventDefault(); return; }
      if(wheelLock){ if(fresh) wheelLock=false; else { e.preventDefault(); return; } }
      if(pinned()){
        e.preventDefault();
        const d=car.intent((side?e.deltaX:e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),now);
        if(d) carGesture(d);
        return;
      }
      stopGlide();
      const dy=e.deltaY*(e.deltaMode===1?40:e.deltaMode===2?innerHeight:1);
      if(!busy()){
        const down=dy>0, to=gateTarget(down);
        if(to!==null){ e.preventDefault(); stopSmooth(); gate(to); return; }
        // a long spin doesn't fly past the projects: it stops on them first
        if(car && car.on){
          const ps=pageStart(projEl), from=smoothNow?smoothNow.target:scrollY;
          if(crosses(scrollY,from+dy,ps)){ e.preventDefault(); stopSmooth(); gateTo(ps); return; }
        }
      }
      if(smoothable(e)){ e.preventDefault(); smoothBy(dy); }
    },{passive:false});
    const KEYS={ArrowDown:1,PageDown:1," ":1,ArrowUp:-1,PageUp:-1};
    const CAR_KEYS={...KEYS,ArrowRight:1,ArrowLeft:-1};
    addEventListener("keydown",e=>{
      lastInput="key";
      if(e.key==="Tab") quietUntil=performance.now()+1000;   // focus moves scroll the page; leave them be
      if(e.key==="Home" || e.key==="End") quietUntil=performance.now()+1500;
      if(glideNow && !glideNow.gate) stopGlide();
      stopSmooth();
      const k=CAR_KEYS[e.key]; if(!k || e.altKey || e.ctrlKey || e.metaKey) return;
      const t=e.target;
      if(t && t.closest && t.closest("input,textarea,select,[contenteditable],dialog")) return;
      if(e.key===" " && t && t.closest && t.closest("a,button,[role=button]")) return;
      if(glideNow && glideNow.gate){ e.preventDefault(); return; }
      const d=e.key===" "&&e.shiftKey?-1:k;
      if(pinned()){ e.preventDefault(); carGesture(d); return; }
      if(!KEYS[e.key]) return;                             // ← → are the carousel's only
      const to=gateTarget(d>0);
      if(to!==null){ e.preventDefault(); gate(to); }
    });
    let touchY=0, carTouch=null;
    addEventListener("touchstart",e=>{
      touching=true; lastInput="touch"; touchY=e.touches[0].clientY; stopSmooth(); if(!(glideNow && glideNow.gate)) stopGlide();
      carTouch=pinned() && e.touches.length===1?{x:e.touches[0].clientX,y:touchY,done:false}:null;
    },{passive:true});
    addEventListener("touchmove",e=>{
      if(glideNow && glideNow.gate){ if(e.cancelable) e.preventDefault(); return; }
      // on the carousel the page stays; a swipe (either way) of CAR_TOUCH moves one project, once per touch
      if(carTouch){
        if(e.touches.length!==1){ carTouch=null; return; }
        if(e.cancelable) e.preventDefault();
        if(carTouch.done) return;
        const dx=carTouch.x-e.touches[0].clientX, dy=carTouch.y-e.touches[0].clientY, d=Math.abs(dy)>=Math.abs(dx)?dy:dx;
        if(Math.abs(d)>=CAR_TOUCH){ carTouch.done=true; carGesture(Math.sign(d)); }
        return;
      }
      const dy=touchY-e.touches[0].clientY;
      if(Math.abs(dy)<8 || !e.cancelable) return;
      const to=gateTarget(dy>0);
      if(to!==null){ e.preventDefault(); gate(to); }
    },{passive:false});
    const untouch=()=>{ touching=false; };
    addEventListener("touchend",untouch,{passive:true}); addEventListener("touchcancel",untouch,{passive:true});
    // a press stops a glide; on the scrollbar it's a drag, and the page is left alone until it's let go
    addEventListener("pointerdown",e=>{
      if(e.pointerType!=="mouse") return;
      lastInput="pointer"; stopGlide(); stopSmooth();
      if(e.clientX>=root.clientWidth) dragging=true;
    },true);
    addEventListener("pointerup",()=>{ if(dragging){ dragging=false; settle(); } },true);
    // layout changes move page edges under the scroll position: no pulling right after them
    const quiet=()=>{ quietUntil=performance.now()+800; };
    addEventListener("resize",quiet,{passive:true}); document.addEventListener("vz:lang",quiet);

    // in-page links glide to their page; from the keyboard the focus follows, for Tab and screen readers
    document.addEventListener("click",e=>{
      const a=e.target.closest && e.target.closest('a[href^="#"]');
      if(!a || busy()) return;
      const el=pageEls.find(p=>p.id && a.getAttribute("href")==="#"+p.id);
      if(!el) return;
      e.preventDefault();
      glideTo(pageStart(el));
      if(el===projEl && car && car.on) car.show(0);       // the projects always open on the first one
      if(e.detail===0){ el.setAttribute("tabindex","-1"); el.focus({preventScroll:true}); }
    });
  }

  /* ---------- pinned card: flies from the hero into the header logo as you scroll ---------- */
  // The card stays in the layout (no shift); only .scene gets transform/opacity. Its keyframes are sampled
  // over scroll offsets and bound to a ScrollTimeline, so the browser runs it with the scroll; where that API
  // is missing the same pose() is applied from a rAF on scroll.
  const mark=document.querySelector(".brand-mark"), topBar=headEl;
  if(!REDUCED && sceneEl && mark && topBar){
    root.classList.add("fx-pin");
    const g={};
    const docPos=el=>{ let x=0,y=0; for(let e=el;e;e=e.offsetParent){ x+=e.offsetLeft; y+=e.offsetTop; } return [x,y]; };
    const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
    const lerp=(a,b,t)=>a+(b-a)*t;
    function geo(){
      [g.L,g.T]=docPos(sceneEl); g.W=sceneEl.offsetWidth; g.H=sceneEl.offsetHeight;
      g.bx=mark.offsetLeft; g.by=(parseFloat(getComputedStyle(topBar).top)||0)+mark.offsetTop;
      g.bw=mark.offsetWidth; g.bh=mark.offsetHeight;
      const vh=innerHeight;
      g.s0=Math.max(0,g.T+g.H/2-vh*.55);
      g.s1=Math.max(g.s0+220,g.T+g.H-topBar.offsetHeight/2);
      // with the hero as a gated page, the flight spans the whole glide to the projects
      g.even=pagesOn() && heroFits();
      if(g.even) g.s1=Math.max(g.s1,pageStart(projEl));
      g.max=Math.max(g.s1+1,document.documentElement.scrollHeight-vh);
    }
    const progress=s=>Math.max(0,Math.min(1,(s-g.s0)/(g.s1-g.s0)));
    function pose(s){
      // gated, the glide already eases the scroll in and out, so the flight follows it evenly (easing it again
      // would bunch the whole move into the middle of the glide)
      const p=progress(s), e=g.even?p:ease(p);
      // viewport top goes from where the card was when the flight started to the logo; + s undoes the scroll
      const tx=(g.bx-g.L)*e, ty=s<=g.s0?0:lerp(g.T-g.s0,g.by,e)-g.T+s;
      return {p,
        transform:`translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${lerp(1,g.bw/g.W,e).toFixed(4)},${lerp(1,g.bh/g.H,e).toFixed(4)})`,
        opacity:p<PIN_FADE?1:Math.max(0,1-(p-PIN_FADE)/(1-PIN_FADE)),
        mark:s<=g.s0?1:p<.12?1-p/.12:p>PIN_FADE?(p-PIN_FADE)/(1-PIN_FADE):0};
    }
    let anims=[];
    function build(){
      anims.forEach(a=>a.cancel()); anims=[];
      geo();
      if(!("ScrollTimeline" in window)){ applyPose(); return; }
      const card=[], logo=[], at=s=>Math.min(1,s/g.max);
      const push=s=>{ const q=pose(s); card.push({offset:at(s),transform:q.transform,opacity:q.opacity,visibility:q.p>=1?"hidden":"visible"}); logo.push({offset:at(s),opacity:q.mark}); };
      push(0);
      for(let i=0;i<=PIN_SAMPLES;i++) push(g.s0+(g.s1-g.s0)*i/PIN_SAMPLES);
      push(g.max);
      const tl=new ScrollTimeline({source:document.documentElement,axis:"block"});
      anims=[sceneEl.animate(card,{timeline:tl,fill:"both"}),mark.animate(logo,{timeline:tl,fill:"both"})];
    }
    function applyPose(){
      const q=pose(scrollY);
      sceneEl.style.transform=q.transform; sceneEl.style.opacity=q.opacity; sceneEl.style.visibility=q.p>=1?"hidden":"";
      mark.style.opacity=q.mark;
    }
    if(!("ScrollTimeline" in window)){ let raf=0; addEventListener("scroll",()=>{ if(!raf) raf=requestAnimationFrame(()=>{ raf=0; applyPose(); }); },{passive:true}); }
    let bt=0; const rebuild=()=>{ clearTimeout(bt); bt=setTimeout(build,120); };
    build();
    addEventListener("resize",rebuild,{passive:true});
    if("ResizeObserver" in window) new ResizeObserver(rebuild).observe(document.body);
    document.addEventListener("vz:lang",rebuild);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
    // Once the card is mostly in the header, a click on it goes back to the top instead of flipping;
    // the logo it turns into does the same (all the way up, so the card lands back in the hero)
    sceneEl.addEventListener("click",e=>{
      if(progress(scrollY)<.5) return;
      e.stopPropagation(); e.preventDefault();
      goTo(0);
    },true);
    const brand=mark.closest("a");
    if(brand) brand.addEventListener("click",e=>{ e.preventDefault(); goTo(0); });
  }

  /* ---------- project card ⇄ dialog: the cover morphs into the first gallery frame and back ---------- */
  // script.js calls fxMorph.open/close first; false means "not here", and it plays pdIn/pdOut as before.
  // view-transition-name is set only for the length of a transition.
  const pd=document.getElementById("pd");
  if(!REDUCED && pd && document.startViewTransition){
    let vt=null, kind="";
    const named=(el,n)=>{ if(el) el.style.viewTransitionName=n||""; };
    const inView=el=>{ const r=el.getBoundingClientRect(); return r.width>0 && r.bottom>0 && r.top<innerHeight && r.right>0 && r.left<innerWidth; };
    // the cover in the carousel, or on the plain strip where that's off
    const coverOf=pi=>document.querySelector(car&&car.on?`.fx-car-card[data-p="${pi}"] .pcover`:`#strip a.pcard[data-p="${pi}"] .pcover`);
    const ready=img=>Promise.race([img.decode().catch(()=>{}),new Promise(r=>setTimeout(r,MORPH_WAIT))]);
    const run=(k,update,cleanup)=>{
      kind=k; root.classList.add("fx-vt");
      vt=document.startViewTransition(update);
      vt.finished.finally(()=>{ cleanup(); root.classList.remove("fx-vt"); vt=null; kind=""; });
    };
    window.fxMorph={
      open(pi,opener){
        const cover=opener&&(opener.querySelector(".pcover")||coverOf(pi));
        if(pd.open || vt || !cover || !inView(cover)) return false;
        // the first frame has to be decoded before the snapshot, or the morph would land on an empty box
        const im=new Image(); im.src=IMG[PROJECTS[pi].shots[0][0]];
        ready(im).then(()=>{
          if(pd.open) return;
          if(!im.complete || !im.naturalWidth){ openProject(pi,opener,true); return; }
          let shot=null;
          named(cover,"fx-shot");
          run("open",async()=>{
            named(cover);
            pd.classList.add("fx-morphed");
            openProject(pi,opener,true);
            const tr=document.getElementById("pdTrack"); tr.scrollLeft=0;
            shot=tr.querySelector("img"); named(shot,"fx-shot"); named(pd,"fx-pd");
            await ready(shot);
          },()=>{ named(shot); named(pd); });
        });
        return true;
      },
      close(){
        if(vt){ if(kind==="close") return true; vt.skipTransition(); return false; }
        const cover=coverOf(cur.p), shot=pd.querySelectorAll("#pdTrack img")[cur.i];
        if(!cover || !shot || !inView(cover) || !inView(shot)) return false;
        // the strip may have been re-rendered (language switch) while the dialog was open
        cur.opener=cover.closest("a")||cover.closest(".fx-car-card").querySelector(".fx-car-go");
        named(shot,"fx-shot"); named(pd,"fx-pd");
        run("close",()=>{ named(shot); named(pd); finishClose(); named(cover,"fx-shot"); },()=>named(cover));
        return true;
      }
    };
    pd.addEventListener("close",()=>pd.classList.remove("fx-morphed"));
  }

  /* ---------- 3D card: card3d.js + Three.js, loaded once the page is idle, only where it runs well ---------- */
  // ?3d=1 / ?3d=0 force it on or off for testing; without WebGL2 it never loads
  const want3d=(()=>{
    const q=new URLSearchParams(location.search).get("3d");
    if(q==="0" || !sceneEl || !window.WebGL2RenderingContext) return false;
    if(q==="1") return true;
    return fine && (navigator.deviceMemory||8)>=MIN_MEMORY && (navigator.hardwareConcurrency||8)>=MIN_CORES;
  })();
  if(want3d){
    const go=()=>import("./card3d.js").then(m=>m.mount(sceneEl)).catch(()=>{}); // on failure the CSS card just stays
    // after the hero intro, so its heavy first tasks don't stutter the typing
    const idle=()=>introDone.then(()=>"requestIdleCallback" in window?requestIdleCallback(go,{timeout:2500}):setTimeout(go,300));
    if(document.readyState==="complete") idle(); else addEventListener("load",idle,{once:true});
  }

  if(!fine) return;

  const HALO_LERP=.18;                    // halo follow per frame
  const MAG_SEL=".btn-primary,.btn-ghost,.icon-btn,.tg";
  const MAG_R=80, MAG_MAX=7, MAG_ICON=1.7; // reach from the edge (px), max shift (px), icon shift multiplier
  const SPRING_K=.16, SPRING_D=.74;       // magnet spring stiffness and damping
  const SPOT_SEL=".pcard,.tbox,.tg,.prow";
  const GOLD_LERP=.08, GOLD_REST=40;      // --sx easing and resting value
  const LINK_SEL="a,button,[role=button],label,input,select,textarea,summary";
  const PV_TILT=7, PV_PERSP=900, PV_LERP=.12; // project cover tilt: max angle (deg), perspective (px), follow per frame
  const PV_DELAY=350, PV_SLIDE=1900, PV_FADE=600; // hover preview: start delay, time per shot, crossfade (ms)
  const PV_ZOOM=1.07;                     // Ken Burns zoom for regular shots; tall ones scroll down instead

  root.classList.add("fx");

  const halo=document.createElement("div");
  halo.className="fx-cursor"; halo.setAttribute("aria-hidden","true");
  halo.innerHTML='<span class="fx-glow"></span><span class="fx-ring"></span>';
  document.body.append(halo);

  let px=-999, py=-999, hx=0, hy=0, seen=false, moved=false;
  let sX=scrollX, sY=scrollY, dirty=true, raf=0;
  let mags=[], spots=new Map(), hero=null, scene=null, lit=null, mode="";
  const springs=new WeakMap();
  let gold=GOLD_REST, goldOn=false;
  let vw=innerWidth, vh=innerHeight, ax=0, ay=0, rx=0, ry=0;
  const layers=DEPTH.flatMap(([sel,h])=>[...document.querySelectorAll(sel)].map(el=>({el,h})));
  const soft=shadow.querySelector(".soft"), contact=shadow.querySelector(".contact");

  /* Layout is read only here (from event handlers), never inside the loop. Rects are stored in
     document space so scrolling doesn't invalidate them; header and dialog content stay in viewport space. */
  function measure(){
    dirty=false;
    const box=el=>{
      const r=el.getBoundingClientRect(), s=springs.get(el), f=!!el.closest(".top,dialog");
      return {l:r.left-(s?s.x:0)+(f?0:sX), t:r.top-(s?s.y:0)+(f?0:sY), w:r.width, h:r.height, f, ok:r.width>0};
    };
    mags=[...document.querySelectorAll(MAG_SEL)].map(el=>{
      if(!springs.has(el)) springs.set(el,{x:0,y:0,vx:0,vy:0});
      return {el, icon:el.querySelector(".ti")||el.querySelector("svg"), s:springs.get(el), b:box(el)};
    });
    spots=new Map([...document.querySelectorAll(SPOT_SEL)].map(el=>[el,box(el)]));
    const h=document.querySelector(".hero"), sc=document.querySelector(".scene");
    hero=h&&box(h);
    // the scene may be mid-flight to the header, so take its untransformed box from offsets
    if(sc){ let l=0,t=0; for(let e=sc;e;e=e.offsetParent){ l+=e.offsetLeft; t+=e.offsetTop; } scene={l,t,w:sc.offsetWidth,h:sc.offsetHeight,f:false,ok:true}; }
  }
  const markDirty=()=>{ dirty=true; };
  addEventListener("resize",()=>{ markDirty(); vw=innerWidth; vh=innerHeight; },{passive:true});
  if("ResizeObserver" in window) new ResizeObserver(markDirty).observe(document.body);
  new MutationObserver(markDirty).observe(document.body,{childList:true,subtree:true});
  const strip=document.getElementById("strip");
  if(strip) strip.addEventListener("scroll",()=>{ if(seen){ measure(); moved=true; wake(); } else markDirty(); },{passive:true});
  addEventListener("scroll",()=>{
    sX=scrollX; sY=scrollY; moved=true;
    wake();
  },{passive:true});

  const wake=()=>{ if(!raf) raf=requestAnimationFrame(frame); };

  document.addEventListener("pointermove",e=>{
    if(e.pointerType!=="mouse") return;
    px=e.clientX; py=e.clientY; moved=true;
    if(!seen){ seen=true; hx=px; hy=py; }
    halo.classList.add("on");
    if(dirty) measure();
    wake();
  },{passive:true});

  function setMode(m){
    if(m===mode) return;
    halo.classList.remove(mode||"_"); mode=m; if(m) halo.classList.add(m);
  }
  document.addEventListener("pointerover",e=>{
    if(e.pointerType!=="mouse") return;
    const t=e.target, pc=t.closest("a.pcard");
    if(pc!==hov) hoverCard(pc);
    setMode(t.closest("#bcard")?"gold":t.closest(LINK_SEL)?"link":"");
    const s=t.closest(SPOT_SEL);
    if(s!==lit){ if(lit) lit.classList.remove("fx-lit"); lit=s; if(s){ s.classList.add("fx-lit"); moved=true; wake(); } }
  },{passive:true});
  document.addEventListener("pointerout",e=>{
    if(e.relatedTarget) return;
    halo.classList.remove("on"); setMode("");
    if(lit){ lit.classList.remove("fx-lit"); lit=null; }
    hoverCard(null);
    px=py=-999; moved=true; wake();
  },{passive:true});
  addEventListener("blur",()=>halo.classList.remove("on"));
  document.addEventListener("pointerdown",e=>{ if(e.pointerType==="mouse") halo.classList.add("down"); },{passive:true});
  const up=()=>halo.classList.remove("down");
  document.addEventListener("pointerup",up,{passive:true});
  document.addEventListener("pointercancel",up,{passive:true});

  // The halo can't sit above a modal dialog's top layer, so it steps aside while one is open.
  if(pd) new MutationObserver(()=>{ halo.classList.toggle("off",pd.open); if(pd.open) hoverCard(null); markDirty(); }).observe(pd,{attributes:true,attributeFilter:["open"]});

  /* Project covers: tilt toward the pointer with a glare, and after PV_DELAY of hovering page through
     the project's shots (or play its preview video, if one is set). Layers are added on the first hover,
     so nothing extra loads until then; applyLang re-renders the strip, and the next hover adds them again. */
  let hov=null, pvTimer=0;
  const tilts=new Map();                  // cover → tilt state, kept until it settles back flat
  function layersOf(card){
    const cover=card.querySelector(".pcover");
    if(!cover) return null;
    if(!cover.querySelector(".fx-pv")){
      const p=PROJECTS[+card.dataset.p]; if(!p) return null;
      const pv=document.createElement("div"); pv.className="fx-pv"; pv.setAttribute("aria-hidden","true");
      if(p.preview && /\.(mp4|webm)(\?|$)/i.test(p.preview)){
        const v=document.createElement("video");
        v.muted=true; v.loop=true; v.playsInline=true; v.preload="none"; v.src=p.preview;
        pv.append(v);
      } else {
        for(const s of p.shots){
          if(s[0]===p.cover) continue;
          const im=document.createElement("img");
          im.alt=""; im.decoding="async"; im.src=IMG[s[0]];
          pv.append(im);
        }
      }
      const gl=document.createElement("div"); gl.className="fx-glare"; gl.setAttribute("aria-hidden","true"); gl.innerHTML="<i></i>";
      cover.append(pv,gl);
    }
    return cover;
  }
  function hoverCard(card){
    if(hov) stopPreview(hov);
    hov=card||null;
    if(!hov) return;
    const cover=layersOf(hov); if(!cover) { hov=null; return; }
    if(!tilts.has(cover)) tilts.set(cover,{x:0,y:0,glare:cover.querySelector(".fx-glare i")});
    const s=tilts.get(cover);
    s.ox=cover.offsetLeft; s.oy=cover.offsetTop; s.w=cover.offsetWidth; s.h=cover.offsetHeight;
    cover.classList.add("fx-tl");
    clearTimeout(pvTimer); pvTimer=setTimeout(()=>startPreview(hov),PV_DELAY);
    wake();
  }
  function startPreview(card){
    const pv=card&&card.querySelector(".fx-pv"); if(!pv || card!==hov) return;
    const v=pv.querySelector("video");
    if(v){ v.play().then(()=>{ if(card===hov) v.classList.add("on"); }).catch(()=>{}); return; }
    const slides=[...pv.children], cw=pv.offsetWidth, ch=pv.offsetHeight;
    let i=-1, z=0, prev=null;
    const next=()=>{
      // skip shots that haven't loaded yet; if none has, try again on the next tick
      for(let k=0;k<slides.length;k++){
        const im=slides[(i+1+k)%slides.length];
        if(!im.complete || !im.naturalWidth) continue;
        i=slides.indexOf(im);
        const tall=im.naturalHeight/im.naturalWidth>ch/cw*1.15;
        im.classList.toggle("tall",tall);
        if(im.kb) im.kb.cancel();
        im.kb=im.animate(tall
          ? [{transform:"translateY(0)"},{transform:`translateY(${(-(1-ch/(cw*im.naturalHeight/im.naturalWidth))*100).toFixed(2)}%)`}]
          : [{transform:"scale(1)"},{transform:`scale(${PV_ZOOM})`}],
          {duration:PV_SLIDE+PV_FADE, easing:tall?"ease-in-out":"linear", fill:"both"});
        im.style.zIndex=++z; im.classList.add("on");
        if(prev && prev!==im){ const p=prev; setTimeout(()=>{ if(p!==slides[i]) p.classList.remove("on"); },PV_FADE); }
        prev=im;
        break;
      }
      pvTimer=setTimeout(next,i<0?150:PV_SLIDE);
    };
    next();
  }
  function stopPreview(card){
    clearTimeout(pvTimer);
    const pv=card.querySelector(".fx-pv"), cover=card.querySelector(".pcover");
    if(cover) cover.classList.remove("fx-tl");
    if(!pv) return;
    const on=[...pv.querySelectorAll(".on")];
    on.forEach(el=>el.classList.remove("on"));
    // after the fade back to the cover, rewind
    setTimeout(()=>on.forEach(el=>{
      if(el.classList.contains("on")) return;
      if(el.kb){ el.kb.cancel(); el.kb=null; }
      if(el.tagName==="VIDEO"){ el.pause(); el.currentTime=0; }
    }),PV_FADE);
  }

  const docX=b=>px+(b.f?0:sX), docY=b=>py+(b.f?0:sY);
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;

  function frame(){
    raf=0;
    let busy=false;

    // halo
    hx+=(px-hx)*HALO_LERP; hy+=(py-hy)*HALO_LERP;
    if(Math.abs(px-hx)+Math.abs(py-hy)>.2) busy=true; else { hx=px; hy=py; }
    halo.style.transform=`translate3d(${hx.toFixed(1)}px,${hy.toFixed(1)}px,0)`;

    // magnets: pull toward the pointer inside MAG_R of the edge, spring back outside
    for(const m of mags){
      const b=m.b, s=m.s; let tx=0, ty=0;
      if(b.ok && px>-999){
        const x=docX(b), y=docY(b), cx=b.l+b.w/2, cy=b.t+b.h/2;
        const ex=Math.max(0,Math.abs(x-cx)-b.w/2), ey=Math.max(0,Math.abs(y-cy)-b.h/2), d=Math.hypot(ex,ey);
        if(d<MAG_R){
          const f=1-d/MAG_R, k=f*f*(3-2*f)*MAG_MAX;
          tx=clamp((x-cx)/(b.w/2+MAG_R),-1,1)*k; ty=clamp((y-cy)/(b.h/2+MAG_R),-1,1)*k;
        }
      }
      s.vx=(s.vx+(tx-s.x)*SPRING_K)*SPRING_D; s.vy=(s.vy+(ty-s.y)*SPRING_K)*SPRING_D;
      s.x+=s.vx; s.y+=s.vy;
      const rest=Math.abs(tx-s.x)+Math.abs(ty-s.y)+Math.abs(s.vx)+Math.abs(s.vy)<.02;
      if(rest){ s.x=tx; s.y=ty; s.vx=s.vy=0; } else busy=true;
      if(s.x===s.px && s.y===s.py) continue;
      s.px=s.x; s.py=s.y;
      const still=!s.x && !s.y;
      m.el.style.translate=still?"":`${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
      if(m.icon) m.icon.style.translate=still?"":`${(s.x*(MAG_ICON-1)).toFixed(2)}px ${(s.y*(MAG_ICON-1)).toFixed(2)}px`;
    }

    // spotlight follows the pointer exactly; the fade in/out is CSS
    if(lit && moved){
      const b=spots.get(lit);
      if(b){
        const s=springs.get(lit);
        lit.style.setProperty("--mx",(docX(b)-b.l-(s?s.x:0)).toFixed(0)+"px");
        lit.style.setProperty("--my",(docY(b)-b.t-(s?s.y:0)).toFixed(0)+"px");
      }
    }

    // project covers lean toward the pointer, measured against the card's cached box
    for(const [cover,s] of tilts){
      let tx=0, ty=0;
      const card=cover.parentNode, b=card===hov&&px>-999&&spots.get(card);
      if(b){ tx=clamp((docX(b)-b.l-s.ox)/s.w*2-1,-1,1); ty=clamp((docY(b)-b.t-s.oy)/s.h*2-1,-1,1); }
      s.x+=(tx-s.x)*PV_LERP; s.y+=(ty-s.y)*PV_LERP;
      if(Math.abs(tx-s.x)+Math.abs(ty-s.y)<.003){
        s.x=tx; s.y=ty;
        if(!b){ cover.style.transform=""; s.glare.style.transform=""; tilts.delete(cover); continue; }
      } else busy=true;
      cover.style.transform=`perspective(${PV_PERSP}px) rotateX(${(-s.y*PV_TILT).toFixed(2)}deg) rotateY(${(s.x*PV_TILT).toFixed(2)}deg)`;
      s.glare.style.transform=`translate(${(s.x*25).toFixed(2)}%,${(s.y*25).toFixed(2)}%)`;
    }

    // gold: anywhere over the hero; same mapping as script.js inside the card so there's no jump
    if(hero && scene){
      const x=docX(hero), y=docY(hero);
      const inHero=px>-999 && x>=hero.l && x<=hero.l+hero.w && y>=hero.t && y<=hero.t+hero.h;
      const target=inHero ? 15+clamp(.5+(x-scene.l-scene.w/2)/scene.w,-.4,1.4)*60 : GOLD_REST;
      if(inHero || goldOn){
        gold+=(target-gold)*GOLD_LERP;
        goldOn=Math.abs(target-gold)>.05 || inHero;
        if(!goldOn) gold=target;
        tilt.style.setProperty("--sx",gold.toFixed(2));
        if(Math.abs(target-gold)>.05) busy=true;
      }
    }

    // auras lean slightly toward the pointer
    {
      const tx=px>-999?(px-vw/2)*AURA_SHIFT:0, ty=px>-999?(py-vh/2)*AURA_SHIFT:0;
      if(Math.abs(tx-ax)+Math.abs(ty-ay)>.05){
        ax+=(tx-ax)*AURA_LERP; ay+=(ty-ay)*AURA_LERP; busy=true;
        auraIn.style.transform=`translate3d(${ax.toFixed(2)}px,${ay.toFixed(2)}px,0)`;
      }
    }

    // depth: follow the tilt script.js writes into #tilt (inline style, not layout) and
    // shift each layer by h·sin(angle), as a point h px above the card plane would move
    {
      const tRx=parseFloat(tilt.style.getPropertyValue("--rx"))||0, tRy=parseFloat(tilt.style.getPropertyValue("--ry"))||0;
      if(Math.abs(tRx-rx)+Math.abs(tRy-ry)>.01){
        const k=tilt.classList.contains("tilting")?TILT_IN:TILT_OUT;
        rx+=(tRx-rx)*k; ry+=(tRy-ry)*k; busy=true;
        if(Math.abs(tRx-rx)+Math.abs(tRy-ry)<=.01){ rx=tRx; ry=tRy; }
        const sx=Math.sin(ry*Math.PI/180), sy=-Math.sin(rx*Math.PI/180);
        for(const l of layers) l.el.style.translate=`${(sx*l.h).toFixed(2)}px ${(sy*l.h).toFixed(2)}px`;
        // the shadow lies below the card, so it slides the other way and spreads as the tilt grows
        const m=Math.min(1,Math.hypot(sx,sy)/.17);
        shadow.style.translate=`${(-sx*SHADOW_H).toFixed(2)}px ${(-sy*SHADOW_H).toFixed(2)}px`;
        soft.style.transform=`scale(${(1+m*.08).toFixed(3)})`;
        contact.style.opacity=(1-m*.55).toFixed(3);
      }
    }

    moved=false;
    if(busy) raf=requestAnimationFrame(frame);
  }
})();
