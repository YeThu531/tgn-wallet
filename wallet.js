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
        usdtAddress: "0x55d398326f99059fF775485246999027B3197955" // BSC USDT
    },
    ETH: { 
        name: "Ethereum Mainnet", 
        symbol: "ETH", 
        rpc: "https://cloudflare-eth.com",
        usdtAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7" // ETH USDT
    },
    POLYGON: { 
        name: "Polygon Network", 
        symbol: "MATIC", 
        rpc: "https://polygon-rpc.com",
        usdtAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" // Polygon USDT
    }
};

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function transfer(address to, uint amount) returns (bool)"
];

let currentNetwork = "BSC";

document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");
    app.innerHTML = `<div style="color:white; padding:20px; text-align:center;">Initializing Real Web3 Engine...</div>`;

    try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
        
        let walletData = localStorage.getItem("TGN_SECURE_WALLET");

        if (!walletData) {
            renderCreateWalletUI();
        } else {
            renderDashboardUI(JSON.parse(walletData));
        }
    } catch (err) {
        app.innerHTML = `<div style="color:red; padding:20px;">Error loading Web3 Libraries!</div>`;
    }
});

function renderCreateWalletUI() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="font-family: Arial, sans-serif; background-color: #121824; color: #ffffff; min-height: 100vh; padding: 20px; box-sizing: border-box; text-align: center;">
            <h2 style="margin-top: 40px; color: #0088cc;">TGN Web3 Wallet</h2>
            <p style="color: #8a99ad; font-size: 14px; margin-bottom: 40px;">Non-Custodial Multi-Chain Wallet</p>
            <button id="createBtn" style="width: 100%; padding: 15px; border-radius: 12px; border: none; background: #0088cc; color: white; font-weight: bold; font-size: 16px; cursor: pointer;">
                Create New Wallet
            </button>
        </div>
    `;

    document.getElementById("createBtn").addEventListener("click", generateRealWallet);
}

function generateRealWallet() {
    const randomWallet = ethers.Wallet.createRandom();
    const secureData = {
        address: randomWallet.address,
        privateKey: randomWallet.privateKey,
        mnemonic: randomWallet.mnemonic.phrase
    };

    localStorage.setItem("TGN_SECURE_WALLET", JSON.stringify(secureData));
    renderDashboardUI(secureData);
}

async function fetchBalance(address) {
    const nativeBalElem = document.getElementById("nativeBalance");
    const usdtBalElem = document.getElementById("usdtBalance");
    nativeBalElem.innerText = "Fetching...";
    usdtBalElem.innerText = "Fetching...";

    try {
        const net = NETWORKS[currentNetwork];
        const provider = new ethers.providers.JsonRpcProvider(net.rpc);
        
        // Fetch Native Coin (BNB/ETH/MATIC)
        const rawBalance = await provider.getBalance(address);
        const formattedBalance = ethers.utils.formatEther(rawBalance);
        nativeBalElem.innerText = `${parseFloat(formattedBalance).toFixed(4)} ${net.symbol}`;

        // Fetch USDT Token
        const usdtContract = new ethers.Contract(net.usdtAddress, ERC20_ABI, provider);
        const usdtRaw = await usdtContract.balanceOf(address);
        const decimals = await usdtContract.decimals();
        const formattedUsdt = ethers.utils.formatUnits(usdtRaw, decimals);
        usdtBalElem.innerText = `${parseFloat(formattedUsdt).toFixed(2)} USDT`;

    } catch (err) {
        nativeBalElem.innerText = `0.0000 ${NETWORKS[currentNetwork].symbol}`;
        usdtBalElem.innerText = `0.00 USDT`;
    }
}

function renderDashboardUI(wallet) {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="font-family: Arial, sans-serif; background-color: #121824; color: #ffffff; min-height: 100vh; padding: 20px; box-sizing: border-box;">
            
            <!-- Network Switcher -->
            <div style="margin-bottom: 15px; text-align: right;">
                <select id="networkSelect" style="background: #1e293b; color: #38bdf8; border: 1px solid #334155; padding: 6px 12px; border-radius: 8px; font-weight: bold; outline: none;">
                    <option value="BSC">BNB Chain (BSC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="POLYGON">Polygon (MATIC)</option>
                </select>
            </div>

            <!-- Address Section -->
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #8a99ad; font-size: 12px;">EVM WALLET ADDRESS</h3>
                <div style="display: flex; gap: 8px; align-items: center; margin-top: 5px;">
                    <p id="walletAddr" style="margin: 0; flex: 1; font-size: 11px; color: #38bdf8; word-break: break-all; background: #1e293b; padding: 8px; border-radius: 6px;">${wallet.address}</p>
                    <button id="copyBtn" style="background: #0088cc; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">Copy</button>
                </div>
            </div>

            <!-- Assets List Section -->
            <div style="background: #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 12px 0; color: #f59e0b; font-size: 13px;">💰 ASSETS BALANCE</h4>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #334155;">
                    <span id="netSymbol" style="font-size: 14px; font-weight: bold; color: #cbd5e1;">Native Coin</span>
                    <span id="nativeBalance" style="font-size: 16px; font-weight: bold; color: #f59e0b;">Fetching...</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                    <span style="font-size: 14px; font-weight: bold; color: #cbd5e1;">Tether (USDT)</span>
                    <span id="usdtBalance" style="font-size: 16px; font-weight: bold; color: #22c55e;">Fetching...</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button id="receiveBtn" style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #0088cc; color: white; font-weight: bold; cursor: pointer;">Receive</button>
                <button id="sendBtn" style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #222d3d; color: #0088cc; font-weight: bold; cursor: pointer;">Send</button>
            </div>

            <div id="actionArea" style="background: #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px; display: none;"></div>

            <!-- History -->
            <div style="background: #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 13px;">📜 Transaction History</h4>
                <div id="txHistory" style="font-size: 11px; color: #94a3b8;">No recent transactions.</div>
            </div>

            <!-- Recovery Phrase -->
            <div style="background: #1e293b; border-radius: 12px; padding: 15px;">
                <h4 style="margin: 0 0 10px 0; color: #ef4444; font-size: 13px;">⚠️ Secret Recovery Phrase</h4>
                <p style="font-size: 11px; color: #cbd5e1; background: #0f172a; padding: 10px; border-radius: 8px; word-spacing: 4px;">${wallet.mnemonic}</p>
            </div>
        </div>
    `;

    fetchBalance(wallet.address);
    loadHistory();

    document.getElementById("copyBtn").addEventListener("click", () => {
        navigator.clipboard.writeText(wallet.address);
        const btn = document.getElementById("copyBtn");
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = "Copy", 2000);
    });

    document.getElementById("networkSelect").addEventListener("change", (e) => {
        currentNetwork = e.target.value;
        document.getElementById("netSymbol").innerText = NETWORKS[currentNetwork].symbol;
        fetchBalance(wallet.address);
    });document.getElementById("receiveBtn").addEventListener("click", () => {
        const actionArea = document.getElementById("actionArea");
        actionArea.style.display = "block";
        actionArea.innerHTML = `
            <h4 style="margin: 0 0 10px 0; text-align: center; color: #0088cc;">Receive Crypto</h4>
            <div id="qrcode" style="display: flex; justify-content: center; padding: 10px; background: white; border-radius: 8px; width: fit-content; margin: 0 auto 10px auto;"></div>
            <p style="font-size: 10px; color: #94a3b8; text-align: center; word-break: break-all;">${wallet.address}</p>
        `;
        new QRCode(document.getElementById("qrcode"), { text: wallet.address, width: 128, height: 128 });
    });

    document.getElementById("sendBtn").addEventListener("click", () => {
        const actionArea = document.getElementById("actionArea");
        actionArea.style.display = "block";
        actionArea.innerHTML = `
            <h4 style="margin: 0 0 15px 0; color: #0088cc;">Send Crypto</h4>
            <select id="sendAsset" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white;">
                <option value="NATIVE">${NETWORKS[currentNetwork].symbol} (Native Coin)</option>
                <option value="USDT">USDT (Token)</option>
            </select>
            <input id="recipient" type="text" placeholder="Recipient Address (0x...)" style="width: 100%; padding: 10px; margin-bottom: 10px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; box-sizing: border-box;" />
            <input id="amount" type="number" step="any" placeholder="Amount" style="width: 100%; padding: 10px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; box-sizing: border-box;" />
            <button id="confirmSendBtn" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: #22c55e; color: white; font-weight: bold; cursor: pointer;">Confirm Transaction</button>
            <p id="txStatus" style="font-size: 11px; margin-top: 10px; text-align: center;"></p>
        `;

        document.getElementById("confirmSendBtn").addEventListener("click", async () => {
            const assetType = document.getElementById("sendAsset").value;
            const recipient = document.getElementById("recipient").value.trim();
            const amount = document.getElementById("amount").value.trim();
            const txStatus = document.getElementById("txStatus");

            if (!ethers.utils.isAddress(recipient) || !amount || amount <= 0) {
                txStatus.style.color = "#ef4444";
                txStatus.innerText = "Invalid inputs!";
                return;
            }

            try {
                txStatus.style.color = "#f59e0b";
                txStatus.innerText = "Sending Transaction...";
                const net = NETWORKS[currentNetwork];
                const provider = new ethers.providers.JsonRpcProvider(net.rpc);
                const signer = new ethers.Wallet(wallet.privateKey, provider);

                let tx;
                let symbol;

                if (assetType === "NATIVE") {
                    symbol = net.symbol;
                    tx = await signer.sendTransaction({ to: recipient, value: ethers.utils.parseEther(amount) });
                } else {
                    symbol = "USDT";
                    const usdtContract = new ethers.Contract(net.usdtAddress, ERC20_ABI, signer);
                    const decimals = await usdtContract.decimals();
                    const parsedAmount = ethers.utils.parseUnits(amount, decimals);
                    tx = await usdtContract.transfer(recipient, parsedAmount);
                }

                txStatus.style.color = "#22c55e";
                txStatus.innerText = `Success! Tx Hash: ${tx.hash.substring(0, 10)}...`;

                saveHistory({ hash: tx.hash, amount: `${amount} ${symbol}`, to: recipient });
                loadHistory();
                fetchBalance(wallet.address);
            } catch (err) {
                txStatus.style.color = "#ef4444";
                txStatus.innerText = "Transaction failed!";
            }
        });
    });
}function saveHistory(tx) {
    let history = JSON.parse(localStorage.getItem("TGN_TX_HISTORY") || "[]");
    history.unshift(tx);
    localStorage.setItem("TGN_TX_HISTORY", JSON.stringify(history));
}

function loadHistory() {
    const historyContainer = document.getElementById("txHistory");
    let history = JSON.parse(localStorage.getItem("TGN_TX_HISTORY") || "[]");
    if (history.length === 0) {
        historyContainer.innerHTML = "No recent transactions.";
        return;
    }
    historyContainer.innerHTML = history.map(item => `
        <div style="background: #0f172a; padding: 8px; border-radius: 6px; margin-bottom: 6px;">
            <p style="margin: 0; color: #22c55e; font-weight: bold;">Sent ${item.amount}</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 10px;">To: ${item.to.substring(0, 10)}... | Hash: ${item.hash.substring(0, 10)}...</p>
        </div>
    `).join("");
}
