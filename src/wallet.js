const WORDLIST = ["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actress","actual","adapt","add","addict","address","adjust","admit","adult","advance","advice","aerobic","afford","afraid","again","age","agent","agree","ahead","aim","air","airport","aisle","alarm","album","alcohol","alert","alien","all","alley","allow","almost","alone","alpha","already","also","alter","always","amateur","amazing","among","amount","amuse","analysis","anchor","ancient","anger","angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique","anxiety","any","apart","apology","appear","apple","approve","april","arch","arctic","area","arena","argue","arm","armed","armor","army","around","arrange","arrest","arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset","assist","assume","asthma","athlete","atom","attach","attack","attain","attempt","attend","attitude","attract","auction","audit","august","aunt","author","auto","autumn","average","avocado","avoid","awake","aware","away","awesome","awful","awkward","axis","baby","bachelor","bacon","badge","bag","baggage","bake","balance","ball","bamboo","banana","banner","bar","barely","bargain","barrel","base","basic","basket","battle","beach","beam","bean","beauty","because","become","beef","before","begin","behave","behind","believe","below","belt","bench","benefit","best","betray","better","between","beyond","bicycle","bid","bike","bind","biology","bird","birth","bitter","black","blade","blame","blanket","blast","bleak","bless","blind","blood","blossom","blouse","blue","blur","blush","board","boat","body","boil","bomb","bone","bonus","book","boost","border","boring","borrow","boss","bottom","bounce","box","boy","bracket","brain","brand","brass","brave","bread","breeze","brick","bridge","brief","bright","bring","brisk","broad","broccoli","broken","bronze","broom","brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb","bulk","bullet","bundle","bunker","burden","burger","burst","bus","business","busy","butter","buyer","buzz"];

function generate24Mnemonic() {
  const words = [];
  for (let i = 0; i < 24; i++) {
    const randIndex = Math.floor(Math.random() * WORDLIST.length);
    words.push(WORDLIST[randIndex]);
  }
  return words;
}

const API_KEY = "c09170dd62724a03f3803b0f1023219c672c0fcc02a2deed31bd75faea36e9e1";
const IS_TESTNET = true;
let walletData = null;
let currentBalance = "0";
let tonweb = null;

function shortenAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatTon(nano) {
  return (Number(nano) / 1e9).toFixed(4);
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.innerText = msg;
  toast.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#2AABEE;color:white;padding:10px 18px;border-radius:12px;font-size:13px;z-index:999;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function renderWelcome() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `
    <div style="font-family:-apple-system,sans-serif;background:#0e1621;color:white;min-height:100vh;padding:40px 24px;text-align:center;">
      <div style="font-size:56px;margin-top:30px;">💎</div>
      <h1 style="font-size:26px;margin:12px 0 6px;">TGN Wallet</h1>
      <p style="color:#8b9bb4;font-size:14px;margin-bottom:50px;">TON Network • Non-Custodial</p>
      <button onclick="createWallet()" style="width:100%;padding:16px;border:none;border-radius:14px;background:linear-gradient(135deg,#2AABEE,#1e88c7);color:white;font-size:16px;font-weight:600;margin-bottom:14px;cursor:pointer;">Create New Wallet</button>
      <button onclick="showImport()" style="width:100%;padding:16px;border:1px solid #2a3544;border-radius:14px;background:#17212b;color:#2AABEE;font-size:16px;font-weight:600;cursor:pointer;">Import Wallet</button>
      <div id="importBox" style="display:none;margin-top:24px;text-align:left;">
        <textarea id="mnemonicInput" rows="4" placeholder="Enter 24-word recovery phrase..." style="width:100%;background:#0e1621;border:1px solid #2a3544;border-radius:12px;color:white;padding:14px;font-size:14px;box-sizing:border-box;"></textarea>
        <button onclick="importWallet()" style="width:100%;margin-top:12px;padding:14px;background:#22c55e;border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;">Confirm Import</button>
      </div>
      <p style="color:#5a6a7e;font-size:12px;margin-top:40px;">Testnet Mode</p>
    </div>`;
}

function showImport() {
  const box = document.getElementById("importBox");
  if (box) box.style.display = "block";
}

async function createWallet() {
  try {
    const words = generate24Mnemonic();
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const keyPair = { publicKey: bytes, secretKey: bytes };

    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, { publicKey: keyPair.publicKey });
    const address = await wallet.getAddress();

    walletData = {
      mnemonic: words.join(" "),
      address: address.toString(true, true, false),
      publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
      secretKey: TonWeb.utils.bytesToHex(keyPair.secretKey)
    };

    localStorage.setItem("TGN_TON_WALLET", JSON.stringify(walletData));
    renderMain();
    refreshBalance();
    showToast("Wallet created!");
  } catch (e) {
    alert("Create failed: " + e.message);
  }
}

async function importWallet() {
  const phrase = document.getElementById("mnemonicInput").value.trim();
  if (!phrase) return alert("Please enter recovery phrase");
  try {
    const words = phrase.split(/\s+/);
    if (words.length !== 24) return alert("Phrase must be 24 words");

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const keyPair = { publicKey: bytes, secretKey: bytes };

    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, { publicKey: keyPair.publicKey });
    const address = await wallet.getAddress();

    walletData = {
      mnemonic: words.join(" "),
      address: address.toString(true, true, false),
      publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
      secretKey: TonWeb.utils.bytesToHex(keyPair.secretKey)
    };

    localStorage.setItem("TGN_TON_WALLET", JSON.stringify(walletData));
    renderMain();
    refreshBalance();
    showToast("Wallet imported!");
  } catch (e) {
    alert("Import failed: " + e.message);
  }
}

function renderMain() {
  const app = document.getElementById("app");
  if (!app) return;
  const addr = walletData ? walletData.address : "";
  app.innerHTML = `
    <div style="font-family:-apple-system,sans-serif;background:#0e1621;color:white;min-height:100vh;padding-bottom:80px;">
      <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:15px;font-weight:600;color:#8b9bb4;">TGN Wallet</div>
        <div style="background:#17212b;padding:5px 12px;border-radius:20px;font-size:12px;color:#2AABEE;border:1px solid #2a3544;">Testnet</div>
      </div>
      <div style="text-align:center;padding:20px 0 10px;">
        <div id="balanceDisplay" style="font-size:42px;font-weight:700;">${currentBalance} TON</div>
        <div onclick="copyAddress()" style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;background:#17212b;padding:6px 14px;border-radius:20px;font-size:13px;color:#8b9bb4;border:1px solid #2a3544;cursor:pointer;">
          ${shortenAddress(addr)} 📋
        </div>
      </div>
      <div style="display:flex;justify-content:center;gap:32px;margin:28px 0 36px;">
        <div onclick="openSend()" style="text-align:center;cursor:pointer;">
          <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#2AABEE,#1a7bb0);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 8px;">↗</div>
          <div style="font-size:13px;color:#c1c9d3;">Send</div>
        </div>
        <div onclick="openReceive()" style="text-align:center;cursor:pointer;">
          <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 8px;">↙</div>
          <div style="font-size:13px;color:#c1c9d3;">Receive</div>
        </div>
        <div onclick="refreshBalance()" style="text-align:center;cursor:pointer;">
          <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 8px;">↻</div>
          <div style="font-size:13px;color:#c1c9d3;">Refresh</div>
        </div>
      </div>
      <div style="padding:0 20px;">
        <div style="font-size:14px;color:#8b9bb4;margin-bottom:12px;">Assets</div>
        <div style="background:#17212b;border-radius:16px;padding:16px;display:flex;justify-content:space-between;align-items:center;border:1px solid #2a3544;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="https://assets.coingecko.com/coins/images/17980/small/ton_token_teal.png" style="width:36px;height:36px;border-radius:50%;">
            <div>
              <div style="font-weight:600;font-size:15px;">TON</div>
              <div style="font-size:12px;color:#8b9bb4;">Toncoin</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div id="assetBalance" style="font-weight:600;font-size:15px;">${currentBalance}</div>
            <div style="font-size:12px;color:#8b9bb4;">Testnet</div>
          </div>
        </div>
      </div>
      <div style="position:fixed;bottom:0;left:0;right:0;height:70px;background:#17212b;border-top:1px solid #2a3544;display:flex;justify-content:space-around;align-items:center;">
        <div style="text-align:center;color:#2AABEE;font-size:11px;"><div style="font-size:20px;">👛</div>Wallet</div>
        <div onclick="openSettings()" style="text-align:center;color:#8b9bb4;font-size:11px;cursor:pointer;"><div style="font-size:20px;">⚙️</div>Settings</div>
      </div>
      <div id="modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:100;padding:20px;">
        <div style="background:#17212b;border-radius:18px;padding:20px;max-height:85vh;overflow-y:auto;margin-top:8vh;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 id="modalTitle" style="margin:0;font-size:17px;"></h3>
            <span onclick="closeModal()" style="font-size:22px;color:#8b9bb4;cursor:pointer;">✕</span>
          </div>
          <div id="modalBody"></div>
        </div>
      </div>
    </div>`;
}

async function refreshBalance() {
  if (!walletData || !tonweb) return;
  try {
    const balance = await tonweb.getBalance(walletData.address);
    currentBalance = formatTon(balance);
    const el1 = document.getElementById("balanceDisplay");
    const el2 = document.getElementById("assetBalance");
    if (el1) el1.innerText = currentBalance + " TON";
    if (el2) el2.innerText = currentBalance;
    showToast("Balance updated");
  } catch (e) {
    showToast("Failed to fetch balance");
  }
}

function copyAddress() {
  if (!walletData) return;
  navigator.clipboard.writeText(walletData.address);
  showToast("Address copied!");
}

function openReceive() {
  document.getElementById("modal").style.display = "block";
  document.getElementById("modalTitle").innerText = "Receive TON";
  document.getElementById("modalBody").innerHTML = `
    <div style="text-align:center;">
      <div style="background:white;padding:16px;border-radius:12px;display:inline-block;margin-bottom:16px;">
        <div id="qrcode"></div>
      </div>
      <div style="font-size:12px;color:#8b9bb4;margin-bottom:8px;">Your Testnet Address</div>
      <div style="background:#0e1621;padding:12px;border-radius:10px;font-size:13px;word-break:break-all;border:1px solid #2a3544;color:#22c55e;">
        ${walletData.address}
      </div>
      <button onclick="copyAddress()" style="width:100%;margin-top:16px;padding:14px;background:#2AABEE;border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;">Copy Address</button>
    </div>`;
  if (typeof QRCode !== "undefined") {
    new QRCode(document.getElementById("qrcode"), { text: walletData.address, width: 170, height: 170 });
  }
}

function openSend() {
  document.getElementById("modal").style.display = "block";
  document.getElementById("modalTitle").innerText = "Send TON";
  document.getElementById("modalBody").innerHTML = `
    <div>
      <label style="font-size:13px;color:#8b9bb4;">Recipient Address</label>
      <input id="sendTo" type="text" placeholder="EQ... or UQ..." style="width:100%;margin:8px 0 16px;padding:13px;background:#0e1621;border:1px solid #2a3544;border-radius:10px;color:white;font-size:14px;box-sizing:border-box;">
      <label style="font-size:13px;color:#8b9bb4;">Amount (TON)</label>
      <input id="sendAmount" type="number" step="0.01" placeholder="0.00" style="width:100%;margin:8px 0 20px;padding:13px;background:#0e1621;border:1px solid #2a3544;border-radius:10px;color:white;font-size:14px;box-sizing:border-box;">
      <button onclick="doSend()" style="width:100%;padding:15px;background:linear-gradient(135deg,#2AABEE,#1e88c7);border:none;border-radius:12px;color:white;font-weight:600;font-size:15px;cursor:pointer;">Confirm Send</button>
    </div>`;
}

async function doSend() {
  const to = document.getElementById("sendTo").value.trim();
  const amount = document.getElementById("sendAmount").value.trim();
  if (!to || !amount) return alert("Please fill address and amount");

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
    showToast("Transaction sent!");
    setTimeout(refreshBalance, 3000);
  } catch (e) {
    alert("Send failed: " + e.message);
  }
}

function openSettings() {
  document.getElementById("modal").style.display = "block";
  document.getElementById("modalTitle").innerText = "Settings";
  document.getElementById("modalBody").innerHTML = `
    <button onclick="showPhrase()" style="width:100%;padding:14px;background:#0e1621;border:1px solid #2a3544;border-radius:12px;color:#2AABEE;font-weight:500;margin-bottom:10px;cursor:pointer;">🔑 Show Recovery Phrase</button>
    <div id="phraseBox" style="display:none;background:#0e1621;padding:14px;border-radius:10px;font-size:13px;color:#22c55e;word-break:break-all;border:1px solid #2a3544;margin-bottom:16px;"></div>
    <button onclick="resetWallet()" style="width:100%;padding:14px;background:#ef4444;border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;">Reset Wallet</button>`;
}

function showPhrase() {
  document.getElementById("phraseBox").style.display = "block";
  document.getElementById("phraseBox").innerText = walletData.mnemonic;
}

function resetWallet() {
  if (confirm("Are you sure? Make sure you saved the recovery phrase!")) {
    localStorage.removeItem("TGN_TON_WALLET");
    location.reload();
  }
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function initApp() {
  const app = document.getElementById("app");
  if (!app) return;

  if (typeof TonWeb === "undefined") {
    app.innerHTML = `<div style="color:#ff5555;padding:40px;text-align:center;">TonWeb library failed to load</div>`;
    return;
  }

  tonweb = new TonWeb(new TonWeb.HttpProvider(
    IS_TESTNET ? "https://testnet.toncenter.com/api/v2/jsonRPC" : "https://toncenter.com/api/v2/jsonRPC",
    { apiKey: API_KEY }
  ));

  const saved = localStorage.getItem("TGN_TON_WALLET");
  if (saved) {
    walletData = JSON.parse(saved);
    renderMain();
    refreshBalance();
  } else {
    renderWelcome();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.createWallet = createWallet;
window.showImport = showImport;
window.importWallet = importWallet;
window.openSend = openSend;
window.openReceive = openReceive;
window.refreshBalance = refreshBalance;
window.copyAddress = copyAddress;
window.doSend = doSend;
window.openSettings = openSettings;
window.showPhrase = showPhrase;
window.resetWallet = resetWallet;
window.closeModal = closeModal;
