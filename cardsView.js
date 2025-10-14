
import { cards } from './cards.js';
import { getPref } from './state.js';
import { openWorkspace } from './workspace.js';

const mapSvg = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
  <path d="M9 3l6 2 5-2v14l-5 2-6-2-5 2V5l5-2z" fill="currentColor" opacity=".12"/>
  <path d="M9 3l6 2 5-2v14l-5 2-6-2-5 2V5l5-2zm0 0v14m6-12v14"
        fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

function pill(text,cls=''){const s=document.createElement('span'); s.className='badge '+(cls||''); s.textContent=text; return s;}
function parseTimeLabel(when=""){const w=when.toLowerCase(); if(/\\d{1,2}:\\d{2}/.test(w)) return "🕓 "+when; if(w.includes("morning")) return "🕓 Morning"; if(w.includes("evening")) return "🕓 Evening"; if(w.includes("afternoon")) return "🕓 Afternoon"; if(w.includes("anytime")) return "🕓 Anytime"; return when?("📅 "+when):null;}
function parseRepeat(when=""){const w=when.toLowerCase(); if(w.includes("daily")) return "🔁 Daily"; if(w.includes("weekly")) return "🔁 Weekly"; if(w.includes("monthly")) return "🔁 Monthly"; return null;}

export function renderList({filter='all'}={}){
  const list=document.getElementById('cardList'); list.innerHTML='';
  const sz=getPref('size')||'comfy';
  const visible = cards.filter(c=>filter==='all' ? true : c.category===filter);
  for(const card of visible){
    const el=document.createElement('article'); el.className='card '+sz;
    const bar=document.createElement('div'); bar.className='colorbar'; bar.style.setProperty('--bar', colorFor(card.category)[0]); el.appendChild(bar);
    const inner=document.createElement('div'); inner.className='card-inner'; inner.style.setProperty('--wash','transparent');
    const title=document.createElement('div'); title.className='card-title'; title.textContent=card.title;
    const meta=document.createElement('div'); meta.className='meta';
    const t=parseTimeLabel(card.when||""); const r=parseRepeat(card.when||"");
    if(t){ const b=pill(t,'muted'); b.style.cursor='pointer'; b.addEventListener('click',()=>openWorkspace('date',card)); meta.append(b); }
    if(r) meta.append(pill(r,'muted'));
    if(card.where) meta.append(pill('📍 '+card.where,'muted'));
    const mbtn=document.createElement('button'); mbtn.className='icon-chip'; mbtn.innerHTML=mapSvg+'<span class="chip-label">Map</span>'; mbtn.addEventListener('click',()=>openWorkspace('map',card)); meta.append(mbtn);
    inner.append(title, meta);
    el.appendChild(inner);
    let last=0; el.addEventListener('click',()=>{const now=Date.now(); if(now-last<300) openWorkspace('date',card); last=now;});
    list.appendChild(el);
  }
}
function colorFor(cat){
  const m={Physical:["#16a34a","#16a34a33"],Financial:["#d97706","#d9770633"],Social:["#2563eb","#2563eb33"],Intellectual:["#7c3aed","#7c3aed33"],Emotional:["#dc2626","#dc262633"],Spiritual:["#0ea5a3","#0ea5a333"]}[cat];
  return m||["#64748b","#e2e8f0"];
}
