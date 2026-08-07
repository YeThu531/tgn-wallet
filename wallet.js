document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    if (app) {
        app.innerHTML = `
            <div style="font-family: Arial, sans-serif; background-color: #121824; color: #ffffff; min-height: 100vh; padding: 20px; box-sizing: border-box;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <div>
                        <h3 style="margin: 0; color: #8a99ad; font-size: 14px;">Total Balance</h3>
                        <h1 style="margin: 5px 0 0 0; font-size: 32px; color: #0088cc;">$1,250.00</h1>
                    </div>
                    <span style="background: #1e293b; padding: 6px 12px; border-radius: 20px; font-size: 12px; color: #38bdf8;">Mainnet</span>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                    <button style="flex: 1; padding: 12px; border-radius: 12px; border: none; background: #0088cc; color: white; font-weight: bold; font-size: 16px; cursor: pointer;">
                        ↓ Receive
                    </button>
                    <button style="flex: 1; padding: 12px; border-radius: 12px; border: none; background: #222d3d; color: #0088cc; font-weight: bold; font-size: 16px; cursor: pointer;">
                        ↑ Send
                    </button>
                </div>

                <!-- Assets List -->
                <h4 style="margin-bottom: 15px; color: #8a99ad;">Assets</h4>
                <div style="background: #1e293b; border-radius: 16px; padding: 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: #0088cc; display: flex; align-items: center; justify-content: center; font-weight: bold;">TON</div>
                        <div>
                            <div style="font-weight: bold;">Toncoin</div>
                            <div style="font-size: 12px; color: #8a99ad;">250 TON</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold;">$1,250.00</div>
                        <div style="font-size: 12px; color: #4ade80;">+2.4%</div>
                    </div>
                </div>
            </div>
        `;
    }
});
