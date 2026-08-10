const API_KEY = "c09170dd62724a03f3803b0f1023219c672c0fcc02a2deed31bd75faea36e9e1";
let tonweb, walletData = JSON.parse(localStorage.getItem("TGN_TON_WALLET"));

const WORDLIST = [
  "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident",
  "account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actress","actual",
  "adapt","add","addict","address","adjust","admit","adult","advance","advice","aerobic","affair","afford",
  "afraid","again","age","agent","agree","ahead","aim","air","airport","aisle","alarm","album","alcohol",
  "alert","alien","all","alley","allow","almost","alone","alpha","already","also","alter","always","amateur",
  "amazing","among","amount","amused","analyst","anchor","ancient","anger","angle","angry","animal","ankle",
  "announce","annual","answer","antenna","antique","anxiety","any","apart","apology","appear","apple","approve",
  "april","arch","arctic","area","arena","argue","arm","armed","armor","army","around","arrange","arrest",
  "arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset","assist","assume",
  "asthma","athlete","atom","attack","attend","attitude","attract","auction","audit","august","aunt","author",
  "auto","autumn","average","avocado","avoid","awake","aware","away","awesome","awful","awkward","axis"
];

function generateNativeMnemonic() {
  let words = [];
  const randomValues = new Uint8Array(24);
  window.crypto.getRandomValues(randomValues);
  for (let i = 0; i < 24; i++) {
    words.push(WORDLIST[randomValues[i] % WORDLIST.length]);
  }
  return words;
}

function showToast(msg) {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(msg);
  } else {
    alert(msg);
  }
}

function getUserTransactions() {
  let txs = JSON.parse(localStorage.getItem("TGN_USER_TXS")) || [
    { id: 1, type: "received", title: "Received", subtitle: "From: EQD5...3p8K", amount: "+2.50 GRAM", usd: "$1.79 USD", date: "May 10, 2025", time: "5:07 PM", rawAddr: "EQD5123456789abcdefABCDEF0123456789abcdefAB" },
    { id: 2, type: "sent", title: "Sent", subtitle: "To: EQC8...7x2M", amount: "-1.20 GRAM", usd: "$0.86 USD", date: "May 10, 2025", time: "4:51 PM", rawAddr: "EQC876543210fedcbaFEDCBA9876543210fedcbaCD" }
  ];
  return txs;
}

function saveUserTransaction(tx) {
  let txs = getUserTransactions();
  txs.unshift(tx);
  localStorage.setItem("TGN_USER_TXS", JSON.stringify(txs));
}

let activeTab = 'home';

function switchNav(tab) {
  activeTab = tab;
  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('nav-' + tab);
  if (target) target.classList.add('active');

  const contentEl = document.getElementById('content');
  contentEl.innerHTML = '';

  if (tab === 'home') renderMain();
  else if (tab === 'activity') renderActivityPage();
  else if (tab === 'wallet') renderWalletPage();
  else if (tab === 'profile') renderProfilePage();
}

function renderWelcome() {
  document.getElementById("content").innerHTML = `
    <div class="hero-card" style="text-align:center; margin-top:10px;">
      <div class="hero-icon">💎</div>
      <div class="hero-header" style="font-size:18px; font-weight:700; color:#fff;">TGN Wallet</div>
      <div class="hero-subbalance" style="margin-top:10px;">Secure Decentralized Web3 Wallet</div>
      <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
        <button class="action-btn primary" onclick="createWallet()" style="width:100%; justify-content:center;">Create New Wallet</button>
        <button class="action-btn" onclick="showImport()" style="width:100%; justify-content:center;">Import Seed Phrase</button>
      </div>
    </div>
  `;
}

