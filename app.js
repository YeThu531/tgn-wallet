/* =========================================================
   TGN TON WALLET
   Clean / Professional App Logic

   - No fake transaction history
   - No demo transactions
   - Clean Activity page
   - 5-tab navigation
   - Send / Wallet / Profile pages
   - Responsive UI
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const API_KEY = "YOUR_TONCENTER_API_KEY";

let tonweb = null;
let walletData = JSON.parse(
  localStorage.getItem("TGN_TON_WALLET")
);

let activeTab = "home";


/* =========================================================
   UI STYLE
   ========================================================= */

(function injectStyles() {

  if (document.getElementById("tgn-app-style")) return;

  const style = document.createElement("style");

  style.id = "tgn-app-style";

  style.textContent = `

    /* ================================
       GENERAL
       ================================ */

    #content {
      width:100%;
      max-width:720px;
      margin:0 auto;
      padding:10px 0 120px;
    }

    button,
    input,
    textarea {
      font-family:inherit;
    }


    /* ================================
       PAGE HEADER
       ================================ */

    .tgn-page-title {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin:5px 3px 15px;
    }

    .tgn-page-title h2 {
      margin:0;
      color:#f5f9ff;
      font-size:23px;
      font-weight:800;
      letter-spacing:-.4px;
    }

    .tgn-refresh {
      border:0;
      background:transparent;
      color:#39a7ff;
      font-size:14px;
      font-weight:700;
      padding:8px;
      cursor:pointer;
    }


    /* ================================
       CARD
       ================================ */

    .tgn-card {
      background:
        linear-gradient(
          145deg,
          rgba(19,34,58,.97),
          rgba(8,18,35,.97)
        );

      border:
        1px solid rgba(110,160,220,.13);

      border-radius:20px;

      box-shadow:
        0 12px 35px rgba(0,0,0,.18);
    }


    /* ================================
       ACTIVITY EMPTY
       ================================ */

    .tgn-empty {
      padding:48px 22px;
      text-align:center;

      background:
        linear-gradient(
          145deg,
          rgba(18,33,56,.88),
          rgba(8,18,34,.96)
        );

      border:
        1px solid rgba(110,160,220,.12);

      border-radius:20px;
    }

    .tgn-empty-icon {
      width:68px;
      height:68px;

      margin:0 auto 17px;

      display:flex;
      align-items:center;
      justify-content:center;

      border-radius:20px;

      background:
        rgba(38,147,255,.09);

      border:
        1px solid rgba(58,167,255,.15);

      color:#39a7ff;

      font-size:31px;
    }

    .tgn-empty h3 {
      margin:0 0 8px;

      color:#f1f7ff;

      font-size:19px;
      font-weight:800;
    }

    .tgn-empty p {
      margin:0 auto;

      max-width:300px;

      color:#8196b5;

      font-size:13px;

      line-height:1.65;
    }


    /* ================================
       FILTER
       ================================ */

    .tgn-filter-row {
      display:flex;
      gap:8px;

      overflow-x:auto;

      padding:2px 1px 11px;

      scrollbar-width:none;
    }

    .tgn-filter-row::-webkit-scrollbar {
      display:none;
    }

    .tgn-filter {
      border:
        1px solid rgba(130,160,200,.15);

      background:
        rgba(255,255,255,.035);

      color:#91a7c4;

      padding:9px 14px;

      border-radius:12px;

      white-space:nowrap;

      font-size:12px;
      font-weight:700;

      cursor:pointer;
    }

    .tgn-filter.active {
      color:#39a7ff;

      background:
        rgba(38,147,255,.14);

      border-color:
        rgba(38,147,255,.35);
    }


    /* ================================
       TRANSACTION
       ================================ */

    .tgn-tx {
      display:flex;
      align-items:center;

      gap:12px;

      padding:14px;

      margin-bottom:9px;

      border-radius:17px;

      background:
        rgba(17,31,52,.75);

      border:
        1px solid rgba(110,160,220,.09);
    }

    .tgn-tx-icon {
      width:43px;
      height:43px;

      flex:0 0 auto;

      display:flex;
      align-items:center;
      justify-content:center;

      border-radius:14px;

      font-size:20px;
      font-weight:800;
    }

    .tgn-tx-icon.receive {
      color:#22c58b;
      background:rgba(16,185,129,.12);
    }

    .tgn-tx-icon.deposit {
      color:#39a7ff;
      background:rgba(38,147,255,.12);
    }

    .tgn-tx-icon.send,
    .tgn-tx-icon.withdraw {
      color:#ff6570;
      background:rgba(239,68,68,.11);
    }

    .tgn-tx-main {
      min-width:0;
      flex:1;
    }

    .tgn-tx-title {
      color:#f5f9ff;
      font-size:14px;
      font-weight:800;
    }

    .tgn-tx-sub {
      margin-top:4px;

      color:#8196b5;

      font-size:11px;

      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }

    .tgn-tx-right {
      text-align:right;
      flex:0 0 auto;
    }

    .tgn-tx-amount {
      font-size:14px;
      font-weight:800;
    }

    .tgn-tx-date {
      margin-top:4px;

      color:#7187a5;

      font-size:10px;
    }


    /* ================================
       PROFILE
       ================================ */

    .tgn-profile-head {
      padding:18px;

      display:flex;
      align-items:center;

      gap:14px;

      margin-bottom:12px;
    }

    .tgn-avatar {
      width:58px;
      height:58px;

      flex:0 0 auto;

      display:flex;
      align-items:center;
      justify-content:center;

      border-radius:18px;

      background:
        linear-gradient(
          145deg,
          #2497ff,
          #155fe0
        );

      color:#fff;

      font-size:22px;
      font-weight:800;

      box-shadow:
        0 8px 22px
        rgba(36,151,255,.22);
    }

    .tgn-name {
      color:#f5f9ff;

      font-size:17px;
      font-weight:800;
    }

    .tgn-handle {
      margin-top:4px;

      color:#39a7ff;

      font-size:12px;
    }


    /* ================================
       MENU
       ================================ */

    .tgn-menu {
      overflow:hidden;
    }

    .tgn-menu-item {
      width:100%;

      display:flex;
      align-items:center;
      justify-content:space-between;

      padding:15px 17px;

      border:0;
      border-bottom:
        1px solid rgba(110,160,220,.08);

      background:transparent;

      color:#edf5ff;

      text-align:left;

      cursor:pointer;
    }

    .tgn-menu-item:last-child {
      border-bottom:0;
    }

    .tgn-menu-left {
      display:flex;
      align-items:center;

      gap:12px;

      font-size:13px;
      font-weight:700;
    }

    .tgn-menu-icon {
      width:36px;
      height:36px;

      display:flex;
      align-items:center;
      justify-content:center;

      border-radius:11px;

      background:
        rgba(38,147,255,.10);

      color:#39a7ff;
    }

    .tgn-menu-arrow {
      color:#617894;
      font-size:20px;
    }


    /* ================================
       FORMS
       ================================ */

    .tgn-form-card {
      padding:18px;
    }

    .tgn-form-title {
      margin-bottom:17px;

      color:#f5f9ff;

      font-size:18px;
      font-weight:800;
    }

    .tgn-label {
      display:block;

      margin-bottom:7px;

      color:#8fa5c1;

      font-size:12px;
      font-weight:700;
    }

    .tgn-input {
      width:100%;

      padding:13px 14px;

      margin-bottom:13px;

      border:
        1px solid rgba(110,160,220,.14);

      border-radius:14px;

      background:#091326;

      color:#f5f9ff;

      outline:none;

      font-size:13px;
    }

    .tgn-input:focus {
      border-color:
        rgba(58,167,255,.5);

      box-shadow:
        0 0 0 3px
        rgba(58,167,255,.08);
    }


    /* ================================
       BUTTONS
       ================================ */

    .tgn-primary {
      width:100%;

      border:0;

      border-radius:14px;

      padding:13px;

      background:
        linear-gradient(
          135deg,
          #299cff,
          #176de7
        );

      color:#fff;

      font-size:14px;
      font-weight:800;

      cursor:pointer;

      box-shadow:
        0 8px 20px
        rgba(23,109,231,.20);
    }

    .tgn-secondary {
      width:100%;

      margin-top:9px;

      padding:12px;

      border:
        1px solid rgba(110,160,220,.14);

      border-radius:14px;

      background:
        rgba(255,255,255,.035);

      color:#b9c9de;

      font-size:13px;
      font-weight:700;

      cursor:pointer;
    }

    .tgn-back {
      border:0;
      background:transparent;

      color:#39a7ff;

      font-weight:700;

      padding:5px 0;

      cursor:pointer;
    }


    /* ================================
       MODAL
       ================================ */

    .tgn-modal-note {
      margin-bottom:13px;

      color:#879bb7;

      font-size:12px;

      line-height:1.6;
    }

    .tgn-secret {
      margin-top:10px;

      padding:12px;

      border:
        1px solid rgba(110,160,220,.10);

      border-radius:12px;

      background:#071021;

      color:#39a7ff;

      font-size:11px;

      line-height:1.55;

      word-break:break-word;

      max-height:120px;

      overflow:auto;
    }


    /* ================================
       MOBILE
       ================================ */

    @media(max-width:420px) {

      #content {
        padding-top:5px;
      }

      .tgn-page-title h2 {
        font-size:20px;
      }

      .tgn-card {
        border-radius:18px;
      }

      .tgn-empty {
        padding:42px 18px;
      }

    }

  `;

  document.head.appendChild(style);

})();


