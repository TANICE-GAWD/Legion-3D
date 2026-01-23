/**
 * Utility functions for ElevenLabs API interactions
 */

/**
 * Validates if an ElevenLabs agent exists and is accessible
 * @param {string} agentId - The agent ID to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateElevenLabsAgent = async (agentId) => {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return { valid: false, error: "ElevenLabs API key not found" };
    }

    if (!agentId) {
      return { valid: false, error: "Agent ID is required" };
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 404) {
      return { valid: false, error: `Agent '${agentId}' not found in your ElevenLabs account` };
    } else if (response.status === 401) {
      return { valid: false, error: "Invalid API key" };
    } else if (response.status === 403) {
      return { valid: false, error: "Access denied to this agent" };
    } else {
      return { valid: false, error: `API error: ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Lists available ElevenLabs agents (if the API supports it)
 * @returns {Promise<Array>}
 */
export const listElevenLabsAgents = async () => {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      throw new Error("ElevenLabs API key not found");
    }

    // Note: This endpoint might not exist in the ElevenLabs API
    // This is a placeholder for future functionality
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/agents',
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.agents || [];
    } else {
      console.warn("Could not list agents:", response.status);
      return [];
    }
  } catch (error) {
    console.warn("Error listing agents:", error);
    return [];
  }
};

/**
 * Common test agent IDs that are known to work
 */
export const TEST_AGENT_IDS = [
  'agent_5901kfmmz0gnfserfyw932r615x0', // Default test agent
  // Add more known working agent IDs here
];