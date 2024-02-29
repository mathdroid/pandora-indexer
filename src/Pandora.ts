import { ponder } from "@/generated";
import { encodePacked, keccak256 } from "viem";

ponder.on("Pandora:Approval", async ({ event, context }) => {
  // console.log(event.args);
  const { Allowance, ApprovalEvent } = context.db;

  const allowanceId = `${event.args.owner}-${event.args.spender}`;

  // Create or update the Allowance.
  await Allowance.upsert({
    id: allowanceId,
    create: {
      ownerId: event.args.owner,
      spenderId: event.args.spender,
      amount: event.args.amount,
    },
    update: {
      amount: event.args.amount,
    },
  });

  // Create an ApprovalEvent.
  await ApprovalEvent.create({
    id: event.log.id,
    data: {
      ownerId: event.args.owner,
      spenderId: event.args.spender,
      amount: event.args.amount,
      timestamp: Number(event.block.timestamp),
    },
  });
});

ponder.on("Pandora:ApprovalForAll", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("Pandora:ERC20Transfer", async ({ event, context }) => {
  // console.log(event.args);
  const { Account, TransferEvent } = context.db;

  // Create an Account for the sender, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.from,
    create: {
      erc20Balance: BigInt(0),
      isOwner: false,
      erc721Balance: BigInt(0)
    },
    update: ({ current }) => ({
      erc20Balance: current.erc20Balance - event.args.amount,
    }),
  });

  // Create an Account for the recipient, or update the balance if it already exists.
  await Account.upsert({
    id: event.args.to,
    create: {
      erc20Balance: event.args.amount,
      isOwner: false,
      erc721Balance: BigInt(0)
    },
    update: ({ current }) => ({
      erc20Balance: current.erc20Balance + event.args.amount,
    }),
  });

  // Create a TransferEvent.
  await TransferEvent.create({
    id: event.log.id,
    data: {
      fromId: event.args.from,
      toId: event.args.to,
      amount: event.args.amount,
      timestamp: Number(event.block.timestamp),
    },
  });
});

ponder.on("Pandora:Transfer", async ({ event, context }) => {
  const { Nft, Account, NftTransferEvent } = context.db
  // console.log(event.args);

  // Create an Account for the sender, or update the balance if it already exists.
  // if (event.args.from !== "0x0000000000000000000000000000000000000000") {
  await Account.upsert({
    id: event.args.from,
    create: {
      isOwner: false,
      erc20Balance: BigInt(0),
      erc721Balance: BigInt(0)
    },
    update: ({ current }) => ({
      erc721Balance: current.erc721Balance - BigInt(1)
    })
  });
  // }

  // Create an Account for the recipient, or update the balance if it already exists.
  // if (event.args.to !== "0x0000000000000000000000000000000000000000") {
  await Account.upsert({
    id: event.args.to,
    create: {
      isOwner: false,
      erc20Balance: BigInt(0),
      erc721Balance: BigInt(1)
    },
    update: ({ current }) => ({
      erc721Balance: current.erc721Balance + BigInt(1)
    })
  });
  // }

  const nft = event.args
  // mint event

  if (nft.from === "0x0000000000000000000000000000000000000000") {
    const rarity = parseInt(keccak256(encodePacked(["uint256"], [BigInt(nft.id)])).slice(0, 4) as `0x${string}`, 16) % 256
    const tier = rarity > 240 ? "Red" : rarity > 210 ? "Green" : rarity > 160 ? "Purple" : rarity > 100 ? "Blue" : "Green"
    console.log("[Mint]", nft.id, tier)
    await Nft.create({
      id: nft.id,
      data: {
        rarity,
        tier,

        mintedBy: nft.to,
        mintedAt: Number(event.block.timestamp),
        mintedBlock: Number(event.block.number),

        isBurned: false,
        burnedAt: 0,
        burnedBlock: 0,

        ownerId: nft.to,
        lastOwnerId: nft.to

      }
    })
  } else if (nft.to === "0x0000000000000000000000000000000000000000") {
    const rarity = parseInt(keccak256(encodePacked(["uint256"], [BigInt(nft.id)])).slice(0, 4) as `0x${string}`, 16) % 256
    const tier = rarity > 240 ? "Red" : rarity > 210 ? "Green" : rarity > 160 ? "Purple" : rarity > 100 ? "Blue" : "Green"
    console.log("[Burn]", nft.id, tier)
    await Nft.update({
      id: nft.id,
      data: {
        ownerId: "0x0000000000000000000000000000000000000000",
        isBurned: true,
        burnedAt: Number(event.block.timestamp),
        burnedBlock: Number(event.block.number)
      }
    })
  } else {
    console.log("[Transfer]", nft.id, nft.from, "->", nft.to)
    await Nft.update({
      id: nft.id,
      data: {
        ownerId: nft.to,
        lastOwnerId: nft.to
      }
    })
  }

  await NftTransferEvent.create({
    id: event.log.id,
    data: {
      fromId: event.args.from,
      toId: event.args.to,
      tokenId: event.args.id,
      timestamp: Number(event.block.timestamp),
      blockNumber: Number(event.block.number)
    },
  });
});

ponder.on("Pandora:ERC721Approval", async ({ event, context }) => {
  console.log(event.args);
});
