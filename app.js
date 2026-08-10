/*
 TGN WALLET - FIXED APP.JS

 Worker API:
 https://tgn-wallet-api.yethu20052.workers.dev

 IMPORTANT:
 - No TON Center API key in frontend.
 - Frontend talks to Cloudflare Worker.
*/

const CONFIG = {
  API_BASE: "https://tgn-wallet-api.yethu20052.workers.dev",
  WALLET_STORAGE: "TGN_TON_WALLET"
};

const tg = window.Telegram?.WebApp;

let activeTab = "home";
let walletData = safeWallet();
let tonBalance = 0;
let transactions = [];
let jettons = [];


/* =========================
   TELEGRAM
========================= */

if (tg) {
  tg.ready();
  tg.expand();

  try {
    tg.setHeaderColor("#07101f");
    tg.setBackgroundColor("#050a16");
  } catch (_) {}
}


/* =========================
   WALLET STORAGE
========================= */

function safeWallet() {
  try {
    const raw = localStorage.getItem(CONFIG.WALLET_STORAGE);

    const data = raw ? JSON.parse(raw) : null;

    if (data && data.address) {
      return data;
    }

    return null;

  } catch (_) {
    return null;
  }
}


/* =========================
   HTML ESCAPE
========================= */

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m];
  });
}


/* =========================
   TELEGRAM USER
========================= */

function user() {
  return tg?.initDataUnsafe?.user || {};
}


function userName() {
  const u = user();

  return [
    u.first_name,
    u.last_name
  ]
    .filter(Boolean)
    .join(" ") || "Telegram User";
}


function username() {
  return user().username
    ? "@" + user().username
    : "No username";
}


function userId() {
  return user().id
    ? String(user().id)
    : "Unavailable";
}


/* =========================
   AVATAR
========================= */

function avatarHtml() {

  const u = user();

  const photo = u.photo_url || "";

  const initial =
    (u.first_name || "T")
      .charAt(0)
      .toUpperCase();

  if (photo) {

    return `
      <img
        class="profile-avatar"
        src="${esc(photo)}"
        alt="Telegram profile"
        onerror="
          this.outerHTML =
          '<div class=&quot;avatar-fallback&quot;>${esc(initial)}</div>'
        "
      >
    `;
  }

  return `
    <div class="avatar-fallback">
      ${esc(initial)}
    </div>
  `;
}


/* =========================
   ADDRESS
========================= */

function shortAddress(address) {

  if (!address) {
    return "Wallet not connected";
  }

  return address.length > 18
    ? address.slice(0, 9) +
      "..." +
      address.slice(-7)
    : address;
}


/* =========================
   API
========================= */

async function apiFetch(path, options = {}) {

  const base =
    CONFIG.API_BASE.replace(/\/$/, "");

  const url =
    base + path;

  const response =
    await fetch(url, {
      ...options,

      headers: {
        "Accept": "application/json",
        ...(options.headers || {})
      }
    });

  let data;

  try {

    data =
      await response.json();

  } catch (_) {

    throw new Error(
      "Invalid API response"
    );

  }

  if (
    !response.ok ||
    data?.ok === false
  ) {

    throw new Error(
      data?.error ||
      data?.description ||
      `API error (${response.status})`
    );

  }

  return data;
}


/* =========================
   TOAST
========================= */

function showToast(message) {

  const el =
    document.getElementById("toast");

  if (!el) {
    return;
  }

  el.textContent =
    message;

  el.classList.add("show");

  clearTimeout(
    window.__toastTimer
  );

  window.__toastTimer =
    setTimeout(
      function () {

        el.classList.remove("show");

      },
      1800
    );
}


/* =========================
   MODAL
========================= */

function openModal(title, body) {

  const titleEl =
    document.getElementById("mTitle");

  const bodyEl =
    document.getElementById("mBody");

  const modal =
    document.getElementById("modal");

  if (!titleEl ||
      !bodyEl ||
      !modal) {

    return;
  }

  titleEl.textContent =
    title;

  bodyEl.innerHTML =
    body;

  modal.classList.add("show");
}


function closeModal() {

  document
    .getElementById("modal")
    ?.classList.remove("show");

}


