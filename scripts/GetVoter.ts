import { createPublicClient, http, Address } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  console.log("Getting voter stats...");

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error("2 Arguments required: <Contract address> <Voter address");

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const voterAddress = parameters[1] as Address;
  if (!voterAddress) throw new Error("Voter address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(voterAddress))
    throw new Error("Invalid voter address");

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const voter = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "voters",
    args: [voterAddress],
  })) as any[];

  const voterWeight = voter[0] as Number;
  const voterVoted = voter[1] as Boolean;
  const voterDelegate = voter[2] as Address;
  const voterVote = voter[3] as Number;

  console.log(
    `Address: ${voterAddress} \nWeight: ${voterWeight} \nAlready voted? ${voterVoted} \nDelegated to: ${voterDelegate} \nVoted for proposal: ${voterVote}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