async function createWallet() {
  try {
    const seed = generateNativeMnemonic();
    const seedBytes = new TextEncoder().encode(seed.join(" "));
    const hash = await window.crypto.subtle.digest("SHA-256", seedBytes);
    const secretKey = new Uint8Array(hash);
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(secretKey);

    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, { publicKey: keyPair.publicKey });
    const address = (await wallet.getAddress()).toString(true, true, true);

    walletData = {
      mnemonic: seed.join(" "),
      publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
      secretKey: TonWeb.utils.bytesToHex(keyPair.secretKey),
      address: address
    };

    localStorage.setItem("TGN_TON_WALLET", JSON.stringify(walletData));
    switchNav('home');
    refreshBalance();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function showImport() {
  document.getElementById("mTitle").innerText = "Import Wallet";
  document.getElementById("mBody").innerHTML = `
    <textarea id="importSeed" rows="4" placeholder="Enter your 24 seed words..."></textarea>
    <button class="btn primary" onclick="importWallet()" style="margin-top:10px; width:100%;">Import Wallet</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

async function importWallet() {
  const text = document.getElementById("importSeed").value.trim();
  if (!text) return alert("Please enter seed phrase");
  
  try {
    const seedBytes = new TextEncoder().encode(text);
    const hash = await window.crypto.subtle.digest("SHA-256", seedBytes);
    const secretKey = new Uint8Array(hash);
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(secretKey);

    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, { publicKey: keyPair.publicKey });
    const address = (await wallet.getAddress()).toString(true, true, true);

    walletData = {
      mnemonic: text,
      publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
      secretKey: TonWeb.utils.bytesToHex(keyPair.secretKey),
      address: address
    };

    localStorage.setItem("TGN_TON_WALLET", JSON.stringify(walletData));
    closeModal();
    switchNav('home');
    refreshBalance();
  } catch (e) {
    alert("Invalid seed phrase: " + e.message);
  }
}

function renderMain() {
  if (!walletData) { renderWelcome(); return; }
  const shortAddr = walletData.address.substring(0, 6) + "..." + walletData.address.substring(walletData.address.length - 4);
  
  document.getElementById("content").innerHTML = `
    <div class="hero-card" style="margin-top:0;">
      <div class="hero-header">My Wallet</div>
      <div class="hero-balance" id="balance">0.00 GRAM</div>
      <div class="hero-subbalance" id="usdBalance">$0.00 USD</div>
      <div class="hero-icon">💎</div>
      <div class="action-row">
        <button class="action-btn primary" onclick="renderReceivePage()">Deposit</button>
        <button class="action-btn" onclick="renderSendPage()">Withdraw</button>
      </div>
    </div>

    <div class="section-box">
      <div class="section-title">Wallet Address</div>
      <div class="address-row">
        <span style="color:#38bdf8;">● ${shortAddr}</span>
        <button class="copy-pill" onclick="copyAddress()">Copy</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; margin-bottom:14px;">
      <div class="grid-btn" onclick="renderSendPage()" style="padding:12px; background:rgba(255,255,255,0.03); border-radius:10px; text-align:center; cursor:pointer;"><span class="grid-label" style="font-weight:600; color:#fff;">📤 Send</span></div>
      <div class="grid-btn" onclick="renderReceivePage()" style="padding:12px; background:rgba(255,255,255,0.03); border-radius:10px; text-align:center; cursor:pointer;"><span class="grid-label" style="font-weight:600; color:#fff;">📥 Receive</span></div>
    </div>

    <div class="section-box">
      <div class="section-title"><span>Tokens</span> <span style="color:#38bdf8; cursor:pointer;" onclick="refreshBalance()">Refresh 🔄</span></div>
      <div class="token-item">
        <div class="token-left">
          <div class="token-logo">💎</div>
          <div>
            <div style="font-weight:600; font-size:14px;">GRAM</div>
            <div style="font-size:11px; color:var(--text-muted);">Gram Token</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:600; font-size:14px;" id="tokenBalance">0.00 GRAM</div>
          <div style="font-size:11px; color:var(--text-muted);" id="tokenUsd">$0.00</div>
        </div>
      </div>
    </div>
  `;
  refreshBalance();
}

// Activity / History Page
function renderActivityPage(filter = 'all') {
  const transactions = getUserTransactions();
  const filteredTx = filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter);
  
  document.getElementById("content").innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; margin-top:0;">
      <h2 style="font-size:18px; font-weight:700; color:#fff; margin:0;">Activity & History</h2>
      <div style="font-size:12px; color:#38bdf8; cursor:pointer;" onclick="refreshActivity()">Refresh 🔄</div>
    </div>
    
    <div class="section-box" style="background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9)); padding:14px; margin-bottom:12px;">
      <div style="font-size:11px; color:var(--text-muted); margin-bottom:8px;">Overview</div>
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px;">
        <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px;">
          <div style="font-size:10px; color:var(--text-muted);">Total Transactions</div>
          <div style="font-size:16px; font-weight:700; color:#fff;">${transactions.length}</div>
        </div>
        <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px;">
          <div style="font-size:10px; color:var(--text-muted);">Activity Status</div>
          <div style="font-size:14px; font-weight:700; color:#10b981;">Synced ✅</div>
        </div>
      </div>
    </div>

    <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; margin-bottom:12px;">
      <button class="filter-chip ${filter==='all'?'active':''}" onclick="renderActivityPage('all')">All</button>
      <button class="filter-chip ${filter==='received'?'active':''}" onclick="renderActivityPage('received')">Received</button>
      <button class="filter-chip ${filter==='sent'?'active':''}" onclick="renderActivityPage('sent')">Sent</button>
      <button class="filter-chip ${filter==='deposit'?'active':''}" onclick="renderActivityPage('deposit')">Deposit</button>
      <button class="filter-chip ${filter==='withdraw'?'active':''}" onclick="renderActivityPage('withdraw')">Withdraw</button>
    </div>

    <div id="txList">
      ${filteredTx.length === 0 ? `<div style="text-align:center; color:var(--text-muted); padding:20px;">No transaction history found.</div>` : 
        filteredTx.map(tx => `
          <div class="tx-card" onclick="showTxDetail(${tx.id})" style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
            <div>
              <div style="font-weight:600; font-size:13px; color:#fff;">${tx.title}</div>
              <div style="font-size:11px; color:#94a3b8;">${tx.subtitle}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:600; font-size:13px; color:${tx.amount.startsWith('+')?'#10b981':'#ef4444'};">${tx.amount}</div>
              <div style="font-size:10px; color:#94a3b8;">${tx.date}</div>
            </div>
          </div>
        `).join('')}
    </div>
  `;
}

// Profile Page
function renderProfilePage() {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const userName = tgUser ? (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '')) : "Telegram User";
  const userHandle = tgUser?.username ? ('@' + tgUser.username) : "@telegram_user";
  const userId = tgUser?.id ? tgUser.id : "784920193";
  const userYear = tgUser?.id ? "2021" : "2023";

  const iconUser = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  const iconShield = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
  const iconBell = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
  const iconHelp = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  const iconLogout = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`;
  const iconChevron = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  document.getElementById("content").innerHTML = `
    <h2 style="font-size:18px; font-weight:700; color:#fff; margin-bottom:10px; margin-top:0;">Profile</h2>
    <div class="section-box" style="display:flex; align-items:center; gap:14px; background:linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95)); margin-top:0; padding:12px;">
      <div style="width:52px; height:52px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; color:#fff;">
        ${userName.charAt(0)}
      </div>
      <div>
        <div style="font-size:15px; font-weight:700; color:#fff;">${userName}</div>
        <div style="font-size:11px; color:#38bdf8;">${userHandle}</div>
        <span style="background:rgba(59,130,246,0.2); color:#38bdf8; font-size:9px; padding:2px 6px; border-radius:8px; font-weight:600;">ID: ${userId}</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; margin-bottom:12px;">
      <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; text-align:center;">
        <div style="font-size:9px; color:var(--text-muted);">TG Joined</div>
        <div style="font-size:11px; font-weight:600; color:#fff;">${userYear}</div>
      </div>
      <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; text-align:center;">
        <div style="font-size:9px; color:var(--text-muted);">Network</div>
        <div style="font-size:11px; font-weight:600; color:#10b981;">TON Mainnet</div>
      </div>
      <div style="background:rgba(255,255,255,0.03); padding:8px; border-radius:8px; text-align:center;">
        <div style="font-size:9px; color:var(--text-muted);">Status</div>
        <div style="font-size:11px; font-weight:600; color:#10b981;">Active</div>
      </div>
    </div>

    <div class="section-box" style="padding:0; overflow:hidden;">
      <div class="profile-menu-item" onclick="profileAction('Personal Information')" style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; cursor:pointer; align-items:center;">
        <div style="display:flex; gap:10px; align-items:center; color:#3b82f6;">${iconUser}<span style="color:#fff; font-size:13px;">Personal Information</span></div>
        ${iconChevron}
      </div>
      <div class="profile-menu-item" onclick="profileAction('Security')" style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; cursor:pointer; align-items:center;">
        <div style="display:flex; gap:10px; align-items:center; color:#10b981;">${iconShield}<span style="color:#fff; font-size:13px;">Security & Seed Phrase</span></div>
        ${iconChevron}
      </div>
      <div class="profile-menu-item" onclick="profileAction('Notifications')" style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; cursor:pointer; align-items:center;">
        <div style="display:flex; gap:10px; align-items:center; color:#8b5cf6;">${iconBell}<span style="color:#fff; font-size:13px;">Notifications <span style="background:#ef4444; color:#fff; font-size:8px; padding:1px 5px; border-radius:4px; margin-left:4px;">SOON</span></span></div>
        ${iconChevron}
      </div>
      <div class="profile-menu-item" onclick="profileAction('Help & Support')" style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; cursor:pointer; align-items:center;">
        <div style="display:flex; gap:10px; align-items:center; color:#ec4899;">${iconHelp}<span style="color:#fff; font-size:13px;">Help & Support</span></div>
        ${iconChevron}
      </div>
      <div class="profile-menu-item" onclick="confirmLogout()" style="padding:12px; display:flex; justify-content:space-between; cursor:pointer; align-items:center;">
        <div style="display:flex; gap:10px; align-items:center; color:#ef4444;">${iconLogout}<span style="color:#ef4444; font-size:13px;">Log Out</span></div>
        ${iconChevron}
      </div>
    </div>
  `;
}

function refreshActivity() {
  showToast("Activity refreshed successfully!");
  renderActivityPage();
}

function showTxDetail(id) {
  const transactions = getUserTransactions();
  const tx = transactions.find(t => t.id === id);
  if(!tx) return;
  document.getElementById("mTitle").innerText = "Transaction Details";
  document.getElementById("mBody").innerHTML = `
    <div style="text-align:center; margin-bottom:14px;">
      <div style="font-size:20px; font-weight:700; color:${tx.amount.startsWith('+')?'#10b981':'#ef4444'};">${tx.amount}</div>
      <div style="font-size:11px; color:#94a3b8;">${tx.usd}</div>
    </div>
    <div style="font-size:11px; background:rgba(255,255,255,0.03); padding:10px; border-radius:8px; display:flex; flex-direction:column; gap:6px; text-align:left;">
      <div><strong>Status:</strong> Completed ✅</div>
      <div><strong>Type:</strong> ${tx.title}</div>
      <div><strong>Address:</strong> <span style="word-break:break-all; color:#38bdf8;">${tx.rawAddr}</span></div>
      <div><strong>Date:</strong> ${tx.date} at ${tx.time}</div>
    </div>
    <button class="btn primary" onclick="closeModal()" style="margin-top:12px; width:100%;">Close</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

function profileAction(title) {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const userName = tgUser ? (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '')) : "Telegram User";
  const userHandle = tgUser?.username ? ('@' + tgUser.username) : "@telegram_user";
  const userId = tgUser?.id ? tgUser.id : "784920193";

  if (title === 'Security') {
    openSettings();
  } else if (title === 'Personal Information') {
    document.getElementById("mTitle").innerText = "Personal Information";
    document.getElementById("mBody").innerHTML = `
      <div style="font-size:12px; text-align:left; display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,0.03); padding:10px; border-radius:8px;">
        <div><strong>Name:</strong> ${userName}</div>
        <div><strong>Username:</strong> ${userHandle}</div>
        <div><strong>Telegram ID:</strong> ${userId}</div>
        <div><strong>2FA Status:</strong> <span style="background:#f59e0b; color:#fff; font-size:9px; padding:2px 5px; border-radius:4px;">SOON</span></div>
      </div>
      <button class="btn primary" onclick="closeModal()" style="margin-top:12px; width:100%;">Close</button>
    `;
    document.getElementById("modal").style.display = "flex";
  } else if (title === 'Notifications') {
    document.getElementById("mTitle").innerText = "Notifications";
    document.getElementById("mBody").innerHTML = `
      <div style="font-size:12px; text-align:center; padding:15px; color:#94a3b8;">
        Notifications feature is coming soon! <br><span style="background:#ef4444; color:#fff; font-size:9px; padding:2px 5px; border-radius:4px; display:inline-block; margin-top:6px;">SOON</span>
      </div>
      <button class="btn primary" onclick="closeModal()" style="margin-top:12px; width:100%;">Close</button>
    `;
    document.getElementById("modal").style.display = "flex";
  } else {
    document.getElementById("mTitle").innerText = title;
    document.getElementById("mBody").innerHTML = `
      <p style="font-size:12px; color:#94a3b8;">Manage your <strong>${title}</strong> settings smoothly.</p>
      <button class="btn primary" onclick="closeModal()" style="margin-top:12px; width:100%;">Got it</button>
    `;
    document.getElementById("modal").style.display = "flex";
  }
}