/* =========================================================
   HELPERS
   ========================================================= */

const WORDLIST = [
  "abandon","ability","able","about","above","absent",
  "absorb","abstract","absurd","abuse","access","accident",
  "account","accuse","achieve","acid","acoustic","acquire",
  "across","act","action","actor","actual","adapt",
  "addict","address","adjust","admit","adult","advance",
  "advice","aerobic","affair","afford","afraid","again",
  "age","agent","agree","ahead","aim","air","airport",
  "aisle","alarm","album","alert","alien","all","alley",
  "allow","almost","alone","alpha","already","also",
  "alter","always","amazing","among","amount","amused",
  "analyst","anchor","ancient","anger","angle","angry",
  "animal","ankle","announce","annual","answer","antenna",
  "antique","anxiety","apart","apology","appear","apple",
  "approve","april","arch","arctic","area","arena",
  "argue","arm","army","around","arrange","arrive",
  "arrow","art","artist","artwork","ask","aspect",
  "asset","assist","assume","athlete","atom","attack",
  "attend","attitude","attract","auction","audit",
  "august","author","auto","autumn","average","avocado",
  "avoid","awake","aware","away","awesome","awful","axis"
];


function generateNativeMnemonic() {

  const words = [];

  const randomValues =
    new Uint8Array(24);

  window.crypto.getRandomValues(
    randomValues
  );

  for (let i = 0; i < 24; i++) {
    words.push(
      WORDLIST[
        randomValues[i] %
        WORDLIST.length
      ]
    );
  }

  return words;
}


