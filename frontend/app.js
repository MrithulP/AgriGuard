const state = {
  token: localStorage.getItem("fg_token"),
  user: null,
  language: localStorage.getItem("fg_lang") || "en",
  crops: [],
  farms: [],
  selectedCrop: null,
  dashboard: null,
  page: "home",
  authMode: "login",
  adminTab: "crops",
  admin: { crops: [], pests: [], solutions: [], overview: null },
  alerts: [],
  accountMenu: false,
  alertFilter: "all"
};

const T = {
  en: {
    app:"AgriGuard", tagline:"Smart crop protection, made simple.", home:"Home", crops:"My Crops", alerts:"Alerts", settings:"Settings", admin:"Admin",
    welcome:"Good evening", overview:"Your farm overview", addCrop:"Add crop", activeCrops:"Active crops", risk:"Overall pest risk", sensor:"Field sensor",
    online:"Online", updated:"Updated just now", low:"Low", medium:"Medium", high:"High", viewDetails:"View details", noCrops:"No crops added yet", addFirst:"Add your first crop",
    planted:"Planted", stage:"Growth stage", area:"Area", report:"Crop report", threats:"Current threats", recommendations:"Recommended actions", why:"Why this risk?",
    weather:"Weather", soil:"Soil conditions", temperature:"Temperature", humidity:"Humidity", moisture:"Soil moisture", rainfall:"Rainfall", forecast:"Forecast",
    natural:"Natural", biological:"Biological", chemical:"Chemical", alertsTitle:"Alerts & updates", noAlerts:"No urgent alerts right now.", language:"Language", selectLanguage:"Select language",
    save:"Save", cancel:"Cancel", addNewCrop:"Add a crop", cropType:"Crop", plantingDate:"Planting date", growthStage:"Growth stage", areaAcres:"Area (acres)", choose:"Choose a crop",
    growing:"Growing", seedling:"Seedling", flowering:"Flowering", harvesting:"Harvesting", planned:"Planned", simulate:"Refresh demo sensor data", logout:"Log out", removeCrop:"Remove crop", removeCropConfirm:"Remove this crop from your active crops? You can add it again later if needed.", login:"Log in", register:"Create account",
    username:"Username", password:"Password", name:"Your name", create:"Create account", demo:"Demo farmer: farmer / 12345678", adminDemo:"Admin: admin / Admin123!", adminTitle:"Knowledge base", addKnowledgeCrop:"Add crop to knowledge base", manageCrops:"Manage crop catalogue",
    back:"Back", symptoms:"Common signs", confidence:"Model confidence", probability:"Risk probability", sensorDemo:"Demo data is simulated for now.", noSolutions:"No published recommendation for this severity yet.",
    reportSummary:"AgriGuard combines crop stage, local sensor readings and weather conditions to estimate pest risk. IoT hardware can be connected later without changing the farmer workflow."
  },
  hi: {
    app:"AgriGuard", tagline:"फसल सुरक्षा, आसान तरीके से।", home:"होम", crops:"मेरी फसलें", alerts:"अलर्ट", settings:"सेटिंग्स", admin:"एडमिन", welcome:"शुभ संध्या", overview:"आपके खेत का सारांश",
    addCrop:"फसल जोड़ें", activeCrops:"सक्रिय फसलें", risk:"कुल कीट जोखिम", sensor:"फील्ड सेंसर", online:"ऑनलाइन", updated:"अभी अपडेट हुआ", low:"कम", medium:"मध्यम", high:"अधिक", viewDetails:"विवरण देखें",
    noCrops:"अभी कोई फसल नहीं जोड़ी गई है", addFirst:"पहली फसल जोड़ें", planted:"बुवाई", stage:"फसल अवस्था", area:"क्षेत्र", report:"फसल रिपोर्ट", threats:"वर्तमान खतरे", recommendations:"सुझाए गए कदम", why:"जोखिम क्यों?",
    weather:"मौसम", soil:"मिट्टी की स्थिति", temperature:"तापमान", humidity:"नमी", moisture:"मिट्टी की नमी", rainfall:"वर्षा", forecast:"पूर्वानुमान", natural:"प्राकृतिक", biological:"जैविक", chemical:"रासायनिक",
    alertsTitle:"अलर्ट और अपडेट", noAlerts:"अभी कोई जरूरी अलर्ट नहीं है।", language:"भाषा", selectLanguage:"भाषा चुनें", save:"सहेजें", cancel:"रद्द करें", addNewCrop:"फसल जोड़ें", cropType:"फसल",
    plantingDate:"बुवाई की तारीख", growthStage:"फसल अवस्था", areaAcres:"क्षेत्र (एकड़)", choose:"फसल चुनें", growing:"बढ़वार", seedling:"अंकुर", flowering:"फूल", harvesting:"कटाई", planned:"योजना", simulate:"डेमो सेंसर डेटा अपडेट करें", logout:"लॉग आउट", removeCrop:"फसल हटाएं", removeCropConfirm:"क्या आप इस फसल को अपनी सक्रिय फसलों से हटाना चाहते हैं?",
    login:"लॉग इन", register:"खाता बनाएं", username:"यूज़रनेम", password:"पासवर्ड", name:"आपका नाम", create:"खाता बनाएं", demo:"डेमो किसान: farmer / 12345678", adminDemo:"एडमिन: admin / Admin123!", adminTitle:"ज्ञान आधार", addKnowledgeCrop:"ज्ञान आधार में फसल जोड़ें", manageCrops:"फसल सूची प्रबंधित करें",
    back:"वापस", symptoms:"सामान्य लक्षण", confidence:"मॉडल भरोसा", probability:"जोखिम संभावना", sensorDemo:"अभी डेमो डेटा दिखाया जा रहा है।", noSolutions:"इस गंभीरता के लिए अभी कोई समाधान प्रकाशित नहीं है।",
    reportSummary:"AgriGuard फसल अवस्था, स्थानीय सेंसर और मौसम की जानकारी से कीट जोखिम का अनुमान लगाता है। IoT हार्डवेयर बाद में जोड़ा जा सकता है।"
  },
  pa: {
    app:"AgriGuard", tagline:"ਫਸਲਾਂ ਦੀ ਸੁਰੱਖਿਆ, ਆਸਾਨ ਤਰੀਕੇ ਨਾਲ।", home:"ਹੋਮ", crops:"ਮੇਰੀਆਂ ਫਸਲਾਂ", alerts:"ਅਲਰਟ", settings:"ਸੈਟਿੰਗਾਂ", admin:"ਐਡਮਿਨ", welcome:"ਸਤ ਸ੍ਰੀ ਅਕਾਲ", overview:"ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਸੰਖੇਪ",
    addCrop:"ਫਸਲ ਸ਼ਾਮਲ ਕਰੋ", activeCrops:"ਚੱਲ ਰਹੀਆਂ ਫਸਲਾਂ", risk:"ਕੁੱਲ ਕੀਟ ਖਤਰਾ", sensor:"ਫੀਲਡ ਸੈਂਸਰ", online:"ਆਨਲਾਈਨ", updated:"ਹੁਣੇ ਅਪਡੇਟ", low:"ਘੱਟ", medium:"ਦਰਮਿਆਨਾ", high:"ਵੱਧ", viewDetails:"ਵੇਰਵੇ ਵੇਖੋ",
    noCrops:"ਅਜੇ ਕੋਈ ਫਸਲ ਨਹੀਂ", addFirst:"ਪਹਿਲੀ ਫਸਲ ਸ਼ਾਮਲ ਕਰੋ", planted:"ਬੀਜਾਈ", stage:"ਫਸਲ ਅਵਸਥਾ", area:"ਖੇਤਰ", report:"ਫਸਲ ਰਿਪੋਰਟ", threats:"ਮੌਜੂਦਾ ਖਤਰੇ", recommendations:"ਸੁਝਾਏ ਕਦਮ", why:"ਇਹ ਖਤਰਾ ਕਿਉਂ?",
    weather:"ਮੌਸਮ", soil:"ਮਿੱਟੀ ਦੀ ਸਥਿਤੀ", temperature:"ਤਾਪਮਾਨ", humidity:"ਨਮੀ", moisture:"ਮਿੱਟੀ ਦੀ ਨਮੀ", rainfall:"ਵਰਖਾ", forecast:"ਪੂਰਵ ਅਨੁਮਾਨ", natural:"ਕੁਦਰਤੀ", biological:"ਜੈਵਿਕ", chemical:"ਰਸਾਇਣਕ",
    alertsTitle:"ਅਲਰਟ ਅਤੇ ਅਪਡੇਟ", noAlerts:"ਇਸ ਵੇਲੇ ਕੋਈ ਜ਼ਰੂਰੀ ਅਲਰਟ ਨਹੀਂ।", language:"ਭਾਸ਼ਾ", selectLanguage:"ਭਾਸ਼ਾ ਚੁਣੋ", save:"ਸੇਵ", cancel:"ਰੱਦ", addNewCrop:"ਫਸਲ ਸ਼ਾਮਲ ਕਰੋ", cropType:"ਫਸਲ",
    plantingDate:"ਬੀਜਾਈ ਦੀ ਤਾਰੀਖ", growthStage:"ਫਸਲ ਅਵਸਥਾ", areaAcres:"ਖੇਤਰ (ਏਕੜ)", choose:"ਫਸਲ ਚੁਣੋ", growing:"ਵਧ ਰਹੀ", seedling:"ਬੂਟਾ", flowering:"ਫੁੱਲ", harvesting:"ਕਟਾਈ", planned:"ਯੋਜਨਾ", simulate:"ਡੈਮੋ ਸੈਂਸਰ ਡਾਟਾ ਅਪਡੇਟ ਕਰੋ", logout:"ਲੌਗ ਆਉਟ", removeCrop:"ਫਸਲ ਹਟਾਓ", removeCropConfirm:"ਕੀ ਤੁਸੀਂ ਇਸ ਫਸਲ ਨੂੰ ਆਪਣੀਆਂ ਸਰਗਰਮ ਫਸਲਾਂ ਵਿੱਚੋਂ ਹਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
    login:"ਲੌਗ ਇਨ", register:"ਖਾਤਾ ਬਣਾਓ", username:"ਯੂਜ਼ਰਨੇਮ", password:"ਪਾਸਵਰਡ", name:"ਤੁਹਾਡਾ ਨਾਮ", create:"ਖਾਤਾ ਬਣਾਓ", demo:"ਡੈਮੋ ਕਿਸਾਨ: farmer / 12345678", adminDemo:"ਐਡਮਿਨ: admin / Admin123!", adminTitle:"ਗਿਆਨ ਅਧਾਰ", addKnowledgeCrop:"ਗਿਆਨ ਅਧਾਰ ਵਿੱਚ ਫਸਲ ਸ਼ਾਮਲ ਕਰੋ", manageCrops:"ਫਸਲ ਸੂਚੀ ਪ੍ਰਬੰਧਿਤ ਕਰੋ",
    back:"ਵਾਪਸ", symptoms:"ਆਮ ਲੱਛਣ", confidence:"ਮਾਡਲ ਭਰੋਸਾ", probability:"ਖਤਰੇ ਦੀ ਸੰਭਾਵਨਾ", sensorDemo:"ਫਿਲਹਾਲ ਡੈਮੋ ਡਾਟਾ ਵਰਤਿਆ ਜਾ ਰਿਹਾ ਹੈ।", noSolutions:"ਇਸ ਗੰਭੀਰਤਾ ਲਈ ਹਾਲੇ ਕੋਈ ਹੱਲ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਹੈ।",
    reportSummary:"AgriGuard ਫਸਲ ਅਵਸਥਾ, ਸਥਾਨਕ ਸੈਂਸਰ ਅਤੇ ਮੌਸਮ ਦੇ ਆਧਾਰ 'ਤੇ ਕੀਟ ਖਤਰੇ ਦਾ ਅਨੁਮਾਨ ਲਗਾਉਂਦਾ ਹੈ। IoT ਹਾਰਡਵੇਅਰ ਬਾਅਦ ਵਿੱਚ ਜੋੜਿਆ ਜਾ ਸਕਦਾ ਹੈ।"
  }
};

