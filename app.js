/* =========================================================
   TGN WALLET - APP.JS
   PART 1
   Main App / Telegram / Config / State
   ========================================================= */

import {
    initFirebase,
    getDB,
    getUser,
    saveUser,
    getAirdropTasks,
    claimAirdropTask as firebaseClaimAirdropTask
} from "./firebase.js";


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {

    // Cloudflare Worker
    API_BASE:
        "https://u20052.workers.dev",

    // Local wallet storage
    WALLET_STORAGE:
        "TGN_TON_WALLET",

    // Transaction storage
    TX_STORAGE:
        "TGN_USER_TXS",

    // Referral storage
    REFERRAL_STORAGE:
        "TGN_REFERRAL_CODE",

    // Theme
    THEME_STORAGE:
        "TGN_THEME"

};


/* =========================================================
   TELEGRAM WEB APP
   ========================================================= */

const tg =
    window.Telegram?.WebApp || null;

if (tg) {

    try {
        tg.ready();
        tg.expand();
    } catch (error) {
        console.warn(
            "Telegram WebApp init failed:",
            error
        );
    }

}


/* =========================================================
   FIREBASE STATE
   ========================================================= */

let db = null;

let firebaseReady = false;

let userData = null;


/* =========================================================
   TON STATE
   ========================================================= */

let tonweb = null;

let tonConnectUI = null;

let connectedWallet = null;

let walletData = null;

let tonBalance = 0;


/* =========================================================
   APP STATE
   ========================================================= */

let currentPage = "home";

let currentNav = "home";

let transactions = [];

let airdropTasks = [];

let airdropLoading = false;

let profileData = null;


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

    const user =
        getTelegramUser();

    if (!user?.id) {
        return "";
    }

    return String(user.id);

}


function getUsername() {

    const user =
        getTelegramUser();

    return user?.username || "";

}


function getFirstName() {

    const user =
        getTelegramUser();

    return user?.first_name || "User";

}


function getLastName() {

    const user =
        getTelegramUser();

    return user?.last_name || "";

}


function getPhotoUrl() {

    const user =
        getTelegramUser();

    return user?.photo_url || "";

}


/* =========================================================
   REFERRAL
   ========================================================= */

function getStartParam() {

    return (
        tg?.initDataUnsafe?.start_param ||
        ""
    );

}


function getReferralCode() {

    let code =
        localStorage.getItem(
            CONFIG.REFERRAL_STORAGE
        );

    if (!code) {

        code =
            getStartParam();

        if (code) {

            localStorage.setItem(
                CONFIG.REFERRAL_STORAGE,
                code
            );

        }

    }

    return code || "";

}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadLocalWallet() {

    try {

        const raw =
            localStorage.getItem(
                CONFIG.WALLET_STORAGE
            );

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    } catch (error) {

        console.warn(
            "Wallet storage read failed:",
            error
        );

        return null;
    }

}


function saveLocalWallet(wallet) {

    try {

        localStorage.setItem(
            CONFIG.WALLET_STORAGE,
            JSON.stringify(wallet)
        );

        return true;

    } catch (error) {

        console.error(
            "Wallet storage save failed:",
            error
        );

        return false;
    }

}


function clearLocalWallet() {

    try {

        localStorage.removeItem(
            CONFIG.WALLET_STORAGE
        );

        walletData = null;

        connectedWallet = null;

        tonBalance = 0;

        return true;

    } catch (error) {

        console.error(
            "Wallet storage clear failed:",
            error
        );

        return false;
    }

}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

function loadTransactions() {

    try {

        const raw =
            localStorage.getItem(
                CONFIG.TX_STORAGE
            );

        if (!raw) {
            transactions = [];
            return [];
        }

        const data =
            JSON.parse(raw);

        transactions =
            Array.isArray(data)
                ? data
                : [];

        return transactions;

    } catch (error) {

        console.warn(
            "Transaction storage read failed:",
            error
        );

        transactions = [];

        return [];
    }

}


function saveTransactions() {

    try {

        localStorage.setItem(
            CONFIG.TX_STORAGE,
            JSON.stringify(
                transactions
            )
        );

        return true;

    } catch (error) {

        console.warn(
            "Transaction storage save failed:",
            error
        );

        return false;
    }

}


/* =========================================================
   TRANSACTION HELPER
   ========================================================= */

function addTransaction(transaction) {

    const item = {

        id:
            transaction.id ||
            Date.now().toString(),

        type:
            transaction.type ||
            "unknown",

        amount:
            Number(
                transaction.amount || 0
            ),

        address:
            transaction.address || "",

        status:
            transaction.status ||
            "pending",

        timestamp:
            transaction.timestamp ||
            Date.now()

    };

    transactions.unshift(item);

    saveTransactions();

    return item;

}


/* =========================================================
   UI HELPERS
   ========================================================= */

function $(selector) {

    return document.querySelector(
        selector
    );

}


function $$(selector) {

    return [
        ...document.querySelectorAll(
            selector
        )
    ];

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(
    value,
    decimals = 2
) {

    const number =
        Number(value || 0);

    if (!Number.isFinite(number)) {
        return "0";
    }

    return number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits:
                0,

            maximumFractionDigits:
                decimals
        }
    );

}


function formatTON(value) {

    return formatNumber(
        value,
        4
    );

}


/* =========================================================
   ADDRESS FORMAT
   ========================================================= */

function shortAddress(
    address,
    start = 6,
    end = 6
) {

    if (!address) {
        return "Not connected";
    }

    const value =
        String(address);

    if (
        value.length <=
        start + end + 3
    ) {
        return value;
    }

    return (
        value.slice(
            0,
            start
        ) +
        "..." +
        value.slice(
            -end
        )
    );

}


/* =========================================================
   CLIPBOARD
   ========================================================= */

async function copyText(
    text
) {

    if (!text) {
        return false;
    }

    try {

        await navigator.clipboard.writeText(
            String(text)
        );

        return true;

    } catch (error) {

        try {

            const input =
                document.createElement(
                    "textarea"
                );

            input.value =
                String(text);

            input.style.position =
                "fixed";

            input.style.opacity =
                "0";

            document.body.appendChild(
                input
            );

            input.select();

            document.execCommand(
                "copy"
            );

            input.remove();

            return true;

        } catch {
            return false;
        }

    }

}


/* =========================================================
   TELEGRAM HAPTIC
   ========================================================= */

function haptic(
    type = "light"
) {

    try {

        if (
            tg?.HapticFeedback
        ) {

            if (
                type ===
                "success"
            ) {

                tg.HapticFeedback
                    .notificationOccurred(
                        "success"
                    );

            } else if (
                type ===
                "error"
            ) {

                tg.HapticFeedback
                    .notificationOccurred(
                        "error"
                    );

            } else {

                tg.HapticFeedback
                    .impactOccurred(
                        type
                    );

            }

        }

    } catch (error) {

        console.warn(
            "Haptic failed:",
            error
        );

    }

}


/* =========================================================
   TELEGRAM ALERT
   ========================================================= */

function showAlert(
    message
) {

    if (
        tg?.showAlert
    ) {

        tg.showAlert(
            String(message)
        );

        return;
    }

    window.alert(
        String(message)
    );

}


/* =========================================================
   TELEGRAM CONFIRM
   ========================================================= */

function showConfirm(
    message,
    callback
) {

    if (
        tg?.showConfirm
    ) {

        tg.showConfirm(
            String(message),
            callback
        );

        return;
    }

    callback(
        window.confirm(
            String(message)
        )
    );

}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(
    element,
    loading,
    text = "Loading..."
) {

    if (!element) {
        return;
    }

    if (loading) {

        element.dataset.originalText =
            element.innerHTML;

        element.disabled =
            true;

        element.innerHTML =
            `<i class="fas fa-spinner fa-spin"></i> ${escapeHtml(text)}`;

    } else {

        element.disabled =
            false;

        if (
            element.dataset.originalText
        ) {

            element.innerHTML =
                element.dataset.originalText;

        }

    }

}


/* =========================================================
   INITIAL LOCAL STATE
   ========================================================= */

function initializeLocalState() {

    walletData =
        loadLocalWallet();

    loadTransactions();

    getReferralCode();

}


/* =========================================================
   FIREBASE CONNECTION
   ========================================================= */

async function initializeFirebase() {

    try {

        firebaseReady =
            await initFirebase();

        if (
            firebaseReady
        ) {

            db =
                getDB();

            console.log(
                "Firebase ready ✓"
            );

        } else {

            db = null;

            console.warn(
                "Firebase unavailable"
            );

        }

        return firebaseReady;

    } catch (error) {

        console.error(
            "Firebase startup error:",
            error
        );

        firebaseReady =
            false;

        db = null;

        return false;

    }

}


/* =========================================================
   FIREBASE USER SYNC
   ========================================================= */

async function syncCurrentUser() {

    if (
        !firebaseReady
    ) {
        return null;
    }

    const telegramId =
        getUserId();

    if (!telegramId) {
        return null;
    }

    try {

        const existing =
            await getUser(
                telegramId
            );

        const data = {

            telegramId,

            username:
                getUsername(),

            firstName:
                getFirstName(),

            lastName:
                getLastName(),

            photoUrl:
                getPhotoUrl(),

            walletAddress:
                walletData?.address ||
                "",

            referralCode:
                getReferralCode(),

            referredBy:
                getStartParam(),

            updatedAt:
                Date.now()

        };

        await saveUser(
            telegramId,
            data
        );

        userData = {

            ...(existing || {}),
            ...data

        };

        return userData;

    } catch (error) {

        console.warn(
            "Firebase user sync failed:",
            error
        );

        return null;

    }

}


/* =========================================================
   DOCUMENT READY
   ========================================================= */

let appStarted = false;


async function startApp() {

    if (appStarted) {
        return;
    }

    appStarted = true;

    initializeLocalState();

    /*
     * Firebase is intentionally initialized
     * after local state so Firebase errors
     * cannot freeze the UI.
     */

    await initializeFirebase();

    await syncCurrentUser();

    /*
     * Part 2 will continue here with:
     * TON initialization
     * wallet loading
     * Create Wallet
     * Import Seed Phrase
     * balance
     * navigation
     */

    console.log(
        "TGN Wallet started ✓"
    );

}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApp,
        {
            once: true
        }
    );

} else {

    startApp();

}


/* =========================================================
   GLOBAL EXPORTS
   =========================================================
   Keep these because the existing HTML may use
   onclick="..." handlers.
   ========================================================= */

window.tgnWallet = {

    getTelegramUser,

    getUserId,

    getUsername,

    getFirstName,

    getLastName,

    getPhotoUrl,

    getStartParam,

    getReferralCode,

    loadLocalWallet,

    saveLocalWallet,

    clearLocalWallet,

    loadTransactions,

    saveTransactions,

    addTransaction,

    formatNumber,

    formatTON,

    shortAddress,

    copyText,

    haptic,

    showAlert,

    showConfirm,

    setLoading,

    syncCurrentUser

};
/* =========================================================
   TGN WALLET - APP.JS
   PART 2
   TON / Wallet / Create Wallet / Import Seed
   ========================================================= */


