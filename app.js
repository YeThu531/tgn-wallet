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

let mockTransactions = [
  { id: 1, type: "received", title: "Received", subtitle: "From: EQD5...3p8K", amount: "+2.50 GRAM", usd: "$1.79 USD", date: "May 10, 2025", time: "5:07 PM", rawAddr: "EQD5123456789abcdefABCDEF0123456789abcdefAB" },
  { id: 2, type: "sent", title: "Sent", subtitle: "To: EQC8...7x2M", amount: "-1.20 GRAM", usd: "$0.86 USD", date: "May 10, 2025", time: "4:51 PM", rawAddr: "EQC876543210fedcbaFEDCBA9876543210fedcbaCD" },
  { id: 3, type: "deposit", title: "Deposit", subtitle: "Via TON Connect", amount: "+5.00 GRAM", usd: "$3.58 USD", date: "May 10, 2025", time: "4:30 PM", rawAddr: "EQConnectGateway0000000000000000000000000" },
  { id: 4, type: "withdraw", title: "Withdraw", subtitle: "To External Wallet", amount: "-2.00 GRAM", usd: "$1.43 USD", date: "May 10, 2025", time: "3:42 PM", rawAddr: "EQB1ExternalWalletAddress0000000000000000" },
  { id: 5, type: "received", title: "Received", subtitle: "From: EQF2...m9tP", amount: "+3.25 GRAM", usd: "$2.32 USD", date: "May 10, 2025", time: "2:18 PM", rawAddr: "EQF2987654321abcdefABCDEF0123456789abcdef99" }
];

let activeTab = 'home';

function switchNav(tab) {
  activeTab = tab;
  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
  const target = document.getElementById('nav-' + tab);
  if (target) target.classList.add('active');

  if (tab === 'home') renderMain();
  else if (tab === 'activity') renderActivityPage();
  else if (tab === 'wallet') renderWalletPage();
  else if (tab === 'profile') renderProfilePage();
}

function renderWelcome() {
  document.getElementById("content").innerHTML = `
    <div class="hero-card" style="text-align:center; margin-top:40px;">
      <div class="hero-icon">💎</div>
      <div class="hero-header" style="font-size:18px; font-weight:700; color:#fff;">TGN Wallet</div>
      <div class="hero-subbalance" style="margin-top:10px;">Secure Decentralized Web3 Wallet</div>
      <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
        <button class="action-btn primary" onclick="createWallet()" style="width:100%; justify-content:center;">✨ Create New Wallet</button>
        <button class="action-btn" onclick="showImport()" style="width:100%; justify-content:center;">📥 Import Seed Phrase</button>
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
    <div class="hero-card">
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

    <div class="grid-4">
      <div class="grid-btn" onclick="renderSendPage()">
        <span class="grid-label">Send</span>
      </div>
      <div class="grid-btn" onclick="renderReceivePage()">
        <span class="grid-label">Receive</span>
      </div>
      <div class="grid-btn" onclick="switchNav('activity')">
        <span class="grid-label">History</span>
      </div>
      <div class="grid-btn" onclick="switchNav('profile')">
        <span class="grid-label">Profile</span>
      </div>
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

function renderActivityPage(filter = 'all') {
  const filteredTx = filter === 'all' ? mockTransactions : mockTransactions.filter(tx => tx.type === filter);
  
  document.getElementById("content").innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <h2 style="font-size:20px; font-weight:700; color:#fff; margin:0;">Activity</h2>
      <div style="font-size:12px; color:#38bdf8; cursor:pointer;" onclick="refreshActivity()">Refresh 🔄</div>
    </div>
    
    <div class="section-box" style="background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9)); padding:16px; margin-bottom:16px;">
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Overview</div>
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
        <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px;">
          <div style="font-size:11px; color:var(--text-muted);">Total Transactions</div>
          <div style="font-size:18px; font-weight:700; color:#fff;">24</div>
        </div>
        <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px;">
          <div style="font-size:11px; color:var(--text-muted);">Total Received</div>
          <div style="font-size:16px; font-weight:700; color:#10b981;">12.45 GRAM</div>
        </div>
      </div>
    </div>

    <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:16px;">
      <button class="filter-chip ${filter==='all'?'active':''}" onclick="renderActivityPage('all')">All</button>
      <button class="filter-chip ${filter==='received'?'active':''}" onclick="renderActivityPage('received')">Received</button>
      <button class="filter-chip ${filter==='sent'?'active':''}" onclick="renderActivityPage('sent')">Sent</button>
    </div>

    <div id="txList">
      ${filteredTx.map(tx => `
        <div class="tx-card" onclick="showTxDetail(${tx.id})" style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
          <div>
            <div style="font-weight:600; font-size:14px; color:#fff;">${tx.title}</div>
            <div style="font-size:11px; color:#94a3b8;">${tx.subtitle}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600; font-size:14px; color:${tx.amount.startsWith('+')?'#10b981':'#ef4444'};">${tx.amount}</div>
            <div style="font-size:11px; color:#94a3b8;">${tx.date}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderProfilePage() {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const userName = tgUser ? (tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '')) : "Otter User";
  const userHandle = tgUser?.username ? ('@' + tgUser.username) : "@otter_user";

  document.getElementById("content").innerHTML = `
    <h2 style="font-size:20px; font-weight:700; color:#fff; margin-bottom:4px;">Profile</h2>
    <div class="section-box" style="display:flex; align-items:center; gap:16px; background:linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95));">
      <div style="width:64px; height:64px; border-radius:50%; background:#3b82f6; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:700; color:#fff;">
        ${userName.charAt(0)}
      </div>
      <div>
        <div style="font-size:16px; font-weight:700; color:#fff;">${userName}</div>
        <div style="font-size:12px; color:#38bdf8;">${userHandle}</div>
      </div>
    </div>
    <div class="section-box" style="padding:0; overflow:hidden;">
      <div class="profile-menu-item" onclick="profileAction('Security')" style="padding:14px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; cursor:pointer;">
        <span>🛡️ Security Settings</span>
        <span>›</span>
      </div>
      <div class="profile-menu-item" onclick="confirmLogout()" style="padding:14px; color:#ef4444; display:flex; justify-content:space-between; cursor:pointer;">
        <span>🚪 Log Out</span>
        <span>›</span>
      </div>
    </div>
  `;
}

