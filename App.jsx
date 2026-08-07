import React, { useState, useEffect } from 'react'; import WebApp from 
'@twa-dev/sdk'; import { generateMnemonic, deriveMultiChainWallets } from 
'./wallet'; export default function App() {
  const [walletData, setWalletData] = useState(null); const [activeTab, 
  setActiveTab] = useState('EVM'); useEffect(() => {
    WebApp.ready(); WebApp.expand();
  }, []);
  const handleCreateWallet = async () => { const mnemonic = generateMnemonic(); 
    const wallets = await deriveMultiChainWallets(mnemonic); 
    setWalletData(wallets); localStorage.setItem('tgn_mnemonics', mnemonic);
  };
  return ( <div className="p-4 bg-slate-900 text-white min-h-screen"> <h1 
      className="text-2xl font-bold text-center mb-4">TGN Web3 Wallet</h1> 
      {!walletData ? (
        <div className="text-center mt-10"> <button onClick={handleCreateWallet} 
            className="bg-blue-600 px-6 py-3 rounded-xl font-bold 
            hover:bg-blue-500"> Wallet အသစ်ပြုလုပ်မည်
          </button> </div> ) : ( <div className="space-y-4"> <div 
          className="bg-slate-800 p-3 rounded-lg text-xs break-all border 
          border-slate-700">
            <p className="text-yellow-400 font-bold mb-1">Recovery Seed 
            Phrase:</p> {walletData.mnemonic}
          </div> <div className="flex justify-around bg-slate-800 p-1 rounded-lg"> 
            <button onClick={() => setActiveTab('EVM')} className={`px-4 py-1 
            rounded ${activeTab === 'EVM' ? 'bg-blue-600' : ''}`}>EVM 
            (ETH/BNB)</button> <button onClick={() => setActiveTab('SOL')} 
            className={`px-4 py-1 rounded ${activeTab === 'SOL' ? 'bg-blue-600' : 
            ''}`}>Solana</button>
          </div> <div className="bg-slate-800 p-4 rounded-xl border 
          border-slate-700">
            <p className="text-slate-400 text-sm">{activeTab} Address</p> <p 
            className="text-sm font-mono break-all mt-1">
              {activeTab === 'EVM' ? walletData.evm.address : 
              walletData.solana.address}
            </p> </div> </div> )} </div> );
}