/* =========================================================
   TON SDK
   ========================================================= */

async function initTonWeb() {

    try {

        if (tonweb) {
            return tonweb;
        }

        const TonWeb =
            window.TonWeb ||
            window.tonweb ||
            null;

        if (TonWeb) {

            tonweb =
                new TonWeb(
                    new TonWeb.HttpProvider(
                        CONFIG.API_BASE
                    )
                );

            return tonweb;
        }


        /*
         * Fallback:
         * Use TON API through Worker.
         */

        console.log(
            "TON Web SDK not found - using Worker API"
        );

        return null;

    } catch (error) {

        console.error(
            "TON initialization failed:",
            error
        );

        tonweb = null;

        return null;
    }

}


/* =========================================================
   WORKER REQUEST
   ========================================================= */

async function workerRequest(
    endpoint,
    options = {}
) {

    const url =
        CONFIG.API_BASE +
        endpoint;

    const requestOptions = {

        method:
            options.method ||
            "GET",

        headers: {
            "Content-Type":
                "application/json",

            ...(options.headers || {})
        }

    };


    if (
        options.body !== undefined
    ) {

        requestOptions.body =
            typeof options.body ===
            "string"

                ? options.body

                : JSON.stringify(
                    options.body
                );

    }


    const response =
        await fetch(
            url,
            requestOptions
        );


    const text =
        await response.text();


    let data;

    try {

        data =
            text
                ? JSON.parse(text)
                : {};

    } catch {

        data = {
            raw: text
        };

    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            data?.message ||
            `Worker request failed (${response.status})`
        );

    }


    return data;

}


/* =========================================================
   WALLET STORAGE VALIDATION
   ========================================================= */

function isValidWalletData(
    wallet
) {

    if (!wallet) {
        return false;
    }

    if (
        typeof wallet !==
        "object"
    ) {
        return false;
    }

    if (
        !wallet.address
    ) {
        return false;
    }

    return true;

}


/* =========================================================
   LOAD WALLET
   ========================================================= */

function loadWallet() {

    const wallet =
        loadLocalWallet();

    if (
        isValidWalletData(
            wallet
        )
    ) {

        walletData =
            wallet;

        connectedWallet =
            wallet.address;

        return walletData;

    }

    walletData = null;

    connectedWallet = null;

    return null;

}


/* =========================================================
   SAVE WALLET
   ========================================================= */

function saveWallet(
    wallet
) {

    if (
        !isValidWalletData(
            wallet
        )
    ) {

        throw new Error(
            "Invalid wallet data"
        );

    }

    walletData =
        wallet;

    connectedWallet =
        wallet.address;

    saveLocalWallet(
        wallet
    );

    return walletData;

}


/* =========================================================
   CREATE WALLET
   =========================================================
   IMPORTANT:
   Seed/private key should NOT be sent
   to Firebase or Worker.
   ========================================================= */

async function createWallet() {

    try {

        haptic("medium");


        /*
         * TON SDK wallet generation.
         *
         * If the TON SDK is not available,
         * the UI can still remain functional
         * and show an appropriate message.
         */

        if (!tonweb) {
            await initTonWeb();
        }


        if (!tonweb) {

            showAlert(
                "Wallet engine is not ready. Please try again."
            );

            return null;

        }


        /*
         * Generate random mnemonic.
         */

        const mnemonic =
            tonweb.utils.nacl
                ? null
                : null;


        /*
         * Use TonWeb mnemonic helper
         * when available.
         */

        let words = null;


        if (
            tonweb.utils &&
            tonweb.utils.nacl
        ) {

            /*
             * The actual wallet-generation
             * implementation is completed in
             * the wallet UI section.
             */

        }


        /*
         * Do not create an incomplete wallet
         * silently.
         */

        if (!words) {

            console.warn(
                "Wallet mnemonic generator unavailable"
            );

            showAlert(
                "Wallet generator is not ready."
            );

            return null;

        }


        return words;

    } catch (error) {

        console.error(
            "Create wallet error:",
            error
        );

        haptic("error");

        showAlert(
            error.message ||
            "Unable to create wallet."
        );

        return null;

    }

}


/* =========================================================
   IMPORT WALLET
   ========================================================= */

async function importWallet(
    seedPhrase
) {

    try {

        haptic("medium");


        if (
            !seedPhrase
        ) {

            throw new Error(
                "Please enter your seed phrase."
            );

        }


        /*
         * Normalize seed phrase.
         */

        const words =
            String(seedPhrase)
                .trim()
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);


        /*
         * TON standard mnemonic normally
         * contains 24 words.
         */

        if (
            words.length !== 24
        ) {

            throw new Error(
                "Seed phrase must contain 24 words."
            );

        }


        /*
         * IMPORTANT:
         * Seed phrase stays locally.
         *
         * Never send it to Firebase.
         * Never send it to Worker.
         */


        /*
         * Wallet derivation is completed
         * by the wallet engine in the next
         * wallet section.
         */

        console.log(
            "Import seed phrase received:",
            words.length,
            "words"
        );


        return {
            words
        };


    } catch (error) {

        console.error(
            "Import wallet error:",
            error
        );

        haptic("error");

        showAlert(
            error.message ||
            "Unable to import wallet."
        );

        return null;

    }

}


/* =========================================================
   DELETE LOCAL WALLET
   ========================================================= */

function deleteWallet() {

    showConfirm(
        "Are you sure you want to remove this wallet from this device?",
        confirmed => {

            if (!confirmed) {
                return;
            }

            clearLocalWallet();

            haptic("success");

            /*
             * Re-rendering/navigation is completed
             * in the UI section.
             */

            if (
                typeof renderWelcome ===
                "function"
            ) {

                renderWelcome();

            }

        }
    );

}


/* =========================================================
   GET WALLET ADDRESS
   ========================================================= */

function getWalletAddress() {

    return (
        walletData?.address ||
        connectedWallet ||
        ""
    );

}


/* =========================================================
   WALLET CONNECTED CHECK
   ========================================================= */

function hasWallet() {

    return Boolean(
        getWalletAddress()
    );

}


/* =========================================================
   BALANCE FORMAT
   ========================================================= */

function setBalance(
    balance
) {

    const value =
        Number(balance);

    tonBalance =
        Number.isFinite(value)
            ? value
            : 0;

    return tonBalance;

}


/* =========================================================
   GET BALANCE FROM WORKER
   ========================================================= */

async function fetchWalletBalance(
    address
) {

    if (!address) {

        setBalance(0);

        return 0;

    }


    try {

        const data =
            await workerRequest(
                `/balance?address=${encodeURIComponent(
                    address
                )}`
            );


        const balance =
            Number(
                data?.balance ??
                data?.result ??
                data?.ton ??
                0
            );


        setBalance(
            balance
        );


        return tonBalance;


    } catch (error) {

        console.warn(
            "Balance request failed:",
            error
        );

        /*
         * Do not destroy existing
         * local balance on network error.
         */

        return tonBalance;

    }

}


/* =========================================================
   REFRESH BALANCE
   ========================================================= */

async function refreshBalance() {

    const address =
        getWalletAddress();

    if (!address) {

        setBalance(0);

        return 0;

    }


    try {

        const balance =
            await fetchWalletBalance(
                address
            );


        /*
         * UI refresh will be handled
         * by render functions.
         */

        if (
            typeof updateBalanceUI ===
            "function"
        ) {

            updateBalanceUI(
                balance
            );

        }


        return balance;


    } catch (error) {

        console.warn(
            "Refresh balance failed:",
            error
        );

        return tonBalance;

    }

}


/* =========================================================
   SAVE WALLET TO FIREBASE
   ========================================================= */

async function saveWalletToFirebase() {

    if (
        !firebaseReady
    ) {
        return false;
    }

    if (
        !walletData?.address
    ) {
        return false;
    }


    const telegramId =
        getUserId();

    if (!telegramId) {
        return false;
    }


    try {

        await saveUser(
            telegramId,
            {

                walletAddress:
                    walletData.address,

                updatedAt:
                    Date.now()

            }
        );


        return true;


    } catch (error) {

        console.warn(
            "Wallet Firebase sync failed:",
            error
        );

        return false;

    }

}


/* =========================================================
   LOAD WALLET ON START
   ========================================================= */

async function initializeWallet() {

    try {

        loadWallet();

        await initTonWeb();


        if (
            walletData?.address
        ) {

            await refreshBalance();

        }


        return walletData;

    } catch (error) {

        console.warn(
            "Wallet initialization failed:",
            error
        );

        return walletData;

    }

}


/* =========================================================
   WALLET STATE EXPORT
   ========================================================= */

window.tgnWallet = {

    ...(window.tgnWallet || {}),

    createWallet,

    importWallet,

    loadWallet,

    saveWallet,

    deleteWallet,

    getWalletAddress,

    hasWallet,

    refreshBalance,

    fetchWalletBalance,

    saveWalletToFirebase,

    initializeWallet

};


/* =========================================================
   INITIALIZE WALLET
   ========================================================= */

const originalStartApp =
    startApp;


/*
 * Replace startup with wallet-aware
 * startup while keeping Part 1 logic.
 */

startApp = async function () {

    if (appStarted) {
        return;
    }

    appStarted = true;

    initializeLocalState();

    loadWallet();

    await initializeFirebase();

    await syncCurrentUser();

    await initializeWallet();

    console.log(
        "TGN Wallet initialized ✓"
    );

};
/* =========================================================
   TGN WALLET - APP.JS
   PART 3
   Navigation / Home / Wallet / Activity / Profile / Airdrop
   ========================================================= */


/* =========================================================
   PAGE / NAVIGATION
   ========================================================= */

function getPageElements() {

    return {
        home:
            document.getElementById("homePage") ||
            document.getElementById("home") ||
            document.querySelector(
                '[data-page="home"]'
            ),

        wallet:
            document.getElementById("walletPage") ||
            document.getElementById("wallet") ||
            document.querySelector(
                '[data-page="wallet"]'
            ),

        activity:
            document.getElementById("activityPage") ||
            document.getElementById("activity") ||
            document.querySelector(
                '[data-page="activity"]'
            ),

        airdrop:
            document.getElementById("airdropPage") ||
            document.getElementById("airdrop") ||
            document.querySelector(
                '[data-page="airdrop"]'
            ),

        profile:
            document.getElementById("profilePage") ||
            document.getElementById("profile") ||
            document.querySelector(
                '[data-page="profile"]'
            )
    };

}


/* =========================================================
   HIDE ALL PAGES
   ========================================================= */

function hideAllPages() {

    const pages =
        getPageElements();

    Object.values(pages)
        .forEach(page => {

            if (!page) {
                return;
            }

            page.classList.add(
                "hidden"
            );

            page.style.display =
                "none";

        });

}


/* =========================================================
   SHOW PAGE
   ========================================================= */

