/* =========================================================
   TGN TON WALLET
   PROFESSIONAL TELEGRAM PROFILE VERSION
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const API_KEY = "c09170dd62724a03f3803b0f1023219c672c0fcc02a2deed31bd75faea36e9e1";

let tonweb = null;

let walletData = JSON.parse(
    localStorage.getItem("TGN_TON_WALLET")
);

let activeTab = "home";


/* =========================================================
   TELEGRAM
   ========================================================= */

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#07101f");
        tg.setBackgroundColor("#050a16");
    } catch (e) {}
}


/* =========================================================
   TELEGRAM USER
   ========================================================= */

function getTelegramUser() {

    return tg?.initDataUnsafe?.user || null;

}


function getUserFullName() {

    const user = getTelegramUser();

    if (!user) {
        return "Telegram User";
    }

    return [
        user.first_name,
        user.last_name
    ]
        .filter(Boolean)
        .join(" ") || "Telegram User";

}


function getUsername() {

    const user = getTelegramUser();

    if (!user?.username) {
        return "No username";
    }

    return "@" + user.username;

}


function getUserId() {

    const user = getTelegramUser();

    return user?.id
        ? String(user.id)
        : "Unavailable";

}


function getUserPhoto() {

    const user = getTelegramUser();

    return user?.photo_url || "";

}


/* =========================================================
   TELEGRAM PROFILE PHOTO
   ========================================================= */

function createTelegramAvatar(size = 64) {

    const user = getTelegramUser();

    const photo =
        getUserPhoto();

    const name =
        getUserFullName();

    const initial =
        name
            .trim()
            .charAt(0)
            .toUpperCase() || "T";


    if (photo) {

        return `
            <img
                src="${escapeHtml(photo)}"
                alt="Telegram Profile"
                style="
                    width:${size}px;
                    height:${size}px;
                    border-radius:22px;
                    object-fit:cover;
                    display:block;
                    border:2px solid rgba(255,255,255,.12);
                "
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                style="
                    display:none;
                    width:${size}px;
                    height:${size}px;
                    border-radius:22px;
                    align-items:center;
                    justify-content:center;
                    background:linear-gradient(145deg,#299cff,#176de7);
                    color:white;
                    font-size:${Math.round(size * .38)}px;
                    font-weight:800;
                "
            >
                ${escapeHtml(initial)}
            </div>
        `;

    }


    return `
        <div
            style="
                width:${size}px;
                height:${size}px;
                border-radius:22px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:linear-gradient(145deg,#299cff,#176de7);
                color:white;
                font-size:${Math.round(size * .38)}px;
                font-weight:800;
            "
        >
            ${escapeHtml(initial)}
        </div>
    `;

}


/* =========================================================
   STYLES
   ========================================================= */