function showToast(message) {

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(
      message
    );
  } else {
    alert(message);
  }

}


function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /[&<>'"]/g,
      char => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        "'":"&#39;",
        '"':"&quot;"
      }[char])
    );

}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

/*
   IMPORTANT:
   No default/fake transaction.
*/

function getUserTransactions() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          "TGN_USER_TXS"
        )
      );

    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {

    return [];

  }

}


function saveUserTransaction(tx) {

  const transactions =
    getUserTransactions();

  transactions.unshift(tx);

  localStorage.setItem(
    "TGN_USER_TXS",
    JSON.stringify(transactions)
  );

}


/*
   Remove old Gemini demo transactions
*/

(function cleanOldDemoData() {

  const transactions =
    getUserTransactions();

  const cleaned =
    transactions.filter(tx => {

      if (!tx) return false;

      const text =
        JSON.stringify(tx)
          .toLowerCase();

      /*
        Remove known demo/test records.
      */

      if (
        text.includes("2.50 gram") ||
        text.includes("1.20 gram") ||
        text.includes("may 10, 2025") ||
        text.includes("simulate test") ||
        text.includes("eqd5") ||
        text.includes("eqc8")
      ) {
        return false;
      }

      return true;

    });

  if (
    cleaned.length !==
    transactions.length
  ) {

    localStorage.setItem(
      "TGN_USER_TXS",
      JSON.stringify(cleaned)
    );

  }

})();


/* =========================================================
   NAVIGATION
   ========================================================= */

function switchNav(tab) {

  activeTab = tab;

  document
    .querySelectorAll(
      ".bottom-nav-item"
    )
    .forEach(button => {

      button.classList.remove(
        "active"
      );

    });


  const nav =
    document.getElementById(
      "nav-" + tab
    );

  if (nav) {
    nav.classList.add("active");
  }


  const content =
    document.getElementById(
      "content"
    );

  if (!content) return;

  content.innerHTML = "";


  if (tab === "home") {
    renderMain();
  }

  else if (tab === "activity") {
    renderActivityPage();
  }

  else if (tab === "send") {
    renderSendPage();
  }

  else if (tab === "wallet") {
    renderWalletPage();
  }

  else if (tab === "profile") {
    renderProfilePage();
  }

}


/* =========================================================
   WELCOME
   ========================================================= */

