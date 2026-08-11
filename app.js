/*
 TGN WALLET - APP.JS

 FEATURES
 - TON balance
 - Wallet Create
 - Wallet Import
 - Wallet address
 - Activity
 - Send UI
 - Airdrop
 - Daily Check-in
 - Airdrop Tasks
 - Airdrop Points
 - Airdrop History
 - Telegram Profile

 SECURITY
 - Seed phrase is NEVER saved.
 - Private key is NEVER saved.
 - Only wallet address + public key are stored locally.
 - Real transaction signing is NOT enabled here.
*/

const CONFIG = {

  API_KEY: "",

  API_BASE:
    "https://toncenter.com/api/v2",

  WALLET_STORAGE:
    "TGN_TON_WALLET",

  AIRDROP_STORAGE:
    "TGN_AIRDROP_DATA"

};


const tg =
  window.Telegram?.WebApp;


let activeTab =
  "home";


let walletData =
  safeWallet();


let tonBalance =
  0;


let transactions =
  [];


let jettons =
  [];


let airdropData =
  loadAirdrop();



/* =========================================================
   TELEGRAM
========================================================= */

if (tg) {

  tg.ready();

  tg.expand();

  try {

    tg.setHeaderColor(
      "#07101f"
    );

    tg.setBackgroundColor(
      "#050a16"
    );

  } catch (_) {}

}



/* =========================================================
   WALLET STORAGE
========================================================= */

function safeWallet() {

  try {

    const raw =
      localStorage.getItem(
        CONFIG.WALLET_STORAGE
      );

    const data =
      raw
        ? JSON.parse(raw)
        : null;

    return
      data &&
      data.address
        ? data
        : null;

  }

  catch (_) {

    return null;

  }

}



function saveWallet(data) {

  walletData =
    data;

  try {

    localStorage.setItem(
      CONFIG.WALLET_STORAGE,
      JSON.stringify(data)
    );

  }

  catch (_) {}

}



/* =========================================================
   AIRDROP STORAGE
========================================================= */

function loadAirdrop() {

  try {

    const raw =
      localStorage.getItem(
        CONFIG.AIRDROP_STORAGE
      );

    const data =
      raw
        ? JSON.parse(raw)
        : null;


    if (
      data &&
      typeof data === "object"
    ) {

      return data;

    }


  }

  catch (_) {}


  return {

    points: 0,

    rewards: 0,

    checkin: null,

    completed: [],

    referrals: 0

  };

}



