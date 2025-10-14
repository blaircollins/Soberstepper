
import { loadConfig } from './modules/sys.js';
import { initState, setPref, getPref } from './modules/state.js';
import { loadCards, renderList } from './modules/cardsView.js';
import { openWorkspace } from './modules/workspace.js';

(async function init(){
  const cfg = await loadConfig();
  document.getElementById('app-ver').textContent = 'v'+cfg.appVersion;
  initState(cfg);
  await loadCards();
  document.querySelectorAll('.filters .chip').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.filters .chip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); renderList({ filter: btn.dataset.filter });
  }));
  document.querySelector('.settings .chip[data-size="compact"]').addEventListener('click',()=>{ setPref('size','compact'); renderList({}); });
  document.querySelector('.settings .chip[data-size="comfy"]').addEventListener('click',()=>{ setPref('size','comfy'); renderList({}); });
  document.querySelector('.settings .chip[data-theme="light"]').addEventListener('click',()=>{ document.body.classList.remove('theme-dark'); document.body.classList.add('theme-light'); setPref('theme','light'); });
  document.querySelector('.settings .chip[data-theme="dark"]').addEventListener('click',()=>{ document.body.classList.add('theme-dark'); document.body.classList.remove('theme-light'); setPref('theme','dark'); });
  document.querySelector('.settings .chip[data-open="library"]').addEventListener('click',()=>openWorkspace('library', null));
  renderList({});
})();