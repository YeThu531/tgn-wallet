// Global Dynamic States
let tonBalance = 0.00;
let tgnAirdropBalance = 0.00;
const userWalletAddress = "EQBnKobCT_kU4ZC4G89x2_TGN_Wallet_Address";

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = "position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.95); border:1px solid rgba(59,130,246,0.5); color:#fff; padding:10px 20px; border-radius:20px; font-size:12px; z-index:999; display:none;";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

function switchTab(tabName, element) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  }

  const contentArea = document.getElementById('main-content');

  // 1. HOME TAB
  if (tabName === 'home') {
    contentArea.innerHTML = `
      <div class="card-box">
        <div class="card-top">
          <span>My Wallet</span>
          <div class="card-icon"><i class="fa-solid fa-gem"></i></div>
        </div>
        <div class="balance-title">${tonBalance.toFixed(2)} TON</div>
        <div class="balance-sub">≈ $${(tonBalance * 5.5).toFixed(2)} USD</div>
        <div class="btn-group">
          <button class="btn-main" onclick="openDepositModal()"><i class="fa-solid fa-arrow-down"></i> Deposit</button>
          <button class="btn-sub" onclick="switchTab('send', document.querySelectorAll('.nav-item')[2])"><i class="fa-solid fa-arrow-up"></i> Withdraw</button>
        </div>
      </div>

      <div class="section-card">
        <div class="section-label">Wallet Address</div>
        <div class="address-row">
          <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
            <span class="green-dot"></span>
            <span class="addr-text" style="text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${userWalletAddress}</span>
          </div>
          <button class="copy-btn" onclick="copyAddress()">Copy</button>
        </div>
      </div>

      <div class="section-card">
        <div class="section-label" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Tokens</span>
          <span style="color:#3b82f6; cursor:pointer;" onclick="showToast('Refreshed')">Refresh</span>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; background:rgba(59,130,246,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#3b82f6;"><i class="fa-solid fa-gem"></i></div>
            <div>
              <div style="font-weight:600; font-size:14px;">TON</div>
              <div style="font-size:11px; color:#64748b;">Toncoin • Mainnet</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600; font-size:14px;">${tonBalance.toFixed(2)} TON</div>
            <div style="font-size:11px; color:#64748b;">$${(tonBalance * 5.5).toFixed(2)}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; background:rgba(139,92,246,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#a855f7;"><i class="fa-solid fa-rocket"></i></div>
            <div>
              <div style="font-weight:600; font-size:14px;">TGN</div>
              <div style="font-size:11px; color:#64748b;">TGN Ecosystem Token</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600; font-size:14px;">${tgnAirdropBalance.toFixed(2)} TGN</div>
            <div style="font-size:11px; color:#a855f7; font-weight:600;">Unlisted</div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. ACTIVITY TAB
  else if (tabName === 'activity') {
    contentArea.innerHTML = `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Activity</h2>
      <div class="section-card" style="text-align:center; padding:30px 20px;">
        <i class="fa-solid fa-clock-rotate-left" style="font-size:32px; color:#334155; margin-bottom:12px;"></i>
        <p style="color:#64748b; font-size:13px;">No recent activities.</p>
      </div>
    `;
  }

  // 3. SEND TAB (Standard Wallet Address Placeholder Only)
  else if (tabName === 'send') {
    contentArea.innerHTML = `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Send TON</h2>
      <div class="section-card">
        <div style="margin-bottom:14px;">
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Recipient Address</label>
          <input type="text" placeholder="UQ... or EQ..." style="width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; color:#fff; font-size:13px; outline:none;">
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Amount (TON)</label>
          <input type="number" placeholder="0.00" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; color:#fff; font-size:13px; outline:none;">
        </div>
        <button class="btn-main" style="width:100%;" onclick="showToast('Insufficient Balance')">Confirm Withdrawal</button>
      </div>
    `;
  }

  // 4. WALLET TAB
  else if (tabName === 'wallet') {
    contentArea.innerHTML = `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Wallet Details</h2>
      <div class="section-card">
        <div class="section-label">TON Network Address</div>
        <div style="font-size:12px; font-weight:600; color:#38bdf8; margin:10px 0 14px 0; word-break:break-all;">${userWalletAddress}</div>
        <button class="btn-main" style="width:100%;" onclick="copyAddress()"><i class="fa-regular fa-copy"></i> Copy Address</button>
      </div>
    `;
  }

  // 5. AIRDROP TAB (Clean Design - Task များ မပါပါ)
  else if (tabName === 'airdrop') {
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
            <div class="reward-val">${tgnAirdropBalance.toFixed(2)} TGN</div>
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
  }

  // 6. PROFILE TAB (UI DESIGN 100% EXACT MATCHING)
  else if (tabName === 'profile') {
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h2 style="font-size:22px; font-weight:700;">Profile</h2>
          <div style="font-size:12px; color:#64748b;">Manage your account and preferences</div>
        </div>
        <i class="fa-solid fa-gem" style="font-size:28px; color:#3b82f6;"></i>
      </div>

      <div style="background:linear-gradient(135deg, #0d172e 0%, #090e1a 100%); border:1px solid rgba(59,130,246,0.25); border-radius:20px; padding:18px; margin-bottom:16px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="position:relative; width:54px; height:54px; background:#2563eb; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:22px; color:#fff;">
              <i class="fa-solid fa-user"></i>
              <div style="position:absolute; bottom:0; right:0; background:#1d4ed8; width:18px; height:18px; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:9px; border:2px solid #0d172e;">
                <i class="fa-solid fa-camera"></i>
              </div>
            </div>
            <div>
              <div style="font-size:16px; font-weight:700; display:flex; align-items:center; gap:6px;">
                Otter User <i class="fa-solid fa-pen" style="font-size:11px; color:#64748b; cursor:pointer;"></i>
              </div>
              <div style="font-size:12px; color:#38bdf8;">@otter_user</div>
              <div style="display:inline-block; background:rgba(34,197,94,0.15); color:#22c55e; font-size:10px; font-weight:600; padding:2px 8px; border-radius:10px; margin-top:4px;">
                <i class="fa-solid fa-circle-check"></i> Verified User
              </div>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:#475569; font-size:14px;"></i>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; background:rgba(0,0,0,0.3); padding:12px; border-radius:14px; text-align:center;">
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Wallet ID</span>
            <span style="font-size:11px; font-weight:700; color:#cbd5e1;">#TGN100245</span>
          </div>
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Member Since</span>
            <span style="font-size:11px; font-weight:700; color:#cbd5e1;">May 10, 2025</span>
          </div>
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Account Status</span>
            <span style="font-size:11px; font-weight:700; color:#22c55e;">Active</span>
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
        ${renderProfileMenuItem('fa-user', 'Personal Information', 'Update your name, username and avatar')}
        ${renderProfileMenuItem('fa-shield-halved', 'Security', 'Password, 2FA and security settings')}
        ${renderProfileMenuItem('fa-bell', 'Notifications', 'Manage your notification preferences')}
        ${renderProfileMenuItem('fa-credit-card', 'Payment Methods', 'Manage saved addresses and methods')}
        ${renderProfileMenuItem('fa-globe', 'Language', 'Select your preferred language')}
        ${renderProfileMenuItem('fa-circle-question', 'Help & Support', 'FAQs, support tickets and guides')}
        ${renderProfileMenuItem('fa-circle-info', 'About TGNWallet', 'App info, terms and privacy policy')}
        
        <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.2); border-radius:14px; padding:14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; margin-top:6px;" onclick="showToast('Logging Out...')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:rgba(239, 68, 68, 0.15); border-radius:10px; display:flex; justify-content:center; align-items:center; color:#ef4444; font-size:15px;">
              <i class="fa-solid fa-right-from-bracket"></i>
            </div>
            <div>
              <div style="font-size:13.5px; font-weight:700; color:#ef4444;">Log Out</div>
              <div style="font-size:11px; color:#94a3b8;">Sign out from your account</div>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:#ef4444; font-size:12px;"></i>
        </div>
      </div>
    `;
  }
}

