// Dynamic States
let tonBalance = 0.00;
let tgnAirdropBalance = 0.00;
const userWalletAddress = "EQBnKobCT_kU4ZC4G89x2_TGN_Wallet_Address";

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = "position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:#0d172e; border:1px solid #2563eb; color:#fff; padding:10px 20px; border-radius:20px; font-size:12px; z-index:999; display:none;";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2000);
}

function switchTab(tabName, element) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (element) element.classList.add('active');

  const contentArea = document.getElementById('main-content');

  // HOME TAB
  if (tabName === 'home') {
    contentArea.innerHTML = `
      <div style="background: linear-gradient(135deg, #10192d 0%, #0a0f1d 100%); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 20px; padding: 20px; margin-bottom: 14px; color: #fff;">
        <div style="display:flex; justify-content:space-between; color:#94a3b8; font-size:13px; font-weight:600;">
          <span>My Wallet</span>
          <i class="fa-solid fa-gem" style="color:#3b82f6;"></i>
        </div>
        <div style="font-size:28px; font-weight:800; color:#fff; margin-top:6px;">${tonBalance.toFixed(2)} TON</div>
        <div style="font-size:12px; color:#64748b; margin-bottom:16px;">≈ $${(tonBalance * 5.5).toFixed(2)} USD</div>
        <div style="display:flex; gap:10px;">
          <button style="flex:1; background:#2563eb; color:#fff; border:none; padding:12px; border-radius:12px; font-weight:600; font-size:13px; cursor:pointer;" onclick="openDepositModal()"><i class="fa-solid fa-arrow-down"></i> Deposit</button>
          <button style="flex:1; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; font-weight:600; font-size:13px; cursor:pointer;" onclick="switchTab('send', document.querySelectorAll('.nav-item')[2])"><i class="fa-solid fa-arrow-up"></i> Withdraw</button>
        </div>
      </div>

      <div style="background:#0d1322; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; margin-bottom:14px; color:#fff;">
        <div style="font-size:11px; color:#64748b; margin-bottom:6px;">Wallet Address</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:#38bdf8; word-break:break-all;">${userWalletAddress}</span>
          <button style="background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:5px 12px; border-radius:8px; font-size:11px; cursor:pointer; margin-left:8px;" onclick="copyAddress()">Copy</button>
        </div>
      </div>

      <div style="background:#0d1322; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; color:#fff;">
        <div style="font-size:13px; font-weight:700; margin-bottom:14px; color:#f8fafc;">Tokens</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:rgba(59,130,246,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#3b82f6;"><i class="fa-solid fa-gem"></i></div>
            <div>
              <div style="font-size:13px; font-weight:700; color:#fff;">TON</div>
              <div style="font-size:11px; color:#64748b;">Toncoin</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px; font-weight:700; color:#fff;">${tonBalance.toFixed(2)} TON</div>
            <div style="font-size:11px; color:#64748b;">$${(tonBalance * 5.5).toFixed(2)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // ACTIVITY TAB
  else if (tabName === 'activity') {
    contentArea.innerHTML = `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:16px; color:#fff;">Activity</h2>
      <div style="background:#0d1322; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:30px 20px; text-align:center;">
        <i class="fa-solid fa-clock-rotate-left" style="font-size:32px; color:#334155; margin-bottom:12px;"></i>
        <p style="color:#64748b; font-size:13px;">No recent activities.</p>
      </div>
    `;
  }

  // SEND TAB
  else if (tabName === 'send') {
    contentArea.innerHTML = `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:16px; color:#fff;">Send TON</h2>
      <div style="background:#0d1322; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; color:#fff;">
        <div style="margin-bottom:14px;">
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Recipient Address</label>
          <input type="text" placeholder="UQ... or EQ..." style="width:100%; background:#060911; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; color:#fff; font-size:13px; outline:none;">
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Amount (TON)</label>
          <input type="number" placeholder="0.00" style="width:100%; background:#060911; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; color:#fff; font-size:13px; outline:none;">
        </div>
        <button style="width:100%; background:#2563eb; color:#fff; border:none; padding:12px; border-radius:12px; font-weight:600; font-size:13px; cursor:pointer;" onclick="showToast('Insufficient Balance')">Confirm Withdrawal</button>
      </div>
    `;
  }

  // WALLET TAB
  else if (tabName === 'wallet') {
    contentArea.innerHTML = `
      <h2 style="font-size:20px; font-weight:700; margin-bottom:16px; color:#fff;">Wallet Details</h2>
      <div style="background:#0d1322; border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:16px; color:#fff;">
        <div style="font-size:12px; color:#64748b;">TON Network Address</div>
        <div style="font-size:12px; font-weight:600; color:#38bdf8; margin:10px 0 14px 0; word-break:break-all;">${userWalletAddress}</div>
        <button style="width:100%; background:#2563eb; color:#fff; border:none; padding:12px; border-radius:12px; font-weight:600; font-size:13px; cursor:pointer;" onclick="copyAddress()"><i class="fa-regular fa-copy"></i> Copy Address</button>
      </div>
    `;
  }

  // AIRDROP TAB
  else if (tabName === 'airdrop') {
    contentArea.innerHTML = `
      <div style="background:linear-gradient(135deg, #0d1222 0%, #080c18 100%); border:1px solid rgba(139,92,246,0.25); border-radius:20px; padding:20px; margin-bottom:16px; color:#fff;">
        <div style="display:flex; gap:12px; margin-bottom:16px;">
          <i class="fa-solid fa-gift" style="font-size:24px; color:#ef4444;"></i>
          <div>
            <div style="font-size:18px; font-weight:700; color:#fff;">Airdrop Rewards</div>
            <div style="font-size:12px; color:#64748b;">Your earned token balance</div>
          </div>
        </div>

        <div style="background:#060911; border:1px solid rgba(139,92,246,0.2); border-radius:16px; padding:16px; display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <span style="font-size:11px; color:#64748b;">Total Rewards</span>
            <div style="font-size:22px; font-weight:800; color:#fff;">${tgnAirdropBalance.toFixed(2)} TGN</div>
          </div>
          <div style="background:rgba(139,92,246,0.2); color:#c084fc; padding:4px 12px; border-radius:12px; font-size:12px; font-weight:700;">TGN</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; background:#060911; padding:12px; border-radius:12px; text-align:center;">
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Claimed</span>
            <span style="font-size:13px; font-weight:700; color:#fff;">0 / 8</span>
          </div>
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Your Points</span>
            <span style="font-size:13px; font-weight:700; color:#fff;">0</span>
          </div>
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Referrals</span>
            <span style="font-size:13px; font-weight:700; color:#fff;">0</span>
          </div>
        </div>
      </div>
    `;
  }

  // PROFILE TAB (FIXED DARK BACKGROUNDS ON ALL MENU ITEMS)
  else if (tabName === 'profile') {
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h2 style="font-size:20px; font-weight:700; color:#fff;">Profile</h2>
          <div style="font-size:11px; color:#64748b;">Manage your account and preferences</div>
        </div>
        <i class="fa-solid fa-gem" style="font-size:24px; color:#3b82f6;"></i>
      </div>

      <div style="background:linear-gradient(135deg, #0d172e 0%, #090e1a 100%); border:1px solid rgba(59,130,246,0.25); border-radius:20px; padding:18px; margin-bottom:16px; color:#fff;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="position:relative; width:52px; height:52px; background:#2563eb; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:20px; color:#fff;">
              <i class="fa-solid fa-user"></i>
            </div>
            <div>
              <div style="font-size:15px; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px;">
                Otter User <i class="fa-solid fa-pen" style="font-size:10px; color:#64748b;"></i>
              </div>
              <div style="font-size:11px; color:#38bdf8;">@otter_user</div>
              <div style="display:inline-block; background:rgba(34,197,94,0.15); color:#22c55e; font-size:10px; font-weight:600; padding:2px 8px; border-radius:10px; margin-top:4px;">
                <i class="fa-solid fa-circle-check"></i> Verified User
              </div>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:#475569; font-size:12px;"></i>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; background:#060911; padding:12px; border-radius:12px; text-align:center;">
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Wallet ID</span>
            <span style="font-size:11px; font-weight:700; color:#fff;">#TGN100245</span>
          </div>
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Member Since</span>
            <span style="font-size:11px; font-weight:700; color:#fff;">May 10, 2025</span>
          </div>
          <div>
            <span style="font-size:10px; color:#64748b; display:block;">Account Status</span>
            <span style="font-size:11px; font-weight:700; color:#22c55e;">Active</span>
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
        ${renderMenuItem('fa-user', 'Personal Information', 'Update your name, username and avatar')}
        ${renderMenuItem('fa-shield-halved', 'Security', 'Password, 2FA and security settings')}
        ${renderMenuItem('fa-bell', 'Notifications', 'Manage your notification preferences')}
        ${renderMenuItem('fa-credit-card', 'Payment Methods', 'Manage saved addresses and methods')}
        ${renderMenuItem('fa-globe', 'Language', 'Select your preferred language')}
        ${renderMenuItem('fa-circle-question', 'Help & Support', 'FAQs, support tickets and guides')}
        ${renderMenuItem('fa-circle-info', 'About TGNWallet', 'App info, terms and privacy policy')}
        
        <div style="background:#0d1322 !important; border:1px solid rgba(239, 68, 68, 0.25) !important; border-radius:14px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="showToast('Logging Out...')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:rgba(239, 68, 68, 0.15); border-radius:10px; display:flex; justify-content:center; align-items:center; color:#ef4444; font-size:15px;">
              <i class="fa-solid fa-right-from-bracket"></i>
            </div>
            <div>
              <div style="font-size:13px; font-weight:700; color:#ef4444;">Log Out</div>
              <div style="font-size:10px; color:#94a3b8;">Sign out from your account</div>
            </div>
          </div>
          <i class="fa-solid fa-chevron-right" style="color:#ef4444; font-size:12px;"></i>
        </div>
      </div>
    `;
  }
}