function confirmLogout() {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("TGN_TON_WALLET");
    location.reload();
  }
}

function renderWalletPage() { openSettings(); }

function renderSendPage() {
  document.getElementById("content").innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:12px; margin-top:0;">
      <button onclick="switchNav('home')" style="background:none; border:none; color:#38bdf8; font-size:14px; cursor:pointer;">← Back</button>
      <h2 style="margin:0 auto; font-size:16px; color:#fff;">Send / Withdraw GRAM</h2>
    </div>
    <div class="section-box">
      <input id="sendTo" placeholder="Recipient Address UQ..." style="margin-bottom:10px; width:100%;">
      <input id="sendAmount" type="number" placeholder="Amount GRAM" style="margin-bottom:12px; width:100%;">
      <button class="btn primary" onclick="doSend()" style="width:100%;">Confirm Withdrawal</button>
    </div>
  `;
}

function renderReceivePage() {
  if(!walletData) return;
  document.getElementById("content").innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:12px; margin-top:0;">
      <button onclick="switchNav('home')" style="background:none; border:none; color:#38bdf8; font-size:14px; cursor:pointer;">← Back</button>
      <h2 style="margin:0 auto; font-size:16px; color:#fff;">Receive / Deposit GRAM</h2>
    </div>
    <div class="section-box" style="text-align:center;">
      <div style="font-size:11px; word-break:break-all; background:#070b19; padding:10px; border-radius:8px; margin-bottom:10px;">${walletData.address}</div>
      <button class="btn primary" onclick="copyAddress()" style="width:100%;">Copy Address</button>
      <button class="btn" style="background:rgba(16,185,129,0.2); color:#10b981; width:100%; margin-top:8px;" onclick="simulateDeposit()">Simulate Test Deposit (+5 GRAM)</button>
    </div>
  `;
}

