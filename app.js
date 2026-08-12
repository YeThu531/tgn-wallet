// Dynamic Data States
let tonBalance = 0.00; // Real Transaction မလာသေးသမျှ 0.00 TON
let tgnAirdropBalance = 0; // Tasks လုပ်မှသာ တိုးမည့် Airdrop
// User ၏ သီးသန့် TON Deposit Address
const userWalletAddress = "EQBnKobCT_kU4ZC4G89x2_TGN_Wallet_Address";
let isCheckedIn = false;
let completedTasks = { joinTg: false, followX: false };

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

function switchTab(tabName, element) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (element) element.classList.add('active');

  const contentArea = document.getElementById('main-content');

  if (tabName === 'home' || tabName === 'wallet') {
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
          <button class="btn-sub" onclick="showToast('Withdraw feature ready')"><i class="fa-solid fa-arrow-up"></i> Withdraw</button>
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
            <div style="font-size:11px; color:#64748b;">$${(tonBalance * 5.5).toFixed(2)}</div>
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
  } else if (tabName === 'airdrop') {
    renderAirdropTab();
  }
}

// Deposit Modal (Tonkeeper / Other Wallets Deposit View)
function openDepositModal() {
  const contentArea = document.getElementById('main-content');
  
  // Deposit QR Code Generator (Using QuickChart API)
  const qrCodeUrl = `https://quickchart.io/qr?text=ton://transfer/${userWalletAddress}&size=180`;
  // Tonkeeper Deep Link
  const tonkeeperUrl = `https://app.tonkeeper.com/transfer/${userWalletAddress}`;

  document.getElementById('deposit-modal').innerHTML = `
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

  document.getElementById('deposit-modal').classList.add('open');
}

function copyAddress() {
  navigator.clipboard.writeText(userWalletAddress);
  showToast('Deposit Address Copied!');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

// Blockchain Transaction Listening (Backend Simulation)
// Real-world တွင် TON Center API / TON Webhook မှ Deposit ဝင်လာချိန်တွင် balance ကို update ပြုလုပ်ပေးပါမည်။
function checkRealDeposit() {
  // TON Center API Response Simulation:
  // Example: fetch('https://toncenter.com/api/v2/getTransactions?address=' + userWalletAddress)
}

document.addEventListener('DOMContentLoaded', () => {
  switchTab('home', document.querySelector('.nav-item.active'));
});
