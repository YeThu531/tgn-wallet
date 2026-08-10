/*
=========================================
TGN TON WALLET
APP.JS
=========================================
*/

const API_KEY = "c09170dd62724a03f3803b0f1023219c672c0fcc02a2deed31bd75faea36e9e1";

let tonweb = null;

let walletData = null;

let activeTab = "home";


/* =====================================
   LOAD WALLET
===================================== */

try {

  walletData = JSON.parse(
    localStorage.getItem("TGN_TON_WALLET") || "null"
  );

} catch (error) {

  walletData = null;

}


/* =====================================
   TELEGRAM
===================================== */

const tg =
  window.Telegram?.WebApp;


if (tg) {

  tg.ready();

  tg.expand();

  try {

    tg.setHeaderColor("#07101f");

    tg.setBackgroundColor("#050a16");

  } catch (error) {}

}


/* =====================================
   HTML ESCAPE
===================================== */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /[&<>'"]/g,
      function (character) {

        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        }[character];

      }
    );

}


/* =====================================
   TELEGRAM USER
===================================== */

function getTelegramUser() {

  return (
    tg?.initDataUnsafe?.user ||
    null
  );

}


function getFullName() {

  const u = getTelegramUser();

  if (!u) {

    return "Telegram User";

  }

  return (
    [
      u.first_name,
      u.last_name
    ]
      .filter(Boolean)
      .join(" ")
    || "Telegram User"
  );

}


function getUsername() {

  const u = getTelegramUser();

  if (!u?.username) {

    return "No username";

  }

  return "@" + u.username;

}


function getTelegramId() {

  const u = getTelegramUser();

  return u?.id
    ? String(u.id)
    : "Unavailable";

}


function getPhotoUrl() {

  return (
    getTelegramUser()?.photo_url ||
    ""
  );

}


/* =====================================
   PROFILE AVATAR
===================================== */

function getAvatarHTML() {

  const photo =
    getPhotoUrl();

  const initial =
    escapeHtml(
      getFullName()
        .trim()
        .charAt(0)
        .toUpperCase()
      || "T"
    );

  if (photo) {

    return `
      <img
        class="profile-avatar"
        src="${escapeHtml(photo)}"
        alt="Telegram Profile"
        onerror="
          this.outerHTML =
          '<div class=&quot;avatar-fallback&quot;>${initial}</div>'
        "
      >
    `;

  }

  return `
    <div class="avatar-fallback">
      ${initial}
    </div>
  `;

}


/* =====================================
   TOAST
===================================== */

function showToast(message) {

  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.add("show");

  clearTimeout(
    window.__toastTimer
  );

  window.__toastTimer =
    setTimeout(
      () => {
        toast.classList.remove("show");
      },
      1800
    );

  try {

    tg?.HapticFeedback
      ?.notificationOccurred(
        "success"
      );

  } catch (error) {}

}


/* =====================================
   MODAL
===================================== */

function openModal(title, html) {

  document.getElementById(
    "mTitle"
  ).textContent = title;

  document.getElementById(
    "mBody"
  ).innerHTML = html;

  document
    .getElementById("modal")
    .classList.add("show");

}


function closeModal() {

  document
    .getElementById("modal")
    .classList.remove("show");

}


/* =====================================
   TRANSACTIONS
===================================== */

function getTransactions() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          "TGN_USER_TXS"
        ) || "[]"
      );

    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {

    return [];

  }

}


function saveTransaction(transaction) {

  const list =
    getTransactions();

  list.unshift(transaction);

  localStorage.setItem(
    "TGN_USER_TXS",
    JSON.stringify(
      list.slice(0, 100)
    )
  );

}


/* =====================================
   ADDRESS
===================================== */

function shortAddress(address) {

  if (!address) {

    return "Unavailable";

  }

  if (address.length <= 18) {

    return address;

  }

  return (
    address.slice(0, 8) +
    "..." +
    address.slice(-7)
  );

}


