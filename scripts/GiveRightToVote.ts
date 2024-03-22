import { createPublicClient, http, createWalletClient, Address } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const myPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  // requires 2 args: contract address and address gaining voting rights
  const parameters = process.argv.slice(2);

  //   -- Validate Arguments --
  if (!parameters || parameters.length < 2)
    throw new Error(
      "2 Parameters required: \n<Address of contract> <Address to give voting rights to>"
    );

  const contractAddress = parameters[0] as Address;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  //   const receivingAddress = parameters[1] as Address;
  //   if (!receivingAddress) throw new Error("Receiving address not provided");
  //   if (!/^0x[a-fA-F0-9]{40}$/.test(receivingAddress))
  //     throw new Error("Invalid receiving address");

  // create public client to connect to rpc
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // create wallet client
  const callerPrivateKey = privateKeyToAccount(`0x${myPrivateKey}`);
  const caller = createWalletClient({
    account: callerPrivateKey,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // check if caller is the chairperson of the contract
  const chairperson = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "chairperson",
  });
  if (caller.account.address != chairperson)
    throw new Error("Only chairman can give right to vote");

  // wallet owner calls giveRightToVote(<arg: address>)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
