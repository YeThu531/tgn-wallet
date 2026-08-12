/* =========================================================
   TGN WALLET
   Telegram Mini App
   Firebase + TON Wallet + Airdrop + Referral
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {

  FIREBASE: {
    apiKey:
      "AIzaSyAc-8EzwZcJvhouuk9Vkx6Ngj_hgjRMiKg",

    authDomain:
      "tgn-wallet.firebaseapp.com",

    projectId:
      "tgn-wallet",

    storageBucket:
      "tgn-wallet.firebasestorage.app",

    messagingSenderId:
      "347838161609",

    appId:
      "1:347838161609:web:27b90e794b383d0ddb2318",

    measurementId:
      "G-250N1M7FB4"
  },

  /*
    IMPORTANT:
    Do NOT put TON Center secret API key here.

    Use your Cloudflare Worker as the backend/proxy.
  */
  API_BASE:
    "https://u20052.workers.dev",

  WALLET_STORAGE:
    "TGN_TON_WALLET",

  TX_STORAGE:
    "TGN_USER_TXS"

};


/* =========================================================
   GLOBALS
   ========================================================= */

const tg =
  window.Telegram?.WebApp || null;

let db = null;

let firebaseReady = false;

let tonweb = null;

let activeTab = "home";

let walletData =
  loadWallet();

let tonBalance = 0;

let transactions = [];

let userData = null;


/* =========================================================
   TELEGRAM INIT
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


import {
  initFirebase,
  getDB,
  getUser,
  saveUser,
  getAirdropTasks,
  claimAirdropTask
} from "./firebase.js";

}


/* =========================================================
   TON WEB INIT
   ========================================================= */

function initTonWeb() {

  try {

    if (
      typeof TonWeb !==
      "undefined"
    ) {

      tonweb =
        new TonWeb(
          new TonWeb.HttpProvider(
            "https://toncenter.com/api/v2/jsonRPC"
          )
        );

      return true;

    }

  } catch (error) {

    console.error(
      "TON Web init error:",
      error
    );

  }

  return false;

}


/* =========================================================
   STORAGE
   ========================================================= */

function loadWallet() {

  try {

    const raw =
      localStorage.getItem(
        CONFIG.WALLET_STORAGE
      );

    if (!raw)
      return null;

    const data =
      JSON.parse(raw);

    if (
      data &&
      data.address
    ) {

      return data;

    }

  } catch (error) {

    console.error(
      "Wallet storage error:",
      error
    );

  }

  return null;

}


function saveWallet(data) {

  walletData =
    data;

  try {

    localStorage.setItem(
      CONFIG.WALLET_STORAGE,
      JSON.stringify(data)
    );

  } catch (error) {

    console.error(
      "Wallet save error:",
      error
    );

  }

}


function clearWallet() {

  walletData = null;

  localStorage.removeItem(
    CONFIG.WALLET_STORAGE
  );

}


/* =========================================================
   TELEGRAM USER
   ========================================================= */

function getTelegramUser() {

  return (
    tg?.initDataUnsafe?.user ||
    null
  );

}


function getUserId() {

  const u =
    getTelegramUser();

  return u?.id
    ? String(u.id)
    : null;

}


function getUserName() {

  const u =
    getTelegramUser();

  if (!u)
    return "Telegram User";

  return [
    u.first_name,
    u.last_name
  ]
    .filter(Boolean)
    .join(" ")
    || "Telegram User";

}


function getUsername() {

  const u =
    getTelegramUser();

  return u?.username
    ? "@" + u.username
    : "No username";

}


function getUserPhoto() {

  return (
    getTelegramUser()
      ?.photo_url ||
    ""
  );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    function (char) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];

    }
  );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );

  if (!toast) {

    alert(message);

    return;

  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    window.__toastTimer
  );

  window.__toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      2000
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(
  title,
  body
) {

  const modal =
    document.getElementById(
      "modal"
    );

  const titleEl =
    document.getElementById(
      "mTitle"
    );

  const bodyEl =
    document.getElementById(
      "mBody"
    );

  if (!modal)
    return;

  if (titleEl)
    titleEl.textContent =
      title;

  if (bodyEl)
    bodyEl.innerHTML =
      body;

  modal.classList.add(
    "show"
  );

}


function closeModal() {

  document
    .getElementById("modal")
    ?.classList.remove(
      "show"
    );

}


/* =========================================================
   ICONS
   ========================================================= */