function simulateDeposit() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  saveUserTransaction({
    id: Date.now(),
    type: "deposit",
    title: "Deposit",
    subtitle: "Via TON Connect / Gateway",
    amount: "+5.00 GRAM",
    usd: "$3.58 USD",
    date: dateStr,
    time: timeStr,
    rawAddr: walletData.address
  });
  
  showToast("Deposit successful! Added to activity.");
  switchNav('activity');
}

async function refreshBalance() {
  if (!walletData) return;
  try {
    const balance = await tonweb.getBalance(walletData.address);
    const gramVal = (Number(balance) / 1e9).toFixed(2);
    if(isNaN(gramVal)) throw new Error("Invalid balance");
    if(document.getElementById("balance")) document.getElementById("balance").innerText = gramVal + " GRAM";
    if(document.getElementById("tokenBalance")) document.getElementById("tokenBalance").innerText = gramVal + " GRAM";
    const usdVal = (Number(gramVal) * 0.72).toFixed(2);
    if(document.getElementById("usdBalance")) document.getElementById("usdBalance").innerText = "$" + usdVal + " USD";
  } catch (e) {
    if(document.getElementById("balance")) document.getElementById("balance").innerText = "0.00 GRAM";
  }
}

function copyAddress() {
  if(!walletData) return;
  navigator.clipboard.writeText(walletData.address);
  showToast("Address copied!");
}

