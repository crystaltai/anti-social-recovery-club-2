# Anti Social Recovery

You're the owner of a smart contract but you lost the key. You're screwed…. Or are you? Anti Social Recovery is a design pattern that enables users to recover ownership of their smart contract - without relying on their lost signing keys.

### Built for ETHGlobal New York 2023 Hackathon.

#### Awards

- 🏆 ETHGlobal Top 10 Finalist
- 🏆 @worldcoin #1 Best Use Case

#### Project Links

- [ETHGlobal project showcase](https://ethglobal.com/showcase/a-s-r-spakz)
- [Live Demo](https://anti-social-recovery-club-2.vercel.app/)
  - We've implemented [Worldcoin](https://twitter.com/worldcoin)'s World ID verification in our app, which requires a World ID account. If you do not want to create one, you can use their simulator World ID here ([simulator World ID](https://simulator.worldcoin.org/))

### Team

- Alyssa Karchmer ([@AlyssaKarchmer](https://twitter.com/AlyssaKarchmer))
- Crystal Tai ([@crystaltaixyz](https://twitter.com/crystaltaixyz))
- Sreepriya Sreekumar ([@sreepriyaks](https://twitter.com/sreepriyaks))
- Henry Golden ([HenryGo52269371](https://twitter.com/HenryGo52269371))

## Project Idea: What if contracts were owned by humans instead of addresses?

### Anti Social Recovery allows users to create smart contracts where the ownership of that smart contract is tied to the user's unique proof-of-personhood (e.g., their World ID).

We've implemented World ID verification in our app, which enables users to deploy a contract as the owner. The user can then use a different EOA, re-verify with World ID, and take over ownership of the same contract.

### Actions supported:

- Sign in with wallet
- Verify unique proof-of-personhood with [Worldcoin](https://twitter.com/worldcoin) World ID
- Deploy a smart contract where the proof-of-personhood serves as an input to prove ownership
- Claim rightful ownership of a smart contract owned by a human, not just an address
