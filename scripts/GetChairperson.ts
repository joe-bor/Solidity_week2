import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  console.log("Invoking getter for chairperson state variable...");

  //require 1 params: contract address to read from
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length != 1)
    throw new Error("1 Argument Required: address of contract to read from");

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  // connect to the testnet
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const chairperson = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "chairperson",
  })) as `0x${string}`;

  console.log(`The chairperson of this contract is: ${chairperson}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
