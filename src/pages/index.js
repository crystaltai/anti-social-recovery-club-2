import { ConnectWallet, useAddress } from '@thirdweb-dev/react';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const walletAddress = useAddress();

  return (
    <main className={`${styles.main}`}>
      {walletAddress}
      <div className={styles.grid}>
        <div className={styles.section}>
          <h2>1. SIGN IN</h2>
          <div className={styles.card}>
            <ConnectWallet
              theme='light'
              switchToActiveChain={true}
              className={styles.walletButton}
            />
            <button>Sign into WORLD ID</button>
          </div>
        </div>

        <div className={styles.section}>
          <h2>2. DEPLOY</h2>
          <div className={styles.card}>
            <button>Deploy new contract as owner</button>
          </div>
        </div>

        <div className={styles.section}>
          <h2>3. CLAIM OWNERSHIP</h2>
          <div className={styles.card}>
            <button>Transfer ownership to your wallet address</button>
          </div>
        </div>
      </div>
    </main>
  );
}
