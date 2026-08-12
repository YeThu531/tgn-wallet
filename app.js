// Dynamic Data States
let tonBalance = 0.00; // Real Transaction မလာသေးသမျှ 0.00 TON
let tgnAirdropBalance = 0; // Tasks လုပ်မှသာ တိုးမည့် Airdrop
const userWalletAddress = "EQBnKobCT_kU4ZC4G89x2_TGN_Wallet_Address";
let isCheckedIn = false;
let completedTasks = { joinTg: false, followX: false };

const TON_PRICE_USD = 5.50; // 1 TON Approx Price

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
  }
}

// Bottom Nav Tabs အားလုံး နှိပ်၍ရအောင် ပြင်ဆင်ထားသော Function
function switchTab(tabName, element) {
  // Navigation active style ပြောင်းလဲခြင်း
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  }

  const contentArea = document.getElementById('main-content');
  const usdEquiv = (tonBalance * TON_PRICE_USD).toFixed(2);

  // 1. HOME TAB
  if (tabName === 'home') {
    contentArea.innerHTML = `
      <div class="card-box">
        <div class="card-top">
          <span>My Wallet</span>
          <div class="card-icon"><i class="fa-solid fa-gem"></i></div>
        </div>
        <div class="balance-title">${tonBalance.toFixed(2)} TON</div>
        <div class="balance-sub">≈ $${usdEquiv} USD</div>
        <div class="btn-group">
          <button class="btn-main" onclick="openDepositModal()"><i class="fa-solid fa-arrow-down"></i> Deposit</button>
          <button class="btn-sub" onclick="switchTab('send', document.querySelectorAll('.nav-item')[2])"><i class="fa-solid fa-arrow-up"></i> Withdraw</button>
        </div>
      </div>

      <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span style="font-size:12px; color:#cbd5e1; word-break:break-all;">${userWalletAddress}</span>
        <button style="background:rgba(255,255,255,0.08); border:none; color:#fff; padding:5px 12px; border-radius:8px; cursor:pointer;" onclick="copyAddress()">Copy</button>
      </div>

      <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.05); border-radius:18px; padding:16px;">
        <div style="font-size:13px; color:#94a3b8; margin-bottom:14px;">Your Tokens</div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; background:rgba(59,130,246,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#3b82f6;"><i class="fa-solid fa-gem"></i></div>
            <div>
              <div style="font-weight:700; font-size:14px;">TON</div>
              <div style="font-size:11px; color:#64748b;">Toncoin</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; font-size:14px;">${tonBalance.toFixed(2)} TON</div>
            <div style="font-size:11px; color:#64748b;">$${usdEquiv}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; background:rgba(139,92,246,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#a855f7;"><i class="fa-solid fa-rocket"></i></div>
            <div>
              <div style="font-weight:700; font-size:14px;">TGN</div>
              <div style="font-size:11px; color:#64748b;">TGN Ecosystem Token</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; font-size:14px;">${tgnAirdropBalance} TGN</div>
            <div style="font-size:11px; color:#a855f7; font-weight:600;">Unlisted</div>
          </div>
        </div>
      </div>
    `;
  }
  
  // 2. ACTIVITY TAB
  else if (tabName === 'activity') {
    contentArea.innerHTML = `
      <div style="padding: 10px 0;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Recent Activity</h2>
        <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; text-align: center; color: #64748b;">
          <i class="fa-solid fa-clock-rotate-left" style="font-size: 32px; margin-bottom: 12px; color: #334155;"></i>
          <p style="font-size: 13px;">No transactions yet.</p>
        </div>
      </div>
    `;
  }

  // 3. SEND / WITHDRAW TAB
  else if (tabName === 'send') {
    contentArea.innerHTML = `
      <div style="padding: 10px 0;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Send TON</h2>
        <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 18px;">
          <label style="font-size: 12px; color: #94a3b8; display: block; margin-bottom: 6px;">Recipient Wallet Address</label>
          <input type="text" placeholder="EQ... or Telegram Username" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 13px; outline: none; margin-bottom: 14px;">
          
          <label style="font-size: 12px; color: #94a3b8; display: block; margin-bottom: 6px;">Amount (TON)</label>
          <input type="number" placeholder="0.0" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 13px; outline: none; margin-bottom: 18px;">

          <button class="btn-main" style="width: 100%; padding: 12px;" onclick="showToast('Insufficient TON Balance')">Send Now</button>
        </div>
      </div>
    `;
  }

  // 4. WALLET TAB
  else if (tabName === 'wallet') {
    contentArea.innerHTML = `
      <div style="padding: 10px 0;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Wallet Details</h2>
        <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 18px; margin-bottom: 14px;">
          <span style="font-size: 12px; color: #64748b;">TON Network Address</span>
          <div style="font-size: 13px; color: #38bdf8; font-weight: 600; margin: 8px 0; word-break: break-all;">${userWalletAddress}</div>
          <button class="btn-sub" style="width: 100%; margin-top: 10px;" onclick="copyAddress()"><i class="fa-regular fa-copy"></i> Copy Address</button>
        </div>
      </div>
    `;
  }

  // 5. AIRDROP TAB
  else if (tabName === 'airdrop') {
    renderAirdropTab();
  }

  // 6. PROFILE TAB
  else if (tabName === 'profile') {
    contentArea.innerHTML = `
      <div style="padding:10px 0;">
        <h2 style="font-size:20px; font-weight:700; margin-bottom:16px;">Profile</h2>
        <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; text-align: center;">
          <div style="width: 60px; height: 60px; background: rgba(59,130,246,0.2); color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 12px auto;">
            <i class="fa-solid fa-user"></i>
          </div>
          <div style="font-size: 16px; font-weight: 700;">Otter User</div>
          <div style="font-size: 12px; color: #38bdf8; margin-top: 2px;">@otter_user</div>
        </div>
      </div>
    `;
  }
}

