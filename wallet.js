import * as bip39 from 'bip39'; import { ethers } from 'ethers'; import { Keypair 
} from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key'; export const generateMnemonic = () => 
{
  return bip39.generateMnemonic(128);
};
export const deriveMultiChainWallets = async (mnemonic) => { const seed = await 
  bip39.mnemonicToSeed(mnemonic); const evmNode = 
  ethers.HDNodeWallet.fromSeed(seed); const evmWallet = 
  evmNode.derivePath("m/44'/60'/0'/0/0"); const solPath = "m/44'/501'/0'/0'"; 
  const derivedSol = derivePath(solPath, seed.toString('hex')); const solKeypair = 
  Keypair.fromSeed(derivedSol.key.slice(0, 32)); return {
    mnemonic, evm: { address: evmWallet.address, privateKey: evmWallet.privateKey,
    },
    solana: { address: solKeypair.publicKey.toBase58(), secretKey: 
      Buffer.from(solKeypair.secretKey).toString('hex'),
    }
  };
};

