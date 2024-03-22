import {
  createPublicClient,
  http,
  createWalletClient,
  hexToString,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const voterPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  // Cast your vote by providing the index of the proposal
  //process.argv[0] == Node runtime
  //process.argv[1] == script path
  const parameters = process.argv.slice(2);

  if (parameters.includes("--help") || parameters.includes("-h")) {
    console.log(`Usage: node script.js <contractAddress> <proposalIndex>
    \nThis script allows you to vote on a proposal in a Ballot contract.
    \nArguments:
    \n\tcontractAddress: The address of the Ballot contract.
    \n\tproposalIndex: The index of the proposal you want to vote for.
    \nEnvironment Variables:
    \n\tALCHEMY_API_KEY: Your Alchemy API key.
    \n\tPRIVATE_KEY: Your wallet's private key.
    \nExample:
    \n\tnode script.js 0x123...def 2`);
    process.exit();
  }

  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");

  // Validate the first argument passed
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const proposalIndex = parameters[1];
  if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");
  // TODO: Add validation that checks proposalIndex is not out of bounds. HOW??

  // --- connect to rpc
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const account = privateKeyToAccount(`0x${voterPrivateKey}`);
  const voter = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  // ---

  console.log("Proposal selected: ");
  const proposal = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "proposals",
    args: [BigInt(proposalIndex)],
  })) as any[];
  const name = hexToString(proposal[0], { size: 32 });
  console.log("Vote goes to:", name);
  console.log("Confirm? (Y/n)");

  // ---
  const stdin = process.openStdin();
  stdin.addListener("data", async function (d) {
    if (d.toString().trim().toLowerCase() != "n") {
      const hash = await voter.writeContract({
        address: contractAddress,
        abi,
        functionName: "vote",
        args: [BigInt(proposalIndex)],
      });
      console.log("Transaction hash:", hash);
      console.log("Waiting for confirmations...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction confirmed");
      console.log(`Address ${voter.account.address} voted for ${name}`);
    } else {
      console.log("Operation cancelled");
    }
    process.exit();
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