const t = k => (T[state.language] || T.en)[k] || T.en[k] || k;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function relativeTime(ts){
  if(!ts) return t('updated');
  const d=new Date(ts), diff=Math.max(0, Date.now()-d.getTime());
  const mins=Math.floor(diff/60000);
  if(mins<1) return state.language==='en'?'Just now':state.language==='hi'?'अभी':'ਹੁਣੇ';
  if(mins<60) return `${mins}m`;
  const hrs=Math.floor(mins/60);
  if(hrs<24) return `${hrs}h`;
  return `${Math.floor(hrs/24)}d`;
}
const api = async (url, options={}) => {
  options.headers = {...(options.headers||{}), ...(state.token ? {"Authorization":"Bearer "+state.token}: {})};
  const r = await fetch(url, options);
  const data = await r.json().catch(()=>({detail:"Request failed"}));
  if (!r.ok) throw new Error(data.detail || "Request failed");
  return data;
};
function severityClass(s){ return (s||"").toLowerCase(); }
function iconForCrop(c){ return c==="Rice" ? "🌾" : c==="Wheat" ? "🌿" : "🌱"; }
function navIcon(name){
  const icons={
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6"/></svg>',
    crops:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V7"/><path d="M12 12c-4.8 0-7-2.3-7-6 4.7 0 7 2.2 7 6ZM12 9c0-4 2.3-6 7-6 0 3.8-2.3 6-7 6Z"/></svg>',
    alerts:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>',
    settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="m19.4 15 .1.1 1.7 1.3-1.8 3.1-2-.8-.1.1a7.8 7.8 0 0 1-1.8 1l-.3 2.1h-3.6l-.3-2.1a8 8 0 0 1-1.8-1l-.1-.1-2 .8-1.8-3.1L7.3 15a8 8 0 0 1-.1-2 8 8 0 0 1 .1-2L5.6 9.7l1.8-3.1 2 .8.1-.1a8 8 0 0 1 1.8-1l.3-2.1h3.6l.3 2.1a8 8 0 0 1 1.8 1l.1.1 2-.8 1.8 3.1-1.7 1.3-.1.1a8 8 0 0 1 .1 2 8 8 0 0 1-.1 2Z"/></svg>',
    admin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.3 8.3-8 10-4.7-1.7-8-5-8-10V6l8-3Z"/><path d="M9 12h6M12 9v6"/></svg>',
    sensor:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M4 9v6M20 9v6M9 4h6M9 20h6"/></svg>',
    warning:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 20H3L12 4Z"/><path d="M12 9v5M12 17h.01"/></svg>',
    danger:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></svg>',
    check:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5"/></svg>',
    logout:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4M18 12H9"/></svg>',
    trash:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>',
    globe:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9s-1.1 6.5-3.5 9c-2.4-2.5-3.5-5.5-3.5-9S9.6 5.5 12 3Z"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.8-4L3 10"/><path d="M3 5v5h5"/><path d="M4 13a8 8 0 0 0 14.8 4L21 14"/><path d="M21 19v-5h-5"/></svg>'
  }; return icons[name]||icons.home;
}

