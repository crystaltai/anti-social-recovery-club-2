import { ethers } from "ethers";
import contractArtifact from "../abi/IRTokens.json";

export async function deploy(
    root, nullifierHash, proof
) {
    try {
        const networkEthers =
            process.env.PROD_DEPLOYMENT === "TRUE"
                ? "matic" //polygon mainnet
                : "maticmum"; //polygon mumbai

        const provider = new ethers.providers.InfuraProvider(
            networkEthers,
            process.env.INFURA_API_KEY
        );

        const wallet = ethers.Wallet.fromMnemonic(process.env.SEED).connect(
            provider
        );
        const factory = new ethers.ContractFactory(
            contractArtifact.abi,
            contractArtifact.bytecode,
            wallet
        );

        // IWorldID _worldId, 
        // string memory _appId,
        // string memory _action,
        // address signal,
        // uint256 root,
        // uint256 nullifierHash,
        // uint256[8] memory proof
        const contract = await factory.deploy(
            process.env.NEXT_PUBLIC_WLD_APP_ID,
            'verify-identity',
            wallet.address,
            ethers.BigNumber.from(root),
            ethers.BigNumber.from(nullifierHash),
            ethers.BigNumber.from(proof)
        );

        worldOwnableContract = contract.address;
        const tx = await contract.deployTransaction.wait();
        console.log(tx);
        const contractResponse = await contract.value();
        console.log(contractResponse);
        return worldOwnableContract;
    } catch (err) {
        console.log(err);
        return err;
    }
}