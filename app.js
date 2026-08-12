function switchTab(tabName, element) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }

    const contentArea = document.getElementById('main-content');

    if (tabName === 'home') {
        contentArea.innerHTML = `
            <div class="card-box">
                <div class="card-top">
                    <span>My Wallet</span>
                    <div class="card-icon"><i class="fa-solid fa-gem"></i></div>
                </div>
                <div class="balance-title">0.00 TON</div>
                <div class="balance-sub">$0.00 USD</div>
                <div class="btn-group">
                    <button class="btn-main" onclick="switchTab('wallet', document.querySelectorAll('.nav-item')[3])"><i class="fa-solid fa-arrow-down"></i> Deposit</button>
                    <button class="btn-sub" onclick="switchTab('send', document.querySelectorAll('.nav-item')[2])"><i class="fa-solid fa-arrow-up"></i> Withdraw</button>
                </div>
            </div>

            <div class="section-card">
                <div class="section-label">Wallet Address</div>
                <div class="address-row">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="green-dot"></span>
                        <span class="addr-text">EQBnKobCT...kU4ZC4G</span>
                    </div>
                    <button class="copy-btn" onclick="alert('Address Copied!')">Copy</button>
                </div>
            </div>

            <div class="section-card">
                <div class="section-label" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Tokens</span>
                    <span style="color:#3b82f6; cursor:pointer;" onclick="alert('Refreshed')">Refresh</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:38px; height:38px; background:rgba(59,130,246,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#3b82f6;"><i class="fa-solid fa-gem"></i></div>
                        <div>
                            <div style="font-weight:600; font-size:14px;">TON</div>
                            <div style="font-size:11px; color:#64748b;">Toncoin • Mainnet</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:600; font-size:14px;">0.0000 TON</div>
                        <div style="font-size:11px; color:#64748b;">$0.00</div>
                    </div>
                </div>
            </div>
        `;
    } else if (tabName === 'airdrop') {
        // Designer ပုံစံအတိုင်း Referral လုံးဝမလုပ်ရသေးပါက 0 အတိအကျပြရန်
        contentArea.innerHTML = `
            <div class="airdrop-card-custom">
                <div class="airdrop-title">
                    <i class="fa-solid fa-gift"></i>
                    <span>Airdrop Rewards</span>
                </div>
                <div class="airdrop-desc">Your earned token balance</div>

                <div class="reward-box">
                    <div>
                        <span class="stat-label">Total Rewards</span>
                        <div class="reward-val">0.00 TGN</div>
                    </div>
                    <div class="tgn-badge">TGN</div>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">Claimed</span>
                        <span class="stat-number">0 / 8</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Your Points</span>
                        <span class="stat-number">0</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Referrals</span>
                        <span class="stat-number">0</span>
                    </div>
                </div>
            </div>
        `;
    } else if (tabName === 'activity') {
        contentArea.innerHTML = `<h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Activity</h2><p style="color:#64748b;">No recent activities.</p>`;
    } else if (tabName === 'send') {
        contentArea.innerHTML = `
            <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Send</h2>
            <div style="margin-bottom:14px;">
                <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Recipient Address</label>
                <input type="text" placeholder="UQ... / EQ..." style="width:100%; background:#111827; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; color:#fff;">
            </div>
            <div style="margin-bottom:16px;">
                <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Amount</label>
                <input type="text" placeholder="0.00 TON" style="width:100%; background:#111827; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; color:#fff;">
            </div>
            <button style="width:100%; background:#2563eb; color:#fff; padding:14px; border:none; border-radius:12px; font-weight:600; cursor:pointer;">Confirm Withdrawal</button>
        `;
    } else if (tabName === 'wallet') {
        contentArea.innerHTML = `
            <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Wallet</h2>
            <div class="section-card">
                <div class="section-label">TON Wallet Address</div>
                <div style="font-size:14px; font-weight:600; color:#3b82f6; margin:8px 0 12px 0;">EQBnKobCT...kU4ZC4G</div>
                <button class="btn-main" onclick="alert('Copied!')"><i class="fa-regular fa-copy"></i> Copy Address</button>
            </div>
        `;
    } else if (tabName === 'profile') {
        contentArea.innerHTML = `
            <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Profile</h2>
            <div class="section-card" style="text-align:center; padding:20px;">
                <div style="width:64px; height:64px; background:#1e3a8a; border-radius:50%; margin:0 auto 10px auto; display:flex; justify-content:center; align-items:center; font-size:24px; font-weight:700; color:#3b82f6;">J</div>
                <div style="font-weight:700; font-size:16px;">JAME</div>
                <div style="font-size:13px; color:#3b82f6; margin-top:2px;">@jame158</div>
            </div>
        `;
    }
}

// Initial load
window.onload = function() {
    switchTab('home', document.querySelector('.nav-item'));
};
