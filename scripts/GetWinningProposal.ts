import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  console.log("Getting the winning proposal...");

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length !== 1)
    throw new Error("1 Argument required: <Contact Address>");

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const winningProposal = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winningProposal",
  })) as BigInt;

  console.log(`The proposal at index ${Number(winningProposal)} won!`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
