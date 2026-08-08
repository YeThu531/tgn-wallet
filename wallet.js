const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const NETWORKS = {
    BSC: { 
        name: "BNB Smart Chain", 
        symbol: "BNB", 
        rpc: "https://bsc-dataseed.binance.org/",
        cgId: "binancecoin",
        icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png"
    },
    ETH: { 
        name: "Ethereum Mainnet", 
        symbol: "ETH", 
        rpc: "https://cloudflare-eth.com",
        cgId: "ethereum",
        icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png"
    },
    POLYGON: { 
        name: "Polygon Network", 
        symbol: "MATIC", 
        rpc: "https://polygon-rpc.com",
        cgId: "matic-network",
        icon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png"
    }
};

const TOKEN_LIST = [
    { name: "Tether USD", symbol: "USDT", icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png", bscAddr: "0x55d398326f99059fF775485246999027B3197955", ethAddr: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    { name: "USD Coin", symbol: "USDC", icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png", bscAddr: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", ethAddr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
    { name: "BNB Token", symbol: "BNB", icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    { name: "Ethereum", symbol: "ETH", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    { name: "Polygon", symbol: "MATIC", icon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" }
];

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function transfer(address to, uint amount) returns (bool)"
];

let currentNetwork = "BSC";
let activeTab = "WALLET";

document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");
    app.innerHTML = `<div style="color:white; padding:40px; text-align:center;">Loading Professional Web3 Engine...</div>`;

    try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
        
        let walletData = localStorage.getItem("TGN_SECURE_WALLET");

        if (!walletData) {
            renderInitWalletUI();
        } else {
            renderMainLayout(JSON.parse(walletData));
        }
    } catch (err) {
        app.innerHTML = `<div style="color:red; padding:20px; text-align:center;">Failed to load Web3 Engine!</div>`;
    }
});

