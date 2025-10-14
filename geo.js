
export function askForLocation(onOk,onFail){
  if(!('geolocation' in navigator)){ onFail?.('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(
    pos=>onOk?.(pos.coords),
    err=>onFail?.(err.code===1?'Permission denied':'Location unavailable'),
    { enableHighAccuracy:true, timeout:10000, maximumAge:0 }
  );
}
export function centerMapOnUser(map){
  askForLocation(
    coords=>{ const latlng=[coords.latitude, coords.longitude]; map.setView(latlng,15); L.marker(latlng,{draggable:true}).addTo(map); },
    msg=>alert('Location error: '+msg+'\\nTip: allow location for this site/app.')
  );
}
