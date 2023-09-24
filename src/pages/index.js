import React from 'react';
import { ethers } from 'ethers';
import { deploy, claim } from '../api-lib/contract-helper';
import { ConnectWallet, useAddress } from '@thirdweb-dev/react';
import { IDKitWidget } from '@worldcoin/idkit';
import { Check } from 'react-feather';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const walletAddress = useAddress();
  const [verified, setVerified] = React.useState(false);
  // const [claimVerified, setClaimVerified] = React.useState(false);
  const [merkleRoot, setMerkleRoot] = React.useState(null);
  const [nullifierHash, setNullifierHash] = React.useState(null);
  const [proof, setProof] = React.useState(null);
  // const [claimMerkleRoot, setClaimMerkleRoot] = React.useState(null);
  // const [claimNullifierHash, setClaimNullifierHash] = React.useState(null);
  // const [claimProof, setClaimProof] = React.useState(null);
  const [existingContract, setExistingContract] = React.useState('');
  const [contractAddress, setContractAddress] = React.useState(null);
  const [signer, setSigner] = React.useState(null);

  React.useEffect(() => {
    // window is accessible here.
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setSigner(provider.getSigner());
  }, []);

  async function receiptLookup(transactionHash) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const txReceipt = await provider.getTransactionReceipt(transactionHash);
    if (txReceipt && txReceipt.blockNumber) {
      console.log(txReceipt);
      setContractAddress(txReceipt.contractAddress);
    } else {
      window.setTimeout(() => receiptLookup(transactionHash), 500);
    }
  }

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

  // function onClaimSuccess(response) {
  //   console.log('modal closed - claim verification successfully verified');

  //   setClaimMerkleRoot(response.merkle_root);
  //   setClaimNullifierHash(response.nullifier_hash);
  //   setClaimProof(response.proof);

  //   setClaimVerified(true);
  // }

  async function deployContract() {
    try {
      const trxn = await deploy(merkleRoot, nullifierHash, proof, signer);
      window.ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [trxn],
        })
        .then(async response => {
          receiptLookup(response);
        });
    } catch (error) {
      console.log(error);
    }
  }

  async function claimContract() {
    console.log();

    try {
      const trxn = await claim(
        contractAddress,
        signer,
        walletAddress,
        merkleRoot,
        nullifierHash,
        proof
      );

      window.ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [trxn],
        })
        .then(async response => {
          console.log(`response: ${response}`);
          receiptLookup(response);
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className={`${styles.main}`}>
      <div className={styles.grid}>
        <div>{merkleRoot ? merkleRoot : ''}</div>
        <div>{nullifierHash ? nullifierHash : ''}</div>
        <div>{proof ? proof : ''}</div>
      </div>
      <div className={styles.grid}>
        <div className={styles.section}>
          <h2>SIGN IN</h2>
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
          <h2>DEPLOY or IMPORT CONTRACT</h2>
          <div className={styles.card}>
            <p>
              Deploy a new contract as the owner <strong>OR</strong> connect to
              an existing contract.
            </p>

            <button className={styles.Button} onClick={deployContract}>
              Deploy new contract as owner
            </button>
            <h3 className={styles.or}>- OR -</h3>
            <div className={styles.existingContract}>
              <form
                className={styles.form}
                onSubmit={e => {
                  e.preventDefault();
                  setContractAddress(existingContract);
                }}
              >
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
                <button type='submit' className={styles.Button}>
                  Import
                </button>
              </form>

              {contractAddress ? (
                <div className={styles.targetContract}>
                  <p>Target contract: {contractAddress}</p>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>CLAIM OWNERSHIP</h2>
          <div className={styles.card}>
            <p>
              User must connect wallet and re-verify on World ID to claim
              ownership.
            </p>
            {/* <div className={styles.connect}>
              <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WLD_APP_ID} // obtained from the Developer Portal
                signal={walletAddress}
                action='verify-identity' // this is your action name from the Developer Portal
                onSuccess={onClaimSuccess} // callback when the modal is closed
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
                    <span>Re-Verify with World ID to claim ownership</span>
                  </button>
                )}
              </IDKitWidget>
              {claimVerified ? (
                <Check size={30} stroke='green' className={styles.checkmark} />
              ) : (
                ''
              )}
            </div> */}

            <button className={styles.Button} onClick={claimContract}>
              Claim Ownership of Contract
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