function shell(content){
  const isAdmin = state.user?.role === "admin";
  const alertCount = state.alerts?.length || 0;
  const mobileNav = `
    <nav class="mobile-nav" aria-label="Primary navigation">
      <button class="${state.page==='home'?'active':''}" onclick="go('home')" aria-label="${t('home')}">${navIcon('home')}<span>${t('home')}</span></button>
      ${!isAdmin ? `<button class="${state.page==='crops'?'active':''}" onclick="go('crops')" aria-label="${t('crops')}">${navIcon('crops')}<span>${t('crops')}</span></button>` : ""}
      <button class="mobile-alert-nav ${state.page==='alerts'?'active':''}" onclick="go('alerts')" aria-label="${t('alerts')}">${navIcon('alerts')}${alertCount?`<b class="mobile-nav-badge">${alertCount>9?'9+':alertCount}</b>`:''}<span>${t('alerts')}</span></button>
      <button class="${state.page==='settings'?'active':''}" onclick="go('settings')" aria-label="${t('settings')}">${navIcon('settings')}<span>${t('settings')}</span></button>
      ${isAdmin ? `<button class="${state.page==='admin'?'active':''}" onclick="go('admin')" aria-label="${t('admin')}">${navIcon('admin')}<span>${t('admin')}</span></button>` : ''}
    </nav>`;

  const accountMenu = `
    <div class="account-menu ${state.accountMenu?'open':''}" role="menu" aria-hidden="${!state.accountMenu}">
      <div class="account-menu-head">
        <span class="account-menu-avatar">${esc((state.user?.name||"F").slice(0,1).toUpperCase())}</span>
        <div><strong>${esc(state.user?.name||"Farmer")}</strong><small>@${esc(state.user?.username||"")}</small></div>
      </div>
      <div class="account-menu-divider"></div>
      <button role="menuitem" onclick="state.accountMenu=false;go('settings')">${navIcon('settings')}<span>${t('settings')}</span></button>
      <button role="menuitem" class="account-menu-logout" onclick="logout()">${navIcon('logout')}<span>${t('logout')}</span></button>
    </div>`;

  return `<div class="app-shell" onclick="closeAccountMenu(event)">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">🌱</div><div><strong>AgriGuard</strong><span>Crop protection</span></div></div>
      <nav>
        <button class="${state.page==='home'?'active':''}" onclick="go('home')">${navIcon('home')} <span>${t('home')}</span></button>
        ${!isAdmin ? `<button class="${state.page==='crops'?'active':''}" onclick="go('crops')">${navIcon('crops')} <span>${t('crops')}</span></button>` : ""}
        <button class="${state.page==='alerts'?'active':''}" onclick="go('alerts')">${navIcon('alerts')} <span>${t('alerts')}</span>${alertCount?`<b class="nav-dot">${alertCount>9?'9+':alertCount}</b>`:''}</button>
        <button class="${state.page==='settings'?'active':''}" onclick="go('settings')">${navIcon('settings')} <span>${t('settings')}</span></button>
        ${isAdmin ? `<button class="${state.page==='admin'?'active':''}" onclick="go('admin')">${navIcon('admin')} <span>${t('admin')}</span></button>` : ''}
      </nav>
      <div class="sidebar-bottom"><div class="sidebar-language">${navIcon('globe')}<span>${state.language==='en'?'English':state.language==='hi'?'हिन्दी':'ਪੰਜਾਬੀ'}</span></div></div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="mobile-brand"><div class="brand-mark">🌱</div><strong>AgriGuard</strong></div>
        <div class="top-actions">
          <button class="icon-btn notification-btn" onclick="go('alerts')" aria-label="${t('alerts')}">${navIcon('alerts')}${alertCount?`<span class="tiny-dot"></span>`:''}</button>
          <button class="profile" onclick="toggleAccountMenu(event)" aria-haspopup="menu" aria-expanded="${state.accountMenu}">
            <span>${esc((state.user?.name||"Farmer").slice(0,1).toUpperCase())}</span>
            <div><strong>${esc(state.user?.name||"Farmer")}</strong><small>@${esc(state.user?.username||"")}</small></div>
          </button>
          ${accountMenu}
        </div>
      </header>
      <div class="content">${content}</div>
    </main>
    ${mobileNav}
  </div>`;
}
async function loadBase(){
  state.accountMenu=false;
  state.user = await api("/api/me");
  if(state.page === "admin" && state.user.role !== "admin") state.page = "home";
  state.language = localStorage.getItem("fg_lang") || state.user.language || "en";
  state.user.language = state.language;
  localStorage.setItem("fg_lang", state.language);
  state.farms = await api("/api/farms");
  state.crops = await api("/api/crops");
  state.alerts = await api("/api/alerts");
}

async function render(){
  if(!state.token) return renderAuth();
  try { await loadBase(); } catch(e){ localStorage.removeItem("fg_token"); state.token=null; state.user=null; return renderAuth(); }
  if(state.page==="home") return renderHome();
  if(state.page==="crops") {
    if(state.user.role === "admin") { state.page="admin"; return renderAdmin(); }
    return renderCrops();
  }
  if(state.page==="alerts") return renderAlerts();
  if(state.page==="settings") return renderSettings();
  if(state.page==="admin" && state.user.role === "admin") return renderAdmin();
  if(state.page==="crop") return renderCropDashboard();
  state.page="home"; return renderHome();
}

function renderAuth(){
  document.getElementById("app").innerHTML = `<div class="auth-page"><div class="auth-visual"><div class="auth-brand">🌱 AgriGuard</div><div class="auth-copy"><span class="eyebrow">SMART CROP PROTECTION</span><h1>Protect your crop before the problem grows.</h1><p>Simple pest-risk insights for rice, wheat and future crops, designed around the farmer.</p><div class="auth-pills"><span>🌾 Rice</span><span>🌿 Wheat</span><span>🌤 Weather</span><span>📡 IoT-ready</span></div></div></div>
    <div class="auth-panel"><div class="language-select"><label>🌐 ${t('selectLanguage')}</label><select onchange="changeLang(this.value)"><option value="en" ${state.language==='en'?'selected':''}>English</option><option value="hi" ${state.language==='hi'?'selected':''}>हिन्दी</option><option value="pa" ${state.language==='pa'?'selected':''}>ਪੰਜਾਬੀ</option></select></div>
    <div class="auth-card"><div class="brand-mark large">🌱</div><h2>${state.authMode==='register'?t('register'):t('login')}</h2><p class="muted">${state.authMode==='register'?'Create your AgriGuard account.':'Welcome back to your farm dashboard.'}</p>
    <form onsubmit="authSubmit(event)">${state.authMode==='register'?`<label>${t('name')}<input id="authName" required placeholder="e.g. Gurpreet Singh"></label>`:''}<label>${t('username')}<input id="authUsername" required autocomplete="username" placeholder="e.g. gurpreet"></label><label>${t('password')}<input id="authPassword" required type="password" autocomplete="current-password" placeholder="••••••••"></label><button class="primary wide">${state.authMode==='register'?t('create'):t('login')} →</button></form>
    <button class="link-btn" onclick="state.authMode=state.authMode==='register'?'login':'register';renderAuth()">${state.authMode==='register'?'Already have an account? Log in':'New to AgriGuard? Create an account'}</button>
    <div class="demo-note">${t('demo')}<br>${t('adminDemo')}</div></div></div></div>`;
}

