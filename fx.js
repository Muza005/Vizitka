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

  // Guilloche moves to its own layer so it can sit deeper than the text
  const front=document.querySelector(".front");
  if(front){ const gl=document.createElement("i"); gl.className="fx-gl"; gl.setAttribute("aria-hidden","true"); front.prepend(gl); }

  // Nothing animates while the hero is off screen
  if(heroEl && "IntersectionObserver" in window)
    new IntersectionObserver(([e])=>heroEl.classList.toggle("fx-idle",!e.isIntersecting)).observe(heroEl);

  if(!fine) return;

  const HALO_LERP=.18;                    // halo follow per frame
  const MAG_SEL=".btn-primary,.btn-ghost,.icon-btn,.tg";
  const MAG_R=80, MAG_MAX=7, MAG_ICON=1.7; // reach from the edge (px), max shift (px), icon shift multiplier
  const SPRING_K=.16, SPRING_D=.74;       // magnet spring stiffness and damping
  const SPOT_SEL=".pcard,.tbox,.tg,.prow";
  const GOLD_LERP=.08, GOLD_REST=40;      // --sx easing and resting value
  const LINK_SEL="a,button,[role=button],label,input,select,textarea,summary";
  const OPEN={ru:"Открыть",uz:"Ochish",en:"Open"};

  root.classList.add("fx");

  const halo=document.createElement("div");
  halo.className="fx-cursor"; halo.setAttribute("aria-hidden","true");
  halo.innerHTML='<span class="fx-glow"></span><span class="fx-ring"></span><span class="fx-fill"></span>';
  const label=halo.querySelector(".fx-fill");
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
    hero=h&&box(h); scene=sc&&box(sc);
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
    if(m==="card") label.textContent=OPEN[root.lang]||OPEN.ru;
  }
  document.addEventListener("pointerover",e=>{
    if(e.pointerType!=="mouse") return;
    const t=e.target;
    setMode(t.closest("a.pcard")?"card":t.closest("#bcard")?"gold":t.closest(LINK_SEL)?"link":"");
    const s=t.closest(SPOT_SEL);
    if(s!==lit){ if(lit) lit.classList.remove("fx-lit"); lit=s; if(s){ s.classList.add("fx-lit"); moved=true; wake(); } }
  },{passive:true});
  document.addEventListener("pointerout",e=>{
    if(e.relatedTarget) return;
    halo.classList.remove("on"); setMode("");
    if(lit){ lit.classList.remove("fx-lit"); lit=null; }
    px=py=-999; moved=true; wake();
  },{passive:true});
  addEventListener("blur",()=>halo.classList.remove("on"));
  document.addEventListener("pointerdown",e=>{ if(e.pointerType==="mouse") halo.classList.add("down"); },{passive:true});
  const up=()=>halo.classList.remove("down");
  document.addEventListener("pointerup",up,{passive:true});
  document.addEventListener("pointercancel",up,{passive:true});

  // The halo can't sit above a modal dialog's top layer, so it steps aside while one is open.
  const pd=document.getElementById("pd");
  if(pd) new MutationObserver(()=>{ halo.classList.toggle("off",pd.open); markDirty(); }).observe(pd,{attributes:true,attributeFilter:["open"]});

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
