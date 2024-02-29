import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Tier: p.createEnum(["Green", "Blue", "Purple", "Orange", "Red"]),
  Account: p.createTable({
    // meta
    id: p.hex(),
    isOwner: p.boolean(),

    // erc20
    erc20Balance: p.bigint(),
    allowances: p.many("Allowance.ownerId"),
    approvalOwnerEvents: p.many("ApprovalEvent.ownerId"),
    approvalSpenderEvents: p.many("ApprovalEvent.spenderId"),
    erc20TransferFromEvents: p.many("TransferEvent.fromId"),
    erc20TransferToEvents: p.many("TransferEvent.toId"),

    // erc721
    erc721Balance: p.bigint(),
    tokens: p.many("Nft.ownerId"),
    erc721TransferFromEvents: p.many("NftTransferEvent.fromId"),
    erc721TransferToEvents: p.many("NftTransferEvent.toId")
  }),

  Allowance: p.createTable({
    id: p.string(),
    amount: p.bigint(),

    ownerId: p.hex().references("Account.id"),
    spenderId: p.hex().references("Account.id"),

    owner: p.one("ownerId"),
    spender: p.one("spenderId"),
  }),

  TransferEvent: p.createTable({
    id: p.string(),
    amount: p.bigint(),
    timestamp: p.int(),

    fromId: p.hex().references("Account.id"),
    toId: p.hex().references("Account.id"),

    from: p.one("fromId"),
    to: p.one("toId"),
  }),

  ApprovalEvent: p.createTable({
    id: p.string(),
    amount: p.bigint(),
    timestamp: p.int(),

    ownerId: p.hex().references("Account.id"),
    spenderId: p.hex().references("Account.id"),

    owner: p.one("ownerId"),
    spender: p.one("spenderId"),
  }),

  Nft: p.createTable({

    id: p.bigint(),
    rarity: p.int(),
    tier: p.enum("Tier"),

    mintedBy: p.string(),
    mintedAt: p.int(),
    mintedBlock: p.int(),

    isBurned: p.boolean(),
    burnedAt: p.int(),
    burnedBlock: p.int(),

    ownerId: p.hex().references("Account.id"),
    owner: p.one("ownerId"),
    lastOwnerId: p.hex().references("Account.id"),
    transferEvents: p.many("NftTransferEvent.tokenId"),
  }),

  NftTransferEvent: p.createTable({
    id: p.string(),
    timestamp: p.int(),
    blockNumber: p.int(),

    fromId: p.hex().references("Account.id"),
    toId: p.hex().references("Account.id"),
    tokenId: p.bigint().references("Nft.id"),

    from: p.one("fromId"),
    to: p.one("toId"),
    token: p.one("tokenId"),
  }),
}));
