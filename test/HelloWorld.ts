import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("HelloWorld", function () {
  async function deployContractFixture() {
    // https://hardhat.org/hardhat-runner/docs/advanced/using-viem#clients
    const publicClient = await viem.getPublicClient();
    const [owner, otherAccount] = await viem.getWalletClients();
    // https://hardhat.org/hardhat-runner/docs/advanced/using-viem#contracts
    const helloWorldContract = await viem.deployContract("HelloWorld");
    // https://www.typescriptlang.org/docs/handbook/2/functions.html#parameter-destructuring
    return {
      publicClient,
      owner,
      otherAccount,
      helloWorldContract,
    };
  }

  it("Should give a Hello World", async () => {
    // const helloWorldContract = await viem.deployContract("HelloWorld");
    //! Use the code below instead of the line above, so we don't have to redploy everytime
    //! loadFixture takes a snapshot of the initial state after the first call, and saves it in memory for the following calls
    const { helloWorldContract } = await loadFixture(deployContractFixture);
    const helloWorldText = await helloWorldContract.read.helloWorld();
    expect(helloWorldText).to.eq("Hello World!");
  });

  it("Should change text correctly", async function () {
    // const helloWorldContract = await viem.deployContract("HelloWorld");
    const { helloWorldContract } = await loadFixture(deployContractFixture);
    const helloWorldText = await helloWorldContract.read.helloWorld();

    //TODO - create a transaction
    const tx = await helloWorldContract.write.setText([
      "I changed it to Potato!",
    ]);
    const publicClient = await viem.getPublicClient();
    const receipt = await publicClient.getTransactionReceipt({ hash: tx }); //! What is this for?? When would I need to use this.
    //! This is needed in public blockchains but not in a testing environment to make sure the transaction went through.
    const helloWorldText2 = await helloWorldContract.read.helloWorld();
    /* console.log(receipt); 
    
  {
    cumulativeGasUsed: 29992n,
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    logs: [],
    status: 'success',
    type: 'eip1559',
    transactionHash: '0x712f996021047f767a390808cfdcdbabbb4ac566942b0a17254abdc0a50fe385',
    transactionIndex: 0,
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
    contractAddress: null,
    gasUsed: 29992n,
    effectiveGasPrice: 1677606610n,
    blockHash: '0xaff7696b83658edaec08f181f506ab1f7d52dff527d5d020051729b6858e2c40',
    blockNumber: 3n
  }
    */
    expect(helloWorldText2).to.eq("I changed it to Potato");
  });
});