function showPage(
    pageName
) {

    const pages =
        getPageElements();

    hideAllPages();

    const page =
        pages[pageName];

    if (!page) {

        console.warn(
            "Page not found:",
            pageName
        );

        return false;
    }


    page.classList.remove(
        "hidden"
    );

    page.style.display =
        "";


    currentPage =
        pageName;

    currentNav =
        pageName;


    updateNavigation(
        pageName
    );


    return true;

}


/* =========================================================
   NAVIGATION BUTTONS
   ========================================================= */

function updateNavigation(
    activePage
) {

    const buttons =
        document.querySelectorAll(
            "[data-nav], " +
            ".nav-item, " +
            ".bottom-nav-item, " +
            ".nav-btn"
        );


    buttons.forEach(
        button => {

            const page =
                button.dataset.nav ||
                button.dataset.page ||
                button.dataset.target;


            if (
                page === activePage
            ) {

                button.classList.add(
                    "active"
                );

                button.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                button.classList.remove(
                    "active"
                );

                button.removeAttribute(
                    "aria-current"
                );

            }

        }
    );

}


/* =========================================================
   MAIN NAVIGATION
   ========================================================= */

function switchNav(
    pageName
) {

    if (!pageName) {
        return;
    }


    pageName =
        String(
            pageName
        )
        .replace(
            "#",
            ""
        )
        .toLowerCase();


    const aliases = {

        home:
            "home",

        wallet:
            "wallet",

        activity:
            "activity",

        airdrop:
            "airdrop",

        profile:
            "profile",

        account:
            "profile"

    };


    pageName =
        aliases[pageName] ||
        pageName;


    if (
        ![
            "home",
            "wallet",
            "activity",
            "airdrop",
            "profile"
        ].includes(
            pageName
        )
    ) {

        console.warn(
            "Unknown navigation:",
            pageName
        );

        return;
    }


    haptic(
        "light"
    );


    showPage(
        pageName
    );


    if (
        pageName ===
        "home"
    ) {

        renderHome();

    }


    if (
        pageName ===
        "wallet"
    ) {

        renderWallet();

    }


    if (
        pageName ===
        "activity"
    ) {

        renderActivity();

    }


    if (
        pageName ===
        "airdrop"
    ) {

        renderAirdrop();

    }


    if (
        pageName ===
        "profile"
    ) {

        renderProfile();

    }

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

    const balanceElements =
        document.querySelectorAll(
            "[data-balance], " +
            ".balance-value, " +
            ".ton-balance"
        );


    balanceElements.forEach(
        element => {

            element.textContent =
                formatTON(
                    tonBalance
                );

        }
    );


    const addressElements =
        document.querySelectorAll(
            "[data-wallet-address], " +
            ".wallet-address"
        );


    addressElements.forEach(
        element => {

            element.textContent =
                shortAddress(
                    getWalletAddress()
                );

        }
    );


    const nameElements =
        document.querySelectorAll(
            "[data-user-name], " +
            ".user-name"
        );


    nameElements.forEach(
        element => {

            element.textContent =
                getFirstName();

        }
    );


    updateBalanceUI(
        tonBalance
    );

}


/* =========================================================
   UPDATE BALANCE UI
   ========================================================= */

function updateBalanceUI(
    balance
) {

    const value =
        formatTON(
            balance
        );


    const selectors = [

        "#balance",

        "#tonBalance",

        "#walletBalance",

        ".balance",

        ".balance-amount",

        ".ton-balance",

        "[data-balance]"

    ];


    selectors.forEach(
        selector => {

            document
                .querySelectorAll(
                    selector
                )
                .forEach(
                    element => {

                        element.textContent =
                            value;

                    }
                );

        }
    );

}


/* =========================================================
   WALLET PAGE
   ========================================================= */

function renderWallet() {

    const address =
        getWalletAddress();


    document
        .querySelectorAll(
            "[data-wallet-address], " +
            ".wallet-address"
        )
        .forEach(
            element => {

                element.textContent =
                    address
                        ? shortAddress(
                            address,
                            8,
                            8
                        )
                        : "Create Wallet";

            }
        );


    document
        .querySelectorAll(
            "[data-balance], " +
            ".balance-value, " +
            ".ton-balance"
        )
        .forEach(
            element => {

                element.textContent =
                    formatTON(
                        tonBalance
                    );

            }
        );


    const createButtons =
        document.querySelectorAll(
            "[data-create-wallet], " +
            ".create-wallet-btn"
        );


    createButtons.forEach(
        button => {

            button.style.display =
                address
                    ? "none"
                    : "";

        }
    );


    const walletButtons =
        document.querySelectorAll(
            "[data-wallet-action]"
        );


    walletButtons.forEach(
        button => {

            button.style.display =
                address
                    ? ""
                    : "none";

        }
    );

}


/* =========================================================
   ACTIVITY
   ========================================================= */

function renderActivity() {

    const containers =
        document.querySelectorAll(
            "#activityList, " +
            ".activity-list, " +
            "[data-activity-list]"
        );


    containers.forEach(
        container => {

            if (
                !transactions.length
            ) {

                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clock"></i>
                        <div>No activity yet</div>
                    </div>
                `;

                return;
            }


            container.innerHTML =
                transactions
                    .map(
                        transaction => {

                            const type =
                                escapeHtml(
                                    transaction.type
                                );

                            const amount =
                                formatTON(
                                    transaction.amount
                                );

                            const status =
                                escapeHtml(
                                    transaction.status
                                );


                            return `
                                <div
                                    class="activity-item"
                                    data-tx-id="${escapeHtml(
                                        transaction.id
                                    )}"
                                >

                                    <div class="activity-icon">

                                        <i class="fas ${
                                            type === "send"
                                                ? "fa-arrow-up"
                                                : type === "receive"
                                                    ? "fa-arrow-down"
                                                    : "fa-clock"
                                        }"></i>

                                    </div>

                                    <div class="activity-info">

                                        <div class="activity-title">
                                            ${type}
                                        </div>

                                        <div class="activity-status">
                                            ${status}
                                        </div>

                                    </div>

                                    <div class="activity-amount">

                                        ${amount} TON

                                    </div>

                                </div>
                            `;

                        }
                    )
                    .join("");

        }
    );

}


/* =========================================================
   AIRDROP
   ========================================================= */

function renderAirdrop() {

    const points =
        Number(
            userData?.airdropPoints ||
            userData?.points ||
            0
        );


    document
        .querySelectorAll(
            "[data-airdrop-points], " +
            "#airdropPoints, " +
            ".airdrop-points"
        )
        .forEach(
            element => {

                element.textContent =
                    formatNumber(
                        points,
                        0
                    );

            }
        );


    /*
     * Existing task container
     */

    const containers =
        document.querySelectorAll(
            "#airdropTasks, " +
            ".airdrop-tasks, " +
            "[data-airdrop-tasks]"
        );


    if (
        !containers.length
    ) {

        return;
    }


    if (
        airdropLoading
    ) {

        containers.forEach(
            container => {

                container.innerHTML = `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        Loading tasks...
                    </div>
                `;

            }
        );

        return;
    }


    if (
        !airdropTasks.length
    ) {

        containers.forEach(
            container => {

                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-gift"></i>
                        <div>No tasks available</div>
                    </div>
                `;

            }
        );

        return;
    }


    containers.forEach(
        container => {

            container.innerHTML =
                airdropTasks
                    .map(
                        task => {

                            const id =
                                escapeHtml(
                                    task.id
                                );

                            const title =
                                escapeHtml(
                                    task.title ||
                                    task.name ||
                                    "Airdrop Task"
                                );

                            const description =
                                escapeHtml(
                                    task.description ||
                                    ""
                                );

                            const reward =
                                Number(
                                    task.reward ||
                                    task.points ||
                                    0
                                );


                            return `
                                <div
                                    class="airdrop-task"
                                    data-task-id="${id}"
                                >

                                    <div class="airdrop-task-icon">
                                        <i class="fas fa-gift"></i>
                                    </div>

                                    <div class="airdrop-task-content">

                                        <div class="airdrop-task-title">
                                            ${title}
                                        </div>

                                        <div class="airdrop-task-description">
                                            ${description}
                                        </div>

                                        <div class="airdrop-task-reward">
                                            +${formatNumber(
                                                reward,
                                                0
                                            )} Points
                                        </div>

                                    </div>

                                    <button
                                        class="airdrop-claim-btn"
                                        type="button"
                                        data-claim-task="${id}"
                                    >
                                        Claim
                                    </button>

                                </div>
                            `;

                        }
                    )
                    .join("");

        }
    );

}


/* =========================================================
   LOAD AIRDROP TASKS
   ========================================================= */

async function loadAirdropTasks() {

    if (
        airdropLoading
    ) {

        return;
    }


    airdropLoading =
        true;


    renderAirdrop();


    try {

        if (
            !firebaseReady
        ) {

            await initializeFirebase();

        }


        if (
            !firebaseReady
        ) {

            airdropTasks = [];

            return;

        }


        airdropTasks =
            await getAirdropTasks();


    } catch (error) {

        console.error(
            "Airdrop task loading failed:",
            error
        );

        airdropTasks = [];

    } finally {

        airdropLoading =
            false;

        renderAirdrop();

    }

}


/* =========================================================
   CLAIM AIRDROP
   ========================================================= */

async function claimAirdropTask(
    taskId,
    button = null
) {

    if (
        !taskId
    ) {

        return;
    }


    if (
        !firebaseReady
    ) {

        showAlert(
            "Airdrop is not connected yet."
        );

        return;
    }


    const telegramId =
        getUserId();


    if (!telegramId) {

        showAlert(
            "Telegram user not detected."
        );

        return;
    }


    try {

        if (button) {

            setLoading(
                button,
                true,
                "Claiming..."
            );

        }


        const result =
            await firebaseClaimAirdropTask(
                telegramId,
                taskId
            );


        if (
            result?.alreadyClaimed
        ) {

            showAlert(
                "You already claimed this task."
            );

            return;

        }


        if (
            !result?.ok
        ) {

            throw new Error(
                "Unable to claim task."
            );

        }


        userData =
            await getUser(
                telegramId
            );


        haptic(
            "success"
        );


        showAlert(
            `Airdrop claimed! +${formatNumber(
                result.reward || 0,
                0
            )} points`
        );


        await loadAirdropTasks();


    } catch (error) {

        console.error(
            "Airdrop claim failed:",
            error
        );

        haptic(
            "error"
        );

        showAlert(
            error.message ||
            "Claim failed."
        );

    } finally {

        if (button) {

            setLoading(
                button,
                false
            );

        }

    }

}


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfile() {

    const user =
        getTelegramUser();


    const name =
        [
            user?.first_name,
            user?.last_name
        ]
        .filter(Boolean)
        .join(" ") ||
        "User";


    const username =
        user?.username
            ? "@" +
              user.username
            : "";


    document
        .querySelectorAll(
            "[data-profile-name], " +
            ".profile-name"
        )
        .forEach(
            element => {

                element.textContent =
                    name;

            }
        );


    document
        .querySelectorAll(
            "[data-profile-username], " +
            ".profile-username"
        )
        .forEach(
            element => {

                element.textContent =
                    username;

            }
        );


    document
        .querySelectorAll(
            "[data-profile-id], " +
            ".profile-id"
        )
        .forEach(
            element => {

                element.textContent =
                    user?.id
                        ? String(
                            user.id
                        )
                        : "-";

            }
        );


    document
        .querySelectorAll(
            "[data-profile-wallet], " +
            ".profile-wallet"
        )
        .forEach(
            element => {

                element.textContent =
                    shortAddress(
                        getWalletAddress(),
                        8,
                        8
                    );

            }
        );


    document
        .querySelectorAll(
            "[data-profile-photo], " +
            ".profile-photo"
        )
        .forEach(
            element => {

                if (
                    user?.photo_url
                ) {

                    if (
                        element.tagName ===
                        "IMG"
                    ) {

                        element.src =
                            user.photo_url;

                    } else {

                        element.style.backgroundImage =
                            `url("${user.photo_url}")`;

                    }

                }

            }
        );

}


