/**
 * Config Manager - Singleton configuration management
 *
 * Handles loading, saving, and updating pattern management configuration
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { PatternConfig } from '../types/config.js';
import { getDefaultConfig } from '../types/config.js';

// Global config path: shared across all projects
const CONFIG_PATH = path.join(os.homedir(), '.claude', 'meta', 'config.json');

export class ConfigManager {
  private static instance: ConfigManager;
  private config: PatternConfig | null = null;
  private configPath: string;

  private constructor() {
    this.configPath = CONFIG_PATH;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load configuration from file
   */
  async load(): Promise<PatternConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(content) as PatternConfig;
      return this.config;
    } catch (error) {
      // File doesn't exist, create default
      this.config = getDefaultConfig();
      await this.save();
      return this.config;
    }
  }

  /**
   * Save configuration to file
   */
  async save(): Promise<void> {
    if (!this.config) {
      return;
    }

    // Ensure directory exists
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });

    // Write config
    const content = JSON.stringify(this.config, null, 2);
    await fs.writeFile(this.configPath, content, 'utf-8');
  }

  /**
   * Update configuration (partial update)
   */
  async update(updates: Partial<PatternConfig>): Promise<void> {
    await this.load();  // Ensure config is loaded
    this.config = { ...this.config!, ...updates };
    await this.save();
  }

  /**
   * Get configuration value
   */
  get(): PatternConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.');
    }
    return this.config;
  }

  /**
   * Get a specific config property
   */
  getProperty<K extends keyof PatternConfig>(key: K): PatternConfig[K] {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.');
    }
    return this.config[key];
  }

  /**
   * Reset to default configuration
   */
  async reset(): Promise<void> {
    this.config = getDefaultConfig();
    await this.save();
  }

  /**
   * Reload configuration from file (discarding in-memory changes)
   */
  async reload(): Promise<PatternConfig> {
    this.config = null;
    return await this.load();
  }
}

/**
 * Export singleton instance for convenience
 */
export const configManager = ConfigManager.getInstance();