function renderInitWalletUI() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #ffffff; min-height: 100vh; padding: 25px; box-sizing: border-box; text-align: center;">
            <h2 style="margin-top: 50px; color: #38bdf8; font-size: 26px;">TGN Web3 Wallet</h2>
            <p style="color: #64748b; font-size: 13px; margin-bottom: 40px;">Multi-Chain Decentralized Wallet</p>
            
            <button id="createBtn" style="width: 100%; padding: 15px; border-radius: 12px; border: none; background: #0284c7; color: white; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 15px;">
                ➕ Create New Wallet
            </button>
            <button id="importBtn" style="width: 100%; padding: 15px; border-radius: 12px; border: 1px solid #334155; background: #1e293b; color: #38bdf8; font-weight: bold; font-size: 15px; cursor: pointer;">
                📥 Import Existing Wallet
            </button>
            
            <div id="importBox" style="display:none; margin-top: 20px; text-align: left; background: #1e293b; padding: 15px; border-radius: 12px;">
                <label style="font-size: 12px; color: #94a3b8;">Enter 12-Word Recovery Phrase:</label>
                <textarea id="mnemonicInput" rows="3" style="width: 100%; margin-top: 8px; background: #0f172a; color: white; border: 1px solid #334155; border-radius: 8px; padding: 10px; box-sizing: border-box; font-size: 12px;"></textarea>
                <button id="confirmImportBtn" style="width: 100%; margin-top: 10px; padding: 12px; background: #22c55e; border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">Confirm Import</button>
            </div>
        </div>
    `;

    document.getElementById("createBtn").addEventListener("click", () => {
        const randomWallet = ethers.Wallet.createRandom();
        saveAndLaunchWallet(randomWallet);
    });

    document.getElementById("importBtn").addEventListener("click", () => {
        document.getElementById("importBox").style.display = "block";
    });

    document.getElementById("confirmImportBtn").addEventListener("click", () => {
        const phrase = document.getElementById("mnemonicInput").value.trim();
        try {
            const importedWallet = ethers.Wallet.fromMnemonic(phrase);
            saveAndLaunchWallet(importedWallet);
        } catch (e) {
            alert("Invalid 12-Word Seed Phrase!");
        }
    });
}

function saveAndLaunchWallet(walletObj) {
    const secureData = {
        address: walletObj.address,
        privateKey: walletObj.privateKey,
        mnemonic: walletObj.mnemonic ? walletObj.mnemonic.phrase : "Imported Private Key"
    };
    localStorage.setItem("TGN_SECURE_WALLET", JSON.stringify(secureData));
    renderMainLayout(secureData);
}

function renderMainLayout(wallet) {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="font-family: Arial, sans-serif; background-color: #0b0e14; color: #ffffff; min-height: 100vh; padding-bottom: 70px; box-sizing: border-box;">
            <!-- Top Header -->
            <div style="padding: 15px 20px; background: #161b26; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img id="netIcon" src="${NETWORKS[currentNetwork].icon}" style="width: 20px; height: 20px;" />
                    <select id="networkSelect" style="background: transparent; color: white; border: none; font-weight: bold; outline: none; font-size: 14px;">
                        <option value="BSC" style="background: #161b26;">BNB Chain</option>
                        <option value="ETH" style="background: #161b26;">Ethereum</option>
                        <option value="POLYGON" style="background: #161b26;">Polygon</option>
                    </select>
                </div>
                <button id="copyBtn" style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 5px 10px; border-radius: 6px; font-size: 11px;">Copy Address</button>
            </div>

            <!-- Content Area -->
            <div id="tabContent" style="padding: 15px;"></div>

            <!-- Bottom Navigation Bar (4 Buttons) -->
            <div style="position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background: #161b26; display: flex; border-top: 1px solid #1e293b; justify-content: space-around; align-items: center; z-index: 100;">
                <button class="nav-btn" data-tab="WALLET" style="background:none; border:none; color: #38bdf8; font-size: 11px; text-align:center;">
                    <div style="font-size: 18px;">👛</div>WALLET
                </button>
                <button class="nav-btn" data-tab="TRADE" style="background:none; border:none; color: #64748b; font-size: 11px; text-align:center;">
                    <div style="font-size: 18px;">🔄</div>TRADE
                </button>
                <button class="nav-btn" data-tab="HISTORY" style="background:none; border:none; color: #64748b; font-size: 11px; text-align:center;">
                    <div style="font-size: 18px;">📜</div>HISTORY
                </button>
                <button class="nav-btn" data-tab="SETTINGS" style="background:none; border:none; color: #64748b; font-size: 11px; text-align:center;">
                    <div style="font-size: 18px;">⚙️</div>SETTINGS
                </button>
            </div>
        </div>
    `;// Copy Event
    document.getElementById("copyBtn").addEventListener("click", () => {
        navigator.clipboard.writeText(wallet.address);
        const btn = document.getElementById("copyBtn");
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = "Copy Address", 2000);
    });

    // Network Select Event
    document.getElementById("networkSelect").addEventListener("change", (e) => {
        currentNetwork = e.target.value;
        document.getElementById("netIcon").src = NETWORKS[currentNetwork].icon;
        loadTab(activeTab, wallet);
    });

    // Nav Buttons
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const targetTab = e.currentTarget.getAttribute("data-tab");
            activeTab = targetTab;
            document.querySelectorAll(".nav-btn").forEach(b => b.style.color = "#64748b");
            e.currentTarget.style.color = "#38bdf8";
            loadTab(targetTab, wallet);
        });
    });

    loadTab("WALLET", wallet);
}