(function injectTGNStyles() {

    if (document.getElementById("tgn-professional-style")) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "tgn-professional-style";


    style.textContent = `

    /* =====================================================
       GENERAL
       ===================================================== */

    #content {
        width:100%;
        max-width:720px;
        margin:0 auto;
        padding:10px 0 120px;
    }


    /* =====================================================
       PAGE HEADER
       ===================================================== */

    .tgn-page-title {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin:6px 4px 16px;
    }

    .tgn-page-title h2 {
        margin:0;
        color:#f5f9ff;
        font-size:23px;
        font-weight:800;
        letter-spacing:-.5px;
    }


    /* =====================================================
       PROFESSIONAL CARD
       ===================================================== */

    .tgn-card {
        background:
            linear-gradient(
                145deg,
                rgba(18,34,58,.96),
                rgba(7,17,32,.98)
            );

        border:
            1px solid rgba(100,155,220,.13);

        border-radius:22px;

        box-shadow:
            0 15px 40px rgba(0,0,0,.18);
    }


    /* =====================================================
       REMOVE OLD QUICK ACTIONS
       ===================================================== */

    .old-quick-actions,
    .quick-actions,
    .home-quick-actions {
        display:none !important;
    }


    /* =====================================================
       PROFILE HERO
       ===================================================== */

    .profile-hero {
        position:relative;
        overflow:hidden;

        padding:22px;

        margin-bottom:13px;

        background:
            radial-gradient(
                circle at 90% 10%,
                rgba(42,150,255,.18),
                transparent 40%
            ),
            linear-gradient(
                145deg,
                #10243e,
                #071224
            );

        border:
            1px solid rgba(70,150,255,.18);

        border-radius:24px;

        box-shadow:
            0 15px 45px rgba(0,0,0,.22);
    }

    .profile-hero::after {
        content:"";

        position:absolute;

        width:150px;
        height:150px;

        right:-60px;
        top:-70px;

        border-radius:50%;

        background:
            rgba(42,150,255,.08);

        filter:blur(5px);
    }

    .profile-main {
        position:relative;
        z-index:2;

        display:flex;
        align-items:center;

        gap:15px;
    }

    .profile-avatar-wrap {
        position:relative;

        width:72px;
        height:72px;

        flex:0 0 72px;

        display:flex;
        align-items:center;
        justify-content:center;

        border-radius:25px;

        background:
            linear-gradient(
                145deg,
                rgba(42,156,255,.22),
                rgba(42,156,255,.04)
            );

        border:
            1px solid rgba(70,160,255,.22);

        box-shadow:
            0 8px 28px rgba(0,0,0,.18);
    }

    .profile-online {
        position:absolute;

        width:12px;
        height:12px;

        right:-2px;
        bottom:0;

        border-radius:50%;

        background:#22c58b;

        border:3px solid #0b182b;

        z-index:4;
    }

    .profile-name {
        color:#f5f9ff;

        font-size:21px;

        font-weight:850;

        line-height:1.2;
    }

    .profile-username {
        margin-top:5px;

        color:#3ca8ff;

        font-size:13px;

        font-weight:700;
    }

    .profile-id {
        margin-top:5px;

        color:#7188a7;

        font-size:11px;
    }


    /* =====================================================
       PROFILE STATS
       ===================================================== */

    .profile-stats {
        position:relative;
        z-index:2;

        display:grid;

        grid-template-columns:
            repeat(3,1fr);

        gap:8px;

        margin-top:19px;
    }

    .profile-stat {
        padding:12px 9px;

        text-align:center;

        border-radius:15px;

        background:
            rgba(255,255,255,.035);

        border:
            1px solid
            rgba(110,160,220,.08);
    }

    .profile-stat-value {
        color:#edf6ff;

        font-size:13px;

        font-weight:800;
    }

    .profile-stat-label {
        margin-top:4px;

        color:#7086a4;

        font-size:10px;
    }


    /* =====================================================
       PROFILE MENU
       ===================================================== */

    .profile-menu {
        overflow:hidden;

        margin-top:13px;
    }

    .profile-menu-item {
        width:100%;

        display:flex;

        align-items:center;

        justify-content:space-between;

        padding:15px 17px;

        background:transparent;

        border:0;

        border-bottom:
            1px solid
            rgba(110,160,220,.08);

        color:#f2f7ff;

        text-align:left;

        cursor:pointer;

        transition:
            background .18s ease,
            transform .18s ease;
    }

    .profile-menu-item:last-child {
        border-bottom:0;
    }

    .profile-menu-item:active {
        transform:scale(.985);

        background:
            rgba(42,156,255,.07);
    }

    .profile-menu-left {
        display:flex;

        align-items:center;

        gap:13px;

        min-width:0;
    }

    .profile-menu-icon {
        width:43px;
        height:43px;

        flex:0 0 43px;

        display:flex;

        align-items:center;
        justify-content:center;

        border-radius:14px;

        color:#3da9ff;

        background:
            linear-gradient(
                145deg,
                rgba(42,156,255,.13),
                rgba(42,156,255,.04)
            );

        border:
            1px solid
            rgba(42,156,255,.09);

        font-size:18px;
    }

    .profile-menu-title {
        color:#edf5ff;

        font-size:14px;

        font-weight:800;
    }

    .profile-menu-sub {
        margin-top:3px;

        color:#7187a5;

        font-size:10px;
    }

    .profile-menu-arrow {
        color:#5d7695;

        font-size:22px;

        padding-left:8px;
    }


    /* =====================================================
       INFO CARD
       ===================================================== */

    .info-card {
        padding:5px 17px;

        overflow:hidden;
    }

    .info-row {
        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:12px;

        padding:14px 0;

        border-bottom:
            1px solid
            rgba(110,160,220,.08);
    }

    .info-row:last-child {
        border-bottom:0;
    }

    .info-label {
        color:#748aa7;

        font-size:11px;
    }

    .info-value {
        color:#edf5ff;

        font-size:12px;

        font-weight:700;

        text-align:right;

        word-break:break-all;
    }

    .copy-id {
        border:0;

        padding:6px 9px;

        margin-left:6px;

        border-radius:9px;

        background:
            rgba(42,156,255,.10);

        color:#3ca8ff;

        font-size:10px;

        font-weight:700;

        cursor:pointer;
    }


    /* =====================================================
       SECURITY
       ===================================================== */

    .security-warning {
        padding:14px;

        margin-bottom:13px;

        border-radius:15px;

        background:
            rgba(239,68,68,.07);

        border:
            1px solid
            rgba(239,68,68,.13);

        color:#ff9ba0;

        font-size:11px;

        line-height:1.6;
    }


    /* =====================================================
       MODAL
       ===================================================== */

    .tgn-modal-box {
        background:
            linear-gradient(
                145deg,
                #102039,
                #071224
            );

        border:
            1px solid
            rgba(80,150,230,.18);

        border-radius:22px;

        padding:20px;

        width:
            min(92vw,420px);

        box-shadow:
            0 25px 70px rgba(0,0,0,.45);
    }


    /* =====================================================
       EMPTY ACTIVITY
       ===================================================== */

    .tgn-empty {
        padding:45px 20px;

        text-align:center;

        background:
            linear-gradient(
                145deg,
                rgba(18,34,58,.92),
                rgba(7,17,32,.98)
            );

        border:
            1px solid
            rgba(100,155,220,.11);

        border-radius:21px;
    }

    .tgn-empty-icon {
        width:64px;
        height:64px;

        margin:0 auto 15px;

        display:flex;

        align-items:center;
        justify-content:center;

        border-radius:20px;

        color:#3ca8ff;

        background:
            rgba(42,156,255,.09);

        font-size:28px;
    }


    /* =====================================================
       MOBILE
       ===================================================== */

    @media(max-width:420px) {

        #content {
            padding-top:5px;
        }

        .profile-hero {
            padding:19px;
        }

        .profile-name {
            font-size:19px;
        }

        .profile-avatar-wrap {
            width:65px;
            height:65px;
            flex-basis:65px;
        }

    }

    `;


    document.head.appendChild(style);

})();