/* =====================================
   NAVIGATION
===================================== */

function setActiveNav(tab) {

  document
    .querySelectorAll(
      ".bottom-nav-item"
    )
    .forEach(
      item =>
        item.classList.remove(
          "active"
        )
    );

  document
    .getElementById(
      "nav-" + tab
    )
    ?.classList.add(
      "active"
    );

}


function switchNav(tab) {

  activeTab = tab;

  setActiveNav(tab);

  if (tab === "home") {

    renderHome();

  }

  else if (tab === "activity") {

    renderActivity();

  }

  else if (tab === "wallet") {

    renderWallet();

  }

  else if (tab === "profile") {

    renderProfile();

  }

  else if (tab === "send") {

    renderWithdraw();

  }

  window.scrollTo(
    0,
    0
  );

}


/* =====================================
   WELCOME
===================================== */

function renderWelcome() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div
      class="card"
      style="
        padding:32px 20px;
        text-align:center;
        margin-top:10px;
      "
    >

      <div
        style="
          width:72px;
          height:72px;
          margin:auto auto 15px;
          border-radius:23px;
          display:grid;
          place-items:center;
          background:#168cff14;
          font-size:38px;
          box-shadow:0 0 25px #168cff20;
        "
      >
        💎
      </div>

      <h2
        style="
          margin:0;
          font-size:24px;
        "
      >
        TGN Wallet
      </h2>

      <p
        style="
          color:#8097b5;
          font-size:12px;
          line-height:1.7;
          margin:9px 0 22px;
        "
      >
        Secure TON wallet interface
        for Telegram Web3.
      </p>

      <button
        class="btn primary"
        onclick="createWallet()"
      >
        Create New Wallet
      </button>

      <button
        class="btn secondary"
        onclick="showImportWallet()"
      >
        Import Existing Wallet
      </button>

    </div>
  `;

}


/* =====================================
   CREATE WALLET
===================================== */

async function createWallet() {

  try {

    if (!window.TonWeb) {

      throw new Error(
        "TON library not loaded"
      );

    }

    const words = [

      "apple",
      "book",
      "camera",
      "cloud",
      "dance",
      "earth",
      "future",
      "garden",
      "happy",
      "island",
      "jungle",
      "kitten",
      "lemon",
      "magic",
      "night",
      "ocean",
      "planet",
      "river",
      "silver",
      "sunset",
      "tiger",
      "umbrella",
      "violet",
      "window"

    ];

    const random =
      new Uint8Array(24);

    crypto.getRandomValues(
      random
    );

    const mnemonic =
      Array.from(
        random,
        b => words[b % words.length]
      ).join(" ");

    const hash =
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          mnemonic
        )
      );

    const keyPair =
      TonWeb.utils.nacl.sign
        .keyPair.fromSeed(
          new Uint8Array(hash)
        );

    const WalletClass =
      TonWeb.wallet.all.v4R2;

    const wallet =
      new WalletClass(
        tonweb.provider,
        {
          publicKey:
            keyPair.publicKey
        }
      );

    const address =
      (
        await wallet.getAddress()
      ).toString(
        true,
        true,
        true
      );

    walletData = {

      mnemonic,

      publicKey:
        TonWeb.utils.bytesToHex(
          keyPair.publicKey
        ),

      secretKey:
        TonWeb.utils.bytesToHex(
          keyPair.secretKey
        ),

      address

    };

    localStorage.setItem(
      "TGN_TON_WALLET",
      JSON.stringify(
        walletData
      )
    );

    switchNav("home");

    refreshBalance();

  }

  catch (error) {

    console.error(
      error
    );

    showToast(
      "Wallet creation failed"
    );

  }

}


/* =====================================
   IMPORT
===================================== */

function showImportWallet() {

  openModal(
    "Import Wallet",
    `

      <p
        style="
          color:#8da4c3;
          font-size:12px;
          line-height:1.6;
        "
      >
        Enter your recovery phrase
        to restore your wallet.
      </p>

      <textarea
        id="importSeed"
        class="text-area"
        placeholder="Recovery phrase..."
      ></textarea>

      <button
        class="btn primary"
        onclick="importWallet()"
      >
        Import Wallet
      </button>

    `
  );

}


async function importWallet() {

  const input =
    document.getElementById(
      "importSeed"
    );

  const phrase =
    input?.value.trim();

  if (!phrase) {

    showToast(
      "Enter recovery phrase"
    );

    return;

  }

  try {

    const hash =
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          phrase
        )
      );

    const keyPair =
      TonWeb.utils.nacl.sign
        .keyPair.fromSeed(
          new Uint8Array(hash)
        );

    const WalletClass =
      TonWeb.wallet.all.v4R2;

    const wallet =
      new WalletClass(
        tonweb.provider,
        {
          publicKey:
            keyPair.publicKey
        }
      );

    const address =
      (
        await wallet.getAddress()
      ).toString(
        true,
        true,
        true
      );

    walletData = {

      mnemonic: phrase,

      publicKey:
        TonWeb.utils.bytesToHex(
          keyPair.publicKey
        ),

      secretKey:
        TonWeb.utils.bytesToHex(
          keyPair.secretKey
        ),

      address

    };

    localStorage.setItem(
      "TGN_TON_WALLET",
      JSON.stringify(
        walletData
      )
    );

    closeModal();

    switchNav("home");

    refreshBalance();

  }

  catch (error) {

    console.error(
      error
    );

    showToast(
      "Wallet import failed"
    );

  }

}


/* =====================================
   HOME
===================================== */

function renderHome() {

  if (!walletData) {

    renderWelcome();

    return;

  }

  const address =
    walletData.address || "";

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="hero-card">

      <div class="hero-header">
        My Wallet
      </div>

      <div
        class="hero-balance"
        id="balance"
      >
        0.00 TON
      </div>

      <div
        class="hero-subbalance"
        id="usdBalance"
      >
        $0.00 USD
      </div>

      <div class="hero-icon">
        💎
      </div>

      <div class="action-row">

        <button
          class="action-btn primary"
          onclick="renderReceive()"
        >
          Deposit
        </button>

        <button
          class="action-btn"
          onclick="renderWithdraw()"
        >
          Withdraw
        </button>

      </div>

    </div>


    <div class="card section-box">

      <div class="section-title">
        Wallet Address
      </div>

      <div class="address-row">

        <span class="address-text">
          ● ${escapeHtml(
            shortAddress(address)
          )}
        </span>

        <button
          class="copy-pill"
          onclick="copyAddress()"
        >
          Copy
        </button>

      </div>

    </div>


    <div class="card section-box">

      <div class="section-title">

        <span>
          Tokens
        </span>

        <button
          class="refresh"
          onclick="refreshBalance()"
        >
          Refresh ↻
        </button>

      </div>

      <div class="token-item">

        <div class="token-left">

          <div class="token-logo">
            💎
          </div>

          <div>

            <div class="token-name">
              TON
            </div>

            <div class="token-sub">
              Toncoin
            </div>

          </div>

        </div>

        <div class="token-amount">

          <div id="tokenBalance">
            0.00 TON
          </div>

          <div
            class="token-usd"
            id="tokenUsd"
          >
            $0.00
          </div>

        </div>

      </div>

    </div>

  `;

  refreshBalance();

}


