import React from 'react';
import {
  ConnectWallet,
  useContract,
  useAddress,
  Web3Button,
} from '@thirdweb-dev/react';
import { IDKitWidget } from '@worldcoin/idkit';
import { Check } from 'react-feather';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const walletAddress = useAddress();
  const [verified, setVerified] = React.useState(false);
  const [merkleRoot, setMerkleRoot] = React.useState(null);
  const [nullifierHash, setNullifierHash] = React.useState(null);
  const [proof, setProof] = React.useState(null);
  const [existingContract, setExistingContract] = React.useState('');
  const [contractOwner, setContractOwner] = React.useState('');
  const { contract } = useContract(existingContract);

  function onSuccess(response) {
    console.log('modal closed - successfully verified');
    setMerkleRoot(response.merkle_root);
    setNullifierHash(response.nullifier_hash);
    setProof(response.proof);
  }

  function handleVerify() {
    console.log('verification proof received');
    setVerified(true);
  }

  return (
    <main className={`${styles.main}`}>
      {walletAddress}
      {merkleRoot ? merkleRoot : ''}
      {nullifierHash ? nullifierHash : ''}
      {proof ? proof : ''}
      <div className={styles.grid}>
        <div className={styles.section}>
          <h2>1. SIGN IN</h2>
          <div className={styles.card}>
            <p>User must connect wallet and verify on World ID.</p>
            <div className={styles.connect}>
              <ConnectWallet
                theme='light'
                switchToActiveChain={true}
                className={styles.ConnectWallet}
              />
              {walletAddress ? (
                <Check size={30} stroke='green' className={styles.checkmark} />
              ) : (
                ''
              )}
            </div>

            <div className={styles.connect}>
              <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WLD_APP_ID} // obtained from the Developer Portal
                signal={walletAddress}
                action='verify-identity' // this is your action name from the Developer Portal
                onSuccess={onSuccess} // callback when the modal is closed
                handleVerify={handleVerify} // optional callback when the proof is received
                credential_types={['orb', 'phone']} // optional, defaults to ['orb']
                enableTelemetry // optional, defaults to false
              >
                {({ open }) => (
                  <button className={styles.ButtonWC} onClick={open}>
                    <Image
                      src='/worldcoinlogo.png'
                      alt='logo'
                      width={25}
                      height={25}
                    />
                    <span>Verify with World ID</span>
                  </button>
                )}
              </IDKitWidget>
              {verified ? (
                <Check size={30} stroke='green' className={styles.checkmark} />
              ) : (
                ''
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>2. DEPLOY</h2>
          <div className={styles.card}>
            <p>
              Deploy a new contract as the owner <strong>OR</strong> connect to
              an existing contract.
            </p>
            <button className={styles.Button}>
              Deploy new contract as owner
            </button>
            <h3 className={styles.or}>- OR -</h3>

            <div className={styles.existingContract}>
              <div className={styles.form}>
                <label htmlFor='existing-contract'>
                  <p>Existing Contract:</p>
                </label>
                <input
                  id='existing-contract'
                  value={existingContract}
                  placeholder='0x...'
                  onChange={event => {
                    setExistingContract(event.target.value);
                  }}
                  className={styles.input}
                />
                {existingContract ? (
                  <Web3Button
                    contractAddress={existingContract}
                    action={async () => {
                      try {
                        const owner = await contract.owner.get();
                        setContractOwner(owner);
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className={styles.Button}
                  >
                    Import
                  </Web3Button>
                ) : (
                  ''
                )}
              </div>
              {contractOwner ? (
                <div>
                  <p>Imported contract: {existingContract}</p>
                  <p>Owner of contract: {contractOwner}</p>
                  {contractOwner === walletAddress ? (
                    <p>You are the contract owner</p>
                  ) : (
                    <p>
                      You are <strong>not</strong> the contract owner
                    </p>
                  )}
                </div>
              ) : (
                ''
              )}
            </div>
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
