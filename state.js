
const KEY='soberstepper.state.v148';
let state={prefs:{size:'comfy',theme:'light'}, actions:[]};
export function initState(cfg){ try{ state = JSON.parse(localStorage.getItem(KEY)) || state; }catch{} if(cfg?.appVersion) state.version = cfg.appVersion; if(state.prefs?.theme==='dark'){ document.body.classList.add('theme-dark'); } localStorage.setItem(KEY, JSON.stringify(state)); }
export function setPref(k,v){ state.prefs = state.prefs||{}; state.prefs[k]=v; localStorage.setItem(KEY, JSON.stringify(state)); }
export function getPref(k){ return (state.prefs||{})[k]; }
export function logAction(entry){ state.actions.push({...entry, t: new Date().toISOString()}); localStorage.setItem(KEY, JSON.stringify(state)); }