function initIcons() {

  const icons = {

    home: `
      <path d="M3 10.5L12 3l9 7.5"></path>
      <path d="M5 9.5V21h14V9.5"></path>
      <path d="M9 21v-7h6v7"></path>
    `,

    activity: `
      <path d="M4 19V5"></path>
      <path d="M4 19h16"></path>
      <path d="M7 16l3-4 3 2 5-7"></path>
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
      <path d="M12 3v12"></path>
      <path d="M7 10l5 5 5-5"></path>
      <path d="M5 21h14"></path>
      <path d="M7 6h10"></path>
    `,

    profile: `
      <circle cx="12" cy="7" r="4"></circle>
      <path d="M4 21v-1a7 7 0 0 1 14 0v1"></path>
    `

  };


  document
    .querySelectorAll(
      ".nav-svg[data-icon]"
    )
    .forEach(
      function (element) {

        const name =
          element.dataset.icon;

        const body =
          icons[name];

        if (!body)
          return;

        element.innerHTML = `
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            ${body}
          </svg>
        `;

      }
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function switchNav(tab) {

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


  if (tab === "home")
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


  if (!walletData) {

    renderWelcome();

    return;

  }


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <div>

        <h2>
          TGN Wallet
        </h2>

        <div
          style="
            color:#7187a5;
            font-size:11px;
            margin-top:3px;
          "
        >
          TON Mainnet
        </div>

      </div>

      <div
        style="
          color:#22c58b;
          font-size:10px;
          font-weight:700;
        "
      >
        ● Online
      </div>

    </div>


    <div
      class="tgn-card"
      style="
        padding:22px;
        margin-bottom:12px;
        position:relative;
        overflow:hidden;
      "
    >

      <div
        style="
          color:#8096b4;
          font-size:11px;
        "
      >
        Total Balance
      </div>


      <div
        id="homeBalance"
        style="
          color:#f5f9ff;
          font-size:38px;
          font-weight:850;
          margin-top:6px;
        "
      >
        ${tonBalance.toFixed(4)} TON
      </div>


      <div
        style="
          color:#7187a5;
          font-size:11px;
          margin-top:3px;
        "
      >
        TON Mainnet
      </div>


      <div
        style="
          display:flex;
          gap:9px;
          margin-top:20px;
        "
      >

        <button
          class="tgn-primary"
          style="
            flex:1;
            padding:13px;
            border:0;
            border-radius:14px;
          "
          onclick="showDeposit()"
        >
          Deposit
        </button>


        <button
          class="btn secondary"
          style="
            flex:1;
            padding:13px;
            border-radius:14px;
          "
          onclick="switchNav('send')"
        >
          Send
        </button>

      </div>

    </div>


    <div
      class="tgn-card"
      style="
        padding:16px;
        margin-bottom:12px;
      "
    >

      <div
        style="
          color:#7187a5;
          font-size:10px;
          margin-bottom:7px;
        "
      >
        WALLET ADDRESS
      </div>


      <div
        style="
          display:flex;
          align-items:center;
          gap:9px;
        "
      >

        <div
          style="
            flex:1;
            color:#edf5ff;
            font-size:11px;
            word-break:break-all;
          "
        >
          ${escapeHtml(
            shortAddress(address)
          )}
        </div>


        <button
          class="copy-id"
          onclick="copyAddress()"
        >
          Copy
        </button>

      </div>

    </div>


    <div
      class="tgn-card"
      style="
        padding:16px;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
        "
      >

        <div
          style="
            color:#edf5ff;
            font-size:14px;
            font-weight:800;
          "
        >
          Assets
        </div>


        <button
          class="copy-id"
          onclick="refreshBalance()"
        >
          Refresh
        </button>

      </div>


      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding-top:17px;
        "
      >

        <div
          style="
            display:flex;
            align-items:center;
            gap:10px;
          "
        >

          <div
            style="
              width:42px;
              height:42px;
              border-radius:14px;
              display:flex;
              align-items:center;
              justify-content:center;
              background:rgba(42,156,255,.10);
              font-size:22px;
            "
          >
            💎
          </div>


          <div>

            <div
              style="
                color:#edf5ff;
                font-size:14px;
                font-weight:800;
              "
            >
              TON
            </div>

            <div
              style="
                color:#7187a5;
                font-size:10px;
                margin-top:3px;
              "
            >
              Toncoin
            </div>

          </div>

        </div>


        <div
          style="
            text-align:right;
          "
        >

          <div
            style="
              color:#edf5ff;
              font-size:13px;
              font-weight:800;
            "
            id="assetBalance"
          >
            ${tonBalance.toFixed(4)}
          </div>

          <div
            style="
              color:#7187a5;
              font-size:10px;
              margin-top:3px;
            "
          >
            TON
          </div>

        </div>

      </div>

    </div>

  `;


  refreshBalance();

}


/* =========================================================
   WELCOME / CREATE / IMPORT
   ========================================================= */

function renderWelcome() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div
      class="tgn-card"
      style="
        padding:28px 20px;
        text-align:center;
        margin-top:10px;
      "
    >

      <div
        style="
          width:76px;
          height:76px;
          margin:0 auto 16px;
          border-radius:24px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:rgba(42,156,255,.10);
          font-size:40px;
        "
      >
        💎
      </div>


      <h2
        style="
          color:#fff;
          margin:0;
          font-size:24px;
        "
      >
        TGN Wallet
      </h2>


      <p
        style="
          color:#7187a5;
          font-size:12px;
          line-height:1.6;
          margin:9px 0 22px;
        "
      >
        Create a new TON wallet
        or import an existing wallet.
      </p>


      <button
        class="tgn-primary"
        style="
          width:100%;
          padding:14px;
          border:0;
          border-radius:15px;
          margin-bottom:10px;
        "
        onclick="createWallet()"
      >
        ✨ Create Wallet
      </button>


      <button
        class="btn secondary"
        style="
          width:100%;
          padding:14px;
          border-radius:15px;
        "
        onclick="showImportWallet()"
      >
        🔐 Import Seed Phrase
      </button>


      <div
        style="
          color:#5f7593;
          font-size:10px;
          line-height:1.6;
          margin-top:18px;
        "
      >
        Your recovery phrase is never
        uploaded to Firebase.
      </div>

    </div>

  `;

}


/* =========================================================
   CREATE WALLET
   ========================================================= */

async function createWallet() {

  try {

    if (
      typeof TonWeb ===
      "undefined"
    ) {

      showToast(
        "TON library not loaded"
      );

      return;

    }


    const utils =
      TonWeb.utils;


    /*
      TONWeb mnemonic generator.
    */

    let mnemonic = null;

    if (
      utils?.mnemonic?.generateMnemonic
    ) {

      mnemonic =
        await utils.mnemonic.generateMnemonic();

    }


    if (!mnemonic) {

      showToast(
        "Wallet generator unavailable"
      );

      return;

    }


    const keyPair =
      await utils.mnemonicToKeyPair(
        mnemonic
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
      await wallet.getAddress();


    const addressString =
      address.toString(
        true,
        true,
        true
      );


    saveWallet({

      address:
        addressString,

      publicKey:
        bytesToHex(
          keyPair.publicKey
        ),

      /*
        Seed phrase is kept ONLY
        in localStorage.

        It is NOT sent to Firebase.
      */
      mnemonic:
        mnemonic,

      createdAt:
        Date.now()

    });


    await saveWalletToFirebase();


    showNewWalletPhrase(
      mnemonic,
      addressString
    );


  } catch (error) {

    console.error(
      "Create wallet error:",
      error
    );

    showToast(
      "Create wallet failed"
    );

  }

}


/* =========================================================
   IMPORT WALLET
   ========================================================= */

function showImportWallet() {

  openModal(
    "Import Wallet",
    `

      <p
        style="
          color:#7187a5;
          font-size:11px;
          line-height:1.6;
        "
      >
        Enter your 24-word recovery phrase.
        It will not be sent to Firebase.
      </p>


      <textarea
        id="seedPhrase"
        class="text-input"
        rows="5"
        placeholder="word1 word2 word3 ..."
        style="
          width:100%;
          resize:none;
          margin-top:10px;
        "
      ></textarea>


      <button
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:13px;
          border-radius:14px;
          margin-top:10px;
        "
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
      "seedPhrase"
    );

  if (!input)
    return;


  const phrase =
    input.value
      .trim()
      .replace(/\s+/g, " ");


  const words =
    phrase.split(" ");


  if (
    words.length !== 24 &&
    words.length !== 12
  ) {

    showToast(
      "Enter a valid seed phrase"
    );

    return;

  }


  try {

    const keyPair =
      await TonWeb.utils
        .mnemonicToKeyPair(
          words
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
      await wallet.getAddress();


    const addressString =
      address.toString(
        true,
        true,
        true
      );


    saveWallet({

      address:
        addressString,

      publicKey:
        bytesToHex(
          keyPair.publicKey
        ),

      mnemonic:
        words,

      importedAt:
        Date.now()

    });


    await saveWalletToFirebase();


    closeModal();

    showToast(
      "Wallet imported ✓"
    );

    renderHome();


  } catch (error) {

    console.error(
      "Import wallet error:",
      error
    );

    showToast(
      "Invalid seed phrase"
    );

  }

}


/* =========================================================
   NEW WALLET PHRASE MODAL
   ========================================================= */

function showNewWalletPhrase(
  mnemonic,
  address
) {

  const words =
    Array.isArray(mnemonic)
      ? mnemonic
      : String(mnemonic)
          .trim()
          .split(/\s+/);


  openModal(
    "Wallet Created",
    `

      <div
        class="security-warning"
      >
        ⚠️ Write down these words.
        Never share your recovery phrase.
      </div>


      <div
        style="
          color:#7187a5;
          font-size:10px;
          margin-bottom:6px;
        "
      >
        WALLET ADDRESS
      </div>


      <div
        style="
          color:#edf5ff;
          font-size:10px;
          word-break:break-all;
          padding:10px;
          border-radius:12px;
          background:rgba(255,255,255,.035);
          margin-bottom:14px;
        "
      >
        ${escapeHtml(address)}
      </div>


      <div
        style="
          color:#7187a5;
          font-size:10px;
          margin-bottom:6px;
        "
      >
        RECOVERY PHRASE
      </div>


      <div
        style="
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:6px;
        "
      >

        ${words.map(
          function(word, index) {

            return `
              <div
                style="
                  padding:8px 5px;
                  border-radius:9px;
                  background:rgba(255,255,255,.035);
                  color:#edf5ff;
                  font-size:10px;
                  text-align:center;
                "
              >
                ${index + 1}.
                ${escapeHtml(word)}
              </div>
            `;

          }
        ).join("")}

      </div>


      <button
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:13px;
          border-radius:14px;
          margin-top:14px;
        "
        onclick="closeModal();renderHome();"
      >
        I Saved My Phrase
      </button>

    `
  );

}


/* =========================================================
   WALLET HELPERS
   ========================================================= */

function bytesToHex(
  bytes
) {

  return Array.from(
    bytes
  )
    .map(
      b =>
        b.toString(16)
          .padStart(2, "0")
    )
    .join("");

}


function shortAddress(
  address
) {

  if (!address)
    return "No wallet";

  if (
    address.length <= 20
  )
    return address;

  return (
    address.slice(0, 9) +
    "..." +
    address.slice(-7)
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
      "Address copied ✓"
    );

  } catch (_) {

    showToast(
      "Copy failed"
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

    renderWelcome();

    return;

  }


  openModal(
    "Deposit TON",
    `

      <p
        style="
          color:#7187a5;
          font-size:11px;
          line-height:1.6;
        "
      >
        Send TON only to this address.
      </p>


      <div
        style="
          margin-top:12px;
          padding:13px;
          border-radius:13px;
          background:rgba(255,255,255,.035);
          color:#edf5ff;
          font-size:10px;
          word-break:break-all;
        "
      >
        ${escapeHtml(
          walletData.address
        )}
      </div>


      <button
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:13px;
          border-radius:14px;
          margin-top:10px;
        "
        onclick="copyAddress();"
      >
        Copy Address
      </button>

    `
  );

}


/* =========================================================
   BALANCE
   ========================================================= */

async function refreshBalance() {

  if (
    !walletData?.address
  )
    return;


  try {

    /*
      Try Worker first.

      Worker needs:
      GET /api/balance?address=...
    */

    const url =
      CONFIG.API_BASE +
      "/api/balance?address=" +
      encodeURIComponent(
        walletData.address
      );


    const response =
      await fetch(
        url
      );


    if (!response.ok)
      throw new Error(
        "Worker balance endpoint unavailable"
      );


    const data =
      await response.json();


    if (
      data.ok &&
      Number.isFinite(
        Number(data.balance)
      )
    ) {

      tonBalance =
        Number(
          data.balance
        );

    } else {

      throw new Error(
        "Invalid balance response"
      );

    }


  } catch (error) {

    console.warn(
      "Balance:",
      error.message
    );

    /*
      Don't fake a balance.
    */

  }


  updateBalanceUI();

}


function updateBalanceUI() {

  const home =
    document.getElementById(
      "homeBalance"
    );

  const asset =
    document.getElementById(
      "assetBalance"
    );


  if (home) {

    home.textContent =
      tonBalance.toFixed(4) +
      " TON";

  }


  if (asset) {

    asset.textContent =
      tonBalance.toFixed(4);

  }

}


/* =========================================================
   SAVE WALLET TO FIREBASE
   ========================================================= */

async function saveWalletToFirebase() {

  if (
    !firebaseReady ||
    !db ||
    !walletData?.address
  )
    return;


  const telegramId =
    getUserId();


  if (!telegramId)
    return;


  try {

    const {
      doc,
      setDoc,
      serverTimestamp
    } =
      await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
      );


    await setDoc(
      doc(
        db,
        "users",
        telegramId
      ),
      {
        telegramUserId:
          telegramId,

        walletAddress:
          walletData.address,

        updatedAt:
          serverTimestamp()
      },
      {
        merge:true
      }
    );


  } catch (error) {

    console.warn(
      "Firebase wallet sync failed:",
      error
    );

  }

}


/* =========================================================
   FIREBASE USER
   ========================================================= */

async function syncUserToFirebase() {

  if (
    !firebaseReady ||
    !db
  )
    return;


  const telegramId =
    getUserId();


  if (!telegramId)
    return;


  try {

    const {
      doc,
      getDoc,
      setDoc,
      serverTimestamp
    } =
      await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
      );


    const ref =
      doc(
        db,
        "users",
        telegramId
      );


    const snap =
      await getDoc(ref);


    const u =
      getTelegramUser()
      || {};


    const referralCode =
      "TGN" +
      telegramId.slice(-6);


    const data = {

      telegramUserId:
        telegramId,

      username:
        u.username || "",

      firstName:
        u.first_name || "",

      lastName:
        u.last_name || "",

      photoUrl:
        u.photo_url || "",

      walletAddress:
        walletData?.address || "",

      referralCode:

        referralCode,

      referredBy:
        tg?.initDataUnsafe
          ?.start_param || "",

      updatedAt:
        serverTimestamp()

    };


    if (!snap.exists()) {

      data.points = 0;

      data.airdropBalance = 0;

      data.referralCount = 0;

      data.createdAt =
        serverTimestamp();

    }


    await setDoc(
      ref,
      data,
      {
        merge:true
      }
    );


    const updated =
      await getDoc(ref);


    userData =
      updated.exists()
        ? updated.data()
        : null;


  } catch (error) {

    console.warn(
      "Firebase user sync failed:",
      error
    );

  }

}


/* =========================================================
   WALLET PAGE
   ========================================================= */

function renderWallet() {

  if (
    !walletData
  ) {

    renderWelcome();

    return;

  }


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <div>

        <h2>
          Wallet
        </h2>

        <div
          style="
            color:#7187a5;
            font-size:11px;
            margin-top:3px;
          "
        >
          TON Mainnet
        </div>

      </div>

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
          color:#7187a5;
          font-size:10px;
        "
      >
        WALLET ADDRESS
      </div>


      <div
        style="
          color:#edf5ff;
          font-size:11px;
          line-height:1.7;
          word-break:break-all;
          margin-top:8px;
        "
      >
        ${escapeHtml(
          walletData.address
        )}
      </div>


      <button
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:12px;
          border-radius:13px;
          margin-top:12px;
        "
        onclick="copyAddress()"
      >
        Copy Address
      </button>

    </div>


    <div
      class="tgn-card"
      style="
        padding:20px;
        margin-bottom:12px;
      "
    >

      <div
        style="
          color:#7187a5;
          font-size:10px;
        "
      >
        BALANCE
      </div>


      <div
        style="
          color:#f5f9ff;
          font-size:34px;
          font-weight:850;
          margin-top:5px;
        "
      >
        ${tonBalance.toFixed(4)}
        TON
      </div>

    </div>


    <button
      class="btn secondary"
      style="
        width:100%;
        padding:13px;
        border-radius:14px;
      "
      onclick="showWalletSecurity()"
    >
      🔐 Wallet Security
    </button>

  `;

}


function showWalletSecurity() {

  openModal(
    "Wallet Security",
    `

      <div
        class="security-warning"
      >
        Never share your recovery phrase
        or private key with anyone.
      </div>


      <p
        style="
          color:#7187a5;
          font-size:11px;
          line-height:1.7;
        "
      >
        TGN Wallet does not send your
        seed phrase to Firebase.
      </p>

    `
  );

}


/* =========================================================
   SEND
   ========================================================= */

function renderSend() {

  if (
    !walletData
  ) {

    renderWelcome();

    return;

  }


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <div>

        <h2>
          Send
        </h2>

        <div
          style="
            color:#7187a5;
            font-size:11px;
            margin-top:3px;
          "
        >
          TON transfer
        </div>

      </div>

    </div>


    <div
      class="tgn-card"
      style="
        padding:18px;
      "
    >

      <label
        style="
          display:block;
          color:#7187a5;
          font-size:10px;
          margin-bottom:7px;
        "
      >
        RECIPIENT ADDRESS
      </label>


      <input
        id="sendAddress"
        class="text-input"
        type="text"
        placeholder="UQ... / EQ..."
        autocomplete="off"
      >


      <label
        style="
          display:block;
          color:#7187a5;
          font-size:10px;
          margin:15px 0 7px;
        "
      >
        AMOUNT
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
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:13px;
          border-radius:14px;
          margin-top:14px;
        "
        onclick="prepareSend()"
      >
        Confirm Send
      </button>


      <div
        style="
          color:#5f7593;
          font-size:10px;
          line-height:1.6;
          margin-top:12px;
        "
      >
        Real blockchain broadcasting should
        be performed by a secure signer or
        TON Connect.
      </div>

    </div>

  `;

}


function prepareSend() {

  const to =
    document.getElementById(
      "sendAddress"
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
      "Enter valid amount"
    );

    return;

  }


  if (
    amount > tonBalance &&
    tonBalance > 0
  ) {

    showToast(
      "Insufficient balance"
    );

    return;

  }


  openModal(
    "Confirm Transfer",
    `

      <div
        style="
          color:#7187a5;
          font-size:10px;
        "
      >
        RECIPIENT
      </div>

      <div
        style="
          color:#edf5ff;
          font-size:11px;
          word-break:break-all;
          margin-top:5px;
        "
      >
        ${escapeHtml(to)}
      </div>


      <div
        style="
          color:#7187a5;
          font-size:10px;
          margin-top:14px;
        "
      >
        AMOUNT
      </div>


      <div
        style="
          color:#edf5ff;
          font-size:25px;
          font-weight:850;
          margin-top:4px;
        "
      >
        ${amount.toFixed(4)}
        TON
      </div>


      <div
        class="security-warning"
        style="margin-top:14px"
      >
        Broadcasting is not performed
        from this public frontend.
      </div>

    `
  );

}


/* =========================================================
   ACTIVITY
   ========================================================= */

function renderActivity() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <div>

        <h2>
          Activity
        </h2>

        <div
          style="
            color:#7187a5;
            font-size:11px;
            margin-top:3px;
          "
        >
          Wallet activity
        </div>

      </div>


      <button
        class="copy-id"
        onclick="loadTransactions()"
      >
        Refresh
      </button>

    </div>


    <div
      id="activityList"
    ></div>

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


  const local =
    getLocalTransactions();


  if (local.length) {

    box.innerHTML =
      local
        .map(
          function (tx) {

            return `

              <div
                class="tgn-card"
                style="
                  padding:15px;
                  margin-bottom:9px;
                  display:flex;
                  gap:12px;
                  align-items:center;
                "
              >

                <div
                  style="
                    width:42px;
                    height:42px;
                    border-radius:14px;
                    background:rgba(42,156,255,.10);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#3ca8ff;
                  "
                >
                  ↗
                </div>


                <div
                  style="
                    flex:1;
                  "
                >

                  <div
                    style="
                      color:#edf5ff;
                      font-size:13px;
                      font-weight:800;
                    "
                  >
                    ${escapeHtml(
                      tx.type ||
                      "Transaction"
                    )}
                  </div>

                  <div
                    style="
                      color:#7187a5;
                      font-size:10px;
                      margin-top:3px;
                    "
                  >
                    ${escapeHtml(
                      tx.date ||
                      ""
                    )}
                  </div>

                </div>


                <div
                  style="
                    color:#edf5ff;
                    font-size:11px;
                    font-weight:800;
                  "
                >
                  ${escapeHtml(
                    tx.amount ||
                    ""
                  )}
                </div>

              </div>

            `;

          }
        )
        .join("");

    return;

  }


  box.innerHTML = `

    <div class="tgn-empty">

      <div class="tgn-empty-icon">
        ◷
      </div>

      <div
        style="
          color:#edf5ff;
          font-size:17px;
          font-weight:800;
        "
      >
        No Activity
      </div>

      <div
        style="
          color:#7187a5;
          font-size:11px;
          margin-top:6px;
        "
      >
        Transactions will appear here.
      </div>

    </div>

  `;

}


function getLocalTransactions() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          CONFIG.TX_STORAGE
        )
      );

    return Array.isArray(data)
      ? data
      : [];

  } catch (_) {

    return [];

  }

}


/* =========================================================
   AIRDROP
   ========================================================= */

async function renderAirdrop() {

  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <div>

        <h2>
          Airdrop
        </h2>

        <div
          style="
            color:#3ca8ff;
            font-size:11px;
            margin-top:3px;
          "
        >
          TGN Rewards
        </div>

      </div>

    </div>


    <div
      class="tgn-card"
      style="
        padding:20px;
        margin-bottom:12px;
      "
    >

      <div
        style="
          color:#7187a5;
          font-size:10px;
        "
      >
        AIRDROP POINTS
      </div>


      <div
        id="airdropPoints"
        style="
          color:#f5f9ff;
          font-size:34px;
          font-weight:850;
          margin-top:4px;
        "
      >
        0
      </div>


      <div
        style="
          color:#7187a5;
          font-size:10px;
          margin-top:4px;
        "
      >
        Complete tasks and invite friends.
      </div>

    </div>


    <div
      class="tgn-card"
      style="
        padding:17px;
        margin-bottom:12px;
      "
    >

      <div
        style="
          color:#edf5ff;
          font-size:14px;
          font-weight:800;
        "
      >
        Invite Friends
      </div>


      <div
        style="
          color:#7187a5;
          font-size:10px;
          line-height:1.6;
          margin-top:5px;
        "
      >
        Invite friends with your referral
        link and earn TGN points.
      </div>


      <button
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:12px;
          border-radius:13px;
          margin-top:12px;
        "
        onclick="shareReferral()"
      >
        👥 Invite Friends
      </button>

    </div>


    <div
      id="airdropTasks"
    ></div>

  `;


  await loadAirdropData();

}


async function loadAirdropData() {

  const points =
    document.getElementById(
      "airdropPoints"
    );

  const tasks =
    document.getElementById(
      "airdropTasks"
    );


  if (
    !firebaseReady ||
    !db
  ) {

    if (points)
      points.textContent = "0";

    if (tasks)
      tasks.innerHTML = `
        <div class="tgn-empty">
          <div class="tgn-empty-icon">
            🎁
          </div>

          <div
            style="
              color:#edf5ff;
              font-size:17px;
              font-weight:800;
            "
          >
            Firebase not ready
          </div>

          <p
            style="
              color:#7187a5;
              font-size:11px;
            "
          >
            Connect Firebase first.
          </p>
        </div>
      `;

    return;

  }


  try {

    const {
      doc,
      getDoc,
      collection,
      getDocs,
      query,
      where
    } =
      await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
      );


    const uid =
      getUserId();


    if (uid) {

      const userSnap =
        await getDoc(
          doc(
            db,
            "users",
            uid
          )
        );


      if (
        userSnap.exists()
      ) {

        const data =
          userSnap.data();

        if (points) {

          points.textContent =
            Number(
              data.points || 0
            ).toLocaleString();

        }

      }

    }


    const q =
      query(
        collection(
          db,
          "airdropTasks"
        ),
        where(
          "active",
          "==",
          true
        )
      );


    const snapshot =
      await getDocs(q);


    const taskList =
      snapshot.docs.map(
        function (docSnap) {

          return {
            id:
              docSnap.id,

            ...docSnap.data()
          };

        }
      );


    window.__TGN_AIRDROP_TASKS =
      Object.fromEntries(
        taskList.map(
          task => [
            task.id,
            task
          ]
        )
      );


    if (
      !taskList.length
    ) {

      if (tasks)
        tasks.innerHTML = `
          <div class="tgn-empty">

            <div class="tgn-empty-icon">
              🎁
            </div>

            <div
              style="
                color:#edf5ff;
                font-size:17px;
                font-weight:800;
              "
            >
              No Airdrop Tasks
            </div>

            <p
              style="
                color:#7187a5;
                font-size:11px;
              "
            >
              Tasks will appear here
              when published.
            </p>

          </div>
        `;

      return;

    }


    if (tasks) {

      tasks.innerHTML =
        taskList
          .map(
            function (task) {

              return `

                <div
                  class="tgn-card"
                  style="
                    padding:15px;
                    margin-bottom:9px;
                  "
                >

                  <div
                    style="
                      display:flex;
                      align-items:center;
                      gap:12px;
                    "
                  >

                    <div
                      style="
                        width:44px;
                        height:44px;
                        border-radius:14px;
                        background:rgba(42,156,255,.10);
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:21px;
                      "
                    >
                      🎁
                    </div>


                    <div
                      style="
                        flex:1;
                      "
                    >

                      <div
                        style="
                          color:#edf5ff;
                          font-size:14px;
                          font-weight:800;
                        "
                      >
                        ${escapeHtml(
                          task.title ||
                          "Airdrop Task"
                        )}
                      </div>


                      <div
                        style="
                          color:#7187a5;
                          font-size:10px;
                          margin-top:4px;
                        "
                      >
                        +${Number(
                          task.reward ||
                          0
                        )}
                        points
                      </div>

                    </div>


                    <button
                      class="tgn-primary"
                      style="
                        padding:9px 12px;
                        border:0;
                        border-radius:11px;
                        font-size:11px;
                      "
                      onclick="
                        claimAirdropTask(
                          '${escapeHtml(task.id)}'
                        )
                      "
                    >
                      Claim
                    </button>

                  </div>


                  <div
                    style="
                      color:#8196b5;
                      font-size:11px;
                      line-height:1.5;
                      margin-top:9px;
                    "
                  >
                    ${escapeHtml(
                      task.description ||
                      ""
                    )}
                  </div>

                </div>

              `;

            }
          )
          .join("");

    }


  } catch (error) {

    console.error(
      "Airdrop error:",
      error
    );


    if (tasks) {

      tasks.innerHTML = `
        <div class="tgn-empty">

          <div class="tgn-empty-icon">
            ⚠️
          </div>

          <div
            style="
              color:#edf5ff;
              font-size:17px;
              font-weight:800;
            "
          >
            Airdrop unavailable
          </div>

          <p
            style="
              color:#7187a5;
              font-size:11px;
            "
          >
            Check Firestore rules.
          </p>

        </div>
      `;

    }

  }

}


/* =========================================================
   CLAIM AIRDROP
   ========================================================= */

async function claimAirdropTask(
  taskId
) {

  const task =
    window.__TGN_AIRDROP_TASKS
      ?.[
        taskId
      ];


  if (!task)
    return;


  const uid =
    getUserId();


  if (!uid) {

    showToast(
      "Open inside Telegram"
    );

    return;

  }


  if (
    !firebaseReady ||
    !db
  ) {

    showToast(
      "Firebase unavailable"
    );

    return;

  }


  try {

    const {
      doc,
      getDoc,
      runTransaction,
      serverTimestamp
    } =
      await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
      );


    const userRef =
      doc(
        db,
        "users",
        uid
      );


    const claimRef =
      doc(
        db,
        "userTasks",
        uid +
        "_" +
        taskId
      );


    const previous =
      await getDoc(
        claimRef
      );


    if (
      previous.exists() &&
      previous.data().completed
    ) {

      showToast(
        "Already claimed"
      );

      return;

    }


    const reward =
      Number(
        task.reward || 0
      );


    if (
      !Number.isFinite(
        reward
      ) ||
      reward <= 0
    ) {

      showToast(
        "Invalid reward"
      );

      return;

    }


    await runTransaction(
      db,
      async function (
        transaction
      ) {

        const userSnap =
          await transaction.get(
            userRef
          );


        const current =
          userSnap.exists()
            ? userSnap.data()
            : {};


        transaction.set(
          userRef,
          {

            points:
              Number(
                current.points ||
                0
              ) +
              reward,

            airdropBalance:
              Number(
                current.airdropBalance ||
                0
              ) +
              reward,

            updatedAt:
              serverTimestamp()

          },
          {
            merge:true
          }
        );


        transaction.set(
          claimRef,
          {

            userId:
              uid,

            taskId:
              taskId,

            reward:
              reward,

            completed:
              true,

            completedAt:
              serverTimestamp()

          },
          {
            merge:true
          }
        );

      }
    );


    showToast(
      "+" +
      reward +
      " points ✓"
    );


    renderAirdrop();


  } catch (error) {

    console.error(
      "Claim error:",
      error
    );

    showToast(
      "Claim failed. Check Firestore rules."
    );

  }

}


/* =========================================================
   REFERRAL
   ========================================================= */

function getReferralCode() {

  const uid =
    getUserId();

  if (!uid)
    return "";

  return (
    "TGN" +
    uid.slice(-6)
  );

}


async function shareReferral() {

  const code =
    getReferralCode();


  if (!code) {

    showToast(
      "Open inside Telegram"
    );

    return;

  }


  /*
    Change YOUR_BOT_USERNAME
    to your actual Telegram bot username.
  */

  const link =
    "https://t.me/TglXWattetBot?start=" +
    encodeURIComponent(
      code
    );


  const text =
    "Join TGN Wallet and earn Airdrop rewards 🎁";


  try {

    if (
      tg &&
      typeof tg.openTelegramLink ===
      "function"
    ) {

      tg.openTelegramLink(
        "https://t.me/share/url?url=" +
        encodeURIComponent(
          link
        ) +
        "&text=" +
        encodeURIComponent(
          text
        )
      );

      return;

    }

  } catch (_) {}


  try {

    await navigator
      .clipboard
      .writeText(
        link
      );

    showToast(
      "Referral link copied ✓"
    );

  } catch (_) {

    showToast(
      link
    );

  }

}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfile() {

  const u =
    getTelegramUser();


  const photo =
    getUserPhoto();


  const initial =
    getUserName()
      .charAt(0)
      .toUpperCase();


  const avatar =
    photo

      ? `
        <img
          src="${escapeHtml(photo)}"
          style="
            width:70px;
            height:70px;
            object-fit:cover;
            border-radius:22px;
            display:block;
          "
          onerror="
            this.style.display='none';
            this.nextElementSibling.style.display='flex';
          "
        >

        <div
          style="
            display:none;
            width:70px;
            height:70px;
            border-radius:22px;
            align-items:center;
            justify-content:center;
            background:linear-gradient(145deg,#299cff,#176de7);
            color:#fff;
            font-size:27px;
            font-weight:800;
          "
        >
          ${escapeHtml(initial)}
        </div>
      `

      : `
        <div
          style="
            width:70px;
            height:70px;
            border-radius:22px;
            display:flex;
            align-items:center;
            justify-content:center;
            background:linear-gradient(145deg,#299cff,#176de7);
            color:#fff;
            font-size:27px;
            font-weight:800;
          "
        >
          ${escapeHtml(initial)}
        </div>
      `;


  document.getElementById(
    "content"
  ).innerHTML = `

    <div class="tgn-page-title">

      <h2>
        Profile
      </h2>

    </div>


    <section class="profile-hero">

      <div class="profile-main">

        <div class="profile-avatar-wrap">

          ${avatar}

          <span
            class="profile-online"
          ></span>

        </div>


        <div>

          <div class="profile-name">
            ${escapeHtml(
              getUserName()
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
              getUserId() ||
              "Unavailable"
            )}
          </div>

        </div>

      </div>


      <div class="profile-stats">

        <div class="profile-stat">

          <div
            class="profile-stat-value"
          >
            Telegram
          </div>

          <div
            class="profile-stat-label"
          >
            Account
          </div>

        </div>


        <div class="profile-stat">

          <div
            class="profile-stat-value"
          >
            TON
          </div>

          <div
            class="profile-stat-label"
          >
            Network
          </div>

        </div>


        <div class="profile-stat">

          <div
            class="profile-stat-value"
          >
            ${walletData ? "✓" : "—"}
          </div>

          <div
            class="profile-stat-label"
          >
            Wallet
          </div>

        </div>

      </div>

    </section>


    <section class="tgn-card profile-menu">

      <button
        class="profile-menu-item"
        onclick="showPersonalInfo()"
      >

        <span class="profile-menu-left">

          <span
            class="profile-menu-icon"
          >
            ♙
          </span>

          <span>

            <div
              class="profile-menu-title"
            >
              Personal Information
            </div>

            <div
              class="profile-menu-sub"
            >
              Name, Telegram ID & account
            </div>

          </span>

        </span>

        <span
          class="profile-menu-arrow"
        >
          ›
        </span>

      </button>


      <button
        class="profile-menu-item"
        onclick="showReferralInfo()"
      >

        <span class="profile-menu-left">

          <span
            class="profile-menu-icon"
          >
            👥
          </span>

          <span>

            <div
              class="profile-menu-title"
            >
              Invite & Referral
            </div>

            <div
              class="profile-menu-sub"
            >
              Invite friends and earn points
            </div>

          </span>

        </span>

        <span
          class="profile-menu-arrow"
        >
          ›
        </span>

      </button>


      <button
        class="profile-menu-item"
        onclick="showWalletSecurity()"
      >

        <span class="profile-menu-left">

          <span
            class="profile-menu-icon"
          >
            ◉
          </span>

          <span>

            <div
              class="profile-menu-title"
            >
              Security
            </div>

            <div
              class="profile-menu-sub"
            >
              Protect your wallet
            </div>

          </span>

        </span>

        <span
          class="profile-menu-arrow"
        >
          ›
        </span>

      </button>


      <button
        class="profile-menu-item"
        onclick="showHelp()"
      >

        <span class="profile-menu-left">

          <span
            class="profile-menu-icon"
          >
            ?
          </span>

          <span>

            <div
              class="profile-menu-title"
            >
              Help & Support
            </div>

            <div
              class="profile-menu-sub"
            >
              TGN Wallet information
            </div>

          </span>

        </span>

        <span
          class="profile-menu-arrow"
        >
          ›
        </span>

      </button>


      <button
        class="profile-menu-item danger"
        onclick="logoutWallet()"
      >

        <span class="profile-menu-left">

          <span
            class="profile-menu-icon"
          >
            ↪
          </span>

          <span>

            <div
              class="profile-menu-title"
            >
              Log Out
            </div>

            <div
              class="profile-menu-sub"
            >
              Remove local wallet
            </div>

          </span>

        </span>

        <span
          class="profile-menu-arrow"
        >
          ›
        </span>

      </button>

    </section>


    <section
      class="tgn-card info-card"
      style="margin-top:13px;"
    >

      <div class="info-row">

        <span class="info-label">
          Name
        </span>

        <span class="info-value">
          ${escapeHtml(
            getUserName()
          )}
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
          Telegram ID
        </span>

        <span class="info-value">
          ${escapeHtml(
            getUserId() ||
            "Unavailable"
          )}
        </span>

      </div>


      <div class="info-row">

        <span class="info-label">
          Wallet
        </span>

        <span class="info-value">
          ${
            walletData
              ? escapeHtml(
                  shortAddress(
                    walletData.address
                  )
                )
              : "Not created"
          }
        </span>

      </div>

    </section>

  `;

}


/* =========================================================
   PROFILE MODALS
   ========================================================= */

function showPersonalInfo() {

  openModal(
    "Personal Information",
    `

      <div class="info-card">

        <div class="info-row">

          <span class="info-label">
            Name
          </span>

          <span class="info-value">
            ${escapeHtml(
              getUserName()
            )}
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
            Telegram ID
          </span>

          <span class="info-value">
            ${escapeHtml(
              getUserId() ||
              "Unavailable"
            )}
          </span>

        </div>

      </div>

    `
  );

}


function showReferralInfo() {

  const code =
    getReferralCode();


  openModal(
    "Invite & Referral",
    `

      <p
        style="
          color:#7187a5;
          font-size:11px;
          line-height:1.6;
        "
      >
        Your referral code:
      </p>


      <div
        style="
          padding:13px;
          border-radius:13px;
          background:rgba(255,255,255,.035);
          color:#3ca8ff;
          text-align:center;
          font-size:18px;
          font-weight:800;
        "
      >
        ${escapeHtml(code)}
      </div>


      <button
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:13px;
          border-radius:14px;
          margin-top:12px;
        "
        onclick="shareReferral()"
      >
        Invite Friends
      </button>

    `
  );

}


function showHelp() {

  openModal(
    "Help & Support",
    `

      <p
        style="
          color:#edf5ff;
          font-size:15px;
          font-weight:800;
        "
      >
        TGN Wallet
      </p>


      <p
        style="
          color:#7187a5;
          font-size:11px;
          line-height:1.7;
        "
      >
        TON wallet interface with
        Airdrop and Referral features.
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

      <p
        style="
          color:#7187a5;
          font-size:11px;
          line-height:1.6;
        "
      >
        This removes the wallet data
        stored locally on this device.
      </p>


      <div
        class="security-warning"
      >
        Make sure your recovery phrase
        is safely backed up before logging out.
      </div>


      <button
        class="tgn-primary"
        style="
          width:100%;
          border:0;
          padding:13px;
          border-radius:14px;
        "
        onclick="
          clearWallet();
          closeModal();
          switchNav('home');
          showToast('Wallet removed');
        "
      >
        Confirm Log Out
      </button>

    `
  );

}


/* =========================================================
   STARTUP
   ========================================================= */

async function boot() {

  initIcons();

  initTonWeb();

  renderHome();


  /*
    Firebase is initialized separately
    so the UI doesn't freeze if Firebase
    has a problem.
  */

  await initFirebase();

  await syncUserToFirebase();


  if (walletData) {

    await saveWalletToFirebase();

    await refreshBalance();

  }

}


boot();