function renderWelcome() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div
      class="tgn-card"
      style="
        padding:30px 20px;
        text-align:center;
        margin-top:10px;
      "
    >

      <div
        style="
          font-size:48px;
          margin-bottom:10px;
        "
      >
        💎
      </div>

      <h2
        style="
          margin:0;
          color:#fff;
          font-size:23px;
        "
      >
        TGN Wallet
      </h2>

      <p
        style="
          color:#8fa5c1;
          font-size:13px;
          line-height:1.6;
          margin:9px 0 22px;
        "
      >
        Your TON wallet for simple
        and secure Web3 transfers.
      </p>

      <button
        class="tgn-primary"
        onclick="createWallet()"
      >
        Create New Wallet
      </button>

      <button
        class="tgn-secondary"
        onclick="showImport()"
      >
        Import Existing Wallet
      </button>

    </div>

  `;

}


/* =========================================================
   CREATE WALLET
   ========================================================= */

async function createWallet() {

  try {

    const seed =
      generateNativeMnemonic();

    const seedBytes =
      new TextEncoder()
        .encode(
          seed.join(" ")
        );

    const hash =
      await crypto.subtle.digest(
        "SHA-256",
        seedBytes
      );

    const secretKey =
      new Uint8Array(hash);

    const keyPair =
      TonWeb.utils.nacl.sign
        .keyPair.fromSeed(
          secretKey
        );

    const WalletClass =
      tonweb.wallet.all.v4R2;

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

      mnemonic:
        seed.join(" "),

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

    alert(
      "Wallet creation failed: " +
      error.message
    );

  }

}


/* =========================================================
   IMPORT WALLET
   ========================================================= */

function showImport() {

  document.getElementById(
    "mTitle"
  ).innerText =
    "Import Wallet";


  document.getElementById(
    "mBody"
  ).innerHTML = `

    <p class="tgn-modal-note">
      Enter your recovery phrase
      to restore your wallet.
    </p>

    <textarea
      id="importSeed"
      class="tgn-input"
      rows="4"
      placeholder="Enter your recovery phrase..."
    ></textarea>

    <button
      class="tgn-primary"
      onclick="importWallet()"
    >
      Import Wallet
    </button>

  `;


  document.getElementById(
    "modal"
  ).style.display =
    "flex";

}


async function importWallet() {

  const input =
    document.getElementById(
      "importSeed"
    );

  const text =
    input?.value.trim();


  if (!text) {

    alert(
      "Please enter your recovery phrase."
    );

    return;

  }


  try {

    const seedBytes =
      new TextEncoder()
        .encode(text);

    const hash =
      await crypto.subtle.digest(
        "SHA-256",
        seedBytes
      );

    const secretKey =
      new Uint8Array(hash);

    const keyPair =
      TonWeb.utils.nacl.sign
        .keyPair.fromSeed(
          secretKey
        );

    const WalletClass =
      tonweb.wallet.all.v4R2;

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

      mnemonic:text,

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

    alert(
      "Invalid recovery phrase."
    );

  }

}


/* =========================================================
   HOME
   ========================================================= */

function renderMain() {

  if (!walletData) {

    renderWelcome();

    return;

  }


  const address =
    walletData.address || "";

  const shortAddr =
    address.length > 12
      ? address.slice(0,6) +
        "..." +
        address.slice(-4)
      : address;


  document.getElementById(
    "content"
  ).innerHTML = `

    <!-- WALLET HERO -->

    <div
      class="hero-card"
      style="margin-top:0"
    >

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
          onclick="renderReceivePage()"
        >
          Deposit
        </button>

        <button
          class="action-btn"
          onclick="renderSendPage()"
        >
          Withdraw
        </button>

      </div>

    </div>


    <!-- ADDRESS -->

    <div class="section-box">

      <div class="section-title">
        Wallet Address
      </div>

      <div class="address-row">

        <span
          style="
            color:#38bdf8;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
          "
        >
          ● ${escapeHtml(shortAddr)}
        </span>

        <button
          class="copy-pill"
          onclick="copyAddress()"
        >
          Copy
        </button>

      </div>

    </div>


    <!-- QUICK ACTION -->

    <div
      style="
        display:grid;
        grid-template-columns:
          repeat(2,1fr);
        gap:10px;
        margin-bottom:14px;
      "
    >

      <button
        class="grid-btn"
        onclick="renderSendPage()"
        style="
          padding:14px;
          background:rgba(255,255,255,.035);
          border:1px solid
            rgba(110,160,220,.10);
          border-radius:14px;
          color:#fff;
          font-weight:700;
          cursor:pointer;
        "
      >
        📤 Send
      </button>

      <button
        class="grid-btn"
        onclick="renderReceivePage()"
        style="
          padding:14px;
          background:rgba(255,255,255,.035);
          border:1px solid
            rgba(110,160,220,.10);
          border-radius:14px;
          color:#fff;
          font-weight:700;
          cursor:pointer;
        "
      >
        📥 Receive
      </button>

    </div>


    <!-- TOKEN -->

    <div class="section-box">

      <div class="section-title">

        <span>
          Tokens
        </span>

        <span
          style="
            color:#38bdf8;
            cursor:pointer;
          "
          onclick="refreshBalance()"
        >
          Refresh ↻
        </span>

      </div>


      <div class="token-item">

        <div class="token-left">

          <div class="token-logo">
            💎
          </div>

          <div>

            <div
              style="
                font-weight:700;
                font-size:14px;
              "
            >
              TON
            </div>

            <div
              style="
                font-size:11px;
                color:var(--text-muted);
              "
            >
              Toncoin
            </div>

          </div>

        </div>


        <div style="text-align:right">

          <div
            id="tokenBalance"
            style="
              font-weight:700;
              font-size:14px;
            "
          >
            0.00 TON
          </div>

          <div
            id="tokenUsd"
            style="
              font-size:11px;
              color:var(--text-muted);
            "
          >
            $0.00
          </div>

        </div>

      </div>

    </div>

  `;


  refreshBalance();

}


/* =========================================================
   ACTIVITY
   ========================================================= */

function renderActivityPage(
  filter = "all"
) {

  const transactions =
    getUserTransactions();


  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter(
          tx => tx.type === filter
        );


  let content = "";


  /*
     EMPTY STATE

     No fake transactions.
  */

  if (!transactions.length) {

    content = `

      <div class="tgn-empty">

        <div class="tgn-empty-icon">
          ◷
        </div>

        <h3>
          No Transactions Yet
        </h3>

        <p>
          Your wallet activity will
          appear here after your
          first transaction.
        </p>

      </div>

    `;

  }

  else {

    content = `

      <div class="tgn-filter-row">

        ${[
          "all",
          "received",
          "sent",
          "deposit",
          "withdraw"
        ].map(type => `

          <button
            class="tgn-filter ${
              filter === type
                ? "active"
                : ""
            }"
            onclick="
              renderActivityPage('${type}')
            "
          >
            ${
              type.charAt(0)
                .toUpperCase() +
              type.slice(1)
            }
          </button>

        `).join("")}

      </div>


      ${
        filtered.length

        ? filtered.map(tx => `

          <div class="tgn-tx">

            <div
              class="
                tgn-tx-icon
                ${escapeHtml(tx.type)}
              "
            >
              ${
                tx.type === "received" ||
                tx.type === "deposit"
                  ? "↓"
                  : "↑"
              }
            </div>


            <div class="tgn-tx-main">

              <div class="tgn-tx-title">
                ${escapeHtml(tx.title)}
              </div>

              <div class="tgn-tx-sub">
                ${escapeHtml(tx.subtitle)}
              </div>

            </div>


            <div class="tgn-tx-right">

              <div
                class="tgn-tx-amount"
                style="
                  color:
                    ${
                      String(tx.amount)
                        .startsWith("+")
                        ? "#22c58b"
                        : "#ff6570"
                    };
                "
              >
                ${escapeHtml(tx.amount)}
              </div>

              <div class="tgn-tx-date">
                ${escapeHtml(tx.date || "")}
              </div>

            </div>

          </div>

        `).join("")

        : `

          <div class="tgn-empty">

            <div class="tgn-empty-icon">
              ◷
            </div>

            <h3>
              No Activity
            </h3>

            <p>
              No transactions found
              in this category.
            </p>

          </div>

        `
      }

    `;

  }


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <h2>
        Activity
      </h2>

      <button
        class="tgn-refresh"
        onclick="refreshActivity()"
      >
        Refresh ↻
      </button>

    </div>

    ${content}

  `;

}


