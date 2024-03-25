# Solidity Bootcamp 24Q1

## Group 1 - HW2

### Ballot Contract: 0x8C967964B8f98E560bCafc787720f538361aBD65

---

- Transaction Hash: 0xd04d01c65984361874f1cb56fb08cd823964f82497defe6374d73f536152f45f

  - Caller: 0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8 (`Joezari`)
  - Creation of contract
  - Success

- Transaction Hash: 0x81cf7e3282aa0147dc0090a6b6669889385865a63ccff15640213b72ed1a7d91

  - Caller: 0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8 (`Joezari`)
  - called `vote()`
  - Success: Since `Joezari` is the chairperson, by default he is able to vote.

- Transaction Hash: 0x4d410d3a28abba9f1b0c1ffe656014c1d46c3e9d1ddd03a72f5f13986b21a337

  - Caller: 0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8 (`Joezari`)
  - called `giveRightToVote(0xd8F68a7AeB7df4c349274e84B493451D6D3518b6)`
  - Success: Granted 0xd8F68a7AeB7df4c349274e84B493451D6D3518b6 (`Chuck`) the ability to cast votes.

- Transaction Hash: 0x8db22e861afe4b6293d49ff0e06fa0685614717146f5d453dae4b1e746112bcd

  - Caller: 0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8 (`Joezari`)
  - called: `giveRightToVote(0xA9972292A1B7c82d191E79f34D7A493De48eDdEd)`
  - Success: Granted 0xA9972292A1B7c82d191E79f34D7A493De48eDdEd (`Aaron`) voting rights. Tx went through since they have not voted before, and don't have voting rights.

- Transaction Hash: 0xeac0900f4c93ea90f1af4f4599b221cea2987dbf91148051a2fc12b234604bd0

  - Caller: 0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8 (`Joezari`)
  - called: `giveRightToVote(0xe880704FA2edd72Ff0F3aE5CdEC559c8EB25C727)`
  - Success: Granted 0xe880704FA2edd72Ff0F3aE5CdEC559c8EB25C727 (`Chuck #2`) voting rights.Tx went through since they have not voted before, and don't have voting rights.

- Transaction Hash: 0x21fe35196a8a564c003b9f08f853bdcb5c8cfe284bc88ee416fcae06654ea02c

  - Caller: 0xB1c4bB25346ad3F3de0019AE75eEa1ADAce201e8 (`Joezari`)
  - called: `giveRightToVote(0x8669BE5d06eD100C94C9354FEC7fa509753F7c36)`
  - Success: Granted 0x8669BE5d06eD100C94C9354FEC7fa509753F7c36 (`Chuck #3`) voting rights.Tx went through since they have not voted before, and don't have voting rights.

- Transaction Hash: 0xb14d83bc22b3f0aad3668d76875d7c7ff834df143e5bb3cba7c0a0e193f26866

  - Caller: 0xA9972292A1B7c82d191E79f34D7A493De48eDdEd (`Aaron`)
  - Called: `vote()`
  - Success: Since `Aaron's` wallet has been given voting rights, the transaction went through.

- Transaction Hash: 0x74745ea9c9f265b8bb0340f629c31c07dc31f96530348941585a0b3d70e29759

  - Caller: 0xd8F68a7AeB7df4c349274e84B493451D6D3518b6 (`Chuck`)
  - Called: `vote()`
  - Success: Since `Chuck's` wallet has been given voting rights, the transaction went through.

- Transaction Hash: 0xbbc067f19c017b4ce1e049e4544278fba18754bf8c591ac06d9a7402d237ecef

  - Caller: 0xe880704FA2edd72Ff0F3aE5CdEC559c8EB25C727 (`Chuck #2`)
  - Called: `delegate(0x8669BE5d06eD100C94C9354FEC7fa509753F7c36)`
  - Success: Since `Chuck's` wallet # 2 has voting rights, the transaction went through, effectively passing its vote to another wallet (`Chuck #3`).

- Transaction Hash: 0x89ef5e2a0ed2bcde4929158cbb5542036f32d3e96f51cca82734bc244fa2a5a8

  - Caller: 0x8669BE5d06eD100C94C9354FEC7fa509753F7c36 (`Chuck #3`)
  - Called: `vote()`
  - Success: Since `Chuck's` wallet # 3 has voting rights, the transaction went through, with a weight of 2, due to the previous transaction where it was delegated a vote.