async function authSubmit(e){
  e.preventDefault();
  const nameEl=document.getElementById('authName');
  const userEl=document.getElementById('authUsername');
  const passEl=document.getElementById('authPassword');
  try{
    if(state.authMode==="register"){
      const name=nameEl?.value.trim()||"", username=userEl.value.trim(), password=passEl.value;
      if(name.length<2) throw new Error("Please enter your name.");
      if(username.length<3) throw new Error("Username must be at least 3 characters.");
      if(password.length<6) throw new Error("Password must be at least 6 characters.");
      await api("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,username,password,language:state.language})});
      showPrompt("Account created successfully. Please log in.", {type:"success", title:"Account created"}); state.authMode="login"; renderAuth();
    }else{
      const d=await api("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:userEl.value.trim(),password:passEl.value})});
      state.token=d.token; state.user=d.user; state.accountMenu=false; state.language=d.user.language||state.language; localStorage.setItem("fg_token",d.token); localStorage.setItem("fg_lang",state.language); state.page=d.user.role==="admin"?"admin":"home"; render();


    }
  }catch(e){showPrompt(e.message, {type:"error", title:"Couldn’t complete that"});}
}

function addCropAction(){
  return state.user?.role === "admin" ? "openAdminCrop()" : "openAddCrop()";
}
function addCropLabel(){
  return state.user?.role === "admin" ? t('addKnowledgeCrop') : t('addCrop');
}
function renderHome(){
  const addAction=addCropAction(), addLabel=addCropLabel();
  const adminHomeNote=state.user?.role==="admin"
    ? `<section class="info-banner admin-home-note"><div class="info-icon">${navIcon('admin')}</div><div><strong>${t('manageCrops')}</strong><p>${t('addKnowledgeCrop')}</p></div><button class="secondary" onclick="openAdminCrop()">${t('viewDetails')} →</button></section>`
    : `<section class="info-banner"><div class="info-icon">💡</div><div><strong>AgriGuard prototype</strong><p>${t('sensorDemo')} ${t('reportSummary')}</p></div></section>`;
  document.getElementById("app").innerHTML=shell(`<section class="hero-row"><div><span class="eyebrow">${t('overview')}</span><h1>${t('welcome')}, ${esc(state.user.name.split(" ")[0])} 👋</h1><p class="muted">${t('tagline')}</p></div><button class="primary" onclick="${addAction}">＋ ${addLabel}</button></section>
    <section class="stat-grid"><div class="stat-card"><div class="stat-icon green">🌱</div><div><small>${t('activeCrops')}</small><strong>${state.crops.length}</strong><span>${state.user?.role==="admin"?"Farmer crop records":"Knowledge-base crops"}</span></div></div><div class="stat-card"><div class="stat-icon amber">⚠️</div><div><small>${t('risk')}</small><strong>Medium</strong><span>Demo prediction</span></div></div><div class="stat-card"><div class="stat-icon blue">📡</div><div><small>${t('sensor')}</small><strong>${t('online')}</strong><span>${t('updated')}</span></div></div></section>
    <section class="section-head"><div><h2>${t('crops')}</h2><p>${t('overview')}</p></div><button class="text-btn" onclick="go('crops')">${t('viewDetails')} →</button></section>
    <div class="crop-grid">${state.crops.map(c=>cropCard(c)).join("") || `<div class="empty-card"><div>🌱</div><h3>${t('noCrops')}</h3><p>${t('addFirst')}</p><button class="primary" onclick="${addAction}">＋ ${addLabel}</button></div>`}</div>
    ${adminHomeNote}`);
}

function cropCard(c){
  const risk=c.crop_type==="Rice"?"Medium":"Low";
  return `<article class="crop-card" onclick="openCrop(${c.id})"><div class="crop-art ${c.crop_type.toLowerCase().replace(/\s/g,'-')}"><span>${iconForCrop(c.crop_type)}</span><small>${esc(c.crop_type)}</small></div><div class="crop-body"><div class="row"><h3>${esc(c.crop_type)}</h3><span class="badge ${severityClass(risk)}">${risk}</span></div><p class="muted">${t('planted')} ${esc(c.planting_date)}</p><div class="progress-label"><span>${t('stage')}</span><b>${esc(c.growth_stage)}</b></div><div class="progress"><span style="width:${c.growth_stage==='Growing'?58:c.growth_stage==='Flowering'?78:30}%"></span></div><div class="card-footer crop-card-footer"><span>📐 ${c.area} acres</span><button class="remove-crop-btn" onclick="event.stopPropagation();removeCrop(${c.id})" aria-label="${t('removeCrop')}">${navIcon('trash')}<span>${t('removeCrop')}</span></button></div></div></article>`;
}

async function renderCrops(){
  const addAction=addCropAction(), addLabel=addCropLabel();
  const adminBanner=state.user?.role==="admin"
    ? `<section class="info-banner admin-home-note"><div class="info-icon">${navIcon('admin')}</div><div><strong>${t('manageCrops')}</strong><p>${t('addKnowledgeCrop')}</p></div><button class="secondary" onclick="openAdminCrop()">${t('viewDetails')} →</button></section>`
    : "";
  document.getElementById("app").innerHTML=shell(`<section class="hero-row"><div><span class="eyebrow">FARM</span><h1>${t('crops')}</h1><p class="muted">Track every active field from one place.</p></div><button class="primary" onclick="${addAction}">＋ ${addLabel}</button></section><div class="crop-grid">${state.crops.map(c=>cropCard(c)).join("") || `<div class="empty-card"><div>🌱</div><h3>${t('noCrops')}</h3><p>${t('addFirst')}</p><button class="primary" onclick="${addAction}">＋ ${addLabel}</button></div>`}</div>${adminBanner}`);
}

async function openCrop(id){state.selectedCrop=id;state.page="crop";state.dashboard=null;render();try{state.dashboard=await api(`/api/crop/${id}/dashboard`);renderCropDashboard();}catch(e){showPrompt(e.message, {type:"error", title:"Something went wrong"});}}

function renderCropDashboard(){
  const d=state.dashboard;if(!d){document.getElementById("app").innerHTML=shell(`<div class="loading">Loading crop dashboard…</div>`);return;}
  const p=d.prediction,s=d.sensor,w=d.weather,sev=p?.severity||"Medium",pest=d.pest;
  document.getElementById("app").innerHTML=shell(`<div class="crop-page-top"><button class="back-btn" onclick="go('crops')">${navIcon('arrow')} <span>${t('back')}</span></button></div><section class="crop-title-row"><div class="crop-heading"><div class="big-crop-icon">${iconForCrop(d.crop.crop_type)}</div><div class="crop-heading-copy"><span class="eyebrow">${esc(d.crop.farm_name)}</span><h1>${esc(d.crop.crop_type)}</h1><p class="muted">${t('planted')} ${d.crop.planting_date} · ${d.crop.area} acres · ${esc(d.crop.growth_stage)}</p></div></div><div class="crop-actions"><button class="secondary refresh-sensor" onclick="simulate(${d.crop.id})">${navIcon('refresh')} <span>${t('simulate')}</span></button><button class="secondary danger-outline" onclick="removeCrop(${d.crop.id})">${navIcon('trash')} <span>${t('removeCrop')}</span></button></div></section>
  <div class="risk-hero ${severityClass(sev)}"><div><span class="eyebrow">PEST RISK</span><h2>${sev} risk</h2><p>${pest?esc(pest.name):'No current threat'}</p></div><div class="risk-number">${p?.probability||0}%<small>${t('probability')}</small></div></div>
  <section class="metric-grid"><div class="metric"><span>🌡️</span><small>${t('temperature')}</small><strong>${s?.temperature??'—'}°C</strong></div><div class="metric"><span>💧</span><small>${t('humidity')}</small><strong>${s?.humidity??'—'}%</strong></div><div class="metric"><span>🌱</span><small>${t('moisture')}</small><strong>${s?.soil_moisture??'—'}%</strong></div><div class="metric"><span>🌧️</span><small>${t('rainfall')}</small><strong>${w?.rainfall??'—'} mm</strong></div></section>
  <div class="two-col"><section class="panel"><div class="section-head compact"><div><h2>${t('threats')}</h2><p>Based on current demo conditions</p></div></div>${pest?`<div class="threat-card"><div class="threat-icon">🐛</div><div><h3>${esc(pest.name)}</h3><p>${esc(pest.description)}</p><div class="mini-stat"><b>${p.confidence}%</b> ${t('confidence')}</div></div></div><h4>${t('symptoms')}</h4><ul class="check-list">${pest.symptoms.map(x=>`<li>✓ ${esc(x.description)}</li>`).join("")}</ul>`:`<div class="empty-inline">No active threat detected.</div>`}</section>
  <section class="panel"><div class="section-head compact"><div><h2>${t('why')}</h2><p>Environmental signals</p></div></div><div class="reason"><span>💧</span><div><b>Humidity</b><p>${s?.humidity}% — humidity is included in the risk calculation.</p></div></div><div class="reason"><span>🌧️</span><div><b>Rainfall</b><p>${w?.rainfall} mm — recent rainfall is included in the risk calculation.</p></div></div><div class="reason"><span>🌱</span><div><b>Crop stage</b><p>${esc(d.crop.growth_stage)} — crop stage changes pest vulnerability.</p></div></div></section></div>
  <section class="panel"><div class="section-head compact"><div><h2>${t('recommendations')}</h2><p>Shown according to the current severity.</p></div></div><div class="solution-grid">${d.solutions.map(sol=>`<article class="solution ${sol.solution_type.toLowerCase()}"><div class="solution-top"><span class="solution-icon">${sol.solution_type==='Natural'?'🌿':sol.solution_type==='Biological'?'🦠':'🧪'}</span><span class="solution-type">${esc(sol.solution_type)}</span></div><h3>${esc(sol.title)}</h3><p>${esc(sol.description)}</p><details><summary>View instructions</summary><p>${esc(sol.instructions)}</p>${sol.warning?`<div class="warning">⚠ ${esc(sol.warning)}</div>`:''}</details><small>Source: ${esc(sol.source||'Verified agricultural guidance')}</small></article>`).join("")||`<div class="empty-inline">${t('noSolutions')}</div>`}</div></section>
  <section class="info-banner"><div class="info-icon">📡</div><div><strong>IoT-ready</strong><p>${t('sensorDemo')} The demo values are stored in the same sensor tables that the ESP32 will use later.</p></div></section>`);
}

async function simulate(id){try{await api(`/api/dev/simulate/${id}`,{method:"POST"});state.dashboard=await api(`/api/crop/${id}/dashboard`);renderCropDashboard();}catch(e){showPrompt(e.message, {type:"error", title:"Something went wrong"});}}
function alertSeverityLabel(severity){
  const s=(severity||"Info").toLowerCase();
  return s==="high" ? t('high') : s==="medium" ? t('medium') : s==="low" ? t('low') : (state.language==="hi"?"जानकारी":state.language==="pa"?"ਜਾਣਕਾਰੀ":"Info");
}
function alertIcon(a){
  if(a.type==='sensor') return navIcon('sensor');
  if((a.severity||'').toLowerCase()==='high') return navIcon('danger');
  if((a.severity||'').toLowerCase()==='medium') return navIcon('warning');
  return navIcon('check');
}
function renderAlerts(){
  const alerts=state.alerts||[];
  const filter=state.alertFilter||"all";
  const filtered=filter==="all" ? alerts : alerts.filter(a=>(a.severity||"").toLowerCase()===filter);
  const high=alerts.filter(a=>(a.severity||"").toLowerCase()==='high').length;
  const medium=alerts.filter(a=>(a.severity||"").toLowerCase()==='medium').length;
  const info=alerts.filter(a=>(a.type==='sensor'||(a.severity||"").toLowerCase()==='low')).length;
  const lastUpdated = new Date().toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});

  document.getElementById("app").innerHTML=shell(`
    <section class="alerts-page">
      <div class="alerts-top">
        <div>
          <span class="eyebrow">${t('alertsTitle')}</span>
          <h1>${t('alertsTitle')}</h1>
          <p class="muted">${state.language==='en'?'Stay informed about changes in crop risk, field conditions and sensor status.':state.language==='hi'?'फसल जोखिम, खेत की स्थिति और सेंसर की जानकारी पर नज़र रखें।':'ਫਸਲ ਦੇ ਖਤਰੇ, ਖੇਤ ਦੀ ਸਥਿਤੀ ਅਤੇ ਸੈਂਸਰ ਅਪਡੇਟਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਰੱਖੋ।'}</p>
        </div>
        <button class="secondary alerts-refresh" onclick="refreshAlerts()" aria-label="${state.language==='en'?'Refresh alerts':'Refresh'}">${navIcon('refresh')}<span>${state.language==='en'?'Refresh':'↻'}</span></button>
      </div>

      <section class="alerts-overview">
        <div class="alerts-overview-icon">${navIcon('alerts')}</div>
        <div class="alerts-overview-copy">
          <strong>${alerts.length ? `${alerts.length} ${state.language==='en'?(alerts.length===1?'active alert':'active alerts'):state.language==='hi'?'सक्रिय अलर्ट':'ਸਰਗਰਮ ਅਲਰਟ'}` : t('noAlerts')}</strong>
          <span>${state.language==='en'?`Last checked at ${lastUpdated}`:state.language==='hi'?`अंतिम जांच ${lastUpdated}`:`ਆਖਰੀ ਜਾਂਚ ${lastUpdated}`}</span>
        </div>
        ${high?`<span class="alerts-priority">${high} ${state.language==='en'?'high priority':'high'}</span>`:''}
      </section>

      <div class="alert-filters" role="tablist" aria-label="Alert filters">
        <button class="${filter==='all'?'selected':''}" onclick="setAlertFilter('all')">${state.language==='en'?'All':'सभी'} <b>${alerts.length}</b></button>
        <button class="${filter==='high'?'selected':''}" onclick="setAlertFilter('high')">${t('high')} <b>${high}</b></button>
        <button class="${filter==='medium'?'selected':''}" onclick="setAlertFilter('medium')">${t('medium')} <b>${medium}</b></button>
        <button class="${filter==='low'?'selected':''}" onclick="setAlertFilter('low')">${state.language==='en'?'Info':state.language==='hi'?'जानकारी':'ਜਾਣਕਾਰੀ'} <b>${info}</b></button>
      </div>

      <div class="alert-list clean-alert-list">
        ${filtered.map(a=>{
          const sev=(a.severity||'low').toLowerCase();
          const type=a.type==='sensor'?'sensor':sev;
          return `<article class="alert-card alert-${type}">
            <div class="alert-card-icon">${alertIcon(a)}</div>
            <div class="alert-card-body">
              <div class="alert-card-top">
                <span class="alert-severity ${sev}">${esc(alertSeverityLabel(a.severity))}</span>
                <time>${relativeTime(a.timestamp)}</time>
              </div>
              <h3>${esc(a.title)}</h3>
              <p>${esc(a.message)}${a.probability!=null?` <strong>${a.probability}% risk</strong>`:''}</p>
              ${a.crop_id?`<button class="alert-view" onclick="openCrop(${a.crop_id})">${t('viewDetails')} ${navIcon('arrow')}</button>`:''}
            </div>
          </article>`;
        }).join("") || `<div class="alerts-empty">
          <div class="alerts-empty-icon">${navIcon('check')}</div>
          <h3>${filter==="all"?t('noAlerts'):(state.language==='en'?'No alerts in this category':state.language==='hi'?'इस श्रेणी में कोई अलर्ट नहीं':'ਇਸ ਸ਼੍ਰੇਣੀ ਵਿੱਚ ਕੋਈ ਅਲਰਟ ਨਹੀਂ')}</h3>
          <p>${state.language==='en'?'AgriGuard will show new crop risks and field updates here automatically.':state.language==='hi'?'नए फसल जोखिम और खेत अपडेट यहां अपने आप दिखाई देंगे।':'ਨਵੇਂ ਫਸਲ ਖਤਰੇ ਅਤੇ ਖੇਤ ਅਪਡੇਟ ਇੱਥੇ ਆਪਣੇ ਆਪ ਦਿਖਾਈ ਦੇਣਗੇ।'}</p>
        </div>`}
      </div>
    </section>`);
}
function setAlertFilter(filter){state.alertFilter=filter;renderAlerts();}
function toggleAccountMenu(event){
  event.preventDefault();
  event.stopPropagation();
  state.accountMenu=!state.accountMenu;
  const menu=document.querySelector('.account-menu');
  if(menu){
    menu.classList.toggle('open',state.accountMenu);
    menu.setAttribute('aria-hidden',String(!state.accountMenu));
  }
  const profile=document.querySelector('.profile');
  if(profile) profile.setAttribute('aria-expanded',String(state.accountMenu));
}
function closeAccountMenu(event){
  if(state.accountMenu && !event.target.closest('.account-menu') && !event.target.closest('.profile')){
    state.accountMenu=false;
    const menu=document.querySelector('.account-menu');
    if(menu){menu.classList.remove('open');menu.setAttribute('aria-hidden','true');}
    const profile=document.querySelector('.profile');
    if(profile) profile.setAttribute('aria-expanded','false');
  }
}
async function refreshAlerts(){try{state.alerts=await api('/api/alerts');renderAlerts();}catch(e){showPrompt(e.message, {type:"error", title:"Something went wrong"});}}

