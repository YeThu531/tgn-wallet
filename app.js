/*
 TGN WALLET
 Clean Frontend Version
*/

const CONFIG = {
  API_KEY: "",
  API_BASE: "https://toncenter.com/api/v2",
  V3_BASE: "https://toncenter.com/api/v3",
  WALLET_STORAGE: "TGN_TON_WALLET"
};

const tg = window.Telegram?.WebApp;
let activeTab = "home";
let walletData = safeWallet();
let tonBalance = 0;
let transactions = [];
let jettons = [];

/* Telegram */
if (tg) {
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor("#07101f");
    tg.setBackgroundColor("#050a16");
  } catch (_) {}
}

/* Wallet Storage */
function safeWallet() {
  try {
    const raw = localStorage.getItem(CONFIG.WALLET_STORAGE);
    const data = raw ? JSON.parse(raw) : null;
    return data && data.address ? data : null;
  } catch (_) {
    return null;
  }
}

/* Escape HTML */
function esc(value) {
  return String(value ?? "")
    .replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[m];
    });
}

/* Telegram User */
function user() {
  return tg?.initDataUnsafe?.user || {};
}

function userName() {
  const u = user();
  return [u.first_name, u.last_name].filter(Boolean).join(" ") || "Telegram User";
}

function username() {
  return user().username ? "@" + user().username : "No username";
}

function userId() {
  return user().id ? String(user().id) : "Unavailable";
}

/* Telegram Profile Photo */
function avatarHtml() {
  const u = user();
  const photo = u.photo_url || "";
  const initial = (u.first_name || "T").charAt(0).toUpperCase();

  if (photo) {
    return `
      <img
        class="profile-avatar"
        src="${esc(photo)}"
        alt="Telegram profile"
        onerror="this.outerHTML='<div class=&quot;avatar-fallback&quot;>${initial}</div>'"
      >
    `;
  }

  return `
    <div class="avatar-fallback">
      ${esc(initial)}
    </div>
  `;
}

/* Address */
function shortAddress(address) {
  if (!address) return "Wallet not connected";
  return address.length > 18 ? address.slice(0, 9) + "..." + address.slice(-7) : address;
}

/* Toast */
function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

