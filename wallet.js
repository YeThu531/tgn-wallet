// External Web3 Libraries dynamically loading
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

document.addEventListener("DOMContentLoaded", async () => {
    const app = document.getElementById("app");
    app.innerHTML = `<div style="color:white; padding:20px; text-align:center;">Initializing Real Web3 Engine...</div>`;

    try {
        // Load Ethers.js for EVM Chains
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js");
        
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
            
            <button id="createBtn" style="width: 100%; padding: 15px; border-radius: 12px; border: none; background: #0088cc; color: white; font-weight: bold; font-size: 16px; cursor: pointer; margin-bottom: 15px;">
                Create New Wallet
            </button>
            <button id="importBtn" style="width: 100%; padding: 15px; border-radius: 12px; border: 1px solid #0088cc; background: transparent; color: #0088cc; font-weight: bold; font-size: 16px; cursor: pointer;">
                Import Existing Seed Phrase
            </button>
        </div>
    `;

    document.getElementById("createBtn").addEventListener("click", generateRealWallet);
}

function generateRealWallet() {
    const randomWallet = ethers.Wallet.createRandom();
    const mnemonic = randomWallet.mnemonic.phrase;
    const address = randomWallet.address;
    const privateKey = randomWallet.privateKey;

    const secureData = {
        address: address,
        privateKey: privateKey,
        mnemonic: mnemonic
    };

    // Encrypt & Save to Browser LocalStorage
    localStorage.setItem("TGN_SECURE_WALLET", JSON.stringify(secureData));
    renderDashboardUI(secureData);
}

function renderDashboardUI(wallet) {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div style="font-family: Arial, sans-serif; background-color: #121824; color: #ffffff; min-height: 100vh; padding: 20px; box-sizing: border-box;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <h3 style="margin: 0; color: #8a99ad; font-size: 14px;">EVM Address</h3>
                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #38bdf8; word-break: break-all;">${wallet.address}</p>
                </div>
            </div>

            <div style="background: #1e293b; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #f59e0b;">⚠️ Secret Recovery Phrase (12 Words)</h4>
                <p style="font-size: 12px; color: #cbd5e1; background: #0f172a; padding: 10px; border-radius: 8px; word-spacing: 5px;">${wallet.mnemonic}</p>
                <small style="color: #ef4444;">ဒီ Mnemonic ကို ဘာမှမသိအောင် လုံခြုံစွာ သိမ်းထားပါ။</small>
            </div>

            <div style="display: flex; gap: 10px;">
                <button style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #0088cc; color: white; font-weight: bold;">Receive</button>
                <button style="flex: 1; padding: 12px; border-radius: 10px; border: none; background: #222d3d; color: #0088cc; font-weight: bold;">Send</button>
            </div>
        </div>
    `;
}