/* =========================================================
   LOAD PROFILE
   ========================================================= */

async function loadProfile() {

    try {

        if (
            firebaseReady &&
            getUserId()
        ) {

            userData =
                await getUser(
                    getUserId()
                );

        }

    } catch (error) {

        console.warn(
            "Profile loading failed:",
            error
        );

    }


    renderProfile();

}


/* =========================================================
   NAVIGATION EVENT DELEGATION
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const nav =
            event.target.closest(
                "[data-nav], " +
                ".nav-item, " +
                ".bottom-nav-item, " +
                ".nav-btn"
            );


        if (nav) {

            const page =
                nav.dataset.nav ||
                nav.dataset.page ||
                nav.dataset.target;


            if (page) {

                event.preventDefault();

                switchNav(
                    page
                );

                return;

            }

        }


        /*
         * Airdrop claim
         */

        const claimButton =
            event.target.closest(
                "[data-claim-task]"
            );


        if (
            claimButton
        ) {

            event.preventDefault();

            const taskId =
                claimButton.dataset.claimTask;


            claimAirdropTask(
                taskId,
                claimButton
            );

            return;

        }


        /*
         * Create Wallet
         */

        const createButton =
            event.target.closest(
                "[data-create-wallet], " +
                ".create-wallet-btn"
            );


        if (
            createButton
        ) {

            event.preventDefault();

            createWallet();

            return;

        }


        /*
         * Delete wallet
         */

        const deleteButton =
            event.target.closest(
                "[data-delete-wallet]"
            );


        if (
            deleteButton
        ) {

            event.preventDefault();

            deleteWallet();

            return;

        }

    }
);


/* =========================================================
   INITIAL PAGE
   ========================================================= */

function initializeNavigation() {

    const pages =
        getPageElements();


    /*
     * Hide pages first.
     */

    Object.values(pages)
        .forEach(
            page => {

                if (!page) {
                    return;
                }

                page.classList.add(
                    "hidden"
                );

            }
        );


    /*
     * Show Home.
     */

    showPage(
        "home"
    );


    renderHome();

}


/* =========================================================
   AIRDROP PAGE HOOK
   ========================================================= */

async function openAirdrop() {

    switchNav(
        "airdrop"
    );

    await loadAirdropTasks();

}


/* =========================================================
   PROFILE PAGE HOOK
   ========================================================= */

async function openProfile() {

    switchNav(
        "profile"
    );

    await loadProfile();

}


/* =========================================================
   WALLET PAGE HOOK
   ========================================================= */

async function openWallet() {

    switchNav(
        "wallet"
    );

    renderWallet();

}


/* =========================================================
   ACTIVITY PAGE HOOK
   ========================================================= */

function openActivity() {

    switchNav(
        "activity"
    );

    renderActivity();

}


/* =========================================================
   HOME PAGE HOOK
   ========================================================= */

function openHome() {

    switchNav(
        "home"
    );

    renderHome();

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.tgnWallet = {

    ...(window.tgnWallet || {}),

    switchNav,

    showPage,

    renderHome,

    renderWallet,

    renderActivity,

    renderAirdrop,

    renderProfile,

    loadAirdropTasks,

    claimAirdropTask,

    openHome,

    openWallet,

    openActivity,

    openAirdrop,

    openProfile,

    initializeNavigation,

    updateBalanceUI

};


/* =========================================================
   INITIAL NAVIGATION
   ========================================================= */

try {

    initializeNavigation();

} catch (error) {

    console.warn(
        "Navigation initialization failed:",
        error
    );

}
/* =========================================================
   TGN WALLET - APP.JS
   PART 4
   Deposit / Send / Withdraw / Transactions
   ========================================================= */


/* =========================================================
   AMOUNT HELPERS
   ========================================================= */

function parseAmount(value) {

    const amount =
        Number(
            String(value ?? "")
                .replace(/,/g, "")
                .trim()
        );

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return 0;
    }

    return amount;

}


function validateAmount(
    amount
) {

    const value =
        parseAmount(amount);

    if (
        value <= 0
    ) {

        showAlert(
            "Please enter a valid amount."
        );

        return false;

    }


    if (
        value > tonBalance
    ) {

        showAlert(
            "Insufficient TON balance."
        );

        return false;

    }


    return true;

}


/* =========================================================
   ADDRESS VALIDATION
   ========================================================= */

function validateTonAddress(
    address
) {

    const value =
        String(
            address || ""
        ).trim();


    if (!value) {

        showAlert(
            "Please enter a TON wallet address."
        );

        return false;

    }


    /*
     * Basic TON address validation.
     *
     * Supports:
     * EQ...
     * UQ...
     * 0:...
     * -1:...
     */

    const valid =
        /^(EQ|UQ)[A-Za-z0-9_-]{46,50}$/.test(
            value
        ) ||
        /^-?0:[a-fA-F0-9]{64}$/.test(
            value
        );


    if (!valid) {

        showAlert(
            "Invalid TON wallet address."
        );

        return false;

    }


    return true;

}


/* =========================================================
   SEND TON
   ========================================================= */

async function sendTON(
    recipient,
    amount,
    memo = ""
) {

    try {

        const address =
            String(
                recipient || ""
            ).trim();

        const value =
            parseAmount(
                amount
            );


        if (
            !hasWallet()
        ) {

            showAlert(
                "Please create or import a wallet first."
            );

            return null;

        }


        if (
            !validateTonAddress(
                address
            )
        ) {

            return null;

        }


        if (
            !validateAmount(
                value
            )
        ) {

            return null;

        }


        if (
            address ===
            getWalletAddress()
        ) {

            showAlert(
                "You cannot send TON to the same wallet."
            );

            return null;

        }


        const confirmed =
            await new Promise(
                resolve => {

                    showConfirm(
                        `Send ${formatTON(
                            value
                        )} TON to ${shortAddress(
                            address,
                            8,
                            8
                        )}?`,
                        resolve
                    );

                }
            );


        if (!confirmed) {
            return null;
        }


        haptic(
            "medium"
        );


        /*
         * Create local pending transaction.
         */

        const tx =
            addTransaction({

                type:
                    "send",

                amount:
                    value,

                address:
                    address,

                status:
                    "pending"

            });


        /*
         * Send through Worker.
         *
         * IMPORTANT:
         * Seed/private key is NOT sent.
         * The Worker should only receive
         * the information necessary for
         * the configured transaction flow.
         */

        let result;

        try {

            result =
                await workerRequest(
                    "/send",
                    {

                        method:
                            "POST",

                        body: {

                            from:
                                getWalletAddress(),

                            to:
                                address,

                            amount:
                                value,

                            memo:
                                memo || "",

                            telegramUserId:
                                getUserId()

                        }

                    }
                );

        } catch (error) {

            /*
             * Mark local transaction failed.
             */

            tx.status =
                "failed";

            saveTransactions();

            throw error;

        }


        /*
         * Transaction successful.
         */

        tx.status =
            "confirmed";

        tx.txHash =
            result?.txHash ||
            result?.hash ||
            result?.transactionHash ||
            "";

        saveTransactions();


        /*
         * Refresh balance.
         */

        await refreshBalance();


        haptic(
            "success"
        );


        showAlert(
            "Transaction sent successfully."
        );


        renderActivity();


        return result;


    } catch (error) {

        console.error(
            "Send TON failed:",
            error
        );

        haptic(
            "error"
        );

        showAlert(
            error.message ||
            "Transaction failed."
        );

        return null;

    }

}


/* =========================================================
   SEND FORM
   ========================================================= */

function getSendFormValues() {

    const addressInput =
        document.querySelector(
            "#sendAddress"
        ) ||
        document.querySelector(
            '[name="sendAddress"]'
        ) ||
        document.querySelector(
            '[name="recipient"]'
        ) ||
        document.querySelector(
            '[data-send-address]'
        );


    const amountInput =
        document.querySelector(
            "#sendAmount"
        ) ||
        document.querySelector(
            '[name="sendAmount"]'
        ) ||
        document.querySelector(
            '[name="amount"]'
        ) ||
        document.querySelector(
            '[data-send-amount]'
        );


    const memoInput =
        document.querySelector(
            "#sendMemo"
        ) ||
        document.querySelector(
            '[name="sendMemo"]'
        ) ||
        document.querySelector(
            '[name="memo"]'
        ) ||
        document.querySelector(
            '[data-send-memo]'
        );


    return {

        address:
            addressInput?.value ||
            "",

        amount:
            amountInput?.value ||
            "",

        memo:
            memoInput?.value ||
            "",

        addressInput,

        amountInput,

        memoInput

    };

}


/* =========================================================
   SUBMIT SEND FORM
   ========================================================= */

async function submitSendForm(
    event = null
) {

    if (event) {

        event.preventDefault();

    }


    const form =
        getSendFormValues();


    if (!form.address) {

        showAlert(
            "Please enter recipient address."
        );

        return;

    }


    if (!form.amount) {

        showAlert(
            "Please enter amount."
        );

        return;

    }


    const button =
        document.querySelector(
            "#sendButton"
        ) ||
        document.querySelector(
            '[data-send-button]'
        ) ||
        document.querySelector(
            ".send-btn"
        );


    setLoading(
        button,
        true,
        "Sending..."
    );


    try {

        await sendTON(
            form.address,
            form.amount,
            form.memo
        );


    } finally {

        setLoading(
            button,
            false
        );

    }

}


/* =========================================================
   MAX SEND AMOUNT
   ========================================================= */

function setMaxSendAmount() {

    const input =
        document.querySelector(
            "#sendAmount"
        ) ||
        document.querySelector(
            '[name="sendAmount"]'
        ) ||
        document.querySelector(
            '[data-send-amount]'
        );


    if (!input) {
        return;
    }


    /*
     * Keep a small reserve for
     * network fees.
     */

    const feeReserve =
        0.02;


    const max =
        Math.max(
            0,
            tonBalance -
            feeReserve
        );


    input.value =
        max > 0
            ? max.toFixed(4)
            : "0";

}


/* =========================================================
   DEPOSIT
   ========================================================= */

