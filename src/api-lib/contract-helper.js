import { ethers } from "ethers";
import contractArtifact from "./abi/WorldOwnable.json";

export async function deploy(
    root, nullifierHash, proof, signer
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

        // const wallet = ethers.Wallet.fromMnemonic(process.env.SEED).connect(
        //     provider
        // );

        const factory = new ethers.ContractFactory(
            contractArtifact.abi,
            contractArtifact.bytecode,
            // wallet
            signer
        );

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

export async function claimOwnership(signal,
    root,
    nullifierHash,
    proof) {

}