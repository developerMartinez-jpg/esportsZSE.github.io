// script.js - load config, apply to DOM, support ?edit unlocking
const CONFIG_PATH = 'data/config.json';
const LOCAL_KEY = 'zse_config_v2';
const EDIT_PASS = 'ZSEgoodTEAM';

const DEFAULT_CONFIG = {
  logo: 'assets/logo-placeholder.png',
  mainImage: 'assets/roster-placeholder.jpg',
  bgImage: '',
  creatorsImage: '',
  aboutTitle: 'About ZSE',
  aboutText: "Hello — we are <strong>ZSE</strong>, a competitive team that aims to perform at our very best. Our roster brings a lot of experience. This team was founded on <strong>November 16, 2025</strong> — but don’t be fooled by the date: we are serious competitors and we're going for everything.",
  discord: 'https://discord.gg/HgvUWuCqpj',
  tiktok: 'https://www.tiktok.com/@esportszse?_r=1&_t=ZN-921hdzI7DM6',
  primaryColor: '#7b3cff',
  accentColor: '#ff66b2',
  headingFont: 'Inter, system-ui',
  bodyFont: 'Inter, system-ui',
  siteTitle: 'ZSE — Official',
  footerLeft: '© ZSE — Competitive Brawl Stars Team',
  footerRight: 'Built from template — customized for ZSE'
};

async function fetchRemoteConfig(){
  try{
    const resp = await fetch(CONFIG_PATH + '?t=' + Date.now());
    if(!resp.ok) throw new Error('no remote');
    return await resp.json();
  }catch(e){
    return null;
  }
}

function loadLocal(){
  try{
    const raw = localStorage.getItem(LOCAL_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(e){ return null; }
}

function saveLocal(cfg){
  localStorage.setItem(LOCAL_KEY, JSON.stringify(cfg));
}

function applyConfig(cfg){
  cfg = Object.assign({}, DEFAULT_CONFIG, cfg || {});
  // styles
  document.documentElement.style.setProperty('--purple', cfg.primaryColor);
  document.documentElement.style.setProperty('--pink', cfg.accentColor);
  if(cfg.bgImage) document.body.style.backgroundImage = `url("${cfg.bgImage}")`;

  // content
  const logoImg = document.getElementById('logoImg');
  const mainImg = document.getElementById('mainImg');
  const creatorsBox = document.getElementById('creatorsBox');
  const aboutTitle = document.getElementById('aboutTitle');
  const aboutText = document.getElementById('aboutText');
  const discordLink = document.getElementById('discordLink');
  const tiktokLink = document.getElementById('tiktokLink');
  const teamName = document.getElementById('teamName');

  if(cfg.logo){ logoImg.src = cfg.logo; } else { logoImg.removeAttribute('src'); }
  if(cfg.mainImage){ mainImg.src = cfg.mainImage; } else { mainImg.removeAttribute('src'); }
  if(cfg.creatorsImage){
    creatorsBox.innerHTML = '';
    const img = document.createElement('img');
    img.src = cfg.creatorsImage; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover'; img.style.borderRadius='8px';
    img.onerror = ()=>{ creatorsBox.textContent = 'IMAGE FAILED TO LOAD'; creatorsBox.style.background='#111' }
    creatorsBox.appendChild(img);
  } else {
    creatorsBox.innerHTML = 'COMING SOON'; creatorsBox.style.background='#0b0b0b';
  }
  aboutTitle.textContent = cfg.aboutTitle;
  aboutText.innerHTML = cfg.aboutText;
  discordLink.href = cfg.discord;
  tiktokLink.href = cfg.tiktok;
  document.title = cfg.siteTitle;
  document.getElementById('footerLeft').textContent = cfg.footerLeft;
  document.getElementById('footerRight').textContent = cfg.footerRight;
}

(async function init(){
  // 1) try remote config (data/config.json)
  const remote = await fetchRemoteConfig();
  const local = loadLocal();
  const cfg = remote || local || DEFAULT_CONFIG;
  applyConfig(cfg);
})();

// If URL contains ?edit -> prompt password and open admin.html in new tab
(function autoOpenAdmin(){
  const params = new URLSearchParams(window.location.search);
  if(params.has('edit')){
    setTimeout(()=>{
      const pw = prompt('Enter editor password:');
      if(pw === EDIT_PASS){
        // open admin panel (admin.html) in same origin
        window.open('admin.html','_self');
      } else {
        alert('Wrong password.');
      }
    }, 250);
  }
})();
