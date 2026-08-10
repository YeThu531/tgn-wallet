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
  if (window.Telegram?.WebApp) window.Telegram.WebApp.showAlert(msg);
  else alert(msg);
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
    renderMain();
    refreshBalance();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function showImport() {
  document.getElementById("mTitle").innerText = "Import Wallet";
  document.getElementById("mBody").innerHTML = `
    <textarea id="importSeed" rows="4" placeholder="Enter your 24 seed words..."></textarea>
    <button class="btn" onclick="importWallet()">Import Wallet</button>
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
    renderMain();
    refreshBalance();
  } catch (e) {
    alert("Invalid seed phrase: " + e.message);
  }
}

function renderMain() {
  const shortAddr = walletData.address.substring(0, 6) + "..." + walletData.address.substring(walletData.address.length - 4);
  
  document.getElementById("content").innerHTML = `
    <div class="hero-card">
      <div class="hero-header">My Wallet</div>
      <div class="hero-balance" id="balance">0.00 GRAM</div>
      <div class="hero-subbalance">$0.00 USD</div>
      <div class="hero-icon">💎</div>
      <div class="action-row">
        <button class="action-btn primary" onclick="renderReceivePage()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> Deposit
        </button>
        <button class="action-btn" onclick="renderSendPage()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M12 19V5M5 12l7-7 7 7"/></svg> Withdraw
        </button>
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
        <span class="grid-icon-wrap" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </span>
        <span class="grid-label">Send</span>
        <span class="grid-sub">GRAM</span>
      </div>
      <div class="grid-btn" onclick="renderReceivePage()">
        <span class="grid-icon-wrap" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </span>
        <span class="grid-label">Receive</span>
        <span class="grid-sub">payment</span>
      </div>
      <div class="grid-btn" onclick="renderHistoryPage()">
        <span class="grid-icon-wrap" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </span>
        <span class="grid-label">History</span>
        <span class="grid-sub">Transactions</span>
      </div>
      <div class="grid-btn" onclick="openSettings()">
        <span class="grid-icon-wrap" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </span>
        <span class="grid-label">Settings</span>
        <span class="grid-sub">Preferences</span>
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
          <div style="font-size:11px; color:var(--text-muted);">$0.00</div>
        </div>
      </div>
    </div>
  `;
}

function renderSendPage() {
  document.getElementById("content").innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:16px;">
      <button onclick="renderMain()" style="background:none; border:none; color:#38bdf8; font-size:16px; cursor:pointer; display:flex; align-items:center; gap:5px;">← Back</button>
      <h2 style="margin:0 auto; font-size:18px; color:#fff;">Send GRAM</h2>
    </div>
    <div class="section-box">
      <div style="margin-bottom:12px;">
        <label style="font-size:12px; color:var(--text-muted);">Recipient Address</label>
        <input id="sendTo" placeholder="UQ... or EQ..." style="margin-top:4px;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="font-size:12px; color:var(--text-muted);">Amount (GRAM)</label>
        <input id="sendAmount" type="number" step="0.01" placeholder="0.00" style="margin-top:4px;">
      </div>
      <button class="btn primary" onclick="doSend()" style="width:100%; padding:14px; font-weight:600;">Confirm & Send</button>
    </div>
  `;
}

function renderReceivePage() {
  const shortAddr = walletData.address;
  document.getElementById("content").innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:16px;">
      <button onclick="renderMain()" style="background:none; border:none; color:#38bdf8; font-size:16px; cursor:pointer;">← Back</button>
      <h2 style="margin:0 auto; font-size:18px; color:#fff;">Receive GRAM</h2>
    </div>
    <div class="section-box" style="text-align:center;">
      <p style="font-size:13px; color:var(--text-muted);">Send only GRAM to this address:</p>
      <div class="address-row" style="margin:16px 0; font-size:12px; word-break:break-all; background:#070b19; padding:12px; border-radius:8px;">${shortAddr}</div>
      <button class="btn primary" onclick="copyAddress()" style="width:100%;">Copy Address</button>
    </div>
  `;
}

function renderHistoryPage() {
  document.getElementById("content").innerHTML = `
    <div style="display:flex; align-items:center; margin-bottom:16px;">
      <button onclick="renderMain()" style="background:none; border:none; color:#38bdf8; font-size:16px; cursor:pointer;">← Back</button>
      <h2 style="margin:0 auto; font-size:18px; color:#fff;">History</h2>
    </div>
    <div class="section-box" style="text-align:center; padding:30px; color:var(--text-muted);">
      No recent transactions found.
    </div>
  `;
}

async function refreshBalance() {
  if (!walletData) return;
  try {
    const balance = await tonweb.getBalance(walletData.address);
    const gramVal = (Number(balance) / 1e9).toFixed(2);
    if(document.getElementById("balance")) document.getElementById("balance").innerText = gramVal + " GRAM";
    if(document.getElementById("tokenBalance")) document.getElementById("tokenBalance").innerText = gramVal + " GRAM";
  } catch (e) {
    if(document.getElementById("balance")) document.getElementById("balance").innerText = "0.00 GRAM";
    if(document.getElementById("tokenBalance")) document.getElementById("tokenBalance").innerText = "0.00 GRAM";
  }
}

function copyAddress() {
  navigator.clipboard.writeText(walletData.address);
  showToast("Address copied to clipboard!");
}

async function doSend() {
  const to = document.getElementById("sendTo").value.trim();
  const amount = document.getElementById("sendAmount").value.trim();
  if (!to || !amount) return alert("Please fill all fields");

  try {
    showToast("Preparing transaction...");
    const keyPair = {
      publicKey: TonWeb.utils.hexToBytes(walletData.publicKey),
      secretKey: TonWeb.utils.hexToBytes(walletData.secretKey)
    };
    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, { publicKey: keyPair.publicKey });
    const seqno = await wallet.methods.seqno().call() || 0;

    await wallet.methods.transfer({
      secretKey: keyPair.secretKey,
      toAddress: to,
      amount: TonWeb.utils.toNano(amount),
      seqno: seqno,
      payload: "Sent from TGN Wallet",
      sendMode: 3
    }).send();

    showToast("Transaction sent successfully!");
    renderMain();
    setTimeout(refreshBalance, 3000);
  } catch (e) {
    alert("Transfer failed: " + e.message);
  }
}

function openSettings() {
  document.getElementById("mTitle").innerText = "Wallet Settings";
  document.getElementById("mBody").innerHTML = `
    <button class="btn btn-secondary" onclick="showPhrase()" style="width:100%;">🔑 View Recovery Phrase</button>
    <div id="phraseBox" class="address-row" style="display:none; margin-top:10px; font-size:11px; max-height:100px; overflow-y:auto; word-break:break-all;"></div>
    <button class="btn btn-danger" onclick="resetWallet()" style="margin-top:12px; width:100%;">⚠️ Reset Wallet</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

function showPhrase() {
  const box = document.getElementById("phraseBox");
  box.style.display = "block";
  box.innerText = walletData.mnemonic;
}

function resetWallet() {
  if (confirm("Are you sure? Make sure you backed up your seed phrase!")) {
    localStorage.removeItem("TGN_TON_WALLET");
    location.reload();
  }
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

window.onload = function() {
  tonweb = new TonWeb(new TonWeb.HttpProvider("https://toncenter.com/api/v2/jsonRPC", { apiKey: API_KEY }));
  if (walletData) {
    renderMain();
    refreshBalance();
  } else {
    renderWelcome();
  }
};
