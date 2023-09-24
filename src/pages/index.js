import React from 'react';
import { ethers } from 'ethers';
import { deploy } from '../api-lib/contract-helper';
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
// import contractArtifact from '../api-lib/abi/WorldOwnable.json';

export default function Home() {
  const walletAddress = useAddress();
  const [verified, setVerified] = React.useState(false);
  const [merkleRoot, setMerkleRoot] = React.useState(
    '0x1a04af3dffa970c55274470c23db1b628ac24136967b1f94366aaa57558e813c'
  );
  const [nullifierHash, setNullifierHash] = React.useState(
    '0x075f73e345a1d405dedd4fe83b6e7733fb3ae3d51d74f8982cd7c899ff90b57f'
  );
  const [proof, setProof] = React.useState(
    '0x17125d91ce6e08678baa563f53dc5521af5e7f4e51c9b2cb4e03bc9ab66c13fb167d3eca0e9e903e4e9ea2bb66d4385fa4405becb1b91f20b270f71c59d5d6632bec043d89b3f1ae50a38f62fa5e759aad798313e752d31f8c7e6de289e14a7705d4ddb1098269193cff70e7fafb3921e4af8172c30cdad0f24b38a8b36b9a2e09ff4c3af77745f7a6691bd824295b84063a88acf5a6aefcc61f68800a791e6f1d2dc4c7bf2163a16f52000e3edac9d20caf4ad66d9ef327dcae9452c24c2ce718e4a808a21c26da896e9b3c62049c7698e19c24702be66288c55f695a459383133dd0e54df5085d85956eecfcfdd166efc40084ece66743687024863f8f95ff'
  );
  const [existingContract, setExistingContract] = React.useState('');
  const [contractOwner, setContractOwner] = React.useState('');
  const [contractAddress, setContractAddress] = React.useState(null);
  const { contract } = useContract(existingContract);
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

  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  async function deployContract() {
    try {
      const trxn = await deploy(merkleRoot, nullifierHash, proof, signer);
      console.log(trxn);
      window.ethereum
        .request({
          method: 'eth_sendTransaction',
          params: [trxn],
        })
        .then(async response => {
          console.log(response);
          receiptLookup(response);
        });
    } catch (error) {
      console.log(111111);
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
              {contractAddress ? (
                <div>
                  <p>Newly deployed contract: {contractAddress}</p>
                </div>
              ) : (
                ''
              )}
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
            <Web3Button className={styles.Button}>
              Transfer ownership to your wallet address
            </Web3Button>
          </div>
        </div>
      </div>
    </main>
  );
}