function renderSettings(){document.getElementById("app").innerHTML=shell(`<section class="hero-row"><div><span class="eyebrow">PREFERENCES</span><h1>${t('settings')}</h1><p class="muted">Make AgriGuard comfortable for you.</p></div></section><section class="panel settings-panel"><h2>${t('language')}</h2><p class="muted">${t('selectLanguage')}</p><div class="language-cards"><button class="${state.language==='en'?'selected':''}" onclick="changeLang('en')">🇬🇧 <b>English</b><span>English</span></button><button class="${state.language==='hi'?'selected':''}" onclick="changeLang('hi')">🇮🇳 <b>हिन्दी</b><span>Hindi</span></button><button class="${state.language==='pa'?'selected':''}" onclick="changeLang('pa')">🇮🇳 <b>ਪੰਜਾਬੀ</b><span>Punjabi</span></button></div></section><section class="panel"><h2>Account</h2><div class="account-row"><span class="avatar">${esc(state.user.name[0])}</span><div><b>${esc(state.user.name)}</b><p>@${esc(state.user.username)} · ${state.user.role==='admin'?'Administrator':'Farmer account'}</p></div></div></section>`);}

async function renderAdmin(){
  document.getElementById("app").innerHTML=shell(`<section class="hero-row"><div><span class="eyebrow">ADMIN CONTROL CENTER</span><h1>Knowledge base</h1><p class="muted">Add, edit and remove the agricultural knowledge that farmers see in AgriGuard.</p></div></section><div class="admin-stat-grid" id="adminStats"><div class="stat-card"><small>Loading</small></div></div><section class="panel admin-panel"><div class="admin-tabs"><button class="${state.adminTab==='crops'?'active':''}" onclick="setAdminTab('crops')">${navIcon('crops')} Crops</button><button class="${state.adminTab==='pests'?'active':''}" onclick="setAdminTab('pests')">${navIcon('alerts')} Pests</button><button class="${state.adminTab==='solutions'?'active':''}" onclick="setAdminTab('solutions')">${navIcon('admin')} Solutions</button></div><div id="adminContent" class="admin-content">Loading…</div></section>`);
  await loadAdminData();
}
async function loadAdminData(){
  try{const [overview,crops,pests,solutions]=await Promise.all([api('/api/admin/overview'),api('/api/admin/crops'),api('/api/admin/pests'),api('/api/admin/solutions')]);state.admin={overview,crops,pests,solutions};renderAdminStats();renderAdminContent();}catch(e){showPrompt(e.message, {type:"error", title:"Admin data unavailable"});go('home');}
}
function renderAdminStats(){const o=state.admin.overview;document.getElementById('adminStats').innerHTML=`<div class="stat-card"><div class="stat-icon green">${navIcon('crops')}</div><div><small>Active crops</small><strong>${o.crops}</strong><span>${o.archived_crops} archived</span></div></div><div class="stat-card"><div class="stat-icon amber">${navIcon('alerts')}</div><div><small>Active pests</small><strong>${o.pests}</strong><span>${o.archived_pests} archived</span></div></div><div class="stat-card"><div class="stat-icon blue">${navIcon('admin')}</div><div><small>Published solutions</small><strong>${o.solutions}</strong><span>Live in farmer reports</span></div></div>`;}
function setAdminTab(tab){
  if(!["crops","pests","solutions"].includes(tab) || state.user?.role!=="admin") return;
  if(state.adminTab===tab) return;
  state.adminTab=tab;
  const panel=document.querySelector(".admin-panel");
  const tabs=panel?.querySelectorAll(".admin-tabs button") || [];
  tabs.forEach(btn=>{
    const handler=btn.getAttribute("onclick") || "";
    btn.classList.toggle("active", handler.includes(`'${tab}'`));
  });
  const content=document.getElementById("adminContent");
  if(!content) return;
  content.classList.add("admin-tab-switching");
  window.requestAnimationFrame(()=>{
    renderAdminContent();
    window.requestAnimationFrame(()=>content.classList.remove("admin-tab-switching"));
  });
}
function renderAdminContent(){
  const el=document.getElementById('adminContent');if(!el)return;
  if(state.adminTab==='crops'){
    el.innerHTML=`<div class="admin-section-head"><div><h2>Crops</h2><p>These crops appear in the farmer's Add Crop list when active.</p></div><button class="primary" onclick="openAdminCrop()">＋ Add crop</button></div><div class="admin-grid">${state.admin.crops.map(c=>`<article class="admin-card ${c.active?'':'archived'}"><div class="admin-card-top"><span class="admin-icon">${iconForCrop(c.name)}</span><span class="status-pill ${c.active?'published':'archived-pill'}">${c.active?'Active':'Archived'}</span></div><h3>${esc(c.name)}</h3><p class="scientific">${esc(c.scientific_name||'Scientific name not added')}</p><p>${esc(c.description||'No description yet.')}</p><div class="admin-card-meta"><span>${navIcon('alerts')} ${c.pest_count} active pests</span><div class="admin-actions"><button class="text-btn" onclick="openAdminCrop(${c.id})">Edit</button><button class="text-btn" onclick="toggleAdminCrop(${c.id})">${c.active?'Archive':'Restore'}</button><button class="text-btn danger-text" onclick="deleteAdminCrop(${c.id})">Delete</button></div></div></article>`).join('')}</div>`;
  } else if(state.adminTab==='pests'){
    el.innerHTML=`<div class="admin-section-head"><div><h2>Pests by crop</h2><p>Manage the potential pest list and symptoms for every crop.</p></div><button class="primary" onclick="openAdminPest()">＋ Add pest</button></div><div class="admin-grid">${state.admin.pests.map(p=>`<article class="admin-card ${p.active?'':'archived'}"><div class="admin-card-top"><span class="crop-tag">${esc(p.crop_name)}</span><span class="status-pill ${p.active?'published':'archived-pill'}">${p.active?'Active':'Archived'}</span></div><h3>${navIcon('alerts')} ${esc(p.name)}</h3><p class="scientific">${esc(p.scientific_name||'Scientific name not added')}</p><p>${esc(p.description||'No description yet.')}</p><div class="admin-card-meta"><span>${navIcon('admin')} ${p.solution_count} solutions</span><div class="admin-actions"><button class="text-btn" onclick="openAdminPest(${p.id})">Edit</button><button class="text-btn" onclick="toggleAdminPest(${p.id})">${p.active?'Archive':'Restore'}</button><button class="text-btn danger-text" onclick="deleteAdminPest(${p.id})">Delete</button></div></div></article>`).join('')}</div>`;
  } else {
    el.innerHTML=`<div class="admin-section-head"><div><h2>Pest-specific solutions</h2><p>Each recommendation is linked to a pest, severity and solution type.</p></div><button class="primary" onclick="openAdminSolution()">＋ Add solution</button></div><div class="admin-list">${state.admin.solutions.map(s=>`<div class="admin-row"><div><b>${esc(s.title)}</b><span>${esc(s.crop_name)} → ${esc(s.pest_name)} · ${esc(s.solution_type)} · ${esc(s.severity)}</span></div><div class="admin-row-actions"><span class="status-pill ${s.active?'published':'archived-pill'}">${s.active?'Live':'Archived'}</span><button class="text-btn" onclick="openAdminSolution(${s.id})">Edit</button><button class="text-btn" onclick="toggleAdminSolution(${s.id})">${s.active?'Archive':'Restore'}</button><button class="text-btn danger-text" onclick="deleteAdminSolution(${s.id})">Delete</button></div></div>`).join('')||'<div class="empty-inline">No solutions added yet.</div>'}</div>`;
  }
}
function fieldValue(id){return document.getElementById(id)?.value.trim()||'';}
function openAdminCrop(id){
  if(document.getElementById('modal')) return;
  const item=id?state.admin.crops.find(x=>x.id===id):null;
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="modal"><div class="modal small"><div class="modal-head"><h2>${item?'Edit crop':'Add crop to knowledge base'}</h2><button onclick="closeModal()">×</button></div><p class="muted">Changes are reflected in the farmer app immediately.</p><form onsubmit="saveAdminCrop(event,${id||'null'})"><label>Crop name<input id="aCropName" required value="${esc(item?.name||'')}" placeholder="e.g. Maize"></label><label>Scientific name<input id="aCropScientific" value="${esc(item?.scientific_name||'')}" placeholder="e.g. Zea mays"></label><label>Description<textarea id="aCropDesc" placeholder="Short farmer-friendly description">${esc(item?.description||'')}</textarea></label><button class="primary wide">${item?'Save changes':'Add crop'}</button></form></div></div>`);
document.body.classList.add('modal-open');
}
async function saveAdminCrop(e,id){e.preventDefault();try{const body={name:fieldValue('aCropName'),scientific_name:fieldValue('aCropScientific'),description:fieldValue('aCropDesc')};await api(id?`/api/admin/crops/${id}`:'/api/admin/crops',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});closeModal();await loadAdminData();}catch(err){showPrompt(err.message, {type:"error", title:"Couldn’t save crop"});}}
async function toggleAdminCrop(id){try{await api(`/api/admin/crops/${id}`,{method:'PATCH'});await loadAdminData();}catch(e){showPrompt(e.message, {type:"error", title:"Couldn’t update crop"});}}
async function deleteAdminCrop(id){if(!(await showConfirm('Delete this crop and all pests, symptoms and solutions linked to it? This cannot be undone.', {title:'Delete crop', confirmText:'Delete', danger:true})))return;try{await api(`/api/admin/crops/${id}`,{method:'DELETE'});await loadAdminData();}catch(e){showPrompt(e.message, {type:"error", title:"Couldn’t delete crop"});}}

function openAdminPest(id){
  if(document.getElementById('modal')) return;
  const item=id?state.admin.pests.find(x=>x.id===id):null;const crops=state.admin.crops.filter(c=>c.active);const symptoms=item?[]:[];
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="modal"><div class="modal"><div class="modal-head"><h2>${item?'Edit pest':'Add pest'}</h2><button onclick="closeModal()">×</button></div><p class="muted">Manage the pest, its crop association and the common signs farmers should look for.</p><form onsubmit="saveAdminPest(event,${id||'null'})"><label>Crop<select id="aPestCrop">${crops.map(c=>`<option value="${c.id}" ${item?.crop_id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label>Pest name<input id="aPestName" required value="${esc(item?.name||'')}" placeholder="e.g. Fall armyworm"></label><label>Scientific name<input id="aPestScientific" value="${esc(item?.scientific_name||'')}"></label><label>Description<textarea id="aPestDesc" placeholder="What it does and why it matters">${esc(item?.description||'')}</textarea></label><label>Common signs / symptoms<textarea id="aPestSymptoms" placeholder="One symptom per line"></textarea></label><button class="primary wide">${item?'Save changes':'Add pest'}</button></form></div></div>`);
  if(item) loadPestSymptomsIntoModal(item.id);
document.body.classList.add('modal-open');
}
async function loadPestSymptomsIntoModal(id){try{const rows=await api('/api/knowledge/pests');const p=rows.find(x=>x.id===id);/* symptoms are loaded from dedicated endpoint below */ const data=await api(`/api/admin/pests/${id}/details`); const el=document.getElementById('aPestSymptoms'); if(el&&data.symptoms)el.value=data.symptoms.map(x=>x.description).join('\n');}catch(e){}}
async function saveAdminPest(e,id){e.preventDefault();try{const body={crop_id:+document.getElementById('aPestCrop').value,name:fieldValue('aPestName'),scientific_name:fieldValue('aPestScientific'),description:fieldValue('aPestDesc'),symptoms:fieldValue('aPestSymptoms').split('\n').map(x=>x.trim()).filter(Boolean)};await api(id?`/api/admin/pests/${id}`:'/api/admin/pests',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});closeModal();await loadAdminData();}catch(err){showPrompt(err.message, {type:"error", title:"Couldn’t save pest"});}}
async function toggleAdminPest(id){try{await api(`/api/admin/pests/${id}`,{method:'PATCH'});await loadAdminData();}catch(e){showPrompt(e.message, {type:"error", title:"Couldn’t update pest"});}}
async function deleteAdminPest(id){if(!(await showConfirm('Delete this pest and all linked symptoms and solutions? This cannot be undone.', {title:'Delete pest', confirmText:'Delete', danger:true})))return;try{await api(`/api/admin/pests/${id}`,{method:'DELETE'});await loadAdminData();}catch(e){showPrompt(e.message, {type:"error", title:"Couldn’t delete pest"});}}

function openAdminSolution(id){
  if(document.getElementById('modal')) return;
  const item=id?state.admin.solutions.find(x=>x.id===id):null;const pests=state.admin.pests.filter(p=>p.active);
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="modal"><div class="modal"><div class="modal-head"><h2>${item?'Edit solution':'Add pest-specific solution'}</h2><button onclick="closeModal()">×</button></div><p class="muted">Select the exact pest, severity and solution type. Farmers will see this when that threat is predicted.</p><form onsubmit="saveAdminSolution(event,${id||'null'})"><label>Crop / pest<select id="aSolPest">${pests.map(p=>`<option value="${p.id}" ${item?.pest_id===p.id?'selected':''}>${esc(p.crop_name)} → ${esc(p.name)}</option>`).join('')}</select></label><div class="form-grid"><label>Solution type<select id="aSolType"><option ${item?.solution_type==='Natural'?'selected':''}>Natural</option><option ${item?.solution_type==='Biological'?'selected':''}>Biological</option><option ${item?.solution_type==='Chemical'?'selected':''}>Chemical</option></select></label><label>Severity<select id="aSolSeverity"><option ${item?.severity==='Low'?'selected':''}>Low</option><option ${item?.severity==='Medium'?'selected':''}>Medium</option><option ${item?.severity==='High'?'selected':''}>High</option></select></label></div><label>Title<input id="aSolTitle" required value="${esc(item?.title||'')}" placeholder="e.g. Field monitoring"></label><label>Description<textarea id="aSolDesc" required>${esc(item?.description||'')}</textarea></label><label>Instructions<textarea id="aSolInst" required>${esc(item?.instructions||'')}</textarea></label><label>Warning<textarea id="aSolWarn">${esc(item?.warning||'')}</textarea></label><label>Source / reference<input id="aSolSource" value="${esc(item?.source||'')}" placeholder="Research paper, extension guide, etc."></label><button class="primary wide">${item?'Save changes':'Publish solution'}</button></form></div></div>`);
document.body.classList.add('modal-open');
}
async function saveAdminSolution(e,id){e.preventDefault();try{const body={pest_id:+document.getElementById('aSolPest').value,solution_type:document.getElementById('aSolType').value,severity:document.getElementById('aSolSeverity').value,title:fieldValue('aSolTitle'),description:fieldValue('aSolDesc'),instructions:fieldValue('aSolInst'),warning:fieldValue('aSolWarn'),source:fieldValue('aSolSource')};await api(id?`/api/admin/solutions/${id}`:'/api/admin/solutions',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});closeModal();await loadAdminData();}catch(err){showPrompt(err.message, {type:"error", title:"Couldn’t save solution"});}}
async function toggleAdminSolution(id){try{await api(`/api/admin/solutions/${id}`,{method:'PATCH'}).catch(async()=>api(`/api/admin/solutions/${id}`,{method:'PUT'}));await loadAdminData();}catch(e){showPrompt(e.message, {type:"error", title:"Something went wrong"});}}
async function deleteAdminSolution(id){if(!(await showConfirm('Delete this solution permanently?', {title:'Delete solution', confirmText:'Delete', danger:true})))return;try{await api(`/api/admin/solutions/${id}`,{method:'DELETE'});await loadAdminData();}catch(e){showPrompt(e.message, {type:"error", title:"Couldn’t delete solution"});}}

