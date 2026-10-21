/* WebGL business card (Three.js), loaded by fx.js with import() once the page is idle, and only where it runs well.
   The DOM card stays as the source of text, for accessibility and clicks/keys, and as the fallback: its faces just fade out.
   It also keeps driving every motion (tilt, floating and flip are CSS/WAAPI on #tilt and #bcard); each frame
   reads their current transforms and poses the mesh the same way, so amplitudes and trajectories match exactly. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const PERSPECTIVE=1400;              // px, the same as .scene in styles.css
const PAD_X=.14, PAD_Y=.26;          // canvas overhang around the card, share of its size (room for tilt and flip)
const THICK=.6/85;                   // card stock: 0.6 mm on an 85 mm card
const BEVEL=.35, RADIUS=16;          // px; RADIUS matches .face border-radius
// Supersampling: render at SSAA× the screen resolution (up to MAX_RATIO× CSS px) and let the browser scale it down.
// With MSAA ×4 on top that is 16 samples a pixel, so nearly straight edges don't crawl in stair steps as the card moves.
const SSAA=2, MAX_RATIO=3;
const TEX_MAX=2048;                  // textures match the render resolution, capped in width
const EXPOSURE=1, ENV_LIGHT=.45;     // tone mapping exposure, RoomEnvironment strength
const BASE_ROUGH=.5, FOIL_ROUGH=.36, FOIL_METAL=.8, ROSETTE_METAL=.2; // FOIL_METAL < 1 keeps some printed gold when the foil faces away from the light // front: card stock under lacquer, gold foil
const CLEARCOAT=.2, CLEARCOAT_ROUGH=.34, SPECULAR=.1; // SPECULAR: dielectric reflection of the stock (metal is unaffected)
const BACK_ROUGH=.62, BACK_LIGHT=1.8, EDGE_COLOR=0xEEF1FA; // BACK_LIGHT: white paper needs more light than the lacquered front
const GLINT=.15, GLINT_HOVER=.7, GLINT_Z=360, GLINT_LERP=.12; // cursor light on the foil: intensity at rest / hovered, height above the card (px)
const K_FRONT=1.7, K_BACK=2.8;            // light at rest, for the inverse tone curve below (calibrated against the CSS card)
const SWAP_SCALE=.97;                // pinned card (stage 3): below this scale the DOM mini card takes over

const S=new THREE.Matrix4().makeScale(1,-1,1); // CSS y points down

/* ACES (three's fit) washes out saturated blues and greys the whites, and no exposure fits both. So the printed
   colours go through its exact inverse first, divided by the light the card gets at rest (K, calibrated against the
   CSS card): at rest they land on the CSS colours, while tilting, lacquer and the glint still light them physically.
   Metal (the foil) is left as is. */
