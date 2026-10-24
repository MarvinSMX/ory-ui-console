(()=>{var t={dotSize:3.5,dotPitch:9,maxAlpha:.53,washOpacity:.87,headScale:115,tailScale:155,trailLifeMs:900,headFollow:.2,warp:90,pointerWarp:.25,warpScale:.0028,warpSpeed:.105,shadeScale:.6,shadeSpeed:.1,shadeMin:.44,glowAlpha:.02,glowSigma:.65,glowScale:.4,glowSpeed:.06,glowThreshold:.35,glowSoftness:.6,glowFocus:2,glowBoost:.5,ambientStrength:.35,ambientScale:140,glyphLevel:.9,glyphAlpha:1,glyphShadeMin:.6,glyphGlowAlpha:.2,glyphGlowSigma:1.2,glyphGlowFloor:.35,clearPadding:6,clearFeather:120,clearCorner:24,clearPointerFloor:.35,wanderStrength:.8,wanderRise:.2,wanderScale:150,wanderLifeMinMs:6e3,wanderLifeMaxMs:1e4,wanderDrift:140},O=6,v=16,Le=32,w=4,_=4;function Pe(r){switch(r){case"vignette":return{wander:!0,intensity:1,rest:.333,shadeMin:.08,pointer:.2};case"ambient":return{wander:!0,intensity:.85,pointer:.2,rest:.2,shadeMin:.08};case"full":return{ambient:!0,wander:!0,intensity:1,pointer:1,rest:.32,shadeMin:.04,clearPointer:0};case"strong":return{ambient:!0,wander:!0,intensity:1.5,pointer:1.8,pointerSize:.95,pointerAspect:3.6,rest:.6,shadeMin:.04};case"pricing":default:return{ambient:!0,wander:!0,intensity:.6,pointer:1,rest:.25,shadeMin:.1,clearPointer:0}}}function Fe(){return t.shadeMin}function ve(){return t.clearPointerFloor}var we=`
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,be=`
precision highp float;
uniform sampler2D uGlyph;
uniform vec4 uGlyphRect;

#define PITCH ${t.dotPitch.toFixed(2)}
#define RADIUS ${(t.dotSize/2).toFixed(3)}
#define MAX_ALPHA ${t.maxAlpha.toFixed(3)}
#define HEAD ${t.headScale.toFixed(1)}
#define TAIL ${t.tailScale.toFixed(1)}
#define AMBIENT_SCALE ${t.ambientScale.toFixed(1)}
#define AMBIENT_REACH ${(O*t.ambientScale+t.warp).toFixed(1)}
#define WARP ${t.warp.toFixed(1)}
#define POINTER_WARP ${t.pointerWarp.toFixed(3)}
#define WARP_SCALE ${t.warpScale.toFixed(5)}
#define WARP_SPEED ${t.warpSpeed.toFixed(4)}
#define SHADE_SCALE ${t.shadeScale.toFixed(4)}
#define SHADE_SPEED ${t.shadeSpeed.toFixed(4)}
#define GLOW_ALPHA ${t.glowAlpha.toFixed(3)}
#define GLOW_SIGMA ${t.glowSigma.toFixed(3)}
#define GLOW_SCALE ${t.glowScale.toFixed(4)}
#define GLOW_SPEED ${t.glowSpeed.toFixed(4)}
#define GLOW_THRESHOLD ${t.glowThreshold.toFixed(3)}
#define GLOW_SOFTNESS ${t.glowSoftness.toFixed(3)}
#define GLOW_FOCUS ${t.glowFocus.toFixed(3)}
#define GLOW_BOOST ${t.glowBoost.toFixed(3)}
#define GLYPH_LEVEL ${t.glyphLevel.toFixed(3)}
#define GLYPH_ALPHA ${t.glyphAlpha.toFixed(3)}
#define GLYPH_SHADE_MIN ${t.glyphShadeMin.toFixed(3)}
#define GLYPH_GLOW_ALPHA ${t.glyphGlowAlpha.toFixed(3)}
#define GLYPH_GLOW_SIGMA ${t.glyphGlowSigma.toFixed(3)}
#define GLYPH_GLOW_FLOOR ${t.glyphGlowFloor.toFixed(3)}
#define CLEAR_CORNER ${t.clearCorner.toFixed(1)}
#define CLEAR_FEATHER ${t.clearFeather.toFixed(1)}
#define WANDER_SCALE ${t.wanderScale.toFixed(1)}
#define WANDER_REACH ${(O*t.wanderScale+t.warp).toFixed(1)}

float glyphAt(vec2 cell) {
  vec2 g = cell - uGlyphRect.xy;
  if (g.x < 0.0 || g.y < 0.0 || g.x >= uGlyphRect.z || g.y >= uGlyphRect.w) return 0.0;
  return texture2D(uGlyph, (g + 0.5) / uGlyphRect.zw).r;
}
`,Ce=`${be}
uniform float uTime;
uniform vec3 uTrail[${v}];
uniform vec3 uReach;
uniform float uPointerGain;
uniform vec2 uPointerShape;
uniform vec3 uAmbient;
uniform vec4 uClear[${w}];
uniform vec3 uWander[${_}];
uniform float uClearStrength;
uniform float uClearPointer;
uniform float uRest;
uniform float uShadeMin;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float clearKeep(vec2 center) {
  float keep = 1.0;
  for (int i = 0; i < ${w}; i++) {
    vec4 box = uClear[i];
    if (box.z < 0.0) continue;
    float r = min(CLEAR_CORNER, min(box.z, box.w));
    vec2 q = abs(center - box.xy) - box.zw + r;
    float outside = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    keep = min(keep, smoothstep(0.0, CLEAR_FEATHER, outside));
  }
  return 1.0 - uClearStrength * (1.0 - keep);
}

vec2 pack(float v) {
  float x = v * 255.0;
  float hi = floor(x);
  return vec2(hi / 255.0, x - hi);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy);
  vec2 center = (cell + 0.5) * PITCH;
  float glyph = glyphAt(cell);
  float keep = clearKeep(center);
  bool inReach = glyph > 0.0
    || uRest > 0.0
    || distance(center, uReach.xy) <= uReach.z
    || (uAmbient.z > 0.0 && distance(center, uAmbient.xy) <= AMBIENT_REACH);
  for (int i = 0; i < ${_}; i++) {
    if (uWander[i].z > 0.0 && distance(center, uWander[i].xy) <= WANDER_REACH) inReach = true;
  }
  if (!inReach) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 q = center * WARP_SCALE;
  vec2 warp = vec2(
    snoise(q + vec2(uTime * WARP_SPEED, 0.0)),
    snoise(q + vec2(17.3, -uTime * WARP_SPEED * 0.85))
  ) * WARP;
  vec2 at = center + warp;

  float field = uAmbient.z * exp(-distance(at, uAmbient.xy) / AMBIENT_SCALE) * keep;
  field = max(field, uRest * keep);
  for (int i = 0; i < ${_}; i++) {
    vec3 w = uWander[i];
    if (w.z <= 0.0) continue;
    field = max(field, w.z * exp(-distance(at, w.xy) / WANDER_SCALE) * keep);
  }
  vec2 atPointer = center + warp * POINTER_WARP;
  float pointer = 0.0;
  for (int i = 0; i < ${v}; i++) {
    vec3 t = uTrail[i];
    if (t.z <= 0.0) continue;
    float scale = mix(TAIL, HEAD, t.z);
    pointer = max(pointer, t.z * exp(-length((atPointer - t.xy) / uPointerShape) / scale));
  }
  field = max(field, pointer * uPointerGain * mix(uClearPointer, 1.0, keep));
  field = max(field, glyph * GLYPH_LEVEL);
  if (field <= 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float shade = snoise(cell * SHADE_SCALE + vec2(uTime * SHADE_SPEED, -uTime * SHADE_SPEED * 0.8)) * 0.5 + 0.5;
  float glowNoise = snoise(cell * GLOW_SCALE + vec2(41.7, -13.1) + vec2(-uTime * GLOW_SPEED, uTime * GLOW_SPEED * 0.75)) * 0.5 + 0.5;
  float glow = pow(field, GLOW_FOCUS) * smoothstep(GLOW_THRESHOLD, GLOW_THRESHOLD + GLOW_SOFTNESS, glowNoise);
  glow = max(glow, glyph * GLYPH_GLOW_FLOOR);

  float maxAlpha = mix(MAX_ALPHA, GLYPH_ALPHA, glyph);
  float shadeMin = mix(uShadeMin, GLYPH_SHADE_MIN, glyph);
  float core = min(1.0, maxAlpha * field * mix(shadeMin, 1.0, shade) * (1.0 + GLOW_BOOST * glow));
  gl_FragColor = vec4(pack(core), pack(glow));
}
`,De=`${be}
uniform vec2 uSize;
uniform float uDpr;
uniform sampler2D uDots;
uniform vec2 uCells;
uniform float uIntensity;
uniform vec3 uColor;

void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y) / uDpr;
  vec2 cell = floor(p / PITCH);
  vec2 center = (cell + 0.5) * PITCH;
  float dist = distance(p, center);
  float glyph = glyphAt(cell);
  float glowSigma = mix(GLOW_SIGMA, GLYPH_GLOW_SIGMA, glyph);
  if (dist > RADIUS + 3.5 * glowSigma) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec4 light = texture2D(uDots, (cell + 0.5) / uCells);
  float core = light.r + light.g / 255.0;
  float glow = light.b + light.a / 255.0;

  float aa = 0.75 / uDpr;
  float disc = 1.0 - smoothstep(RADIUS - aa, RADIUS + aa, dist);
  float edge = max(dist - RADIUS, 0.0);
  float halo = mix(GLOW_ALPHA, GLYPH_GLOW_ALPHA, glyph) * glow * exp(-(edge * edge) / (2.0 * glowSigma * glowSigma));
  float a = min(1.0, (core * disc + halo * (1.0 - disc)) * uIntensity);
  gl_FragColor = vec4(uColor * a, a);
}
`;var k="__mrvnDotFieldDispose",A=null,Y=-1;function ft(){return typeof window<"u"&&!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches}function Ge(r,n){if(typeof document>"u")return;if(!r.closest("[data-mrvn-dot-field-root]")?.hasAttribute("data-mrvn-dot-field-active")){A===r&&(A=null,Y=-1,document.documentElement.style.removeProperty("--mrvn-dot-ptr"),document.body?.style.removeProperty("--mrvn-dot-ptr"));return}if(A&&A!==r&&H(A))return;A=r;let a=Math.round(Math.max(0,Math.min(1,n))*1e3)/1e3;a!==Y&&(Y=a,document.body?.style.removeProperty("--mrvn-dot-ptr"),a<=0?document.documentElement.style.removeProperty("--mrvn-dot-ptr"):document.documentElement.style.setProperty("--mrvn-dot-ptr",String(a)))}function st(r){A===r&&(A=null,Y=-1,typeof document<"u"&&(document.documentElement.style.removeProperty("--mrvn-dot-ptr"),document.body?.style.removeProperty("--mrvn-dot-ptr")))}function ht(r,n){if(typeof document>"u")return n;let d=getComputedStyle(document.documentElement).getPropertyValue(`--ds-${r}`).trim().split("/")[0].trim().split(/[\s,]+/).map(Number);return d.length>=3&&d.slice(0,3).every(a=>Number.isFinite(a))?[d[0]/255,d[1]/255,d[2]/255]:n}function Ie(r,n,d){let a=r.createShader(n);return a?(r.shaderSource(a,d),r.compileShader(a),r.getShaderParameter(a,r.COMPILE_STATUS)?a:(console.error("[DotField] shader:",r.getShaderInfoLog(a)),r.deleteShader(a),null)):null}function H(r){return!!r[k]}function re(r){let n=r[k];n?.(),delete r[k]}function Oe(r,n={}){if(H(r))return()=>re(r);n.ambient??(n.ambient=!1),n.wander??(n.wander=!1),n.intensity??(n.intensity=1),n.rest??(n.rest=0),n.shadeMin??(n.shadeMin=Fe()),n.pointer??(n.pointer=1),n.pointerSize??(n.pointerSize=1),n.pointerAspect??(n.pointerAspect=1),n.clearStrength??(n.clearStrength=1),n.clearPointer??(n.clearPointer=ve());let d=n.intensity,a=n.rest,Ue=n.shadeMin,ne=n.pointer,oe=n.pointerSize,ie=n.pointerAspect,Ne=n.clearStrength,$e=n.clearPointer,Be=n.ambient,Xe=n.wander,e=r.getContext("webgl",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!e||e.isContextLost())return()=>{};let ae=i=>{let l=Ie(e,e.VERTEX_SHADER,we),c=l&&Ie(e,e.FRAGMENT_SHADER,i),m=c&&l?e.createProgram():null;return!m||!l||!c?(l&&e.deleteShader(l),c&&e.deleteShader(c),null):(e.attachShader(m,l),e.attachShader(m,c),e.bindAttribLocation(m,0,"aPos"),e.linkProgram(m),e.deleteShader(l),e.deleteShader(c),e.getProgramParameter(m,e.LINK_STATUS)?m:(console.error("[DotField] program:",e.getProgramInfoLog(m)),e.deleteProgram(m),null))},b=ae(Ce),M=ae(De);if(!b||!M)return()=>{};let le=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,le),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let s=i=>e.getUniformLocation(b,i),p=i=>e.getUniformLocation(M,i),ze=s("uTime"),Ye=s("uTrail"),de=s("uReach"),ke=s("uPointerGain"),qe=s("uPointerShape"),Ke=s("uAmbient"),Ve=s("uGlyphRect"),je=s("uClear"),Je=s("uWander"),Qe=s("uClearStrength"),Ze=s("uClearPointer"),et=s("uRest"),tt=s("uShadeMin"),rt=p("uSize"),nt=p("uDpr"),ot=p("uCells"),it=p("uGlyphRect"),at=p("uIntensity");e.useProgram(b),e.uniform1i(s("uGlyph"),0),e.useProgram(M),e.uniform1i(p("uGlyph"),0),e.uniform1i(p("uDots"),1);let[lt,dt,ct]=ht("on-media",[1,1,1]);e.uniform3f(p("uColor"),lt,dt,ct);let W=n.glyphRows??[],L=Math.max(1,...W.map(i=>i.length)),C=Math.max(1,W.length),ce=new Uint8Array(L*C);W.forEach((i,l)=>{for(let c=0;c<i.length;c++)i[c]==="#"&&(ce[l*L+c]=255)});let q=e.createTexture();e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,q),e.pixelStorei(e.UNPACK_ALIGNMENT,1),e.texImage2D(e.TEXTURE_2D,0,e.LUMINANCE,L,C,0,e.LUMINANCE,e.UNSIGNED_BYTE,ce),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let D=e.createTexture();e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);let K=e.createFramebuffer(),U=1,N=1,E=1,ue=()=>{E=Math.min(window.devicePixelRatio||1,2);let i=r.getBoundingClientRect();r.width=Math.max(1,Math.round(i.width*E)),r.height=Math.max(1,Math.round(i.height*E)),U=Math.floor(r.width/E/t.dotPitch)+1,N=Math.floor(r.height/E/t.dotPitch)+1,e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,D),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,U,N,0,e.RGBA,e.UNSIGNED_BYTE,null),e.bindFramebuffer(e.FRAMEBUFFER,K),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,D,0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.useProgram(M),e.uniform2f(rt,r.width,r.height),e.uniform1f(nt,E),e.uniform2f(ot,U,N)};ue();let me=new ResizeObserver(ue);me.observe(r);let x={x:0,y:0},fe=!1,V=0,h=[],G=new Float32Array(v*3),P=new Float32Array(w*4),I=new Float32Array(_*3),T=new Float32Array(4),j=null,se=0,J=0,$=i=>{let l=r.getBoundingClientRect();se=i.clientX,j={x:i.clientX-l.left,y:i.clientY-l.top}};window.addEventListener("dragover",$,{capture:!0}),window.addEventListener("pointermove",$,{capture:!0});let he=(i,l=0)=>{let c=r.width/E,m=r.height/E,S=Math.random()*Math.PI*2,y=t.wanderLifeMinMs+Math.random()*(t.wanderLifeMaxMs-t.wanderLifeMinMs);return{x0:Math.random()*c,y0:Math.random()*m,dx:Math.cos(S)*t.wanderDrift,dy:Math.sin(S)*t.wanderDrift,born:i-l*y,life:y}},R=[],Q=ft(),Ee=performance.now(),Z=Ee,B=0,xe=!1,ut=i=>{let l=Math.min(.1,(i-Z)/1e3);Z=i,e.useProgram(b);let c=j;if(c){fe||(x.x=c.x,x.y=c.y,fe=!0);let o=1-Math.pow(1-t.headFollow,l*60);x.x+=(c.x-x.x)*o,x.y+=(c.y-x.y)*o,V+=(1-V)*(1-Math.pow(.85,l*60)),h.length===0||i-h[0].at>=Le?h.unshift({x:x.x,y:x.y,at:i}):(h[0].x=x.x,h[0].y=x.y)}for(;h.length>v||h.length>1&&i-h[h.length-1].at>t.trailLifeMs;)h.pop();G.fill(0);let m=1/0,S=1/0,y=-1/0,X=-1/0,Te=0;if(h.forEach((o,f)=>{let u=f===0?1:Math.max(0,1-(i-o.at)/t.trailLifeMs),g=Math.pow(u,1.6)*V*Math.max(0,Math.min(1,ne));G[f*3]=o.x,G[f*3+1]=o.y,G[f*3+2]=g,Te+=g,m=Math.min(m,o.x),S=Math.min(S,o.y),y=Math.max(y,o.x),X=Math.max(X,o.y)}),Q)Ge(r,0);else{let o=window.innerWidth||1,f=j?Math.max(0,Math.min(1,(se/o-.86)/.14)):0,u=Math.min(1,Te*.55),g=Math.min(1,u*(.5+.5*Math.max(f,.2))),z=1-Math.pow(.88,l*60);J+=(g-J)*z,Ge(r,J)}let Re=Math.max(.1,oe)*Math.sqrt(Math.max(.1,ie)),Se=Math.max(.1,oe)/Math.sqrt(Math.max(.1,ie));e.uniform2f(qe,Re,Se),e.uniform1f(ke,Math.max(1,Math.min(2,ne)));let mt=O*Math.max(t.headScale,t.tailScale)*Math.max(Re,Se)+t.warp;h.length>0?e.uniform3f(de,(m+y)/2,(S+X)/2,Math.hypot(y-m,X-S)/2+mt):e.uniform3f(de,0,0,-1);let te=W.length>0?n.getGlyphAnchor?.()??null:null,ye=n.getClearAround?.()??[],F=te||ye.some(Boolean)?r.getBoundingClientRect():null,_e=r.width/E/2,Me=r.height/E/2;if(te&&F){let o=te.getBoundingClientRect(),f=Math.round((o.left+o.width/2-F.left)/t.dotPitch-L/2),u=Math.round((o.top+o.height/2-F.top)/t.dotPitch-C/2);T[0]=f,T[1]=u,T[2]=L,T[3]=C,_e=(f+L/2)*t.dotPitch,Me=(u+C/2)*t.dotPitch}else T.fill(0);e.uniform4fv(Ve,T);for(let o=0;o<w;o++){let f=ye[o];if(f&&F){let u=f.getBoundingClientRect();P[o*4]=u.left+u.width/2-F.left,P[o*4+1]=u.top+u.height/2-F.top,P[o*4+2]=u.width/2+t.clearPadding,P[o*4+3]=u.height/2+t.clearPadding}else P.set([0,0,-1,-1],o*4)}e.uniform4fv(je,P),I.fill(0),Xe&&!Q?(R.length===0&&(R=Array.from({length:_},()=>he(i,Math.random()))),R=R.map(o=>i-o.born>=o.life?he(i):o),R.forEach((o,f)=>{let u=(i-o.born)/o.life,g=t.wanderRise,z=u<g?Math.sin(Math.PI/2*(u/g)):Math.cos(Math.PI/2*((u-g)/(1-g)));I[f*3]=o.x0+o.dx*u,I[f*3+1]=o.y0+o.dy*u,I[f*3+2]=t.wanderStrength*z*z})):R.length>0&&(R=[]),e.uniform3fv(Je,I),e.uniform1f(Qe,Math.max(0,Math.min(1,Ne))),e.uniform1f(Ze,Math.max(0,Math.min(1,$e))),e.uniform1f(et,Math.max(0,Math.min(1,a))),e.uniform1f(tt,Math.max(0,Math.min(1,Ue))),e.uniform3f(Ke,_e,Me,Be?t.ambientStrength:0),e.uniform1f(ze,Q?0:(i-Ee)/1e3),e.uniform3fv(Ye,G),e.bindFramebuffer(e.FRAMEBUFFER,K),e.viewport(0,0,U,N),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,r.width,r.height),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,D),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,q),e.useProgram(M),e.uniform4fv(it,T),e.uniform1f(at,Math.max(0,Math.min(2,d))),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.drawArrays(e.TRIANGLES,0,3),xe||(xe=!0,n.onFirstPaint?.(),r.closest(".mrvn-viewport-shell")?.setAttribute("data-dotfield-ready","1"))},ge=i=>{ut(i),B=requestAnimationFrame(ge)},ee=!1,pe=new IntersectionObserver(([i])=>{let l=!!i?.isIntersecting;l!==ee&&(ee=l,ee?(Z=performance.now(),B=requestAnimationFrame(ge)):cancelAnimationFrame(B))});pe.observe(r);let Ae=()=>{cancelAnimationFrame(B),pe.disconnect(),me.disconnect(),window.removeEventListener("dragover",$,{capture:!0}),window.removeEventListener("pointermove",$,{capture:!0}),st(r),e.deleteBuffer(le),e.deleteTexture(q),e.deleteTexture(D),e.deleteFramebuffer(K),e.deleteProgram(b),e.deleteProgram(M)};return r[k]=Ae,Ae}var Et="canvas[data-mrvn-dot-field-preset]",xt="[data-mrvn-dot-field-root]";function gt(r){document.querySelectorAll(xt).forEach(n=>{let d=n.getAttribute("data-mrvn-dot-field-preset"),a=d&&d===r;n.toggleAttribute("data-mrvn-dot-field-active",!!a)})}function He(r){if(typeof document>"u")return;document.querySelectorAll(Et).forEach(d=>{let a=d.getAttribute("data-mrvn-dot-field-preset");if(a){if(r&&r!=="none"&&a!==r){H(d)&&re(d);return}H(d)||Oe(d,{...Pe(a),onFirstPaint:()=>{d.closest(".mrvn-viewport-shell")?.setAttribute("data-dotfield-ready","1")}})}}),r&&gt(r==="none"?null:r)}function We(){He("vignette")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",We):We();})();