function refreshActivity() {

  renderActivityPage(
    "all"
  );

}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfilePage() {

  const tgUser =
    window.Telegram
      ?.WebApp
      ?.initDataUnsafe
      ?.user;


  const userName =
    tgUser
      ? [
          tgUser.first_name,
          tgUser.last_name
        ]
        .filter(Boolean)
        .join(" ")
      : "Telegram User";


  const username =
    tgUser?.username
      ? "@" + tgUser.username
      : "Telegram account";


  const initial =
    (
      userName.trim()[0] ||
      "T"
    ).toUpperCase();


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <h2>
        Profile
      </h2>

    </div>


    <div
      class="
        tgn-card
        tgn-profile-head
      "
    >

      <div class="tgn-avatar">
        ${escapeHtml(initial)}
      </div>

      <div
        style="
          min-width:0;
        "
      >

        <div class="tgn-name">
          ${escapeHtml(userName)}
        </div>

        <div class="tgn-handle">
          ${escapeHtml(username)}
        </div>

      </div>

    </div>


    <div
      class="
        tgn-card
        tgn-menu
      "
    >

      <button
        class="tgn-menu-item"
        onclick="
          profileAction('Personal Information')
        "
      >

        <span class="tgn-menu-left">

          <span class="tgn-menu-icon">
            ♙
          </span>

          Personal Information

        </span>

        <span class="tgn-menu-arrow">
          ›
        </span>

      </button>


      <button
        class="tgn-menu-item"
        onclick="
          profileAction('Security')
        "
      >

        <span class="tgn-menu-left">

          <span class="tgn-menu-icon">
            ⌾
          </span>

          Security & Seed Phrase

        </span>

        <span class="tgn-menu-arrow">
          ›
        </span>

      </button>


      <button
        class="tgn-menu-item"
        onclick="
          profileAction('Help & Support')
        "
      >

        <span class="tgn-menu-left">

          <span class="tgn-menu-icon">
            ?
          </span>

          Help & Support

        </span>

        <span class="tgn-menu-arrow">
          ›
        </span>

      </button>


      <button
        class="tgn-menu-item"
        onclick="confirmLogout()"
      >

        <span
          class="tgn-menu-left"
          style="color:#ff6570"
        >

          <span
            class="tgn-menu-icon"
            style="
              color:#ff6570;
              background:
                rgba(239,68,68,.10);
            "
          >
            ↪
          </span>

          Log Out

        </span>

        <span class="tgn-menu-arrow">
          ›
        </span>

      </button>

    </div>

  `;

}


/* =========================================================
   PROFILE ACTION
   ========================================================= */

function profileAction(title) {

  const tgUser =
    window.Telegram
      ?.WebApp
      ?.initDataUnsafe
      ?.user;


  const userName =
    tgUser
      ? [
          tgUser.first_name,
          tgUser.last_name
        ]
        .filter(Boolean)
        .join(" ")
      : "Telegram User";


  const username =
    tgUser?.username
      ? "@" + tgUser.username
      : "Telegram account";


  if (title === "Security") {

    openSettings();

    return;

  }


  if (
    title ===
    "Personal Information"
  ) {

    document.getElementById(
      "mTitle"
    ).innerText =
      "Personal Information";


    document.getElementById(
      "mBody"
    ).innerHTML = `

      <div
        style="
          font-size:12px;
          line-height:2;
          color:#b8c8dd;
          background:
            rgba(255,255,255,.035);
          padding:13px;
          border-radius:12px;
        "
      >

        <div>
          <strong>Name:</strong>
          ${escapeHtml(userName)}
        </div>

        <div>
          <strong>Username:</strong>
          ${escapeHtml(username)}
        </div>

      </div>

    `;


    document.getElementById(
      "modal"
    ).style.display =
      "flex";

    return;

  }


  document.getElementById(
    "mTitle"
  ).innerText =
    title;


  document.getElementById(
    "mBody"
  ).innerHTML = `

    <p class="tgn-modal-note">
      For help, please contact
      the wallet administrator
      through Telegram.
    </p>

  `;


  document.getElementById(
    "modal"
  ).style.display =
    "flex";

}


/* =========================================================
   LOGOUT
   ========================================================= */

function confirmLogout() {

  if (
    !confirm(
      "Are you sure you want to log out?"
    )
  ) return;


  localStorage.removeItem(
    "TGN_TON_WALLET"
  );

  localStorage.removeItem(
    "TGN_USER_TXS"
  );

  location.reload();

}


/* =========================================================
   WALLET PAGE
   ========================================================= */

function renderWalletPage() {

  if (!walletData) {

    renderWelcome();

    return;

  }


  const address =
    walletData.address || "";


  const shortAddr =
    address.length > 14
      ? address.slice(0,8) +
        "..." +
        address.slice(-6)
      : address;


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <h2>
        Wallet
      </h2>

    </div>


    <div
      class="tgn-card"
      style="
        padding:18px;
        margin-bottom:12px;
      "
    >

      <div
        style="
          color:#8196b5;
          font-size:12px;
          margin-bottom:8px;
        "
      >
        TON Wallet Address
      </div>


      <div
        style="
          color:#eaf3ff;
          font-size:14px;
          font-weight:700;
          word-break:break-all;
        "
      >
        ${escapeHtml(shortAddr)}
      </div>


      <button
        class="tgn-primary"
        style="margin-top:14px"
        onclick="copyAddress()"
      >
        Copy Address
      </button>

    </div>


    <div
      class="tgn-card"
      style="padding:18px"
    >

      <div
        style="
          color:#8196b5;
          font-size:12px;
        "
      >
        Current Balance
      </div>


      <div
        id="walletPageBalance"
        style="
          font-size:27px;
          font-weight:800;
          color:#f5f9ff;
          margin-top:5px;
        "
      >
        0.00 TON
      </div>


      <div
        style="
          color:#8196b5;
          font-size:12px;
          margin-top:3px;
        "
      >
        TON Mainnet
      </div>

    </div>

  `;


  refreshBalance();

}


