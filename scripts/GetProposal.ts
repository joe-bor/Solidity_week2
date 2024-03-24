import { createPublicClient, http, Address, hexToString } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  console.log("Getting the proposals...");

  // Validate args
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error(
      "2 Argument Required: Contract address to read from, Index for proposal"
    );

  const contractAddress = parameters[0] as Address;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const proposalIndex = parameters[1];
  if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

  // Create connection
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const proposal = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "proposals",
    args: [BigInt(proposalIndex)],
  })) as any[];

  const proposalName = hexToString(proposal[0], { size: 32 });
  const proposalVoteCount = proposal[1] as Number;

  console.log(
    `${proposalName} at index ${proposalIndex} has ${proposalVoteCount} vote(s)`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
