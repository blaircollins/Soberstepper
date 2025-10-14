
const VERSION="1.4.6";
const STATE_KEY="soberstepper.state.v146";
const EDIT_TAP_WINDOW=300, LONG_PRESS_MS=500;
let cards=[], filter="all", cardSize="comfy", buttonStyle="text", theme="light";

const icons={Physical:"🏃",Financial:"💰",Social:"🤝",Intellectual:"📚",Emotional:"🧘",Spiritual:"🕊️"};
const resIcon=r=>({"Video":"🎥","Audio":"🎧","Text":"📝","PDF":"📄","Form":"🧾","Spreadsheet":"📊"}[r]||"📁");

function loadState(){try{return JSON.parse(localStorage.getItem(STATE_KEY))||{accepted:{},later:{},deleted:{},actions:[],prefs:{size:"comfy",buttons:"text",theme:"light"}}}catch{return{accepted:{},later:{},deleted:{},actions:[],prefs:{size:"comfy",buttons:"text",theme:"light"}}}}
function saveState(s){localStorage.setItem(STATE_KEY,JSON.stringify(s))}
const state=loadState(); cardSize=state.prefs.size; buttonStyle=state.prefs.buttons; theme=state.prefs.theme; applyTheme(theme);

async function loadCards(){const r=await fetch('cards.json',{cache:'no-store'}); const d=await r.json(); cards=d.cards; document.querySelector('.ver').textContent="v"+(d.version||VERSION);}

function cssVar(name){return getComputedStyle(document.documentElement).getPropertyValue(name).trim();}
function colors(cat){const m={Physical:["--physical","--physical-subtle"],Financial:["--financial","--financial-subtle"],Social:["--social","--social-subtle"],Intellectual:["--intellectual","--intellectual-subtle"],Emotional:["--emotional","--emotional-subtle"],Spiritual:["--spiritual","--spiritual-subtle"]}[cat]; if(!m)return["#64748b","#e2e8f0"]; return [cssVar(m[0]), cssVar(m[1])];}

function pill(text,cls=''){const b=document.createElement('span'); b.className='badge '+cls; b.textContent=text; return b;}

function parseRepeat(when=""){
  const w=when.toLowerCase();
  if(w.includes("daily")) return "🔁 Daily";
  if(w.includes("weekly")) return "🔁 Weekly";
  if(w.includes("monthly")) return "🔁 Monthly";
  return null;
}
function parseTimeLabel(when=""){
  const w=when.toLowerCase();
  if(/\d{1,2}:\d{2}/.test(w)) return "🕓 " + when;
  if(w.includes("morning")) return "🕓 Morning";
  if(w.includes("evening")) return "🕓 Evening";
  if(w.includes("afternoon")) return "🕓 Afternoon";
  if(w.includes("anytime")) return "🕓 Anytime";
  return when?("📅 " + when):null;
}

function metaRow(card,mode){
  const m=document.createElement('div'); m.className='meta';
  const rep=parseRepeat(card.when||""); const time=parseTimeLabel(card.when||"");
  if(time) m.append(pill(time, mode==='compact'?'light':'muted'));
  if(rep) m.append(pill(rep, mode==='compact'?'light':'muted'));
  if(card.where) m.append(pill('📍 '+card.where, mode==='compact'?'light':'muted'));
  if(card.resources && card.resources.length) m.append(pill('📦 '+card.resources.map(resIcon).join(' '), mode==='compact'?'light':'muted'));
  // Tiny map preview via OSM static tile
  if(card.coords){
    const [lat,lon]=card.coords;
    const z=13, x=Math.floor((lon+180)/360*Math.pow(2,z)), y=Math.floor((1-Math.log(Math.tan(lat*Math.PI/180)+1/Math.cos(lat*Math.PI/180))/Math.PI)/2*Math.pow(2,z));
    const img=document.createElement('img'); img.className='preview'; img.alt='Map preview'; img.src=`https://tile.openstreetmap.org/${z}/${x}/${y}.png`; img.addEventListener('click',()=>openMap(card)); m.append(img);
  }
  return m;
}