async function openAddCrop(){
  if(document.getElementById('modal')) return;
  const crops=await api('/api/knowledge/crops');
  if(!crops.length){showPrompt('No crops are currently available. Ask the administrator to add one.', {type:'info', title:'No crops available'});return;}
  document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="modal" role="presentation" onclick="if(event.target===this)closeModal()"><div class="modal small" role="dialog" aria-modal="true" aria-labelledby="addCropTitle"><div class="modal-head"><div><span class="eyebrow">${t('crops')}</span><h2 id="addCropTitle">${t('addNewCrop')}</h2></div><button class="modal-close" onclick="closeModal()" aria-label="${t('cancel')}">×</button></div><form onsubmit="saveCrop(event)"><label>${t('cropType')}<select id="cropType">${crops.map(c=>`<option>${esc(c.name)}</option>`).join('')}</select></label><label>${t('plantingDate')}<input id="plantingDate" type="date" value="${new Date().toISOString().slice(0,10)}" required></label><div class="form-grid"><label>${t('areaAcres')}<input id="cropArea" type="number" step="0.1" min="0.1" value="1"></label><label>${t('growthStage')}<select id="growthStage"><option>Seedling</option><option selected>Growing</option><option>Flowering</option><option>Harvesting</option><option>Planned</option></select></label></div><button class="primary wide">${t('save')}</button></form></div></div>`);
  document.body.classList.add('modal-open');
}
async function saveCrop(e){e.preventDefault();try{await api('/api/crops',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({farm_id:state.farms[0].id,crop_type:document.getElementById('cropType').value,planting_date:document.getElementById('plantingDate').value,area:+document.getElementById('cropArea').value,growth_stage:document.getElementById('growthStage').value})});closeModal();render();}catch(err){showPrompt(err.message, {type:"error", title:"Couldn’t add crop"});}}
async function removeCrop(id){
  const crop=state.crops.find(c=>c.id===id);
  if(!crop) return;
  if(!(await showConfirm(t('removeCropConfirm'), {title:t('removeCrop'), confirmText:t('removeCrop'), danger:true}))) return;
  try{
    await api(`/api/crops/${id}`,{method:'DELETE'});
    state.crops=state.crops.filter(c=>c.id!==id);
    state.alerts=(state.alerts||[]).filter(a=>a.crop_id!==id);
    if(state.selectedCrop===id){state.selectedCrop=null;state.dashboard=null;state.page='crops';}
    render();
  }catch(err){showPrompt(err.message, {type:"error", title:"Couldn’t remove crop"});}
}
function promptIcon(type){
  const icons={
    success:navIcon('check'),
    error:navIcon('danger'),
    info:navIcon('alerts'),
    warning:navIcon('warning')
  };
  return icons[type]||icons.info;
}
function showPrompt(message, opts={}){
  const existing=document.getElementById('fg-prompt');
  if(existing) existing.remove();
  const type=opts.type||'info';
  const title=opts.title||({success:'Done',error:'Something went wrong',warning:'Please check this',info:'AgriGuard'}[type]||'AgriGuard');
  const node=document.createElement('div');
  node.id='fg-prompt';
  node.className=`fg-prompt-backdrop ${type}`;
  node.innerHTML=`<div class="fg-prompt" role="alertdialog" aria-modal="true" aria-labelledby="fgPromptTitle"><div class="fg-prompt-icon">${promptIcon(type)}</div><div class="fg-prompt-content"><h3 id="fgPromptTitle">${esc(title)}</h3><p>${esc(message)}</p></div><button class="fg-prompt-close" aria-label="Close">×</button></div>`;
  document.body.appendChild(node);
  const close=()=>node.remove();
  node.querySelector('.fg-prompt-close').onclick=close;
  node.addEventListener('click',e=>{if(e.target===node)close();});
  if(type==='success' || type==='info') setTimeout(()=>{if(document.getElementById('fg-prompt')===node)close();},3600);
  return node;
}
function showConfirm(message, opts={}){
  return new Promise(resolve=>{
    const existing=document.getElementById('fg-confirm');
    if(existing) existing.remove();
    const node=document.createElement('div');
    node.id='fg-confirm';
    node.className='fg-prompt-backdrop';
    const danger=!!opts.danger;
    const title=opts.title||'Are you sure?';
    const confirmText=opts.confirmText||'Confirm';
    const cancelText=opts.cancelText||t('cancel');
    node.innerHTML=`<div class="fg-prompt fg-confirm" role="alertdialog" aria-modal="true" aria-labelledby="fgConfirmTitle" aria-describedby="fgConfirmMessage"><div class="fg-prompt-icon ${danger?'danger':'warning'}">${promptIcon(danger?'error':'warning')}</div><div class="fg-prompt-content"><h3 id="fgConfirmTitle">${esc(title)}</h3><p id="fgConfirmMessage">${esc(message)}</p></div><div class="fg-prompt-actions"><button class="secondary" data-cancel>${esc(cancelText)}</button><button class="primary ${danger?'danger-fill':''}" data-confirm>${esc(confirmText)}</button></div></div>`;
    document.body.appendChild(node);
    document.body.classList.add('modal-open');
    let settled=false;
    const onKey=e=>{if(e.key==='Escape'){finish(false);}};
    const finish=value=>{if(settled)return;settled=true;document.removeEventListener('keydown',onKey);node.remove();document.body.classList.remove('modal-open');resolve(value);};
    node.querySelector('[data-cancel]').onclick=()=>finish(false);
    node.querySelector('[data-confirm]').onclick=()=>finish(true);
    node.addEventListener('click',e=>{if(e.target===node)finish(false);});
    document.addEventListener('keydown',onKey);
    node.querySelector('[data-confirm]').focus();
  });
}
function closeModal(){document.getElementById('modal')?.remove();document.body.classList.remove('modal-open');}
function go(page){state.accountMenu=false;if(page==='admin'&&state.user?.role!=='admin'){state.page='home';return render();}state.page=page;render();}
async function changeLang(lang){
  state.language=lang; localStorage.setItem('fg_lang',lang);
  if(state.user){
    state.user.language=lang;
    try{await api('/api/me/language',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:lang})});}catch(e){console.warn('Language preference could not be saved',e.message);}
  }
  render();
}
function logout(){state.accountMenu=false;localStorage.removeItem('fg_token');state.token=null;state.user=null;state.page='home';renderAuth();}

let alertRefreshTimer=null;
function startAlertAutoRefresh(){
  if(alertRefreshTimer) clearInterval(alertRefreshTimer);
  alertRefreshTimer=setInterval(async ()=>{
    if(!state.token) return;
    try{
      const fresh=await api('/api/alerts');
      const changed=JSON.stringify(fresh)!==JSON.stringify(state.alerts);
      state.alerts=fresh;
      if(changed){
        if(state.page==='alerts') renderAlerts();
        else updateAlertBadges();
      }
    }catch(e){ /* keep the last known alerts when offline */ }
  },30000);
}
function updateAlertBadges(){
  const count=state.alerts?.length||0;
  document.querySelectorAll('.nav-dot,.mobile-nav-badge').forEach(el=>el.remove());
  const mobileAlert=document.querySelector('.mobile-alert-nav');
  if(mobileAlert && count) mobileAlert.insertAdjacentHTML('afterbegin',`<b class="mobile-nav-badge">${count>9?'9+':count}</b>`);
  const desktopAlert=[...document.querySelectorAll('.sidebar nav button')].find(b=>b.textContent.includes(t('alerts')));
  if(desktopAlert && count) desktopAlert.insertAdjacentHTML('beforeend',`<b class="nav-dot">${count>9?'9+':count}</b>`);
  const notif=document.querySelector('.notification-btn');
  if(notif){
    notif.querySelector('.tiny-dot')?.remove();
    if(count) notif.insertAdjacentHTML('beforeend','<span class="tiny-dot"></span>');
  }
}
startAlertAutoRefresh();
render();