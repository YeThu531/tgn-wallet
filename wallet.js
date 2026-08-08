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
    BSC: { name: "BNB Smart Chain", symbol: "BNB", rpc: "https://bsc-dataseed.binance.org/", icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    ETH: { name: "Ethereum", symbol: "ETH", rpc: "https://cloudflare-eth.com", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    POLYGON: { name: "Polygon", symbol: "MATIC", rpc: "https://polygon-rpc.com", icon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
    ARBITRUM: { name: "Arbitrum One", symbol: "ETH", rpc: "https://arb1.arbitrum.io/rpc", icon: "https://assets.coingecko.com/coins/images/16547/small/arbitrum_logo.png" },
    OPTIMISM: { name: "Optimism", symbol: "ETH", rpc: "https://mainnet.optimism.io", icon: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
    AVAX: { name: "Avalanche C-Chain", symbol: "AVAX", rpc: "https://api.avax.network/ext/bc/C/rpc", icon: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
    BASE: { name: "Base Network", symbol: "ETH", rpc: "https://mainnet.base.org", icon: "https://assets.coingecko.com/coins/images/31323/small/base.png" }
};

const TOKEN_LIST = [
    { name: "Tether USD", symbol: "USDT", icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
    { name: "USD Coin", symbol: "USDC", icon: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png" },
    { name: "BNB Smart Chain", symbol: "BNB", icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    { name: "Ethereum", symbol: "ETH", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    { name: "Polygon", symbol: "MATIC", icon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
    { name: "Avalanche", symbol: "AVAX", icon: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" }
];

let currentNetwork = "BSC";
let activeTab = "WALLET";

document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");
    app.innerHTML = `<div style="color:white; padding:50px; text-align:center;">Loading Wallet Engine...</div>`;

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
        app.innerHTML = `<div style="color:red; padding:20px; text-align:center;">Failed to load Engine!</div>`;
    }
});

function renderInitWalletUI() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; background-color:#0e1621; color:#ffffff; min-height:100vh; padding:30px 20px; box-sizing:border-box; text-align:center;">
            <div style="font-size:50px; margin-top:40px;">👛</div>
            <h2 style="color:#ffffff; font-size:24px; margin-top:10px;">TGN Wallet</h2>
            <p style="color:#708499; font-size:13px; margin-bottom:50px;">Secure & Non-Custodial Multi-Chain Wallet</p>
            
            <button id="createBtn" style="width:100%; padding:16px; border-radius:14px; border:none; background:#248bca; color:white; font-weight:bold; font-size:15px; cursor:pointer; margin-bottom:12px;">
                Create New Wallet
            </button>
            <button id="importBtn" style="width:100%; padding:16px; border-radius:14px; border:1px solid #242f3d; background:#17212b; color:#248bca; font-weight:bold; font-size:15px; cursor:pointer;">
                Import Existing Wallet
            </button>
            
            <div id="importBox" style="display:none; margin-top:20px; text-align:left; background:#17212b; padding:15px; border-radius:14px;">
                <label style="font-size:12px; color:#708499;">Enter 12-Word Recovery Phrase:</label>
                <textarea id="mnemonicInput" rows="3" style="width:100%; margin-top:8px; background:#0e1621; color:white; border:1px solid #242f3d; border-radius:8px; padding:10px; box-sizing:border-box; font-size:12px;"></textarea>
                <button id="confirmImportBtn" style="width:100%; margin-top:10px; padding:12px; background:#22c55e; border:none; border-radius:8px; color:white; font-weight:bold; cursor:pointer;">Confirm Import</button>
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
        mnemonic: walletObj.mnemonic ? walletObj.mnemonic.phrase : "Imported via Private Key"
    };
    localStorage.setItem("TGN_SECURE_WALLET", JSON.stringify(secureData));
    renderMainLayout(secureData);
}

function renderMainLayout(wallet) {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; background-color:#0e1621; color:#ffffff; min-height:100vh; padding-bottom:75px; box-sizing:border-box;">
            
            <!-- Top Header -->
            <div style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px; background:#17212b; padding:6px 12px; border-radius:20px; border:1px solid #242f3d;">
                    <img id="netIcon" src="${NETWORKS[currentNetwork].icon}" style="width:18px; height:18px;" />
                    <select id="networkSelect" style="background:transparent; color:white; border:none; font-weight:bold; outline:none; font-size:13px;">
                        ${Object.keys(NETWORKS).map(key => `<option value="${key}" style="background:#17212b;">${NETWORKS[key].name}</option>`).join("")}
                    </select>
                </div>
                <div id="scanBtn" style="font-size:18px; cursor:pointer; background:#17212b; padding:8px; border-radius:50%;">📷</div>
            </div>

            <!-- Main Content Container -->
            <div id="tabContent"></div>

            <!-- Bottom Navigation Bar -->
            <div style="position:fixed; bottom:0; left:0; right:0; height:65px; background:#17212b; display:flex; border-top:1px solid #242f3d; justify-content:space-around; align-items:center; z-index:100;">
                <button class="nav-btn" data-tab="WALLET" style="background:none; border:none; color:#248bca; font-size:11px; text-align:center; cursor:pointer;">
                    <div style="font-size:20px;">👛</div>Wallet
                </button>
                <button class="nav-btn" data-tab="TRADE" style="background:none; border:none; color:#708499; font-size:11px; text-align:center; cursor:pointer;">
                    <div style="font-size:20px;">📈</div>Trade
                </button>
                <button class="nav-btn" data-tab="HISTORY" style="background:none; border:none; color:#708499; font-size:11px; text-align:center; cursor:pointer;">
                    <div style="font-size:20px;">🕒</div>Activity
                </button>
                <button class="nav-btn" data-tab="SETTINGS" style="background:none; border:none; color:#708499; font-size:11px; text-align:center; cursor:pointer;">
                    <div style="font-size:20px;">⚙️</div>Settings
                </button>
            </div><!-- Modal Container -->
            <div id="actionModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:200; padding:20px; box-sizing:border-box;">
                <div style="background:#17212b; border-radius:16px; padding:20px; max-height:85vh; overflow-y:auto; position:relative; margin-top:5vh;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h4 id="modalTitle" style="margin:0; color:white; font-size:16px;">Action</h4>
                        <span id="closeModal" style="color:#708499; font-size:20px; cursor:pointer;">✕</span>
                    </div>
                    <div id="modalBody"></div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("networkSelect").addEventListener("change", (e) => {
        currentNetwork = e.target.value;
        document.getElementById("netIcon").src = NETWORKS[currentNetwork].icon;
        loadTab(activeTab, wallet);
    });

    document.getElementById("closeModal").addEventListener("click", () => {
        document.getElementById("actionModal").style.display = "none";
    });

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const targetTab = e.currentTarget.getAttribute("data-tab");
            activeTab = targetTab;
            document.querySelectorAll(".nav-btn").forEach(b => b.style.color = "#708499");
            e.currentTarget.style.color = "#248bca";
            loadTab(targetTab, wallet);
        });
    });

    loadTab("WALLET", wallet);
}

function loadTab(tab, wallet) {
    const container = document.getElementById("tabContent");
    
    if (tab === "WALLET") {
        container.innerHTML = `
            <div style="text-align:center; padding:20px 0 10px 0;">
                <div style="font-size:38px; font-weight:800; color:white; letter-spacing:-0.5px;">$0.00</div>
                <div id="copyAddrBtn" style="font-size:12px; color:#8e9bae; margin-top:6px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; background:rgba(23,33,43,0.8); padding:5px 12px; border-radius:20px; border:1px solid #242f3d;">
                    <span>${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}</span> 📋
                </div>
            </div>

            <!-- Modern Action Buttons Layout -->
            <div style="display:flex; justify-content:center; gap:28px; margin:28px 0 32px 0;">
                <!-- Send Button -->
                <div id="sendAction" style="text-align:center; cursor:pointer;">
                    <div style="width:54px; height:54px; border-radius:20px; background:linear-gradient(135deg, #0088cc 0%, #005588 100%); display:flex; justify-content:center; align-items:center; font-size:22px; margin:0 auto 8px auto; color:#ffffff; box-shadow: 0 8px 20px rgba(0, 136, 204, 0.3); transition: transform 0.15s ease;">
                        ↗
                    </div>
                    <span style="font-size:12px; font-weight:600; color:#c1c9d3;">Send</span>
                </div>

                <!-- Receive Button -->
                <div id="receiveAction" style="text-align:center; cursor:pointer;">
                    <div style="width:54px; height:54px; border-radius:20px; background:linear-gradient(135deg, #10b981 0%, #047857 100%); display:flex; justify-content:center; align-items:center; font-size:22px; margin:0 auto 8px auto; color:#ffffff; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); transition: transform 0.15s ease;">
                        ↙
                    </div>
                    <span style="font-size:12px; font-weight:600; color:#c1c9d3;">Receive</span>
                </div><!-- Swap Button -->
                <div id="swapAction" style="text-align:center; cursor:pointer;">
                    <div style="width:54px; height:54px; border-radius:20px; background:linear-gradient(135deg, #6366f1 0%, #4338ca 100%); display:flex; justify-content:center; align-items:center; font-size:22px; margin:0 auto 8px auto; color:#ffffff; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3); transition: transform 0.15s ease;">
                        🔄
                    </div>
                    <span style="font-size:12px; font-weight:600; color:#c1c9d3;">Swap</span>
                </div>
            </div>

            <div style="padding:0 20px;">
                <div style="font-size:14px; font-weight:bold; color:#708499; margin-bottom:12px;">Assets</div>
                <div id="tokenAssetList"></div>
            </div>
        `;

        document.getElementById("copyAddrBtn").addEventListener("click", () => {
            navigator.clipboard.writeText(wallet.address);
            alert("Address Copied!");
        });

        document.getElementById("sendAction").addEventListener("click", () => openTokenPicker("Send", wallet));
        document.getElementById("receiveAction").addEventListener("click", () => openTokenPicker("Receive", wallet));

        renderTokenAssets();

    } else if (tab === "SETTINGS") {
        container.innerHTML = `
            <div style="padding:15px 20px;">
                <div style="background:#17212b; border-radius:14px; padding:15px; margin-bottom:15px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="font-size:30px;">👛</div>
                        <div>
                            <div style="font-weight:bold; color:white;">Wallet Main</div>
                            <div style="font-size:11px; color:#708499;">Customize & Backup</div>
                        </div>
                    </div>
                </div>

                <div style="background:#17212b; border-radius:14px; overflow:hidden; margin-bottom:15px;">
                    <div id="backupMenu" style="padding:15px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #242f3d; cursor:pointer;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span>🔍</span> <span style="font-size:14px;">Backup</span>
                        </div>
                        <span style="color:#708499;">›</span>
                    </div>
                    <div id="securityMenu" style="padding:15px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span>🔒</span> <span style="font-size:14px;">Security</span>
                        </div>
                        <span style="color:#708499;">›</span>
                    </div>
                </div>

                <div id="settingSubArea"></div>
            </div>
        `;

        document.getElementById("backupMenu").addEventListener("click", () => {
            const sub = document.getElementById("settingSubArea");
            sub.innerHTML = `
                <div style="background:#17212b; border-radius:14px; padding:15px; margin-top:10px;">
                    <h4 style="margin:0 0 8px 0; color:white; font-size:14px;">Manual Backup</h4>
                    <p style="font-size:11px; color:#708499; margin-bottom:15px;">Back up your wallet manually by writing down the recovery phrase.</p>
                    <button id="showPhraseBtn" style="width:100%; padding:12px; background:#242f3d; border:1px solid #334155; border-radius:10px; color:#248bca; font-weight:bold; cursor:pointer;">
                        🔑 Show recovery phrase
                    </button>
                    <div id="phraseDisplay" style="display:none; margin-top:15px; background:#0e1621; padding:12px; border-radius:8px; font-size:12px; color:#22c55e; word-break:break-all;">
                        ${wallet.mnemonic}
                    </div>
                </div>
            `;document.getElementById("showPhraseBtn").addEventListener("click", () => {
                document.getElementById("phraseDisplay").style.display = "block";
            });
        });

        document.getElementById("securityMenu").addEventListener("click", () => {
            const sub = document.getElementById("settingSubArea");
            sub.innerHTML = `
                <div style="background:#17212b; border-radius:14px; padding:15px; margin-top:10px;">
                    <h4 style="margin:0 0 10px 0; color:white; font-size:14px;">Security Settings</h4>
                    <button id="logoutBtn" style="width:100%; padding:12px; background:#ef4444; border:none; border-radius:10px; color:white; font-weight:bold; cursor:pointer;">Reset Wallet Data</button>
                </div>
            `;
            document.getElementById("logoutBtn").addEventListener("click", () => {
                if (confirm("Reset wallet data? Make sure recovery phrase is saved!")) {
                    localStorage.removeItem("TGN_SECURE_WALLET");
                    location.reload();
                }
            });
        });
    }
}

function renderTokenAssets() {
    const list = document.getElementById("tokenAssetList");
    list.innerHTML = TOKEN_LIST.map(t => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#17212b; padding:12px 15px; border-radius:14px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:12px;">
                <img src="${t.icon}" style="width:32px; height:32px; border-radius:50%;" />
                <div>
                    <div style="font-weight:bold; font-size:14px; color:white;">${t.symbol}</div>
                    <div style="font-size:11px; color:#708499;">${t.name}</div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold; font-size:14px; color:white;">0.0000</div>
                <div style="font-size:11px; color:#22c55e;">$0.00</div>
            </div>
        </div>
    `).join("");
}

function openTokenPicker(actionType, wallet) {
    const modal = document.getElementById("actionModal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");
    
    title.innerText = `${actionType} - Select Token`;
    modal.style.display = "block";

    body.innerHTML = TOKEN_LIST.map(t => `
        <div class="token-item" style="display:flex; align-items:center; gap:12px; padding:12px; border-bottom:1px solid #242f3d; cursor:pointer;">
            <img src="${t.icon}" style="width:28px; height:28px; border-radius:50%;" />
            <div>
                <div style="font-weight:bold; font-size:14px; color:white;">${t.symbol}</div>
                <div style="font-size:11px; color:#708499;">${NETWORKS[currentNetwork].name}</div>
            </div>
        </div>
    `).join("");

    document.querySelectorAll(".token-item").forEach((item, idx) => {
        item.addEventListener("click", () => {
            const selectedToken = TOKEN_LIST[idx];
            if (actionType === "Receive") {
                renderReceiveUI(selectedToken, wallet);
            } else {
                renderSendUI(selectedToken, wallet);
            }
        });
    });
}function renderReceiveUI(token, wallet) {
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    title.innerText = `Receive ${token.symbol}`;
    body.innerHTML = `
        <div style="text-align:center; padding:10px 0;">
            <div style="background:white; padding:15px; border-radius:12px; display:inline-block; margin-bottom:15px;">
                <div id="qrcode"></div>
            </div>
            <div style="font-size:12px; color:#708499; margin-bottom:5px;">Network: ${NETWORKS[currentNetwork].name}</div>
            <div style="font-size:11px; background:#0e1621; color:#22c55e; padding:10px; border-radius:8px; word-break:break-all; border:1px solid #242f3d;">
                ${wallet.address}
            </div>
            <button id="copyRecAddr" style="width:100%; margin-top:15px; padding:12px; background:#248bca; border:none; border-radius:10px; color:white; font-weight:bold; cursor:pointer;">
                📋 Copy Address
            </button>
        </div>
    `;

    new QRCode(document.getElementById("qrcode"), {
        text: wallet.address,
        width: 160,
        height: 160
    });

    document.getElementById("copyRecAddr").addEventListener("click", () => {
        navigator.clipboard.writeText(wallet.address);
        alert("Address Copied!");
    });
}

function renderSendUI(token, wallet) {
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    title.innerText = `Send ${token.symbol}`;
    body.innerHTML = `
        <div style="padding:5px 0;">
            <div style="font-size:12px; color:#708499; margin-bottom:15px;">Network: ${NETWORKS[currentNetwork].name}</div>
            
            <label style="font-size:12px; color:#708499;">Recipient Address:</label>
            <input id="sendToAddr" type="text" placeholder="0x..." style="width:100%; margin:6px 0 15px 0; background:#0e1621; color:white; border:1px solid #242f3d; border-radius:8px; padding:12px; box-sizing:border-box; font-size:13px;" />

            <label style="font-size:12px; color:#708499;">Amount (${token.symbol}):</label>
            <input id="sendAmount" type="number" placeholder="0.0" style="width:100%; margin:6px 0 20px 0; background:#0e1621; color:white; border:1px solid #242f3d; border-radius:8px; padding:12px; box-sizing:border-box; font-size:13px;" />

            <button id="submitSendBtn" style="width:100%; padding:14px; background:#248bca; border:none; border-radius:10px; color:white; font-weight:bold; cursor:pointer;">
                Confirm & Send
            </button>
        </div>
    `;

    document.getElementById("submitSendBtn").addEventListener("click", () => {
        const toAddr = document.getElementById("sendToAddr").value.trim();
        const amt = document.getElementById("sendAmount").value.trim();

        if (!toAddr || !amt) {
            alert("Please fill in recipient address and amount!");
            return;
        }

        alert(`Preparing to send ${amt} ${token.symbol} to ${toAddr}...`);
    });
}