/* Modal */
function openModal(title, body) {
  document.getElementById("mTitle").textContent = title;
  document.getElementById("mBody").innerHTML = body;
  document.getElementById("modal").classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

/* Icons */
function icon(name) {
  const paths = {
    home: `
      <path d="M3 10.5L12 3l9 7.5"></path>
      <path d="M5 9.5V21h14V9.5"></path>
      <path d="M9 21v-7h6v7"></path>
    `,
    activity: `
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <circle cx="3.5" cy="6" r="1"></circle>
      <circle cx="3.5" cy="12" r="1"></circle>
      <circle cx="3.5" cy="18" r="1"></circle>
    `,
    send: `
      <path d="M22 2L11 13"></path>
      <path d="M22 2l-7 20-4-9-9-4z"></path>
    `,
    wallet: `
      <path d="M20 7H5a3 3 0 0 1 0-6h13v4"></path>
      <path d="M5 1v6"></path>
      <path d="M20 7v14H5a3 3 0 0 1-3-3V4"></path>
      <path d="M16 13h5v4h-5a2 2 0 1 1 0-4z"></path>
    `,
    airdrop: `
      <path d="M20 12v10H4V12"></path>
      <path d="M2 7h20v5H2z"></path>
      <path d="M12 22V7"></path>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    `,
    profile: `
      <circle cx="12" cy="7" r="4"></circle>
      <path d="M4 21v-1a7 7 0 0 1 14 0v1"></path>
    `
  };

  return `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${paths[name] || ""}
    </svg>
  `;
}

document.querySelectorAll(".nav-svg").forEach(function (el) {
  el.innerHTML = icon(el.dataset.icon);
});

/* Navigation */
function switchNav(tab) {
  activeTab = tab;
  document.querySelectorAll(".nav-item").forEach(function (item) {
    item.classList.remove("active");
  });
  document.getElementById("nav-" + tab)?.classList.add("active");

  if (tab === "home") renderHome();
  else if (tab === "activity") renderActivity();
  else if (tab === "send") renderSend();
  else if (tab === "wallet") renderWallet();
  else if (tab === "airdrop") renderAirdrop();
  else if (tab === "profile") renderProfile();
}

/* HOME */
function renderHome() {
  const address = walletData?.address || "";

  document.getElementById("content").innerHTML = `
    <section class="card hero">
      <div class="hero-label">My Wallet</div>
      <div class="hero-balance" id="heroBalance">${tonBalance.toFixed(2)} TON</div>
      <div class="hero-usd">$0.00 USD</div>
      <div class="hero-logo">💎</div>
      <div class="action-row">
        <button class="action-btn primary" onclick="showCreateWalletModal()">Create Wallet</button>
        <button class="action-btn" onclick="showImportWalletModal()">Import Wallet</button>
      </div>
    </section>

    ${!address ? `
      <section class="card section" style="text-align:center; padding:20px;">
        <div style="font-size:32px; margin-bottom:8px;">👛</div>
        <div style="font-weight:850; font-size:16px;">No wallet yet</div>
        <div style="color:var(--muted); font-size:12px; margin-top:4px;">Create a new wallet or import an existing one to get started.</div>
      </section>
    ` : `
      <section class="card section">
        <div class="section-head"><span>Wallet Address</span></div>
        <div class="address-row">
          <span class="dot"></span>
          <div class="address-text">${esc(shortAddress(address))}</div>
          <button class="copy-pill" onclick="copyAddress()">Copy</button>
        </div>
      </section>
    `}

    <section class="card section">
      <div class="section-head">
        <span>Tokens</span>
        <button class="refresh" onclick="refreshWallet()">Refresh ↻</button>
      </div>
      <div id="tokenList" class="token-list">
        ${renderTonToken()}
        ${renderJettons()}
      </div>
    </section>
  `;

  if (address) refreshWallet(false);
}

/* AIRDROP SCREEN (TGN Amount Only, No Tasks) */
function renderAirdrop() {
  document.getElementById("content").innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Airdrop</h1>
        <div class="page-subtitle">Check your TGN airdrop balance and rewards</div>
      </div>
    </div>

    <section class="airdrop-card">
      <div class="airdrop-title-row">
        <span style="font-size: 20px;">🎁</span>
        <h2>Airdrop Rewards</h2>
      </div>
      <div style="font-size: 12px; color: var(--muted); margin-bottom: 6px;">Your earned token balance</div>

      <div class="total-reward-box">
        <div>
          <span class="rew-label">Total Rewards</span>
          <div class="rew-amount">125.00 TGN</div>
        </div>
        <div class="tgn-logo-badge">TGN</div>
      </div>

      <div class="airdrop-stats">
        <div class="stat-item">
          <span class="stat-lbl">Claimed</span>
          <span class="stat-val">3 / 8</span>
        </div>
        <div class="stat-item">
          <span class="stat-lbl">Your Points</span>
          <span class="stat-val">450</span>
        </div>
        <div class="stat-item">
          <span class="stat-lbl">Referrals</span>
          <span class="stat-val">12</span>
        </div>
      </div>
    </section>
  `;
}

/* TON */
function renderTonToken() {
  return `
    <div class="token-item token-row">
      <div class="token-left">
        <div class="token-logo">💎</div>
        <div>
          <div class="token-name">TON</div>
          <div class="token-sub">Toncoin • Mainnet</div>
        </div>
      </div>
      <div class="token-amount">
        ${tonBalance.toFixed(4)} TON
        <div class="token-usd">$0.00</div>
      </div>
    </div>
  `;
}

/* Jettons */
function renderJettons() {
  if (!jettons.length) {
    return `
      <div class="empty" style="padding:22px 8px">
        <div class="empty-text">
          TON-network Jetton balances will appear here when a secure blockchain indexer/backend is connected.
        </div>
      </div>
    `;
  }
  return jettons.map(function (j) {
    return `
      <div class="token-item token-row">
        <div class="token-left">
          <div class="token-logo">🪙</div>
          <div>
            <div class="token-name">${esc(j.symbol || "JETTON")}</div>
            <div class="token-sub">${esc(j.name || "TON Jetton")}</div>
          </div>
        </div>
        <div class="token-amount">
          ${esc(j.amount || "0")}
          <div class="token-usd">$0.00</div>
        </div>
      </div>
    `;
  }).join("");
}

/* TON Balance */
async function refreshWallet(show = true) {
  if (!walletData?.address) {
    if (show) showToast("Wallet address not available");
    return;
  }
  try {
    const url = new URL(CONFIG.API_BASE + "/getAddressBalance");
    url.searchParams.set("address", walletData.address);
    if (CONFIG.API_KEY) url.searchParams.set("api_key", CONFIG.API_KEY);

    const response = await fetch(url.toString(), {
      headers: CONFIG.API_KEY ? { "X-API-Key": CONFIG.API_KEY } : {}
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || data.description || "API error");

    const nano = Number(data.result);
    tonBalance = Number.isFinite(nano) && nano >= 0 ? nano / 1e9 : 0;

    const hero = document.getElementById("heroBalance");
    if (hero) hero.textContent = tonBalance.toFixed(2) + " TON";

    const list = document.getElementById("tokenList");
    if (list) list.innerHTML = renderTonToken() + renderJettons();

    if (show) showToast("Balance refreshed");
  } catch (error) {
    console.error(error);
    if (show) showToast("API not connected");
  }
}

/* Create / Import Wallet Modals */
function showCreateWalletModal() {
  openModal(
    "Create New Wallet",
    `
      <p>Create a brand new TON wallet. A secure 12-word recovery phrase will be generated for you.</p>
      <button class="btn primary" style="margin-top:14px;" onclick="simulateCreateWallet()">Create & Continue</button>
    `
  );
}

function simulateCreateWallet() {
  walletData = { address: "EQBnKobCT9900FakeAddressForDemoK12K3" };
  localStorage.setItem(CONFIG.WALLET_STORAGE, JSON.stringify(walletData));
  closeModal();
  showToast("Wallet created successfully ✓");
  renderHome();
}

function showImportWalletModal() {
  openModal(
    "Import Wallet",
    `
      <p>Import an existing wallet using your 12 or 24-word seed phrase.</p>
      <textarea class="text-area" id="seedInput" placeholder="Type or paste your seed phrase here..." rows="3" style="margin-top:10px;"></textarea>
      <button class="btn primary" onclick="simulateImportWallet()">Import & Continue</button>
    `
  );
}

function simulateImportWallet() {
  const val = document.getElementById("seedInput")?.value.trim();
  if (!val) {
    showToast("Enter seed phrase");
    return;
  }
  walletData = { address: "EQBnKobCT9900ImportedAddressDemo99" };
  localStorage.setItem(CONFIG.WALLET_STORAGE, JSON.stringify(walletData));
  closeModal();
  showToast("Wallet imported successfully ✓");
  renderHome();
}

/* Copy */
async function copyAddress() {
  if (!walletData?.address) {
    showToast("Wallet address unavailable");
    return;
  }
  try {
    await navigator.clipboard.writeText(walletData.address);
    showToast("Wallet address copied ✓");
  } catch (_) {
    showToast("Copy failed");
  }
}

/* ACTIVITY */
function renderActivity() {
  document.getElementById("content").innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Activity</h1>
        <div class="page-subtitle">Real wallet transactions only</div>
      </div>
      <button class="refresh" onclick="loadTransactions()">Refresh ↻</button>
    </div>
    <div class="filter-row">
      <button class="filter active">All</button>
      <button class="filter">Received</button>
      <button class="filter">Sent</button>
      <button class="filter">Jettons</button>
    </div>
    <div id="activityList"></div>
  `;
  loadTransactions();
}

async function loadTransactions() {
  const box = document.getElementById("activityList");
  if (!box) return;
  if (!walletData?.address) {
    box.innerHTML = emptyActivity();
    return;
  }
  try {
    const url = new URL(CONFIG.API_BASE + "/getTransactions");
    url.searchParams.set("address", walletData.address);
    url.searchParams.set("limit", "20");
    if (CONFIG.API_KEY) url.searchParams.set("api_key", CONFIG.API_KEY);

    const response = await fetch(url.toString(), {
      headers: CONFIG.API_KEY ? { "X-API-Key": CONFIG.API_KEY } : {}
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || data.description || "API error");

    transactions = Array.isArray(data.result) ? data.result : [];
    if (!transactions.length) {
      box.innerHTML = emptyActivity();
      return;
    }

    box.innerHTML = transactions.map(function (tx, i) {
      return `
        <div class="card tx">
          <div class="tx-icon" style="background:rgba(22,140,255,.09);color:#3caaff">↗</div>
          <div class="tx-main">
            <div class="tx-title">Transaction ${i + 1}</div>
            <div class="tx-sub">${tx.utime ? new Date(tx.utime * 1000).toLocaleString() : "On-chain"}</div>
          </div>
          <div class="tx-amount">${tx.hash ? esc(String(tx.hash).slice(0, 6) + "…") : "View"}</div>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error(error);
    box.innerHTML = emptyActivity("Connect the secure API/backend to show real history.");
  }
}

function emptyActivity(message = "No transactions yet.") {
  return `
    <div class="card empty">
      <div class="empty-icon">◷</div>
      <div class="empty-title">No Activity</div>
      <div class="empty-text">${esc(message)}</div>
    </div>
  `;
}

/* SEND */
function renderSend() {
  document.getElementById("content").innerHTML = `
    <button class="btn secondary back-btn" onclick="switchNav('home')">← Back</button>
    <div class="page-head">
      <div>
        <h1 class="page-title">Send</h1>
        <div class="page-subtitle">TON transfer</div>
      </div>
    </div>
    <section class="card form-card">
      <h2 class="form-title">Send TON</h2>
      <label class="input-label">Recipient Address</label>
      <input id="sendTo" class="text-input" placeholder="UQ… / EQ…" autocomplete="off">
      <label class="input-label">Amount</label>
      <input id="sendAmount" class="text-input" type="number" min="0" step="0.000000001" placeholder="0.00">
      <button class="btn primary" onclick="prepareSend()">Confirm Withdrawal</button>
    </section>
  `;
}

function prepareSend() {
  const to = document.getElementById("sendTo")?.value.trim();
  const amount = Number(document.getElementById("sendAmount")?.value);

  if (!to) {
    showToast("Enter recipient address");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Enter a valid amount");
    return;
  }

  openModal(
    "Transfer Ready",
    `
      <p><b>Recipient</b></p>
      <p style="word-break:break-all">${esc(to)}</p>
      <p><b>Amount</b></p>
      <p>${amount.toFixed(4)} TON</p>
      <div class="warning">Real blockchain broadcasting is intentionally not performed by this frontend.</div>
    `
  );
}

/* WALLET */
function renderWallet() {
  const address = walletData?.address || "Wallet address unavailable";

  document.getElementById("content").innerHTML = `
    <div class="page-head">
      <div>
        <h1 class="page-title">Wallet</h1>
        <div class="page-subtitle">TON Mainnet</div>
      </div>
    </div>

    <section class="card section">
      <div class="section-head">TON Wallet Address</div>
      <div class="address-row">
        <div class="address-text">${esc(address)}</div>
        <button class="copy-pill" onclick="copyAddress()">Copy</button>
      </div>
    </section>

    <section class="card section">
      <div class="section-head">Current Balance</div>
      <div class="hero-balance" style="font-size:40px; margin:8px 0">${tonBalance.toFixed(2)} TON</div>
      <div class="token-sub">TON Mainnet</div>
    </section>
  `;
}

/* PROFILE */
function renderProfile() {
  const u = user();

  document.getElementById("content").innerHTML = `
    <div class="page-head">
      <h1 class="page-title">Profile</h1>
    </div>

    <section class="profile-hero">
      <div class="profile-main">
        <div class="profile-avatar-wrap">
          ${avatarHtml()}
          <span class="profile-online"></span>
        </div>
        <div>
          <div class="profile-name">${esc(userName())}</div>
          <div class="profile-username">${esc(username())}</div>
          <div class="profile-id">Telegram ID: ${esc(userId())}</div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-value">Telegram</div>
          <div class="profile-stat-label">Account</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">TON</div>
          <div class="profile-stat-label">Network</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${u.photo_url ? "✓" : "—"}</div>
          <div class="profile-stat-label">Photo</div>
        </div>
      </div>
    </section>

    <section class="card profile-menu">
      <button class="profile-menu-item" onclick="openPersonal()">
        <span class="profile-menu-left">
          <span class="profile-menu-icon">♙</span>
          <span>
            <div class="profile-menu-title">Personal Information</div>
            <div class="profile-menu-sub">Name, Telegram ID & account</div>
          </span>
        </span>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item" onclick="openSecurity()">
        <span class="profile-menu-left">
          <span class="profile-menu-icon">◉</span>
          <span>
            <div class="profile-menu-title">Security</div>
            <div class="profile-menu-sub">Protect your wallet</div>
          </span>
        </span>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item" onclick="openHelp()">
        <span class="profile-menu-left">
          <span class="profile-menu-icon">?</span>
          <span>
            <div class="profile-menu-title">Help & Support</div>
            <div class="profile-menu-sub">Wallet help & information</div>
          </span>
        </span>
        <span class="profile-menu-arrow">›</span>
      </button>

      <button class="profile-menu-item danger" onclick="logoutWallet()">
        <span class="profile-menu-left">
          <span class="profile-menu-icon">↪</span>
          <span>
            <div class="profile-menu-title">Log Out</div>
            <div class="profile-menu-sub">Remove local wallet session</div>
          </span>
        </span>
        <span class="profile-menu-arrow">›</span>
      </button>
    </section>
  `;
}

function openPersonal() {
  openModal("Personal Information", `
    <div class="info-card">
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${esc(userName())}</span></div>
      <div class="info-row"><span class="info-label">Username</span><span class="info-value">${esc(username())}</span></div>
      <div class="info-row"><span class="info-label">Telegram ID</span><span class="info-value">${esc(userId())}</span></div>
    </div>
  `);
}

function openSecurity() {
  openModal("Security", `<div class="warning">Never share a seed phrase or private key.</div>`);
}

function openHelp() {
  openModal("Help & Support", `<p><b>TGN Wallet</b> - TON Mainnet wallet interface.</p>`);
}

function logoutWallet() {
  openModal("Log Out", `
    <p>This removes the locally stored wallet session from this device.</p>
    <button class="btn primary" style="margin-top:12px;" onclick="localStorage.removeItem(CONFIG.WALLET_STORAGE); walletData=null; closeModal(); switchNav('home'); showToast('Wallet removed');">Confirm Log Out</button>
  `);
}

/* START */
function boot() {
  renderHome();
  if (walletData) refreshWallet(false);
}

boot();