/* =====================================
   PROFILE
===================================== */

function renderProfile() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-title">

      <h2>
        Profile
      </h2>

    </div>


    <section class="profile-hero">

      <div class="profile-main">

        <div class="profile-avatar-wrap">

          ${getAvatarHTML()}

          <span
            class="profile-online"
          ></span>

        </div>

        <div
          style="
            min-width:0;
          "
        >

          <div class="profile-name">
            ${escapeHtml(
              getFullName()
            )}
          </div>

          <div class="profile-username">
            ${escapeHtml(
              getUsername()
            )}
          </div>

          <div class="profile-id">
            Telegram ID:
            ${escapeHtml(
              getTelegramId()
            )}
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
            ${getPhotoUrl()
              ? "✓"
              : "—"}
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
        onclick="showPersonalInformation()"
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
        onclick="showHelp()"
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
        class="profile-menu-item"
        onclick="logoutWallet()"
      >

        <span class="profile-menu-left">

          <span
            class="profile-menu-icon"
            style="
              color:#ff6871;
              background:#ef444412;
            "
          >
            ↪
          </span>

          <span>

            <div
              class="profile-menu-title"
              style="
                color:#ff6871;
              "
            >
              Log Out
            </div>

            <div class="profile-menu-sub">
              Remove this wallet from device
            </div>

          </span>

        </span>

        <span class="profile-menu-arrow">
          ›
        </span>

      </button>

    </section>

  `;

}


/* =====================================
   PERSONAL INFORMATION
===================================== */

function showPersonalInformation() {

  openModal(
    "Personal Information",
    `

      <div
        style="
          text-align:center;
          margin-bottom:18px;
        "
      >

        <div
          style="
            display:inline-grid;
            padding:4px;
            border-radius:25px;
            background:#168cff12;
          "
        >
          ${getAvatarHTML()}
        </div>

        <div
          style="
            margin-top:9px;
            font-size:17px;
            font-weight:850;
          "
        >
          ${escapeHtml(
            getFullName()
          )}
        </div>

        <div
          style="
            margin-top:3px;
            color:#3ca8ff;
            font-size:12px;
          "
        >
          ${escapeHtml(
            getUsername()
          )}
        </div>

      </div>


      <div class="info-card">

        <div class="info-row">

          <span class="info-label">
            Telegram Name
          </span>

          <span class="info-value">
            ${escapeHtml(
              getFullName()
            )}
          </span>

        </div>


        <div class="info-row">

          <span class="info-label">
            Telegram ID
          </span>

          <span class="info-value">

            ${escapeHtml(
              getTelegramId()
            )}

            <button
              class="copy-id"
              onclick="copyTelegramId()"
            >
              Copy
            </button>

          </span>

        </div>


        <div class="info-row">

          <span class="info-label">
            Username
          </span>

          <span class="info-value">
            ${escapeHtml(
              getUsername()
            )}
          </span>

        </div>


        <div class="info-row">

          <span class="info-label">
            Account Year
          </span>

          <span
            class="info-value"
            style="color:#8298b5"
          >
            Not available
          </span>

        </div>

      </div>


      <p
        style="
          color:#687f9e;
          font-size:10px;
          line-height:1.6;
        "
      >
        Telegram Mini Apps do not provide
        the account creation date/year,
        so no fake year is shown.
      </p>

    `
  );

}


async function copyTelegramId() {

  const id =
    getTelegramId();

  if (
    id === "Unavailable"
  ) {

    showToast(
      "Telegram ID unavailable"
    );

    return;

  }

  try {

    await navigator
      .clipboard
      .writeText(id);

    showToast(
      "Telegram ID copied ✓"
    );

  }

  catch (error) {

    showToast(id);

  }

}


/* =====================================
   SECURITY
===================================== */

function openSecurity() {

  if (!walletData) {

    showToast(
      "Wallet not found"
    );

    return;

  }

  openModal(
    "Wallet Security",
    `

      <div class="security-warning">

        ⚠️ Never share your recovery
        phrase. Anyone who has it can
        control the wallet.

      </div>


      <button
        class="btn primary"
        onclick="showSeedPhrase()"
      >
        Show Recovery Phrase
      </button>


      <div
        id="seedBox"
        style="
          display:none;
          margin-top:12px;
          padding:14px;
          border-radius:14px;
          background:#050c18;
          border:1px solid #ef444426;
          color:#f5f9ff;
          font-size:11px;
          line-height:1.7;
          word-break:break-word;
        "
      ></div>

    `
  );

}


function showSeedPhrase() {

  const box =
    document.getElementById(
      "seedBox"
    );

  if (!box) return;

  box.style.display =
    "block";

  box.textContent =
    walletData?.mnemonic ||
    "Recovery phrase unavailable.";

}


/* =====================================
   HELP
===================================== */

function showHelp() {

  openModal(
    "Help & Support",
    `

      <div
        style="
          color:#d7e6f8;
          font-size:12px;
          line-height:1.8;
        "
      >

        <div
          class="card"
          style="
            padding:14px;
            margin-bottom:10px;
          "
        >
          💎 <b>TGN Wallet</b>
          <br>
          Secure TON wallet interface
          for Telegram Web3.
        </div>

        <div
          style="
            color:#8196b5;
          "
        >
          Home shows balance and address.
          Deposit shows your wallet address.
          Withdraw is used for TON transfers.
          Activity shows stored transaction records.
        </div>

      </div>

    `
  );

}


/* =====================================
   LOGOUT
===================================== */

function logoutWallet() {

  if (
    !confirm(
      "Log out from this wallet?"
    )
  ) {

    return;

  }

  localStorage.removeItem(
    "TGN_TON_WALLET"
  );

  walletData = null;

  closeModal();

  switchNav("home");

}


/* =====================================
   WALLET PAGE
===================================== */

function renderWallet() {

  if (!walletData) {

    renderWelcome();

    return;

  }

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-title">

      <h2>
        Wallet
      </h2>

    </div>


    <div class="card section-box">

      <div class="section-title">
        TON Wallet Address
      </div>

      <div
        style="
          color:#eaf3ff;
          font-size:12px;
          font-weight:750;
          word-break:break-all;
        "
      >
        ${escapeHtml(
          walletData.address
        )}
      </div>

      <button
        class="btn primary"
        onclick="copyAddress()"
      >
        Copy Address
      </button>

    </div>


    <div class="card section-box">

      <div class="section-title">
        Current Balance
      </div>

      <div
        id="walletPageBalance"
        style="
          font-size:30px;
          font-weight:900;
        "
      >
        0.00 TON
      </div>

      <div
        style="
          color:#7187a5;
          font-size:10px;
          margin-top:4px;
        "
      >
        TON Mainnet
      </div>

    </div>

  `;

  refreshBalance();

}