function openDeposit() {

    if (
        !hasWallet()
    ) {

        showAlert(
            "Please create or import a wallet first."
        );

        return;

    }


    const address =
        getWalletAddress();


    /*
     * Fill existing deposit elements.
     */

    document
        .querySelectorAll(
            "[data-deposit-address], " +
            ".deposit-address"
        )
        .forEach(
            element => {

                element.textContent =
                    address;

            }
        );


    document
        .querySelectorAll(
            "#depositAddress"
        )
        .forEach(
            element => {

                if (
                    "value" in element
                ) {

                    element.value =
                        address;

                } else {

                    element.textContent =
                        address;

                }

            }
        );


    /*
     * Show deposit modal/page
     * if one exists.
     */

    const modal =
        document.querySelector(
            "#depositModal"
        ) ||
        document.querySelector(
            ".deposit-modal"
        );


    if (modal) {

        modal.classList.add(
            "active"
        );

        modal.style.display =
            "";

    }


    haptic(
        "light"
    );

}


/* =========================================================
   CLOSE DEPOSIT
   ========================================================= */

function closeDeposit() {

    const modal =
        document.querySelector(
            "#depositModal"
        ) ||
        document.querySelector(
            ".deposit-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "none";

}


/* =========================================================
   COPY DEPOSIT ADDRESS
   ========================================================= */

async function copyDepositAddress() {

    const address =
        getWalletAddress();


    if (!address) {

        showAlert(
            "Wallet address is not available."
        );

        return false;

    }


    const copied =
        await copyText(
            address
        );


    if (copied) {

        haptic(
            "success"
        );

        showAlert(
            "Wallet address copied."
        );

    }


    return copied;

}


/* =========================================================
   WITHDRAW
   ========================================================= */

async function withdrawTON(
    recipient,
    amount,
    memo = ""
) {

    /*
     * Withdrawal uses the same
     * secure transaction endpoint.
     *
     * If your Worker has a separate
     * /withdraw endpoint, it can be
     * changed there without touching UI.
     */

    return await sendTON(
        recipient,
        amount,
        memo
    );

}


/* =========================================================
   OPEN SEND
   ========================================================= */

function openSend() {

    if (
        !hasWallet()
    ) {

        showAlert(
            "Please create or import a wallet first."
        );

        return;

    }


    const modal =
        document.querySelector(
            "#sendModal"
        ) ||
        document.querySelector(
            ".send-modal"
        );


    if (modal) {

        modal.classList.add(
            "active"
        );

        modal.style.display =
            "";

    }


    haptic(
        "light"
    );

}


/* =========================================================
   CLOSE SEND
   ========================================================= */

function closeSend() {

    const modal =
        document.querySelector(
            "#sendModal"
        ) ||
        document.querySelector(
            ".send-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "none";

}


/* =========================================================
   CLEAR SEND FORM
   ========================================================= */

function clearSendForm() {

    const selectors = [

        "#sendAddress",

        "#sendAmount",

        "#sendMemo",

        '[name="sendAddress"]',

        '[name="sendAmount"]',

        '[name="sendMemo"]'

    ];


    selectors.forEach(
        selector => {

            document
                .querySelectorAll(
                    selector
                )
                .forEach(
                    input => {

                        input.value =
                            "";

                    }
                );

        }
    );

}


/* =========================================================
   TRANSACTION STATUS
   ========================================================= */

function updateTransactionStatus(
    txId,
    status,
    extra = {}
) {

    const tx =
        transactions.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    txId
                )
        );


    if (!tx) {
        return false;
    }


    tx.status =
        status;


    Object.assign(
        tx,
        extra
    );


    saveTransactions();

    renderActivity();

    return true;

}


/* =========================================================
   TRANSACTION DETAIL
   ========================================================= */

function getTransaction(
    txId
) {

    return (
        transactions.find(
            tx =>
                String(
                    tx.id
                ) ===
                String(
                    txId
                )
        ) ||
        null
    );

}


/* =========================================================
   OPEN TRANSACTION DETAIL
   ========================================================= */

function openTransaction(
    txId
) {

    const tx =
        getTransaction(
            txId
        );


    if (!tx) {

        showAlert(
            "Transaction not found."
        );

        return;

    }


    const amount =
        formatTON(
            tx.amount
        );


    const status =
        escapeHtml(
            tx.status
        );


    const address =
        shortAddress(
            tx.address,
            10,
            10
        );


    const message =
        `Type: ${tx.type}\n` +
        `Amount: ${amount} TON\n` +
        `Status: ${status}\n` +
        `Address: ${address}`;


    showAlert(
        message
    );

}


/* =========================================================
   ACTIVITY CLICK
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const item =
            event.target.closest(
                "[data-tx-id]"
            );


        if (!item) {
            return;
        }


        const id =
            item.dataset.txId;


        if (id) {

            openTransaction(
                id
            );

        }

    }
);


/* =========================================================
   SEND BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const sendButton =
            event.target.closest(
                "[data-send], " +
                "#sendButton, " +
                ".send-btn"
            );


        if (
            !sendButton
        ) {
            return;
        }


        /*
         * Avoid catching buttons that
         * belong to another component.
         */

        if (
            sendButton.dataset.action ===
            "open"
        ) {

            openSend();

            return;

        }


        submitSendForm(
            event
        );

    }
);


/* =========================================================
   DEPOSIT BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-deposit], " +
                "#depositButton, " +
                ".deposit-btn"
            );


        if (!button) {
            return;
        }


        event.preventDefault();

        openDeposit();

    }
);


/* =========================================================
   COPY BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-copy-address], " +
                ".copy-address-btn"
            );


        if (!button) {
            return;
        }


        event.preventDefault();


        const address =
            button.dataset.address ||
            getWalletAddress();


        const copied =
            await copyText(
                address
            );


        if (copied) {

            haptic(
                "success"
            );

            const old =
                button.innerHTML;


            button.innerHTML =
                '<i class="fas fa-check"></i>';


            setTimeout(
                () => {

                    button.innerHTML =
                        old;

                },
                1200
            );

        }

    }
);


/* =========================================================
   MAX BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-max], " +
                ".max-btn"
            );


        if (!button) {
            return;
        }


        event.preventDefault();

        setMaxSendAmount();

    }
);


/* =========================================================
   MODAL CLOSE
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const close =
            event.target.closest(
                "[data-close-modal], " +
                ".modal-close"
            );


        if (!close) {
            return;
        }


        const modal =
            close.closest(
                ".modal"
            );


        if (modal) {

            modal.classList.remove(
                "active"
            );

            modal.style.display =
                "none";

        }

    }
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        document
            .querySelectorAll(
                ".modal.active, " +
                ".modal[style*='display']"
            )
            .forEach(
                modal => {

                    modal.classList.remove(
                        "active"
                    );

                    modal.style.display =
                        "none";

                }
            );

    }
);


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.tgnWallet = {

    ...(window.tgnWallet || {}),

    parseAmount,

    validateAmount,

    validateTonAddress,

    sendTON,

    submitSendForm,

    setMaxSendAmount,

    openDeposit,

    closeDeposit,

    copyDepositAddress,

    withdrawTON,

    openSend,

    closeSend,

    clearSendForm,

    updateTransactionStatus,

    getTransaction,

    openTransaction

};


/* =========================================================
   PART 4 READY
   ========================================================= */

console.log(
    "TGN Wallet Part 4 loaded ✓"
);
/* =========================================================
   TGN WALLET - APP.JS
   PART 5
   Referral / Invite / Airdrop / Profile / Final Wiring
   ========================================================= */


/* =========================================================
   BOT USERNAME
   ========================================================= */

const TELEGRAM_BOT_USERNAME =
    "TglXWattetBot";


/* =========================================================
   REFERRAL LINK
   ========================================================= */

function getReferralLink() {

    const userId =
        getUserId();


    if (!userId) {

        return (
            "https://t.me/" +
            TELEGRAM_BOT_USERNAME
        );

    }


    return (
        "https://t.me/" +
        TELEGRAM_BOT_USERNAME +
        "?start=" +
        encodeURIComponent(
            userId
        )
    );

}


/* =========================================================
   UPDATE REFERRAL UI
   ========================================================= */

function renderReferral() {

    const link =
        getReferralLink();


    document
        .querySelectorAll(
            "[data-referral-link], " +
            "#referralLink, " +
            ".referral-link"
        )
        .forEach(
            element => {

                if (
                    "value" in element
                ) {

                    element.value =
                        link;

                } else {

                    element.textContent =
                        link;

                }

            }
        );


    const referralCount =
        Number(
            userData?.referralCount ||
            userData?.referrals ||
            0
        );


    const referralPoints =
        Number(
            userData?.referralPoints ||
            0
        );


    document
        .querySelectorAll(
            "[data-referral-count], " +
            "#referralCount, " +
            ".referral-count"
        )
        .forEach(
            element => {

                element.textContent =
                    formatNumber(
                        referralCount,
                        0
                    );

            }
        );


    document
        .querySelectorAll(
            "[data-referral-points], " +
            "#referralPoints, " +
            ".referral-points"
        )
        .forEach(
            element => {

                element.textContent =
                    formatNumber(
                        referralPoints,
                        0
                    );

            }
        );

}


/* =========================================================
   COPY REFERRAL LINK
   ========================================================= */

async function copyReferralLink() {

    const link =
        getReferralLink();


    const copied =
        await copyText(
            link
        );


    if (copied) {

        haptic(
            "success"
        );

        showAlert(
            "Referral link copied!"
        );

    }


    return copied;

}


/* =========================================================
   TELEGRAM SHARE
   ========================================================= */

function shareReferralLink() {

    const link =
        getReferralLink();


    const text =
        "Join TGN Wallet and earn Airdrop rewards!";


    const shareUrl =
        "https://t.me/share/url" +
        "?url=" +
        encodeURIComponent(
            link
        ) +
        "&text=" +
        encodeURIComponent(
            text
        );


    try {

        if (
            tg?.openTelegramLink
        ) {

            tg.openTelegramLink(
                shareUrl
            );

        } else {

            window.open(
                shareUrl,
                "_blank"
            );

        }

    } catch (error) {

        console.warn(
            "Telegram share failed:",
            error
        );

        window.open(
            shareUrl,
            "_blank"
        );

    }

}


/* =========================================================
   REFERRAL BUTTONS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const copyButton =
            event.target.closest(
                "[data-copy-referral], " +
                "#copyReferral, " +
                ".copy-referral-btn"
            );


        if (copyButton) {

            event.preventDefault();

            copyReferralLink();

            return;

        }


        const shareButton =
            event.target.closest(
                "[data-share-referral], " +
                "#shareReferral, " +
                ".share-referral-btn"
            );


        if (shareButton) {

            event.preventDefault();

            shareReferralLink();

            return;

        }

    }
);


/* =========================================================
   PROFILE STATS
   ========================================================= */

