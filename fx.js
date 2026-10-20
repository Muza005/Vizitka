/* Decorative motion for the page.
   Every device: hero auras, a ground shadow under the card and slow floating (CSS, off under reduced motion).
   Fine pointer only: cursor halo, magnetic buttons, spotlight cards, hero-wide gold, card depth parallax.
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
  const RV_BLOCKS=".sec-head,#strip,.price-group,.terms,.steps-title,#steps,.contact > div:first-child,.clist";
  const RV_ITEMS=".sec-head p,#strip > *,.price-group > *,.terms > *,#steps > li,.contact .lead,.contact .tg,.clist > li";
  const RV_HEADS=".sec-head h2,.steps-title,.contact h2";
  const RV_STEP=70, RV_WORD=55, RV_AFTER_WORDS=140, RV_MAX_I=8, RV_DUR=900; // ms
  const COUNT_DUR=1100;                   // price count-up, ms
  const PIN_FADE=.82, PIN_SAMPLES=24;     // card fades into the logo after this share of the flight
  const MORPH_WAIT=300;                   // how long the card → dialog morph waits for the first frame to decode, ms

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
      b.querySelectorAll(".pprice").forEach((el,i)=>countUp(el,base+(i+1)*RV_STEP+120));
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

  // Count a price up from 0 in the same format fmtPrice produced. Screen readers get the final text right away,
  // the moving copy is aria-hidden and keeps the final width so nothing around it shifts.
  function countUp(el,delay){
    const final=el.textContent, m=final.match(/\d+(?:[.,]\d+)?/); if(!m) return;
    const dec=(m[0].split(/[.,]/)[1]||"").length, sep=m[0].includes(",")?",":".", to=parseFloat(m[0].replace(",","."));
    const group=s=>s.replace(/^\d+/,d=>d.replace(/\B(?=(\d{3})+(?!\d))/g," "));
    const fmt=v=>final.slice(0,m.index)+group(v.toFixed(dec).replace(".",sep))+final.slice(m.index+m[0].length);
    const w=el.getBoundingClientRect().width;
    el.innerHTML=`<span class="fx-sr"></span><span class="fx-num" aria-hidden="true" style="min-width:${w.toFixed(1)}px"></span>`;
    el.firstChild.textContent=final;
    const vis=el.lastChild; vis.textContent=fmt(0);
    let t0=0;
    const tick=now=>{
      if(!el.isConnected) return;
      if(!t0) t0=now;
      const t=Math.min(1,(now-t0)/COUNT_DUR);
      if(t<1){ vis.textContent=fmt(to*(1-Math.pow(1-t,3))); requestAnimationFrame(tick); }
      else el.textContent=final;
    };
    setTimeout(()=>requestAnimationFrame(tick),delay);
  }

  // Steps line: CSS scroll-driven animation where supported, otherwise --fx-p from scroll
  const steps=document.getElementById("steps");
  if(io && steps && !(window.CSS && CSS.supports("animation-timeline: view()"))){
    let raf=0;
    const upd=()=>{ raf=0; const r=steps.getBoundingClientRect(), vh=innerHeight;
      steps.style.setProperty("--fx-p",Math.max(0,Math.min(1,(vh*.88-r.top)/(vh*.5))).toFixed(3)); };
    addEventListener("scroll",()=>{ if(!raf) raf=requestAnimationFrame(upd); },{passive:true});
    upd();
  }

  /* ---------- pinned card: flies from the hero into the header logo as you scroll ---------- */
  // The card stays in the layout (no shift); only .scene gets transform/opacity. Its keyframes are sampled
  // over scroll offsets and bound to a ScrollTimeline, so the browser runs it with the scroll; where that API
  // is missing the same pose() is applied from a rAF on scroll.
  const mark=document.querySelector(".brand-mark"), topBar=document.querySelector(".top");
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
      g.max=Math.max(g.s1+1,document.documentElement.scrollHeight-vh);
    }
    const progress=s=>Math.max(0,Math.min(1,(s-g.s0)/(g.s1-g.s0)));
    function pose(s){
      const p=progress(s), e=ease(p);
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
      scrollTo({top:0,behavior:"smooth"});
    },true);
    const brand=mark.closest("a");
    if(brand) brand.addEventListener("click",e=>{ e.preventDefault(); scrollTo({top:0,behavior:"smooth"}); });
  }

  /* ---------- project card ⇄ dialog: the cover morphs into the first gallery frame and back ---------- */
  // script.js calls fxMorph.open/close first; false means "not here", and it plays pdIn/pdOut as before.
  // view-transition-name is set only for the length of a transition.
  const pd=document.getElementById("pd");
  if(!REDUCED && pd && document.startViewTransition){
    let vt=null, kind="";
    const named=(el,n)=>{ if(el) el.style.viewTransitionName=n||""; };
    const inView=el=>{ const r=el.getBoundingClientRect(); return r.width>0 && r.bottom>0 && r.top<innerHeight && r.right>0 && r.left<innerWidth; };
    const coverOf=pi=>document.querySelector(`#strip a.pcard[data-p="${pi}"] .pcover`);
    const ready=img=>Promise.race([img.decode().catch(()=>{}),new Promise(r=>setTimeout(r,MORPH_WAIT))]);
    const run=(k,update,cleanup)=>{
      kind=k; root.classList.add("fx-vt");
      vt=document.startViewTransition(update);
      vt.finished.finally(()=>{ cleanup(); root.classList.remove("fx-vt"); vt=null; kind=""; });
    };
    window.fxMorph={
      open(pi,opener){
        const cover=opener&&opener.querySelector(".pcover");
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
        cur.opener=cover.closest("a");
        named(shot,"fx-shot"); named(pd,"fx-pd");
        run("close",()=>{ named(shot); named(pd); finishClose(); named(cover,"fx-shot"); },()=>named(cover));
        return true;
      }
    };
    pd.addEventListener("close",()=>pd.classList.remove("fx-morphed"));
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
  addEventListener("scroll",()=>{ sX=scrollX; sY=scrollY; moved=true; wake(); },{passive:true});

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