/* =========================
   ICONS
========================= */

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

    profile: `
      <circle cx="12" cy="7" r="4"></circle>
      <path d="M4 21v-1a7 7 0 0 1 14 0v1"></path>
    `
  };

  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      ${paths[name] || ""}
    </svg>
  `;
}


function initIcons() {

  document
    .querySelectorAll(".nav-svg")
    .forEach(function (el) {

      el.innerHTML =
        icon(el.dataset.icon);

    });
}


/* =========================
   NAVIGATION
========================= */

function switchNav(tab) {

  activeTab =
    tab;

  document
    .querySelectorAll(".nav-item")
    .forEach(function (item) {

      item.classList.remove(
        "active"
      );

    });

  document
    .getElementById(
      "nav-" + tab
    )
    ?.classList.add("active");


  if (tab === "home") {

    renderHome();

  } else if (tab === "activity") {

    renderActivity();

  } else if (tab === "send") {

    renderSend();

  } else if (tab === "wallet") {

    renderWallet();

  } else if (tab === "profile") {

    renderProfile();

  }
}


/* =========================
   HOME
========================= */

function renderHome() {

  const address =
    walletData?.address || "";

  const content =
    document.getElementById(
      "content"
    );

  if (!content) {
    return;
  }

  content.innerHTML = `

    <section class="card hero">

      <div class="hero-label">
        My Wallet
      </div>

      <div
        class="hero-balance"
        id="heroBalance"
      >
        ${tonBalance.toFixed(2)} TON
      </div>

      <div class="hero-usd">
        $0.00 USD
      </div>

      <div class="hero-logo">
        💎
      </div>

      <div class="action-row">

        <button
          class="action-btn primary"
          onclick="showDeposit()"
        >
          Deposit
        </button>

        <button
          class="action-btn"
          onclick="switchNav('send')"
        >
          Withdraw
        </button>

      </div>

    </section>


    <section class="card section">

      <div class="section-head">
        Wallet Address
      </div>

      <div class="address-row">

        <span class="dot"></span>

        <div class="address-text">
          ${esc(
            shortAddress(address)
          )}
        </div>

        <button
          class="copy-pill"
          onclick="copyAddress()"
        >
          Copy
        </button>

      </div>

    </section>


    <section class="card section">

      <div class="section-head">

        <span>
          Tokens
        </span>

        <button
          class="refresh"
          onclick="refreshWallet()"
        >
          Refresh ↻
        </button>

      </div>

      <div
        id="tokenList"
        class="token-list"
      >

        ${renderTonToken()}

        ${renderJettons()}

      </div>

    </section>

  `;

  if (address) {

    refreshWallet(false);

  }
}


/* =========================
   TON TOKEN
========================= */

function renderTonToken() {

  return `

    <div class="token-item token-row">

      <div class="token-left">

        <div class="token-logo">
          💎
        </div>

        <div>

          <div class="token-name">
            TON
          </div>

          <div class="token-sub">
            Toncoin • Mainnet
          </div>

        </div>

      </div>

      <div class="token-amount">

        ${tonBalance.toFixed(4)} TON

        <div class="token-usd">
          $0.00
        </div>

      </div>

    </div>

  `;
}


/* =========================
   JETTONS
========================= */

function renderJettons() {

  if (!jettons.length) {

    return `

      <div
        class="empty"
        style="padding:22px 8px"
      >

        <div class="empty-text">

          TON-network Jetton balances
          will appear here when a secure
          Jetton backend is connected.

        </div>

      </div>

    `;
  }


  return jettons
    .map(function (j) {

      return `

        <div class="token-item token-row">

          <div class="token-left">

            <div class="token-logo">
              🪙
            </div>

            <div>

              <div class="token-name">
                ${esc(
                  j.symbol ||
                  "JETTON"
                )}
              </div>

              <div class="token-sub">
                ${esc(
                  j.name ||
                  "TON Jetton"
                )}
              </div>

            </div>

          </div>

          <div class="token-amount">

            ${esc(
              j.amount ||
              "0"
            )}

            <div class="token-usd">
              $0.00
            </div>

          </div>

        </div>

      `;

    })
    .join("");
}


/* =========================
   BALANCE
========================= */

async function refreshWallet(
  show = true
) {

  if (!walletData?.address) {

    if (show) {

      showToast(
        "Wallet address not available"
      );

    }

    return;
  }


  try {

    const data =
      await apiFetch(
        "/getAddressBalance?address=" +
        encodeURIComponent(
          walletData.address
        )
      );


    const nano =
      Number(data.result);


    tonBalance =
      Number.isFinite(nano) &&
      nano >= 0
        ? nano / 1e9
        : 0;


    const hero =
      document.getElementById(
        "heroBalance"
      );


    if (hero) {

      hero.textContent =
        tonBalance.toFixed(2) +
        " TON";

    }


    const list =
      document.getElementById(
        "tokenList"
      );


    if (list) {

      list.innerHTML =
        renderTonToken() +
        renderJettons();

    }


    if (show) {

      showToast(
        "Balance refreshed ✓"
      );

    }

  } catch (error) {

    console.error(error);

    if (show) {

      showToast(
        error.message ||
        "API connection failed"
      );

    }
  }
}


/* =========================
   DEPOSIT
========================= */

function showDeposit() {

  if (!walletData?.address) {

    openModal(
      "Deposit",
      `
        <p>
          Your wallet address is not
          available yet.
        </p>

        <p>
          Connect or configure the
          wallet address first.
        </p>
      `
    );

    return;
  }


  openModal(
    "Deposit",
    `

      <p>
        Send TON or a TON-network
        Jetton to this wallet address.
      </p>

      <div
        class="address-row"
        style="margin-top:12px"
      >

        <div class="address-text">
          ${esc(
            walletData.address
          )}
        </div>

        <button
          class="copy-pill"
          onclick="copyAddress()"
        >
          Copy
        </button>

      </div>

      <p
        style="
          color:#8196b5;
          font-size:11px;
          margin-top:12px
        "
      >
        Only send assets on the
        TON Mainnet to this address.
      </p>

    `
  );
}


/* =========================
   COPY ADDRESS
========================= */

async function copyAddress() {

  if (!walletData?.address) {

    showToast(
      "Wallet address unavailable"
    );

    return;
  }


  try {

    if (
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {

      await navigator.clipboard.writeText(
        walletData.address
      );

    } else {

      const textarea =
        document.createElement(
          "textarea"
        );

      textarea.value =
        walletData.address;

      document.body.appendChild(
        textarea
      );

      textarea.select();

      document.execCommand(
        "copy"
      );

      textarea.remove();

    }


    showToast(
      "Wallet address copied ✓"
    );

  } catch (_) {

    showToast(
      "Copy failed"
    );

  }
}


/* =========================
   ACTIVITY
========================= */

function renderActivity() {

  const content =
    document.getElementById(
      "content"
    );

  if (!content) {
    return;
  }


  content.innerHTML = `

    <div class="page-head">

      <div>

        <h1 class="page-title">
          Activity
        </h1>

        <div class="page-subtitle">
          Real wallet transactions
        </div>

      </div>

      <button
        class="refresh"
        onclick="loadTransactions()"
      >
        Refresh ↻
      </button>

    </div>


    <div class="filter-row">

      <button class="filter active">
        All
      </button>

      <button class="filter">
        Received
      </button>

      <button class="filter">
        Sent
      </button>

      <button class="filter">
        Jettons
      </button>

    </div>


    <div id="activityList"></div>

  `;


  loadTransactions();
}


/* =========================
   TRANSACTIONS
========================= */

async function loadTransactions() {

  const box =
    document.getElementById(
      "activityList"
    );

  if (!box) {
    return;
  }


  if (!walletData?.address) {

    box.innerHTML =
      emptyActivity(
        "Connect a wallet address to view transactions."
      );

    return;
  }


  try {

    const data =
      await apiFetch(
        "/getTransactions?address=" +
        encodeURIComponent(
          walletData.address
        ) +
        "&limit=20"
      );


    transactions =
      Array.isArray(
        data.result
      )
        ? data.result
        : [];


    if (!transactions.length) {

      box.innerHTML =
        emptyActivity();

      return;
    }


    box.innerHTML =
      transactions
        .map(function (tx, i) {

          const hash =
            tx.transaction_id?.hash ||
            tx.hash ||
            "";


          return `

            <div class="card tx">

              <div
                class="tx-icon"
                style="
                  background:rgba(
                    22,
                    140,
                    255,
                    .09
                  );
                  color:#3caaff
                "
              >
                ↗
              </div>


              <div class="tx-main">

                <div class="tx-title">
                  Transaction ${i + 1}
                </div>

                <div class="tx-sub">

                  ${
                    tx.utime
                      ? new Date(
                          tx.utime * 1000
                        ).toLocaleString()
                      : "On-chain"
                  }

                </div>

              </div>


              <div class="tx-amount">

                ${
                  hash
                    ? esc(
                        String(
                          hash
                        ).slice(0, 8) +
                        "…"
                      )
                    : "View"
                }

              </div>

            </div>

          `;

        })
        .join("");

  } catch (error) {

    console.error(error);

    box.innerHTML =
      emptyActivity(
        "Unable to load transactions from Worker."
      );

  }
}


function emptyActivity(
  message = "No transactions yet."
) {

  return `

    <div class="card empty">

      <div class="empty-icon">
        ◷
      </div>

      <div class="empty-title">
        No Activity
      </div>

      <div class="empty-text">
        ${esc(message)}
      </div>

    </div>

  `;
}


/* =========================
   SEND
========================= */

function renderSend() {

  const content =
    document.getElementById(
      "content"
    );

  if (!content) {
    return;
  }


  content.innerHTML = `

    <button
      class="btn secondary back-btn"
      onclick="switchNav('home')"
    >
      ← Back
    </button>


    <div class="page-head">

      <div>

        <h1 class="page-title">
          Send
        </h1>

        <div class="page-subtitle">
          TON transfer
        </div>

      </div>

    </div>


    <section class="card form-card">

      <h2 class="form-title">
        Send TON
      </h2>


      <label class="input-label">
        Recipient Address
      </label>

      <input
        id="sendTo"
        class="text-input"
        placeholder="UQ… / EQ…"
        autocomplete="off"
      >


      <label class="input-label">
        Amount
      </label>

      <input
        id="sendAmount"
        class="text-input"
        type="number"
        min="0"
        step="0.000000001"
        placeholder="0.00"
      >


      <button
        class="btn primary"
        onclick="prepareSend()"
      >
        Confirm Withdrawal
      </button>


      <p
        style="
          color:#7188a7;
          font-size:11px;
          line-height:1.6;
          margin:12px 0 0
        "
      >
        Real blockchain broadcasting is
        intentionally disabled in this
        public frontend.
      </p>

    </section>

  `;
}


function prepareSend() {

  const to =
    document.getElementById(
      "sendTo"
    )?.value.trim();


  const amount =
    Number(
      document.getElementById(
        "sendAmount"
      )?.value
    );


  if (!to) {

    showToast(
      "Enter recipient address"
    );

    return;
  }


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showToast(
      "Enter a valid amount"
    );

    return;
  }


  openModal(
    "Transfer Ready",
    `

      <p>
        <b>Recipient</b>
      </p>

      <p
        style="word-break:break-all"
      >
        ${esc(to)}
      </p>

      <p>
        <b>Amount</b>
      </p>

      <p>
        ${amount.toFixed(4)} TON
      </p>

      <div class="warning">

        Real blockchain broadcasting
        is not performed by this
        frontend.

      </div>

    `
  );
}


/* =========================
   WALLET PAGE
========================= */

function renderWallet() {

  const address =
    walletData?.address ||
    "Wallet address unavailable";


  const content =
    document.getElementById(
      "content"
    );

  if (!content) {
    return;
  }


  content.innerHTML = `

    <div class="page-head">

      <div>

        <h1 class="page-title">
          Wallet
        </h1>

        <div class="page-subtitle">
          TON Mainnet
        </div>

      </div>

    </div>


    <section class="card section">

      <div class="section-head">
        TON Wallet Address
      </div>


      <div class="address-row">

        <div class="address-text">
          ${esc(address)}
        </div>

        <button
          class="copy-pill"
          onclick="copyAddress()"
        >
          Copy
        </button>

      </div>

    </section>


    <section class="card section">

      <div class="section-head">
        Current Balance
      </div>


      <div
        class="hero-balance"
        style="
          font-size:40px;
          margin:8px 0
        "
      >
        ${tonBalance.toFixed(2)} TON
      </div>


      <div class="token-sub">
        TON Mainnet
      </div>

    </section>

  `;
}


/* =========================
   PROFILE
========================= */

function renderProfile() {

  const u =
    user();


  const content =
    document.getElementById(
      "content"
    );

  if (!content) {
    return;
  }


  content.innerHTML = `

    <div class="page-head">

      <h1 class="page-title">
        Profile
      </h1>

    </div>


    <section class="profile-hero">

      <div class="profile-main">

        <div class="profile-avatar-wrap">

          ${avatarHtml()}

          <span
            class="profile-online"
          ></span>

        </div>


        <div>

          <div class="profile-name">
            ${esc(userName())}
          </div>

          <div class="profile-username">
            ${esc(username())}
          </div>

          <div class="profile-id">
            Telegram ID:
            ${esc(userId())}
          </div>

        </div>

      </div>


      <div class="profile-stats">

        <div class="profile-stat">

          <div class="profile-stat-value">
            Telegram
          </div>

          <div class="profile-stat-label">
            Account
          </div>

        </div>


        <div class="profile-stat">

          <div class="profile-stat-value">
            TON
          </div>

          <div class="profile-stat-label">
            Network
          </div>

        </div>


        <div class="profile-stat">

          <div class="profile-stat-value">
            ${u.photo_url ? "✓" : "—"}
          </div>

          <div class="profile-stat-label">
            Photo
          </div>

        </div>

      </div>

    </section>


    <section class="card profile-menu">

      <button
        class="profile-menu-item"
        onclick="openPersonal()"
      >

        <span class="profile-menu-left">

          <span class="profile-menu-icon">
            ♙
          </span>

          <span>

            <div class="profile-menu-title">
              Personal Information
            </div>

            <div class="profile-menu-sub">
              Name, Telegram ID & account
            </div>

          </span>

        </span>

        <span class="profile-menu-arrow">
          ›
        </span>

      </button>


      <button
        class="profile-menu-item"
        onclick="openSecurity()"
      >

        <span class="profile-menu-left">

          <span class="profile-menu-icon">
            ◉
          </span>

          <span>

            <div class="profile-menu-title">
              Security
            </div>

            <div class="profile-menu-sub">
              Protect your wallet
            </div>

          </span>

        </span>

        <span class="profile-menu-arrow">
          ›
        </span>

      </button>


      <button
        class="profile-menu-item"
        onclick="openHelp()"
      >

        <span class="profile-menu-left">

          <span class="profile-menu-icon">
            ?
          </span>

          <span>

            <div class="profile-menu-title">
              Help & Support
            </div>

            <div class="profile-menu-sub">
              Wallet help & information
            </div>

          </span>

        </span>

        <span class="profile-menu-arrow">
          ›
        </span>

      </button>


      <button
        class="profile-menu-item danger"
        onclick="logoutWallet()"
      >

        <span class="profile-menu-left">

          <span class="profile-menu-icon">
            ↪
          </span>

          <span>

            <div class="profile-menu-title">
              Log Out
            </div>

            <div class="profile-menu-sub">
              Remove local wallet session
            </div>

          </span>

        </span>

        <span class="profile-menu-arrow">
          ›
        </span>

      </button>

    </section>


    <section class="card info-card">

      <div class="info-row">

        <span class="info-label">
          Name
        </span>

        <span class="info-value">
          ${esc(userName())}
        </span>

      </div>


      <div class="info-row">

        <span class="info-label">
          Username
        </span>

        <span class="info-value">
          ${esc(username())}
        </span>

      </div>


      <div class="info-row">

        <span class="info-label">
          Telegram ID
        </span>

        <span class="info-value">
          ${esc(userId())}
        </span>

      </div>


      <div class="info-row">

        <span class="info-label">
          Account Year
        </span>

        <span class="info-value">
          Not exposed by Telegram Mini Apps
        </span>

      </div>

    </section>

  `;
}


/* =========================
   PROFILE MODALS
========================= */

function openPersonal() {

  openModal(
    "Personal Information",
    `

      <div class="info-card">

        <div class="info-row">

          <span class="info-label">
            Name
          </span>

          <span class="info-value">
            ${esc(userName())}
          </span>

        </div>


        <div class="info-row">

          <span class="info-label">
            Username
          </span>

          <span class="info-value">
            ${esc(username())}
          </span>

        </div>


        <div class="info-row">

          <span class="info-label">
            Telegram ID
          </span>

          <span class="info-value">
            ${esc(userId())}
          </span>

        </div>

      </div>

    `
  );
}


function openSecurity() {

  openModal(
    "Security",
    `

      <div class="warning">

        Never share a seed phrase
        or private key.

        This frontend does not display
        or store recovery phrases.

      </div>


      <p>

        For real sending/signing,
        use TON Connect or a properly
        secured backend signer.

      </p>

    `
  );
}


function openHelp() {

  openModal(
    "Help & Support",
    `

      <p>
        <b>TGN Wallet</b>
      </p>

      <p>
        TON Mainnet wallet interface
        with real blockchain read-only
        balance/history support.
      </p>

      <p
        style="
          color:#8196b5;
          font-size:11px
        "
      >
        Jetton indexing and secure API
        proxy should be connected on
        the backend for production.
      </p>

    `
  );
}


/* =========================
   LOGOUT
========================= */

function logoutWallet() {

  openModal(
    "Log Out",
    `

      <p>
        This removes the locally stored
        wallet session from this device.
      </p>


      <button
        class="btn primary"
        onclick="confirmLogout()"
      >
        Confirm Log Out
      </button>

    `
  );
}


function confirmLogout() {

  localStorage.removeItem(
    CONFIG.WALLET_STORAGE
  );

  walletData = null;

  tonBalance = 0;

  transactions = [];

  jettons = [];

  closeModal();

  switchNav("home");

  showToast(
    "Wallet session removed"
  );
}


/* =========================
   START
========================= */

function boot() {

  initIcons();

  renderHome();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    boot
  );

} else {

  boot();

}
