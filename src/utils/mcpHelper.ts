import { MCPClient } from "@mastra/mcp";
import { getEnvironmentVariable } from "../config/environment";
import { API_CONFIG } from "../config/constants";

let mcpClient: MCPClient | null = null;

export const getMCPClient = () => {
  if (!mcpClient) {
    const apiKey = getEnvironmentVariable("LAPRAS_API_KEY");
    if (!apiKey) {
      throw new Error("LAPRAS_API_KEY is not set in environment variables");
    }

    mcpClient = new MCPClient({
      servers: {
        lapras: {
          command: API_CONFIG.MCP_SERVER.COMMAND,
          args: API_CONFIG.MCP_SERVER.ARGS,
          env: {
            LAPRAS_API_KEY: apiKey,
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
