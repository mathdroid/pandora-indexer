import { ponder } from "@/generated";

ponder.on("Pandora:Approval", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("Pandora:ApprovalForAll", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("Pandora:ERC20Transfer", async ({ event, context }) => {
  console.log(event.args);
});

ponder.on("Pandora:ERC721Approval", async ({ event, context }) => {
  console.log(event.args);
});