// Airdrop Page View Function
function renderAirdropTab() {
  const contentArea = document.getElementById('main-content');
  contentArea.innerHTML = `
    <div style="background: linear-gradient(135deg, #0d1222 0%, #080c18 100%); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 20px; padding: 20px; margin-bottom: 16px;">
      <div style="display:flex; gap:12px; margin-bottom:18px;">
        <i class="fa-solid fa-gift" style="font-size:24px; color:#ef4444;"></i>
        <div>
          <div style="font-size:20px; font-weight:700;">Airdrop Rewards</div>
          <div style="font-size:12px; color:#64748b;">Complete tasks to earn TGN Tokens</div>
        </div>
      </div>
      <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(139,92,246,0.2); border-radius:16px; padding:18px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:12px; color:#64748b;">Earned Balance</span>
          <div style="font-size:24px; font-weight:800; color:#fff;">${tgnAirdropBalance} TGN</div>
        </div>
        <div style="width:48px; height:48px; background:rgba(139,92,246,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; color:#c084fc; font-weight:700;">TGN</div>
      </div>
    </div>

    <div style="font-size:15px; font-weight:700; margin-bottom:10px;">Daily Rewards</div>
    <div class="task-card">
      <div>
        <div style="font-size:13.5px; font-weight:600;">Daily Check-in</div>
        <div style="font-size:11px; color:#64748b;">Get +50 TGN daily</div>
      </div>
      <button class="task-btn ${isCheckedIn ? 'done' : ''}" onclick="doDailyCheckIn()">${isCheckedIn ? 'Claimed' : 'Claim +50 TGN'}</button>
    </div>

    <div style="font-size:15px; font-weight:700; margin:16px 0 10px 0;">Airdrop Tasks</div>
    
    <div class="task-card">
      <div>
        <div style="font-size:13.5px; font-weight:600;">Join Telegram Channel</div>
        <div style="font-size:11px; color:#64748b;">+100 TGN</div>
      </div>
      <button class="task-btn ${completedTasks.joinTg ? 'done' : ''}" onclick="doTask('joinTg', 100)">${completedTasks.joinTg ? 'Completed' : 'Start Task'}</button>
    </div>

    <div class="task-card">
      <div>
        <div style="font-size:13.5px; font-weight:600;">Follow Official X / Twitter</div>
        <div style="font-size:11px; color:#64748b;">+100 TGN</div>
      </div>
      <button class="task-btn ${completedTasks.followX ? 'done' : ''}" onclick="doTask('followX', 100)">${completedTasks.followX ? 'Completed' : 'Start Task'}</button>
    </div>
  `;
}

// Interactive Helper Functions
function doDailyCheckIn() {
  if (isCheckedIn) {
    showToast('Already claimed today!');
    return;
  }
  isCheckedIn = true;
  tgnAirdropBalance += 50;
  showToast('Claimed +50 TGN!');
  renderAirdropTab();
}

function doTask(taskKey, reward) {
  if (completedTasks[taskKey]) {
    showToast('Task already completed!');
    return;
  }
  completedTasks[taskKey] = true;
  tgnAirdropBalance += reward;
  showToast(`Task Done! +${reward} TGN`);
  renderAirdropTab();
}

function openDepositModal() {
  const qrCodeUrl = `https://quickchart.io/qr?text=ton://transfer/${userWalletAddress}&size=180`;
  const tonkeeperUrl = `https://app.tonkeeper.com/transfer/${userWalletAddress}`;

  let modal = document.getElementById('deposit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'deposit-modal';
    modal.className = 'step-modal';
    document.querySelector('.app-container').appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-header-top">
      <div class="modal-title-text">Deposit TON</div>
      <i class="fa-solid fa-xmark modal-close-btn" onclick="closeModal('deposit-modal')"></i>
    </div>
    <div style="text-align:center; padding:10px 0;">
      <p style="font-size:12px; color:#94a3b8; margin-bottom:12px;">
        Tonkeeper သို့မဟုတ် Exchange မှ အောက်ပါ Deposit Address သို့ TON ပေးပို့ပါ -
      </p>
      
      <div style="background:#fff; padding:10px; border-radius:12px; display:inline-block; margin-bottom:12px;">
        <img src="${qrCodeUrl}" alt="Deposit QR Code" style="width:150px; height:150px;">
      </div>

      <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(59,130,246,0.3); border-radius:10px; padding:10px; font-size:11px; color:#38bdf8; word-break:break-all; margin-bottom:14px;">
        ${userWalletAddress}
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn-main" onclick="copyAddress()"><i class="fa-regular fa-copy"></i> Copy Address</button>
        <a href="${tonkeeperUrl}" target="_blank" style="text-decoration:none;">
          <button class="btn-sub" style="width:100%;"><i class="fa-solid fa-wallet"></i> Pay via Tonkeeper</button>
        </a>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function copyAddress() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(userWalletAddress);
  }
  showToast('Deposit Address Copied!');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
  }
}

// App စတင်သည်နှင့် Home Page ကို Auto Load လုပ်ပေးခြင်း
document.addEventListener('DOMContentLoaded', () => {
  const firstNavItem = document.querySelector('.nav-item');
  switchTab('home', firstNavItem);
});
