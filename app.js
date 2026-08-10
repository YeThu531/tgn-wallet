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
    <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">Get started by creating a new secure wallet or importing an existing one.</p>
    <button class="btn" onclick="createWallet()">✨ Create New Wallet</button>
    <button class="btn btn-secondary" onclick="showImport()">📥 Import Seed Phrase</button>
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
    <div class="address-box" onclick="copyAddress()">
      <span>📍 ${shortAddr}</span>
      <span style="color:var(--text-muted); font-size:10px;">COPY</span>
    </div>

    <div class="balance-box">
      <div class="balance-title">Total Balance</div>
      <div class="balance-amount" id="balance">0.00 TON</div>
      <button class="btn btn-secondary" onclick="refreshBalance()" style="padding:6px; font-size:11px; margin-top:6px; width:auto;">🔄 Refresh Balance</button>
    </div>

    <div class="grid">
      <button class="btn" onclick="openSend()">📤 Send</button>
      <button class="btn btn-success" onclick="openReceive()">📥 Receive</button>
    </div>
    
    <button class="btn btn-secondary" onclick="openSettings()">⚙️ Wallet Settings</button>
  `;
}

async function refreshBalance() {
  if (!walletData) return;
  document.getElementById("balance").innerText = "...";
  try {
    const balance = await tonweb.getBalance(walletData.address);
    document.getElementById("balance").innerText = (balance / 1e9).toFixed(2) + " TON";
  } catch (e) {
    document.getElementById("balance").innerText = "0.00 TON";
  }
}

function copyAddress() {
  navigator.clipboard.writeText(walletData.address);
  showToast("Address copied to clipboard!");
}

function openReceive() {
  document.getElementById("mTitle").innerText = "Receive TON";
  document.getElementById("mBody").innerHTML = `
    <p style="font-size:13px; color:var(--text-muted);">Send only TON to this address:</p>
    <div class="address-box" style="margin:12px 0; font-size:11px; text-align:left;">${walletData.address}</div>
    <button class="btn" onclick="copyAddress()">Copy Address</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

function openSend() {
  document.getElementById("mTitle").innerText = "Send TON";
  document.getElementById("mBody").innerHTML = `
    <input id="sendTo" placeholder="Recipient TON Address">
    <input id="sendAmount" type="number" step="0.01" placeholder="Amount (TON)">
    <button class="btn" onclick="doSend()">Confirm & Send</button>
  `;
  document.getElementById("modal").style.display = "flex";
}

async function doSend() {
  const to = document.getElementById("sendTo").value.trim();
  const amount = document.getElementById("sendAmount").value.trim();
  if (!to || !amount) return alert("Please fill all fields");

  try {
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

    closeModal();
    showToast("Transaction sent successfully!");
    setTimeout(refreshBalance, 3000);
  } catch (e) {
    alert("Transfer failed: " + e.message);
  }
}

function openSettings() {
  document.getElementById("mTitle").innerText = "Wallet Settings";
  document.getElementById("mBody").innerHTML = `
    <button class="btn btn-secondary" onclick="showPhrase()">🔑 View Recovery Phrase</button>
    <div id="phraseBox" class="address-box" style="display:none; margin-top:10px; font-size:11px; max-height:100px; overflow-y:auto;"></div>
    <button class="btn btn-danger" onclick="resetWallet()" style="margin-top:12px;">⚠️ Reset Wallet</button>
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
  tonweb = new TonWeb(new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC", { apiKey: API_KEY }));
  if (walletData) {
    renderMain();
    refreshBalance();
  } else {
    renderWelcome();
  }
};
