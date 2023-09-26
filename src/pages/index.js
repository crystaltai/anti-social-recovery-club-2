import React from 'react';
import { ethers } from 'ethers';
import { deploy, claim } from '../api-lib/contract-helper';
import { ConnectWallet, useAddress } from '@thirdweb-dev/react';
import { IDKitWidget } from '@worldcoin/idkit';
import { Check, ExternalLink } from 'react-feather';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const walletAddress = useAddress(); // grabs user wallet address
  const [verified, setVerified] = React.useState(false); // checks if user is verified with World ID
  const [merkleRoot, setMerkleRoot] = React.useState(null); // grabs World ID merkle root hash
  const [nullifierHash, setNullifierHash] = React.useState(null); // grabs World ID nullifier hash
  const [proof, setProof] = React.useState(null); // grabs World ID proof hash
  const [contractAddress, setContractAddress] = React.useState(null); // displays deployed contract
  const [existingContract, setExistingContract] = React.useState(''); // displays imported contract for claim
  const [existingContractInput, setExistingContractInput] = React.useState(''); // handles input field for importing contract
  const [claimTrxnHash, setClaimTrxnHash] = React.useState(''); // displays claim transaction hash
  const [signer, setSigner] = React.useState(null); // grabs signer from connected wallet

  React.useEffect(() => {
    const initializeWeb3Provider = () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSigner(provider.getSigner());
      } else {
        // If window.ethereum is still not available, wait and check again
        setTimeout(initializeWeb3Provider, 1000); // check every 1 second
      }
    };

    initializeWeb3Provider();
  }, []); // this effect runs once

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
    try {
      const trxn = await claim(
        existingContract,
        signer,
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
          setClaimTrxnHash(response);
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className={`${styles.main}`}>
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
          <h2>DEPLOY CONTRACT</h2>
          <div className={styles.card}>
            <p>Deploy a new contract as the owner</p>

            <button
              className={styles.Button}
              onClick={deployContract}
              disabled={walletAddress && verified ? false : true}
            >
              Deploy
            </button>
            {contractAddress ? (
              <div className={styles.targetContract}>
                <p>Contract Deployed: {contractAddress}</p>
                <p>
                  <a
                    href={`https://mumbai.polygonscan.com/address/${contractAddress}`}
                    target='_blank'
                    className={styles.transactionLink}
                  >
                    View Contract
                    <ExternalLink size={16} />
                  </a>
                </p>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>

        <h2 className={styles.or}>
          <strong>OR</strong>
        </h2>

        <div className={styles.section}>
          <h2>CLAIM OWNERSHIP</h2>
          <div className={styles.card}>
            <p>
              Specify a contract to claim ownership. <br />
              User must connect wallet and re-verify on World ID to claim
              ownership.
            </p>
            <div className={styles.existingContract}>
              <form
                className={styles.form}
                onSubmit={e => {
                  e.preventDefault();
                  setExistingContract(existingContractInput);
                }}
              >
                <label htmlFor='existing-contract'>
                  <p>Existing Contract:</p>
                </label>
                <input
                  id='existing-contract'
                  value={existingContractInput}
                  placeholder='0x...'
                  onChange={event => {
                    setExistingContractInput(event.target.value);
                  }}
                  className={styles.input}
                />
                <button type='submit' className={styles.Button}>
                  Import
                </button>
              </form>
            </div>

            <button
              className={styles.Button}
              onClick={claimContract}
              disabled={
                walletAddress && verified && existingContract ? false : true
              }
            >
              Claim Ownership
            </button>
            {existingContract ? (
              <div className={styles.targetContract}>
                <p>Imported Contract: {existingContract}</p>
              </div>
            ) : (
              ''
            )}
            {/* TODO: change conditional variable AND polygon link */}
            {claimTrxnHash ? (
              <div className={styles.targetContract}>
                <p>
                  You have successfully claimed ownership of the imported
                  contract!
                </p>
                <p>
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${claimTrxnHash}`}
                    target='_blank'
                    className={styles.transactionLink}
                  >
                    Want proof?
                    <ExternalLink size={16} />
                  </a>
                </p>
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
