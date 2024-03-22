import { createPublicClient, createWalletClient, http, Address } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const myPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  console.log("Delegating vote...");

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length != 2)
    throw new Error(
      "2 Arguments required: <Contract Address> <Delegatee address>"
    );

  const contractAddress = parameters[0] as Address;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const delegateeAddress = parameters[1] as Address;
  if (!delegateeAddress) throw new Error("Delegatee address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(delegateeAddress))
    throw new Error("Invalid delegatee address");

  // Connect to testnet
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // Create wallet for signing txs
  const account = privateKeyToAccount(`0x${myPrivateKey}`);
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // "Self-delegation is disallowed."
  if (walletClient.account.address === delegateeAddress)
    throw new Error("Self-delegation is disallowed.");

  // Delegator should have voting rights (Voter.weight != 0) AND have not voted
  const delegatorVoter = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "voters",
    args: [walletClient.account.address],
  })) as any[];
  const delegatorWeight = Number(delegatorVoter[0]);
  const delegatorHasVoted = delegatorVoter[1] as Boolean;
  console.log(delegatorWeight);
  console.log(delegatorHasVoted);
  if (delegatorWeight == 0 || delegatorHasVoted)
    throw new Error(
      "You can only delegate if you have voting rights and have not voted!"
    );

  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi,
    functionName: "delegate",
    args: [delegateeAddress],
  });
  console.log(`Transaction hash: ${hash}`);

  console.log("\nWaiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed");
  console.log(
    `\n${walletClient.account.address} successfully delegated their vote to ${delegateeAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
