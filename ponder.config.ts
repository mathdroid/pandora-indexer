import { createConfig } from "@ponder/core";
import { http } from "viem";

import { PandoraAbi } from "./abis/PandoraAbi";

export default createConfig({
  networks: {
    mainnet: { chainId: 1, transport: http(process.env.PONDER_RPC_URL_1) },
  },
  contracts: {
    Pandora: {
      abi: PandoraAbi,
      address: "0x9e9fbde7c7a83c43913bddc8779158f1368f0413",
      network: "mainnet",
      startBlock: 19139822,
    },
  },
});