function saveAirdrop() {

  try {

    localStorage.setItem(
      CONFIG.AIRDROP_STORAGE,
      JSON.stringify(
        airdropData
      )
    );

  }

  catch (_) {}

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function esc(value) {

  return String(
    value ?? ""
  )

  .replace(
    /[&<>"']/g,

    function (m) {

      return {

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      }[m];

    }

  );

}



/* =========================================================
   TELEGRAM USER
========================================================= */

function user() {

  return (
    tg?.initDataUnsafe?.user ||
    {}
  );

}



function userName() {

  const u =
    user();

  return [

    u.first_name,

    u.last_name

  ]

  .filter(Boolean)

  .join(" ")

  || "Telegram User";

}



function username() {

  return user().username

    ? "@" +
      user().username

    : "No username";

}



function userId() {

  return user().id

    ? String(
        user().id
      )

    : "Unavailable";

}



/* =========================================================
   ADDRESS
========================================================= */

function shortAddress(
  address
) {

  if (!address)
    return "Wallet not connected";


  return address.length > 18

    ? address.slice(0, 9)
      + "..."
      + address.slice(-7)

    : address;

}



/* =========================================================
   TOAST
========================================================= */

function showToast(
  message
) {

  const el =
    document.getElementById(
      "toast"
    );


  if (!el)
    return;


  el.textContent =
    message;


  el.classList.add(
    "show"
  );


  clearTimeout(
    window.__toastTimer
  );


  window.__toastTimer =
    setTimeout(

      () =>
        el.classList.remove(
          "show"
        ),

      2200

    );

}



/* =========================================================
   MODAL
========================================================= */

function openModal(
  title,
  body
) {

  const titleEl =
    document.getElementById(
      "mTitle"
    );


  const bodyEl =
    document.getElementById(
      "mBody"
    );


  const modal =
    document.getElementById(
      "modal"
    );


  if (
    !titleEl ||
    !bodyEl ||
    !modal
  )
    return;


  titleEl.textContent =
    title;


  bodyEl.innerHTML =
    body;


  modal.classList.add(
    "show"
  );

}



function closeModal() {

  document
    .getElementById(
      "modal"
    )
    ?.classList.remove(
      "show"
    );

}



/* =========================================================
   ICONS
========================================================= */

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
      <path d="M12 3c4.5 0 8 3.1 8 7 0 3.1-2.1 5.8-5.2 6.7L12 21l-2.8-4.3C6.1 15.8 4 13.1 4 10c0-3.9 3.5-7 8-7z"></path>
      <path d="M8.5 10.5h7"></path>
      <path d="M12 7v7"></path>
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

      ${
        paths[name] || ""
      }

    </svg>

  `;

}



/* =========================================================
   EXTRA CSS
========================================================= */

function injectExtraStyles() {

  if (
    document.getElementById(
      "tgn-extra-styles"
    )
  )
    return;


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "tgn-extra-styles";


  style.textContent = `

    .wallet-choice-grid{
      display:grid;
      gap:10px;
    }

    .airdrop-banner{
      display:flex;
      align-items:center;
      gap:12px;
      padding:16px;
      cursor:pointer;
    }

    .airdrop-summary{
      padding:18px;
      background:
        linear-gradient(
          135deg,
          #111936,
          #21134d
        );
      border:
        1px solid
        rgba(
          132,
          76,
          255,
          .55
        );
    }

    .airdrop-stats{
      display:flex;
      gap:10px;
      margin-top:18px;
      padding-top:14px;
      border-top:
        1px solid
        rgba(
          255,
          255,
          255,
          .08
        );
    }

    .airdrop-stats > div{
      flex:1;
      text-align:center;
    }

    .airdrop-stats b{
      display:block;
      color:#a875ff;
      font-size:18px;
    }

    .airdrop-stats small{
      display:block;
      color:#8196b5;
      margin-top:3px;
    }

    .task-row{
      display:flex;
      align-items:center;
      gap:11px;
      padding:13px 0;
      border-bottom:
        1px solid
        rgba(
          255,
          255,
          255,
          .06
        );
    }

    .task-row:last-child{
      border-bottom:0;
    }

    .task-icon{
      width:42px;
      height:42px;
      border-radius:13px;
      display:grid;
      place-items:center;
      background:
        rgba(
          117,
          67,
          255,
          .14
        );
      font-size:22px;
      flex:none;
    }

    .task-main{
      flex:1;
      min-width:0;
    }

    .task-main b{
      display:block;
      color:#f5f7ff;
      font-size:14px;
    }

    .task-main span{
      display:block;
      color:#8196b5;
      font-size:11px;
      line-height:1.5;
      margin-top:3px;
    }

    .task-main strong{
      color:#a875ff;
    }

    .task-btn{
      border:0;
      border-radius:10px;
      padding:9px 13px;
      background:
        linear-gradient(
          135deg,
          #5e25d6,
          #7f3cff
        );
      color:#fff;
      font-weight:700;
    }

    .task-btn:disabled{
      opacity:.5;
      background:#24314a;
    }

    .status-pill{
      font-size:10px;
      color:#50e39b;
      background:
        rgba(
          46,
          204,
          113,
          .12
        );
      border-radius:20px;
      padding:5px 8px;
    }

    .airdrop-task-list{
      display:flex;
      flex-direction:column;
    }

    #nav-airdrop .nav-svg{
      color:#a875ff;
    }

    #nav-airdrop.active{
      color:#a875ff;
    }

    #seedInput{
      width:100%;
      min-height:110px;
      resize:none;
      box-sizing:border-box;
      font-family:inherit;
      line-height:1.6;
    }

  `;


  document.head.appendChild(
    style
  );

}



/* =========================================================
   AIRDROP NAV
========================================================= */

function ensureAirdropNav() {

  let nav =
    document.querySelector(
      ".bottom-nav, .nav, .navbar, .navigation"
    );


  const send =
    document.getElementById(
      "nav-send"
    );


  if (
    !nav &&
    send
  ) {

    nav =
      send.parentElement;

  }


  if (
    !nav ||
    document.getElementById(
      "nav-airdrop"
    )
  )
    return;


  const item =
    document.createElement(
      "button"
    );


  item.id =
    "nav-airdrop";


  item.className =
    "nav-item";


  item.innerHTML = `

    <span
      class="nav-svg"
      data-icon="airdrop"
    >
      ${icon("airdrop")}
    </span>

    <span>
      Airdrop
    </span>

  `;


  item.onclick =
    () =>
      switchNav(
        "airdrop"
      );


  if (
    send?.nextSibling
  ) {

    nav.insertBefore(
      item,
      send.nextSibling
    );

  }

  else {

    nav.appendChild(
      item
    );

  }

}



/* =========================================================
   NAV ICON INIT
========================================================= */

function initNavIcons() {

  document
    .querySelectorAll(
      ".nav-svg"
    )
    .forEach(
      function (el) {

        const name =
          el.dataset.icon;


        if (name)
          el.innerHTML =
            icon(name);

      }
    );


  ensureAirdropNav();


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      function (item) {

        if (
          item.dataset.navBound ===
          "1"
        )
          return;


        const id =
          item.id || "";


        const tab =
          id.replace(
            /^nav-/,
            ""
          );


        if (
          [
            "home",
            "activity",
            "send",
            "wallet",
            "airdrop",
            "profile"
          ].includes(tab)
        ) {

          item.dataset.navBound =
            "1";


          item.addEventListener(
            "click",
            function () {

              switchNav(
                tab
              );

            }
          );

        }

      }
    );

}



/* =========================================================
   NAVIGATION
========================================================= */

function switchNav(
  tab
) {

  activeTab =
    tab;


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      function (item) {

        item.classList.remove(
          "active"
        );

      }
    );


  document
    .getElementById(
      "nav-" + tab
    )
    ?.classList.add(
      "active"
    );


  if (
    tab === "home"
  )
    renderHome();


  else if (
    tab === "activity"
  )
    renderActivity();


  else if (
    tab === "send"
  )
    renderSend();


  else if (
    tab === "wallet"
  )
    renderWallet();


  else if (
    tab === "airdrop"
  )
    renderAirdrop();


  else if (
    tab === "profile"
  )
    renderProfile();

}



/* =========================================================
   HOME
========================================================= */

function renderHome() {

  const address =
    walletData?.address ||
    "";


  document.getElementById(
    "content"
  ).innerHTML = `

    <section class="card hero">

      <div class="hero-label">
        My Wallet
      </div>


      <div
        class="hero-balance"
        id="heroBalance"
      >
        ${tonBalance.toFixed(2)}
        TON
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
        <span>
          Wallet Address
        </span>
      </div>


      <div class="address-row">

        <span class="dot"></span>


        <div class="address-text">
          ${esc(
            shortAddress(
              address
            )
          )}
        </div>


        <button
          class="copy-pill"
          onclick="copyAddress()"
        >
          Copy
        </button>

      </div>


      ${
        address
          ? ""
          : `

            <button
              class="btn primary"
              style="
                margin-top:12px;
                width:100%
              "
              onclick="openWalletSetup()"
            >
              Create / Import Wallet
            </button>

          `
      }

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


    <section
      class="card airdrop-banner"
      onclick="switchNav('airdrop')"
    >

      <div
        style="
          font-size:30px
        "
      >
        🎁
      </div>


      <div style="flex:1">

        <b>
          Airdrop Campaign
        </b>


        <div class="token-sub">
          Complete tasks and earn rewards
        </div>

      </div>


      <div
        style="
          font-size:28px
        "
      >
        ›
      </div>

    </section>

  `;


  if (address)
    refreshWallet(
      false
    );

}



/* =========================================================
   TON TOKEN
========================================================= */

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

        ${tonBalance.toFixed(4)}
        TON


        <div class="token-usd">
          $0.00
        </div>

      </div>

    </div>

  `;

}