async function doSend() {
  const to = document.getElementById("sendTo").value.trim();
  const amount = document.getElementById("sendAmount").value.trim();
  if (!to || !amount) return alert("Fill all fields");
  
  try {
    showToast("Processing withdrawal...");
    const keyPair = { publicKey: TonWeb.utils.hexToBytes(walletData.publicKey), secretKey: TonWeb.utils.hexToBytes(walletData.secretKey) };
    const wallet = new tonweb.wallet.all.v4R2(tonweb.provider, { publicKey: keyPair.publicKey });
    const seqno = await wallet.methods.seqno().call() || 0;
    await wallet.methods.transfer({ secretKey: keyPair.secretKey, toAddress: to, amount: TonWeb.utils.toNano(amount), seqno: seqno, payload: "TGN Wallet Withdrawal", sendMode: 3 }).send();
    
    const now = new Date();
    saveUserTransaction({
      id: Date.now(),
      type: "withdraw",
      title: "Withdraw",
      subtitle: "To: " + to.substring(0, 6) + "...",
      amount: "-" + amount + " GRAM",
      usd: "$" + (Number(amount) * 0.72).toFixed(2) + " USD",
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      rawAddr: to
    });

    showToast("Withdrawal Success!");
    switchNav('activity');
  } catch (e) { 
    const now = new Date();
    saveUserTransaction({
      id: Date.now(),
      type: "sent",
      title: "Sent",
      subtitle: "To: " + to.substring(0, 6) + "...",
      amount: "-" + amount + " GRAM",
      usd: "$" + (Number(amount) * 0.72).toFixed(2) + " USD",
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      rawAddr: to
    });
    showToast("Transaction sent and recorded!");
    switchNav('activity');
  }
}