/* =========================================================
   SEND
   ========================================================= */

function renderSendPage() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <button
        class="tgn-back"
        onclick="switchNav('home')"
      >
        ← Back
      </button>

      <h2
        style="
          margin-left:auto;
          margin-right:auto;
        "
      >
        Send
      </h2>

      <span
        style="
          width:48px;
        "
      ></span>

    </div>


    <div
      class="
        tgn-card
        tgn-form-card
      "
    >

      <div class="tgn-form-title">
        Send TON
      </div>


      <label class="tgn-label">
        Recipient Address
      </label>


      <input
        id="sendTo"
        class="tgn-input"
        placeholder="UQ... / EQ..."
        autocomplete="off"
      >


      <label class="tgn-label">
        Amount
      </label>


      <input
        id="sendAmount"
        class="tgn-input"
        type="number"
        inputmode="decimal"
        min="0"
        step="any"
        placeholder="0.00 TON"
      >


      <button
        class="tgn-primary"
        onclick="doSend()"
      >
        Confirm Withdrawal
      </button>

    </div>

  `;

}


/* =========================================================
   RECEIVE
   ========================================================= */

function renderReceivePage() {

  if (!walletData) {

    renderWelcome();

    return;

  }


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <button
        class="tgn-back"
        onclick="switchNav('home')"
      >
        ← Back
      </button>

      <h2
        style="
          margin-left:auto;
          margin-right:auto;
        "
      >
        Receive
      </h2>

      <span
        style="width:48px"
      ></span>

    </div>


    <div
      class="
        tgn-card
        tgn-form-card
      "
      style="text-align:center"
    >

      <div class="tgn-form-title">
        Receive TON
      </div>


      <p class="tgn-modal-note">
        Send TON to the wallet
        address below.
      </p>


      <div
        style="
          font-size:12px;
          word-break:break-all;
          background:#071021;
          border:
            1px solid
            rgba(110,160,220,.10);
          padding:13px;
          border-radius:12px;
          color:#d9e7f7;
          text-align:left;
        "
      >
        ${escapeHtml(walletData.address)}
      </div>


      <button
        class="tgn-primary"
        style="margin-top:12px"
        onclick="copyAddress()"
      >
        Copy Address
      </button>

    </div>

  `;

}