function openMap(card){
  const [lat,lon]=card.coords||[37.7749,-122.4194];
  const url=`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
  window.open(url,'_blank');
}

function makeActions(solid){
  const labels=["Calendar","Share","Edit","Map"]; const row=document.createElement('div'); row.className=buttonStyle==='icons'?'icon-row':'actions';
  labels.forEach(act=>{const b=document.createElement('button'); b.className=buttonStyle==='icons'?'icon-btn':'action'; b.dataset.action=act; b.textContent=(act==="Calendar"?"📅":act==="Share"?"✉️":act==="Edit"?"✏️":"📍"); b.style.background=solid; b.style.color='#fff'; row.appendChild(b);});
  return row;
}
function wireActionHandlers(container,card){
  container.querySelectorAll('button').forEach(btn=>{
    const act=btn.dataset.action;
    if(act==="Edit") btn.addEventListener('click',()=>openEditor(card));
    if(act==="Calendar") btn.addEventListener('click',()=>addToCalendar(card));
    if(act==="Share") btn.addEventListener('click',()=>navigator.share?navigator.share({title:'SoberStepper',text:card.title}):alert('Share not supported'));
    if(act==="Map") btn.addEventListener('click',()=>openMap(card));
  });
}

function addToCalendar(card){
  let start = new Date(Date.now()+60*60*1000); // fallback
  const m = (card.when||"").match(/(\d{1,2}):(\d{2})/);
  if(m){ start.setHours(parseInt(m[1],10), parseInt(m[2],10), 0, 0); }
  const end = new Date(start.getTime()+30*60*1000);

  function toICSDate(d){
    const pad=n=>String(n).padStart(2,'0');
    return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';
  }
  const uid = 'ss-'+Math.random().toString(36).slice(2)+'@soberstepper';
  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SoberStepper//EN',
    'BEGIN:VEVENT',
    'UID:'+uid,
    'DTSTAMP:'+toICSDate(new Date()),
    'DTSTART:'+toICSDate(start),
    'DTEND:'+toICSDate(end),
    'SUMMARY:'+card.title.replace(/\n/g,' '),
    card.where ? ('LOCATION:'+card.where.replace(/\n/g,' ')) : '',
    'DESCRIPTION:'+ (card.notes||'').replace(/\n/g,' '),
    'END:VEVENT','END:VCALENDAR'
  ].filter(Boolean).join('\\r\\n');

  const blob = new Blob([ics], { type:'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=(card.title||'soberstepper')+'.ics'; a.click(); URL.revokeObjectURL(url);
}

function logAction(card,decision,meta={}){state.actions.push({id:'a_'+Math.random().toString(36).slice(2,8),card_id:card.id,timestamp:new Date().toISOString(),decision,meta}); saveState(state);}

function render(){
  const list=document.getElementById('cardList'); list.innerHTML='';
  const visible=cards.filter(c=>filter==='all'?true:c.category===filter);
  for(const card of visible){
    if(state.deleted[card.id]) continue;
    const el=document.createElement('article'); el.className='card '+cardSize; el.dataset.id=card.id;
    const [solid,subtle]=colors(card.category);
    if(cardSize==='comfy'){
      const bar=document.createElement('div'); bar.className='colorbar'; bar.style.setProperty('--bar',solid); el.appendChild(bar);
      const inner=document.createElement('div'); inner.className='card-inner'; inner.style.setProperty('--wash','linear-gradient(180deg,'+subtle+', transparent 160px)');
      const title=document.createElement('div'); title.className='card-title'; title.textContent=card.title;
      inner.append(title, metaRow(card,'comfy'));
      const actions=makeActions(solid); inner.append(actions); wireActionHandlers(actions,card);
      const hint=document.createElement('div'); hint.className='hint'; hint.textContent='▶ complete · ◀ later · ◉ double‑tap edit · ⏱ long‑press delete'; inner.append(hint);
      el.appendChild(inner);
      // long‑press delete
      let t=null; el.addEventListener('touchstart',()=>{t=setTimeout(()=>{ if(confirm('Remove this card?')){state.deleted[card.id]=true; logAction(card,'deleted'); saveState(state); render();}}, LONG_PRESS_MS)});
      el.addEventListener('touchend',()=>{if(t){clearTimeout(t); t=null;}});
    } else {
      // compact colored
      el.style.background=solid; el.style.color='#fff';
      const inner=document.createElement('div'); inner.className='card-inner';
      const row=document.createElement('div'); row.className='title-row';
      const emoji=document.createElement('span'); emoji.className='emoji'; emoji.textContent=icons[card.category]||'🗂️';
      const title=document.createElement('div'); title.className='card-title'; title.textContent=card.title;
      row.append(emoji,title); inner.append(row, metaRow(card,'compact')); el.appendChild(inner);
    }
    attachGestures(el,card);
    let lastTap=0; el.addEventListener('click',()=>{const now=Date.now(); if(now-lastTap<EDIT_TAP_WINDOW) openEditor(card); lastTap=now;});
    list.appendChild(el);
  }
}

function openEditor(card){
  let ov=document.getElementById('overlay'); ov.className='overlay open';
  ov.innerHTML=`
    <div class="editor">
      <h2>Edit Card</h2>
      <label>Title<input id="ed-title" value="${card.title||''}"/></label>
      <div class="row">
        <label>When<input id="ed-when" value="${card.when||''}" placeholder="daily 06:00 / Evening / 14:00"/></label>
        <label>Where<input id="ed-where" value="${card.where||''}" placeholder="address or place"/></label>
      </div>
      <label>Notes<textarea id="ed-notes" rows="3">${card.notes||''}</textarea></label>
      <label>Map</label>
      <div class="map-wrap"><div id="ed-map" style="height:100%"></div></div>
      <div class="btns">
        <button class="btn" id="ed-cancel">Cancel</button>
        <button class="btn" id="ed-calendar">📅 Add to calendar (.ics)</button>
        <button class="btn" id="ed-openmap">Open Map</button>
        <button class="btn primary" id="ed-save">Save</button>
      </div>
    </div>`;
  const $=s=>ov.querySelector(s);

  // Map init (Leaflet)
  let lat= (card.coords&&card.coords[0])||37.7749, lon=(card.coords&&card.coords[1])||-122.4194;
  if(window.L){
    const map = L.map('ed-map').setView([lat,lon], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OSM'}).addTo(map);
    const marker = L.marker([lat,lon], {draggable:true}).addTo(map);
    marker.on('dragend',()=>{ const p = marker.getLatLng(); lat=p.lat; lon=p.lng; });
  } else {
    $('#ed-map').innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#94a3b8;">Map will load when online</div>';
  }

  $('#ed-cancel').onclick=()=>ov.classList.remove('open');
  $('#ed-openmap').onclick=()=>openMap({coords:[lat,lon]});
  $('#ed-calendar').onclick=()=>addToCalendar(card);
  $('#ed-save').onclick=()=>{
    card.title=$('#ed-title').value.trim()||card.title;
    card.when=$('#ed-when').value.trim()||card.when;
    card.where=$('#ed-where').value.trim()||card.where;
    card.notes=$('#ed-notes').value.trim();
    card.coords=[lat,lon];
    ov.classList.remove('open');
    render();
  };
}

function attachGestures(el,card){
  let startX=0,dx=0,drag=false;
  el.addEventListener('touchstart',e=>{startX=e.touches[0].clientX; drag=true; el.style.transition='none'});
  el.addEventListener('touchmove',e=>{ if(!drag) return; dx=e.touches[0].clientX-startX; el.style.transform='translateX('+dx+'px)'; el.classList.toggle('swipe-left',dx<-30); el.classList.toggle('swipe-right',dx>30); });
  function settle(dir){
    el.style.transition='transform .18s ease, opacity .18s ease'; el.style.transform='translateX(0)'; el.classList.remove('swipe-left','swipe-right');
    if(dir==='right'){ state.accepted[card.id]=true; delete state.later[card.id]; toast('Completed'); logAction(card,'completed'); }
    else if(dir==='left'){ if(cardSize==='comfy'){ state.later[card.id]=true; delete state.accepted[card.id]; toast('Saved for later'); logAction(card,'later'); }
      else { state.deleted[card.id]=true; toast('Deleted'); logAction(card,'deleted'); } }
    saveState(state); render();
  }
  el.addEventListener('touchend',()=>{ if(!drag) return; drag=false; if(dx>80) settle('right'); else if(dx<-80) settle('left'); else settle(null); dx=0; });
}

function toast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast';
    Object.assign(t.style,{position:'fixed',bottom:'16px',left:'50%',transform:'translateX(-50%)',background:'#111827',color:'#fff',padding:'10px 14px',borderRadius:'10px',fontSize:'14px',zIndex:9999,opacity:0,transition:'opacity .15s ease'});
    document.body.appendChild(t);
  }
  t.textContent=msg; t.style.opacity=1; setTimeout(()=>t.style.opacity=0,900);
}

function wireFilters(){ document.querySelectorAll('.filters .chip').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.filters .chip').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); filter=btn.dataset.filter; render();
}));}

function setSize(sz){ cardSize=sz; document.querySelectorAll('.settings .chip[data-size]').forEach(b=>b.classList.toggle('active',b.dataset.size===sz)); state.prefs.size=sz; saveState(state); render(); }
function applyTheme(t){ document.body.classList.toggle('theme-dark',t==='dark'); document.body.classList.toggle('theme-light',t!=='dark'); }
function setTheme(t){ theme=t; applyTheme(t); document.querySelectorAll('.settings .chip[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===t)); state.prefs.theme=t; saveState(state); }
function setButtons(k){ buttonStyle=k; document.querySelectorAll('.settings .chip[data-buttons]').forEach(b=>b.classList.toggle('active',b.dataset.buttons===k)); state.prefs.buttons=k; saveState(state); render(); }
function exportActions(){ const data=JSON.stringify(state.actions||[],null,2); if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(data).then(()=>toast('Copied actions to clipboard')); const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='soberstepper-actions.json'; a.click(); URL.revokeObjectURL(url); }
function showPrivacy(){ alert('Privacy: Your actions are stored locally on this device. Nothing is sent anywhere unless you export/share it yourself.'); }

function wireSettings(){
  document.querySelector('.settings .chip[data-size="compact"]').addEventListener('click',()=>setSize('compact'));
  document.querySelector('.settings .chip[data-size="comfy"]').addEventListener('click',()=>setSize('comfy'));
  document.querySelector('.settings .chip[data-buttons="text"]').addEventListener('click',()=>setButtons('text'));
  document.querySelector('.settings .chip[data-buttons="icons"]').addEventListener('click',()=>setButtons('icons'));
  document.querySelector('.settings .chip[data-theme="light"]').addEventListener('click',()=>setTheme('light'));
  document.querySelector('.settings .chip[data-theme="dark"]').addEventListener('click',()=>setTheme('dark'));
  document.querySelector('.settings .chip[data-export="actions"]').addEventListener('click',exportActions);
  document.querySelector('.settings .chip[data-privacy="info"]').addEventListener('click',showPrivacy);
  document.querySelector('.settings .chip[data-size="'+cardSize+'"]').classList.add('active');
  document.querySelector('.settings .chip[data-buttons="'+buttonStyle+'"]').classList.add('active');
  document.querySelector('.settings .chip[data-theme="'+theme+'"]').classList.add('active');
}

(async function init(){ await loadCards(); wireFilters(); wireSettings(); render(); })();
