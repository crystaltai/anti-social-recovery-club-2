import { ConnectWallet, useAddress } from '@thirdweb-dev/react';
import { IDKitWidget } from '@worldcoin/idkit';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const walletAddress = useAddress();

  function onSuccess(response) {
    console.log(response);
    console.log('modal closed - successfully logged in');
  }

  function handleVerify() {
    console.log('verification proof received');
  }

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
              className={styles.ConnectWallet}
            />
            <IDKitWidget
              app_id={process.env.NEXT_PUBLIC_WLD_APP_ID} // obtained from the Developer Portal
              signal={walletAddress}
              action='vote_1' // this is your action name from the Developer Portal
              onSuccess={onSuccess} // callback when the modal is closed
              handleVerify={handleVerify} // optional callback when the proof is received
              credential_types={['orb', 'phone']} // optional, defaults to ['orb']
              enableTelemetry // optional, defaults to false
            >
              {({ open }) => (
                <button className={styles.Button} onClick={open}>
                  Verify with World ID
                </button>
              )}
            </IDKitWidget>
          </div>
        </div>

        <div className={styles.section}>
          <h2>2. DEPLOY</h2>
          <div className={styles.card}>
            <button className={styles.Button}>
              Deploy new contract as owner
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h2>3. CLAIM OWNERSHIP</h2>
          <div className={styles.card}>
            <button className={styles.Button}>
              Transfer ownership to your wallet address
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
