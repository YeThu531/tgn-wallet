let tonBalance = 0.00;

function switchNav(tab) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    if(tab === 'home') document.getElementById('nav-home')?.classList.add('active');
    if(tab === 'activity') document.getElementById('nav-activity')?.classList.add('active');
    if(tab === 'send') document.getElementById('nav-send')?.classList.add('active');
    if(tab === 'wallet') document.getElementById('nav-wallet')?.classList.add('active');
    if(tab === 'airdrop') document.getElementById('nav-airdrop')?.classList.add('active');
    if(tab === 'profile') document.getElementById('nav-profile')?.classList.add('active');

    const content = document.getElementById('content');

    if (tab === 'home') {
        content.innerHTML = `
            <div class="wallet-card">
                <div class="wallet-card-top">
                    <span>My Wallet</span>
                    <div class="wallet-icon-box"><i class="fa-solid fa-gem"></i></div>
                </div>
                <div class="wallet-balance">${tonBalance.toFixed(2)} TON</div>
                <div class="wallet-usd">$0.00 USD</div>
                <div class="wallet-actions">
                    <button class="btn-primary" onclick="switchNav('wallet')"><i class="fa-solid fa-arrow-down"></i> Deposit</button>
                    <button class="btn-secondary" onclick="switchNav('send')"><i class="fa-solid fa-arrow-up"></i> Withdraw</button>
                </div>
            </div>

            <div class="section-box">
                <div class="section-title">Wallet Address</div>
                <div class="address-box">
                    <span class="dot"></span>
                    <span class="address-text">EQBnKobCT...kU4ZC4G</span>
                    <button class="btn-copy" onclick="showToast('Address Copied!')">Copy</button>
                </div>
            </div>

            <div class="section-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span class="section-title" style="margin:0;">Tokens</span>
                    <span style="font-size:12px; color:#60a5fa; cursor:pointer;" onclick="showToast('Refreshed')"><i class="fa-solid fa-rotate"></i> Refresh</span>
                </div>
                <div class="token-item">
                    <div class="token-info">
                        <div class="token-logo"><i class="fa-solid fa-gem"></i></div>
                        <div>
                            <div class="token-name">TON</div>
                            <div class="token-network">Toncoin • Mainnet</div>
                        </div>
                    </div>
                    <div class="token-amt">
                        <div class="amt-val">0.0000 TON</div>
                        <div class="amt-usd">$0.00</div>
                    </div>
                </div>
            </div>
        `;
    } 
    else if (tab === 'airdrop') {
        // မှန်ကန်သော Design အတိုင်း Referral နှင့် Total Rewards များ 0 ဖြင့်စတင်စေရန် ပြင်ဆင်ထားသည်
        content.innerHTML = `
            <div class="airdrop-header-card">
                <div class="airdrop-title-row">
                    <i class="fa-solid fa-gift gift-icon"></i>
                    <h2>Airdrop</h2>
                </div>
                <p class="airdrop-sub">Check your tgn airdrop balance and rewards</p>

                <div class="total-reward-box">
                    <div class="reward-left">
                        <span class="rew-label">Total Rewards</span>
                        <div class="rew-amount">0.00 TGN</div>
                    </div>
                    <div class="tgn-logo-badge">TGN</div>
                </div>

                <div class="airdrop-stats">
                    <div class="stat-item">
                        <span class="stat-lbl">Claimed</span>
                        <span class="stat-val">0 / 8</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-lbl">Your Points</span>
                        <span class="stat-val">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-lbl">Referrals</span>
                        <span class="stat-val">0</span>
                    </div>
                </div>
            </div>
        `;
    }
    else if (tab === 'activity') {
        content.innerHTML = `<h2 class="screen-heading">Activity</h2><p style="color:#64748b; font-size:13px;">No recent activities found.</p>`;
    }
    else if (tab === 'send') {
        content.innerHTML = `
            <h2 class="screen-heading">Send</h2>
            <div class="form-group">
                <label>Recipient Address</label>
                <input type="text" placeholder="UQ... / EQ...">
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="text" placeholder="0.00 TON">
            </div>
            <button class="btn-full glow-btn" onclick="showToast('Withdrawal confirmed')">Confirm Withdrawal</button>
        `;
    }
    else if (tab === 'wallet') {
        content.innerHTML = `
            <h2 class="screen-heading">Wallet</h2>
            <div class="section-box">
                <span class="section-title">TON Wallet Address</span>
                <div style="font-size:14px; font-weight:600; color:#60a5fa; margin:8px 0 12px 0;">EQBnKobCT...kU4ZC4G</div>
                <button class="btn-full glow-btn" onclick="showToast('Address Copied!')"><i class="fa-regular fa-copy"></i> Copy Address</button>
            </div>
        `;
    }
    else if (tab === 'profile') {
        content.innerHTML = `
            <h2 class="screen-heading">Profile</h2>
            <div class="section-box" style="text-align:center; padding:20px;">
                <div style="width:64px; height:64px; background:#1e3a8a; border-radius:50%; margin:0 auto 10px auto; display:flex; justify-content:center; align-items:center; font-size:24px; font-weight:700; color:#60a5fa;">J</div>
                <div style="font-weight:700; font-size:16px;">JAME</div>
                <div style="font-size:13px; color:#60a5fa; margin-top:2px;">@jame158</div>
            </div>
        `;
    }
}

function showToast(msg) {
    let t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// Initial Load
switchNav('home');