// Menu Helper
function renderProfileMenuItem(icon, title, desc) {
  return `
    <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="showToast('${title}')">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:36px; height:36px; background:rgba(59,130,246,0.1); border-radius:10px; display:flex; justify-content:center; align-items:center; color:#3b82f6; font-size:15px;">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div>
          <div style="font-size:13.5px; font-weight:600; color:#f8fafc;">${title}</div>
          <div style="font-size:11px; color:#64748b;">${desc}</div>
        </div>
      </div>
      <i class="fa-solid fa-chevron-right" style="color:#475569; font-size:12px;"></i>
    </div>
  `;
}

// Deposit Modal (Clean English Only)
function openDepositModal() {
  const qrCodeUrl = `https://quickchart.io/qr?text=ton://transfer/${userWalletAddress}&size=180`;
  const tonkeeperUrl = `https://app.tonkeeper.com/transfer/${userWalletAddress}`;

  let modal = document.getElementById('deposit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'deposit-modal';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:flex-end; z-index:100;";
    document.querySelector('.app-container').appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#0d121f; border-top:1px solid rgba(255,255,255,0.1); border-radius:24px 24px 0 0; width:100%; padding:20px; animation:slideUp 0.3s ease;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-size:16px; font-weight:700;">Deposit TON</div>
        <i class="fa-solid fa-xmark" style="font-size:18px; color:#64748b; cursor:pointer;" onclick="closeModal()"></i>
      </div>
      
      <div style="text-align:center;">
        <p style="font-size:12px; color:#94a3b8; margin-bottom:14px;">
          Send TON to the deposit address below from Tonkeeper or Exchange
        </p>
        
        <div style="background:#fff; padding:10px; border-radius:14px; display:inline-block; margin-bottom:14px;">
          <img src="${qrCodeUrl}" alt="Deposit QR Code" style="width:160px; height:160px; display:block;">
        </div>

        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(59,130,246,0.3); border-radius:10px; padding:10px; font-size:11px; color:#38bdf8; word-break:break-all; margin-bottom:14px;">
          ${userWalletAddress}
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="btn-main" onclick="copyAddress()"><i class="fa-regular fa-copy"></i> Copy Address</button>
          <a href="${tonkeeperUrl}" target="_blank" style="text-decoration:none;">
            <button class="btn-sub" style="width:100%;"><i class="fa-solid fa-wallet"></i> Pay via Tonkeeper</button>
          </a>
        </div>
      </div>
    </div>
  `;
}

function copyAddress() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(userWalletAddress);
  }
  showToast('Address Copied!');
}

function closeModal() {
  const modal = document.getElementById('deposit-modal');
  if (modal) {
    modal.remove();
  }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  const firstNavItem = document.querySelector('.nav-item');
  switchTab('home', firstNavItem);
});