/* =====================================
   WITHDRAW PAGE
===================================== */

function renderWithdraw() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-title">

      <button
        class="btn secondary back"
        onclick="switchNav('home')"
      >
        ← Back
      </button>

      <h2>
        Withdraw
      </h2>

      <span
        style="
          width:82px;
        "
      ></span>

    </div>


    <div class="card section-box">

      <div
        style="
          font-size:18px;
          font-weight:850;
          margin-bottom:17px;
        "
      >
        Send TON
      </div>


      <label class="input-label">
        Recipient Address
      </label>

      <input
        id="sendTo"
        class="text-input"
        type="text"
        placeholder="UQ... / EQ..."
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
        step="any"
        inputmode="decimal"
        placeholder="0.00 TON"
      >


      <button
        class="btn primary"
        onclick="doSend()"
      >
        Confirm Withdrawal
      </button>

    </div>

  `;

}


/* =====================================
   RECEIVE
===================================== */

function renderReceive() {

  if (!walletData) {

    renderWelcome();

    return;

  }

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-title">

      <button
        class="btn secondary back"
        onclick="switchNav('home')"
      >
        ← Back
      </button>

      <h2>
        Deposit
      </h2>

      <span
        style="
          width:82px;
        "
      ></span>

    </div>


    <div
      class="card section-box"
      style="
        text-align:center;
      "
    >

      <div
        style="
          font-size:38px;
          margin-bottom:8px;
        "
      >
        ↓
      </div>

      <div
        style="
          font-size:19px;
          font-weight:850;
        "
      >
        Receive TON
      </div>

      <p
        style="
          color:#8096b4;
          font-size:11px;
          line-height:1.6;
        "
      >
        Send TON to this wallet address.
      </p>


      <div
        style="
          text-align:left;
          padding:14px;
          border-radius:14px;
          background:#050c18;
          border:1px solid #649bdc1a;
          color:#dbe9f8;
          font-size:11px;
          line-height:1.6;
          word-break:break-all;
        "
      >
        ${escapeHtml(
          walletData.address
        )}
      </div>


      <button
        class="btn primary"
        onclick="copyAddress()"
      >
        Copy Address
      </button>

    </div>

  `;

}


