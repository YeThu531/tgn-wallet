// ==================== TGN Wallet - TON Only (Testnet) ====================
const API_KEY = "c09170dd62724a03f3803b0f1023219c672c0fcc02a2deed31bd75faea36e9e1";
const IS_TESTNET = true;
let walletData = null;
let currentBalance = "0";
let tonweb, tonMnemonic;

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

function initApp() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `<div style="color:#aaa;text-align:center;padding:80px 20px;">Loading TGN Wallet...</div>`;
  try {
    if (typeof TonWeb === "undefined") {
      throw new Error("TonWeb Library failed to load from CDN");
    }
    tonweb = new TonWeb(new TonWeb.HttpProvider(
      IS_TESTNET ? "https://testnet.toncenter.com/api/v2/jsonRPC" : "https://toncenter.com/api/v2/jsonRPC",
      { apiKey: API_KEY }
    ));
    tonMnemonic = TonWeb.mnemonic;

    const saved = localStorage.getItem("TGN_TON_WALLET");
    if (saved) {
      walletData = JSON.parse(saved);
      renderMain();
      refreshBalance();
    } else {
      renderWelcome();
    }
  } catch (e) {
    app.innerHTML = `<div style="color:#ff5555;padding:40px;text-align:center;">Failed to load<br>${e.message || e}</div>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
