import React from 'react';
import { ethers } from 'ethers';
import { deploy } from '../api-lib/contract-helper';
import {
  ConnectWallet,
  useContract,
  useAddress,
  Web3Button,
  useContractWrite,
} from '@thirdweb-dev/react';
import { IDKitWidget } from '@worldcoin/idkit';
import { Check } from 'react-feather';
import contractArtifact from '../api-lib/abi/WorldOwnable.json';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const walletAddress = useAddress();
  const [verified, setVerified] = React.useState(false);
  const [merkleRoot, setMerkleRoot] = React.useState(null);
  const [nullifierHash, setNullifierHash] = React.useState(null);
  const [proof, setProof] = React.useState(null);
  // const [claimVerified, setClaimVerified] = React.useState(false);
  const [claimMerkleRoot, setClaimMerkleRoot] = React.useState(null);
  const [claimNullifierHash, setClaimNullifierHash] = React.useState(null);
  const [claimProof, setClaimProof] = React.useState(null);
  // const [existingContract, setExistingContract] = React.useState('');
  // const [contractOwner, setContractOwner] = React.useState('');
  const [contractAddress, setContractAddress] = React.useState(
    '0xf7CcEE3c444e9Fe9071590730007f40137C3dBB1'
  );
  const { contract } = useContract(contractAddress, contractArtifact.abi);
  console.log('contract', contract);
  const { mutateAsync, isLoading, error } = useContractWrite(
    contract,
    'claimOwnership'
  );
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

  // let unpackedClaimRoot;
  // let unpackedClaimNullifier;
  // let unpackedClaimProof;

  function onClaimSuccess(response) {
    console.log('modal closed - claim verification successfully verified');

    setClaimMerkleRoot(response.merkle_root);
    setClaimNullifierHash(response.nullifier_hash);
    setClaimProof(response.proof);

    // unpackedClaimRoot = decodeAbiParameters(
    //   [{ type: 'uint256' }],
    //   claimMerkleRoot
    // )[0];

    // unpackedClaimNullifier = decodeAbiParameters(
    //   [{ type: 'uint256' }],
    //   claimNullifierHash
    // )[0];

    // unpackedClaimProof = decodeAbiParameters(
    //   [{ type: 'uint256[8]' }],
    //   claimProof
    // )[0];
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
      const trxn = await claimOwnership(
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
          receiptLookup(response);
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className={`${styles.main}`}>
      <div className={styles.grid}>
        <div>{walletAddress}</div>
        <div>{merkleRoot ? merkleRoot : ''}</div>
        <div>{nullifierHash ? nullifierHash : ''}</div>
        <div>{proof ? proof : ''}</div>
      </div>
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

            <button className={styles.Button} onClick={deployContract}>
              Deploy new contract as owner
            </button>
            {contractAddress ? (
              <div>
                <p>Newly deployed contract: {contractAddress}</p>
              </div>
            ) : (
              ''
            )}
            {/* <h3 className={styles.or}>- OR -</h3>

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
            </div> */}
          </div>
        </div>

        <div className={styles.section}>
          <h2>3. CLAIM OWNERSHIP</h2>
          <div className={styles.card}>
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

            {/* <Web3Button
              contractAddress={contractAddress}
              action={async () => {
                try {
                  mutateAsync({
                    args: [
                      walletAddress,
                      unpackedClaimRoot,
                      unpackedClaimNullifier,
                      unpackedClaimProof,
                    ],
                  });
                } catch (error) {
                  console.log(error);
                }
              }}
              className={styles.Button}
            >
              Claim Ownership of Contract
            </Web3Button> */}
            <button className={styles.Button} onClick={claimContract}>
              Claim Ownership of Contract
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