/* =====================================
   BALANCE
===================================== */

async function refreshBalance() {

  if (
    !walletData ||
    !tonweb
  ) {

    return;

  }

  function setBalance(
    ton,
    usd
  ) {

    [
      "balance",
      "tokenBalance",
      "walletPageBalance"
    ]
      .forEach(
        id => {

          const element =
            document.getElementById(id);

          if (element) {

            element.textContent =
              ton + " TON";

          }

        }
      );


    [
      "usdBalance",
      "tokenUsd"
    ]
      .forEach(
        id => {

          const element =
            document.getElementById(id);

          if (element) {

            element.textContent =
              "$" + usd;

          }

        }
      );

  }


  try {

    const raw =
      await tonweb.getBalance(
        walletData.address
      );

    const nano =
      Number(raw);

    const ton =
      Number.isFinite(nano) &&
      nano >= 0
        ? nano / 1e9
        : 0;

    setBalance(
      ton.toFixed(2),
      "0.00"
    );

  }

  catch (error) {

    console.error(
      "Balance error:",
      error
    );

    setBalance(
      "0.00",
      "0.00"
    );

  }

}


/* =====================================
   COPY ADDRESS
===================================== */

async function copyAddress() {

  if (
    !walletData?.address
  ) {

    showToast(
      "Wallet address unavailable"
    );

    return;

  }

  try {

    await navigator
      .clipboard
      .writeText(
        walletData.address
      );

    showToast(
      "Wallet address copied ✓"
    );

  }

  catch (error) {

    showToast(
      "Copy failed"
    );

  }

}