const ACES_IN=new THREE.Matrix3().fromArray([.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777]);
const ACES_OUT=new THREE.Matrix3().fromArray([1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602]);
function untoned(mat,k){
  const uK={value:k}; mat.userData.uK=uK;
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,{vzInInv:{value:ACES_IN.clone().invert()},vzOutInv:{value:ACES_OUT.clone().invert()},vzK:uK});
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>",`#include <common>
uniform mat3 vzInInv, vzOutInv; uniform float vzK;
vec3 vzUntone(vec3 t){
  vec3 v=clamp(vzOutInv*t,0.,1.);
  vec3 a=1.-v*.983729, b=.0245786-v*.432951, c=-(.000090537+v*.238081);
  return max(vzInInv*((-b+sqrt(b*b-4.*a*c))/(2.*a)),0.)/vzK;
}`).replace("#include <metalnessmap_fragment>",`#include <metalnessmap_fragment>
diffuseColor.rgb=mix(vzUntone(diffuseColor.rgb),diffuseColor.rgb,metalnessFactor);`);
  };
  mat.customProgramCacheKey=()=>"vz-untoned";
  return mat;
}

export async function mount(sceneEl){
  const tilt=sceneEl.querySelector("#tilt"), card=sceneEl.querySelector("#bcard");
  const front=card.querySelector(".front"), back=card.querySelector(".back");
  const canvas=document.createElement("canvas");
  canvas.className="fx-3d-canvas"; canvas.setAttribute("aria-hidden","true");

  let renderer;
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
  }catch(e){ return null; }        // no WebGL2: the CSS card stays
  renderer.setPixelRatio(Math.min((devicePixelRatio||1)*SSAA,MAX_RATIO));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=EXPOSURE;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0,0);

  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(30,1,50,5000);
  camera.position.set(0,0,PERSPECTIVE);
  let env=null;                     // RoomEnvironment through PMREM, made during init below
  scene.environmentIntensity=ENV_LIGHT;
  const glint=new THREE.PointLight(0xFFF1D6,GLINT,0,0);
  scene.add(glint);

  // textures: front colour, front metal/rough mask (G = roughness, B = metalness), back colour
  const cvFront=document.createElement("canvas"), cvMask=document.createElement("canvas"), cvBack=document.createElement("canvas");
  const texFront=new THREE.CanvasTexture(cvFront), texMask=new THREE.CanvasTexture(cvMask), texBack=new THREE.CanvasTexture(cvBack);
  texFront.colorSpace=texBack.colorSpace=THREE.SRGBColorSpace;   // the mask is data and stays linear
  const aniso=renderer.capabilities.getMaxAnisotropy();
  for(const t of [texFront,texMask,texBack]) t.anisotropy=aniso;

  const matFront=untoned(new THREE.MeshPhysicalMaterial({map:texFront,metalnessMap:texMask,roughnessMap:texMask,metalness:1,roughness:1,
    clearcoat:CLEARCOAT,clearcoatRoughness:CLEARCOAT_ROUGH,specularIntensity:SPECULAR}),K_FRONT);
  const matBack=untoned(new THREE.MeshPhysicalMaterial({map:texBack,roughness:BACK_ROUGH,metalness:0,clearcoat:.1,clearcoatRoughness:.4,specularIntensity:.15,envMapIntensity:ENV_LIGHT*BACK_LIGHT}),K_BACK);
  const matEdge=new THREE.MeshPhysicalMaterial({color:EDGE_COLOR,roughness:.75,metalness:0,envMapIntensity:ENV_LIGHT*BACK_LIGHT});

  const pivot=new THREE.Group(); pivot.matrixAutoUpdate=false;
  scene.add(pivot);
  let geos=[], W=0, H=0;

  function rounded(w,h,r){
    const s=new THREE.Shape(), x=w/2, y=h/2;
    s.moveTo(-x+r,-y); s.lineTo(x-r,-y); s.absarc(x-r,-y+r,r,-Math.PI/2,0);
    s.lineTo(x,y-r); s.absarc(x-r,y-r,r,0,Math.PI/2);
    s.lineTo(-x+r,y); s.absarc(-x+r,y-r,r,Math.PI/2,Math.PI);
    s.lineTo(-x,-y+r); s.absarc(-x+r,-y+r,r,Math.PI,Math.PI*1.5);
    return s;
  }
  function build(){
    pivot.clear(); geos.forEach(g=>g.dispose());
    W=card.offsetWidth; H=card.offsetHeight;
    const T=Math.max(1.2,W*THICK), b=BEVEL, shape=rounded(W-2*b,H-2*b,RADIUS-b);
    // body: rounded slab with a small bevel; its caps sit under the two printed faces, so it only shows as the edge
    const body=new THREE.ExtrudeGeometry(shape,{depth:T-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:12});
    body.translate(0,0,-(T-2*b)/2);
    // the printed faces cover the whole outline, bevel included: the light edge shows only where the card turns
    // its side to you (a sub-pixel rim around the face would break up into flickering dots)
    const face=new THREE.ShapeGeometry(rounded(W,H,RADIUS),12), uv=face.attributes.uv, pos=face.attributes.position;
    for(let i=0;i<uv.count;i++) uv.setXY(i,(pos.getX(i)+W/2)/W,(pos.getY(i)+H/2)/H);
    const f=new THREE.Mesh(face,matFront); f.position.z=T/2+.05;
    const k=new THREE.Mesh(face,matBack); k.rotation.y=Math.PI; k.position.z=-T/2-.05;
    pivot.add(new THREE.Mesh(body,matEdge),f,k);
    geos=[body,face];

    const cw=Math.round(W*(1+2*PAD_X)), ch=Math.round(H*(1+2*PAD_Y));
    canvas.style.cssText=`width:${cw}px;height:${ch}px;left:${(W-cw)/2}px;top:${(H-ch)/2}px`;
    renderer.setSize(cw,ch,false);
    camera.aspect=cw/ch; camera.fov=2*Math.atan(ch/2/PERSPECTIVE)*180/Math.PI;
    camera.updateProjectionMatrix();
    paint();
  }

  /* ---------- textures, drawn from the DOM card in its current language ---------- */
  const css=(el,p)=>getComputedStyle(el).getPropertyValue(p).trim();
  // CSS linear-gradient(<deg>) over a box, as a canvas gradient
  function grad(c,x,y,w,h,deg,stops){
    const a=deg*Math.PI/180, dx=Math.sin(a), dy=-Math.cos(a), L=Math.abs(w*dx)+Math.abs(h*dy), cx=x+w/2, cy=y+h/2;
    const g=c.createLinearGradient(cx-dx*L/2,cy-dy*L/2,cx+dx*L/2,cy+dy*L/2);
    stops.forEach(([o,col])=>g.addColorStop(o,col));
    return g;
  }
  function pos(el,face){ let x=0,y=0; for(let e=el;e&&e!==face;e=e.offsetParent){ x+=e.offsetLeft; y+=e.offsetTop; } return [x,y]; }
  function alpha(el,face){ let a=1; for(let e=el;e&&e!==face;e=e.parentElement) a*=parseFloat(getComputedStyle(e).opacity)||0; return a; }
  // text laid out like the DOM: the element's font, letter spacing and line height, wrapped at its width
  // (NBSP stays inside words, as in the page)
  function lines(c,el,text,x,y,w){
    const cs=getComputedStyle(el);
    c.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    c.letterSpacing=cs.letterSpacing==="normal"?"0px":cs.letterSpacing;
    const m=c.measureText("Hg"), asc=m.fontBoundingBoxAscent, desc=m.fontBoundingBoxDescent;
    const lh=cs.lineHeight==="normal"?asc+desc:parseFloat(cs.lineHeight);
    const out=[]; let line="";
    for(const word of text.trim().split(/[ \t\n]+/)){
      const t=line?line+" "+word:word;
      if(line && c.measureText(t).width>w+1){ out.push(line); line=word; } else line=t;
    }
    if(line) out.push(line);
    return out.map((t,i)=>({t,x,y:y+i*lh+(lh-asc-desc)/2+asc,font:c.font,ls:c.letterSpacing,color:cs.color}));
  }
  function frontText(c){
    const items=[];
    const add=(el,text,x,y,w,extra)=>{ if(el) items.push({runs:lines(c,el,text,x,y,w),alpha:alpha(el,front),el,...extra}); };
    for(const sel of [".bc-city",".bc-name",".bc-role"]){
      const el=front.querySelector(sel); if(!el) continue;
      const [x,y]=pos(el,front);
      add(el,el.textContent,x,y,el.clientWidth,{foil:sel===".bc-name"});
    }
    front.querySelectorAll(".bc-lines span").forEach(span=>{
      const b=span.querySelector("b"), [x,y]=pos(span,front);
      if(b){ const [bx,by]=pos(b,front); add(b,b.textContent,bx,by,span.clientWidth+999); }
      const val=[...span.childNodes].filter(n=>n!==b).map(n=>n.textContent).join("");
      const vy=b?pos(b,front)[1]+b.offsetHeight:y;
      add(span,val,x,vy,span.clientWidth+999,{alpha:alpha(span,front)});
    });
    return items;
  }
  function draw(c,runs,fill){
    for(const r of runs){ c.font=r.font; c.letterSpacing=r.ls; c.fillStyle=fill||r.color; c.fillText(r.t,r.x,r.y); }
  }
  function size(cv,face){
    const w=face.offsetWidth, h=face.offsetHeight;
    const s=Math.min(TEX_MAX/w,renderer.getPixelRatio());
    cv.width=Math.round(w*s); cv.height=Math.round(h*s);
    const c=cv.getContext("2d"); c.setTransform(s,0,0,s,0,0); c.textBaseline="alphabetic";
    return [c,s,w,h];
  }
  function paint(){
    // front colour: the CSS gradient, the shared guilloche, then the text; the name in its gold gradient
    let [c,s,w,h]=size(cvFront,front);
    c.fillStyle=grad(c,0,0,w,h,140,[[0,css(front,"--card-a")],[1,css(front,"--card-b")]]);
    c.fillRect(0,0,w,h);
    c.save(); c.setTransform(1,0,0,1,0,0);
    if(typeof paintGuilloche==="function") paintGuilloche(c,cvFront.width,cvFront.height,Math.max(.6,.55*s));
    c.restore();
    const items=frontText(c);
    for(const it of items){
      c.globalAlpha=it.alpha;
      if(it.foil){
        const [x,y]=pos(it.el,front);
        draw(c,it.runs,grad(c,x,y,it.el.offsetWidth,it.el.offsetHeight,100,[[0,"#B7822A"],[.4,"#F8DD98"],[.62,"#C9952F"],[1,"#F3D27F"]]));
      } else draw(c,it.runs);
    }
    c.globalAlpha=1;

    // mask: lacquered stock everywhere, polished metal under the name and the rosette
    const m=size(cvMask,front)[0], base=`rgb(0,${Math.round(BASE_ROUGH*255)},0)`, foil=`rgb(0,${Math.round(FOIL_ROUGH*255)},${Math.round(FOIL_METAL*255)})`;
    m.fillStyle=base; m.fillRect(0,0,w,h);
    for(const it of items) if(it.foil) draw(m,it.runs,foil);
    m.save(); m.setTransform(1,0,0,1,0,0);
    if(typeof paintGuilloche==="function") paintGuilloche(m,cvMask.width,cvMask.height,Math.max(.6,.55*s),"rosette",`rgb(0,${Math.round(FOIL_ROUGH*255)},${Math.round(ROSETTE_METAL*255)})`);
    m.restore();

    // back: paper, the QR from the page's own SVG path, the handle and the hint
    [c,s,w,h]=size(cvBack,back);
    c.fillStyle=getComputedStyle(back).backgroundColor; c.fillRect(0,0,w,h);
    const svg=back.querySelector("svg"), path=svg&&svg.querySelector("path");
    if(path){
      const q=parseFloat(getComputedStyle(svg).width), bs=getComputedStyle(back), vb=svg.viewBox.baseVal;
      c.save();
      c.translate(parseFloat(bs.paddingLeft),(h-q)/2); c.scale(q/vb.width,q/vb.height); c.translate(-vb.x,-vb.y);
      const r=svg.querySelector("rect");
      if(r){ c.fillStyle=r.getAttribute("fill")||"#fff"; c.beginPath(); c.roundRect(+r.getAttribute("x"),+r.getAttribute("y"),+r.getAttribute("width"),+r.getAttribute("height"),+(r.getAttribute("rx")||0)); c.fill(); }
      c.fillStyle=getComputedStyle(svg).color; c.fill(new Path2D(path.getAttribute("d")));
      c.restore();
    }
    for(const el of back.querySelectorAll("strong,p")){
      const [x,y]=pos(el,back);
      c.globalAlpha=alpha(el,back); draw(c,lines(c,el,el.textContent,x,y,el.clientWidth));
    }
    c.globalAlpha=1;
    for(const t of [texFront,texMask,texBack]) t.needsUpdate=true;
  }

  /* ---------- pose: the DOM card's current transforms, composed the way CSS does ---------- */
  const tmp=new THREE.Matrix4();
  function cssMatrix(){
    const cs=getComputedStyle(tilt), cc=getComputedStyle(card), m=new DOMMatrix();
    // individual transform properties go first (translate, rotate, scale), then transform
    if(cs.translate!=="none"){ const p=cs.translate.split(" "); m.multiplySelf(new DOMMatrix(`translate3d(${p[0]},${p[1]||"0px"},${p[2]||"0px"})`)); }
    if(cs.rotate!=="none"){
      const p=cs.rotate.split(" ");
      m.multiplySelf(new DOMMatrix(p.length===1?`rotate(${p[0]})`:p.length===2?`rotate${p[0].toUpperCase()}(${p[1]})`:`rotate3d(${p.slice(0,3).join(",")},${p[3]})`));
    }
    if(cs.scale!=="none"){ const p=cs.scale.split(" "); m.multiplySelf(new DOMMatrix(`scale3d(${p[0]},${p[1]||p[0]},${p[2]||1})`)); }
    if(cs.transform!=="none") m.multiplySelf(new DOMMatrix(cs.transform));
    if(cc.transform!=="none") m.multiplySelf(new DOMMatrix(cc.transform));
    return {m,sx:parseFloat(cc.getPropertyValue("--sx"))||40,gy:parseFloat(cs.getPropertyValue("--gy"))||20,glow:parseFloat(cs.getPropertyValue("--glow"))||0};
  }
  let gx=0, gy=0, gi=GLINT;
  function frame(){
    const {m,sx,gy:py,glow}=cssMatrix();
    tmp.fromArray(m.toFloat32Array());
    pivot.matrix.copy(S).multiply(tmp).multiply(S);
    pivot.matrixWorldNeedsUpdate=true;
    // the glint runs with the same --sx the CSS gold gradient uses (pointer across the hero, and the flip),
    // and with the pointer's height over the card while it's there, like the CSS glow
    gx+=(((sx-45)/40)*W*.9-gx)*GLINT_LERP; gy+=((glow>.5?(.5-py/100)*H:H*.35)-gy)*GLINT_LERP;
    gi+=((glow>.5?GLINT_HOVER:GLINT)-gi)*GLINT_LERP;
    glint.position.set(gx,gy,GLINT_Z); glint.intensity=gi;
    renderer.render(scene,camera);
  }

  /* ---------- lifecycle ---------- */
  let inView=true, pinned=false, running=false, dead=false;
  const sync=()=>{
    const go=!dead && inView && !pinned && !document.hidden;
    if(go!==running){ running=go; renderer.setAnimationLoop(go?frame:null); }
  };
  const io=new IntersectionObserver(([e])=>{ inView=e.isIntersecting; sync(); });
  // while the card flies into the header (stage 3), the DOM mini card takes over
  let sr=0;
  const onScroll=()=>{ if(!sr) sr=requestAnimationFrame(()=>{
    sr=0;
    const t=getComputedStyle(sceneEl).transform, k=t==="none"?1:new DOMMatrix(t).a;
    const p=k<SWAP_SCALE;
    if(p!==pinned){ pinned=p; sceneEl.classList.toggle("fx-3d",!p); if(!p) frame(); sync(); }
  }); };
  const onVis=()=>sync();
  let bt=0;
  const rebuild=()=>{ clearTimeout(bt); bt=setTimeout(()=>{ if(dead) return; build(); frame(); },150); };
  // the language switch fades the card's text out and back in (WAAPI), so paint once that has finished
  const textSettled=async()=>{
    for(let i=0;i<5;i++){
      const a=card.getAnimations({subtree:true}).filter(x=>x.effect && x.effect.target!==card && !x.effect.target.classList.contains("face"));
      if(!a.length) return;
      await Promise.all(a.map(x=>x.finished.catch(()=>{})));
    }
  };
  const repaint=async()=>{
    if(document.fonts) await document.fonts.ready;
    await textSettled();
    if(!dead){ paint(); frame(); }
  };
  const ro=new ResizeObserver(()=>{ if(card.offsetWidth!==W || card.offsetHeight!==H) rebuild(); });
  const dark=matchMedia("(prefers-color-scheme: dark)");

  function dispose(){
    if(dead) return; dead=true;
    renderer.setAnimationLoop(null);
    io.disconnect(); ro.disconnect(); clearTimeout(bt); cancelAnimationFrame(sr);
    removeEventListener("scroll",onScroll); document.removeEventListener("visibilitychange",onVis);
    document.removeEventListener("vz:lang",repaint); document.removeEventListener("vz:theme",repaint);
    dark.removeEventListener("change",repaint);
    sceneEl.classList.remove("fx-3d");
    geos.forEach(g=>g.dispose());
    for(const x of [matFront,matBack,matEdge,texFront,texMask,texBack,env]) if(x) x.dispose();
    renderer.dispose();
    canvas.remove();
  }
  canvas.addEventListener("webglcontextlost",e=>{ e.preventDefault(); dispose(); });

  // init in separate tasks, so no single one blocks the page for long
  const yieldTask=()=>new Promise(r=>setTimeout(r,0));
  if(document.fonts) await document.fonts.ready;
  if(!card.offsetWidth){ dispose(); return null; }
  const parallel=renderer.extensions.has("KHR_parallel_shader_compile"); // compileAsync needs it (and warns without it)
  {
    const pmrem=new THREE.PMREMGenerator(renderer), room=new RoomEnvironment();
    if(parallel){ try{ await renderer.compileAsync(room,camera); }catch(e){} if(dead) return null; } // so PMREM doesn't compile them in one blocking go
    env=pmrem.fromScene(room,.04,.1,100,{size:128}).texture; // 128 is plenty for reflections on a flat card
    room.dispose(); pmrem.dispose();
    // back and edge take the environment explicitly: a material's envMapIntensity only applies then
    scene.environment=matBack.envMap=matEdge.envMap=env;
  }
  await yieldTask(); if(dead) return null;
  sceneEl.append(canvas);
  build();
  await yieldTask(); if(dead) return null;
  for(const t of [texFront,texMask,texBack]){ renderer.initTexture(t); await yieldTask(); }
  if(dead) return null;
  if(parallel){ try{ await renderer.compileAsync(scene,camera); }catch(e){} }
  else renderer.compile(scene,camera);
  await yieldTask();
  if(dead) return null;
  frame();
  // fade in on the next frame, so the first render is already on screen under the faces
  requestAnimationFrame(()=>{ if(!dead){ onScroll(); sceneEl.classList.toggle("fx-3d",!pinned); } });
  io.observe(sceneEl);
  ro.observe(card);
  addEventListener("scroll",onScroll,{passive:true});
  document.addEventListener("visibilitychange",onVis);
  document.addEventListener("vz:lang",repaint);
  document.addEventListener("vz:theme",repaint);
  dark.addEventListener("change",repaint);
  sync();
  return {dispose};
}
