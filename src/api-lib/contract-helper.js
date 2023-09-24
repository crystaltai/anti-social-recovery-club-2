import { ethers } from 'ethers';
import contractArtifact from './abi/WorldOwnable.json';
import { decodeAbiParameters } from 'viem';
console.log(contractArtifact);

export async function deploy(root, nullifierHash, proof, signer) {
  try {
    const networkEthers =
      process.env.NEXT_PUBLIC_PROD_DEPLOYMENT === 'TRUE'
        ? 'matic' //polygon mainnet
        : 'maticmum'; //polygon mumbai

    const provider = new ethers.providers.InfuraProvider(
      networkEthers,
      process.env.NEXT_PUBLIC_INFURA_API_KEY
    );

    const gasEstimate = await getGasEstimates();
    const doubleMaxFee = gasEstimate.maxFee.toFixed(4) * 2;
    const doubleMaxPriorityFee = gasEstimate.maxPriorityFee.toFixed(4) * 2;

    const unpackedRoot = decodeAbiParameters([{ type: 'uint256' }], root)[0];
    const unpackedNullifier = decodeAbiParameters(
      [{ type: 'uint256' }],
      nullifierHash
    )[0];

    const unpackedProof = decodeAbiParameters(
      [{ type: 'uint256[8]' }],
      proof
    )[0];

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const factory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      signer
    );

    const transaction = await factory.getDeployTransaction(
      '0x719683F13Eeea7D84fCBa5d7d17Bf82e03E3d260',
      process.env.NEXT_PUBLIC_WLD_APP_ID,
      'verify-identity',
      accounts[0],
      unpackedRoot,
      unpackedNullifier,
      unpackedProof,
      {
        maxFeePerGas: ethers.utils.parseUnits(doubleMaxFee.toString(), 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits(
          doubleMaxPriorityFee.toString(),
          'gwei'
        ),
      }
    );

    const trxn = {
      from: accounts[0],
      data: transaction.data,
      maxFeePerGas: transaction.maxFeePerGas._hex,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas._hex,
    };

    // console.log('Sleeping');
    // await sleep(300);
    // console.log('Awake');

    // console.log('Fetching txrecpt');
    // const txReceipt = await provider.getTransactionReceipt(transactionHash);
    // if (txReceipt && txReceipt.blockNumber) {
    //   return txReceipt;
    // }

    // console.log(txReceipt);

    return trxn;

    // worldOwnableContract = contract.address;
    // const tx = await contract.deployTransaction.wait();
    // console.log(tx);
    // const contractResponse = await contract.value();
    // console.log(contractResponse);
    // return worldOwnableContract;
  } catch (err) {
    console.log(err);
    return err;
  }
}

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getGasEstimates = async () => {
  console.log('fetching gas estimates');
  const { fast } = await fetch(
    process.env.NEXT_PUBLIC_GAS_STATION_ENDPOINT
  ).then(response => {
    return response.json();
  });
  const maxFee = fast.maxFee;
  const maxPriorityFee = fast.maxPriorityFee;
  return { maxFee, maxPriorityFee };
};

export async function claimOwnership(signal, root, nullifierHash, proof) {}