// Menu Items Helper (Explicit Dark Blue Background)
function renderMenuItem(icon, title, desc) {
  return `
    <div style="background:#0d1322 !important; border:1px solid rgba(255,255,255,0.06) !important; border-radius:14px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="showToast('${title}')">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:36px; height:36px; background:rgba(59,130,246,0.1); border-radius:10px; display:flex; justify-content:center; align-items:center; color:#3b82f6; font-size:15px;">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div>
          <div style="font-size:13px; font-weight:600; color:#f8fafc;">${title}</div>
          <div style="font-size:10px; color:#64748b;">${desc}</div>
        </div>
      </div>
      <i class="fa-solid fa-chevron-right" style="color:#475569; font-size:12px;"></i>
    </div>
  `;
}

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
    <div style="background:#0d121f; border-top:1px solid rgba(255,255,255,0.1); border-radius:24px 24px 0 0; width:100%; padding:20px; color:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div style="font-size:15px; font-weight:700; color:#fff;">Deposit TON</div>
        <i class="fa-solid fa-xmark" style="font-size:18px; color:#64748b; cursor:pointer;" onclick="closeModal()"></i>
      </div>
      
      <div style="text-align:center;">
        <p style="font-size:11px; color:#94a3b8; margin-bottom:14px;">
          Send TON to the deposit address below from Tonkeeper or Exchange
        </p>
        
        <div style="background:#fff; padding:8px; border-radius:12px; display:inline-block; margin-bottom:14px;">
          <img src="${qrCodeUrl}" alt="Deposit QR" style="width:150px; height:150px; display:block;">
        </div>

        <div style="background:#060911; border:1px solid rgba(59,130,246,0.3); border-radius:10px; padding:10px; font-size:11px; color:#38bdf8; word-break:break-all; margin-bottom:14px;">
          ${userWalletAddress}
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <button style="width:100%; background:#2563eb; color:#fff; border:none; padding:12px; border-radius:12px; font-weight:600; font-size:13px; cursor:pointer;" onclick="copyAddress()"><i class="fa-regular fa-copy"></i> Copy Address</button>
          <a href="${tonkeeperUrl}" target="_blank" style="text-decoration:none;">
            <button style="width:100%; background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:12px; font-weight:600; font-size:13px; cursor:pointer;"><i class="fa-solid fa-wallet"></i> Pay via Tonkeeper</button>
          </a>
        </div>
      </div>
    </div>
  `;
}

function copyAddress() {
  if (navigator.clipboard) navigator.clipboard.writeText(userWalletAddress);
  showToast('Address Copied!');
}

function closeModal() {
  const modal = document.getElementById('deposit-modal');
  if (modal) modal.remove();
}

document.addEventListener('DOMContentLoaded', () => {
  const firstNavItem = document.querySelector('.nav-item');
  switchTab('home', firstNavItem);
});