function loadTab(tab, wallet) {
    const container = document.getElementById("tabContent");
    if (tab === "WALLET") {
        container.innerHTML = `
            <!-- Search Bar -->
            <input id="tokenSearch" type="text" placeholder="🔍 Search Token or Deposit..." style="width: 100%; padding: 12px; background: #161b26; border: 1px solid #1e293b; border-radius: 10px; color: white; margin-bottom: 15px; box-sizing: border-box;" />

            <!-- Deposit / Send Quick Action -->
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button id="depBtn" style="flex:1; padding:10px; background:#0284c7; border:none; border-radius:8px; color:white; font-weight:bold;">📥 Deposit</button>
                <button id="sendBtn" style="flex:1; padding:10px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#38bdf8; font-weight:bold;">📤 Send</button>
            </div>

            <div id="quickArea" style="display:none; background:#161b26; padding:15px; border-radius:12px; margin-bottom:15px;"></div>

            <!-- Token List -->
            <div id="tokenListContainer"></div>
        `;

        document.getElementById("tokenSearch").addEventListener("input", (e) => {
            renderTokenList(e.target.value.toLowerCase(), wallet);
        });

        document.getElementById("depBtn").addEventListener("click", () => {
            const area = document.getElementById("quickArea");
            area.style.display = "block";
            area.innerHTML = `
                <h4 style="margin:0 0 10px 0; text-align:center; color:#38bdf8;">Deposit Crypto (${NETWORKS[currentNetwork].symbol})</h4>
                <div id="qrcode" style="display:flex; justify-content:center; background:white; padding:10px; border-radius:8px; width:fit-content; margin:0 auto 10px auto;"></div>
                <p style="font-size:10px; color:#94a3b8; text-align:center; word-break:break-all;">${wallet.address}</p>
            `;
            new QRCode(document.getElementById("qrcode"), { text: wallet.address, width: 120, height: 120 });
        });

        renderTokenList("", wallet);} else if (tab === "TRADE") {
        container.innerHTML = `
            <div style="background:#161b26; padding:20px; border-radius:12px; text-align:center;">
                <h3 style="color:#38bdf8; margin-top:0;">🔄 Instant Swap</h3>
                <p style="color:#64748b; font-size:12px;">Decentralized DEX Swap Powered by Web3</p>
                <input type="number" placeholder="0.00 BNB" style="width:100%; padding:12px; margin-bottom:10px; background:#0b0e14; border:1px solid #1e293b; border-radius:8px; color:white;" />
                <div style="font-size:20px; margin:5px 0;">⬇️</div>
                <input type="number" placeholder="0.00 USDT" readonly style="width:100%; padding:12px; margin-bottom:15px; background:#0b0e14; border:1px solid #1e293b; border-radius:8px; color:#64748b;" />
                <button style="width:100%; padding:12px; background:#22c55e; border:none; border-radius:8px; color:white; font-weight:bold;">Swap Tokens</button>
            </div>
        `;
    } else if (tab === "HISTORY") {
        container.innerHTML = `<div style="background:#161b26; padding:15px; border-radius:12px;"><h4 style="color:#38bdf8; margin:0 0 10px 0;">📜 Transaction History</h4><div id="txLogs" style="font-size:12px; color:#94a3b8;">No transactions found on this network.</div></div>`;
    } else if (tab === "SETTINGS") {
        container.innerHTML = `
            <div style="background:#161b26; padding:15px; border-radius:12px;">
                <h4 style="color:#ef4444; margin:0 0 10px 0;">⚠️ Security & Secret Phrase</h4>
                <p style="font-size:11px; color:#94a3b8; background:#0b0e14; padding:10px; border-radius:8px; word-spacing:4px;">${wallet.mnemonic}</p>
                <button id="resetBtn" style="width:100%; margin-top:15px; padding:10px; background:#ef4444; border:none; border-radius:8px; color:white; font-weight:bold; cursor:pointer;">Logout / Reset Wallet</button>
            </div>
        `;
        document.getElementById("resetBtn").addEventListener("click", () => {
            if (confirm("Are you sure? Make sure your secret phrase is backed up!")) {
                localStorage.removeItem("TGN_SECURE_WALLET");
                location.reload();
            }
        });
    }
}

async function renderTokenList(filterText, wallet) {
    const listContainer = document.getElementById("tokenListContainer");
    listContainer.innerHTML = `<div style="text-align:center; color:#64748b; font-size:12px; padding:20px;">Fetching Token Balances...</div>`;

    const filtered = TOKEN_LIST.filter(t => t.name.toLowerCase().includes(filterText) || t.symbol.toLowerCase().includes(filterText));

    let html = "";
    for (let token of filtered) {
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#161b26; padding:12px; border-radius:10px; margin-bottom:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${token.icon}" style="width:30px; height:30px; border-radius:50%;" />
                    <div>
                        <div style="font-weight:bold; font-size:14px;">${token.symbol}</div>
                        <div style="font-size:10px; color:#64748b;">${token.name}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; font-size:14px; color:#38bdf8;">0.0000</div>
                    <div style="font-size:10px; color:#22c55e;">$0.00 USD</div>
                </div>
            </div>
        `;
    }
    listContainer.innerHTML = html || `<div style="text-align:center; color:#64748b; padding:20px;">No tokens found.</div>`;
}