/* =========================================================
   HELPERS
   ========================================================= */

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


function showToast(message) {

    if (tg) {

        try {
            tg.showAlert(message);
            return;
        } catch (e) {}

    }

    alert(message);

}


/* =========================================================
   TRANSACTION STORAGE
   ========================================================= */

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

    } catch (e) {

        return [];

    }

}


function saveUserTransaction(tx) {

    const list =
        getUserTransactions();

    list.unshift(tx);

    localStorage.setItem(
        "TGN_USER_TXS",
        JSON.stringify(list)
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function switchNav(tab) {

    activeTab = tab;


    document
        .querySelectorAll(
            ".bottom-nav-item"
        )
        .forEach(item => {

            item.classList.remove(
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


    if (tab === "home") {

        renderMain();

    }

    else if (tab === "activity") {

        renderActivityPage();

    }

    else if (tab === "wallet") {

        renderWalletPage();

    }

    else if (tab === "profile") {

        renderProfilePage();

    }

    else if (tab === "send") {

        renderSendPage();

    }

}


/* =========================================================
   WELCOME
   ========================================================= */

function renderWelcome() {

    const content =
        document.getElementById(
            "content"
        );

    content.innerHTML = `

        <div
            class="tgn-card"
            style="
                padding:32px 20px;
                text-align:center;
                margin-top:10px;
            "
        >

            <div
                style="
                    width:70px;
                    height:70px;
                    margin:0 auto 15px;
                    border-radius:22px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:rgba(42,156,255,.10);
                    font-size:38px;
                "
            >
                💎
            </div>

            <h2
                style="
                    color:#fff;
                    margin:0;
                    font-size:23px;
                "
            >
                TGN Wallet
            </h2>

            <p
                style="
                    color:#7f95b3;
                    font-size:12px;
                    line-height:1.7;
                    margin:9px 0 22px;
                "
            >
                Secure TON wallet for
                Telegram Web3.
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

        const words = [
            "apple","book","camera","cloud",
            "dance","earth","future","garden",
            "happy","island","jungle","kitten",
            "lemon","magic","night","ocean",
            "planet","river","silver","sunset",
            "tiger","umbrella","violet","window"
        ];


        const random =
            new Uint8Array(24);

        crypto.getRandomValues(random);


        const mnemonic =
            Array.from(
                random,
                byte =>
                    words[
                        byte % words.length
                    ]
            ).join(" ");


        const seedBytes =
            new TextEncoder()
                .encode(mnemonic);


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

        console.error(error);

        alert(
            "Wallet creation failed: " +
            error.message
        );

    }

}


/* =========================================================
   IMPORT
   ========================================================= */

function showImport() {

    const title =
        document.getElementById(
            "mTitle"
        );

    const body =
        document.getElementById(
            "mBody"
        );


    title.innerText =
        "Import Wallet";


    body.innerHTML = `

        <p
            style="
                color:#8196b5;
                font-size:12px;
                line-height:1.6;
            "
        >
            Enter your recovery phrase
            to restore your wallet.
        </p>

        <textarea
            id="importSeed"
            style="
                width:100%;
                box-sizing:border-box;
                padding:13px;
                min-height:100px;
                resize:none;
                border-radius:14px;
                border:1px solid rgba(100,155,220,.14);
                background:#071224;
                color:white;
                outline:none;
            "
            placeholder="Recovery phrase..."
        ></textarea>

        <button
            class="tgn-primary"
            style="margin-top:12px"
            onclick="importWallet()"
        >
            Import Wallet
        </button>

    `;


    openModal();

}


async function importWallet() {

    const input =
        document.getElementById(
            "importSeed"
        );


    const phrase =
        input?.value.trim();


    if (!phrase) {

        alert(
            "Enter your recovery phrase."
        );

        return;

    }


    try {

        const bytes =
            new TextEncoder()
                .encode(phrase);


        const hash =
            await crypto.subtle.digest(
                "SHA-256",
                bytes
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

            mnemonic:phrase,

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
            "Wallet import failed."
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


    const shortAddress =
        address.length > 12
            ? address.slice(0,6) +
              "..." +
              address.slice(-4)
            : address;


    document.getElementById(
        "content"
    ).innerHTML = `

        <!-- HERO -->

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
                    ● ${escapeHtml(shortAddress)}
                </span>

                <button
                    class="copy-pill"
                    onclick="copyAddress()"
                >
                    Copy
                </button>

            </div>

        </div>


        <!-- TOKENS -->

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


                <div
                    style="
                        text-align:right;
                    "
                >

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


    /*
       IMPORTANT:
       Send / Receive quick buttons
       are intentionally removed.
    */


    refreshBalance();

}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfilePage() {

    const user =
        getTelegramUser();


    const name =
        getUserFullName();


    const username =
        getUsername();


    const userId =
        getUserId();


    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="tgn-page-title">

            <h2>
                Profile
            </h2>

        </div>


        <!-- PROFILE HERO -->

        <div class="profile-hero">

            <div class="profile-main">

                <div class="profile-avatar-wrap">

                    ${createTelegramAvatar(64)}

                    <span
                        class="profile-online"
                    ></span>

                </div>


                <div
                    style="
                        min-width:0;
                    "
                >

                    <div
                        class="profile-name"
                    >
                        ${escapeHtml(name)}
                    </div>

                    <div
                        class="profile-username"
                    >
                        ${escapeHtml(username)}
                    </div>

                    <div
                        class="profile-id"
                    >
                        Telegram ID:
                        ${escapeHtml(userId)}
                    </div>

                </div>

            </div>


            <!-- PROFILE STATS -->

            <div
                class="profile-stats"
            >

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
                        ${getUserPhoto() ? "✓" : "—"}
                    </div>

                    <div
                        class="profile-stat-label"
                    >
                        Photo
                    </div>

                </div>

            </div>

        </div>


        <!-- PROFILE MENU -->

        <div
            class="
                tgn-card
                profile-menu
            "
        >

            <!-- PERSONAL -->

            <button
                class="profile-menu-item"
                onclick="showPersonalInformation()"
            >

                <div
                    class="profile-menu-left"
                >

                    <div
                        class="profile-menu-icon"
                    >
                        ♙
                    </div>

                    <div>

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

                    </div>

                </div>

                <div
                    class="profile-menu-arrow"
                >
                    ›
                </div>

            </button>


            <!-- SECURITY -->

            <button
                class="profile-menu-item"
                onclick="openSecurity()"
            >

                <div
                    class="profile-menu-left"
                >

                    <div
                        class="profile-menu-icon"
                    >
                        ◉
                    </div>

                    <div>

                        <div
                            class="profile-menu-title"
                        >
                            Security & Seed Phrase
                        </div>

                        <div
                            class="profile-menu-sub"
                        >
                            Protect your wallet
                        </div>

                    </div>

                </div>

                <div
                    class="profile-menu-arrow"
                >
                    ›
                </div>

            </button>


            <!-- HELP -->

            <button
                class="profile-menu-item"
                onclick="showHelp()"
            >

                <div
                    class="profile-menu-left"
                >

                    <div
                        class="profile-menu-icon"
                    >
                        ?
                    </div>

                    <div>

                        <div
                            class="profile-menu-title"
                        >
                            Help & Support
                        </div>

                        <div
                            class="profile-menu-sub"
                        >
                            Wallet help & information
                        </div>

                    </div>

                </div>

                <div
                    class="profile-menu-arrow"
                >
                    ›
                </div>

            </button>


            <!-- LOGOUT -->

            <button
                class="profile-menu-item"
                onclick="logoutWallet()"
            >

                <div
                    class="profile-menu-left"
                >

                    <div
                        class="profile-menu-icon"
                        style="
                            color:#ff6871;
                            background:
                                rgba(239,68,68,.08);
                        "
                    >
                        ↪
                    </div>

                    <div>

                        <div
                            class="profile-menu-title"
                            style="
                                color:#ff6871;
                            "
                        >
                            Log Out
                        </div>

                        <div
                            class="profile-menu-sub"
                        >
                            Remove this wallet from device
                        </div>

                    </div>

                </div>

                <div
                    class="profile-menu-arrow"
                >
                    ›
                </div>

            </button>

        </div>

    `;

}


/* =========================================================
   PERSONAL INFORMATION
   ========================================================= */

function showPersonalInformation() {

    const user =
        getTelegramUser();


    const name =
        getUserFullName();


    const username =
        getUsername();


    const id =
        getUserId();


    const photo =
        getUserPhoto();


    document.getElementById(
        "mTitle"
    ).innerText =
        "Personal Information";


    document.getElementById(
        "mBody"
    ).innerHTML = `

        <div
            style="
                text-align:center;
                margin-bottom:18px;
            "
        >

            <div
                style="
                    display:inline-flex;
                    padding:4px;
                    border-radius:25px;
                    background:
                        rgba(42,156,255,.10);
                "
            >
                ${createTelegramAvatar(82)}
            </div>

            <div
                style="
                    margin-top:9px;
                    color:#f3f8ff;
                    font-size:17px;
                    font-weight:800;
                "
            >
                ${escapeHtml(name)}
            </div>

            <div
                style="
                    margin-top:3px;
                    color:#3ca8ff;
                    font-size:12px;
                "
            >
                ${escapeHtml(username)}
            </div>

        </div>


        <div class="info-card">

            <div class="info-row">

                <div class="info-label">
                    Telegram Name
                </div>

                <div class="info-value">
                    ${escapeHtml(name)}
                </div>

            </div>


            <div class="info-row">

                <div class="info-label">
                    Telegram ID
                </div>

                <div
                    class="info-value"
                    style="
                        display:flex;
                        align-items:center;
                    "
                >

                    ${escapeHtml(id)}

                    <button
                        class="copy-id"
                        onclick="copyTelegramId()"
                    >
                        Copy
                    </button>

                </div>

            </div>


            <div class="info-row">

                <div class="info-label">
                    Username
                </div>

                <div class="info-value">
                    ${escapeHtml(username)}
                </div>

            </div>


            <div class="info-row">

                <div class="info-label">
                    Account Year
                </div>

                <div
                    class="info-value"
                    style="color:#8298b5"
                >
                    Not available
                </div>

            </div>

        </div>


        <p
            style="
                margin:12px 3px 0;
                color:#687f9e;
                font-size:10px;
                line-height:1.6;
            "
        >
            Telegram Mini Apps do not provide
            the account creation date/year,
            so no fake year is shown.
        </p>

    `;


    openModal();

}


/* =========================================================
   COPY TELEGRAM ID
   ========================================================= */

async function copyTelegramId() {

    const id =
        getUserId();


    if (
        !id ||
        id === "Unavailable"
    ) {

        showToast(
            "Telegram ID unavailable."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            id
        );

        showToast(
            "Telegram ID copied!"
        );

    }

    catch (e) {

        alert(id);

    }

}


/* =========================================================
   SECURITY
   ========================================================= */

function openSecurity() {

    if (!walletData) {

        showToast(
            "Wallet not found."
        );

        return;

    }


    document.getElementById(
        "mTitle"
    ).innerText =
        "Wallet Security";


    document.getElementById(
        "mBody"
    ).innerHTML = `

        <div
            class="security-warning"
        >
            ⚠️ Never share your recovery
            phrase with anyone. Anyone who
            has it can control your wallet.
        </div>


        <button
            class="tgn-primary"
            onclick="showSeedPhrase()"
        >
            🔐 Show Recovery Phrase
        </button>


        <div
            id="seedBox"
            style="
                display:none;
                margin-top:12px;
                padding:14px;
                border-radius:14px;
                background:#050c18;
                border:
                    1px solid
                    rgba(239,68,68,.15);
                color:#f5f9ff;
                font-size:11px;
                line-height:1.7;
                word-break:break-word;
            "
        ></div>

    `;


    openModal();

}


function showSeedPhrase() {

    const box =
        document.getElementById(
            "seedBox"
        );


    if (!box) return;


    box.style.display =
        "block";


    box.innerText =
        walletData?.mnemonic ||
        "Recovery phrase unavailable.";

}


/* =========================================================
   HELP
   ========================================================= */

function showHelp() {

    document.getElementById(
        "mTitle"
    ).innerText =
        "Help & Support";


    document.getElementById(
        "mBody"
    ).innerHTML = `

        <div
            style="
                color:#d7e6f8;
                font-size:13px;
                line-height:1.8;
            "
        >

            <div
                style="
                    padding:13px;
                    border-radius:14px;
                    background:
                        rgba(42,156,255,.06);
                    border:
                        1px solid
                        rgba(42,156,255,.10);
                    margin-bottom:10px;
                "
            >
                💎
                <strong>
                    TGN Wallet
                </strong>

                <br>

                Secure TON wallet for
                Telegram Web3.
            </div>


            <div
                style="
                    color:#8196b5;
                    font-size:11px;
                "
            >
                If you have a problem with
                your wallet, contact the
                official TGN Wallet support.
            </div>

        </div>

    `;


    openModal();

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutWallet() {

    const ok =
        confirm(
            "Log out from this wallet?"
        );


    if (!ok) return;


    localStorage.removeItem(
        "TGN_TON_WALLET"
    );


    /*
       Keep transaction history
       separate from logout.
    */

    walletData = null;


    closeModal();


    switchNav("home");

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal() {

    const modal =
        document.getElementById(
            "modal"
        );


    if (!modal) return;


    const content =
        modal.querySelector(
            ".modal-content"
        );


    if (content) {

        content.classList.add(
            "tgn-modal-box"
        );

    }


    modal.style.display =
        "flex";

}


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
   WALLET PAGE
   ========================================================= */

function renderWalletPage() {

    if (!walletData) {

        renderWelcome();

        return;

    }


    const address =
        walletData.address || "";


    const shortAddress =
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
                padding:19px;
                margin-bottom:12px;
            "
        >

            <div
                style="
                    color:#8096b4;
                    font-size:11px;
                    margin-bottom:7px;
                "
            >
                TON Wallet Address
            </div>

            <div
                style="
                    color:#eaf3ff;
                    font-size:13px;
                    font-weight:700;
                    word-break:break-all;
                "
            >
                ${escapeHtml(shortAddress)}
            </div>

            <button
                class="tgn-primary"
                style="margin-top:13px"
                onclick="copyAddress()"
            >
                Copy Address
            </button>

        </div>


        <div
            class="tgn-card"
            style="padding:19px"
        >

            <div
                style="
                    color:#8096b4;
                    font-size:11px;
                "
            >
                Current Balance
            </div>

            <div
                id="walletPageBalance"
                style="
                    color:#f4f9ff;
                    font-size:28px;
                    font-weight:850;
                    margin-top:5px;
                "
            >
                0.00 TON
            </div>

            <div
                style="
                    color:#7187a5;
                    font-size:10px;
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

            <h2>
                Send
            </h2>

            <span style="width:40px"></span>

        </div>


        <div
            class="tgn-card"
            style="padding:19px"
        >

            <div
                style="
                    color:#f4f9ff;
                    font-size:18px;
                    font-weight:800;
                    margin-bottom:17px;
                "
            >
                Send TON
            </div>


            <label
                style="
                    display:block;
                    color:#8096b4;
                    font-size:11px;
                    margin-bottom:7px;
                "
            >
                Recipient Address
            </label>


            <input
                id="sendTo"
                type="text"
                placeholder="UQ... / EQ..."
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:13px;
                    margin-bottom:13px;
                    border-radius:14px;
                    border:1px solid rgba(100,155,220,.14);
                    background:#071224;
                    color:white;
                    outline:none;
                "
            >


            <label
                style="
                    display:block;
                    color:#8096b4;
                    font-size:11px;
                    margin-bottom:7px;
                "
            >
                Amount
            </label>


            <input
                id="sendAmount"
                type="number"
                min="0"
                step="any"
                inputmode="decimal"
                placeholder="0.00 TON"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:13px;
                    margin-bottom:13px;
                    border-radius:14px;
                    border:1px solid rgba(100,155,220,.14);
                    background:#071224;
                    color:white;
                    outline:none;
                "
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

            <h2>
                Deposit
            </h2>

            <span style="width:40px"></span>

        </div>


        <div
            class="tgn-card"
            style="
                padding:20px;
                text-align:center;
            "
        >

            <div
                style="
                    font-size:38px;
                    margin-bottom:10px;
                "
            >
                ↓
            </div>

            <div
                style="
                    color:#f4f9ff;
                    font-size:19px;
                    font-weight:800;
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
                    border:1px solid rgba(100,155,220,.10);
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
    ) {
        return;
    }


    const setBalance =
        (
            ton,
            usd
        ) => {

            const ids = [
                "balance",
                "tokenBalance",
                "walletPageBalance"
            ];


            ids.forEach(id => {

                const el =
                    document.getElementById(
                        id
                    );

                if (el) {

                    el.innerText =
                        ton + " TON";

                }

            });


            const usdElements = [
                "usdBalance",
                "tokenUsd"
            ];


            usdElements.forEach(id => {

                const el =
                    document.getElementById(
                        id
                    );

                if (el) {

                    el.innerText =
                        "$" + usd;

                }

            });

        };


    try {

        const raw =
            await tonweb.getBalance(
                walletData.address
            );


        let nano =
            Number(raw);


        if (
            !Number.isFinite(nano) ||
            nano < 0
        ) {

            nano = 0;

        }


        const ton =
            nano / 1000000000;


        const tonText =
            ton.toFixed(2);


        /*
           Do not display NaN.
           USD price is kept at 0 until
           a real price API is connected.
        */

        const usd =
            "0.00";


        setBalance(
            tonText,
            usd
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


/* =========================================================
   COPY WALLET ADDRESS
   ========================================================= */

async function copyAddress() {

    if (!walletData?.address) {

        showToast(
            "Wallet address unavailable."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            walletData.address
        );


        showToast(
            "Wallet address copied!"
        );

    }

    catch (error) {

        alert(
            walletData.address
        );

    }

}


/* =========================================================
   ACTIVITY
   ========================================================= */

function renderActivityPage(
    filter = "all"
) {

    const transactions =
        getUserTransactions();


    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="tgn-page-title">

            <h2>
                Activity
            </h2>

            <button
                style="
                    border:0;
                    background:transparent;
                    color:#3ca8ff;
                    font-weight:700;
                    cursor:pointer;
                "
                onclick="renderActivityPage()"
            >
                Refresh ↻
            </button>

        </div>


        ${
            transactions.length
            ? renderTransactions(
                transactions,
                filter
            )
            : `

                <div class="tgn-empty">

                    <div
                        class="tgn-empty-icon"
                    >
                        ◷
                    </div>

                    <div
                        style="
                            color:#edf5ff;
                            font-size:18px;
                            font-weight:800;
                        "
                    >
                        No Transactions Yet
                    </div>

                    <p
                        style="
                            color:#7187a5;
                            font-size:11px;
                            line-height:1.7;
                            margin-top:7px;
                        "
                    >
                        Your real wallet activity
                        will appear here after
                        a transaction.
                    </p>

                </div>

            `
        }

    `;

}


function renderTransactions(
    transactions,
    filter
) {

    const filtered =
        filter === "all"
            ? transactions
            : transactions.filter(
                tx =>
                    tx.type === filter
            );


    const filters = [
        "all",
        "received",
        "sent",
        "deposit",
        "withdraw"
    ];


    let html = `

        <div
            style="
                display:flex;
                gap:7px;
                overflow-x:auto;
                padding-bottom:11px;
            "
        >

            ${filters.map(
                item => `

                    <button
                        onclick="
                            renderActivityPage(
                                '${item}'
                            )
                        "
                        style="
                            flex:0 0 auto;
                            border:1px solid
                                ${
                                    filter === item
                                    ? "rgba(42,156,255,.35)"
                                    : "rgba(100,155,220,.12)"
                                };
                            background:
                                ${
                                    filter === item
                                    ? "rgba(42,156,255,.12)"
                                    : "rgba(255,255,255,.03)"
                                };
                            color:
                                ${
                                    filter === item
                                    ? "#3ca8ff"
                                    : "#8499b5"
                                };
                            padding:9px 13px;
                            border-radius:11px;
                            font-size:11px;
                            font-weight:700;
                        "
                    >
                        ${
                            item
                                .charAt(0)
                                .toUpperCase() +
                            item.slice(1)
                        }
                    </button>

                `
            ).join("")}

        </div>

    `;


    if (!filtered.length) {

        html += `

            <div class="tgn-empty">

                <div
                    class="tgn-empty-icon"
                >
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

            </div>

        `;

        return html;

    }


    filtered.forEach(tx => {

        html += `

            <div
                class="tgn-card"
                style="
                    padding:14px;
                    margin-bottom:8px;
                    display:flex;
                    align-items:center;
                    gap:11px;
                "
            >

                <div
                    style="
                        width:42px;
                        height:42px;
                        flex:0 0 42px;
                        border-radius:13px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:
                            ${
                                String(tx.amount)
                                    .startsWith("+")
                                ? "rgba(34,197,139,.10)"
                                : "rgba(239,68,68,.08)"
                            };
                        color:
                            ${
                                String(tx.amount)
                                    .startsWith("+")
                                ? "#22c58b"
                                : "#ff6871"
                            };
                        font-size:20px;
                        font-weight:800;
                    "
                >
                    ${
                        String(tx.amount)
                            .startsWith("+")
                        ? "↓"
                        : "↑"
                    }
                </div>


                <div
                    style="
                        flex:1;
                        min-width:0;
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
                            tx.title || "Transaction"
                        )}
                    </div>

                    <div
                        style="
                            color:#7187a5;
                            font-size:10px;
                            margin-top:4px;
                            overflow:hidden;
                            text-overflow:ellipsis;
                            white-space:nowrap;
                        "
                    >
                        ${escapeHtml(
                            tx.subtitle || ""
                        )}
                    </div>

                </div>


                <div
                    style="
                        text-align:right;
                    "
                >

                    <div
                        style="
                            color:
                                ${
                                    String(tx.amount)
                                        .startsWith("+")
                                    ? "#22c58b"
                                    : "#ff6871"
                                };
                            font-size:13px;
                            font-weight:800;
                        "
                    >
                        ${escapeHtml(
                            tx.amount
                        )}
                    </div>

                    <div
                        style="
                            color:#7187a5;
                            font-size:9px;
                            margin-top:4px;
                        "
                    >
                        ${escapeHtml(
                            tx.date || ""
                        )}
                    </div>

                </div>

            </div>

        `;

    });


    return html;

}


/* =========================================================
   SEND TRANSACTION
   ========================================================= */

async function doSend() {

    if (!walletData) {

        showToast(
            "Wallet not found."
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
        Number(amount) <= 0
    ) {

        showToast(
            "Enter a valid address and amount."
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


        const now =
            new Date();


        saveUserTransaction({

            id:Date.now(),

            type:"withdraw",

            title:"Withdraw",

            subtitle:
                "To: " +
                to.slice(0,8) +
                "...",

            amount:
                "-" +
                amount +
                " TON",

            date:
                now.toLocaleDateString(
                    "en-US",
                    {
                        month:"short",
                        day:"numeric",
                        year:"numeric"
                    }
                )

        });


        showToast(
            "Withdrawal successful!"
        );


        switchNav(
            "activity"
        );

    }

    catch (error) {

        console.error(error);

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
   START
   ========================================================= */

window.onload = function() {

    try {

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

            switchNav("home");

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