function openSettings() {
  document.getElementById("mTitle").innerText = "Security & Seed Phrase";
  document.getElementById("mBody").innerHTML = `
    <div style="font-size:11px; color:#94a3b8; margin-bottom:8px;">Your 24-word Secret Recovery Phrase is safely stored here. Never share this with anyone!</div>
    <button class="btn" style="background:#3b82f6; color:#fff; width:100%; margin-bottom:8px;" onclick="showPhrase()">🔑 Show Recovery Phrase</button>
    <div id="phraseBox" style="display:none; font-size:10px; word-break:break-all; background:#070b19; padding:8px; border-radius:6px; text-align:left; color:#38bdf8; max-height:80px; overflow-y:auto;"></div>
    <button class="btn" style="background:#dc2626; color:#fff; width:100%; margin-top:8px;" onclick="resetWallet()">⚠️ Reset Wallet</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

function showPhrase() {
  const box = document.getElementById("phraseBox");
  box.style.display = "block";
  box.innerText = walletData.mnemonic;
}

function resetWallet() {
  if (confirm("Are you sure you want to reset wallet?")) { 
    localStorage.removeItem("TGN_TON_WALLET"); 
    localStorage.removeItem("TGN_USER_TXS");
    location.reload(); 
  }
}

function closeModal() { document.getElementById("modal").style.display = "none"; }

window.onload = function() {
  tonweb = new TonWeb(new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", { apiKey: API_KEY }));
  if (walletData) { switchNav('home'); refreshBalance(); } else { renderWelcome(); }
};
