document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    if (app) {
        app.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: sans-serif;">
                <h2>Welcome to TGN Wallet</h2>
                <p>Your Telegram Mini App is ready!</p>
            </div>
        `;
    }
});
