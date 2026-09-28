// SHARED FILE (Part 1 owns). Do not edit from other parts.
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const range=(p,a,b)=>clamp((p-a)/(b-a));
export const smoothstep=(a,b,v)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
export const fadeWindow=(p,inEnd=0.15,outStart=0.85)=>smoothstep(0,inEnd,p)*(1-smoothstep(outStart,1,p));
