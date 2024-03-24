import { expect } from "chai";
import { toHex, hexToString } from "viem";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { ProviderRpcError } from "hardhat/types";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function deployContract() {
  const publicClient = await viem.getPublicClient();
  const [deployer, otherAccount] = await viem.getWalletClients();
  const ballotContract = await viem.deployContract("Ballot", [
    PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
  ]);
  return { publicClient, deployer, otherAccount, ballotContract };
}

describe("Ballot", async () => {
  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      //!  because dynamic arrays are not continuos in Solidity, we have to check per index basis
      // const proposals0 = await ballotContract.read.proposals([0n]);
      // 0n == BigInt(0)
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(hexToString(proposal[0], { size: 32 })).to.eq(PROPOSALS[index]);
      }
    });

    it("has zero votes for all proposals", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.read.proposals([BigInt(index)]);
        expect(proposal[1]).to.eq(0n);
      }
    });

    it("sets the deployer address as chairperson", async () => {
      const { ballotContract, deployer } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      //! Notice the type of chairperson => const chairperson: `0x${string}`
      //! that's why we had to use toLowerCase() to convert it to traditional JS string in our assertion
      expect(chairperson.toLowerCase()).to.eq(deployer.account.address);
    });

    it("sets the voting weight for the chairperson as 1", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      /*
      in Ballot.sol

         mapping(address => Voter) public voters;

         struct Voter {
          uint weight; // weight is accumulated by delegation
          bool voted; // if true, that person already voted
          address delegate; // person delegated to
          uint vote; // index of the voted proposal
        }
      */
      const chairpersonVoter = await ballotContract.read.voters([chairperson]);
      expect(chairpersonVoter[0]).to.eq(BigInt(1));
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const { ballotContract, otherAccount } = await loadFixture(
        deployContract
      );
      const newAdd = otherAccount.account.address;
      const _ = await ballotContract.write.giveRightToVote([newAdd]); //! idk what this returns
      const newAddVoter = await ballotContract.read.voters([newAdd]);
      expect(newAddVoter[0]).to.eq(1n);
    });
    it("can not give right to vote for someone that has voted", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();

      // we need to create a tx where a voter votes
      await ballotContract.write.vote([0n]);
      const chairpersonVoter = await ballotContract.read.voters([chairperson]);
      console.log(chairpersonVoter);
      // then check if calling giveRightToVote on the voter's address throws an error
      try {
        const x = await ballotContract.write.giveRightToVote([chairperson]);
        expect.fail("Tx should have failed");
      } catch (error) {
        expect(error.message).to.include("The voter already voted.");
      }

      // how do i capture that in a test: Error("The voter already voted.")
      // https://viem.sh/docs/error-handling.html
    });
    it("can not give right to vote for someone that has already voting rights", async () => {
      // TODO How to fix red squiggly lin on error.message -> 'error' is of type 'unknown'
      const { ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();
      try {
        await ballotContract.write.giveRightToVote([chairperson]);
        expect.fail("Tx should have failed");
      } catch (error) {
        expect(error.message).to.include("error");
      }
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("should register the vote", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const chairperson = await ballotContract.read.chairperson();

      await ballotContract.write.vote([0n]);
      const votedProposal = await ballotContract.read.proposals([0n]);
      expect(votedProposal[1]).to.eq(1n);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    it("should transfer voting power", async () => {
      const { ballotContract, otherAccount } = await loadFixture(
        deployContract
      );
      const chairperson = await ballotContract.read.chairperson(); // voter
      const chairpersonVoter = await ballotContract.read.voters([chairperson]); // so i can track while debugging, might change

      // 1) first we create a tx where we give another user the right to vote
      const anotherPerson = otherAccount.account.address;
      await ballotContract.write.giveRightToVote([anotherPerson]); //! this returns a promise that resolves to the receipt but we don't need it here
      // anotherPerson should now have the right to vote

      // 2) Now we can delegate chairperson's vote to anotherPerson
      await ballotContract.write.delegate([anotherPerson]);
      const anotherPersonVoter = await ballotContract.read.voters([
        anotherPerson,
      ]);
      expect(anotherPersonVoter[0]).to.eq(2n);
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("should revert", async () => {
      const { ballotContract, otherAccount, publicClient } = await loadFixture(
        deployContract
      );
      const anotherPersonList = await otherAccount.getAddresses();
      const anotherPerson = anotherPersonList[1] as `0x${string}`;
      const anotherPersonWallet = await viem.getWalletClient(anotherPerson);
      const chairperson = await ballotContract.read.chairperson();

      try {
        await anotherPersonWallet.writeContract({
          address: ballotContract.address,
          abi,
          functionName: "giveRightToVote",
          args: [anotherPerson],
        });
        expect.fail("Tx should have failed");
      } catch (error) {
        expect(error.message).to.include(
          "Only chairperson can give right to vote."
        );
      }
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    it("should revert", async () => {
      const { ballotContract, otherAccount } = await loadFixture(
        deployContract
      );
      const randomPersonWallet = (await viem.getWalletClients())[1];
      try {
        await randomPersonWallet.writeContract({
          address: ballotContract.address,
          abi,
          functionName: "vote",
          args: [0],
        });
      } catch (error) {
        expect(error.message).to.include("Has no right to vote");
      }
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    // TODO
    it("should revert", async () => {
      const { ballotContract, deployer } = await loadFixture(deployContract);

      const randomPersonWallet = (await viem.getWalletClients())[1];

      try {
        await randomPersonWallet.writeContract({
          address: ballotContract.address,
          abi,
          functionName: "delegate",
          args: [deployer.account.address],
        });
      } catch (error) {
        expect(error.message).to.include("You have no right to vote");
      }
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);

      expect(await ballotContract.read.winningProposal()).to.eq(0n);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const { ballotContract, deployer } = await loadFixture(deployContract);
      await deployer.writeContract({
        address: ballotContract.address,
        abi,
        functionName: "vote",
        args: [0],
      });
      const voterStats = await ballotContract.read.voters([
        deployer.account.address,
      ]); // just double checking vote went through and not just returning default values

      expect(await ballotContract.read.winningProposal()).to.eq(0n);
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract } = await loadFixture(deployContract);
      const proposalAtIndexZero = (
        await ballotContract.read.proposals([0n])
      )[0];
      expect(await ballotContract.read.winnerName()).to.eq(proposalAtIndexZero);
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      const { ballotContract, deployer } = await loadFixture(deployContract);
      await deployer.writeContract({
        address: ballotContract.address,
        abi,
        functionName: "vote",
        args: [0],
      });
      const NameOfProposalAtIndexZero = (
        await ballotContract.read.proposals([0n])
      )[0];
      expect(await ballotContract.read.winnerName()).to.eq(
        NameOfProposalAtIndexZero
      );
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    // TODO
    it("should return the name of the winner proposal", async () => {
      throw Error("Not implemented");
    });
  });
});
