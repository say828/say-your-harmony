/**
 * LSP Server Configurations
 *
 * Defines known language servers and their configurations.
 * Supports auto-detection and installation hints.
 */

import { execSync } from 'child_process';
import { extname } from 'path';

export interface LspServerConfig {
  name: string;
  command: string;
  args: string[];
  extensions: string[];
  installHint: string;
  initializationOptions?: Record<string, unknown>;
}

/**
 * Known LSP servers and their configurations
 */
export const LSP_SERVERS: Record<string, LspServerConfig> = {
  typescript: {
    name: 'TypeScript Language Server',
    command: 'typescript-language-server',
    args: ['--stdio'],
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.mjs', '.cjs'],
    installHint: 'npm install -g typescript-language-server typescript'
  },
  python: {
    name: 'Python Language Server (pylsp)',
    command: 'pylsp',
    args: [],
    extensions: ['.py', '.pyw'],
    installHint: 'pip install python-lsp-server'
  },
  rust: {
    name: 'Rust Analyzer',
    command: 'rust-analyzer',
    args: [],
    extensions: ['.rs'],
    installHint: 'rustup component add rust-analyzer'
  },
  go: {
    name: 'gopls',
    command: 'gopls',
    args: ['serve'],
    extensions: ['.go'],
    installHint: 'go install golang.org/x/tools/gopls@latest'
  },
  c: {
    name: 'clangd',
    command: 'clangd',
    args: [],
    extensions: ['.c', '.h', '.cpp', '.cc', '.cxx', '.hpp', '.hxx'],
    installHint: 'Install clangd from your package manager or LLVM'
  },
  java: {
    name: 'Eclipse JDT Language Server',
    command: 'jdtls',
    args: [],
    extensions: ['.java'],
    installHint: 'Install from https://github.com/eclipse/eclipse.jdt.ls'
  },
  json: {
    name: 'JSON Language Server',
    command: 'vscode-json-language-server',
    args: ['--stdio'],
    extensions: ['.json', '.jsonc'],
    installHint: 'npm install -g vscode-langservers-extracted'
  },
  html: {
    name: 'HTML Language Server',
    command: 'vscode-html-language-server',
    args: ['--stdio'],
    extensions: ['.html', '.htm'],
    installHint: 'npm install -g vscode-langservers-extracted'
  },
  css: {
    name: 'CSS Language Server',
    command: 'vscode-css-language-server',
    args: ['--stdio'],
    extensions: ['.css', '.scss', '.less'],
    installHint: 'npm install -g vscode-langservers-extracted'
  },
  yaml: {
    name: 'YAML Language Server',
    command: 'yaml-language-server',
    args: ['--stdio'],
    extensions: ['.yaml', '.yml'],
    installHint: 'npm install -g yaml-language-server'
  }
};

/**
 * Check if a command exists in PATH
 */
export function commandExists(command: string): boolean {
  try {
    const checkCommand = process.platform === 'win32' ? 'where' : 'which';
    execSync(`${checkCommand} ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the LSP server config for a file based on its extension
 */
export function getServerForFile(filePath: string): LspServerConfig | null {
  const ext = extname(filePath).toLowerCase();

  for (const [_, config] of Object.entries(LSP_SERVERS)) {
    if (config.extensions.includes(ext)) {
      return config;
    }
  }

  return null;
}

/**
 * Get all available servers (installed and not installed)
 */
export function getAllServers(): Array<LspServerConfig & { installed: boolean }> {
  return Object.values(LSP_SERVERS).map(config => ({
    ...config,
    installed: commandExists(config.command)
  }));
}

/**
 * Get the appropriate server for a language
 */
export function getServerForLanguage(language: string): LspServerConfig | null {
  // Map common language names to server keys
  const langMap: Record<string, string> = {
    'javascript': 'typescript',
    'typescript': 'typescript',
    'tsx': 'typescript',
    'jsx': 'typescript',
    'python': 'python',
    'rust': 'rust',
    'go': 'go',
    'golang': 'go',
    'c': 'c',
    'cpp': 'c',
    'c++': 'c',
    'java': 'java',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'css',
    'less': 'css',
    'yaml': 'yaml'
  };

  const serverKey = langMap[language.toLowerCase()];
  if (serverKey && LSP_SERVERS[serverKey]) {
    return LSP_SERVERS[serverKey];
  }

  return null;
}