/* =========================================================
   BALANCE
   ========================================================= */

async function refreshBalance() {

  if (
    !walletData ||
    !tonweb
  ) return;


  try {

    const balance =
      await tonweb.getBalance(
        walletData.address
      );


    const tonValue =
      (
        Number(balance) /
        1000000000
      ).toFixed(2);


    const usdValue =
      (
        Number(tonValue) *
        0.72
      ).toFixed(2);


    const balanceEl =
      document.getElementById(
        "balance"
      );

    const tokenEl =
      document.getElementById(
        "tokenBalance"
      );

    const usdEl =
      document.getElementById(
        "usdBalance"
      );

    const walletEl =
      document.getElementById(
        "walletPageBalance"
      );

    const tokenUsdEl =
      document.getElementById(
        "tokenUsd"
      );


    if (balanceEl) {

      balanceEl.innerText =
        tonValue +
        " TON";

    }


    if (tokenEl) {

      tokenEl.innerText =
        tonValue +
        " TON";

    }


    if (usdEl) {

      usdEl.innerText =
        "$" +
        usdValue +
        " USD";

    }


    if (walletEl) {

      walletEl.innerText =
        tonValue +
        " TON";

    }


    if (tokenUsdEl) {

      tokenUsdEl.innerText =
        "$" +
        usdValue;

    }

  }

  catch (error) {

    console.error(
      "Balance error:",
      error
    );

  }

}