/* =========================================================
   JETTON
========================================================= */

function renderJettons() {

  if (
    !jettons.length
  ) {

    return `

      <div
        class="empty"
        style="
          padding:22px 8px
        "
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
    .map(
      function (j) {

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

      }
    )
    .join("");

}



/* =========================================================
   BALANCE
========================================================= */

async function refreshWallet(
  show = true
) {

  if (
    !walletData?.address
  ) {

    if (show)
      showToast(
        "Wallet address not available"
      );

    return;

  }


  try {

    const url =
      new URL(
        CONFIG.API_BASE +
        "/getAddressBalance"
      );


    url.searchParams.set(
      "address",
      walletData.address
    );


    if (
      CONFIG.API_KEY
    ) {

      url.searchParams.set(
        "api_key",
        CONFIG.API_KEY
      );

    }


    const response =
      await fetch(
        url.toString(),
        {
          headers:
            CONFIG.API_KEY
              ? {
                  "X-API-Key":
                    CONFIG.API_KEY
                }
              : {}
        }
      );


    const data =
      await response.json();


    if (!data.ok)
      throw new Error(
        data.error ||
        data.description ||
        "API error"
      );


    const nano =
      Number(
        data.result
      );


    tonBalance =
      Number.isFinite(
        nano
      ) &&
      nano >= 0

        ? nano / 1e9

        : 0;


    const hero =
      document.getElementById(
        "heroBalance"
      );


    if (hero) {

      hero.textContent =
        tonBalance.toFixed(
          2
        ) +
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


    if (show)
      showToast(
        "Balance refreshed"
      );

  }

  catch (error) {

    console.error(
      error
    );


    if (show)
      showToast(
        "API not connected"
      );

  }

}



/* =========================================================
   DEPOSIT
========================================================= */

function showDeposit() {

  if (
    !walletData?.address
  ) {

    openWalletSetup();

    return;

  }


  openModal(
    "Deposit",

    `

      <p>
        Send TON to this wallet address.
      </p>


      <div
        class="address-row"
        style="
          margin-top:12px
        "
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
        Only send assets on
        TON Mainnet to this address.
      </p>

    `
  );

}



/* =========================================================
   COPY
========================================================= */

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

  catch (_) {

    showToast(
      "Copy failed"
    );

  }

}



/* =========================================================
   WALLET SETUP
========================================================= */

function openWalletSetup() {

  openModal(
    "Set Up Wallet",

    `

      <div
        class="wallet-choice-grid"
      >

        <button
          class="btn primary"
          onclick="showCreateWallet()"
        >
          ✨ Create New Wallet
        </button>


        <button
          class="btn secondary"
          onclick="showImportWallet()"
        >
          🔐 Import Seed Phrase
        </button>

      </div>


      <div
        class="warning"
        style="
          margin-top:14px
        "
      >

        Seed phrases are extremely
        sensitive. Never share them
        with anyone.

      </div>

    `
  );

}



/* =========================================================
   CREATE WALLET SCREEN
========================================================= */

function showCreateWallet() {

  openModal(
    "Create New Wallet",

    `

      <p>
        Generate a new TON wallet.
      </p>


      <div class="warning">

        ⚠️ Your recovery phrase must be
        written down and kept offline.

        Do not send it to anyone.

      </div>


      <button
        class="btn primary"
        style="
          width:100%;
          margin-top:12px
        "
        onclick="createWalletNow()"
      >
        Generate Wallet
      </button>

    `
  );

}



/* =========================================================
   IMPORT SCREEN
========================================================= */

function showImportWallet() {

  openModal(
    "Import Seed Phrase",

    `

      <p>
        Enter your existing TON
        seed phrase.
      </p>


      <textarea
        id="seedInput"
        class="text-input"
        rows="4"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        placeholder="
word1 word2 word3 ... word24
"
      ></textarea>


      <div
        class="warning"
        style="
          margin-top:10px
        "
      >

        🔐 The phrase is used only
        to derive the wallet address.

        It is NOT saved by this app.

      </div>


      <button
        class="btn primary"
        style="
          width:100%;
          margin-top:12px
        "
        onclick="importWalletNow()"
      >
        Import Wallet
      </button>

    `
  );

}



/* =========================================================
   TON MODULES
========================================================= */

async function tonModules() {

  const crypto =
    await import(
      "https://esm.sh/@ton/crypto"
    );


  const ton =
    await import(
      "https://esm.sh/@ton/ton"
    );


  return {
    crypto,
    ton
  };

}



/* =========================================================
   CREATE WALLET
========================================================= */

async function createWalletNow() {

  showToast(
    "Generating wallet…"
  );


  try {

    const {
      crypto,
      ton
    } =
      await tonModules();


    const mnemonic =
      await crypto.mnemonicNew(
        24
      );


    const keyPair =
      await crypto.mnemonicToPrivateKey(
        mnemonic
      );


    const wallet =
      ton.WalletContractV4.create({

        workchain: 0,

        publicKey:
          keyPair.publicKey,

        walletId:
          0x29a9a317

      });


    const address =
      wallet.address.toString({

        bounceable:
          true,

        urlSafe:
          true

      });


    saveWallet({

      address:

        address,

      publicKey:

        bufferToHex(
          keyPair.publicKey
        ),

      imported:
        false,

      createdAt:
        Date.now()

    });


    /*
      IMPORTANT:
      mnemonic is NOT stored.
    */


    closeModal();


    renderWallet();


    openModal(
      "Wallet Created ✓",

      `

        <p>
          Your new TON wallet has been
          created successfully.
        </p>


        <div
          class="address-row"
          style="
            margin-top:12px
          "
        >

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


        <div
          class="warning"
          style="
            margin-top:14px
          "
        >

          ⚠️ Recovery phrase is NOT
          stored by this app.

          If you need the recovery phrase,
          create/import using a secure
          wallet implementation.

        </div>


        <button
          class="btn primary"
          style="
            width:100%;
            margin-top:12px
          "
          onclick="closeModal()"
        >
          Continue
        </button>

      `
    );


  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "Wallet generation failed"
    );

  }

}



/* =========================================================
   IMPORT WALLET
========================================================= */

async function importWalletNow() {

  const input =
    document.getElementById(
      "seedInput"
    );


  const phrase =
    input?.value
      .trim()
      .replace(
        /\s+/g,
        " "
      );


  if (!phrase) {

    showToast(
      "Enter seed phrase"
    );

    return;

  }


  const words =
    phrase.split(
      " "
    );


  if (
    ![12, 24].includes(
      words.length
    )
  ) {

    showToast(
      "Use a valid 12 or 24 word phrase"
    );

    return;

  }


  showToast(
    "Importing wallet…"
  );


  try {

    const {
      crypto,
      ton
    } =
      await tonModules();


    const valid =
      await crypto.mnemonicValidate(
        words
      );


    if (!valid) {

      showToast(
        "Invalid TON seed phrase"
      );

      return;

    }


    const keyPair =
      await crypto.mnemonicToPrivateKey(
        words
      );


    const wallet =
      ton.WalletContractV4.create({

        workchain: 0,

        publicKey:
          keyPair.publicKey,

        walletId:
          0x29a9a317

      });


    const address =
      wallet.address.toString({

        bounceable:
          true,

        urlSafe:
          true

      });


    saveWallet({

      address:
        address,

      publicKey:
        bufferToHex(
          keyPair.publicKey
        ),

      imported:
        true,

      createdAt:
        Date.now()

    });


    /*
      NEVER save phrase.
    */


    input.value =
      "";


    closeModal();


    renderWallet();


    showToast(
      "Wallet imported ✓"
    );

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "Import failed"
    );

  }

}



/* =========================================================
   BUFFER -> HEX
========================================================= */

function bufferToHex(
  buffer
) {

  try {

    return Array
      .from(
        new Uint8Array(
          buffer
        )
      )
      .map(
        b =>
          b.toString(
            16
          ).padStart(
            2,
            "0"
          )
      )
      .join("");

  }

  catch (_) {

    return "";

  }

}



/* =========================================================
   WALLET PAGE
========================================================= */

function renderWallet() {

  const address =
    walletData?.address ||
    "";


  document.getElementById(
    "content"
  ).innerHTML = `

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
        Wallet
      </div>


      ${
        address

        ? `

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


          <button
            class="btn secondary"
            style="
              width:100%;
              margin-top:12px
            "
            onclick="openWalletSetup()"
          >
            Create / Import Another
          </button>

        `

        : `

          <div
            class="empty-text"
            style="
              margin-bottom:12px
            "
          >
            No wallet is configured.
          </div>


          <button
            class="btn primary"
            style="
              width:100%
            "
            onclick="showCreateWallet()"
          >
            ✨ Create New Wallet
          </button>


          <button
            class="btn secondary"
            style="
              width:100%;
              margin-top:10px
            "
            onclick="showImportWallet()"
          >
            🔐 Import Seed Phrase
          </button>

        `
      }

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
        ${tonBalance.toFixed(2)}
        TON
      </div>


      <div class="token-sub">
        TON Mainnet
      </div>

    </section>


    <section class="card section">

      <div class="section-head">
        Security
      </div>


      <div class="warning">

        This frontend does not store
        your seed phrase or private key.

        Real sending/signing should use
        a secure signer or TON Connect.

      </div>

    </section>

  `;

}



/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-head">

      <div>

        <h1 class="page-title">
          Activity
        </h1>


        <div class="page-subtitle">
          Real wallet transactions only
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



async function loadTransactions() {

  const box =
    document.getElementById(
      "activityList"
    );


  if (!box)
    return;


  if (
    !walletData?.address
  ) {

    box.innerHTML =
      emptyActivity();

    return;

  }


  try {

    const url =
      new URL(
        CONFIG.API_BASE +
        "/getTransactions"
      );


    url.searchParams.set(
      "address",
      walletData.address
    );


    url.searchParams.set(
      "limit",
      "20"
    );


    const response =
      await fetch(
        url.toString()
      );


    const data =
      await response.json();


    if (!data.ok)
      throw new Error(
        data.error ||
        "API error"
      );


    transactions =
      Array.isArray(
        data.result
      )
        ? data.result
        : [];


    if (
      !transactions.length
    ) {

      box.innerHTML =
        emptyActivity();

      return;

    }


    box.innerHTML =
      transactions
        .map(
          function (
            tx,
            i
          ) {

            return `

              <div class="card tx">

                <div class="tx-icon">
                  ↗
                </div>


                <div class="tx-main">

                  <div class="tx-title">
                    Transaction
                    ${i + 1}
                  </div>


                  <div class="tx-sub">

                    ${
                      tx.utime

                        ? new Date(
                            tx.utime *
                            1000
                          ).toLocaleString()

                        : "On-chain"

                    }

                  </div>

                </div>


                <div class="tx-amount">

                  ${
                    tx.hash

                      ? esc(
                          String(
                            tx.hash
                          ).slice(
                            0,
                            6
                          ) +
                          "…"
                        )

                      : "View"
                  }

                </div>

              </div>

            `;

          }
        )
        .join("");

  }

  catch (error) {

    console.error(
      error
    );


    box.innerHTML =
      emptyActivity(
        "Secure API/backend connection is required for history."
      );

  }

}



function emptyActivity(
  message =
    "No transactions yet."
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



/* =========================================================
   SEND
========================================================= */

function renderSend() {

  document.getElementById(
    "content"
  ).innerHTML = `

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

        Real blockchain broadcasting
        is not enabled in this public
        frontend.

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
    !Number.isFinite(
      amount
    ) ||
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
        style="
          word-break:break-all
        "
      >
        ${esc(to)}
      </p>


      <p>
        <b>Amount</b>
      </p>


      <p>
        ${amount.toFixed(4)}
        TON
      </p>


      <div class="warning">

        Real blockchain broadcasting
        is not enabled yet.

      </div>

    `
  );

}



/* =========================================================
   AIRDROP TASKS
========================================================= */

const A_TASKS = [

  {
    id:
      "daily",

    icon:
      "📅",

    title:
      "Daily Check-in",

    sub:
      "Check-in daily and earn points",

    points:
      20

  },


  {
    id:
      "channel",

    icon:
      "✈️",

    title:
      "Join our Telegram Channel",

    sub:
      "Join and stay updated",

    points:
      50

  },


  {
    id:
      "twitter",

    icon:
      "𝕏",

    title:
      "Follow us on Twitter",

    sub:
      "Follow and like our pinned post",

    points:
      30

  },


  {
    id:
      "group",

    icon:
      "👥",

    title:
      "Join our Telegram Group",

    sub:
      "Be active in our community",

    points:
      40

  },


  {
    id:
      "referral",

    icon:
      "🎁",

    title:
      "Invite 3 Friends",

    sub:
      "Invite friends using your referral link",

    points:
      100

  }

];



/* =========================================================
   AIRDROP PAGE
========================================================= */

function renderAirdrop() {

  const completed =
    airdropData.completed.length;


  const today =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );


  const canCheck =
    airdropData.checkin !==
    today;


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-head">

      <div>

        <h1 class="page-title">
          🎁 Airdrop
        </h1>


        <div class="page-subtitle">
          Complete tasks and earn rewards
        </div>

      </div>

    </div>


    <section class="card airdrop-summary">

      <div>

        <div class="token-sub">
          Total Rewards
        </div>


        <div
          class="hero-balance"
          style="
            font-size:34px
          "
        >
          ${airdropData.rewards.toFixed(2)}
          TGN
        </div>


        <div class="token-sub">
          ≈ $0.00 USD
        </div>

      </div>


      <div class="airdrop-stats">

        <div>

          <b>
            ${completed}/${A_TASKS.length}
          </b>

          <small>
            Tasks
          </small>

        </div>


        <div>

          <b>
            ${airdropData.points}
          </b>

          <small>
            Points
          </small>

        </div>


        <div>

          <b>
            ${referralCount()}
          </b>

          <small>
            Referrals
          </small>

        </div>

      </div>

    </section>


    <section class="card section">

      <div class="section-head">

        Daily Check-in

        <span class="status-pill">

          ${
            canCheck
              ? "Available"
              : "Completed"
          }

        </span>

      </div>


      <div class="task-row">

        <div class="task-icon">
          📅
        </div>


        <div class="task-main">

          <b>
            Daily Check-in
          </b>


          <span>

            Check-in daily and earn points

            <br>

            <strong>
              +20 Points
            </strong>

          </span>

        </div>


        <button
          class="task-btn"
          ${
            canCheck
              ? ""
              : "disabled"
          }
          onclick="
            completeAirdropTask(
              'daily'
            )
          "
        >

          ${
            canCheck
              ? "Check-in"
              : "Done ✓"
          }

        </button>

      </div>

    </section>


    <section class="card section">

      <div class="section-head">

        Task Center


        <button
          class="refresh"
          onclick="renderAirdrop()"
        >
          View All ›
        </button>

      </div>


      <div
        class="airdrop-task-list"
      >

        ${A_TASKS
          .filter(
            t =>
              t.id !==
              "daily"
          )
          .map(
            taskHtml
          )
          .join("")}

      </div>

    </section>


    <section class="card section">

      <div class="section-head">

        Airdrop History


        <button
          class="refresh"
          onclick="openAirdropHistory()"
        >
          View ›
        </button>

      </div>


      <div class="token-sub">

        ${
          completed
            ? completed +
              " task reward(s) earned"
            : "No rewards yet"
        }

      </div>

    </section>

  `;

}



/* =========================================================
   TASK HTML
========================================================= */

function taskHtml(
  task
) {

  const done =
    airdropData.completed
      .includes(
        task.id
      );


  return `

    <div class="task-row">

      <div class="task-icon">
        ${task.icon}
      </div>


      <div class="task-main">

        <b>
          ${esc(
            task.title
          )}
        </b>


        <span>

          ${esc(
            task.sub
          )}

          <br>

          <strong>
            +${task.points}
            Points
          </strong>

        </span>

      </div>


      <button
        class="task-btn"
        ${
          done
            ? "disabled"
            : ""
        }
        onclick="
          completeAirdropTask(
            '${task.id}'
          )
        "
      >

        ${
          done
            ? "✓"
            : "Go"
        }

      </button>

    </div>

  `;

}



/* =========================================================
   REFERRALS
========================================================= */

function referralCount() {

  return Number(
    airdropData.referrals ||
    0
  );

}



/* =========================================================
   COMPLETE AIRDROP
========================================================= */

function completeAirdropTask(
  id
) {

  const task =
    A_TASKS.find(
      x =>
        x.id === id
    );


  if (!task)
    return;


  if (
    id === "daily"
  ) {

    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );


    if (
      airdropData.checkin ===
      today
    ) {

      showToast(
        "Already checked in today"
      );

      return;

    }


    airdropData.checkin =
      today;

  }

  else if (
    airdropData.completed
      .includes(id)
  ) {

    showToast(
      "Task already completed"
    );

    return;

  }


  if (
    !airdropData.completed
      .includes(id)
  ) {

    airdropData.completed.push(
      id
    );

  }


  airdropData.points +=
    task.points;


  /*
    Demo reward calculation.
    Real TGN reward must be verified
    by your backend before crediting.
  */

  airdropData.rewards +=
    task.points / 10;


  saveAirdrop();


  renderAirdrop();


  showToast(
    "Reward added +" +
    task.points +
    " points ✓"
  );

}