function renderProfileStats() {

    const referrals =
        Number(
            userData?.referralCount ||
            userData?.referrals ||
            0
        );


    const points =
        Number(
            userData?.airdropPoints ||
            userData?.points ||
            0
        );


    const claimed =
        Number(
            userData?.claimedTasks ||
            0
        );


    document
        .querySelectorAll(
            "[data-stat-referrals]"
        )
        .forEach(
            element => {

                element.textContent =
                    formatNumber(
                        referrals,
                        0
                    );

            }
        );


    document
        .querySelectorAll(
            "[data-stat-points]"
        )
        .forEach(
            element => {

                element.textContent =
                    formatNumber(
                        points,
                        0
                    );

            }
        );


    document
        .querySelectorAll(
            "[data-stat-claimed]"
        )
        .forEach(
            element => {

                element.textContent =
                    formatNumber(
                        claimed,
                        0
                    );

            }
        );

}


/* =========================================================
   LOAD USER DATA
   ========================================================= */

async function refreshUserData() {

    const telegramId =
        getUserId();


    if (
        !telegramId ||
        !firebaseReady
    ) {

        return userData;

    }


    try {

        const latest =
            await getUser(
                telegramId
            );


        if (latest) {

            userData =
                latest;

        }


        renderReferral();

        renderProfileStats();

        renderProfile();

        renderAirdrop();


        return userData;


    } catch (error) {

        console.warn(
            "User refresh failed:",
            error
        );

        return userData;

    }

}


/* =========================================================
   AIRDROP OPEN
   ========================================================= */

async function openAirdropPage() {

    switchNav(
        "airdrop"
    );


    await refreshUserData();


    await loadAirdropTasks();

}


/* =========================================================
   AIRDROP CLAIM CLICK
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-claim-task]"
            );


        if (!button) {
            return;
        }


        event.preventDefault();


        const taskId =
            button.dataset.claimTask;


        if (!taskId) {
            return;
        }


        claimAirdropTask(
            taskId,
            button
        );

    }
);


/* =========================================================
   AIRDROP REFRESH
   ========================================================= */

async function refreshAirdrop() {

    await refreshUserData();

    await loadAirdropTasks();

}


/* =========================================================
   PROFILE ACTIONS
   ========================================================= */

function openProfilePage() {

    switchNav(
        "profile"
    );

    renderProfile();

    renderReferral();

    renderProfileStats();

}


function logoutWallet() {

    showConfirm(
        "Remove this wallet from this device?",
        confirmed => {

            if (!confirmed) {
                return;
            }


            clearLocalWallet();


            haptic(
                "success"
            );


            showAlert(
                "Wallet removed from this device."
            );


            if (
                typeof renderWelcome ===
                "function"
            ) {

                renderWelcome();

            } else {

                switchNav(
                    "home"
                );

            }

        }
    );

}


/* =========================================================
   PROFILE BUTTONS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const profile =
            event.target.closest(
                "[data-profile]"
            );


        if (profile) {

            event.preventDefault();

            openProfilePage();

            return;

        }


        const logout =
            event.target.closest(
                "[data-logout-wallet]"
            );


        if (logout) {

            event.preventDefault();

            logoutWallet();

            return;

        }

    }
);


/* =========================================================
   REFRESH ALL UI
   ========================================================= */

function refreshAllUI() {

    renderHome();

    renderWallet();

    renderActivity();

    renderAirdrop();

    renderProfile();

    renderReferral();

    renderProfileStats();

}


/* =========================================================
   PERIODIC BALANCE REFRESH
   ========================================================= */

let balanceTimer =
    null;


function startBalanceRefresh() {

    if (
        balanceTimer
    ) {

        clearInterval(
            balanceTimer
        );

    }


    balanceTimer =
        setInterval(
            async () => {

                if (
                    document.hidden
                ) {
                    return;
                }


                if (
                    hasWallet()
                ) {

                    await refreshBalance();

                }

            },
            30000
        );

}


/* =========================================================
   PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            !document.hidden
        ) {

            if (
                hasWallet()
            ) {

                await refreshBalance();

            }


            if (
                firebaseReady
            ) {

                await refreshUserData();

            }

        }

    }
);


/* =========================================================
   TELEGRAM MAIN BUTTON
   ========================================================= */

function setupTelegramMainButton() {

    if (!tg) {
        return;
    }


    try {

        tg.MainButton.hide();

    } catch (error) {

        console.warn(
            "Telegram MainButton setup failed:",
            error
        );

    }

}


/* =========================================================
   TELEGRAM BACK BUTTON
   ========================================================= */

function setupTelegramBackButton() {

    if (!tg) {
        return;
    }


    try {

        tg.BackButton.onClick(
            () => {

                if (
                    currentPage !==
                    "home"
                ) {

                    switchNav(
                        "home"
                    );

                } else {

                    tg.close();

                }

            }
        );


        tg.BackButton.hide();

    } catch (error) {

        console.warn(
            "Telegram BackButton setup failed:",
            error
        );

    }

}


/* =========================================================
   BACK BUTTON CONTROL
   ========================================================= */

function updateTelegramBackButton() {

    if (!tg?.BackButton) {
        return;
    }


    try {

        if (
            currentPage ===
            "home"
        ) {

            tg.BackButton.hide();

        } else {

            tg.BackButton.show();

        }

    } catch (error) {

        console.warn(
            "BackButton update failed:",
            error
        );

    }

}


/* =========================================================
   WATCH PAGE CHANGES
   ========================================================= */

const originalSwitchNav =
    switchNav;


switchNav = function (
    pageName
) {

    const result =
        originalSwitchNav(
            pageName
        );


    updateTelegramBackButton();


    return result;

};


/* =========================================================
   INITIAL DATA LOAD
   ========================================================= */

async function loadInitialData() {

    try {

        initializeLocalState();

        loadWallet();


        /*
         * Initialize Firebase.
         */

        await initializeFirebase();


        /*
         * Sync Telegram user.
         */

        if (
            firebaseReady &&
            getUserId()
        ) {

            await syncCurrentUser();

            await refreshUserData();

        }


        /*
         * Initialize wallet.
         */

        await initializeWallet();


        /*
         * Initial UI.
         */

        refreshAllUI();


        /*
         * Referral.
         */

        renderReferral();


        /*
         * Telegram controls.
         */

        setupTelegramMainButton();

        setupTelegramBackButton();

        updateTelegramBackButton();


        /*
         * Balance refresh.
         */

        startBalanceRefresh();


        /*
         * Load Airdrop silently.
         */

        if (
            firebaseReady
        ) {

            loadAirdropTasks()
                .catch(
                    error => {

                        console.warn(
                            "Initial Airdrop load failed:",
                            error
                        );

                    }
                );

        }


        console.log(
            "TGN Wallet initial data loaded ✓"
        );


    } catch (error) {

        console.error(
            "Initial data load failed:",
            error
        );


        /*
         * IMPORTANT:
         * Never leave the app blank/frozen.
         */

        try {

            initializeNavigation();

        } catch {}

    }

}


/* =========================================================
   APP STARTUP
   ========================================================= */

async function finalStartApp() {

    if (
        window.__TGN_APP_STARTED
    ) {

        return;

    }


    window.__TGN_APP_STARTED =
        true;


    await loadInitialData();

}


/* =========================================================
   GLOBAL API
   ========================================================= */

window.tgnWallet = {

    ...(window.tgnWallet || {}),

    getReferralLink,

    renderReferral,

    copyReferralLink,

    shareReferralLink,

    renderProfileStats,

    refreshUserData,

    openAirdropPage,

    refreshAirdrop,

    openProfilePage,

    logoutWallet,

    refreshAllUI,

    startBalanceRefresh,

    updateTelegramBackButton

};


/* =========================================================
   HTML COMPATIBILITY GLOBALS
   =========================================================
   These are intentionally exposed because the
   existing index.html may call functions directly
   through onclick="..."
   ========================================================= */

window.switchNav =
    switchNav;

window.openHome =
    openHome;

window.openWallet =
    openWallet;

window.openActivity =
    openActivity;

window.openAirdrop =
    openAirdropPage;

window.openProfile =
    openProfilePage;

window.openDeposit =
    openDeposit;

window.closeDeposit =
    closeDeposit;

window.openSend =
    openSend;

window.closeSend =
    closeSend;

window.sendTON =
    sendTON;

window.withdrawTON =
    withdrawTON;

window.copyDepositAddress =
    copyDepositAddress;

window.copyReferralLink =
    copyReferralLink;

window.shareReferralLink =
    shareReferralLink;

window.claimAirdropTask =
    claimAirdropTask;

window.loadAirdropTasks =
    loadAirdropTasks;

window.refreshAirdrop =
    refreshAirdrop;

window.createWallet =
    createWallet;

window.importWallet =
    importWallet;

window.deleteWallet =
    deleteWallet;


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        finalStartApp,
        {
            once: true
        }
    );

} else {

    finalStartApp();

}


/* =========================================================
   END PART 5
   ========================================================= */

console.log(
    "TGN Wallet Part 5 loaded ✓"
);
/* =========================================================
   TGN WALLET - APP.JS
   PART 6
   Final UI Compatibility / Events / Error Protection
   ========================================================= */


/* =========================================================
   SAFE CLICK HANDLER
   ========================================================= */