/* =========================================================
   COPY ADDRESS
   ========================================================= */

async function copyAddress() {

  if (!walletData?.address) {

    alert(
      "Wallet address not found."
    );

    return;

  }


  try {

    await navigator.clipboard.writeText(
      walletData.address
    );

    showToast(
      "Address copied!"
    );

  }

  catch (error) {

    showToast(
      "Unable to copy address."
    );

  }

}


/* =========================================================
   SEND TRANSACTION
   ========================================================= */

async function doSend() {

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
    Number(amount) <= 0
  ) {

    alert(
      "Enter a valid address and amount."
    );

    return;

  }


  if (!walletData) {

    alert(
      "Wallet not found."
    );

    return;

  }


  try {

    showToast(
      "Processing withdrawal..."
    );


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
      await wallet
        .methods
        .seqno()
        .call() || 0;


    await wallet
      .methods
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

        sendMode:3

      })
      .send();


    /*
       Only save history AFTER
       successful transaction.
    */

    const now =
      new Date();


    saveUserTransaction({

      id:Date.now(),

      type:"withdraw",

      title:"Withdraw",

      subtitle:
        "To: " +
        to.substring(0,8) +
        "...",

      amount:
        "-" +
        amount +
        " TON",

      usd:
        "$" +
        (
          Number(amount) *
          0.72
        ).toFixed(2) +
        " USD",

      date:
        now.toLocaleDateString(
          "en-US",
          {
            month:"short",
            day:"numeric",
            year:"numeric"
          }
        ),

      time:
        now.toLocaleTimeString(
          "en-US",
          {
            hour:"2-digit",
            minute:"2-digit"
          }
        ),

      rawAddr:to

    });


    showToast(
      "Withdrawal successful!"
    );


    switchNav(
      "activity"
    );

  }

  catch (error) {

    console.error(
      error
    );

    alert(
      "Withdrawal failed: " +
      (
        error?.message ||
        "Unknown error"
      )
    );

  }

}


/* =========================================================
   SECURITY
   ========================================================= */

function openSettings() {

  if (!walletData) return;


  document.getElementById(
    "mTitle"
  ).innerText =
    "Security";


  document.getElementById(
    "mBody"
  ).innerHTML = `

    <p class="tgn-modal-note">
      Never share your recovery
      phrase with anyone.
    </p>


    <button
      class="tgn-primary"
      onclick="showPhrase()"
    >
      Show Recovery Phrase
    </button>


    <div
      id="phraseBox"
      class="tgn-secret"
      style="display:none"
    ></div>


    <button
      class="tgn-secondary"
      style="
        color:#ff6570;
        border-color:
          rgba(239,68,68,.15);
      "
      onclick="resetWallet()"
    >
      Reset Wallet
    </button>

  `;


  document.getElementById(
    "modal"
  ).style.display =
    "flex";

}


function showPhrase() {

  const box =
    document.getElementById(
      "phraseBox"
    );


  if (
    !box ||
    !walletData
  ) return;


  box.style.display =
    "block";


  box.innerText =
    walletData.mnemonic ||
    "Recovery phrase unavailable";

}


function resetWallet() {

  if (
    !confirm(
      "Reset this wallet? Make sure you have your recovery phrase first."
    )
  ) return;


  localStorage.removeItem(
    "TGN_TON_WALLET"
  );

  localStorage.removeItem(
    "TGN_USER_TXS"
  );


  location.reload();

}


/* =========================================================
   MODAL
   ========================================================= */

function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );

  if (modal) {

    modal.style.display =
      "none";

  }

}


/* =========================================================
   START APP
   ========================================================= */

window.onload = function() {

  try {

    /*
      TonWeb connection
    */

    tonweb =
      new TonWeb(
        new TonWeb.HttpProvider(
          "https://toncenter.com/api/v2/jsonRPC",
          {
            apiKey:
              API_KEY
          }
        )
      );


    if (walletData) {

      switchNav(
        "home"
      );

      refreshBalance();

    }

    else {

      renderWelcome();

    }

  }

  catch (error) {

    console.error(
      "Startup error:",
      error
    );

    renderWelcome();

  }

};