function refreshActivity() {
  showToast("Activity refreshed successfully!");
  renderActivityPage();
}

function showTxDetail(id) {
  const tx = mockTransactions.find(t => t.id === id);
  if(!tx) return;
  document.getElementById("mTitle").innerText = "Transaction Details";
  document.getElementById("mBody").innerHTML = `
    <div style="text-align:center; margin-bottom:16px;">
      <div style="font-size:24px; font-weight:700; color:${tx.amount.startsWith('+')?'#10b981':'#ef4444'};">${tx.amount}</div>
      <div style="font-size:12px; color:#94a3b8;">${tx.usd}</div>
    </div>
    <button class="btn primary" onclick="closeModal()" style="margin-top:14px; width:100%;">Close</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

function profileAction(title) {
  openSettings();
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
    <div style="display:flex; align-items:center; margin-bottom:16px;">
      <button onclick="switchNav('home')" style="background:none; border:none; color:#38bdf8; font-size:16px; cursor:pointer;">← Back</button>
      <h2 style="margin:0 auto; font-size:18px; color:#fff;">Send GRAM</h2>
    </div>
    <div class="section-box">
      <input id="sendTo" placeholder="Recipient Address UQ..." style="margin-bottom:12px; width:100%;">
      <input id="sendAmount" type="number" placeholder="Amount GRAM" style="margin-bottom:16px; width:100%;">
      <button class="btn primary" onclick="doSend()" style="width:100%;">Send</button>
    </div>
  `;
}
function renderReceivePage() {
  if(!walletData) return;
  document.getElementById("content").innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:16px;">
      <button onclick="switchNav('home')" style="background:none; border:none; color:#38bdf8; font-size:16px; cursor:pointer;">← Back</button>
      <h2 style="margin:0 auto; font-size:18px; color:#fff;">Receive GRAM</h2>
    </div>
    <div class="section-box" style="text-align:center;">
      <div style="font-size:12px; word-break:break-all; background:#070b19; padding:12px; border-radius:8px; margin-bottom:12px;">${walletData.address}</div>
      <button class="btn primary" onclick="copyAddress()" style="width:100%;">Copy Address</button>
    </div>
  `;
}

async function refreshBalance() {
  if (!walletData) return;
  try {
    const balance = await tonweb.getBalance(walletData.address);
    const gramVal = (Number(balance) / 1e9).toFixed(2);
    if(isNaN(gramVal)) throw new Error("Invalid balance");
    if(document.getElementById("balance")) document.getElementById("balance").innerText = gramVal + " GRAM";
    if(document.getElementById("tokenBalance")) document.getElementById("tokenBalance").innerText = gramVal + " GRAM";
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
    showToast("Sending...");
    const keyPair = { publicKey: TonWeb.utils.hexToBytes(walletData.publicKey), secretKey: TonWeb.utils.hexToBytes(walletData.secretKey) };
    const wallet = new tonweb.wallet.all.v4R2(tonweb.provider, { publicKey: keyPair.publicKey });
    const seqno = await wallet.methods.seqno().call() || 0;
    await wallet.methods.transfer({ secretKey: keyPair.secretKey, toAddress: to, amount: TonWeb.utils.toNano(amount), seqno: seqno, payload: "TGN Wallet", sendMode: 3 }).send();
    showToast("Success!");
    switchNav('home');
  } catch (e) { alert("Error: " + e.message); }
}

function openSettings() {
  document.getElementById("mTitle").innerText = "Wallet Settings";
  document.getElementById("mBody").innerHTML = `
    <button class="btn" style="background:#3b82f6; color:#fff; width:100%; margin-bottom:10px;" onclick="showPhrase()">🔑 Recovery Phrase</button>
    <div id="phraseBox" style="display:none; font-size:11px; word-break:break-all; background:#070b19; padding:8px; border-radius:6px;"></div>
    <button class="btn" style="background:#dc2626; color:#fff; width:100%; margin-top:10px;" onclick="resetWallet()">⚠️ Reset Wallet</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

function showPhrase() {
  const box = document.getElementById("phraseBox");
  box.style.display = "block";
  box.innerText = walletData.mnemonic;
}

function resetWallet() {
  if (confirm("Reset wallet?")) { localStorage.removeItem("TGN_TON_WALLET"); location.reload(); }
}
function closeModal() { document.getElementById("modal").style.display = "none"; }

window.onload = function() {
  tonweb = new TonWeb(new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", { apiKey: API_KEY }));
  if (walletData) { switchNav('home'); refreshBalance(); } else { renderWelcome(); }
};