/* =========================================================
   AIRDROP HISTORY
========================================================= */

function openAirdropHistory() {

  const rows =
    airdropData.completed

      .map(
        id => {

          const task =
            A_TASKS.find(
              x =>
                x.id === id
            );


          if (!task)
            return "";


          return `

            <div class="info-row">

              <span class="info-label">

                ${esc(
                  task.title
                )}

              </span>


              <span class="info-value">

                +${task.points}
                Points

              </span>

            </div>

          `;

        }
      )

      .join("");


  openModal(

    "Airdrop History",

    rows ||

    `

      <div class="empty-text">
        No rewards yet.
      </div>

    `

  );

}



/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

  const u =
    user();


  const photo =
    u.photo_url ||
    "";


  const avatar =
    photo

      ? `

        <img
          class="profile-avatar"
          src="${esc(photo)}"
          alt="Telegram profile"
        >

      `

      : `

        <div class="avatar-fallback">

          ${esc(
            (
              u.first_name ||
              "T"
            )
            .charAt(0)
            .toUpperCase()
          )}

        </div>

      `;


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="page-head">

      <h1 class="page-title">
        Profile
      </h1>

    </div>


    <section class="profile-hero">

      <div class="profile-main">

        <div
          class="profile-avatar-wrap"
        >

          ${avatar}


          <span
            class="profile-online"
          ></span>

        </div>


        <div>

          <div class="profile-name">
            ${esc(
              userName()
            )}
          </div>


          <div class="profile-username">
            ${esc(
              username()
            )}
          </div>


          <div class="profile-id">
            Telegram ID:
            ${esc(
              userId()
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
            ${
              photo
                ? "✓"
                : "—"
            }
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

        <span>
          ♙
          Personal Information
        </span>

        <span>
          ›
        </span>

      </button>


      <button
        class="profile-menu-item"
        onclick="openSecurity()"
      >

        <span>
          ◉
          Security
        </span>

        <span>
          ›
        </span>

      </button>


      <button
        class="profile-menu-item"
        onclick="openHelp()"
      >

        <span>
          ?
          Help & Support
        </span>

        <span>
          ›
        </span>

      </button>


      <button
        class="profile-menu-item danger"
        onclick="logoutWallet()"
      >

        <span>
          ↪
          Log Out
        </span>

        <span>
          ›
        </span>

      </button>

    </section>

  `;

}



/* =========================================================
   PROFILE MODALS
========================================================= */

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
            ${esc(
              userName()
            )}
          </span>

        </div>


        <div class="info-row">

          <span class="info-label">
            Username
          </span>


          <span class="info-value">
            ${esc(
              username()
            )}
          </span>

        </div>


        <div class="info-row">

          <span class="info-label">
            Telegram ID
          </span>


          <span class="info-value">
            ${esc(
              userId()
            )}
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

        This app does not store
        your seed phrase or private key.

      </div>


      <p>

        Real sending/signing should
        use TON Connect or a properly
        secured signer.

      </p>

    `

  );

}



function openHelp() {

  openModal(

    "Help & Support",

    `

      <p>
        <b>
          TGN Wallet
        </b>
      </p>


      <p>

        TON Mainnet wallet interface
        with balance, activity, wallet
        setup and airdrop UI.

      </p>

    `

  );

}



/* =========================================================
   LOGOUT
========================================================= */

function logoutWallet() {

  openModal(

    "Log Out",

    `

      <p>

        This removes the locally stored
        wallet address from this device.

      </p>


      <button
        class="btn primary"
        onclick="
          localStorage.removeItem(
            CONFIG.WALLET_STORAGE
          );

          walletData = null;

          closeModal();

          switchNav('home');

          showToast(
            'Wallet session removed'
          );
        "
      >

        Confirm Log Out

      </button>

    `

  );

}



/* =========================================================
   START
========================================================= */

function boot() {

  injectExtraStyles();

  initNavIcons();

  renderHome();


  document
    .getElementById(
      "nav-home"
    )
    ?.classList.add(
      "active"
    );


  if (
    walletData
  ) {

    refreshWallet(
      false
    );

  }

}


boot();
