
import { addToCalendar } from './ics.js';
import { centerMapOnUser } from './geo.js';

export function openWorkspace(kind, card){
  const ws=document.getElementById('workspace');
  const body=document.getElementById('ws-body');
  const title=document.getElementById('ws-title');
  const save=document.getElementById('ws-save');
  ws.classList.remove('hidden');
  document.getElementById('ws-date').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'2-digit'});
  body.innerHTML=''; save.onclick=null; document.getElementById('ws-back').onclick=()=>ws.classList.add('hidden');

  if(kind==='map'){
    title.textContent='Location';
    const wrap=document.createElement('div'); wrap.className='map-wrap'; wrap.innerHTML='<div id="ws-map" style="height:100%"></div>';
    const where=document.createElement('input'); where.placeholder='Where'; where.value=card?.where||'';
    body.append(wrap, where);
    let lat=(card?.coords?.[0])||37.7749, lon=(card?.coords?.[1])||-122.4194;
    const map=L.map('ws-map').setView([lat,lon],13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OSM'}).addTo(map);
    const marker=L.marker([lat,lon],{draggable:true}).addTo(map); marker.on('dragend',()=>{const p=marker.getLatLng(); lat=p.lat; lon=p.lng;});
    const locate=document.createElement('button'); locate.className='btn'; locate.textContent='📍 Use my location'; locate.onclick=()=>centerMapOnUser(map); body.append(locate);
    save.onclick=()=>{ if(card){ card.where=where.value.trim(); card.coords=[lat,lon]; } ws.classList.add('hidden'); };
  }

  if(kind==='date'){
    title.textContent='When';
    const input=document.createElement('input'); input.placeholder='e.g., "daily 06:00", "Evening", "weekly Sunday"'; input.value=card?.when||'';
    const ics=document.createElement('button'); ics.className='btn'; ics.textContent='📅 Add to calendar (.ics)'; ics.onclick=()=>addToCalendar(card);
    body.append(input, ics);
    save.onclick=()=>{ if(card) card.when=input.value.trim(); ws.classList.add('hidden'); };
  }

  if(kind==='library'){
    title.textContent='Library';
    body.innerHTML = `
      <div class="card comfy"><div class="card-inner"><b>Video</b> (mp4/webm) — placeholder</div></div>
      <div class="card comfy"><div class="card-inner"><b>Audio</b> (mp3/m4a) — placeholder</div></div>
      <div class="card comfy"><div class="card-inner"><b>Pictures</b> (jpg/png) — placeholder</div></div>
      <div class="card comfy"><div class="card-inner"><b>PDF</b> — viewer placeholder</div></div>
      <div class="card comfy"><div class="card-inner"><b>Form</b> — fields placeholder</div></div>
      <div class="card comfy"><div class="card-inner"><b>Spreadsheet</b> — CSV preview placeholder</div></div>`;
    save.onclick=()=>{ ws.classList.add('hidden'); };
  }
}
