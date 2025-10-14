
export function addToCalendar(card){
  let start=new Date(Date.now()+60*60*1000);
  const m=(card?.when||"").match(/(\d{1,2}):(\d{2})/); if(m){ start.setHours(parseInt(m[1],10), parseInt(m[2],10),0,0); }
  const end=new Date(start.getTime()+30*60*1000);
  const pad=n=>String(n).padStart(2,'0');
  const toICS=d=> d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';
  const uid='ss-'+Math.random().toString(36).slice(2)+'@soberstepper';
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SoberStepper//EN','BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+toICS(new Date()),'DTSTART:'+toICS(start),'DTEND:'+toICS(end),'SUMMARY:'+((card?.title||'SoberStepper').replace(/\\n/g,' ')), (card?.where?('LOCATION:'+card.where.replace(/\\n/g,' ')):''),'DESCRIPTION:'+ ((card?.notes||'').replace(/\\n/g,' ')),'END:VEVENT','END:VCALENDAR'].filter(Boolean).join('\\r\\n');
  const blob=new Blob([ics],{type:'text/calendar'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=((card?.title)||'soberstepper')+'.ics'; a.click(); URL.revokeObjectURL(url);
}
