// admin.js - editor logic (works with script.js DEFAULT_CONFIG)
const LOCAL_KEY = 'zse_config_v2';
const CONFIG_PATH = 'data/config.json';

const el = id => document.getElementById(id);

function loadLocal(){ try{ const r=localStorage.getItem(LOCAL_KEY); return r?JSON.parse(r):null }catch(e){return null} }
function saveLocal(cfg){ localStorage.setItem(LOCAL_KEY, JSON.stringify(cfg)); alert('Saved locally'); }

function getForm(){
  return {
    logo: el('logo').value.trim(),
    mainImage: el('mainImage').value.trim(),
    bgImage: el('bgImage').value.trim(),
    creatorsImage: el('creators').value.trim(),
    aboutTitle: 'About ZSE',
    aboutText: el('about').value.trim(),
    discord: el('discord').value.trim(),
    tiktok: el('tiktok').value.trim(),
    primaryColor: '#7b3cff',
    accentColor: '#ff66b2',
    siteTitle: el('siteTitle').value.trim() || 'ZSE — Official',
    footerLeft: '© ZSE — Competitive Brawl Stars Team',
    footerRight: 'Built from template — customized for ZSE'
  };
}

function applyPreview(cfg){
  saveLocal(cfg); // helper so index.html picks it up from localStorage
  // reload iframe to reflect changes
  const ifr = document.getElementById('preview');
  ifr.contentWindow.location.reload();
}

document.getElementById('apply').addEventListener('click', ()=>{
  const c = getForm();
  applyPreview(c);
});

// fill inputs from local or default
(function init(){
  const cfg = loadLocal();
  if(cfg){
    el('logo').value = cfg.logo || '';
    el('mainImage').value = cfg.mainImage || '';
    el('bgImage').value = cfg.bgImage || '';
    el('creators').value = cfg.creatorsImage || '';
    el('about').value = cfg.aboutText || '';
    el('discord').value = cfg.discord || '';
    el('tiktok').value = cfg.tiktok || '';
    el('siteTitle').value = cfg.siteTitle || '';
  }
})();

// Save locally
document.getElementById('saveLocal').addEventListener('click', ()=>{
  saveLocal(getForm());
  alert('Saved locally. Use Export to copy JSON or Save to GitHub to push.');
});

// Export JSON
document.getElementById('export').addEventListener('click', ()=>{
  const raw = localStorage.getItem(LOCAL_KEY) || JSON.stringify(getForm(), null, 2);
  el('exportText').value = raw;
  document.getElementById('exportArea').style.display = 'block';
});
document.getElementById('closeExport').addEventListener('click', ()=>{ document.getElementById('exportArea').style.display='none'; });
document.getElementById('copyExport').addEventListener('click', ()=>{ el('exportText').select(); document.execCommand('copy'); alert('Copied'); });

// Import JSON
document.getElementById('importBtn').addEventListener('click', ()=>{ document.getElementById('importArea').style.display='block'; });
document.getElementById('closeImport').addEventListener('click', ()=>{ document.getElementById('importArea').style.display='none'; });
document.getElementById('doImport').addEventListener('click', ()=>{
  try{
    const raw = el('importText').value;
    const obj = JSON.parse(raw);
    saveLocal(obj);
    alert('Imported and saved locally. Preview updated.');
    document.getElementById('preview').contentWindow.location.reload();
    document.getElementById('importArea').style.display='none';
  }catch(e){ alert('Import failed: '+e.message); }
});

// Reset
document.getElementById('reset').addEventListener('click', ()=>{
  if(!confirm('Reset local config to defaults?')) return;
  localStorage.removeItem(LOCAL_KEY);
  alert('Local config removed. Preview shows defaults.');
  document.getElementById('preview').contentWindow.location.reload();
});

// Push to GitHub (PUT to contents API) - prompts for owner/repo/branch/path/token
document.getElementById('pushGit').addEventListener('click', async ()=>{
  if(!confirm('This will create/update data/config.json in your GitHub repo. Proceed?')) return;
  const owner = prompt('GitHub owner (user or org):');
  if(!owner) return alert('Owner required');
  const repo = prompt('Repository name:');
  if(!repo) return alert('Repo required');
  const branch = prompt('Branch (default: main):') || 'main';
  const path = prompt('Path to save (default: data/config.json):') || 'data/config.json';
  const token = prompt('Paste your GitHub Personal Access Token (it will not be stored):');
  if(!token) return alert('Token required');

  // prepare content
  const cfg = getForm();
  const contentB64 = btoa(unescape(encodeURIComponent(JSON.stringify(cfg, null, 2))));
  const api = https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)};

  // check existing
  try{
    let sha = null;
    let check = await fetch(api + ?ref=${branch}, { headers: { Authorization: 'token ' + token, Accept:'application/vnd.github.v3+json' }});
    if(check.status === 200){
      const j = await check.json(); sha = j.sha;
    }

    const body = { message: 'Update site config (editor)', content: contentB64, branch };
    if(sha) body.sha = sha;

    const resp = await fetch(api, { method:'PUT', headers:{ Authorization: 'token ' + token, 'Content-Type':'application/json', Accept:'application/vnd.github.v3+json' }, body: JSON.stringify(body) });
    const j = await resp.json();
    if(resp.ok) alert('Pushed to GitHub. Commit: ' + (j.commit ? j.commit.sha : 'unknown'));
    else alert('GitHub error: ' + (j.message || JSON.stringify(j)));
  }catch(e){ alert('Error: '+e.message) }
});
