# Anti Social Recovery Club

You're the owner of a smart contract but you lost the key. You're screwed…. Or are you? Anti Social Recovery is a design pattern that enables users to recover ownership of their smart contract - without relying on their lost signing keys.

Built for ETHGlobal New York 2023 Hackathon.

## Prompt: What if contracts were owned by humans instead of addresses?

### Anti Social Recovery allows users to create smart contracts where the ownership of that smart contract is tied to the user's unique proof of personhood (e.g., their World ID).

We've implemented World ID verification in our app, which enables users to deploy a contract as the owner. The user can then use a different EOA, re-verify with World ID, and take over ownership of the same contract.

### Actions supported:

- Sign in with wallet
- Deploy a smart contract where the proof of personhood serves as an input to prove ownership
- Claim rightful ownership of a smart contract owned by a human, not just an address
