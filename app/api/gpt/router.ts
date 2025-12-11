/**
 * GPT Request Router
 * Routes GPT requests to domain-specific handlers
 */

import type { GPTRequest, GPTResponse } from './types';
import { handleSoulRequest } from './soul/handler';
import { handleSystemsRequest } from './systems/handler';
import { handleAIToolsRequest } from './ai-tools/handler';
import { handleInsightsRequest } from './insights/handler';

/**
 * Route GPT request to appropriate domain handler
 */
export async function routeToHandler(request: GPTRequest): Promise<GPTResponse> {
  try {
    switch (request.domain) {
      case 'soul':
        return await handleSoulRequest(request);
      
      case 'systems':
        return await handleSystemsRequest(request);
      
      case 'ai-tools':
        return await handleAIToolsRequest(request);
      
      case 'insights':
        return await handleInsightsRequest(request);
      
      default:
        return {
          success: false,
          error: {
            code: 'INVALID_DOMAIN',
            message: `Unknown domain: ${request.domain}`
          }
        };
    }
  } catch (error) {
    console.error(`Router Error [${request.domain}]:`, error);
    
    return {
      success: false,
      error: {
        code: 'ROUTING_ERROR',
        message: error instanceof Error ? error.message : 'Failed to route request'
      }
    };
  }
}
