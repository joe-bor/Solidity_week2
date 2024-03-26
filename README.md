# Hardhat Project with Viem

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and it uses viem to deploy that contract. The scripts for interacting with the deployed contract are found inside the `scripts` folder, and detailed instructions are listed below.

## Pre-requisites:

- Node.js v18+ installed on your machine.
- A web3 wallet, like Metamask, with a funded testnet account.
- API Keys from RPC Providers ([Pokt](https://pokt.network/), [Infura](https://infura.io/), [Alchemy](https://www.alchemy.com/), [Etherscan](https://etherscan.io/register))

## Installation

Install the project with npm.

```bash
npm install
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```env
MNEMONIC="here is where your extracted twelve words mnemonic phrase should be put"
PRIVATE_KEY="<your wallet private key should go here>"
POKT_API_KEY="********************************"
INFURA_API_KEY="********************************"
INFURA_API_SECRET="********************************"
ALCHEMY_API_KEY="********************************"
ETHERSCAN_API_KEY="********************************"
```

## Running Tests

To run tests, compile the the contract and run the following commands.

```bash
npx hardhat compile
npx hardhat test
```

## Scripts

You can run the scripts by typing this command in your terminal:

```bash
npx ts-node --files ./scripts/<FileName.ts> <Args1> <Args2>
```

- Change <FileName.ts> to actual name of the script
- The provided scripts require different number of arguments. Detailed information below.

| File Name                   | Required Arguments                                               |
| --------------------------- | ---------------------------------------------------------------- |
| `DeployWithViem.ts`         | At least one argument representing a proposal.                   |
| `GetChairperson.ts`         | 1 argument: contract address.                                    |
| `GetProposal.ts`            | 2 arguments: contract address, proposal index.                   |
| `GetVoter.ts`               | 2 arguments: contract address, voter's wallet address.           |
| `GiveRightToVote.ts`        | 2 arguments: contract address, wallet address for voting rights. |
| `CastVote.ts`               | 2 arguments: contract address, proposal index.                   |
| `DelegateVote.ts`           | 2 arguments: contract address, delegate's wallet address.        |
| `GetWinningProposal.ts`     | 1 argument: contract address.                                    |
| `GetWinningProposalName.ts` | 1 argument: contract address.                                    |
