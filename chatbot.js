(function(){
  /* ── Build HTML ── */
  document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="chatbot.css">');
  document.body.insertAdjacentHTML('beforeend',`
    <button id="cb-toggle" onclick="CB.toggle()" aria-label="Open chat">
      <i class="fas fa-comment-dots"></i><span>Chat with us</span>
      <span id="cb-badge">1</span>
    </button>
    <div id="cb-window">
      <div class="cb-header">
        <div class="cb-header-left">
          <div class="cb-avatar"><i class="fas fa-th"></i></div>
          <div>
            <div class="cb-name">Pavers Ordonez</div>
            <div class="cb-status"><span class="cb-dot"></span> Online now</div>
          </div>
        </div>
        <button class="cb-close" onclick="CB.toggle()"><i class="fas fa-times"></i></button>
      </div>
      <div class="cb-messages" id="cb-msgs"></div>
      <div class="cb-quickreplies" id="cb-qr"></div>
    </div>
  `);

  /* ── State ── */
  var open = false;
  var started = false;
  var msgs  = document.getElementById('cb-msgs');
  var qrEl  = document.getElementById('cb-qr');
  var badge = document.getElementById('cb-badge');
  var win   = document.getElementById('cb-window');
  var PHONE = '15619701917';
  var WA_BASE = 'https://wa.me/' + PHONE + '?text=';

  /* ── Knowledge base ── */
  var NODES = {
    start: {
      bot: 'Hi! 👋 Welcome to Pavers Ordonez. How can I help you today?',
      qr: ['Our Services','Get a Free Quote','Service Area','How long does it take?','Paver Repair','Landscaping','Contact Us']
    },
    services: {
      bot: 'We specialize in:\n\n🔶 Driveway Pavers\n🔶 Patio & Outdoor Living\n🔶 Walkways & Paths\n🔶 Paver Repair & Restoration\n🌿 Landscaping\n\nWhich service interests you?',
      qr: ['Driveway Pavers','Patio & Outdoor Living','Walkways & Paths','Paver Repair','Landscaping','Get a Free Quote']
    },
    driveway: {
      bot: 'Our driveway paver installations boost curb appeal and home value. We work with concrete, travertine, brick, and tumbled pavers in dozens of colors and patterns.',
      contact: [{type:'link',icon:'fas fa-external-link-alt',label:'See Driveway Page',href:'driveway.html'}],
      qr: ['Get a Free Quote','How long does it take?','How much does it cost?','Back to start']
    },
    patio: {
      bot: 'We design and build stunning patios, pool decks, outdoor kitchens, and fire pit areas. Slip-resistant pavers that stay cool underfoot — perfect for Florida living.',
      contact: [{type:'link',icon:'fas fa-external-link-alt',label:'See Patio Page',href:'patio.html'}],
      qr: ['Get a Free Quote','How long does it take?','How much does it cost?','Back to start']
    },
    walkway: {
      bot: 'From grand front entry walkways to winding garden paths, we build every type of paver walkway. Custom width, shape, pattern, and border options available.',
      contact: [{type:'link',icon:'fas fa-external-link-alt',label:'See Walkway Page',href:'walkway.html'}],
      qr: ['Get a Free Quote','How long does it take?','How much does it cost?','Back to start']
    },
    repair: {
      bot: 'We restore pavers without full replacement:\n\n✅ Re-leveling sunken pavers\n✅ Replacing cracked units\n✅ Polymeric sand re-jointing\n✅ Pressure washing\n✅ Professional sealing\n\nSave up to 70% vs. full replacement!',
      contact: [{type:'link',icon:'fas fa-external-link-alt',label:'See Repair Page',href:'repair.html'}],
      qr: ['Get a Free Quote','How long does it take?','How much does it cost?','Back to start']
    },
    landscaping: {
      bot: 'We offer complete landscaping services:\n\n🌿 Sod installation\n🌴 Trees & palms\n🪨 Rock & gravel features\n💧 Drainage solutions\n🌱 Full yard makeovers\n\nPavers + landscaping by one crew!',
      contact: [{type:'link',icon:'fas fa-external-link-alt',label:'See Landscaping Page',href:'landscaping.html'}],
      qr: ['Get a Free Quote','How long does it take?','How much does it cost?','Back to start']
    },
    quote: {
      bot: 'Getting a free estimate is easy! Reach us right now:',
      contact: [
        {type:'whatsapp',icon:'fab fa-whatsapp',label:'WhatsApp Us',href: WA_BASE + encodeURIComponent('Hi! I\'d like a free estimate for a paver project.')},
        {type:'call',icon:'fas fa-phone-alt',label:'Call (561) 970-1917',href:'tel:5619701917'}
      ],
      qr: ['Our Services','How long does it take?','Service Area','Back to start']
    },
    area: {
      bot: '📍 We serve West Palm Beach and all of Palm Beach County, FL — including Wellington, Boynton Beach, Delray Beach, Boca Raton, and surrounding areas.',
      qr: ['Get a Free Quote','Our Services','Back to start']
    },
    time: {
      bot: 'Typical project timelines:\n\n⏱ Walkway — 1–2 days\n⏱ Driveway — 2–4 days\n⏱ Patio/Pool deck — 2–5 days\n⏱ Paver repair — 1–2 days\n\nWe minimize disruption and clean up daily.',
      qr: ['Get a Free Quote','How much does it cost?','Our Services','Back to start']
    },
    cost: {
      bot: 'Project cost depends on size, material, and complexity. We provide 100% FREE detailed written estimates with no obligation.\n\nContact us and we\'ll visit your property at no charge!',
      contact: [
        {type:'whatsapp',icon:'fab fa-whatsapp',label:'Ask for a Quote',href: WA_BASE + encodeURIComponent('Hi! Can I get a free estimate for my paver project?')},
        {type:'call',icon:'fas fa-phone-alt',label:'Call (561) 970-1917',href:'tel:5619701917'}
      ],
      qr: ['Our Services','Service Area','Back to start']
    },
    contact: {
      bot: 'You can reach us through any of these channels:',
      contact: [
        {type:'whatsapp',icon:'fab fa-whatsapp',label:'WhatsApp Us',href: WA_BASE + encodeURIComponent('Hi! I\'d like to learn more about Pavers Ordonez.')},
        {type:'call',icon:'fas fa-phone-alt',label:'Call (561) 970-1917',href:'tel:5619701917'},
        {type:'link',icon:'fab fa-facebook',label:'Find us on Facebook',href:'https://www.facebook.com/profile.php?id=61591447870453'}
      ],
      qr: ['Our Services','Get a Free Quote','Back to start']
    }
  };

  /* ── Label → node map ── */
  var ROUTE = {
    'our services':'services','services':'services',
    'driveway pavers':'driveway','driveway':'driveway',
    'patio & outdoor living':'patio','patio':'patio',
    'walkways & paths':'walkway','walkways':'walkway','walkway':'walkway',
    'paver repair':'repair','repair':'repair',
    'landscaping':'landscaping',
    'get a free quote':'quote','get a quote':'quote','free quote':'quote','how much does it cost?':'cost','cost':'cost',
    'service area':'area','where do you serve?':'area','area':'area',
    'how long does it take?':'time','time':'time',
    'contact us':'contact','contact':'contact',
    'back to start':'start'
  };

  /* ── Helpers ── */
  function scrollBottom(){ msgs.scrollTop = msgs.scrollHeight; }

  function addMsg(text, who){
    var div = document.createElement('div');
    div.className = 'cb-msg ' + who;
    div.style.whiteSpace = 'pre-wrap';
    div.textContent = text;
    msgs.appendChild(div);
    scrollBottom();
    return div;
  }

  function addContactBtns(btns){
    var wrap = document.createElement('div');
    wrap.className = 'cb-msg bot';
    wrap.style.padding = '8px';
    wrap.style.background = 'transparent';
    var inner = document.createElement('div');
    inner.className = 'cb-contact-btns';
    btns.forEach(function(b){
      var a = document.createElement('a');
      a.href = b.href;
      a.target = b.type === 'link' ? '_blank' : '_self';
      a.rel = 'noopener';
      a.className = 'cb-contact-btn ' + b.type;
      a.innerHTML = '<i class="' + b.icon + '"></i>' + b.label;
      inner.appendChild(a);
    });
    wrap.appendChild(inner);
    msgs.appendChild(wrap);
    scrollBottom();
  }

  function setQR(labels){
    qrEl.innerHTML = '';
    labels.forEach(function(label){
      var btn = document.createElement('button');
      btn.className = 'cb-qr';
      btn.textContent = label;
      btn.onclick = function(){ handleQR(label); };
      qrEl.appendChild(btn);
    });
  }

  function showTyping(cb){
    var t = document.createElement('div');
    t.className = 'cb-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    scrollBottom();
    setTimeout(function(){ msgs.removeChild(t); cb(); }, 800);
  }

  function showNode(nodeKey){
    var node = NODES[nodeKey] || NODES.start;
    showTyping(function(){
      addMsg(node.bot, 'bot');
      if(node.contact) addContactBtns(node.contact);
      setQR(node.qr || []);
    });
  }

  function handleQR(label){
    addMsg(label, 'user');
    qrEl.innerHTML = '';
    var key = ROUTE[label.toLowerCase()] || 'start';
    showNode(key);
  }

  /* ── Public API ── */
  window.CB = {
    toggle: function(){
      open = !open;
      win.classList.toggle('open', open);
      if(open && !started){
        started = true;
        badge.style.display = 'none';
        setTimeout(function(){ showNode('start'); }, 300);
      }
      if(open){ badge.style.display = 'none'; }
    }
  };

})();
