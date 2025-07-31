import { MCPClient } from "@mastra/mcp";

let mcpClient: MCPClient | null = null;

export const getMCPClient = () => {
  if (!mcpClient) {
    mcpClient = new MCPClient({
      servers: {
        lapras: {
          command: "npx",
          args: ["-y", "@lapras-inc/lapras-mcp-server"],
          env: {
            LAPRAS_API_KEY: process.env.LAPRAS_API_KEY as string,
          },
        },
      },
    });
  }
  return mcpClient;
};

export const closeMCPClient = async () => {
  if (mcpClient) {
    await mcpClient.disconnect();
  }
};
