import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// =========================
// TGN WALLET - APP.JS
// Firebase + Telegram WebApp
// =========================

let tonBalance = 0.00;
let tgnAirdropBalance = 0.00;
let points = 0;
let referrals = 0;
let userWalletAddress = "";
let userStatus = "active";
let telegramUser = null;

const fallbackWalletAddress = "EQBnKobCT_kU4ZC4G89x2_TGN_Wallet_Address";

// -------------------------
// Toast
// -------------------------

function showToast(msg) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText =
      "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);" +
      "background:#0d172e;border:1px solid #2563eb;color:#fff;" +
      "padding:10px 20px;border-radius:20px;font-size:12px;" +
      "z-index:9999;display:none;max-width:85%;text-align:center;";
    document.body.appendChild(toast);
  }

  toast.innerText = msg;
  toast.style.display = "block";

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

// -------------------------
// Helpers
// -------------------------

function getDisplayWalletAddress() {
  return userWalletAddress || fallbackWalletAddress;
}

function getTelegramWebApp() {
  return window.Telegram?.WebApp || null;
}

async function ensureTelegramWebApp() {
  const ready = getTelegramWebApp();

  if (ready) {
    return ready;
  }

  return new Promise((resolve) => {
    const src = "https://telegram.org/js/telegram-web-app.js";

    const existing = document.querySelector(
      `script[src="${src}"]`
    );

    if (existing) {
      existing.addEventListener(
        "load",
        () => resolve(getTelegramWebApp()),
        { once: true }
      );

      setTimeout(() => {
        resolve(getTelegramWebApp());
      }, 1500);

      return;
    }

    const script = document.createElement("script");

    script.src = src;
    script.async = true;

    script.onload = () => {
      resolve(getTelegramWebApp());
    };

    script.onerror = () => {
      resolve(null);
    };

    document.head.appendChild(script);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeJs(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ");
}

// -------------------------
// Firebase user
// -------------------------

function applyUserData(data) {
  tonBalance = Number(data?.tonBalance ?? 0);
  tgnAirdropBalance = Number(data?.tgnBalance ?? 0);
  points = Number(data?.points ?? 0);
  referrals = Number(data?.referrals ?? 0);

  userWalletAddress = data?.walletAddress || "";
  userStatus = data?.status || "active";
}

async function loadFirebaseUser() {
  telegramUser = getTelegramWebApp()?.initDataUnsafe?.user || null;

  // Opened outside Telegram
  if (!telegramUser) {
    return;
  }

  const userId = String(telegramUser.id);

  const userRef = doc(
    db,
    "users",
    userId
  );

  try {
    const snapshot = await getDoc(userRef);

    // New Telegram user
    if (!snapshot.exists()) {

      const newUser = {
        telegramId: userId,
        username: telegramUser.username || "",

        walletAddress: "",

        tonBalance: 0,
        tgnBalance: 0,

        points: 0,
        referrals: 0,

        status: "active",

        createdAt: new Date().toISOString()
      };

      await setDoc(
        userRef,
        newUser
      );

      applyUserData(newUser);

    } else {

      const data = snapshot.data() || {};

      // Update Telegram username/id only
      await setDoc(
        userRef,
        {
          telegramId: userId,
          username:
            telegramUser.username ||
            data.username ||
            ""
        },
        {
          merge: true
        }
      );

      applyUserData(data);
    }

  } catch (error) {

    console.error(
      "Firebase user error:",
      error
    );

    showToast(
      "Firebase connection failed"
    );
  }
}

// -------------------------
// Tabs
// -------------------------

function switchTab(tabName, element) {

  document
    .querySelectorAll(".nav-item")
    .forEach((item) => {
      item.classList.remove("active");
    });

  if (element) {
    element.classList.add("active");
  }

  const contentArea =
    document.getElementById("main-content");

  if (!contentArea) {
    return;
  }

  // =========================
  // HOME
  // =========================

  if (tabName === "home") {

    contentArea.innerHTML = `

      <div
        style="
          background:linear-gradient(
            135deg,
            #10192d 0%,
            #0a0f1d 100%
          );
          border:1px solid rgba(59,130,246,.25);
          border-radius:20px;
          padding:20px;
          margin-bottom:14px;
          color:#fff;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            color:#94a3b8;
            font-size:13px;
            font-weight:600;
          "
        >

          <span>My Wallet</span>

          <i
            class="fa-solid fa-gem"
            style="color:#3b82f6;"
          ></i>

        </div>

        <div
          style="
            font-size:28px;
            font-weight:800;
            color:#fff;
            margin-top:6px;
          "
        >
          ${tonBalance.toFixed(2)} TON
        </div>

        <div
          style="
            font-size:12px;
            color:#64748b;
            margin-bottom:16px;
          "
        >
          ≈ $${(tonBalance * 5.5).toFixed(2)} USD
        </div>

        <div
          style="
            display:flex;
            gap:10px;
          "
        >

          <button
            style="
              flex:1;
              background:#2563eb;
              color:#fff;
              border:none;
              padding:12px;
              border-radius:12px;
              font-weight:600;
              font-size:13px;
              cursor:pointer;
            "
            onclick="openDepositModal()"
          >
            <i class="fa-solid fa-arrow-down"></i>
            Deposit
          </button>

          <button
            style="
              flex:1;
              background:rgba(255,255,255,.05);
              color:#fff;
              border:1px solid rgba(255,255,255,.1);
              padding:12px;
              border-radius:12px;
              font-weight:600;
              font-size:13px;
              cursor:pointer;
            "
            onclick="
              switchTab(
                'send',
                document.querySelectorAll('.nav-item')[2]
              )
            "
          >
            <i class="fa-solid fa-arrow-up"></i>
            Withdraw
          </button>

        </div>

      </div>


      <div
        style="
          background:#0d1322;
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;
          padding:16px;
          margin-bottom:14px;
          color:#fff;
        "
      >

        <div
          style="
            font-size:11px;
            color:#64748b;
            margin-bottom:6px;
          "
        >
          Wallet Address
        </div>

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
          "
        >

          <span
            style="
              font-size:12px;
              color:#38bdf8;
              word-break:break-all;
            "
          >
            ${escapeHtml(
              getDisplayWalletAddress()
            )}
          </span>

          <button
            style="
              background:rgba(255,255,255,.08);
              color:#fff;
              border:1px solid rgba(255,255,255,.1);
              padding:5px 12px;
              border-radius:8px;
              font-size:11px;
              cursor:pointer;
              margin-left:8px;
            "
            onclick="copyAddress()"
          >
            Copy
          </button>

        </div>

      </div>


      <div
        style="
          background:#0d1322;
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;
          padding:16px;
          color:#fff;
        "
      >

        <div
          style="
            font-size:13px;
            font-weight:700;
            margin-bottom:14px;
            color:#f8fafc;
          "
        >
          Tokens
        </div>

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
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
                width:36px;
                height:36px;
                background:rgba(59,130,246,.2);
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                color:#3b82f6;
              "
            >
              <i class="fa-solid fa-gem"></i>
            </div>

            <div>

              <div
                style="
                  font-size:13px;
                  font-weight:700;
                  color:#fff;
                "
              >
                TON
              </div>

              <div
                style="
                  font-size:11px;
                  color:#64748b;
                "
              >
                Toncoin
              </div>

            </div>

          </div>

          <div
            style="text-align:right;"
          >

            <div
              style="
                font-size:13px;
                font-weight:700;
                color:#fff;
              "
            >
              ${tonBalance.toFixed(2)} TON
            </div>

            <div
              style="
                font-size:11px;
                color:#64748b;
              "
            >
              $${(tonBalance * 5.5).toFixed(2)}
            </div>

          </div>

        </div>

      </div>

    `;
  }

  // =========================
  // ACTIVITY
  // =========================

  else if (tabName === "activity") {

    contentArea.innerHTML = `

      <h2
        style="
          font-size:20px;
          font-weight:700;
          margin-bottom:16px;
          color:#fff;
        "
      >
        Activity
      </h2>

      <div
        style="
          background:#0d1322;
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;
          padding:30px 20px;
          text-align:center;
        "
      >

        <i
          class="fa-solid fa-clock-rotate-left"
          style="
            font-size:32px;
            color:#334155;
            margin-bottom:12px;
          "
        ></i>

        <p
          style="
            color:#64748b;
            font-size:13px;
          "
        >
          No recent activities.
        </p>

      </div>

    `;
  }

  // =========================
  // SEND
  // =========================

  else if (tabName === "send") {

    contentArea.innerHTML = `

      <h2
        style="
          font-size:20px;
          font-weight:700;
          margin-bottom:16px;
          color:#fff;
        "
      >
        Send TON
      </h2>

      <div
        style="
          background:#0d1322;
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;
          padding:16px;
          color:#fff;
        "
      >

        <div
          style="
            margin-bottom:14px;
          "
        >

          <label
            style="
              font-size:12px;
              color:#94a3b8;
              display:block;
              margin-bottom:6px;
            "
          >
            Recipient Address
          </label>

          <input
            id="recipient-address"
            type="text"
            placeholder="UQ... or EQ..."
            style="
              width:100%;
              background:#060911;
              border:1px solid rgba(255,255,255,.1);
              padding:12px;
              border-radius:12px;
              color:#fff;
              font-size:13px;
              outline:none;
            "
          >

        </div>


        <div
          style="
            margin-bottom:18px;
          "
        >

          <label
            style="
              font-size:12px;
              color:#94a3b8;
              display:block;
              margin-bottom:6px;
            "
          >
            Amount (TON)
          </label>

          <input
            id="send-amount"
            type="number"
            min="0"
            step="0.000000001"
            placeholder="0.00"
            style="
              width:100%;
              background:#060911;
              border:1px solid rgba(255,255,255,.1);
              padding:12px;
              border-radius:12px;
              color:#fff;
              font-size:13px;
              outline:none;
            "
          >

        </div>


        <button
          style="
            width:100%;
            background:#2563eb;
            color:#fff;
            border:none;
            padding:12px;
            border-radius:12px;
            font-weight:600;
            font-size:13px;
            cursor:pointer;
          "
          onclick="confirmWithdrawal()"
        >
          Confirm Withdrawal
        </button>

      </div>

    `;
  }

  // =========================
  // WALLET
  // =========================

  else if (tabName === "wallet") {

    contentArea.innerHTML = `

      <h2
        style="
          font-size:20px;
          font-weight:700;
          margin-bottom:16px;
          color:#fff;
        "
      >
        Wallet Details
      </h2>

      <div
        style="
          background:#0d1322;
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;
          padding:16px;
          color:#fff;
        "
      >

        <div
          style="
            font-size:12px;
            color:#64748b;
          "
        >
          TON Network Address
        </div>

        <div
          style="
            font-size:12px;
            font-weight:600;
            color:#38bdf8;
            margin:10px 0 14px;
            word-break:break-all;
          "
        >
          ${escapeHtml(
            getDisplayWalletAddress()
          )}
        </div>

        <button
          style="
            width:100%;
            background:#2563eb;
            color:#fff;
            border:none;
            padding:12px;
            border-radius:12px;
            font-weight:600;
            font-size:13px;
            cursor:pointer;
          "
          onclick="copyAddress()"
        >
          <i class="fa-regular fa-copy"></i>
          Copy Address
        </button>

      </div>

    `;
  }

  // =========================
  // AIRDROP
  // =========================

  else if (tabName === "airdrop") {

    contentArea.innerHTML = `

      <div
        style="
          background:linear-gradient(
            135deg,
            #0d1222 0%,
            #080c18 100%
          );
          border:1px solid rgba(139,92,246,.25);
          border-radius:20px;
          padding:20px;
          margin-bottom:16px;
          color:#fff;
        "
      >

        <div
          style="
            display:flex;
            gap:12px;
            margin-bottom:16px;
          "
        >

          <i
            class="fa-solid fa-gift"
            style="
              font-size:24px;
              color:#ef4444;
            "
          ></i>

          <div>

            <div
              style="
                font-size:18px;
                font-weight:700;
                color:#fff;
              "
            >
              Airdrop Rewards
            </div>

            <div
              style="
                font-size:12px;
                color:#64748b;
              "
            >
              Your earned token balance
            </div>

          </div>

        </div>


        <div
          style="
            background:#060911;
            border:1px solid rgba(139,92,246,.2);
            border-radius:16px;
            padding:16px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:14px;
          "
        >

          <div>

            <span
              style="
                font-size:11px;
                color:#64748b;
              "
            >
              Total Rewards
            </span>

            <div
              style="
                font-size:22px;
                font-weight:800;
                color:#fff;
              "
            >
              ${tgnAirdropBalance.toFixed(2)} TGN
            </div>

          </div>

          <div
            style="
              background:rgba(139,92,246,.2);
              color:#c084fc;
              padding:4px 12px;
              border-radius:12px;
              font-size:12px;
              font-weight:700;
            "
          >
            TGN
          </div>

        </div>


        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr 1fr;
            gap:8px;
            background:#060911;
            padding:12px;
            border-radius:12px;
            text-align:center;
          "
        >

          <div>
            <span
              style="
                font-size:10px;
                color:#64748b;
                display:block;
              "
            >
              Claimed
            </span>

            <span
              style="
                font-size:13px;
                font-weight:700;
                color:#fff;
              "
            >
              0 / 8
            </span>
          </div>


          <div>
            <span
              style="
                font-size:10px;
                color:#64748b;
                display:block;
              "
            >
              Your Points
            </span>

            <span
              style="
                font-size:13px;
                font-weight:700;
                color:#fff;
              "
            >
              ${points}
            </span>
          </div>


          <div>
            <span
              style="
                font-size:10px;
                color:#64748b;
                display:block;
              "
            >
              Referrals
            </span>

            <span
              style="
                font-size:13px;
                font-weight:700;
                color:#fff;
              "
            >
              ${referrals}
            </span>
          </div>

        </div>

      </div>

    `;
  }

  // =========================
  // PROFILE
  // =========================

  else if (tabName === "profile") {

    const name =
      telegramUser?.first_name ||
      "Otter User";

    const username =
      telegramUser?.username
        ? `@${telegramUser.username}`
        : "@otter_user";

    contentArea.innerHTML = `

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:16px;
        "
      >

        <div>

          <h2
            style="
              font-size:20px;
              font-weight:700;
              color:#fff;
            "
          >
            Profile
          </h2>

          <div
            style="
              font-size:11px;
              color:#64748b;
            "
          >
            Manage your account and preferences
          </div>

        </div>

        <i
          class="fa-solid fa-gem"
          style="
            font-size:24px;
            color:#3b82f6;
          "
        ></i>

      </div>


      <div
        style="
          background:linear-gradient(
            135deg,
            #0d172e 0%,
            #090e1a 100%
          );
          border:1px solid rgba(59,130,246,.25);
          border-radius:20px;
          padding:18px;
          margin-bottom:16px;
          color:#fff;
        "
      >

        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            margin-bottom:16px;
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
                width:52px;
                height:52px;
                background:#2563eb;
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                font-size:20px;
                color:#fff;
              "
            >
              <i class="fa-solid fa-user"></i>
            </div>


            <div>

              <div
                style="
                  font-size:15px;
                  font-weight:700;
                  color:#fff;
                  display:flex;
                  align-items:center;
                  gap:6px;
                "
              >
                ${escapeHtml(name)}
                <i
                  class="fa-solid fa-pen"
                  style="
                    font-size:10px;
                    color:#64748b;
                  "
                ></i>
              </div>


              <div
                style="
                  font-size:11px;
                  color:#38bdf8;
                "
              >
                ${escapeHtml(username)}
              </div>


              <div
                style="
                  display:inline-block;
                  background:rgba(34,197,94,.15);
                  color:#22c55e;
                  font-size:10px;
                  font-weight:600;
                  padding:2px 8px;
                  border-radius:10px;
                  margin-top:4px;
                "
              >
                <i class="fa-solid fa-circle-check"></i>
                ${escapeHtml(userStatus)}
              </div>

            </div>

          </div>

          <i
            class="fa-solid fa-chevron-right"
            style="
              color:#475569;
              font-size:12px;
            "
          ></i>

        </div>


        <div
          style="
            display:grid;
            grid-template-columns:1fr 1fr 1fr;
            gap:8px;
            background:#060911;
            padding:12px;
            border-radius:12px;
            text-align:center;
          "
        >

          <div>

            <span
              style="
                font-size:10px;
                color:#64748b;
                display:block;
              "
            >
              Wallet ID
            </span>

            <span
              style="
                font-size:11px;
                font-weight:700;
                color:#fff;
              "
            >
              ${
                telegramUser
                  ? "#" + telegramUser.id
                  : "#TGN100245"
              }
            </span>

          </div>


          <div>

            <span
              style="
                font-size:10px;
                color:#64748b;
                display:block;
              "
            >
              Member Since
            </span>

            <span
              style="
                font-size:11px;
                font-weight:700;
                color:#fff;
              "
            >
              Today
            </span>

          </div>


          <div>

            <span
              style="
                font-size:10px;
                color:#64748b;
                display:block;
              "
            >
              Account Status
            </span>

            <span
              style="
                font-size:11px;
                font-weight:700;
                color:#22c55e;
              "
            >
              Active
            </span>

          </div>

        </div>

      </div>


      <div
        style="
          display:flex;
          flex-direction:column;
          gap:8px;
          margin-bottom:20px;
        "
      >

        ${renderMenuItem(
          "fa-user",
          "Personal Information",
          "Update your name, username and avatar"
        )}

        ${renderMenuItem(
          "fa-shield-halved",
          "Security",
          "Password, 2FA and security settings"
        )}

        ${renderMenuItem(
          "fa-bell",
          "Notifications",
          "Manage your notification preferences"
        )}

        ${renderMenuItem(
          "fa-credit-card",
          "Payment Methods",
          "Manage saved addresses and methods"
        )}

        ${renderMenuItem(
          "fa-globe",
          "Language",
          "Select your preferred language"
        )}

        ${renderMenuItem(
          "fa-circle-question",
          "Help & Support",
          "FAQs, support tickets and guides"
        )}

        ${renderMenuItem(
          "fa-circle-info",
          "About TGNWallet",
          "App info, terms and privacy policy"
        )}


        <div
          style="
            background:#0d1322;
            border:1px solid rgba(239,68,68,.25);
            border-radius:14px;
            padding:12px 14px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            cursor:pointer;
          "
          onclick="showToast('Logging Out...')"
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
                width:36px;
                height:36px;
                background:rgba(239,68,68,.15);
                border-radius:10px;
                display:flex;
                justify-content:center;
                align-items:center;
                color:#ef4444;
                font-size:15px;
              "
            >
              <i class="fa-solid fa-right-from-bracket"></i>
            </div>

            <div>

              <div
                style="
                  font-size:13px;
                  font-weight:700;
                  color:#ef4444;
                "
              >
                Log Out
              </div>

              <div
                style="
                  font-size:10px;
                  color:#94a3b8;
                "
              >
                Sign out from your account
              </div>

            </div>

          </div>

          <i
            class="fa-solid fa-chevron-right"
            style="
              color:#ef4444;
              font-size:12px;
            "
          ></i>

        </div>

      </div>

    `;
  }
}

// -------------------------
// Profile menu
// -------------------------

function renderMenuItem(
  icon,
  title,
  desc
) {

  return `

    <div
      style="
        background:#0d1322;
        border:1px solid rgba(255,255,255,.06);
        border-radius:14px;
        padding:12px 14px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        cursor:pointer;
      "
      onclick="
        showToast('${escapeJs(title)}')
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
            width:36px;
            height:36px;
            background:rgba(59,130,246,.1);
            border-radius:10px;
            display:flex;
            justify-content:center;
            align-items:center;
            color:#3b82f6;
            font-size:15px;
          "
        >
          <i class="fa-solid ${icon}"></i>
        </div>

        <div>

          <div
            style="
              font-size:13px;
              font-weight:600;
              color:#f8fafc;
            "
          >
            ${escapeHtml(title)}
          </div>

          <div
            style="
              font-size:10px;
              color:#64748b;
            "
          >
            ${escapeHtml(desc)}
          </div>

        </div>

      </div>

      <i
        class="fa-solid fa-chevron-right"
        style="
          color:#475569;
          font-size:12px;
        "
      ></i>

    </div>

  `;
}

// -------------------------
// Deposit
// -------------------------

function openDepositModal() {

  const address =
    getDisplayWalletAddress();

  const qrCodeUrl =
    `https://quickchart.io/qr?text=${
      encodeURIComponent(
        `ton://transfer/${address}`
      )
    }&size=180`;

  const tonkeeperUrl =
    `https://app.tonkeeper.com/transfer/${
      encodeURIComponent(address)
    }`;

  let modal =
    document.getElementById(
      "deposit-modal"
    );

  if (!modal) {

    modal =
      document.createElement("div");

    modal.id =
      "deposit-modal";

    modal.style.cssText =
      "position:fixed;top:0;left:0;" +
      "width:100%;height:100%;" +
      "background:rgba(0,0,0,.85);" +
      "display:flex;" +
      "justify-content:center;" +
      "align-items:flex-end;" +
      "z-index:1000;";

    document
      .querySelector(".app-container")
      ?.appendChild(modal);
  }

  modal.innerHTML = `

    <div
      style="
        background:#0d121f;
        border-top:1px solid rgba(255,255,255,.1);
        border-radius:24px 24px 0 0;
        width:100%;
        padding:20px;
        color:#fff;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:16px;
        "
      >

        <div
          style="
            font-size:15px;
            font-weight:700;
            color:#fff;
          "
        >
          Deposit TON
        </div>

        <i
          class="fa-solid fa-xmark"
          style="
            font-size:18px;
            color:#64748b;
            cursor:pointer;
          "
          onclick="closeModal()"
        ></i>

      </div>


      <div
        style="
          text-align:center;
        "
      >

        <p
          style="
            font-size:11px;
            color:#94a3b8;
            margin-bottom:14px;
          "
        >
          Send TON to the deposit address below from Tonkeeper or Exchange
        </p>


        <div
          style="
            background:#fff;
            padding:8px;
            border-radius:12px;
            display:inline-block;
            margin-bottom:14px;
          "
        >

          <img
            src="${qrCodeUrl}"
            alt="Deposit QR"
            style="
              width:150px;
              height:150px;
              display:block;
            "
          >

        </div>


        <div
          style="
            background:#060911;
            border:1px solid rgba(59,130,246,.3);
            border-radius:10px;
            padding:10px;
            font-size:11px;
            color:#38bdf8;
            word-break:break-all;
            margin-bottom:14px;
          "
        >
          ${escapeHtml(address)}
        </div>


        <div
          style="
            display:flex;
            flex-direction:column;
            gap:8px;
          "
        >

          <button
            style="
              width:100%;
              background:#2563eb;
              color:#fff;
              border:none;
              padding:12px;
              border-radius:12px;
              font-weight:600;
              font-size:13px;
              cursor:pointer;
            "
            onclick="copyAddress()"
          >
            <i class="fa-regular fa-copy"></i>
            Copy Address
          </button>


          <a
            href="${tonkeeperUrl}"
            target="_blank"
            style="text-decoration:none;"
          >

            <button
              style="
                width:100%;
                background:rgba(255,255,255,.05);
                color:#fff;
                border:1px solid rgba(255,255,255,.1);
                padding:12px;
                border-radius:12px;
                font-weight:600;
                font-size:13px;
                cursor:pointer;
              "
            >
              <i class="fa-solid fa-wallet"></i>
              Pay via Tonkeeper
            </button>

          </a>

        </div>

      </div>

    </div>

  `;
}

// -------------------------
// Copy
// -------------------------

async function copyAddress() {

  try {

    await navigator.clipboard.writeText(
      getDisplayWalletAddress()
    );

    showToast(
      "Address Copied!"
    );

  } catch (error) {

    console.error(
      "Copy error:",
      error
    );

    showToast(
      "Copy failed"
    );
  }
}

// -------------------------
// Close modal
// -------------------------

function closeModal() {

  document
    .getElementById(
      "deposit-modal"
    )
    ?.remove();
}

// -------------------------
// Withdraw validation
// -------------------------

function confirmWithdrawal() {

  const recipient =
    document
      .getElementById(
        "recipient-address"
      )
      ?.value
      .trim();

  const amount =
    Number(
      document
        .getElementById(
          "send-amount"
        )
        ?.value
    );

  if (!recipient) {

    showToast(
      "Enter recipient address"
    );

    return;
  }

  if (!amount || amount <= 0) {

    showToast(
      "Enter a valid amount"
    );

    return;
  }

  if (amount > tonBalance) {

    showToast(
      "Insufficient Balance"
    );

    return;
  }

  // Real TON signing/transfer
  // will be added later.

  showToast(
    "Withdrawal ready for wallet signing"
  );
}

// -------------------------
// Global functions
// -------------------------

window.showToast =
  showToast;

window.switchTab =
  switchTab;

window.openDepositModal =
  openDepositModal;

window.copyAddress =
  copyAddress;

window.closeModal =
  closeModal;

window.confirmWithdrawal =
  confirmWithdrawal;

// -------------------------
// Startup
// -------------------------

async function startApp() {

  try {

    const tg =
      await ensureTelegramWebApp();

    if (tg) {

      tg.ready();

      tg.expand();

      telegramUser =
        tg.initDataUnsafe?.user ||
        null;
    }

    await loadFirebaseUser();

    switchTab(
      "home",
      document.querySelector(
        ".nav-item"
      )
    );

  } catch (error) {

    console.error(
      "App startup error:",
      error
    );

    switchTab(
      "home",
      document.querySelector(
        ".nav-item"
      )
    );

    showToast(
      "App loaded with limited data"
    );
  }
}

document.addEventListener(
  "DOMContentLoaded",
  startApp
);