/* =====================================
   ACTIVITY
===================================== */

function renderActivity(
  filter = "all"
) {

  const transactions =
    getTransactions();

  const filters = [
    "all",
    "received",
    "sent",
    "deposit",
    "withdraw"
  ];

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter(
          tx =>
            tx.type === filter
        );


  let body = "";


  if (
    transactions.length === 0
  ) {

    body = `

      <div class="card empty">

        <div class="empty-icon">
          ◷
        </div>

        <div class="empty-title">
          No Transactions Yet
        </div>

        <div class="empty-text">
          Your real wallet activity
          will appear here after a
          transaction.
        </div>

      </div>

    `;

  }

  else if (
    filtered.length === 0
  ) {

    body = `

      <div class="card empty">

        <div class="empty-icon">
          ◷
        </div>

        <div class="empty-title">
          No Activity
        </div>

      </div>

    `;

  }

  else {

    body =
      filtered
        .map(
          tx => {

            const positive =
              String(
                tx.amount || ""
              ).startsWith("+");

            return `

              <div class="card tx">

                <div
                  class="tx-icon"
                  style="
                    background:
                      ${positive
                        ? "#22d89412"
                        : "#ef444412"};

                    color:
                      ${positive
                        ? "#22d894"
                        : "#ff6871"};
                  "
                >
                  ${positive
                    ? "↓"
                    : "↑"}
                </div>


                <div class="tx-main">

                  <div class="tx-title">
                    ${escapeHtml(
                      tx.title ||
                      "Transaction"
                    )}
                  </div>

                  <div class="tx-sub">
                    ${escapeHtml(
                      tx.subtitle ||
                      ""
                    )}
                  </div>

                </div>


                <div class="tx-right">

                  <div
                    class="tx-amount"
                    style="
                      color:
                        ${positive
                          ? "#22d894"
                          : "#ff6871"};
                    "
                  >
                    ${escapeHtml(
                      tx.amount ||
                      ""
                    )}
                  </div>

                  <div class="tx-date">
                    ${escapeHtml(
                      tx.date ||
                      ""
                    )}
                  </div>

                </div>

              </div>

            `;

          }
        )
        .join("");

  }


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-title">

      <h2>
        Activity
      </h2>

      <button
        class="refresh"
        onclick="
          renderActivity('${filter}')
        "
      >
        Refresh ↻
      </button>

    </div>


    <div class="filter-row">

      ${filters
        .map(
          f => `

            <button
              class="
                filter
                ${filter === f
                  ? "active"
                  : ""}
              "
              onclick="
                renderActivity('${f}')
              "
            >
              ${
                f.charAt(0)
                  .toUpperCase() +
                f.slice(1)
              }
            </button>

          `
        )
        .join("")}

    </div>


    ${body}

  `;

}


/* =====================================
   SEND
===================================== */

async function doSend() {

  if (!walletData) {

    showToast(
      "Wallet not found"
    );

    return;

  }


  const to =
    document
      .getElementById("sendTo")
      ?.value
      .trim();


  const amount =
    document
      .getElementById("sendAmount")
      ?.value
      .trim();


  if (
    !to ||
    !amount ||
    !Number.isFinite(
      Number(amount)
    ) ||
    Number(amount) <= 0
  ) {

    showToast(
      "Enter a valid address and amount"
    );

    return;

  }


  if (!tonweb) {

    showToast(
      "TON provider is not ready"
    );

    return;

  }


  try {

    const keyPair = {

      publicKey:
        TonWeb.utils.hexToBytes(
          walletData.publicKey
        ),

      secretKey:
        TonWeb.utils.hexToBytes(
          walletData.secretKey
        )

    };


    const wallet =
      new tonweb.wallet.all.v4R2(
        tonweb.provider,
        {
          publicKey:
            keyPair.publicKey
        }
      );


    const seqno =
      await wallet.methods
        .seqno()
        .call() || 0;


    await wallet.methods
      .transfer({

        secretKey:
          keyPair.secretKey,

        toAddress:
          to,

        amount:
          TonWeb.utils.toNano(
            amount
          ),

        seqno,

        payload:
          "TGN Wallet Withdrawal",

        sendMode:
          3

      })
      .send();


    saveTransaction({

      id: Date.now(),

      type: "withdraw",

      title:
        "Withdraw",

      subtitle:
        "To: " +
        to.slice(0, 8) +
        "...",

      amount:
        "-" +
        amount +
        " TON",

      date:
        new Date()
          .toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric"
            }
          )

    });


    showToast(
      "Withdrawal successful ✓"
    );

    switchNav(
      "activity"
    );

  }

  catch (error) {

    console.error(
      error
    );

    showToast(
      "Withdrawal failed"
    );

  }

}


/* =====================================
   START APP
===================================== */

window.addEventListener(
  "load",
  function () {

    try {

      const provider =
        new TonWeb.HttpProvider(
          "https://toncenter.com/api/v2/jsonRPC",
          API_KEY
            ? {
                apiKey: API_KEY
              }
            : {}
        );

      tonweb =
        new TonWeb(
          provider
        );

    }

    catch (error) {

      console.error(
        "TON provider error:",
        error
      );

    }


    if (walletData) {

      switchNav(
        "home"
      );

    }

    else {

      renderWelcome();

    }

  }
);