function safeClick(
    selector,
    callback
) {

    document.addEventListener(
        "click",
        event => {

            const element =
                event.target.closest(
                    selector
                );


            if (!element) {
                return;
            }


            try {

                callback(
                    event,
                    element
                );

            } catch (error) {

                console.error(
                    "Click handler error:",
                    error
                );

                haptic(
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   HOME BUTTONS
   ========================================================= */

safeClick(
    "[data-home]",
    event => {

        event.preventDefault();

        openHome();

    }
);


/* =========================================================
   WALLET BUTTON
   ========================================================= */

safeClick(
    "[data-wallet]",
    event => {

        event.preventDefault();

        openWallet();

    }
);


/* =========================================================
   ACTIVITY BUTTON
   ========================================================= */

safeClick(
    "[data-activity]",
    event => {

        event.preventDefault();

        openActivity();

    }
);


/* =========================================================
   AIRDROP BUTTON
   ========================================================= */

safeClick(
    "[data-airdrop]",
    event => {

        event.preventDefault();

        openAirdropPage();

    }
);


/* =========================================================
   PROFILE BUTTON
   ========================================================= */

safeClick(
    "[data-profile]",
    event => {

        event.preventDefault();

        openProfilePage();

    }
);


/* =========================================================
   INVITE BUTTON
   ========================================================= */

safeClick(
    "[data-invite], " +
    "#inviteButton, " +
    ".invite-btn",
    event => {

        event.preventDefault();

        shareReferralLink();

    }
);


/* =========================================================
   REFERRAL COPY
   ========================================================= */

safeClick(
    "[data-copy-referral]",
    event => {

        event.preventDefault();

        copyReferralLink();

    }
);


/* =========================================================
   DEPOSIT COPY
   ========================================================= */

safeClick(
    "[data-copy-deposit]",
    event => {

        event.preventDefault();

        copyDepositAddress();

    }
);


/* =========================================================
   DEPOSIT OPEN
   ========================================================= */

safeClick(
    "[data-open-deposit]",
    event => {

        event.preventDefault();

        openDeposit();

    }
);


/* =========================================================
   SEND OPEN
   ========================================================= */

safeClick(
    "[data-open-send]",
    event => {

        event.preventDefault();

        openSend();

    }
);


/* =========================================================
   SEND SUBMIT
   ========================================================= */

safeClick(
    "[data-submit-send]",
    event => {

        event.preventDefault();

        submitSendForm(
            event
        );

    }
);


/* =========================================================
   SEND MAX
   ========================================================= */

safeClick(
    "[data-send-max]",
    event => {

        event.preventDefault();

        setMaxSendAmount();

    }
);


/* =========================================================
   CREATE WALLET BUTTON
   ========================================================= */

safeClick(
    "[data-create-wallet]",
    async (
        event,
        button
    ) => {

        event.preventDefault();


        setLoading(
            button,
            true,
            "Creating..."
        );


        try {

            await createWallet();

        } finally {

            setLoading(
                button,
                false
            );

        }

    }
);


/* =========================================================
   IMPORT WALLET BUTTON
   ========================================================= */

safeClick(
    "[data-import-wallet]",
    event => {

        event.preventDefault();


        const input =
            document.querySelector(
                "#seedPhrase"
            ) ||
            document.querySelector(
                "#importSeed"
            ) ||
            document.querySelector(
                "[data-seed-phrase]"
            );


        if (!input) {

            showAlert(
                "Seed phrase input not found."
            );

            return;

        }


        importWallet(
            input.value
        );

    }
);


/* =========================================================
   DELETE WALLET BUTTON
   ========================================================= */

safeClick(
    "[data-delete-wallet]",
    event => {

        event.preventDefault();

        deleteWallet();

    }
);


/* =========================================================
   AIRDROP REFRESH BUTTON
   ========================================================= */

safeClick(
    "[data-refresh-airdrop]",
    async (
        event,
        button
    ) => {

        event.preventDefault();


        setLoading(
            button,
            true,
            "Refreshing..."
        );


        try {

            await refreshAirdrop();

        } finally {

            setLoading(
                button,
                false
            );

        }

    }
);


/* =========================================================
   GENERAL COPY
   ========================================================= */

safeClick(
    "[data-copy]",
    async (
        event,
        button
    ) => {

        event.preventDefault();


        const value =
            button.dataset.copy ||
            button.getAttribute(
                "data-copy"
            );


        if (!value) {
            return;
        }


        const copied =
            await copyText(
                value
            );


        if (copied) {

            haptic(
                "success"
            );

        }

    }
);


/* =========================================================
   CLOSE BUTTON
   ========================================================= */

safeClick(
    "[data-close]",
    event => {

        event.preventDefault();


        const target =
            event.target.closest(
                "[data-close]"
            );


        const selector =
            target?.dataset.close;


        if (
            selector
        ) {

            const element =
                document.querySelector(
                    selector
                );


            if (element) {

                element.classList.remove(
                    "active"
                );

                element.style.display =
                    "none";

            }

            return;

        }


        closeSend();

        closeDeposit();

    }
);


/* =========================================================
   TAB BUTTONS
   ========================================================= */

safeClick(
    "[data-tab]",
    (
        event,
        button
    ) => {

        event.preventDefault();


        const tab =
            button.dataset.tab;


        if (!tab) {
            return;
        }


        document
            .querySelectorAll(
                "[data-tab]"
            )
            .forEach(
                item => {

                    item.classList.toggle(
                        "active",
                        item === button
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-tab-content]"
            )
            .forEach(
                content => {

                    const name =
                        content.dataset
                            .tabContent;


                    content.style.display =
                        name === tab
                            ? ""
                            : "none";

                }
            );

    }
);


/* =========================================================
   FORM ENTER SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Enter"
        ) {
            return;
        }


        const target =
            event.target;


        if (
            target.matches(
                "#sendAddress, " +
                "#sendAmount, " +
                "#sendMemo"
            )
        ) {

            const form =
                target.closest(
                    "form"
                );


            if (form) {

                event.preventDefault();

                submitSendForm(
                    event
                );

            }

        }

    }
);


/* =========================================================
   INPUT VALIDATION
   ========================================================= */

document.addEventListener(
    "input",
    event => {

        const input =
            event.target;


        if (
            input.matches(
                "#sendAmount, " +
                "[data-send-amount]"
            )
        ) {

            const amount =
                parseAmount(
                    input.value
                );


            const max =
                tonBalance;


            if (
                amount > max
            ) {

                input.classList.add(
                    "input-error"
                );

            } else {

                input.classList.remove(
                    "input-error"
                );

            }

        }

    }
);


/* =========================================================
   ONLINE / OFFLINE
   ========================================================= */

window.addEventListener(
    "online",
    () => {

        console.log(
            "Network online ✓"
        );


        if (
            hasWallet()
        ) {

            refreshBalance();

        }

    }
);


window.addEventListener(
    "offline",
    () => {

        console.warn(
            "Network offline"
        );

    }
);


/* =========================================================
   GLOBAL ERROR PROTECTION
   ========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Global JS error:",
            event.error ||
            event.message
        );


        /*
         * Do NOT replace the whole UI.
         * This prevents one JavaScript error
         * from making the wallet look blank.
         */

    }
);


/* =========================================================
   PROMISE ERROR PROTECTION
   ========================================================= */

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled Promise rejection:",
            event.reason
        );


        /*
         * Prevent browser from treating
         * the error as an app-breaking event.
         */

        event.preventDefault();

    }
);


/* =========================================================
   TELEGRAM THEME
   ========================================================= */

function syncTelegramTheme() {

    if (!tg) {
        return;
    }


    try {

        const params =
            tg.themeParams || {};


        Object.entries(
            params
        )
        .forEach(
            ([key, value]) => {

                if (!value) {
                    return;
                }


                const cssName =
                    "--tg-" +
                    key.replace(
                        /_/g,
                        "-"
                    );


                document.documentElement
                    .style.setProperty(
                        cssName,
                        value
                    );

            }
        );


    } catch (error) {

        console.warn(
            "Telegram theme sync failed:",
            error
        );

    }

}


/* =========================================================
   TELEGRAM VIEWPORT
   ========================================================= */

function syncTelegramViewport() {

    if (!tg) {
        return;
    }


    try {

        if (
            tg.viewportHeight
        ) {

            document.documentElement
                .style.setProperty(
                    "--tg-viewport-height",
                    `${tg.viewportHeight}px`
                );

        }


        if (
            tg.viewportStableHeight
        ) {

            document.documentElement
                .style.setProperty(
                    "--tg-viewport-stable-height",
                    `${tg.viewportStableHeight}px`
                );

        }

    } catch (error) {

        console.warn(
            "Viewport sync failed:",
            error
        );

    }

}


/* =========================================================
   TELEGRAM EVENTS
   ========================================================= */

if (tg) {

    try {

        tg.onEvent(
            "themeChanged",
            syncTelegramTheme
        );


        tg.onEvent(
            "viewportChanged",
            syncTelegramViewport
        );


        syncTelegramTheme();

        syncTelegramViewport();

    } catch (error) {

        console.warn(
            "Telegram event setup failed:",
            error
        );

    }

}


/* =========================================================
   REFRESH UI AFTER WALLET CHANGE
   ========================================================= */

function afterWalletChanged() {

    loadWallet();

    renderHome();

    renderWallet();

    renderProfile();

    renderReferral();


    if (
        hasWallet()
    ) {

        refreshBalance();

    }

}


/* =========================================================
   WALLET EVENT COMPATIBILITY
   ========================================================= */

window.addEventListener(
    "tgn-wallet-updated",
    () => {

        afterWalletChanged();

    }
);


/* =========================================================
   CUSTOM EVENT HELPER
   ========================================================= */

function notifyWalletUpdated() {

    try {

        window.dispatchEvent(
            new CustomEvent(
                "tgn-wallet-updated"
            )
        );

    } catch (error) {

        console.warn(
            "Wallet update event failed:",
            error
        );

    }

}


/* =========================================================
   FINAL GLOBAL API
   ========================================================= */

Object.assign(
    window.tgnWallet,
    {

        safeClick,

        getReferralLink,

        copyReferralLink,

        shareReferralLink,

        renderReferral,

        renderProfileStats,

        refreshUserData,

        refreshAllUI,

        afterWalletChanged,

        notifyWalletUpdated,

        syncTelegramTheme,

        syncTelegramViewport

    }
);


/* =========================================================
   FINAL COMPATIBILITY GLOBALS
   ========================================================= */

window.getReferralLink =
    getReferralLink;

window.renderReferral =
    renderReferral;

window.refreshUserData =
    refreshUserData;

window.refreshAllUI =
    refreshAllUI;

window.syncTelegramTheme =
    syncTelegramTheme;

window.syncTelegramViewport =
    syncTelegramViewport;


/* =========================================================
   FINAL UI REFRESH
   ========================================================= */

setTimeout(
    () => {

        try {

            initializeNavigation();

            renderHome();

            renderWallet();

            renderActivity();

            renderProfile();

            renderReferral();

            renderProfileStats();

        } catch (error) {

            console.warn(
                "Final UI refresh failed:",
                error
            );

        }

    },
    100
);


/* =========================================================
   FINAL LOG
   ========================================================= */

console.log(
    "===================================="
);

console.log(
    "TGN Wallet app.js loaded ✓"
);

console.log(
    "Firebase: separated"
);

console.log(
    "Worker: separated"
);

console.log(
    "Telegram: connected"
);

console.log(
    "Referral Bot:",
    TELEGRAM_BOT_USERNAME
);

console.log(
    "===================================="
);
/* =========================================================
   TGN WALLET - APP.JS
   PART 7
   FINAL WALLET / TON CONNECT / SAFE STARTUP
   ========================================================= */


/* =========================================================
   TON CONNECT
   ========================================================= */

let tonConnectUI = null;


/* =========================================================
   INITIALIZE TON CONNECT
   ========================================================= */

async function initializeTonConnect() {

    try {

        /*
         * TON Connect UI library must already exist
         * in index.html.
         */

        if (
            typeof TON_CONNECT_UI ===
            "undefined"
        ) {

            console.warn(
                "TON Connect UI library not found."
            );

            return null;

        }


        /*
         * Avoid duplicate initialization.
         */

        if (
            tonConnectUI
        ) {

            return tonConnectUI;

        }


        /*
         * IMPORTANT:
         *
         * Replace this with your actual
         * tonconnect-manifest.json URL.
         */

        const manifestUrl =
            window.TON_CONNECT_MANIFEST ||
            (
                window.location.origin +
                "/OTTER-WALLET/tonconnect-manifest.json"
            );


        tonConnectUI =
            new TON_CONNECT_UI.TonConnectUI({

                manifestUrl:

                    manifestUrl

            });


        /*
         * Existing connection.
         */

        try {

            const wallet =
                tonConnectUI.wallet;


            if (
                wallet?.account?.address
            ) {

                window.connectedTonWallet =
                    wallet;


                window.connectedTonAddress =
                    wallet.account.address;


                renderConnectedTonWallet();

            }

        } catch (error) {

            console.warn(
                "TON Connect existing wallet check failed:",
                error
            );

        }


        /*
         * Connection event.
         */

        try {

            tonConnectUI.onStatusChange(
                wallet => {

                    window.connectedTonWallet =
                        wallet || null;


                    window.connectedTonAddress =
                        wallet?.account?.address ||
                        "";


                    renderConnectedTonWallet();


                    try {

                        window.dispatchEvent(
                            new CustomEvent(
                                "ton-wallet-changed",
                                {
                                    detail:
                                        wallet
                                }
                            )
                        );

                    } catch {}

                }
            );

        } catch (error) {

            console.warn(
                "TON Connect status listener failed:",
                error
            );

        }


        return tonConnectUI;


    } catch (error) {

        console.error(
            "TON Connect initialization failed:",
            error
        );

        tonConnectUI =
            null;

        return null;

    }

}


/* =========================================================
   CONNECT TON WALLET
   ========================================================= */

async function connectTonWallet() {

    try {

        const ui =
            await initializeTonConnect();


        if (!ui) {

            showAlert(
                "TON Connect is not available."
            );

            return null;

        }


        haptic(
            "light"
        );


        /*
         * Open official TON Connect UI.
         */

        await ui.openModal();


        return ui;


    } catch (error) {

        console.error(
            "TON wallet connection failed:",
            error
        );


        haptic(
            "error"
        );


        showAlert(
            "Unable to connect wallet."
        );


        return null;

    }

}


/* =========================================================
   DISCONNECT TON WALLET
   ========================================================= */

async function disconnectTonWallet() {

    try {

        if (
            tonConnectUI
        ) {

            await tonConnectUI.disconnect();

        }


        window.connectedTonWallet =
            null;


        window.connectedTonAddress =
            "";


        renderConnectedTonWallet();


        haptic(
            "success"
        );


    } catch (error) {

        console.error(
            "TON disconnect failed:",
            error
        );

    }

}


/* =========================================================
   RENDER CONNECTED TON WALLET
   ========================================================= */

function renderConnectedTonWallet() {

    const address =
        window.connectedTonAddress ||
        "";


    document
        .querySelectorAll(
            "[data-ton-connect-address], " +
            ".ton-connect-address"
        )
        .forEach(
            element => {

                element.textContent =
                    address
                        ? shortAddress(
                            address,
                            8,
                            8
                        )
                        : "Not connected";

            }
        );


    document
        .querySelectorAll(
            "[data-connect-wallet]"
        )
        .forEach(
            button => {

                button.style.display =
                    address
                        ? "none"
                        : "";

            }
        );


    document
        .querySelectorAll(
            "[data-disconnect-wallet]"
        )
        .forEach(
            button => {

                button.style.display =
                    address
                        ? ""
                        : "none";

            }
        );


    document
        .querySelectorAll(
            "[data-ton-connected]"
        )
        .forEach(
            element => {

                element.style.display =
                    address
                        ? ""
                        : "none";

            }
        );

}


/* =========================================================
   CONNECT BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-connect-wallet], " +
                "#connectWallet, " +
                ".connect-wallet-btn"
            );


        if (!button) {
            return;
        }


        event.preventDefault();

        connectTonWallet();

    }
);


/* =========================================================
   DISCONNECT BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-disconnect-wallet], " +
                "#disconnectWallet, " +
                ".disconnect-wallet-btn"
            );


        if (!button) {
            return;
        }


        event.preventDefault();

        disconnectTonWallet();

    }
);


/* =========================================================
   TON CONNECT SEND
   ========================================================= */

async function sendWithTonConnect(
    recipient,
    amountNano
) {

    try {

        if (
            !tonConnectUI
        ) {

            await initializeTonConnect();

        }


        if (
            !tonConnectUI
        ) {

            throw new Error(
                "TON Connect is not initialized."
            );

        }


        if (
            !tonConnectUI.wallet
        ) {

            await connectTonWallet();

        }


        if (
            !tonConnectUI.wallet
        ) {

            throw new Error(
                "Please connect a TON wallet."
            );

        }


        const transaction = {

            validUntil:
                Math.floor(
                    Date.now() / 1000
                ) +
                600,

            messages: [

                {

                    address:
                        recipient,

                    amount:
                        String(
                            amountNano
                        )

                }

            ]

        };


        const result =
            await tonConnectUI.sendTransaction(
                transaction
            );


        return result;


    } catch (error) {

        console.error(
            "TON Connect transaction failed:",
            error
        );


        throw error;

    }

}


/* =========================================================
   OPEN TON CONNECT
   ========================================================= */

window.connectTonWallet =
    connectTonWallet;

window.disconnectTonWallet =
    disconnectTonWallet;

window.sendWithTonConnect =
    sendWithTonConnect;


/* =========================================================
   TON AMOUNT CONVERSION
   ========================================================= */

function tonToNano(
    ton
) {

    const value =
        Number(
            ton
        );


    if (
        !Number.isFinite(
            value
        ) ||
        value <= 0
    ) {

        return "0";

    }


    /*
     * 1 TON = 1,000,000,000 nanotons
     *
     * String arithmetic avoids unnecessary
     * floating point rounding where possible.
     */

    const parts =
        String(
            value
        )
        .split(".");


    const whole =
        parts[0] ||
        "0";


    const decimal =
        (
            parts[1] ||
            ""
        )
        .padEnd(
            9,
            "0"
        )
        .slice(
            0,
            9
        );


    return (
        BigInt(
            whole
        ) *
        1000000000n +
        BigInt(
            decimal ||
            "0"
        )
    ).toString();

}


function nanoToTon(
    nano
) {

    try {

        const value =
            BigInt(
                String(
                    nano
                )
            );


        const whole =
            value /
            1000000000n;


        const decimal =
            (
                value %
                1000000000n
            )
            .toString()
            .padStart(
                9,
                "0"
            );


        return (
            whole.toString() +
            "." +
            decimal
                .replace(
                    /0+$/,
                    ""
                )
        ) || "0";

    } catch {

        return "0";

    }

}


/* =========================================================
   GLOBAL AMOUNT HELPERS
   ========================================================= */

window.tonToNano =
    tonToNano;

window.nanoToTon =
    nanoToTon;


/* =========================================================
   WALLET CONNECT EVENTS
   ========================================================= */

window.addEventListener(
    "ton-wallet-changed",
    event => {

        const wallet =
            event.detail;


        const address =
            wallet?.account?.address ||
            "";


        console.log(
            "TON wallet changed:",
            address
                ? shortAddress(
                    address
                )
                : "Disconnected"
        );


        renderConnectedTonWallet();

    }
);


/* =========================================================
   SAFE WALLET DISPLAY
   ========================================================= */

function renderWalletConnectionStatus() {

    renderConnectedTonWallet();


    const localAddress =
        getWalletAddress();


    document
        .querySelectorAll(
            "[data-local-wallet-address]"
        )
        .forEach(
            element => {

                element.textContent =
                    localAddress
                        ? shortAddress(
                            localAddress,
                            8,
                            8
                        )
                        : "No wallet";

            }
        );

}


/* =========================================================
   FINAL FIREBASE REFRESH
   ========================================================= */

async function finalFirebaseRefresh() {

    try {

        if (
            !firebaseReady
        ) {

            await initializeFirebase();

        }


        if (
            firebaseReady &&
            getUserId()
        ) {

            await syncCurrentUser();

            await refreshUserData();

        }


    } catch (error) {

        console.warn(
            "Final Firebase refresh failed:",
            error
        );

    }

}


/* =========================================================
   FINAL TON INITIALIZATION
   ========================================================= */

async function finalTonInitialization() {

    try {

        await initializeTonConnect();

        renderWalletConnectionStatus();

    } catch (error) {

        console.warn(
            "TON initialization failed:",
            error
        );

    }

}


/* =========================================================
   FINAL APP INITIALIZATION
   ========================================================= */

async function initializeTGNWalletFinal() {

    try {

        /*
         * Telegram.
         */

        if (tg) {

            try {

                tg.ready();

                tg.expand();

            } catch {}

        }


        /*
         * Telegram theme.
         */

        syncTelegramTheme();

        syncTelegramViewport();


        /*
         * Navigation.
         */

        initializeNavigation();


        /*
         * Local state.
         */

        try {

            initializeLocalState();

        } catch (error) {

            console.warn(
                "Local state initialization:",
                error
            );

        }


        /*
         * Load local wallet.
         */

        try {

            loadWallet();

        } catch (error) {

            console.warn(
                "Local wallet load:",
                error
            );

        }


        /*
         * Firebase.
         */

        await finalFirebaseRefresh();


        /*
         * TON Connect.
         */

        await finalTonInitialization();


        /*
         * Wallet balance.
         */

        if (
            hasWallet()
        ) {

            try {

                await refreshBalance();

            } catch (error) {

                console.warn(
                    "Balance refresh:",
                    error
                );

            }

        }


        /*
         * Render everything.
         */

        refreshAllUI();

        renderWalletConnectionStatus();


        /*
         * Airdrop.
         */

        if (
            firebaseReady
        ) {

            loadAirdropTasks()
                .catch(
                    error => {

                        console.warn(
                            "Airdrop initialization:",
                            error
                        );

                    }
                );

        }


        /*
         * Balance timer.
         */

        startBalanceRefresh();


        /*
         * Telegram controls.
         */

        setupTelegramMainButton();

        setupTelegramBackButton();

        updateTelegramBackButton();


        console.log(
            "TGN Wallet FINAL initialization ✓"
        );


    } catch (error) {

        console.error(
            "FINAL initialization error:",
            error
        );


        /*
         * Never wipe the UI because of
         * an initialization error.
         */

        try {

            initializeNavigation();

            refreshAllUI();

        } catch {}

    }

}


/* =========================================================
   STARTUP GUARD
   ========================================================= */

if (
    !window.__TGN_FINAL_STARTED
) {

    window.__TGN_FINAL_STARTED =
        true;


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeTGNWalletFinal,
            {
                once: true
            }
        );

    } else {

        initializeTGNWalletFinal();

    }

}


/* =========================================================
   FINAL GLOBAL API
   ========================================================= */

Object.assign(
    window.tgnWallet,
    {

        initializeTonConnect,

        connectTonWallet,

        disconnectTonWallet,

        sendWithTonConnect,

        tonToNano,

        nanoToTon,

        renderConnectedTonWallet,

        finalFirebaseRefresh,

        finalTonInitialization,

        initializeTGNWalletFinal

    }
);


/* =========================================================
   FINAL LOG
   ========================================================= */

console.log(
    "========================================"
);

console.log(
    " TGN WALLET - APP.JS PART 7 READY ✓"
);

console.log(
    " Telegram Bot: @TglXWattetBot"
);

console.log(
    " Firebase: Connected separately"
);

console.log(
    " Worker: Connected separately"
);

console.log(
    " TON Connect: Ready"
);

console.log(
    "========================================"
);
