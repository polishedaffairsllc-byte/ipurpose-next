/**
 * Preferences Client
 * Client-side utility for managing user preferences and sessions
 */

import type { GPTDomain } from '../app/api/gpt/types';

export interface UserPreferencesData {
  soul: {
    primaryArchetype?: string;
    exploredArchetypes: string[];
    purposeStatement?: string;
  };
  systems: {
    activeSystems: string[];
    workflowPreferences: {
      workStyle?: string;
    };
  };
  aiTools: {
    favoriteTools: string[];
    writingStyle?: string;
    tonePreference?: string;
  };
  insights: {
    trackedMetrics: string[];
  };
  general: {
    enableMemory: boolean;
    enableCrossContext: boolean;
  };
}

export class PreferencesClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/preferences') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferencesData | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  /**
   * Update domain-specific preferences
   */
  async updateDomainPreferences(
    domain: GPTDomain,
    data: any
  ): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          domain,
          data,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Set primary archetype
   */
  async setArchetype(archetype: string): Promise<boolean> {
    const preferences = await this.getPreferences();
    if (!preferences) return false;

    const exploredArchetypes = preferences.soul.exploredArchetypes || [];
    if (!exploredArchetypes.includes(archetype)) {
      exploredArchetypes.push(archetype);
    }

    return this.updateDomainPreferences('soul', {
      ...preferences.soul,
      primaryArchetype: archetype,
      exploredArchetypes,
    });
  }

  /**
   * Set active systems
   */
  async setActiveSystems(systems: string[]): Promise<boolean> {
    const preferences = await this.getPreferences();
    if (!preferences) return false;

    return this.updateDomainPreferences('systems', {
      ...preferences.systems,
      activeSystems: systems,
    });
  }

  /**
   * Set writing style
   */
  async setWritingStyle(style: string): Promise<boolean> {
    const preferences = await this.getPreferences();
    if (!preferences) return false;

    return this.updateDomainPreferences('ai-tools', {
      ...preferences.aiTools,
      writingStyle: style,
    });
  }

  /**
   * Get active session for domain
   */
  async getActiveSession(domain: GPTDomain): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getActiveSession',
          domain,
        }),
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to get active session:', error);
      return null;
    }
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'completeSession',
          sessionId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to complete session:', error);
      return false;
    }
  }
}

// Export singleton instance
export const preferencesClient = new PreferencesClient();
